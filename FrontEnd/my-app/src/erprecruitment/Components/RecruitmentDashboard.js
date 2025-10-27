import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BASE_URL from '../../url';
import '../styles/erprecruitment.css';

import {
  countriesData,
  stateMapping,
  getCountryCode,
  getCountryName,
  getStateCode,
  getStateName,
  getStatesForCountry,
  getStatesByCountryName,
  formatLocation
} from '../config/locationConfig';

const RecruitmentDashboard = () => {
  // State for API data
  const [rolesData, setRolesData] = useState([]);
  const [applicationsData, setApplicationsData] = useState({});
  const [recruiters, setRecruiters] = useState([]);
  const [hiringSteps, setHiringSteps] = useState([]);
  const [clients, setClients] = useState([
    "Tech Corp",
    "StartupXYZ",
    "Enterprise Ltd",
    "Design Studio",
    "Analytics Pro",
    "Tech Solutions",
    "Product Inc"
  ]);

  const [clientPOCs, setClientPOCs] = useState([
    "vasanth",
    "Emily Davis",
    "John Smith",
    "Michael Brown",
    "Sarah Johnson"
  ]);

  const experienceLevels = [
    "Junior (0-2 years)",
    "Medium(2-5 years)",
    "Senior (5-8 years)",
    "Expert (8+ years)"
  ];


  const [roleTitles, setRoleTitles] = useState([
    "Senior Frontend Developer",
    "Full Stack Developer",
    "Backend Engineer",
    "DevOps Engineer",
    "Data Scientist",
    "UX/UI Designer",
    "Product Manager",
    "Project Manager",
    "Quality Assurance Engineer",
    "Business Analyst",
    "Technical Lead",
    "Software Architect",
    "Mobile Developer",
    "Cloud Engineer",
    "Machine Learning Engineer"
  ]);
  // UI state
  const [filteredRoles, setFilteredRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showHiringProcess, setShowHiringProcess] = useState({});
  const [notification, setNotification] = useState(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showJobDescriptionModal, setShowJobDescriptionModal] = useState(false);
  const [showSpecialNotesModal, setShowSpecialNotesModal] = useState(false);
  const [showResumeSubmissionModal, setShowResumeSubmissionModal] = useState(false);
  const [currentFileType, setCurrentFileType] = useState('');

  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);

const [stateSearchTerm, setStateSearchTerm] = useState('');

// Add these state variables near your other state declarations
const [showReportColumnModal, setShowReportColumnModal] = useState(false);
const [selectedReportPeriod, setSelectedReportPeriod] = useState('');
const [reportColumns, setReportColumns] = useState([
  { id: 'roleId', label: 'Role ID', visible: true },
  { id: 'jobId', label: 'Job ID', visible: true },
  { id: 'systemId', label: 'System ID', visible: true },
  { id: 'role', label: 'Role Name', visible: true },
  { id: 'roleType', label: 'Role Type', visible: true },
  { id: 'client', label: 'Client', visible: true },
  { id: 'clientPOC', label: 'Client POC', visible: true },
  { id: 'location', label: 'Location', visible: true }, // NEW: Single location column
  { id: 'roleLocation', label: 'Work Mode', visible: true },
  { id: 'experience', label: 'Experience', visible: true },
  { id: 'urgency', label: 'Urgency', visible: true },
  { id: 'status', label: 'Role Status', visible: true },
  { id: 'assignTo', label: 'Role Owner', visible: true },
  { id: 'currency', label: 'Currency', visible: true },
  { id: 'minRate', label: 'Min Rate', visible: true },
  { id: 'maxRate', label: 'Max Rate', visible: true },
  { id: 'startDate', label: 'Start Date', visible: true },
  { id: 'endDate', label: 'End Date', visible: true },
  { id: 'profilesNeeded', label: 'Profiles Needed', visible: true },
  { id: 'createdAt', label: 'Role Created At', visible: true },
  { id: 'createdBy', label: 'Created By', visible: true },
  { id: 'visaTypes', label: 'Visa Types', visible: true },
  { id: 'gbamsId', label: 'GBAMS ID', visible: true },
  { id: 'totalApplications', label: 'Total Applications', visible: true },
  { id: 'appliedCount', label: 'Applied Count', visible: true },
  { id: 'hiredCount', label: 'Hired Count', visible: true },
  { id: 'interviewsCount', label: 'Interviews Count', visible: true },
  { id: 'assignedRecruiters', label: 'Assigned Recruiters', visible: true },
  { id: 'applicationId', label: 'Application ID', visible: true },
  { id: 'candidateName', label: 'Candidate Name', visible: true },
  { id: 'candidateEmail', label: 'Candidate Email', visible: true },
  { id: 'candidatePhone', label: 'Candidate Phone', visible: true },
  { id: 'candidateExperience', label: 'Candidate Experience', visible: true },
  { id: 'currentCompany', label: 'Current Company', visible: true },
  { id: 'expectedSalary', label: 'Expected Salary', visible: true },
  { id: 'candidateLocation', label: 'Candidate Location', visible: true },
  { id: 'applicationStatus', label: 'Application Status', visible: true },
  { id: 'appliedAt', label: 'Applied At', visible: true },
  { id: 'submittedBy', label: 'Submitted By', visible: true },
  { id: 'resumeCount', label: 'Resume Count', visible: true }
]);

  const [showEditApplicationModal, setShowEditApplicationModal] = useState(false);
  const [applicationToEdit, setApplicationToEdit] = useState(null);
  const [editApplicationData, setEditApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    currentCompany: '',
    expectedSalary: '',
    noticePeriod: '',
    location: '',
    skills: '',
    resumeFile: null, // Add this
    resumeFileName: '' // Add this
  });

  const [showDeleteApplicationModal, setShowDeleteApplicationModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);

  // NEW: Edit and Delete Modal States
  const [showEditRoleModal, setShowEditRoleModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState(null);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Resume popup state
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [currentResumeUrl, setCurrentResumeUrl] = useState('');
  const [currentCandidateName, setCurrentCandidateName] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);
const [newRole, setNewRole] = useState({
  jobId: '',
  gbamsId: '',
  systemId: 'Auto Generated',
  role: '',
  roleType: 'Full-time',
  country: '',
  state: '',
  city: '',
  currency: 'INR',
  minRate: '',
  maxRate: '',
  client: '',
  clientPOC: '',
  roleLocation: 'Onsite',
  experience: '',
  urgency: 'Normal',
  status: 'Active',
  assignTo: '',
  assignedRecruiters: [],
  recruiterLead: null,
  recruiter: null,
  effectiveFrom: new Date().toISOString().split('T')[0],
  startDate: '',
  endDate: '',
  profilesNeeded: 1,
  expensePaid: false,
  specialNotes: '',
  createdBy: 'Manager1',
  jobDescription: '',
  visaTypes: [] // ADD THIS LINE
});




const visaTypesOptions = [
  "H-1B",
  "L-1",
  "F-1",
  "OPT",
  "CPT",
  "Green Card",
  "Citizen",
  "TN Visa",
  "E-3",
  "O-1",
  "B-1/B-2",
  "J-1",
  "H-4",
  "L-2",
  "Other"
];

  // Resume submission state
  const [resumeSubmission, setResumeSubmission] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    currentCompany: '',
    expectedSalary: '',
    noticePeriod: '',
    location: '',
    skills: '',
    resumeFile: null,
  });

 const [countries] = useState(countriesData);

  const [states, setStates] = useState([]);
  const [selectedStates, setSelectedStates] = useState([]);
const [selectedCities, setSelectedCities] = useState([]);
const [cityInput, setCityInput] = useState('');



  // ✅ KEEP this one - Define at component level
const formatCurrency = (amount, currencyCode) => {
  const symbols = {
    'INR': '₹',
    'USD': '$', 
    'EUR': '€',
    'GBP': '£'
  };
  const symbol = symbols[currencyCode] || currencyCode;
  return `${symbol}${amount?.toLocaleString() || 0}`;
};

  // Get current view from URL - Updated to use localStorage role

  const userRole = localStorage.getItem('role');
  const isManagerView = userRole === 'manager' || userRole === 'admin';
  const isTeamLeadView = userRole === 'teamlead';
  const isRecruiterView = userRole === 'user';

const openEditRoleModal = (role, e) => {
  e.stopPropagation();
  setRoleToEdit(role);
  setIsEditMode(true);

  // Parse visa types from string to array
  let visaTypesArray = [];
  if (role.visaTypes) {
    if (typeof role.visaTypes === 'string') {
      visaTypesArray = role.visaTypes.split(',').map(item => item.trim()).filter(item => item);
    } else if (Array.isArray(role.visaTypes)) {
      visaTypesArray = role.visaTypes;
    }
  }

 // Parse states and cities from existing role
  let statesArray = [];
  let citiesArray = [];
  
  if (role.state) {
    statesArray = typeof role.state === 'string' ? 
      role.state.split(',').map(item => item.trim()).filter(item => item) : 
      role.state;
  }
  
  if (role.city) {
    citiesArray = typeof role.city === 'string' ? 
      role.city.split(',').map(item => item.trim()).filter(item => item) : 
      role.city;
  }


  // Populate the form with existing role data
  setNewRole({
    jobId: role.jobId || '',
    gbamsId: role.gbamsId || '',
    systemId: role.systemId || 'AUTO',
    role: role.role || '',
    roleType: role.roleType || '',
    country: role.country || '',
    state: role.state || '',
    city: role.city || '',
    currency: role.currency || 'INR',
    minRate: role.minRate || '',
    maxRate: role.maxRate || '',
    client: role.client || '',
    clientPOC: role.clientPOC || '',
    roleLocation: role.roleLocation || '',
    experience: role.experience || '',
    urgency: role.urgency || 'Normal',
    status: role.status || 'Active',
    assignTo: role.assignTo || '',
    assignedRecruiters: role.assignedRecruiters || [],
    recruiterLead: role.recruiterLead || null,
    recruiter: role.recruiter || null,
    effectiveFrom: role.effectiveFrom ? new Date(role.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    startDate: role.startDate ? new Date(role.startDate).toISOString().split('T')[0] : '',
    endDate: role.endDate ? new Date(role.endDate).toISOString().split('T')[0] : '',
    profilesNeeded: role.profilesNeeded || 1,
    expensePaid: role.expensePaid || false,
    specialNotes: role.specialNotes || '',
    createdBy: role.createdBy || 'Manager1',
    jobDescription: role.jobDescription || '',
    visaTypes: visaTypesArray // ADD THIS LINE
  });

    // Set multi-select states and cities
  setSelectedStates(statesArray);
  setSelectedCities(citiesArray);

  // Set country-specific states
  if (role.country) {
    handleCountryChangeForEdit(role.country);
  }

  setShowEditRoleModal(true);
};
  const [resumeFiles, setResumeFiles] = useState([]);
  const [applicationResumes, setApplicationResumes] = useState({});

  // Add this function to fetch resumes for an application
  const fetchApplicationResumes = async (applicationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/recruitment/applications/${applicationId}/resumes`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setApplicationResumes(prev => ({
        ...prev,
        [applicationId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching application resumes:', error);
    }
  };

const closeEditRoleModal = () => {
  setShowEditRoleModal(false);
  setRoleToEdit(null);
  setIsEditMode(false);

  // Reset form
  setNewRole({
    jobId: '',
    gbamsId: '',
    systemId: 'AUTO',
    role: '',
    roleType: '',
    country: '',
    state: '',
    city: '',
    currency: 'INR',
    rate: '',
    client: '',
    clientPOC: '',
    roleLocation: '',
    experience: '',
    urgency: 'Normal',
    status: 'Active',
    assignTo: '',
    recruiterLead: null,
    recruiter: null,
    effectiveFrom: new Date().toISOString().split('T')[0],
    startDate: '',
    endDate: '',
    profilesNeeded: 1,
    expensePaid: false,
    specialNotes: '',
    createdBy: 'Manager1',
    jobDescription: '',
    visaTypes: [] // ADD THIS LINE
  });
};

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align',
    'code-block'
  ];

  // Handle rich text editor changes
  const handleRichTextChange = (field, value) => {
    setNewRole(prev => ({
      ...prev,
      [field]: value
    }));
  };

 const handleCountryChangeForEdit = (countryName) => {
  const countryCode = getCountryCode(countryName);
  const countryStates = getStatesForCountry(countryCode);
  setStates(countryStates);
};


  // NEW: Delete Role Functions
  const openDeleteConfirmModal = (role, e) => {
    e.stopPropagation();

    // Debug logging
    console.log('Role to delete:', role);
    console.log('Role ID:', role.id);
    console.log('Role object keys:', Object.keys(role));
    console.log('Role ID type:', typeof role.id);

    // Verify the role exists in current data
    const foundRole = rolesData.find(r => r.id === role.id);
    console.log('Role found in current data:', foundRole);

    if (!foundRole) {
      showNotification('Role not found in current data. Please refresh the page.');
      return;
    }

    setRoleToDelete(role);
    setShowDeleteConfirmModal(true);
  };

  const closeDeleteConfirmModal = () => {
    setShowDeleteConfirmModal(false);
    setRoleToDelete(null);
  };



  const refreshRolesData = async () => {
    try {
      const token = localStorage.getItem('token');
      const rolesResponse = await axios.get(`${BASE_URL}/api/recruitment/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRolesData(rolesResponse.data);
      filterRoles(); // This will update filteredRoles based on current filters
    } catch (error) {
      console.error('Error refreshing roles data:', error);
      showNotification('Failed to refresh data');
    }
  }


const handleVisaTypeSelection = (visaType) => {
  setNewRole(prev => {
    const currentVisaTypes = prev.visaTypes || [];
    const isSelected = currentVisaTypes.includes(visaType);
    
    if (isSelected) {
      // Remove if already selected
      return {
        ...prev,
        visaTypes: currentVisaTypes.filter(type => type !== visaType)
      };
    } else {
      // Add if not selected
      return {
        ...prev,
        visaTypes: [...currentVisaTypes, visaType]
      };
    }
  });
};




  // Edit application functions
  const openEditApplicationModal = (application, e) => {
    e.stopPropagation();
    setApplicationToEdit(application);
    setEditApplicationData({
      name: application.name || '',
      email: application.email || '',
      phone: application.phone || '',
      experience: application.experience || '',
      currentCompany: application.currentCompany || '',
      expectedSalary: application.expectedSalary || '',
      noticePeriod: application.noticePeriod || '',
      location: application.location || '',
      skills: application.skills || '',
      resumeFile: null, // Initialize as null
      resumeFileName: application.resumeFileName || '' // Keep track of existing file name
    });
    setShowEditApplicationModal(true);
  };






  const closeEditApplicationModal = () => {
    setShowEditApplicationModal(false);
    setApplicationToEdit(null);
    setEditApplicationData({
      name: '',
      email: '',
      phone: '',
      experience: '',
      currentCompany: '',
      expectedSalary: '',
      noticePeriod: '',
      location: '',
      skills: '',
      resumeFile: null, // Reset resume file
      resumeFileName: '' // Reset file name
    });
  };
  const handleEditApplicationChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'resumeFiles' && files && files.length > 0) {
      const newFiles = Array.from(files);

      // Validate files
      const validFiles = newFiles.filter(file => {
        // Validate file size (5MB = 5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
          showNotification(`File ${file.name} exceeds 5MB limit`);
          return false;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          showNotification(`File ${file.name} is not a PDF, DOC, or DOCX`);
          return false;
        }

        return true;
      });

      setEditApplicationData(prev => ({
        ...prev,
        resumeFiles: validFiles
      }));

      // Clear the input
      e.target.value = '';
    } else {
      setEditApplicationData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEditApplicationSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      // Create FormData for multipart request
      const formData = new FormData();
      formData.append('name', editApplicationData.name.trim());
      formData.append('email', editApplicationData.email.trim().toLowerCase());
      formData.append('phone', editApplicationData.phone.trim());
      formData.append('experience', editApplicationData.experience.trim());
      formData.append('currentCompany', editApplicationData.currentCompany?.trim() || '');
      formData.append('expectedSalary', editApplicationData.expectedSalary?.trim() || '');
      formData.append('noticePeriod', editApplicationData.noticePeriod?.trim() || '');
      formData.append('location', editApplicationData.location?.trim() || '');
      formData.append('skills', editApplicationData.skills?.trim() || '');

      // Add resume files if any were selected
      if (editApplicationData.resumeFiles) {
        Array.from(editApplicationData.resumeFiles).forEach(file => {
          formData.append('resume', file);
        });
      }

      await axios.put(
        `${BASE_URL}/api/recruitment/applications/${applicationToEdit.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type manually for FormData - let axios handle it
          }
        }
      );

      // Refresh applications data
      await fetchApplications(selectedRole.id);

      closeEditApplicationModal();
      showNotification('Application updated successfully!');

    } catch (error) {
      console.error('Error updating application:', error);
      showNotification('Failed to update application. Please try again.');
    }
  };
  // Delete application functions
  // Delete application functions
  const openDeleteApplicationModal = (application, e) => {
    e.stopPropagation();
    setApplicationToDelete(application);
    setShowDeleteApplicationModal(true);
  };

  const closeDeleteApplicationModal = () => {
    setShowDeleteApplicationModal(false);
    setApplicationToDelete(null);
  };
  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;

    console.log('Deleting application:', applicationToDelete.id);
    console.log('Current selected role:', selectedRole.id);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.delete(
        `${BASE_URL}/api/recruitment/applications/${applicationToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Delete API call successful:', response.data);

      // Get the new application count from the response
      const newApplicationCount = response.data.newApplicationCount;

      // Update applications data by removing the deleted application
      setApplicationsData(prev => {
        const newData = { ...prev };
        if (newData[selectedRole.id]) {
          const filteredApplications = newData[selectedRole.id].filter(app => app.id !== applicationToDelete.id);
          newData[selectedRole.id] = filteredApplications;
          return { ...newData };
        }
        return newData;
      });

      // Update the roles data to reflect the new application count
      setRolesData(prev => {
        const updatedRoles = prev.map(role => {
          if (role.id === selectedRole.id) {
            return {
              ...role,
              applicationCount: newApplicationCount
            };
          }
          return role;
        });
        return updatedRoles;
      });

      // Also update the selectedRole's application count
      setSelectedRole(prev => ({
        ...prev,
        applicationCount: newApplicationCount
      }));

      closeDeleteApplicationModal();
      showNotification('Application deleted successfully!');

    } catch (error) {
      console.error('Error deleting application:', error);
      showNotification('Failed to delete application. Please try again.');
    }
  };
  // In your handleDeleteRole function
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      const token = localStorage.getItem('token');

      console.log('DELETE request details:', {
        url: `${BASE_URL}/api/recruitment/roles/${roleToDelete.id}`,
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        roleId: roleToDelete.id,
        roleData: roleToDelete
      });

      // Check if role has applications
      let hasApplications = false;
      try {
        const roleDetails = await axios.get(`${BASE_URL}/api/recruitment/roles/${roleToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        hasApplications = roleDetails.data.applications && roleDetails.data.applications.length > 0;
      } catch (error) {
        console.log('Could not fetch role details, proceeding with delete');
      }

      // Use axios.delete instead of axios with method config
      let response;
      if (hasApplications) {
        if (!window.confirm(`This role has applications. Do you want to delete it along with all applications?`)) {
          return;
        }

        // Force delete with applications
        response = await axios.delete(`${BASE_URL}/api/recruitment/roles/${roleToDelete.id}?force=true`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Regular delete
        response = await axios.delete(`${BASE_URL}/api/recruitment/roles/${roleToDelete.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      console.log('Delete response:', response.data);

      // Refresh data
      await refreshRolesData();

      closeDeleteConfirmModal();
      showNotification(hasApplications ?
        'Role and applications deleted successfully!' :
        'Role deleted successfully!');

    } catch (error) {
      console.error('Error deleting role:', error);
      console.error('Error response:', error.response);

      if (error.response?.status === 404) {
        showNotification('Role not found. It may have already been deleted.');
        await refreshRolesData();
      } else if (error.response?.status === 403) {
        showNotification('You do not have permission to delete roles.');
      } else if (error.response?.status === 409) {
        showNotification('Cannot delete role with existing applications. Use force delete.');
      } else {
        showNotification('Error deleting role. Please try again.');
      }

      closeDeleteConfirmModal();
    }
  };
  // Updated viewResume function with proper authentication
  // Updated viewResume function to get actual filename
  const viewResume = async (resumeId, applicationId, e) => {
    e.stopPropagation();
    try {
      setResumeLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Authentication required. Please log in again.');
        return;
      }

      const resumeUrl = `${BASE_URL}/api/recruitment/applications/${applicationId}/resume/${resumeId}`;

      // Make a HEAD request to get the content type and filename
      const headResponse = await fetch(resumeUrl, {
        method: 'HEAD',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!headResponse.ok) {
        throw new Error(`Failed to fetch resume: ${headResponse.status} ${headResponse.statusText}`);
      }

      // Get content type and filename from headers
      const contentType = headResponse.headers.get('content-type') || '';
      const contentDisposition = headResponse.headers.get('content-disposition') || '';

      let fileExtension = 'pdf';
      let actualFileName = 'Resume'; // fallback

      // Extract filename from Content-Disposition header
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          actualFileName = filenameMatch[1].replace(/['"]/g, '');
          // Get file extension from actual filename
          const extMatch = actualFileName.match(/\.([^.]+)$/);
          if (extMatch) {
            fileExtension = extMatch[1].toLowerCase();
          }
        }
      } else {
        // Fallback: determine file type from content type
        if (contentType.includes('word') || contentType.includes('msword') || contentType.includes('officedocument')) {
          fileExtension = 'docx';
        } else if (contentType.includes('pdf')) {
          fileExtension = 'pdf';
        }
      }

      // For Word documents, we'll just store the URL for download
      // For PDFs, we'll fetch the content for display
      let displayUrl = resumeUrl;
      let isWordDoc = fileExtension === 'doc' || fileExtension === 'docx';

      if (!isWordDoc) {
        // For PDFs, fetch the actual content to display
        const getResponse = await fetch(resumeUrl, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!getResponse.ok) {
          throw new Error(`Failed to fetch resume content: ${getResponse.status} ${getResponse.statusText}`);
        }

        const blob = await getResponse.blob();
        displayUrl = URL.createObjectURL(blob);
      }

      // Set the resume details and open modal
      setCurrentResumeUrl(displayUrl);
      setCurrentCandidateName(actualFileName); // Use actual filename instead of candidate name
      setCurrentFileType(fileExtension);
      setShowResumeModal(true);

    } catch (error) {
      console.error('Error viewing resume:', error);
      showNotification('Failed to open resume. Please try again.');
    } finally {
      setResumeLoading(false);
    }
  }
  const closeResumeModal = () => {
    // Clean up blob URL if it exists
    if (currentResumeUrl && currentResumeUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentResumeUrl);
    }

    setShowResumeModal(false);
    setCurrentResumeUrl('');
    setCurrentCandidateName('');
    setCurrentFileType('');
  };
  // Resume Submission Modal Functions
  const showResumeSubmission = (e) => {
    e.stopPropagation();
    setShowResumeSubmissionModal(true);
  };

  const closeResumeSubmissionModal = () => {
    setShowResumeSubmissionModal(false);
    setResumeSubmission({
      name: '',
      email: '',
      phone: '',
      experience: '',
      currentCompany: '',
      expectedSalary: '',
      noticePeriod: '',
      location: '',
      skills: '',
      resumeFile: null
    });
  };

  // Handle resume submission form changes
  const handleResumeSubmissionChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'resumeFiles' && files && files.length > 0) {
      const newFiles = Array.from(files);



      // Validate files
      const validFiles = newFiles.filter(file => {
        // Validate file size (5MB = 5 * 1024 * 1024 bytes)
        if (file.size > 5 * 1024 * 1024) {
          showNotification(`File ${file.name} exceeds 5MB limit`);
          return false;
        }

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          showNotification(`File ${file.name} is not a PDF, DOC, or DOCX`);
          return false;
        }

        return true;
      });


      setResumeFiles(prev => [...prev, ...validFiles]);

      // Clear the input
      e.target.value = '';
    } else {
      setResumeSubmission(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  // Add function to remove a file from the selection
  const removeResumeFile = (index) => {
    setResumeFiles(prev => prev.filter((_, i) => i !== index));
  };
  // Update the handleResumeSubmit function in your React component
  const handleResumeSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      // Validation
      if (!resumeSubmission.name || !resumeSubmission.email || !resumeSubmission.phone || !resumeSubmission.experience) {
        showNotification('Please fill in all required fields');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(resumeSubmission.email)) {
        showNotification('Please enter a valid email address');
        return;
      }

      // Phone validation
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(resumeSubmission.phone.replace(/\s+/g, ''))) {
        showNotification('Please enter a valid phone number');
        return;
      }

      // File size validation (5MB = 5 * 1024 * 1024 bytes)
      if (resumeSubmission.resumeFile && resumeSubmission.resumeFile.size > 5 * 1024 * 1024) {
        showNotification('Resume file size should not exceed 5MB');
        return;
      }

      // File type validation
      if (resumeSubmission.resumeFile) {
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(resumeSubmission.resumeFile.type)) {
          showNotification('Please upload only PDF, DOC, or DOCX files');
          return;
        }
      }

      // Create FormData for multipart request
      const formData = new FormData();
      formData.append('roleId', selectedRole.id);
      formData.append('name', resumeSubmission.name.trim());
      formData.append('email', resumeSubmission.email.trim().toLowerCase());
      formData.append('phone', resumeSubmission.phone.trim());
      formData.append('experience', resumeSubmission.experience.trim());
      formData.append('currentCompany', resumeSubmission.currentCompany?.trim() || '');
      formData.append('expectedSalary', resumeSubmission.expectedSalary?.trim() || '');
      formData.append('noticePeriod', resumeSubmission.noticePeriod?.trim() || '');
      formData.append('location', resumeSubmission.location?.trim() || '');
      formData.append('skills', resumeSubmission.skills?.trim() || '');

      // Add all resume files
      resumeFiles.forEach((file, index) => {
        formData.append('resume', file);
      });

      const response = await axios.post(
        `${BASE_URL}/api/recruitment/applications`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      console.log('Application submitted successfully:', response.data);

      // Refresh applications data for the current role
      await fetchApplications(selectedRole.id);

      // Refresh roles data to update application count
      const rolesResponse = await axios.get(`${BASE_URL}/api/recruitment/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRolesData(rolesResponse.data);

      // Close modal and reset state
      closeResumeSubmissionModal();
      setResumeFiles([]);
      showNotification('Resume submitted successfully!');

    } catch (error) {
      console.error('Error submitting resume:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 409) {
          showNotification('This candidate has already applied for this role.');
        } else if (status === 404) {
          showNotification('Role not found. Please refresh and try again.');
        } else if (status === 400) {
          showNotification(errorData.message || 'Invalid data provided. Please check all fields.');
        } else if (status === 401) {
          showNotification('Authentication failed. Please log in again.');
        } else if (status === 413) {
          showNotification('File size too large. Please upload a smaller file.');
        } else if (status === 415) {
          showNotification('Unsupported file type. Please upload PDF, DOC, or DOCX files only.');
        } else if (status === 500) {
          showNotification('Server error occurred. Please try again later.');
        } else {
          showNotification(errorData.message || `Error ${status}: ${error.response.statusText}`);
        }
      } else if (error.request) {
        showNotification('Network error. Please check your connection.');
      } else {
        showNotification('An unexpected error occurred. Please try again.');
      }
    }
  };



  // Add function to delete a specific resume
  const deleteResume = async (resumeId, applicationId, e) => {
    e.stopPropagation();

    try {
      const token = localStorage.getItem('token');

      // FIXED: Use the correct API endpoint
      const response = await axios.delete(
        `${BASE_URL}/api/recruitment/applications/resumes/${resumeId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh the resumes list
      await fetchApplicationResumes(applicationId);

      showNotification('Resume deleted successfully!');
    } catch (error) {
      console.error('Error deleting resume:', error);
      showNotification('Failed to delete resume. Please try again.');
    }
  };


  // Job Description Modal Functions
  const showJobDescription = (e) => {
    e.stopPropagation();
    setShowJobDescriptionModal(true);
  };

  const closeJobDescriptionModal = () => {
    setShowJobDescriptionModal(false);
  };



  // Add this function to show special notes modal
  const showSpecialNotes = (e) => {
    e.stopPropagation();
    setShowSpecialNotesModal(true);
  };

  // Add this function to close special notes modal
  const closeSpecialNotesModal = () => {
    setShowSpecialNotesModal(false);
  };

  // Helper function to check if role is ending soon
  const isRoleEndingSoon = (endDate) => {
    if (!endDate) return false;

    const today = new Date();
    const roleEndDate = new Date(endDate);
    const timeDiff = roleEndDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff <= 1 && daysDiff >= 0;
  };

  // Helper function to filter roles by date
  const filterByDate = (role, filterType) => {
    if (!filterType) return true;

    const today = new Date();
    const roleDate = new Date(role.createdAt || role.effectiveFrom);

    switch (filterType) {
      case 'today':
        return roleDate.toDateString() === today.toDateString();

      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        return roleDate.toDateString() === yesterday.toDateString();

      case 'this-week':
        const startOfWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        startOfWeek.setDate(today.getDate() + diff);
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        return roleDate >= startOfWeek && roleDate <= endOfWeek;

      case 'last-week':
        const lastWeekStart = new Date(today);
        const lastWeekDayOfWeek = today.getDay();
        const lastWeekDiff = lastWeekDayOfWeek === 0 ? -13 : -6 - lastWeekDayOfWeek;
        lastWeekStart.setDate(today.getDate() + lastWeekDiff);
        lastWeekStart.setHours(0, 0, 0, 0);

        const lastWeekEnd = new Date(lastWeekStart);
        lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
        lastWeekEnd.setHours(23, 59, 59, 999);

        return roleDate >= lastWeekStart && roleDate <= lastWeekEnd;

      case 'this-month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        return roleDate >= startOfMonth && roleDate <= endOfMonth;

      case 'last-month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        lastMonthEnd.setHours(23, 59, 59, 999);

        return roleDate >= lastMonthStart && roleDate <= lastMonthEnd;

      case 'ending-soon':
        return isRoleEndingSoon(role.endDate);

      default:
        return true;
    }
  };


// Add this function near your formatCurrency function
  // Update the formatLocation function to show location for remote roles
  const formatLocation = (role) => {
    if (!role.city && !role.state && !role.country) {
      return 'N/A';
    }

    // For remote roles, show the location but indicate it's remote in the work mode badge
    if (role.roleLocation === 'Remote') {
      // Show the actual location data if available, otherwise just show "Remote"
      if (role.city || role.state || role.country) {
        try {
          const cities = role.city ? role.city.split(',').map(c => c.trim()).filter(c => c) : [];
          const states = role.state ? role.state.split(',').map(s => s.trim()).filter(s => s) : [];
          const country = role.country || '';
          
          // If we have matching cities and states, pair them
          if (cities.length > 0 && states.length > 0 && cities.length === states.length) {
            return cities.map((city, index) => 
              `${city}, ${states[index]}, ${country}`
            ).join(' | ');
          }
          
          // If we have cities but no states, or mismatch
          if (cities.length > 0) {
            const cityStatePairs = cities.map(city => {
              const matchingState = states.length > 0 ? states[0] : (role.state || '');
              return `${city}, ${matchingState}, ${country}`;
            });
            return cityStatePairs.join(' | ');
          }

          // Fallback to original format
          return `${role.city || ''}, ${role.state || ''}, ${country}`.replace(/^,\s*|\s*,/g, '').trim();
        } catch (error) {
          console.error('Error formatting location:', error);
          return `${role.city || ''}, ${role.state || ''}, ${role.country || ''}`.replace(/^,\s*|\s*,/g, '').trim();
        }
      }
      return 'Remote'; // Fallback if no location data
    }

    // For non-remote roles, use the original logic
    try {
      const cities = role.city ? role.city.split(',').map(c => c.trim()).filter(c => c) : [];
      const states = role.state ? role.state.split(',').map(s => s.trim()).filter(s => s) : [];
      const country = role.country || '';

      // If we have matching cities and states, pair them
      if (cities.length > 0 && states.length > 0 && cities.length === states.length) {
        return cities.map((city, index) => 
          `${city}, ${states[index]}, ${country}`
        ).join(' | ');
      }
      
      // If we have cities but no states, or mismatch
      if (cities.length > 0) {
        const cityStatePairs = cities.map(city => {
          const matchingState = states.length > 0 ? states[0] : (role.state || '');
          return `${city}, ${matchingState}, ${country}`;
        });
        return cityStatePairs.join(' | ');
      }

      // Fallback to original format
      return `${role.city || ''}, ${role.state || ''}, ${country}`.replace(/^,\s*|\s*,/g, '').trim();

    } catch (error) {
      console.error('Error formatting location:', error);
      return `${role.city || ''}, ${role.state || ''}, ${role.country || ''}`.replace(/^,\s*|\s*,/g, '').trim();
    }
  };
    // ADD THE NEW FUNCTION HERE:
  const syncRoleToRequirements = async (roleData) => {
    try {
      const token = localStorage.getItem('token');
      
      const requirementData = {
        JobTitle: roleData.role,
        Skills: Array.isArray(roleData.skills) ? roleData.skills.join(', ') : roleData.skills || '',
        Client: roleData.client,
        Location: formatLocation(roleData),
        Rate: `${roleData.minRate} - ${roleData.maxRate} ${roleData.currency}`,
        Duration: roleData.duration || '12 months',
        Status: 'Open',
        JobDescription: roleData.jobDescription || '',
        Experience: roleData.experience,
        JobType: roleData.roleType,
        Priority: roleData.urgency === 'High' ? 'High' : 'Medium'
      };
      
      await axios.post(`${BASE_URL}/api/requirements`, requirementData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Role synced to requirements successfully');
    } catch (error) {
      console.error('Error syncing role to requirements:', error);
      // Don't show error to user as this is a background sync
    }
  };


  // Add a useEffect to clear state and city when switching to Remote mode
  useEffect(() => {
    if (newRole.roleLocation === 'Remote') {
      setNewRole(prev => ({
        ...prev,
        state: '',
        city: ''
      }));
    }
  }, [newRole.roleLocation]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        // Fetch roles
        const rolesResponse = await axios.get(`${BASE_URL}/api/recruitment/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRolesData(rolesResponse.data);

        // Fetch recruiters
        const recruitersResponse = await axios.get(`${BASE_URL}/api/recruitment/recruiters`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecruiters(recruitersResponse.data);

        // Fetch hiring steps - ADD ERROR HANDLING
        try {
          const stepsResponse = await axios.get(`${BASE_URL}/api/recruitment/applications/hiring-steps`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('Hiring steps data:', stepsResponse.data); // Debug log
          setHiringSteps(stepsResponse.data || []);
        } catch (stepsError) {
          console.error('Error fetching hiring steps:', stepsError);
          // Set default hiring steps if API fails
          setHiringSteps([
            { id: 1, stepName: 'Applied', stepOrder: 0 },
            { id: 2, stepName: 'Screening', stepOrder: 1 },
            { id: 3, stepName: 'Technical Interview', stepOrder: 2 },
            { id: 4, stepName: 'Manager Interview', stepOrder: 3 },
            { id: 5, stepName: 'HR Interview', stepOrder: 4 },
            { id: 6, stepName: 'Offer Extended', stepOrder: 5 },
            { id: 7, stepName: 'Hired', stepOrder: 6 }
          ]);
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);// Keep this empty to only run on mount

  // Add this useEffect to handle data refresh when needed
  useEffect(() => {
    filterRoles();
  }, [rolesData, searchTerm, statusFilter, locationFilter, urgencyFilter, dateFilter, isRecruiterView]);

  // Handle country change
// Replace the current handleCountryChange function with this version
const handleCountryChange = (e) => {
  const countryName = e.target.value;
  const countryCode = getCountryCode(countryName);
  setNewRole(prev => ({
    ...prev,
    country: countryName,
    // Don't clear state and city - keep them for display purposes
    state: prev.state,
    city: prev.city
  }));

  // Get states for the selected country
  const countryStates = getStatesForCountry(countryCode);
  setStates(countryStates);
};

// Update the useEffect that handles roleLocation changes
useEffect(() => {
  // Don't clear state and city when switching to Remote mode
  // Keep the location data for display purposes
  if (newRole.roleLocation === 'Remote') {
    // We're not clearing state and city anymore
    // The location will still show but the work mode badge will indicate it's remote
  }
}, [newRole.roleLocation]);
 


const handleStateSelection = (stateName) => {
  setSelectedStates(prev => {
    if (prev.includes(stateName)) {
      return prev.filter(state => state !== stateName);
    } else {
      return [...prev, stateName];
    }
  });
};


const handleCityInputChange = (e) => {
  setCityInput(e.target.value);
};

const handleAddCity = () => {
  if (cityInput.trim() && !selectedCities.includes(cityInput.trim())) {
    setSelectedCities(prev => [...prev, cityInput.trim()]);
    setCityInput('');
  }
};

const handleRemoveCity = (cityToRemove) => {
  setSelectedCities(prev => prev.filter(city => city !== cityToRemove));
};

const handleRemoveState = (stateToRemove) => {
  setSelectedStates(prev => prev.filter(state => state !== stateToRemove));
};

  // Fetch applications for a specific role
  const fetchApplications = async (roleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/recruitment/applications/role/${roleId}/with-resumes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setApplicationsData(prev => ({
        ...prev,
        [roleId]: response.data || []
      }));

    } catch (error) {
      console.error('Error fetching applications:', error);
      // Fallback to the original endpoint if the new one fails
      try {
        const token = localStorage.getItem('token');
        const fallbackResponse = await axios.get(`${BASE_URL}/api/recruitment/roles/${roleId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setApplicationsData(prev => ({
          ...prev,
          [roleId]: fallbackResponse.data.applications || []
        }));
      } catch (fallbackError) {
        console.error('Fallback error fetching applications:', fallbackError);
        showNotification('Failed to load applications for this role');
        setApplicationsData(prev => ({
          ...prev,
          [roleId]: [] // Set empty array if request fails
        }));
      }
    }
  };

  // Filter roles based on search and filter criteria
// Filter roles based on search and filter criteria
const filterRoles = useCallback(() => {
  const filtered = rolesData.filter(role => {
    const matchesSearch = role.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      // Add search in assigned recruiters
      (() => {
        if (!searchTerm) return false;
        
        try {
          let assignedRecruiters = [];
          if (role.assignedRecruiters) {
            if (typeof role.assignedRecruiters === 'string') {
              assignedRecruiters = JSON.parse(role.assignedRecruiters);
            } else {
              assignedRecruiters = role.assignedRecruiters;
            }
            
            // Check if any assigned recruiter name matches the search term
            return assignedRecruiters.some(recruiter => 
              recruiter.name && recruiter.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
        } catch (error) {
          console.error('Error parsing assigned recruiters for search:', error);
        }
        return false;
      })();

    const matchesStatus = !statusFilter || role.status === statusFilter;
    const matchesLocation = !locationFilter || role.roleLocation === locationFilter;
    const matchesUrgency = !urgencyFilter || role.urgency === urgencyFilter;
    const matchesDate = filterByDate(role, dateFilter);

    // For team lead view, show roles assigned to the current team lead
    let isAssigned = true;
    if (isTeamLeadView) {
      const currentUsername = localStorage.getItem('username').toLowerCase();

      // Check if current user is the role owner
      const isRoleOwner = role.assignTo && role.assignTo.toLowerCase() === currentUsername;

      // Check if current user is in assigned recruiters
      let isInAssignedRecruiters = false;
      try {
        if (role.assignedRecruiters) {
          let assignedRecruiters = [];
          if (typeof role.assignedRecruiters === 'string') {
            assignedRecruiters = JSON.parse(role.assignedRecruiters);
          } else {
            assignedRecruiters = role.assignedRecruiters;
          }

          isInAssignedRecruiters = assignedRecruiters.some(recruiter =>
            recruiter.name && recruiter.name.toLowerCase() === currentUsername
          );
        }
      } catch (error) {
        console.error('Error parsing assigned recruiters:', error);
      }

      // FIX: Also show roles CREATED BY the team lead
      const isCreatedByTeamLead = role.createdBy && role.createdBy.toLowerCase() === currentUsername;

      isAssigned = isRoleOwner || isInAssignedRecruiters || isCreatedByTeamLead;
    }

    return matchesSearch && matchesStatus && matchesLocation && matchesUrgency && matchesDate && isAssigned;
  });

  setFilteredRoles(filtered);
}, [searchTerm, statusFilter, locationFilter, urgencyFilter, dateFilter, rolesData, isRecruiterView, isTeamLeadView]);
  // Initialize the application
  useEffect(() => {
    filterRoles();
  }, [filterRoles]);

  // Show role applications in modal
  // In showRoleApplications function
  const showRoleApplications = async (role) => {
    setSelectedRole(role);

    // Fetch applications if not already loaded
    if (!applicationsData[role.id]) {
      await fetchApplications(role.id);
    }

    // Fetch resumes for each application
    if (applicationsData[role.id]) {
      for (const application of applicationsData[role.id]) {
        // Only fetch resumes if the application has resumes
        if (application.resumeCount > 0) {
          await fetchApplicationResumes(application.id);
        }
      }
    }

    // Show modal regardless of whether there are applications
    setShowModal(true);
  };
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedRole(null);
  };

  // Toggle hiring process visibility
  const toggleHiringProcess = (applicationId, e) => {
    e.stopPropagation();
    setShowHiringProcess(prev => ({
      ...prev,
      [applicationId]: !prev[applicationId]
    }));
  };

  // Advance hiring step (recruiter functionality)
  const advanceStep = async (applicationId, currentStepIndex, roleId, e) => {
    e.stopPropagation();

    try {
      const token = localStorage.getItem('token');
      const newStepIndex = currentStepIndex + 1;

      // Determine new status based on step
      let newStatus = 'In Progress';
      if (newStepIndex === hiringSteps.length - 2) {
        newStatus = 'Offer Extended';
      } else if (newStepIndex === hiringSteps.length - 1) {
        newStatus = 'Hired';
      }

      await axios.put(
        `${BASE_URL}/api/recruitment/applications/${applicationId}/status`,
        {
          currentStep: newStepIndex,
          status: newStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh applications data
      await fetchApplications(roleId);
      showNotification(`Step completed for application ${applicationId}`);

    } catch (error) {
      console.error('Error advancing step:', error);
      showNotification('Failed to update application status');
    }
  };

  // Show notification
  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle input changes for the new role form
  // Enhanced handleNewRoleChange function with rate validation
  const handleNewRoleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Convert to number for rate fields
    let processedValue = value;
    if (name === 'minRate' || name === 'maxRate') {
      processedValue = value === '' ? '' : Number(value);
    }

    // Add new options to the appropriate list when typing
    if (name === 'role' && value && !roleTitles.includes(value)) {
      setRoleTitles(prev => [...prev, value]);
    } else if (name === 'client' && value && !clients.includes(value)) {
      setClients(prev => [...prev, value]);
    } else if (name === 'assignTo' && value && !recruiters.some(r => r.name === value)) {
      setRecruiters(prev => [...prev, { name: value }]);
    } else if (name === 'clientPOC' && value && !clientPOCs.includes(value)) {
      setClientPOCs(prev => [...prev, value]);
    }

    setNewRole(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : processedValue
      };

      // Validate rate ranges
      if (name === 'minRate' || name === 'maxRate') {
        const minRate = name === 'minRate' ? processedValue : prev.minRate;
        const maxRate = name === 'maxRate' ? processedValue : prev.maxRate;

        // Clear any existing rate validation errors
        setValidationErrors(prevErrors => ({
          ...prevErrors,
          rateRange: null
        }));

        // Validate if both values are present
        if (minRate && maxRate && Number(minRate) >= Number(maxRate)) {
          setValidationErrors(prevErrors => ({
            ...prevErrors,
            rateRange: 'Maximum rate must be greater than minimum rate'
          }));
        }
      }

      return updated;
    });
  };

  // Form validation function

const validateForm = () => {
  const errors = {};

  // Required field validation
  if (!newRole.jobId.trim()) errors.jobId = 'Job ID is required';
  if (!newRole.role.trim()) errors.role = 'Role is required';
  if (!newRole.minRate) errors.minRate = 'Minimum rate is required';
  if (!newRole.maxRate) errors.maxRate = 'Maximum rate is required';
  if (!newRole.client.trim()) errors.client = 'Client is required';
  if (!newRole.country.trim()) errors.country = 'Country is required';

  // State and City are only required for Onsite and Hybrid work modes
  if (newRole.roleLocation !== 'Remote') {
    if (selectedStates.length === 0) {
      errors.state = 'At least one state is required for Onsite/Hybrid roles';
    }
    if (selectedCities.length === 0) {
      errors.city = 'At least one city is required for Onsite/Hybrid roles';
    }
  }

  // Rate validation remains the same...
  if (newRole.minRate && newRole.maxRate) {
    if (Number(newRole.minRate) >= Number(newRole.maxRate)) {
      errors.rateRange = 'Maximum rate must be greater than minimum rate';
    }
    if (Number(newRole.minRate) < 0) {
      errors.minRate = 'Minimum rate cannot be negative';
    }
    if (Number(newRole.maxRate) < 0) {
      errors.maxRate = 'Maximum rate cannot be negative';
    }
  }

  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};




  
 
// Replace the existing useEffect with this more comprehensive version
useEffect(() => {
  if (showAddRoleModal && !isEditMode) {
    // Complete reset of all form-related states
    setSelectedStates([]);
    setSelectedCities([]);
    setCityInput('');
    setStates([]);
    
    // Reset newRole to initial state
    setNewRole({
      jobId: '',
      gbamsId: '',
      systemId: 'AUTO',
      role: '',
      roleType: 'Full-time',
      country: '',
      state: '',
      city: '',
      currency: 'INR',
      minRate: '',
      maxRate: '',
      client: '',
      clientPOC: '',
      roleLocation: 'Onsite',
      experience: '',
      urgency: 'Normal',
      status: 'Active',
      assignTo: '',
      assignedRecruiters: [],
      recruiterLead: null,
      recruiter: null,
      effectiveFrom: new Date().toISOString().split('T')[0],
      startDate: '',
      endDate: '',
      profilesNeeded: 1,
      expensePaid: false,
      specialNotes: '',
      createdBy: localStorage.getItem('username') || 'Unknown',
      jobDescription: '',
      visaTypes: []
    });
  }
}, [showAddRoleModal, isEditMode]);

  

  // Enhanced rate display component
  const RateDisplay = ({ role, currency }) => {
 

    return (
      <div className="rate-display">
        <span className="rate-range">
          {formatCurrency(role.minRate, role.currency)} - {formatCurrency(role.maxRate, role.currency)}
        </span>
        <span className="rate-period">
          {role.roleType === 'Contract' ? '/month' : '/annum'}
        </span>
      </div>
    );
  };
  // Submit the new role form (updated to handle both create and edit)
  const handleAddRoleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');

      // Add client-side validation for always required fields
      if (!newRole.jobId || !newRole.role || !newRole.client || !newRole.country) {
        showNotification('Please fill in all required fields');
        return;
      }

      // State and City validation based on work mode
      // Only require State and City for Onsite and Hybrid roles, not for Remote
      if (newRole.roleLocation !== 'Remote') {
      if (selectedStates.length === 0) {
        showNotification('Please select a State for Onsite/Hybrid roles');
        return;
      }
      if (selectedCities.length === 0) {
        showNotification('Please enter a City for Onsite/Hybrid roles');
        return;
      }
    }

      // Rate validation
      if (!newRole.minRate || !newRole.maxRate || parseFloat(newRole.minRate) <= 0 || parseFloat(newRole.maxRate) <= 0) {
        showNotification('Please enter valid minimum and maximum rates');
        return;
      }

      if (parseFloat(newRole.minRate) >= parseFloat(newRole.maxRate)) {
        showNotification('Maximum rate must be greater than minimum rate');
        return;
      }

      if (!newRole.startDate) {
        showNotification('Please select a start date');
        return;
      }

      // Prepare the role data with proper formatting and validation
  
      const roleData = {
        jobId: newRole.jobId.trim(),
        gbamsId: newRole.gbamsId?.trim() || null,
        role: newRole.role.trim(),
        roleType: newRole.roleType,
      country: getCountryCode(newRole.country),
        // For remote roles, store the location data but the work mode will indicate it's remote
        state: selectedStates.length > 0 
          ? selectedStates.map(stateName => getStateCode(getCountryCode(newRole.country), stateName)).join(', ') 
          : null,
        city: selectedCities.length > 0 ? selectedCities.join(', ') : null,
        currency: newRole.currency,
        minRate: parseFloat(newRole.minRate),
        maxRate: parseFloat(newRole.maxRate),
        client: newRole.client.trim(),
        clientPOC: newRole.clientPOC?.trim() || null,
        roleLocation: newRole.roleLocation, // This will be "Remote"
        experience: newRole.experience.trim(),
        urgency: newRole.urgency,
        status: newRole.status,
        assignTo: newRole.assignTo?.trim() || null,
        assignedRecruiters: newRole.assignedRecruiters || [],
        jobDescription: newRole.jobDescription?.trim() || null,
        effectiveFrom: newRole.effectiveFrom || new Date().toISOString().split('T')[0],
        startDate: newRole.startDate,
        endDate: newRole.endDate || null,
        profilesNeeded: parseInt(newRole.profilesNeeded) || 1,
        expensePaid: Boolean(newRole.expensePaid),
        specialNotes: newRole.specialNotes?.trim() || null,
        visaTypes: newRole.visaTypes || [],
        createdBy: localStorage.getItem('username') || 'Unknown'
      };

      // Rest of your submission logic...
      let response;
      let successMessage;

      if (isEditMode && roleToEdit) {
        response = await axios.put(
          `${BASE_URL}/api/recruitment/roles/${roleToEdit.id}`,
          roleData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        successMessage = 'Role updated successfully!';
      } else {
        response = await axios.post(
          `${BASE_URL}/api/recruitment/roles`,
          roleData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        successMessage = 'New role added successfully!';

         await syncRoleToRequirements(roleData);
      }

      console.log('Server response:', response.data);

      // Refresh roles data
      const rolesResponse = await axios.get(`${BASE_URL}/api/recruitment/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRolesData(rolesResponse.data);

      // Reset form and close modal
    // Reset form
      setNewRole({
        jobId: '',
        gbamsId: '', // ADD THIS LINE
        systemId: 'AUTO',
        role: '',
        roleType: '',
        country: '',
        state: '',
        city: '',
        currency: 'INR',
        rate: '',
        client: '',
        clientPOC: '',
        roleLocation: '',
        experience: '',
        urgency: 'Normal',
        status: 'Active',
        assignTo: '',
        recruiterLead: null,
        recruiter: null,
        effectiveFrom: new Date().toISOString().split('T')[0],
        startDate: '',
        endDate: '',
        profilesNeeded: 1,
        expensePaid: false,
        specialNotes: '',
        createdBy: localStorage.getItem('username') || 'Unknown',
        jobDescription: ''
      });

      if (isEditMode) {
        closeEditRoleModal();
      } else {
        setShowAddRoleModal(false);
      }

      showNotification(successMessage);

    } catch (error) {
      console.error('Error saving role:', error);

      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const errorData = error.response.data;

        console.log('Error response data:', errorData);
        console.log('Error status:', status);

        if (status === 400) {
          showNotification(errorData.message || 'Bad request. Please check your input data.');
        } else if (status === 401) {
          showNotification('Authentication failed. Please log in again.');
        } else if (status === 403) {
          showNotification('You do not have permission to perform this action.');
        } else if (status === 409) {
          showNotification('A role with this Job ID already exists.');
        } else if (status === 422) {
          showNotification('Invalid data provided. Please check all fields.');
        } else if (status === 500) {
          showNotification('Server error occurred. Please try again later or contact support.');
        } else {
          showNotification(errorData.message || `Error ${status}: ${error.response.statusText}`);
        }
      } else if (error.request) {
        // Network error
        showNotification('Network error. Please check your connection.');
      } else {
        // Other error
        showNotification('An unexpected error occurred. Please try again.');
      }
    }
  };





  
  // Role types for dropdown
  const roleTypes = [
    "Full-time",
    "Part-time",
    "Contract",
    "Contract-to-hire",
    "C2C",
    "Internship",
    "Temporary"
  ];

  // Status options
  const statusOptions = [
    "Active",
    "Inactive",
    "Closed",
    "On Hold",
    "Cancelled"
  ];

  // Date filter options
  const dateFilterOptions = [
    { value: "", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "yesterday", label: "Yesterday" },
    { value: "this-week", label: "This Week" },
    { value: "last-week", label: "Last Week" },
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "ending-soon", label: "Ending Soon" }
  ];



  // Add this function before generateHiringSteps
const updateApplicationStep = async (applicationId, newStepIndex, roleId) => {
  try {
    const token = localStorage.getItem('token');

    // Use hiringSteps from state or default steps
    const stepsToUse = hiringSteps && hiringSteps.length > 0 ? hiringSteps : [
      { stepName: 'Applied', stepOrder: 0 },
      { stepName: 'Screening', stepOrder: 1 },
      { stepName: 'Technical Interview', stepOrder: 2 },
      { stepName: 'Manager Interview', stepOrder: 3 },
      { stepName: 'HR Interview', stepOrder: 4 },
      { stepName: 'Offer Extended', stepOrder: 5 },
      { stepName: 'Hired', stepOrder: 6 }
    ];

    // Determine new status based on step
    let newStatus = 'In Progress';
    if (newStepIndex === stepsToUse.length - 2) {
      newStatus = 'Offer Extended';
    } else if (newStepIndex === stepsToUse.length - 1) {
      newStatus = 'Hired';
    }

    await axios.put(
      `${BASE_URL}/api/recruitment/applications/${applicationId}/status`,
      {
        currentStep: newStepIndex,
        status: newStatus
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Refresh applications data
    await fetchApplications(roleId);
    showNotification(`Step updated to ${stepsToUse[newStepIndex]?.stepName || `Step ${newStepIndex + 1}`}`);

  } catch (error) {
    console.error('Error updating application step:', error);
    showNotification('Failed to update application step');
  }
};

const generateHiringSteps = (application, roleId) => {
  // Use default steps if hiringSteps is empty
  const stepsToUse = hiringSteps && hiringSteps.length > 0 ? hiringSteps : [
    { stepName: 'Applied', stepOrder: 0 },
    { stepName: 'Screening', stepOrder: 1 },
    { stepName: 'Technical Interview', stepOrder: 2 },
    { stepName: 'Manager Interview', stepOrder: 3 },
    { stepName: 'HR Interview', stepOrder: 4 },
    { stepName: 'Offer Extended', stepOrder: 5 },
    { stepName: 'Hired', stepOrder: 6 }
  ];

  const currentStepIndex = application.currentStep || 0;

  return (
    <div className="recruitment-hiring-process-dropdown">
      <div className="recruitment-current-step-display">
        {/* <strong>Current Step:</strong> 
        <span className="current-step-name">
          {stepsToUse[currentStepIndex]?.stepName || `Step ${currentStepIndex + 1}`}
        </span> */}
      </div>
      
      <div className="recruitment-step-selector">
        <label htmlFor={`step-select-${application.id}`}>Update Step:</label>
        <select
          id={`step-select-${application.id}`}
          value={currentStepIndex}
          onChange={async (e) => {
            const newStepIndex = parseInt(e.target.value);
            await updateApplicationStep(application.id, newStepIndex, roleId);
          }}
          className="recruitment-step-dropdown"
        >
          {stepsToUse.map((step, index) => (
            <option key={index} value={index}>
              {step.stepName}
            </option>
          ))}
        </select>
      </div>

      {/* Progress bar remains the same */}
      {/* <div className="recruitment-progress-bar">
        <div
          className="recruitment-progress-fill"
          style={{
            width: `${((currentStepIndex + 1) / stepsToUse.length) * 100}%`
          }}
        ></div>
      </div> */}
    </div>
  );
};



  const renderResumeModal = () => {
    if (!showResumeModal) return null;

    const isWordDoc = currentFileType === 'doc' || currentFileType === 'docx';
    const isPdf = currentFileType === 'pdf';

    const handleDownload = async () => {
      try {
        const token = localStorage.getItem('token');

        // Use the original URL for downloading
        const downloadUrl = currentResumeUrl;

        const response = await fetch(downloadUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Download failed');
        }

        // Get the original filename from Content-Disposition header if available
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `${currentCandidateName}.${currentFileType}`;

        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
          }
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename; // Use the extracted or constructed filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showNotification('Resume download started!');
      } catch (error) {
        console.error('Download failed:', error);
        showNotification('Download failed. Please try again.');
      }
    };

    return (
      <div
        id="resume-modal"
        className="recruitment-modal"
        style={{ zIndex: 10002 }}
        onClick={(e) => e.target.id === 'resume-modal' && closeResumeModal()}
      >
        <div className="recruitment-modal-content" style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          width: '1000px',
          height: '800px',
          padding: '0',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div className="recruitment-modal-header" style={{
            // padding: '15px 20px',
            borderBottom: '1px solid #ddd',
            flexShrink: 0
          }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>
              Resume - {currentCandidateName} {isWordDoc && '(Word Document)'}
            </h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* <button
                onClick={handleDownload}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#1b876cff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Download
              </button> */}
              <span
                className="recruitment-close"
                onClick={closeResumeModal}
                style={{ fontSize: '24px', cursor: 'pointer' }}
              >
                &times;
              </span>
            </div>
          </div>

          <div style={{
            flex: 1,
            padding: '0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f8f9fa'
          }}>
            {resumeLoading ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', color: '#666' }}>Loading resume...</div>
              </div>
            ) : isWordDoc ? (
              // For Word documents, show a clean preview message
              <div style={{
                textAlign: 'center',
                padding: '60px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '25px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                border: '1px solid #e9ecef'
              }}>
                <div style={{
                  fontSize: '84px',
                  color: '#060606ff',
                  marginBottom: '10px'
                }}>📄</div>

                <div>
                  <h3 style={{
                    margin: '0 0 15px 0',
                    color: '#2c5047ff',
                    fontSize: '24px',
                    fontWeight: '600'
                  }}>
                    Word Document Resume
                  </h3>

                  <button
                    onClick={handleDownload}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#1b876cff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                    className="download-button"
                  >
                    Download Resume
                  </button>

                </div>

                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  marginTop: '20px'
                }}>
                  File: {currentCandidateName}.{currentFileType}
                </div>
              </div>
            ) : (
              // For PDFs, use iframe with better error handling
              <iframe
                src={currentResumeUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: 'white'
                }}
                title={`Resume - ${currentCandidateName}`}
                onError={(e) => {
                  console.error('Error loading document in iframe:', e);
                  showNotification('Failed to load PDF. Please try downloading instead.');
                }}
                onLoad={() => {
                  console.log('PDF loaded successfully in iframe');
                }}
              />
            )}
          </div>
        </div>
      </div>
    );

  };
  // Add these state variables near your other state declarations
  const [selectedRecruiters, setSelectedRecruiters] = useState([]);
  const [showMultipleAssignModal, setShowMultipleAssignModal] = useState(false);
  // const [roleToAssign, setRoleToAssign] = useState(null);
  const [showRecruiterDropdown, setShowRecruiterDropdown] = useState(false);

  // Add these functions for multiple recruiter assignment
  // In openMultipleAssignModal function:
  const openMultipleAssignModal = (role, e) => {
    e.stopPropagation();
    setRoleToAssign(role);

    // Pre-select currently assigned recruiters from the correct field
    if (role.assignedRecruiters) {
      try {
        const currentlyAssigned = typeof role.assignedRecruiters === 'string'
          ? JSON.parse(role.assignedRecruiters)
          : role.assignedRecruiters;
        setSelectedRecruiters(currentlyAssigned.map(r => r.id));
      } catch (error) {
        setSelectedRecruiters([]);
      }
    } else {
      setSelectedRecruiters([]);
    }

    setShowMultipleAssignModal(true);
  };
  const closeMultipleAssignModal = () => {
    setShowMultipleAssignModal(false);
    setRoleToAssign(null);
    setSelectedRecruiters([]);
    setRecruiterSearchTerm(''); // Clear search term
    setShowRecruiterDropdown(false);
  };

  const handleRecruiterSelection = (recruiterId) => {
    setSelectedRecruiters(prev => {
      if (prev.includes(recruiterId)) {
        return prev.filter(id => id !== recruiterId);
      } else {
        return [...prev, recruiterId];
      }
    });
  };
  const handleMultipleRecruiterAssignment = async () => {
    try {
      const token = localStorage.getItem('token');

      // Send the updated list of recruiter IDs (including removals)
      // BUT keep the original role owner unchanged
      const response = await axios.post(
        `${BASE_URL}/api/recruitment/roles/${roleToAssign.id}/assign-multiple-recruiters`,
        {
          recruiterIds: selectedRecruiters,
          // Remove this line that was incorrectly updating the roleOwner
          // roleOwner: roleToAssign.assignTo 
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Refresh roles data to reflect changes
      await refreshRolesData();
      closeMultipleAssignModal();
      showNotification('Recruiters assigned successfully!');

    } catch (error) {
      console.error('Error assigning recruiters:', error);

      if (error.response?.data?.message) {
        showNotification(error.response.data.message);
      } else {
        showNotification('Failed to assign recruiters. Please try again.');
      }
    }
  };
  // Add this function to render assigned recruiters
  // Add this state near your other state declarations
  const [expandedRecruiters, setExpandedRecruiters] = useState({});

  // Add this function to toggle recruiter expansion
  const toggleRecruiterExpansion = (roleId, e) => {
    e.stopPropagation();
    setExpandedRecruiters(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }));
  };

  // Update the renderAssignedRecruiters function
  const renderAssignedRecruiters = (role) => {
    let assignedRecruiters = [];

    try {
      if (role.assignedRecruiters) {
        // Parse the assignedRecruiters string if it's a string
        if (typeof role.assignedRecruiters === 'string') {
          assignedRecruiters = JSON.parse(role.assignedRecruiters);
        } else {
          assignedRecruiters = role.assignedRecruiters;
        }
      }
    } catch (error) {
      console.error('Error parsing assigned recruiters:', error);
    }

    if (assignedRecruiters.length === 0) {
      return (
        <span className="text-muted">
          <i className="fas fa-user-slash me-1"></i>
          No recruiters assigned
        </span>
      );
    }

    const isExpanded = expandedRecruiters[role.id];
    const displayCount = isExpanded ? assignedRecruiters.length : 2;
    const hasMore = assignedRecruiters.length > 2;

    return (
      <div className="assigned-recruiters">
        <i className="fas fa-users me-1"></i>
        <div className="recruiters-list mt-1">
          {assignedRecruiters.slice(0, displayCount).map((recruiter, index) => (
            <span key={recruiter.id} className="badge bg-primary me-1 mb-1">
              {recruiter.name}
              {/* {recruiter.role && recruiter.role !== 'user' && `(${recruiter.role})`} */}
            </span>
          ))}
          {hasMore && !isExpanded && (
            <span
              className="badge bg-secondary clickable"
              onClick={(e) => toggleRecruiterExpansion(role.id, e)}
              style={{ cursor: 'pointer' }}
            >
              +{assignedRecruiters.length - 2} more
            </span>
          )}
          {hasMore && isExpanded && (
            <span
              className="badge bg-secondary clickable"
              onClick={(e) => toggleRecruiterExpansion(role.id, e)}
              style={{ cursor: 'pointer' }}
            >
              Show less
            </span>
          )}
        </div>
      </div>
    );
  };

  // Add this function to handle downloads with original filename
  const downloadResumeWithOriginalName = async (resumeUrl) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(resumeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download resume');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'resume.pdf'; // fallback filename

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="([^"]*)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error downloading resume:', error);
      showNotification('Failed to download resume. Please try again.');
    }
  };

  // Render resume submission modal
  const renderResumeSubmissionModal = () => {
    if (!selectedRole || !showResumeSubmissionModal) return null;

    return (
      <div
        id="resume-submission-modal"
        className="recruitment-modal"
        onClick={(e) => e.target.id === 'resume-submission-modal' && closeResumeSubmissionModal()}
      >
        <div className="recruitment-modal-content" style={{ maxWidth: '600px' }}>
          <div className="recruitment-modal-header">
            <h2>Submit Resume - {selectedRole.role}</h2>
            <span className="recruitment-close" onClick={closeResumeSubmissionModal}>&times;</span>
          </div>
          <div className="recruitment-modal-body">
            <form onSubmit={handleResumeSubmit} className="recruitment-resume-form">
              {/* File upload section */}
              <div className="recruitment-form-group full-width" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', color: '#4c63d2', marginBottom: '10px', display: 'block' }}>
                  Resume Upload * (Multiple files allowed)
                </label>

                {/* Hidden file input */}
                <input
                  type="file"
                  name="resumeFiles"
                  id="resume-file-input"
                  onChange={handleResumeSubmissionChange}
                  accept=".pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  multiple
                />

                {/* Custom file upload button */}
                <div
                  onClick={() => document.getElementById('resume-file-input').click()}
                  style={{
                    padding: '15px',
                    border: '2px dashed #4c63d2',
                    borderRadius: '8px',
                    backgroundColor: '#f8f9ff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div>
                    <div style={{ color: '#4c63d2', fontWeight: 'bold', marginBottom: '5px' }}>
                      Click to browse or drag and drop
                    </div>
                    <div style={{ color: '#666', fontSize: '12px' }}>
                      Accepted formats: PDF, DOC, DOCX (Max 5MB per file)
                    </div>
                  </div>
                </div>

                {/* Selected files list */}
                {resumeFiles.length > 0 && (
                  <div style={{ marginTop: '15px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Selected files:</div>
                    {resumeFiles.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px',
                        backgroundColor: '#f0f4ff',
                        borderRadius: '4px',
                        marginBottom: '5px'
                      }}>
                        <span style={{ fontSize: '14px' }}>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeResumeFile(index)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4757',
                            cursor: 'pointer',
                            fontSize: '16px'
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Rest of the form fields remain the same */}
              <div className="recruitment-form-row">
                <div className="recruitment-form-group">
                  <label>Full Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={resumeSubmission.name}
                    onChange={handleResumeSubmissionChange}
                    required
                    placeholder="Enter candidate's full name"
                    className="recruitment-form-input"
                  />
                </div>
                <div className="recruitment-form-group">
                  <label>Email*</label>
                  <input
                    type="email"
                    name="email"
                    value={resumeSubmission.email}
                    onChange={handleResumeSubmissionChange}
                    required
                    placeholder="Enter candidate's email"
                    className="recruitment-form-input"
                  />
                </div>
              </div>

              <div className="recruitment-form-row">
                <div className="recruitment-form-group">
                  <label>Phone*</label>
                  <input
                    type="tel"
                    name="phone"
                    value={resumeSubmission.phone}
                    onChange={handleResumeSubmissionChange}
                    required
                    placeholder="Enter candidate's phone number"
                    className="recruitment-form-input"
                  />
                </div>
                <div className="recruitment-form-group">
                  <label>Experience*</label>
                  <input
                    type="text"
                    name="experience"
                    value={resumeSubmission.experience}
                    onChange={handleResumeSubmissionChange}
                    required
                    placeholder="e.g., 5 years"
                    className="recruitment-form-input"
                  />
                </div>
              </div>

              <div className="recruitment-form-row">
                <div className="recruitment-form-group">
                  <label>Current Company</label>
                  <input
                    type="text"
                    name="currentCompany"
                    value={resumeSubmission.currentCompany}
                    onChange={handleResumeSubmissionChange}
                    placeholder="Enter current company"
                    className="recruitment-form-input"
                  />
                </div>
                <div className="recruitment-form-group">
                  <label>Expected Salary</label>
                  <input
                    type="text"
                    name="expectedSalary"
                    value={resumeSubmission.expectedSalary}
                    onChange={handleResumeSubmissionChange}
                    placeholder="e.g., 12 LPA"
                    className="recruitment-form-input"
                  />
                </div>
              </div>

              <div className="recruitment-form-row">
                <div className="recruitment-form-group">
                  <label>Notice Period</label>
                  <input
                    type="text"
                    name="noticePeriod"
                    value={resumeSubmission.noticePeriod}
                    onChange={handleResumeSubmissionChange}
                    placeholder="e.g., 30 days"
                    className="recruitment-form-input"
                  />
                </div>
                <div className="recruitment-form-group">
                  <label>Current Location</label>
                  <input
                    type="text"
                    name="location"
                    value={resumeSubmission.location}
                    onChange={handleResumeSubmissionChange}
                    placeholder="Enter current location"
                    className="recruitment-form-input"
                  />
                </div>
              </div>

              <div className="recruitment-form-group full-width">
                <label>Skills</label>
                <textarea
                  name="skills"
                  value={resumeSubmission.skills}
                  onChange={handleResumeSubmissionChange}
                  placeholder="Enter key skills separated by commas"
                  className="recruitment-form-textarea"
                  rows="3"
                />
              </div>

              <div className="recruitment-form-actions">
                <button
                  type="button"
                  className="recruitment-cancel-btn"
                  onClick={closeResumeSubmissionModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="recruitment-submit-btn"
                  disabled={!resumeSubmission.name || !resumeSubmission.email || !resumeSubmission.phone || !resumeSubmission.experience}
                >
                  Submit Resume
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Render job description modal
  const renderJobDescriptionModal = () => {
    if (!selectedRole || !showJobDescriptionModal) return null;

    return (
      <div
        id="job-description-modal"
        className="recruitment-modal"
        onClick={(e) => e.target.id === 'job-description-modal' && closeJobDescriptionModal()}
      >
        <div className="recruitment-modal-content" style={{ maxWidth: '700px' }}>
          <div className="recruitment-modal-header">
            <h2>Job Description - {selectedRole.role}</h2>
            <span className="recruitment-close" onClick={closeJobDescriptionModal}>&times;</span>
          </div>
          <div className="recruitment-modal-body">
            <div
              className="recruitment-job-description-content"
              dangerouslySetInnerHTML={{
                __html: selectedRole.jobDescription || 'No job description provided'
              }}
              style={{
                minHeight: '200px',
                padding: '15px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>
      </div>
    );
  };


  const renderSpecialNotesModal = () => {
    if (!selectedRole || !showSpecialNotesModal) return null;

    return (
      <div
        id="special-notes-modal"
        className="recruitment-modal"
        onClick={(e) => e.target.id === 'special-notes-modal' && closeSpecialNotesModal()}
      >
        <div className="recruitment-modal-content" style={{ maxWidth: '700px' }}>
          <div className="recruitment-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
            <h2 style={{ flex: 1, margin: 0, paddingRight: '30px' }}>Special Notes & Relevant Experience - {selectedRole.role}</h2>
            <span className="recruitment-close" onClick={closeSpecialNotesModal} style={{ flexShrink: 0, cursor: 'pointer' }}>&times;</span>
          </div>
          <div className="recruitment-modal-body">
            <div
              className="recruitment-special-notes-content"
              dangerouslySetInnerHTML={{
                __html: selectedRole.specialNotes || 'No special notes or relevant experience provided'
              }}
              style={{
                minHeight: '200px',
                padding: '15px',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                border: '1px solid #ddd',
                overflow: 'auto'
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  // NEW: Render Delete Confirmation Modal
  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirmModal || !roleToDelete) return null;

    // Get application count for this role
    const applicationCount = applicationsData[roleToDelete.id]?.length || 0;

    return (
      <div
        id="delete-confirm-modal"
        className="recruitment-modal"
        onClick={(e) => e.target.id === 'delete-confirm-modal' && closeDeleteConfirmModal()}
      >
        <div className="recruitment-modal-content" style={{ maxWidth: '500px' }}>
          <div className="recruitment-modal-header">
            <h2>Confirm Delete</h2>
            <span className="recruitment-close" onClick={closeDeleteConfirmModal}>&times;</span>
          </div>
          <div className="recruitment-modal-body">
            <p>Are you sure you want to delete this role?</p>
            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <strong style={{ color: '#dc3545' }}>{roleToDelete.role}</strong><br />
              <small>Job ID: {roleToDelete.jobId}</small><br />
              {/* <small>Database ID: {roleToDelete.id} (Type: {typeof roleToDelete.id})</small><br /> */}
              <small>Client: {roleToDelete.client}</small><br />
              <small>Status: {roleToDelete.status}</small>
            </div>
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#fff3cd',
              borderRadius: '4px',
              border: '1px solid #ffeaa7'
            }}>
              <p style={{ color: '#856404', margin: 0, fontSize: '14px' }}>
                ⚠️ This action cannot be undone. The application will be permanently deleted.
              </p>
            </div>
            {applicationCount > 0 && (
              <div style={{
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#fff3cd',
                borderRadius: '4px',
                border: '1px solid #ffeaa7'
              }}>
                <p style={{ color: '#856404', margin: 0 }}>
                  ⚠️ This role has {applicationCount} application(s).
                  {roleToDelete.status === 'Cancelled' || roleToDelete.status === 'Closed' ?
                    " Since the role is no longer active, you can safely delete it." :
                    " Deleting will remove all associated applications."
                  }
                </p>
              </div>
            )}

            <div className="recruitment-form-actions">
              <button
                type="button"
                className="recruitment-cancel-btn"
                onClick={closeDeleteConfirmModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="recruitment-cancel-btn"
                onClick={handleDeleteRole}
                style={{
                  background: 'linear-gradient(135deg, #009688)',
                  color: '#3d3737',
                  border: '2px solid #e1e5e9',
                  padding: '10px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                {applicationCount > 0 ? 'Delete with Applications' : 'Delete Role'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render role applications modal
  const renderRoleApplicationsModal = () => {
    if (!selectedRole) return null;

    const applications = applicationsData[selectedRole.id] || [];

  

    return (
      <>
        <div className="recruitment-role-summary">
          <div className="recruitment-role-header-actions">
            <h3 style={{ color: '#1a6f66ff', marginBottom: '15px' }}>Role Summary</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              {(isRecruiterView || isTeamLeadView) && (
                <button
                  className="recruitment-submit-resume-btn"
                  onClick={showResumeSubmission}
                >
                  Submit Resume
                </button>
              )}
            </div>
          </div>
          <div className="recruitment-profile-details">
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Job ID</div>
              <div className="recruitment-detail-value">{selectedRole.jobId || 'N/A'}</div>
            </div>

            <div className="recruitment-detail-item">
  <div className="recruitment-detail-label">GBAMS ID</div>
  <div className="recruitment-detail-value">{selectedRole.gbamsId || 'N/A'}</div>
</div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">System ID</div>
              <div className="recruitment-detail-value">{selectedRole.systemId || 'N/A'}</div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Role Title</div>
              <div className="recruitment-detail-value">{selectedRole.role || 'N/A'}</div>
            </div>

            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Role Type</div>
              <div className="recruitment-detail-value">{selectedRole.roleType || 'N/A'}</div>
            </div>
         <div className="recruitment-detail-item">
  <div className="recruitment-detail-label">Created</div>
  <div className="recruitment-detail-value">
    {selectedRole.createdAt ? new Date(selectedRole.createdAt).toLocaleString() : 'N/A'}
  </div>
</div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Client</div>
              <div className="recruitment-detail-value">{selectedRole.client || 'N/A'}</div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Client POC</div>
              <div className="recruitment-detail-value">{selectedRole.clientPOC || 'N/A'}</div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Location</div>
              <div className="recruitment-detail-value">
                {selectedRole.city || 'N/A'}, {selectedRole.state || 'N/A'}, {selectedRole.country || 'N/A'}
              </div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Work Mode</div>
              <div className="recruitment-detail-value">{selectedRole.roleLocation || 'N/A'}</div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Experience</div>
              <div className="recruitment-detail-value">{selectedRole.experience || 'N/A'}</div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Rate Range</div>
              <div className="recruitment-detail-value">
                {formatCurrency(selectedRole.minRate, selectedRole.currency)} -
                {formatCurrency(selectedRole.maxRate, selectedRole.currency)}
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '5px' }}>
                  {selectedRole.currency === 'INR' ? 'per month' : 'per hour'}
                </span>
              </div>
            </div>

{/* Add this to the role summary section */}
<div className="recruitment-detail-item">
  <div className="recruitment-detail-label">Visa Types</div>
  <div className="recruitment-detail-value">
    {selectedRole.visaTypes ? (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
        {selectedRole.visaTypes.split(',').map((visaType, index) => (
          <span 
            key={index}
            style={{
              backgroundColor: '#1a6f66ff',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px'
            }}
          >
            {visaType.trim()}
          </span>
        ))}
      </div>
    ) : 'N/A'}
  </div>
</div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Urgency</div>
              <div className="recruitment-detail-value">
                <span className={`recruitment-urgency-badge recruitment-urgency-${selectedRole.urgency?.toLowerCase() || 'normal'}`}>
                  {selectedRole.urgency || 'Normal'}
                </span>
              </div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Status</div>
              <div className="recruitment-detail-value">
                <span className={`recruitment-status-badge recruitment-status-${selectedRole.status?.toLowerCase() || 'active'}`}>
                  {selectedRole.status || 'Active'}
                </span>
              </div>
            </div>
            {/* {selectedRole.assignTo && (
              <div className="recruitment-detail-item">
                <div className="recruitment-detail-label">Assigned To</div>
                <div className="recruitment-detail-value">{selectedRole.assignTo}</div>
              </div>
            )} */}

            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Start Date</div>
              <div className="recruitment-detail-value">
                {selectedRole.startDate ? new Date(selectedRole.startDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">End Date</div>
              <div className="recruitment-detail-value">
                {selectedRole.endDate ? new Date(selectedRole.endDate).toLocaleDateString() : 'N/A'}
              </div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Profiles Needed</div>
              <div className="recruitment-detail-value">{selectedRole.profilesNeeded || '1'}</div>
            </div>
            <div className="recruitment-detail-item">
              <div className="recruitment-detail-label">Expense Paid</div>
              <div className="recruitment-detail-value">
                {selectedRole.expensePaid ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="recruitment-detail-item full-width">
              <div className="recruitment-detail-label">Special Notes & Relevant Experience</div>
              <div className="recruitment-detail-value clickable" onClick={showSpecialNotes}>
                Click to view special notes & relevant experience
              </div>
            </div>
            <div className="recruitment-detail-item full-width">
              <div className="recruitment-detail-label">Job Description</div>
              <div className="recruitment-detail-value clickable" onClick={showJobDescription}>
                Click to view full job description
              </div>
            </div>
          </div>
        </div>

        <div className="recruitment-profiles-list">
          <h3 style={{ color: '#1a6f66ff', margin: '20px 0 15px 0' }}>Candidate Applications</h3>
          {applications.length > 0 ? (
            applications.map(app => (
              <div key={app.id}
                className="recruitment-profile-card">
                {/* REMOVED onClick handler that was interfering with button clicks */}
                <div className="recruitment-profile-header">
                  <div className="recruitment-profile-name">{app.name}</div>
                  <div className="recruitment-profile-actions">
                    {/* <div className={`recruitment-status-badge recruitment-status-${app.status?.toLowerCase().replace(' ', '-') || 'applied'}`}>
                      {app.status || 'Applied'}
                    </div> */}
                    {/* Add submission time display */}
                    {app.appliedAt && (
                      <div className="recruitment-submission-time" style={{
                        fontSize: '12px',
                        color: '#666',
                        marginbottom: '7px',
                        // fontStyle: 'italic'
                        fontWeight: '700'
                      }}>
                        Submitted: {new Date(app.appliedAt).toLocaleString()}
                      </div>
                    )}


                    {/* Add submitter information */}
                    {app.submittedBy && (
                      <div className="recruitment-submitter-info" style={{
                        // fontSize: '12px',
                        // color: '#666',
                        // fontStyle: 'italic',
                        // marginTop: '4px'
                      }}>
                        Submitted by {app.submittedBy}
                      </div>
                    )}

                    {/* FIXED: Edit and Delete buttons with proper event handling */}
                    {(userRole === 'manager' || userRole === 'admin' || userRole === 'user' || userRole === 'teamlead') && (
                      <div className="recruitment-application-actions" style={{
                        display: 'flex',
                        gap: '8px',
                        marginLeft: '50%',
                        alignItems: 'center'
                      }}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Edit button clicked for application:', app.id);
                            openEditApplicationModal(app, e);
                          }}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            // backgroundColor: '#ffc107',
                            color: '#212529',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '36px',
                            height: '36px',
                            transition: 'all 0.2s ease',
                            fontWeight: '500'
                          }}
                          onMouseEnter={(e) => {
                            // e.target.style.backgroundColor = '#e0a800';
                            e.target.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            // e.target.style.backgroundColor = '#ffc107';
                            e.target.style.transform = 'scale(1)';
                          }}
                          title="Edit Application"
                        >
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Delete button clicked for application:', app.id);
                            openDeleteApplicationModal(app, e);
                          }}
                          style={{
                            padding: '8px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            // backgroundColor: '#ffc107',
                            color: '#212529',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '36px',
                            height: '36px',
                            transition: 'all 0.2s ease',
                            fontWeight: '500'
                          }}

                          title="Delete Application"
                        >
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="recruitment-profile-details"
                  onClick={(e) => {
                    // Only toggle hiring process when clicking on non-button elements
                    if (!e.target.closest('button') && !e.target.closest('.recruitment-application-actions')) {
                      toggleHiringProcess(app.id, e);
                    }
                  }}
                  style={{ cursor: 'pointer' }}

                >
                  <div className="recruitment-detail-item">
                    <div className="recruitment-detail-label">Email</div>
                    <div className="recruitment-detail-value">{app.email}</div>
                  </div>
                  <div className="recruitment-detail-item">
                    <div className="recruitment-detail-label">Phone</div>
                    <div className="recruitment-detail-value">{app.phone}</div>
                  </div>
                  <div className="recruitment-detail-item">
                    <div className="recruitment-detail-label">Experience</div>
                    <div className="recruitment-detail-value">{app.experience}</div>
                  </div>
                  <div className="recruitment-detail-item">
                    <div className="recruitment-detail-label">Current Company</div>
                    <div className="recruitment-detail-value">{app?.currentCompany || 'N/A'}</div>
                  </div>
                  <div className="recruitment-detail-item">
                    <div className="recruitment-detail-label">Expected Salary</div>
                    <div className="recruitment-detail-value">{app.expectedSalary || 'N/A'}</div>
                  </div>
                  <div className="recruitment-detail-item">
                    <div className="recruitment-detail-label">Notice Period</div>
                    <div className="recruitment-detail-value">{app.noticePeriod || 'N/A'}</div>
                  </div>
                  <div className="recruitment-detail-item">
                    <div className="recruitment-detail-label">Skills</div>
                    <div className="recruitment-detail-value">{app.skills || 'N/A'}</div>
                  </div>


                  {/* Resume Files Display */}
                  <div className="recruitment-detail-item">
                    <div className="recruitment-detail-label">Resumes</div>
                    <div className="recruitment-detail-value">
                      {applicationResumes[app.id] && applicationResumes[app.id].length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {applicationResumes[app.id].map((resume) => (
                            <div key={resume.id} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '4px',
                              border: '1px solid #e9ecef'
                            }}>
                              <button
                                className="recruitment-view-resume-link"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewResume(resume.id, app.id, e);
                                }}
                                disabled={resumeLoading}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#4c63d2',
                                  textDecoration: 'underline',
                                  cursor: resumeLoading ? 'wait' : 'pointer',
                                  padding: '0',
                                  font: 'inherit',
                                  textAlign: 'left'
                                }}
                              >
                                {resume.resumeFileName}
                              </button>


                            </div>
                          ))}
                        </div>
                      ) : app.resumeCount > 0 ? (
                        // Fallback: If we have resume count but no resume data in state
                        <div style={{ color: '#666', fontStyle: 'italic' }}>
                          {app.resumeCount} file(s) uploaded
                          <button
                            onClick={() => fetchApplicationResumes(app.id)}
                            style={{
                              marginLeft: '10px',
                              padding: '4px 8px',
                              backgroundColor: '#f8f9fa',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Load Resumes
                          </button>
                        </div>
                      ) : (
                        'No resumes uploaded'
                      )}
                    </div>
                  </div>
                </div>
                <div className="recruitment-hiring-progress">
                  <div className="recruitment-progress-header">
                    <span><strong>Current Step:</strong>
                      {hiringSteps[app.currentStep]?.stepName ||
                        (app.currentStep === 0 ? 'Applied' : `Step ${app.currentStep + 1}`)}
                    </span>
                    <span className="recruitment-step-number">
                      {(app.currentStep || 0) + 1}/{hiringSteps.length || 7}
                    </span>
                  </div>
                  <div className="recruitment-progress-bar">
                    <div
                      className="recruitment-progress-fill"
                      style={{
                        width: `${(((app.currentStep || 0) + 1) / (hiringSteps.length || 7)) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>

                {showHiringProcess[app.id] && (
                  <div className="recruitment-hiring-process">
                    {generateHiringSteps(app, selectedRole.id)}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="recruitment-no-applications">No applications yet for this role.</div>
          )}
        </div>
      </>
    );
  };




  // Render role cards for team leads with assign to recruiter functionality
  // Render role cards for team leads with assign to recruiter functionality
  const renderRoleCardsForTeamLead = () => {
    return filteredRoles.map(role => {
      const urgencyClass = role.urgency.toLowerCase();
      const statusClass = role.status.toLowerCase();
      const isEndingSoon = isRoleEndingSoon(role.endDate);

      return (
        <div
          key={role.id}
          className={`recruitment-role-card ${isEndingSoon ? 'recruitment-role-ending-soon' : ''}`}
          onClick={() => showRoleApplications(role)}
        >
          {isEndingSoon && (
            <div className="recruitment-ending-soon-banner">
              Ending Soon!
            </div>
          )}

          {/* NEW: Assign Multiple Recruiters button for team leads (same as managers) */}
          {(userRole === 'manager' || userRole === 'admin' || userRole === 'teamlead') && (
            <div className="recruitment-card-actions" style={{
              position: 'absolute',
              top: '10px',
              display: 'flex',
              gap: '5px',
              zIndex: 2
            }}>
              <button
                onClick={(e) => openMultipleAssignModal(role, e)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#28a77fff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Assign Multiple Recruiters"
              >
                <i className="fas fa-users"></i> Assign
              </button>
            </div>
          )}

          <div className="recruitment-role-header">
            <div className="recruitment-role-title">{role.role}</div>
            <div className={`recruitment-role-count recruitment-applications-badge`}>
            {role.applicationCount} {role.applicationCount === 1 ? 'Application' : 'Applications'}
          </div>
          </div>
          <div className="recruitment-role-details">
             <div className="recruitment-role-detail">
    <span><strong>Job ID:</strong> {role.jobId || 'N/A'}</span>
  </div>
   <div className="recruitment-role-detail">
  <span><strong>Created:</strong> {new Date(role.createdAt).toLocaleString()}</span>
</div>
            <div className="recruitment-role-detail">
              <span><strong>Client:</strong> {role.client}</span>
              <span className={`recruitment-status-badge recruitment-status-${statusClass}`}>{role.status}</span>
            </div>
<div className="recruitment-role-detail location-with-badge">
  <div className="location-content">
    <strong>Location:</strong> 
    <span className="location-text">{formatLocation(role)}</span>
  </div>
  <span className={`recruitment-mode-badge recruitment-mode-${role.roleLocation?.toLowerCase() || 'onsite'}`}>
    {role.roleLocation || 'Onsite'}
  </span>
</div>
            <div className="recruitment-role-detail">
              <span><strong>Experience:</strong> {role.experience}</span>
              <span className={`recruitment-urgency-badge recruitment-urgency-${urgencyClass}`}>{role.urgency}</span>
            </div>
            <div className="recruitment-role-detail">
              <span>
                <strong>Rate:</strong>
                {formatCurrency(role.minRate, role.currency)} - {formatCurrency(role.maxRate, role.currency)}
                <span className="rate-period">
                  {role.currency === 'INR' ? '/month' : '/hr'}
                </span>
              </span>
            </div>
            {role.assignTo && (
              <div className="recruitment-role-detail">
                <span><strong>Role Owner:</strong> {role.assignTo}</span>
              </div>
            )}
            {/* FIXED: Use renderAssignedRecruiters instead of just showing assignTo */}
            <div className="recruitment-role-detail">
              <span><strong>Assigned Recruiters:</strong> {renderAssignedRecruiters(role)}</span>
            </div>

            {role.endDate && (
              <div className="recruitment-role-detail">
                <span><strong>End Date:</strong> {new Date(role.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      );
    });
  };


  // State for assign recruiter modal
  const [showAssignRecruiterModal, setShowAssignRecruiterModal] = useState(false);
  const [roleToAssign, setRoleToAssign] = useState(null);
  const [selectedRecruiter, setSelectedRecruiter] = useState('');

  // Open assign recruiter modal
  const openAssignRecruiterModal = (role, e) => {
    e.stopPropagation();
    setRoleToAssign(role);
    setSelectedRecruiter(role.assignTo || '');
    setShowAssignRecruiterModal(true);
  };

  // Close assign recruiter modal
  const closeAssignRecruiterModal = () => {
    setShowAssignRecruiterModal(false);
    setRoleToAssign(null);
    setSelectedRecruiter('');
  };

  // Handle assign recruiter
  const handleAssignRecruiter = async () => {
    if (!roleToAssign || !selectedRecruiter) return;

    try {
      const token = localStorage.getItem('token');

      // Find the recruiter ID from the selected name
      const selectedRecruiterObj = recruiters.find(r => r.name === selectedRecruiter);

      if (!selectedRecruiterObj) {
        showNotification('Selected recruiter not found');
        return;
      }

      await axios.post(
        `${BASE_URL}/api/recruitment/roles/${roleToAssign.id}/assign-recruiter`,
        { recruiterId: selectedRecruiterObj.id },  // Send ID instead of name
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Refresh roles data
      const rolesResponse = await axios.get(`${BASE_URL}/api/recruitment/roles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRolesData(rolesResponse.data);

      closeAssignRecruiterModal();
      showNotification('Role assigned to recruiter successfully!');
    } catch (error) {
      console.error('Error assigning recruiter:', error);
      showNotification('Failed to assign role to recruiter. Please try again.');
    }
  };
  // Render assign recruiter modal
  const renderAssignRecruiterModal = () => {
    if (!showAssignRecruiterModal || !roleToAssign) return null;

    // Filter to only show recruiters with role 'user'
    const recruiterUsers = recruiters.filter(recruiter =>
      recruiter.role === 'user' || !recruiter.role // handle cases where role might be undefined
    );

    return (
      <div
        id="assign-recruiter-modal"
        className="recruitment-modal"
        onClick={(e) => e.target.id === 'assign-recruiter-modal' && closeAssignRecruiterModal()}
      >
        <div className="recruitment-modal-content" style={{ maxWidth: '500px' }}>
          <div className="recruitment-modal-header">
            <h2>Assign Role to Recruiter</h2>
            <span className="recruitment-close" onClick={closeAssignRecruiterModal}>&times;</span>
          </div>
          <div className="recruitment-modal-body">
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Role:</strong> {roleToAssign.role}</p>
              <p><strong>Client:</strong> {roleToAssign.client}</p>
            </div>

            <div className="recruitment-form-group">
              <label>Select Recruiter</label>
              <select
                value={selectedRecruiter}
                onChange={(e) => setSelectedRecruiter(e.target.value)}
                className="recruitment-add-role-select"
              >
                <option value="">Select Recruiter</option>
                {recruiterUsers.map((recruiter, index) => (
                  <option key={index} value={recruiter.name}>{recruiter.name}</option>
                ))}
              </select>
            </div>

            <div className="recruitment-form-actions">
              <button
                type="button"
                className="recruitment-cancel-btn"
                onClick={closeAssignRecruiterModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="recruitment-submit-btn"
                onClick={handleAssignRecruiter}
                disabled={!selectedRecruiter}
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render role cards (UPDATED with Edit and Delete buttons)
  const renderRoleCards = () => {
    return filteredRoles.map(role => {
      const urgencyClass = role.urgency.toLowerCase();
      const statusClass = role.status.toLowerCase();
      const isEndingSoon = isRoleEndingSoon(role.endDate);


      return (
        <div
          key={role.id}
          className={`recruitment-role-card ${isEndingSoon ? 'recruitment-role-ending-soon' : ''}`}
          onClick={() => showRoleApplications(role)}
        >
          {isEndingSoon && (
            <div className="recruitment-ending-soon-banner">
              Ending Soon!
            </div>
          )}

          {/* NEW: Edit and Delete buttons for managers */}
          {(userRole === 'manager' || userRole === 'admin' || userRole === 'teamlead') && (
            <div className="recruitment-card-actions" style={{
              position: 'absolute',
              top: '10px',
              display: 'flex',
              gap: '5px',
              zIndex: 2
            }}>
              <button
                onClick={(e) => openMultipleAssignModal(role, e)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#28a77fff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Assign Multiple Recruiters"
              >
                <i className="fas fa-users"></i> Assign
              </button>

              <button
                onClick={(e) => openEditRoleModal(role, e)}
                style={{
                  padding: '4px 8px',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Edit Role"
              >
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                </svg>
              </button>

              <button
                onClick={(e) => openDeleteConfirmModal(role, e)}
                style={{
                  padding: '4px 8px',
                  // backgroundColor: '#dc3545',
                  color: '#3d3737',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                title="Delete Role"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                </svg>
              </button>
            </div>
          )}

          <div className="recruitment-role-header">
            <div className="recruitment-role-title">{role.role}</div>
             <div className={`recruitment-role-count recruitment-applications-badge`}>
            {role.applicationCount} {role.applicationCount === 1 ? 'Application' : 'Applications'}
          </div>
          </div>
          <div className="recruitment-role-details">
            <div className="recruitment-role-detail">
              <span><strong>Job ID:</strong> {role.jobId || 'N/A'}</span>
            </div>
 
            
            <div className="recruitment-role-detail">
  <span><strong>Created:</strong> {new Date(role.createdAt).toLocaleString()}</span>
</div>
            <div className="recruitment-role-detail">
              <span><strong>Client:</strong> {role.client}</span>
              <span className={`recruitment-status-badge recruitment-status-${statusClass}`}>{role.status}</span>
            </div>
 <div className="recruitment-role-detail location-with-badge">
  <div className="location-content">
    <strong>Location:</strong> 
    <span className="location-text">{formatLocation(role)}</span>
  </div>
  <span className={`recruitment-mode-badge recruitment-mode-${role.roleLocation?.toLowerCase() || 'onsite'}`}>
    {role.roleLocation || 'Onsite'}
  </span>
</div>    
<div className="recruitment-role-detail">
              <span><strong>Experience:</strong> {role.experience}</span>
              <span className={`recruitment-urgency-badge recruitment-urgency-${urgencyClass}`}>{role.urgency}</span>
            </div>
            <div className="recruitment-role-detail">
              <span>
                <strong>Rate:</strong>
                {formatCurrency(role.minRate, role.currency)} - {formatCurrency(role.maxRate, role.currency)}
                <span className="rate-period">
                  {role.currency === 'INR' ? '/month' : '/hr'}
                </span>
              </span>
            </div>

            {role.assignTo && (
              <div className="recruitment-role-detail">
                <span><strong>Role Owner:</strong> {role.assignTo}</span>
              </div>
            )}
            {role.assignTo && (
              <div className="recruitment-role-detail">
                <span><strong>Assigned Recruiters:</strong> {renderAssignedRecruiters(role)}</span>
              </div>
            )}
            {role.endDate && (
              <div className="recruitment-role-detail">
                <span><strong>End Date:</strong> {new Date(role.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const [recruiterSearchTerm, setRecruiterSearchTerm] = useState('');

  // Add this function to render the multiple assign modal
  const renderMultipleAssignModal = () => {
    if (!showMultipleAssignModal || !roleToAssign) return null;

    return (
      <div
        id="multiple-assign-modal"
        className="recruitment-modal"
        onClick={(e) => e.target.id === 'multiple-assign-modal' && closeMultipleAssignModal()}
      >
        <div className="recruitment-modal-content" style={{ maxWidth: '600px' }}>
          <div className="recruitment-modal-header">
            <h2>Assign Recruiters to Role</h2>
            <span className="recruitment-close" onClick={closeMultipleAssignModal}>&times;</span>
          </div>
          <div className="recruitment-modal-body">
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Role:</strong> {roleToAssign.role}</p>
              <p><strong>Client:</strong> {roleToAssign.client}</p>
            </div>

            <div className="recruitment-form-group">
              <label>Select Recruiters</label>
              <div className="assign-to-container">
                <input
                  type="text"
                  className="recruitment-add-role-input"
                  placeholder="Search recruiters..."
                  value={recruiterSearchTerm}
                  onChange={(e) => setRecruiterSearchTerm(e.target.value)}
                  onFocus={() => setShowRecruiterDropdown(true)}
                  onBlur={() => setTimeout(() => setShowRecruiterDropdown(false), 200)}
                />

                {/* Selected recruiters display */}
                <div className="selected-recruiters" style={{ marginTop: '10px', marginBottom: '10px' }}>
                  {selectedRecruiters.map(recruiterId => {
                    const recruiter = recruiters.find(r => r.id === recruiterId);
                    return recruiter ? (
                      <span key={recruiterId} className="badge bg-primary me-1 mb-1">
                        {recruiter.name}
                        {/* {recruiter.role && recruiter.role !== 'user' && `(${recruiter.role})`} */}
                        <button
                          type="button"
                          className="btn-close btn-close-white ms-1"
                          onClick={() => handleRecruiterSelection(recruiterId)}
                          style={{ fontSize: '10px' }}
                        ></button>
                      </span>
                    ) : null;
                  })}
                </div>

                {/* Dropdown for recruiter selection */}
                {showRecruiterDropdown && (
                  <div className="recruiter-dropdown" style={{
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    zIndex: 1000
                  }}>
                   {recruiters
  .filter(recruiter => {
    // Search filtering using state
    const matchesSearch = recruiter.name.toLowerCase().includes(recruiterSearchTerm.toLowerCase());

    if (userRole === 'manager' || userRole === 'admin') {
      return matchesSearch; // Show filtered recruiters for managers
    }
    else if (userRole === 'teamlead') {
      // Team leads can see regular users AND other team leads (including themselves)
      return (recruiter.role === 'user' || recruiter.role === 'teamlead') && matchesSearch;
    }
    return false;
  })
  .map((recruiter, index) => (
    <div
      key={index}
      className={`recruiter-option ${selectedRecruiters.includes(recruiter.id) ? 'selected' : ''}`}
      onClick={() => handleRecruiterSelection(recruiter.id)}
      style={{
        padding: '8px 12px',
        cursor: 'pointer',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: selectedRecruiters.includes(recruiter.id) ? '#ebeff1ff' : 'transparent'
      }}
    >
      <input
        type="checkbox"
        checked={selectedRecruiters.includes(recruiter.id)}
        readOnly
        style={{ marginRight: '8px' }}
      />
      <span>
        {recruiter.name}
        {/* {recruiter.role && recruiter.role !== 'user' && ` (${recruiter.role})`} */}
      </span>
    </div>
  ))
}
                  </div>
                )}
              </div>
            </div>

            <div className="recruitment-form-actions">
              <button
                type="button"
                className="recruitment-cancel-btn"
                onClick={closeMultipleAssignModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="recruitment-submit-btn"
                onClick={handleMultipleRecruiterAssignment}
                disabled={selectedRecruiters.length === 0}
              >
                Assign Recruiters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };




  // Render Edit Application Modal
  const renderEditApplicationModal = () => {
    if (!showEditApplicationModal || !applicationToEdit) return null;

    // Get existing resumes for this application
    const existingResumes = applicationResumes[applicationToEdit.id] || [];

    return (
      <div
        id="edit-application-modal"
        className="recruitment-modal"
        style={{ zIndex: 10001 }}
        onClick={(e) => e.target.id === 'edit-application-modal' && closeEditApplicationModal()}
      >
        <div className="recruitment-modal-content" style={{ maxWidth: '800px', maxHeight: '90vh', overflow: 'auto' }}>
          <div className="recruitment-modal-header">
            <h2>Edit Application - {applicationToEdit.name}</h2>
            <span className="recruitment-close" onClick={closeEditApplicationModal}>&times;</span>
          </div>
          <div className="recruitment-modal-body">
            <form onSubmit={handleEditApplicationSubmit} className="recruitment-resume-form">

              {/* Personal Information Section */}
              <div className="form-section" style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#1a6f66ff', marginBottom: '15px', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                  Personal Information
                </h3>

                <div className="recruitment-form-row">
                  <div className="recruitment-form-group">
                    <label>Full Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={editApplicationData.name}
                      onChange={handleEditApplicationChange}
                      required
                      className="recruitment-form-input"
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="recruitment-form-group">
                    <label>Email*</label>
                    <input
                      type="email"
                      name="email"
                      value={editApplicationData.email}
                      onChange={handleEditApplicationChange}
                      required
                      className="recruitment-form-input"
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                <div className="recruitment-form-row">
                  <div className="recruitment-form-group">
                    <label>Phone*</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editApplicationData.phone}
                      onChange={handleEditApplicationChange}
                      required
                      className="recruitment-form-input"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="recruitment-form-group">
                    <label>Current Location</label>
                    <input
                      type="text"
                      name="location"
                      value={editApplicationData.location}
                      onChange={handleEditApplicationChange}
                      className="recruitment-form-input"
                      placeholder="Enter current location"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="form-section" style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#1a6f66ff', marginBottom: '15px', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                  Professional Information
                </h3>

                <div className="recruitment-form-row">
                  <div className="recruitment-form-group">
                    <label>Experience*</label>
                    <input
                      type="text"
                      name="experience"
                      value={editApplicationData.experience}
                      onChange={handleEditApplicationChange}
                      required
                      className="recruitment-form-input"
                      placeholder="e.g., 5 years"
                    />
                  </div>
                  <div className="recruitment-form-group">
                    <label>Current Company</label>
                    <input
                      type="text"
                      name="currentCompany"
                      value={editApplicationData.currentCompany}
                      onChange={handleEditApplicationChange}
                      className="recruitment-form-input"
                      placeholder="Enter current company"
                    />
                  </div>
                </div>

                <div className="recruitment-form-row">
                  <div className="recruitment-form-group">
                    <label>Expected Salary</label>
                    <input
                      type="text"
                      name="expectedSalary"
                      value={editApplicationData.expectedSalary}
                      onChange={handleEditApplicationChange}
                      className="recruitment-form-input"
                      placeholder="e.g., 12 LPA"
                    />
                  </div>
                  <div className="recruitment-form-group">
                    <label>Notice Period</label>
                    <input
                      type="text"
                      name="noticePeriod"
                      value={editApplicationData.noticePeriod}
                      onChange={handleEditApplicationChange}
                      className="recruitment-form-input"
                      placeholder="e.g., 30 days"
                    />
                  </div>
                </div>

                <div className="recruitment-form-group full-width">
                  <label>Skills</label>
                  <textarea
                    name="skills"
                    value={editApplicationData.skills}
                    onChange={handleEditApplicationChange}
                    className="recruitment-form-textarea"
                    rows="4"
                    placeholder="Enter key skills separated by commas"
                    style={{
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
              {/* Resume Upload Section - UPDATED FOR MULTI-FILE SUPPORT */}
              <div className="form-section" style={{ marginBottom: '25px' }}>
                <h3 style={{ color: '#1a6f66ff', marginBottom: '15px', borderBottom: '1px solid #e0e0e0', paddingBottom: '8px' }}>
                  Resume Files
                </h3>

                <div className="recruitment-form-group full-width">


                  {/* Display existing resumes */}
                  {existingResumes.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ marginBottom: '10px', color: '#1a6f66ff' }}>Existing Resumes:</h4>
                      {existingResumes.map((resume) => (
                        <div key={resume.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '10px',
                          backgroundColor: '#f8f9ff',
                          borderRadius: '6px',
                          border: '1px solid #e0e0e0',
                          marginBottom: '10px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', color: '#1d9488ff' }}>
                              {resume.resumeFileName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              Uploaded: {new Date(resume.uploadedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                viewResume(resume.id, applicationToEdit.id, e);
                              }}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: 'transparent',
                                color: '#4c63d2',
                                border: '1px solid #4c63d2',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.preventDefault();

                                const confirmed = window.confirm(
                                  `Are you sure you want to delete "${resume.resumeFileName}"?\n\nThis action cannot be undone.`
                                );

                                if (confirmed) {
                                  try {
                                    const token = localStorage.getItem('token');
                                    await axios.delete(
                                      `${BASE_URL}/api/recruitment/applications/resumes/${resume.id}`,
                                      {
                                        headers: { Authorization: `Bearer ${token}` }
                                      }
                                    );

                                    await fetchApplicationResumes(applicationToEdit.id);
                                    showNotification('Resume deleted successfully!');
                                  } catch (error) {
                                    console.error('Error deleting resume:', error);
                                    showNotification('Failed to delete resume. Please try again.');
                                  }
                                }
                              }}
                              style={{
                                padding: '5px 10px',
                                backgroundColor: 'transparent',
                                color: '#dc3545',
                                border: '1px solid #dc3545',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Delete
                            </button>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new resumes */}
                  <div style={{ marginBottom: '15px' }}>
                    <h4 style={{ marginBottom: '10px', color: '#1a6f66ff' }}>Add New Resumes:</h4>

                    {/* Hidden file input for multiple files */}
                    <input
                      type="file"
                      name="resumeFiles"
                      id="edit-resume-files-input"
                      onChange={handleEditApplicationChange}
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      multiple
                    />

                    {/* Custom file upload button */}
                    <div
                      onClick={() => document.getElementById('edit-resume-files-input').click()}
                      style={{
                        padding: '15px',
                        border: '2px dashed #23a396ff',
                        borderRadius: '8px',
                        backgroundColor: '#f8f9ff',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {editApplicationData.resumeFiles && editApplicationData.resumeFiles.length > 0 ? (
                        <div>
                          <div style={{ color: '#1a6f66ff', fontWeight: 'bold', marginBottom: '5px' }}>
                            ✅ {editApplicationData.resumeFiles.length} file(s) selected
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>
                            Click to change files
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ color: '#1d9488ff', fontWeight: 'bold', marginBottom: '5px' }}>
                            Add New Resume Files
                          </div>
                          <div style={{ color: '#666', fontSize: '12px' }}>
                            Accepted formats: PDF, DOC, DOCX (Max 5MB per file)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Show selected new files */}
                    {editApplicationData.resumeFiles && editApplicationData.resumeFiles.length > 0 && (
                      <div style={{ marginTop: '15px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>New files to upload:</div>
                        {Array.from(editApplicationData.resumeFiles).map((file, index) => (
                          <div key={index} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px',
                            backgroundColor: '#f0f4ff',
                            borderRadius: '4px',
                            marginBottom: '5px'
                          }}>
                            <span style={{ fontSize: '14px' }}>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newFiles = Array.from(editApplicationData.resumeFiles);
                                newFiles.splice(index, 1);
                                setEditApplicationData(prev => ({
                                  ...prev,
                                  resumeFiles: newFiles
                                }));
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ff4757',
                                cursor: 'pointer',
                                fontSize: '16px'
                              }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="recruitment-form-actions" style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '15px',
                marginTop: '30px',
                paddingTop: '20px',
                borderTop: '1px solid #e0e0e0'
              }}>
                <button
                  type="button"
                  className="recruitment-cancel-btn"
                  onClick={closeEditApplicationModal}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="recruitment-submit-btn"
                  disabled={!editApplicationData.name || !editApplicationData.email || !editApplicationData.phone || !editApplicationData.experience}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: !editApplicationData.name || !editApplicationData.email || !editApplicationData.phone || !editApplicationData.experience ? '#ccc' : '#1a887aff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: !editApplicationData.name || !editApplicationData.email || !editApplicationData.phone || !editApplicationData.experience ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                  }}
                >
                  Update Application
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Render Delete Application Confirmation Modal
  const renderDeleteApplicationModal = () => {
    if (!showDeleteApplicationModal || !applicationToDelete) return null;

    return (
      <div
        id="delete-application-modal"
        className="recruitment-modal"
        onClick={(e) => e.target.id === 'delete-application-modal' && closeDeleteApplicationModal()}
      >
        <div className="recruitment-modal-content" style={{ maxWidth: '500px' }}>
          <div className="recruitment-modal-header">
            <h2>Confirm Delete</h2>
            <span className="recruitment-close" onClick={closeDeleteApplicationModal}>&times;</span>
          </div>
          <div className="recruitment-modal-body">
            <p>Are you sure you want to delete this application?</p>
            <div style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #e9ecef'
            }}>
              <strong style={{ color: '#dc3545' }}>{applicationToDelete.name}</strong><br />
              <small>Email: {applicationToDelete.email}</small><br />
              <small>Phone: {applicationToDelete.phone}</small><br />
              <small>Experience: {applicationToDelete.experience}</small>
            </div>

            <div style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: '#fff3cd',
              borderRadius: '4px',
              border: '1px solid #ffeaa7'
            }}>
              <p style={{ color: '#856404', margin: 0, fontSize: '14px' }}>
                ⚠️ This action cannot be undone. The application will be permanently deleted.
              </p>
            </div>

            <div className="recruitment-form-actions" >
              <button
                type="button"
                className="recruitment-cancel-btn"
                onClick={closeDeleteApplicationModal}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="recruitment-delete-btn"
                onClick={handleDeleteApplication}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#009688',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete Application
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // Render add role modal (UPDATED to handle both add and edit)
  const renderAddRoleModal = () => {
    const modalTitle = isEditMode ? 'Edit Role' : 'Add New Role';
    const submitButtonText = isEditMode ? 'Update Role' : 'Add Role';
    const isVisible = showAddRoleModal || showEditRoleModal;

    if (!isVisible) return null;

    return (
      <div
        id="add-role-modal"
        className="recruitment-add-role-modal"
        onClick={(e) => {
          if (e.target.id === 'add-role-modal') {
            if (isEditMode) {
              closeEditRoleModal();
            } else {
              setShowAddRoleModal(false);
            }
          }
        }}
      >
        <div className="recruitment-add-role-modal-content">
          <div className="recruitment-add-role-modal-header">
            <h2>{modalTitle}</h2>
            <span
              className="recruitment-add-role-close"
              onClick={() => {
                if (isEditMode) {
                  closeEditRoleModal();
                } else {
                  setShowAddRoleModal(false);
                }
              }}
            >
              &times;
            </span>
          </div>

          <div className="recruitment-add-role-modal-body">
            <form onSubmit={handleAddRoleSubmit} className="recruitment-add-role-form">
              {/* Job ID and Role Title on same row */}
              <div className="recruitment-add-role-form-row">
              <div className="recruitment-add-role-form-group">
    <label>Job ID*</label>
    <input
      type="text"
      name="jobId"
      value={newRole.jobId || ''}
      onChange={handleNewRoleChange}
      required
      placeholder="Enter job ID"
      className="recruitment-add-role-input"
      disabled={isEditMode}
    />
  </div>
  <div className="recruitment-add-role-form-group">
    <label>GBAMS ID</label>
    <input
      type="text"
      name="gbamsId"
      value={newRole.gbamsId || ''}
      onChange={handleNewRoleChange}
      placeholder="Enter GBAMS ID"
      className="recruitment-add-role-input"
    />
  </div>

                <div className="recruitment-add-role-form-group">
                  <label>Role Title*</label>
                  <div className="recruitment-editable-dropdown">
                    <input
                      type="text"
                      name="role"
                      value={newRole.role}
                      onChange={handleNewRoleChange}
                      onFocus={(e) => {
                        const dropdown = e.target.nextElementSibling;
                        dropdown.style.display = 'block';
                      }}
                      onBlur={(e) => {
                        setTimeout(() => {
                          const dropdown = e.target.nextElementSibling;
                          dropdown.style.display = 'none';
                        }, 200);
                      }}
                      required
                      placeholder="Select or type role title"
                      className="recruitment-add-role-input"
                      autoComplete="off"
                    />
                    <div className="recruitment-dropdown-options" style={{ display: 'none' }}>
                      {roleTitles
                        .filter(title => title.toLowerCase().includes(newRole.role.toLowerCase()))
                        .map((title, index) => (
                          <div
                            key={index}
                            className="recruitment-dropdown-option"
                          >
                            <span
                              className="recruitment-option-text"
                              onClick={() => {
                                setNewRole(prev => ({ ...prev, role: title }));
                              }}
                            >
                              {title}
                            </span>
                            <button
                              className="recruitment-option-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoleTitles(prev => prev.filter(t => t !== title));
                              }}
                              title="Delete this option"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Type and Client on same row */}
              <div className="recruitment-add-role-form-row">
                <div className="recruitment-add-role-form-group">
                  <label>Role Type*</label>
                  <select
                    name="roleType"
                    value={newRole.roleType}
                    onChange={handleNewRoleChange}
                    required
                    className="recruitment-add-role-select"
                  >
                    <option value="Full-time">Full-time</option>
                    {roleTypes.filter(type => type !== "Full-time").map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="recruitment-add-role-form-group">
                  <label>Client*</label>
                  <div className="recruitment-editable-dropdown">
                    <input
                      type="text"
                      name="client"
                      value={newRole.client}
                      onChange={handleNewRoleChange}
                      onFocus={(e) => {
                        const dropdown = e.target.nextElementSibling;
                        dropdown.style.display = 'block';
                      }}
                      onBlur={(e) => {
                        setTimeout(() => {
                          const dropdown = e.target.nextElementSibling;
                          dropdown.style.display = 'none';
                        }, 200);
                      }}
                      required
                      placeholder="Select or type client name"
                      className="recruitment-add-role-input"
                      autoComplete="off"
                    />
                    <div className="recruitment-dropdown-options" style={{ display: 'none' }}>
                      {clients
                        .filter(client => client.toLowerCase().includes(newRole.client.toLowerCase()))
                        .map((client, index) => (
                          <div
                            key={index}
                            className="recruitment-dropdown-option"
                          >
                            <span
                              className="recruitment-option-text"
                              onClick={() => {
                                setNewRole(prev => ({ ...prev, client: client }));
                              }}
                            >
                              {client}
                            </span>
                            <button
                              className="recruitment-option-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClients(prev => prev.filter(c => c !== client));
                              }}
                              title="Delete this option"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Keep Country and State as regular selects */}
              <div className="recruitment-add-role-form-row">
                <div className="recruitment-add-role-form-group">
                  <label>Country*</label>
                 <select
  name="country"
  value={getCountryName(newRole.country)}
  onChange={handleCountryChange}
  required
  className="recruitment-add-role-select"
>
  <option value="">Select Country</option>
  {countries.map((country, index) => (
    <option key={index} value={country.name}>{country.name}</option>
  ))}
</select>
                </div>
               <div className="recruitment-add-role-form-group">
  <label>
    States
    {newRole.roleLocation !== 'Remote' && <span style={{ color: 'black' }}>*</span>}
  </label>
  <div className="states-multi-select" style={{
    border: '1px solid #ddd',
    borderRadius: '4px',
    // padding: '10px',
    maxHeight: '150px',
    overflowY: 'auto',
    // backgroundColor: '#f9f9f9'
  }}>

      {/* Selected States Display - MOVED TO TOP */}
    {selectedStates.length > 0 && (
      <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
          Selected States:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {selectedStates.map((state, index) => (
            <span 
              key={index}
              style={{
                backgroundColor: '#30aea1ff',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {state}
              <button
                type="button"
                onClick={() => handleRemoveState(state)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px',
                  padding: '0',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    )}
    <div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
        Select one or more states
      </div>
      {states.map((state, index) => (
        <div key={index} className="state-option" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
         
        }}>
          <input
            type="checkbox"
            id={`state-${index}`}
            checked={selectedStates.includes(state)}
            onChange={() => handleStateSelection(state)}
            disabled={!newRole.country}
            style={{ margin: '0' }}
          />
          <label 
            htmlFor={`state-${index}`}
            style={{ 
              margin: '0',
              fontSize: '14px',
              cursor: 'pointer',
              flex: 1
            }}
          >
            {state}
          </label>
        </div>
      ))}
    </div>
    
   
   
  </div>
  {validationErrors.state && (
    <div className="error-message">{validationErrors.state}</div>
  )}
</div>
              </div>

              <div className="recruitment-add-role-form-row">
               <div className="recruitment-add-role-form-group">
  <label>
    Cities
    {newRole.roleLocation !== 'Remote' && <span style={{ color: 'black' }}>*</span>}
  </label>
  <div className="cities-multi-input">
    <div style={{ display: 'flex', gap: '8px', }}>
      <input
        type="text"
        value={cityInput}
        onChange={handleCityInputChange}
        placeholder="Enter city name"
        className="recruitment-add-role-input"
        style={{ flex: 1 }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCity();
          }
        }}
      />
      <button
        type="button"
        onClick={handleAddCity}
        disabled={!cityInput.trim()}
        style={{
          padding: '8px 12px',
          backgroundColor: cityInput.trim() ? '#30aea1ff' : '#ccc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: cityInput.trim() ? 'pointer' : 'not-allowed',
          fontSize: '12px'
        }}
      >
        Add
      </button>
    </div>
    
    {/* Selected Cities Display */}
    {selectedCities.length > 0 && (
      <div>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
          Selected Cities:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {selectedCities.map((city, index) => (
            <span 
              key={index}
              style={{
                backgroundColor: '#1a6f66ff',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {city}
              <button
                type="button"
                onClick={() => handleRemoveCity(city)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '0',
                  width: '16px',
                  height: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
  {validationErrors.city && (
    <div className="error-message">{validationErrors.city}</div>
  )}
</div>

                <div className="recruitment-add-role-form-group">
                  <label>Work Mode*</label>
                  <select
                    name="roleLocation"
                    value={newRole.roleLocation}
                    onChange={handleNewRoleChange}
                    required
                    className="recruitment-add-role-select"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="recruitment-add-role-form-row">
                <div className="recruitment-add-role-form-group">
                  <label>Experience Level*</label>
                  <div className="recruitment-editable-dropdown">
                    <input
                      type="text"
                      name="experience"
                      value={newRole.experience}
                      onChange={handleNewRoleChange}
                      onFocus={(e) => {
                        const dropdown = e.target.nextElementSibling;
                        dropdown.style.display = 'block';
                      }}
                      onBlur={(e) => {
                        setTimeout(() => {
                          const dropdown = e.target.nextElementSibling;
                          dropdown.style.display = 'none';
                        }, 200);
                      }}
                      required
                      placeholder="Select or type experience level"
                      className="recruitment-add-role-input"
                      autoComplete="off"
                    />
                    <div className="recruitment-dropdown-options" style={{ display: 'none' }}>
                      {experienceLevels
                        .filter(level => level.toLowerCase().includes(newRole.experience.toLowerCase()))
                        .map((level, index) => (
                          <div
                            key={index}
                            className="recruitment-dropdown-option"
                          >
                            <span
                              className="recruitment-option-text"
                              onClick={() => {
                                setNewRole(prev => ({ ...prev, experience: level }));
                              }}
                            >
                              {level}
                            </span>
                            <button
                              className="recruitment-option-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Note: experienceLevels is a const array, so you may want to make it a state variable
                                // For now, this won't work unless you change experienceLevels to a state variable
                                console.warn('Cannot delete experience level - make experienceLevels a state variable');
                              }}
                              title="Delete this option"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
                <div className="recruitment-add-role-form-group">
                  <label>Priority*</label>
                  <select
                    name="urgency"
                    value={newRole.urgency}
                    onChange={handleNewRoleChange}
                    required
                    className="recruitment-add-role-select"
                  >
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              {/* Continue with Rate and Currency row */}
              <div className="recruitment-add-role-form-row">
                <div className="recruitment-add-role-form-group">
                  <label>
                    Min Rate*
                    <span className="field-hint">
                      ({newRole.currency === 'INR' ? '₹' :
                        newRole.currency === 'USD' ? '$' :
                          `${newRole.currency}`})
                    </span>
                  </label>
                  <div className="rate-input-container">

                    <input
                      type="number"
                      name="minRate"
                      value={newRole.minRate}
                      onChange={handleNewRoleChange}
                      required
                      placeholder={newRole.currency === 'INR' ? '500000' : '50000'}
                      min="0"
                      // step="1000"
                      className={`recruitment-add-role-input rate-input ${validationErrors.minRate ? 'error' : ''
                        }`}
                    />
                  </div>
                  {validationErrors.minRate && (
                    <div className="error-message">{validationErrors.minRate}</div>
                  )}
                </div>

                <div className="recruitment-add-role-form-group">
                  <label>
                    Max Rate*
                    <span className="field-hint">
                      ({newRole.currency === 'INR' ? '₹' :
                        newRole.currency === 'USD' ? '$' :
                          `${newRole.currency}`})
                    </span>
                  </label>
                  <div className="rate-input-container">
                    {/* <span className="currency-prefix">
        {newRole.currency === 'INR' ? '₹' : 
         newRole.currency === 'USD' ? '$' : 
         newRole.currency === 'EUR' ? '€' : 
         newRole.currency === 'GBP' ? '£' : newRole.currency}
      </span> */}
                    <input
                      type="number"
                      name="maxRate"
                      value={newRole.maxRate}
                      onChange={handleNewRoleChange}
                      required
                      placeholder={newRole.currency === 'INR' ? '1200000' : '120000'}
                      min="0"
                      // step="1000"
                      className={`recruitment-add-role-input rate-input ${validationErrors.maxRate ? 'error' : ''
                        }`}
                    />
                  </div>
                  {validationErrors.maxRate && (
                    <div className="error-message">{validationErrors.maxRate}</div>
                  )}
                </div>

                <div className="recruitment-add-role-form-group">
                  <label>Currency*</label>
                  <select
                    name="currency"
                    value={newRole.currency}
                    onChange={handleNewRoleChange}
                    required
                    className="recruitment-add-role-select"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
              {validationErrors.rateRange && (
                <div className="form-row-error">
                  <div className="error-message">{validationErrors.rateRange}</div>
                </div>
              )}

              {/* Rate Preview */}
              {newRole.minRate && newRole.maxRate && !validationErrors.rateRange && (
                <div className="rate-preview">
                  <span className="preview-label">Rate Range Preview:</span>
                  <span className="preview-value">
                    {newRole.currency === 'INR' ? '₹' :
                      newRole.currency === 'USD' ? '$' :
                        newRole.currency === 'EUR' ? '€' :
                          newRole.currency === 'GBP' ? '£' : newRole.currency}
                    {Number(newRole.minRate).toLocaleString()} -
                    {newRole.currency === 'INR' ? '₹' :
                      newRole.currency === 'USD' ? '$' :
                        newRole.currency === 'EUR' ? '€' :
                          newRole.currency === 'GBP' ? '£' : newRole.currency}
                    {Number(newRole.maxRate).toLocaleString()}
                    <span className="rate-type">
                      {newRole.roleType === 'Contract' ? ' ' : ' '}
                    </span>
                  </span>
                </div>
              )}

              <div className="recruitment-add-role-form-row">
                <div className="recruitment-add-role-form-group">
                  <label>Client POC*</label>
                  <div className="recruitment-editable-dropdown">
                    <input
                      type="text"
                      name="clientPOC"
                      value={newRole.clientPOC || ''}
                      onChange={handleNewRoleChange}
                      onFocus={(e) => {
                        const dropdown = e.target.nextElementSibling;
                        dropdown.style.display = 'block';
                      }}
                      onBlur={(e) => {
                        setTimeout(() => {
                          const dropdown = e.target.nextElementSibling;
                          dropdown.style.display = 'none';
                        }, 200);
                      }}
                      required
                      placeholder="Select or type client POC name"
                      className="recruitment-add-role-input"
                      autoComplete="off"
                    />
                    <div className="recruitment-dropdown-options" style={{ display: 'none' }}>
                      {clientPOCs
                        .filter(poc => poc.toLowerCase().includes((newRole.clientPOC || '').toLowerCase()))
                        .map((poc, index) => (
                          <div
                            key={index}
                            className="recruitment-dropdown-option"
                          >
                            <span
                              className="recruitment-option-text"
                              onClick={() => {
                                setNewRole(prev => ({ ...prev, clientPOC: poc }));
                              }}
                            >
                              {poc}
                            </span>
                            <button
                              className="recruitment-option-delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                setClientPOCs(prev => prev.filter(p => p !== poc));
                              }}
                              title="Delete this option"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>


                <div className="recruitment-add-role-form-group">
                  <label>Status*</label>
                  <select
                    name="status"
                    value={newRole.status}
                    onChange={handleNewRoleChange}
                    required
                    className="recruitment-add-role-select"
                  >
                    {statusOptions.map((status, index) => (
                      <option key={index} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Rest of the form remains the same */}
              <div className="recruitment-add-role-form-row">
                <div className="recruitment-add-role-form-group">
                  <label>Start Date*</label>
                  <input
                    type="date"
                    name="startDate"
                    value={newRole.startDate}
                    onChange={handleNewRoleChange}
                    required
                    className="recruitment-add-role-input"
                  />
                </div>
                <div className="recruitment-add-role-form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={newRole.endDate || ''}
                    onChange={handleNewRoleChange}
                    className="recruitment-add-role-input"
                  />
                </div>
              </div>

              <div className="recruitment-add-role-form-row">
                <div className="recruitment-add-role-form-group">
                  <label>Profiles Needed*</label>
                  <input
                    type="number"
                    name="profilesNeeded"
                    value={newRole.profilesNeeded}
                    onChange={handleNewRoleChange}
                    required
                    min="1"
                    className="recruitment-add-role-input"
                  />
                </div>

                <div className="recruitment-add-role-form-row">
                  <div className="recruitment-add-role-form-group">
                    <label>Role Owner*</label>
                    <select
                      name="assignTo"
                      value={newRole.assignTo}
                      onChange={handleNewRoleChange}
                      required
                      className="recruitment-add-role-selection"
                    >
                      <option value="">Select Role Owner</option>
                      {recruiters
                        .filter(recruiter =>
                          recruiter.role === 'user' ||
                          recruiter.role === 'teamlead' ||
                          recruiter.role === 'manager' ||
                          !recruiter.role
                        )
                        .map((recruiter, index) => (
                          <option key={index} value={recruiter.name}>
                            {recruiter.name}
                            {/* {recruiter.role && recruiter.role !== 'user' ? ` (${recruiter.role})` : ''} */}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="recruitment-add-role-form-group">
                  <label>Expense Paid</label>
                  <div className="recruitment-checkbox-container">
                    <input
                      type="checkbox"
                      name="expensePaid"
                      checked={newRole.expensePaid}
                      onChange={handleNewRoleChange}
                      className="recruitment-add-role-checkbox"
                    />
                    <span className="recruitment-checkbox-label">Yes</span>
                  </div>
                </div>
              </div>

              {/* Visa Types Section */}
<div className="recruitment-add-role-form-group full-width">
  <label>Visa Types</label>
  <div className="visa-types-container" style={{
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '10px',
    maxHeight: '150px',
    overflowY: 'auto',
    backgroundColor: '#f9f9f9'
  }}>
    <div className="visa-types-grid" style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '8px'
    }}>
      {visaTypesOptions.map((visaType, index) => (
        <div key={index} className="visa-type-option" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <input
            type="checkbox"
            id={`visa-${index}`}
            checked={newRole.visaTypes?.includes(visaType) || false}
            onChange={() => handleVisaTypeSelection(visaType)}
            style={{ margin: '0' }}
          />
          <label 
            htmlFor={`visa-${index}`}
            style={{ 
              margin: '0',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {visaType}
          </label>
        </div>
      ))}
    </div>
    
    {/* Selected Visa Types Display */}
    {newRole.visaTypes && newRole.visaTypes.length > 0 && (
      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #eee' }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
          Selected Visa Types:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {newRole.visaTypes.map((visaType, index) => (
            <span 
              key={index}
              style={{
                backgroundColor: '#30aea1ff',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px'
              }}
            >
              {visaType}
            </span>
          ))}
        </div>
      </div>
    )}
  </div>
</div>

              <div className="recruitment-add-role-form-group full-width">
                <label>Special Notes & Relevant Experience</label>
                <div className="rich-text-editor-container">
                  <ReactQuill
                    value={newRole.specialNotes || ''}
                    onChange={(value) => handleRichTextChange('specialNotes', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter any special notes or instructions
                    e.g.,Java: 3 years, Spring Boot: 2 years, AWS: 1 year"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      minHeight: '120px'
                    }}
                  />
                </div>
              </div>

              <div className="recruitment-add-role-form-group full-width">
                <label>Job Description</label>
                <div className="rich-text-editor-container">
                  <ReactQuill
                    value={newRole.jobDescription || ''}
                    onChange={(value) => handleRichTextChange('jobDescription', value)}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Enter detailed job description"
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '4px',
                      minHeight: '150px'
                    }}
                  />
                </div>
              </div>
              <div className="recruitment-add-role-form-actions">
                <button
                  type="button"
                  className="recruitment-add-role-cancel-btn"
                  onClick={() => {
                    if (isEditMode) {
                      closeEditRoleModal();
                    } else {
                      setShowAddRoleModal(false);
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="recruitment-add-role-submit-btn"
                >
                  {submitButtonText}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

// Add these functions near your other functions
const openReportColumnModal = (period) => {
  setSelectedReportPeriod(period);
  
  // Reset all columns to visible when opening the modal
  setReportColumns(prev => 
    prev.map(col => ({ ...col, visible: true }))
  );
  
  setShowReportColumnModal(true);
};

const closeReportColumnModal = () => {
  setShowReportColumnModal(false);
  setSelectedReportPeriod('');
};

const toggleReportColumn = (columnId) => {
  setReportColumns(prev => 
    prev.map(col => 
      col.id === columnId ? { ...col, visible: !col.visible } : col
    )
  );
};

const selectAllColumns = () => {
  setReportColumns(prev => prev.map(col => ({ ...col, visible: true })));
};

const deselectAllColumns = () => {
  setReportColumns(prev => prev.map(col => ({ ...col, visible: false })));
};

// Updated download function with column selection
const downloadRolesReportWithColumns = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // Get selected column IDs
    const selectedColumnIds = reportColumns
      .filter(col => col.visible)
      .map(col => col.id);
    
    // Build URL with query parameters
    const params = new URLSearchParams();
    params.append('period', selectedReportPeriod);
    selectedColumnIds.forEach(colId => params.append('columns', colId));
    
    const apiUrl = `${BASE_URL}/api/recruitment/roles/export/report?${params.toString()}`;
    
    const response = await axios.get(  // ← Changed to GET
      apiUrl,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob'
      }
    );

    // Create blob link to download
    const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = blobUrl;

    // Get filename from response headers or create default
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'recruitment_report.csv';

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);

    // Show success notification and close modal
    closeReportColumnModal();
    showNotification('Report downloaded successfully!');

  } catch (error) {
    console.error('Error downloading report:', error);
    let errorMessage = 'Failed to download report';

    if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to download reports';
    } else if (error.response?.status === 404) {
      errorMessage = 'Report endpoint not found. Check your API configuration.';
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }

    showNotification(errorMessage);
  }
};


  // const downloadRolesReport = async (period = '') => {
  //   try {
  //     const token = localStorage.getItem('token');

  //     // Add period parameter to the request
  //     const apiUrl = period
  //       ? `${BASE_URL}/api/recruitment/roles/export/report?period=${period}`
  //       : `${BASE_URL}/api/recruitment/roles/export/report`;

  //     const response = await axios.get(apiUrl, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'text/csv'
  //       },
  //       responseType: 'blob' // Important for handling binary data
  //     });

  //     // Create blob link to download
  //     const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement('a');
  //     link.href = blobUrl;

  //     // Get filename from response headers or create default
  //     const contentDisposition = response.headers['content-disposition'];
  //     let filename = 'recruitment_report.csv';

  //     if (contentDisposition) {
  //       const filenameMatch = contentDisposition.match(/filename="(.+)"/);
  //       if (filenameMatch) {
  //         filename = filenameMatch[1];
  //       }
  //     }

  //     link.setAttribute('download', filename);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.remove();
  //     window.URL.revokeObjectURL(blobUrl);

  //     // Show success notification
  //     setNotification('Report downloaded successfully!');
  //     setTimeout(() => setNotification(''), 3000);

  //   } catch (error) {
  //     console.error('Error downloading report:', error);
  //     let errorMessage = 'Failed to download report';

  //     if (error.response?.status === 403) {
  //       errorMessage = 'You do not have permission to download reports';
  //     } else if (error.response?.data?.message) {
  //       errorMessage = error.response.data.message;
  //     }

  //     setNotification(errorMessage);
  //     setTimeout(() => setNotification(''), 3000);
  //   }
  // };



// Add this render function near your other modal render functions
const renderReportColumnModal = () => {
  if (!showReportColumnModal) return null;

  return (
    <div
      id="report-column-modal"
      className="recruitment-modal"
      onClick={(e) => e.target.id === 'report-column-modal' && closeReportColumnModal()}
    >
      <div className="recruitment-modal-content">
        <div className="recruitment-modal-header">
          <h2>Select Columns for {selectedReportPeriod.charAt(0).toUpperCase() + selectedReportPeriod.slice(1)} Report</h2>
          <span className="recruitment-close" onClick={closeReportColumnModal}>&times;</span>
        </div>
        <div className="recruitment-modal-body">
          {/* Static Header with Select All/Deselect All */}
          <div className="column-controls">
            <div className="column-controls-buttons">
              <button
                type="button"
                className="recruitment-submit-btn"
                onClick={selectAllColumns}
              >
                Select All
              </button>
              <button
                type="button"
                className="recruitment-cancel-btn"
                onClick={deselectAllColumns}
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Scrollable Columns Grid */}
          <div className="columns-grid-container">
            <div className="columns-grid">
              {reportColumns.map((column) => (
                <div key={column.id} className="column-item">
                  <input
                    type="checkbox"
                    id={`column-${column.id}`}
                    checked={column.visible}
                    onChange={() => toggleReportColumn(column.id)}
                  />
                  <label htmlFor={`column-${column.id}`}>
                    {column.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Static Footer with Download and Cancel */}
          <div className="recruitment-form-actions">
            <button
              type="button"
              className="recruitment-cancel-btn"
              onClick={closeReportColumnModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="recruitment-submit-btn"
              onClick={downloadRolesReportWithColumns}
              disabled={!reportColumns.some(col => col.visible)}
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const calculateStats = () => {
  // For stats, we need to apply the same filtering logic as filterRoles but without the search term
  let rolesForStats = rolesData;

  if (isManagerView) {
    // Manager sees all roles
    rolesForStats = rolesData;
  } else if (isTeamLeadView) {
    // Team lead filtering logic (same as in filterRoles)
    const currentUsername = localStorage.getItem('username').toLowerCase();
    rolesForStats = rolesData.filter(role => {
      const isRoleOwner = role.assignTo && role.assignTo.toLowerCase() === currentUsername;
      let isInAssignedRecruiters = false;
      try {
        if (role.assignedRecruiters) {
          let assignedRecruiters = [];
          if (typeof role.assignedRecruiters === 'string') {
            assignedRecruiters = JSON.parse(role.assignedRecruiters);
          } else {
            assignedRecruiters = role.assignedRecruiters;
          }
          isInAssignedRecruiters = assignedRecruiters.some(recruiter =>
            recruiter.name && recruiter.name.toLowerCase() === currentUsername
          );
        }
      } catch (error) {
        console.error('Error parsing assigned recruiters:', error);
      }
      const isCreatedByTeamLead = role.createdBy && role.createdBy.toLowerCase() === currentUsername;
      return isRoleOwner || isInAssignedRecruiters || isCreatedByTeamLead;
    });
  } else {
    // Recruiter filtering logic (same as in filterRoles)
    const currentUsername = localStorage.getItem('username').toLowerCase();
    rolesForStats = rolesData.filter(role => {
      const isRoleOwner = role.assignTo && role.assignTo.toLowerCase() === currentUsername;
      let isInAssignedRecruiters = false;
      try {
        if (role.assignedRecruiters) {
          let assignedRecruiters = [];
          if (typeof role.assignedRecruiters === 'string') {
            assignedRecruiters = JSON.parse(role.assignedRecruiters);
          } else {
            assignedRecruiters = role.assignedRecruiters;
          }
          isInAssignedRecruiters = assignedRecruiters.some(recruiter =>
            recruiter.name && recruiter.name.toLowerCase() === currentUsername
          );
        }
      } catch (error) {
        console.error('Error parsing assigned recruiters:', error);
      }
      return isRoleOwner || isInAssignedRecruiters;
    });
  }

  // Apply date filter to stats (this is the key addition)
  if (dateFilter) {
    rolesForStats = rolesForStats.filter(role => filterByDate(role, dateFilter));
  }

  // Apply status filter to stats
  if (statusFilter) {
    rolesForStats = rolesForStats.filter(role => role.status === statusFilter);
  }

  // Apply location filter to stats
  if (locationFilter) {
    rolesForStats = rolesForStats.filter(role => role.roleLocation === locationFilter);
  }

  // Apply urgency filter to stats
  if (urgencyFilter) {
    rolesForStats = rolesForStats.filter(role => role.urgency === urgencyFilter);
  }

  // Calculate stats
  const activeRoles = rolesForStats.filter(role => role.status === 'Active');
  const totalApplications = rolesForStats.reduce((sum, role) => sum + role.applicationCount, 0);
  const endingSoonRoles = rolesForStats.filter(role => isRoleEndingSoon(role.endDate)).length;

  return [
    { value: rolesForStats.length, label: 'Total Roles' },
    { value: activeRoles.length, label: 'Active Roles' },
    { value: totalApplications, label: 'Applications' },
    { value: endingSoonRoles, label: 'Ending Soon' },
  ];
};

  return (
    <div className="recruitment-dashboard-container">
      {/* Notification */}
      {notification && (
        <div className="recruitment-notification" style={{ zIndex: 10003 }}>
          {notification}
        </div>
      )}

      {/* Manager View */}
      {isManagerView && (
        <div id="manager-view" className="recruitment-view-section active">
          <h2 className="recruitment-section-title">
            {userRole === 'admin' ? 'Admin Dashboard' : 'Manager Dashboard'}
          </h2>

          <div className="recruitment-stats-grid">
            {calculateStats().map((stat, index) => (
              <div key={index} className="recruitment-stat-card">
                <div className="recruitment-stat-number">{stat.value}</div>
                <div className="recruitment-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="recruitment-search-filter">
            <input
              type="text"
              className="recruitment-search-input"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="recruitment-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Closed">Closed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select
              className="recruitment-filter-select"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="">All Locations</option>
              <option value="Onsite">Onsite</option>
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <select
              className="recruitment-filter-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              {dateFilterOptions.map((option, index) => (
                <option key={index} value={option.value}>{option.label}</option>
              ))}
            </select>
      <div className="report-period-dropdown">
  <select
    className="recruitment-filter-select"
    value="" // Always set to empty string
    onChange={(e) => {
      const period = e.target.value;
      if (period) {
        openReportColumnModal(period);
        // Reset the select value to empty after selection
        e.target.value = "";
      }
    }}
  >
    <option value="" disabled>Download Report</option>
    <option value="daily">Daily Report</option>
    <option value="weekly">Weekly Report</option>
    <option value="monthly">Monthly Report</option>
  </select>
</div>

            <button
              className="recruitment-filter"
              onClick={() => setShowAddRoleModal(true)}
            >
              Add New Role
            </button>
          </div>
          <div className="recruitment-roles-grid">
            {filteredRoles.length > 0 ? (
              renderRoleCards()
            ) : (
              <div className="recruitment-no-results">No roles found matching your criteria.</div>
            )}
          </div>
        </div>
      )}

      {isTeamLeadView && (
        <div id="teamlead-view" className="recruitment-view-section active">
          <h2 className="recruitment-section-title">Team Lead Dashboard</h2>

          <div className="recruitment-stats-grid">
            {calculateStats().map((stat, index) => (
              <div key={index} className="recruitment-stat-card">
                <div className="recruitment-stat-number">{stat.value}</div>
                <div className="recruitment-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

              <div className="recruitment-search-filter">
      <input
        type="text"
        className="recruitment-search-input"
        placeholder="Search roles..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        className="recruitment-filter-select"
        value={urgencyFilter}
        onChange={(e) => setUrgencyFilter(e.target.value)}
      >
        <option value="">All Urgency</option>
        <option value="Critical">Critical</option>
        <option value="High">High</option>
        <option value="Normal">Normal</option>
        <option value="Low">Low</option>
      </select>
      <select
        className="recruitment-filter-select"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
      >
        {dateFilterOptions.map((option, index) => (
          <option key={index} value={option.value}>{option.label}</option>
        ))}
      </select>
      
      {/* ADD THIS BUTTON FOR TEAM LEAD */}
      <button
        className="recruitment-filter"
        onClick={() => setShowAddRoleModal(true)}
      >
        Add New Role
      </button>
<div className="report-period-dropdown">
  <select
    className="recruitment-filter-select"
    value="" // Always set to empty string
    onChange={(e) => {
      const period = e.target.value;
      if (period) {
        openReportColumnModal(period);
        // Reset the select value to empty after selection
        e.target.value = "";
      }
    }}
  >
    <option value="" disabled>Download Report</option>
    <option value="daily">Daily Report</option>
    <option value="weekly">Weekly Report</option>
    <option value="monthly">Monthly Report</option>
  </select>
</div>
    </div>

    <div className="recruitment-roles-grid">
      {filteredRoles.length > 0 ? (
        renderRoleCardsForTeamLead()
      ) : (
        <div className="recruitment-no-results">No roles assigned to your team.</div>
      )}
    </div>
  </div>
)}

      {/* Recruiter View */}
      {isRecruiterView && (
        <div id="recruiter-view" className="recruitment-view-section active">
          <h2 className="recruitment-section-title">Recruiter Dashboard</h2>

          <div className="recruitment-stats-grid">
            {calculateStats().map((stat, index) => (
              <div key={index} className="recruitment-stat-card">
                <div className="recruitment-stat-number">{stat.value}</div>
                <div className="recruitment-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="recruitment-search-filter">
            <input
              type="text"
              className="recruitment-search-input"
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="recruitment-filter-select"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
            >
              <option value="">All Urgency</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
            <select
              className="recruitment-filter-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              {dateFilterOptions.map((option, index) => (
                <option key={index} value={option.value}>{option.label}</option>
              ))}
            </select>
            {/* Add download report dropdown for Recruiter */}
      <div className="report-period-dropdown">
  <select
    className="recruitment-filter-select"
    value="" // Always set to empty string
    onChange={(e) => {
      const period = e.target.value;
      if (period) {
        openReportColumnModal(period);
        // Reset the select value to empty after selection
        e.target.value = "";
      }
    }}
  >
    <option value="" disabled>Download Report</option>
    <option value="daily">Daily Report</option>
    <option value="weekly">Weekly Report</option>
    <option value="monthly">Monthly Report</option>
  </select>
</div>
          </div>

          <div className="recruitment-roles-grid">
            {filteredRoles.length > 0 ? (
              renderRoleCards()
            ) : (
              <div className="recruitment-no-results">No roles assigned to you.</div>
            )}
          </div>
        </div>
      )}

      {/* Modal for role details */}
      {showModal && (
        <div id="recruitment-modal" className="recruitment-modal" onClick={(e) => e.target.id === 'recruitment-modal' && closeModal()}>
          <div className="recruitment-modal-content">
            <div className="recruitment-modal-header">
              <h2>{selectedRole ? selectedRole.role : ""}</h2>
              <span className="recruitment-close" onClick={closeModal}>&times;</span>
            </div>
            <div className="recruitment-modal-body">
              {renderRoleApplicationsModal()}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {renderAddRoleModal()}

      {/* Delete Confirmation Modal */}
      {renderDeleteConfirmModal()}

      {/* Job Description Modal */}
      {showJobDescriptionModal && renderJobDescriptionModal()}

      {/* Resume Submission Modal */}
      {showResumeSubmissionModal && renderResumeSubmissionModal()}

      {showEditApplicationModal && renderEditApplicationModal()}
      {renderDeleteApplicationModal()}

      {renderMultipleAssignModal()}
      {renderAssignRecruiterModal()}
      {renderReportColumnModal()}

      {showSpecialNotesModal && renderSpecialNotesModal()}

      {/* Resume Viewer Modal */}
      {renderResumeModal()}
    </div>
  );
};

export default RecruitmentDashboard;