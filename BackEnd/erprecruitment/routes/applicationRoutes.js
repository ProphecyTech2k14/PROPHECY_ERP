


// const express = require("express");
// const router = express.Router();
// const {
//   createApplication,
//   updateApplicationStatus,
//   getApplicationHiringSteps,
//   uploadResume,
//   serveResumeFromDB,
//   serveResumeFromFile, // Fallback for existing files
  
// } = require("../controllers/applicationController");
// const { authenticateToken } = require("../../Recruitment/middleWare/authMiddleware");
// const applicationController = require("../controllers/applicationController");
// // Application CRUD operations
// router.post("/", authenticateToken, uploadResume, createApplication);
// router.put("/:id/status", authenticateToken, updateApplicationStatus);
// router.get("/hiring-steps", authenticateToken, getApplicationHiringSteps);

// // NEW: Serve resume from database (primary method)
// router.get("/:applicationId/resume", authenticateToken, serveResumeFromDB);

// // FALLBACK: Serve resume from file system (for existing files)
// router.get("/resumes/:filename", authenticateToken, serveResumeFromFile);

// // NEW: Get applications with resume information
// router.get("/role/:roleId/with-resumes", authenticateToken, applicationController.getApplicationsWithResumes);

// // Edit and delete application routes
// router.put("/:id", authenticateToken, applicationController.editApplication);
// router.delete("/:id", authenticateToken, applicationController.deleteApplication);

// // In your routes file
// router.put('/:id', authenticateToken, uploadResume, applicationController.updateApplication);
// router.delete('/:id/resume', authenticateToken, applicationController.deleteApplicationResume);
// module.exports = router;



const express = require("express");
const router = express.Router();
const {
  createApplication,
  updateApplicationStatus,
  getApplicationHiringSteps,
  uploadResume,
  serveResumeFromDB,
  serveResumeFromFile,
  getApplicationsWithResumes,
  editApplication,
  deleteApplication,
  updateApplication, // Make sure this is imported
  deleteApplicationResume // Make sure this is imported
} = require("../controllers/applicationController");
const { authenticateToken } = require("../../Recruitment/middleWare/authMiddleware");

// Application CRUD operations
router.post("/", authenticateToken, uploadResume, createApplication);
router.put("/:id/status", authenticateToken, updateApplicationStatus);
router.get("/hiring-steps", authenticateToken, getApplicationHiringSteps);

// Serve resume routes
router.get("/:applicationId/resume", authenticateToken, serveResumeFromDB);
router.get("/resumes/:filename", authenticateToken, serveResumeFromFile);

// Get applications with resume information
router.get("/role/:roleId/with-resumes", authenticateToken, getApplicationsWithResumes);

// Edit and delete application routes
router.put("/:id", authenticateToken, uploadResume, updateApplication); // Changed from editApplication to updateApplication
router.delete("/:id", authenticateToken, deleteApplication);

// Resume-specific routes
router.delete('/:id/resume', authenticateToken, deleteApplicationResume);

module.exports = router;