const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} = require("../controllers/userController");
const { authenticateToken } = require("../../Recruitment/middleWare/authMiddleware");

// Protected routes
router.get("/", authenticateToken, getAllUsers);
router.get("/:id", authenticateToken, getUserById);
router.post("/", authenticateToken, createUser);
router.put("/:id", authenticateToken, updateUser);
router.delete("/:id", authenticateToken, deleteUser);

module.exports = router;