// routes/projectsRoutes.js - Projects Routes
const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const { authenticateToken } = require('../../Recruitment/middleWare/authMiddleware');

// Middleware to log all requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Projects Route: ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
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

// Projects management routes

// TEST ENDPOINT - Check database connection (no auth required)
router.get('/test/connection', projectsController.testConnection);

// GET /api/projects - Get all projects for company
router.get('/', projectsController.getProjects);

// POST /api/projects - Create new project
router.post('/', (req, res, next) => {
  console.log('=== CREATE PROJECT ROUTE MIDDLEWARE DEBUG ===');
  console.log('Request body:', req.body);
  console.log('User:', req.user);
  next();
}, projectsController.createProject);

// GET /api/projects/:id - Get project by ID
router.get('/:id', projectsController.getProjectById);

// PUT /api/projects/:id - Update project
router.put('/:id', (req, res, next) => {
  console.log('=== UPDATE PROJECT ROUTE MIDDLEWARE DEBUG ===');
  console.log('Project ID:', req.params.id);
  console.log('Body:', req.body);
  console.log('User:', req.user);
  next();
}, projectsController.updateProject);

// DELETE /api/projects/:id - Delete project (soft delete)
router.delete('/:id', projectsController.deleteProject);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Projects route error:', error);
  
  res.status(500).json({
    success: false,
    message: 'Internal server error in projects routes',
    error: error.message
  });
});

module.exports = router;