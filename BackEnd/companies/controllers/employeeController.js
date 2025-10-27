const sql = require('mssql');
const { dbConfig } = require('../../config/db');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcrypt');
const fs = require('fs');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


const getEmployeeTable = (companyId) => {
  const tableMap = {
    5: 'CognifyarEmployees',           // Cognifyar Technologies (ID: 5)
    2: 'ProphecyConsultingEmployees',  // Prophecy Consulting INC (ID: 2)
    3: 'ProphecyOffshoreEmployees'     // Prophecy Offshore (ID: 3)
  };
  return tableMap[parseInt(companyId)] || 'CognifyarEmployees';
};

const getCompanyName = (companyId) => {
  const companyMap = {
    5: 'Cognifyar Technologies',
    2: 'Prophecy Consulting INC', 
    3: 'Prophecy Offshore'
  };
  return companyMap[parseInt(companyId)] || 'Cognifyar Technologies';
};

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

// Helper function to send welcome email with credentials
const sendWelcomeEmail = async (employeeData, companyName, credentials) => {
  try {
    // Create the employee portal link
    const employeePortalLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

    const msg = {
      to: employeeData.email.trim(),
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Prophecy - No Reply'
      },
      subject: `Welcome to ${companyName} - Your Account Details`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #17a2b8; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Welcome to ${companyName}!</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333;">Hello ${employeeData.name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We're excited to have you join our team! Your employee account has been successfully created.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #17a2b8; margin-top: 0;">Your Employee Details:</h3>
              <table style="width: 100%; color: #666;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Employee ID:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.employeeId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Department:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.department}</td>
                </tr>
                ${employeeData.position ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Position:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.position}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 8px 0;"><strong>Employment Type:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.employmentType}</td>
                </tr>
                ${employeeData.hireDate ? `
                <tr>
                  <td style="padding: 8px 0;"><strong>Hire Date:</strong></td>
                  <td style="padding: 8px 0;">${new Date(employeeData.hireDate).toLocaleDateString()}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${credentials ? `
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="color: #856404; margin-top: 0;">🔐 Your Login Credentials:</h3>
              <table style="width: 100%; color: #856404;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Username:</strong></td>
                  <td style="padding: 8px 0; font-family: monospace; background: white; padding: 8px; border-radius: 4px;">${credentials.username}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Password:</strong></td>
                  <td style="padding: 8px 0; font-family: monospace; background: white; padding: 8px; border-radius: 4px;">${credentials.password}</td>
                </tr>
              </table>
              <p style="color: #856404; font-size: 14px; margin-top: 15px; margin-bottom: 0;">
                ⚠️ <strong>Important:</strong> Please change your password after your first login for security purposes.
              </p>
            </div>
            ` : ''}
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${employeePortalLink}" 
                 style="background-color: #17a2b8; 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 5px;
                        display: inline-block;
                        font-weight: bold;
                        font-size: 16px;">
                Access Employee Portal
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              Click the button above to access your employee portal where you can:
            </p>
            
            <ul style="color: #666; font-size: 14px; line-height: 1.8;">
              <li>View your profile and employment details</li>
              <li>Submit and manage timesheets</li>
              <li>Access company resources</li>
              <li>Update your personal information</li>
            </ul>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 30px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #17a2b8; word-break: break-all; font-size: 12px;">
              ${employeePortalLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.6;">
              If you have any questions or need assistance, please contact your HR department.<br><br>
              <strong>This is an automated message. Please do not reply to this email.</strong>
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('Welcome email sent successfully to:', employeeData.email);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};


const sendTimesheetRejectionEmail = async (employeeData, rejectionReason, timesheetPeriod) => {
  try {
    const employeePortalLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;

    const msg = {
      to: employeeData.email.trim(),
      from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: process.env.SENDGRID_FROM_NAME || 'Prophecy - No Reply'
      },
      subject: `Timesheet Rejected - Action Required`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #ef4444; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Timesheet Rejected</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333;">Hello ${employeeData.name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your timesheet has been reviewed and rejected. Please review the feedback below and resubmit your timesheet with the necessary corrections.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
              <h3 style="color: #ef4444; margin-top: 0;">Timesheet Details:</h3>
              <table style="width: 100%; color: #666;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Employee ID:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.employeeId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Department:</strong></td>
                  <td style="padding: 8px 0;">${employeeData.department}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Period:</strong></td>
                  <td style="padding: 8px 0;">${timesheetPeriod}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Status:</strong></td>
                  <td style="padding: 8px 0;">
                    <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: #fee2e2; color: #991b1b;">
                      REJECTED
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <h3 style="color: #856404; margin-top: 0;">Rejection Reason:</h3>
              <p style="color: #666; margin: 0; padding: 12px; background: white; border-radius: 4px;">
                ${rejectionReason || 'No specific reason provided. Please contact your manager for more details.'}
              </p>
            </div>

            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">Next Steps:</h3>
              <ol style="color: #666; margin: 0; padding-left: 20px;">
                <li>Review the rejection reason above</li>
                <li>Make the necessary corrections to your timesheet</li>
                <li>Resubmit your timesheet through the employee portal</li>
                <li>Your manager will review and approve/reject again</li>
              </ol>
            </div>
            
            <div style="margin: 30px 0; text-align: center;">
              <a href="${employeePortalLink}" 
                 style="background-color: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                Access Employee Portal
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.6;">
              If you have any questions about this rejection, please contact your manager or the HR department.<br><br>
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </div>
      `,
    };

    await sgMail.send(msg);
    console.log('Email sent successfully to:', employeeData.email);
    return { success: true };
  } catch (error) {
    console.error('Error sending rejection email:', error);
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }
    return { success: false, error: error.message };
  }
};

const employeeController = {
  // Test database connection
  testConnection: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const result = await sql.query('SELECT 1 as test');
      res.json({
        success: true,
        message: 'Employee database connection successful',
        data: result.recordset
      });
    } catch (error) {
      console.error('Employee database connection test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Employee database connection failed',
        error: error.message
      });
    }
  },

  // Get all employees for a specific company
  getAllEmployees: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId } = req.params;
      const { status, department, search, limit, offset } = req.query;
      
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      let query = `SELECT * FROM ${tableName} WHERE 1=1`;
      let inputs = [];
      
      if (status && status !== 'all') {
        query += ' AND Status = @status';
        inputs.push({ name: 'status', type: sql.NVarChar, value: status });
      }
      
      if (department && department !== 'all') {
        query += ' AND Department = @department';
        inputs.push({ name: 'department', type: sql.NVarChar, value: department });
      }
      
      if (search) {
        query += ` AND (Name LIKE @search 
                      OR Email LIKE @search 
                      OR EmployeeId LIKE @search
                      OR Position LIKE @search)`;
        inputs.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
      }
      
      query += ' ORDER BY CreatedAt DESC';
      
      if (limit) {
        query += ` OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`;
      }
      
      const request = new sql.Request();
      inputs.forEach(input => {
        request.input(input.name, input.type, input.value);
      });
      
      const result = await request.query(query);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length,
        companyId: parseInt(companyId)
      });
    } catch (error) {
      console.error('Get all employees error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving employees', 
        error: error.message 
      });
    }
  },

  // Get single employee by ID
  getEmployeeById: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId } = req.params;
      
      if (!companyId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and Employee ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const request = new sql.Request();
      request.input('employeeId', sql.NVarChar, employeeId);
      
      const result = await request.query(`
        SELECT * FROM ${tableName} WHERE EmployeeId = @employeeId
      `);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found' 
        });
      }
      
      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Get employee by ID error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving employee', 
        error: error.message 
      });
    }
  },

// Replace your createEmployee function in employeeController.js with this:

  createEmployee: async (req, res) => {
    try {
      console.log('Creating employee request received');
      console.log('Request body:', req.body);
      
      await sql.connect(dbConfig);
      const { companyId } = req.params;
      
      const {
        name, email, phone, department, position, employmentType = 'Full-time',
        status = 'Active', hireDate, location, employeeId,
        username, password
      } = req.body;

      // Validate required fields
      if (!name || !email || !department || !companyId) {
        return res.status(400).json({
          success: false,
          message: 'Name, Email, Department, and Company ID are required fields'
        });
      }

      // Validate Employee ID is provided
      if (!employeeId || !employeeId.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID is required'
        });
      }

      // Validate username and password if provided
      if (username && !password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required when username is provided'
        });
      }

      if (password && !username) {
        return res.status(400).json({
          success: false,
          message: 'Username is required when password is provided'
        });
      }

      if (password && password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      const tableName = getEmployeeTable(companyId);
      const companyName = getCompanyName(companyId);
      
      // Check if email already exists in this company
      const checkRequest = new sql.Request();
      checkRequest.input('email', sql.NVarChar, email.toLowerCase());
      const checkResult = await checkRequest.query(`
        SELECT Id FROM ${tableName} WHERE LOWER(Email) = @email
      `);
      
      if (checkResult.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An employee with this email already exists in this company'
        });
      }

      // Check if Employee ID already exists
      const idCheckRequest = new sql.Request();
      idCheckRequest.input('employeeId', sql.NVarChar, employeeId.trim());
      const idCheckResult = await idCheckRequest.query(`
        SELECT Id FROM ${tableName} WHERE EmployeeId = @employeeId
      `);
      
      if (idCheckResult.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An employee with this ID already exists in this company'
        });
      }

      // Check if username already exists (if provided)
      let userAuthId = null;
      let hashedPassword = null;
      let plainPassword = password;

      if (username && password) {
        const usernameCheckRequest = new sql.Request();
        usernameCheckRequest.input('username', sql.NVarChar, username.trim());
        const usernameCheckResult = await usernameCheckRequest.query(`
          SELECT id FROM userinfo WHERE username = @username
        `);
        
        if (usernameCheckResult.recordset.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Username already exists. Please choose a different username.'
          });
        }

        // Hash the password
        hashedPassword = await bcrypt.hash(password, 10);

        // Create user authentication account
        const userInfoRequest = new sql.Request();
        const userResult = await userInfoRequest
          .input('username', sql.NVarChar, username.trim())
          .input('password', sql.NVarChar, hashedPassword)
          .input('role', sql.NVarChar, 'employee')
          .input('profile', sql.NVarChar, '')
          .input('employeeId', sql.NVarChar, employeeId.trim()) // ⭐ CRITICAL FIX: Link EmployeeId here
          .query(`
            INSERT INTO userinfo (username, password, role, profile, EmployeeId)
            OUTPUT INSERTED.id
            VALUES (@username, @password, @role, @profile, @employeeId)
          `);

        userAuthId = userResult.recordset[0].id;

        // Insert into userdetails with employee information
        const userDetailsRequest = new sql.Request();
        await userDetailsRequest
          .input('id', sql.Int, userAuthId)
          .input('firstName', sql.NVarChar, name.split(' ')[0] || name)
          .input('lastName', sql.NVarChar, name.split(' ').slice(1).join(' ') || '')
          .input('email', sql.NVarChar, email.trim().toLowerCase())
          .query(`
            INSERT INTO userdetails (id, firstName, lastName, email)
            VALUES (@id, @firstName, @lastName, @email)
          `);

        console.log('✅ User authentication created with ID:', userAuthId);
        console.log('✅ EmployeeId linked:', employeeId.trim());
      }

      // Insert new employee
      const request = new sql.Request();
      request.input('employeeId', sql.NVarChar, employeeId.trim());
      request.input('name', sql.NVarChar, name.trim());
      request.input('email', sql.NVarChar, email.trim().toLowerCase());
      request.input('phone', sql.NVarChar, phone ? phone.trim() : null);
      request.input('department', sql.NVarChar, department.trim());
      request.input('position', sql.NVarChar, position ? position.trim() : null);
      request.input('employmentType', sql.NVarChar, employmentType);
      request.input('status', sql.NVarChar, status);
      request.input('hireDate', sql.Date, hireDate ? new Date(hireDate) : null);
      request.input('location', sql.NVarChar, location ? location.trim() : null);
      request.input('createdAt', sql.DateTime, new Date());
      request.input('updatedAt', sql.DateTime, new Date());
      
      const result = await request.query(`
        INSERT INTO ${tableName} (EmployeeId, Name, Email, Phone, Department, Position, 
                                  EmploymentType, Status, HireDate, Location, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.Id
        VALUES (@employeeId, @name, @email, @phone, @department, @position, 
                @employmentType, @status, @hireDate, @location, @createdAt, @updatedAt)
      `);
      
      const newId = result.recordset[0].Id;
      
      // Get the created employee
      const getRequest = new sql.Request();
      getRequest.input('id', sql.Int, newId);
      const getResult = await getRequest.query(`
        SELECT * FROM ${tableName} WHERE Id = @id
      `);
      
      const newEmployee = getResult.recordset[0];

      // Send welcome email
      const credentials = username && password ? {
        username: username.trim(),
        password: plainPassword
      } : null;

      const emailResult = await sendWelcomeEmail({
        employeeId: newEmployee.EmployeeId,
        name: newEmployee.Name,
        email: newEmployee.Email,
        department: newEmployee.Department,
        position: newEmployee.Position,
        employmentType: newEmployee.EmploymentType,
        hireDate: newEmployee.HireDate
      }, companyName, credentials);

      res.status(201).json({
        success: true,
        message: 'Employee created successfully',
        data: newEmployee,
        authCreated: userAuthId !== null,
        employeeIdLinked: userAuthId !== null,
        emailSent: emailResult.success,
        emailError: emailResult.error || null
      });
    } catch (error) {
      console.error('Create employee error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating employee: ' + error.message, 
        error: error.message
      });
    }
  },

  // Update employee
  updateEmployee: async (req, res) => {
    try {
      console.log('Updating employee request received');
      console.log('Company ID:', req.params.companyId);
      console.log('Employee ID:', req.params.employeeId);
      console.log('Request body:', req.body);
      
      await sql.connect(dbConfig);
      const { companyId, employeeId } = req.params;
      
      const {
        name, email, phone, department, position, employmentType,
        status, hireDate, location
      } = req.body;
      
      // Validate required fields
      if (!name || !email || !department) {
        return res.status(400).json({
          success: false,
          message: 'Name, Email, and Department are required fields'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      // Check if employee exists
      const checkRequest = new sql.Request();
      checkRequest.input('employeeId', sql.NVarChar, employeeId);
      const checkResult = await checkRequest.query(`
        SELECT * FROM ${tableName} WHERE EmployeeId = @employeeId
      `);
      
      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found' 
        });
      }
      
      // Check if email already exists for other employees
      const emailCheckRequest = new sql.Request();
      emailCheckRequest.input('email', sql.NVarChar, email.toLowerCase());
      emailCheckRequest.input('employeeId', sql.NVarChar, employeeId);
      const emailCheckResult = await emailCheckRequest.query(`
        SELECT Id FROM ${tableName} WHERE LOWER(Email) = @email AND EmployeeId != @employeeId
      `);
      
      if (emailCheckResult.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another employee with this email already exists in this company'
        });
      }
      
      const request = new sql.Request();
      request.input('employeeId', sql.NVarChar, employeeId);
      request.input('name', sql.NVarChar, name.trim());
      request.input('email', sql.NVarChar, email.trim().toLowerCase());
      request.input('phone', sql.NVarChar, phone ? phone.trim() : null);
      request.input('department', sql.NVarChar, department.trim());
      request.input('position', sql.NVarChar, position ? position.trim() : null);
      request.input('employmentType', sql.NVarChar, employmentType || 'Full-time');
      request.input('status', sql.NVarChar, status || 'Active');
      request.input('hireDate', sql.Date, hireDate ? new Date(hireDate) : null);
      request.input('location', sql.NVarChar, location ? location.trim() : null);
      request.input('updatedAt', sql.DateTime, new Date());
      
      const result = await request.query(`
        UPDATE ${tableName} 
        SET Name = @name, 
            Email = @email, 
            Phone = @phone, 
            Department = @department, 
            Position = @position, 
            EmploymentType = @employmentType, 
            Status = @status, 
            HireDate = @hireDate, 
            Location = @location, 
            UpdatedAt = @updatedAt
        WHERE EmployeeId = @employeeId
      `);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found or no changes made' 
        });
      }
      
      // Get updated employee
      const getRequest = new sql.Request();
      getRequest.input('employeeId', sql.NVarChar, employeeId);
      const getResult = await getRequest.query(`
        SELECT * FROM ${tableName} WHERE EmployeeId = @employeeId
      `);
      
      res.json({
        success: true,
        message: 'Employee updated successfully',
        data: getResult.recordset[0]
      });
    } catch (error) {
      console.error('Update employee error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating employee', 
        error: error.message 
      });
    }
  },

  // Rest of the methods remain the same...
  updateEmployeeStatus: async (req, res) => {
    try {
      console.log('=== UPDATE EMPLOYEE STATUS REQUEST ===');
      console.log('Company ID:', req.params.companyId);
      console.log('Employee ID:', req.params.employeeId);
      console.log('Request Body:', req.body);
      
      await sql.connect(dbConfig);
      const { companyId, employeeId } = req.params;
      const { status } = req.body;
      
      if (!companyId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and Employee ID are required'
        });
      }
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }
      
      const validStatuses = ['Active', 'Inactive', 'On Leave'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const checkRequest = new sql.Request();
      checkRequest.input('employeeId', sql.NVarChar, employeeId);
      const checkResult = await checkRequest.query(`
        SELECT EmployeeId, Status FROM ${tableName} WHERE EmployeeId = @employeeId
      `);
      
      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found' 
        });
      }
      
      const request = new sql.Request();
      request.input('employeeId', sql.NVarChar, employeeId);
      request.input('status', sql.NVarChar, status);
      request.input('updatedAt', sql.DateTime, new Date());
      
      const result = await request.query(`
        UPDATE ${tableName} 
        SET Status = @status, UpdatedAt = @updatedAt
        WHERE EmployeeId = @employeeId
      `);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found or no changes made' 
        });
      }
      
      const getRequest = new sql.Request();
      getRequest.input('employeeId', sql.NVarChar, employeeId);
      const getResult = await getRequest.query(`
        SELECT * FROM ${tableName} WHERE EmployeeId = @employeeId
      `);
      
      res.json({
        success: true,
        message: `Employee status updated to ${status} successfully`,
        data: getResult.recordset[0]
      });
    } catch (error) {
      console.error('=== UPDATE EMPLOYEE STATUS ERROR ===');
      console.error('Error details:', error);
      
      res.status(500).json({ 
        success: false, 
        message: 'Error updating employee status', 
        error: error.message
      });
    }
  },

  deleteEmployee: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId } = req.params;
      
      if (!companyId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and Employee ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const checkRequest = new sql.Request();
      checkRequest.input('employeeId', sql.NVarChar, employeeId);
      const checkResult = await checkRequest.query(`
        SELECT * FROM ${tableName} WHERE EmployeeId = @employeeId
      `);
      
      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found' 
        });
      }

      const employee = checkResult.recordset[0];
      
      // Delete associated user authentication account if exists
      const authCheckRequest = new sql.Request();
      authCheckRequest.input('email', sql.NVarChar, employee.Email.toLowerCase());
      const authCheckResult = await authCheckRequest.query(`
        SELECT u.id FROM userinfo u
        INNER JOIN userdetails d ON u.id = d.id
        WHERE LOWER(d.email) = @email
      `);
      
      if (authCheckResult.recordset.length > 0) {
        const authUserId = authCheckResult.recordset[0].id;
        
        // Delete from userdetails first
        const deleteUserDetailsRequest = new sql.Request();
        deleteUserDetailsRequest.input('userId', sql.Int, authUserId);
        await deleteUserDetailsRequest.query(`
          DELETE FROM userdetails WHERE id = @userId
        `);
        
        // Delete from userinfo
        const deleteUserInfoRequest = new sql.Request();
        deleteUserInfoRequest.input('userId', sql.Int, authUserId);
        await deleteUserInfoRequest.query(`
          DELETE FROM userinfo WHERE id = @userId
        `);
        
        console.log(`Deleted user authentication account for employee ${employeeId}`);
      }
      
      const timesheetCheckRequest = new sql.Request();
      timesheetCheckRequest.input('employeeId', sql.NVarChar, employeeId);
      const timesheetCheckResult = await timesheetCheckRequest.query(`
        SELECT COUNT(*) as TimesheetCount FROM Timesheets WHERE EmployeeId = @employeeId
      `);
      
      const timesheetCount = timesheetCheckResult.recordset[0].TimesheetCount;
      
      if (timesheetCount > 0) {
        const deleteTimesheetsRequest = new sql.Request();
        deleteTimesheetsRequest.input('employeeId', sql.NVarChar, employeeId);
        
        await deleteTimesheetsRequest.query(`
          DELETE te FROM TimesheetEntries te
          INNER JOIN Timesheets t ON te.TimesheetId = t.Id
          WHERE t.EmployeeId = @employeeId
        `);
        
        await deleteTimesheetsRequest.query(`
          DELETE FROM Timesheets WHERE EmployeeId = @employeeId
        `);
        
        console.log(`Deleted ${timesheetCount} timesheet(s) for employee ${employeeId}`);
      }
      
      const externalCheckRequest = new sql.Request();
      externalCheckRequest.input('employeeId', sql.NVarChar, employeeId);
      const externalCheckResult = await externalCheckRequest.query(`
        SELECT COUNT(*) as ExternalCount FROM ExternalTimesheetFiles WHERE EmployeeId = @employeeId
      `);
      
      const externalCount = externalCheckResult.recordset[0].ExternalCount;
      
      if (externalCount > 0) {
        const deleteExternalRequest = new sql.Request();
        deleteExternalRequest.input('employeeId', sql.NVarChar, employeeId);
        await deleteExternalRequest.query(`
          DELETE FROM ExternalTimesheetFiles WHERE EmployeeId = @employeeId
        `);
        console.log(`Deleted ${externalCount} external timesheet(s) for employee ${employeeId}`);
      }
      
      const payCheckRequest = new sql.Request();
      payCheckRequest.input('employeeId', sql.NVarChar, employeeId);
      const payCheckResult = await payCheckRequest.query(`
        SELECT COUNT(*) as PayCount FROM EmployeePayStructure WHERE EmployeeId = @employeeId
      `);
      
      const payCount = payCheckResult.recordset[0].PayCount;
      
      if (payCount > 0) {
        const deletePayRequest = new sql.Request();
        deletePayRequest.input('employeeId', sql.NVarChar, employeeId);
        await deletePayRequest.query(`
          DELETE FROM EmployeePayStructure WHERE EmployeeId = @employeeId
        `);
        console.log(`Deleted ${payCount} pay structure record(s) for employee ${employeeId}`);
      }
      
      const reportsCheckRequest = new sql.Request();
      reportsCheckRequest.input('employeeId', sql.NVarChar, employeeId);
      const reportsCheckResult = await reportsCheckRequest.query(`
        SELECT COUNT(*) as ReportsCount FROM EmployeeReports WHERE EmployeeId = @employeeId
      `);
      
      const reportsCount = reportsCheckResult.recordset[0].ReportsCount;
      
      if (reportsCount > 0) {
        const deleteReportsRequest = new sql.Request();
        deleteReportsRequest.input('employeeId', sql.NVarChar, employeeId);
        await deleteReportsRequest.query(`
          DELETE FROM EmployeeReports WHERE EmployeeId = @employeeId
        `);
        console.log(`Deleted ${reportsCount} report(s) for employee ${employeeId}`);
      }
      
      const request = new sql.Request();
      request.input('employeeId', sql.NVarChar, employeeId);
      
      const result = await request.query(`
        DELETE FROM ${tableName} WHERE EmployeeId = @employeeId
      `);
      
      const totalDeleted = timesheetCount + externalCount + payCount + reportsCount;
      
      res.json({
        success: true,
        message: totalDeleted > 0 
          ? `Employee and ${totalDeleted} associated record(s) deleted successfully`
          : 'Employee deleted successfully',
        deletedRecords: {
          timesheets: timesheetCount,
          externalTimesheets: externalCount,
          payRecords: payCount,
          reports: reportsCount
        }
      });
    } catch (error) {
      console.error('Delete employee error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting employee', 
        error: error.message 
      });
    }
  },

  // All other methods remain unchanged - keeping them for completeness
  getEmployeesByDepartment: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, department } = req.params;
      
      if (!companyId || !department) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and Department are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const request = new sql.Request();
      request.input('department', sql.NVarChar, department);
      
      const result = await request.query(`
        SELECT * FROM ${tableName} 
        WHERE Department = @department
        ORDER BY Name ASC
      `);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length,
        department: department,
        companyId: parseInt(companyId)
      });
    } catch (error) {
      console.error('Get employees by department error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving employees by department', 
        error: error.message 
      });
    }
  },

  searchEmployees: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId } = req.params;
      const { q, limit = 50 } = req.query;
      
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const request = new sql.Request();
      request.input('search', sql.NVarChar, `%${q.trim()}%`);
      request.input('limit', sql.Int, parseInt(limit));
      
      const result = await request.query(`
        SELECT TOP (@limit) * FROM ${tableName}
        WHERE Name LIKE @search 
           OR Email LIKE @search 
           OR EmployeeId LIKE @search
           OR Position LIKE @search
           OR Department LIKE @search
        ORDER BY Name ASC
      `);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length,
        searchTerm: q,
        companyId: parseInt(companyId)
      });
    } catch (error) {
      console.error('Search employees error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error searching employees', 
        error: error.message 
      });
    }
  },

  getEmployeeStats: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId } = req.params;
      
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID is required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const result = await sql.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN Status = 'Inactive' THEN 1 ELSE 0 END) as inactive,
          SUM(CASE WHEN Status = 'On Leave' THEN 1 ELSE 0 END) as onLeave,
          COUNT(DISTINCT Department) as departments,
          SUM(CASE WHEN EmploymentType = 'Full-time' THEN 1 ELSE 0 END) as fullTime,
          SUM(CASE WHEN EmploymentType = 'Part-time' THEN 1 ELSE 0 END) as partTime,
          SUM(CASE WHEN EmploymentType = 'Contract' THEN 1 ELSE 0 END) as contract
        FROM ${tableName}
      `);
      
      res.json({
        success: true,
        data: result.recordset[0],
        companyId: parseInt(companyId)
      });
    } catch (error) {
      console.error('Get employee stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving employee statistics', 
        error: error.message 
      });
    }
  },

  getEmployeeDetails: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId } = req.params;
      
      if (!companyId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and Employee ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const employeeRequest = new sql.Request();
       employeeRequest.input('employeeId', sql.Int, parseInt(employeeId)); 
      
      const employeeResult = await employeeRequest.query(`
      SELECT * FROM ${tableName} WHERE Id = @employeeId  -- Use database Id column
    `);
      
      if (employeeResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Employee not found' 
        });
      }

      const employee = employeeResult.recordset[0];

     const timesheetRequest = new sql.Request();
    timesheetRequest.input('employeeIdCode', sql.NVarChar, employee.EmployeeId);  // Now use EmployeeId string
    timesheetRequest.input('companyId', sql.Int, parseInt(companyId));
      
      const timesheetResult = await timesheetRequest.query(`
        SELECT 
          COUNT(*) as TimesheetCount,
          SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as PendingCount,
          SUM(CASE WHEN Status = 'Approved' THEN 1 ELSE 0 END) as ApprovedCount,
          SUM(CASE WHEN Status = 'Rejected' THEN 1 ELSE 0 END) as RejectedCount
        FROM Timesheets 
        WHERE EmployeeId = @employeeIdCode AND CompanyId = @companyId
      `);

      const externalTimesheetRequest = new sql.Request();
      externalTimesheetRequest.input('employeeIdCode', sql.NVarChar, employee.EmployeeId);
      externalTimesheetRequest.input('companyId', sql.Int, parseInt(companyId));
      
      const externalTimesheetResult = await externalTimesheetRequest.query(`
        SELECT COUNT(*) as ExternalTimesheetCount
        FROM ExternalTimesheetFiles 
        WHERE EmployeeId = @employeeIdCode AND CompanyId = @companyId
      `);

      const statementRequest = new sql.Request();
      statementRequest.input('employeeIdCode', sql.NVarChar, employee.EmployeeId);
      
      const statementResult = await statementRequest.query(`
        SELECT COUNT(*) as StatementCount
        FROM EmployeePayStructure 
        WHERE EmployeeId = @employeeIdCode
      `);

      res.json({
        success: true,
        data: {
          employee: employee,
          stats: {
            timesheets: {
              total: timesheetResult.recordset[0].TimesheetCount || 0,
              pending: timesheetResult.recordset[0].PendingCount || 0,
              approved: timesheetResult.recordset[0].ApprovedCount || 0,
              rejected: timesheetResult.recordset[0].RejectedCount || 0
            },
            externalTimesheets: externalTimesheetResult.recordset[0].ExternalTimesheetCount || 0,
            statements: statementResult.recordset[0].StatementCount || 0
          }
        }
      });
    } catch (error) {
      console.error('Get employee details error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving employee details', 
        error: error.message 
      });
    }
  },

  getEmployeeTimesheets: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId } = req.params;
      const { status, startDate, endDate } = req.query;
      
      if (!companyId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and Employee ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const empRequest = new sql.Request();
      empRequest.input('id', sql.Int, parseInt(employeeId));
      const empResult = await empRequest.query(`SELECT EmployeeId FROM ${tableName} WHERE Id = @id`);
      
      if (empResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      const employeeIdCode = empResult.recordset[0].EmployeeId;

      let query = `
        SELECT 
          t.*,
          e.Name as EmployeeName, 
          e.Email as EmployeeEmail
        FROM Timesheets t
        INNER JOIN ${tableName} e ON t.EmployeeId = e.EmployeeId
        WHERE t.EmployeeId = @employeeIdCode AND t.CompanyId = @companyId
      `;
      
      const request = new sql.Request();
      request.input('employeeIdCode', sql.NVarChar, employeeIdCode);
      request.input('companyId', sql.Int, parseInt(companyId));
      
      if (status && status !== 'all') {
        query += ' AND t.Status = @status';
        request.input('status', sql.NVarChar, status);
      }
      
      if (startDate) {
        query += ' AND t.PeriodStart >= @startDate';
        request.input('startDate', sql.Date, new Date(startDate));
      }
      
      if (endDate) {
        query += ' AND t.PeriodEnd <= @endDate';
        request.input('endDate', sql.Date, new Date(endDate));
      }
      
      query += ' ORDER BY t.PeriodStart DESC';
      
      const result = await request.query(query);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length
      });
    } catch (error) {
      console.error('Get employee timesheets error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving employee timesheets', 
        error: error.message 
      });
    }
  },

  getEmployeeExternalTimesheets: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId } = req.params;
      
      if (!companyId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and Employee ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const empRequest = new sql.Request();
      empRequest.input('id', sql.Int, parseInt(employeeId));
      const empResult = await empRequest.query(`SELECT EmployeeId FROM ${tableName} WHERE Id = @id`);
      
      if (empResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      const employeeIdCode = empResult.recordset[0].EmployeeId;

      const request = new sql.Request();
      request.input('employeeIdCode', sql.NVarChar, employeeIdCode);
      request.input('companyId', sql.Int, parseInt(companyId));
      
      const result = await request.query(`
        SELECT * FROM ExternalTimesheetFiles 
        WHERE EmployeeId = @employeeIdCode AND CompanyId = @companyId
        ORDER BY UploadDate DESC
      `);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length
      });
    } catch (error) {
      console.error('Get employee external timesheets error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving external timesheets', 
        error: error.message 
      });
    }
  },

  getEmployeeStatements: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId } = req.params;
      const { startDate, endDate } = req.query;
      
      if (!companyId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and Employee ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const empRequest = new sql.Request();
      empRequest.input('id', sql.Int, parseInt(employeeId));
      const empResult = await empRequest.query(`SELECT EmployeeId FROM ${tableName} WHERE Id = @id`);
      
      if (empResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      const employeeIdCode = empResult.recordset[0].EmployeeId;

      let query = `
        SELECT * FROM EmployeePayStructure 
        WHERE EmployeeId = @employeeIdCode
      `;
      
      const request = new sql.Request();
      request.input('employeeIdCode', sql.NVarChar, employeeIdCode);
      
      if (startDate) {
        query += ' AND CheckDate >= @startDate';
        request.input('startDate', sql.Date, new Date(startDate));
      }
      
      if (endDate) {
        query += ' AND CheckDate <= @endDate';
        request.input('endDate', sql.Date, new Date(endDate));
      }
      
      query += ' ORDER BY CheckDate DESC';
      
      const result = await request.query(query);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length
      });
    } catch (error) {
      console.error('Get employee statements error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving employee statements', 
        error: error.message 
      });
    }
  },

  getEmployeeReports: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId } = req.params;
      
      if (!companyId || !employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID and Employee ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const empRequest = new sql.Request();
      empRequest.input('id', sql.Int, parseInt(employeeId));
      const empResult = await empRequest.query(`SELECT EmployeeId FROM ${tableName} WHERE Id = @id`);
      
      if (empResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      const employeeIdCode = empResult.recordset[0].EmployeeId;

      const request = new sql.Request();
      request.input('employeeIdCode', sql.NVarChar, employeeIdCode);
      
      const result = await request.query(`
        SELECT * FROM EmployeeReports 
        WHERE EmployeeId = @employeeIdCode
        ORDER BY UploadDate DESC
      `);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length
      });
    } catch (error) {
      console.error('Get employee reports error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving employee reports', 
        error: error.message 
      });
    }
  },

  deleteExternalTimesheet: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId, timesheetId } = req.params;
      
      if (!companyId || !employeeId || !timesheetId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID, Employee ID, and Timesheet ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const empRequest = new sql.Request();
      empRequest.input('id', sql.Int, parseInt(employeeId));
      const empResult = await empRequest.query(`SELECT EmployeeId FROM ${tableName} WHERE Id = @id`);
      
      if (empResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      const employeeIdCode = empResult.recordset[0].EmployeeId;

      const request = new sql.Request();
      request.input('timesheetId', sql.Int, parseInt(timesheetId));
      request.input('employeeIdCode', sql.NVarChar, employeeIdCode);
      request.input('companyId', sql.Int, parseInt(companyId));
      
      const result = await request.query(`
        DELETE FROM ExternalTimesheetFiles 
        WHERE Id = @timesheetId 
          AND EmployeeId = @employeeIdCode 
          AND CompanyId = @companyId
      `);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'External timesheet not found'
        });
      }
      
      res.json({
        success: true,
        message: 'External timesheet deleted successfully'
      });
    } catch (error) {
      console.error('Delete external timesheet error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting external timesheet', 
        error: error.message 
      });
    }
  },

  deleteReport: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId, reportId } = req.params;
      
      if (!companyId || !employeeId || !reportId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID, Employee ID, and Report ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const empRequest = new sql.Request();
      empRequest.input('id', sql.Int, parseInt(employeeId));
      const empResult = await empRequest.query(`SELECT EmployeeId FROM ${tableName} WHERE Id = @id`);
      
      if (empResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      const employeeIdCode = empResult.recordset[0].EmployeeId;

      const request = new sql.Request();
      request.input('reportId', sql.Int, parseInt(reportId));
      request.input('employeeIdCode', sql.NVarChar, employeeIdCode);
      
      const result = await request.query(`
        DELETE FROM EmployeeReports 
        WHERE Id = @reportId AND EmployeeId = @employeeIdCode
      `);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Report not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Delete report error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting report', 
        error: error.message 
      });
    }
  },

  deleteStatement: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId, employeeId, statementId } = req.params;
      
      if (!companyId || !employeeId || !statementId) {
        return res.status(400).json({
          success: false,
          message: 'Company ID, Employee ID, and Statement ID are required'
        });
      }

      const tableName = getEmployeeTable(companyId);
      
      const empRequest = new sql.Request();
      empRequest.input('id', sql.Int, parseInt(employeeId));
      const empResult = await empRequest.query(`SELECT EmployeeId FROM ${tableName} WHERE Id = @id`);
      
      if (empResult.recordset.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Employee not found'
        });
      }
      
      const employeeIdCode = empResult.recordset[0].EmployeeId;

      const request = new sql.Request();
      request.input('statementId', sql.Int, parseInt(statementId));
      request.input('employeeIdCode', sql.NVarChar, employeeIdCode);
      
      const result = await request.query(`
        DELETE FROM EmployeePayStructure 
        WHERE Id = @statementId AND EmployeeId = @employeeIdCode
      `);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({
          success: false,
          message: 'Statement not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Statement deleted successfully'
      });
    } catch (error) {
      console.error('Delete statement error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting statement', 
        error: error.message 
      });
    }
  }
};


// Get employee external timesheets
exports.getEmployeeExternalTimesheets = async (req, res) => {
  try {
    const { companyId, employeeId } = req.params;
    const pool = await poolPromise;

    console.log('Fetching external timesheets for:', { companyId, employeeId });

    // Get external timesheets for this employee
    const result = await pool.request()
      .input('employeeId', sql.NVarChar, employeeId)
      .input('companyId', sql.Int, parseInt(companyId))
      .query(`
        SELECT 
          Id,
          EmployeeId,
          CompanyId,
          FileName,
          FilePath,
          FileSize,
          MimeType,
          ClientName,
          ProjectName,
          PeriodStart,
          PeriodEnd,
          Period,
          Status,
          UploadDate,
          ApprovedBy,
          ApprovedDate,
          RejectionReason
        FROM ExternalTimesheetFiles
        WHERE EmployeeId = @employeeId 
          AND CompanyId = @companyId
        ORDER BY UploadDate DESC
      `);

    console.log('Found external timesheets:', result.recordset.length);

    res.status(200).json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching employee external timesheets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch external timesheets',
      error: error.message
    });
  }
};

// Delete external timesheet
exports.deleteExternalTimesheet = async (req, res) => {
  try {
    const { companyId, employeeId, timesheetId } = req.params;
    const pool = await poolPromise;

    console.log('Deleting external timesheet:', { companyId, employeeId, timesheetId });

    // Get file info first
    const fileResult = await pool.request()
      .input('id', sql.Int, parseInt(timesheetId))
      .input('employeeId', sql.NVarChar, employeeId)
      .input('companyId', sql.Int, parseInt(companyId))
      .query(`
        SELECT FilePath 
        FROM ExternalTimesheetFiles
        WHERE Id = @id 
          AND EmployeeId = @employeeId 
          AND CompanyId = @companyId
      `);

    if (fileResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'External timesheet not found'
      });
    }

    const filePath = fileResult.recordset[0].FilePath;

    // Delete from database
    await pool.request()
      .input('id', sql.Int, parseInt(timesheetId))
      .query(`DELETE FROM ExternalTimesheetFiles WHERE Id = @id`);

    // Delete file from filesystem if it exists
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('File deleted from filesystem:', filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'External timesheet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting external timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete external timesheet',
      error: error.message
    });
  }
};

// Approve external timesheet
exports.approveExternalTimesheet = async (req, res) => {
  try {
    const { companyId, employeeId, timesheetId } = req.params;
    const pool = await poolPromise;
    const userId = req.user.id;

    console.log('Approving external timesheet:', { companyId, employeeId, timesheetId, userId });

    // Check if timesheet exists
    const checkResult = await pool.request()
      .input('id', sql.Int, parseInt(timesheetId))
      .input('employeeId', sql.NVarChar, employeeId)
      .input('companyId', sql.Int, parseInt(companyId))
      .query(`
        SELECT Id, Status 
        FROM ExternalTimesheetFiles
        WHERE Id = @id 
          AND EmployeeId = @employeeId 
          AND CompanyId = @companyId
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'External timesheet not found'
      });
    }

    // Update status to Approved
    await pool.request()
      .input('id', sql.Int, parseInt(timesheetId))
      .input('userId', sql.Int, userId)
      .query(`
        UPDATE ExternalTimesheetFiles 
        SET Status = 'Approved',
            ApprovedBy = @userId,
            ApprovedDate = GETDATE()
        WHERE Id = @id
      `);

    res.status(200).json({
      success: true,
      message: 'External timesheet approved successfully'
    });
  } catch (error) {
    console.error('Error approving external timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve external timesheet',
      error: error.message
    });
  }
};

// Reject external timesheet
exports.rejectExternalTimesheet = async (req, res) => {
  try {
    const { companyId, employeeId, timesheetId } = req.params;
    const { reason } = req.body;
    const pool = await poolPromise;
    const userId = req.user.id;

    console.log('Rejecting external timesheet:', { companyId, employeeId, timesheetId, userId, reason });

    // Check if timesheet exists
    const checkResult = await pool.request()
      .input('id', sql.Int, parseInt(timesheetId))
      .input('employeeId', sql.NVarChar, employeeId)
      .input('companyId', sql.Int, parseInt(companyId))
      .query(`
        SELECT Id, Status 
        FROM ExternalTimesheetFiles
        WHERE Id = @id 
          AND EmployeeId = @employeeId 
          AND CompanyId = @companyId
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'External timesheet not found'
      });
    }

    // Update status to Rejected
    await pool.request()
      .input('id', sql.Int, parseInt(timesheetId))
      .input('userId', sql.Int, userId)
      .input('reason', sql.NVarChar, reason || 'No reason provided')
      .query(`
        UPDATE ExternalTimesheetFiles 
        SET Status = 'Rejected',
            ApprovedBy = @userId,
            ApprovedDate = GETDATE(),
            RejectionReason = @reason
        WHERE Id = @id
      `);

    res.status(200).json({
      success: true,
      message: 'External timesheet rejected successfully'
    });
  } catch (error) {
    console.error('Error rejecting external timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject external timesheet',
      error: error.message
    });
  }
};

// Download external timesheet
exports.downloadExternalTimesheet = async (req, res) => {
  try {
    const { companyId, employeeId, timesheetId } = req.params;
    const pool = await poolPromise;

    console.log('Downloading external timesheet:', { companyId, employeeId, timesheetId });

    // Get file info
    const result = await pool.request()
      .input('id', sql.Int, parseInt(timesheetId))
      .input('employeeId', sql.NVarChar, employeeId)
      .input('companyId', sql.Int, parseInt(companyId))
      .query(`
        SELECT FileName, FilePath
        FROM ExternalTimesheetFiles
        WHERE Id = @id 
          AND EmployeeId = @employeeId 
          AND CompanyId = @companyId
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const fileInfo = result.recordset[0];
    const filePath = fileInfo.FilePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, fileInfo.FileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error downloading external timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
};


// Get employee external timesheets
 const getEmployeeExternalTimesheets = async (req, res) => {
  try {
    const { companyId, employeeId } = req.params;
    await sql.connect(dbConfig);

    console.log('Fetching external timesheets for:', { companyId, employeeId });

    // CRITICAL FIX: Use employeeId directly as EmployeeId string
    const request = new sql.Request();
    request.input('employeeId', sql.NVarChar, employeeId);
    request.input('companyId', sql.Int, parseInt(companyId));
    
    const result = await request.query(`
      SELECT 
        Id,
        EmployeeId,
        CompanyId,
        FileName,
        FilePath,
        FileSize,
        MimeType,
        ClientName,
        ProjectName,
        PeriodStart,
        PeriodEnd,
        Period,
        Status,
        UploadDate,
        ApprovedBy,
        ApprovedDate,
        RejectionReason
      FROM ExternalTimesheetFiles
      WHERE EmployeeId = @employeeId 
        AND CompanyId = @companyId
      ORDER BY UploadDate DESC
    `);

    console.log('Found external timesheets:', result.recordset.length);

    res.status(200).json({
      success: true,
      data: result.recordset
    });
  } catch (error) {
    console.error('Error fetching employee external timesheets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch external timesheets',
      error: error.message
    });
  }
};

// Delete external timesheet
const deleteExternalTimesheet = async (req, res) => {
  try {
    const { companyId, employeeId, timesheetId } = req.params;
    await sql.connect(dbConfig);

    console.log('Deleting external timesheet:', { companyId, employeeId, timesheetId });

    const fileRequest = new sql.Request();
    fileRequest.input('id', sql.Int, parseInt(timesheetId));
    fileRequest.input('employeeId', sql.NVarChar, employeeId);
    fileRequest.input('companyId', sql.Int, parseInt(companyId));
    
    const fileResult = await fileRequest.query(`
      SELECT FilePath 
      FROM ExternalTimesheetFiles
      WHERE Id = @id 
        AND EmployeeId = @employeeId 
        AND CompanyId = @companyId
    `);

    if (fileResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'External timesheet not found'
      });
    }

    const filePath = fileResult.recordset[0].FilePath;

    const deleteRequest = new sql.Request();
    deleteRequest.input('id', sql.Int, parseInt(timesheetId));
    await deleteRequest.query(`DELETE FROM ExternalTimesheetFiles WHERE Id = @id`);

    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log('File deleted from filesystem:', filePath);
      } catch (fileError) {
        console.error('Error deleting file:', fileError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'External timesheet deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting external timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete external timesheet',
      error: error.message
    });
  }
};


// Approve external timesheet - FIXED VERSION
const approveExternalTimesheet = async (req, res) => {
  try {
    const { companyId, employeeId, timesheetId } = req.params;
    
    console.log('═══════════════════════════════════════');
    console.log('🔄 APPROVE EXTERNAL TIMESHEET REQUEST');
    console.log('═══════════════════════════════════════');
    console.log('Company ID:', companyId);
    console.log('Employee ID:', employeeId);
    console.log('Timesheet ID:', timesheetId);
    console.log('User:', req.user);
    console.log('═══════════════════════════════════════');

    // Connect to database
    await sql.connect(dbConfig);
    
    // Get user ID (handle null for admin)
    const userId = req.user?.id || null;

    // Check if timesheet exists
    const checkRequest = new sql.Request();
    checkRequest.input('id', sql.Int, parseInt(timesheetId));
    checkRequest.input('employeeId', sql.NVarChar, employeeId);
    checkRequest.input('companyId', sql.Int, parseInt(companyId));
    
    const checkResult = await checkRequest.query(`
      SELECT Id, Status, FileName, EmployeeId, CompanyId
      FROM ExternalTimesheetFiles
      WHERE Id = @id 
        AND EmployeeId = @employeeId 
        AND CompanyId = @companyId
    `);

    if (checkResult.recordset.length === 0) {
      console.log('❌ Timesheet not found');
      return res.status(404).json({
        success: false,
        message: 'External timesheet not found'
      });
    }

    console.log('✅ Timesheet found:', checkResult.recordset[0]);

    // Update to Approved
    const updateRequest = new sql.Request();
    updateRequest.input('id', sql.Int, parseInt(timesheetId));
    
    if (userId) {
      updateRequest.input('userId', sql.Int, userId);
      await updateRequest.query(`
        UPDATE ExternalTimesheetFiles 
        SET Status = 'Approved',
            ApprovedBy = @userId,
            ApprovedDate = GETDATE()
        WHERE Id = @id
      `);
    } else {
      await updateRequest.query(`
        UPDATE ExternalTimesheetFiles 
        SET Status = 'Approved',
            ApprovedDate = GETDATE()
        WHERE Id = @id
      `);
    }

    console.log('✅ Timesheet approved successfully');
    console.log('═══════════════════════════════════════\n');

    return res.status(200).json({
      success: true,
      message: 'External timesheet approved successfully'
    });

  } catch (error) {
    console.error('═══════════════════════════════════════');
    console.error('❌ ERROR APPROVING TIMESHEET');
    console.error('═══════════════════════════════════════');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('═══════════════════════════════════════\n');
    
    return res.status(500).json({
      success: false,
      message: 'Failed to approve external timesheet',
      error: error.message
    });
  }
};

// Reject external timesheet - FIXED VERSION
const rejectExternalTimesheet = async (req, res) => {
  try {
    const { companyId, employeeId, timesheetId } = req.params;
    const { reason } = req.body;
    
    console.log('═══════════════════════════════════════');
    console.log('🔄 REJECT EXTERNAL TIMESHEET REQUEST');
    console.log('═══════════════════════════════════════');
    console.log('Company ID:', companyId);
    console.log('Employee ID:', employeeId);
    console.log('Timesheet ID:', timesheetId);
    console.log('Reason:', reason);
    console.log('User:', req.user);
    console.log('═══════════════════════════════════════');

    // Connect to database
    await sql.connect(dbConfig);
    
    // Get user ID (handle null for admin)
    const userId = req.user?.id || null;

    // Check if timesheet exists
    const checkRequest = new sql.Request();
    checkRequest.input('id', sql.Int, parseInt(timesheetId));
    checkRequest.input('employeeId', sql.NVarChar, employeeId);
    checkRequest.input('companyId', sql.Int, parseInt(companyId));
    
    const checkResult = await checkRequest.query(`
      SELECT Id, Status, FileName, EmployeeId, CompanyId
      FROM ExternalTimesheetFiles
      WHERE Id = @id 
        AND EmployeeId = @employeeId 
        AND CompanyId = @companyId
    `);

    if (checkResult.recordset.length === 0) {
      console.log('❌ Timesheet not found');
      return res.status(404).json({
        success: false,
        message: 'External timesheet not found'
      });
    }

    console.log('✅ Timesheet found:', checkResult.recordset[0]);

    // Update to Rejected
    const updateRequest = new sql.Request();
    updateRequest.input('id', sql.Int, parseInt(timesheetId));
    updateRequest.input('reason', sql.NVarChar, reason || 'No reason provided');
    
    if (userId) {
      updateRequest.input('userId', sql.Int, userId);
      await updateRequest.query(`
        UPDATE ExternalTimesheetFiles 
        SET Status = 'Rejected',
            ApprovedBy = @userId,
            ApprovedDate = GETDATE(),
            RejectionReason = @reason
        WHERE Id = @id
      `);
    } else {
      await updateRequest.query(`
        UPDATE ExternalTimesheetFiles 
        SET Status = 'Rejected',
            ApprovedDate = GETDATE(),
            RejectionReason = @reason
        WHERE Id = @id
      `);
    }

    console.log('✅ Timesheet rejected successfully');
    console.log('═══════════════════════════════════════\n');

    return res.status(200).json({
      success: true,
      message: 'External timesheet rejected successfully'
    });

  } catch (error) {
    console.error('═══════════════════════════════════════');
    console.error('❌ ERROR REJECTING TIMESHEET');
    console.error('═══════════════════════════════════════');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('═══════════════════════════════════════\n');
    
    return res.status(500).json({
      success: false,
      message: 'Failed to reject external timesheet',
      error: error.message
    });
  }
};


// Download external timesheet
const downloadExternalTimesheet = async (req, res) => {
  try {
    const { companyId, employeeId, timesheetId } = req.params;
    await sql.connect(dbConfig);

    console.log('Downloading external timesheet:', { companyId, employeeId, timesheetId });

    const request = new sql.Request();
    request.input('id', sql.Int, parseInt(timesheetId));
    request.input('employeeId', sql.NVarChar, employeeId);
    request.input('companyId', sql.Int, parseInt(companyId));
    
    const result = await request.query(`
      SELECT FileName, FilePath
      FROM ExternalTimesheetFiles
      WHERE Id = @id 
        AND EmployeeId = @employeeId 
        AND CompanyId = @companyId
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const fileInfo = result.recordset[0];
    const filePath = fileInfo.FilePath;

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    res.download(filePath, fileInfo.FileName, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file'
          });
        }
      }
    });
  } catch (error) {
    console.error('Error downloading external timesheet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download file',
      error: error.message
    });
  }
};


module.exports = {
  ...employeeController,
  getEmployeeExternalTimesheets,
  deleteExternalTimesheet,
  approveExternalTimesheet,
  rejectExternalTimesheet,
  downloadExternalTimesheet
};

