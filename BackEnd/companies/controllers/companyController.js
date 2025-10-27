// controllers/companyController.js - Complete Company Controller with All Functionality
const sql = require('mssql');
const { dbConfig } = require('../../config/db');

// Helper function to format dates
const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().split('T')[0];
};

// Helper function to calculate days until due date
const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const companyController = {
  // Test database connection method
  testConnection: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const result = await sql.query('SELECT 1 as test');
      res.json({
        success: true,
        message: 'Database connection successful',
        data: result.recordset
      });
    } catch (error) {
      console.error('Database connection test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: error.message
      });
    }
  },



  getAllCompanies: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { status, type, manager, search, limit, offset } = req.query;
      
      // First, get all companies with filters
      let query = `
        SELECT c.*, 
              DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
              DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
        FROM Companies c 
        WHERE 1=1
      `;
      let inputs = [];
      
      if (status && status !== 'all') {
        query += ' AND c.Status = @status';
        inputs.push({ name: 'status', type: sql.NVarChar, value: status });
      }
      
      if (type && type !== 'all') {
        query += ' AND c.Type = @type';
        inputs.push({ name: 'type', type: sql.NVarChar, value: type });
      }
      
      if (manager) {
        query += ' AND c.AccountManager LIKE @manager';
        inputs.push({ name: 'manager', type: sql.NVarChar, value: `%${manager}%` });
      }
      
      if (search) {
        query += ` AND (c.Name LIKE @search 
                      OR c.ClientId LIKE @search 
                      OR c.Type LIKE @search
                      OR c.Address LIKE @search)`;
        inputs.push({ name: 'search', type: sql.NVarChar, value: `%${search}%` });
      }
      
      query += ' ORDER BY c.CreatedAt DESC';
      
      if (limit) {
        query += ` OFFSET ${offset || 0} ROWS FETCH NEXT ${limit} ROWS ONLY`;
      }
      
      const request = new sql.Request();
      inputs.forEach(input => {
        request.input(input.name, input.type, input.value);
      });
      
      const result = await request.query(query);
      const companies = result.recordset;
      
      const getEmployeeTableByCompanyId = (companyId) => {
        const tableMap = {
          5: 'CognifyarEmployees',           // Cognifyar Technologies (ID: 5)
          2: 'ProphecyConsultingEmployees',  // Prophecy Consulting INC (ID: 2)
          3: 'ProphecyOffshoreEmployees'     // Prophecy Offshore (ID: 3)
        };
        return tableMap[parseInt(companyId)] || null;
      };
      
      // Now get actual employee counts for each company
      const companiesWithCounts = await Promise.all(companies.map(async (company) => {
        let employeeCount = 0;
        
        try {
          // Get the correct table based on company ID
          const employeeTable = getEmployeeTableByCompanyId(company.Id);
          
          if (!employeeTable) {
            console.warn(`No employee table mapping found for company ID ${company.Id}`);
            return {
              ...company,
              Employees: company.Employees || 0
            };
          }
          
          // Count employees in the specific table
          const countRequest = new sql.Request();
          const countResult = await countRequest.query(`
            SELECT COUNT(*) as EmployeeCount 
            FROM ${employeeTable}
            WHERE Status = 'Active'
          `);
          
          employeeCount = countResult.recordset[0].EmployeeCount || 0;
          
          console.log(`Company ${company.Name} (ID: ${company.Id}): ${employeeCount} employees from ${employeeTable}`);
          
        } catch (error) {
          console.warn(`Could not count employees for company ${company.Name} (ID: ${company.Id}):`, error.message);
          // Fallback to stored value if table doesn't exist or query fails
          employeeCount = company.Employees || 0;
        }
        
        return {
          ...company,
          Employees: employeeCount
        };
      }));
      
      res.json({
        success: true,
        data: companiesWithCounts,
        count: companiesWithCounts.length
      });
    } catch (error) {
      console.error('Get all companies error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving companies', 
        error: error.message 
      });
    }
  },

  // Get single company by ID
  getCompanyById: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { id } = req.params;
      
      const request = new sql.Request();
      request.input('id', sql.Int, id);
      
      const result = await request.query(`
        SELECT c.*, 
               DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
               DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
        FROM Companies c 
        WHERE c.Id = @id
      `);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found' 
        });
      }
      
      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Get company by ID error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving company', 
        error: error.message 
      });
    }
  },

  // Create new company
  createCompany: async (req, res) => {
    try {
      console.log('Creating company request received');
      console.log('Request body:', req.body);
      
      await sql.connect(dbConfig);
      
      const {
        name, clientId, address, type, accountManager, employees,
        payrollDueDate, nextCheckDate, status = 'Active'
      } = req.body;

      // Validate required fields
      if (!name || !clientId || !address) {
        return res.status(400).json({
          success: false,
          message: 'Name, Client ID, and Address are required fields'
        });
      }

      // Check if clientId already exists
      const checkRequest = new sql.Request();
      checkRequest.input('clientId', sql.NVarChar, clientId);
      const checkResult = await checkRequest.query('SELECT Id FROM Companies WHERE ClientId = @clientId');
      
      if (checkResult.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Company with this Client ID already exists'
        });
      }
      
      const request = new sql.Request();
      request.input('name', sql.NVarChar, name.trim());
      request.input('clientId', sql.NVarChar, clientId.trim());
      request.input('address', sql.NVarChar, address.trim());
      request.input('type', sql.NVarChar, type || 'Technologies');
      request.input('accountManager', sql.NVarChar, (accountManager || '').trim());
      request.input('employees', sql.Int, parseInt(employees) || 0);
      request.input('payrollDueDate', sql.DateTime, payrollDueDate ? new Date(payrollDueDate) : null);
      request.input('nextCheckDate', sql.DateTime, nextCheckDate ? new Date(nextCheckDate) : null);
      request.input('status', sql.NVarChar, status);
      request.input('createdAt', sql.DateTime, new Date());
      request.input('updatedAt', sql.DateTime, new Date());
      
      const result = await request.query(`
        INSERT INTO Companies (Name, ClientId, Address, Type, AccountManager, Employees, 
                              PayrollDueDate, NextCheckDate, Status, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.Id
        VALUES (@name, @clientId, @address, @type, @accountManager, @employees, 
                @payrollDueDate, @nextCheckDate, @status, @createdAt, @updatedAt)
      `);
      
      const companyId = result.recordset[0].Id;
      
      // Get the created company
      const getRequest = new sql.Request();
      getRequest.input('id', sql.Int, companyId);
      const getResult = await getRequest.query(`
        SELECT c.*, 
               DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
               DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
        FROM Companies c 
        WHERE c.Id = @id
      `);
      
      res.status(201).json({
        success: true,
        message: 'Company created successfully',
        data: getResult.recordset[0]
      });
    } catch (error) {
      console.error('Create company error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating company: ' + error.message, 
        error: error.message
      });
    }
  },

  // Update company - COMPLETE IMPLEMENTATION
  updateCompany: async (req, res) => {
    try {
      console.log('Updating company request received');
      console.log('Company ID:', req.params.id);
      console.log('Request body:', req.body);
      
      await sql.connect(dbConfig);
      const { id } = req.params;
      
      const {
        name, clientId, address, type, accountManager, employees,
        payrollDueDate, nextCheckDate, status
      } = req.body;
      
      // Validate required fields
      if (!name || !clientId || !address) {
        return res.status(400).json({
          success: false,
          message: 'Name, Client ID, and Address are required fields'
        });
      }
      
      // Check if company exists
      const checkRequest = new sql.Request();
      checkRequest.input('id', sql.Int, id);
      const checkResult = await checkRequest.query('SELECT * FROM Companies WHERE Id = @id');
      
      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found' 
        });
      }
      
      // Check if clientId already exists for other companies
      const clientCheckRequest = new sql.Request();
      clientCheckRequest.input('clientId', sql.NVarChar, clientId);
      clientCheckRequest.input('id', sql.Int, id);
      const clientCheckResult = await clientCheckRequest.query(
        'SELECT Id FROM Companies WHERE ClientId = @clientId AND Id != @id'
      );
      
      if (clientCheckResult.recordset.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another company with this Client ID already exists'
        });
      }
      
      const request = new sql.Request();
      request.input('id', sql.Int, id);
      request.input('name', sql.NVarChar, name.trim());
      request.input('clientId', sql.NVarChar, clientId.trim());
      request.input('address', sql.NVarChar, address.trim());
      request.input('type', sql.NVarChar, type || 'Technologies');
      request.input('accountManager', sql.NVarChar, (accountManager || '').trim());
      request.input('employees', sql.Int, parseInt(employees) || 0);
      request.input('payrollDueDate', sql.DateTime, payrollDueDate ? new Date(payrollDueDate) : null);
      request.input('nextCheckDate', sql.DateTime, nextCheckDate ? new Date(nextCheckDate) : null);
      request.input('status', sql.NVarChar, status || 'Active');
      request.input('updatedAt', sql.DateTime, new Date());
      
      const result = await request.query(`
        UPDATE Companies 
        SET Name = @name, 
            ClientId = @clientId, 
            Address = @address, 
            Type = @type, 
            AccountManager = @accountManager, 
            Employees = @employees,
            PayrollDueDate = @payrollDueDate, 
            NextCheckDate = @nextCheckDate, 
            Status = @status, 
            UpdatedAt = @updatedAt
        WHERE Id = @id
      `);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found or no changes made' 
        });
      }
      
      // Get updated company
      const getRequest = new sql.Request();
      getRequest.input('id', sql.Int, id);
      const getResult = await getRequest.query(`
        SELECT c.*, 
               DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
               DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
        FROM Companies c 
        WHERE c.Id = @id
      `);
      
      res.json({
        success: true,
        message: 'Company updated successfully',
        data: getResult.recordset[0]
      });
    } catch (error) {
      console.error('Update company error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating company', 
        error: error.message 
      });
    }
  },

 updateCompanyStatus: async (req, res) => {
  try {
    console.log('=== UPDATE COMPANY STATUS REQUEST ===');
    console.log('Company ID:', req.params.id);
    console.log('Request Body:', req.body);
    console.log('Auth Headers:', req.headers.authorization ? 'Present' : 'Missing');
    
    await sql.connect(dbConfig);
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate inputs
    if (!id || isNaN(parseInt(id))) {
      console.log('Invalid company ID:', id);
      return res.status(400).json({
        success: false,
        message: 'Valid company ID is required'
      });
    }
    
    if (!status) {
      console.log('Missing status in request body');
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    // Valid statuses
    const validStatuses = ['Active', 'Inactive', 'Pending'];
    if (!validStatuses.includes(status)) {
      console.log('Invalid status:', status);
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    // Check if company exists first
    const checkRequest = new sql.Request();
    checkRequest.input('id', sql.Int, parseInt(id));
    const checkResult = await checkRequest.query('SELECT Id, Status FROM Companies WHERE Id = @id');
    
    if (checkResult.recordset.length === 0) {
      console.log('Company not found with ID:', id);
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found' 
      });
    }
    
    console.log('Found company:', checkResult.recordset[0]);
    
    // Update the status
    const request = new sql.Request();
    request.input('id', sql.Int, parseInt(id));
    request.input('status', sql.NVarChar, status);
    request.input('updatedAt', sql.DateTime, new Date());
    
    console.log('Executing update query...');
    const result = await request.query(`
      UPDATE Companies 
      SET Status = @status, UpdatedAt = @updatedAt
      WHERE Id = @id
    `);
    
    console.log('Update result - rows affected:', result.rowsAffected[0]);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Company not found or no changes made' 
      });
    }
    
    // Get updated company data
    const getRequest = new sql.Request();
    getRequest.input('id', sql.Int, parseInt(id));
    const getResult = await getRequest.query(`
      SELECT c.*, 
             DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
             DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
      FROM Companies c 
      WHERE c.Id = @id
    `);
    
    console.log('Updated company data:', getResult.recordset[0]);
    
    res.json({
      success: true,
      message: `Company status updated to ${status} successfully`,
      data: getResult.recordset[0]
    });
  } catch (error) {
    console.error('=== UPDATE COMPANY STATUS ERROR ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Error updating company status', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
},

  // Delete company - NEW
  deleteCompany: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { id } = req.params;
      
      // Check if company exists
      const checkRequest = new sql.Request();
      checkRequest.input('id', sql.Int, id);
      const checkResult = await checkRequest.query('SELECT * FROM Companies WHERE Id = @id');
      
      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found' 
        });
      }
      
      const request = new sql.Request();
      request.input('id', sql.Int, id);
      
      const result = await request.query('DELETE FROM Companies WHERE Id = @id');
      
      res.json({
        success: true,
        message: 'Company deleted successfully'
      });
    } catch (error) {
      console.error('Delete company error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting company', 
        error: error.message 
      });
    }
  },

  // Send payroll reminder - FIXED IMPLEMENTATION
  sendPayrollReminder: async (req, res) => {
    try {
      console.log('Send payroll reminder request:', req.params.id, req.body);
      
      await sql.connect(dbConfig);
      const { id } = req.params;
      const { message, type, recipient } = req.body;
      
      // Get company details
      const getRequest = new sql.Request();
      getRequest.input('id', sql.Int, parseInt(id));
      const getResult = await getRequest.query(`
        SELECT c.*, 
               DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue
        FROM Companies c 
        WHERE c.Id = @id
      `);
      
      if (getResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found' 
        });
      }
      
      const company = getResult.recordset[0];
      
      // Simulate sending email/notification
      console.log(`Payroll reminder sent for company: ${company.Name}`);
      console.log(`Recipient: ${recipient || company.AccountManager}`);
      console.log(`Message: ${message}`);
      
      // Try to log the reminder action (optional - won't fail if table doesn't exist)
      try {
        const logRequest = new sql.Request();
        logRequest.input('companyId', sql.Int, parseInt(id));
        logRequest.input('action', sql.NVarChar, 'PAYROLL_REMINDER');
        logRequest.input('message', sql.NVarChar, message || `Payroll reminder for ${company.Name}`);
        logRequest.input('recipient', sql.NVarChar, recipient || company.AccountManager);
        logRequest.input('createdAt', sql.DateTime, new Date());
        
        await logRequest.query(`
          INSERT INTO CompanyLogs (CompanyId, Action, Message, Recipient, CreatedAt)
          VALUES (@companyId, @action, @message, @recipient, @createdAt)
        `);
      } catch (logError) {
        console.warn('Could not log reminder action (table may not exist):', logError.message);
        // Continue execution even if logging fails
      }
      
      res.json({
        success: true,
        message: 'Payroll reminder sent successfully',
        data: {
          companyName: company.Name,
          recipient: recipient || company.AccountManager,
          daysUntilDue: company.DaysUntilPayrollDue,
          sentAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Send payroll reminder error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error sending payroll reminder: ' + error.message, 
        error: error.message 
      });
    }
  },

  // Export company data - FIXED IMPLEMENTATION
  exportCompanyData: async (req, res) => {
    try {
      console.log('Export company data request:', req.params.id);
      
      await sql.connect(dbConfig);
      const { id } = req.params;
      const { format = 'csv' } = req.query;
      
      // Get company details
      const request = new sql.Request();
      request.input('id', sql.Int, parseInt(id));
      const result = await request.query(`
        SELECT c.*, 
               DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
               DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
        FROM Companies c 
        WHERE c.Id = @id
      `);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Company not found' 
        });
      }
      
      const company = result.recordset[0];
      
      if (format === 'csv') {
        // Generate CSV data
        const csvHeaders = [
          'ID', 'Name', 'Client ID', 'Address', 'Type', 'Account Manager',
          'Employees', 'Status', 'Payroll Due Date', 'Next Check Date',
          'Days Until Payroll Due', 'Days Until Next Check', 'Created At', 'Updated At'
        ];
        
        const csvData = [
          company.Id || '',
          (company.Name || '').replace(/"/g, '""'), // Escape quotes
          company.ClientId || '',
          (company.Address || '').replace(/"/g, '""'), // Escape quotes
          company.Type || '',
          (company.AccountManager || '').replace(/"/g, '""'), // Escape quotes
          company.Employees || 0,
          company.Status || '',
          company.PayrollDueDate ? formatDate(company.PayrollDueDate) : '',
          company.NextCheckDate ? formatDate(company.NextCheckDate) : '',
          company.DaysUntilPayrollDue || '',
          company.DaysUntilNextCheck || '',
          company.CreatedAt ? formatDate(company.CreatedAt) : '',
          company.UpdatedAt ? formatDate(company.UpdatedAt) : ''
        ];
        
        const csvContent = [
          csvHeaders.join(','),
          csvData.map(field => `"${field}"`).join(',')
        ].join('\n');
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${company.Name}_export_${new Date().toISOString().split('T')[0]}.csv"`);
        res.send(csvContent);
      } else {
        // Return JSON format
        res.json({
          success: true,
          data: company,
          exportedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Export company data error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error exporting company data: ' + error.message, 
        error: error.message 
      });
    }
  },

  // Get companies by status - NEW
  getCompaniesByStatus: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { status } = req.params;
      
      const request = new sql.Request();
      request.input('status', sql.NVarChar, status);
      
      const result = await request.query(`
        SELECT c.*, 
               DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
               DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
        FROM Companies c 
        WHERE c.Status = @status
        ORDER BY c.CreatedAt DESC
      `);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length
      });
    } catch (error) {
      console.error('Get companies by status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving companies by status', 
        error: error.message 
      });
    }
  },

  // Get companies by manager - NEW
  getCompaniesByManager: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { managerId } = req.params;
      
      const request = new sql.Request();
      request.input('managerId', sql.NVarChar, managerId);
      
      const result = await request.query(`
        SELECT c.*, 
               DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
               DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
        FROM Companies c 
        WHERE c.AccountManager = @managerId
        ORDER BY c.CreatedAt DESC
      `);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length
      });
    } catch (error) {
      console.error('Get companies by manager error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving companies by manager', 
        error: error.message 
      });
    }
  },

  // Search companies - NEW
  searchCompanies: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { q, limit = 50 } = req.query;
      
      if (!q || q.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters long'
        });
      }
      
      const request = new sql.Request();
      request.input('search', sql.NVarChar, `%${q.trim()}%`);
      request.input('limit', sql.Int, parseInt(limit));
      
      const result = await request.query(`
        SELECT TOP (@limit) c.*, 
               DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
               DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
        FROM Companies c 
        WHERE c.Name LIKE @search 
           OR c.ClientId LIKE @search 
           OR c.Type LIKE @search
           OR c.Address LIKE @search
           OR c.AccountManager LIKE @search
        ORDER BY c.Name ASC
      `);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length,
        searchTerm: q
      });
    } catch (error) {
      console.error('Search companies error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error searching companies', 
        error: error.message 
      });
    }
  },

  // Get company statistics - NEW
  getCompanyStats: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      
      const result = await sql.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN Status = 'Active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN Status = 'Inactive' THEN 1 ELSE 0 END) as inactive,
          SUM(CASE WHEN Status = 'Pending' THEN 1 ELSE 0 END) as pending,
          SUM(ISNULL(Employees, 0)) as totalEmployees,
          SUM(CASE WHEN DATEDIFF(day, GETDATE(), PayrollDueDate) BETWEEN 0 AND 7 THEN 1 ELSE 0 END) as payrollDueSoon
        FROM Companies
      `);
      
      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Get company stats error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving company statistics', 
        error: error.message 
      });
    }
  },

  // Get companies with payroll due - NEW
  getCompaniesWithPayrollDue: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { days = 7 } = req.query;
      
      const request = new sql.Request();
      request.input('days', sql.Int, parseInt(days));
      
      const result = await request.query(`
        SELECT c.*, 
               DATEDIFF(day, GETDATE(), c.PayrollDueDate) as DaysUntilPayrollDue,
               DATEDIFF(day, GETDATE(), c.NextCheckDate) as DaysUntilNextCheck
        FROM Companies c 
        WHERE c.PayrollDueDate IS NOT NULL 
          AND DATEDIFF(day, GETDATE(), c.PayrollDueDate) BETWEEN 0 AND @days
        ORDER BY c.PayrollDueDate ASC
      `);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length
      });
    } catch (error) {
      console.error('Get companies with payroll due error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving companies with payroll due', 
        error: error.message 
      });
    }
  }
};

module.exports = companyController;