const express = require("express");
const router = express.Router();
const {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
   deleteRole,
  assignRecruiter
} = require("../controllers/recruitmentController");
const { authenticateToken } = require("../../Recruitment/middleWare/authMiddleware");

// Public routes (if any)
// router.get("/", getAllRoles);

// Protected routes
router.get("/", authenticateToken, getAllRoles);
router.get("/:id", authenticateToken, getRoleById);
router.post("/", authenticateToken, createRole);
router.put("/:id", authenticateToken, updateRole);
router.post("/:id/assign-recruiter", authenticateToken, assignRecruiter);
router.delete("/:id", authenticateToken, deleteRole);

module.exports = router;