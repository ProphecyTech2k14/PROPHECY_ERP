  // routes/employeeRoutes.js - Employee Routes for Manager Timesheet System
  const express = require('express');
  const router = express.Router();
  const employeeController = require('../controllers/employeeController');
  const { authenticateToken } = require('../../Recruitment/middleWare/authMiddleware');

  // Middleware to log all requests
  router.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Employee Route: ${req.method} ${req.originalUrl}`);
    console.log('Query params:', req.query);
    console.log('Route params:', req.params);
    if (req.method !== 'GET') {
      console.log('Body:', req.body);
    }
    next();
  });

  // Apply authentication middleware to all routes except test endpoints
  router.use((req, res, next) => {
    // Skip auth for test endpoints
    if (req.path === '/test/connection') {
      return next();
    }
    return authenticateToken(req, res, next);
  });

  // ============================================
  // TEST ENDPOINTS
  // ============================================

  // GET /api/employees/test/connection - Check database connection (no auth required)
  router.get('/test/connection', employeeController.testConnection);

  // ============================================
  // EMPLOYEE SEARCH & STATS ROUTES
  // (These must come BEFORE parameterized routes)
  // ============================================

  // GET /api/employees/company/:companyId/search - Search employees in a company
  router.get('/company/:companyId/search', employeeController.searchEmployees);

  // GET /api/employees/company/:companyId/stats - Get employee statistics for a company
  router.get('/company/:companyId/stats', employeeController.getEmployeeStats);

  // GET /api/employees/company/:companyId/department/:department - Get employees by department
  router.get('/company/:companyId/department/:department', employeeController.getEmployeesByDepartment);

  // ============================================
  // EMPLOYEE DETAIL PAGE ROUTES
  // (Specific routes before generic :employeeId routes)
  // ============================================

  // GET /api/employees/company/:companyId/:employeeId/details - Get employee with all related data
  router.get('/company/:companyId/:employeeId/details', employeeController.getEmployeeDetails);

  // GET /api/employees/company/:companyId/:employeeId/stats - Get employee statistics
  router.get('/company/:companyId/:employeeId/stats', employeeController.getEmployeeDetails);

  // ============================================
  // INTERNAL TIMESHEETS ROUTES
  // ============================================

  // GET /api/employees/company/:companyId/:employeeId/timesheets - Get internal timesheets
  router.get('/company/:companyId/:employeeId/timesheets', employeeController.getEmployeeTimesheets);

  // ============================================
  // EXTERNAL TIMESHEETS ROUTES
  // ============================================

  // GET /api/employees/company/:companyId/:employeeId/external-timesheets - Get external timesheets
  router.get('/company/:companyId/:employeeId/external-timesheets', 
    employeeController.getEmployeeExternalTimesheets);


  // POST /api/employees/company/:companyId/:employeeId/external-timesheets/:timesheetId/approve - Approve external timesheet
  router.post('/company/:companyId/:employeeId/external-timesheets/:timesheetId/approve',
    employeeController.approveExternalTimesheet);


  // POST /api/employees/company/:companyId/:employeeId/external-timesheets/:timesheetId/reject - Reject external timesheet
  router.post('/company/:companyId/:employeeId/external-timesheets/:timesheetId/reject',
    employeeController.rejectExternalTimesheet);

  // GET /api/employees/company/:companyId/:employeeId/external-timesheets/:timesheetId/download - Download external timesheet
  router.get('/company/:companyId/:employeeId/external-timesheets/:timesheetId/download',
    employeeController.downloadExternalTimesheet);

  // DELETE /api/employees/company/:companyId/:employeeId/external-timesheets/:timesheetId - Delete external timesheet
  router.delete('/company/:companyId/:employeeId/external-timesheets/:timesheetId', 
    employeeController.deleteExternalTimesheet);
  // ============================================
  // PAYROLL STATEMENTS ROUTES
  // ============================================

  // GET /api/employees/company/:companyId/:employeeId/statements - Get payroll statements
  router.get('/company/:companyId/:employeeId/statements', employeeController.getEmployeeStatements);

  // POST /api/employees/company/:companyId/:employeeId/statements - Create new statement
  router.post('/company/:companyId/:employeeId/statements', (req, res) => {
    // This would need to be implemented in employeeController if needed
    res.status(501).json({
      success: false,
      message: 'Statement creation endpoint not yet implemented'
    });
  });

  // DELETE /api/employees/company/:companyId/:employeeId/statements/:statementId - Delete statement
  router.delete('/company/:companyId/:employeeId/statements/:statementId', 
    employeeController.deleteStatement);

  // ============================================
  // REPORTS ROUTES
  // ============================================

  // GET /api/employees/company/:companyId/:employeeId/reports - Get reports
  router.get('/company/:companyId/:employeeId/reports', employeeController.getEmployeeReports);

  // POST /api/employees/company/:companyId/:employeeId/reports - Upload new report
  router.post('/company/:companyId/:employeeId/reports', (req, res) => {
    // This would need to be implemented in employeeController if needed
    res.status(501).json({
      success: false,
      message: 'Report upload endpoint not yet implemented'
    });
  });

  // DELETE /api/employees/company/:companyId/:employeeId/reports/:reportId - Delete report
  router.delete('/company/:companyId/:employeeId/reports/:reportId', 
    employeeController.deleteReport);

  // ============================================
  // EMPLOYEE CRUD ROUTES
  // ============================================

  // GET /api/employees/company/:companyId - Get all employees for a company
  router.get('/company/:companyId', employeeController.getAllEmployees);

  // POST /api/employees/company/:companyId - Create new employee in a company
  router.post('/company/:companyId', employeeController.createEmployee);

  // GET /api/employees/company/:companyId/:employeeId - Get single employee by company and employee ID
  router.get('/company/:companyId/:employeeId', employeeController.getEmployeeById);

  // PUT /api/employees/company/:companyId/:employeeId - Update employee
  router.put('/company/:companyId/:employeeId', employeeController.updateEmployee);

  // PATCH /api/employees/company/:companyId/:employeeId/status - Update employee status only
  router.patch('/company/:companyId/:employeeId/status', (req, res, next) => {
    console.log('=== EMPLOYEE STATUS ROUTE MIDDLEWARE DEBUG ===');
    console.log('Company ID:', req.params.companyId);
    console.log('Employee ID:', req.params.employeeId);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    next();
  }, employeeController.updateEmployeeStatus);

  // DELETE /api/employees/company/:companyId/:employeeId - Delete employee
  router.delete('/company/:companyId/:employeeId', employeeController.deleteEmployee);

  // ============================================
  // ERROR HANDLING
  // ============================================

  // Error handling middleware
  router.use((error, req, res, next) => {
    console.error('Employee route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error in employee routes',
      error: error.message
    });
  });

  // ============================================
  // ROUTE REGISTRATION LOG
  // ============================================

  console.log('✅ Employee routes registered successfully');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('REGISTERED EMPLOYEE ROUTES:');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('TEST:');
  console.log('  GET    /api/employees/test/connection');
  console.log('');
  console.log('SEARCH & STATS:');
  console.log('  GET    /api/employees/company/:companyId/search');
  console.log('  GET    /api/employees/company/:companyId/stats');
  console.log('  GET    /api/employees/company/:companyId/department/:department');
  console.log('');
  console.log('EMPLOYEE DETAILS:');
  console.log('  GET    /api/employees/company/:companyId/:employeeId/details');
  console.log('  GET    /api/employees/company/:companyId/:employeeId/stats');
  console.log('');
  console.log('INTERNAL TIMESHEETS:');
  console.log('  GET    /api/employees/company/:companyId/:employeeId/timesheets');
  console.log('');
  console.log('EXTERNAL TIMESHEETS:');
  console.log('  GET    /api/employees/company/:companyId/:employeeId/external-timesheets');
  console.log('  PATCH  /api/employees/company/:companyId/:employeeId/external-timesheets/:timesheetId/approve');
  console.log('  PATCH  /api/employees/company/:companyId/:employeeId/external-timesheets/:timesheetId/reject');
  console.log('  GET    /api/employees/company/:companyId/:employeeId/external-timesheets/:timesheetId/download');
  console.log('  DELETE /api/employees/company/:companyId/:employeeId/external-timesheets/:timesheetId');
  console.log('');
  console.log('STATEMENTS:');
  console.log('  GET    /api/employees/company/:companyId/:employeeId/statements');
  console.log('  DELETE /api/employees/company/:companyId/:employeeId/statements/:statementId');
  console.log('');
  console.log('REPORTS:');
  console.log('  GET    /api/employees/company/:companyId/:employeeId/reports');
  console.log('  DELETE /api/employees/company/:companyId/:employeeId/reports/:reportId');
  console.log('');
  console.log('EMPLOYEE CRUD:');
  console.log('  GET    /api/employees/company/:companyId');
  console.log('  POST   /api/employees/company/:companyId');
  console.log('  GET    /api/employees/company/:companyId/:employeeId');
  console.log('  PUT    /api/employees/company/:companyId/:employeeId');
  console.log('  PATCH  /api/employees/company/:companyId/:employeeId/status');
  console.log('  DELETE /api/employees/company/:companyId/:employeeId');
  console.log('═══════════════════════════════════════════════════════════');

  module.exports = router;