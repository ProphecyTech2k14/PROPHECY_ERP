import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Trash2, DollarSign, Calendar, 
  Building, Users, Download, Eye, Edit, 
  ArrowUp, ArrowDown, Undo, Filter, Briefcase, Upload
} from 'lucide-react';
import { mockCandidates } from '../utils/mockData';
import { STATUS_OPTIONS, ROLE_OPTIONS, DATE_OPTIONS } from '../utils/constants';
import CandidateTable from './CandidateTable';
import StatsCards from './StatsCards';
import ViewModal from './ViewModal';
import AddModal from './AddModal';
import ColumnFilterSidebar from './ColumnFilterSidebar';
import { FiFilter } from 'react-icons/fi';
import '../styles/Dashboard.css';
import '../styles/Modal.css';
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import BASE_URL from "../../url";
import axios from "axios";

const ResumeDashboard = () => {
  // Initialize with empty arrays to prevent iteration errors
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'CreatedDt', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [showColumnSidebar, setShowColumnSidebar] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Available columns configuration
  const availableColumns = [
    { key: 'Candidate', label: 'Candidate' },
    { key: 'ContactInfo', label: 'Contact Info' },
    { key: 'Location', label: 'Location' },
    { key: 'DateOfBirth', label: 'Date of Birth' },
    { key: 'Employer', label: 'Employer' },
    { key: 'Salary', label: 'Salary' },
    { key: 'Experience', label: 'Experience' },
    { key: 'Skills', label: 'Skills' },
    { key: 'Education', label: 'Education' },
    { key: 'Certifications', label: 'Certifications' },
    { key: 'Submitted', label: 'Submitted' },
    { key: 'Actions', label: 'Actions' }
  ];

  // Visible columns state
  const [visibleColumns, setVisibleColumns] = useState([
    'Candidate', 'ContactInfo', 'Location', 'DateOfBirth', 'Employer', 
    'Salary', 'Experience', 'Skills', 'Submitted', 'Actions'
  ]);

  const [stats, setStats] = useState({
    total: 0,
    newThisWeek: 0,
    interviewsScheduled: 0,
    readyForOffer: 0
  });

  const fetchResumes = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found');
      window.location.href = '/login';
      return;
    }

    const now = new Date();

    try {
      setLoading(true);
      console.log('Fetching resumes from:', `${BASE_URL}/api/resumes`);
      
      const response = await axios.get(`${BASE_URL}/api/resumes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      console.log('API Response:', response.data);

      let candidatesData = [];

      // Handle different response structures
      if (response.data) {
        if (Array.isArray(response.data)) {
          candidatesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          candidatesData = response.data.data;
        } else if (response.data.success && Array.isArray(response.data.candidates)) {
          candidatesData = response.data.candidates;
        } else if (response.data.recordset && Array.isArray(response.data.recordset)) {
          candidatesData = response.data.recordset;
        } else {
          console.warn('Unexpected response structure:', response.data);
          candidatesData = [];
        }
      }

      console.log('Processed candidates data:', candidatesData);
      
      // Process and validate data structure
      const finalCandidatesData = Array.isArray(candidatesData) ? candidatesData.map(candidate => ({
        ...candidate,
        Resume_ID: candidate.Resume_ID || candidate.id,
        FirstName: candidate.FirstName || '',
        LastName: candidate.LastName || '',
        EmailID: candidate.EmailID || '',
        JobRoleApplied: candidate.JobRoleApplied || '',
        Status: candidate.Status || 'New',
        CreatedDt: candidate.CreatedDt || new Date().toISOString(),
        
        PhoneNumber1: candidate.PhoneNumber1 || '',
        PhoneNumber2: candidate.PhoneNumber2 || '',
        CountryCode: candidate.CountryCode || '',
        CurrentLocation: candidate.CurrentLocation || '',
        
        Experience: candidate.Experience || '',
        RelevantExperience: candidate.RelevantExperience || '',
        
        Skills: candidate.Skills || '',
        ExpectedSalary: candidate.ExpectedSalary || '',
        CurrentSalary: candidate.CurrentSalary || '',
        NoticePeriod: candidate.NoticePeriod || '',
        CurrentEmployer: candidate.CurrentEmployer || '',
        Education: candidate.Education || '',
        Certifications: candidate.Certifications || '',
        CoverLetter: candidate.CoverLetter || '',
        LinkedInProfile: candidate.LinkedInProfile || '',
        PassportNo: candidate.PassportNo || '',
        Dob: candidate.Dob || '',
        CandidateInfo: candidate.CandidateInfo || '',
        AppliedVia: candidate.AppliedVia || 'Direct',
        RequirementId: candidate.RequirementId || null,
        CreatedBy: candidate.CreatedBy || '',
        UpdatedBy: candidate.UpdatedBy || '',
        UpdatedDt: candidate.UpdatedDt || ''
      })) : [];
      
      // Only update state if data actually changed
      if (JSON.stringify(candidates) !== JSON.stringify(finalCandidatesData)) {
        setCandidates(finalCandidatesData);
        setFilteredCandidates(finalCandidatesData);

        // Update stats with enhanced calculations
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const fromRequirements = finalCandidatesData.filter(c => 
          c.AppliedVia === 'Requirements Portal'
        ).length;
        
        console.log(`Found ${fromRequirements} applications from Requirements Portal`);
        
        setStats({
          total: finalCandidatesData.length,
          newThisWeek: finalCandidatesData.filter(candidate => {
            if (!candidate.CreatedDt) return false;
            const createdDate = new Date(candidate.CreatedDt);
            return createdDate >= weekAgo;
          }).length,
          interviewsScheduled: finalCandidatesData.filter(c => 
            (c.Status || '').toLowerCase().includes('interview')
          ).length,
          readyForOffer: finalCandidatesData.filter(c => 
            (c.Status || '').toLowerCase().includes('offer') || 
            (c.Status || '').toLowerCase().includes('ready')
          ).length
        });
      }

    } catch (error) {
      console.error("Fetch error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });

      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        Swal.fire({
          title: 'Session Expired',
          text: 'Please login again',
          icon: 'warning'
        }).then(() => {
          window.location.href = '/login';
        });
      } else {
        const errorMessage = error.response?.data?.error || 
                           error.response?.data?.message || 
                           error.message || 
                           'Failed to load resumes';
        
        console.error('Failed to fetch resumes:', errorMessage);
        if (!error.toString().includes('timeout')) {
          Swal.fire({
            title: 'Error',
            text: errorMessage,
            icon: 'error'
          });
        }
      }
      
      setCandidates([]);
      setFilteredCandidates([]);
      setStats({ total: 0, newThisWeek: 0, interviewsScheduled: 0, readyForOffer: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch - only once
  useEffect(() => {
    fetchResumes();
  }, []);

  // Apply filters effect
  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, roleFilter, dateFilter, sortConfig, candidates]);

  useEffect(() => {
    const handleResumeDataUpdate = () => {
      console.log('Resume data updated - refreshing dashboard');
      fetchResumes();
    };

    window.addEventListener('resumeDataUpdated', handleResumeDataUpdate);

    // Auto-refresh every 30 seconds with debouncing to prevent blinking
    const refreshInterval = setInterval(() => {
      if (!showAddModal && !showViewModal) {
        fetchResumes();
      }
    }, 30000);

    return () => {
      window.removeEventListener('resumeDataUpdated', handleResumeDataUpdate);
      clearInterval(refreshInterval);
    };
  }, [showAddModal, showViewModal]);

  const applyFilters = () => {
    console.log('applyFilters - candidates:', candidates.length);
    if (!Array.isArray(candidates)) {
      console.warn('Candidates is not an array:', candidates);
      setFilteredCandidates([]);
      return;
    }

    let result = [...candidates];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(candidate => {
        const searchableContent = [
          candidate.FirstName || '',
          candidate.LastName || '',
          candidate.EmailID || '',
          candidate.CountryCode || '',
          candidate.PhoneNumber1 || '',
          candidate.PhoneNumber2 || '',
          candidate.CurrentLocation || '',
          candidate.CurrentSalary || '',
          candidate.ExpectedSalary || '',
          candidate.NoticePeriod || '',
          candidate.CurrentEmployer || '',
          candidate.Experience || '',
          candidate.JobRoleApplied || '',
          candidate.Status || '',
          candidate.CreatedBy || '',
          candidate.CandidateInfo || '',
          candidate.LinkedInProfile || '',
          candidate.CoverLetter || '',
          candidate.PassportNo || '',
          candidate.Skills || '',
          candidate.Education || '',
          candidate.Certifications || ''
        ].join(' ').toLowerCase();
        
        return searchableContent.includes(term);
      });
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(candidate => 
        (candidate.Status || '').toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter(candidate => 
        (candidate.JobRoleApplied || '').toLowerCase().includes(roleFilter.toLowerCase())
      );
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(candidate => {
        if (!candidate.CreatedDt) return false;
        
        const candidateDate = new Date(candidate.CreatedDt);
        
        switch (dateFilter) {
          case 'today':
            return candidateDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return candidateDate >= weekAgo;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            return candidateDate >= monthAgo;
          case 'quarter':
            const quarterAgo = new Date();
            quarterAgo.setMonth(now.getMonth() - 3);
            return candidateDate >= quarterAgo;
          default:
            return true;
        }
      });
    }
    
    // Sorting
    result.sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';
      
      if (sortConfig.key === 'CreatedDt') {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
      } else if (sortConfig.key === 'CurrentSalary' || sortConfig.key === 'ExpectedSalary') {
        const aNum = parseFloat(aValue) || 0;
        const bNum = parseFloat(bValue) || 0;
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
      } else {
        const aStr = String(aValue).toLowerCase();
        const bStr = String(bValue).toLowerCase();
        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      }
    });
    
    setFilteredCandidates(result);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setRoleFilter('all');
    setDateFilter('all');
    setSortConfig({ key: 'CreatedDt', direction: 'desc' });
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const formatSkillsForExport = (skills) => {
    if (!skills) return 'N/A';
    if (Array.isArray(skills)) return skills.join(', ');
    if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        return Array.isArray(parsed) ? parsed.join(', ') : skills;
      } catch {
        return skills;
      }
    }
    return skills.toString();
  };

  const formatEducationForExport = (education) => {
    if (!education) return 'N/A';
    if (Array.isArray(education)) return education.join('; ');
    if (typeof education === 'string') {
      try {
        const parsed = JSON.parse(education);
        return Array.isArray(parsed) ? parsed.join('; ') : education;
      } catch {
        return education;
      }
    }
    return education.toString();
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);

      const dataToExport = filteredCandidates.map(candidate => ({
        'First Name': candidate.FirstName || '',
        'Last Name': candidate.LastName || '',
        'Email': candidate.EmailID || '',
        'Phone': `${candidate.CountryCode || ''} ${candidate.PhoneNumber1 || ''}`.trim(),
        'Alt Phone': candidate.PhoneNumber2 || '',
        'Location': candidate.CurrentLocation || '',
        'DOB': candidate.Dob ? new Date(candidate.Dob).toLocaleDateString() : 'N/A',
        'Current Employer': candidate.CurrentEmployer || '',
        'Current Salary': candidate.CurrentSalary || '',
        'Expected Salary': candidate.ExpectedSalary || '',
        'Total Experience (Years)': candidate.Experience || '',
        'Relevant Experience (Years)': candidate.RelevantExperience || '',
        'Notice Period': candidate.NoticePeriod || '',
        'Job Role Applied': candidate.JobRoleApplied || '',
        'Skills': formatSkillsForExport(candidate.Skills),
        'Education': formatEducationForExport(candidate.Education),
        'Certifications': formatEducationForExport(candidate.Certifications),
        'Status': candidate.Status || '',
        'LinkedIn Profile': candidate.LinkedInProfile || '',
        'Passport No': candidate.PassportNo || '',
        'Applied Via': candidate.AppliedVia || '',
        'Created Date': candidate.CreatedDt ? new Date(candidate.CreatedDt).toLocaleDateString() : '',
        'Updated Date': candidate.UpdatedDt ? new Date(candidate.UpdatedDt).toLocaleDateString() : '',
        'Created By': candidate.CreatedBy || '',
        'Updated By': candidate.UpdatedBy || ''
      }));

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Candidates");

      // Set column widths
      const colWidths = [
        { wch: 12 },  // First Name
        { wch: 12 },  // Last Name
        { wch: 25 },  // Email
        { wch: 18 },  // Phone
        { wch: 18 },  // Alt Phone
        { wch: 20 },  // Location
        { wch: 12 },  // DOB
        { wch: 20 },  // Current Employer
        { wch: 15 },  // Current Salary
        { wch: 15 },  // Expected Salary
        { wch: 15 },  // Total Experience
        { wch: 15 },  // Relevant Experience
        { wch: 15 },  // Notice Period
        { wch: 20 },  // Job Role Applied
        { wch: 30 },  // Skills
        { wch: 30 },  // Education
        { wch: 30 },  // Certifications
        { wch: 12 },  // Status
        { wch: 25 },  // LinkedIn Profile
        { wch: 15 },  // Passport No
        { wch: 15 },  // Applied Via
        { wch: 15 },  // Created Date
        { wch: 15 },  // Updated Date
        { wch: 15 },  // Created By
        { wch: 15 }   // Updated By
      ];
      ws['!cols'] = colWidths;

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `candidates_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(wb, filename);

      Swal.fire({
        title: 'Success!',
        text: `Successfully exported ${dataToExport.length} candidates to Excel`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error('Export error:', error);
      Swal.fire({
        title: 'Export Failed',
        text: 'Failed to export candidates to Excel',
        icon: 'error'
      });
    } finally {
      setExporting(false);
    }
  };

  const viewCandidate = (id) => {
    const candidate = candidates.find(c => c.Resume_ID === id || c.id === id);
    if (candidate) {
      setSelectedCandidate(candidate);
      setShowViewModal(true);
    } else {
      console.error('Candidate not found with ID:', id);
    }
  };

  const editCandidate = (candidate) => {
    const candidateWithId = {
      ...candidate,
      id: candidate.Resume_ID || candidate.id
    };
    
    console.log('Editing candidate with ID:', candidateWithId.id);
    setEditingCandidate(candidateWithId);
    setShowAddModal(true);
  };

  const handleSaveCandidate = async () => {
    try {
      console.log('Candidate saved - refreshing data');
      await fetchResumes();
      setShowAddModal(false);
      setEditingCandidate(null);
    } catch (error) {
      console.error('Error refreshing data after save:', error);
      Swal.fire("Error", "Failed to refresh data after saving", "error");
    }
  };

  const deleteCandidate = async (id) => {
    if (!id) {
      console.error('No ID provided for deletion');
      return;
    }

    const candidate = candidates.find(c => c.Resume_ID === id || c.id === id);
    const candidateName = candidate ? `${candidate.FirstName} ${candidate.LastName}` : 'Unknown';

    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: `This will permanently delete ${candidateName}'s resume. You won't be able to revert this!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }

        console.log('Deleting resume with ID:', id);
        
        const response = await axios.delete(`${BASE_URL}/api/resumes/${id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        console.log('Delete response:', response.data);
        
        await fetchResumes();
        
        Swal.fire({
          title: 'Deleted!',
          text: `${candidateName}'s resume has been deleted successfully.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
      } catch (err) {
        console.error('Error deleting resume:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        
        let errorMessage = 'Failed to delete resume';
        
        if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response?.data?.details) {
          errorMessage = err.response.data.details;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        Swal.fire({
          title: 'Delete Failed',
          text: errorMessage,
          icon: 'error',
          footer: err.response?.status ? `Status: ${err.response.status}` : ''
        });
      }
    }
  };

  const totalPages = Math.ceil(filteredCandidates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCandidates = filteredCandidates.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="ResumeSubmission-dashboard-container">
      <header className="ResumeSubmission-dashboard-header">
        <h1><Users className="icon" /> Resume Submission</h1>
        <div className="header-actions">
          <div className="upload-buttons">
            <button 
              className="btn btn-secondary"
              onClick={exportToExcel}
              disabled={exporting || filteredCandidates.length === 0}
              title={filteredCandidates.length === 0 ? "No candidates to export" : "Export to Excel"}
            >
              <Download className="icon" /> 
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setEditingCandidate(null);
              setShowAddModal(true);
            }}
          >
            <Plus className="icon" /> Add Candidate
          </button>
        </div>
      </header>

      <div className="controls-section">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            id="searchInput"
            placeholder="Search across all candidate data..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <button 
          className="btn btn-secondary" 
          onClick={() => setShowColumnSidebar(true)}
        >
          <FiFilter className="icon" /> Columns
        </button>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="roleFilter"><i className="fas fa-briefcase"></i> Role</label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {ROLE_OPTIONS?.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="dateFilter"><i className="fas fa-calendar"></i> Date</label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              {DATE_OPTIONS?.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <button id="resetFilters" className="btn btn-link" onClick={handleResetFilters}>
            <i className="fas fa-undo"></i> Reset
          </button>
        </div>
      </div>

      <StatsCards stats={stats} />
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading candidates...</p>
        </div>
      ) : (
        <CandidateTable
          candidates={paginatedCandidates}
          onView={viewCandidate}
          onEdit={editCandidate}
          onDelete={deleteCandidate}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          visibleColumns={visibleColumns}
          sortConfig={sortConfig}
          onSort={requestSort}
        />
      )}

      <div className="pagination-controls">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="btn btn-secondary"
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages || 1} 
          ({filteredCandidates.length} {filteredCandidates.length === 1 ? 'candidate' : 'candidates'})
        </span>
        <button
          onClick={() => setCurrentPage(prev => 
            prev < totalPages ? prev + 1 : prev
          )}
          disabled={currentPage >= totalPages}
          className="btn btn-secondary"
        >
          Next
        </button>
      </div>

      {showViewModal && selectedCandidate && (
        <ViewModal
          candidate={selectedCandidate}
          onClose={() => {
            setShowViewModal(false);
            setSelectedCandidate(null);
          }}
        />
      )}
      
      {showAddModal && (
        <AddModal
          onClose={() => {
            setShowAddModal(false);
            setEditingCandidate(null);
          }}
          onSave={handleSaveCandidate}
          candidate={editingCandidate}
        />
      )}

      <ColumnFilterSidebar
        availableColumns={availableColumns}
        selectedColumns={visibleColumns}
        setSelectedColumns={setVisibleColumns}
        onClose={() => setShowColumnSidebar(false)}
        isOpen={showColumnSidebar}
      />
    </div>
  );
};

export default ResumeDashboard;