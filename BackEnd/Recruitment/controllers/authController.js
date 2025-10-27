
// // const { sql, poolPromise } = require("../../config/db"); 
// // const jwt = require("jsonwebtoken");
// // const bcrypt = require("bcrypt");
// // require("dotenv").config();

// // // ✅ Secure User Login with First Name
// // exports.login = async (req, res) => {
// //   try {
// //     const { username, password } = req.body;

// //     if (!username || !password) {
// //       return res.status(400).json({ error: "Username and password are required!" });
// //     }

// //     const pool = await poolPromise;

// //     // ✅ Join userinfo and userdetails to also get firstName
// //     const result = await pool
// //       .request()
// //       .input("username", sql.NVarChar, username)
// //       .query(`
// //         SELECT 
// //           u.id, 
// //           u.username, 
// //           u.password, 
// //           u.role, 
// //           u.profile,
// //           d.firstName
// //         FROM userinfo u
// //         INNER JOIN userdetails d ON u.id = d.id
// //         WHERE u.username = @username
// //       `);

// //     if (result.recordset.length === 0) {
// //       return res.status(401).json({ error: "Invalid username or password" });
// //     }

// //     const user = result.recordset[0];

// //     const passwordMatch = await bcrypt.compare(password, user.password);
// //     if (!passwordMatch) {
// //       return res.status(401).json({ error: "Invalid username or password" });
// //     }

// //     const profile = user.profile || "";

// //     const token = jwt.sign(
// //       { userId: user.id, username: user.username, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "8h" }
// //     );

// //     res.status(200).json({ 
// //       message: "Login successful!", 
// //       token, 
// //       user: { 
// //         id: user.id, 
// //         username: user.username, 
// //         firstName: user.firstName,
// //         role: user.role,
// //         profile: profile 
// //       },
// //       // Add view information based on role
// //       view: user.role === 'manager' ? 'manager' : 'recruiter'
// //     });

// //   } catch (err) {
// //     console.error("Login Error:", err);
// //     res.status(500).json({ error: "Internal Server Error" });
// //   }
// // };

// // // Get current user information
// // exports.getCurrentUser = async (req, res) => {
// //   try {
// //     const userId = req.user.userId;
    
// //     const pool = await poolPromise;
// //     const result = await pool
// //       .request()
// //       .input("id", sql.Int, userId)
// //       .query(`
// //         SELECT 
// //           u.id, 
// //           u.username, 
// //           u.role, 
// //           u.profile,
// //           d.firstName
// //         FROM userinfo u
// //         INNER JOIN userdetails d ON u.id = d.id
// //         WHERE u.id = @id
// //       `);

// //     if (result.recordset.length === 0) {
// //       return res.status(404).json({ error: "User not found" });
// //     }

// //     const user = result.recordset[0];
    
// //     res.status(200).json({
// //       id: user.id,
// //       username: user.username,
// //       firstName: user.firstName,
// //       role: user.role,
// //       profile: user.profile || "",
// //       view: user.role === 'manager' ? 'manager' : 'recruiter'
// //     });
// //   } catch (error) {
// //     console.error("Error fetching current user:", error);
// //     res.status(500).json({ message: "Server error while fetching user data" });
// //   }
// // };




// // const { sql, poolPromise } = require("../../config/db"); 
// // const jwt = require("jsonwebtoken");
// // const bcrypt = require("bcrypt");
// // require("dotenv").config();

// // // ✅ Secure User Login with First Name
// // exports.login = async (req, res) => {
// //   try {
// //     const { username, password } = req.body;

// //     if (!username || !password) {
// //       return res.status(400).json({ error: "Username and password are required!" });
// //     }

// //     const pool = await poolPromise;

// //     // ✅ Join userinfo and userdetails to also get firstName
// //     const result = await pool
// //       .request()
// //       .input("username", sql.NVarChar, username)
// //       .query(`
// //         SELECT 
// //           u.id, 
// //           u.username, 
// //           u.password, 
// //           u.role, 
// //           u.profile,
// //           d.firstName,
// //           d.lastName,
// //           d.email
// //         FROM userinfo u
// //         INNER JOIN userdetails d ON u.id = d.id
// //         WHERE u.username = @username
// //       `);

// //     if (result.recordset.length === 0) {
// //       return res.status(401).json({ error: "Invalid username or password" });
// //     }

// //     const user = result.recordset[0];

// //     const passwordMatch = await bcrypt.compare(password, user.password);
// //     if (!passwordMatch) {
// //       return res.status(401).json({ error: "Invalid username or password" });
// //     }

// //     const profile = user.profile || "";

// //     const token = jwt.sign(
// //       { userId: user.id, username: user.username, role: user.role },
// //       process.env.JWT_SECRET,
// //       { expiresIn: "8h" }
// //     );

// //     res.status(200).json({ 
// //       message: "Login successful!", 
// //       token, 
// //       user: { 
// //         id: user.id, 
// //         username: user.username, 
// //         firstName: user.firstName,
// //         lastName: user.lastName,
// //         email: user.email,
// //         role: user.role,
// //         profile: profile 
// //       },
// //       // Add view information based on role
// //       view: user.role === 'manager' ? 'manager' : 'recruiter'
// //     });

// //   } catch (err) {
// //     console.error("Login Error:", err);
// //     res.status(500).json({ error: "Internal Server Error" });
// //   }
// // };

// // // Get current user information
// // exports.getCurrentUser = async (req, res) => {
// //   try {
// //     const userId = req.user.userId;
    
// //     const pool = await poolPromise;
// //     const result = await pool
// //       .request()
// //       .input("id", sql.Int, userId)
// //       .query(`
// //         SELECT 
// //           u.id, 
// //           u.username, 
// //           u.role, 
// //           u.profile,
// //           d.firstName,
// //           d.lastName,
// //           d.email
// //         FROM userinfo u
// //         INNER JOIN userdetails d ON u.id = d.id
// //         WHERE u.id = @id
// //       `);

// //     if (result.recordset.length === 0) {
// //       return res.status(404).json({ error: "User not found" });
// //     }

// //     const user = result.recordset[0];
    
// //     res.status(200).json({
// //       id: user.id,
// //       username: user.username,
// //       firstName: user.firstName,
// //       lastName: user.lastName,
// //       email: user.email,
// //       role: user.role,
// //       profile: user.profile || "",
// //       view: user.role === 'manager' ? 'manager' : 'recruiter'
// //     });
// //   } catch (error) {
// //     console.error("Error fetching current user:", error);
// //     res.status(500).json({ message: "Server error while fetching user data" });
// //   }
// // };

// // // Get specific user by ID (for manager view)
// // exports.getUserById = async (req, res) => {
// //   try {
// //     const { userId } = req.params;
// //     const requestingUser = req.user;
    
// //     // Only allow admins and managers to fetch other users' data
// //     if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager' && requestingUser.userId !== parseInt(userId)) {
// //       return res.status(403).json({ error: "Access denied" });
// //     }
    
// //     const pool = await poolPromise;
// //     const result = await pool
// //       .request()
// //       .input("id", sql.Int, userId)
// //       .query(`
// //         SELECT 
// //           u.id, 
// //           u.username, 
// //           u.role, 
// //           u.profile,
// //           d.firstName,
// //           d.lastName,
// //           d.email,
// //           d.phone,
// //           d.mobile,
// //           d.fax,
// //           d.website,
// //           d.dob,
// //           d.street,
// //           d.city,
// //           d.province,
// //           d.postalCode,
// //           d.country,
// //           d.signature
// //         FROM userinfo u
// //         INNER JOIN userdetails d ON u.id = d.id
// //         WHERE u.id = @id
// //       `);

// //     if (result.recordset.length === 0) {
// //       return res.status(404).json({ error: "User not found" });
// //     }

// //     const user = result.recordset[0];
    
// //     res.status(200).json({
// //       id: user.id,
// //       username: user.username,
// //       firstName: user.firstName,
// //       lastName: user.lastName,
// //       email: user.email,
// //       phone: user.phone,
// //       mobile: user.mobile,
// //       fax: user.fax,
// //       website: user.website,
// //       dob: user.dob,
// //       street: user.street,
// //       city: user.city,
// //       province: user.province,
// //       postalCode: user.postalCode,
// //       country: user.country,
// //       role: user.role,
// //       profile: user.profile || "",
// //       signature: user.signature,
// //       view: user.role === 'manager' ? 'manager' : 'recruiter'
// //     });
// //   } catch (error) {
// //     console.error("Error fetching user by ID:", error);
// //     res.status(500).json({ message: "Server error while fetching user data" });
// //   }
// // };

// // // Get all users (admin and manager access)
// // exports.getAllUsers = async (req, res) => {
// //   try {
// //     const requestingUser = req.user;
    
// //     // Only allow admins and managers to fetch all users
// //     if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager') {
// //       return res.status(403).json({ error: "Access denied" });
// //     }
    
// //     const pool = await poolPromise;
// //     const result = await pool
// //       .request()
// //       .query(`
// //         SELECT 
// //           u.id, 
// //           u.username, 
// //           u.role, 
// //           u.profile,
// //           d.firstName,
// //           d.lastName,
// //           d.email,
// //           d.phone,
// //           d.mobile,
// //           d.fax,
// //           d.website,
// //           d.dob,
// //           d.street,
// //           d.city,
// //           d.province,
// //           d.postalCode,
// //           d.country,
// //           d.signature
// //         FROM userinfo u
// //         INNER JOIN userdetails d ON u.id = d.id
// //         ORDER BY d.firstName, d.lastName
// //       `);

// //     const users = result.recordset.map(user => ({
// //       id: user.id,
// //       username: user.username,
// //       firstName: user.firstName,
// //       lastName: user.lastName,
// //       email: user.email,
// //       phone: user.phone,
// //       mobile: user.mobile,
// //       fax: user.fax,
// //       website: user.website,
// //       dob: user.dob,
// //       street: user.street,
// //       city: user.city,
// //       province: user.province,
// //       postalCode: user.postalCode,
// //       country: user.country,
// //       role: user.role,
// //       profile: user.profile || "",
// //       signature: user.signature
// //     }));
    
// //     res.status(200).json({
// //       users: users,
// //       total: users.length
// //     });
// //   } catch (error) {
// //     console.error("Error fetching all users:", error);
// //     res.status(500).json({ message: "Server error while fetching users data" });
// //   }
// // };



// const { sql, poolPromise } = require("../../config/db"); 
// const jwt = require("jsonwebtoken");
// const bcrypt = require("bcrypt");
// require("dotenv").config();

// // ✅ Secure User Login with First Name
// exports.login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: "Username and password are required!" });
//     }

//     const pool = await poolPromise;

//     // ✅ Join userinfo and userdetails to also get firstName
//     const result = await pool
//       .request()
//       .input("username", sql.NVarChar, username)
//       .query(`
//         SELECT 
//           u.id, 
//           u.username, 
//           u.password, 
//           u.role, 
//           u.profile,
//           d.firstName,
//           d.lastName,
//           d.email
//         FROM userinfo u
//         INNER JOIN userdetails d ON u.id = d.id
//         WHERE u.username = @username
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(401).json({ error: "Invalid username or password" });
//     }

//     const user = result.recordset[0];

//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ error: "Invalid username or password" });
//     }

//     const profile = user.profile || "";

//     const token = jwt.sign(
//       { userId: user.id, username: user.username, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "8h" }
//     );

//     res.status(200).json({ 
//       message: "Login successful!", 
//       token, 
//       user: { 
//         id: user.id, 
//         username: user.username, 
//         firstName: user.firstName,
//         lastName: user.lastName,
//         email: user.email,
//         role: user.role,
//         profile: profile 
//       },
//       // Add view information based on role
//       view: user.role === 'manager' ? 'manager' : 'recruiter'
//     });

//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// };

// // Get current user information
// exports.getCurrentUser = async (req, res) => {
//   try {
//     const userId = req.user.userId;
    
//     const pool = await poolPromise;
//     const result = await pool
//       .request()
//       .input("id", sql.Int, userId)
//       .query(`
//         SELECT 
//           u.id, 
//           u.username, 
//           u.role, 
//           u.profile,
//           d.firstName,
//           d.lastName,
//           d.email
//         FROM userinfo u
//         INNER JOIN userdetails d ON u.id = d.id
//         WHERE u.id = @id
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const user = result.recordset[0];
    
//     res.status(200).json({
//       id: user.id,
//       username: user.username,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       role: user.role,
//       profile: user.profile || "",
//       view: user.role === 'manager' ? 'manager' : 'recruiter'
//     });
//   } catch (error) {
//     console.error("Error fetching current user:", error);
//     res.status(500).json({ message: "Server error while fetching user data" });
//   }
// };

// // Get specific user by ID (for manager view)
// exports.getUserById = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const requestingUser = req.user;
    
//     // Only allow admins and managers to fetch other users' data
//     if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager' && requestingUser.userId !== parseInt(userId)) {
//       return res.status(403).json({ error: "Access denied" });
//     }
    
//     const pool = await poolPromise;
//     const result = await pool
//       .request()
//       .input("id", sql.Int, userId)
//       .query(`
//         SELECT 
//           u.id, 
//           u.username, 
//           u.role, 
//           u.profile,
//           d.firstName,
//           d.lastName,
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
//           d.signature
//         FROM userinfo u
//         INNER JOIN userdetails d ON u.id = d.id
//         WHERE u.id = @id
//       `);

//     if (result.recordset.length === 0) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     const user = result.recordset[0];
    
//     res.status(200).json({
//       id: user.id,
//       username: user.username,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       phone: user.phone,
//       mobile: user.mobile,
//       fax: user.fax,
//       website: user.website,
//       dob: user.dob,
//       street: user.street,
//       city: user.city,
//       province: user.province,
//       postalCode: user.postalCode,
//       country: user.country,
//       role: user.role,
//       profile: user.profile || "",
//       signature: user.signature,
//       view: user.role === 'manager' ? 'manager' : 'recruiter'
//     });
//   } catch (error) {
//     console.error("Error fetching user by ID:", error);
//     res.status(500).json({ message: "Server error while fetching user data" });
//   }
// };

// // Update user information
// exports.updateUser = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const requestingUser = req.user;
//     const updateData = req.body;
    
//     // Only allow users to update their own profile, or admins/managers to update others
//     if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager' && requestingUser.userId !== parseInt(userId)) {
//       return res.status(403).json({ error: "Access denied" });
//     }
    
//     const pool = await poolPromise;
    
//     // Start a transaction
//     const transaction = new sql.Transaction(pool);
//     await transaction.begin();
    
//     try {
//       // Update userdetails table
//       const updateFields = [];
//       const request = new sql.Request(transaction);
//       request.input("id", sql.Int, userId);
      
//       // Build dynamic update query based on provided fields
//       if (updateData.firstName !== undefined) {
//         updateFields.push("firstName = @firstName");
//         request.input("firstName", sql.NVarChar, updateData.firstName);
//       }
//       if (updateData.lastName !== undefined) {
//         updateFields.push("lastName = @lastName");
//         request.input("lastName", sql.NVarChar, updateData.lastName);
//       }
//       if (updateData.email !== undefined) {
//         updateFields.push("email = @email");
//         request.input("email", sql.NVarChar, updateData.email);
//       }
//       if (updateData.phone !== undefined) {
//         updateFields.push("phone = @phone");
//         request.input("phone", sql.NVarChar, updateData.phone);
//       }
//       if (updateData.mobile !== undefined) {
//         updateFields.push("mobile = @mobile");
//         request.input("mobile", sql.NVarChar, updateData.mobile);
//       }
//       if (updateData.fax !== undefined) {
//         updateFields.push("fax = @fax");
//         request.input("fax", sql.NVarChar, updateData.fax);
//       }
//       if (updateData.website !== undefined) {
//         updateFields.push("website = @website");
//         request.input("website", sql.NVarChar, updateData.website);
//       }
//       if (updateData.dob !== undefined) {
//         updateFields.push("dob = @dob");
//         request.input("dob", sql.DateTime, updateData.dob);
//       }
//       if (updateData.street !== undefined) {
//         updateFields.push("street = @street");
//         request.input("street", sql.NVarChar, updateData.street);
//       }
//       if (updateData.city !== undefined) {
//         updateFields.push("city = @city");
//         request.input("city", sql.NVarChar, updateData.city);
//       }
//       if (updateData.province !== undefined) {
//         updateFields.push("province = @province");
//         request.input("province", sql.NVarChar, updateData.province);
//       }
//       if (updateData.postalCode !== undefined) {
//         updateFields.push("postalCode = @postalCode");
//         request.input("postalCode", sql.NVarChar, updateData.postalCode);
//       }
//       if (updateData.country !== undefined) {
//         updateFields.push("country = @country");
//         request.input("country", sql.NVarChar, updateData.country);
//       }
//       if (updateData.signature !== undefined) {
//         updateFields.push("signature = @signature");
//         request.input("signature", sql.NVarChar, updateData.signature);
//       }
      
//       if (updateFields.length > 0) {
//         const updateQuery = `
//           UPDATE userdetails 
//           SET ${updateFields.join(', ')}
//           WHERE id = @id
//         `;
//         await request.query(updateQuery);
//       }
      
//       // Update userinfo table if profile is being updated
//       if (updateData.profile !== undefined) {
//         const userInfoRequest = new sql.Request(transaction);
//         userInfoRequest.input("id", sql.Int, userId);
//         userInfoRequest.input("profile", sql.NVarChar, updateData.profile);
        
//         await userInfoRequest.query(`
//           UPDATE userinfo 
//           SET profile = @profile
//           WHERE id = @id
//         `);
//       }
      
//       // Commit transaction
//       await transaction.commit();
      
//       // Fetch and return updated user data
//       const updatedUserResult = await pool
//         .request()
//         .input("id", sql.Int, userId)
//         .query(`
//           SELECT 
//             u.id, 
//             u.username, 
//             u.role, 
//             u.profile,
//             d.firstName,
//             d.lastName,
//             d.email,
//             d.phone,
//             d.mobile,
//             d.fax,
//             d.website,
//             d.dob,
//             d.street,
//             d.city,
//             d.province,
//             d.postalCode,
//             d.country,
//             d.signature
//           FROM userinfo u
//           INNER JOIN userdetails d ON u.id = d.id
//           WHERE u.id = @id
//         `);
      
//       if (updatedUserResult.recordset.length === 0) {
//         return res.status(404).json({ error: "User not found after update" });
//       }
      
//       const updatedUser = updatedUserResult.recordset[0];
      
//       res.status(200).json({
//         message: "User updated successfully",
//         id: updatedUser.id,
//         username: updatedUser.username,
//         firstName: updatedUser.firstName,
//         lastName: updatedUser.lastName,
//         email: updatedUser.email,
//         phone: updatedUser.phone,
//         mobile: updatedUser.mobile,
//         fax: updatedUser.fax,
//         website: updatedUser.website,
//         dob: updatedUser.dob,
//         street: updatedUser.street,
//         city: updatedUser.city,
//         province: updatedUser.province,
//         postalCode: updatedUser.postalCode,
//         country: updatedUser.country,
//         role: updatedUser.role,
//         profile: updatedUser.profile || "",
//         signature: updatedUser.signature,
//         view: updatedUser.role === 'manager' ? 'manager' : 'recruiter'
//       });
      
//     } catch (transactionError) {
//       // Rollback transaction on error
//       await transaction.rollback();
//       throw transactionError;
//     }
    
//   } catch (error) {
//     console.error("Error updating user:", error);
//     res.status(500).json({ message: "Server error while updating user data" });
//   }
// };

// // Get all users (admin and manager access)
// exports.getAllUsers = async (req, res) => {
//   try {
//     const requestingUser = req.user;
    
//     // Only allow admins and managers to fetch all users
//     if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager') {
//       return res.status(403).json({ error: "Access denied" });
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
//           d.signature
//         FROM userinfo u
//         INNER JOIN userdetails d ON u.id = d.id
//         ORDER BY d.firstName, d.lastName
//       `);

//     const users = result.recordset.map(user => ({
//       id: user.id,
//       username: user.username,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       phone: user.phone,
//       mobile: user.mobile,
//       fax: user.fax,
//       website: user.website,
//       dob: user.dob,
//       street: user.street,
//       city: user.city,
//       province: user.province,
//       postalCode: user.postalCode,
//       country: user.country,
//       role: user.role,
//       profile: user.profile || "",
//       signature: user.signature
//     }));
    
//     res.status(200).json({
//       users: users,
//       total: users.length
//     });
//   } catch (error) {
//     console.error("Error fetching all users:", error);
//     res.status(500).json({ message: "Server error while fetching users data" });
//   }
// };

// // Get users by role (for manager role users)
// exports.getUsersByRole = async (req, res) => {
//   try {
//     const requestingUser = req.user;
//     const { role } = req.params;
    
//     // Only allow admins and managers to fetch users by role
//     if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager') {
//       return res.status(403).json({ error: "Access denied" });
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
//           d.signature
//         FROM userinfo u
//         INNER JOIN userdetails d ON u.id = d.id
//         WHERE u.role = @role
//         ORDER BY d.firstName, d.lastName
//       `);

//     const users = result.recordset.map(user => ({
//       id: user.id,
//       username: user.username,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       email: user.email,
//       phone: user.phone,
//       mobile: user.mobile,
//       fax: user.fax,
//       website: user.website,
//       dob: user.dob,
//       street: user.street,
//       city: user.city,
//       province: user.province,
//       postalCode: user.postalCode,
//       country: user.country,
//       role: user.role,
//       profile: user.profile || "",
//       signature: user.signature
//     }));
    
//     res.status(200).json({
//       users: users,
//       total: users.length
//     });
//   } catch (error) {
//     console.error("Error fetching users by role:", error);
//     res.status(500).json({ message: "Server error while fetching users by role" });
//   }
// };




const { sql, poolPromise } = require("../../config/db"); 
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();

// ✅ Secure User Login with First Name
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required!" });
    }

    const pool = await poolPromise;

    // ✅ Join userinfo and userdetails to also get firstName
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query(`
        SELECT 
          u.id, 
          u.username, 
          u.password, 
          u.role, 
          u.profile,
          d.firstName,
          d.lastName,
          d.email
        FROM userinfo u
        INNER JOIN userdetails d ON u.id = d.id
        WHERE u.username = @username
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = result.recordset[0];

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const profile = user.profile || "";

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({ 
      message: "Login successful!", 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        profile: profile 
      },
      // Add view information based on role
      view: user.role === 'manager' ? 'manager' : 'recruiter'
    });

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get current user information
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    
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
          d.firstName,
          d.lastName,
          d.email
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
      email: user.email,
      role: user.role,
      profile: user.profile || "",
      view: user.role === 'manager' ? 'manager' : 'recruiter'
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error while fetching user data" });
  }
};

// Get specific user by ID (for manager view)
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    
    // Only allow admins and managers to fetch other users' data
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager' && requestingUser.userId !== parseInt(userId)) {
      return res.status(403).json({ error: "Access denied" });
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
          d.firstName,
          d.lastName,
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
          d.signature
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
      profile: user.profile || "",
      signature: user.signature,
      view: user.role === 'manager' ? 'manager' : 'recruiter'
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error while fetching user data" });
  }
};

// Update user information
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUser = req.user;
    const updateData = req.body;
    
    // Only allow users to update their own profile, or admins/managers to update others
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager' && requestingUser.userId !== parseInt(userId)) {
      return res.status(403).json({ error: "Access denied" });
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
      
      if (updateFields.length > 0) {
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
            d.firstName,
            d.lastName,
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
            d.signature
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
        profile: updatedUser.profile || "",
        signature: updatedUser.signature,
        view: updatedUser.role === 'manager' ? 'manager' : 'recruiter'
      });
      
    } catch (transactionError) {
      // Rollback transaction on error
      await transaction.rollback();
      throw transactionError;
    }
    
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error while updating user data" });
  }
};

// Get all users (admin and manager access)
exports.getAllUsers = async (req, res) => {
  try {
    const requestingUser = req.user;
    
    // Only allow admins and managers to fetch all users
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager') {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`
        SELECT 
          u.id, 
          u.username, 
          u.role, 
          u.profile,
          d.firstName,
          d.lastName,
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
          d.signature
        FROM userinfo u
        INNER JOIN userdetails d ON u.id = d.id
        ORDER BY d.firstName, d.lastName
      `);

    const users = result.recordset.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
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
      profile: user.profile || "",
      signature: user.signature
    }));
    
    res.status(200).json({
      users: users,
      total: users.length
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Server error while fetching users data" });
  }
};

// Get users by role (for manager role users)
exports.getUsersByRole = async (req, res) => {
  try {
    const requestingUser = req.user;
    const { role } = req.params;
    
    // Only allow admins and managers to fetch users by role
    if (requestingUser.role !== 'admin' && requestingUser.role !== 'manager') {
      return res.status(403).json({ error: "Access denied" });
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
          d.firstName,
          d.lastName,
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
          d.signature
        FROM userinfo u
        INNER JOIN userdetails d ON u.id = d.id
        WHERE u.role = @role
        ORDER BY d.firstName, d.lastName
      `);

    const users = result.recordset.map(user => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
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
      profile: user.profile || "",
      signature: user.signature
    }));
    
    res.status(200).json({
      users: users,
      total: users.length
    });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({ message: "Server error while fetching users by role" });
  }
};