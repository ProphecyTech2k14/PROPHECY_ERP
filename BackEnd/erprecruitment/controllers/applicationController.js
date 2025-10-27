const { poolPromise, sql } = require("../../config/db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Use memory storage for database approach
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  console.log('File received:', file.originalname, file.mimetype);
  
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const extname = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(extname)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC and DOCX files are allowed'), false);
  }
};

// Initialize multer for database storage
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  }
});

// Middleware to handle file upload
exports.uploadResume = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File size too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ message: 'File upload error: ' + err.message });
    } else if (err) {
      console.error('File filter error:', err);
      return res.status(415).json({ message: err.message });
    }
    next();
  });
};

// Updated createApplication for database storage
exports.createApplication = async (req, res) => {
  console.log('=== Creating Application (DB Storage) ===');
  console.log('Request body:', req.body);
  console.log('Uploaded file:', req.file ? { 
    originalname: req.file.originalname, 
    size: req.file.size,
    mimetype: req.file.mimetype
  } : 'No file');
  
  const { 
    roleId, name, email, phone, experience, 
    currentCompany, expectedSalary, noticePeriod, 
    location, skills 
  } = req.body;
  
  try {
    // Validation
    if (!roleId || !name || !email || !phone || !experience) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const pool = await poolPromise;
    
    // Check if role exists
    const roleCheck = await pool.request()
      .input("roleId", sql.Int, parseInt(roleId))
      .query("SELECT id FROM RecruitmentRoles WHERE id = @roleId");
    
    if (roleCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    // Check if email already applied for this role
    const emailCheck = await pool.request()
      .input("roleId", sql.Int, parseInt(roleId))
      .input("email", sql.NVarChar, email.toLowerCase().trim())
      .query("SELECT id FROM Applications WHERE roleId = @roleId AND email = @email");
    
    if (emailCheck.recordset.length > 0) {
      return res.status(409).json({ message: "Candidate already applied for this role" });
    }
    
    // Process file data for database storage
    let resumeData = null;
    let resumeFileName = null;
    let resumeContentType = null;
    let resumeFileSize = null;
    
    if (req.file) {
      resumeData = req.file.buffer;
      resumeFileName = req.file.originalname;
      resumeContentType = req.file.mimetype;
      resumeFileSize = req.file.size;
      
      console.log('File processed for DB storage:');
      console.log('- Original name:', resumeFileName);
      console.log('- Content type:', resumeContentType);
      console.log('- Size:', resumeFileSize, 'bytes');
    }

    console.log('Inserting application into database...');

    const insertResult = await pool.request()
      .input("roleId", sql.Int, parseInt(roleId))
      .input("name", sql.NVarChar, name.trim())
      .input("email", sql.NVarChar, email.toLowerCase().trim())
      .input("phone", sql.NVarChar, phone.trim())
      .input("experience", sql.NVarChar, experience.trim())
      .input("currentCompany", sql.NVarChar, currentCompany?.trim() || null)
      .input("expectedSalary", sql.NVarChar, expectedSalary?.trim() || null)
      .input("noticePeriod", sql.NVarChar, noticePeriod?.trim() || null)
      .input("location", sql.NVarChar, location?.trim() || null)
      .input("skills", sql.NVarChar, skills?.trim() || null)
      .input("resumeData", sql.VarBinary, resumeData)
      .input("resumeFileName", sql.NVarChar, resumeFileName)
      .input("resumeContentType", sql.NVarChar, resumeContentType)
      .input("resumeFileSize", sql.Int, resumeFileSize)
      .query(`
        INSERT INTO Applications (
          roleId, name, email, phone, experience, currentCompany,
          expectedSalary, noticePeriod, location, skills, 
          resumeData, resumeFileName, resumeContentType, resumeFileSize,
          status, currentStep
        )
        OUTPUT INSERTED.id
        VALUES (
          @roleId, @name, @email, @phone, @experience, @currentCompany,
          @expectedSalary, @noticePeriod, @location, @skills,
          @resumeData, @resumeFileName, @resumeContentType, @resumeFileSize,
          'Applied', 0
        )
      `);
    
    const newApplicationId = insertResult.recordset[0].id;
    console.log('Application inserted successfully with ID:', newApplicationId);
    
    // Update application count in role
    await pool.request()
      .input("roleId", sql.Int, parseInt(roleId))
      .query(`
        UPDATE RecruitmentRoles
        SET applicationCount = (
          SELECT COUNT(*) FROM Applications WHERE roleId = @roleId
        )
        WHERE id = @roleId
      `);
    
    console.log('Application count updated');
    
    res.status(201).json({ 
      message: "Application submitted successfully",
      applicationId: newApplicationId,
      resumeUploaded: !!req.file
    });
    
  } catch (error) {
    console.error("Error creating application:", error);
    console.error("Error stack:", error.stack);
    
    if (error.code === 'EREQUEST') {
      return res.status(400).json({ 
        message: "Database validation error", 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: "Server error while creating application", 
      error: error.message 
    });
  }
};

// Update application status function
exports.updateApplicationStatus = async (req, res) => {
  const applicationId = req.params.id;
  const { currentStep, status } = req.body;
  
  try {
    const pool = await poolPromise;
    
    await pool.request()
      .input("id", sql.Int, parseInt(applicationId))
      .input("currentStep", sql.Int, parseInt(currentStep))
      .input("status", sql.NVarChar, status)
      .query(`
        UPDATE Applications
        SET currentStep = @currentStep, status = @status, updatedAt = GETDATE()
        WHERE id = @id
      `);
    
    res.status(200).json({ message: "Application status updated successfully" });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Server error while updating status", error: error.message });
  }
};

// Get hiring steps function
exports.getApplicationHiringSteps = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, stepName, stepOrder
      FROM HiringSteps
      WHERE isActive = 1
      ORDER BY stepOrder
    `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching hiring steps:", error);
    res.status(500).json({ message: "Server error while fetching steps", error: error.message });
  }
};

// New function to serve resume from database
exports.serveResumeFromDB = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    
    console.log('=== Serving Resume from Database ===');
    console.log('Application ID:', applicationId);
    console.log('User:', req.user.username, 'Role:', req.user.role);

    const pool = await poolPromise;
    
    // Get resume data with permission check
    const result = await pool.request()
      .input("applicationId", sql.Int, parseInt(applicationId))
      .query(`
        SELECT 
          a.resumeData,
          a.resumeFileName,
          a.resumeContentType,
          a.resumeFileSize,
          a.name,
          rr.assignTo,
          rr.recruiter
        FROM Applications a
        INNER JOIN RecruitmentRoles rr ON a.roleId = rr.id
        WHERE a.id = @applicationId 
          AND a.resumeData IS NOT NULL
      `);

    if (result.recordset.length === 0) {
      console.error('Resume not found in database for application ID:', applicationId);
      return res.status(404).json({ message: "Resume not found" });
    }

    const application = result.recordset[0];
    const currentUser = req.user.username;
    const currentUserRole = req.user.role;

    console.log('Permission check:');
    console.log('- Current user:', currentUser, 'Role:', currentUserRole);
    console.log('- Application assigned to:', application.assignTo);

    // Enhanced permission check
    const hasPermission = 
      currentUserRole === 'manager' || 
      currentUserRole === 'admin' ||
      (application.assignTo && application.assignTo.toLowerCase() === currentUser.toLowerCase()) ||
      application.recruiter === req.user.userId;

    if (!hasPermission) {
      console.log('Permission denied for user:', currentUser);
      return res.status(403).json({ message: "Unauthorized to view this resume" });
    }

    console.log('Serving resume from database:');
    console.log('- File name:', application.resumeFileName);
    console.log('- Content type:', application.resumeContentType);
    console.log('- File size:', application.resumeFileSize, 'bytes');

    // Set comprehensive headers for better browser compatibility
    res.setHeader('Content-Type', application.resumeContentType);
    res.setHeader('Content-Length', application.resumeFileSize);
    res.setHeader('Content-Disposition', `inline; filename="${application.resumeFileName}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Send the binary data
    res.end(application.resumeData);
    
  } catch (error) {
    console.error("Error serving resume from database:", error);
    res.status(500).json({ 
      message: "Server error while serving resume",
      error: error.message 
    });
  }
};

// Keep the original file system approach as fallback
exports.serveResumeFromFile = async (req, res) => {
  try {
    const filename = req.params.filename;
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    const filePath = path.join(uploadDir, filename);

    console.log('=== Serving Resume from File System ===');
    console.log('Requested filename:', filename);
    console.log('User:', req.user.username, 'Role:', req.user.role);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Resume file not found at path:', filePath);
      return res.status(404).json({ message: "Resume file not found" });
    }

    // Permission check
    const pool = await poolPromise;
    const result = await pool.request()
      .input("resumeUrl", sql.NVarChar, `/uploads/resumes/${filename}`)
      .query(`
        SELECT a.id, a.name, rr.recruiter, rr.assignTo 
        FROM Applications a
        JOIN RecruitmentRoles rr ON a.roleId = rr.id
        WHERE a.resumeUrl = @resumeUrl
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Resume record not found in database" });
    }

    const application = result.recordset[0];
    const currentUser = req.user.username;
    const currentUserRole = req.user.role;

    // Enhanced permission check
    const hasPermission = 
      currentUserRole === 'manager' || 
      currentUserRole === 'admin' ||
      (application.assignTo && application.assignTo.toLowerCase() === currentUser.toLowerCase()) ||
      application.recruiter === req.user.userId;

    if (!hasPermission) {
      return res.status(403).json({ message: "Unauthorized to view this resume" });
    }

    // Serve file with proper headers
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (ext) {
      case '.pdf': contentType = 'application/pdf'; break;
      case '.doc': contentType = 'application/msword'; break;
      case '.docx': contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; break;
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.on('error', (error) => {
      console.error('Error streaming resume:', error);
      if (!res.headersSent) {
        res.status(500).json({ message: "Error serving resume" });
      }
    });
    
    fileStream.pipe(res);
    
  } catch (error) {
    console.error("Error serving resume from file:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        message: "Server error while serving resume",
        error: error.message 
      });
    }
  }
};

// Function to get applications with resume info
// Replace the getApplicationsWithResumes function with this corrected version
exports.getApplicationsWithResumes = async (req, res) => {
  try {
    const roleId = req.params.roleId;
    console.log('Fetching applications for role ID:', roleId);
    
    const pool = await poolPromise;
    const result = await pool.request()
      .input("roleId", sql.Int, parseInt(roleId))
      .query(`
        SELECT 
          id, name, email, phone, experience, currentCompany,
          expectedSalary, noticePeriod, location, skills, status,
          currentStep, appliedAt, updatedAt,
          CASE 
            WHEN resumeData IS NOT NULL THEN 1
            WHEN resumeUrl IS NOT NULL THEN 1
            ELSE 0 
          END as hasResume,
          resumeFileName,
          resumeUrl,
          CASE WHEN resumeData IS NOT NULL THEN 1 ELSE 0 END as hasResumeData,
          CASE WHEN resumeUrl IS NOT NULL THEN 1 ELSE 0 END as hasResumeFile
        FROM Applications 
        WHERE roleId = @roleId 
        ORDER BY appliedAt DESC
      `);
    
    console.log('Found', result.recordset.length, 'applications for role', roleId);
    res.json(result.recordset);
    
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ 
      message: "Server error while fetching applications",
      error: error.message 
    });
  }
};



// Edit application function
exports.editApplication = async (req, res) => {
  const applicationId = req.params.id;
  const {
    name, email, phone, experience,
    currentCompany, expectedSalary, noticePeriod,
    location, skills
  } = req.body;

  try {
    // Validation
    if (!name || !email || !phone || !experience) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const pool = await poolPromise;
    
    // Check if application exists
    const appCheck = await pool.request()
      .input("id", sql.Int, parseInt(applicationId))
      .query("SELECT id FROM Applications WHERE id = @id");
    
    if (appCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Update application
    await pool.request()
      .input("id", sql.Int, parseInt(applicationId))
      .input("name", sql.NVarChar, name.trim())
      .input("email", sql.NVarChar, email.toLowerCase().trim())
      .input("phone", sql.NVarChar, phone.trim())
      .input("experience", sql.NVarChar, experience.trim())
      .input("currentCompany", sql.NVarChar, currentCompany?.trim() || null)
      .input("expectedSalary", sql.NVarChar, expectedSalary?.trim() || null)
      .input("noticePeriod", sql.NVarChar, noticePeriod?.trim() || null)
      .input("location", sql.NVarChar, location?.trim() || null)
      .input("skills", sql.NVarChar, skills?.trim() || null)
      .query(`
        UPDATE Applications 
        SET name = @name, email = @email, phone = @phone, 
            experience = @experience, currentCompany = @currentCompany,
            expectedSalary = @expectedSalary, noticePeriod = @noticePeriod,
            location = @location, skills = @skills, updatedAt = GETDATE()
        WHERE id = @id
      `);
    
    res.status(200).json({ message: "Application updated successfully" });
    
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ 
      message: "Server error while updating application", 
      error: error.message 
    });
  }
};

// Delete application function
// In the deleteApplication function, update to return the updated application count
exports.deleteApplication = async (req, res) => {
  const applicationId = req.params.id;

  try {
    const pool = await poolPromise;
    
    // Get roleId before deleting to update application count
    const roleResult = await pool.request()
      .input("id", sql.Int, parseInt(applicationId))
      .query("SELECT roleId FROM Applications WHERE id = @id");
    
    if (roleResult.recordset.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    const roleId = roleResult.recordset[0].roleId;
    
    // Delete application
    await pool.request()
      .input("id", sql.Int, parseInt(applicationId))
      .query("DELETE FROM Applications WHERE id = @id");
    
    // Update application count in role and get the new count
    const countResult = await pool.request()
      .input("roleId", sql.Int, parseInt(roleId))
      .query(`
        UPDATE RecruitmentRoles
        SET applicationCount = (
          SELECT COUNT(*) FROM Applications WHERE roleId = @roleId
        )
        OUTPUT INSERTED.applicationCount
        WHERE id = @roleId
      `);
    
    const newApplicationCount = countResult.recordset[0].applicationCount;
    
    res.status(200).json({ 
      message: "Application deleted successfully",
      newApplicationCount: newApplicationCount
    });
    
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ 
      message: "Server error while deleting application", 
      error: error.message 
    });
  }
};




// Update application with resume (PUT /api/recruitment/applications/:id)
exports.updateApplication = async (req, res) => {
  const applicationId = req.params.id;
  const {
    name, email, phone, experience,
    currentCompany, expectedSalary, noticePeriod,
    location, skills
  } = req.body;
  
  try {
    // Validation
    if (!name || !email || !phone || !experience) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const pool = await poolPromise;
    
    // Check if application exists
    const appCheck = await pool.request()
      .input("id", sql.Int, parseInt(applicationId))
      .query("SELECT id, roleId FROM Applications WHERE id = @id");
    
    if (appCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    const roleId = appCheck.recordset[0].roleId;
    
    // Process file data for database storage if a new file is uploaded
    let resumeData = null;
    let resumeFileName = null;
    let resumeContentType = null;
    let resumeFileSize = null;
    
    if (req.file) {
      resumeData = req.file.buffer;
      resumeFileName = req.file.originalname;
      resumeContentType = req.file.mimetype;
      resumeFileSize = req.file.size;
      
      console.log('New file uploaded for application:', applicationId);
    }
    
    // Build update query based on whether a new file was uploaded
    let updateQuery = `
      UPDATE Applications 
      SET name = @name, email = @email, phone = @phone, 
          experience = @experience, currentCompany = @currentCompany,
          expectedSalary = @expectedSalary, noticePeriod = @noticePeriod,
          location = @location, skills = @skills, updatedAt = GETDATE()
    `;
    
    // Add resume fields to update if a new file was uploaded
    if (req.file) {
      updateQuery += `, 
        resumeData = @resumeData, 
        resumeFileName = @resumeFileName, 
        resumeContentType = @resumeContentType, 
        resumeFileSize = @resumeFileSize,
        resumeUrl = NULL
      `;
    }
    
    updateQuery += ` WHERE id = @id`;
    
    // Execute update
    const request = pool.request()
      .input("id", sql.Int, parseInt(applicationId))
      .input("name", sql.NVarChar, name.trim())
      .input("email", sql.NVarChar, email.toLowerCase().trim())
      .input("phone", sql.NVarChar, phone.trim())
      .input("experience", sql.NVarChar, experience.trim())
      .input("currentCompany", sql.NVarChar, currentCompany?.trim() || null)
      .input("expectedSalary", sql.NVarChar, expectedSalary?.trim() || null)
      .input("noticePeriod", sql.NVarChar, noticePeriod?.trim() || null)
      .input("location", sql.NVarChar, location?.trim() || null)
      .input("skills", sql.NVarChar, skills?.trim() || null);
    
    // Add file parameters if a new file was uploaded
    if (req.file) {
      request
        .input("resumeData", sql.VarBinary, resumeData)
        .input("resumeFileName", sql.NVarChar, resumeFileName)
        .input("resumeContentType", sql.NVarChar, resumeContentType)
        .input("resumeFileSize", sql.Int, resumeFileSize);
    }
    
    await request.query(updateQuery);
    
    res.status(200).json({ message: "Application updated successfully" });
    
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ 
      message: "Server error while updating application", 
      error: error.message 
    });
  }
};
// Delete resume from application (DELETE /api/recruitment/applications/:id/resume)
// Delete resume from application (DELETE /api/recruitment/applications/:id/resume)
exports.deleteApplicationResume = async (req, res) => {
  const applicationId = req.params.id;
  
  try {
    const pool = await poolPromise;
    
    // Check if application exists
    const appCheck = await pool.request()
      .input("id", sql.Int, parseInt(applicationId))
      .query("SELECT id FROM Applications WHERE id = @id");
    
    if (appCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Remove resume data from application
    await pool.request()
      .input("id", sql.Int, parseInt(applicationId))
      .query(`
        UPDATE Applications 
        SET resumeData = NULL, 
            resumeFileName = NULL, 
            resumeContentType = NULL, 
            resumeFileSize = NULL,
            resumeUrl = NULL,
            updatedAt = GETDATE()
        WHERE id = @id
      `);
    
    res.status(200).json({ message: "Resume deleted successfully" });
    
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ 
      message: "Server error while deleting resume", 
      error: error.message 
    });
  }
};