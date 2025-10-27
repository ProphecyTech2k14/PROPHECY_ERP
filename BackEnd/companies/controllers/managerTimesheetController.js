// // controllers/timesheetController.js - Timesheet Management Controller for Manager Timesheet System
// const sql = require('mssql');
// const { dbConfig } = require('../../config/db');

// // Helper function to format dates
// const formatDate = (date) => {
//   if (!date) return null;
//   return new Date(date).toISOString().split('T')[0];
// };

// // Helper function to get company name from ID
// const getCompanyName = (companyId) => {
//   const companyMap = {
//     1: 'Cognifyar Technologies',
//     2: 'Prophecy Offshore',
//     3: 'Prophecy Consulting INC'
//   };
//   return companyMap[parseInt(companyId)] || 'Unknown Company';
// };

// // Helper function to validate timesheet status
// const isValidStatus = (status) => {
//   return ['Pending', 'Approved', 'Rejected'].includes(status);
// };

// const timesheetController = {
//   // Test database connection
//   testConnection: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const result = await sql.query('SELECT COUNT(*) as TimesheetCount FROM Timesheets');
//       res.json({
//         success: true,
//         message: 'Timesheet database connection successful',
//         data: result.recordset
//       });
//     } catch (error) {
//       console.error('Timesheet database connection test failed:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Timesheet database connection failed',
//         error: error.message
//       });
//     }
//   },

//   // Get all timesheets with optional filters
//   getAllTimesheets: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { 
//         companyId, 
//         status, 
//         employeeId, 
//         startDate, 
//         endDate, 
//         periodType,
//         limit, 
//         offset 
//       } = req.query;
      
//       let query = `
//         SELECT t.*, 
//                DATEDIFF(day, t.SubmittedDate, GETDATE()) as DaysSinceSubmission
//         FROM Timesheets t 
//         WHERE 1=1
//       `;
//       let inputs = [];
      
//       if (companyId && companyId !== 'all') {
//         query += ' AND t.CompanyId = @companyId';
//         inputs.push({ name: 'companyId', type: sql.Int, value: parseInt(companyId) });
//       }
      
//       if (status && status !== 'all') {
//         query += ' AND t.Status = @status';
//         inputs.push({ name: 'status', type: sql.NVarChar, value: status });
//       }
      
//       if (employeeId) {
//         query += ' AND t.EmployeeId = @employeeId';
//         inputs.push({ name: 'employeeId', type: sql.NVarChar, value: employeeId });
//       }

//       if (periodType && periodType !== 'all') {
//         query += ' AND t.PeriodType = @periodType';
//         inputs.push({ name: 'periodType', type: sql.NVarChar, value: periodType });
//       }
      
//       if (startDate) {
//         query += ' AND t.SubmittedDate >= @startDate';
//         inputs.push({ name: 'startDate', type: sql.Date, value: new Date(startDate) });
//       }
      
//       if (endDate) {
//         query += ' AND t.SubmittedDate <= @endDate';
//         inputs.push({ name: 'endDate', type: sql.Date, value: new Date(endDate) });
//       }
      
//       query += ' ORDER BY t.SubmittedDate DESC, t.CreatedAt DESC';
      
//       if (limit) {
//         query += ` OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`;
//       }
      
//       const request = new sql.Request();
//       inputs.forEach(input => {
//         request.input(input.name, input.type, input.value);
//       });
      
//       const result = await request.query(query);
      
//       res.json({
//         success: true,
//         data: result.recordset,
//         count: result.recordset.length
//       });
//     } catch (error) {
//       console.error('Get all timesheets error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving timesheets', 
//         error: error.message 
//       });
//     }
//   },

//   // Get single timesheet by ID
//   getTimesheetById: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { id } = req.params;
      
//       const request = new sql.Request();
//       request.input('id', sql.Int, id);
      
//       const result = await request.query(`
//         SELECT t.*, 
//                DATEDIFF(day, t.SubmittedDate, GETDATE()) as DaysSinceSubmission
//         FROM Timesheets t 
//         WHERE t.Id = @id
//       `);
      
//       if (result.recordset.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Timesheet not found' 
//         });
//       }
      
//       res.json({
//         success: true,
//         data: result.recordset[0]
//       });
//     } catch (error) {
//       console.error('Get timesheet by ID error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving timesheet', 
//         error: error.message 
//       });
//     }
//   },

//   // Get timesheets for a specific company
//   getTimesheetsByCompany: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { companyId } = req.params;
//       const { status, limit, offset } = req.query;
      
//       if (!companyId) {
//         return res.status(400).json({
//           success: false,
//           message: 'Company ID is required'
//         });
//       }

//       let query = `
//         SELECT t.*, 
//                DATEDIFF(day, t.SubmittedDate, GETDATE()) as DaysSinceSubmission
//         FROM Timesheets t 
//         WHERE t.CompanyId = @companyId
//       `;
//       let inputs = [{ name: 'companyId', type: sql.Int, value: parseInt(companyId) }];
      
//       if (status && status !== 'all') {
//         query += ' AND t.Status = @status';
//         inputs.push({ name: 'status', type: sql.NVarChar, value: status });
//       }
      
//       query += ' ORDER BY t.SubmittedDate DESC';
      
//       if (limit) {
//         query += ` OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`;
//       }
      
//       const request = new sql.Request();
//       inputs.forEach(input => {
//         request.input(input.name, input.type, input.value);
//       });
      
//       const result = await request.query(query);
      
//       res.json({
//         success: true,
//         data: result.recordset,
//         count: result.recordset.length,
//         companyId: parseInt(companyId),
//         companyName: getCompanyName(companyId)
//       });
//     } catch (error) {
//       console.error('Get timesheets by company error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving timesheets by company', 
//         error: error.message 
//       });
//     }
//   },

//   // Get timesheets for a specific employee
//   getTimesheetsByEmployee: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { employeeId } = req.params;
//       const { status, startDate, endDate, limit, offset } = req.query;
      
//       if (!employeeId) {
//         return res.status(400).json({
//           success: false,
//           message: 'Employee ID is required'
//         });
//       }

//       let query = `
//         SELECT t.*, 
//                DATEDIFF(day, t.SubmittedDate, GETDATE()) as DaysSinceSubmission
//         FROM Timesheets t 
//         WHERE t.EmployeeId = @employeeId
//       `;
//       let inputs = [{ name: 'employeeId', type: sql.NVarChar, value: employeeId }];
      
//       if (status && status !== 'all') {
//         query += ' AND t.Status = @status';
//         inputs.push({ name: 'status', type: sql.NVarChar, value: status });
//       }
      
//       if (startDate) {
//         query += ' AND t.SubmittedDate >= @startDate';
//         inputs.push({ name: 'startDate', type: sql.Date, value: new Date(startDate) });
//       }
      
//       if (endDate) {
//         query += ' AND t.SubmittedDate <= @endDate';
//         inputs.push({ name: 'endDate', type: sql.Date, value: new Date(endDate) });
//       }
      
//       query += ' ORDER BY t.SubmittedDate DESC';
      
//       if (limit) {
//         query += ` OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`;
//       }
      
//       const request = new sql.Request();
//       inputs.forEach(input => {
//         request.input(input.name, input.type, input.value);
//       });
      
//       const result = await request.query(query);
      
//       res.json({
//         success: true,
//         data: result.recordset,
//         count: result.recordset.length,
//         employeeId: employeeId
//       });
//     } catch (error) {
//       console.error('Get timesheets by employee error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving timesheets by employee', 
//         error: error.message 
//       });
//     }
//   },

//   // Create new timesheet
//   createTimesheet: async (req, res) => {
//     try {
//       console.log('Creating timesheet request received');
//       console.log('Request body:', req.body);
      
//       await sql.connect(dbConfig);
      
//       const {
//         employeeId, companyId, name, notes, periodType, periodDates,
//         submittedDate, hours, status = 'Pending'
//       } = req.body;

//       // Validate required fields
//       if (!employeeId || !companyId || !name || !periodType || !periodDates || !submittedDate || !hours) {
//         return res.status(400).json({
//           success: false,
//           message: 'Employee ID, Company ID, Name, Period Type, Period Dates, Submitted Date, and Hours are required fields'
//         });
//       }

//       // Validate company ID
//       if (![1, 2, 3].includes(parseInt(companyId))) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid Company ID. Must be 1, 2, or 3.'
//         });
//       }

//       // Validate hours
//       if (isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Hours must be a positive number'
//         });
//       }

//       // Validate status
//       if (!isValidStatus(status)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Status must be one of: Pending, Approved, Rejected'
//         });
//       }
      
//       const request = new sql.Request();
//       request.input('employeeId', sql.NVarChar, employeeId.trim());
//       request.input('companyId', sql.Int, parseInt(companyId));
//       request.input('name', sql.NVarChar, name.trim());
//       request.input('notes', sql.NVarChar, notes ? notes.trim() : null);
//       request.input('periodType', sql.NVarChar, periodType.trim());
//       request.input('periodDates', sql.NVarChar, periodDates.trim());
//       request.input('submittedDate', sql.Date, new Date(submittedDate));
//       request.input('status', sql.NVarChar, status);
//       request.input('hours', sql.Decimal(5, 2), parseFloat(hours));
//       request.input('selected', sql.Bit, 0);
//       request.input('createdAt', sql.DateTime, new Date());
//       request.input('updatedAt', sql.DateTime, new Date());
      
//       const result = await request.query(`
//         INSERT INTO Timesheets (EmployeeId, CompanyId, Name, Notes, PeriodType, PeriodDates, 
//                                SubmittedDate, Status, Hours, Selected, CreatedAt, UpdatedAt)
//         OUTPUT INSERTED.Id
//         VALUES (@employeeId, @companyId, @name, @notes, @periodType, @periodDates, 
//                 @submittedDate, @status, @hours, @selected, @createdAt, @updatedAt)
//       `);
      
//       const timesheetId = result.recordset[0].Id;
      
//       // Get the created timesheet
//       const getRequest = new sql.Request();
//       getRequest.input('id', sql.Int, timesheetId);
//       const getResult = await getRequest.query(`
//         SELECT t.*, 
//                DATEDIFF(day, t.SubmittedDate, GETDATE()) as DaysSinceSubmission
//         FROM Timesheets t 
//         WHERE t.Id = @id
//       `);
      
//       res.status(201).json({
//         success: true,
//         message: 'Timesheet created successfully',
//         data: getResult.recordset[0]
//       });
//     } catch (error) {
//       console.error('Create timesheet error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error creating timesheet: ' + error.message, 
//         error: error.message
//       });
//     }
//   },

//   // Update timesheet
//   updateTimesheet: async (req, res) => {
//     try {
//       console.log('Updating timesheet request received');
//       console.log('Timesheet ID:', req.params.id);
//       console.log('Request body:', req.body);
      
//       await sql.connect(dbConfig);
//       const { id } = req.params;
      
//       const {
//         employeeId, companyId, name, notes, periodType, periodDates,
//         submittedDate, hours, status
//       } = req.body;

//       // Validate required fields
//       if (!employeeId || !companyId || !name || !periodType || !periodDates || !submittedDate || !hours) {
//         return res.status(400).json({
//           success: false,
//           message: 'Employee ID, Company ID, Name, Period Type, Period Dates, Submitted Date, and Hours are required fields'
//         });
//       }
      
//       // Check if timesheet exists
//       const checkRequest = new sql.Request();
//       checkRequest.input('id', sql.Int, id);
//       const checkResult = await checkRequest.query('SELECT * FROM Timesheets WHERE Id = @id');
      
//       if (checkResult.recordset.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Timesheet not found' 
//         });
//       }

//       // Validate company ID
//       if (![1, 2, 3].includes(parseInt(companyId))) {
//         return res.status(400).json({
//           success: false,
//           message: 'Invalid Company ID. Must be 1, 2, or 3.'
//         });
//       }

//       // Validate hours
//       if (isNaN(parseFloat(hours)) || parseFloat(hours) <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Hours must be a positive number'
//         });
//       }

//       // Validate status if provided
//       if (status && !isValidStatus(status)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Status must be one of: Pending, Approved, Rejected'
//         });
//       }
      
//       const request = new sql.Request();
//       request.input('id', sql.Int, id);
//       request.input('employeeId', sql.NVarChar, employeeId.trim());
//       request.input('companyId', sql.Int, parseInt(companyId));
//       request.input('name', sql.NVarChar, name.trim());
//       request.input('notes', sql.NVarChar, notes ? notes.trim() : null);
//       request.input('periodType', sql.NVarChar, periodType.trim());
//       request.input('periodDates', sql.NVarChar, periodDates.trim());
//       request.input('submittedDate', sql.Date, new Date(submittedDate));
//       request.input('hours', sql.Decimal(5, 2), parseFloat(hours));
//       request.input('updatedAt', sql.DateTime, new Date());
      
//       let updateQuery = `
//         UPDATE Timesheets 
//         SET EmployeeId = @employeeId,
//             CompanyId = @companyId,
//             Name = @name, 
//             Notes = @notes, 
//             PeriodType = @periodType, 
//             PeriodDates = @periodDates,
//             SubmittedDate = @submittedDate,
//             Hours = @hours,
//             UpdatedAt = @updatedAt
//       `;
      
//       if (status) {
//         updateQuery += ', Status = @status';
//         request.input('status', sql.NVarChar, status);
//       }
      
//       updateQuery += ' WHERE Id = @id';
      
//       const result = await request.query(updateQuery);
      
//       if (result.rowsAffected[0] === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Timesheet not found or no changes made' 
//         });
//       }
      
//       // Get updated timesheet
//       const getRequest = new sql.Request();
//       getRequest.input('id', sql.Int, id);
//       const getResult = await getRequest.query(`
//         SELECT t.*, 
//                DATEDIFF(day, t.SubmittedDate, GETDATE()) as DaysSinceSubmission
//         FROM Timesheets t 
//         WHERE t.Id = @id
//       `);
      
//       res.json({
//         success: true,
//         message: 'Timesheet updated successfully',
//         data: getResult.recordset[0]
//       });
//     } catch (error) {
//       console.error('Update timesheet error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error updating timesheet', 
//         error: error.message 
//       });
//     }
//   },

//   // Update timesheet status (approve/reject)
//   updateTimesheetStatus: async (req, res) => {
//     try {
//       console.log('=== UPDATE TIMESHEET STATUS REQUEST ===');
//       console.log('Timesheet ID:', req.params.id);
//       console.log('Request Body:', req.body);
      
//       await sql.connect(dbConfig);
//       const { id } = req.params;
//       const { status, notes } = req.body;
      
//       // Validate inputs
//       if (!id || isNaN(parseInt(id))) {
//         return res.status(400).json({
//           success: false,
//           message: 'Valid timesheet ID is required'
//         });
//       }
      
//       if (!status) {
//         return res.status(400).json({
//           success: false,
//           message: 'Status is required'
//         });
//       }
      
//       if (!isValidStatus(status)) {
//         return res.status(400).json({
//           success: false,
//           message: 'Status must be one of: Pending, Approved, Rejected'
//         });
//       }
      
//       // Check if timesheet exists first
//       const checkRequest = new sql.Request();
//       checkRequest.input('id', sql.Int, parseInt(id));
//       const checkResult = await checkRequest.query('SELECT Id, Status, EmployeeId FROM Timesheets WHERE Id = @id');
      
//       if (checkResult.recordset.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Timesheet not found' 
//         });
//       }
      
//       console.log('Found timesheet:', checkResult.recordset[0]);
      
//       // Update the status
//       const request = new sql.Request();
//       request.input('id', sql.Int, parseInt(id));
//       request.input('status', sql.NVarChar, status);
//       request.input('updatedAt', sql.DateTime, new Date());
      
//       let updateQuery = 'UPDATE Timesheets SET Status = @status, Selected = 0, UpdatedAt = @updatedAt';
      
//       if (notes) {
//         updateQuery += ', Notes = @notes';
//         request.input('notes', sql.NVarChar, notes);
//       }
      
//       updateQuery += ' WHERE Id = @id';
      
//       console.log('Executing update query...');
//       const result = await request.query(updateQuery);
      
//       console.log('Update result - rows affected:', result.rowsAffected[0]);
      
//       if (result.rowsAffected[0] === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Timesheet not found or no changes made' 
//         });
//       }
      
//       // Get updated timesheet data
//       const getRequest = new sql.Request();
//       getRequest.input('id', sql.Int, parseInt(id));
//       const getResult = await getRequest.query(`
//         SELECT t.*, 
//                DATEDIFF(day, t.SubmittedDate, GETDATE()) as DaysSinceSubmission
//         FROM Timesheets t 
//         WHERE t.Id = @id
//       `);
      
//       console.log('Updated timesheet data:', getResult.recordset[0]);
      
//       res.json({
//         success: true,
//         message: `Timesheet ${status.toLowerCase()} successfully`,
//         data: getResult.recordset[0]
//       });
//     } catch (error) {
//       console.error('=== UPDATE TIMESHEET STATUS ERROR ===');
//       console.error('Error details:', error);
      
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error updating timesheet status', 
//         error: error.message
//       });
//     }
//   },

//   // Bulk approve timesheets
//   bulkApproveTimesheets: async (req, res) => {
//     try {
//       console.log('Bulk approve timesheets request received');
//       console.log('Request body:', req.body);
      
//       await sql.connect(dbConfig);
//       const { timesheetIds, companyId, notes } = req.body;
      
//       if (!timesheetIds || !Array.isArray(timesheetIds) || timesheetIds.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Timesheet IDs array is required'
//         });
//       }
      
//       // Validate all IDs are numbers
//       const validIds = timesheetIds.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
//       if (validIds.length !== timesheetIds.length) {
//         return res.status(400).json({
//           success: false,
//           message: 'All timesheet IDs must be valid numbers'
//         });
//       }
      
//       // Build the IN clause for the SQL query
//       const placeholders = validIds.map((_, index) => `@id${index}`).join(', ');
//       const request = new sql.Request();
      
//       // Add each ID as a parameter
//       validIds.forEach((id, index) => {
//         request.input(`id${index}`, sql.Int, id);
//       });
      
//       request.input('status', sql.NVarChar, 'Approved');
//       request.input('updatedAt', sql.DateTime, new Date());
      
//       let updateQuery = `
//         UPDATE Timesheets 
//         SET Status = @status, Selected = 0, UpdatedAt = @updatedAt
//       `;
      
//       if (notes) {
//         updateQuery += ', Notes = @notes';
//         request.input('notes', sql.NVarChar, notes);
//       }
      
//       // Only update pending timesheets
//       updateQuery += ` WHERE Id IN (${placeholders}) AND Status = 'Pending'`;
      
//       if (companyId) {
//         updateQuery += ' AND CompanyId = @companyId';
//         request.input('companyId', sql.Int, parseInt(companyId));
//       }
      
//       const result = await request.query(updateQuery);
      
//       res.json({
//         success: true,
//         message: `Successfully approved ${result.rowsAffected[0]} timesheet(s)`,
//         approvedCount: result.rowsAffected[0],
//         requestedCount: validIds.length
//       });
//     } catch (error) {
//       console.error('Bulk approve timesheets error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error bulk approving timesheets', 
//         error: error.message 
//       });
//     }
//   },

//   // Bulk reject timesheets
//   bulkRejectTimesheets: async (req, res) => {
//     try {
//       console.log('Bulk reject timesheets request received');
//       console.log('Request body:', req.body);
      
//       await sql.connect(dbConfig);
//       const { timesheetIds, companyId, notes } = req.body;
      
//       if (!timesheetIds || !Array.isArray(timesheetIds) || timesheetIds.length === 0) {
//         return res.status(400).json({
//           success: false,
//           message: 'Timesheet IDs array is required'
//         });
//       }
      
//       // Validate all IDs are numbers
//       const validIds = timesheetIds.filter(id => !isNaN(parseInt(id))).map(id => parseInt(id));
//       if (validIds.length !== timesheetIds.length) {
//         return res.status(400).json({
//           success: false,
//           message: 'All timesheet IDs must be valid numbers'
//         });
//       }
      
//       // Build the IN clause for the SQL query
//       const placeholders = validIds.map((_, index) => `@id${index}`).join(', ');
//       const request = new sql.Request();
      
//       // Add each ID as a parameter
//       validIds.forEach((id, index) => {
//         request.input(`id${index}`, sql.Int, id);
//       });
      
//       request.input('status', sql.NVarChar, 'Rejected');
//       request.input('updatedAt', sql.DateTime, new Date());
      
//       let updateQuery = `
//         UPDATE Timesheets 
//         SET Status = @status, Selected = 0, UpdatedAt = @updatedAt
//       `;
      
//       if (notes) {
//         updateQuery += ', Notes = @notes';
//         request.input('notes', sql.NVarChar, notes);
//       }
      
//       // Only update pending timesheets
//       updateQuery += ` WHERE Id IN (${placeholders}) AND Status = 'Pending'`;
      
//       if (companyId) {
//         updateQuery += ' AND CompanyId = @companyId';
//         request.input('companyId', sql.Int, parseInt(companyId));
//       }
      
//       const result = await request.query(updateQuery);
      
//       res.json({
//         success: true,
//         message: `Successfully rejected ${result.rowsAffected[0]} timesheet(s)`,
//         rejectedCount: result.rowsAffected[0],
//         requestedCount: validIds.length
//       });
//     } catch (error) {
//       console.error('Bulk reject timesheets error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error bulk rejecting timesheets', 
//         error: error.message 
//       });
//     }
//   },

//   // Toggle timesheet selection
//   toggleTimesheetSelection: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { id } = req.params;
//       const { selected } = req.body;
      
//       if (!id || isNaN(parseInt(id))) {
//         return res.status(400).json({
//           success: false,
//           message: 'Valid timesheet ID is required'
//         });
//       }
      
//       // Check if timesheet exists and is pending
//       const checkRequest = new sql.Request();
//       checkRequest.input('id', sql.Int, parseInt(id));
//       const checkResult = await checkRequest.query(`
//         SELECT Id, Status, Selected FROM Timesheets WHERE Id = @id
//       `);
      
//       if (checkResult.recordset.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Timesheet not found' 
//         });
//       }
      
//       const timesheet = checkResult.recordset[0];
      
//       // Only allow selection toggle for pending timesheets
//       if (timesheet.Status !== 'Pending') {
//         return res.status(400).json({
//           success: false,
//           message: 'Only pending timesheets can be selected/deselected'
//         });
//       }
      
//       const newSelected = selected !== undefined ? selected : !timesheet.Selected;
      
//       const request = new sql.Request();
//       request.input('id', sql.Int, parseInt(id));
//       request.input('selected', sql.Bit, newSelected);
//       request.input('updatedAt', sql.DateTime, new Date());
      
//       const result = await request.query(`
//         UPDATE Timesheets 
//         SET Selected = @selected, UpdatedAt = @updatedAt
//         WHERE Id = @id
//       `);
      
//       if (result.rowsAffected[0] === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Timesheet not found or no changes made' 
//         });
//       }
      
//       // Get updated timesheet
//       const getRequest = new sql.Request();
//       getRequest.input('id', sql.Int, parseInt(id));
//       const getResult = await getRequest.query(`
//         SELECT t.*, 
//                DATEDIFF(day, t.SubmittedDate, GETDATE()) as DaysSinceSubmission
//         FROM Timesheets t 
//         WHERE t.Id = @id
//       `);
      
//       res.json({
//         success: true,
//         message: `Timesheet ${newSelected ? 'selected' : 'deselected'} successfully`,
//         data: getResult.recordset[0]
//       });
//     } catch (error) {
//       console.error('Toggle timesheet selection error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error toggling timesheet selection', 
//         error: error.message 
//       });
//     }
//   },

//   // Delete timesheet
//   deleteTimesheet: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { id } = req.params;
      
//       // Check if timesheet exists
//       const checkRequest = new sql.Request();
//       checkRequest.input('id', sql.Int, id);
//       const checkResult = await checkRequest.query('SELECT * FROM Timesheets WHERE Id = @id');
      
//       if (checkResult.recordset.length === 0) {
//         return res.status(404).json({ 
//           success: false, 
//           message: 'Timesheet not found' 
//         });
//       }
      
//       const request = new sql.Request();
//       request.input('id', sql.Int, id);
      
//       const result = await request.query('DELETE FROM Timesheets WHERE Id = @id');
      
//       res.json({
//         success: true,
//         message: 'Timesheet deleted successfully'
//       });
//     } catch (error) {
//       console.error('Delete timesheet error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error deleting timesheet', 
//         error: error.message 
//       });
//     }
//   },

//   // Get timesheet statistics
//   getTimesheetStats: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { companyId, employeeId, startDate, endDate } = req.query;
      
//       let query = `
//         SELECT 
//           COUNT(*) as total,
//           SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as pending,
//           SUM(CASE WHEN Status = 'Approved' THEN 1 ELSE 0 END) as approved,
//           SUM(CASE WHEN Status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
//           SUM(CASE WHEN Status = 'Pending' AND Selected = 1 THEN 1 ELSE 0 END) as selectedPending,
//           SUM(Hours) as totalHours,
//           AVG(Hours) as avgHours,
//           COUNT(DISTINCT EmployeeId) as uniqueEmployees
//         FROM Timesheets
//         WHERE 1=1
//       `;
      
//       let inputs = [];
      
//       if (companyId) {
//         query += ' AND CompanyId = @companyId';
//         inputs.push({ name: 'companyId', type: sql.Int, value: parseInt(companyId) });
//       }
      
//       if (employeeId) {
//         query += ' AND EmployeeId = @employeeId';
//         inputs.push({ name: 'employeeId', type: sql.NVarChar, value: employeeId });
//       }
      
//       if (startDate) {
//         query += ' AND SubmittedDate >= @startDate';
//         inputs.push({ name: 'startDate', type: sql.Date, value: new Date(startDate) });
//       }
      
//       if (endDate) {
//         query += ' AND SubmittedDate <= @endDate';
//         inputs.push({ name: 'endDate', type: sql.Date, value: new Date(endDate) });
//       }
      
//       const request = new sql.Request();
//       inputs.forEach(input => {
//         request.input(input.name, input.type, input.value);
//       });
      
//       const result = await request.query(query);
      
//       res.json({
//         success: true,
//         data: result.recordset[0]
//       });
//     } catch (error) {
//       console.error('Get timesheet stats error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving timesheet statistics', 
//         error: error.message 
//       });
//     }
//   },

//   // Get pending timesheets (for notifications)
//   getPendingTimesheets: async (req, res) => {
//     try {
//       await sql.connect(dbConfig);
//       const { companyId, limit = 50 } = req.query;
      
//       let query = `
//         SELECT TOP (@limit) t.*, 
//                DATEDIFF(day, t.SubmittedDate, GETDATE()) as DaysSinceSubmission
//         FROM Timesheets t 
//         WHERE t.Status = 'Pending'
//       `;
//       let inputs = [{ name: 'limit', type: sql.Int, value: parseInt(limit) }];
      
//       if (companyId) {
//         query += ' AND t.CompanyId = @companyId';
//         inputs.push({ name: 'companyId', type: sql.Int, value: parseInt(companyId) });
//       }
      
//       query += ' ORDER BY t.SubmittedDate ASC';
      
//       const request = new sql.Request();
//       inputs.forEach(input => {
//         request.input(input.name, input.type, input.value);
//       });
      
//       const result = await request.query(query);
      
//       res.json({
//         success: true,
//         data: result.recordset,
//         count: result.recordset.length
//       });
//     } catch (error) {
//       console.error('Get pending timesheets error:', error);
//       res.status(500).json({ 
//         success: false, 
//         message: 'Error retrieving pending timesheets', 
//         error: error.message 
//       });
//     }
//   }
// };

// module.exports = timesheetController;





// controllers/managerTimesheetController.js - Complete Fixed Version
// controllers/managerTimesheetController.js - Complete Fixed Version
const { poolPromise, sql } = require("../../config/db");


// Helper function to get employee table based on company ID
const getEmployeeTable = (companyId) => {
  const tableMap = {
    5: 'CognifyarEmployees',
    3: 'ProphecyOffshoreEmployees', 
    2: 'ProphecyConsultingEmployees'
  };
  return tableMap[parseInt(companyId)] || 'CognifyarEmployees';
};

// Get all timesheets for a specific company (Manager View)
const getCompanyTimesheets = async (req, res) => {
  try {
    const pool = await poolPromise;
    const companyId = req.params.companyId;
    
    console.log('═══════════════════════════════════════');
    console.log('🎯 getCompanyTimesheets CALLED');
    console.log('═══════════════════════════════════════');
    console.log('Company ID:', companyId);
    console.log('Timestamp:', new Date().toISOString());
    console.log('User ID:', req.user?.id);
    
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
      ORDER BY 
        CASE 
          WHEN t.Status = 'Pending' THEN 1
          WHEN t.Status = 'Approved' THEN 2
          WHEN t.Status = 'Rejected' THEN 3
          ELSE 4
        END,
        t.Year DESC, 
        t.Month DESC, 
        t.CreatedAt DESC
    `;

    console.log('📝 Executing SQL Query...');

    const result = await pool.request()
      .input('companyId', sql.Int, parseInt(companyId))
      .query(query);

    console.log('✅ Query executed successfully');
    console.log('📊 Records found:', result.recordset.length);
    
    if (result.recordset.length > 0) {
      console.log('📋 First record sample:', JSON.stringify(result.recordset[0], null, 2));
      console.log('📊 Status breakdown:');
      const statusCounts = result.recordset.reduce((acc, record) => {
        acc[record.Status] = (acc[record.Status] || 0) + 1;
        return acc;
      }, {});
      console.log('   ', statusCounts);
    } else {
      console.log('⚠️ No timesheets found for company ID:', companyId);
      console.log('   This could mean:');
      console.log('   - No employees have submitted timesheets yet');
      console.log('   - The CompanyId in Timesheets table doesn\'t match');
      console.log('   - The employee table mapping is incorrect');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ RETURNING TIMESHEETS');
    console.log('═══════════════════════════════════════\n');

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
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════\n');
    
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching company timesheets", 
      error: error.message 
    });
  }
};

// Get timesheet statistics for a company
const getTimesheetStats = async (req, res) => {
  try {
    const pool = await poolPromise;
    const companyId = req.params.companyId;
    
    console.log('📊 Getting timesheet stats for company:', companyId);

    const query = `
      SELECT 
        COUNT(*) as totalTimesheets,
        SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as pendingCount,
        SUM(CASE WHEN Status = 'Approved' THEN 1 ELSE 0 END) as approvedCount,
        SUM(CASE WHEN Status = 'Rejected' THEN 1 ELSE 0 END) as rejectedCount,
        SUM(TotalHours) as totalHours,
        SUM(OvertimeHours) as totalOvertimeHours
      FROM Timesheets
      WHERE CompanyId = @companyId
    `;

    const result = await pool.request()
      .input('companyId', sql.Int, parseInt(companyId))
      .query(query);

    const stats = result.recordset[0] || {
      totalTimesheets: 0,
      pendingCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
      totalHours: 0,
      totalOvertimeHours: 0
    };

    console.log('✅ Stats retrieved:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching timesheet stats:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching timesheet statistics",
      error: error.message
    });
  }
};

// Get specific timesheet details with entries
const getTimesheetDetails = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { companyId, timesheetId } = req.params;
    
    console.log('📋 Getting timesheet details:', { companyId, timesheetId });

    const employeeTable = getEmployeeTable(companyId);

    // Get timesheet with employee info
    const timesheetQuery = `
      SELECT 
        t.*,
        e.Name as EmployeeName,
        e.Email as EmployeeEmail,
        e.Department,
        e.Position,
        approver.username as ApproverName
      FROM Timesheets t
      LEFT JOIN ${employeeTable} e ON t.EmployeeId = e.EmployeeId
      LEFT JOIN userinfo approver ON t.ApprovedBy = approver.id
      WHERE t.Id = @timesheetId AND t.CompanyId = @companyId
    `;

    const timesheetResult = await pool.request()
      .input('timesheetId', sql.Int, parseInt(timesheetId))
      .input('companyId', sql.Int, parseInt(companyId))
      .query(timesheetQuery);

    if (timesheetResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found"
      });
    }

    const timesheet = timesheetResult.recordset[0];

    // Get timesheet entries
    const entriesQuery = `
      SELECT * FROM TimesheetEntries
      WHERE TimesheetId = @timesheetId
      ORDER BY Date ASC
    `;

    const entriesResult = await pool.request()
      .input('timesheetId', sql.Int, parseInt(timesheetId))
      .query(entriesQuery);

    timesheet.entries = entriesResult.recordset;

    console.log('✅ Timesheet details retrieved with', entriesResult.recordset.length, 'entries');

    res.status(200).json({
      success: true,
      data: timesheet
    });
  } catch (error) {
    console.error('Error fetching timesheet details:', error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching timesheet details",
      error: error.message
    });
  }
};

// Approve a timesheet
const approveTimesheet = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { companyId, timesheetId } = req.params;
    const approverId = req.user?.id;
    
    console.log('✅ Approving timesheet:', { companyId, timesheetId, approverId });

    // Verify timesheet exists and belongs to the company
    const checkQuery = `
      SELECT Id, Status, EmployeeId 
      FROM Timesheets 
      WHERE Id = @timesheetId AND CompanyId = @companyId
    `;

    const checkResult = await pool.request()
      .input('timesheetId', sql.Int, parseInt(timesheetId))
      .input('companyId', sql.Int, parseInt(companyId))
      .query(checkQuery);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found for this company"
      });
    }

    const timesheet = checkResult.recordset[0];

    if (timesheet.Status === 'Approved') {
      return res.status(400).json({
        success: false,
        message: "Timesheet is already approved"
      });
    }

    // Update timesheet status
    const updateQuery = `
      UPDATE Timesheets
      SET Status = 'Approved',
          ApprovedBy = @approverId,
          ApprovedAt = GETDATE(),
          UpdatedAt = GETDATE()
      WHERE Id = @timesheetId
    `;

    await pool.request()
      .input('timesheetId', sql.Int, parseInt(timesheetId))
      .input('approverId', sql.Int, approverId)
      .query(updateQuery);

    console.log('✅ Timesheet approved successfully');

    res.status(200).json({
      success: true,
      message: "Timesheet approved successfully"
    });
  } catch (error) {
    console.error('Error approving timesheet:', error);
    res.status(500).json({
      success: false,
      message: "Server error while approving timesheet",
      error: error.message
    });
  }
};

// Reject a timesheet
const rejectTimesheet = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { companyId, timesheetId } = req.params;
    const { reason } = req.body;
    const approverId = req.user?.id;
    
    console.log('❌ Rejecting timesheet:', { companyId, timesheetId, approverId, reason });

    // Verify timesheet exists and belongs to the company
    const checkQuery = `
      SELECT Id, Status, EmployeeId 
      FROM Timesheets 
      WHERE Id = @timesheetId AND CompanyId = @companyId
    `;

    const checkResult = await pool.request()
      .input('timesheetId', sql.Int, parseInt(timesheetId))
      .input('companyId', sql.Int, parseInt(companyId))
      .query(checkQuery);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Timesheet not found for this company"
      });
    }

    const timesheet = checkResult.recordset[0];

    if (timesheet.Status === 'Rejected') {
      return res.status(400).json({
        success: false,
        message: "Timesheet is already rejected"
      });
    }

    // Update timesheet status
    const updateQuery = `
      UPDATE Timesheets
      SET Status = 'Rejected',
          ApprovedBy = @approverId,
          ApprovedAt = GETDATE(),
          Notes = @reason,
          UpdatedAt = GETDATE()
      WHERE Id = @timesheetId
    `;

    await pool.request()
      .input('timesheetId', sql.Int, parseInt(timesheetId))
      .input('approverId', sql.Int, approverId)
      .input('reason', sql.NVarChar, reason || 'No reason provided')
      .query(updateQuery);

    console.log('✅ Timesheet rejected successfully');

    res.status(200).json({
      success: true,
      message: "Timesheet rejected successfully"
    });
  } catch (error) {
    console.error('Error rejecting timesheet:', error);
    res.status(500).json({
      success: false,
      message: "Server error while rejecting timesheet",
      error: error.message
    });
  }
};

// Bulk approve timesheets
const bulkApproveTimesheets = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { timesheetIds, companyId } = req.body;
    const approverId = req.user?.id;
    
    console.log('✅ Bulk approving timesheets:', { count: timesheetIds?.length, companyId, approverId });

    if (!timesheetIds || !Array.isArray(timesheetIds) || timesheetIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of timesheet IDs"
      });
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required"
      });
    }

    // Convert array to comma-separated string for SQL IN clause
    const idList = timesheetIds.map(id => parseInt(id)).join(',');

    // Update all timesheets at once
    const updateQuery = `
      UPDATE Timesheets
      SET Status = 'Approved',
          ApprovedBy = @approverId,
          ApprovedAt = GETDATE(),
          UpdatedAt = GETDATE()
      WHERE Id IN (${idList})
        AND CompanyId = @companyId
        AND Status = 'Pending'
    `;

    const result = await pool.request()
      .input('approverId', sql.Int, approverId)
      .input('companyId', sql.Int, parseInt(companyId))
      .query(updateQuery);

    const approvedCount = result.rowsAffected[0];

    console.log('✅ Bulk approval completed:', approvedCount, 'timesheets approved');

    res.status(200).json({
      success: true,
      message: `Successfully approved ${approvedCount} timesheet(s)`,
      approvedCount
    });
  } catch (error) {
    console.error('Error bulk approving timesheets:', error);
    res.status(500).json({
      success: false,
      message: "Server error while bulk approving timesheets",
      error: error.message
    });
  }
};

// Bulk reject timesheets
const bulkRejectTimesheets = async (req, res) => {
  try {
    const pool = await poolPromise;
    const { timesheetIds, companyId, reason } = req.body;
    const approverId = req.user?.id;
    
    console.log('❌ Bulk rejecting timesheets:', { count: timesheetIds?.length, companyId, approverId });

    if (!timesheetIds || !Array.isArray(timesheetIds) || timesheetIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of timesheet IDs"
      });
    }

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required"
      });
    }

    // Convert array to comma-separated string for SQL IN clause
    const idList = timesheetIds.map(id => parseInt(id)).join(',');

    // Update all timesheets at once
    const updateQuery = `
      UPDATE Timesheets
      SET Status = 'Rejected',
          ApprovedBy = @approverId,
          ApprovedAt = GETDATE(),
          Notes = @reason,
          UpdatedAt = GETDATE()
      WHERE Id IN (${idList})
        AND CompanyId = @companyId
        AND Status = 'Pending'
    `;

    const result = await pool.request()
      .input('approverId', sql.Int, approverId)
      .input('companyId', sql.Int, parseInt(companyId))
      .input('reason', sql.NVarChar, reason || 'Bulk rejection')
      .query(updateQuery);

    const rejectedCount = result.rowsAffected[0];

    console.log('✅ Bulk rejection completed:', rejectedCount, 'timesheets rejected');

    res.status(200).json({
      success: true,
      message: `Successfully rejected ${rejectedCount} timesheet(s)`,
      rejectedCount
    });
  } catch (error) {
    console.error('Error bulk rejecting timesheets:', error);
    res.status(500).json({
      success: false,
      message: "Server error while bulk rejecting timesheets",
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  getCompanyTimesheets,
  getTimesheetStats,
  getTimesheetDetails,
  approveTimesheet,
  rejectTimesheet,
  bulkApproveTimesheets,
  bulkRejectTimesheets
};