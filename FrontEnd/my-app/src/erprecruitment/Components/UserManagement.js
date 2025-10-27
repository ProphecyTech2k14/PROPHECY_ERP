







// import React, { useState, useEffect } from 'react';
// import { 
//   LuUsers, 
//   LuUserPlus, 
//   LuSearch, 
//   LuFilter, 
//   LuEllipsisVertical,
//   LuPen, 
//   LuTrash2, 
//   LuEye, 
//   LuMail, 
//   LuPhone, 
//   LuCalendar,
//   LuX,
//   LuSave,
//   LuUser,
//   LuShield,
//   LuCrown,
//   LuUserCheck,
//   LuClock,
// } from 'react-icons/lu';
// import axios from 'axios';
// import BASE_URL from '../../url';
// import '../styles/UserManagement.css';

// const UserManagement = () => {
//   const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedRole, setSelectedRole] = useState('all');
//   const [selectedStatus, setSelectedStatus] = useState('all');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [dropdownOpen, setDropdownOpen] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [newUser, setNewUser] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: '',
//     address: '',
//     role: 'user',
//     status: 'active',
//     password: '' // In production, generate or require password
//   });

//   const roles = [
//     { value: 'admin', label: 'Admin', icon: <LuShield />, color: '#0eb381ff' },
//     { value: 'manager', label: 'Manager', icon: <LuCrown />, color: '#0eb381ff' },
//     { value: 'team_lead', label: 'Team Lead', icon: <LuUserCheck />, color: '#0eb381ff' },
//     { value: 'user', label: 'User', icon: <LuUser />, color: '#0eb381ff' }
//   ];

//   const statuses = [
//     { value: 'active', label: 'Active', color: '#20c997' },
//     { value: 'inactive', label: 'Inactive', color: '#de6b76ff' }
//   ];

//   // Fetch users from API
//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${BASE_URL}/api/users`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setUsers(response.data);
//         setFilteredUsers(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching users:", err);
//         setError("Failed to load users");
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, []);

//   // Filter users
//   useEffect(() => {
//     let filtered = users;

//     if (searchTerm) {
//       filtered = filtered.filter(user =>
//         `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase()))
//       );
//     }

//     if (selectedRole !== 'all') {
//       filtered = filtered.filter(user => user.role === selectedRole);
//     }

//     if (selectedStatus !== 'all') {
//       filtered = filtered.filter(user => user.status === selectedStatus);
//     }

//     setFilteredUsers(filtered);
//   }, [users, searchTerm, selectedRole, selectedStatus]);

//   const getRoleInfo = (role) => {
//     return roles.find(r => r.value === role) || roles[3];
//   };

//   const getStatusColor = (status) => {
//     return statuses.find(s => s.value === status)?.color || '#6c757d';
//   };

//   // Add new user
// const handleAddUser = async () => {
//   if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.username) {
//     alert('Please fill in all required fields');
//     return;
//   }
  
//   try {
//     const userData = {
//       ...newUser,
//       username: newUser.username || newUser.email.split('@')[0] // Generate username if not provided
//     };
    
//     const token = localStorage.getItem('token');
//     const response = await axios.post(`${BASE_URL}/api/users`, userData, {
//       headers: { Authorization: `Bearer ${token}` }
//     });

//       setUsers(usersResponse.data);
//       setNewUser({
//         firstName: '',
//         lastName: '',
//         email: '',
//         phone: '',
//         address: '',
//         role: 'user',
//         status: 'active',
//         password: 'defaultPassword'
//       });
//       setShowAddModal(false);
//     } catch (err) {
//       console.error("Error adding user:", err);
//       alert(err.response?.data?.message || 'Failed to add user');
//     }
//   };

//   // Edit user
//   const handleEditUser = async () => {
//     if (!selectedUser) return;

//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(`${BASE_URL}/api/users/${selectedUser.id}`, selectedUser, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       // Refresh users list
//       const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       setUsers(usersResponse.data);
//       setShowEditModal(false);
//       setSelectedUser(null);
//     } catch (err) {
//       console.error("Error updating user:", err);
//       alert(err.response?.data?.message || 'Failed to update user');
//     }
//   };

//   // Delete user
//   const handleDeleteUser = async (userId) => {
//     if (!window.confirm('Are you sure you want to deactivate this user?')) {
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       await axios.delete(`${BASE_URL}/api/users/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       // Refresh users list
//       const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       setUsers(usersResponse.data);
//     } catch (err) {
//       console.error("Error deleting user:", err);
//       alert(err.response?.data?.message || 'Failed to deactivate user');
//     }
//   };

//   const toggleDropdown = (userId) => {
//     setDropdownOpen(dropdownOpen === userId ? null : userId);
//   };

//   const openEditModal = (user) => {
//     setSelectedUser({ ...user });
//     setShowEditModal(true);
//     setDropdownOpen(null);
//   };

//   if (loading) return <div className="user-management-container">Loading users...</div>;
//   if (error) return <div className="user-management-container">Error: {error}</div>;

//   return (
//     <div className="user-management-container">
//       {/* Header */}
//       <div className="user-management-header">
//         <div className="user-management-header-left">
//           <LuUsers className="user-management-header-icon" />
//           <h1 className="user-management-title">User Management</h1>
//           <span className="user-management-count">{filteredUsers.length} users</span>
//         </div>
//         <button className="user-management-add-button" onClick={() => setShowAddModal(true)}>
//           <LuUserPlus />
//           Add New User
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="user-management-filters-container">
//         <div className="user-management-search-container">
//           <LuSearch className="user-management-search-icon" />
//           <input
//             type="text"
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="user-management-search-input"
//           />
//         </div>
//         <div className="user-management-filter-group">
//           <select
//             value={selectedRole}
//             onChange={(e) => setSelectedRole(e.target.value)}
//             className="user-management-filter-select"
//           >
//             <option value="all">All Roles</option>
//             {roles.map(role => (
//               <option key={role.value} value={role.value}>{role.label}</option>
//             ))}
//           </select>
//           <select
//             value={selectedStatus}
//             onChange={(e) => setSelectedStatus(e.target.value)}
//             className="user-management-filter-select"
//           >
//             <option value="all">All Status</option>
//             {statuses.map(status => (
//               <option key={status.value} value={status.value}>{status.label}</option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Users Table */}
//       <div className="user-management-table-container">
//         <table className="user-management-table">
//           <thead className="user-management-table-header">
//             <tr>
//               <th className="user-management-th">User</th>
//               <th className="user-management-th">Contact</th>
//               <th className="user-management-th">Role</th>
//               <th className="user-management-th">Status</th>
//               <th className="user-management-th">Last Login</th>
//               <th className="user-management-th">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredUsers.map(user => (
//               <tr key={user.id} className="user-management-table-row">
//                 <td className="user-management-td">
//                   <div className="user-management-user-cell">
//                     <div className="user-management-avatar">
//                       {user.firstName[0]}{user.lastName[0]}
//                     </div>
//                     <div>
//                       <div className="user-management-user-name">{user.firstName} {user.lastName}</div>
//                       <div className="user-management-user-email">{user.email}</div>
//                     </div>
//                   </div>
//                 </td>
//                 <td className="user-management-td">
//                   <div className="user-management-contact-info">
//                     <div className="user-management-contact-item">
//                       <LuMail size={12} />
//                       {user.email}
//                     </div>
//                     {user.phone && (
//                       <div className="user-management-contact-item">
//                         <LuPhone size={12} />
//                         {user.phone}
//                       </div>
//                     )}
//                     {user.address && (
//                       <div className="user-management-contact-item">
//                         {user.address}
//                       </div>
//                     )}
//                   </div>
//                 </td>
//                 <td className="user-management-td">
//                   <div className="user-management-role-cell">
//                     <span className="user-management-role-icon" style={{color: getRoleInfo(user.role).color}}>
//                       {getRoleInfo(user.role).icon}
//                     </span>
//                     {getRoleInfo(user.role).label}
//                   </div>
//                 </td>
//                 <td className="user-management-td">
//                   <span className="user-management-status-badge" style={{backgroundColor: getStatusColor(user.status)}}>
//                     {user.status}
//                   </span>
//                 </td>
//                 <td className="user-management-td">
//                   {user.lastLogin ? (
//                     <div className="user-management-date-cell">
//                       <LuClock size={12} />
//                       <div className="user-management-date-time">
//                         {new Date(user.lastLogin).toLocaleDateString()}
//                         <div>{new Date(user.lastLogin).toLocaleTimeString()}</div>
//                       </div>
//                     </div>
//                   ) : (
//                     <span className="user-management-never-login">Never</span>
//                   )}
//                 </td>
//                 <td className="user-management-td">
//                   <div className="user-management-actions-container">
//                     <button
//                       className="user-management-action-button"
//                       onClick={() => toggleDropdown(user.id)}
//                     >
//                       <LuEllipsisVertical />
//                     </button>
//                     {dropdownOpen === user.id && (
//                       <div className="user-management-dropdown">
//                         <button
//                           className="user-management-dropdown-item"
//                           onClick={() => openEditModal(user)}
//                         >
//                           <LuPen /> Edit
//                         </button>
//                         <button
//                           className="user-management-dropdown-item"
//                           onClick={() => alert(`Viewing ${user.firstName} ${user.lastName}`)}
//                         >
//                           <LuEye /> View
//                         </button>
//                         <button
//                           className="user-management-dropdown-item user-management-dropdown-item-danger"
//                           onClick={() => handleDeleteUser(user.id)}
//                         >
//                           <LuTrash2 /> {user.status === 'active' ? 'Deactivate' : 'Activate'}
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Add User Modal */}
//       {showAddModal && (
//         <div className="user-management-modal-overlay">
//           <div className="user-management-modal">
//             <div className="user-management-modal-header">
//               <h2 className="user-management-modal-title">Add New User</h2>
//               <button
//                 className="user-management-close-button"
//                 onClick={() => setShowAddModal(false)}
//               >
//                 <LuX />
//               </button>
//             </div>
//             <div className="user-management-modal-body">
//               <div className="user-management-form-row">
//                 <div className="user-management-form-group">
//                   <label className="user-management-label">First Name*</label>
//                   <input
//                     type="text"
//                     value={newUser.firstName}
//                     onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
//                     className="user-management-input"
//                     placeholder="Enter first name"
//                     required
//                   />
//                 </div>
//                 <div className="user-management-form-group">
//                   <label className="user-management-label">Last Name*</label>
//                   <input
//                     type="text"
//                     value={newUser.lastName}
//                     onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
//                     className="user-management-input"
//                     placeholder="Enter last name"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="user-management-form-group">
//                 <label className="user-management-label">Email*</label>
//                 <input
//                   type="email"
//                   value={newUser.email}
//                   onChange={(e) => setNewUser({...newUser, email: e.target.value})}
//                   className="user-management-input"
//                   placeholder="Enter email address"
//                   required
//                 />
//               </div>
//               <div className="user-management-form-group">
//                 <label className="user-management-label">Phone</label>
//                 <input
//                   type="tel"
//                   value={newUser.phone}
//                   onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
//                   className="user-management-input"
//                   placeholder="Enter phone number"
//                 />
//               </div>
//               <div className="user-management-form-group">
//                 <label className="user-management-label">Address</label>
//                 <input
//                   type="text"
//                   value={newUser.address}
//                   onChange={(e) => setNewUser({...newUser, address: e.target.value})}
//                   className="user-management-input"
//                   placeholder="Enter address"
//                 />
//               </div>
//               <div className="user-management-form-row">
//                 <div className="user-management-form-group">
//                   <label className="user-management-label">Role</label>
//                   <select
//                     value={newUser.role}
//                     onChange={(e) => setNewUser({...newUser, role: e.target.value})}
//                     className="user-management-select"
//                   >
//                     {roles.map(role => (
//                       <option key={role.value} value={role.value}>{role.label}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="user-management-form-group">
//                   <label className="user-management-label">Status</label>
//                   <select
//                     value={newUser.status}
//                     onChange={(e) => setNewUser({...newUser, status: e.target.value})}
//                     className="user-management-select"
//                   >
//                     {statuses.map(status => (
//                       <option key={status.value} value={status.value}>{status.label}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//             <div className="user-management-modal-footer">
//               <button
//                 className="user-management-cancel-button"
//                 onClick={() => setShowAddModal(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="user-management-save-button"
//                 onClick={handleAddUser}
//               >
//                 <LuSave />
//                 Add User
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Edit User Modal */}
//       {showEditModal && selectedUser && (
//         <div className="user-management-modal-overlay">
//           <div className="user-management-modal">
//             <div className="user-management-modal-header">
//               <h2 className="user-management-modal-title">Edit User</h2>
//               <button
//                 className="user-management-close-button"
//                 onClick={() => setShowEditModal(false)}
//               >
//                 <LuX />
//               </button>
//             </div>
//             <div className="user-management-modal-body">
//               <div className="user-management-form-row">
//                 <div className="user-management-form-group">
//                   <label className="user-management-label">First Name*</label>
//                   <input
//                     type="text"
//                     value={selectedUser.firstName}
//                     onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
//                     className="user-management-input"
//                     required
//                   />
//                 </div>
//                 <div className="user-management-form-group">
//                   <label className="user-management-label">Last Name*</label>
//                   <input
//                     type="text"
//                     value={selectedUser.lastName}
//                     onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
//                     className="user-management-input"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="user-management-form-group">
//                 <label className="user-management-label">Email*</label>
//                 <input
//                   type="email"
//                   value={selectedUser.email}
//                   onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
//                   className="user-management-input"
//                   required
//                 />
//               </div>
//               <div className="user-management-form-group">
//                 <label className="user-management-label">Phone</label>
//                 <input
//                   type="tel"
//                   value={selectedUser.phone || ''}
//                   onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
//                   className="user-management-input"
//                 />
//               </div>
//               <div className="user-management-form-group">
//                 <label className="user-management-label">Address</label>
//                 <input
//                   type="text"
//                   value={selectedUser.address || ''}
//                   onChange={(e) => setSelectedUser({...selectedUser, address: e.target.value})}
//                   className="user-management-input"
//                 />
//               </div>
//               <div className="user-management-form-row">
//                 <div className="user-management-form-group">
//                   <label className="user-management-label">Role</label>
//                   <select
//                     value={selectedUser.role}
//                     onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
//                     className="user-management-select"
//                   >
//                     {roles.map(role => (
//                       <option key={role.value} value={role.value}>{role.label}</option>
//                     ))}
//                   </select>
//                 </div>
//                 <div className="user-management-form-group">
//                   <label className="user-management-label">Status</label>
//                   <select
//                     value={selectedUser.status}
//                     onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
//                     className="user-management-select"
//                   >
//                     {statuses.map(status => (
//                       <option key={status.value} value={status.value}>{status.label}</option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//             <div className="user-management-modal-footer">
//               <button
//                 className="user-management-cancel-button"
//                 onClick={() => setShowEditModal(false)}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="user-management-save-button"
//                 onClick={handleEditUser}
//               >
//                 <LuSave />
//                 Save Changes
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Click outside to close dropdown */}
//       {dropdownOpen && (
//         <div
//           className="user-management-dropdown-overlay"
//           onClick={() => setDropdownOpen(null)}
//         />
//       )}
//     </div>
//   );
// };

// export default UserManagement;




import React, { useState, useEffect } from 'react';
import { 
  LuUsers, 
  LuUserPlus, 
  LuSearch, 
  LuFilter, 
  LuEllipsisVertical,
  LuPen, 
  LuTrash2, 
  LuEye, 
  LuMail, 
  LuPhone, 
  LuCalendar,
  LuX,
  LuSave,
  LuUser,
  LuShield,
  LuCrown,
  LuUserCheck,
  LuClock,
} from 'react-icons/lu';
import axios from 'axios';
import BASE_URL from '../../url';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    role: 'user',
    status: 'active',
    username: '',
    password: 'defaultPassword123!' // Default password
  });

  const roles = [
    { value: 'admin', label: 'Admin', icon: <LuShield />, color: '#0eb381ff' },
    { value: 'manager', label: 'Manager', icon: <LuCrown />, color: '#0eb381ff' },
    { value: 'team_lead', label: 'Team Lead', icon: <LuUserCheck />, color: '#0eb381ff' },
    { value: 'user', label: 'User', icon: <LuUser />, color: '#0eb381ff' }
  ];

  const statuses = [
    { value: 'active', label: 'Active', color: '#20c997' },
    { value: 'inactive', label: 'Inactive', color: '#de6b76ff' }
  ];

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${BASE_URL}/api/users`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.address && user.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, selectedRole, selectedStatus]);

  const getRoleInfo = (role) => {
    return roles.find(r => r.value === role) || roles[3];
  };

  const getStatusColor = (status) => {
    return statuses.find(s => s.value === status)?.color || '#6c757d';
  };

  // Add new user - FIXED VERSION
  const handleAddUser = async () => {
    // Validate required fields
    if (!newUser.firstName || !newUser.lastName || !newUser.email) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      alert('Please enter a valid email address');
      return;
    }
    
    try {
      // Generate username if not provided
      const username = newUser.username || newUser.email.split('@')[0];
      
      const userData = {
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim().toLowerCase(),
        phone: newUser.phone?.trim() || null,
        address: newUser.address?.trim() || null,
        role: newUser.role,
        status: newUser.status,
        username: username,
        password: newUser.password || 'defaultPassword123!'
      };
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BASE_URL}/api/users`, userData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Refresh users list after successful addition
      const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(usersResponse.data);
      
      // Reset form
      setNewUser({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        role: 'user',
        status: 'active',
        username: '',
        password: 'defaultPassword123!'
      });
      
      setShowAddModal(false);
      alert('User added successfully!');
      
    } catch (err) {
      console.error("Error adding user:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to add user. Please try again.';
      alert(errorMessage);
    }
  };

  // Edit user - FIXED VERSION
  const handleEditUser = async () => {
    if (!selectedUser) return;

    // Validate required fields
    if (!selectedUser.firstName || !selectedUser.lastName || !selectedUser.email) {
      alert('Please fill in all required fields (First Name, Last Name, Email)');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(selectedUser.email)) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      const userData = {
        firstName: selectedUser.firstName.trim(),
        lastName: selectedUser.lastName.trim(),
        email: selectedUser.email.trim().toLowerCase(),
        phone: selectedUser.phone?.trim() || null,
        address: selectedUser.address?.trim() || null,
        role: selectedUser.role,
        status: selectedUser.status,
        username: selectedUser.username || selectedUser.email.split('@')[0]
      };

      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/users/${selectedUser.id}`, userData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Refresh users list after successful update
      const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(usersResponse.data);
      setShowEditModal(false);
      setSelectedUser(null);
      alert('User updated successfully!');
      
    } catch (err) {
      console.error("Error updating user:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to update user. Please try again.';
      alert(errorMessage);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    const action = user?.status === 'active' ? 'deactivate' : 'activate';
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Toggle status instead of deleting
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await axios.put(`${BASE_URL}/api/users/${userId}`, {
        ...user,
        status: newStatus
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Refresh users list
      const usersResponse = await axios.get(`${BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(usersResponse.data);
      setDropdownOpen(null);
      alert(`User ${action}d successfully!`);
      
    } catch (err) {
      console.error("Error updating user status:", err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          `Failed to ${action} user. Please try again.`;
      alert(errorMessage);
    }
  };

  const toggleDropdown = (userId) => {
    setDropdownOpen(dropdownOpen === userId ? null : userId);
  };

  const openEditModal = (user) => {
    setSelectedUser({ ...user });
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  // Close modal and reset form
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      role: 'user',
      status: 'active',
      username: '',
      password: 'defaultPassword123!'
    });
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };

  if (loading) return <div className="user-management-container">Loading users...</div>;
  if (error) return <div className="user-management-container">Error: {error}</div>;

  return (
    <div className="user-management-container">
      {/* Header */}
      <div className="user-management-header">
        <div className="user-management-header-left">
          <LuUsers className="user-management-header-icon" />
          <h1 className="user-management-title">User Management</h1>
          <span className="user-management-count">{filteredUsers.length} users</span>
        </div>
        <button className="user-management-add-button" onClick={() => setShowAddModal(true)}>
          <LuUserPlus />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="user-management-filters-container">
        <div className="user-management-search-container">
          <LuSearch className="user-management-search-icon" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="user-management-search-input"
          />
        </div>
        <div className="user-management-filter-group">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="user-management-filter-select"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="user-management-filter-select"
          >
            <option value="all">All Status</option>
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="user-management-table-container">
        <table className="user-management-table">
          <thead className="user-management-table-header">
            <tr>
              <th className="user-management-th">User</th>
              <th className="user-management-th">Contact</th>
              <th className="user-management-th">Role</th>
              <th className="user-management-th">Status</th>
              <th className="user-management-th">Last Login</th>
              <th className="user-management-th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="user-management-table-row">
                <td className="user-management-td">
                  <div className="user-management-user-cell">
                    <div className="user-management-avatar">
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </div>
                    <div>
                      <div className="user-management-user-name">{user.firstName} {user.lastName}</div>
                      <div className="user-management-user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="user-management-td">
                  <div className="user-management-contact-info">
                    <div className="user-management-contact-item">
                      <LuMail size={12} />
                      {user.email}
                    </div>
                    {user.phone && (
                      <div className="user-management-contact-item">
                        <LuPhone size={12} />
                        {user.phone}
                      </div>
                    )}
                    {user.address && (
                      <div className="user-management-contact-item">
                        {user.address}
                      </div>
                    )}
                  </div>
                </td>
                <td className="user-management-td">
                  <div className="user-management-role-cell">
                    <span className="user-management-role-icon" style={{color: getRoleInfo(user.role).color}}>
                      {getRoleInfo(user.role).icon}
                    </span>
                    {getRoleInfo(user.role).label}
                  </div>
                </td>
                <td className="user-management-td">
                  <span className="user-management-status-badge" style={{backgroundColor: getStatusColor(user.status)}}>
                    {user.status}
                  </span>
                </td>
                <td className="user-management-td">
                  {user.lastLogin ? (
                    <div className="user-management-date-cell">
                      <LuClock size={12} />
                      <div className="user-management-date-time">
                        {new Date(user.lastLogin).toLocaleDateString()}
                        <div>{new Date(user.lastLogin).toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="user-management-never-login">Never</span>
                  )}
                </td>
                <td className="user-management-td">
                  <div className="user-management-actions-container">
                    <button
                      className="user-management-action-button"
                      onClick={() => toggleDropdown(user.id)}
                    >
                      <LuEllipsisVertical />
                    </button>
                    {dropdownOpen === user.id && (
                      <div className="user-management-dropdown">
                        <button
                          className="user-management-dropdown-item"
                          onClick={() => openEditModal(user)}
                        >
                          <LuPen /> Edit
                        </button>
                        <button
                          className="user-management-dropdown-item"
                          onClick={() => alert(`Viewing ${user.firstName} ${user.lastName}`)}
                        >
                          <LuEye /> View
                        </button>
                        <button
                          className="user-management-dropdown-item user-management-dropdown-item-danger"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <LuTrash2 /> {user.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="user-management-modal-overlay">
          <div className="user-management-modal">
            <div className="user-management-modal-header">
              <h2 className="user-management-modal-title">Add New User</h2>
              <button
                className="user-management-close-button"
                onClick={closeAddModal}
              >
                <LuX />
              </button>
            </div>
            <div className="user-management-modal-body">
              <div className="user-management-form-row">
                <div className="user-management-form-group">
                  <label className="user-management-label">First Name*</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                    className="user-management-input"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="user-management-form-group">
                  <label className="user-management-label">Last Name*</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                    className="user-management-input"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              <div className="user-management-form-group">
                <label className="user-management-label">Email*</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="user-management-input"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="user-management-form-group">
                <label className="user-management-label">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="user-management-input"
                  placeholder="Auto-generated from email if empty"
                />
              </div>
              <div className="user-management-form-group">
                <label className="user-management-label">Phone</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  className="user-management-input"
                  placeholder="Enter phone number"
                />
              </div>
              <div className="user-management-form-group">
                <label className="user-management-label">Address</label>
                <input
                  type="text"
                  value={newUser.address}
                  onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                  className="user-management-input"
                  placeholder="Enter address"
                />
              </div>
              <div className="user-management-form-row">
                <div className="user-management-form-group">
                  <label className="user-management-label">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="user-management-select"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="user-management-form-group">
                  <label className="user-management-label">Status</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    className="user-management-select"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="user-management-modal-footer">
              <button
                className="user-management-cancel-button"
                onClick={closeAddModal}
              >
                Cancel
              </button>
              <button
                className="user-management-save-button"
                onClick={handleAddUser}
              >
                <LuSave />
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="user-management-modal-overlay">
          <div className="user-management-modal">
            <div className="user-management-modal-header">
              <h2 className="user-management-modal-title">Edit User</h2>
              <button
                className="user-management-close-button"
                onClick={closeEditModal}
              >
                <LuX />
              </button>
            </div>
            <div className="user-management-modal-body">
              <div className="user-management-form-row">
                <div className="user-management-form-group">
                  <label className="user-management-label">First Name*</label>
                  <input
                    type="text"
                    value={selectedUser.firstName || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, firstName: e.target.value})}
                    className="user-management-input"
                    required
                  />
                </div>
                <div className="user-management-form-group">
                  <label className="user-management-label">Last Name*</label>
                  <input
                    type="text"
                    value={selectedUser.lastName || ''}
                    onChange={(e) => setSelectedUser({...selectedUser, lastName: e.target.value})}
                    className="user-management-input"
                    required
                  />
                </div>
              </div>
              <div className="user-management-form-group">
                <label className="user-management-label">Email*</label>
                <input
                  type="email"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="user-management-input"
                  required
                />
              </div>
              <div className="user-management-form-group">
                <label className="user-management-label">Username</label>
                <input
                  type="text"
                  value={selectedUser.username || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                  className="user-management-input"
                />
              </div>
              <div className="user-management-form-group">
                <label className="user-management-label">Phone</label>
                <input
                  type="tel"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, phone: e.target.value})}
                  className="user-management-input"
                />
              </div>
              <div className="user-management-form-group">
                <label className="user-management-label">Address</label>
                <input
                  type="text"
                  value={selectedUser.address || ''}
                  onChange={(e) => setSelectedUser({...selectedUser, address: e.target.value})}
                  className="user-management-input"
                />
              </div>
              <div className="user-management-form-row">
                <div className="user-management-form-group">
                  <label className="user-management-label">Role</label>
                  <select
                    value={selectedUser.role || 'user'}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value})}
                    className="user-management-select"
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="user-management-form-group">
                  <label className="user-management-label">Status</label>
                  <select
                    value={selectedUser.status || 'active'}
                    onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value})}
                    className="user-management-select"
                  >
                    {statuses.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="user-management-modal-footer">
              <button
                className="user-management-cancel-button"
                onClick={closeEditModal}
              >
                Cancel
              </button>
              <button
                className="user-management-save-button"
                onClick={handleEditUser}
              >
                <LuSave />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="user-management-dropdown-overlay"
          onClick={() => setDropdownOpen(null)}
        />
      )}
    </div>
  );
};

export default UserManagement;