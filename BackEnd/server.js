
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const path = require("path");
// // const { errorHandler } = require('./erprecruitment/utils/error-handler');
// const app = express();

// // ✅ CORS Middleware
// app.use(cors({
//   origin: "*", // Replace with frontend URL in production
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// // ✅ Body Parsers
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // ✅ Serve static files (e.g., profile uploads)
// // app.use("/uploads", express.static(path.join(__dirname, "Recruitment", "public", "uploads")));

// // Replace the two uploads lines with:
// app.use('/uploads/resumes', express.static(path.join(__dirname, 'uploads', 'resumes')));
// // ✅ API Routes
// app.use("/api/auth", require("./Recruitment/routes/AuthRoutes"));

// app.use("/api/recruitment/roles", require("./erprecruitment/routes/recruitmentRoutes"));
// app.use("/api/recruitment/recruiters", require("./erprecruitment/routes/recruiterRoutes"));
// app.use("/api/recruitment/applications", require("./erprecruitment/routes/applicationRoutes"));

// app.use("/api/resumes", require("./Resume-Submission/routes/resumeRoutes"));
// app.use("/api/resume-uploads", express.static(path.join(__dirname, "Resume-Submission", "uploads")));

// // ✅ 404 Handler
// app.use((req, res) => {
//   res.status(404).json({ message: "API route not found" });
// });

// // ✅ Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });


// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const path = require("path");
// const fs = require("fs");

// const app = express();

// // ✅ CORS Middleware
// app.use(cors({
//   origin: "*", // Replace with frontend URL in production
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// // ✅ Body Parsers
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // ✅ FIXED: Ensure upload directory exists
// const uploadsDir = path.join(__dirname, 'uploads', 'resumes');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
//   console.log('📁 Created uploads directory:', uploadsDir);
// }

// // ✅ FIXED: Static file serving for resumes with enhanced logging
// app.use('/uploads/resumes', (req, res, next) => {
//   console.log('📄 Static file request:', req.path);
//   console.log('📂 Looking in directory:', uploadsDir);
  
//   const filePath = path.join(uploadsDir, req.path);
//   console.log('🔍 Full file path:', filePath);
//   console.log('✅ File exists:', fs.existsSync(filePath));
  
//   next();
// }, express.static(uploadsDir, {
//   setHeaders: (res, filePath, stat) => {
//     console.log('📋 Setting headers for file:', filePath);
    
//     // Set proper headers for different file types
//     const ext = path.extname(filePath).toLowerCase();
    
//     if (ext === '.pdf') {
//       res.set('Content-Type', 'application/pdf');
//       console.log('📑 Set content type: application/pdf');
//     } else if (ext === '.doc') {
//       res.set('Content-Type', 'application/msword');
//       console.log('📄 Set content type: application/msword');
//     } else if (ext === '.docx') {
//       res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
//       console.log('📄 Set content type: application/vnd.openxmlformats-officedocument.wordprocessingml.document');
//     }
    
//     // Allow inline viewing
//     res.set('Content-Disposition', 'inline');
//     res.set('Cache-Control', 'no-cache');
//     res.set('Access-Control-Allow-Origin', '*');
//   }
// }));

// // ✅ Additional static routes for backward compatibility
// app.use("/api/resume-uploads", express.static(path.join(__dirname, "Resume-Submission", "uploads")));

// // ✅ API Routes
// app.use("/api/auth", require("./Recruitment/routes/AuthRoutes"));

// app.use("/api/recruitment/roles", require("./erprecruitment/routes/recruitmentRoutes"));
// app.use("/api/recruitment/recruiters", require("./erprecruitment/routes/recruiterRoutes"));
// app.use("/api/recruitment/applications", require("./erprecruitment/routes/applicationRoutes"));

// app.use("/api/resumes", require("./Resume-Submission/routes/resumeRoutes"));

// // User management routes
// app.use("/api/users", require("./erprecruitment/routes/userRoutes"));

// // ✅ ADDED: Dashboard routes for Bench Sales
// app.use("/api/dashboard", require("./Bench_Sales/routes/dashboardRoutes"));
// // Add this line with your other API routes
// app.use("/api/candidates", require("./Bench_Sales/routes/candidateRoutes"));
// // In server.js, replace this line:
// app.use("/api/requirements", require("./Bench_Sales/routes/requirementRoutes"));

// // With this for debugging:
// try {
//   const requirementRoutes = require("./Bench_Sales/routes/requirementRoutes");
//   console.log('Requirements routes loaded:', typeof requirementRoutes);
//   app.use("/api/requirements", requirementRoutes);
// } catch (error) {
//   console.error('Error loading requirement routes:', error.message);
//   console.error('Make sure the file exists at: ./Bench_Sales/routes/requirementRoutes.js');
// }

// app.use("/api/submissions", require("./Bench_Sales/routes/submissionRoutes"));

// app.use("/api/vendors", require("./Bench_Sales/routes/vendorRoutes"));
// app.use("/api/hotlist", require("./Bench_Sales/routes/hotlistRoutes"));

// // ✅ Debug route to list files in upload directory
// app.get('/api/debug/uploads', (req, res) => {
//   try {
//     const files = fs.readdirSync(uploadsDir);
//     res.json({
//       directory: uploadsDir,
//       files: files,
//       count: files.length
//     });
//   } catch (error) {
//     res.status(500).json({
//       error: 'Cannot read upload directory',
//       directory: uploadsDir,
//       message: error.message
//     });
//   }
// });

// // ✅ Test route for file access
// app.get('/api/test/resume/:filename', (req, res) => {
//   const filename = req.params.filename;
//   const filePath = path.join(uploadsDir, filename);
  
//   console.log('🧪 Testing file access:');
//   console.log('- Filename:', filename);
//   console.log('- Full path:', filePath);
//   console.log('- File exists:', fs.existsSync(filePath));
  
//   if (!fs.existsSync(filePath)) {
//     return res.status(404).json({
//       error: 'File not found',
//       filename: filename,
//       fullPath: filePath,
//       directory: uploadsDir,
//       filesInDirectory: fs.readdirSync(uploadsDir)
//     });
//   }
  
//   res.json({
//     message: 'File found',
//     filename: filename,
//     fullPath: filePath,
//     size: fs.statSync(filePath).size,
//     accessUrl: `http://localhost:${PORT}/uploads/resumes/${filename}`
//   });
// });

// // ✅ 404 Handler
// app.use((req, res) => {
//   console.log('❌ 404 - Route not found:', req.method, req.path);
//   res.status(404).json({ message: "API route not found" });
// });

// // ✅ Error handler
// app.use((error, req, res, next) => {
//   console.error('💥 Server Error:', error);
//   res.status(500).json({
//     message: 'Internal server error',
//     error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
//   });
// });

// // ✅ Start Server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
//   console.log(`📁 Resume files served at: http://localhost:${PORT}/uploads/resumes/`);
//   console.log(`📂 Upload directory: ${uploadsDir}`);
  
//   // List existing files
//   try {
//     const files = fs.readdirSync(uploadsDir);
//     console.log(`📋 Found ${files.length} existing files:`, files.slice(0, 5));
//   } catch (error) {
//     console.log('⚠️  Could not read upload directory:', error.message);
//   }
// });





require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();

// CORS Middleware
app.use(cors({
  origin: "*", // Replace with frontend URL in production
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body Parsers
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Ensure upload directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static file serving for resumes
app.use('/uploads/resumes', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.pdf') {
      res.set('Content-Type', 'application/pdf');
    } else if (ext === '.doc') {
      res.set('Content-Type', 'application/msword');
    } else if (ext === '.docx') {
      res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    
    res.set('Content-Disposition', 'inline');
    res.set('Cache-Control', 'no-cache');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Additional static routes for backward compatibility
app.use("/api/resume-uploads", express.static(path.join(__dirname, "Resume-Submission", "uploads")));

console.log('\n========================================');
console.log('🚀 Starting API Route Registration...');
console.log('========================================\n');

// ===================================================
// AUTHENTICATION & USER ROUTES
// ===================================================
console.log('👤 Registering Authentication Routes...');
app.use("/api/auth", require("./Recruitment/routes/AuthRoutes"));
console.log('✅ Auth routes registered at /api/auth\n');

console.log('👥 Registering User Routes...');
app.use("/api/users", require("./erprecruitment/routes/userRoutes"));
console.log('✅ User routes registered at /api/users\n');

// ===================================================
// RECRUITMENT ROUTES
// ===================================================
console.log('📝 Registering Recruitment Routes...');
app.use("/api/recruitment/roles", require("./erprecruitment/routes/recruitmentRoutes"));
app.use("/api/recruitment/recruiters", require("./erprecruitment/routes/recruiterRoutes"));
app.use("/api/recruitment/applications", require("./erprecruitment/routes/applicationRoutes"));
app.use("/api/resumes", require("./Resume-Submission/routes/resumeRoutes"));
console.log('✅ Recruitment routes registered\n');

// ===================================================
// BENCH SALES ROUTES
// ===================================================
console.log('💼 Registering Bench Sales Routes...');
app.use("/api/dashboard", require("./Bench_Sales/routes/dashboardRoutes"));
app.use("/api/candidates", require("./Bench_Sales/routes/candidateRoutes"));
app.use('/api/external-submissions', require('./Bench_Sales/routes/externalSubmissionRoutes'));

// Requirements routes with error handling
try {
  const requirementRoutes = require("./Bench_Sales/routes/requirementRoutes");
  app.use("/api/requirements", requirementRoutes);
  console.log('✅ Requirements routes registered at /api/requirements');
} catch (error) {
  console.error('❌ Error loading requirement routes:', error.message);
}

app.use("/api/submissions", require("./Bench_Sales/routes/submissionRoutes"));
app.use("/api/vendors", require("./Bench_Sales/routes/vendorRoutes"));
app.use("/api/hotlist", require("./Bench_Sales/routes/hotlistRoutes"));
console.log('✅ Bench Sales routes registered\n');

// ===================================================
// COMPANIES ROUTES
// ===================================================
console.log('🏢 Registering Companies Routes...');
try {
  const companyRoutes = require("./companies/routes/companyRoutes");
  app.use("/api/companies", companyRoutes);
  console.log('✅ Company routes registered at /api/companies');
} catch (error) {
  console.error('❌ Error loading company routes:', error.message);
  app.use("/api/companies", (req, res) => {
    res.status(500).json({
      success: false,
      message: "Company routes not configured properly",
      error: error.message
    });
  });
}
console.log('');

// ===================================================
// EMPLOYEE MANAGEMENT ROUTES
// ===================================================
console.log('👔 Registering Employee Routes...');
try {
  const employeeRoutes = require("./companies/routes/employeeRoutes");
  app.use("/api/employees", employeeRoutes);
  console.log('✅ Employee routes registered at /api/employees');
} catch (error) {
  console.error('❌ Error loading employee routes:', error.message);
  app.use("/api/employees", (req, res) => {
    res.status(500).json({
      success: false,
      message: "Employee routes not configured properly",
      error: error.message
    });
  });
}
console.log('');

// ===================================================
// TIMESHEET ROUTES - CRITICAL: ORDER MATTERS!
// User routes MUST be registered BEFORE manager routes
// ===================================================
console.log('⏰ Registering Timesheet Routes...');
console.log('   📌 Route order is critical for proper routing!\n');

// 1️⃣ USER Timesheet Routes (MUST BE FIRST)
// Handles: /api/timesheets/internal, /api/timesheets/external, etc.
try {
  const userTimesheetRoutes = require("./Accounts/routes/timesheetRoutes");
  app.use("/api/timesheets", userTimesheetRoutes);
  console.log('✅ User timesheet routes registered at /api/timesheets');
  console.log('   Routes: /internal, /external, /history, /:id/export, etc.');
} catch (error) {
  console.error('❌ Error loading user timesheet routes:', error.message);
  console.error('   Stack:', error.stack);
  app.use("/api/timesheets", (req, res, next) => {
    if (req.path === '/internal' || req.path === '/external' || req.path === '/history') {
      return res.status(500).json({
        success: false,
        message: "User timesheet routes not configured properly",
        error: error.message
      });
    }
    next();
  });
}

// 2️⃣ MANAGER Timesheet Routes (MUST BE SECOND)
// Handles: /api/timesheets/company/:companyId/...
try {
  const managerTimesheetRoutes = require("./companies/routes/managerTimesheet");
  app.use("/api/timesheets", managerTimesheetRoutes);
  console.log('✅ Manager timesheet routes registered at /api/timesheets');
  console.log('   Routes: /company/:companyId/*, /bulk/approve, /bulk/reject');
} catch (error) {
  console.error('❌ Error loading manager timesheet routes:', error.message);
  console.error('   Stack:', error.stack);
  app.use("/api/timesheets/company", (req, res) => {
    res.status(500).json({
      success: false,
      message: "Manager timesheet routes not configured properly",
      error: error.message
    });
  });
}

console.log('✅ All timesheet routes registered successfully\n');

// ===================================================
// PROJECTS ROUTES
// ===================================================
console.log('📊 Registering Projects Routes...');
try {
  const projectsRoutes = require("./companies/routes/projectsRoutes");
  app.use("/api/projects", projectsRoutes);
  console.log('✅ Projects routes registered at /api/projects');
} catch (error) {
  console.error('❌ Error loading projects routes:', error.message);
  app.use("/api/projects", (req, res) => {
    res.status(500).json({
      success: false,
      message: "Projects routes not configured properly",
      error: error.message
    });
  });
}
console.log('');

// ===================================================
// HEALTH CHECK & MONITORING
// ===================================================
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "Server is running",
    timestamp: new Date().toISOString(),
    status: "OK",
    environment: process.env.NODE_ENV || 'development',
    routes: {
      auth: true,
      recruitment: true,
      benchSales: true,
      companies: true,
      employees: true,
      timesheets: true,
      projects: true
    }
  });
});

// Route debugging endpoint (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.get("/api/debug/routes", (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        routes.push({
          path: middleware.route.path,
          methods: Object.keys(middleware.route.methods)
        });
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler) => {
          if (handler.route) {
            const path = middleware.regexp.source
              .replace('\\/?', '')
              .replace('(?=\\/|$)', '')
              .replace(/\\\//g, '/');
            routes.push({
              path: path + handler.route.path,
              methods: Object.keys(handler.route.methods)
            });
          }
        });
      }
    });
    res.json({ routes });
  });
}

// ===================================================
// ERROR HANDLING MIDDLEWARE
// ===================================================
app.use((err, req, res, next) => {
  console.error('\n❌ ERROR CAUGHT:');
  console.error('Time:', new Date().toISOString());
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
      path: req.path,
      timestamp: new Date().toISOString()
    }
  });
});

// ===================================================
// 404 HANDLER FOR API ROUTES
// ===================================================
app.use("/api/*", (req, res) => {
  console.warn(`⚠️  404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: {
      message: "API endpoint not found",
      endpoint: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    }
  });
});

// ===================================================
// STATIC FILES FOR PRODUCTION
// ===================================================
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
  
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// ===================================================
// START SERVER
// ===================================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`🔍 Debug routes: http://localhost:${PORT}/api/debug/routes`);
  }
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('========================================\n');
  console.log('📋 Timesheet Endpoints:');
  console.log('   POST   http://localhost:' + PORT + '/api/timesheets/internal');
  console.log('   POST   http://localhost:' + PORT + '/api/timesheets/external');
  console.log('   GET    http://localhost:' + PORT + '/api/timesheets/history');
  console.log('   GET    http://localhost:' + PORT + '/api/timesheets/:id');
  console.log('   PUT    http://localhost:' + PORT + '/api/timesheets/:id/submit');
  console.log('========================================\n');
});





// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const path = require("path");
// const fs = require("fs");

// const app = express();

// // CORS Middleware
// app.use(cors({
//   origin: "*", // Replace with frontend URL in production
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// // Body Parsers
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Ensure upload directory exists
// const uploadsDir = path.join(__dirname, 'uploads', 'resumes');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Static file serving for resumes
// app.use('/uploads/resumes', express.static(uploadsDir, {
//   setHeaders: (res, filePath) => {
//     const ext = path.extname(filePath).toLowerCase();
    
//     if (ext === '.pdf') {
//       res.set('Content-Type', 'application/pdf');
//     } else if (ext === '.doc') {
//       res.set('Content-Type', 'application/msword');
//     } else if (ext === '.docx') {
//       res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
//     }
    
//     res.set('Content-Disposition', 'inline');
//     res.set('Cache-Control', 'no-cache');
//     res.set('Access-Control-Allow-Origin', '*');
//   }
// }));

// // Additional static routes for backward compatibility
// app.use("/api/resume-uploads", express.static(path.join(__dirname, "Resume-Submission", "uploads")));

// // API Routes
// app.use("/api/auth", require("./Recruitment/routes/AuthRoutes"));
// app.use("/api/recruitment/roles", require("./erprecruitment/routes/recruitmentRoutes"));
// app.use("/api/recruitment/recruiters", require("./erprecruitment/routes/recruiterRoutes"));
// app.use("/api/recruitment/applications", require("./erprecruitment/routes/applicationRoutes"));
// app.use("/api/resumes", require("./Resume-Submission/routes/resumeRoutes"));
// app.use("/api/users", require("./erprecruitment/routes/userRoutes"));

// // Dashboard routes for Bench Sales
// app.use("/api/dashboard", require("./Bench_Sales/routes/dashboardRoutes"));
// app.use("/api/candidates", require("./Bench_Sales/routes/candidateRoutes"));
// app.use('/api/external-submissions', require('./Bench_Sales/routes/externalSubmissionRoutes'));
// // Requirements routes with error handling
// try {
//   const requirementRoutes = require("./Bench_Sales/routes/requirementRoutes");
//   app.use("/api/requirements", requirementRoutes);
// } catch (error) {
//   console.error('Error loading requirement routes:', error.message);
// }

// app.use("/api/submissions", require("./Bench_Sales/routes/submissionRoutes"));
// app.use("/api/vendors", require("./Bench_Sales/routes/vendorRoutes"));
// app.use("/api/hotlist", require("./Bench_Sales/routes/hotlistRoutes"));

// // Companies Routes
// try {
//   const companyRoutes = require("./companies/routes/companyRoutes");
//   app.use("/api/companies", companyRoutes);
// } catch (error) {
//   console.error('Error loading company routes:', error.message);
//   app.use("/api/companies", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Company routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Employee Management Routes
// try {
//   const employeeRoutes = require("./companies/routes/employeeRoutes");
//   app.use("/api/employees", employeeRoutes);
// } catch (error) {
//   console.error('Error loading employee routes:', error.message);
//   app.use("/api/employees", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Employee routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Timesheet Management Routes
// try {
//   const timesheetRoutes = require("./companies/routes/managerTimesheet");
//   app.use("/api/timesheets", timesheetRoutes);
// } catch (error) {
//   console.error('Error loading timesheet routes:', error.message);
//   app.use("/api/timesheets", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Timesheet routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Projects Routes
// try {
//   const projectsRoutes = require("./companies/routes/projectsRoutes");
//   app.use("/api/projects", projectsRoutes);
// } catch (error) {
//   console.error('Error loading projects routes:', error.message);
//   app.use("/api/projects", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Projects routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Health check route
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     message: "Server is running",
//     timestamp: new Date().toISOString(),
//     status: "OK"
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err.message);
//   res.status(err.status || 500).json({
//     error: {
//       message: err.message || "Internal Server Error",
//       status: err.status || 500
//     }
//   });
// });

// // 404 handler for API routes
// app.use("/api/*", (req, res) => {
//   res.status(404).json({
//     error: {
//       message: "API endpoint not found",
//       endpoint: req.originalUrl,
//       method: req.method
//     }
//   });
// });

// // Serve static files for production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../client/build")));
  
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/build", "index.html"));
//   });
// }

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
// });










// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const bodyParser = require("body-parser");
// const path = require("path");
// const fs = require("fs");

// const app = express();

// // CORS Middleware
// app.use(cors({
//   origin: "*", // Replace with frontend URL in production
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));

// // Body Parsers
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Ensure upload directory exists
// const uploadsDir = path.join(__dirname, 'uploads', 'resumes');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Static file serving for resumes
// app.use('/uploads/resumes', express.static(uploadsDir, {
//   setHeaders: (res, filePath) => {
//     const ext = path.extname(filePath).toLowerCase();
    
//     if (ext === '.pdf') {
//       res.set('Content-Type', 'application/pdf');
//     } else if (ext === '.doc') {
//       res.set('Content-Type', 'application/msword');
//     } else if (ext === '.docx') {
//       res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
//     }
    
//     res.set('Content-Disposition', 'inline');
//     res.set('Cache-Control', 'no-cache');
//     res.set('Access-Control-Allow-Origin', '*');
//   }
// }));

// // Additional static routes for backward compatibility
// app.use("/api/resume-uploads", express.static(path.join(__dirname, "Resume-Submission", "uploads")));

// // API Routes
// app.use("/api/auth", require("./Recruitment/routes/AuthRoutes"));
// app.use("/api/recruitment/roles", require("./erprecruitment/routes/recruitmentRoutes"));
// app.use("/api/recruitment/recruiters", require("./erprecruitment/routes/recruiterRoutes"));
// app.use("/api/recruitment/applications", require("./erprecruitment/routes/applicationRoutes"));
// app.use("/api/resumes", require("./Resume-Submission/routes/resumeRoutes"));
// app.use("/api/users", require("./erprecruitment/routes/userRoutes"));

// // Dashboard routes for Bench Sales
// app.use("/api/dashboard", require("./Bench_Sales/routes/dashboardRoutes"));
// app.use("/api/candidates", require("./Bench_Sales/routes/candidateRoutes"));
// app.use('/api/external-submissions', require('./Bench_Sales/routes/externalSubmissionRoutes'));
// // Requirements routes with error handling
// try {
//   const requirementRoutes = require("./Bench_Sales/routes/requirementRoutes");
//   app.use("/api/requirements", requirementRoutes);
// } catch (error) {
//   console.error('Error loading requirement routes:', error.message);
// }

// app.use("/api/submissions", require("./Bench_Sales/routes/submissionRoutes"));
// app.use("/api/vendors", require("./Bench_Sales/routes/vendorRoutes"));
// app.use("/api/hotlist", require("./Bench_Sales/routes/hotlistRoutes"));

// // Companies Routes
// try {
//   const companyRoutes = require("./companies/routes/companyRoutes");
//   app.use("/api/companies", companyRoutes);
// } catch (error) {
//   console.error('Error loading company routes:', error.message);
//   app.use("/api/companies", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Company routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Employee Management Routes
// try {
//   const employeeRoutes = require("./companies/routes/employeeRoutes");
//   app.use("/api/employees", employeeRoutes);
// } catch (error) {
//   console.error('Error loading employee routes:', error.message);
//   app.use("/api/employees", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Employee routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Timesheet Management Routes
// try {
//   const timesheetRoutes = require("./companies/routes/timesheetRoutes");
//   app.use("/api/timesheets", timesheetRoutes);
// } catch (error) {
//   console.error('Error loading timesheet routes:', error.message);
//   app.use("/api/timesheets", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Timesheet routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Employee Timesheet Management Routes
// try {
//   const employeeTimesheetRoutes = require("./companies/routes/employeeTimesheetRoutes");
//   app.use("/api/employee-timesheets", employeeTimesheetRoutes);
// } catch (error) {
//   console.error('Error loading employee timesheet routes:', error.message);
//   app.use("/api/employee-timesheets", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Employee timesheet routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Projects Routes - ADDED
// try {
//   const projectsRoutes = require("./companies/routes/projectsRoutes");
//   app.use("/api/projects", projectsRoutes);
// } catch (error) {
//   console.error('Error loading projects routes:', error.message);
//   app.use("/api/projects", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Projects routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Payroll Statements Routes - ADDED
// try {
//   const payrollStatementsRoutes = require("./companies/routes/payrollStatementsRoutes");
//   app.use("/api/payroll-statements", payrollStatementsRoutes);
// } catch (error) {
//   console.error('Error loading payroll statements routes:', error.message);
//   app.use("/api/payroll-statements", (req, res) => {
//     res.status(500).json({
//       success: false,
//       message: "Payroll statements routes not configured properly",
//       error: error.message
//     });
//   });
// }

// // Health check route
// app.get("/api/health", (req, res) => {
//   res.status(200).json({
//     message: "Server is running",
//     timestamp: new Date().toISOString(),
//     status: "OK"
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Error:", err.message);
//   res.status(err.status || 500).json({
//     error: {
//       message: err.message || "Internal Server Error",
//       status: err.status || 500
//     }
//   });
// });

// // 404 handler for API routes
// app.use("/api/*", (req, res) => {
//   res.status(404).json({
//     error: {
//       message: "API endpoint not found",
//       endpoint: req.originalUrl,
//       method: req.method
//     }
//   });
// });

// // Serve static files for production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../client/build")));
  
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../client/build", "index.html"));
//   });
// }

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
// });




