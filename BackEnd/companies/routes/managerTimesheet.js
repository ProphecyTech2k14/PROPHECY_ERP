// // routes/timesheetRoutes.js - Timesheet Routes for Manager Timesheet System
// const express = require('express');
// const router = express.Router();
// const timesheetController = require('../controllers/timesheetController');
// const { authenticateToken } = require('../../Recruitment/middleWare/authMiddleware');

// // Middleware to log all requests
// router.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] Timesheet Route: ${req.method} ${req.originalUrl}`);
//   console.log('Query params:', req.query);
//   if (req.method !== 'GET') {
//     console.log('Body:', req.body);
//   }
//   next();
// });

// // Apply authentication middleware to all routes except test endpoints
// router.use((req, res, next) => {
//   // Skip auth for test endpoints
//   if (req.path === '/test/connection') {
//     return next();
//   }
//   return authenticateToken(req, res, next);
// });

// // TEST ENDPOINT - Check database connection (no auth required)
// router.get('/test/connection', timesheetController.testConnection);

// // Timesheet management routes

// // GET /api/timesheets/pending - Get pending timesheets (for notifications)
// router.get('/pending', timesheetController.getPendingTimesheets);

// // GET /api/timesheets/stats - Get timesheet statistics
// router.get('/stats', timesheetController.getTimesheetStats);

// // GET /api/timesheets/company/:companyId - Get timesheets for a specific company
// router.get('/company/:companyId', timesheetController.getTimesheetsByCompany);

// // GET /api/timesheets/employee/:employeeId - Get timesheets for a specific employee
// router.get('/employee/:employeeId', timesheetController.getTimesheetsByEmployee);

// // POST /api/timesheets/bulk/approve - Bulk approve timesheets
// router.post('/bulk/approve', (req, res, next) => {
//   console.log('=== BULK APPROVE ROUTE MIDDLEWARE DEBUG ===');
//   console.log('Request body:', req.body);
//   console.log('Headers:', req.headers);
//   next();
// }, timesheetController.bulkApproveTimesheets);

// // POST /api/timesheets/bulk/reject - Bulk reject timesheets
// router.post('/bulk/reject', (req, res, next) => {
//   console.log('=== BULK REJECT ROUTE MIDDLEWARE DEBUG ===');
//   console.log('Request body:', req.body);
//   console.log('Headers:', req.headers);
//   next();
// }, timesheetController.bulkRejectTimesheets);

// // GET /api/timesheets - Get all timesheets with optional filters
// router.get('/', timesheetController.getAllTimesheets);

// // GET /api/timesheets/:id - Get single timesheet by ID
// router.get('/:id', timesheetController.getTimesheetById);

// // POST /api/timesheets - Create new timesheet
// router.post('/', timesheetController.createTimesheet);

// // PUT /api/timesheets/:id - Update timesheet
// router.put('/:id', timesheetController.updateTimesheet);

// // PATCH /api/timesheets/:id/status - Update timesheet status (approve/reject)
// router.patch('/:id/status', (req, res, next) => {
//   console.log('=== TIMESHEET STATUS ROUTE MIDDLEWARE DEBUG ===');
//   console.log('Timesheet ID:', req.params.id);
//   console.log('Body:', req.body);
//   console.log('Headers:', req.headers);
//   next();
// }, timesheetController.updateTimesheetStatus);

// // PATCH /api/timesheets/:id/select - Toggle timesheet selection
// router.patch('/:id/select', timesheetController.toggleTimesheetSelection);

// // DELETE /api/timesheets/:id - Delete timesheet
// router.delete('/:id', timesheetController.deleteTimesheet);

// // Error handling middleware
// router.use((error, req, res, next) => {
//   console.error('Timesheet route error:', error);
//   res.status(500).json({
//     success: false,
//     message: 'Internal server error in timesheet routes',
//     error: error.message
//   });
// });

// module.exports = router;



// routes/managerTimesheetRoutes.js - Manager Timesheet Approval Routes
const express = require('express');
const router = express.Router();
const managerTimesheetController = require('../controllers/managerTimesheetController');
const { authenticateToken } = require('../../Recruitment/middleWare/authMiddleware');

// Middleware to log all requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Manager Timesheet Route: ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  if (req.method !== 'GET') {
    console.log('Body:', req.body);
  }
  next();
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// IMPORTANT: More specific routes MUST come BEFORE generic routes with parameters

// Bulk operations (most specific)
router.post('/bulk/approve', managerTimesheetController.bulkApproveTimesheets);
router.post('/bulk/reject', managerTimesheetController.bulkRejectTimesheets);

// Company-specific routes
// GET /api/timesheets/company/:companyId - Get all timesheets for a company
router.get('/company/:companyId', managerTimesheetController.getCompanyTimesheets);

// GET /api/timesheets/company/:companyId/stats - Get timesheet statistics
router.get('/company/:companyId/stats', managerTimesheetController.getTimesheetStats);

// GET /api/timesheets/company/:companyId/:timesheetId - Get specific timesheet details
router.get('/company/:companyId/:timesheetId', managerTimesheetController.getTimesheetDetails);

// PATCH /api/timesheets/company/:companyId/:timesheetId/approve - Approve timesheet
router.patch('/company/:companyId/:timesheetId/approve', managerTimesheetController.approveTimesheet);

// PATCH /api/timesheets/company/:companyId/:timesheetId/reject - Reject timesheet
router.patch('/company/:companyId/:timesheetId/reject', managerTimesheetController.rejectTimesheet);

// Legacy routes for backward compatibility (these handle timesheets without company context)
// PATCH /api/timesheets/:id/status - Update timesheet status (approve/reject)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const timesheetId = req.params.id;
    
    // Get timesheet to find its company
    const { poolPromise, sql } = require('../../config/db');
    const pool = await poolPromise;
    
    const request = pool.request();
    request.input('id', sql.Int, parseInt(timesheetId));
    
    const result = await request.query(`
      SELECT CompanyId FROM Timesheets WHERE Id = @id
    `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet not found'
      });
    }
    
    const companyId = result.recordset[0].CompanyId;
    
    // Redirect to appropriate handler
    if (status === 'Approved') {
      req.params.companyId = companyId;
      req.params.timesheetId = timesheetId;
      return managerTimesheetController.approveTimesheet(req, res);
    } else if (status === 'Rejected') {
      req.params.companyId = companyId;
      req.params.timesheetId = timesheetId;
      req.body.reason = req.body.reason || 'Timesheet rejected';
      return managerTimesheetController.rejectTimesheet(req, res);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "Approved" or "Rejected"'
      });
    }
  } catch (error) {
    console.error('Update timesheet status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating timesheet status',
      error: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Manager timesheet route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in manager timesheet routes',
    error: error.message
  });
});

console.log('✅ Manager timesheet routes registered successfully');

module.exports = router;