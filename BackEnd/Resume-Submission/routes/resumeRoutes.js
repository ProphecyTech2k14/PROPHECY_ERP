const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const resumeController = require('../controllers/resumeController');
const { single } = require('../middleware/resumeUpload');
const { authenticateToken } = require('../../Recruitment/middleWare/authMiddleware');

// CORS middleware specifically for file serving endpoints
const corsForFiles = (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'Content-Disposition, Content-Type, Content-Length');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
};

// Enhanced authentication middleware that supports both header and URL token
const authenticateTokenFlexible = (req, res, next) => {
  console.log('=== Authentication Check ===');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Headers:', req.headers);
  console.log('Query params:', req.query);

  // First try the standard Authorization header
  const authHeader = req.headers['authorization'];
  const headerToken = authHeader && authHeader.split(' ')[1];
  
  // Then try URL token parameter (for file serving when headers can't be easily set)
  const urlToken = req.query.token;
  
  const token = headerToken || urlToken;
  
  console.log('Header token:', headerToken ? 'Present' : 'Not found');
  console.log('URL token:', urlToken ? 'Present' : 'Not found');
  console.log('Using token:', token ? 'Present' : 'Not found');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required',
      details: 'Please provide authentication token in Authorization header or as URL parameter'
    });
  }

  try {
    // Verify the token (make sure you have the correct JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    console.log('✅ Token verified for user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('❌ Token verification failed:', err.message);
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token',
      details: err.message
    });
  }
};

// Test endpoint to check table structure (for debugging)
router.get("/debug/table-structure", authenticateToken, resumeController.testTableStructure);

// IMPORTANT: Specific routes MUST come before parameterized routes
// File serving endpoints - these must come before /:id route

// File info endpoint - uses standard auth
router.get("/:id/file-info", authenticateToken, resumeController.getResumeFileInfo);

// Download endpoint - uses flexible auth and CORS
router.get("/:id/download", corsForFiles, authenticateTokenFlexible, resumeController.downloadResume);

// Preview endpoint - uses flexible auth and CORS (this is the key one for PDF viewing)
router.get("/:id/preview", corsForFiles, authenticateTokenFlexible, resumeController.previewResume);

// Get all resumes - this must come before /:id route
router.get("/", authenticateToken, resumeController.getAllResumes);

// Upload new resume - Auth first, then file upload
router.post("/", authenticateToken, single, resumeController.createResume);

// Update existing resume - Auth first, then optional file upload
router.put("/:id", authenticateToken, single, resumeController.updateResume);

// Delete resume
router.delete("/:id", authenticateToken, resumeController.deleteResume);

// Get single resume by ID - this must come LAST among /:id routes
router.get("/:id", authenticateToken, resumeController.getResumeById);

// OPTIONS handler for CORS preflight requests
router.options("/:id/download", corsForFiles);
router.options("/:id/preview", corsForFiles);

module.exports = router;