// controllers/dashboardController.js
const sql = require('mssql');

// Database configuration - adjust this based on your actual db config location
let dbConfig;
try {
  dbConfig = require('../../config/db').dbConfig;
} catch (error) {
  console.log('Database config not found, using fallback');
  // Fallback config - replace with your actual database settings
  dbConfig = {
    server: 'localhost',
    database: 'your_database',
    user: 'your_username',
    password: 'your_password',
    options: {
      encrypt: true,
      trustServerCertificate: true
    }
  };
}

const dashboardController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // For testing purposes, let's return mock data if database connection fails
      try {
        await sql.connect(dbConfig);
        
        // Get bench strength (available candidates)
        const benchRequest = new sql.Request();
        const benchResult = await benchRequest.query(`
          SELECT COUNT(*) as BenchStrength 
          FROM Candidates 
          WHERE Status = 'Available'
        `);
        
        // Get active requirements
        const reqRequest = new sql.Request();
        const reqResult = await reqRequest.query(`
          SELECT COUNT(*) as ActiveRequirements 
          FROM Requirements 
          WHERE Status = 'Open'
        `);
        
        // Get weekly submissions (last 7 days)
        const subRequest = new sql.Request();
        const subResult = await subRequest.query(`
          SELECT COUNT(*) as WeeklySubmissions 
          FROM Submissions 
          WHERE SubmissionDate >= DATEADD(day, -7, GETDATE())
        `);
        
        // Get interviews scheduled (this week)
        const intRequest = new sql.Request();
        const intResult = await intRequest.query(`
          SELECT COUNT(*) as InterviewsScheduled 
          FROM Submissions 
          WHERE Status = 'Interview Scheduled' 
          AND InterviewDate >= DATEADD(day, -DATEPART(weekday, GETDATE())+1, GETDATE())
          AND InterviewDate < DATEADD(day, 8-DATEPART(weekday, GETDATE()), GETDATE())
        `);
        
        const stats = {
          benchStrength: benchResult.recordset[0].BenchStrength,
          activeRequirements: reqResult.recordset[0].ActiveRequirements,
          weeklySubmissions: subResult.recordset[0].WeeklySubmissions,
          interviewsScheduled: intResult.recordset[0].InterviewsScheduled
        };
        
        res.json({
          success: true,
          data: stats
        });
      } catch (dbError) {
        console.log('Database error, returning mock data:', dbError.message);
        // Return mock data if database connection fails
        const mockStats = {
          benchStrength: 25,
          activeRequirements: 18,
          weeklySubmissions: 45,
          interviewsScheduled: 12
        };
        
        res.json({
          success: true,
          data: mockStats,
          note: 'Mock data - database connection failed'
        });
      }
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving dashboard statistics', 
        error: error.message 
      });
    }
  },

  // Get analytics data
  getAnalyticsData: async (req, res) => {
    try {
      try {
        await sql.connect(dbConfig);
        const { startDate, endDate, skill, vendor } = req.query;
        
        // Bench strength over time (last 12 months)
        const benchStrengthRequest = new sql.Request();
        const benchStrengthResult = await benchStrengthRequest.query(`
          SELECT 
            MONTH(CreatedAt) as Month,
            DATENAME(month, CreatedAt) as MonthName,
            COUNT(*) as Value
          FROM Candidates 
          WHERE CreatedAt >= DATEADD(month, -12, GETDATE())
          GROUP BY MONTH(CreatedAt), DATENAME(month, CreatedAt)
          ORDER BY MONTH(CreatedAt)
        `);
        
        // Success ratio data (submissions to interviews to hires)
        const successRatioRequest = new sql.Request();
        const successRatioResult = await successRatioRequest.query(`
          SELECT 
            DATENAME(month, s.SubmissionDate) as Month,
            COUNT(*) as TotalSubmissions,
            COUNT(CASE WHEN s.Status IN ('Interview Scheduled', 'Selected', 'Joined') THEN 1 END) as Interviews,
            COUNT(CASE WHEN s.Status IN ('Selected', 'Joined') THEN 1 END) as Hires
          FROM Submissions s
          WHERE s.SubmissionDate >= DATEADD(month, -6, GETDATE())
          GROUP BY DATENAME(month, s.SubmissionDate), MONTH(s.SubmissionDate)
          ORDER BY MONTH(s.SubmissionDate)
        `);
        
        // Skills demand vs supply
        const skillsAnalysisRequest = new sql.Request();
        const skillsAnalysisResult = await skillsAnalysisRequest.query(`
          WITH SkillDemand AS (
            SELECT 
              value as Skill,
              COUNT(*) as Demand
            FROM Requirements r
            CROSS APPLY STRING_SPLIT(r.Skills, ',')
            WHERE r.Status = 'Open'
            GROUP BY value
          ),
          SkillSupply AS (
            SELECT 
              value as Skill,
              COUNT(*) as Supply
            FROM Candidates c
            CROSS APPLY STRING_SPLIT(c.Skills, ',')
            WHERE c.Status = 'Available'
            GROUP BY value
          )
          SELECT 
            LTRIM(RTRIM(COALESCE(d.Skill, s.Skill))) as Skill,
            COALESCE(d.Demand, 0) as Demand,
            COALESCE(s.Supply, 0) as Supply,
            ABS(COALESCE(d.Demand, 0) - COALESCE(s.Supply, 0)) as Gap
          FROM SkillDemand d
          FULL OUTER JOIN SkillSupply s ON LTRIM(RTRIM(d.Skill)) = LTRIM(RTRIM(s.Skill))
          WHERE LTRIM(RTRIM(COALESCE(d.Skill, s.Skill))) != ''
        `);
        
        res.json({
          success: true,
          data: {
            benchStrengthData: benchStrengthResult.recordset,
            successRatioData: successRatioResult.recordset.map(item => ({
              month: item.Month,
              submissionToInterview: item.TotalSubmissions > 0 ? Math.round((item.Interviews / item.TotalSubmissions) * 100) : 0,
              interviewToHire: item.Interviews > 0 ? Math.round((item.Hires / item.Interviews) * 100) : 0
            })),
            skillsAnalytics: skillsAnalysisResult.recordset
          }
        });
      } catch (dbError) {
        console.log('Database error, returning mock analytics data:', dbError.message);
        // Mock analytics data
        const mockAnalytics = {
          benchStrengthData: [
            { Month: 1, MonthName: 'January', Value: 20 },
            { Month: 2, MonthName: 'February', Value: 25 },
            { Month: 3, MonthName: 'March', Value: 30 }
          ],
          successRatioData: [
            { month: 'January', submissionToInterview: 65, interviewToHire: 45 },
            { month: 'February', submissionToInterview: 70, interviewToHire: 50 },
            { month: 'March', submissionToInterview: 68, interviewToHire: 48 }
          ],
          skillsAnalytics: [
            { Skill: 'Java', Demand: 15, Supply: 10, Gap: 5 },
            { Skill: 'React', Demand: 12, Supply: 8, Gap: 4 },
            { Skill: 'Node.js', Demand: 10, Supply: 12, Gap: 2 }
          ]
        };
        
        res.json({
          success: true,
          data: mockAnalytics,
          note: 'Mock data - database connection failed'
        });
      }
    } catch (error) {
      console.error('Get analytics data error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving analytics data', 
        error: error.message 
      });
    }
  },

  // Get candidate utilization data
  getUtilizationData: async (req, res) => {
    try {
      try {
        await sql.connect(dbConfig);
        
        const request = new sql.Request();
        const result = await request.query(`
          SELECT 
            Status,
            COUNT(*) as Count
          FROM Candidates 
          GROUP BY Status
        `);
        
        const totalCandidates = result.recordset.reduce((sum, item) => sum + item.Count, 0);
        const availableCandidates = result.recordset.find(item => item.Status === 'Available')?.Count || 0;
        const utilizedCandidates = totalCandidates - availableCandidates;
        
        const utilizationData = {
          utilized: totalCandidates > 0 ? Math.round((utilizedCandidates / totalCandidates) * 100) : 0,
          bench: totalCandidates > 0 ? Math.round((availableCandidates / totalCandidates) * 100) : 0
        };
        
        res.json({
          success: true,
          data: utilizationData
        });
      } catch (dbError) {
        console.log('Database error, returning mock utilization data:', dbError.message);
        // Mock utilization data
        const mockUtilizationData = {
          utilized: 75,
          bench: 25
        };
        
        res.json({
          success: true,
          data: mockUtilizationData,
          note: 'Mock data - database connection failed'
        });
      }
    } catch (error) {
      console.error('Get utilization data error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving utilization data', 
        error: error.message 
      });
    }
  },

  // Get team performance data
  getPerformanceData: async (req, res) => {
    try {
      try {
        await sql.connect(dbConfig);
        
        const request = new sql.Request();
        const result = await request.query(`
          SELECT 
            'Recruiter' + CAST(ROW_NUMBER() OVER (ORDER BY COUNT(s.Id) DESC) AS VARCHAR) as RecruiterName,
            COUNT(s.Id) as Submissions,
            COUNT(CASE WHEN s.Status IN ('Selected', 'Joined') THEN 1 END) as Hires
          FROM Submissions s
          WHERE s.SubmissionDate >= DATEADD(month, -3, GETDATE())
          GROUP BY s.VendorId
          ORDER BY Submissions DESC
        `);
        
        res.json({
          success: true,
          data: result.recordset
        });
      } catch (dbError) {
        console.log('Database error, returning mock performance data:', dbError.message);
        // Mock recruiter performance data for demonstration
        const mockPerformanceData = [
          { name: "John D.", submissions: 65, hires: 28 },
          { name: "Jane S.", submissions: 59, hires: 48 },
          { name: "Mike J.", submissions: 80, hires: 40 },
          { name: "Sarah L.", submissions: 81, hires: 19 },
          { name: "Tom B.", submissions: 56, hires: 26 }
        ];
        
        res.json({
          success: true,
          data: mockPerformanceData,
          note: 'Mock data - database connection failed'
        });
      }
    } catch (error) {
      console.error('Get performance data error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving performance data', 
        error: error.message 
      });
    }
  },

  // Get revenue forecast data
  getRevenueData: async (req, res) => {
    try {
      // Mock revenue data for demonstration
      const revenueData = {
        thisMonth: 125000,
        nextMonth: 145000,
        quarterlyTarget: 425000,
        ytdRevenue: 850000,
        kpis: {
          avgTimeToFill: 2.5,
          clientSatisfaction: 85,
          candidateRetention: 92,
          monthlyGrowth: 15
        }
      };
      
      res.json({
        success: true,
        data: revenueData
      });
    } catch (error) {
      console.error('Get revenue data error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving revenue data', 
        error: error.message 
      });
    }
  }
};

module.exports = dashboardController;