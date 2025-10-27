// routes/companyRoutes.js - Company Routes for Account Manager
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken } = require('../../Recruitment/middleWare/authMiddleware');

// Middleware to log all requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  console.log('Body:', req.body);
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

router.patch('/:id/status', (req, res, next) => {
  console.log('=== ROUTE MIDDLEWARE DEBUG ===');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  console.log('Headers:', req.headers);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  next();
}, companyController.updateCompanyStatus);

// TEST ENDPOINT - Check database connection (no auth required)
router.get('/test/connection', companyController.testConnection);

// GET /api/companies/filter/status/:status - Get companies by status (Active, Inactive, Pending)
router.get('/filter/status/:status', companyController.getCompaniesByStatus);

// GET /api/companies/manager/:managerId - Get companies by account manager
router.get('/manager/:managerId', companyController.getCompaniesByManager);

// GET /api/companies/search - Search companies by name, client ID, or type
router.get('/search', companyController.searchCompanies);

// GET /api/companies/stats - Get company statistics for dashboard
router.get('/stats', companyController.getCompanyStats);

// GET /api/companies/payroll/due - Get companies with payroll due soon
router.get('/payroll/due', companyController.getCompaniesWithPayrollDue);

// GET /api/companies - Get all companies with optional filters
router.get('/', companyController.getAllCompanies);

// GET /api/companies/:id - Get single company by ID
router.get('/:id', companyController.getCompanyById);

// POST /api/companies - Create new company
router.post('/', companyController.createCompany);

// PUT /api/companies/:id - Update company
router.put('/:id', companyController.updateCompany);

// PATCH /api/companies/:id/status - Update company status only
router.patch('/:id/status', companyController.updateCompanyStatus);

// DELETE /api/companies/:id - Delete company
router.delete('/:id', companyController.deleteCompany);

// POST /api/companies/:id/send-reminder - Send payroll reminder
router.post('/:id/send-reminder', companyController.sendPayrollReminder);

// GET /api/companies/:id/export - Export company data
router.get('/:id/export', companyController.exportCompanyData);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

module.exports = router;