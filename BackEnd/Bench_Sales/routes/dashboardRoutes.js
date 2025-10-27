// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// Simple auth middleware check - you can replace this with your actual auth middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  // For now, we'll just pass through - replace with actual token verification
  next();
};

// Apply authentication middleware to all routes
router.use(authMiddleware);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/analytics - Get analytics data
router.get('/analytics', dashboardController.getAnalyticsData);

// GET /api/dashboard/utilization - Get candidate utilization data
router.get('/utilization', dashboardController.getUtilizationData);

// GET /api/dashboard/performance - Get team performance data
router.get('/performance', dashboardController.getPerformanceData);

// GET /api/dashboard/revenue - Get revenue forecast data
router.get('/revenue', dashboardController.getRevenueData);

module.exports = router;