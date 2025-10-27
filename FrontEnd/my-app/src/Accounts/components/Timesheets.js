// // Timesheets.js
// import React, { useState } from "react";
// import InternalTimesheet from "./InternalTimesheet";
// import ExternalTimesheet from "./ExternalTimesheet";
// import OtherTimesheets from "./OtherTimesheets";
// import "../styles/Timesheets.css";

// const Timesheets = () => {
//   const [activeTab, setActiveTab] = useState("internal");

//   const tabs = [
//     { id: "internal", label: "Internal Timesheets" },
//     { id: "external", label: "External Timesheets" },
//     { id: "other", label: "Other Timesheets" }
//   ];

//   const renderContent = () => {
//     switch (activeTab) {
//       case "internal":
//         return <InternalTimesheet />;
//       case "external":
//         return <ExternalTimesheet />;
//       case "other":
//         return <OtherTimesheets />;
//       default:
//         return <InternalTimesheet />;
//     }
//   };

//   return (
//     <div className="timesheets-container">
//       <div className="timesheets-header">
//         <h1>Timesheet Management</h1>
//         <p>Manage your timesheets efficiently</p>
//       </div>

//       {/* Tabs Navigation */}
//       <div className="timesheet-tabs">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
//             onClick={() => setActiveTab(tab.id)}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Tab Content */}
//       <div className="tab-content">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default Timesheets;





// // Timesheets.js
// import React, { useState } from "react";
// import InternalTimesheet from "./InternalTimesheet";
// import ExternalTimesheet from "./ExternalTimesheet";
// import OtherTimesheets from "./OtherTimesheets";
// import "../styles/Timesheets.css";

// const Timesheets = () => {
//   const [activeTab, setActiveTab] = useState("internal");

//   const tabs = [
//     { id: "internal", label: "Internal Timesheets" },
//     { id: "external", label: "External Timesheets" },
//     { id: "other", label: "Other Timesheets" }
//   ];

//   const renderContent = () => {
//     switch (activeTab) {
//       case "internal":
//         return <InternalTimesheet />;
//       case "external":
//         return <ExternalTimesheet />;
//       case "other":
//         return <OtherTimesheets />;
//       default:
//         return <InternalTimesheet />;
//     }
//   };

//   return (
//     <div className="timesheets-container">
//       <div className="timesheets-header">
//         <h1>Timesheet Management</h1>
//         <p>Manage your timesheets efficiently</p>
//       </div>

//       {/* Tabs Navigation */}
//       <div className="timesheet-tabs">
//         {tabs.map((tab) => (
//           <button
//             key={tab.id}
//             className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
//             onClick={() => setActiveTab(tab.id)}
//           >
//             {tab.label}
//           </button>
//         ))}
//       </div>

//       {/* Tab Content */}
//       <div className="tab-content">
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default Timesheets;





// Timesheets.js - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InternalTimesheet from "./InternalTimesheet";
import ExternalTimesheet from "./ExternalTimesheet";
import OtherTimesheets from "./OtherTimesheets";
import { 
  Clock, 
  Upload, 
  FileText, 
  User, 
  Mail, 
  Briefcase,
  AlertCircle
} from "lucide-react";
import axios from 'axios';
import BASE_URL from '../../url';
import "../styles/Timesheets.css";

const Timesheets = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("internal");
  const [userInfo, setUserInfo] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserAndEmployeeInfo();
  }, []);

  const fetchUserAndEmployeeInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Get current user info
      const userResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = userResponse.data;
      console.log('User data from API:', user); // Debug log
      setUserInfo(user);

      // FIXED: Check for both EmployeeId (capital E) and employeeId (lowercase)
      const employeeId = user.EmployeeId || user.employeeId;
      
      if (!employeeId) {
        setError('No employee ID assigned to your account. Please contact administrator.');
        setLoading(false);
        return;
      }

      console.log('Employee ID found:', employeeId); // Debug log

      // Fetch employee details from the appropriate company table
      // Try to find employee across all companies
      let employeeFound = false;
      const companies = [
        { id: 5, name: 'Cognifyar Technologies' },
        { id: 3, name: 'Prophecy Offshore' },
        { id: 2, name: 'Prophecy Consulting' }
      ];

      for (const company of companies) {
        try {
          console.log(`Searching in company ${company.name} (ID: ${company.id}) for employee ${employeeId}`); // Debug log
          
          const empResponse = await axios.get(
            `${BASE_URL}/api/employees/company/${company.id}/${employeeId}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          console.log(`Response from ${company.name}:`, empResponse.data); // Debug log

          if (empResponse.data.success) {
            setEmployeeInfo({
              ...empResponse.data.data,
              companyId: company.id,
              companyName: company.name
            });
            employeeFound = true;
            console.log('Employee found in company:', company.name); // Debug log
            break;
          }
        } catch (err) {
          console.log(`Not found in ${company.name}, trying next...`); // Debug log
          // Continue to next company
          continue;
        }
      }

      if (!employeeFound) {
        setError('Employee record not found. Please contact administrator.');
        console.error('Employee not found in any company'); // Debug log
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching user/employee info:', err);
      setError('Failed to load user information: ' + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  };

  const tabs = [
    { 
      id: "internal", 
      label: "Internal Timesheets",
      icon: <Clock size={18} />,
      description: "Track your daily work hours"
    },
    { 
      id: "external", 
      label: "External Timesheets",
      icon: <Upload size={18} />,
      description: "Upload client timesheets"
    },
    { 
      id: "other", 
      label: "Other Timesheets",
      icon: <FileText size={18} />,
      description: "Additional timesheet options"
    }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="timesheets-loading">
          <div className="timesheets-spinner"></div>
          <p>Loading your timesheets...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="timesheets-error">
          <AlertCircle size={48} color="#ef4444" />
          <h3>Unable to Load Timesheets</h3>
          <p>{error}</p>
          <button 
            className="timesheets-retry-btn"
            onClick={fetchUserAndEmployeeInfo}
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case "internal":
        return <InternalTimesheet employeeInfo={employeeInfo} userInfo={userInfo} />;
      case "external":
        return <ExternalTimesheet employeeInfo={employeeInfo} userInfo={userInfo} />;
      case "other":
        return <OtherTimesheets employeeInfo={employeeInfo} userInfo={userInfo} />;
      default:
        return <InternalTimesheet employeeInfo={employeeInfo} userInfo={userInfo} />;
    }
  };

  return (
    <div className="timesheets-container">
      {/* Header Section */}
      <div className="timesheets-header">
        <div className="timesheets-header-content">
          <h1>Timesheet Management</h1>
          <p>Manage your timesheets efficiently</p>
        </div>
        
        {/* Employee Info Card - Only show if employee info is loaded */}
        {employeeInfo && !loading && (
          <div className="timesheets-employee-card">
            <div className="timesheets-employee-avatar">
              <User size={24} color="white" />
            </div>
            <div className="timesheets-employee-info">
              <h3>{employeeInfo.Name || employeeInfo.name}</h3>
              <div className="timesheets-employee-details">
                <span className="detail-item">
                  <Mail size={12} />
                  {employeeInfo.Email || employeeInfo.email}
                </span>
                <span className="detail-item">
                  <Briefcase size={12} />
                  {employeeInfo.Department || employeeInfo.department}
                </span>
              </div>
              <div className="timesheets-employee-meta">
                <span className="meta-badge">{employeeInfo.companyName}</span>
                <span className="meta-id">ID: {employeeInfo.EmployeeId || employeeInfo.employeeId}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="timesheet-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            disabled={loading || !!error}
          >
            <span className="tab-icon">{tab.icon}</span>
            <div className="tab-text">
              <span className="tab-label">{tab.label}</span>
              <span className="tab-description">{tab.description}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default Timesheets;