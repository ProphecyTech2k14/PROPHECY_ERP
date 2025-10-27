// ManagerTimesheet.js - Complete Updated Version with Authentication Fields
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import '../styles/ManagerDashboard.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Clock, 
  Edit3, 
  Plus,
  Eye,
  Trash2,
  X,
  Building,
  ChevronLeft,
  User,
  Building as C2CIcon,
  Shield,
  Heart,
  ClipboardList,
  CheckCircle,
  Clock as PendingIcon,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Save,
  Lock,
  UserCheck
} from 'lucide-react';
import axios from 'axios';
import BASE_URL from "../../url";
import Swal from 'sweetalert2';

// Constants
const EMPLOYEE_FORM_INITIAL_STATE = {
  name: '',
  email: '',
  phone: '',
  department: '',
  position: '',
  employmentType: 'Full-time',
  status: 'Active',
  paperless: 'Not enrolled',
  hireDate: '',
  location: '',
  employeeId: '',
  username: '',
  password: '',
  createAccount: false
};

const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract'];
const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];
const TIMESHEET_STATUSES = ['Pending', 'Approved', 'Rejected'];
const DEPARTMENTS = ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations'];

// CHILD COMPONENT 1: Modal Overlay - Parent Container
const ModalOverlay = React.memo(({ isOpen, onClose, children }) => {
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
      className="mts-emp-modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
});

ModalOverlay.displayName = 'ModalOverlay';

// CHILD COMPONENT 2: Modal Header
const ModalHeader = React.memo(({ title, onClose }) => (
  <div className="mts-emp-modal-header">
    <h2 className="mts-emp-modal-title">{title}</h2>
    <button 
      onClick={onClose}
      className="mts-emp-modal-close-btn"
      type="button"
      aria-label="Close modal"
    >
      <X size={20} />
    </button>
  </div>
));

ModalHeader.displayName = 'ModalHeader';

// CHILD COMPONENT 3: Form Field Group
const FormFieldGroup = React.memo(({ 
  label, 
  required = false, 
  children, 
  error = null 
}) => (
  <div className="mts-emp-form-group">
    <label>
      {label}
      {required && <span style={{ color: 'var(--mts-danger-red)' }}> *</span>}
    </label>
    {children}
    {error && <div className="mts-error">{error}</div>}
  </div>
));

FormFieldGroup.displayName = 'FormFieldGroup';

// CHILD COMPONENT 4: Input Field
const InputField = React.memo(({ 
  type = 'text',
  value, 
  onChange, 
  placeholder = '', 
  disabled = false,
  className = ''
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className={`mts-emp-form-input ${disabled ? 'mts-emp-form-input-disabled' : ''} ${className}`}
    placeholder={placeholder}
    disabled={disabled}
  />
));

InputField.displayName = 'InputField';

// CHILD COMPONENT 5: Select Field
const SelectField = React.memo(({ 
  value, 
  onChange, 
  options = [],
  placeholder = '',
  disabled = false
}) => (
  <select
    value={value}
    onChange={onChange}
    className={`mts-emp-form-input ${disabled ? 'mts-emp-form-input-disabled' : ''}`}
    disabled={disabled}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(option => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
));

SelectField.displayName = 'SelectField';

// CHILD COMPONENT 6: Modal Actions/Footer
const ModalActions = React.memo(({ 
  onCancel, 
  onSave, 
  saveDisabled = false, 
  saveText = 'Save',
  isLoading = false 
}) => (
  <div className="mts-emp-modal-actions">
    <button 
      onClick={onCancel}
      className="mts-emp-modal-btn mts-emp-modal-btn-cancel"
      type="button"
      disabled={isLoading}
    >
      Cancel
    </button>
    <button 
      onClick={onSave}
      className="mts-emp-modal-btn mts-emp-modal-btn-save"
      disabled={saveDisabled || isLoading}
      type="button"
    >
      {isLoading ? (
        <>
          <div className="mts-loading" />
          Saving...
        </>
      ) : (
        <>
          <Save size={16} />
          {saveText}
        </>
      )}
    </button>
  </div>
));

ModalActions.displayName = 'ModalActions';

// Department Field with both dropdown and free text
const DepartmentField = React.memo(({ 
  value, 
  onChange, 
  error = null,
  departments = []
}) => {
  const [isCustomDepartment, setIsCustomDepartment] = useState(false);
  const [customDepartment, setCustomDepartment] = useState('');

  useEffect(() => {
    if (value && !departments.includes(value)) {
      setIsCustomDepartment(true);
      setCustomDepartment(value);
    }
  }, [value, departments]);

  const handleDepartmentTypeChange = (e) => {
    const isCustom = e.target.value === 'custom';
    setIsCustomDepartment(isCustom);
    
    if (!isCustom) {
      setCustomDepartment('');
      onChange(value);
    } else {
      onChange(customDepartment);
    }
  };

  const handlePredefinedChange = (e) => {
    onChange(e.target.value);
  };

  const handleCustomChange = (e) => {
    const newValue = e.target.value;
    setCustomDepartment(newValue);
    onChange(newValue);
  };

  return (
    <div className="mts-emp-form-group">
      <label>
        Department
        <span style={{ color: 'var(--mts-danger-red)' }}> *</span>
      </label>
      
      <div style={{ marginBottom: '8px' }}>
        <label style={{ marginRight: '16px', fontSize: '14px' }}>
          <input
            type="radio"
            value="predefined"
            checked={!isCustomDepartment}
            onChange={handleDepartmentTypeChange}
            style={{ marginRight: '4px' }}
          />
          Select from list
        </label>
        <label style={{ fontSize: '14px' }}>
          <input
            type="radio"
            value="custom"
            checked={isCustomDepartment}
            onChange={handleDepartmentTypeChange}
            style={{ marginRight: '4px' }}
          />
          Enter custom department
        </label>
      </div>

      {isCustomDepartment ? (
        <InputField
          value={customDepartment}
          onChange={handleCustomChange}
          placeholder="Enter department name"
        />
      ) : (
        <SelectField
          value={value}
          onChange={handlePredefinedChange}
          options={departments}
          placeholder="Select Department"
        />
      )}
      
      {error && <div className="mts-error">{error}</div>}
    </div>
  );
});

DepartmentField.displayName = 'DepartmentField';

// CHILD COMPONENT 7: Employee Form Body with Authentication Fields
const EmployeeFormBody = React.memo(({ 
  formData, 
  onUpdateField, 
  errors = {},
  isAddMode = true 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleFieldChange = useCallback((field) => (e) => {
    onUpdateField(field, e.target.value);
  }, [onUpdateField]);

  const generateRandomId = useCallback(() => {
    const prefixes = ['EMP', 'DEV', 'MGR', 'HR', 'CT', 'PT'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${randomPrefix}${randomNum}`;
  }, []);

  useEffect(() => {
    if (isAddMode && !formData.employeeId) {
      onUpdateField('employeeId', generateRandomId());
    }
  }, [isAddMode, formData.employeeId, generateRandomId, onUpdateField]);

  return (
    <div className="mts-emp-modal-body">
      <div className="mts-emp-form-grid">
        <div className="mts-emp-form-row">
          <FormFieldGroup label="Employee ID" required error={errors.employeeId}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <InputField
                value={formData.employeeId}
                onChange={handleFieldChange('employeeId')}
                placeholder="Enter employee ID"
                disabled={!isAddMode}
                style={{ flex: 1 }}
              />
              {isAddMode && (
                <button
                  type="button"
                  onClick={() => onUpdateField('employeeId', generateRandomId())}
                  className="mts-generate-id-btn"
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                >
                  Generate ID
                </button>
              )}
            </div>
          </FormFieldGroup>
          
          <FormFieldGroup label="Full Name" required error={errors.name}>
            <InputField
              value={formData.name}
              onChange={handleFieldChange('name')}
              placeholder="Enter full name"
            />
          </FormFieldGroup>
        </div>

        <div className="mts-emp-form-row">
          <FormFieldGroup label="Email Address" required error={errors.email}>
            <InputField
              type="email"
              value={formData.email}
              onChange={handleFieldChange('email')}
              placeholder="Enter email address"
            />
          </FormFieldGroup>
          <FormFieldGroup label="Phone Number" error={errors.phone}>
            <InputField
              type="tel"
              value={formData.phone}
              onChange={handleFieldChange('phone')}
              placeholder="Enter phone number"
            />
          </FormFieldGroup>
        </div>

        <div className="mts-emp-form-row">
          <DepartmentField
            value={formData.department}
            onChange={(value) => onUpdateField('department', value)}
            error={errors.department}
            departments={DEPARTMENTS}
          />
          
          <FormFieldGroup label="Position" error={errors.position}>
            <InputField
              value={formData.position}
              onChange={handleFieldChange('position')}
              placeholder="Enter position/title"
            />
          </FormFieldGroup>
        </div>

        <div className="mts-emp-form-row">
          <FormFieldGroup label="Employment Type" error={errors.employmentType}>
            <SelectField
              value={formData.employmentType}
              onChange={handleFieldChange('employmentType')}
              options={EMPLOYMENT_TYPES}
            />
          </FormFieldGroup>
          <FormFieldGroup label="Status" error={errors.status}>
            <SelectField
              value={formData.status}
              onChange={handleFieldChange('status')}
              options={EMPLOYEE_STATUSES}
            />
          </FormFieldGroup>
        </div>

        <div className="mts-emp-form-row">
          <FormFieldGroup label="Hire Date" error={errors.hireDate}>
            <InputField
              type="date"
              value={formData.hireDate}
              onChange={handleFieldChange('hireDate')}
            />
          </FormFieldGroup>
          <FormFieldGroup label="Location" error={errors.location}>
            <InputField
              value={formData.location}
              onChange={handleFieldChange('location')}
              placeholder="Enter work location"
            />
          </FormFieldGroup>
        </div>

        {/* Authentication Section - Only for Add Mode */}
        {isAddMode && (
          <>
            <div style={{
              borderTop: '2px solid #e5e7eb',
              paddingTop: '20px',
              marginTop: '8px',
              gridColumn: '1 / -1'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <input
                  type="checkbox"
                  id="createAccount"
                  checked={formData.createAccount}
                  onChange={(e) => onUpdateField('createAccount', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label 
                  htmlFor="createAccount" 
                  style={{ 
                    fontSize: '16px', 
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <UserCheck size={20} style={{ color: '#10b981' }} />
                  Create Login Account for Employee
                </label>
              </div>

              {formData.createAccount && (
                <div style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #86efac',
                  borderRadius: '8px',
                  padding: '16px',
                  marginTop: '12px'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '12px'
                  }}>
                    <Lock size={16} style={{ color: '#10b981' }} />
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>
                      Login Credentials (will be sent via email)
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <FormFieldGroup label="Username" required error={errors.username}>
                      <InputField
                        value={formData.username}
                        onChange={handleFieldChange('username')}
                        placeholder="Enter username"
                      />
                    </FormFieldGroup>

                    <FormFieldGroup label="Password" required error={errors.password}>
                      <div style={{ position: 'relative' }}>
                        <InputField
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleFieldChange('password')}
                          placeholder="Enter password (min 6 chars)"
                          style={{ paddingRight: '40px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280'
                          }}
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </FormFieldGroup>
                  </div>

                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: '#fef3c7',
                    border: '1px solid #fbbf24',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#92400e'
                  }}>
                    ℹ️ <strong>Note:</strong> The username and password will be sent to the employee's email address. 
                    They should change their password after first login.
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

EmployeeFormBody.displayName = 'EmployeeFormBody';

// PARENT COMPONENT: Employee Modal - Combines all child components
const EmployeeModal = React.memo(({ 
  isOpen, 
  mode,
  employeeData,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({ ...EMPLOYEE_FORM_INITIAL_STATE });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isAddMode = mode === 'add';
  const title = isAddMode ? 'Add New Employee' : 'Edit Employee';
  const saveText = isAddMode ? 'Add Employee' : 'Save Changes';

  useEffect(() => {
    if (employeeData) {
      const formattedData = {
        ...employeeData,
        hireDate: employeeData.hireDate ? 
          new Date(employeeData.hireDate).toISOString().split('T')[0] : '',
        username: '',
        password: '',
        createAccount: false
      };
      setFormData(formattedData);
    } else if (isAddMode) {
      setFormData({ ...EMPLOYEE_FORM_INITIAL_STATE });
    }
    setErrors({});
  }, [employeeData, isAddMode, isOpen]);

  const handleUpdateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }

    if (formData.createAccount) {
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required when creating an account';
      } else if (formData.username.trim().length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }

      if (!formData.password.trim()) {
        newErrors.password = 'Password is required when creating an account';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving employee:', error);
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, formData, onSave, onClose]);

  const isFormValid = useMemo(() => {
    const basicValid = formData.name.trim() && formData.email.trim() && 
           formData.department.trim() && formData.employeeId.trim();
    
    if (formData.createAccount) {
      return basicValid && formData.username.trim() && formData.password.trim();
    }
    
    return basicValid;
  }, [formData]);

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="mts-emp-modal-content">
        <ModalHeader title={title} onClose={onClose} />
        
        <EmployeeFormBody
          formData={formData}
          onUpdateField={handleUpdateField}
          errors={errors}
          isAddMode={isAddMode}
        />
        
        <ModalActions
          onCancel={onClose}
          onSave={handleSave}
          saveDisabled={!isFormValid}
          saveText={saveText}
          isLoading={isLoading}
        />
      </div>
    </ModalOverlay>
  );
});

EmployeeModal.displayName = 'EmployeeModal';

// Employee Details Modal
const EmployeeDetailsModal = React.memo(({ 
  isOpen, 
  employee,
  onClose 
}) => {
  if (!isOpen || !employee) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <ModalOverlay isOpen={isOpen} onClose={onClose}>
      <div className="mts-emp-modal-content" style={{ maxWidth: '600px' }}>
        <ModalHeader title="Employee Details" onClose={onClose} />
        
        <div className="mts-emp-modal-body">
          <div className="mts-emp-form-grid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold'
              }}>
                {employee.name ? employee.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>{employee.name}</h3>
                <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>{employee.position || 'No position specified'}</p>
              </div>
            </div>

            <div className="mts-emp-form-row">
              <FormFieldGroup label="Employee ID">
                <InputField value={employee.employeeId} disabled={true} />
              </FormFieldGroup>
              <FormFieldGroup label="Email">
                <InputField value={employee.email} disabled={true} />
              </FormFieldGroup>
            </div>

            <div className="mts-emp-form-row">
              <FormFieldGroup label="Phone">
                <InputField value={employee.phone || 'N/A'} disabled={true} />
              </FormFieldGroup>
              <FormFieldGroup label="Department">
                <InputField value={employee.department} disabled={true} />
              </FormFieldGroup>
            </div>

            <div className="mts-emp-form-row">
              <FormFieldGroup label="Position">
                <InputField value={employee.position || 'N/A'} disabled={true} />
              </FormFieldGroup>
              <FormFieldGroup label="Employment Type">
                <InputField value={employee.employmentType} disabled={true} />
              </FormFieldGroup>
            </div>

            <div className="mts-emp-form-row">
              <FormFieldGroup label="Status">
                <InputField value={employee.status} disabled={true} />
              </FormFieldGroup>
              <FormFieldGroup label="Hire Date">
                <InputField value={formatDate(employee.hireDate)} disabled={true} />
              </FormFieldGroup>
            </div>

            <div className="mts-emp-form-row">
              <FormFieldGroup label="Location">
                <InputField value={employee.location || 'N/A'} disabled={true} />
              </FormFieldGroup>
            </div>
          </div>
        </div>
        
        <div className="mts-emp-modal-actions">
          <button 
            onClick={onClose}
            className="mts-emp-modal-btn mts-emp-modal-btn-cancel"
            type="button"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
});

EmployeeDetailsModal.displayName = 'EmployeeDetailsModal';

// MAIN PARENT COMPONENT
const ManagerTimesheetDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [viewState, setViewState] = useState({
    activeView: 'employee',
    selectedCompany: location.state?.company || null
  });

  const [timeState, setTimeState] = useState({
    currentTime: new Date()
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: null,
    employeeData: null,
    detailsModalOpen: false,
    selectedEmployee: null
  });

  const [employees, setEmployees] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState({
    employees: true,
    timesheets: true
  });

  const modalHandlers = useMemo(() => ({
    openAddModal: () => {
      setModalState(prev => ({
        ...prev,
        isOpen: true,
        mode: 'add',
        employeeData: null
      }));
    },

    openEditModal: (employee) => {
      setModalState(prev => ({
        ...prev,
        isOpen: true,
        mode: 'edit',
        employeeData: { ...employee }
      }));
    },

    openDetailsModal: (employee) => {
      setModalState(prev => ({
        ...prev,
        detailsModalOpen: true,
        selectedEmployee: employee
      }));
    },

    closeModal: () => {
      setModalState(prev => ({
        ...prev,
        isOpen: false,
        mode: null,
        employeeData: null
      }));
    },

    closeDetailsModal: () => {
      setModalState(prev => ({
        ...prev,
        detailsModalOpen: false,
        selectedEmployee: null
      }));
    }
  }), []);

  const employeeHandlers = useMemo(() => ({
    handleDeleteEmployee: async (employeeId) => {
      const confirm = await Swal.fire({
        title: 'Delete Employee?',
        text: 'Are you sure you want to delete this employee? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });

      if (confirm.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const companyId = viewState.selectedCompany?.id;
          const employee = employees.find(emp => emp.id === employeeId);
          
          if (!companyId || !employee) {
            throw new Error('Invalid company or employee');
          }

          const response = await axios.delete(
            `${BASE_URL}/api/employees/company/${companyId}/${employee.employeeId}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data.success) {
            setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
            
            Swal.fire({
              title: 'Deleted!',
              text: 'Employee has been deleted successfully.',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } catch (error) {
          console.error('Error deleting employee:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete employee';
          
          if (error.response?.data?.hasTimesheets) {
            Swal.fire({
              title: 'Cannot Delete Employee',
              text: `This employee has ${error.response.data.timesheetCount} timesheet(s) associated and cannot be deleted. Please remove the timesheets first.`,
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          } else {
            Swal.fire({
              title: 'Delete Failed',
              text: errorMessage,
              icon: 'error',
              confirmButtonColor: '#dc3545'
            });
          }
        }
      }
    },

    handleAddEmployee: modalHandlers.openAddModal,

    handleSaveEmployee: async (employeeData) => {
      try {
        const token = localStorage.getItem('token');
        const companyId = viewState.selectedCompany?.id;
        
        if (!companyId) {
          throw new Error('No company selected');
        }

        const apiData = {
          name: employeeData.name,
          email: employeeData.email,
          phone: employeeData.phone,
          department: employeeData.department,
          position: employeeData.position,
          employmentType: employeeData.employmentType,
          status: employeeData.status,
          hireDate: employeeData.hireDate,
          location: employeeData.location,
          employeeId: employeeData.employeeId,
          username: employeeData.createAccount ? employeeData.username : undefined,
          password: employeeData.createAccount ? employeeData.password : undefined,
          createAccount: employeeData.createAccount
        };

        if (modalState.mode === 'add') {
          const response = await axios.post(
            `${BASE_URL}/api/employees/company/${companyId}`,
            apiData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data.success) {
            await fetchEmployees();
            Swal.fire({
              title: 'Success!',
              text: 'Employee added successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } else if (modalState.mode === 'edit') {
          const response = await axios.put(
            `${BASE_URL}/api/employees/company/${companyId}/${employeeData.employeeId}`,
            apiData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data.success) {
            await fetchEmployees();
            Swal.fire({
              title: 'Success!',
              text: 'Employee updated successfully',
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        }
      } catch (error) {
        console.error('Error saving employee:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to save employee';
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error'
        });
        
        throw new Error(errorMessage);
      }
    },

    handleEditEmployee: modalHandlers.openEditModal,
    handleViewEmployee: modalHandlers.openDetailsModal

  }), [modalHandlers, modalState.mode, viewState.selectedCompany, employees]);

  const fetchEmployees = useCallback(async () => {
    if (!viewState.selectedCompany?.id) return;
    
    try {
      setLoading(prev => ({ ...prev, employees: true }));
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/employees/company/${viewState.selectedCompany.id}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        const processedEmployees = response.data.data.map(employee => ({
          ...employee,
          id: employee.Id || employee.id,
          employeeId: employee.EmployeeId || employee.employeeId,
          name: employee.Name || employee.name,
          email: employee.Email || employee.email,
          phone: employee.Phone || employee.phone,
          department: employee.Department || employee.department,
          position: employee.Position || employee.position,
          employmentType: employee.EmploymentType || employee.employmentType || 'Full-time',
          status: employee.Status || employee.status || 'Active',
          hireDate: employee.HireDate || employee.hireDate,
          location: employee.Location || employee.location,
          paperless: employee.Paperless || employee.paperless || 'Not enrolled'
        }));
        
        setEmployees(processedEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      Swal.fire({
        title: 'Error',
        text: `Failed to load employees: ${error.response?.data?.message || error.message}`,
        icon: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, employees: false }));
    }
  }, [viewState.selectedCompany]);

const fetchTimesheets = useCallback(async () => {
    if (!viewState.selectedCompany?.id) {
      console.log('❌ No company selected');
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, timesheets: true }));
      const token = localStorage.getItem('token');
      
      console.log('🔍 ========== FETCHING TIMESHEETS ==========');
      console.log('📋 Company Details:', {
        id: viewState.selectedCompany.id,
        name: viewState.selectedCompany.name,
        clientId: viewState.selectedCompany.clientId
      });
      console.log('🔐 Token exists:', !!token);
      console.log('🌐 API URL:', `${BASE_URL}/api/timesheets/company/${viewState.selectedCompany.id}`);
      
      const response = await axios.get(
        `${BASE_URL}/api/timesheets/company/${viewState.selectedCompany.id}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ API Response Status:', response.status);
      console.log('📦 Response Data Type:', typeof response.data);
      console.log('📦 Response Data:', response.data);
      console.log('📦 Response Keys:', Object.keys(response.data || {}));
      
      // Check all possible data locations
      console.log('🔎 Checking data locations:');
      console.log('  - response.data is Array?', Array.isArray(response.data));
      console.log('  - response.data.data exists?', !!response.data?.data);
      console.log('  - response.data.data is Array?', Array.isArray(response.data?.data));
      console.log('  - response.data.timesheets exists?', !!response.data?.timesheets);
      console.log('  - response.data.timesheets is Array?', Array.isArray(response.data?.timesheets));
      console.log('  - response.data.success:', response.data?.success);

      // More flexible response handling
      let rawData = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          console.log('✓ Data found: Direct array');
          rawData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          console.log('✓ Data found: response.data.data');
          rawData = response.data.data;
        } else if (response.data.timesheets && Array.isArray(response.data.timesheets)) {
          console.log('✓ Data found: response.data.timesheets');
          rawData = response.data.timesheets;
        } else if (response.data.success === true && response.data.data) {
          console.log('✓ Data found: response.data.data (with success flag)');
          rawData = Array.isArray(response.data.data) ? response.data.data : [];
        } else if (response.data.success === false) {
          console.log('⚠️ API returned success: false');
          console.log('Message:', response.data.message);
        } else {
          console.log('⚠️ Could not locate data array in response');
          console.log('Full response structure:', JSON.stringify(response.data, null, 2));
        }
      }
      
      console.log('📊 Raw Data Length:', rawData.length);
      console.log('📊 Raw Data Sample:', rawData[0]);
      
      if (!Array.isArray(rawData) || rawData.length === 0) {
        console.log('⚠️ No timesheets found - setting empty array');
        setTimesheets([]);
        return;
      }
      
      console.log('🔄 Processing', rawData.length, 'timesheets...');
      
      const processedTimesheets = rawData.map((timesheet, index) => {
        console.log(`\n--- Processing Timesheet #${index + 1} ---`);
        console.log('Original data:', timesheet);
        console.log('Available keys:', Object.keys(timesheet));
        
        // ID mapping
        const id = timesheet.Id || timesheet.id || timesheet.TimesheetId || timesheet.timesheetId || 
                   timesheet.timesheet_id || timesheet._id || `temp-${Date.now()}-${index}`;
        console.log('  ✓ ID:', id);
        
        // Employee ID mapping
        const employeeId = timesheet.EmployeeId || timesheet.employeeId || timesheet.employee_id || 
                          timesheet.EmployeeID || timesheet.employeeID;
        console.log('  ✓ Employee ID:', employeeId);
        
        // Employee Name mapping
        const employeeName = timesheet.EmployeeName || timesheet.employeeName || timesheet.employee_name ||
                           timesheet.Name || timesheet.name || timesheet.FullName || timesheet.fullName || 
                           timesheet.full_name || 'Unknown Employee';
        console.log('  ✓ Employee Name:', employeeName);
        
        // Employee Email mapping
        const employeeEmail = timesheet.EmployeeEmail || timesheet.employeeEmail || timesheet.employee_email ||
                             timesheet.Email || timesheet.email || 'No email';
        console.log('  ✓ Employee Email:', employeeEmail);
        
        // Period dates
        let periodStart = timesheet.PeriodStart || timesheet.periodStart || timesheet.period_start || 
                         timesheet.StartDate || timesheet.startDate || timesheet.start_date ||
                         timesheet.start || timesheet.from || timesheet.From;
        
        let periodEnd = timesheet.PeriodEnd || timesheet.periodEnd || timesheet.period_end || 
                       timesheet.EndDate || timesheet.endDate || timesheet.end_date ||
                       timesheet.end || timesheet.to || timesheet.To;
        
        const periodString = timesheet.PeriodDates || timesheet.periodDates || timesheet.period_dates ||
                           timesheet.Period || timesheet.period || timesheet.DateRange || timesheet.dateRange;
        
        if (periodString && typeof periodString === 'string') {
          const parts = periodString.split(/\s*-\s*|\s*to\s*/i);
          if (parts.length === 2) {
            periodStart = parts[0].trim();
            periodEnd = parts[1].trim();
          }
        }
        console.log('  ✓ Period:', periodStart, 'to', periodEnd);
        
        // Hours
        const totalHours = Number(
          timesheet.TotalHours || timesheet.totalHours || timesheet.total_hours ||
          timesheet.Hours || timesheet.hours || timesheet.TotalHrs || timesheet.totalHrs ||
          timesheet.WorkedHours || timesheet.workedHours || 0
        );
        console.log('  ✓ Total Hours:', totalHours);
        
        const overtimeHours = Number(
          timesheet.OvertimeHours || timesheet.overtimeHours || timesheet.overtime_hours ||
          timesheet.Overtime || timesheet.overtime || timesheet.OT || timesheet.ot || 0
        );
        console.log('  ✓ Overtime Hours:', overtimeHours);
        
        // Status
        let status = timesheet.Status || timesheet.status || timesheet.ApprovalStatus || 
                    timesheet.approvalStatus || timesheet.approval_status || 'Pending';
        
        status = String(status).trim();
        if (status.toLowerCase().includes('approve')) {
          status = 'Approved';
        } else if (status.toLowerCase().includes('reject')) {
          status = 'Rejected';
        } else {
          status = 'Pending';
        }
        console.log('  ✓ Status:', status);
        
        const processed = {
          ...timesheet,
          id,
          employeeId,
          employeeName,
          employeeEmail,
          periodStart,
          periodEnd,
          totalHours,
          overtimeHours,
          status,
          selected: false,
          submittedDate: timesheet.SubmittedDate || timesheet.submittedDate || timesheet.submitted_date || 
                        timesheet.CreatedAt || timesheet.createdAt || timesheet.created_at ||
                        timesheet.Date || timesheet.date || new Date().toISOString()
        };
        
        return processed;
      });
      
      console.log('\n✅ Processing Complete!');
      console.log('📊 Total Processed:', processedTimesheets.length);
      console.log('📋 Final Timesheets:', processedTimesheets);
      console.log('========================================\n');
      
      setTimesheets(processedTimesheets);
      
    } catch (error) {
      console.error('\n❌ ========== ERROR FETCHING TIMESHEETS ==========');
      console.error('Error Type:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Status:', error.response?.status);
      console.error('Error Data:', error.response?.data);
      console.error('Error Headers:', error.response?.headers);
      console.error('Request URL:', error.config?.url);
      console.error('Request Method:', error.config?.method);
      console.error('Request Headers:', error.config?.headers);
      console.error('=================================================\n');
      
      setTimesheets([]);
      
      // Only show error alert if it's not a 404
      if (error.response?.status !== 404) {
        Swal.fire({
          title: 'Error Loading Timesheets',
          html: `
            <p><strong>Company:</strong> ${viewState.selectedCompany?.name}</p>
            <p><strong>Error:</strong> ${error.response?.data?.message || error.message}</p>
            <p><strong>Status:</strong> ${error.response?.status || 'Network Error'}</p>
            <p style="font-size: 12px; color: #666; margin-top: 10px;">Check console for detailed logs</p>
          `,
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } finally {
      setLoading(prev => ({ ...prev, timesheets: false }));
    }
  }, [viewState.selectedCompany]);

  const navigationHandlers = useMemo(() => ({
    setActiveView: (view) => setViewState(prev => ({ ...prev, activeView: view })),
    handleBackToCompanies: () => navigate('/companies'),
    handleEmployeeClick: (employee) => {
      navigate(`/user-details/${employee.id}`, { 
        state: { 
          employee,
          company: viewState.selectedCompany 
        } 
      });
    }
  }), [navigate, viewState.selectedCompany]);

  const timesheetHandlers = useMemo(() => ({
    handleSelectTimesheet: (id) => {
      setTimesheets(prev => prev.map(timesheet => 
        timesheet.id === id ? { ...timesheet, selected: !timesheet.selected } : timesheet
      ));
    },

    handleSelectAllTimesheets: () => {
      const pendingTimesheets = timesheets.filter(t => t.status === 'Pending');
      const allPendingSelected = pendingTimesheets.every(timesheet => timesheet.selected);
      
      setTimesheets(prev => prev.map(timesheet => 
        timesheet.status === 'Pending' 
          ? { ...timesheet, selected: !allPendingSelected } 
          : timesheet
      ));
    },

handleApproveTimesheet: async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/api/timesheets/${id}/approve`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      await fetchTimesheets();
      Swal.fire({
        title: 'Approved!',
        text: 'Timesheet approved successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error('Error approving timesheet:', error);
    Swal.fire({
      title: 'Error',
      text: error.response?.data?.message || 'Failed to approve timesheet',
      icon: 'error'
    });
  }
},

handleRejectTimesheet: async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${BASE_URL}/api/timesheets/${id}/reject`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.success) {
      await fetchTimesheets();
      Swal.fire({
        title: 'Rejected!',
        text: 'Timesheet rejected successfully',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (error) {
    console.error('Error rejecting timesheet:', error);
    Swal.fire({
      title: 'Error',
      text: error.response?.data?.message || 'Failed to reject timesheet',
      icon: 'error'
    });
  }
},

handleBulkApprove: async () => {
      const selectedIds = timesheets
        .filter(timesheet => timesheet.selected && timesheet.status === 'Pending')
        .map(timesheet => timesheet.id);
      
      if (selectedIds.length === 0) {
        Swal.fire({
          title: 'No Selection',
          text: 'Please select pending timesheets to approve.',
          icon: 'warning'
        });
        return;
      }

      const confirm = await Swal.fire({
        title: 'Approve Timesheets?',
        text: `Are you sure you want to approve ${selectedIds.length} timesheet(s)?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, approve them!',
        cancelButtonText: 'Cancel'
      });

      if (confirm.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          
          // Show loading
          Swal.fire({
            title: 'Processing...',
            text: 'Approving timesheets...',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            }
          });

          // Approve each timesheet individually
          const approvePromises = selectedIds.map(id =>
            axios.post(
              `${BASE_URL}/api/timesheets/${id}/approve`,
              {},
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              }
            )
          );

          await Promise.all(approvePromises);
          
          // Refresh timesheets
          await fetchTimesheets();
          
          Swal.fire({
            title: 'Approved!',
            text: `Successfully approved ${selectedIds.length} timesheet(s)`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (error) {
          console.error('Error bulk approving timesheets:', error);
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message || 'Failed to approve some timesheets',
            icon: 'error'
          });
        }
      }
    },

    handleBulkReject: async () => {
      const selectedIds = timesheets
        .filter(timesheet => timesheet.selected && timesheet.status === 'Pending')
        .map(timesheet => timesheet.id);
      
      if (selectedIds.length === 0) {
        Swal.fire({
          title: 'No Selection',
          text: 'Please select pending timesheets to reject.',
          icon: 'warning'
        });
        return;
      }

      const confirm = await Swal.fire({
        title: 'Reject Timesheets?',
        text: `Are you sure you want to reject ${selectedIds.length} timesheet(s)?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, reject them!',
        cancelButtonText: 'Cancel'
      });

      if (confirm.isConfirmed) {
        try {
          const token = localStorage.getItem('token');
          const companyId = viewState.selectedCompany?.id;
          
          const response = await axios.post(
            `${BASE_URL}/api/timesheets/bulk/reject`,
            { 
              timesheetIds: selectedIds,
              companyId: companyId 
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (response.data.success) {
            await fetchTimesheets();
            Swal.fire({
              title: 'Rejected!',
              text: response.data.message,
              icon: 'success',
              timer: 2000,
              showConfirmButton: false
            });
          }
        } catch (error) {
          console.error('Error bulk rejecting timesheets:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to reject timesheets',
            icon: 'error'
          });
        }
      }
    }
  }), [timesheets, viewState.selectedCompany, fetchTimesheets]);

  const computedValues = useMemo(() => {
    const pendingTimesheets = timesheets.filter(t => t.status === 'Pending');
    const hasSelectedTimesheets = pendingTimesheets.some(t => t.selected);
    const allPendingTimesheetsSelected = pendingTimesheets.length > 0 && pendingTimesheets.every(t => t.selected);
    
    return {
      hasSelectedTimesheets,
      allPendingTimesheetsSelected,
      pendingCount: pendingTimesheets.length,
      selectedCount: pendingTimesheets.filter(t => t.selected).length
    };
  }, [timesheets]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState({ currentTime: new Date() });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (viewState.selectedCompany?.id) {
      fetchEmployees();
      fetchTimesheets();
    }
  }, [viewState.selectedCompany, fetchEmployees, fetchTimesheets]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const HeaderSection = React.memo(() => (
    <div className="mts-header">
      <div className="mts-header-content">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <button 
              onClick={navigationHandlers.handleBackToCompanies}
              className="mts-back-btn"
            >
              <ChevronLeft size={16} />
              Back to Companies
            </button>
          </div>
          <h1 className="mts-header-title">Manager Dashboard</h1>
          <p className="mts-header-subtitle">
            {viewState.selectedCompany ? `${viewState.selectedCompany.name} - ` : ''}Employee Management
          </p>
          {viewState.selectedCompany && (
            <div className="company-info-banner">
              <Building size={16} />
              <span>Client ID: {viewState.selectedCompany.clientId}</span>
              <span> | </span>
              <span>Payroll Due: {viewState.selectedCompany.payrollDueDate ? formatDate(viewState.selectedCompany.payrollDueDate) : 'Not set'}</span>
              <span> | </span>
              <span>Next Check: {viewState.selectedCompany.nextCheckDate ? formatDate(viewState.selectedCompany.nextCheckDate) : 'Not set'}</span>
            </div>
          )}
        </div>
        <div className="mts-header-time">
          <Clock size={16} />
          {timeState.currentTime.toLocaleDateString()} {timeState.currentTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  ));

  const NavigationTabs = React.memo(() => (
    <div className="mts-navigation-tabs">
      <button
        className={`mts-nav-tab ${viewState.activeView === 'employee' ? 'active' : ''}`}
        onClick={() => navigationHandlers.setActiveView('employee')}
      >
        <User size={18} />
        Employee Directory
      </button>
      <button
        className={`mts-nav-tab ${viewState.activeView === 'timesheet' ? 'active' : ''}`}
        onClick={() => navigationHandlers.setActiveView('timesheet')}
      >
        <ClipboardList size={18} />
        Timesheet Approval
        {computedValues.pendingCount > 0 && (
          <span style={{
            backgroundColor: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            {computedValues.pendingCount}
          </span>
        )}
      </button>
      <button
        className={`mts-nav-tab ${viewState.activeView === 'benefits' ? 'active' : ''}`}
        onClick={() => navigationHandlers.setActiveView('benefits')}
      >
        <Heart size={18} />
        Benefits
      </button>
      <button
        className={`mts-nav-tab ${viewState.activeView === 'compliance' ? 'active' : ''}`}
        onClick={() => navigationHandlers.setActiveView('compliance')}
      >
        <Shield size={18} />
        Compliance
      </button>
      <button
        className={`mts-nav-tab ${viewState.activeView === 'c2c' ? 'active' : ''}`}
        onClick={() => navigationHandlers.setActiveView('c2c')}
      >
        <C2CIcon size={18} />
        C2C Management
      </button>
    </div>
  ));

  const EmployeeView = React.memo(() => (
    <div className="mts-employee-table">
      <div className="mts-employee-table-header-container">
        <h2 className="mts-employee-table-title">Employee Directory</h2>
        <button 
          onClick={employeeHandlers.handleAddEmployee}
          className="mts-add-employee-btn"
        >
          <Plus size={16} />
          Add Employee
        </button>
      </div>
      
      {loading.employees ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading employees...</p>
        </div>
      ) : employees.length > 0 ? (
        <>
          <div className="mts-employee-table-table-header">
            <div>Name & Contact</div>
            <div>Department</div>
            <div>Position</div>
            <div>Employment Details</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          <div className="mts-employee-table-table-rows">
            {employees.map(employee => (
              <div key={employee.id} className="mts-employee-table-table-row">
                <div>
                  <button
                    onClick={() => navigationHandlers.handleEmployeeClick(employee)}
                    className="mts-employee-name-btn"
                  >
                    {employee.name}
                  </button>
                  <div className="mts-contact-info">
                    <div className="mts-contact-email">{employee.email}</div>
                    <div className="mts-contact-phone">{employee.phone || 'N/A'}</div>
                  </div>
                </div>
                <div>{employee.department}</div>
                <div>{employee.position || 'N/A'}</div>
                <div>
                  <div className="mts-employment-type">{employee.employmentType}</div>
                  <div className="mts-employment-details">
                    ID: {employee.employeeId} | Hired: {formatDate(employee.hireDate)}
                  </div>
                </div>
                <div>
                  <span className={`mts-status-badge ${
                    employee.status === 'Active' ? 'mts-status-registered' : 'mts-status-pending'
                  }`}>
                    {employee.status}
                  </span>
                </div>
                <div className="mts-actions">
                  <button 
                    className="mts-action-btn view"
                    onClick={() => employeeHandlers.handleViewEmployee(employee)}
                    title="View Employee Details"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    className="mts-action-btn"
                    onClick={() => employeeHandlers.handleEditEmployee(employee)}
                    title="Edit Employee"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    className="mts-action-btn delete"
                    onClick={() => employeeHandlers.handleDeleteEmployee(employee.id)}
                    title="Delete Employee"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-data">
          <User size={48} />
          <p>No employees found</p>
          <button 
            onClick={employeeHandlers.handleAddEmployee}
            className="mts-add-employee-btn"
          >
            <Plus size={16} />
            Add Employee
          </button>
        </div>
      )}
    </div>
  ));

  const TimesheetView = React.memo(() => (
    <div className="mts-employee-table">
      <div className="mts-employee-table-header-container">
        <h2 className="mts-employee-table-title">Timesheet Approval</h2>
        <div className="mts-bulk-actions">
          <button 
            onClick={timesheetHandlers.handleBulkApprove}
            disabled={!computedValues.hasSelectedTimesheets}
            className="mts-bulk-approve-btn"
          >
            <ThumbsUp size={16} />
            Approve Selected ({computedValues.selectedCount})
          </button>
          <button 
            onClick={timesheetHandlers.handleBulkReject}
            disabled={!computedValues.hasSelectedTimesheets}
            className="mts-bulk-reject-btn"
          >
            <ThumbsDown size={16} />
            Reject Selected ({computedValues.selectedCount})
          </button>
        </div>
      </div>
      
      {loading.timesheets ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading timesheets...</p>
        </div>
      ) : timesheets.length > 0 ? (
        <>
          <div className="mts-employee-table-table-header">
            <div>
              <input
                type="checkbox"
                checked={computedValues.allPendingTimesheetsSelected}
                onChange={timesheetHandlers.handleSelectAllTimesheets}
                disabled={computedValues.pendingCount === 0}
              />
            </div>
            <div>Employee</div>
            <div>Period</div>
            <div>Hours</div>
            <div>Overtime</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
          
          <div className="mts-employee-table-table-rows">
            {timesheets.map(timesheet => (
              <div key={timesheet.id} className="mts-employee-table-table-row">
                <div>
                  <input
                    type="checkbox"
                    checked={timesheet.selected || false}
                    onChange={() => timesheetHandlers.handleSelectTimesheet(timesheet.id)}
                    disabled={timesheet.status !== 'Pending'}
                  />
                </div>
                <div>
                  <div className="mts-employee-name">{timesheet.employeeName}</div>
                  <div className="mts-contact-email">{timesheet.employeeId}</div>
                </div>
                <div>
                  <div className="mts-period">
                    {formatDate(timesheet.periodStart)} - {formatDate(timesheet.periodEnd)}
                  </div>
                </div>
                <div>
                  <div className="mts-hours">{timesheet.totalHours} hours</div>
                </div>
                <div>
                  <div className="mts-overtime">{timesheet.overtimeHours || 0} hours</div>
                </div>
                <div>
                  <div className="mts-timesheet-status">
                    <span className={`mts-status-badge ${
                      timesheet.status === 'Approved' ? 'mts-status-registered' :
                      timesheet.status === 'Rejected' ? 'mts-status-pending' : 'mts-status-pending'
                    }`}>
                      {timesheet.status}
                    </span>
                  </div>
                </div>
                <div className="mts-actions">
                  {timesheet.status === 'Pending' && (
                    <>
                      <button 
                        className="mts-action-btn approve"
                        onClick={() => timesheetHandlers.handleApproveTimesheet(timesheet.id)}
                        title="Approve Timesheet"
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button 
                        className="mts-action-btn reject"
                        onClick={() => timesheetHandlers.handleRejectTimesheet(timesheet.id)}
                        title="Reject Timesheet"
                      >
                        <ThumbsDown size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="no-data">
          <ClipboardList size={48} />
          <p>No timesheets found</p>
        </div>
      )}
    </div>
  ));

  const OtherViews = React.memo(() => (
    <div className="mts-other-views">
      <h2 className="mts-employee-table-title">
        {viewState.activeView === 'benefits' && 'Benefits Management'}
        {viewState.activeView === 'compliance' && 'Compliance Management'}
        {viewState.activeView === 'c2c' && 'C2C Management'}
      </h2>
      <div className="coming-soon">
        <div className="coming-soon-content">
          <Clock size={48} />
          <h3>Coming Soon</h3>
          <p>This feature is currently under development and will be available soon.</p>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="mts-container">
      <HeaderSection />
      <NavigationTabs />
      
      <main className="mts-main-content">
        {viewState.activeView === 'employee' && <EmployeeView />}
        {viewState.activeView === 'timesheet' && <TimesheetView />}
        {(viewState.activeView === 'benefits' || 
          viewState.activeView === 'compliance' || 
          viewState.activeView === 'c2c') && <OtherViews />}
      </main>

      <EmployeeModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        employeeData={modalState.employeeData}
        onClose={modalHandlers.closeModal}
        onSave={employeeHandlers.handleSaveEmployee}
      />

      <EmployeeDetailsModal
        isOpen={modalState.detailsModalOpen}
        employee={modalState.selectedEmployee}
        onClose={modalHandlers.closeDetailsModal}
      />
    </div>
  );
};

export default ManagerTimesheetDashboard;