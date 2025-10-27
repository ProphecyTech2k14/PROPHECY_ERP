// const express = require("express");
// const router = express.Router();
// const {
//   getUserTimesheets,
//   getTimesheetById,
//   saveInternalTimesheet,
//   submitTimesheet,
//   uploadExternalTimesheet,
//   getUploadHistory,
//   exportTimesheet,
//   downloadExternalTimesheet,
//   uploadMiddleware,
//   deleteExternalTimesheet
// } = require("../controllers/timesheetController");

// // FIXED: Correct path to authMiddleware within Accounts folder
// const { authenticateToken } = require("../../Recruitment/middleWare/authMiddleware");

// // Protected routes
// router.get("/", authenticateToken, getUserTimesheets);
// router.get("/history", authenticateToken, getUploadHistory);
// router.get("/:id", authenticateToken, getTimesheetById);
// router.post("/internal", authenticateToken, saveInternalTimesheet);
// router.post("/external", authenticateToken, uploadMiddleware, uploadExternalTimesheet);
// router.put("/:id/submit", authenticateToken, submitTimesheet);
// router.get("/:id/export", authenticateToken, exportTimesheet);
// router.get("/:id/download", authenticateToken, downloadExternalTimesheet);
// router.delete("/:id", authenticateToken, deleteExternalTimesheet);

// module.exports = router;







const express = require("express");
const router = express.Router();
const {
  getUserTimesheets,
  getTimesheetById,
  saveInternalTimesheet,
  submitTimesheet,
  uploadExternalTimesheet,
  getUploadHistory,
  exportTimesheet,
  downloadExternalTimesheet,
  uploadMiddleware,
  deleteExternalTimesheet,
  getTimesheetEntries,
  approveTimesheet,
  rejectTimesheet,
  deleteTimesheet,
  getSubmittedWeeks,        // NEW
  markWeekSubmitted         // NEW
} = require("../controllers/timesheetController");
const { authenticateToken } = require("../../Recruitment/middleWare/authMiddleware");

console.log('📋 Loading USER timesheet routes...');

// Apply authentication to all routes
router.use(authenticateToken);

// Request logging middleware
router.use((req, res, next) => {
  console.log(`[USER-TIMESHEET] ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  console.log('User ID:', req.user?.id);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body keys:', Object.keys(req.body || {}));
  }
  next();
});

// ========================================
// IMPORTANT: Specific routes BEFORE generic parameterized routes
// ========================================

// POST /api/timesheets/internal - Save internal timesheet
router.post("/internal", (req, res, next) => {
  console.log('🎯 POST /internal endpoint HIT');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  next();
}, saveInternalTimesheet);

// POST /api/timesheets/external - Upload external timesheet file
router.post("/external", uploadMiddleware, uploadExternalTimesheet);

// GET /api/timesheets/history - Get upload history
router.get("/history", getUploadHistory);

// ========================================
// Parameterized routes (these match patterns like /api/timesheets/123)
// ========================================

// POST /api/timesheets/:id/approve - Approve timesheet
router.post("/:id/approve", approveTimesheet);

// POST /api/timesheets/:id/reject - Reject timesheet
router.post("/:id/reject", rejectTimesheet);

// GET /api/timesheets/:id/entries - Get timesheet entries
router.get("/:id/entries", getTimesheetEntries);

// GET /api/timesheets/:id/submitted-weeks - Get submitted weeks for a timesheet (NEW)
router.get("/:id/submitted-weeks", getSubmittedWeeks);

// POST /api/timesheets/:id/mark-week-submitted - Mark a week as submitted (NEW)
router.post("/:id/mark-week-submitted", markWeekSubmitted);

// GET /api/timesheets/:id/export - Export timesheet to CSV
router.get("/:id/export", exportTimesheet);

// GET /api/timesheets/:id/download - Download external timesheet file
router.get("/:id/download", downloadExternalTimesheet);

// PUT /api/timesheets/:id/submit - Submit timesheet for approval
router.put("/:id/submit", submitTimesheet);

// DELETE /api/timesheets/:id - Delete timesheet
router.delete("/:id", deleteTimesheet);

// GET /api/timesheets/:id - Get single timesheet by ID (MUST BE LAST to avoid conflicts)
router.get("/:id", getTimesheetById);


// ========================================
// Base route (MUST BE LAST)
// ========================================

// GET /api/timesheets - Get all user timesheets
router.get("/", getUserTimesheets);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('❌ User timesheet route error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error in user timesheet routes',
    error: error.message
  });
});

console.log('✅ User timesheet routes registered successfully');
console.log('Registered routes:');
console.log('  POST   /api/timesheets/internal');
console.log('  POST   /api/timesheets/external');
console.log('  GET    /api/timesheets/history');
console.log('  POST   /api/timesheets/:id/approve');     
console.log('  POST   /api/timesheets/:id/reject');      
console.log('  GET    /api/timesheets/:id/entries');
console.log('  GET    /api/timesheets/:id/submitted-weeks');  // NEW
console.log('  POST   /api/timesheets/:id/mark-week-submitted'); // NEW
console.log('  GET    /api/timesheets/:id/export');
console.log('  GET    /api/timesheets/:id/download');
console.log('  PUT    /api/timesheets/:id/submit');
console.log('  DELETE /api/timesheets/:id');
console.log('  GET    /api/timesheets/:id');
console.log('  GET    /api/timesheets/');

module.exports = router;