const { poolPromise, sql } = require("../../config/db");

exports.getAllRecruiters = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, name, email, phone, specialization, isActive
      FROM Recruiters
      WHERE role = 'user'  -- ADD THIS FILTER
      ORDER BY name
    `);
    
    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching recruiters:", error);
    res.status(500).json({ message: "Server error while fetching recruiters", error });
  }
};
exports.createRecruiter = async (req, res) => {
  const { name, email, phone, specialization } = req.body;
  
  try {
    const pool = await poolPromise;
    
    // Check if email already exists
    const emailCheck = await pool.request()
      .input("email", sql.NVarChar, email)
      .query("SELECT id FROM Recruiters WHERE email = @email");
    
    if (emailCheck.recordset.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }
    
    await pool.request()
      .input("name", sql.NVarChar, name)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.NVarChar, phone)
      .input("specialization", sql.NVarChar, specialization)
      .query(`
        INSERT INTO Recruiters (name, email, phone, specialization)
        VALUES (@name, @email, @phone, @specialization)
      `);
    
    res.status(201).json({ message: "Recruiter created successfully" });
  } catch (error) {
    console.error("Error creating recruiter:", error);
    res.status(500).json({ message: "Server error while creating recruiter", error });
  }
};

exports.getRecruiterStats = async (req, res) => {
  const recruiterId = req.params.id;
  
  try {
    const pool = await poolPromise;
    
    // Get assigned roles count
    const rolesResult = await pool.request()
      .input("recruiterId", sql.Int, recruiterId)
      .query(`
        SELECT COUNT(*) AS assignedRoles
        FROM RecruitmentRoles
        WHERE recruiter = @recruiterId AND status = 'Active'
      `);
    
    // Get applications in progress
    const appsResult = await pool.request()
      .input("recruiterId", sql.Int, recruiterId)
      .query(`
        SELECT COUNT(DISTINCT a.id) AS activeApplications
        FROM Applications a
        JOIN RecruitmentRoles rr ON a.roleId = rr.id
        WHERE rr.recruiter = @recruiterId AND a.status NOT IN ('Hired', 'Rejected')
      `);
    
    // Get hired count
    const hiredResult = await pool.request()
      .input("recruiterId", sql.Int, recruiterId)
      .query(`
        SELECT COUNT(DISTINCT a.id) AS hiredCount
        FROM Applications a
        JOIN RecruitmentRoles rr ON a.roleId = rr.id
        WHERE rr.recruiter = @recruiterId AND a.status = 'Hired'
      `);
    
    res.status(200).json({
      assignedRoles: rolesResult.recordset[0].assignedRoles,
      activeApplications: appsResult.recordset[0].activeApplications,
      hiredCount: hiredResult.recordset[0].hiredCount
    });
  } catch (error) {
    console.error("Error fetching recruiter stats:", error);
    res.status(500).json({ message: "Server error while fetching stats", error });
  }
};