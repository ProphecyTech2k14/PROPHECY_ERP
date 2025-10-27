// const { poolPromise, sql } = require("../../config/db");
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, '../../uploads/timesheets');
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, 'external-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       '.pdf', '.xlsx', '.xls', '.csv', '.doc', '.docx', 
//       '.txt', '.jpg', '.jpeg', '.png', '.zip', '.rar'
//     ];
//     const fileExtension = path.extname(file.originalname).toLowerCase();
    
//     if (allowedTypes.includes(fileExtension)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only PDF, Excel, CSV, Word, Images, ZIP files are allowed.'));
//     }
//   }
// });

// // Get all timesheets for a user
// exports.getUserTimesheets = async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;
//     const { type, month, year, status } = req.query;

// let query = `
//   SELECT 
//     t.*,
//     u.username as userName,
//     a.username as approverName
//   FROM Timesheets t
//   LEFT JOIN userinfo u ON t.userId = u.id
//   LEFT JOIN userinfo a ON t.approvedBy = a.id
//   WHERE t.userId = @userId
// `;
//     const request = pool.request()
//       .input("userId", sql.Int, userId);

//     if (type) {
//       query += ` AND t.type = @type`;
//       request.input("type", sql.NVarChar, type);
//     }

//     if (month) {
//       query += ` AND t.month = @month`;
//       request.input("month", sql.Int, month);
//     }

//     if (year) {
//       query += ` AND t.year = @year`;
//       request.input("year", sql.Int, year);
//     }

//     if (status) {
//       query += ` AND t.status = @status`;
//       request.input("status", sql.NVarChar, status);
//     }

//     query += ` ORDER BY t.year DESC, t.month DESC, t.createdAt DESC`;

//     const result = await request.query(query);
//     res.status(200).json(result.recordset);
//   } catch (error) {
//     console.error("Error fetching timesheets:", error);
//     res.status(500).json({ message: "Server error while fetching timesheets", error });
//   }
// };

// // Get timesheet by ID
// exports.getTimesheetById = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get timesheet basic info
//   const timesheetResult = await pool.request()
//   .input("id", sql.Int, timesheetId)
//   .input("userId", sql.Int, userId)
//   .query(`
//     SELECT 
//       t.*,
//       u.username as userName,
//       a.username as approverName
//     FROM Timesheets t
//     LEFT JOIN userinfo u ON t.userId = u.id
//     LEFT JOIN userinfo a ON t.approvedBy = a.id
//     WHERE t.id = @id AND (t.userId = @userId OR @userId IN (SELECT id FROM userinfo WHERE role IN ('admin', 'manager')))
//   `);


//     if (timesheetResult.recordset.length === 0) {
//       return res.status(404).json({ message: "Timesheet not found" });
//     }

//     const timesheet = timesheetResult.recordset[0];

//     // Get timesheet entries if it's an internal timesheet
//     if (timesheet.type === 'internal') {
//       const entriesResult = await pool.request()
//         .input("timesheetId", sql.Int, timesheetId)
//         .query(`
//           SELECT * FROM TimesheetEntries 
//           WHERE timesheetId = @timesheetId 
//           ORDER BY date
//         `);

//       timesheet.entries = entriesResult.recordset;
//     }

//     // Get external timesheet info if it's external
//     if (timesheet.type === 'external') {
//       const externalResult = await pool.request()
//         .input("timesheetId", sql.Int, timesheetId)
//         .query(`
//           SELECT * FROM ExternalTimesheets 
//           WHERE timesheetId = @timesheetId
//         `);

//       timesheet.externalInfo = externalResult.recordset[0] || null;
//     }

//     res.status(200).json(timesheet);
//   } catch (error) {
//     console.error("Error fetching timesheet:", error);
//     res.status(500).json({ message: "Server error while fetching timesheet", error });
//   }
// };

// // Create/Update Internal Timesheet
// exports.saveInternalTimesheet = async (req, res) => {
//   const { month, year, entries, notes } = req.body;
  
//   console.log('=== SAVE TIMESHEET REQUEST ===');
//   console.log('Month:', month, 'Year:', year);
//   console.log('Authenticated user ID:', req.user.id); // ADD THIS LINE
//   console.log('Entries count:', entries?.length);
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // FIRST: Verify the user exists
//    const userCheck = await pool.request()
//   .input("userId", sql.Int, userId)
//   .query(`SELECT id FROM userinfo WHERE id = @userId`);

//     console.log('User check result:', userCheck.recordset); // ADD THIS

//     if (userCheck.recordset.length === 0) {
//       return res.status(404).json({ 
//         message: "User not found in database",
//         authenticatedUserId: userId 
//       });
//     }

 

//     // Validate inputs
//     if (!month || !year || !entries || !Array.isArray(entries)) {
//       return res.status(400).json({ 
//         message: "Invalid request data",
//         details: {
//           month: month || 'missing',
//           year: year || 'missing',
//           entriesType: Array.isArray(entries) ? 'array' : typeof entries
//         }
//       });
//     }

//     // Calculate total hours
//     const totalHours = entries.reduce((sum, entry) => {
//       const hours = parseFloat(entry.hours) || 0;
//       return sum + hours;
//     }, 0);

//     console.log('Total hours calculated:', totalHours);

//     // Check if timesheet already exists for this month/year
//     const existingTimesheet = await pool.request()
//       .input("userId", sql.Int, userId)
//       .input("month", sql.Int, month)
//       .input("year", sql.Int, year)
//       .input("type", sql.NVarChar, 'internal')
//       .query(`
//         SELECT id FROM Timesheets 
//         WHERE userId = @userId AND month = @month AND year = @year AND type = @type
//       `);

//     let timesheetId;

//     if (existingTimesheet.recordset.length > 0) {
//       // Update existing timesheet
//       timesheetId = existingTimesheet.recordset[0].id;
//       console.log('Updating existing timesheet:', timesheetId);
      
//       await pool.request()
//         .input("id", sql.Int, timesheetId)
//         .input("totalHours", sql.Decimal(10, 2), totalHours)
//         .input("notes", sql.NVarChar, notes || null)
//         .query(`
//           UPDATE Timesheets 
//           SET totalHours = @totalHours, notes = @notes, updatedAt = GETDATE()
//           WHERE id = @id
//         `);

//       // Delete existing entries
//       await pool.request()
//         .input("timesheetId", sql.Int, timesheetId)
//         .query(`DELETE FROM TimesheetEntries WHERE timesheetId = @timesheetId`);
//     } else {
//       // Create new timesheet
//       console.log('Creating new timesheet');
//       const result = await pool.request()
//         .input("userId", sql.Int, userId)
//         .input("type", sql.NVarChar, 'internal')
//         .input("month", sql.Int, month)
//         .input("year", sql.Int, year)
//         .input("totalHours", sql.Decimal(10, 2), totalHours)
//         .input("notes", sql.NVarChar, notes || null)
//         .query(`
//           INSERT INTO Timesheets (userId, type, month, year, totalHours, notes)
//           VALUES (@userId, @type, @month, @year, @totalHours, @notes);
//           SELECT SCOPE_IDENTITY() AS newId;
//         `);

//       timesheetId = result.recordset[0].newId;
//       console.log('Created new timesheet with ID:', timesheetId);
//     }

//     // Insert new entries
//     let successCount = 0;
//     let errorCount = 0;

//    // In saveInternalTimesheet function, replace the entries loop with:
// for (let i = 0; i < entries.length; i++) {
//   const entry = entries[i];
  
//   try {
//     // Create date properly - ensure we're using the correct day
//     const day = parseInt(entry.date);
//     if (isNaN(day) || day < 1 || day > 31) {
//       console.error(`Invalid day at index ${i}:`, entry.date);
//       errorCount++;
//       continue;
//     }

//     // Create date in UTC to avoid timezone issues
//     const entryDate = new Date(Date.UTC(year, month - 1, day));
    
//     // Validate date - check if the date is valid and in the correct month
//     if (isNaN(entryDate.getTime()) || entryDate.getUTCMonth() !== month - 1 || entryDate.getUTCDate() !== day) {
//       console.error(`Invalid date at index ${i}:`, { year, month, day: entry.date });
//       errorCount++;
//       continue;
//     }

//     // Format as YYYY-MM-DD in UTC
//     const formattedDate = entryDate.toISOString().split('T')[0];
    
//     console.log(`Inserting entry: Date=${formattedDate}, Day=${day}, Hours=${entry.hours}, Type=${entry.dayType}`);
    
//     await pool.request()
//       .input("timesheetId", sql.Int, timesheetId)
//       .input("date", sql.Date, formattedDate)
//       .input("hours", sql.Decimal(5, 2), parseFloat(entry.hours) || 0)
//       .input("dayType", sql.NVarChar, entry.dayType || 'regular')
//       .input("project", sql.NVarChar, entry.project || null)
//       .input("task", sql.NVarChar, entry.task || null)
//       .input("description", sql.NVarChar, entry.description || null)
//       .query(`
//         INSERT INTO TimesheetEntries (timesheetId, date, hours, dayType, project, task, description)
//         VALUES (@timesheetId, @date, @hours, @dayType, @project, @task, @description)
//       `);
    
//     successCount++;
//   } catch (entryError) {
//     console.error(`Error inserting entry ${i}:`, entryError.message);
//     console.error('Entry data:', entry);
//     errorCount++;
//   }
// }
//     console.log(`Entries processed: ${successCount} success, ${errorCount} errors`);

//     res.status(200).json({ 
//       message: "Timesheet saved successfully", 
//       timesheetId: timesheetId,
//       stats: {
//         totalEntries: entries.length,
//         successCount,
//         errorCount
//       }
//     });
//   } catch (error) {
//     console.error("=== ERROR SAVING TIMESHEET ===");
//     console.error("Error message:", error.message);
//     console.error("Error stack:", error.stack);
//     console.error("Request body:", { month, year, entriesCount: entries?.length });
    
//     res.status(500).json({ 
//       message: "Server error while saving timesheet", 
//       error: error.message,
//       details: process.env.NODE_ENV === 'development' ? {
//         stack: error.stack,
//         requestData: { month, year, entriesCount: entries?.length }
//       } : undefined
//     });
//   }
// };


// // Submit Timesheet for Approval
// exports.submitTimesheet = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Verify timesheet belongs to user
//     const timesheetCheck = await pool.request()
//       .input("id", sql.Int, timesheetId)
//       .input("userId", sql.Int, userId)
//       .query(`SELECT id, status FROM Timesheets WHERE id = @id AND userId = @userId`);

//     if (timesheetCheck.recordset.length === 0) {
//       return res.status(404).json({ message: "Timesheet not found" });
//     }

//     if (timesheetCheck.recordset[0].status !== 'draft') {
//       return res.status(400).json({ message: "Timesheet is already submitted" });
//     }

//     await pool.request()
//       .input("id", sql.Int, timesheetId)
//       .query(`
//         UPDATE Timesheets 
//         SET status = 'submitted', submittedAt = GETDATE(), updatedAt = GETDATE()
//         WHERE id = @id
//       `);

//     res.status(200).json({ message: "Timesheet submitted for approval" });
//   } catch (error) {
//     console.error("Error submitting timesheet:", error);
//     res.status(500).json({ message: "Server error while submitting timesheet", error: error.message });
//   }
// };

// // Upload External Timesheet
// exports.uploadExternalTimesheet = async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;
//     const { clientName, projectName, periodStart, periodEnd, notes } = req.body;
    
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const file = req.file;
//     const month = new Date().getMonth() + 1;
//     const year = new Date().getFullYear();

//     // Create timesheet record
//     const timesheetResult = await pool.request()
//       .input("userId", sql.Int, userId)
//       .input("type", sql.NVarChar, 'external')
//       .input("month", sql.Int, month)
//       .input("year", sql.Int, year)
//       .input("notes", sql.NVarChar, notes || null)
//       .query(`
//         INSERT INTO Timesheets (userId, type, month, year, notes, status)
//         VALUES (@userId, @type, @month, @year, @notes, 'submitted');
//         SELECT SCOPE_IDENTITY() AS newId;
//       `);

//     const timesheetId = timesheetResult.recordset[0].newId;

//     // Create external timesheet record
//     await pool.request()
//       .input("timesheetId", sql.Int, timesheetId)
//       .input("fileName", sql.NVarChar, file.originalname)
//       .input("filePath", sql.NVarChar, file.path)
//       .input("fileSize", sql.Int, file.size)
//       .input("mimeType", sql.NVarChar, file.mimetype)
//       .input("clientName", sql.NVarChar, clientName || null)
//       .input("projectName", sql.NVarChar, projectName || null)
//       .input("periodStart", sql.Date, periodStart ? new Date(periodStart) : null)
//       .input("periodEnd", sql.Date, periodEnd ? new Date(periodEnd) : null)
//       .query(`
//         INSERT INTO ExternalTimesheets 
//         (timesheetId, fileName, filePath, fileSize, mimeType, clientName, projectName, periodStart, periodEnd)
//         VALUES (@timesheetId, @fileName, @filePath, @fileSize, @mimeType, @clientName, @projectName, @periodStart, @periodEnd)
//       `);

//     res.status(201).json({ 
//       message: "External timesheet uploaded successfully",
//       timesheetId: timesheetId,
//       fileName: file.originalname
//     });
//   } catch (error) {
//     console.error("Error uploading external timesheet:", error);
//     res.status(500).json({ message: "Server error while uploading timesheet", error: error.message });
//   }
// };

// // Get timesheet upload history
// exports.getUploadHistory = async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     const result = await pool.request()
//       .input("userId", sql.Int, userId)
//       .query(`
//         SELECT 
//           t.id,
//           t.type,
//           t.month,
//           t.year,
//           t.status,
//           t.totalHours,
//           t.createdAt,
//           t.submittedAt,
//           et.fileName,
//           et.fileSize,
//           et.uploadedAt,
//           et.clientName,
//           et.projectName
//         FROM Timesheets t
//         LEFT JOIN ExternalTimesheets et ON t.id = et.timesheetId
//         WHERE t.userId = @userId AND t.type = 'external'
//         ORDER BY t.createdAt DESC
//       `);

//     res.status(200).json(result.recordset);
//   } catch (error) {
//     console.error("Error fetching upload history:", error);
//     res.status(500).json({ message: "Server error while fetching history", error });
//   }
// };

// // Export timesheet to CSV
// // Export timesheet to CSV - CORRECTED VERSION
// exports.exportTimesheet = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get timesheet data - only select fields that exist
//     const timesheetResult = await pool.request()
//       .input("id", sql.Int, timesheetId)
//       .input("userId", sql.Int, userId)
//       .query(`
//         SELECT 
//           t.*, 
//           u.username
//         FROM Timesheets t
//         JOIN userinfo u ON t.userId = u.id
//         WHERE t.id = @id AND t.userId = @userId
//       `);

//     if (timesheetResult.recordset.length === 0) {
//       return res.status(404).json({ message: "Timesheet not found" });
//     }

//     const timesheet = timesheetResult.recordset[0];

//     // Get entries
//     const entriesResult = await pool.request()
//       .input("timesheetId", sql.Int, timesheetId)
//       .query(`
//         SELECT 
//           date, 
//           hours, 
//           dayType, 
//           project, 
//           task, 
//           description
//         FROM TimesheetEntries
//         WHERE timesheetId = @timesheetId
//         ORDER BY date
//       `);

//     // Helper function to format date as DD-MMM-YYYY (shorter, Excel-friendly)
//  // Helper function to format date as DD-MMM-YYYY (shorter, Excel-friendly)
// const formatDate = (date) => {
//   const d = new Date(date);
//   // Use UTC methods to avoid timezone shifts
//   const day = String(d.getUTCDate()).padStart(2, '0');
//   const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
//                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//   const month = monthNames[d.getUTCMonth()];
//   const year = d.getUTCFullYear();
//   return `${day}-${month}-${year}`; // Format: 01-Oct-2025
// };

// // Helper function to get day name
// const getDayName = (date) => {
//   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//   return days[new Date(date).getUTCDay()];
// };

//     // Helper function to escape CSV values
//     const escapeCSV = (value) => {
//       if (value === null || value === undefined) return '';
//       const stringValue = String(value);
//       if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
//         return `"${stringValue.replace(/"/g, '""')}"`;
//       }
//       return stringValue;
//     };

//     // Get month name
//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     const monthName = monthNames[timesheet.month - 1];

//     // Build CSV content with proper formatting
//     let csvContent = '';
    
//     // Header section
//     csvContent += `TIMESHEET REPORT\n`;
//     csvContent += `\n`;
//     csvContent += `Employee:,${escapeCSV(timesheet.username)}\n`;
//     csvContent += `Period:,${monthName} ${timesheet.year}\n`;
//     csvContent += `Status:,${escapeCSV(timesheet.status || 'Draft')}\n`;
//     csvContent += `Total Hours:,${timesheet.totalHours || 0}\n`;
//     csvContent += `\n`;
    
//     // Column headers
//     csvContent += `Date,Day,Hours,Type,Project,Task,Description\n`;
    
//     // Data rows
//     entriesResult.recordset.forEach(entry => {
//       const date = formatDate(entry.date);
//       const dayName = getDayName(entry.date);
//       const hours = entry.hours || 0;
//       const type = entry.dayType || 'Regular';
//       const project = escapeCSV(entry.project || 'N/A');
//       const task = escapeCSV(entry.task || 'N/A');
//       const description = escapeCSV(entry.description || '');
      
//       csvContent += `${date},${dayName},${hours},${type},${project},${task},${description}\n`;
//     });

//     // Summary section
//     csvContent += `\n`;
//     csvContent += `SUMMARY\n`;
//     csvContent += `Total Working Days:,${entriesResult.recordset.filter(e => e.dayType === 'regular').length}\n`;
//     csvContent += `Total Leave Days:,${entriesResult.recordset.filter(e => e.dayType === 'leave').length}\n`;
//     csvContent += `Total Holidays:,${entriesResult.recordset.filter(e => e.dayType === 'holiday').length}\n`;
//     csvContent += `Total Hours:,${timesheet.totalHours || 0}\n`;
    
//     if (timesheet.notes) {
//       csvContent += `\n`;
//       csvContent += `Notes:,${escapeCSV(timesheet.notes)}\n`;
//     }

//     // Set headers for file download
//     res.setHeader('Content-Type', 'text/csv; charset=utf-8');
//     res.setHeader('Content-Disposition', `attachment; filename="Timesheet_${timesheet.username}_${monthName}_${timesheet.year}.csv"`);
    
//     // Add BOM for proper Excel UTF-8 handling
//     res.send('\uFEFF' + csvContent);
    
//   } catch (error) {
//     console.error("Error exporting timesheet:", error);
//     console.error("Error stack:", error.stack);
//     res.status(500).json({ 
//       message: "Server error while exporting timesheet", 
//       error: error.message 
//     });
//   }
// };




// // Delete external timesheet
// exports.deleteExternalTimesheet = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Verify timesheet belongs to user
//     const timesheetCheck = await pool.request()
//       .input("id", sql.Int, timesheetId)
//       .input("userId", sql.Int, userId)
//       .query(`
//         SELECT t.id, et.filePath 
//         FROM Timesheets t
//         LEFT JOIN ExternalTimesheets et ON t.id = et.timesheetId
//         WHERE t.id = @id AND t.userId = @userId AND t.type = 'external'
//       `);

//     if (timesheetCheck.recordset.length === 0) {
//       return res.status(404).json({ message: "Timesheet not found" });
//     }

//     const timesheet = timesheetCheck.recordset[0];

//     // Delete file from filesystem if exists
//     if (timesheet.filePath && fs.existsSync(timesheet.filePath)) {
//       fs.unlinkSync(timesheet.filePath);
//     }

//     // Delete from ExternalTimesheets table
//     await pool.request()
//       .input("timesheetId", sql.Int, timesheetId)
//       .query(`DELETE FROM ExternalTimesheets WHERE timesheetId = @timesheetId`);

//     // Delete from Timesheets table
//     await pool.request()
//       .input("id", sql.Int, timesheetId)
//       .query(`DELETE FROM Timesheets WHERE id = @id`);

//     res.status(200).json({ message: "Timesheet deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting timesheet:", error);
//     res.status(500).json({ message: "Server error while deleting timesheet", error: error.message });
//   }
// };

// // Download external timesheet file
// exports.downloadExternalTimesheet = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get file info
//     const result = await pool.request()
//       .input("timesheetId", sql.Int, timesheetId)
//       .input("userId", sql.Int, userId)
//       .query(`
//         SELECT et.fileName, et.filePath, t.userId
//         FROM ExternalTimesheets et
//         JOIN Timesheets t ON et.timesheetId = t.id
//         WHERE et.timesheetId = @timesheetId AND t.userId = @userId
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({ message: "File not found" });
//     }

//     const fileInfo = result.recordset[0];
//     const filePath = fileInfo.filePath;

//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ message: "File not found on server" });
//     }

//     res.download(filePath, fileInfo.fileName);
//   } catch (error) {
//     console.error("Error downloading file:", error);
//     res.status(500).json({ message: "Server error while downloading file", error: error.message });
//   }
// };

// // Middleware for file upload
// exports.uploadMiddleware = upload.single('timesheetFile');



// const { poolPromise, sql } = require("../../config/db");
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, '../../uploads/timesheets');
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, 'external-' + uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       '.pdf', '.xlsx', '.xls', '.csv', '.doc', '.docx', 
//       '.txt', '.jpg', '.jpeg', '.png', '.zip', '.rar'
//     ];
//     const fileExtension = path.extname(file.originalname).toLowerCase();
    
//     if (allowedTypes.includes(fileExtension)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only PDF, Excel, CSV, Word, Images, ZIP files are allowed.'));
//     }
//   }
// });

// // Helper function to get employee table based on company ID
// const getEmployeeTable = (companyId) => {
//   const tableMap = {
//     1: 'CognifyarEmployees',
//     2: 'ProphecyOffshoreEmployees', 
//     3: 'ProphecyConsultingEmployees'
//   };
//   return tableMap[parseInt(companyId)] || 'CognifyarEmployees';
// };

// // FIXED: Get employee and company info from EmployeeId
// const getEmployeeInfo = async (pool, employeeId) => {
//   // Search across all employee tables to find the employee and their company
//   const tables = [
//     { id: 1, name: 'CognifyarEmployees' },
//     { id: 2, name: 'ProphecyOffshoreEmployees' },
//     { id: 3, name: 'ProphecyConsultingEmployees' }
//   ];

//   for (const table of tables) {
//     try {
//       const result = await pool.request()
//         .input('employeeId', sql.NVarChar, employeeId)
//         .query(`
//           SELECT 
//             Id,
//             EmployeeId,
//             Name,
//             Email,
//             Department,
//             Position
//           FROM ${table.name}
//           WHERE EmployeeId = @employeeId
//         `);

//       if (result.recordset.length > 0) {
//         return {
//           ...result.recordset[0],
//           CompanyId: table.id,
//           CompanyTable: table.name
//         };
//       }
//     } catch (error) {
//       console.error(`Error searching in ${table.name}:`, error);
//     }
//   }

//   return null;
// };

// // Get all timesheets for a user
// exports.getUserTimesheets = async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;
//     const { type, month, year, status } = req.query;

//     // Get user's employee ID from userinfo
//     const userResult = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userEmployeeId = userResult.recordset[0].EmployeeId;

//     if (!userEmployeeId) {
//       return res.status(400).json({ 
//         message: 'Employee ID not set for this user. Please contact administrator.' 
//       });
//     }

//     let query = `
//       SELECT 
//         t.*,
//         u.username as userName,
//         a.username as approverName
//       FROM Timesheets t
//       LEFT JOIN userinfo u ON t.EmployeeId = u.EmployeeId
//       LEFT JOIN userinfo a ON t.ApprovedBy = a.id
//       WHERE t.EmployeeId = @employeeId
//     `;
    
//     const request = pool.request()
//       .input("employeeId", sql.NVarChar, userEmployeeId);

//     if (type) {
//       query += ` AND t.Type = @type`;
//       request.input("type", sql.NVarChar, type);
//     }

//     if (month) {
//       query += ` AND t.Month = @month`;
//       request.input("month", sql.Int, parseInt(month));
//     }

//     if (year) {
//       query += ` AND t.Year = @year`;
//       request.input("year", sql.Int, parseInt(year));
//     }

//     if (status) {
//       query += ` AND t.Status = @status`;
//       request.input("status", sql.NVarChar, status);
//     }

//     query += ` ORDER BY t.Year DESC, t.Month DESC, t.CreatedAt DESC`;

//     const result = await request.query(query);
//     res.status(200).json(result.recordset);
//   } catch (error) {
//     console.error("Error fetching timesheets:", error);
//     res.status(500).json({ message: "Server error while fetching timesheets", error: error.message });
//   }
// };

// // Get timesheet by ID
// exports.getTimesheetById = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get user's employee ID
//     const userResult = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userEmployeeId = userResult.recordset[0].EmployeeId;

//     // Get timesheet basic info
//     const timesheetResult = await pool.request()
//       .input("id", sql.Int, parseInt(timesheetId))
//       .input("employeeId", sql.NVarChar, userEmployeeId)
//       .query(`
//         SELECT 
//           t.*,
//           u.username as userName,
//           a.username as approverName
//         FROM Timesheets t
//         LEFT JOIN userinfo u ON t.EmployeeId = u.EmployeeId
//         LEFT JOIN userinfo a ON t.ApprovedBy = a.id
//         WHERE t.Id = @id AND t.EmployeeId = @employeeId
//       `);

//     if (timesheetResult.recordset.length === 0) {
//       return res.status(404).json({ message: "Timesheet not found" });
//     }

//     const timesheet = timesheetResult.recordset[0];

//     // Get timesheet entries
//     const entriesResult = await pool.request()
//       .input("timesheetId", sql.Int, parseInt(timesheetId))
//       .query(`
//         SELECT * FROM TimesheetEntries 
//         WHERE TimesheetId = @timesheetId 
//         ORDER BY Date
//       `);

//     timesheet.entries = entriesResult.recordset;

//     res.status(200).json(timesheet);
//   } catch (error) {
//     console.error("Error fetching timesheet:", error);
//     res.status(500).json({ message: "Server error while fetching timesheet", error: error.message });
//   }
// };

// // FIXED: Save Internal Timesheet with Company tracking
// exports.saveInternalTimesheet = async (req, res) => {
//   const { month, year, entries, notes } = req.body;
  
//   console.log('=== SAVE TIMESHEET REQUEST ===');
//   console.log('Month:', month, 'Year:', year);
//   console.log('Authenticated user ID:', req.user.id);
//   console.log('Entries count:', entries?.length);
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get user's employee ID
//     const userResult = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ 
//         message: "User not found in database",
//         authenticatedUserId: userId 
//       });
//     }

//     const userEmployeeId = userResult.recordset[0].EmployeeId;

//     if (!userEmployeeId) {
//       return res.status(400).json({ 
//         message: "Employee ID not set for this user. Please contact administrator." 
//       });
//     }

//     // Get employee info and company
//     const employeeInfo = await getEmployeeInfo(pool, userEmployeeId);
    
//     if (!employeeInfo) {
//       return res.status(404).json({ 
//         message: "Employee not found in any company",
//         employeeId: userEmployeeId 
//       });
//     }

//     console.log('Employee found:', employeeInfo);

//     // Validate inputs
//     if (!month || !year || !entries || !Array.isArray(entries)) {
//       return res.status(400).json({ 
//         message: "Invalid request data",
//         details: {
//           month: month || 'missing',
//           year: year || 'missing',
//           entriesType: Array.isArray(entries) ? 'array' : typeof entries
//         }
//       });
//     }

//     // Calculate total hours
//     const totalHours = entries.reduce((sum, entry) => {
//       const hours = parseFloat(entry.hours) || 0;
//       return sum + hours;
//     }, 0);

//     console.log('Total hours calculated:', totalHours);

//     // Calculate period dates
//     const periodStart = new Date(year, month - 1, 1);
//     const periodEnd = new Date(year, month, 0);

//     // Check if timesheet already exists for this month/year
//     const existingTimesheet = await pool.request()
//       .input("employeeId", sql.NVarChar, userEmployeeId)
//       .input("month", sql.Int, parseInt(month))
//       .input("year", sql.Int, parseInt(year))
//       .query(`
//         SELECT Id FROM Timesheets 
//         WHERE EmployeeId = @employeeId AND Month = @month AND Year = @year
//       `);

//     let timesheetId;

//     if (existingTimesheet.recordset.length > 0) {
//       // Update existing timesheet
//       timesheetId = existingTimesheet.recordset[0].Id;
//       console.log('Updating existing timesheet:', timesheetId);
      
//       await pool.request()
//         .input("id", sql.Int, timesheetId)
//         .input("totalHours", sql.Decimal(10, 2), totalHours)
//         .input("notes", sql.NVarChar, notes || null)
//         .query(`
//           UPDATE Timesheets 
//           SET TotalHours = @totalHours, 
//               Notes = @notes, 
//               UpdatedAt = GETDATE(),
//               Status = 'draft'
//           WHERE Id = @id
//         `);

//       // Delete existing entries
//       await pool.request()
//         .input("timesheetId", sql.Int, timesheetId)
//         .query(`DELETE FROM TimesheetEntries WHERE TimesheetId = @timesheetId`);
//     } else {
//       // Create new timesheet - INCLUDE COMPANY ID
//       console.log('Creating new timesheet');
//       const result = await pool.request()
//         .input("employeeId", sql.NVarChar, userEmployeeId)
//         .input("companyId", sql.Int, employeeInfo.CompanyId)
//         .input("month", sql.Int, parseInt(month))
//         .input("year", sql.Int, parseInt(year))
//         .input("periodStart", sql.Date, periodStart)
//         .input("periodEnd", sql.Date, periodEnd)
//         .input("totalHours", sql.Decimal(10, 2), totalHours)
//         .input("notes", sql.NVarChar, notes || null)
//         .input("status", sql.NVarChar, 'draft')
//         .query(`
//           INSERT INTO Timesheets (
//             EmployeeId, 
//             CompanyId,
//             Month, 
//             Year, 
//             PeriodStart,
//             PeriodEnd,
//             TotalHours, 
//             Notes,
//             Status,
//             CreatedAt,
//             UpdatedAt
//           )
//           VALUES (
//             @employeeId, 
//             @companyId,
//             @month, 
//             @year, 
//             @periodStart,
//             @periodEnd,
//             @totalHours, 
//             @notes,
//             @status,
//             GETDATE(),
//             GETDATE()
//           );
//           SELECT SCOPE_IDENTITY() AS newId;
//         `);

//       timesheetId = result.recordset[0].newId;
//       console.log('Created new timesheet with ID:', timesheetId);
//     }

//     // Insert new entries
//     let successCount = 0;
//     let errorCount = 0;

//     for (let i = 0; i < entries.length; i++) {
//       const entry = entries[i];
      
//       try {
//         const day = parseInt(entry.date);
//         if (isNaN(day) || day < 1 || day > 31) {
//           console.error(`Invalid day at index ${i}:`, entry.date);
//           errorCount++;
//           continue;
//         }

//         const entryDate = new Date(Date.UTC(year, month - 1, day));
        
//         if (isNaN(entryDate.getTime()) || entryDate.getUTCMonth() !== month - 1 || entryDate.getUTCDate() !== day) {
//           console.error(`Invalid date at index ${i}:`, { year, month, day: entry.date });
//           errorCount++;
//           continue;
//         }

//         const formattedDate = entryDate.toISOString().split('T')[0];
        
//         await pool.request()
//           .input("timesheetId", sql.Int, timesheetId)
//           .input("date", sql.Date, formattedDate)
//           .input("hours", sql.Decimal(5, 2), parseFloat(entry.hours) || 0)
//           .input("dayType", sql.NVarChar, entry.dayType || 'regular')
//           .input("project", sql.NVarChar, entry.project || null)
//           .input("task", sql.NVarChar, entry.task || null)
//           .input("description", sql.NVarChar, entry.description || null)
//           .query(`
//             INSERT INTO TimesheetEntries (
//               TimesheetId, 
//               Date, 
//               Hours, 
//               DayType, 
//               Project, 
//               Task, 
//               Description
//             )
//             VALUES (
//               @timesheetId, 
//               @date, 
//               @hours, 
//               @dayType, 
//               @project, 
//               @task, 
//               @description
//             )
//           `);
        
//         successCount++;
//       } catch (entryError) {
//         console.error(`Error inserting entry ${i}:`, entryError.message);
//         errorCount++;
//       }
//     }

//     console.log(`Entries processed: ${successCount} success, ${errorCount} errors`);

//     res.status(200).json({ 
//       message: "Timesheet saved successfully", 
//       timesheetId: timesheetId,
//       companyId: employeeInfo.CompanyId,
//       stats: {
//         totalEntries: entries.length,
//         successCount,
//         errorCount
//       }
//     });
//   } catch (error) {
//     console.error("=== ERROR SAVING TIMESHEET ===");
//     console.error("Error message:", error.message);
//     console.error("Error stack:", error.stack);
    
//     res.status(500).json({ 
//       message: "Server error while saving timesheet", 
//       error: error.message
//     });
//   }
// };

// // FIXED: Submit Timesheet for Approval
// exports.submitTimesheet = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get user's employee ID
//     const userResult = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userEmployeeId = userResult.recordset[0].EmployeeId;

//     // Verify timesheet belongs to user
//     const timesheetCheck = await pool.request()
//       .input("id", sql.Int, parseInt(timesheetId))
//       .input("employeeId", sql.NVarChar, userEmployeeId)
//       .query(`
//         SELECT Id, Status, CompanyId 
//         FROM Timesheets 
//         WHERE Id = @id AND EmployeeId = @employeeId
//       `);

//     if (timesheetCheck.recordset.length === 0) {
//       return res.status(404).json({ message: "Timesheet not found" });
//     }

//     const timesheet = timesheetCheck.recordset[0];

//     if (timesheet.Status !== 'draft') {
//       return res.status(400).json({ message: "Timesheet is already submitted" });
//     }

//     await pool.request()
//       .input("id", sql.Int, parseInt(timesheetId))
//       .query(`
//         UPDATE Timesheets 
//         SET Status = 'Pending', 
//             SubmittedDate = GETDATE(), 
//             UpdatedAt = GETDATE()
//         WHERE Id = @id
//       `);

//     res.status(200).json({ 
//       message: "Timesheet submitted for approval",
//       companyId: timesheet.CompanyId
//     });
//   } catch (error) {
//     console.error("Error submitting timesheet:", error);
//     res.status(500).json({ message: "Server error while submitting timesheet", error: error.message });
//   }
// };

// // FIXED: Upload External Timesheet
// exports.uploadExternalTimesheet = async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;
//     const { clientName, projectName, periodStart, periodEnd, notes } = req.body;
    
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     // Get user's employee ID
//     const userResult = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userEmployeeId = userResult.recordset[0].EmployeeId;

//     if (!userEmployeeId) {
//       return res.status(400).json({ 
//         message: "Employee ID not set for this user. Please contact administrator." 
//       });
//     }

//     // Get employee info and company
//     const employeeInfo = await getEmployeeInfo(pool, userEmployeeId);
    
//     if (!employeeInfo) {
//       return res.status(404).json({ message: "Employee not found in any company" });
//     }

//     const file = req.file;
//     const currentDate = new Date();
//     const month = currentDate.getMonth() + 1;
//     const year = currentDate.getFullYear();

//     // Insert into ExternalTimesheetFiles table
//     const result = await pool.request()
//       .input("employeeId", sql.NVarChar, userEmployeeId)
//       .input("companyId", sql.Int, employeeInfo.CompanyId)
//       .input("fileName", sql.NVarChar, file.originalname)
//       .input("filePath", sql.NVarChar, file.path)
//       .input("fileSize", sql.Int, file.size)
//       .input("mimeType", sql.NVarChar, file.mimetype)
//       .input("clientName", sql.NVarChar, clientName || null)
//       .input("projectName", sql.NVarChar, projectName || null)
//       .input("periodStart", sql.Date, periodStart ? new Date(periodStart) : null)
//       .input("periodEnd", sql.Date, periodEnd ? new Date(periodEnd) : null)
//       .input("period", sql.NVarChar, `${month}/${year}`)
//       .input("status", sql.NVarChar, 'Pending')
//       .query(`
//         INSERT INTO ExternalTimesheetFiles (
//           EmployeeId,
//           CompanyId,
//           FileName,
//           FilePath,
//           FileSize,
//           MimeType,
//           ClientName,
//           ProjectName,
//           PeriodStart,
//           PeriodEnd,
//           Period,
//           Status,
//           UploadDate
//         )
//         VALUES (
//           @employeeId,
//           @companyId,
//           @fileName,
//           @filePath,
//           @fileSize,
//           @mimeType,
//           @clientName,
//           @projectName,
//           @periodStart,
//           @periodEnd,
//           @period,
//           @status,
//           GETDATE()
//         );
//         SELECT SCOPE_IDENTITY() AS newId;
//       `);

//     res.status(201).json({ 
//       message: "External timesheet uploaded successfully",
//       id: result.recordset[0].newId,
//       fileName: file.originalname,
//       companyId: employeeInfo.CompanyId
//     });
//   } catch (error) {
//     console.error("Error uploading external timesheet:", error);
//     res.status(500).json({ message: "Server error while uploading timesheet", error: error.message });
//   }
// };

// // Get timesheet upload history
// exports.getUploadHistory = async (req, res) => {
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get user's employee ID
//     const userResult = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userEmployeeId = userResult.recordset[0].EmployeeId;

//     const result = await pool.request()
//       .input("employeeId", sql.NVarChar, userEmployeeId)
//       .query(`
//         SELECT 
//           Id,
//           FileName,
//           FileSize,
//           UploadDate,
//           ClientName,
//           ProjectName,
//           Period,
//           Status
//         FROM ExternalTimesheetFiles
//         WHERE EmployeeId = @employeeId
//         ORDER BY UploadDate DESC
//       `);

//     res.status(200).json(result.recordset);
//   } catch (error) {
//     console.error("Error fetching upload history:", error);
//     res.status(500).json({ message: "Server error while fetching history", error: error.message });
//   }
// };

// // Export timesheet to CSV
// exports.exportTimesheet = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get user's employee ID
//     const userResult = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userEmployeeId = userResult.recordset[0].EmployeeId;

//     // Get timesheet data
//     const timesheetResult = await pool.request()
//       .input("id", sql.Int, parseInt(timesheetId))
//       .input("employeeId", sql.NVarChar, userEmployeeId)
//       .query(`
//         SELECT t.*, u.username
//         FROM Timesheets t
//         JOIN userinfo u ON t.EmployeeId = u.EmployeeId
//         WHERE t.Id = @id AND t.EmployeeId = @employeeId
//       `);

//     if (timesheetResult.recordset.length === 0) {
//       return res.status(404).json({ message: "Timesheet not found" });
//     }

//     const timesheet = timesheetResult.recordset[0];

//     // Get entries
//     const entriesResult = await pool.request()
//       .input("timesheetId", sql.Int, parseInt(timesheetId))
//       .query(`
//         SELECT Date, Hours, DayType, Project, Task, Description
//         FROM TimesheetEntries
//         WHERE TimesheetId = @timesheetId
//         ORDER BY Date
//       `);

//     // Format helpers
//     const formatDate = (date) => {
//       const d = new Date(date);
//       const day = String(d.getUTCDate()).padStart(2, '0');
//       const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
//                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
//       const month = monthNames[d.getUTCMonth()];
//       const year = d.getUTCFullYear();
//       return `${day}-${month}-${year}`;
//     };

//     const getDayName = (date) => {
//       const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//       return days[new Date(date).getUTCDay()];
//     };

//     const escapeCSV = (value) => {
//       if (value === null || value === undefined) return '';
//       const stringValue = String(value);
//       if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
//         return `"${stringValue.replace(/"/g, '""')}"`;
//       }
//       return stringValue;
//     };

//     const monthNames = [
//       'January', 'February', 'March', 'April', 'May', 'June',
//       'July', 'August', 'September', 'October', 'November', 'December'
//     ];
//     const monthName = monthNames[timesheet.Month - 1];

//     // Build CSV
//     let csvContent = '';
//     csvContent += `TIMESHEET REPORT\n`;
//     csvContent += `\n`;
//     csvContent += `Employee:,${escapeCSV(timesheet.username)}\n`;
//     csvContent += `Period:,${monthName} ${timesheet.Year}\n`;
//     csvContent += `Status:,${escapeCSV(timesheet.Status || 'Draft')}\n`;
//     csvContent += `Total Hours:,${timesheet.TotalHours || 0}\n`;
//     csvContent += `\n`;
//     csvContent += `Date,Day,Hours,Type,Project,Task,Description\n`;
    
//     entriesResult.recordset.forEach(entry => {
//       const date = formatDate(entry.Date);
//       const dayName = getDayName(entry.Date);
//       const hours = entry.Hours || 0;
//       const type = entry.DayType || 'Regular';
//       const project = escapeCSV(entry.Project || 'N/A');
//       const task = escapeCSV(entry.Task || 'N/A');
//       const description = escapeCSV(entry.Description || '');
      
//       csvContent += `${date},${dayName},${hours},${type},${project},${task},${description}\n`;
//     });

//     csvContent += `\n`;
//     csvContent += `SUMMARY\n`;
//     csvContent += `Total Working Days:,${entriesResult.recordset.filter(e => e.DayType === 'regular').length}\n`;
//     csvContent += `Total Leave Days:,${entriesResult.recordset.filter(e => e.DayType === 'leave').length}\n`;
//     csvContent += `Total Holidays:,${entriesResult.recordset.filter(e => e.DayType === 'holiday').length}\n`;
//     csvContent += `Total Hours:,${timesheet.TotalHours || 0}\n`;
    
//     if (timesheet.Notes) {
//       csvContent += `\n`;
//       csvContent += `Notes:,${escapeCSV(timesheet.Notes)}\n`;
//     }

//     res.setHeader('Content-Type', 'text/csv; charset=utf-8');
//     res.setHeader('Content-Disposition', `attachment; filename="Timesheet_${timesheet.username}_${monthName}_${timesheet.Year}.csv"`);
//     res.send('\uFEFF' + csvContent);
    
//   } catch (error) {
//     console.error("Error exporting timesheet:", error);
//     res.status(500).json({ 
//       message: "Server error while exporting timesheet", 
//       error: error.message 
//     });
//   }
// };

// // Delete external timesheet
// exports.deleteExternalTimesheet = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get user's employee ID
//     const userResult = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userEmployeeId = userResult.recordset[0].EmployeeId;

//     // Verify file belongs to user
//     const fileCheck = await pool.request()
//       .input("id", sql.Int, parseInt(timesheetId))
//       .input("employeeId", sql.NVarChar, userEmployeeId)
//       .query(`
//         SELECT Id, FilePath 
//         FROM ExternalTimesheetFiles
//         WHERE Id = @id AND EmployeeId = @employeeId
//       `);

//     if (fileCheck.recordset.length === 0) {
//       return res.status(404).json({ message: "File not found" });
//     }

//     const file = fileCheck.recordset[0];

//     // Delete file from filesystem if exists
//     if (file.FilePath && fs.existsSync(file.FilePath)) {
//       fs.unlinkSync(file.FilePath);
//     }

//     // Delete from database
//     await pool.request()
//       .input("id", sql.Int, parseInt(timesheetId))
//       .query(`DELETE FROM ExternalTimesheetFiles WHERE Id = @id`);

//     res.status(200).json({ message: "External timesheet deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting external timesheet:", error);
//     res.status(500).json({ message: "Server error while deleting timesheet", error: error.message });
//   }
// };

// // Download external timesheet file
// exports.downloadExternalTimesheet = async (req, res) => {
//   const timesheetId = req.params.id;
  
//   try {
//     const pool = await poolPromise;
//     const userId = req.user.id;

//     // Get user's employee ID
//     const userResult = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

//     if (userResult.recordset.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userEmployeeId = userResult.recordset[0].EmployeeId;

//     // Get file info
//     const result = await pool.request()
//       .input("id", sql.Int, parseInt(timesheetId))
//       .input("employeeId", sql.NVarChar, userEmployeeId)
//       .query(`
//         SELECT FileName, FilePath
//         FROM ExternalTimesheetFiles
//         WHERE Id = @id AND EmployeeId = @employeeId
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({ message: "File not found" });
//     }

//     const fileInfo = result.recordset[0];
//     const filePath = fileInfo.FilePath;

//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ message: "File not found on server" });
//     }

//     res.download(filePath, fileInfo.FileName);
//   } catch (error) {
//     console.error("Error downloading file:", error);
//     res.status(500).json({ message: "Server error while downloading file", error: error.message });
//   }
// };

// // Middleware for file upload
// exports.uploadMiddleware = upload.single('timesheetFile');




const { poolPromise, sql } = require("../../config/db");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/timesheets');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'external-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const sendTimesheetRejectionEmail = async (employeeData, rejectionReason, timesheetPeriod) => {
  try {
    const employeePortalLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

    const msg = {
      to: employeeData.email.trim(),
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Prophecy - No Reply'
      },
      subject: `Timesheet Rejected - Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ef4444; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Timesheet Rejected</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333;">Hello ${employeeData.name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your timesheet has been reviewed and rejected. Please review the feedback below and resubmit your timesheet with the necessary corrections.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #ef4444; margin-top: 0;">Timesheet Details:</h3>
              <table style="width: 100%; color: #666;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Employee ID:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.employeeId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Department:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.department}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Period:</strong></td>
                  <td style="padding: 8px 0;">${timesheetPeriod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Status:</strong></td>
                  <td style="padding: 8px 0;">
                    <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #fee2e2; color: #991b1b;">
                      REJECTED
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #856404; margin-top: 0;">Rejection Reason:</h3>
              <p style="color: #666; margin: 0; padding: 12px; background: white; border-radius: 4px;">
                ${rejectionReason || 'No specific reason provided. Please contact your manager for more details.'}
              </p>
            </div>

            <div style="background-color: #dbfef6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #019d88;">
              <h3 style="color: #019d88; margin-top: 0;">Next Steps:</h3>
              <ol style="color: #666; margin: 0; padding-left: 20px;">
                <li>Review the rejection reason above</li>
                <li>Make the necessary corrections to your timesheet</li>
                <li>Resubmit your timesheet through the employee portal</li>
                <li>Your manager will review and approve/reject again</li>
              </ol>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${employeePortalLink}" 
                 style="background-color: #019d88; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Access Employee Portal
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.6;">
              If you have any questions about this rejection, please contact your manager or the HR department.<br><br>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('Email sent successfully to:', employeeData.email);
    return { success: true };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};


const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      '.pdf', '.xlsx', '.xls', '.csv', '.doc', '.docx', 
      '.txt', '.jpg', '.jpeg', '.png', '.zip', '.rar'
    ];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Excel, CSV, Word, Images, ZIP files are allowed.'));
    }
  }
});

// Helper function to get employee table based on company ID
const getEmployeeTable = (companyId) => {
  const tableMap = {
    5: 'CognifyarEmployees',
    3: 'ProphecyOffshoreEmployees', 
    2: 'ProphecyConsultingEmployees'
  };
  return tableMap[parseInt(companyId)] || 'CognifyarEmployees';
};

// FIXED: Get employee and company info from EmployeeId
const getEmployeeInfo = async (pool, employeeId) => {
  // Search across all employee tables to find the employee and their company
  const tables = [
    { id: 5, name: 'CognifyarEmployees' },
    { id: 3, name: 'ProphecyOffshoreEmployees' },
    { id: 2, name: 'ProphecyConsultingEmployees' }
  ];

  for (const table of tables) {
    try {
      const result = await pool.request()
        .input('employeeId', sql.NVarChar, employeeId)
        .query(`
          SELECT 
            Id,
            EmployeeId,
            Name,
            Email,
            Department,
            Position
          FROM ${table.name}
          WHERE EmployeeId = @employeeId
        `);

      if (result.recordset.length > 0) {
        return {
          ...result.recordset[0],
          CompanyId: table.id,
          CompanyTable: table.name
        };
      }
    } catch (error) {
      console.error(`Error searching in ${table.name}:`, error);
    }
  }

  return null;
};

// Get all timesheets for a user
exports.getUserTimesheets = async (req, res) => {
  try {
    const pool = await poolPromise;
    const userId = req.user.id;
    const { type, month, year, status } = req.query;

    // Get user's employee ID from userinfo
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmployeeId = userResult.recordset[0].EmployeeId;

    if (!userEmployeeId) {
      return res.status(400).json({ 
        message: 'Employee ID not set for this user. Please contact administrator.' 
      });
    }

    let query = `
      SELECT 
        t.*,
        u.username as userName,
        a.username as approverName
      FROM Timesheets t
      LEFT JOIN userinfo u ON t.EmployeeId = u.EmployeeId
      LEFT JOIN userinfo a ON t.ApprovedBy = a.id
      WHERE t.EmployeeId = @employeeId
    `;
    
    const request = pool.request()
      .input("employeeId", sql.NVarChar, userEmployeeId);

    if (type) {
      query += ` AND t.Type = @type`;
      request.input("type", sql.NVarChar, type);
    }

    if (month) {
      query += ` AND t.Month = @month`;
      request.input("month", sql.Int, parseInt(month));
    }

    if (year) {
      query += ` AND t.Year = @year`;
      request.input("year", sql.Int, parseInt(year));
    }

    if (status) {
      query += ` AND t.Status = @status`;
      request.input("status", sql.NVarChar, status);
    }

    query += ` ORDER BY t.Year DESC, t.Month DESC, t.CreatedAt DESC`;

    const result = await request.query(query);
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching timesheets:", error);
    res.status(500).json({ message: "Server error while fetching timesheets", error: error.message });
  }
};

// Get timesheet by ID
exports.getTimesheetById = async (req, res) => {
  const timesheetId = req.params.id;
  
  try {
    const pool = await poolPromise;
    const userId = req.user.id;

    // Get user's employee ID
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmployeeId = userResult.recordset[0].EmployeeId;

    // Get timesheet basic info
    const timesheetResult = await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .input("employeeId", sql.NVarChar, userEmployeeId)
      .query(`
        SELECT 
          t.*,
          u.username as userName,
          a.username as approverName
        FROM Timesheets t
        LEFT JOIN userinfo u ON t.EmployeeId = u.EmployeeId
        LEFT JOIN userinfo a ON t.ApprovedBy = a.id
        WHERE t.Id = @id AND t.EmployeeId = @employeeId
      `);

    if (timesheetResult.recordset.length === 0) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    const timesheet = timesheetResult.recordset[0];

    // Get timesheet entries
    const entriesResult = await pool.request()
      .input("timesheetId", sql.Int, parseInt(timesheetId))
      .query(`
        SELECT * FROM TimesheetEntries 
        WHERE TimesheetId = @timesheetId 
        ORDER BY Date
      `);

    timesheet.entries = entriesResult.recordset;

    res.status(200).json(timesheet);
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    res.status(500).json({ message: "Server error while fetching timesheet", error: error.message });
  }
};

// Replace your saveInternalTimesheet function with this version:

// Add this improved version of saveInternalTimesheet to your timesheetController.js
// Replace the existing saveInternalTimesheet function with this one

exports.saveInternalTimesheet = async (req, res) => {
  console.log('═══════════════════════════════════════');
  console.log('🎯 saveInternalTimesheet CALLED');
  console.log('═══════════════════════════════════════');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User ID:', req.user?.id);
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Month:', req.body?.month);
  console.log('Year:', req.body?.year);
  console.log('Entries count:', req.body?.entries?.length);
  console.log('═══════════════════════════════════════');
  
  const { month, year, entries, notes } = req.body;
  
  try {
    const pool = await poolPromise;
    const userId = req.user.id;

    console.log('🔍 Step 1: Getting user info for userId:', userId);

    // FIXED: Removed 'email' and 'role' columns that don't exist in userinfo table
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT id, username, EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      console.error('❌ User not found in database');
      return res.status(404).json({ 
        success: false,
        message: "User not found in database",
        userId: userId,
        hint: "Please check if the user exists in the userinfo table"
      });
    }

    const user = userResult.recordset[0];
    console.log('✅ Found user:', {
      id: user.id,
      username: user.username,
      employeeId: user.EmployeeId
    });

    const userEmployeeId = user.EmployeeId;

    if (!userEmployeeId || userEmployeeId.trim() === '') {
      console.error('❌ Employee ID not set for user');
      return res.status(400).json({ 
        success: false,
        message: "Employee ID not set for this user. Please contact administrator.",
        details: {
          userId: user.id,
          username: user.username,
          hint: "An administrator needs to assign an EmployeeId to your account"
        }
      });
    }

    console.log('🔍 Step 2: Getting employee info from company tables');

    // Get employee info and company
    const employeeInfo = await getEmployeeInfo(pool, userEmployeeId);
    
    if (!employeeInfo) {
      console.error('❌ Employee not found in any company table');
      return res.status(404).json({ 
        success: false,
        message: "Employee record not found in company databases",
        details: {
          employeeId: userEmployeeId,
          username: user.username,
          hint: "Your EmployeeId exists but no matching employee record was found in CognifyarEmployees, ProphecyOffshoreEmployees, or ProphecyConsultingEmployees tables"
        }
      });
    }

    console.log('✅ Employee found in company:', employeeInfo.CompanyId);
    console.log('Employee details:', {
      name: employeeInfo.Name,
      department: employeeInfo.Department,
      position: employeeInfo.Position
    });

    // Validate inputs
    if (!month || !year || !entries || !Array.isArray(entries)) {
      console.error('❌ Invalid request data');
      return res.status(400).json({ 
        success: false,
        message: "Invalid request data",
        details: {
          month: month || 'missing',
          year: year || 'missing',
          entriesType: Array.isArray(entries) ? 'array' : typeof entries,
          entriesLength: entries?.length
        }
      });
    }

    console.log('🔍 Step 3: Calculating total hours');

    // Calculate total hours
    const totalHours = entries.reduce((sum, entry) => {
      const hours = parseFloat(entry.hours) || 0;
      return sum + hours;
    }, 0);

    console.log('✅ Total hours:', totalHours);

    // Calculate period dates
    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    console.log('🔍 Step 4: Checking for existing timesheet');

    // Check if timesheet already exists for this month/year
    const existingTimesheet = await pool.request()
      .input("employeeId", sql.NVarChar, userEmployeeId)
      .input("month", sql.Int, parseInt(month))
      .input("year", sql.Int, parseInt(year))
      .query(`
        SELECT Id FROM Timesheets 
        WHERE EmployeeId = @employeeId AND Month = @month AND Year = @year
      `);

    let timesheetId;

    if (existingTimesheet.recordset.length > 0) {
      // Update existing timesheet
      timesheetId = existingTimesheet.recordset[0].Id;
      console.log('📝 Updating existing timesheet:', timesheetId);
      
      await pool.request()
        .input("id", sql.Int, timesheetId)
        .input("totalHours", sql.Decimal(10, 2), totalHours)
        .input("notes", sql.NVarChar, notes || null)
        .query(`
          UPDATE Timesheets 
          SET TotalHours = @totalHours, 
              Notes = @notes, 
              UpdatedAt = GETDATE(),
              Status = 'draft'
          WHERE Id = @id
        `);

      // Delete existing entries
      await pool.request()
        .input("timesheetId", sql.Int, timesheetId)
        .query(`DELETE FROM TimesheetEntries WHERE TimesheetId = @timesheetId`);
        
      console.log('✅ Updated timesheet and cleared old entries');
    } else {
      // Create new timesheet
      console.log('📝 Creating new timesheet');
      const result = await pool.request()
        .input("userId", sql.Int, userId)
        .input("employeeId", sql.NVarChar, userEmployeeId)
        .input("companyId", sql.Int, employeeInfo.CompanyId)
        .input("month", sql.Int, parseInt(month))
        .input("year", sql.Int, parseInt(year))
        .input("periodStart", sql.Date, periodStart)
        .input("periodEnd", sql.Date, periodEnd)
        .input("totalHours", sql.Decimal(10, 2), totalHours)
        .input("notes", sql.NVarChar, notes || null)
        .input("status", sql.NVarChar, 'draft')
        .query(`
          INSERT INTO Timesheets (
            userId,
            EmployeeId, 
            CompanyId,
            Month, 
            Year, 
            PeriodStart,
            PeriodEnd,
            TotalHours, 
            Notes,
            Status,
            CreatedAt,
            UpdatedAt
          )
          VALUES (
            @userId,
            @employeeId, 
            @companyId,
            @month, 
            @year, 
            @periodStart,
            @periodEnd,
            @totalHours, 
            @notes,
            @status,
            GETDATE(),
            GETDATE()
          );
          SELECT SCOPE_IDENTITY() AS newId;
        `);

      timesheetId = result.recordset[0].newId;
      console.log('✅ Created new timesheet with ID:', timesheetId);
    }

    console.log('🔍 Step 5: Inserting entries');

    // Insert new entries
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      try {
        const day = parseInt(entry.date);
        if (isNaN(day) || day < 1 || day > 31) {
          console.error(`Invalid day at index ${i}:`, entry.date);
          errorCount++;
          continue;
        }

        const entryDate = new Date(Date.UTC(year, month - 1, day));
        
        if (isNaN(entryDate.getTime()) || entryDate.getUTCMonth() !== month - 1 || entryDate.getUTCDate() !== day) {
          console.error(`Invalid date at index ${i}:`, { year, month, day: entry.date });
          errorCount++;
          continue;
        }

        const formattedDate = entryDate.toISOString().split('T')[0];
        
        await pool.request()
          .input("timesheetId", sql.Int, timesheetId)
          .input("date", sql.Date, formattedDate)
          .input("hours", sql.Decimal(5, 2), parseFloat(entry.hours) || 0)
          .input("dayType", sql.NVarChar, entry.dayType || 'regular')
          .input("project", sql.NVarChar, entry.project || null)
          .input("task", sql.NVarChar, entry.task || null)
          .input("description", sql.NVarChar, entry.description || null)
          .query(`
            INSERT INTO TimesheetEntries (
              TimesheetId, 
              Date, 
              Hours, 
              DayType, 
              Project, 
              Task, 
              Description
            )
            VALUES (
              @timesheetId, 
              @date, 
              @hours, 
              @dayType, 
              @project, 
              @task, 
              @description
            )
          `);
        
        successCount++;
      } catch (entryError) {
        console.error(`Error inserting entry ${i}:`, entryError.message);
        errorCount++;
      }
    }

    console.log(`✅ Entries processed: ${successCount} success, ${errorCount} errors`);
    console.log('═══════════════════════════════════════');
    console.log('✅ TIMESHEET SAVED SUCCESSFULLY');
    console.log('═══════════════════════════════════════');

    res.status(200).json({ 
      success: true,
      message: "Timesheet saved successfully", 
      timesheetId: timesheetId,
      companyId: employeeInfo.CompanyId,
      employee: {
        id: userEmployeeId,
        name: employeeInfo.Name,
        department: employeeInfo.Department
      },
      stats: {
        totalEntries: entries.length,
        successCount,
        errorCount,
        totalHours
      }
    });
  } catch (error) {
    console.error("═══════════════════════════════════════");
    console.error("❌ ERROR SAVING TIMESHEET");
    console.error("═══════════════════════════════════════");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("═══════════════════════════════════════");
    
    res.status(500).json({ 
      success: false,
      message: "Server error while saving timesheet", 
      error: error.message
    });
  }
};

// FIXED: Submit Timesheet for Approval
exports.submitTimesheet = async (req, res) => {
  const timesheetId = req.params.id;
  
  try {
    const pool = await poolPromise;
    const userId = req.user.id;

    // Get user's employee ID
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmployeeId = userResult.recordset[0].EmployeeId;

    // Verify timesheet belongs to user
    const timesheetCheck = await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .input("employeeId", sql.NVarChar, userEmployeeId)
      .query(`
        SELECT Id, Status, CompanyId 
        FROM Timesheets 
        WHERE Id = @id AND EmployeeId = @employeeId
      `);

    if (timesheetCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    const timesheet = timesheetCheck.recordset[0];

    if (timesheet.Status !== 'draft') {
      return res.status(400).json({ message: "Timesheet is already submitted" });
    }

    await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .query(`
        UPDATE Timesheets 
        SET Status = 'Pending', 
            SubmittedDate = GETDATE(), 
            UpdatedAt = GETDATE()
        WHERE Id = @id
      `);

    res.status(200).json({ 
      message: "Timesheet submitted for approval",
      companyId: timesheet.CompanyId
    });
  } catch (error) {
    console.error("Error submitting timesheet:", error);
    res.status(500).json({ message: "Server error while submitting timesheet", error: error.message });
  }
};

    // FIXED: Upload External Timesheet
exports.uploadExternalTimesheet = async (req, res) => {
  try {
    const pool = await poolPromise;
    const userId = req.user.id;
    const { clientName, projectName, periodStart, periodEnd, notes } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Get user's employee ID
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmployeeId = userResult.recordset[0].EmployeeId;

    if (!userEmployeeId) {
      return res.status(400).json({ 
        message: "Employee ID not set for this user. Please contact administrator." 
      });
    }

    // Get employee info and company
    const employeeInfo = await getEmployeeInfo(pool, userEmployeeId);
    
    if (!employeeInfo) {
      return res.status(404).json({ message: "Employee not found in any company" });
    }

    const file = req.file;
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    // FIXED: Make sure FilePath is relative and consistent
    const relativePath = file.path.replace(/\\/g, '/'); // Normalize path separators

    // Insert into ExternalTimesheetFiles table
    const result = await pool.request()
      .input("employeeId", sql.NVarChar, userEmployeeId)
      .input("companyId", sql.Int, employeeInfo.CompanyId)
      .input("fileName", sql.NVarChar, file.originalname)
      .input("filePath", sql.NVarChar, relativePath) // Use normalized path
      .input("fileSize", sql.Int, file.size)
      .input("mimeType", sql.NVarChar, file.mimetype)
      .input("clientName", sql.NVarChar, clientName || null)
      .input("projectName", sql.NVarChar, projectName || null)
      .input("periodStart", sql.Date, periodStart ? new Date(periodStart) : null)
      .input("periodEnd", sql.Date, periodEnd ? new Date(periodEnd) : null)
      .input("period", sql.NVarChar, `${month}/${year}`)
      .input("status", sql.NVarChar, 'Pending')
      .query(`
        INSERT INTO ExternalTimesheetFiles (
          EmployeeId,
          CompanyId,
          FileName,
          FilePath,
          FileSize,
          MimeType,
          ClientName,
          ProjectName,
          PeriodStart,
          PeriodEnd,
          Period,
          Status,
          UploadDate
        )
        VALUES (
          @employeeId,
          @companyId,
          @fileName,
          @filePath,
          @fileSize,
          @mimeType,
          @clientName,
          @projectName,
          @periodStart,
          @periodEnd,
          @period,
          @status,
          GETDATE()
        );
        SELECT SCOPE_IDENTITY() AS newId;
      `);

    console.log('✅ External timesheet uploaded:', {
      id: result.recordset[0].newId,
      employeeId: userEmployeeId,
      companyId: employeeInfo.CompanyId,
      fileName: file.originalname
    });

    res.status(201).json({ 
      success: true,
      message: "External timesheet uploaded successfully",
      id: result.recordset[0].newId,
      fileName: file.originalname,
      companyId: employeeInfo.CompanyId
    });
  } catch (error) {
    console.error("Error uploading external timesheet:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while uploading timesheet", 
      error: error.message 
    });
  }
};

// Get timesheet upload history
exports.getUploadHistory = async (req, res) => {
  try {
    const pool = await poolPromise;
    const userId = req.user.id;

    // Get user's employee ID
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmployeeId = userResult.recordset[0].EmployeeId;

    const result = await pool.request()
      .input("employeeId", sql.NVarChar, userEmployeeId)
      .query(`
        SELECT 
          Id,
          FileName,
          FileSize,
          UploadDate,
          ClientName,
          ProjectName,
          Period,
          Status
        FROM ExternalTimesheetFiles
        WHERE EmployeeId = @employeeId
        ORDER BY UploadDate DESC
      `);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching upload history:", error);
    res.status(500).json({ message: "Server error while fetching history", error: error.message });
  }
};

// Export timesheet to CSV
exports.exportTimesheet = async (req, res) => {
  const timesheetId = req.params.id;
  
  try {
    const pool = await poolPromise;
    const userId = req.user.id;

    // Get user's employee ID
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmployeeId = userResult.recordset[0].EmployeeId;

    // Get timesheet data
    const timesheetResult = await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .input("employeeId", sql.NVarChar, userEmployeeId)
      .query(`
        SELECT t.*, u.username
        FROM Timesheets t
        JOIN userinfo u ON t.EmployeeId = u.EmployeeId
        WHERE t.Id = @id AND t.EmployeeId = @employeeId
      `);

    if (timesheetResult.recordset.length === 0) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    const timesheet = timesheetResult.recordset[0];

    // Get entries
    const entriesResult = await pool.request()
      .input("timesheetId", sql.Int, parseInt(timesheetId))
      .query(`
        SELECT Date, Hours, DayType, Project, Task, Description
        FROM TimesheetEntries
        WHERE TimesheetId = @timesheetId
        ORDER BY Date
      `);

    // Format helpers
    const formatDate = (date) => {
      const d = new Date(date);
      const day = String(d.getUTCDate()).padStart(2, '0');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = monthNames[d.getUTCMonth()];
      const year = d.getUTCFullYear();
      return `${day}-${month}-${year}`;
    };

    const getDayName = (date) => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[new Date(date).getUTCDay()];
    };

    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[timesheet.Month - 1];

    // Build CSV
    let csvContent = '';
    csvContent += `TIMESHEET REPORT\n`;
    csvContent += `\n`;
    csvContent += `Employee:,${escapeCSV(timesheet.username)}\n`;
    csvContent += `Period:,${monthName} ${timesheet.Year}\n`;
    csvContent += `Status:,${escapeCSV(timesheet.Status || 'Draft')}\n`;
    csvContent += `Total Hours:,${timesheet.TotalHours || 0}\n`;
    csvContent += `\n`;
    csvContent += `Date,Day,Hours,Type,Project,Task,Description\n`;
    
    entriesResult.recordset.forEach(entry => {
      const date = formatDate(entry.Date);
      const dayName = getDayName(entry.Date);
      const hours = entry.Hours || 0;
      const type = entry.DayType || 'Regular';
      const project = escapeCSV(entry.Project || 'N/A');
      const task = escapeCSV(entry.Task || 'N/A');
      const description = escapeCSV(entry.Description || '');
      
      csvContent += `${date},${dayName},${hours},${type},${project},${task},${description}\n`;
    });

    csvContent += `\n`;
    csvContent += `SUMMARY\n`;
    csvContent += `Total Working Days:,${entriesResult.recordset.filter(e => e.DayType === 'regular').length}\n`;
    csvContent += `Total Leave Days:,${entriesResult.recordset.filter(e => e.DayType === 'leave').length}\n`;
    csvContent += `Total Holidays:,${entriesResult.recordset.filter(e => e.DayType === 'holiday').length}\n`;
    csvContent += `Total Hours:,${timesheet.TotalHours || 0}\n`;
    
    if (timesheet.Notes) {
      csvContent += `\n`;
      csvContent += `Notes:,${escapeCSV(timesheet.Notes)}\n`;
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Timesheet_${timesheet.username}_${monthName}_${timesheet.Year}.csv"`);
    res.send('\uFEFF' + csvContent);
    
  } catch (error) {
    console.error("Error exporting timesheet:", error);
    res.status(500).json({ 
      message: "Server error while exporting timesheet", 
      error: error.message 
    });
  }
};

// Delete external timesheet
exports.deleteExternalTimesheet = async (req, res) => {
  const timesheetId = req.params.id;
  
  try {
    const pool = await poolPromise;
    const userId = req.user.id;

    // Get user's employee ID
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmployeeId = userResult.recordset[0].EmployeeId;

    // Verify file belongs to user
    const fileCheck = await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .input("employeeId", sql.NVarChar, userEmployeeId)
      .query(`
        SELECT Id, FilePath 
        FROM ExternalTimesheetFiles
        WHERE Id = @id AND EmployeeId = @employeeId
      `);

    if (fileCheck.recordset.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const file = fileCheck.recordset[0];

    // Delete file from filesystem if exists
    if (file.FilePath && fs.existsSync(file.FilePath)) {
      fs.unlinkSync(file.FilePath);
    }

    // Delete from database
    await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .query(`DELETE FROM ExternalTimesheetFiles WHERE Id = @id`);

    res.status(200).json({ message: "External timesheet deleted successfully" });
  } catch (error) {
    console.error("Error deleting external timesheet:", error);
    res.status(500).json({ message: "Server error while deleting timesheet", error: error.message });
  }
};

// Download external timesheet file
exports.downloadExternalTimesheet = async (req, res) => {
  const timesheetId = req.params.id;
  
  try {
    const pool = await poolPromise;
    const userId = req.user.id;

    // Get user's employee ID
    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userEmployeeId = userResult.recordset[0].EmployeeId;

    // Get file info
    const result = await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .input("employeeId", sql.NVarChar, userEmployeeId)
      .query(`
        SELECT FileName, FilePath
        FROM ExternalTimesheetFiles
        WHERE Id = @id AND EmployeeId = @employeeId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const fileInfo = result.recordset[0];
    const filePath = fileInfo.FilePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    res.download(filePath, fileInfo.FileName);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Server error while downloading file", error: error.message });
  }
};


// Add this at the end of your timesheetController.js, before module.exports

// Get timesheet entries by timesheet ID
exports.getTimesheetEntries = async (req, res) => {
  const timesheetId = req.params.id;
  
  try {
    const pool = await poolPromise;
    
    console.log('📋 Fetching entries for timesheet ID:', timesheetId);
    
    // Get timesheet entries
    const entriesResult = await pool.request()
      .input("timesheetId", sql.Int, parseInt(timesheetId))
      .query(`
        SELECT 
          Id,
          TimesheetId,
          Date,
          Hours,
          DayType,
          Project,
          Task,
          Description
        FROM TimesheetEntries
        WHERE TimesheetId = @timesheetId
        ORDER BY Date ASC
      `);

    console.log('✅ Found entries:', entriesResult.recordset.length);

    res.status(200).json({
      success: true,
      entries: entriesResult.recordset,
      count: entriesResult.recordset.length
    });
  } catch (error) {
    console.error("Error fetching timesheet entries:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching timesheet entries", 
      error: error.message 
    });
  }
};

// Approve timesheet
exports.approveTimesheet = async (req, res) => {
  const timesheetId = req.params.id;
  
  try {
    const pool = await poolPromise;
    const userId = req.user?.id;
    
    console.log('✅ Approving timesheet:', timesheetId, 'by user:', userId);

    // Update timesheet status to Approved
    await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .input("approvedBy", sql.Int, userId)
      .query(`
        UPDATE Timesheets 
        SET status = 'Approved',
            approvedBy = @approvedBy,
            approvedAt = GETDATE(),
            updatedAt = GETDATE()
        WHERE id = @id
      `);

    res.status(200).json({
      success: true,
      message: "Timesheet approved successfully"
    });
  } catch (error) {
    console.error("Error approving timesheet:", error);
    res.status(500).json({
      success: false,
      message: "Server error while approving timesheet",
      error: error.message
    });
  }
};

// Reject timesheet
exports.rejectTimesheet = async (req, res) => {
  const timesheetId = req.params.id;
  const { reason, employeeId, employeeName, employeeDepartment, periodStart, periodEnd, employeeEmail } = req.body;
  
  try {
    const pool = await poolPromise;
    const userId = req.user?.id;
    
    console.log('===================================');
    console.log('Rejecting timesheet:', timesheetId);
    console.log('By user:', userId);
    console.log('Reason:', reason);
    console.log('===================================');

    // Get timesheet details if not provided
    const timesheetResult = await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .query(`
        SELECT Id, EmployeeId, Status, PeriodStart, PeriodEnd, CompanyId, TotalHours
        FROM Timesheets
        WHERE Id = @id
      `);

    if (timesheetResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }

    const timesheet = timesheetResult.recordset[0];
    const finalEmployeeId = employeeId || timesheet.EmployeeId;
    const companyId = timesheet.CompanyId;

    // Get employee details from company table
    const tableName = getEmployeeTable(companyId);
    const empRequest = pool.request();
    empRequest.input('employeeId', sql.NVarChar, finalEmployeeId);
    
    const empResult = await empRequest.query(`
      SELECT Email, Name, Department FROM ${tableName}
      WHERE EmployeeId = @employeeId
    `);

    let finalEmail = employeeEmail;
    let finalName = employeeName;
    let finalDepartment = employeeDepartment;

    if (empResult.recordset.length > 0) {
      finalEmail = empResult.recordset[0].Email;
      finalName = empResult.recordset[0].Name;
      finalDepartment = empResult.recordset[0].Department;
    }

    // Update timesheet status to Rejected
    await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .input("approvedBy", sql.Int, userId)
      .input("notes", sql.NVarChar, reason || 'No reason provided')
      .query(`
        UPDATE Timesheets 
        SET status = 'Rejected',
            approvedBy = @approvedBy,
            approvedAt = GETDATE(),
            notes = @notes,
            updatedAt = GETDATE()
        WHERE id = @id
      `);

    console.log('Timesheet updated to Rejected');

    // Send rejection email
    let emailSent = false;
    if (finalEmail) {
      const timesheetPeriod = `${new Date(periodStart || timesheet.PeriodStart).toLocaleDateString()} - ${new Date(periodEnd || timesheet.PeriodEnd).toLocaleDateString()}`;
      
      const emailResult = await sendTimesheetRejectionEmail(
        {
          email: finalEmail,
          name: finalName,
          employeeId: finalEmployeeId,
          department: finalDepartment
        },
        reason || 'No specific reason provided',
        timesheetPeriod
      );
      
      emailSent = emailResult.success;
      console.log('Email result:', emailResult);
    } else {
      console.log('No email address found for employee');
    }

    res.status(200).json({
      success: true,
      message: 'Timesheet rejected successfully',
      emailSent: emailSent,
      data: {
        timesheetId: parseInt(timesheetId),
        status: 'Rejected',
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason,
        emailNotification: emailSent ? 'Sent to ' + finalEmail : 'Could not send email'
      }
    });

  } catch (error) {
    console.error('Error rejecting timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting timesheet',
      error: error.message
    });
  }
};


// Delete timesheet
exports.deleteTimesheet = async (req, res) => {
  const timesheetId = req.params.id;
  
  try {
    const pool = await poolPromise;
    
    console.log('🗑️ Deleting timesheet:', timesheetId);

    // Delete timesheet entries first (foreign key constraint)
    await pool.request()
      .input("timesheetId", sql.Int, parseInt(timesheetId))
      .query(`DELETE FROM TimesheetEntries WHERE TimesheetId = @timesheetId`);

    // Delete the timesheet
    await pool.request()
      .input("id", sql.Int, parseInt(timesheetId))
      .query(`DELETE FROM Timesheets WHERE id = @id`);

    res.status(200).json({
      success: true,
      message: "Timesheet deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting timesheet",
      error: error.message
    });
  }
};


// Get all timesheets for a company (Manager view)
exports.getCompanyTimesheets = async (req, res) => {
  try {
    const pool = await poolPromise;
    const companyId = req.params.companyId;
    
    console.log('═══════════════════════════════════════');
    console.log('🎯 getCompanyTimesheets CALLED');
    console.log('═══════════════════════════════════════');
    console.log('Company ID:', companyId);
    console.log('Timestamp:', new Date().toISOString());
    
    // Get the employee table name for this company
    const employeeTable = getEmployeeTable(companyId);
    console.log('📋 Employee Table:', employeeTable);

    // Query to get all timesheets for this company with employee details
    const query = `
      SELECT 
        t.Id,
        t.EmployeeId,
        t.CompanyId,
        t.Month,
        t.Year,
        t.PeriodStart,
        t.PeriodEnd,
        t.TotalHours,
        t.OvertimeHours,
        t.Status,
        t.Notes,
        t.CreatedAt,
        t.UpdatedAt,
        t.SubmittedDate,
        t.ApprovedBy,
        t.ApprovedAt,
        e.Name as EmployeeName,
        e.Email as EmployeeEmail,
        e.Department,
        e.Position
      FROM Timesheets t
      LEFT JOIN ${employeeTable} e ON t.EmployeeId = e.EmployeeId
      WHERE t.CompanyId = @companyId
      ORDER BY t.Year DESC, t.Month DESC, t.CreatedAt DESC
    `;

    console.log('📝 SQL Query:', query);

    const result = await pool.request()
      .input('companyId', sql.Int, parseInt(companyId))
      .query(query);

    console.log('✅ Query executed successfully');
    console.log('📊 Records found:', result.recordset.length);
    
    if (result.recordset.length > 0) {
      console.log('📋 First record sample:', result.recordset[0]);
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ RETURNING TIMESHEETS');
    console.log('═══════════════════════════════════════');

    res.status(200).json({
      success: true,
      data: result.recordset,
      count: result.recordset.length,
      companyId: parseInt(companyId)
    });
  } catch (error) {
    console.error('═══════════════════════════════════════');
    console.error('❌ ERROR FETCHING COMPANY TIMESHEETS');
    console.error('═══════════════════════════════════════');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════');
    
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching company timesheets", 
      error: error.message 
    });
  }
};




// Add these functions to your timesheetController.js file

// Get submitted weeks for a timesheet
exports.getSubmittedWeeks = async (req, res) => {
  const timesheetId = req.params.id;
  
  try {
    const pool = await poolPromise;
    
    console.log('📋 Fetching submitted weeks metadata for timesheet ID:', timesheetId);
    
    const result = await pool.request()
      .input("timesheetId", sql.Int, parseInt(timesheetId))
      .query(`
        SELECT 
          Id,
          TimesheetId,
          WeekIndex,
          SubmittedDate
        FROM TimesheetWeekSubmissions
        WHERE TimesheetId = @timesheetId
        ORDER BY WeekIndex ASC
      `);

    console.log('✅ Found submitted weeks:', result.recordset.length);

    const submittedWeeks = result.recordset.map(row => row.WeekIndex);

    res.status(200).json({
      success: true,
      submittedWeeks: submittedWeeks,
      count: result.recordset.length
    });
  } catch (error) {
    console.error("Error fetching submitted weeks:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching submitted weeks", 
      error: error.message 
    });
  }
};

// Mark a week as submitted
exports.markWeekSubmitted = async (req, res) => {
  const timesheetId = req.params.id;
  const { weekIndex } = req.body;
  
  try {
    const pool = await poolPromise;
    
    console.log('✅ Marking week as submitted:', {
      timesheetId,
      weekIndex
    });

    // Check if already submitted
    const checkResult = await pool.request()
      .input("timesheetId", sql.Int, parseInt(timesheetId))
      .input("weekIndex", sql.Int, parseInt(weekIndex))
      .query(`
        SELECT Id FROM TimesheetWeekSubmissions
        WHERE TimesheetId = @timesheetId AND WeekIndex = @weekIndex
      `);

    if (checkResult.recordset.length > 0) {
      console.log('ℹ️ Week already marked as submitted');
      return res.status(200).json({
        success: true,
        message: "Week already submitted",
        alreadySubmitted: true
      });
    }

    // Insert new submission record
    const result = await pool.request()
      .input("timesheetId", sql.Int, parseInt(timesheetId))
      .input("weekIndex", sql.Int, parseInt(weekIndex))
      .query(`
        INSERT INTO TimesheetWeekSubmissions (
          TimesheetId,
          WeekIndex,
          SubmittedDate
        )
        VALUES (
          @timesheetId,
          @weekIndex,
          GETDATE()
        );
        SELECT SCOPE_IDENTITY() AS newId;
      `);

    console.log('✅ Week marked as submitted with ID:', result.recordset[0].newId);

    res.status(200).json({
      success: true,
      message: "Week marked as submitted",
      submissionId: result.recordset[0].newId,
      alreadySubmitted: false
    });
  } catch (error) {
    console.error("Error marking week as submitted:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking week as submitted",
      error: error.message
    });
  }
};

// Update the saveInternalTimesheet function - ADD THIS SECTION after marking submissions
// Modify your existing handleWeeklySubmit logic to call backend:

// In timesheetController.js, update saveInternalTimesheet to handle weekIndex

exports.saveInternalTimesheet = async (req, res) => {
  console.log('═══════════════════════════════════════');
  console.log('🎯 saveInternalTimesheet CALLED');
  console.log('═══════════════════════════════════════');
  console.log('Timestamp:', new Date().toISOString());
  console.log('User ID:', req.user?.id);
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Month:', req.body?.month);
  console.log('Year:', req.body?.year);
  console.log('Entries count:', req.body?.entries?.length);
  console.log('WeekIndex:', req.body?.weekIndex);
  console.log('═══════════════════════════════════════');
  
  const { month, year, entries, notes, weekIndex } = req.body;
  
  try {
    const pool = await poolPromise;
    const userId = req.user.id;

    console.log('🔍 Step 1: Getting user info for userId:', userId);

    const userResult = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`SELECT id, username, EmployeeId FROM userinfo WHERE id = @userId`);

    if (userResult.recordset.length === 0) {
      console.error('❌ User not found in database');
      return res.status(404).json({ 
        success: false,
        message: "User not found in database",
        userId: userId,
        hint: "Please check if the user exists in the userinfo table"
      });
    }

    const user = userResult.recordset[0];
    console.log('✅ Found user:', {
      id: user.id,
      username: user.username,
      employeeId: user.EmployeeId
    });

    const userEmployeeId = user.EmployeeId;

    if (!userEmployeeId || userEmployeeId.trim() === '') {
      console.error('❌ Employee ID not set for user');
      return res.status(400).json({ 
        success: false,
        message: "Employee ID not set for this user. Please contact administrator.",
        details: {
          userId: user.id,
          username: user.username,
          hint: "An administrator needs to assign an EmployeeId to your account"
        }
      });
    }

    console.log('🔍 Step 2: Getting employee info from company tables');

    const employeeInfo = await getEmployeeInfo(pool, userEmployeeId);
    
    if (!employeeInfo) {
      console.error('❌ Employee not found in any company table');
      return res.status(404).json({ 
        success: false,
        message: "Employee record not found in company databases",
        details: {
          employeeId: userEmployeeId,
          username: user.username,
          hint: "Your EmployeeId exists but no matching employee record was found"
        }
      });
    }

    console.log('✅ Employee found in company:', employeeInfo.CompanyId);

    if (!month || !year || !entries || !Array.isArray(entries)) {
      console.error('❌ Invalid request data');
      return res.status(400).json({ 
        success: false,
        message: "Invalid request data",
        details: {
          month: month || 'missing',
          year: year || 'missing',
          entriesType: Array.isArray(entries) ? 'array' : typeof entries,
          entriesLength: entries?.length
        }
      });
    }

    console.log('🔍 Step 3: Calculating total hours');

    const totalHours = entries.reduce((sum, entry) => {
      const hours = parseFloat(entry.hours) || 0;
      return sum + hours;
    }, 0);

    console.log('✅ Total hours:', totalHours);

    const periodStart = new Date(year, month - 1, 1);
    const periodEnd = new Date(year, month, 0);

    console.log('🔍 Step 4: Checking for existing timesheet');

    const existingTimesheet = await pool.request()
      .input("employeeId", sql.NVarChar, userEmployeeId)
      .input("month", sql.Int, parseInt(month))
      .input("year", sql.Int, parseInt(year))
      .query(`
        SELECT Id FROM Timesheets 
        WHERE EmployeeId = @employeeId AND Month = @month AND Year = @year
      `);

    let timesheetId;

    if (existingTimesheet.recordset.length > 0) {
      timesheetId = existingTimesheet.recordset[0].Id;
      console.log('📝 Updating existing timesheet:', timesheetId);
      
      await pool.request()
        .input("id", sql.Int, timesheetId)
        .input("totalHours", sql.Decimal(10, 2), totalHours)
        .input("notes", sql.NVarChar, notes || null)
        .query(`
          UPDATE Timesheets 
          SET TotalHours = @totalHours, 
              Notes = @notes, 
              UpdatedAt = GETDATE(),
              Status = 'draft'
          WHERE Id = @id
        `);

      await pool.request()
        .input("timesheetId", sql.Int, timesheetId)
        .query(`DELETE FROM TimesheetEntries WHERE TimesheetId = @timesheetId`);
        
      console.log('✅ Updated timesheet and cleared old entries');
    } else {
      console.log('📝 Creating new timesheet');
      const result = await pool.request()
        .input("userId", sql.Int, userId)
        .input("employeeId", sql.NVarChar, userEmployeeId)
        .input("companyId", sql.Int, employeeInfo.CompanyId)
        .input("month", sql.Int, parseInt(month))
        .input("year", sql.Int, parseInt(year))
        .input("periodStart", sql.Date, periodStart)
        .input("periodEnd", sql.Date, periodEnd)
        .input("totalHours", sql.Decimal(10, 2), totalHours)
        .input("notes", sql.NVarChar, notes || null)
        .input("status", sql.NVarChar, 'draft')
        .query(`
          INSERT INTO Timesheets (
            userId,
            EmployeeId, 
            CompanyId,
            Month, 
            Year, 
            PeriodStart,
            PeriodEnd,
            TotalHours, 
            Notes,
            Status,
            CreatedAt,
            UpdatedAt
          )
          VALUES (
            @userId,
            @employeeId, 
            @companyId,
            @month, 
            @year, 
            @periodStart,
            @periodEnd,
            @totalHours, 
            @notes,
            @status,
            GETDATE(),
            GETDATE()
          );
          SELECT SCOPE_IDENTITY() AS newId;
        `);

      timesheetId = result.recordset[0].newId;
      console.log('✅ Created new timesheet with ID:', timesheetId);
    }

    console.log('🔍 Step 5: Inserting entries');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      
      try {
        const day = parseInt(entry.date);
        if (isNaN(day) || day < 1 || day > 31) {
          console.error(`Invalid day at index ${i}:`, entry.date);
          errorCount++;
          continue;
        }

        const entryDate = new Date(Date.UTC(year, month - 1, day));
        
        if (isNaN(entryDate.getTime()) || entryDate.getUTCMonth() !== month - 1 || entryDate.getUTCDate() !== day) {
          console.error(`Invalid date at index ${i}:`, { year, month, day: entry.date });
          errorCount++;
          continue;
        }

        const formattedDate = entryDate.toISOString().split('T')[0];
        
        await pool.request()
          .input("timesheetId", sql.Int, timesheetId)
          .input("date", sql.Date, formattedDate)
          .input("hours", sql.Decimal(5, 2), parseFloat(entry.hours) || 0)
          .input("dayType", sql.NVarChar, entry.dayType || 'regular')
          .input("project", sql.NVarChar, entry.project || null)
          .input("task", sql.NVarChar, entry.task || null)
          .input("description", sql.NVarChar, entry.description || null)
          .query(`
            INSERT INTO TimesheetEntries (
              TimesheetId, 
              Date, 
              Hours, 
              DayType, 
              Project, 
              Task, 
              Description
            )
            VALUES (
              @timesheetId, 
              @date, 
              @hours, 
              @dayType, 
              @project, 
              @task, 
              @description
            )
          `);
        
        successCount++;
      } catch (entryError) {
        console.error(`Error inserting entry ${i}:`, entryError.message);
        errorCount++;
      }
    }

    console.log(`✅ Entries processed: ${successCount} success, ${errorCount} errors`);

    // NEW: If weekIndex is provided, mark this week as submitted
    if (weekIndex !== undefined && weekIndex !== null) {
      console.log('🔍 Step 6: Marking week as submitted');
      
      try {
        const checkResult = await pool.request()
          .input("timesheetId", sql.Int, timesheetId)
          .input("weekIndex", sql.Int, parseInt(weekIndex))
          .query(`
            SELECT Id FROM TimesheetWeekSubmissions
            WHERE TimesheetId = @timesheetId AND WeekIndex = @weekIndex
          `);

        if (checkResult.recordset.length === 0) {
          await pool.request()
            .input("timesheetId", sql.Int, timesheetId)
            .input("weekIndex", sql.Int, parseInt(weekIndex))
            .query(`
              INSERT INTO TimesheetWeekSubmissions (
                TimesheetId,
                WeekIndex,
                SubmittedDate
              )
              VALUES (
                @timesheetId,
                @weekIndex,
                GETDATE()
              )
            `);
          
          console.log('✅ Week marked as submitted');
        } else {
          console.log('ℹ️ Week already marked as submitted');
        }
      } catch (weekError) {
        console.error('⚠️ Error marking week as submitted:', weekError.message);
        // Don't fail the whole operation if this fails
      }
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ TIMESHEET SAVED SUCCESSFULLY');
    console.log('═══════════════════════════════════════');

    res.status(200).json({ 
      success: true,
      message: "Timesheet saved successfully", 
      timesheetId: timesheetId,
      companyId: employeeInfo.CompanyId,
      employee: {
        id: userEmployeeId,
        name: employeeInfo.Name,
        department: employeeInfo.Department
      },
      stats: {
        totalEntries: entries.length,
        successCount,
        errorCount,
        totalHours
      }
    });
  } catch (error) {
    console.error("═══════════════════════════════════════");
    console.error("❌ ERROR SAVING TIMESHEET");
    console.error("═══════════════════════════════════════");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("═══════════════════════════════════════");
    
    res.status(500).json({ 
      success: false,
      message: "Server error while saving timesheet", 
      error: error.message
    });
  }
};


// Middleware for file upload
exports.uploadMiddleware = upload.single('timesheetFile');