
const { poolPromise, sql } = require("../../config/db");

exports.getAllRoles = async (req, res) => {
  try {
    const pool = await poolPromise;
    
    // Get the current user's role and username
    const currentUserRole = req.user.role;
    const currentUsername = req.user.username;
    
    // Base query
    let query = `
      SELECT 
        rr.id, rr.jobId, rr.systemId, rr.role, rr.roleType, 
        rr.country, rr.state, rr.city, rr.currency, 
        rr.minRate, rr.maxRate, rr.client, rr.clientPOC, rr.roleLocation,  -- UPDATED: minRate, maxRate
        rr.experience, rr.urgency, rr.status, rr.assignTo,
        rr.jobDescription, rr.recruiterLead, rr.recruiter, 
        rr.effectiveFrom, rr.createdBy, rr.createdAt,
        rr.startDate, rr.endDate, rr.profilesNeeded, 
        rr.expensePaid, rr.specialNotes,
        r.name AS recruiterName,
        (SELECT COUNT(*) FROM Applications WHERE roleId = rr.id) AS applicationCount
      FROM RecruitmentRoles rr
      LEFT JOIN Recruiters r ON rr.recruiter = r.id
    `;
    
    // Add WHERE clause based on user role
    if (currentUserRole === 'user') { // Recruiter view
      query += ` WHERE rr.assignTo = @username OR rr.assignTo IS NULL`;
    } else if (currentUserRole === 'manager') { // Manager view
      query += ` WHERE 1=1`; // No additional filter for managers
    }
    
    query += ` ORDER BY rr.createdAt DESC`;
    
    const request = pool.request();
    
    if (currentUserRole === 'user') {
      request.input('username', sql.NVarChar, currentUsername);
    }
    
    const result = await request.query(query);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching recruitment roles:", error);
    res.status(500).json({ message: "Server error while fetching roles", error });
  }
};

exports.getRoleById = async (req, res) => {
  const roleId = req.params.id;
  
  try {
    const pool = await poolPromise;
    const roleResult = await pool.request()
      .input("id", sql.Int, roleId)
      .query(`
        SELECT 
          rr.*, 
          r.name AS recruiterName,
          (SELECT COUNT(*) FROM Applications WHERE roleId = rr.id) AS applicationCount
        FROM RecruitmentRoles rr
        LEFT JOIN Recruiters r ON rr.recruiter = r.id
        WHERE rr.id = @id
      `);
    
    if (roleResult.recordset.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    const role = roleResult.recordset[0];
    
    // Check if current user is authorized to view this role
    if (req.user.role === 'user' && role.assignTo !== req.user.username) {
      return res.status(403).json({ message: "Unauthorized to view this role" });
    }
    
    // Get applications for this role
    const appsResult = await pool.request()
      .input("roleId", sql.Int, roleId)
      .query(`
        SELECT * FROM Applications 
        WHERE roleId = @roleId
        ORDER BY appliedAt DESC
      `);
    
    role.applications = appsResult.recordset;
    
    res.status(200).json(role);
  } catch (error) {
    console.error("Error fetching role details:", error);
    res.status(500).json({ message: "Server error while fetching role", error });
  }
};
exports.createRole = async (req, res) => {
  const {
    jobId,
    role,
    roleType,
    country,
    state,
    city,
    currency,
    minRate,  // NEW: Minimum rate
    maxRate,  // NEW: Maximum rate
    client,
    clientPOC,
    roleLocation,
    experience,
    urgency,
    status,
    assignTo,
    jobDescription,
    effectiveFrom,
    startDate,
    endDate,
    profilesNeeded,
    expensePaid,
    specialNotes,
    createdBy,
    
  } = req.body;
  
  try {
        const pool = await poolPromise;
    
    // Check if Job ID already exists
    const existingRole = await pool.request()
      .input("jobId", sql.NVarChar, jobId)
      .query("SELECT id FROM RecruitmentRoles WHERE jobId = @jobId");
    
    if (existingRole.recordset.length > 0) {
      return res.status(409).json({ message: "A role with this Job ID already exists" });
    }
    
    // Create a combined location from country, state, city
    const location = `${city || ''}, ${state || ''}, ${country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
    
    const result = await pool.request()
      .input("jobId", sql.NVarChar, jobId || '')
      .input("role", sql.NVarChar, role || '')
      .input("roleType", sql.NVarChar, roleType || '')
      .input("location", sql.NVarChar, location || 'Not specified')
      .input("country", sql.NVarChar, country || '')
      .input("state", sql.NVarChar, state || '')
      .input("city", sql.NVarChar, city || '')
      .input("currency", sql.NVarChar, currency || 'INR')
      .input("minRate", sql.Decimal(12,2), minRate || 0)  // NEW: Minimum rate
      .input("maxRate", sql.Decimal(12,2), maxRate || 0)  // NEW: Maximum rate
      .input("client", sql.NVarChar, client || '')
      .input("clientPOC", sql.NVarChar, clientPOC || '')
      .input("roleLocation", sql.NVarChar, roleLocation || '')
      .input("experience", sql.NVarChar, experience || '')
      .input("urgency", sql.NVarChar, urgency || 'Normal')
      .input("status", sql.NVarChar, status || 'Active')
      .input("assignTo", sql.NVarChar, assignTo || null)
      .input("jobDescription", sql.NVarChar, jobDescription || null)
      .input("effectiveFrom", sql.Date, effectiveFrom || new Date().toISOString().split('T')[0])
      .input("startDate", sql.Date, startDate || null)
      .input("endDate", sql.Date, endDate || null)
      .input("profilesNeeded", sql.Int, profilesNeeded || 1)
      .input("expensePaid", sql.Bit, expensePaid || false)
      .input("specialNotes", sql.NVarChar, specialNotes || null)
      .input("createdBy", sql.NVarChar, createdBy || req.user.username || 'Unknown')
      .query(`
        INSERT INTO RecruitmentRoles (
          jobId, role, roleType, location, country, state, city, currency, minRate, maxRate, client,
          clientPOC, roleLocation, experience, urgency, status, assignTo,
          jobDescription, effectiveFrom, startDate, endDate, profilesNeeded, 
          expensePaid, specialNotes, createdBy
        )
        VALUES (
          @jobId, @role, @roleType, @location, @country, @state, @city, @currency, @minRate, @maxRate, @client,
          @clientPOC, @roleLocation, @experience, @urgency, @status, @assignTo,
          @jobDescription, @effectiveFrom, @startDate, @endDate, @profilesNeeded,
          @expensePaid, @specialNotes, @createdBy
        );
        SELECT SCOPE_IDENTITY() AS newId;
      `);
    
    const newId = result.recordset[0].newId;
    
    // Generate system ID
 const systemId = `JOB-${newId.toString().padStart(5, '0')}`;
 await pool.request()
      .input("id", sql.Int, newId)
      .input("systemId", sql.NVarChar, systemId)
      .query(`
        UPDATE RecruitmentRoles 
        SET systemId = @systemId 
        WHERE id = @id
      `);
    
    res.status(201).json({ 
      message: "Role created successfully",
      roleId: newId,
      systemId: systemId
    });
  } catch (error) {
    console.error("Error creating recruitment role:", error);
    res.status(500).json({ message: "Server error while creating role", error: error.message });
  }
};

exports.updateRole = async (req, res) => {
  const roleId = req.params.id;
  const {
    jobId,
    role,
    roleType,
    country,
    state,
    city,
    currency,
    minRate,  // NEW: Minimum rate
    maxRate,  // NEW: Maximum rate
    client,
    clientPOC,
    roleLocation,
    experience,
    urgency,
    status,
    assignTo,
    jobDescription,
    effectiveFrom,
    startDate,
    endDate,
    profilesNeeded,
    expensePaid,
    specialNotes
  } = req.body;
  
  try {
    const pool = await poolPromise;
    
    // Check if role exists and user has permission
    const roleCheck = await pool.request()
      .input("id", sql.Int, roleId)
      .query("SELECT assignTo, createdBy FROM RecruitmentRoles WHERE id = @id");
    
    if (roleCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    const existingRole = roleCheck.recordset[0];
    
    // Only allow managers or the assigned recruiter to update
    if (req.user.role === 'user' && existingRole.assignTo !== req.user.username) {
      return res.status(403).json({ message: "Unauthorized to update this role" });
    }
    
    // Create a combined location from country, state, city
    const location = `${city || ''}, ${state || ''}, ${country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ',');
    
    // Update the role
    await pool.request()
      .input("id", sql.Int, roleId)
      .input("role", sql.NVarChar, role || '')
      .input("roleType", sql.NVarChar, roleType || '')
      .input("location", sql.NVarChar, location || 'Not specified')
      .input("country", sql.NVarChar, country || '')
      .input("state", sql.NVarChar, state || '')
      .input("city", sql.NVarChar, city || '')
      .input("currency", sql.NVarChar, currency || 'INR')
      .input("minRate", sql.Decimal(12,2), minRate || 0)  // NEW: Minimum rate
      .input("maxRate", sql.Decimal(12,2), maxRate || 0)  // NEW: Maximum rate
      .input("client", sql.NVarChar, client || '')
      .input("clientPOC", sql.NVarChar, clientPOC || '')
      .input("roleLocation", sql.NVarChar, roleLocation || '')
      .input("experience", sql.NVarChar, experience || '')
      .input("urgency", sql.NVarChar, urgency || 'Normal')
      .input("status", sql.NVarChar, status || 'Active')
      .input("assignTo", sql.NVarChar, assignTo || null)
      .input("jobDescription", sql.NVarChar, jobDescription || null)
      .input("effectiveFrom", sql.Date, effectiveFrom || new Date().toISOString().split('T')[0])
      .input("startDate", sql.Date, startDate || null)
      .input("endDate", sql.Date, endDate || null)
      .input("profilesNeeded", sql.Int, profilesNeeded || 1)
      .input("expensePaid", sql.Bit, expensePaid || false)
      .input("specialNotes", sql.NVarChar, specialNotes || null)
      .query(`
        UPDATE RecruitmentRoles
        SET 
          role = @role,
          roleType = @roleType,
          location = @location,
          country = @country,
          state = @state,
          city = @city,
          currency = @currency,
          minRate = @minRate,  -- NEW: Minimum rate
          maxRate = @maxRate,  -- NEW: Maximum rate
          client = @client,
          clientPOC = @clientPOC,
          roleLocation = @roleLocation,
          experience = @experience,
          urgency = @urgency,
          status = @status,
          assignTo = @assignTo,
          jobDescription = @jobDescription,
          effectiveFrom = @effectiveFrom,
          startDate = @startDate,
          endDate = @endDate,
          profilesNeeded = @profilesNeeded,
          expensePaid = @expensePaid,
          specialNotes = @specialNotes,
          updatedAt = GETDATE()
        WHERE id = @id
      `);
    
    res.status(200).json({ message: "Role updated successfully" });
  } catch (error) {
    console.error("Error updating recruitment role:", error);
    res.status(500).json({ message: "Server error while updating role", error: error.message });
  }
};
exports.deleteRole = async (req, res) => {
  const roleId = req.params.id;
  const forceDelete = req.query.force === 'true';
  
  try {
    const pool = await poolPromise;
    
    // Check if user is manager (only managers can delete roles)
    if (req.user.role !== 'manager' && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Only managers and admins can delete roles" });
    }
    
    // Check if role exists
    const roleCheck = await pool.request()
      .input("id", sql.Int, roleId)
      .query("SELECT id, role, jobId FROM RecruitmentRoles WHERE id = @id");
    
    if (roleCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    const role = roleCheck.recordset[0];
    
    // Check if there are any applications for this role
    const applicationCheck = await pool.request()
      .input("roleId", sql.Int, roleId)
      .query("SELECT COUNT(*) as count FROM Applications WHERE roleId = @roleId");
    
    const applicationCount = applicationCheck.recordset[0].count;
    
    if (applicationCount > 0 && !forceDelete) {
      return res.status(409).json({ 
        message: `Cannot delete role with ${applicationCount} existing application(s). Use force=true to delete with applications.` 
      });
    }
    
    // Begin transaction for safe deletion
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Delete applications first if forceDelete is true
      if (forceDelete) {
        await transaction.request()
          .input("roleId", sql.Int, roleId)
          .query("DELETE FROM Applications WHERE roleId = @roleId");
      }
      
      // Delete the role
      await transaction.request()
        .input("id", sql.Int, roleId)
        .query("DELETE FROM RecruitmentRoles WHERE id = @id");
      
      await transaction.commit();
      
      res.status(200).json({ 
        message: forceDelete ? 
          "Role and all associated applications deleted successfully" : 
          "Role deleted successfully",
        deletedRole: {
          id: role.id,
          jobId: role.jobId,
          role: role.role
        }
      });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error("Error deleting recruitment role:", error);
    res.status(500).json({ message: "Server error while deleting role", error: error.message });
  }
};

// Alternative delete function that also deletes applications
exports.deleteRoleWithApplications = async (req, res) => {
  const roleId = req.params.id;
  const { forceDelete } = req.body; // Optional parameter to force delete with applications
  
  try {
    const pool = await poolPromise;
    
    // Check if user is manager (only managers can delete roles)
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: "Only managers can delete roles" });
    }
    
    // Check if role exists
    const roleCheck = await pool.request()
      .input("id", sql.Int, roleId)
      .query("SELECT id, role, jobId FROM RecruitmentRoles WHERE id = @id");
    
    if (roleCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    const role = roleCheck.recordset[0];
    
    // Begin transaction for safe deletion
    const transaction = new sql.Transaction(pool);
    
    try {
      await transaction.begin();
      
      // Delete applications first (if forceDelete is true)
      if (forceDelete) {
        await transaction.request()
          .input("roleId", sql.Int, roleId)
          .query("DELETE FROM Applications WHERE roleId = @roleId");
      }
      
      // Delete the role
      await transaction.request()
        .input("id", sql.Int, roleId)
        .query("DELETE FROM RecruitmentRoles WHERE id = @id");
      
      await transaction.commit();
      
      res.status(200).json({ 
        message: forceDelete ? 
          "Role and all associated applications deleted successfully" : 
          "Role deleted successfully",
        deletedRole: {
          id: role.id,
          jobId: role.jobId,
          role: role.role
        }
      });
    } catch (transactionError) {
      await transaction.rollback();
      throw transactionError;
    }
  } catch (error) {
    console.error("Error deleting recruitment role:", error);
    res.status(500).json({ message: "Server error while deleting role", error: error.message });
  }
};

exports.assignRecruiter = async (req, res) => {
  const roleId = req.params.id;
  const { recruiterId } = req.body;
  
  try {
    const pool = await poolPromise;
    
    // Allow both managers and team leads to assign recruiters
    if (req.user.role !== 'manager' && req.user.role !== 'teamlead') {
      return res.status(403).json({ message: "Only managers and team leads can assign recruiters" });
    }
    
    // Check if recruiter exists
    const recruiterCheck = await pool.request()
      .input("recruiterId", sql.Int, recruiterId)
      .query("SELECT id, name FROM Recruiters WHERE id = @recruiterId");
    
    if (recruiterCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Recruiter not found" });
    }
    
    const recruiter = recruiterCheck.recordset[0];
    
    // Check if role exists
    const roleCheck = await pool.request()
      .input("roleId", sql.Int, roleId)
      .query("SELECT id FROM RecruitmentRoles WHERE id = @roleId");
    
    if (roleCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    // Assign recruiter
    await pool.request()
      .input("roleId", sql.Int, roleId)
      .input("recruiterId", sql.Int, recruiterId)
      .input("assignTo", sql.NVarChar, recruiter.name)
      .query(`
        UPDATE RecruitmentRoles
        SET recruiter = @recruiterId, 
            recruiterLead = @recruiterId,
            assignTo = @assignTo,
            updatedAt = GETDATE()
        WHERE id = @roleId
      `);
    
    res.status(200).json({ 
      message: "Recruiter assigned successfully",
      recruiterName: recruiter.name
    });
  } catch (error) {
    console.error("Error assigning recruiter:", error);
    res.status(500).json({ message: "Server error while assigning recruiter", error });
  }
};

// Helper function to determine SQL type
function getSqlType(value) {
  if (typeof value === 'string') {
    return sql.NVarChar;
  } else if (typeof value === 'number') {
    return Number.isInteger(value) ? sql.Int : sql.Decimal;
  } else if (value instanceof Date) {
    return sql.DateTime;
  } else if (typeof value === 'boolean') {
    return sql.Bit;
  }
  return sql.NVarChar;
}