// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import Sidebar from "./Recruitment/components/Sidebar";
// import LoginPage from "./Recruitment/components/LoginPage";
// import HomePage from "./Recruitment/components/Home";
// import JobOpeningForm from "./Recruitment/components/JobOpeningForm";
// import Settings from "./Recruitment/components/Settings";
// import JobListings from "./Recruitment/components/JobListings";
// import JobCreate from "./Recruitment/components/JobCreate";
// import ForgotPassword from "./Recruitment/components/ForgotPassword";
// import ClientCreation from "./Recruitment/components/ClientCreation";
// import ClientListings from "./Recruitment/components/ClientListings";
// import ClientColumn from "./Recruitment/components/ClientColumn";
// import ClientView from "./Recruitment/components/ClientView";

// import CreateContact from "./Recruitment/components/ContactCreate";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Contactlisting from "./Recruitment/components/contactlisting";
// import JobEditView from "./Recruitment/components/JobEditView";
// import Jobtemplate from "./Recruitment/components/NewJobTemplate";
// import JobTemplatesPage from "./Recruitment/components/templates";
// import Users from "./Recruitment/components/user_page";
// import ClientEditView from "./Recruitment/components/ClientColumn";
// import ContactEditView from "./Recruitment/components/ContactEditView";
// import Newgroup from "./Recruitment/components/NewGroup";
// import GroupsPage from "./Recruitment/components/groups";

// import RecruitmentDashboard from "./erprecruitment/Components/RecruitmentDashboard";
// import ResumeDashboard from "./Resume_Submission/Components/ResumeDashboard";
// import UserManagement from "./erprecruitment/Components/UserManagement";
// import BenchSales from "./Bench_Sales/Components/BenchSales";
// import CompaniesView from "./TimeSheetManagement/components/CompaniesView";
// import TimeSheetManagement from "./TimeSheetManagement/components/TimeSheetManagement";
// import ManagerTimesheet from "./TimeSheetManagement/components/ManagerTimesheet";
// import UserDetails from "./TimeSheetManagement/components/UserDetails"
// import ExternalSubmission from './Bench_Sales/Components/ExternalSubmission';
// import Swal from 'sweetalert2';
// import "./App.css";

// const App = () => {
//   const [isPinned, setIsPinned] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const location = useLocation();

//   const defaultSwalOptions = {
//     background: '#f8f9fa',
//     color: '#333',
//     confirmButtonColor: '#3085d6',
//     cancelButtonColor: '#d33',
//   };

//   useEffect(() => {
//     setIsAuthenticated(!!localStorage.getItem("token"));
//   }, [location.pathname]);

//   const togglePinned = () => setIsPinned(!isPinned);

//   return (
//     <div className={`app-container ${isAuthenticated ? "" : "login-wrapper"}`}>
//       {isAuthenticated && <Sidebar isPinned={isPinned} togglePinned={togglePinned} />}
//       <div className={`main-content ${isPinned ? "" : "shifted"}`}>
//         <ToastContainer />
//         <Routes>
//           {/* Authentication Routes */}
//           <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
          
//           {/* Main Routes */}
//           <Route path="/dashboard" element={isAuthenticated ? <HomePage /> : <Navigate to="/" />} />
        

// <Route 
//   path="/recruitment-dashboard" 
//   element={isAuthenticated && (localStorage.getItem('role') === 'manager' || localStorage.getItem('role') === 'admin')  ? <RecruitmentDashboard /> : <Navigate to="/" />} 
// />


// <Route 
//   path="/teamlead-dashboard" 
//   element={isAuthenticated && localStorage.getItem('role') === 'teamlead' ? <RecruitmentDashboard /> : <Navigate to="/" />} 
// />
// <Route path="/recruiter-view" element={isAuthenticated && localStorage.getItem('role') === 'user' ? <RecruitmentDashboard /> : <Navigate to="/" />} />
//           <Route path="/job-openings" element={isAuthenticated ? <JobOpeningForm /> : <Navigate to="/" />} />
//           <Route path="/job-create" element={isAuthenticated ? <JobCreate /> : <Navigate to="/" />} />
//           <Route path="/job-listings" element={isAuthenticated ? <JobListings /> : <Navigate to="/" />} />
//           <Route path="/job-view" element={isAuthenticated ? <JobEditView /> : <Navigate to="/" />} />
//           <Route path="/client-creation" element={isAuthenticated ? <ClientCreation /> : <Navigate to="/" />} />
//           <Route path="/Client-listings" element={isAuthenticated ? <ClientListings /> : <Navigate to="/" />} />
//           <Route path="/client-column" element={isAuthenticated ? <ClientColumn /> : <Navigate to="/" />} />
//           <Route path="/client-view" element={isAuthenticated ? <ClientEditView /> : <Navigate to="/" />} />
//           <Route path="/create-contact" element={isAuthenticated ? <CreateContact /> : <Navigate to="/" />} />
//           <Route path="/Contactlisting" element={isAuthenticated ? <Contactlisting /> : <Navigate to="/" />} />
//           <Route path="/Contact-View" element={isAuthenticated ? <ContactEditView /> : <Navigate to="/" />} />
//           <Route path="/jobtemplate" element={isAuthenticated ? <Jobtemplate /> : <Navigate to="/" />} />
//           <Route path="/template" element={isAuthenticated ? <JobTemplatesPage /> : <Navigate to="/" />} />
//           <Route path="/Users" element={isAuthenticated ? <Users /> : <Navigate to="/" />} />
//             <Route path="/resume-dashboard" element={isAuthenticated ? <ResumeDashboard /> : <Navigate to="/" />} /> 
// <Route 
//   path="/user-management" 
//   element={isAuthenticated && localStorage.getItem('role') === 'admin' ? <UserManagement /> : <Navigate to="/" />} 
// />


//     {/* Bench Sales Routes - All using BenchSales component with different props/params */}
//           <Route path="/bench-sales" element={isAuthenticated ? <BenchSales /> : <Navigate to="/" />} />
//           <Route path="/bench-sales-dashboard" element={isAuthenticated ? <BenchSales view="dashboard" /> : <Navigate to="/" />} />
//           <Route path="/bench-sales-recruiter" element={isAuthenticated ? <BenchSales view="recruiter" /> : <Navigate to="/" />} />
//           <Route path="/bench-candidates" element={isAuthenticated ? <BenchSales view="candidates" /> : <Navigate to="/" />} />
//           <Route path="/bench-requirements" element={isAuthenticated ? <BenchSales view="requirements" /> : <Navigate to="/" />} />
//           <Route path="/bench-submissions" element={isAuthenticated ? <BenchSales view="submissions" /> : <Navigate to="/" />} />
//           <Route path="/bench-external-submission" element={isAuthenticated ? <ExternalSubmission /> : <Navigate to="/" />} />
//           <Route path="/bench-marketing" element={isAuthenticated ? <BenchSales view="marketing" /> : <Navigate to="/" />} />
//           <Route path="/bench-analytics" element={isAuthenticated ? <BenchSales view="analytics" /> : <Navigate to="/" />} />
//           <Route path="/bench-vendors" element={isAuthenticated ? <BenchSales view="vendors" /> : <Navigate to="/" />} />
//           <Route path="/bench-hotlist" element={isAuthenticated ? <BenchSales view="hotlist" /> : <Navigate to="/" />} />


//           {/* Time Sheet Management Routes */}
//           <Route path="/companies" element={isAuthenticated ? <CompaniesView /> : <Navigate to="/" />} />
//           <Route path="/timesheet-management" element={isAuthenticated ? <TimeSheetManagement /> : <Navigate to="/" />} />
//           <Route path="/manager-timesheet" element={isAuthenticated ? <ManagerTimesheet /> : <Navigate to="/" />} />
//           <Route path="/user-details/:employeeId" element={isAuthenticated ? <UserDetails/> : <Navigate to="/" />} />
          
//           {/* Settings Route */}
//           <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/" />} />
        

//           {/* Groups Routes */}
//           <Route path="/Newgroup" element={isAuthenticated ? <Newgroup /> : <Navigate to="/" />} />
//           <Route path="/Group" element={isAuthenticated ? <GroupsPage /> : <Navigate to="/" />} />
          
//           {/* Catch-all route */}
//           <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default App;




import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./Recruitment/components/Sidebar";
import LoginPage from "./Recruitment/components/LoginPage";
import HomePage from "./Recruitment/components/Home";
import JobOpeningForm from "./Recruitment/components/JobOpeningForm";
import Settings from "./Recruitment/components/Settings";
import JobListings from "./Recruitment/components/JobListings";
import JobCreate from "./Recruitment/components/JobCreate";
import ForgotPassword from "./Recruitment/components/ForgotPassword";
import ClientCreation from "./Recruitment/components/ClientCreation";
import ClientListings from "./Recruitment/components/ClientListings";
import ClientColumn from "./Recruitment/components/ClientColumn";
import ClientView from "./Recruitment/components/ClientView";

import CreateContact from "./Recruitment/components/ContactCreate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Contactlisting from "./Recruitment/components/contactlisting";
import JobEditView from "./Recruitment/components/JobEditView";
import Jobtemplate from "./Recruitment/components/NewJobTemplate";
import JobTemplatesPage from "./Recruitment/components/templates";
import Users from "./Recruitment/components/user_page";
import ClientEditView from "./Recruitment/components/ClientColumn";
import ContactEditView from "./Recruitment/components/ContactEditView";
import Newgroup from "./Recruitment/components/NewGroup";
import GroupsPage from "./Recruitment/components/groups";

import RecruitmentDashboard from "./erprecruitment/Components/RecruitmentDashboard";
import ResumeDashboard from "./Resume_Submission/Components/ResumeDashboard";
import UserManagement from "./erprecruitment/Components/UserManagement";
import BenchSales from "./Bench_Sales/Components/BenchSales";
import CompaniesView from "./TimeSheetManagement/components/CompaniesView";
// import TimeSheetManagement from "./TimeSheetManagement/components/TimeSheetManagement";
import ManagerTimesheet from "./TimeSheetManagement/components/ManagerTimesheet";
import UserDetails from "./TimeSheetManagement/components/UserDetails"
import ExternalSubmission from './Bench_Sales/Components/ExternalSubmission';
import Accounts from "./Accounts/components/useraccounts";
import Timesheets from "./Accounts/components/Timesheets";
import Swal from 'sweetalert2';
import "./App.css";

const App = () => {
  const [isPinned, setIsPinned] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  const defaultSwalOptions = {
    background: '#f8f9fa',
    color: '#333',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
  };

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, [location.pathname]);

  const togglePinned = () => setIsPinned(!isPinned);

  // Check if user is Account Manager or Admin
  const isAccountManagerOrAdmin = () => {
    const role = localStorage.getItem('role');
    return role === 'accountmanager' || role === 'admin';
  };

  // Helper function to check if user has access to recruitment dashboard
  const hasRecruitmentAccess = () => {
    const role = localStorage.getItem('role');
    return role === 'manager' || role === 'admin' || role === 'teamlead' || role === 'team_lead';
  };

  // Helper function to check if user is recruiter/user
  const isRecruiter = () => {
    const role = localStorage.getItem('role');
    return role === 'user' || role === 'recruiter';
  };

  return (
    <div className={`app-container ${isAuthenticated ? "" : "login-wrapper"}`}>
      {isAuthenticated && <Sidebar isPinned={isPinned} togglePinned={togglePinned} />}
      <div className={`main-content ${isPinned ? "" : "shifted"}`}>
        <ToastContainer />
        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot" element={<ForgotPassword />} />
          
          {/* Main Routes */}
          <Route path="/dashboard" element={isAuthenticated ? <HomePage /> : <Navigate to="/" />} />
          
          {/* Accounts Routes */}
          <Route path="/accounts" element={isAuthenticated ? <Accounts /> : <Navigate to="/" />} />
          <Route path="/timesheets" element={isAuthenticated ? <Timesheets /> : <Navigate to="/" />} />
        
          {/* Recruitment Dashboard - Accessible by admin, manager, teamlead, and team_lead */}
          <Route 
            path="/recruitment-dashboard" 
            element={isAuthenticated && hasRecruitmentAccess() ? <RecruitmentDashboard /> : <Navigate to="/" />} 
          />

          {/* Team Lead Dashboard - Same as recruitment dashboard */}
          <Route 
            path="/teamlead-dashboard" 
            element={isAuthenticated && (localStorage.getItem('role') === 'teamlead' || localStorage.getItem('role') === 'team_lead') ? <RecruitmentDashboard /> : <Navigate to="/" />} 
          />

          {/* Recruiter View - For users and recruiters */}
          <Route 
            path="/recruiter-view" 
            element={isAuthenticated && isRecruiter() ? <RecruitmentDashboard /> : <Navigate to="/" />} 
          />

          {/* Admin Dashboard */}
          <Route 
            path="/admin-dashboard" 
            element={isAuthenticated && localStorage.getItem('role') === 'admin' ? <RecruitmentDashboard /> : <Navigate to="/" />} 
          />

          {/* Job Management Routes */}
          <Route path="/job-openings" element={isAuthenticated ? <JobOpeningForm /> : <Navigate to="/" />} />
          <Route path="/job-create" element={isAuthenticated ? <JobCreate /> : <Navigate to="/" />} />
          <Route path="/job-listings" element={isAuthenticated ? <JobListings /> : <Navigate to="/" />} />
          <Route path="/job-view" element={isAuthenticated ? <JobEditView /> : <Navigate to="/" />} />

          {/* Client Management Routes */}
          <Route path="/client-creation" element={isAuthenticated ? <ClientCreation /> : <Navigate to="/" />} />
          <Route path="/Client-listings" element={isAuthenticated ? <ClientListings /> : <Navigate to="/" />} />
          <Route path="/client-column" element={isAuthenticated ? <ClientColumn /> : <Navigate to="/" />} />
          <Route path="/client-view" element={isAuthenticated ? <ClientEditView /> : <Navigate to="/" />} />

          {/* Contact Management Routes */}
          <Route path="/create-contact" element={isAuthenticated ? <CreateContact /> : <Navigate to="/" />} />
          <Route path="/Contactlisting" element={isAuthenticated ? <Contactlisting /> : <Navigate to="/" />} />
          <Route path="/Contact-View" element={isAuthenticated ? <ContactEditView /> : <Navigate to="/" />} />

          {/* Template and User Routes */}
          <Route path="/jobtemplate" element={isAuthenticated ? <Jobtemplate /> : <Navigate to="/" />} />
          <Route path="/template" element={isAuthenticated ? <JobTemplatesPage /> : <Navigate to="/" />} />
          <Route path="/Users" element={isAuthenticated ? <Users /> : <Navigate to="/" />} />

          {/* Resume Dashboard */}
          <Route path="/resume-dashboard" element={isAuthenticated ? <ResumeDashboard /> : <Navigate to="/" />} /> 

          {/* User Management - Admin Only */}
          <Route 
            path="/user-management" 
            element={isAuthenticated && localStorage.getItem('role') === 'admin' ? <UserManagement /> : <Navigate to="/" />} 
          />

          {/* Bench Sales Routes - All using BenchSales component with different props/params */}
          <Route path="/bench-sales" element={isAuthenticated ? <BenchSales /> : <Navigate to="/" />} />
          <Route path="/bench-sales-dashboard" element={isAuthenticated ? <BenchSales view="dashboard" /> : <Navigate to="/" />} />
          <Route path="/bench-sales-recruiter" element={isAuthenticated ? <BenchSales view="recruiter" /> : <Navigate to="/" />} />
          <Route path="/bench-candidates" element={isAuthenticated ? <BenchSales view="candidates" /> : <Navigate to="/" />} />
          <Route path="/bench-requirements" element={isAuthenticated ? <BenchSales view="requirements" /> : <Navigate to="/" />} />
          <Route path="/bench-submissions" element={isAuthenticated ? <BenchSales view="submissions" /> : <Navigate to="/" />} />
          <Route path="/bench-external-submission" element={isAuthenticated ? <ExternalSubmission /> : <Navigate to="/" />} />
          <Route path="/bench-marketing" element={isAuthenticated ? <BenchSales view="marketing" /> : <Navigate to="/" />} />
          <Route path="/bench-analytics" element={isAuthenticated ? <BenchSales view="analytics" /> : <Navigate to="/" />} />
          <Route path="/bench-vendors" element={isAuthenticated ? <BenchSales view="vendors" /> : <Navigate to="/" />} />
          <Route path="/bench-hotlist" element={isAuthenticated ? <BenchSales view="hotlist" /> : <Navigate to="/" />} />

          {/* Time Sheet Management Routes */}
          <Route path="/companies" element={isAuthenticated ? <CompaniesView /> : <Navigate to="/" />} />
          {/* <Route 
            path="/timesheet-management" 
            element={isAuthenticated && isAccountManagerOrAdmin() ? <TimeSheetManagement /> : <Navigate to="/" />} 
          /> */}
          <Route 
            path="/manager-timesheet" 
            element={isAuthenticated && isAccountManagerOrAdmin() ? <ManagerTimesheet /> : <Navigate to="/" />} 
          />
          <Route 
            path="/user-details/:employeeId" 
            element={isAuthenticated && isAccountManagerOrAdmin() ? <UserDetails/> : <Navigate to="/" />} 
          />

          {/* Groups Routes */}
          <Route path="/Newgroup" element={isAuthenticated ? <Newgroup /> : <Navigate to="/" />} />
          <Route path="/Group" element={isAuthenticated ? <GroupsPage /> : <Navigate to="/" />} />
          
          {/* Settings Route */}
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/" />} />
        
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;








// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import Sidebar from "./Recruitment/components/Sidebar";
// import LoginPage from "./Recruitment/components/LoginPage";
// import HomePage from "./Recruitment/components/Home";
// import JobOpeningForm from "./Recruitment/components/JobOpeningForm";
// import Settings from "./Recruitment/components/Settings";
// import JobListings from "./Recruitment/components/JobListings";
// import JobCreate from "./Recruitment/components/JobCreate";
// import ForgotPassword from "./Recruitment/components/ForgotPassword";
// import ClientCreation from "./Recruitment/components/ClientCreation";
// import ClientListings from "./Recruitment/components/ClientListings";
// import ClientColumn from "./Recruitment/components/ClientColumn";
// import ClientView from "./Recruitment/components/ClientView";

// import CreateContact from "./Recruitment/components/ContactCreate";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import Contactlisting from "./Recruitment/components/contactlisting";
// import JobEditView from "./Recruitment/components/JobEditView";
// import Jobtemplate from "./Recruitment/components/NewJobTemplate";
// import JobTemplatesPage from "./Recruitment/components/templates";
// import Users from "./Recruitment/components/user_page";
// import ClientEditView from "./Recruitment/components/ClientColumn";
// import ContactEditView from "./Recruitment/components/ContactEditView";
// import Newgroup from "./Recruitment/components/NewGroup";
// import GroupsPage from "./Recruitment/components/groups";

// import RecruitmentDashboard from "./erprecruitment/Components/RecruitmentDashboard";
// import ResumeDashboard from "./Resume_Submission/Components/ResumeDashboard";
// import UserManagement from "./erprecruitment/Components/UserManagement";
// import BenchSales from "./Bench_Sales/Components/BenchSales";
// import CompaniesView from "./TimeSheetManagement/components/CompaniesView";
// import TimeSheetManagement from "./TimeSheetManagement/components/TimeSheetManagement";
// import ManagerTimesheet from "./TimeSheetManagement/components/ManagerTimesheet";
// import UserDetails from "./TimeSheetManagement/components/UserDetails"
// import ExternalSubmission from './Bench_Sales/Components/ExternalSubmission';
// import Swal from 'sweetalert2';
// import "./App.css";

// const App = () => {
//   const [isPinned, setIsPinned] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const location = useLocation();

//   const defaultSwalOptions = {
//     background: '#f8f9fa',
//     color: '#333',
//     confirmButtonColor: '#3085d6',
//     cancelButtonColor: '#d33',
//   };

//   useEffect(() => {
//     setIsAuthenticated(!!localStorage.getItem("token"));
//   }, [location.pathname]);

//   const togglePinned = () => setIsPinned(!isPinned);

//   // Check if user is Account Manager
//    const isAccountManagerOrAdmin = () => {
//     const role = localStorage.getItem('role');
//     return role === 'accountmanager' || role === 'admin';
//   };

//   return (
//     <div className={`app-container ${isAuthenticated ? "" : "login-wrapper"}`}>
//       {isAuthenticated && <Sidebar isPinned={isPinned} togglePinned={togglePinned} />}
//       <div className={`main-content ${isPinned ? "" : "shifted"}`}>
//         <ToastContainer />
//         <Routes>
//           {/* Authentication Routes */}
//           <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
//           <Route path="/forgot-password" element={<ForgotPassword />} />
          
//           {/* Main Routes */}
//           <Route path="/dashboard" element={isAuthenticated ? <HomePage /> : <Navigate to="/" />} />
        

// <Route 
//   path="/recruitment-dashboard" 
//   element={isAuthenticated && (localStorage.getItem('role') === 'manager' || localStorage.getItem('role') === 'admin')  ? <RecruitmentDashboard /> : <Navigate to="/" />} 
// />


// <Route 
//   path="/teamlead-dashboard" 
//   element={isAuthenticated && localStorage.getItem('role') === 'teamlead' ? <RecruitmentDashboard /> : <Navigate to="/" />} 
// />
// <Route path="/recruiter-view" element={isAuthenticated && localStorage.getItem('role') === 'user' ? <RecruitmentDashboard /> : <Navigate to="/" />} />
//           <Route path="/job-openings" element={isAuthenticated ? <JobOpeningForm /> : <Navigate to="/" />} />
//           <Route path="/job-create" element={isAuthenticated ? <JobCreate /> : <Navigate to="/" />} />
//           <Route path="/job-listings" element={isAuthenticated ? <JobListings /> : <Navigate to="/" />} />
//           <Route path="/job-view" element={isAuthenticated ? <JobEditView /> : <Navigate to="/" />} />
//           <Route path="/client-creation" element={isAuthenticated ? <ClientCreation /> : <Navigate to="/" />} />
//           <Route path="/Client-listings" element={isAuthenticated ? <ClientListings /> : <Navigate to="/" />} />
//           <Route path="/client-column" element={isAuthenticated ? <ClientColumn /> : <Navigate to="/" />} />
//           <Route path="/client-view" element={isAuthenticated ? <ClientEditView /> : <Navigate to="/" />} />
//           <Route path="/create-contact" element={isAuthenticated ? <CreateContact /> : <Navigate to="/" />} />
//           <Route path="/Contactlisting" element={isAuthenticated ? <Contactlisting /> : <Navigate to="/" />} />
//           <Route path="/Contact-View" element={isAuthenticated ? <ContactEditView /> : <Navigate to="/" />} />
//           <Route path="/jobtemplate" element={isAuthenticated ? <Jobtemplate /> : <Navigate to="/" />} />
//           <Route path="/template" element={isAuthenticated ? <JobTemplatesPage /> : <Navigate to="/" />} />
//           <Route path="/Users" element={isAuthenticated ? <Users /> : <Navigate to="/" />} />
//             <Route path="/resume-dashboard" element={isAuthenticated ? <ResumeDashboard /> : <Navigate to="/" />} /> 
// <Route 
//   path="/user-management" 
//   element={isAuthenticated && localStorage.getItem('role') === 'admin' ? <UserManagement /> : <Navigate to="/" />} 
// />


//     {/* Bench Sales Routes - All using BenchSales component with different props/params */}
//           <Route path="/bench-sales" element={isAuthenticated ? <BenchSales /> : <Navigate to="/" />} />
//           <Route path="/bench-sales-dashboard" element={isAuthenticated ? <BenchSales view="dashboard" /> : <Navigate to="/" />} />
//           <Route path="/bench-sales-recruiter" element={isAuthenticated ? <BenchSales view="recruiter" /> : <Navigate to="/" />} />
//           <Route path="/bench-candidates" element={isAuthenticated ? <BenchSales view="candidates" /> : <Navigate to="/" />} />
//           <Route path="/bench-requirements" element={isAuthenticated ? <BenchSales view="requirements" /> : <Navigate to="/" />} />
//           <Route path="/bench-submissions" element={isAuthenticated ? <BenchSales view="submissions" /> : <Navigate to="/" />} />
//           <Route path="/bench-external-submission" element={isAuthenticated ? <ExternalSubmission /> : <Navigate to="/" />} />
//           <Route path="/bench-marketing" element={isAuthenticated ? <BenchSales view="marketing" /> : <Navigate to="/" />} />
//           <Route path="/bench-analytics" element={isAuthenticated ? <BenchSales view="analytics" /> : <Navigate to="/" />} />
//           <Route path="/bench-vendors" element={isAuthenticated ? <BenchSales view="vendors" /> : <Navigate to="/" />} />
//           <Route path="/bench-hotlist" element={isAuthenticated ? <BenchSales view="hotlist" /> : <Navigate to="/" />} />


//           {/* Time Sheet Management Routes - RESTRICTED TO ACCOUNT MANAGER ONLY */}
//           <Route 
//             path="/companies" 
//             element={isAuthenticated && isAccountManagerOrAdmin() ? <CompaniesView /> : <Navigate to="/" />} 
//           />
//           <Route 
//             path="/timesheet-management" 
//             element={isAuthenticated && isAccountManagerOrAdmin() ? <TimeSheetManagement /> : <Navigate to="/" />} 
//           />
//            <Route 
//             path="/manager-timesheet" 
//             element={isAuthenticated && isAccountManagerOrAdmin() ? <ManagerTimesheet /> : <Navigate to="/" />} 
//           />
//            <Route 
//             path="/user-details/:employeeId" 
//             element={isAuthenticated && isAccountManagerOrAdmin() ? <UserDetails/> : <Navigate to="/" />} 
//           />
          
//           {/* Settings Route */}
//           <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/" />} />
        

//           {/* Groups Routes */}
//           <Route path="/Newgroup" element={isAuthenticated ? <Newgroup /> : <Navigate to="/" />} />
//           <Route path="/Group" element={isAuthenticated ? <GroupsPage /> : <Navigate to="/" />} />
          
//           {/* Catch-all route */}
//           <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
//         </Routes>
//       </div>
//     </div>
//   );
// };

// export default App;