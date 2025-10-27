
// const express = require("express");
// const { login, getCurrentUser } = require("../controllers/authController");
// const { authenticateToken } = require("../middleWare/authMiddleware");
// const { poolPromise, sql } = require("../../config/db");
// // const upload = require("../middleWare/uploadMiddleware");
// const fs = require("fs");
// const path = require("path");

// const router = express.Router();

// // Login route
// router.post("/login", login);

// // Get current user route
// router.get('/me', authenticateToken, getCurrentUser);

// // Get users by role with token verification
// router.get("/role/:role", authenticateToken, async (req, res) => {
//   try {
//     const { role } = req.params;
//     const currentUserRole = req.user.role;

//     // Only allow managers to access this route
//     if (currentUserRole !== 'manager') {
//       return res.status(403).json({ error: "Access denied. Manager role required." });
//     }

//     if (!role) {
//       return res.status(400).json({ error: "Role is required!" });
//     }

//     const pool = await poolPromise;
//     const result = await pool
//       .request()
//       .input("role", sql.NVarChar, role)
//       .query(`
//         SELECT 
//           u.id,
//           u.username,
//           u.role,
//           u.profile,
//           d.firstName,
//           d.lastName,
//           d.alias,
//           d.email,
//           d.phone,
//           d.mobile,
//           d.fax,
//           d.website,
//           d.dob,
//           d.street,
//           d.city,
//           d.province,
//           d.postalCode,
//           d.country,
//           d.created_at,
//           d.updated_at
//         FROM userinfo u
//         JOIN userdetails d ON u.id = d.id
//         WHERE LOWER(u.role) = LOWER(@role)
//       `);

//     res.status(200).json({ users: result.recordset });
//   } catch (error) {
//     console.error("Error fetching users by role:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// // Fetch all users - for admin only
// router.get("/users", authenticateToken, async (req, res) => {
//   try {
//     const currentUserRole = req.user.role;

//     // Only allow managers to access this route
//     if (currentUserRole !== 'manager') {
//       return res.status(403).json({ error: "Access denied. Manager role required." });
//     }

//     const pool = await poolPromise;
//     const result = await pool
//       .request()
//       .query(`
//         SELECT 
//           u.id,
//           u.username,
//           u.role,
//           u.profile,
//           d.firstName,
//           d.lastName,
//           d.alias,
//           d.email,
//           d.phone,
//           d.mobile,
//           d.fax,
//           d.website,
//           d.dob,
//           d.street,
//           d.city,
//           d.province,
//           d.postalCode,
//           d.country,
//           d.created_at,
//           d.updated_at
//         FROM userinfo u
//         JOIN userdetails d ON u.id = d.id
//       `);

//     res.status(200).json({ users: result.recordset });
//   } catch (error) {
//     console.error("Error fetching all users with details:", error);
//     res.status(500).json({ error: error.message });
//   }
// });



// authRoutes.js - CORRECTED /me ENDPOINT
const express = require("express");
const { login, getCurrentUser } = require("../controllers/authController");
const { authenticateToken } = require("../middleWare/authMiddleware");
const { poolPromise, sql } = require("../../config/db");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// SendGrid Configuration
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const router = express.Router();

// Login route
router.post("/login", login);

// Get current user route - CORRECTED
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    
    // Fetch complete user data
    const result = await pool.request()
      .input('userId', sql.Int, req.user.id)
      .query(`
        SELECT 
          u.id,
          u.username,
          u.role,
          u.EmployeeId,
          u.profile,
          ud.firstName,
          ud.lastName,
          ud.email,
          ud.phone,
          ud.mobile,
          ud.fax,
          ud.website,
          ud.dob,
          ud.street,
          ud.city,
          ud.province,
          ud.postalCode,
          ud.country,
          ud.alias,
          ud.signature
        FROM userinfo u
        LEFT JOIN userdetails ud ON u.id = ud.id
        WHERE u.id = @userId
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }
    
    const user = result.recordset[0];
    
    // Return user data with EmployeeId
    res.json({
      success: true,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      EmployeeId: user.EmployeeId,
      firstName: user.firstName,
      lastName: user.lastName,
      alias: user.alias,
      phone: user.phone,
      mobile: user.mobile,
      fax: user.fax,
      website: user.website,
      dob: user.dob,
      street: user.street,
      city: user.city,
      province: user.province,
      postalCode: user.postalCode,
      country: user.country,
      profile: user.profile || "",
      signature: user.signature,
      view: user.role === 'manager' ? 'manager' : 'employee'
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching user data' 
    });
  }
});

// ==================== SIGN UP ROUTE ====================
router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const pool = await poolPromise;

    // Check if username already exists
    const existingUser = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT id FROM userinfo WHERE username = @username");

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Start transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      const userInfoRequest = new sql.Request(transaction);
      const userResult = await userInfoRequest
        .input("username", sql.NVarChar, username)
        .input("password", sql.NVarChar, hashedPassword)
        .input("role", sql.NVarChar, "employee")
        .input("profile", sql.NVarChar, "")
        .query(`
          INSERT INTO userinfo (username, password, role, profile)
          OUTPUT INSERTED.id
          VALUES (@username, @password, @role, @profile)
        `);

      const userId = userResult.recordset[0].id;

      // Insert into userdetails with default values
      const userDetailsRequest = new sql.Request(transaction);
      await userDetailsRequest
        .input("id", sql.Int, userId)
        .input("firstName", sql.NVarChar, "")
        .input("lastName", sql.NVarChar, "")
        .input("email", sql.NVarChar, "")
        .query(`
          INSERT INTO userdetails (id, firstName, lastName, email)
          VALUES (@id, @firstName, @lastName, @email)
        `);

      await transaction.commit();

      res.status(201).json({ 
        message: "User created successfully",
        userId: userId 
      });

    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Error creating account" });
  }
});

// ==================== FORGOT PASSWORD ROUTES ====================

// 1. REQUEST PASSWORD RESET
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const pool = await poolPromise;

    // Check if user exists
    const userResult = await pool
      .request()
      .input("email", sql.NVarChar, email.trim().toLowerCase())
      .query(`
        SELECT u.id, u.username, d.firstName, d.email
        FROM userinfo u
        INNER JOIN userdetails d ON u.id = d.id
        WHERE LTRIM(RTRIM(LOWER(d.email))) = @email
      `);

    console.log('Password reset request for email:', email);
    console.log('User found:', userResult.recordset.length > 0);

    if (userResult.recordset.length === 0) {
      console.log('No user found with email:', email);
      return res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    }

    const user = userResult.recordset[0];
    console.log('Found user:', user.username, 'Email:', user.email);

    if (!user.email || user.email.trim() === '') {
      console.log('User exists but has no email address in database');
      return res.status(200).json({ 
        message: "If an account with that email exists, a password reset link has been sent." 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store token in database
    await pool
      .request()
      .input("userId", sql.Int, user.id)
      .input("resetToken", sql.NVarChar, resetToken)
      .input("resetTokenExpiry", sql.DateTime, resetTokenExpiry)
      .query(`
        UPDATE userinfo
        SET resetToken = @resetToken, resetTokenExpiry = @resetTokenExpiry
        WHERE id = @userId
      `);

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/forgot-password?token=${resetToken}`;

    console.log('Sending reset email to:', user.email);
    console.log('Reset link:', resetLink);

    // SendGrid email configuration
    const msg = {
      to: user.email.trim(),
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Prophecy - No Reply'
      },
      subject: "Password Reset Request - Prophecy",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #17a2b8;">Password Reset Request</h2>
          <p>Hello ${user.firstName || user.username || 'User'},</p>
          <p>You requested to reset your password for your Prophecy account. Click the button below to reset it:</p>
          <div style="margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #17a2b8; 
                      color: white; 
                      padding: 12px 24px; 
                      text-decoration: none; 
                      border-radius: 5px;
                      display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetLink}</p>
          <p style="color: #999; font-size: 14px; margin-top: 30px;">
            This link will expire in 1 hour for security reasons.<br>
            If you didn't request this, please ignore this email.<br><br>
            <strong>This is an automated message. Please do not reply to this email.</strong>
          </p>
        </div>
      `,
    };

    // Send email using SendGrid
    await sgMail.send(msg);

    console.log('Reset email sent successfully to:', user.email);

    res.status(200).json({ 
      message: "Password reset link has been sent to your email." 
    });

  } catch (error) {
    console.error("Request reset error:", error);
    
    // SendGrid specific error handling
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
    
    res.status(500).json({ error: "Error sending reset request." });
  }
});

// 2. VERIFY RESET TOKEN
router.post("/verify-reset-token", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("token", sql.NVarChar, token)
      .query(`
        SELECT 
          u.id, 
          u.username, 
          u.resetToken, 
          u.resetTokenExpiry,
          d.firstName,
          d.lastName,
          d.email
        FROM userinfo u
        INNER JOIN userdetails d ON u.id = d.id
        WHERE u.resetToken = @token
      `);

    if (result.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    const user = result.recordset[0];

    if (new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username
    });

  } catch (error) {
    console.error("Verify token error:", error);
    res.status(500).json({ error: "Error verifying token" });
  }
});

// 3. RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const pool = await poolPromise;

    const userResult = await pool
      .request()
      .input("token", sql.NVarChar, token)
      .query(`
        SELECT id, resetToken, resetTokenExpiry
        FROM userinfo
        WHERE resetToken = @token
      `);

    if (userResult.recordset.length === 0) {
      return res.status(400).json({ error: "Invalid reset token" });
    }

    const user = userResult.recordset[0];

    if (new Date() > new Date(user.resetTokenExpiry)) {
      return res.status(400).json({ error: "Reset token has expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool
      .request()
      .input("userId", sql.Int, user.id)
      .input("password", sql.NVarChar, hashedPassword)
      .query(`
        UPDATE userinfo
        SET password = @password,
            resetToken = NULL,
            resetTokenExpiry = NULL
        WHERE id = @userId
      `);

    res.status(200).json({ 
      message: "Password has been reset successfully" 
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Error resetting password" });
  }
});

// ==================== END FORGOT PASSWORD ROUTES ====================

// Get specific user by ID (with role-based access control)
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    
    // Role-based access control
    if (requestingUser.role === 'admin') {
      // Admins can access any user
    } else if (requestingUser.role === 'manager') {
      // Managers can only access other managers and themselves
      const pool = await poolPromise;
      const targetUserResult = await pool
        .request()
        .input("id", sql.Int, userId)
        .query("SELECT role FROM userinfo WHERE id = @id");
        
      if (targetUserResult.recordset.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const targetUserRole = targetUserResult.recordset[0].role;
      if (targetUserRole !== 'manager' && parseInt(userId) !== requestingUser.userId) {
        return res.status(403).json({ error: "Access denied. Managers can only view manager accounts." });
      }
    } else {
      // Regular users can only access their own data
      if (requestingUser.userId !== parseInt(userId)) {
        return res.status(403).json({ error: "Access denied. You can only view your own profile." });
      }
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, userId)
      .query(`
        SELECT 
          u.id, 
          u.username, 
          u.role, 
          u.profile,
          u.EmployeeId,
          d.firstName,
          d.lastName,
          d.alias,
          d.email,
          d.phone,
          d.mobile,
          d.fax,
          d.website,
          d.dob,
          d.street,
          d.city,
          d.province,
          d.postalCode,
          d.country,
          d.signature,
          d.created_at,
          d.updated_at
        FROM userinfo u
        INNER JOIN userdetails d ON u.id = d.id
        WHERE u.id = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.recordset[0];
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      alias: user.alias,
      email: user.email,
      phone: user.phone,
      mobile: user.mobile,
      fax: user.fax,
      website: user.website,
      dob: user.dob,
      street: user.street,
      city: user.city,
      province: user.province,
      postalCode: user.postalCode,
      country: user.country,
      role: user.role,
      EmployeeId: user.EmployeeId,
      profile: user.profile || "",
      signature: user.signature,
      created_at: user.created_at,
      updated_at: user.updated_at,
      view: user.role === 'manager' ? 'manager' : 'employee'
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error while fetching user data" });
  }
});

// UPDATE USER PROFILE
router.put("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    const updateData = req.body;
    
    // Role-based access control
    if (requestingUser.role === 'admin') {
      // Admins can update any user
    } else if (requestingUser.role === 'manager') {
      // Managers can only update other managers and themselves
      const pool = await poolPromise;
      const targetUserResult = await pool
        .request()
        .input("id", sql.Int, userId)
        .query("SELECT role FROM userinfo WHERE id = @id");
        
      if (targetUserResult.recordset.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const targetUserRole = targetUserResult.recordset[0].role;
      if (targetUserRole !== 'manager' && parseInt(userId) !== requestingUser.userId) {
        return res.status(403).json({ error: "Access denied. Managers can only update manager accounts." });
      }
    } else {
      // Regular users can only update their own data
      if (requestingUser.userId !== parseInt(userId)) {
        return res.status(403).json({ error: "Access denied. You can only update your own profile." });
      }
    }
    
    const pool = await poolPromise;
    
    // Start a transaction
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      // Update userdetails table
      const updateFields = [];
      const request = new sql.Request(transaction);
      request.input("id", sql.Int, userId);
      
      // Build dynamic update query based on provided fields
      if (updateData.firstName !== undefined) {
        updateFields.push("firstName = @firstName");
        request.input("firstName", sql.NVarChar, updateData.firstName);
      }
      if (updateData.lastName !== undefined) {
        updateFields.push("lastName = @lastName");
        request.input("lastName", sql.NVarChar, updateData.lastName);
      }
      if (updateData.alias !== undefined) {
        updateFields.push("alias = @alias");
        request.input("alias", sql.NVarChar, updateData.alias);
      }
      if (updateData.email !== undefined) {
        updateFields.push("email = @email");
        request.input("email", sql.NVarChar, updateData.email);
      }
      if (updateData.phone !== undefined) {
        updateFields.push("phone = @phone");
        request.input("phone", sql.NVarChar, updateData.phone);
      }
      if (updateData.mobile !== undefined) {
        updateFields.push("mobile = @mobile");
        request.input("mobile", sql.NVarChar, updateData.mobile);
      }
      if (updateData.fax !== undefined) {
        updateFields.push("fax = @fax");
        request.input("fax", sql.NVarChar, updateData.fax);
      }
      if (updateData.website !== undefined) {
        updateFields.push("website = @website");
        request.input("website", sql.NVarChar, updateData.website);
      }
      if (updateData.dob !== undefined) {
        updateFields.push("dob = @dob");
        request.input("dob", sql.DateTime, updateData.dob);
      }
      if (updateData.street !== undefined) {
        updateFields.push("street = @street");
        request.input("street", sql.NVarChar, updateData.street);
      }
      if (updateData.city !== undefined) {
        updateFields.push("city = @city");
        request.input("city", sql.NVarChar, updateData.city);
      }
      if (updateData.province !== undefined) {
        updateFields.push("province = @province");
        request.input("province", sql.NVarChar, updateData.province);
      }
      if (updateData.postalCode !== undefined) {
        updateFields.push("postalCode = @postalCode");
        request.input("postalCode", sql.NVarChar, updateData.postalCode);
      }
      if (updateData.country !== undefined) {
        updateFields.push("country = @country");
        request.input("country", sql.NVarChar, updateData.country);
      }
      if (updateData.signature !== undefined) {
        updateFields.push("signature = @signature");
        request.input("signature", sql.NVarChar, updateData.signature);
      }
      
      // Add updated_at timestamp
      updateFields.push("updated_at = @updated_at");
      request.input("updated_at", sql.DateTime, new Date());
      
      if (updateFields.length > 1) {
        const updateQuery = `
          UPDATE userdetails 
          SET ${updateFields.join(', ')}
          WHERE id = @id
        `;
        await request.query(updateQuery);
      }
      
      // Update userinfo table if profile is being updated
      if (updateData.profile !== undefined) {
        const userInfoRequest = new sql.Request(transaction);
        userInfoRequest.input("id", sql.Int, userId);
        userInfoRequest.input("profile", sql.NVarChar, updateData.profile);
        
        await userInfoRequest.query(`
          UPDATE userinfo 
          SET profile = @profile
          WHERE id = @id
        `);
      }
      
      // Commit transaction
      await transaction.commit();
      
      // Fetch and return updated user data
      const updatedUserResult = await pool
        .request()
        .input("id", sql.Int, userId)
        .query(`
          SELECT 
            u.id, 
            u.username, 
            u.role, 
            u.profile,
            u.EmployeeId,
            d.firstName,
            d.lastName,
            d.alias,
            d.email,
            d.phone,
            d.mobile,
            d.fax,
            d.website,
            d.dob,
            d.street,
            d.city,
            d.province,
            d.postalCode,
            d.country,
            d.signature,
            d.created_at,
            d.updated_at
          FROM userinfo u
          INNER JOIN userdetails d ON u.id = d.id
          WHERE u.id = @id
        `);
      
      if (updatedUserResult.recordset.length === 0) {
        return res.status(404).json({ error: "User not found after update" });
      }
      
      const updatedUser = updatedUserResult.recordset[0];
      
      res.status(200).json({
        message: "User updated successfully",
        id: updatedUser.id,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        alias: updatedUser.alias,
        email: updatedUser.email,
        phone: updatedUser.phone,
        mobile: updatedUser.mobile,
        fax: updatedUser.fax,
        website: updatedUser.website,
        dob: updatedUser.dob,
        street: updatedUser.street,
        city: updatedUser.city,
        province: updatedUser.province,
        postalCode: updatedUser.postalCode,
        country: updatedUser.country,
        role: updatedUser.role,
        EmployeeId: updatedUser.EmployeeId,
        profile: updatedUser.profile || "",
        signature: updatedUser.signature,
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        view: updatedUser.role === 'manager' ? 'manager' : 'employee'
      });
      
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
    
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error while updating user data" });
  }
});

// Get users by role with enhanced role-based access control
router.get("/role/:role", authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const currentUserRole = req.user.role;

    // Enhanced role-based access control
    if (currentUserRole === 'admin') {
      // Admins can access any role
    } else if (currentUserRole === 'manager') {
      // Managers can only access manager role data
      if (role !== 'manager') {
        return res.status(403).json({ error: "Access denied. Managers can only view manager accounts." });
      }
    } else {
      // Regular users cannot access role-based endpoints
      return res.status(403).json({ error: "Access denied. Insufficient permissions." });
    }

    if (!role) {
      return res.status(400).json({ error: "Role is required!" });
    }

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("role", sql.NVarChar, role)
      .query(`
        SELECT 
          u.id,
          u.username,
          u.role,
          u.profile,
          u.EmployeeId,
          d.firstName,
          d.lastName,
          d.alias,
          d.email,
          d.phone,
          d.mobile,
          d.fax,
          d.website,
          d.dob,
          d.street,
          d.city,
          d.province,
          d.postalCode,
          d.country,
          d.created_at,
          d.updated_at
        FROM userinfo u
        JOIN userdetails d ON u.id = d.id
        WHERE LOWER(u.role) = LOWER(@role)
        ORDER BY d.firstName, d.lastName
      `);

    res.status(200).json({ users: result.recordset });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Fetch users based on requesting user's role
router.get("/users", authenticateToken, async (req, res) => {
  try {
    const currentUserRole = req.user.role;
    const currentUserId = req.user.userId;

    let query;
    let queryParams = {};

    if (currentUserRole === 'admin') {
      // Admins can see all users
      query = `
        SELECT 
          u.id,
          u.username,
          u.role,
          u.profile,
          u.EmployeeId,
          d.firstName,
          d.lastName,
          d.alias,
          d.email,
          d.phone,
          d.mobile,
          d.fax,
          d.website,
          d.dob,
          d.street,
          d.city,
          d.province,
          d.postalCode,
          d.country,
          d.signature,
          d.created_at,
          d.updated_at
        FROM userinfo u
        JOIN userdetails d ON u.id = d.id
        ORDER BY d.firstName, d.lastName
      `;
    } else if (currentUserRole === 'manager') {
      // Managers can only see manager role users
      query = `
        SELECT 
          u.id,
          u.username,
          u.role,
          u.profile,
          u.EmployeeId,
          d.firstName,
          d.lastName,
          d.alias,
          d.email,
          d.phone,
          d.mobile,
          d.fax,
          d.website,
          d.dob,
          d.street,
          d.city,
          d.province,
          d.postalCode,
          d.country,
          d.signature,
          d.created_at,
          d.updated_at
        FROM userinfo u
        JOIN userdetails d ON u.id = d.id
        WHERE LOWER(u.role) = 'manager'
        ORDER BY d.firstName, d.lastName
      `;
    } else {
      // Regular users can only see their own data
      query = `
        SELECT 
          u.id,
          u.username,
          u.role,
          u.profile,
          u.EmployeeId,
          d.firstName,
          d.lastName,
          d.alias,
          d.email,
          d.phone,
          d.mobile,
          d.fax,
          d.website,
          d.dob,
          d.street,
          d.city,
          d.province,
          d.postalCode,
          d.country,
          d.signature,
          d.created_at,
          d.updated_at
        FROM userinfo u
        JOIN userdetails d ON u.id = d.id
        WHERE u.id = @currentUserId
      `;
      queryParams.currentUserId = currentUserId;
    }

    const pool = await poolPromise;
    const request = pool.request();
    
    // Add parameters if needed
    if (queryParams.currentUserId) {
      request.input("currentUserId", sql.Int, queryParams.currentUserId);
    }
    
    const result = await request.query(query);

    res.status(200).json({ users: result.recordset });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;