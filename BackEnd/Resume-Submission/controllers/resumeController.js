const { poolPromise, sql } = require("../../config/db");
const path = require("path");
const fs = require('fs');

// Helper function to validate email format
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Helper function to get username from request
const getUsernameFromRequest = (req) => {
  if (req.user) {
    return req.user.username || 
           req.user.name || 
           req.user.email || 
           req.user.Username || 
           req.user.Name || 
           req.user.Email || 
           'Unknown User';
  }
  return 'Unknown User';
};

// Download resume file (retrieve binary data from DB)
exports.downloadResume = async (req, res) => {
  console.log('=== DOWNLOAD RESUME REQUEST ===');
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      success: false,
      error: "Invalid resume ID" 
    });
  }

  const resumeId = parseInt(id);

  try {
    const pool = await poolPromise;
    
    // Get resume details including binary file data
    const result = await pool.request()
      .input('Resume_ID', sql.Int, resumeId)
      .query(`
        SELECT Resume_ID, FirstName, LastName, ResumeFileData, ResumeFileName, ResumeFileType
        FROM [dbo].[Resume Submission] 
        WHERE Resume_ID = @Resume_ID
      `);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Resume not found" 
      });
    }

    const resume = result.recordset[0];
    
    if (!resume.ResumeFileData) {
      return res.status(404).json({ 
        success: false,
        error: "No file associated with this resume" 
      });
    }

    const cleanFileName = resume.ResumeFileName || `${resume.FirstName}_${resume.LastName}_Resume.pdf`;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

    // Set headers for download
    res.setHeader('Content-Type', resume.ResumeFileType || 'application/octet-stream');
    res.setHeader('Content-Length', resume.ResumeFileData.length);
    res.setHeader('Content-Disposition', `attachment; filename="${cleanFileName}"`);
    res.setHeader('Cache-Control', 'no-cache');

    console.log('Serving file for download:', {
      fileName: cleanFileName,
      size: resume.ResumeFileData.length,
      contentType: resume.ResumeFileType
    });

    // Send binary data directly
    res.send(Buffer.from(resume.ResumeFileData));

  } catch (error) {
    console.error("Download error:", error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        error: "Could not download resume",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Preview resume file (PDF only)
exports.previewResume = async (req, res) => {
  console.log('=== PREVIEW RESUME REQUEST ===');
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      success: false,
      error: "Invalid resume ID" 
    });
  }

  const resumeId = parseInt(id);

  try {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('Resume_ID', sql.Int, resumeId)
      .query(`
        SELECT Resume_ID, FirstName, LastName, ResumeFileData, ResumeFileName, ResumeFileType
        FROM [dbo].[Resume Submission] 
        WHERE Resume_ID = @Resume_ID
      `);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Resume not found" 
      });
    }

    const resume = result.recordset[0];
    
    if (!resume.ResumeFileData) {
      return res.status(404).json({ 
        success: false,
        error: "No file associated with this resume" 
      });
    }

    // Only allow preview for PDFs
    if (resume.ResumeFileType !== 'application/pdf') {
      return res.status(400).json({ 
        success: false,
        error: "Preview not supported for this file type",
        details: "Only PDF files can be previewed. Please download the file instead."
      });
    }

    // Set CORS headers for PDF viewing
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Set headers for inline display
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', resume.ResumeFileData.length);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Accept-Ranges', 'bytes');

    console.log('Previewing PDF');

    // Handle range requests for better PDF loading
    const range = req.headers.range;
    const fileBuffer = Buffer.from(resume.ResumeFileData);
    const fileSize = fileBuffer.length;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);
      res.send(fileBuffer.slice(start, end + 1));
    } else {
      res.send(fileBuffer);
    }

  } catch (error) {
    console.error("Preview error:", error);
    
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false,
        error: "Could not preview resume",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};

// Get resume file info
exports.getResumeFileInfo = async (req, res) => {
  const { id } = req.params;
  
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ 
      success: false,
      error: "Invalid resume ID" 
    });
  }

  const resumeId = parseInt(id);

  try {
    const pool = await poolPromise;
    
    const result = await pool.request()
      .input('Resume_ID', sql.Int, resumeId)
      .query(`
        SELECT Resume_ID, FirstName, LastName, ResumeFileData, ResumeFileName, ResumeFileType
        FROM [dbo].[Resume Submission] 
        WHERE Resume_ID = @Resume_ID
      `);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Resume not found" 
      });
    }

    const resume = result.recordset[0];

    if (!resume.ResumeFileData) {
      return res.status(200).json({ 
        success: true,
        fileAvailable: false,
        message: "No file associated with this resume"
      });
    }

    const fileBuffer = Buffer.from(resume.ResumeFileData);
    const fileExtension = path.extname(resume.ResumeFileName).toLowerCase();
    
    return res.status(200).json({ 
      success: true,
      fileAvailable: true,
      fileInfo: {
        fileName: resume.ResumeFileName,
        fileSize: fileBuffer.length,
        fileExtension: fileExtension,
        canPreview: resume.ResumeFileType === 'application/pdf',
        fileType: resume.ResumeFileType,
        isReadable: true
      },
      downloadUrl: `/api/resumes/${resumeId}/download`,
      previewUrl: resume.ResumeFileType === 'application/pdf' ? `/api/resumes/${resumeId}/preview` : null
    });

  } catch (error) {
    console.error("File info error:", error);
    res.status(500).json({ 
      success: false,
      error: "Could not get file information",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Delete resume
exports.deleteResume = async (req, res) => {
  console.log('=== DELETE RESUME REQUEST START ===');
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    console.error('❌ Invalid ID parameter:', id);
    return res.status(400).json({ 
      success: false,
      error: "Invalid resume ID",
      details: "Resume ID must be a valid number"
    });
  }

  const resumeId = parseInt(id);
  console.log('✅ Parsed Resume ID:', resumeId);

  try {
    const pool = await poolPromise;
    
    if (!pool || !pool.connected) {
      throw new Error('Database connection not established');
    }

    // Check if resume exists
    const checkResult = await pool.request()
      .input('Resume_ID', sql.Int, resumeId)
      .query('SELECT Resume_ID, FirstName, LastName FROM [dbo].[Resume Submission] WHERE Resume_ID = @Resume_ID');

    if (!checkResult.recordset || checkResult.recordset.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Resume not found"
      });
    }

    const resumeToDelete = checkResult.recordset[0];

    // Delete from database
    const deleteResult = await pool.request()
      .input('Resume_ID', sql.Int, resumeId)
      .query('DELETE FROM [dbo].[Resume Submission] WHERE Resume_ID = @Resume_ID');

    if (!deleteResult.rowsAffected || deleteResult.rowsAffected[0] === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Resume not found or already deleted"
      });
    }

    console.log('✅ Successfully deleted resume from database');

    return res.status(200).json({ 
      success: true,
      message: "Resume deleted successfully",
      deletedId: resumeId,
      deletedCandidate: `${resumeToDelete.FirstName} ${resumeToDelete.LastName}`,
      rowsAffected: deleteResult.rowsAffected[0]
    });

  } catch (error) {
    console.error("Delete error:", error);
    
    return res.status(500).json({
      success: false,
      error: "Could not delete resume",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update resume with binary file storage
// Update resume with binary file storage
exports.updateResume = async (req, res) => {
  console.log('=== Resume Update Request ===');

  const { id } = req.params;
  let transaction;

  try {
    const updatedBy = getUsernameFromRequest(req);
    console.log('Updating resume by user:', updatedBy);

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ 
        success: false,
        error: "Invalid resume ID"
      });
    }

    const resumeId = parseInt(id);
    const pool = await poolPromise;

    if (!pool || !pool.connected) {
      throw new Error('Database connection not established');
    }

    // Check if resume exists
    const checkResult = await pool.request()
      .input('Resume_ID', sql.Int, resumeId)
      .query(`
        SELECT Resume_ID, FirstName, LastName 
        FROM [dbo].[Resume Submission] 
        WHERE Resume_ID = @Resume_ID
      `);

    if (!checkResult.recordset || checkResult.recordset.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Resume not found"
      });
    }

    // Validate required fields
    const requiredFields = ['FirstName', 'LastName', 'EmailID', 'JobRoleApplied'];
    for (const field of requiredFields) {
      if (req.body[field] !== undefined && (!req.body[field] || req.body[field].trim() === '')) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid field value",
          details: `${field} cannot be empty if provided`
        });
      }
    }

    if (req.body.EmailID && !validateEmail(req.body.EmailID)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }

    // DESTRUCTURE ALL FIELDS - INCLUDING NEW RelevantExperience
    const {
      FirstName, LastName, EmailID, CountryCode, 
      PhoneNumber1, PhoneNumber2, CandidateInfo, CurrentLocation,
      CurrentSalary, ExpectedSalary, NoticePeriod, CurrentEmployer,
      Experience, RelevantExperience, // BOTH EXPERIENCE FIELDS
      JobRoleApplied, Dob, LinkedInProfile,
      CoverLetter, PassportNo, Skills, Education, Certifications
    } = req.body;

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    const request = new sql.Request(transaction);

    let dobValue = null;
    if (Dob && Dob.trim() !== '') {
      dobValue = new Date(Dob);
      if (isNaN(dobValue)) dobValue = null;
    }

    let currentSalaryValue = null;
    let expectedSalaryValue = null;
    
    if (CurrentSalary && CurrentSalary.trim() !== '') {
      currentSalaryValue = parseFloat(CurrentSalary);
      if (isNaN(currentSalaryValue)) currentSalaryValue = null;
    }
    
    if (ExpectedSalary && ExpectedSalary.trim() !== '') {
      expectedSalaryValue = parseFloat(ExpectedSalary);
      if (isNaN(expectedSalaryValue)) expectedSalaryValue = null;
    }

    let updateFields = [];
    let queryParams = {};

    const addUpdateField = (fieldName, dbColumn, value, sqlType) => {
      const requiredFields = ['FirstName', 'LastName', 'EmailID', 'JobRoleApplied'];
      const shouldSkip = !requiredFields.includes(fieldName) && 
                        (value === undefined || value === null || value === '');
      
      if (!shouldSkip) {
        updateFields.push(`${dbColumn} = @${fieldName}`);
        queryParams[fieldName] = { 
          value: value === '' ? null : value,
          type: sqlType 
        };
      }
    };

    // Add update fields
    addUpdateField('FirstName', 'FirstName', FirstName?.trim(), sql.NVarChar(100));
    addUpdateField('LastName', 'LastName', LastName?.trim(), sql.NVarChar(100));
    addUpdateField('EmailID', 'EmailID', EmailID?.trim(), sql.NVarChar(255));
    addUpdateField('CountryCode', 'CountryCode', CountryCode, sql.NVarChar(10));
    addUpdateField('PhoneNumber1', 'PhoneNumber1', PhoneNumber1?.trim(), sql.NVarChar(20));
    addUpdateField('PhoneNumber2', 'PhoneNumber2', PhoneNumber2?.trim(), sql.NVarChar(20));
    addUpdateField('CandidateInfo', 'CandidateInfo', CandidateInfo?.trim(), sql.NVarChar(sql.MAX));
    addUpdateField('CurrentLocation', 'CurrentLocation', CurrentLocation?.trim(), sql.NVarChar(100));
    addUpdateField('CurrentSalary', 'CurrentSalary', currentSalaryValue, sql.Decimal(10, 2));
    addUpdateField('ExpectedSalary', 'ExpectedSalary', expectedSalaryValue, sql.Decimal(10, 2));
    addUpdateField('NoticePeriod', 'NoticePeriod', NoticePeriod?.trim(), sql.NVarChar(50));
    addUpdateField('CurrentEmployer', 'CurrentEmployer', CurrentEmployer?.trim(), sql.NVarChar(100));
    addUpdateField('Experience', 'Experience', Experience?.trim(), sql.NVarChar(50));
    addUpdateField('RelevantExperience', 'RelevantExperience', RelevantExperience?.trim(), sql.NVarChar(50)); // NEW FIELD
    addUpdateField('JobRoleApplied', 'JobRoleApplied', JobRoleApplied?.trim(), sql.NVarChar(100));
    addUpdateField('Dob', 'Dob', dobValue, sql.Date);
    addUpdateField('LinkedInProfile', 'LinkedInProfile', LinkedInProfile?.trim(), sql.NVarChar(255));
    addUpdateField('CoverLetter', 'CoverLetter', CoverLetter?.trim(), sql.NVarChar(sql.MAX));
    addUpdateField('PassportNo', 'PassportNo', PassportNo?.trim(), sql.NVarChar(50));
    addUpdateField('Skills', 'Skills', Skills?.trim(), sql.NVarChar(sql.MAX));
    addUpdateField('Education', 'Education', Education?.trim(), sql.NVarChar(sql.MAX));
    addUpdateField('Certifications', 'Certifications', Certifications?.trim(), sql.NVarChar(sql.MAX));

    // Handle binary file if uploaded
    if (req.file && req.file.buffer) {
      updateFields.push('ResumeFileData = @ResumeFileData');
      updateFields.push('ResumeFileName = @ResumeFileName');
      updateFields.push('ResumeFileType = @ResumeFileType');
      
      queryParams['ResumeFileData'] = { 
        value: req.file.buffer,
        type: sql.VarBinary(sql.MAX)
      };
      queryParams['ResumeFileName'] = { 
        value: req.file.originalname,
        type: sql.NVarChar(255)
      };
      queryParams['ResumeFileType'] = { 
        value: req.file.mimetype,
        type: sql.NVarChar(100)
      };
      console.log('File updated:', req.file.originalname);
    }

    if (updateFields.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "No fields to update"
      });
    }

    let query = `
      UPDATE [dbo].[Resume Submission] 
      SET ${updateFields.join(', ')}
      WHERE Resume_ID = @Resume_ID
    `;

    request.input('Resume_ID', sql.Int, resumeId);
    Object.entries(queryParams).forEach(([key, { value, type }]) => {
      request.input(key, type, value);
    });

    const result = await request.query(query);
    await transaction.commit();
    transaction = null;

    console.log('✅ Update successful, rows affected:', result.rowsAffected[0]);

    if (!result.rowsAffected || result.rowsAffected[0] === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Resume not found"
      });
    }

    return res.status(200).json({ 
      success: true,
      message: "Resume updated successfully!",
      Resume_ID: resumeId,
      rowsAffected: result.rowsAffected[0]
    });

  } catch (error) {
    console.error("Update error:", error);
    
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    
    return res.status(500).json({
      success: false,
      error: "Failed to update resume",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create resume with binary file storage
// Create resume with binary file storage
exports.createResume = async (req, res) => {
  console.log('=== Resume Creation Request ===');

  let transaction;

  try {
    const createdBy = getUsernameFromRequest(req);
    console.log('Creating resume by user:', createdBy);

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ 
        success: false,
        error: "No file uploaded",
        details: "Please upload a resume file (PDF or Word document)"
      });
    }

    console.log('File received:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.buffer.length
    });

    // Validate required fields
    const requiredFields = ['FirstName', 'LastName', 'EmailID', 'JobRoleApplied'];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!req.body[field] || req.body[field].trim() === '') {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields",
        details: `The following fields are required: ${missingFields.join(', ')}`
      });
    }

    if (!validateEmail(req.body.EmailID)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email format"
      });
    }

    // DESTRUCTURE ALL FIELDS - INCLUDING NEW RelevantExperience
    const {
      FirstName, LastName, EmailID, CountryCode = '+1', 
      PhoneNumber1, PhoneNumber2, CandidateInfo, CurrentLocation,
      CurrentSalary, ExpectedSalary, NoticePeriod, CurrentEmployer,
      Experience, RelevantExperience, // BOTH EXPERIENCE FIELDS
      JobRoleApplied, Dob, LinkedInProfile,
      CoverLetter, PassportNo, Skills, Education, Certifications
    } = req.body;

    const pool = await poolPromise;

    if (!pool || !pool.connected) {
      throw new Error('Database connection not established');
    }

    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);
    
    let dobValue = null;
    if (Dob && Dob.trim() !== '') {
      dobValue = new Date(Dob);
      if (isNaN(dobValue)) dobValue = null;
    }

    let currentSalaryValue = null;
    let expectedSalaryValue = null;
    
    if (CurrentSalary && CurrentSalary.trim() !== '') {
      currentSalaryValue = parseFloat(CurrentSalary);
      if (isNaN(currentSalaryValue)) currentSalaryValue = null;
    }
    
    if (ExpectedSalary && ExpectedSalary.trim() !== '') {
      expectedSalaryValue = parseFloat(ExpectedSalary);
      if (isNaN(expectedSalaryValue)) expectedSalaryValue = null;
    }

    console.log('Executing SQL insert with binary file...');
    
    const result = await request
      .input("FirstName", sql.NVarChar(100), FirstName.trim())
      .input("LastName", sql.NVarChar(100), LastName.trim())
      .input("EmailID", sql.NVarChar(255), EmailID.trim())
      .input("CountryCode", sql.NVarChar(10), CountryCode)
      .input("PhoneNumber1", sql.NVarChar(20), PhoneNumber1?.trim() || null)
      .input("PhoneNumber2", sql.NVarChar(20), PhoneNumber2?.trim() || null)
      .input("ResumeFileData", sql.VarBinary(sql.MAX), req.file.buffer)
      .input("ResumeFileName", sql.NVarChar(255), req.file.originalname)
      .input("ResumeFileType", sql.NVarChar(100), req.file.mimetype)
      .input("CandidateInfo", sql.NVarChar(sql.MAX), CandidateInfo?.trim() || null)
      .input("CurrentLocation", sql.NVarChar(100), CurrentLocation?.trim() || null)
      .input("CurrentSalary", sql.Decimal(10, 2), currentSalaryValue)
      .input("ExpectedSalary", sql.Decimal(10, 2), expectedSalaryValue)
      .input("NoticePeriod", sql.NVarChar(50), NoticePeriod?.trim() || null)
      .input("CurrentEmployer", sql.NVarChar(100), CurrentEmployer?.trim() || null)
      .input("Experience", sql.NVarChar(50), Experience?.trim() || null)
      .input("RelevantExperience", sql.NVarChar(50), RelevantExperience?.trim() || null) // NEW FIELD
      .input("JobRoleApplied", sql.NVarChar(100), JobRoleApplied.trim())
      .input("Dob", sql.Date, dobValue)
      .input("LinkedInProfile", sql.NVarChar(255), LinkedInProfile?.trim() || null)
      .input("CoverLetter", sql.NVarChar(sql.MAX), CoverLetter?.trim() || null)
      .input("PassportNo", sql.NVarChar(50), PassportNo?.trim() || null)
      .input("Skills", sql.NVarChar(sql.MAX), Skills?.trim() || null)
      .input("Education", sql.NVarChar(sql.MAX), Education?.trim() || null)
      .input("Certifications", sql.NVarChar(sql.MAX), Certifications?.trim() || null)
      .input("CreatedBy", sql.NVarChar(100), createdBy)
      .query(`
        INSERT INTO [dbo].[Resume Submission] (
          FirstName, LastName, EmailID, CountryCode, PhoneNumber1, PhoneNumber2,
          ResumeFileData, ResumeFileName, ResumeFileType,
          CandidateInfo, CurrentLocation, CurrentSalary, ExpectedSalary,
          NoticePeriod, CurrentEmployer, Experience, RelevantExperience, JobRoleApplied, Dob,
          LinkedInProfile, CoverLetter, PassportNo,
          Skills, Education, Certifications,
          CreatedBy, CreatedDt, Status
        )
        VALUES (
          @FirstName, @LastName, @EmailID, @CountryCode, @PhoneNumber1, @PhoneNumber2,
          @ResumeFileData, @ResumeFileName, @ResumeFileType,
          @CandidateInfo, @CurrentLocation, @CurrentSalary, @ExpectedSalary,
          @NoticePeriod, @CurrentEmployer, @Experience, @RelevantExperience, @JobRoleApplied, @Dob,
          @LinkedInProfile, @CoverLetter, @PassportNo,
          @Skills, @Education, @Certifications,
          @CreatedBy, GETDATE(), 'New'
        );
        SELECT SCOPE_IDENTITY() AS Resume_ID;
      `);

    await transaction.commit();
    transaction = null;

    const resumeId = result.recordset[0]?.Resume_ID;
    console.log('Successfully inserted resume with ID:', resumeId);

    return res.status(201).json({ 
      success: true,
      message: "Resume submitted successfully!",
      Resume_ID: resumeId,
      createdBy: createdBy,
      data: {
        name: `${FirstName} ${LastName}`,
        email: EmailID,
        role: JobRoleApplied
      }
    });

  } catch (error) {
    console.error("Create error:", error);
    
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Rollback error:', rollbackError);
      }
    }
    
    let statusCode = 500;
    let errorResponse = {
      success: false,
      error: "Server error while processing your request"
    };

    if (error.originalError?.info?.number) {
      const sqlErrorNumber = error.originalError.info.number;
      
      switch (sqlErrorNumber) {
        case 208:
          errorResponse.error = "Database table not found";
          break;
        case 515:
          errorResponse.error = "Required field missing";
          break;
        case 2627:
          statusCode = 409;
          errorResponse.error = "Duplicate entry";
          break;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.message;
    }
    
    return res.status(statusCode).json(errorResponse);
  }
};

// Get all resumes
exports.getAllResumes = async (req, res) => {
  try {
    const pool = await poolPromise;
    
    if (!pool.connected) {
      throw new Error('Database connection not established');
    }

    const result = await pool.request()
      .query(`
        SELECT 
          Resume_ID, FirstName, LastName, EmailID, 
          CountryCode, PhoneNumber1, PhoneNumber2, JobRoleApplied,
          CurrentLocation, CurrentEmployer, Experience, RelevantExperience,
          CurrentSalary, ExpectedSalary, NoticePeriod, Skills, Education, 
          Certifications, CandidateInfo, LinkedInProfile, PassportNo, Dob, 
          CoverLetter, CreatedDt, CreatedBy, Status, UpdatedDt, UpdatedBy
        FROM [dbo].[Resume Submission] 
        ORDER BY CreatedDt DESC
      `);

    if (!result.recordset) {
      throw new Error('No recordset returned from query');
    }

    console.log(`Returning ${result.recordset.length} candidates`);
    res.status(200).json(result.recordset);

  } catch (error) {
    console.error("DB error in getAllResumes:", {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      success: false,
      error: "Could not fetch resumes",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      data: []
    });
  }
};

// Get single resume by ID
exports.getResumeById = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Resume_ID', sql.Int, id)
      .query(`
        SELECT 
          Resume_ID, FirstName, LastName, EmailID, 
          CountryCode, PhoneNumber1, PhoneNumber2, JobRoleApplied,
          CurrentLocation, CurrentEmployer, Experience, RelevantExperience,
          CurrentSalary, ExpectedSalary, NoticePeriod, Skills, Education, 
          Certifications, CandidateInfo, LinkedInProfile, PassportNo, Dob, 
          CoverLetter, CreatedDt, CreatedBy, Status, UpdatedDt, UpdatedBy
        FROM [dbo].[Resume Submission] 
        WHERE Resume_ID = @Resume_ID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Resume not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: result.recordset[0]
    });

  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ 
      success: false,
      error: "Could not fetch resume",
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

// Test endpoint to check table structure
exports.testTableStructure = async (req, res) => {
  try {
    console.log('🔍 Testing table structure...');
    const pool = await poolPromise;
    
    const schemaResult = await pool.request()
      .query(`
        SELECT 
          COLUMN_NAME, 
          DATA_TYPE, 
          IS_NULLABLE, 
          COLUMN_DEFAULT,
          CHARACTER_MAXIMUM_LENGTH
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'Resume Submission'
        ORDER BY ORDINAL_POSITION
      `);
    
    const sampleResult = await pool.request()
      .query('SELECT TOP 5 Resume_ID, FirstName, LastName, EmailID FROM [dbo].[Resume Submission] ORDER BY Resume_ID DESC');
    
    res.json({
      success: true,
      tableSchema: schemaResult.recordset,
      sampleData: sampleResult.recordset,
      totalColumns: schemaResult.recordset.length,
      sampleCount: sampleResult.recordset.length
    });
    
  } catch (error) {
    console.error('Table structure test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get table structure',
      details: error.message
    });
  }
};