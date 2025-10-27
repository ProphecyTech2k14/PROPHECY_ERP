



import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt, FaTimes, FaUser, FaEnvelope, FaPhone, FaMobile, FaGithub, FaLinkedin, FaMapMarkerAlt, FaBirthdayCake, FaCamera } from "react-icons/fa";
import BASE_URL from "../../url"; 
import defaultProfile from "../Assets/images/user.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [relevantUsers, setRelevantUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserData, setShowUserData] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
 
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUser(user);
      setShowUserData(false);
      setDataFetched(false);
    }
  }, []);

  const fetchRelevantUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      let response;
      
      if (currentUser.role === 'manager') {
        response = await fetch(`${BASE_URL}/api/auth/role/manager`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      } else {
        response = await fetch(`${BASE_URL}/api/auth/user/${currentUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }

      if (response.ok) {
        const data = await response.json();
        
        if (currentUser.role === 'manager') {
          setRelevantUsers(data.users || []);
          if (data.users && data.users.length > 0) {
            const fullUser = data.users[0];
            setSelectedUser(fullUser);
            setEditFormData(fullUser);
          }
        } else {
          setRelevantUsers([data]);
          setSelectedUser(data);
          setEditFormData(data);
        }
        setDataFetched(true);
      } else {
        console.error("Failed to fetch users:", response.status);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const getProfileUrl = (user) => {
    if (!user?.id || !user?.profile) {
      return defaultProfile;
    }

    const hasValidExtension = /\.(jpe?g|png|gif|webp)$/i.test(user.profile);
    if (!hasValidExtension) {
      return `${BASE_URL}/defaults/users/${user.id}.png`;
    }

    const isAbsoluteUrl = user.profile.startsWith("http");

    return isAbsoluteUrl
      ? `${user.profile}?t=${Date.now()}`
      : `${BASE_URL}/uploads/users/${user.id}/${user.profile}?t=${Date.now()}`;
  };

  const handleProfileIconClick = () => {
    if (!dataFetched) {
      fetchRelevantUsers();
      setShowUserData(true);
    } else if (showUserData) {
      setShowUserData(false);
      setIsEditMode(false);
    } else {
      setShowUserData(true);
    }
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setEditFormData({ ...selectedUser });
    }
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

 const handleSaveEdit = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${BASE_URL}/api/auth/user/${selectedUser.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editFormData)
    });

    const responseData = await response.json();

    if (response.ok) {
      setSelectedUser(responseData);
      
      // Update relevant users array
      setRelevantUsers(prev => 
        prev.map(user => user.id === responseData.id ? responseData : user)
      );
      
      // Update localStorage if this is the current user
      if (currentUser.id === responseData.id) {
        localStorage.setItem("user", JSON.stringify(responseData));
        setCurrentUser(responseData);
      }
      
      setIsEditMode(false);
      alert("Profile updated successfully!");
    } else {
      // Handle specific error messages
      const errorMessage = responseData.message || responseData.error || "Failed to update profile";
      console.error("Update failed:", responseData);
      alert(`Failed to update profile: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert(`Error updating profile: ${error.message}`);
  }
};

  const handleCancelEdit = () => {
    setEditFormData({ ...selectedUser });
    setIsEditMode(false);
  };

  const getIconTitle = () => {
    if (!dataFetched) {
      return "Load Dashboard";
    } else if (showUserData) {
      return "Hide Dashboard";
    } else {
      return "Show Dashboard";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div style={styles.container}>
      {/* Profile Icon - Always visible */}
      {currentUser && (
        <div style={styles.profileContainer}>
          <img
            src={getProfileUrl(selectedUser || currentUser)}
            alt="Profile"
            style={styles.profileImage}
            onClick={handleProfileIconClick}
            title={getIconTitle()}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultProfile;
            }}
          />
          <div style={styles.profileInfo}>
            <span>{(selectedUser || currentUser).firstName || (selectedUser || currentUser).username}</span>
            <small>{(selectedUser || currentUser).role}</small>
          </div>
        </div>
      )}

      {/* Welcome Message */}
      <h1 style={styles.welcomeMessage}>
        Welcome {currentUser?.firstName || currentUser?.username}!
      </h1>

      {/* Full Dashboard with all details */}
      {showUserData && dataFetched && selectedUser && (
        <div style={styles.dashboardContainer}>
          {/* Header with Edit Button */}
          <div style={styles.dashboardHeader}>
            <h2 style={styles.dashboardTitle}>
              {currentUser.role === 'manager' ? 'Currently Viewing: ' : 'Your Profile: '}
              {selectedUser.firstName} {selectedUser.lastName}
            </h2>
            <div style={styles.actionButtons}>
              {!isEditMode ? (
                <button onClick={handleEditToggle} style={styles.editButton}>
                  <FaPencilAlt /> Edit Profile
                </button>
              ) : (
                <div style={styles.editActions}>
                  <button onClick={handleSaveEdit} style={styles.saveButton}>
                    Save
                  </button>
                  <button onClick={handleCancelEdit} style={styles.cancelButton}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Picture Section */}
          <div style={styles.profileSection}>
            <div style={styles.profilePictureContainer}>
              <img
                src={getProfileUrl(selectedUser)}
                alt="Profile"
                style={styles.dashboardProfileImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultProfile;
                }}
              />
              {isEditMode && (
                <div style={styles.profileEditOverlay}>
                  <FaCamera style={styles.cameraIcon} />
                  <span>Change Photo</span>
                </div>
              )}
            </div>
          </div>

          {/* User Details Grid */}
          <div style={styles.detailsGrid}>
            {/* Basic Information */}
            <div style={styles.detailsSection}>
              <h3 style={styles.sectionTitle}>
                <FaUser style={styles.sectionIcon} />
                Basic Information
              </h3>
              <div style={styles.detailRow}>
                <label style={styles.label}>First Name:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.firstName || ''}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.firstName || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Last Name:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.lastName || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Alias:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.alias || ''}
                    onChange={(e) => handleInputChange('alias', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.alias || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Username:</label>
                <span style={styles.value}>{selectedUser.username}</span>
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Role:</label>
                <span style={styles.value}>{selectedUser.role}</span>
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Date of Birth:</label>
                {isEditMode ? (
                  <input
                    type="date"
                    value={editFormData.dob ? editFormData.dob.split('T')[0] : ''}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{formatDate(selectedUser.dob)}</span>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div style={styles.detailsSection}>
              <h3 style={styles.sectionTitle}>
                <FaEnvelope style={styles.sectionIcon} />
                Contact Information
              </h3>
              <div style={styles.detailRow}>
                <label style={styles.label}>Email:</label>
                {isEditMode ? (
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.email || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Phone:</label>
                {isEditMode ? (
                  <input
                    type="tel"
                    value={editFormData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.phone || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Mobile:</label>
                {isEditMode ? (
                  <input
                    type="tel"
                    value={editFormData.mobile || ''}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.mobile || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>GitHub:</label>
                {isEditMode ? (
                  <input
                    type="url"
                    value={editFormData.fax || ''}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                    style={styles.input}
                    placeholder="https://github.com/username"
                  />
                ) : (
                  <span style={styles.value}>
                    {selectedUser.fax ? (
                      <a href={selectedUser.fax} target="_blank" rel="noopener noreferrer" style={styles.link}>
                        <FaGithub style={{marginRight: '5px'}} />
                        {selectedUser.fax}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>LinkedIn:</label>
                {isEditMode ? (
                  <input
                    type="url"
                    value={editFormData.website || ''}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    style={styles.input}
                    placeholder="https://linkedin.com/in/username"
                  />
                ) : (
                  <span style={styles.value}>
                    {selectedUser.website ? (
                      <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" style={styles.link}>
                        <FaLinkedin style={{marginRight: '5px'}} />
                        {selectedUser.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div style={styles.detailsSection}>
              <h3 style={styles.sectionTitle}>
                <FaMapMarkerAlt style={styles.sectionIcon} />
                Address Information
              </h3>
              <div style={styles.detailRow}>
                <label style={styles.label}>Street:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.street || ''}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.street || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>City:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.city || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Province:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.province || ''}
                    onChange={(e) => handleInputChange('province', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.province || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Postal Code:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.postalCode || ''}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.postalCode || 'Not provided'}</span>
                )}
              </div>
              <div style={styles.detailRow}>
                <label style={styles.label}>Country:</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editFormData.country || ''}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    style={styles.input}
                  />
                ) : (
                  <span style={styles.value}>{selectedUser.country || 'Not provided'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show message if no relevant data found */}
      {showUserData && dataFetched && relevantUsers.length === 0 && (
        <div style={styles.noDataMessage}>
          <p>No {currentUser.role === 'manager' ? 'manager' : 'user'} data available.</p>
        </div>
      )}
    </div>
  );
};

// Enhanced Styles
const styles = {
  container: {
    textAlign: "center",
    marginTop: "20px",
    padding: "20px",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
  },
  welcomeMessage: {
    fontSize: "2.5rem",
    color: "black",
    marginBottom: "30px",
    // fontWeight: "300",
  },
  profileContainer: {
    position: "absolute",
    top: "20px",
    right: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    backgroundColor: "white",
    borderRadius: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    zIndex: 1000,
  },
  profileImage: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #019d88",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    fontSize: "14px",
  },
  dashboardContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "30px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    textAlign: "left",
  },
  dashboardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e9ecef",
  },
  dashboardTitle: {
    color: "black",
    fontSize: "1.8rem",
    margin: 0,
  },
  actionButtons: {
    display: "flex",
    gap: "10px",
  },
  editButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 20px",
    background: "linear-gradient(180deg, #019d88, #0d2e26)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  editActions: {
    display: "flex",
    gap: "10px",
  },
  saveButton: {
    padding: "10px 20px",
    background: "linear-gradient(180deg, #019d88, #0d2e26)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  cancelButton: {
    padding: "10px 20px",
    background: "linear-gradient(180deg, #019d88, #0d2e26)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },
  profileSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
  },
  profilePictureContainer: {
    position: "relative",
    cursor: isEditMode => isEditMode ? "pointer" : "default",
  },
  dashboardProfileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #019d88",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  profileEditOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: "50%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "12px",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },
  cameraIcon: {
    fontSize: "20px",
    marginBottom: "5px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "30px",
  },
  detailsSection: {
    backgroundColor: "#f8f9fa",
    padding: "25px",
    borderRadius: "10px",
    border: "1px solid #e9ecef",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#019d88",
    fontSize: "1.3rem",
    marginBottom: "20px",
    fontWeight: "600",
  },
  sectionIcon: {
    fontSize: "1.2rem",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid #e9ecef",
  },
  label: {
    fontWeight: "600",
    color: "#495057",
    minWidth: "120px",
    textAlign: "left",
  },
  value: {
    color: "#6c757d",
    flex: 1,
    textAlign: "right",
  },
  input: {
    padding: "8px 12px",
    border: "1px solid #ced4da",
    borderRadius: "4px",
    fontSize: "14px",
    width: "200px",
    outline: "none",
    transition: "border-color 0.3s ease",
  },
  link: {
    color: "#019d88",
    textDecoration: "none",
    display: "flex",
    alignItems: "center",
  },
  noDataMessage: {
    marginTop: "30px",
    padding: "20px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "8px",
    color: "#856404",
  },
};

// Add hover effects
if (typeof document !== 'undefined') {
  const styleSheet = document.styleSheets[0];
  if (styleSheet) {
    try {
      styleSheet.insertRule(`
        .profile-edit-overlay:hover {
          opacity: 1 !important;
        }
      `, styleSheet.cssRules.length);
    } catch (e) {
      // Handle any CSS rule insertion errors
    }
  }
}

export default HomePage;


