// CompaniesView.js - Fixed Payroll Due Display
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Building, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Mail,
  Users,
  AlertCircle,
  Briefcase,
  X,
  Eye,
  Save
} from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import BASE_URL from "../../url";
import '../styles/Timesheet.css';

// Constants
const COMPANY_STATUS_OPTIONS = ['all', 'Active', 'Inactive', 'Pending'];
const COMPANY_TYPE_OPTIONS = ['all', 'Technologies', 'Consulting', 'Offshore', 'Services'];

const COMPANY_FORM_INITIAL_STATE = {
  name: '',
  clientId: '',
  address: '',
  type: 'Technologies',
  accountManager: '',
  employees: '',
  status: 'Active',
  payrollDueDate: '',
  nextCheckDate: ''
};

// Get company actions based on status
const getCompanyActions = (company) => {
  const baseActions = ['View Details', 'Edit Company', 'Export Data', 'Send Reminder'];
  const statusAction = company.status === 'Active' ? 'Deactivate' : 'Activate';
  return [...baseActions, statusAction, 'Delete Company'];
};

// =======================================
// MODAL COMPONENTS
// =======================================

// PARENT COMPONENT: Modal Container
const ModalContainer = ({ isOpen, onClose, title, icon, children, className = '' }) => {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className={`prophet-modal-overlay ${isOpen ? 'active' : ''} ${className}`} 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="prophet-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="prophet-modal-header">
          <h2>{icon} {title}</h2>
          <button 
            className="prophet-modal-close-btn"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// CHILD COMPONENT: Form Container
const FormContainer = ({ onSubmit, children }) => (
  <form onSubmit={onSubmit} className="prophet-form">
    {children}
  </form>
);

// CHILD COMPONENT: Form Fields Grid
const FormFieldsGrid = ({ children }) => (
  <div className="prophet-form-grid">
    {children}
  </div>
);

// CHILD COMPONENT: Form Field
const FormField = ({ label, children, fullWidth = false, required = false, error = null }) => (
  <div className={`prophet-form-group ${fullWidth ? 'prophet-form-group-full' : ''}`}>
    <label>
      {label}
      {required && <span style={{ color: '#ef4444' }}> *</span>}
    </label>
    {children}
    {error && <div className="prophet-form-error">{error}</div>}
  </div>
);

// CHILD COMPONENT: Form Actions
const FormActions = ({ onCancel, isEditMode, isLoading = false }) => (
  <div className="prophet-form-actions">
    <button
      type="button"
      className="prophet-btn prophet-btn-secondary"
      onClick={onCancel}
      disabled={isLoading}
    >
      Cancel
    </button>
    <button
      type="submit"
      className="prophet-btn prophet-btn-primary"
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <div className="loading-spinner" />
          Saving...
        </>
      ) : (
        <>
          <Save className="icon" />
          {isEditMode ? 'Update Company' : 'Add Company'}
        </>
      )}
    </button>
  </div>
);

// CHILD COMPONENT: Company Form Fields
const CompanyFormFields = ({ formData, onFormChange, errors = {} }) => {
  return (
    <FormFieldsGrid>
      <FormField label="Company Name" required error={errors.name}>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onFormChange}
          className="prophet-form-input"
          required
          placeholder="Enter company name"
          autoComplete="off"
        />
      </FormField>
      
      <FormField label="Client ID" required error={errors.clientId}>
        <input
          type="text"
          name="clientId"
          value={formData.clientId}
          onChange={onFormChange}
          className="prophet-form-input"
          required
          placeholder="Enter client ID"
          autoComplete="off"
        />
      </FormField>
      
      <FormField label="Address" required fullWidth error={errors.address}>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={onFormChange}
          className="prophet-form-input"
          required
          placeholder="Enter company address"
          autoComplete="off"
        />
      </FormField>
      
      <FormField label="Company Type" error={errors.type}>
        <select
          name="type"
          value={formData.type}
          onChange={onFormChange}
          className="prophet-form-select"
        >
          {COMPANY_TYPE_OPTIONS.filter(type => type !== 'all').map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </FormField>
      
      <FormField label="Account Manager" error={errors.accountManager}>
        <input
          type="text"
          name="accountManager"
          value={formData.accountManager}
          onChange={onFormChange}
          className="prophet-form-input"
          placeholder="Enter account manager name"
          autoComplete="off"
        />
      </FormField>
      
      <FormField label="Number of Employees" error={errors.employees}>
        <input
          type="number"
          name="employees"
          value={formData.employees}
          onChange={onFormChange}
          className="prophet-form-input"
          min="0"
          placeholder="0"
        />
      </FormField>
      
      <FormField label="Status" error={errors.status}>
        <select
          name="status"
          value={formData.status}
          onChange={onFormChange}
          className="prophet-form-select"
        >
          {COMPANY_STATUS_OPTIONS.filter(status => status !== 'all').map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </FormField>
      
      <FormField label="Payroll Due Date" error={errors.payrollDueDate}>
        <input
          type="date"
          name="payrollDueDate"
          value={formData.payrollDueDate}
          onChange={onFormChange}
          className="prophet-form-input"
        />
      </FormField>
      
      <FormField label="Next Check Date" error={errors.nextCheckDate}>
        <input
          type="date"
          name="nextCheckDate"
          value={formData.nextCheckDate}
          onChange={onFormChange}
          className="prophet-form-input"
        />
      </FormField>
    </FormFieldsGrid>
  );
};

// PARENT COMPONENT: Company Modal
const CompanyModal = ({ 
  isOpen, 
  onClose, 
  title, 
  icon, 
  onSubmit, 
  formData, 
  onFormChange, 
  errors,
  isEditMode = false,
  isLoading = false
}) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      className="company-modal"
    >
      <FormContainer onSubmit={handleFormSubmit}>
        <CompanyFormFields 
          formData={formData}
          onFormChange={onFormChange}
          errors={errors}
        />
        <FormActions 
          onCancel={onClose}
          isEditMode={isEditMode}
          isLoading={isLoading}
        />
      </FormContainer>
    </ModalContainer>
  );
};

// SPECIALIZED MODAL COMPONENTS
const AddCompanyModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  onFormChange, 
  errors,
  isLoading
}) => (
  <CompanyModal
    isOpen={isOpen}
    onClose={onClose}
    title="Add New Company"
    icon={<Plus className="icon" />}
    onSubmit={onSubmit}
    formData={formData}
    onFormChange={onFormChange}
    errors={errors}
    isEditMode={false}
    isLoading={isLoading}
  />
);

const EditCompanyModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  formData, 
  onFormChange, 
  errors,
  isLoading
}) => (
  <CompanyModal
    isOpen={isOpen}
    onClose={onClose}
    title="Edit Company"
    icon={<Edit className="icon" />}
    onSubmit={onSubmit}
    formData={formData}
    onFormChange={onFormChange}
    errors={errors}
    isEditMode={true}
    isLoading={isLoading}
  />
);

// COMPANY DETAILS MODAL
const CompanyDetailsModal = ({ isOpen, onClose, company, onActionSelect }) => (
  <ModalContainer
    isOpen={isOpen}
    onClose={onClose}
    title="Company Details"
    icon={<Eye size={20} />}
    className="details-modal"
  >
    {company && (
      <div className="prophet-details-content">
        <div className="prophet-details-grid">
          <div className="prophet-detail-section">
            <h3><Building size={16} /> Basic Information</h3>
            <div className="prophet-detail-item">
              <Building className="prophet-detail-icon" />
              <div>
                <span className="prophet-detail-label">Company Name:</span>
                <span className="prophet-detail-value">{company.name}</span>
              </div>
            </div>
            <div className="prophet-detail-item">
              <span className="prophet-detail-label">Client ID:</span>
              <span className="prophet-detail-value">{company.clientId}</span>
            </div>
            <div className="prophet-detail-item">
              <MapPin className="prophet-detail-icon" />
              <div>
                <span className="prophet-detail-label">Address:</span>
                <span className="prophet-detail-value">{company.address}</span>
              </div>
            </div>
            <div className="prophet-detail-item">
              <Briefcase className="prophet-detail-icon" />
              <div>
                <span className="prophet-detail-label">Type:</span>
                <span className="prophet-detail-value">{company.type}</span>
              </div>
            </div>
            <div className="prophet-detail-item">
              <span className="prophet-detail-label">Status:</span>
              <span className={`prophet-status-badge ${company.status.toLowerCase()}`}>
                {company.status}
              </span>
            </div>
          </div>
          
          <div className="prophet-detail-section">
            <h3><Users size={16} /> Management & Employees</h3>
            <div className="prophet-detail-item">
              <span className="prophet-detail-label">Account Manager:</span>
              <span className="prophet-detail-value">{company.accountManager || 'Not assigned'}</span>
            </div>
            <div className="prophet-detail-item">
              <Users className="prophet-detail-icon" />
              <div>
                <span className="prophet-detail-label">Total Employees:</span>
                <span className="prophet-detail-value">{company.employees}</span>
              </div>
            </div>
          </div>
          
          <div className="prophet-detail-section">
            <h3><Calendar size={16} /> Important Dates</h3>
            <div className="prophet-detail-item">
              <Calendar className="prophet-detail-icon" />
              <div>
                <span className="prophet-detail-label">Payroll Due Date:</span>
                <span className="prophet-detail-value">
                  {company.payrollDueDate ? new Date(company.payrollDueDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>
            </div>
            <div className="prophet-detail-item">
              <Calendar className="prophet-detail-icon" />
              <div>
                <span className="prophet-detail-label">Next Check Date:</span>
                <span className="prophet-detail-value">
                  {company.nextCheckDate ? new Date(company.nextCheckDate).toLocaleDateString() : 'Not set'}
                </span>
              </div>
            </div>
            <div className="prophet-detail-item">
              <span className="prophet-detail-label">Created:</span>
              <span className="prophet-detail-value">
                {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="prophet-detail-item">
              <span className="prophet-detail-label">Last Updated:</span>
              <span className="prophet-detail-value">
                {company.updatedAt ? new Date(company.updatedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="prophet-detail-section">
            <h3><AlertCircle size={16} /> Payroll Status</h3>
            <div className="prophet-detail-item">
              <AlertCircle className="prophet-detail-icon" />
              <div>
                <span className="prophet-detail-label">Days Until Payroll Due:</span>
                <span className="prophet-detail-value">
                  {company.daysUntilPayrollDue !== null && company.daysUntilPayrollDue !== undefined
                    ? `${company.daysUntilPayrollDue} days`
                    : 'Not set'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="prophet-details-actions">
          <button
            type="button"
            className="prophet-btn prophet-btn-secondary"
            onClick={() => onActionSelect(company.status === 'Active' ? 'Deactivate' : 'Activate', company)}
          >
            <CheckCircle size={16} />
            {company.status === 'Active' ? 'Deactivate' : 'Activate'}
          </button>
          <button
            type="button"
            className="prophet-btn prophet-btn-secondary"
            onClick={() => {
              onClose();
              onActionSelect('Edit Company', company);
            }}
          >
            <Edit size={16} />
            Edit Company
          </button>
          <button
            type="button"
            className="prophet-btn prophet-btn-secondary"
            onClick={() => onActionSelect('Export Data', company)}
          >
            <Download size={16} />
            Export Data
          </button>
          <button
            type="button"
            className="prophet-btn prophet-btn-secondary"
            onClick={() => onActionSelect('Send Reminder', company)}
          >
            <Mail size={16} />
            Send Reminder
          </button>
          <button
            type="button"
            className="prophet-btn prophet-btn-danger"
            onClick={() => onActionSelect('Delete Company', company)}
          >
            <Trash2 size={16} />
            Delete Company
          </button>
        </div>
      </div>
    )}
  </ModalContainer>
);

// =======================================
// MAIN COMPONENT
// =======================================
const CompaniesView = () => {
  const navigate = useNavigate();
  
  // State management
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showActionsMenu, setShowActionsMenu] = useState(null);
  
  // Modal state
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showCompanyDetailsModal, setShowCompanyDetailsModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    assignedToMe: 0,
    payrollDueSoon: 0,
    totalEmployees: 0
  });

  // Form states
  const [addCompanyForm, setAddCompanyForm] = useState(COMPANY_FORM_INITIAL_STATE);
  const [editCompanyForm, setEditCompanyForm] = useState(COMPANY_FORM_INITIAL_STATE);
  const [errors, setErrors] = useState({});

  // Use refs to store error state without causing re-renders
  const errorsRef = useRef({});
  
  useEffect(() => {
    errorsRef.current = errors;
  }, [errors]);

  // FIXED: Stable form change handlers
  const handleAddCompanyFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setAddCompanyForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error if exists
    if (errorsRef.current[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, []);

  const handleEditCompanyFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setEditCompanyForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error if exists
    if (errorsRef.current[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, []);

  // Validation function
  const validateCompanyForm = useCallback((formData) => {
    const newErrors = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.clientId?.trim()) {
      newErrors.clientId = 'Client ID is required';
    }
    
    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.employees && (isNaN(formData.employees) || parseInt(formData.employees) < 0)) {
      newErrors.employees = 'Number of employees must be a valid positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  // Reset form functions
  const resetAddCompanyForm = useCallback(() => {
    setAddCompanyForm(COMPANY_FORM_INITIAL_STATE);
    setErrors({});
  }, []);

  const resetEditCompanyForm = useCallback(() => {
    setEditCompanyForm(COMPANY_FORM_INITIAL_STATE);
    setErrors({});
  }, []);

  // Modal handlers
  const handleAddCompany = useCallback(() => {
    resetAddCompanyForm();
    setShowAddCompanyModal(true);
  }, [resetAddCompanyForm]);

  const handleEditCompany = useCallback((company) => {
    setSelectedCompany(company);
    setEditCompanyForm({
      name: company.name || '',
      clientId: company.clientId || '',
      address: company.address || '',
      type: company.type || 'Technologies',
      accountManager: company.accountManager || '',
      employees: company.employees?.toString() || '',
      status: company.status || 'Active',
      payrollDueDate: company.payrollDueDate ? company.payrollDueDate.split('T')[0] : '',
      nextCheckDate: company.nextCheckDate ? company.nextCheckDate.split('T')[0] : ''
    });
    setErrors({});
    setShowEditCompanyModal(true);
    setShowActionsMenu(null);
  }, []);

  // Fetch companies from API
  const fetchCompanies = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/companies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      let companiesData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          companiesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          companiesData = response.data.data;
        }
      }

      const finalCompaniesData = Array.isArray(companiesData) ? companiesData.map(company => ({
        ...company,
        id: company.Id || company.id,
        name: company.Name || company.name || '',
        clientId: company.ClientId || company.clientId || '',
        address: company.Address || company.address || '',
        type: company.Type || company.type || '',
        accountManager: company.AccountManager || company.accountManager || '',
        employees: company.Employees || company.employees || 0,
        status: company.Status || company.status || 'Active',
        payrollDueDate: company.PayrollDueDate || company.payrollDueDate,
        nextCheckDate: company.NextCheckDate || company.nextCheckDate,
        createdAt: company.CreatedAt || company.createdAt,
        updatedAt: company.UpdatedAt || company.updatedAt,
        daysUntilPayrollDue: company.DaysUntilPayrollDue !== undefined ? company.DaysUntilPayrollDue : (company.daysUntilPayrollDue !== undefined ? company.daysUntilPayrollDue : null),
        daysUntilNextCheck: company.DaysUntilNextCheck || company.daysUntilNextCheck
      })) : [];

      // Debug logging
      console.log('Fetched companies with payroll data:', finalCompaniesData.map(c => ({
        name: c.name,
        payrollDueDate: c.payrollDueDate,
        daysUntilPayrollDue: c.daysUntilPayrollDue
      })));

      setCompanies(finalCompaniesData);
      setFilteredCompanies(finalCompaniesData);
      updateStats(finalCompaniesData);

    } catch (error) {
      console.error("Fetch companies error:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        Swal.fire({
          title: 'Session Expired',
          text: 'Please login again',
          icon: 'warning'
        }).then(() => navigate('/login'));
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Failed to load companies',
          icon: 'error'
        });
      }
      setCompanies([]);
      setFilteredCompanies([]);
      updateStats([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Company CRUD operations
  const addCompany = useCallback(async (companyData) => {
    if (!validateCompanyForm(companyData)) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    try {
      setIsLoading(true);
      const apiData = {
        name: companyData.name.trim(),
        clientId: companyData.clientId.trim(),
        address: companyData.address.trim(),
        type: companyData.type,
        accountManager: companyData.accountManager.trim(),
        employees: parseInt(companyData.employees) || 0,
        status: companyData.status,
        payrollDueDate: companyData.payrollDueDate || null,
        nextCheckDate: companyData.nextCheckDate || null
      };

      const response = await axios.post(`${BASE_URL}/api/companies`, apiData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success || response.status === 200 || response.status === 201) {
        await fetchCompanies();
        setShowAddCompanyModal(false);
        resetAddCompanyForm();
        
        Swal.fire({
          title: 'Success!',
          text: 'Company added successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error adding company:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add company';
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [validateCompanyForm, fetchCompanies, resetAddCompanyForm]);

  const updateCompany = useCallback(async (companyData) => {
    if (!validateCompanyForm(companyData)) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    try {
      setIsLoading(true);
      const apiData = {
        name: companyData.name.trim(),
        clientId: companyData.clientId.trim(),
        address: companyData.address.trim(),
        type: companyData.type,
        accountManager: companyData.accountManager.trim(),
        employees: parseInt(companyData.employees) || 0,
        status: companyData.status,
        payrollDueDate: companyData.payrollDueDate || null,
        nextCheckDate: companyData.nextCheckDate || null
      };

      const response = await axios.put(`${BASE_URL}/api/companies/${selectedCompany.id}`, apiData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success || response.status === 200) {
        await fetchCompanies();
        setShowEditCompanyModal(false);
        setSelectedCompany(null);
        
        Swal.fire({
          title: 'Success!',
          text: 'Company updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error updating company:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update company';
      
      Swal.fire({
        title: 'Error',
        text: errorMessage,
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  }, [validateCompanyForm, selectedCompany, fetchCompanies]);

  // Update company status
  const updateCompanyStatus = useCallback(async (company, newStatus) => {
    const action = newStatus === 'Active' ? 'activate' : 'deactivate';
    const confirmMessage = newStatus === 'Active' 
      ? `Are you sure you want to activate ${company.name}?`
      : `Are you sure you want to deactivate ${company.name}?`;

    const confirm = await Swal.fire({
      title: `${newStatus === 'Active' ? 'Activate' : 'Deactivate'} Company?`,
      text: confirmMessage,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'Active' ? '#10b981' : '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: 'Cancel'
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        Swal.fire({
          title: `${newStatus === 'Active' ? 'Activating...' : 'Deactivating...'}`,
          text: `Please wait while we ${action} the company`,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await axios.patch(`${BASE_URL}/api/companies/${company.id}/status`, {
          status: newStatus
        }, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });

        if (response.data.success || response.status === 200) {
          await fetchCompanies();
          Swal.fire({
            title: `${newStatus === 'Active' ? 'Activated!' : 'Deactivated!'}`,
            text: `${company.name} has been ${action}d successfully.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } else {
          throw new Error(response.data.message || 'Unexpected response format');
        }
        
      } catch (error) {
        console.error('Error updating company status:', error);
        let errorMessage = 'An unexpected error occurred';
        
        if (error.response) {
          errorMessage = error.response.data?.message || 
                        error.response.data?.error || 
                        `Server error: ${error.response.status}`;
        } else if (error.request) {
          errorMessage = 'Network error - please check your connection';
        } else {
          errorMessage = error.message || 'Failed to update company status';
        }
        
        Swal.fire({
          title: `${newStatus === 'Active' ? 'Activation' : 'Deactivation'} Failed`,
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    }
    
    setShowActionsMenu(null);
  }, [fetchCompanies]);

  // Action handlers
  const viewCompanyDetails = useCallback((company) => {
    setSelectedCompany(company);
    setShowCompanyDetailsModal(true);
    setShowActionsMenu(null);
  }, []);

  // Export Company Data
  const exportCompanyData = useCallback(async (company) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      Swal.fire({
        title: 'Exporting...',
        text: 'Please wait while we prepare your export',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await axios.get(`${BASE_URL}/api/companies/${company.id}/export`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        responseType: 'blob',
        params: { format: 'csv' }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${company.name}_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      Swal.fire({
        title: 'Export Complete',
        text: `Data for ${company.name} has been exported successfully`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
    } catch (error) {
      console.error('Export failed:', error);
      Swal.fire({
        title: 'Export Failed', 
        text: error.response?.data?.message || 'Failed to export company data',
        icon: 'error'
      });
    }
    
    setShowActionsMenu(null);
  }, []);

  // Send Payroll Reminder
  const sendPayrollReminder = useCallback(async (company) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      Swal.fire({
        title: 'Sending Reminder...',
        text: 'Please wait while we send the reminder',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const response = await axios.post(`${BASE_URL}/api/companies/${company.id}/send-reminder`, {
        message: `Payroll reminder for ${company.name}`,
        type: 'payroll',
        recipient: company.accountManager
      }, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success || response.status === 200) {
        Swal.fire({
          title: 'Reminder Sent!',
          text: `Payroll reminder sent successfully for ${company.name}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
    } catch (error) {
      console.error('Error sending reminder:', error);
      Swal.fire({
        title: 'Failed to Send',
        text: error.response?.data?.message || 'Failed to send payroll reminder',
        icon: 'error'
      });
    }
    
    setShowActionsMenu(null);
  }, []);

  // Delete Company Function
  const deleteCompany = useCallback(async (company) => {
    const confirm = await Swal.fire({
      title: 'Delete Company?',
      text: `Are you sure you want to permanently delete ${company.name}? This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      dangerMode: true
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        Swal.fire({
          title: 'Deleting...',
          text: 'Please wait while we delete the company',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const response = await axios.delete(`${BASE_URL}/api/companies/${company.id}`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success || response.status === 200) {
          await fetchCompanies();
          Swal.fire({
            title: 'Deleted!',
            text: `${company.name} has been deleted successfully.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
        
      } catch (error) {
        console.error('Error deleting company:', error);
        Swal.fire({
          title: 'Deletion Failed',
          text: error.response?.data?.message || 'Failed to delete company',
          icon: 'error'
        });
      }
    }
    
    setShowActionsMenu(null);
  }, [fetchCompanies]);

  // Update stats from local data
  const updateStats = (companiesData) => {
    if (!Array.isArray(companiesData)) return;
    
    const totalEmployees = companiesData.reduce((sum, company) => sum + (company.employees || 0), 0);
    const payrollDueSoon = companiesData.filter(company => {
      const daysUntilDue = company.daysUntilPayrollDue;
      return daysUntilDue !== null && daysUntilDue <= 7 && daysUntilDue >= 0;
    }).length;

    setStats({
      total: companiesData.length,
      active: companiesData.filter(c => c.status === 'Active').length,
      pending: companiesData.filter(c => c.status === 'Pending').length,
      assignedToMe: companiesData.filter(c => c.accountManager === 'You').length,
      payrollDueSoon,
      totalEmployees
    });
  };

  // Initial data fetch
  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  // Apply filters effect
  useEffect(() => {
    if (!Array.isArray(companies)) {
      setFilteredCompanies([]);
      return;
    }

    let result = [...companies];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(company => {
        const searchableContent = [
          company.name || '',
          company.clientId || '',
          company.address || '',
          company.type || '',
          company.accountManager || '',
          company.status || ''
        ].join(' ').toLowerCase();
        
        return searchableContent.includes(term);
      });
    }
    
    if (filterStatus !== 'all') {
      result = result.filter(company => company.status === filterStatus);
    }
    
    if (filterType !== 'all') {
      result = result.filter(company => company.type === filterType);
    }
    
    setFilteredCompanies(result);
  }, [searchTerm, filterStatus, filterType, companies]);

  // Event handlers
  const handleCompanyClick = useCallback((company) => {
    navigate('/manager-timesheet', { state: { company } });
  }, [navigate]);

  const handleActionClick = useCallback((e, companyId) => {
    e.stopPropagation();
    setShowActionsMenu(prev => prev === companyId ? null : companyId);
  }, []);

  const handleActionSelect = useCallback(async (action, company) => {
    switch (action) {
      case 'View Details':
        viewCompanyDetails(company);
        break;
      case 'Edit Company':
        handleEditCompany(company);
        break;
      case 'Export Data':
        await exportCompanyData(company);
        break;
      case 'Send Reminder':
        await sendPayrollReminder(company);
        break;
      case 'Activate':
        await updateCompanyStatus(company, 'Active');
        break;
      case 'Deactivate':
        await updateCompanyStatus(company, 'Inactive');
        break;
      case 'Delete Company':
        await deleteCompany(company);
        break;
      default:
        console.warn('Unknown action:', action);
        setShowActionsMenu(null);
        break;
    }
  }, [viewCompanyDetails, handleEditCompany, exportCompanyData, sendPayrollReminder, updateCompanyStatus, deleteCompany]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Not set';
    }
  };

  // FIXED: Get days until due with color coding - handles null/undefined properly
  const getDaysUntilDueDisplay = (days) => {
    if (days === null || days === undefined) return { text: 'Not set', className: 'not-set' };
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, className: 'overdue' };
    if (days === 0) return { text: 'Due today', className: 'due-today' };
    if (days <= 3) return { text: `${days} days`, className: 'due-soon' };
    if (days <= 7) return { text: `${days} days`, className: 'due-week' };
    return { text: `${days} days`, className: '' };
  };

  // Component sections
  const HeaderSection = () => (
    <div className="companies-header">
      <div className="companies-header-content">
        <div>
          <h1><Building className="icon" /> Companies</h1>
          <p>Manage your company accounts and payroll information</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddCompany}>
          <Plus className="icon" />
          Add Company
        </button>
      </div>
    </div>
  );

  const StatsOverview = () => (
    <div className="stats-overview">
      <div className="stat-card">
        <div className="Company-stat-icon">
          <Building />
        </div>
        <div className="stat-content">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Companies</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="Company-stat-icon">
          <CheckCircle />
        </div>
        <div className="stat-content">
          <span className="stat-number">{stats.active}</span>
          <span className="stat-label">Active</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="Company-stat-icon">
          <AlertCircle />
        </div>
        <div className="stat-content">
          <span className="stat-number">{stats.payrollDueSoon}</span>
          <span className="stat-label">Payroll Due Soon</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="Company-stat-icon">
          <Users />
        </div>
        <div className="stat-content">
          <span className="stat-number">{stats.totalEmployees}</span>
          <span className="stat-label">Total Employees</span>
        </div>
      </div>
    </div>
  );

  const SearchAndFilterSection = () => (
    <div className="companies-controls">
      <div className="search-container">
        <Search size={20} />
        <input
          type="text"
          placeholder="Search companies by name, ID, or type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="filters-container">
        <div className="filter-container">
          <Filter size={18} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            {COMPANY_STATUS_OPTIONS.map(status => (
              <option key={status} value={status}>
                {status === 'all' ? 'All Status' : status}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-container">
          <Briefcase size={18} />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            {COMPANY_TYPE_OPTIONS.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
        
        <button className="btn btn-secondary" onClick={() => {
          setSearchTerm('');
          setFilterStatus('all');
          setFilterType('all');
        }}>
          Reset Filters
        </button>
      </div>
    </div>
  );

  const CompanyCard = ({ company }) => {
    const payrollDueDisplay = getDaysUntilDueDisplay(company.daysUntilPayrollDue);
    const companyActions = getCompanyActions(company);
    
    return (
      <div
        className="company-card"
        onClick={() => handleCompanyClick(company)}
        style={{ cursor: 'pointer' }}
      >
        <div className="company-header">
          <div className="company-main-info">
            <div className="company-icon">
              <Building size={24} />
            </div>
            <div className="company-info">
              <h3 className="company-name">{company.name}</h3>
              <span className="client-id">Client ID: {company.clientId}</span>
            </div>
          </div>
          
          <div className="company-header-actions">
            <div className="company-status">
              <span className={`status-badge ${company.status.toLowerCase()}`}>
                <CheckCircle size={14} />
                {company.status}
              </span>
            </div>
            
            <div className="actions-menu">
              <button 
                className="icon-btn" 
                onClick={(e) => handleActionClick(e, company.id)}
                type="button"
              >
                <MoreVertical size={18} />
              </button>
              
              {showActionsMenu === company.id && (
                <div className="actions-dropdown" onClick={(e) => e.stopPropagation()}>
                  {companyActions.map(action => (
                    <div 
                      key={action} 
                      className="action-item"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionSelect(action, company);
                      }}
                    >
                      {action === 'View Details' && <Eye size={16} />}
                      {action === 'Edit Company' && <Edit size={16} />}
                      {action === 'Export Data' && <Download size={16} />}
                      {action === 'Send Reminder' && <Mail size={16} />}
                      {(action === 'Activate' || action === 'Deactivate') && <CheckCircle size={16} />}
                      {action === 'Delete Company' && <Trash2 size={16} />}
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="company-details">
          <div className="detail-row">
            <MapPin size={16} />
            <span className="detail-label">Address:</span>
            <span className="detail-value">{company.address}</span>
          </div>
          
          <div className="detail-grid">
            <div className="detail-item">
              <Calendar size={16} />
              <span className="detail-label">Payroll due:</span>
              <span className={`detail-value payroll-due ${payrollDueDisplay.className}`}>
                {payrollDueDisplay.text}
              </span>
            </div>
            
            <div className="detail-item">
              <Calendar size={16} />
              <span className="detail-label">Next check:</span>
              <span className="detail-value">{formatDate(company.nextCheckDate)}</span>
            </div>
            
            <div className="detail-item">
              <Users size={16} />
              <span className="detail-label">Employees:</span>
              <span className="detail-value">{company.employees}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Account Manager:</span>
              <span className={`detail-value ${company.accountManager === 'You' ? 'highlight' : ''}`}>
                {company.accountManager}
              </span>
            </div>
          </div>
        </div>

        <div className="company-footer">
          <div className="company-meta">
            <span className="company-type">{company.type}</span>
            <span className="last-activity">
              Updated: {formatDate(company.updatedAt)}
            </span>
          </div>
          <ChevronRight size={20} className="chevron-icon" />
        </div>
      </div>
    );
  };

  const CompaniesGrid = () => (
    <div className="companies-grid">
      {filteredCompanies.map((company) => (
        <CompanyCard key={company.id} company={company} />
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="no-companies">
      <Building size={48} />
      <p>No companies found matching your criteria</p>
      <button className="btn btn-primary" onClick={handleAddCompany}>
        <Plus size={18} />
        Add New Company
      </button>
    </div>
  );

  // Main render
  return (
    <div className="companies-container" onClick={() => {
      if (!showAddCompanyModal && !showEditCompanyModal && !showCompanyDetailsModal) {
        setShowActionsMenu(null);
      }
    }}>
      <HeaderSection />
      <StatsOverview />
      <SearchAndFilterSection />
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading companies...</p>
        </div>
      ) : filteredCompanies.length > 0 ? (
        <CompaniesGrid />
      ) : (
        <EmptyState />
      )}
      
      {showAddCompanyModal && (
        <AddCompanyModal
          isOpen={showAddCompanyModal}
          onClose={() => {
            setShowAddCompanyModal(false);
            resetAddCompanyForm();
          }}
          onSubmit={addCompany}
          formData={addCompanyForm}
          onFormChange={handleAddCompanyFormChange}
          errors={errors}
          isLoading={isLoading}
        />
      )}
      
      {showEditCompanyModal && (
        <EditCompanyModal
          isOpen={showEditCompanyModal}
          onClose={() => {
            setShowEditCompanyModal(false);
            setSelectedCompany(null);
            resetEditCompanyForm();
          }}
          onSubmit={updateCompany}
          formData={editCompanyForm}
          onFormChange={handleEditCompanyFormChange}
          errors={errors}
          isLoading={isLoading}
        />
      )}
      
      <CompanyDetailsModal
        isOpen={showCompanyDetailsModal}
        onClose={() => {
          setShowCompanyDetailsModal(false);
          setSelectedCompany(null);
        }}
        company={selectedCompany}
        onActionSelect={handleActionSelect}
      />
    </div>
  );
};

export default CompaniesView;
