// // controllers/candidateController.js - UPDATED WITH NAME SEARCH SUPPORT
// const sql = require('mssql');
// const { dbConfig } = require('../../config/db');
// const fs = require('fs');
// const path = require('path');

// // FIXED: Helper function to convert priority text to numeric value
// const getPriorityValue = (priorityText) => {
//   console.log('Converting priority text to value:', priorityText); // Debug log
  
//   // Handle both string and already converted values
//   if (typeof priorityText === 'number') {
//     return priorityText;
//   }
  
//   if (typeof priorityText === 'string') {
//     const priority = priorityText.trim();
//     switch (priority) {
//       case 'High':
//         return 1;
//       case 'Medium':
//         return 2;
//       case 'Low':
//         return 3;
//       default:
//         console.log('Unknown priority text, defaulting to Medium:', priorityText);
//         return 2; // Default to Medium
//     }
//   }
  
//   console.log('Invalid priority type, defaulting to Medium:', typeof priorityText, priorityText);
//   return 2; // Default to Medium
// };

// // FIXED: Helper function to convert numeric priority to text
// const getPriorityText = (priorityValue) => {
//   console.log('Converting priority value to text:', priorityValue); // Debug log
  
//   // Handle both number and string inputs
//   const priority = typeof priorityValue === 'string' ? parseInt(priorityValue) : priorityValue;
  
//   switch (priority) {
//     case 1:
//       return 'High';
//     case 2:
//       return 'Medium';
//     case 3:
//       return 'Low';
//     default:
//       console.log('Unknown priority value, defaulting to Medium:', priority);
//       return 'Medium';
//   }
// };

// const candidateController = {
//   // Test database connection method
//   testConnection: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const result = await sql.query('SELECT 1 as test');
//       res.json({
//         success: true,
//         message: 'Database connection successful',
//         data: result.recordset
//       });
//     } catch (error) {
//       console.error('Database connection test failed:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Database connection failed',
//         error: error.message
//       });
//     }
//   },

//   // UPDATED: Get all candidates with optional filters - Enhanced with name search
//   getAllCandidates: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { name, skills, experience, location, priority, status } = req.query;
      
//       console.log('Get candidates query parameters:', req.query);
      
//       let query = 'SELECT * FROM Candidates WHERE 1=1';
//       let inputs = [];
      
//       // ADDED: Name filter support
//       if (name && name.trim()) {
//         query += ' AND Name LIKE @name';
//         inputs.push({ name: 'name', type: sql.NVarChar, value: `%${name.trim()}%` });
//         console.log('Applied name filter:', name.trim());
//       }
      
//       if (skills && skills.trim()) {
//         query += ' AND Skills LIKE @skills';
//         inputs.push({ name: 'skills', type: sql.NVarChar, value: `%${skills.trim()}%` });
//         console.log('Applied skills filter:', skills.trim());
//       }
      
//       if (experience && !isNaN(experience)) {
//         query += ' AND Experience >= @experience';
//         inputs.push({ name: 'experience', type: sql.Int, value: parseInt(experience) });
//         console.log('Applied experience filter:', parseInt(experience));
//       }
      
//       if (location && location.trim()) {
//         query += ' AND Location LIKE @location';
//         inputs.push({ name: 'location', type: sql.NVarChar, value: `%${location.trim()}%` });
//         console.log('Applied location filter:', location.trim());
//       }
      
//       if (priority && priority.trim()) {
//         // Convert priority text to numeric value for database query
//         const priorityValue = getPriorityValue(priority.trim());
//         query += ' AND Priority = @priority';
//         inputs.push({ name: 'priority', type: sql.Int, value: priorityValue });
//         console.log('Applied priority filter:', priority.trim(), '->', priorityValue);
//       }
      
//       if (status && status.trim()) {
//         query += ' AND Status = @status';
//         inputs.push({ name: 'status', type: sql.NVarChar, value: status.trim() });
//         console.log('Applied status filter:', status.trim());
//       }
      
//       query += ' ORDER BY CreatedAt DESC';
      
//       console.log('Final SQL query:', query);
      
//       const request = new sql.Request();
//       inputs.forEach(input => {
//         request.input(input.name, input.type, input.value);
//       });
      
//       const result = await request.query(query);
      
//       console.log(`Found ${result.recordset.length} candidates matching filters`);
      
//       res.json({
//         success: true,
//         data: result.recordset,
//         count: result.recordset.length,
//         filters: { name, skills, experience, location, priority, status } // Include applied filters in response
//       });
//     } catch (error) {
//       console.error('Get all candidates error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving candidates', 
//         error: error.message 
//       });
//     }
//   },

//   // ADDED: New dedicated name search endpoint
//   searchByName: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { name } = req.query;
      
//       if (!name || !name.trim()) {
//         return res.status(400).json({
//           success: false,
//           message: 'Name parameter is required and cannot be empty'
//         });
//       }
      
//       console.log('Searching candidates by name:', name.trim());
      
//       const request = new sql.Request();
//       request.input('name', sql.NVarChar, `%${name.trim()}%`);
      
//       const result = await request.query(`
//         SELECT * FROM Candidates 
//         WHERE Name LIKE @name 
//         ORDER BY 
//           CASE 
//             WHEN Name = @nameExact THEN 1
//             WHEN Name LIKE @nameStart THEN 2
//             ELSE 3
//           END,
//           Name ASC
//       `);
      
//       // Add additional inputs for exact and starts-with matching
//       request.input('nameExact', sql.NVarChar, name.trim());
//       request.input('nameStart', sql.NVarChar, `${name.trim()}%`);
      
//       console.log(`Found ${result.recordset.length} candidates with name containing: ${name.trim()}`);
      
//       res.json({
//         success: true,
//         data: result.recordset,
//         count: result.recordset.length,
//         searchTerm: name.trim()
//       });
//     } catch (error) {
//       console.error('Search by name error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error searching candidates by name', 
//         error: error.message 
//       });
//     }
//   },

//   // Get single candidate by ID
//   getCandidateById: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { id } = req.params;
      
//       const request = new sql.Request();
//       request.input('id', sql.Int, id);
      
//       const result = await request.query('SELECT * FROM Candidates WHERE Id = @id');
      
//       if (result.recordset.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Candidate not found' 
//         });
//       }
      
//       res.json({
//         success: true,
//         data: result.recordset[0]
//       });
//     } catch (error) {
//       console.error('Get candidate by ID error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving candidate', 
//         error: error.message 
//       });
//     }
//   },

//   // FIXED: Create new candidate - Enhanced priority handling
//   createCandidate: async (req, res) => {
//     try {
//       console.log('=== CREATE CANDIDATE DEBUG ===');
//       console.log('Request body:', req.body);
//       console.log('Request file:', req.file ? req.file.filename : 'No file');
      
//       await sql.connect(dbConfig);
      
//       // Handle both camelCase and PascalCase field names from frontend
//       const {
//         name, Name,
//         email, Email, 
//         phone, Phone,
//         skills, Skills,
//         experience, Experience,
//         location, Location,
//         priority, Priority,
//         visaStatus, VisaStatus,
//         status, Status
//       } = req.body;

//       // Use PascalCase if available, otherwise camelCase
//       const candidateData = {
//         name: Name || name,
//         email: Email || email,
//         phone: Phone || phone,
//         skills: Skills || skills,
//         experience: Experience || experience,
//         location: Location || location,
//         priority: Priority || priority,
//         visaStatus: VisaStatus || visaStatus,
//         status: Status || status || 'Available'
//       };

//       console.log('Processed candidate data:', candidateData);

//       // Validate required fields
//       if (!candidateData.name || !candidateData.email || !candidateData.phone || 
//           !candidateData.skills || !candidateData.experience || !candidateData.location || 
//           !candidateData.priority || !candidateData.visaStatus) {
//         console.log('Missing required fields validation failed');
//         console.log('Missing fields check:', {
//           name: !!candidateData.name,
//           email: !!candidateData.email,
//           phone: !!candidateData.phone,
//           skills: !!candidateData.skills,
//           experience: !!candidateData.experience,
//           location: !!candidateData.location,
//           priority: !!candidateData.priority,
//           visaStatus: !!candidateData.visaStatus
//         });
        
//         if (req.file) {
//           fs.unlinkSync(req.file.path);
//         }
//         return res.status(400).json({
//           success: false,
//           message: 'All required fields must be provided',
//           required: ['name', 'email', 'phone', 'skills', 'experience', 'location', 'priority', 'visaStatus'],
//           received: candidateData
//         });
//       }

//       // Check if email already exists
//       const checkRequest = new sql.Request();
//       checkRequest.input('email', sql.NVarChar, candidateData.email);
//       const checkResult = await checkRequest.query('SELECT Id FROM Candidates WHERE Email = @email');
      
//       if (checkResult.recordset.length > 0) {
//         console.log('Email already exists:', candidateData.email);
//         if (req.file) {
//           fs.unlinkSync(req.file.path);
//         }
//         return res.status(409).json({
//           success: false,
//           message: 'Candidate with this email already exists'
//         });
//       }
      
//       // FIXED: Convert priority text to numeric value with enhanced logging
//       console.log('Priority before conversion:', candidateData.priority, typeof candidateData.priority);
//       const priorityValue = getPriorityValue(candidateData.priority);
//       console.log('Priority after conversion:', priorityValue, typeof priorityValue);
      
//       // Validate priority value
//       if (!priorityValue || priorityValue < 1 || priorityValue > 3) {
//         console.log('Invalid priority value:', priorityValue);
//         if (req.file) {
//           fs.unlinkSync(req.file.path);
//         }
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid priority value. Must be High, Medium, or Low',
//           received: candidateData.priority,
//           converted: priorityValue
//         });
//       }
      
//       const request = new sql.Request();
      
//       // FIXED: Add detailed input logging
//       console.log('Setting SQL parameters:');
//       request.input('name', sql.NVarChar, candidateData.name);
//       console.log('- name:', candidateData.name);
      
//       request.input('email', sql.NVarChar, candidateData.email);
//       console.log('- email:', candidateData.email);
      
//       request.input('phone', sql.NVarChar, candidateData.phone);
//       console.log('- phone:', candidateData.phone);
      
//       const skillsString = Array.isArray(candidateData.skills) ? candidateData.skills.join(', ') : candidateData.skills;
//       request.input('skills', sql.NVarChar, skillsString);
//       console.log('- skills:', skillsString);
      
//       const experienceInt = parseInt(candidateData.experience);
//       request.input('experience', sql.Int, experienceInt);
//       console.log('- experience:', experienceInt);
      
//       request.input('location', sql.NVarChar, candidateData.location);
//       console.log('- location:', candidateData.location);
      
//       request.input('priority', sql.Int, priorityValue); // FIXED: Use Int type with numeric value
//       console.log('- priority:', priorityValue, '(Int)');
      
//       request.input('visaStatus', sql.NVarChar, candidateData.visaStatus);
//       console.log('- visaStatus:', candidateData.visaStatus);
      
//       request.input('status', sql.NVarChar, candidateData.status);
//       console.log('- status:', candidateData.status);
      
//       // Handle resume file
//       let resumeFilename = null;
//       if (req.file) {
//         resumeFilename = req.file.filename;
//         console.log('Resume file saved:', resumeFilename);
//       }
//       request.input('resume', sql.NVarChar, resumeFilename);
//       console.log('- resume:', resumeFilename);
      
//       // FIXED: Enhanced SQL execution with detailed logging
//       const insertQuery = `
//         INSERT INTO Candidates (Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, Resume)
//         OUTPUT INSERTED.Id, INSERTED.Priority
//         VALUES (@name, @email, @phone, @skills, @experience, @location, @priority, @visaStatus, @status, @resume)
//       `;
      
//       console.log('Executing SQL INSERT with query:', insertQuery);
//       const result = await request.query(insertQuery);
      
//       const candidateId = result.recordset[0].Id;
//       const insertedPriority = result.recordset[0].Priority;
//       console.log('Candidate created with ID:', candidateId, 'Priority inserted:', insertedPriority);
      
//       // Get the created candidate to verify data
//       const getRequest = new sql.Request();
//       getRequest.input('id', sql.Int, candidateId);
//       const getResult = await getRequest.query('SELECT * FROM Candidates WHERE Id = @id');
      
//       const createdCandidate = getResult.recordset[0];
//       console.log('Retrieved created candidate:', createdCandidate);
//       console.log('Retrieved candidate priority:', createdCandidate.Priority, typeof createdCandidate.Priority);
      
//       res.status(201).json({
//         success: true,
//         message: 'Candidate created successfully',
//         data: createdCandidate
//       });
//     } catch (error) {
//       // Clean up uploaded file if error occurs
//       if (req.file) {
//         try {
//           fs.unlinkSync(req.file.path);
//         } catch (unlinkError) {
//           console.error('Error deleting file:', unlinkError);
//         }
//       }
      
//       console.error('Create candidate error:', error);
//       console.error('Error details:', {
//         message: error.message,
//         code: error.code,
//         number: error.number,
//         state: error.state,
//         class: error.class,
//         serverName: error.serverName,
//         procName: error.procName,
//         lineNumber: error.lineNumber
//       });
      
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error creating candidate: ' + error.message, 
//         error: error.message,
//         details: process.env.NODE_ENV === 'development' ? error : undefined
//       });
//     }
//   },

//   // FIXED: Update candidate - Enhanced priority handling
//   updateCandidate: async (req, res) => {
//     try {
//       console.log('=== UPDATE CANDIDATE DEBUG ===');
//       console.log('Request body:', req.body);
      
//       await sql.connect(dbConfig);
//       const { id } = req.params;
      
//       // Handle both camelCase and PascalCase field names from frontend
//       const {
//         name, Name,
//         email, Email, 
//         phone, Phone,
//         skills, Skills,
//         experience, Experience,
//         location, Location,
//         priority, Priority,
//         visaStatus, VisaStatus,
//         status, Status
//       } = req.body;

//       // Use PascalCase if available, otherwise camelCase
//       const candidateData = {
//         name: Name || name,
//         email: Email || email,
//         phone: Phone || phone,
//         skills: Skills || skills,
//         experience: Experience || experience,
//         location: Location || location,
//         priority: Priority || priority,
//         visaStatus: VisaStatus || visaStatus,
//         status: Status || status
//       };
      
//       console.log('Processed candidate data for update:', candidateData);
      
//       // Get current candidate data to check for existing resume
//       const currentRequest = new sql.Request();
//       currentRequest.input('id', sql.Int, id);
//       const currentResult = await currentRequest.query('SELECT Resume, Priority FROM Candidates WHERE Id = @id');
      
//       if (currentResult.recordset.length === 0) {
//         if (req.file) {
//           fs.unlinkSync(req.file.path);
//         }
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Candidate not found' 
//         });
//       }
      
//       const currentResume = currentResult.recordset[0].Resume;
//       const currentPriority = currentResult.recordset[0].Priority;
//       console.log('Current candidate priority in DB:', currentPriority);
      
//       // FIXED: Convert priority text to numeric value with enhanced logging
//       console.log('Priority before conversion:', candidateData.priority, typeof candidateData.priority);
//       const priorityValue = getPriorityValue(candidateData.priority);
//       console.log('Priority after conversion:', priorityValue, typeof priorityValue);
      
//       const request = new sql.Request();
//       request.input('id', sql.Int, id);
//       request.input('name', sql.NVarChar, candidateData.name);
//       request.input('email', sql.NVarChar, candidateData.email);
//       request.input('phone', sql.NVarChar, candidateData.phone);
//       request.input('skills', sql.NVarChar, Array.isArray(candidateData.skills) ? candidateData.skills.join(', ') : candidateData.skills);
//       request.input('experience', sql.Int, parseInt(candidateData.experience));
//       request.input('location', sql.NVarChar, candidateData.location);
//       request.input('priority', sql.Int, priorityValue); // FIXED: Use Int type with numeric value
//       request.input('visaStatus', sql.NVarChar, candidateData.visaStatus);
//       request.input('status', sql.NVarChar, candidateData.status);
//       request.input('updatedAt', sql.DateTime, new Date());
      
//       console.log('Update priority value being set:', priorityValue);
      
//       // Handle resume file update
//       let resumeFilename = currentResume;
//       if (req.file) {
//         resumeFilename = req.file.filename;
//         // Delete old resume file if it exists
//         if (currentResume) {
//           const oldResumePath = path.join('uploads', 'resumes', currentResume);
//           if (fs.existsSync(oldResumePath)) {
//             fs.unlinkSync(oldResumePath);
//           }
//         }
//       }
//       request.input('resume', sql.NVarChar, resumeFilename);
      
//       const updateQuery = `
//         UPDATE Candidates 
//         SET Name = @name, Email = @email, Phone = @phone, Skills = @skills, 
//             Experience = @experience, Location = @location, Priority = @priority, 
//             VisaStatus = @visaStatus, Status = @status, Resume = @resume, UpdatedAt = @updatedAt
//         WHERE Id = @id
//       `;
      
//       console.log('Executing update with query:', updateQuery);
//       const result = await request.query(updateQuery);
      
//       if (result.rowsAffected[0] === 0) {
//         if (req.file) {
//           fs.unlinkSync(req.file.path);
//         }
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Candidate not found' 
//         });
//       }
      
//       console.log('Update successful, rows affected:', result.rowsAffected[0]);
      
//       // Get the updated candidate to verify changes
//       const getRequest = new sql.Request();
//       getRequest.input('id', sql.Int, id);
//       const getResult = await getRequest.query('SELECT * FROM Candidates WHERE Id = @id');
      
//       const updatedCandidate = getResult.recordset[0];
//       console.log('Retrieved updated candidate:', updatedCandidate);
//       console.log('Updated candidate priority:', updatedCandidate.Priority, typeof updatedCandidate.Priority);
      
//       res.json({
//         success: true,
//         message: 'Candidate updated successfully',
//         data: updatedCandidate
//       });
//     } catch (error) {
//       if (req.file) {
//         try {
//           fs.unlinkSync(req.file.path);
//         } catch (unlinkError) {
//           console.error('Error deleting file:', unlinkError);
//         }
//       }
//       console.error('Update candidate error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error updating candidate: ' + error.message, 
//         error: error.message 
//       });
//     }
//   },

//   deleteCandidate: async (req, res) => {
//     try {
//       console.log('=== DELETE CANDIDATE DEBUG ===');
//       console.log('Request params:', req.params);
//       console.log('Candidate ID to delete:', req.params.id);
      
//       await sql.connect(dbConfig);
//       const { id } = req.params;
      
//       // Validate ID parameter
//       if (!id || isNaN(parseInt(id))) {
//         console.log('Invalid candidate ID:', id);
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid candidate ID provided'
//         });
//       }
      
//       const candidateId = parseInt(id);
//       console.log('Parsed candidate ID:', candidateId);
      
//       // First, get candidate data to delete resume file and verify existence
//       const getRequest = new sql.Request();
//       getRequest.input('id', sql.Int, candidateId);
      
//       console.log('Checking if candidate exists...');
//       const getResult = await getRequest.query('SELECT Id, Name, Resume FROM Candidates WHERE Id = @id');
      
//       if (getResult.recordset.length === 0) {
//         console.log('Candidate not found with ID:', candidateId);
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Candidate not found' 
//         });
//       }
      
//       const candidate = getResult.recordset[0];
//       console.log('Found candidate to delete:', candidate);
      
//       const resumeFile = candidate.Resume;
      
//       // Delete the candidate from database
//       const deleteRequest = new sql.Request();
//       deleteRequest.input('id', sql.Int, candidateId);
      
//       console.log('Executing DELETE query...');
//       const deleteResult = await deleteRequest.query('DELETE FROM Candidates WHERE Id = @id');
      
//       console.log('Delete result:', {
//         rowsAffected: deleteResult.rowsAffected,
//         recordset: deleteResult.recordset
//       });
      
//       if (deleteResult.rowsAffected[0] === 0) {
//         console.log('No rows affected during delete');
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Candidate not found or already deleted' 
//         });
//       }
      
//       console.log(`Successfully deleted candidate with ID: ${candidateId}`);
      
//       // Delete resume file if it exists
//       if (resumeFile) {
//         try {
//           const resumePath = path.join('uploads', 'resumes', resumeFile);
//           console.log('Attempting to delete resume file:', resumePath);
          
//           if (fs.existsSync(resumePath)) {
//             fs.unlinkSync(resumePath);
//             console.log('Resume file deleted successfully:', resumeFile);
//           } else {
//             console.log('Resume file does not exist:', resumePath);
//           }
//         } catch (fileError) {
//           console.error('Error deleting resume file:', fileError);
//           // Don't fail the entire operation if file deletion fails
//         }
//       }
      
//       res.json({
//         success: true,
//         message: 'Candidate deleted successfully',
//         deletedCandidate: {
//           id: candidateId,
//           name: candidate.Name
//         }
//       });
      
//     } catch (error) {
//       console.error('Delete candidate error:', error);
//       console.error('Error details:', {
//         message: error.message,
//         code: error.code,
//         number: error.number,
//         state: error.state,
//         class: error.class
//       });
      
//       // Handle specific SQL Server errors
//       if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
//         res.status(500).json({ 
//           success: false, 
//           message: 'Database connection error. Please try again.', 
//           error: 'Connection failed'
//         });
//       } else if (error.number === 547) { // Foreign key constraint
//         res.status(409).json({ 
//           success: false, 
//           message: 'Cannot delete candidate. This candidate may be referenced in other records.', 
//           error: 'Foreign key constraint violation'
//         });
//       } else {
//         res.status(500).json({ 
//           success: false, 
//           message: 'Error deleting candidate: ' + error.message, 
//           error: error.message,
//           details: process.env.NODE_ENV === 'development' ? error : undefined
//         });
//       }
//     }
//   },

//   // Download resume
//   downloadResume: async (req, res) => {
//     try {
//       const { id } = req.params;
      
//       await sql.connect(dbConfig);
//       const request = new sql.Request();
//       request.input('id', sql.Int, id);
      
//       const result = await request.query('SELECT Resume FROM Candidates WHERE Id = @id');
      
//       if (result.recordset.length === 0 || !result.recordset[0].Resume) {
//         return res.status(404).json({
//           success: false,
//           message: 'Resume not found'
//         });
//       }
      
//       const resumeFilename = result.recordset[0].Resume;
//       const resumePath = path.join('uploads', 'resumes', resumeFilename);
      
//       if (!fs.existsSync(resumePath)) {
//         return res.status(404).json({
//           success: false,
//           message: 'Resume file not found'
//         });
//       }
      
//       res.download(resumePath, resumeFilename, (err) => {
//         if (err) {
//           console.error('Download resume error:', err);
//           res.status(500).json({
//             success: false,
//             message: 'Error downloading resume'
//           });
//         }
//       });
//     } catch (error) {
//       console.error('Download resume error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error downloading resume', 
//         error: error.message 
//       });
//     }
//   },

//   // Search candidates by skills
//   searchBySkills: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { skills } = req.query;
      
//       if (!skills) {
//         return res.status(400).json({
//           success: false,
//           message: 'Skills parameter is required'
//         });
//       }
      
//       const request = new sql.Request();
//       request.input('skills', sql.NVarChar, `%${skills}%`);
      
//       const result = await request.query(`
//         SELECT * FROM Candidates 
//         WHERE Skills LIKE @skills 
//         ORDER BY Experience DESC
//       `);
      
//       res.json({
//         success: true,
//         data: result.recordset,
//         count: result.recordset.length
//       });
//     } catch (error) {
//       console.error('Search by skills error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error searching candidates', 
//         error: error.message 
//       });
//     }
//   },

//   // Get available candidates only
//   getAvailableCandidates: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
      
//       const request = new sql.Request();
//       request.input('status', sql.NVarChar, 'Available');
      
//       const result = await request.query(`
//         SELECT * FROM Candidates 
//         WHERE Status = @status 
//         ORDER BY CreatedAt DESC
//       `);
      
//       res.json({
//         success: true,
//         data: result.recordset,
//         count: result.recordset.length
//       });
//     } catch (error) {
//       console.error('Get available candidates error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving available candidates', 
//         error: error.message 
//       });
//     }
//   },

//   // FIXED: Get candidates by priority - Enhanced handling
//   getCandidatesByPriority: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { priority } = req.params;
      
//       console.log('Get candidates by priority request:', priority);
      
//       if (!['High', 'Medium', 'Low'].includes(priority)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid priority. Must be High, Medium, or Low'
//         });
//       }
      
//       // Convert priority text to numeric value for database query
//       const priorityValue = getPriorityValue(priority);
//       console.log('Converted priority for query:', priority, '->', priorityValue);
      
//       const request = new sql.Request();
//       request.input('priority', sql.Int, priorityValue);
      
//       const result = await request.query(`
//         SELECT * FROM Candidates 
//         WHERE Priority = @priority 
//         ORDER BY CreatedAt DESC
//       `);
      
//       console.log(`Found ${result.recordset.length} candidates with priority ${priority} (${priorityValue})`);
      
//       res.json({
//         success: true,
//         data: result.recordset,
//         count: result.recordset.length
//       });
//     } catch (error) {
//       console.error('Get candidates by priority error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving candidates by priority', 
//         error: error.message 
//       });
//     }
//   }
// };

// module.exports = candidateController;




// controllers/candidateController.js - WITH FULL RESUME UPLOAD
const sql = require('mssql');
const { dbConfig } = require('../../config/db');
const fs = require('fs');
const path = require('path');

// Helper functions for priority conversion
const getPriorityValue = (priorityText) => {
  if (typeof priorityText === 'number') return priorityText;
  if (typeof priorityText === 'string') {
    const priority = priorityText.trim();
    switch (priority) {
      case 'High': return 1;
      case 'Medium': return 2;
      case 'Low': return 3;
      default: return 2;
    }
  }
  return 2;
};

const getPriorityText = (priorityValue) => {
  const priority = typeof priorityValue === 'string' ? parseInt(priorityValue) : priorityValue;
  switch (priority) {
    case 1: return 'High';
    case 2: return 'Medium';
    case 3: return 'Low';
    default: return 'Medium';
  }
};

const candidateController = {
  testConnection: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const result = await sql.query('SELECT 1 as test');
      res.json({
        success: true,
        message: 'Database connection successful',
        data: result.recordset
      });
    } catch (error) {
      console.error('Database connection test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message
      });
    }
  },

  getAllCandidates: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { name, skills, experience, location, priority, status } = req.query;
      
      console.log('Get candidates query parameters:', req.query);
      
      // Don't select the Resume binary data in list view for performance
      let query = 'SELECT Id, Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, ResumeFileName, ResumeContentType, CreatedAt, UpdatedAt FROM Candidates WHERE 1=1';
      let inputs = [];
      
      if (name && name.trim()) {
        query += ' AND Name LIKE @name';
        inputs.push({ name: 'name', type: sql.NVarChar, value: `%${name.trim()}%` });
      }
      
      if (skills && skills.trim()) {
        query += ' AND Skills LIKE @skills';
        inputs.push({ name: 'skills', type: sql.NVarChar, value: `%${skills.trim()}%` });
      }
      
      if (experience && !isNaN(experience)) {
        query += ' AND Experience >= @experience';
        inputs.push({ name: 'experience', type: sql.Int, value: parseInt(experience) });
      }
      
      if (location && location.trim()) {
        query += ' AND Location LIKE @location';
        inputs.push({ name: 'location', type: sql.NVarChar, value: `%${location.trim()}%` });
      }
      
      if (priority && priority.trim()) {
        const priorityValue = getPriorityValue(priority.trim());
        query += ' AND Priority = @priority';
        inputs.push({ name: 'priority', type: sql.Int, value: priorityValue });
      }
      
      if (status && status.trim()) {
        query += ' AND Status = @status';
        inputs.push({ name: 'status', type: sql.NVarChar, value: status.trim() });
      }
      
      query += ' ORDER BY CreatedAt DESC';
      
      const request = new sql.Request();
      inputs.forEach(input => {
        request.input(input.name, input.type, input.value);
      });
      
      const result = await request.query(query);
      
      // Add Resume field with filename for frontend compatibility
      const candidates = result.recordset.map(candidate => ({
        ...candidate,
        Resume: candidate.ResumeFileName // For frontend compatibility
      }));
      
      res.json({
        success: true,
        data: candidates,
        count: candidates.length,
        filters: { name, skills, experience, location, priority, status }
      });
    } catch (error) {
      console.error('Get all candidates error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving candidates', 
        error: error.message 
      });
    }
  },

  searchByName: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { name } = req.query;
      
      if (!name || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name parameter is required and cannot be empty'
        });
      }
      
      const request = new sql.Request();
      request.input('name', sql.NVarChar, `%${name.trim()}%`);
      
      const result = await request.query(`
        SELECT Id, Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, ResumeFileName, ResumeContentType, CreatedAt, UpdatedAt
        FROM Candidates 
        WHERE Name LIKE @name 
        ORDER BY Name ASC
      `);
      
      const candidates = result.recordset.map(candidate => ({
        ...candidate,
        Resume: candidate.ResumeFileName
      }));
      
      res.json({
        success: true,
        data: candidates,
        count: candidates.length,
        searchTerm: name.trim()
      });
    } catch (error) {
      console.error('Search by name error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error searching candidates by name', 
        error: error.message 
      });
    }
  },

  getCandidateById: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { id } = req.params;
      
      const request = new sql.Request();
      request.input('id', sql.Int, id);
      
      // Don't include Resume binary data unless specifically needed
      const result = await request.query('SELECT Id, Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, ResumeFileName, ResumeContentType, CreatedAt, UpdatedAt FROM Candidates WHERE Id = @id');
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Candidate not found' 
        });
      }
      
      const candidate = {
        ...result.recordset[0],
        Resume: result.recordset[0].ResumeFileName
      };
      
      res.json({
        success: true,
        data: candidate
      });
    } catch (error) {
      console.error('Get candidate by ID error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving candidate', 
        error: error.message 
      });
    }
  },

  createCandidate: async (req, res) => {
    try {
      console.log('=== CREATE CANDIDATE DEBUG ===');
      console.log('Request body:', req.body);
      console.log('Request file:', req.file ? req.file.filename : 'No file');
      
      await sql.connect(dbConfig);
      
      const {
        name, Name,
        email, Email, 
        phone, Phone,
        skills, Skills,
        experience, Experience,
        location, Location,
        priority, Priority,
        visaStatus, VisaStatus,
        status, Status
      } = req.body;

      const candidateData = {
        name: Name || name,
        email: Email || email,
        phone: Phone || phone,
        skills: Skills || skills,
        experience: Experience || experience,
        location: Location || location,
        priority: Priority || priority,
        visaStatus: VisaStatus || visaStatus,
        status: Status || status || 'Available'
      };

      // Validate required fields
      if (!candidateData.name || !candidateData.email || !candidateData.phone || 
          !candidateData.skills || !candidateData.experience || !candidateData.location || 
          !candidateData.priority || !candidateData.visaStatus) {
        return res.status(400).json({
          success: false,
          message: 'All required fields must be provided'
        });
      }

      // Check if email already exists
      const checkRequest = new sql.Request();
      checkRequest.input('email', sql.NVarChar, candidateData.email);
      const checkResult = await checkRequest.query('SELECT Id FROM Candidates WHERE Email = @email');
      
      if (checkResult.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Candidate with this email already exists'
        });
      }
      
      const priorityValue = getPriorityValue(candidateData.priority);
      
      const request = new sql.Request();
      request.input('name', sql.NVarChar, candidateData.name);
      request.input('email', sql.NVarChar, candidateData.email);
      request.input('phone', sql.NVarChar, candidateData.phone);
      const skillsString = Array.isArray(candidateData.skills) ? candidateData.skills.join(', ') : candidateData.skills;
      request.input('skills', sql.NVarChar, skillsString);
      request.input('experience', sql.Int, parseInt(candidateData.experience));
      request.input('location', sql.NVarChar, candidateData.location);
      request.input('priority', sql.Int, priorityValue);
      request.input('visaStatus', sql.NVarChar, candidateData.visaStatus);
      request.input('status', sql.NVarChar, candidateData.status);
      
      // FIXED: Store complete resume file as binary
      let resumeBuffer = null;
      let resumeFileName = null;
      let resumeContentType = null;
      
      if (req.file) {
        const filePath = req.file.path;
        resumeBuffer = fs.readFileSync(filePath);
        resumeFileName = req.file.originalname;
        resumeContentType = req.file.mimetype;
        
        // Delete the temporary file after reading
        fs.unlinkSync(filePath);
        
        console.log('Resume uploaded:', resumeFileName, 'Size:', resumeBuffer.length, 'bytes');
      }
      
      request.input('resume', sql.VarBinary, resumeBuffer);
      request.input('resumeFileName', sql.NVarChar, resumeFileName);
      request.input('resumeContentType', sql.NVarChar, resumeContentType);
      
      const insertQuery = `
        INSERT INTO Candidates (Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, Resume, ResumeFileName, ResumeContentType)
        OUTPUT INSERTED.Id, INSERTED.Priority
        VALUES (@name, @email, @phone, @skills, @experience, @location, @priority, @visaStatus, @status, @resume, @resumeFileName, @resumeContentType)
      `;
      
      const result = await request.query(insertQuery);
      const candidateId = result.recordset[0].Id;
      
      // Get the created candidate
      const getRequest = new sql.Request();
      getRequest.input('id', sql.Int, candidateId);
      const getResult = await getRequest.query('SELECT Id, Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, ResumeFileName, ResumeContentType, CreatedAt, UpdatedAt FROM Candidates WHERE Id = @id');
      
      const createdCandidate = {
        ...getResult.recordset[0],
        Resume: getResult.recordset[0].ResumeFileName
      };
      
      res.status(201).json({
        success: true,
        message: 'Candidate created successfully',
        data: createdCandidate
      });
    } catch (error) {
      console.error('Create candidate error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating candidate: ' + error.message, 
        error: error.message
      });
    }
  },

  updateCandidate: async (req, res) => {
    try {
      console.log('=== UPDATE CANDIDATE DEBUG ===');
      
      await sql.connect(dbConfig);
      const { id } = req.params;
      
      const {
        name, Name,
        email, Email, 
        phone, Phone,
        skills, Skills,
        experience, Experience,
        location, Location,
        priority, Priority,
        visaStatus, VisaStatus,
        status, Status
      } = req.body;

      const candidateData = {
        name: Name || name,
        email: Email || email,
        phone: Phone || phone,
        skills: Skills || skills,
        experience: Experience || experience,
        location: Location || location,
        priority: Priority || priority,
        visaStatus: VisaStatus || visaStatus,
        status: Status || status
      };
      
      // Check if candidate exists
      const currentRequest = new sql.Request();
      currentRequest.input('id', sql.Int, id);
      const currentResult = await currentRequest.query('SELECT Id FROM Candidates WHERE Id = @id');
      
      if (currentResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Candidate not found' 
        });
      }
      
      const priorityValue = getPriorityValue(candidateData.priority);
      
      const request = new sql.Request();
      request.input('id', sql.Int, id);
      request.input('name', sql.NVarChar, candidateData.name);
      request.input('email', sql.NVarChar, candidateData.email);
      request.input('phone', sql.NVarChar, candidateData.phone);
      request.input('skills', sql.NVarChar, Array.isArray(candidateData.skills) ? candidateData.skills.join(', ') : candidateData.skills);
      request.input('experience', sql.Int, parseInt(candidateData.experience));
      request.input('location', sql.NVarChar, candidateData.location);
      request.input('priority', sql.Int, priorityValue);
      request.input('visaStatus', sql.NVarChar, candidateData.visaStatus);
      request.input('status', sql.NVarChar, candidateData.status);
      request.input('updatedAt', sql.DateTime, new Date());
      
      let updateQuery = `
        UPDATE Candidates 
        SET Name = @name, Email = @email, Phone = @phone, Skills = @skills, 
            Experience = @experience, Location = @location, Priority = @priority, 
            VisaStatus = @visaStatus, Status = @status, UpdatedAt = @updatedAt
      `;
      
      // FIXED: Update resume if new file uploaded
      if (req.file) {
        const filePath = req.file.path;
        const resumeBuffer = fs.readFileSync(filePath);
        const resumeFileName = req.file.originalname;
        const resumeContentType = req.file.mimetype;
        
        // Delete temporary file
        fs.unlinkSync(filePath);
        
        request.input('resume', sql.VarBinary, resumeBuffer);
        request.input('resumeFileName', sql.NVarChar, resumeFileName);
        request.input('resumeContentType', sql.NVarChar, resumeContentType);
        
        updateQuery += `, Resume = @resume, ResumeFileName = @resumeFileName, ResumeContentType = @resumeContentType`;
      }
      
      updateQuery += ` WHERE Id = @id`;
      
      await request.query(updateQuery);
      
      // Get the updated candidate
      const getRequest = new sql.Request();
      getRequest.input('id', sql.Int, id);
      const getResult = await getRequest.query('SELECT Id, Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, ResumeFileName, ResumeContentType, CreatedAt, UpdatedAt FROM Candidates WHERE Id = @id');
      
      const updatedCandidate = {
        ...getResult.recordset[0],
        Resume: getResult.recordset[0].ResumeFileName
      };
      
      res.json({
        success: true,
        message: 'Candidate updated successfully',
        data: updatedCandidate
      });
    } catch (error) {
      console.error('Update candidate error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating candidate: ' + error.message, 
        error: error.message 
      });
    }
  },

  deleteCandidate: async (req, res) => {
    try {
      console.log('=== DELETE CANDIDATE DEBUG ===');
      
      await sql.connect(dbConfig);
      const { id } = req.params;
      
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid candidate ID provided'
        });
      }
      
      const candidateId = parseInt(id);
      
      const getRequest = new sql.Request();
      getRequest.input('id', sql.Int, candidateId);
      const getResult = await getRequest.query('SELECT Id, Name FROM Candidates WHERE Id = @id');
      
      if (getResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Candidate not found' 
        });
      }
      
      const candidate = getResult.recordset[0];
      
      // Delete from database (resume is deleted automatically)
      const deleteRequest = new sql.Request();
      deleteRequest.input('id', sql.Int, candidateId);
      const deleteResult = await deleteRequest.query('DELETE FROM Candidates WHERE Id = @id');
      
      if (deleteResult.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Candidate not found or already deleted' 
        });
      }
      
      res.json({
        success: true,
        message: 'Candidate deleted successfully',
        deletedCandidate: {
          id: candidateId,
          name: candidate.Name
        }
      });
      
    } catch (error) {
      console.error('Delete candidate error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting candidate: ' + error.message, 
        error: error.message
      });
    }
  },

downloadResume: async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DOWNLOAD RESUME DEBUG ===');
    console.log('Candidate ID:', id);
    
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    
    const result = await request.query('SELECT Resume, ResumeFileName, ResumeContentType, Name FROM Candidates WHERE Id = @id');
    
    if (result.recordset.length === 0 || !result.recordset[0].Resume) {
      console.log('Resume not found for candidate ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    
    const resume = result.recordset[0].Resume;
    let fileName = result.recordset[0].ResumeFileName;
    const storedContentType = result.recordset[0].ResumeContentType;
    const candidateName = result.recordset[0].Name;
    
    // Read file signature to determine actual file type
    const firstFourBytes = resume.slice(0, 4);
    const signature = firstFourBytes.toString('hex').toUpperCase();
    
    console.log('File analysis:', {
      originalFileName: fileName,
      storedContentType: storedContentType,
      fileSignature: signature,
      fileSize: resume.length
    });
    
    // Determine actual content type and extension from file signature
    let contentType;
    let fileExtension;
    
    if (signature.startsWith('504B0304')) {
      // DOCX file (ZIP-based format)
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      fileExtension = '.docx';
      console.log('Detected: DOCX file');
    } else if (signature.startsWith('D0CF11E0')) {
      // DOC file (older Word format)
      contentType = 'application/msword';
      fileExtension = '.doc';
      console.log('Detected: DOC file');
    } else if (signature.startsWith('25504446')) {
      // PDF file
      contentType = 'application/pdf';
      fileExtension = '.pdf';
      console.log('Detected: PDF file');
    } else {
      // Fallback to stored content type
      console.warn('Unknown file signature, using stored content type');
      contentType = storedContentType || 'application/octet-stream';
      fileExtension = fileName ? ('.' + fileName.split('.').pop()) : '';
    }
    
    // Ensure filename has correct extension
    if (fileName) {
      // Remove existing extension and add correct one
      const baseFileName = fileName.replace(/\.[^.]+$/, '');
      fileName = baseFileName + fileExtension;
    } else {
      // Create filename from candidate name if missing
      fileName = `${candidateName.replace(/\s+/g, '_')}_resume${fileExtension}`;
    }
    
    console.log('Serving file:', {
      fileName: fileName,
      contentType: contentType,
      size: resume.length
    });
    
    // Set response headers - CRITICAL for correct download behavior
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Length', resume.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Send the file
    res.send(Buffer.from(resume));
    console.log('✓ File download initiated successfully');
    
  } catch (error) {
    console.error('Download resume error:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        success: false, 
        message: 'Error downloading resume', 
        error: error.message 
      });
    }
  }
},

// Add this to your candidateController.js for debugging
getDiagnostics: async (req, res) => {
  try {
    const { id } = req.params;
    await sql.connect(dbConfig);
    const request = new sql.Request();
    request.input('id', sql.Int, id);
    
    const result = await request.query(`
      SELECT 
        Id,
        Name,
        ResumeFileName,
        ResumeContentType,
        DATALENGTH(Resume) as ResumeSize,
        CONVERT(VARCHAR(MAX), CONVERT(VARBINARY(8), SUBSTRING(Resume, 1, 8)), 2) as FileSignature,
        CASE 
          WHEN CONVERT(VARBINARY(4), SUBSTRING(Resume, 1, 4)) = 0x504B0304 THEN 'DOCX/ZIP'
          WHEN CONVERT(VARBINARY(4), SUBSTRING(Resume, 1, 4)) = 0x25504446 THEN 'PDF'
          WHEN CONVERT(VARBINARY(8), SUBSTRING(Resume, 1, 8)) = 0xD0CF11E0A1B11AE1 THEN 'DOC'
          ELSE 'Unknown'
        END as DetectedType
      FROM Candidates 
      WHERE Id = @id
    `);
    
    res.json({
      success: true,
      data: result.recordset[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
},

  searchBySkills: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { skills } = req.query;
      
      if (!skills) {
        return res.status(400).json({
          success: false,
          message: 'Skills parameter is required'
        });
      }
      
      const request = new sql.Request();
      request.input('skills', sql.NVarChar, `%${skills}%`);
      
      const result = await request.query(`
        SELECT Id, Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, ResumeFileName, ResumeContentType, CreatedAt, UpdatedAt
        FROM Candidates 
        WHERE Skills LIKE @skills 
        ORDER BY Experience DESC
      `);
      
      const candidates = result.recordset.map(candidate => ({
        ...candidate,
        Resume: candidate.ResumeFileName
      }));
      
      res.json({
        success: true,
        data: candidates,
        count: candidates.length
      });
    } catch (error) {
      console.error('Search by skills error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error searching candidates', 
        error: error.message 
      });
    }
  },

  getAvailableCandidates: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      
      const request = new sql.Request();
      request.input('status', sql.NVarChar, 'Available');
      
      const result = await request.query(`
        SELECT Id, Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, ResumeFileName, ResumeContentType, CreatedAt, UpdatedAt
        FROM Candidates 
        WHERE Status = @status 
        ORDER BY CreatedAt DESC
      `);
      
      const candidates = result.recordset.map(candidate => ({
        ...candidate,
        Resume: candidate.ResumeFileName
      }));
      
      res.json({
        success: true,
        data: candidates,
        count: candidates.length
      });
    } catch (error) {
      console.error('Get available candidates error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving available candidates', 
        error: error.message 
      });
    }
  },

  getCandidatesByPriority: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { priority } = req.params;
      
      if (!['High', 'Medium', 'Low'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority. Must be High, Medium, or Low'
        });
      }
      
      const priorityValue = getPriorityValue(priority);
      
      const request = new sql.Request();
      request.input('priority', sql.Int, priorityValue);
      
      const result = await request.query(`
        SELECT Id, Name, Email, Phone, Skills, Experience, Location, Priority, VisaStatus, Status, ResumeFileName, ResumeContentType, CreatedAt, UpdatedAt
        FROM Candidates 
        WHERE Priority = @priority 
        ORDER BY CreatedAt DESC
      `);
      
      const candidates = result.recordset.map(candidate => ({
        ...candidate,
        Resume: candidate.ResumeFileName
      }));
      
      res.json({
        success: true,
        data: candidates,
        count: candidates.length
      });
    } catch (error) {
      console.error('Get candidates by priority error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving candidates by priority', 
        error: error.message 
      });
    }
  }
};

module.exports = candidateController;