


// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   LuLayoutDashboard,
//   LuBriefcase,
//   LuSettings,
//   LuLogOut,
//   LuChevronLeft,
//   LuChevronRight,
//    LuUserCheck,

// } from "react-icons/lu";
// import { FaAngleDown, FaAngleUp, FaThumbtack } from "react-icons/fa";
// import "../styles/Sidebar.css";
// import prophecyLogo2 from "../Assets/images/prophecy-logo2.png";
// import prophecyLogo from "../Assets/images/prophecy-logo.png";

// const Sidebar = () => {
//   const [isPinned, setIsPinned] = useState(localStorage.getItem("sidebarPinned") === "true");
//   const [isHovered, setIsHovered] = useState(false);
//   const [openSubmenu, setOpenSubmenu] = useState(null);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [isSidebarVisible, setIsSidebarVisible] = useState(true);
//   const sidebarRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Get user role from localStorage
//   const userRole = localStorage.getItem("role");
//   const isExpanded = isPinned || isHovered || isMobile;

//   // Handle screen resize
//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       if (mobile && isPinned) {
//         setIsSidebarVisible(false);
//       } else {
//         setIsSidebarVisible(true);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [isPinned]);

//   // Save pinned state to localStorage
//   useEffect(() => {
//     localStorage.setItem("sidebarPinned", isPinned);
//   }, [isPinned]);

//   // Handle clicks outside sidebar to close it on mobile
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (isMobile && !isPinned && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         setIsSidebarVisible(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isMobile, isPinned]);

//   // Close sidebar when route changes on mobile
//   useEffect(() => {
//     if (isMobile && !isPinned) {
//       setIsSidebarVisible(false);
//     }
//   }, [location, isMobile, isPinned]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("sidebarPinned");
//     window.location.href = "/";
//   };

//   const toggleSidebar = () => {
//     setIsSidebarVisible(!isSidebarVisible);
//   };

//   const toggleSubmenu = (menu) => {
//     setOpenSubmenu(openSubmenu === menu ? null : menu);
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   // Direct navigation to recruitment dashboard based on user role
//  const handleRecruitmentClick = () => {
//   if (userRole === "manager" || userRole === "admin") {
//     navigate("/recruitment-dashboard");
//   } else if (userRole === "user") {
//     navigate("/recruiter-view");
//   }
// };
//   const recruitmentMenu = [
//     { path: "/resume-dashboard", label: "Resume Submission", icon: <LuUserCheck size={16} /> }
//   ];

//   return (
//     <>
//       {/* Mobile Toggle Button - Outside Sidebar */}
//       {isMobile && (
//         <button
//           className={`sidebar-toggle ${isSidebarVisible ? 'open' : ''}`}
//           onClick={toggleSidebar}
//           aria-label="Toggle sidebar"
//         >
//           {isSidebarVisible ? <LuChevronLeft /> : <LuChevronRight />}
//         </button>
//       )}

//       <div className={`sidebar-overlay ${isMobile && isSidebarVisible ? 'visible' : ''}`} onClick={() => setIsSidebarVisible(false)}></div>

//       <div className="Mainsidebar-container">
//         <div
//           ref={sidebarRef}
//           className={`sidebar ${isExpanded ? "expanded" : "collapsed"} ${isSidebarVisible ? "visible" : "hidden"}`}
//           onMouseEnter={() => !isMobile && !isPinned && setIsHovered(true)}
//           onMouseLeave={() => !isMobile && !isPinned && setIsHovered(false)}
//         >
//           {/* Sidebar Header */}
//           <div className="sidebar-header">
//             <div className="logo-container">
//               <img src={prophecyLogo2} alt="Logo" className="initial-logo" />
//               {isExpanded && <img src={prophecyLogo} alt="Logo" className="logo" />}
//             </div>

//             {/* Pin Button - Only show on desktop */}
//             {isExpanded && !isMobile && (
//               <button className="pin-button" onClick={() => setIsPinned(!isPinned)} aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}>
//                 <FaThumbtack className={`pin-icon ${isPinned ? "pinned" : ""}`} />
//               </button>
//             )}

//             {/* Close Button - Only show on mobile */}
//             {isExpanded && isMobile && (
//               <button className="close-button" onClick={() => setIsSidebarVisible(false)} aria-label="Close sidebar">
//                 <LuChevronLeft />
//               </button>
//             )}
//           </div>

//           {/* Sidebar Menu */}
//           <nav>
//             <ul className="menu">
//               <li className={isActive("/home") ? "active" : ""} onClick={() => navigate("/home")}>
//                 <LuLayoutDashboard className="icon" />
//                 {isExpanded && <span className="menu-text">Dashboard</span>}
//                 {isActive("/home") && <span className="active-indicator"></span>}
//               </li>

//               {/* Recruitment Submenu */}
//               <li
//                 className={`menu-item ${openSubmenu === "recruitment" ? "open" : ""} ${location.pathname.includes("/recruitment") || location.pathname.includes("/recruiter-view") || location.pathname.includes("/resume-dashboard") ? "active" : ""}`}
//                 onClick={() => toggleSubmenu("recruitment")}
//               >
//                 <LuBriefcase className="icon" />
//                 {isExpanded && <span className="menu-text">Recruitment</span>}
//                 {isExpanded && (
//                   <span className="submenu-icon">
//                     {openSubmenu === "recruitment" ? <FaAngleUp /> : <FaAngleDown />}
//                   </span>
//                 )}
//                 {(location.pathname.includes("/recruitment") || location.pathname.includes("/recruiter-view") || location.pathname.includes("/resume-dashboard")) && <span className="active-indicator"></span>}
//               </li>

//               {/* Recruitment Submenu Items */}
//               {isExpanded && openSubmenu === "recruitment" && (
//                 <ul className="submenu">
//                   <li
//                     className={`submenu-item ${(isActive("/recruitment-dashboard") || isActive("/recruiter-view")) ? "active" : ""}`}
//                     onClick={handleRecruitmentClick}
//                   >
//                     <span className="submenu-icon"><LuBriefcase size={16} /></span>
//                     <span className="submenu-text">Recruitment Dashboard</span>
//                     {(isActive("/recruitment-dashboard") || isActive("/recruiter-view")) && <span className="active-indicator"></span>}
//                   </li>
//                   {recruitmentMenu.map((item, index) => (
//                     <li
//                       key={index}
//                       className={`submenu-item ${isActive(item.path) ? "active" : ""}`}
//                       onClick={() => navigate(item.path)}
//                     >
//                       <span className="submenu-icon">{item.icon}</span>
//                       <span className="submenu-text">{item.label}</span>
//                       {isActive(item.path) && <span className="active-indicator"></span>}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </ul>
//           </nav>

//           {/* Settings & Logout */}
//           <div className="settings-section">
//             <ul>
//               <li className={isActive("/settings") ? "active" : ""} onClick={() => navigate("/settings")}>
//                 <LuSettings className="icon" />
//                 {isExpanded && <span className="menu-text">Settings</span>}
//                 {isActive("/settings") && <span className="active-indicator"></span>}
//               </li>
//               <li onClick={handleLogout}>
//                 <LuLogOut className="icon" />
//                 {isExpanded && <span className="menu-text">Log Out</span>}
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;


// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// import {
//   LuLayoutDashboard,
//   LuBriefcase,
//   LuSettings,
//   LuLogOut,
//   LuChevronLeft,
//   LuChevronRight,
//   LuUserCheck,
//   LuUsers,
//   LuFileText,
//   LuChartBar,
//   LuUserPlus,
//   LuSend,
//   LuTarget,
//   LuBarChart,
//   LuStar
// } from "react-icons/lu";
// import { FaAngleDown, FaAngleUp, FaThumbtack } from "react-icons/fa";
// import "../styles/Sidebar.css";
// import prophecyLogo2 from "../Assets/images/prophecy-logo2.png";
// import prophecyLogo from "../Assets/images/prophecy-logo.png";

// const Sidebar = () => {
//   const [isPinned, setIsPinned] = useState(localStorage.getItem("sidebarPinned") === "true");
//   const [isHovered, setIsHovered] = useState(false);
//   const [openSubmenu, setOpenSubmenu] = useState(null);
//   const [openBenchSalesSubmenu, setOpenBenchSalesSubmenu] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [isSidebarVisible, setIsSidebarVisible] = useState(true);
//   const sidebarRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Get user role from localStorage
//   const userRole = localStorage.getItem("role");
//   const isExpanded = isPinned || isHovered || isMobile;

//   // Handle screen resize
//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       if (mobile && isPinned) {
//         setIsSidebarVisible(false);
//       } else {
//         setIsSidebarVisible(true);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [isPinned]);

//   // Save pinned state to localStorage
//   useEffect(() => {
//     localStorage.setItem("sidebarPinned", isPinned);
//   }, [isPinned]);

//   // Handle clicks outside sidebar to close it on mobile
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (isMobile && !isPinned && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         setIsSidebarVisible(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isMobile, isPinned]);

//   // Close sidebar when route changes on mobile
//   useEffect(() => {
//     if (isMobile && !isPinned) {
//       setIsSidebarVisible(false);
//     }
//   }, [location, isMobile, isPinned]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("sidebarPinned");
//     window.location.href = "/";
//   };

//   const toggleSidebar = () => {
//     setIsSidebarVisible(!isSidebarVisible);
//   };

//   const toggleSubmenu = (menu) => {
//     setOpenSubmenu(openSubmenu === menu ? null : menu);
//   };

//   const toggleBenchSalesSubmenu = () => {
//     setOpenBenchSalesSubmenu(!openBenchSalesSubmenu);
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   // Check if current path is recruitment related
//   const isRecruitmentActive = () => {
//     return location.pathname === "/recruitment-dashboard" || 
//            location.pathname === "/recruiter-view" || 
//            location.pathname === "/teamlead-dashboard" ||
//            location.pathname === "/admin-dashboard";
//   };

//   // Direct navigation to recruitment dashboard based on user role
//   const handleRecruitmentClick = () => {
//     if (userRole === "manager" || userRole === "admin") {
//       navigate("/recruitment-dashboard");
//     } else if (userRole === "user" || userRole === "recruiter") {
//       navigate("/recruiter-view");
//     } else if (userRole === "teamlead" || userRole === "team_lead") {
//       navigate("/teamlead-dashboard");
//     } else {
//       // Default fallback for any other roles
//       navigate("/recruitment-dashboard");
//     }
//   };

//   // Direct navigation to bench sales dashboard based on user role
//   const handleBenchSalesClick = () => {
//     if (userRole === "manager" || userRole === "admin") {
//       navigate("/bench-sales-dashboard");
//     } else if (userRole === "user") {
//       navigate("/bench-sales-recruiter");
//     } else if (userRole === "teamlead") {
//       navigate("/bench-sales-dashboard");
//     }
//   };

//   const benchSalesMenu = [
//     { path: "/bench-candidates", label: "Candidate Management", icon: <LuUsers size={16} /> },
//     { path: "/bench-requirements", label: "Requirements", icon: <LuFileText size={16} /> },
//     { path: "/bench-submissions", label: "Submissions", icon: <LuSend size={16} /> },
//     { path: "/bench-vendors", label: "Vendors", icon: <LuUsers size={16} /> },
//     { path: "/bench-marketing", label: "Marketing", icon: <LuTarget size={16} /> },
//     { path: "/bench-hotlist", label: "Hotlist", icon: <LuStar size={16} /> },
//     // { path: "/bench-analytics", label: "Analytics", icon: <LuTrendingUp size={16} /> },
//   ];

//   // Menu items based on user role
//   const getMenuItems = () => {
//     const baseItems = [
//       { 
//         path: "/home", 
//         label: "Dashboard", 
//         icon: <LuLayoutDashboard size={20} />,
//         show: true
//       }
//     ];

//     const recruitmentItem = {
//       label: "Recruitment",
//       icon: <LuBriefcase size={20} />,
//       onClick: handleRecruitmentClick,
//       show: true
//     };

//     const resumeSubmissionItem = {
//       path: "/resume-dashboard", 
//       label: "Resume Submission", 
//       icon: <LuUserCheck size={20} />,
//       show: true
//     };

//     const adminItems = [
//       {
//         label: "User Management",
//         icon: <LuUsers size={20} />,
//         path: "/user-management",
//         show: userRole === "admin"
//       },
//       {
//         label: "Accounting",
//         icon: <LuFileText size={20} />,
//         path: "/accounting",
//         show: userRole === "admin"
//       },
//       {
//         label: "Onboarding",
//         icon: <LuUserPlus size={20} />,
//         path: "/onboarding",
//         show: userRole === "admin"
//       }
//     ];

//     return [
//       ...baseItems,
//       recruitmentItem,
//       resumeSubmissionItem,
//       ...adminItems.filter(item => item.show)
//     ];
//   };

//   const menuItems = getMenuItems();

//   return (
//     <>
//       {/* Mobile Toggle Button - Outside Sidebar */}
//       {isMobile && (
//         <button
//           className={`sidebar-toggle ${isSidebarVisible ? 'open' : ''}`}
//           onClick={toggleSidebar}
//           aria-label="Toggle sidebar"
//         >
//           {isSidebarVisible ? <LuChevronLeft /> : <LuChevronRight />}
//         </button>
//       )}

//       <div className={`sidebar-overlay ${isMobile && isSidebarVisible ? 'visible' : ''}`} onClick={() => setIsSidebarVisible(false)}></div>

//       <div className="Mainsidebar-container">
//         <div
//           ref={sidebarRef}
//           className={`sidebar ${isExpanded ? "expanded" : "collapsed"} ${isSidebarVisible ? "visible" : "hidden"}`}
//           onMouseEnter={() => !isMobile && !isPinned && setIsHovered(true)}
//           onMouseLeave={() => !isMobile && !isPinned && setIsHovered(false)}
//         >
//           {/* Sidebar Header */}
//           <div className="sidebar-header">
//             <div className="logo-container">
//               <img src={prophecyLogo2} alt="Logo" className="initial-logo" />
//               {isExpanded && <img src={prophecyLogo} alt="Logo" className="logo" />}
//             </div>

//             {/* Pin Button - Only show on desktop */}
//             {isExpanded && !isMobile && (
//               <button className="pin-button" onClick={() => setIsPinned(!isPinned)} aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}>
//                 <FaThumbtack className={`pin-icon ${isPinned ? "pinned" : ""}`} />
//               </button>
//             )}

//             {/* Close Button - Only show on mobile */}
//             {isExpanded && isMobile && (
//               <button className="close-button" onClick={() => setIsSidebarVisible(false)} aria-label="Close sidebar">
//                 <LuChevronLeft />
//               </button>
//             )}
//           </div>

//           {/* Sidebar Menu */}
//           <nav>
//             <ul className="menu">
//               {menuItems.map((item, index) => {
//                 if (item.submenu) {
//                   return (
//                     <React.Fragment key={index}>
//                       <li
//                         className={`menu-item ${openSubmenu === item.label ? "open" : ""} ${item.submenu.some(subItem => isActive(subItem.path)) ? "active" : ""}`}
//                         onClick={() => toggleSubmenu(item.label)}
//                       >
//                         {item.icon}
//                         {isExpanded && <span className="menu-text">{item.label}</span>}
//                         {isExpanded && item.submenu && (
//                           <span className="submenu-icon">
//                             {openSubmenu === item.label ? <FaAngleUp /> : <FaAngleDown />}
//                           </span>
//                         )}
//                         {item.submenu.some(subItem => isActive(subItem.path)) && <span className="active-indicator"></span>}
//                       </li>

//                       {isExpanded && openSubmenu === item.label && (
//                         <ul className="submenu">
//                           {item.submenu.filter(subItem => subItem.show !== false).map((subItem, subIndex) => (
//                             <li
//                               key={subIndex}
//                               className={`submenu-item ${isActive(subItem.path) ? "active" : ""}`}
//                               onClick={subItem.onClick ? subItem.onClick : () => navigate(subItem.path)}
//                             >
//                               <span className="submenu-icon">{subItem.icon}</span>
//                               <span className="submenu-text">{subItem.label}</span>
//                               {isActive(subItem.path) && <span className="active-indicator"></span>}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </React.Fragment>
//                   );
//                 } else {
//                   return (
//                     <li
//                       key={index}
//                       className={`menu-item ${item.onClick && isRecruitmentActive() ? "active" : isActive(item.path) ? "active" : ""}`}
//                       onClick={item.onClick ? item.onClick : () => navigate(item.path)}
//                     >
//                       {item.icon}
//                       {isExpanded && <span className="menu-text">{item.label}</span>}
//                       {(item.onClick && isRecruitmentActive()) || isActive(item.path) ? <span className="active-indicator"></span> : null}
//                     </li>
//                   );
//                 }
//               })}

//               {/* Bench Sales Submenu */}
//               <li
//                 className={`menu-item ${openBenchSalesSubmenu ? "open" : ""} ${location.pathname.includes("/bench-") || location.pathname === "/bench-sales" ? "active" : ""}`}
//                 onClick={toggleBenchSalesSubmenu}
//               >
//                 <LuChartBar size={20} />
//                 {isExpanded && <span className="menu-text">Bench Sales</span>}
//                 {isExpanded && (
//                   <span className="submenu-icon">
//                     {openBenchSalesSubmenu ? <FaAngleUp /> : <FaAngleDown />}
//                   </span>
//                 )}
//                 {(location.pathname.includes("/bench-") || location.pathname === "/bench-sales") && <span className="active-indicator"></span>}
//               </li>
              
//               {/* Bench Sales Submenu Items */}
//               {isExpanded && openBenchSalesSubmenu && (
//                 <ul className="submenu">
//                   <li
//                     className={`submenu-item ${(isActive("/bench-sales-dashboard") || isActive("/bench-sales-recruiter")) ? "active" : ""}`}
//                     onClick={handleBenchSalesClick}
//                   >
//                     <span className="submenu-icon"><LuLayoutDashboard size={16} /></span>
//                     <span className="submenu-text">Bench Sales Dashboard</span>
//                     {(isActive("/bench-sales-dashboard") || isActive("/bench-sales-recruiter")) && <span className="active-indicator"></span>}
//                   </li>
//                   {benchSalesMenu.map((item, index) => (
//                     <li
//                       key={index}
//                       className={`submenu-item ${isActive(item.path) ? "active" : ""}`}
//                       onClick={(e) => {
//                         e.preventDefault();
//                         e.stopPropagation();
//                         console.log('Navigating to:', item.path);
//                         navigate(item.path);
//                       }}
//                     >
//                       <span className="submenu-icon">{item.icon}</span>
//                       <span className="submenu-text">{item.label}</span>
//                       {isActive(item.path) && <span className="active-indicator"></span>}
//                     </li>
//                   ))}
//                 </ul>
//               )}
//             </ul>
//           </nav>

//           {/* Settings & Logout */}
//           <div className="settings-section">
//             <ul>
//               <li className={isActive("/settings") ? "active" : ""} onClick={() => navigate("/settings")}>
//                 <LuSettings size={20} />
//                 {isExpanded && <span className="menu-text">Settings</span>}
//                 {isActive("/settings") && <span className="active-indicator"></span>}
//               </li>
//               <li onClick={handleLogout}>
//                 <LuLogOut size={20} />
//                 {isExpanded && <span className="menu-text">Log Out</span>}
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;






// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";

// import {
//   LuLayoutDashboard,
//   LuBriefcase,
//   LuSettings,
//   LuLogOut,
//   LuChevronLeft,
//   LuChevronRight,
//   LuUserCheck,
//   LuUsers,
//   LuFileText,
//   LuChartBar,
//   LuUserPlus,
//   LuSend,
//   LuTarget,
//   LuStar,
//   LuCalendar,
//   LuClock,
//   LuTrendingUp  // Added this missing import
// } from "react-icons/lu";
// import { FaAngleDown, FaAngleUp, FaThumbtack } from "react-icons/fa";
// import "../styles/Sidebar.css";
// import prophecyLogo2 from "../Assets/images/prophecy-logo2.png";
// import prophecyLogo from "../Assets/images/prophecy-logo.png";

// const Sidebar = () => {
//   const [isPinned, setIsPinned] = useState(localStorage.getItem("sidebarPinned") === "true");
//   const [isHovered, setIsHovered] = useState(false);
//   const [openSubmenu, setOpenSubmenu] = useState(null);
//   const [openBenchSalesSubmenu, setOpenBenchSalesSubmenu] = useState(false);
//   const [openTimeSheetSubmenu, setOpenTimeSheetSubmenu] = useState(false); // Added this missing state
//   const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
//   const [isSidebarVisible, setIsSidebarVisible] = useState(true);
//   const sidebarRef = useRef(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Get user role from localStorage
//   const userRole = localStorage.getItem("role");
//   const isExpanded = isPinned || isHovered || isMobile;

//   // Handle screen resize
//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth <= 768;
//       setIsMobile(mobile);
//       if (mobile && isPinned) {
//         setIsSidebarVisible(false);
//       } else {
//         setIsSidebarVisible(true);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, [isPinned]);

//   // Save pinned state to localStorage
//   useEffect(() => {
//     localStorage.setItem("sidebarPinned", isPinned);
//   }, [isPinned]);

//   // Handle clicks outside sidebar to close it on mobile
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (isMobile && !isPinned && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         setIsSidebarVisible(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [isMobile, isPinned]);

//   // Close sidebar when route changes on mobile
//   useEffect(() => {
//     if (isMobile && !isPinned) {
//       setIsSidebarVisible(false);
//     }
//   }, [location, isMobile, isPinned]);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("sidebarPinned");
//     window.location.href = "/";
//   };

//   const toggleSidebar = () => {
//     setIsSidebarVisible(!isSidebarVisible);
//   };

//   const toggleSubmenu = (menu) => {
//     setOpenSubmenu(openSubmenu === menu ? null : menu);
//   };

//   const toggleBenchSalesSubmenu = () => {
//     setOpenBenchSalesSubmenu(!openBenchSalesSubmenu);
//   };

//   // Added this missing function
//   const toggleTimeSheetSubmenu = () => {
//     setOpenTimeSheetSubmenu(!openTimeSheetSubmenu);
//   };

//   const isActive = (path) => {
//     return location.pathname === path;
//   };

//   // Direct navigation to recruitment dashboard based on user role
//   const handleRecruitmentClick = () => {
//     if (userRole === "manager" || userRole === "admin") {
//       navigate("/recruitment-dashboard");
//     } else if (userRole === "user") {
//       navigate("/recruiter-view");
//     } else if (userRole === "teamlead") {
//       navigate("/teamlead-dashboard");
//     }
//   };

//   // Direct navigation to bench sales dashboard based on user role
//   const handleBenchSalesClick = () => {
//     if (userRole === "manager" || userRole === "admin") {
//       navigate("/bench-sales-dashboard");
//     } else if (userRole === "user") {
//       navigate("/bench-sales-recruiter");
//     } else if (userRole === "teamlead") {
//       navigate("/bench-sales-dashboard");
//     }
//   };

//   const benchSalesMenu = [
//     { path: "/bench-candidates", label: "Candidate Management", icon: <LuUsers size={16} /> },
//     { path: "/bench-requirements", label: "Requirements", icon: <LuFileText size={16} /> },
//     { path: "/bench-submissions", label: "Submissions", icon: <LuSend size={16} /> },
//     { path: "/bench-vendors", label: "Vendors", icon: <LuUsers size={16} /> },
//     { path: "/bench-marketing", label: "Marketing", icon: <LuTarget size={16} /> },
//     { path: "/bench-hotlist", label: "Hotlist", icon: <LuStar size={16} /> },
//     // { path: "/bench-analytics", label: "Analytics", icon: <LuTrendingUp size={16} /> },
//   ];

//   // Added this missing menu definition
//   const timeSheetMenu = [
//     { path: "/companies", label: "Companies", icon: <LuTrendingUp size={16} /> },
//     // { path: "/timesheet-management", label: "Employee Timesheet", icon: <LuClock size={16} /> },
//     // { path: "/manager-timesheet", label: "Manager View", icon: <LuCalendar size={16} /> },
//   ];

//   // Menu items based on user role
//   const getMenuItems = () => {
//     const baseItems = [
//       { 
//         path: "/home", 
//         label: "Dashboard", 
//         icon: <LuLayoutDashboard size={16} />,
//         show: true
//       }
//     ];

//     const recruitmentItems = {
//       label: "Recruitment",
//       icon: <LuBriefcase size={16} />,
//       submenu: [
//         { 
//           path: "/recruitment-dashboard", 
//           label: "Recruitment Dashboard", 
//           icon: <LuBriefcase size={16} />,
//           onClick: handleRecruitmentClick,
//           show: true
//         },
//         { 
//           path: "/resume-dashboard", 
//           label: "Resume Submission", 
//           icon: <LuUserCheck size={16} />,
//           show: true
//         }
//       ],
//       show: true
//     };

//     // Updated to include Bench Sales and Accounting in the main menu structure
//     const benchSalesItems = {
//       label: "Bench Sales",
//       icon: <LuChartBar size={16} />,
//       submenu: [
//         {
//           path: "/bench-sales-dashboard",
//           label: "Bench Sales Dashboard",
//           icon: <LuLayoutDashboard size={16} />,
//           onClick: handleBenchSalesClick,
//           show: true
//         },
//         ...benchSalesMenu
//       ],
//       show: true
//     };

//     const accountingItems = {
//       label: "Accounting",
//       icon: <LuCalendar size={16} />,
//       path: "/companies",
//       show: true
//     };

//     const adminItems = [
//       {
//         label: "User Management",
//         icon: <LuUsers size={16} />,
//         path: "/user-management",
//         show: userRole === "admin"
//       },
//       {
//         label: "Onboarding",
//         icon: <LuUserPlus size={16} />,
//         path: "/onboarding",
//         show: userRole === "admin"
//       }
//     ];

//     return [
//       ...baseItems,
//       recruitmentItems,
//       benchSalesItems,
//       accountingItems,
//       ...adminItems.filter(item => item.show)
//     ];
//   };

//   const menuItems = getMenuItems();

//   return (
//     <>
//       {/* Mobile Toggle Button - Outside Sidebar */}
//       {isMobile && (
//         <button
//           className={`sidebar-toggle ${isSidebarVisible ? 'open' : ''}`}
//           onClick={toggleSidebar}
//           aria-label="Toggle sidebar"
//         >
//           {isSidebarVisible ? <LuChevronLeft /> : <LuChevronRight />}
//         </button>
//       )}

//       <div className={`sidebar-overlay ${isMobile && isSidebarVisible ? 'visible' : ''}`} onClick={() => setIsSidebarVisible(false)}></div>

//       <div className="Mainsidebar-container">
//         <div
//           ref={sidebarRef}
//           className={`sidebar ${isExpanded ? "expanded" : "collapsed"} ${isSidebarVisible ? "visible" : "hidden"}`}
//           onMouseEnter={() => !isMobile && !isPinned && setIsHovered(true)}
//           onMouseLeave={() => !isMobile && !isPinned && setIsHovered(false)}
//         >
//           {/* Sidebar Header */}
//           <div className="sidebar-header">
//             <div className="logo-container">
//               <img src={prophecyLogo2} alt="Logo" className="initial-logo" />
//               {isExpanded && <img src={prophecyLogo} alt="Logo" className="logo" />}
//             </div>

//             {/* Pin Button - Only show on desktop */}
//             {isExpanded && !isMobile && (
//               <button className="pin-button" onClick={() => setIsPinned(!isPinned)} aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}>
//                 <FaThumbtack className={`pin-icon ${isPinned ? "pinned" : ""}`} />
//               </button>
//             )}

//             {/* Close Button - Only show on mobile */}
//             {isExpanded && isMobile && (
//               <button className="close-button" onClick={() => setIsSidebarVisible(false)} aria-label="Close sidebar">
//                 <LuChevronLeft />
//               </button>
//             )}
//           </div>

//           {/* Sidebar Menu */}
//           <nav>
//             <ul className="menu">
//               {menuItems.map((item, index) => {
//                 if (item.submenu) {
//                   return (
//                     <React.Fragment key={index}>
//                       <li
//                         className={`menu-item ${openSubmenu === item.label ? "open" : ""} ${item.submenu.some(subItem => isActive(subItem.path)) ? "active" : ""}`}
//                         onClick={() => toggleSubmenu(item.label)}
//                       >
//                         <span className="icon">{item.icon}</span>
//                         {isExpanded && <span className="menu-text">{item.label}</span>}
//                         {isExpanded && item.submenu && (
//                           <span className="submenu-icon">
//                             {openSubmenu === item.label ? <FaAngleUp /> : <FaAngleDown />}
//                           </span>
//                         )}
//                         {item.submenu.some(subItem => isActive(subItem.path)) && <span className="active-indicator"></span>}
//                       </li>

//                       {isExpanded && openSubmenu === item.label && (
//                         <ul className="submenu">
//                           {item.submenu.filter(subItem => subItem.show !== false).map((subItem, subIndex) => (
//                             <li
//                               key={subIndex}
//                               className={`submenu-item ${isActive(subItem.path) ? "active" : ""}`}
//                               onClick={subItem.onClick ? subItem.onClick : () => navigate(subItem.path)}
//                             >
//                               <span className="submenu-icon">{subItem.icon}</span>
//                               <span className="submenu-text">{subItem.label}</span>
//                               {isActive(subItem.path) && <span className="active-indicator"></span>}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
//                     </React.Fragment>
//                   );
//                 } else {
//                   return (
//                     <li
//                       key={index}
//                       className={isActive(item.path) ? "active" : ""}
//                       onClick={() => navigate(item.path)}
//                     >
//                       <span className="icon">{item.icon}</span>
//                       {isExpanded && <span className="menu-text">{item.label}</span>}
//                       {isActive(item.path) && <span className="active-indicator"></span>}
//                     </li>
//                   );
//                 }
//               })}
//             </ul>
//           </nav>

//           {/* Settings & Logout */}
//           <div className="settings-section">
//             <ul>
//               <li className={isActive("/settings") ? "active" : ""} onClick={() => navigate("/settings")}>
//                 <span className="icon"><LuSettings /></span>
//                 {isExpanded && <span className="menu-text">Settings</span>}
//                 {isActive("/settings") && <span className="active-indicator"></span>}
//               </li>
//               <li onClick={handleLogout}>
//                 <span className="icon"><LuLogOut /></span>
//                 {isExpanded && <span className="menu-text">Log Out</span>}
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Sidebar;






// 






import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  LuLayoutDashboard,
  LuBriefcase,
  LuSettings,
  LuLogOut,
  LuChevronLeft,
  LuChevronRight,
  LuUserCheck,
  LuUsers,
  LuFileText,
  LuChartBar,
  LuUserPlus,
  LuSend,
  LuTarget,
  LuBarChart,
  LuStar,
  LuClock 
} from "react-icons/lu";
import { FaAngleDown, FaAngleUp, FaThumbtack } from "react-icons/fa";
import "../styles/Sidebar.css";
import prophecyLogo2 from "../Assets/images/prophecy-logo2.png";
import prophecyLogo from "../Assets/images/prophecy-logo.png";

const Sidebar = () => {
  const [isPinned, setIsPinned] = useState(localStorage.getItem("sidebarPinned") === "true");
  const [isHovered, setIsHovered] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const [openBenchSalesSubmenu, setOpenBenchSalesSubmenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user role from localStorage
  const userRole = localStorage.getItem("role");
  const isExpanded = isPinned || isHovered || isMobile;

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile && isPinned) {
        setIsSidebarVisible(false);
      } else {
        setIsSidebarVisible(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isPinned]);

  // Save pinned state to localStorage
  useEffect(() => {
    localStorage.setItem("sidebarPinned", isPinned);
  }, [isPinned]);

  // Handle clicks outside sidebar to close it on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && !isPinned && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isPinned]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile && !isPinned) {
      setIsSidebarVisible(false);
    }
  }, [location, isMobile, isPinned]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("sidebarPinned");
    window.location.href = "/";
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const toggleSubmenu = (menu) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const toggleBenchSalesSubmenu = () => {
    setOpenBenchSalesSubmenu(!openBenchSalesSubmenu);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Check if current path is recruitment related
  const isRecruitmentActive = () => {
    return location.pathname === "/recruitment-dashboard" || 
           location.pathname === "/recruiter-view" || 
           location.pathname === "/teamlead-dashboard" ||
           location.pathname === "/admin-dashboard";
  };

  // Direct navigation to recruitment dashboard based on user role
  const handleRecruitmentClick = () => {
    if (userRole === "manager" || userRole === "admin") {
      navigate("/recruitment-dashboard");
    } else if (userRole === "user" || userRole === "recruiter") {
      navigate("/recruiter-view");
    } else if (userRole === "teamlead" || userRole === "team_lead") {
      navigate("/teamlead-dashboard");
    } else {
      // Default fallback for any other roles
      navigate("/recruitment-dashboard");
    }
  };

  // Direct navigation to bench sales dashboard based on user role
  const handleBenchSalesClick = () => {
    if (userRole === "manager" || userRole === "admin") {
      navigate("/bench-sales-dashboard");
    } else if (userRole === "user") {
      navigate("/bench-sales-recruiter");
    } else if (userRole === "teamlead") {
      navigate("/bench-sales-dashboard");
    }
  };

  const benchSalesMenu = [
    { path: "/bench-candidates", label: "Candidate Management", icon: <LuUsers size={16} /> },
    { path: "/bench-requirements", label: "Requirements", icon: <LuFileText size={16} /> },
    { path: "/bench-submissions", label: "Submissions", icon: <LuSend size={16} /> },
    { path: "/bench-vendors", label: "Vendors", icon: <LuUsers size={16} /> },
    { path: "/bench-marketing", label: "Marketing", icon: <LuTarget size={16} /> },
    { path: "/bench-hotlist", label: "Hotlist", icon: <LuStar size={16} /> },
    // { path: "/bench-analytics", label: "Analytics", icon: <LuTrendingUp size={16} /> },
  ];

  // Menu items based on user role
  const getMenuItems = () => {
    // If user is employee, show only Dashboard, Accounts, and Timesheets
    if (userRole === "employee") {
      return [
        { 
          path: "/home", 
          label: "Dashboard", 
          icon: <LuLayoutDashboard size={20} />,
          show: true
        },
        {
          label: "Accounts",
          icon: <LuFileText size={20} />,
          path: "/accounts",
          show: true
        },
        {
          label: "Timesheets",
          icon: <LuClock size={20} />,
          path: "/timesheets",
          show: true
        }
      ];
    }

    // For all other roles, show the full menu
    const baseItems = [
      { 
        path: "/home", 
        label: "Dashboard", 
        icon: <LuLayoutDashboard size={20} />,
        show: true
      }
    ];

    const recruitmentItem = {
      label: "Recruitment",
      icon: <LuBriefcase size={20} />,
      onClick: handleRecruitmentClick,
      show: true
    };

    const resumeSubmissionItem = {
      path: "/resume-dashboard", 
      label: "Resume Submission", 
      icon: <LuUserCheck size={20} />,
      show: true
    };

    const adminItems = [
      {
        label: "User Management",
        icon: <LuUsers size={20} />,
        path: "/user-management",
        show: userRole === "admin"
      },
      {
        label: "Accounting",
        icon: <LuFileText size={20} />,
        path: "/companies",
        show: userRole === "admin"
      },
      {
        label: "Onboarding",
        icon: <LuUserPlus size={20} />,
        path: "/onboarding",
        show: userRole === "admin"
      }
    ];

    return [
      ...baseItems,
      recruitmentItem,
      resumeSubmissionItem,
      ...adminItems.filter(item => item.show)
    ];
  };

  const menuItems = getMenuItems();

  // Check if Bench Sales should be shown
  const shouldShowBenchSales = userRole !== "employee";

  return (
    <>
      {/* Mobile Toggle Button - Outside Sidebar */}
      {isMobile && (
        <button
          className={`sidebar-toggle ${isSidebarVisible ? 'open' : ''}`}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isSidebarVisible ? <LuChevronLeft /> : <LuChevronRight />}
        </button>
      )}

      <div className={`sidebar-overlay ${isMobile && isSidebarVisible ? 'visible' : ''}`} onClick={() => setIsSidebarVisible(false)}></div>

      <div className="Mainsidebar-container">
        <div
          ref={sidebarRef}
          className={`sidebar ${isExpanded ? "expanded" : "collapsed"} ${isSidebarVisible ? "visible" : "hidden"}`}
          onMouseEnter={() => !isMobile && !isPinned && setIsHovered(true)}
          onMouseLeave={() => !isMobile && !isPinned && setIsHovered(false)}
        >
          {/* Sidebar Header */}
          <div className="sidebar-header">
            <div className="logo-container">
              <img src={prophecyLogo2} alt="Logo" className="initial-logo" />
              {isExpanded && <img src={prophecyLogo} alt="Logo" className="logo" />}
            </div>

            {/* Pin Button - Only show on desktop */}
            {isExpanded && !isMobile && (
              <button className="pin-button" onClick={() => setIsPinned(!isPinned)} aria-label={isPinned ? "Unpin sidebar" : "Pin sidebar"}>
                <FaThumbtack className={`pin-icon ${isPinned ? "pinned" : ""}`} />
              </button>
            )}

            {/* Close Button - Only show on mobile */}
            {isExpanded && isMobile && (
              <button className="close-button" onClick={() => setIsSidebarVisible(false)} aria-label="Close sidebar">
                <LuChevronLeft />
              </button>
            )}
          </div>

          {/* Sidebar Menu */}
          <nav>
            <ul className="menu">
              {menuItems.map((item, index) => {
                if (item.submenu) {
                  return (
                    <React.Fragment key={index}>
                      <li
                        className={`menu-item ${openSubmenu === item.label ? "open" : ""} ${item.submenu.some(subItem => isActive(subItem.path)) ? "active" : ""}`}
                        onClick={() => toggleSubmenu(item.label)}
                      >
                        {item.icon}
                        {isExpanded && <span className="menu-text">{item.label}</span>}
                        {isExpanded && item.submenu && (
                          <span className="submenu-icon">
                            {openSubmenu === item.label ? <FaAngleUp /> : <FaAngleDown />}
                          </span>
                        )}
                        {item.submenu.some(subItem => isActive(subItem.path)) && <span className="active-indicator"></span>}
                      </li>

                      {isExpanded && openSubmenu === item.label && (
                        <ul className="submenu">
                          {item.submenu.filter(subItem => subItem.show !== false).map((subItem, subIndex) => (
                            <li
                              key={subIndex}
                              className={`submenu-item ${isActive(subItem.path) ? "active" : ""}`}
                              onClick={subItem.onClick ? subItem.onClick : () => navigate(subItem.path)}
                            >
                              <span className="submenu-icon">{subItem.icon}</span>
                              <span className="submenu-text">{subItem.label}</span>
                              {isActive(subItem.path) && <span className="active-indicator"></span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </React.Fragment>
                  );
                } else {
                  return (
                    <li
                      key={index}
                      className={`menu-item ${item.onClick && isRecruitmentActive() ? "active" : isActive(item.path) ? "active" : ""}`}
                      onClick={item.onClick ? item.onClick : () => navigate(item.path)}
                    >
                      {item.icon}
                      {isExpanded && <span className="menu-text">{item.label}</span>}
                      {(item.onClick && isRecruitmentActive()) || isActive(item.path) ? <span className="active-indicator"></span> : null}
                    </li>
                  );
                }
              })}

              {/* Bench Sales Submenu - Only show if user is not employee */}
              {shouldShowBenchSales && (
                <li
                  className={`menu-item ${openBenchSalesSubmenu ? "open" : ""} ${location.pathname.includes("/bench-") || location.pathname === "/bench-sales" ? "active" : ""}`}
                  onClick={toggleBenchSalesSubmenu}
                >
                  <LuChartBar size={20} />
                  {isExpanded && <span className="menu-text">Bench Sales</span>}
                  {isExpanded && (
                    <span className="submenu-icon">
                      {openBenchSalesSubmenu ? <FaAngleUp /> : <FaAngleDown />}
                    </span>
                  )}
                  {(location.pathname.includes("/bench-") || location.pathname === "/bench-sales") && <span className="active-indicator"></span>}
                </li>
              )}
              
              {/* Bench Sales Submenu Items - Only show if user is not employee */}
              {shouldShowBenchSales && isExpanded && openBenchSalesSubmenu && (
                <ul className="submenu">
                  <li
                    className={`submenu-item ${isActive("/bench-sales-dashboard") || isActive("/bench-sales-recruiter") ? "active" : ""}`}
                    onClick={handleBenchSalesClick}
                  >
                    <span className="submenu-icon"><LuLayoutDashboard size={16} /></span>
                    <span className="submenu-text">Bench Sales Dashboard</span>
                    {(isActive("/bench-sales-dashboard") || isActive("/bench-sales-recruiter")) && <span className="active-indicator"></span>}
                  </li>
                  {benchSalesMenu.map((item, index) => (
                    <li
                      key={index}
                      className={`submenu-item ${isActive(item.path) ? "active" : ""}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Navigating to:', item.path);
                        navigate(item.path);
                      }}
                    >
                      <span className="submenu-icon">{item.icon}</span>
                      <span className="submenu-text">{item.label}</span>
                      {isActive(item.path) && <span className="active-indicator"></span>}
                    </li>
                  ))}
                </ul>
              )}
            </ul>
          </nav>

          {/* Settings & Logout */}
          <div className="settings-section">
            <ul>
              <li className={isActive("/settings") ? "active" : ""} onClick={() => navigate("/settings")}>
                <LuSettings size={20} />
                {isExpanded && <span className="menu-text">Settings</span>}
                {isActive("/settings") && <span className="active-indicator"></span>}
              </li>
              <li onClick={handleLogout}>
                <LuLogOut size={20} />
                {isExpanded && <span className="menu-text">Log Out</span>}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;