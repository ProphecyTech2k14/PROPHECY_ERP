// controllers/projectsController.js - Projects Management Controller
const sql = require('mssql');
const { dbConfig } = require('../../config/db');

const projectsController = {
  // Test database connection
  testConnection: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const result = await sql.query('SELECT COUNT(*) as ProjectCount FROM Projects WHERE IsActive = 1');
      res.json({
        success: true,
        message: 'Projects database connection successful',
        data: result.recordset
      });
    } catch (error) {
      console.error('Projects database connection test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Projects database connection failed',
        error: error.message
      });
    }
  },

  // Get all active projects for a company
  getProjects: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { companyId } = req.user; // From JWT token
      const { isPublic, limit = 50, offset = 0 } = req.query;
      
      let query = `
        SELECT p.Id, p.Name, p.Client, p.Color, p.IsPublic, p.CreatedAt, p.UpdatedAt
        FROM Projects p 
        WHERE p.CompanyId = @companyId AND p.IsActive = 1
      `;
      let inputs = [{ name: 'companyId', type: sql.Int, value: parseInt(companyId) }];
      
      if (isPublic !== undefined) {
        query += ' AND p.IsPublic = @isPublic';
        inputs.push({ name: 'isPublic', type: sql.Bit, value: isPublic === 'true' ? 1 : 0 });
      }
      
      query += ' ORDER BY p.Name ASC';
      query += ` OFFSET ${parseInt(offset)} ROWS FETCH NEXT ${parseInt(limit)} ROWS ONLY`;
      
      const request = new sql.Request();
      inputs.forEach(input => {
        request.input(input.name, input.type, input.value);
      });
      
      const result = await request.query(query);
      
      res.json({
        success: true,
        data: result.recordset,
        count: result.recordset.length
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving projects', 
        error: error.message 
      });
    }
  },

  // Create new project
  createProject: async (req, res) => {
    try {
      console.log('Create project request:', req.body);
      await sql.connect(dbConfig);
      
      const { employeeId, companyId } = req.user; // From JWT token
      const { name, client, color, isPublic } = req.body;

      // Validate required fields
      if (!name || !client) {
        return res.status(400).json({
          success: false,
          message: 'Project name and client are required'
        });
      }

      // Check if project with same name already exists for this company
      const checkRequest = new sql.Request();
      checkRequest.input('name', sql.NVarChar, name);
      checkRequest.input('companyId', sql.Int, parseInt(companyId));
      
      const existingProject = await checkRequest.query(`
        SELECT Id FROM Projects 
        WHERE Name = @name AND CompanyId = @companyId AND IsActive = 1
      `);
      
      if (existingProject.recordset.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Project with this name already exists'
        });
      }

      const request = new sql.Request();
      request.input('name', sql.NVarChar, name);
      request.input('client', sql.NVarChar, client);
      request.input('color', sql.NVarChar, color || '#10b981');
      request.input('isPublic', sql.Bit, isPublic !== false ? 1 : 0);
      request.input('isActive', sql.Bit, 1);
      request.input('companyId', sql.Int, parseInt(companyId));
      request.input('createdBy', sql.NVarChar, employeeId);
      request.input('createdAt', sql.DateTime, new Date());
      request.input('updatedAt', sql.DateTime, new Date());
      
      const result = await request.query(`
        INSERT INTO Projects (Name, Client, Color, IsPublic, IsActive, CompanyId, CreatedBy, CreatedAt, UpdatedAt)
        OUTPUT INSERTED.Id, INSERTED.Name, INSERTED.Client, INSERTED.Color, INSERTED.IsPublic
        VALUES (@name, @client, @color, @isPublic, @isActive, @companyId, @createdBy, @createdAt, @updatedAt)
      `);
      
      const newProject = result.recordset[0];
      
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: newProject
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error creating project', 
        error: error.message 
      });
    }
  },

  // Get project by ID
  getProjectById: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { id } = req.params;
      const { companyId } = req.user; // From JWT token
      
      const request = new sql.Request();
      request.input('id', sql.Int, parseInt(id));
      request.input('companyId', sql.Int, parseInt(companyId));
      
      const result = await request.query(`
        SELECT p.Id, p.Name, p.Client, p.Color, p.IsPublic, p.IsActive, 
               p.CreatedAt, p.UpdatedAt, p.CreatedBy
        FROM Projects p 
        WHERE p.Id = @id AND p.CompanyId = @companyId AND p.IsActive = 1
      `);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Project not found' 
        });
      }
      
      res.json({
        success: true,
        data: result.recordset[0]
      });
    } catch (error) {
      console.error('Get project by ID error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error retrieving project', 
        error: error.message 
      });
    }
  },

  // Update project
  updateProject: async (req, res) => {
    try {
      console.log('Update project request:', req.body);
      await sql.connect(dbConfig);
      
      const { id } = req.params;
      const { companyId } = req.user; // From JWT token
      const { name, client, color, isPublic } = req.body;

      // Check if project exists and belongs to company
      const checkRequest = new sql.Request();
      checkRequest.input('id', sql.Int, parseInt(id));
      checkRequest.input('companyId', sql.Int, parseInt(companyId));
      
      const checkResult = await checkRequest.query(`
        SELECT Id FROM Projects 
        WHERE Id = @id AND CompanyId = @companyId AND IsActive = 1
      `);
      
      if (checkResult.recordset.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Project not found' 
        });
      }

      const request = new sql.Request();
      request.input('id', sql.Int, parseInt(id));
      request.input('companyId', sql.Int, parseInt(companyId));
      request.input('updatedAt', sql.DateTime, new Date());
      
      let updateQuery = 'UPDATE Projects SET UpdatedAt = @updatedAt';
      
      if (name) {
        updateQuery += ', Name = @name';
        request.input('name', sql.NVarChar, name);
      }
      
      if (client) {
        updateQuery += ', Client = @client';
        request.input('client', sql.NVarChar, client);
      }
      
      if (color) {
        updateQuery += ', Color = @color';
        request.input('color', sql.NVarChar, color);
      }
      
      if (isPublic !== undefined) {
        updateQuery += ', IsPublic = @isPublic';
        request.input('isPublic', sql.Bit, isPublic ? 1 : 0);
      }
      
      updateQuery += ' WHERE Id = @id AND CompanyId = @companyId';
      
      const result = await request.query(updateQuery);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Project not found or no changes made' 
        });
      }
      
      res.json({
        success: true,
        message: 'Project updated successfully'
      });
    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error updating project', 
        error: error.message 
      });
    }
  },

  // Delete project (soft delete)
  deleteProject: async (req, res) => {
    try {
      await sql.connect(dbConfig);
      const { id } = req.params;
      const { companyId } = req.user; // From JWT token
      
      const request = new sql.Request();
      request.input('id', sql.Int, parseInt(id));
      request.input('companyId', sql.Int, parseInt(companyId));
      request.input('updatedAt', sql.DateTime, new Date());
      
      const result = await request.query(`
        UPDATE Projects 
        SET IsActive = 0, UpdatedAt = @updatedAt
        WHERE Id = @id AND CompanyId = @companyId AND IsActive = 1
      `);
      
      if (result.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Project not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error deleting project', 
        error: error.message 
      });
    }
  }
};

module.exports = projectsController;