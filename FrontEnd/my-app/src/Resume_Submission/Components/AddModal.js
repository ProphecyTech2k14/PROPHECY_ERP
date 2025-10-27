import React, { useState } from 'react';
import { X, Save, Upload, ChevronDown } from 'lucide-react';
import '../styles/Modal.css';
import BASE_URL from "../../url";
import axios from "axios";
import Swal from 'sweetalert2';

const AddModal = ({ onClose, onSave, candidate }) => {
  const [formData, setFormData] = useState(candidate ? {
    FirstName: candidate.FirstName || '',
    LastName: candidate.LastName || '',
    EmailID: candidate.EmailID || '',
    CountryCode: candidate.CountryCode || '+1',
    PhoneNumber1: candidate.PhoneNumber1 || '',
    PhoneNumber2: candidate.PhoneNumber2 || '',
    ResumeUpload: null,
    CandidateInfo: candidate.CandidateInfo || '',
    CurrentLocation: candidate.CurrentLocation || '',
    CurrentSalary: candidate.CurrentSalary || '',
    ExpectedSalary: candidate.ExpectedSalary || '',
    NoticePeriod: candidate.NoticePeriod || '',
    CurrentEmployer: candidate.CurrentEmployer || '',
    Experience: candidate.Experience || '', // Total Years of Experience
    RelevantExperience: candidate.RelevantExperience || '', // NEW - Relevant Years
    Dob: candidate.Dob ? candidate.Dob.split('T')[0] : '',
    LinkedInProfile: candidate.LinkedInProfile || '',
    JobRoleApplied: candidate.JobRoleApplied || '',
    CoverLetter: candidate.CoverLetter || '',
    PassportNo: candidate.PassportNo || '',
    Skills: candidate.Skills || '',
    Education: candidate.Education || '',
    Certifications: candidate.Certifications || ''
  } : {
    FirstName: '',
    LastName: '',
    EmailID: '',
    CountryCode: '+1',
    PhoneNumber1: '',
    PhoneNumber2: '',
    ResumeUpload: null,
    CandidateInfo: '',
    CurrentLocation: '',
    CurrentSalary: '',
    ExpectedSalary: '',
    NoticePeriod: '',
    CurrentEmployer: '',
    Experience: '', // Total Years of Experience
    RelevantExperience: '', // NEW - Relevant Years
    Dob: '',
    LinkedInProfile: '',
    JobRoleApplied: '',
    CoverLetter: '',
    PassportNo: '',
    Skills: '',
    Education: '',
    Certifications: ''
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobRoleDropdownOpen, setJobRoleDropdownOpen] = useState(false);
  const [jobRoleSearchTerm, setJobRoleSearchTerm] = useState('');

  const countryCodes = [
    { code: '+1', name: 'United States (+1)' },
    { code: '+44', name: 'United Kingdom (+44)' },
    { code: '+91', name: 'India (+91)' },
    { code: '+86', name: 'China (+86)' },
    { code: '+33', name: 'France (+33)' },
    { code: '+49', name: 'Germany (+49)' },
    { code: '+81', name: 'Japan (+81)' },
    { code: '+7', name: 'Russia (+7)' },
    { code: '+52', name: 'Mexico (+52)' },
    { code: '+55', name: 'Brazil (+55)' },
    { code: '+61', name: 'Australia (+61)' },
    { code: '+34', name: 'Spain (+34)' },
    { code: '+39', name: 'Italy (+39)' },
    { code: '+82', name: 'South Korea (+82)' },
    { code: '+90', name: 'Turkey (+90)' },
    { code: '+92', name: 'Pakistan (+92)' },
    { code: '+93', name: 'Afghanistan (+93)' },
    { code: '+20', name: 'Egypt (+20)' },
    { code: '+27', name: 'South Africa (+27)' },
    { code: '+30', name: 'Greece (+30)' },
    { code: '+31', name: 'Netherlands (+31)' },
    { code: '+32', name: 'Belgium (+32)' },
    { code: '+36', name: 'Hungary (+36)' },
    { code: '+43', name: 'Austria (+43)' },
    { code: '+45', name: 'Denmark (+45)' },
    { code: '+46', name: 'Sweden (+46)' },
    { code: '+47', name: 'Norway (+47)' },
    { code: '+48', name: 'Poland (+48)' },
    { code: '+51', name: 'Peru (+51)' },
    { code: '+54', name: 'Argentina (+54)' },
    { code: '+56', name: 'Chile (+56)' },
    { code: '+60', name: 'Malaysia (+60)' },
    { code: '+62', name: 'Indonesia (+62)' },
    { code: '+63', name: 'Philippines (+63)' },
    { code: '+64', name: 'New Zealand (+64)' },
    { code: '+65', name: 'Singapore (+65)' },
    { code: '+66', name: 'Thailand (+66)' },
    { code: '+84', name: 'Vietnam (+84)' },
    { code: '+852', name: 'Hong Kong (+852)' },
    { code: '+853', name: 'Macau (+853)' },
    { code: '+886', name: 'Taiwan (+886)' },
    { code: '+971', name: 'United Arab Emirates (+971)' },
    { code: '+966', name: 'Saudi Arabia (+966)' },
    { code: '+965', name: 'Kuwait (+965)' },
    { code: '+973', name: 'Bahrain (+973)' },
    { code: '+974', name: 'Qatar (+974)' },
    { code: '+975', name: 'Bhutan (+975)' },
    { code: '+976', name: 'Mongolia (+976)' },
    { code: '+977', name: 'Nepal (+977)' },
    { code: '+992', name: 'Tajikistan (+992)' },
    { code: '+993', name: 'Turkmenistan (+993)' },
    { code: '+994', name: 'Azerbaijan (+994)' },
    { code: '+995', name: 'Georgia (+995)' },
    { code: '+996', name: 'Kyrgyzstan (+996)' },
    { code: '+998', name: 'Uzbekistan (+998)' }
  ];

  const jobRoles = [
    'Software Engineer', 'Senior Software Engineer', 'Lead Software Engineer',
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'React Developer', 'Angular Developer', 'Vue.js Developer',
    'Node.js Developer', 'Python Developer', 'Java Developer',
    '.NET Developer', 'PHP Developer', 'Mobile App Developer',
    'iOS Developer', 'Android Developer', 'DevOps Engineer',
    'Cloud Architect', 'Data Scientist', 'Data Engineer',
    'QA Engineer', 'Business Analyst', 'Product Manager',
    'UI/UX Designer', 'Project Manager', 'Technical Lead'
  ];

  const filteredJobRoles = jobRoles.filter(role =>
    role.toLowerCase().includes(jobRoleSearchTerm.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'ResumeUpload') {
      if (files && files[0]) {
        const file = files[0];
        
        const validTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!validTypes.includes(file.type)) {
          setUploadError('Only PDF and Word documents allowed (PDF, DOC, DOCX)');
          e.target.value = '';
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          setUploadError('File size must be less than 5MB');
          e.target.value = '';
          return;
        }
        
        console.log('File selected:', {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        setUploadError(null);
        setFormData(prev => ({ ...prev, [name]: file }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleJobRoleInputChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, JobRoleApplied: value }));
    setJobRoleSearchTerm(value);
    setJobRoleDropdownOpen(true);
  };

  const handleJobRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, JobRoleApplied: role }));
    setJobRoleSearchTerm(role);
    setJobRoleDropdownOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setUploadError(null);
    setIsSubmitting(true);

    try {
      const requiredFields = ['FirstName', 'LastName', 'EmailID', 'JobRoleApplied'];
      const missingFields = [];
      
      requiredFields.forEach(field => {
        const value = formData[field];
        const stringValue = value === null || value === undefined ? '' : String(value).trim();
        if (!stringValue) {
          missingFields.push(field);
        }
      });

      if (missingFields.length > 0) {
        setUploadError(`Missing required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      if (!formData.ResumeUpload && !candidate) {
        setUploadError('Resume upload is required for new candidates');
        setIsSubmitting(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.EmailID)) {
        setUploadError('Please enter a valid email address');
        setIsSubmitting(false);
        return;
      }

      console.log('Preparing form submission...');

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }

      const formDataToSend = new FormData();
      
      if (formData.ResumeUpload && formData.ResumeUpload instanceof File) {
        formDataToSend.append('ResumeUpload', formData.ResumeUpload);
        console.log('Added file:', {
          fileName: formData.ResumeUpload.name,
          fileSize: formData.ResumeUpload.size,
          fileType: formData.ResumeUpload.type
        });
      }
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'ResumeUpload') {
          if (value === null || value === undefined) {
            return;
          }
          
          let processedValue;
          
          if (typeof value === 'string') {
            processedValue = value.trim();
            if (!requiredFields.includes(key) && processedValue === '') {
              return;
            }
          } else if (typeof value === 'number') {
            processedValue = value.toString();
          } else {
            processedValue = String(value);
          }
          
          if (processedValue && processedValue !== 'null' && processedValue !== 'undefined') {
            formDataToSend.append(key, processedValue);
          }
        }
      });

      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        timeout: 30000
      };

      let response;
      let url;
      
      if (candidate && (candidate.Resume_ID || candidate.id)) {
        const candidateId = candidate.Resume_ID || candidate.id;
        url = `${BASE_URL}/api/resumes/${candidateId}`;
        console.log('Making PUT request to:', url);
        response = await axios.put(url, formDataToSend, config);
      } else {
        url = `${BASE_URL}/api/resumes`;
        console.log('Making POST request to:', url);
        response = await axios.post(url, formDataToSend, config);
      }

      console.log('Response received:', response.data);

      if (response.data && response.data.success !== false) {
        const message = response.data.message || (candidate ? 'Candidate updated successfully!' : 'Candidate added successfully!');
        
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: message,
          timer: 2000,
          showConfirmButton: false
        });
        
        if (typeof onSave === 'function') {
          await onSave();
        }
        
        onClose();
      } else {
        throw new Error(response.data.error || response.data.details || 'Operation failed');
      }

    } catch (error) {
      console.error('Submission error:', error);
      
      let errorMsg = candidate ? 'Failed to update candidate' : 'Failed to submit candidate';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        errorMsg = errorData.error || 
                  errorData.details || 
                  errorData.message || 
                  `Server error (${error.response.status})`;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setUploadError(errorMsg);
      
      Swal.fire({
        icon: 'error',
        title: candidate ? 'Update Failed' : 'Submission Failed',
        text: errorMsg,
        footer: error.response?.status ? `Status: ${error.response.status}` : ''
      });
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>{candidate ? 'Edit Candidate' : 'Add New Candidate'}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">

          <div className="resume-upload-section">
            <div className="form-group">
              <label>Resume Upload{!candidate ? '*' : ''} (PDF or Word)</label>
              <div className="file-upload-container">
                <label className="file-upload-label">
                  <Upload size={16} />
                  <span>Choose File</span>
                  <input
                    type="file"
                    name="ResumeUpload"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx"
                    required={!candidate}
                    className="file-upload-input"
                  />
                </label>
                {formData.ResumeUpload ? (
                  <div className="file-info">
                    <span>{formData.ResumeUpload.name}</span>
                    <span>({Math.round(formData.ResumeUpload.size / 1024)} KB)</span>
                  </div>
                ) : candidate ? (
                  <div className="file-info">
                    <span>Current file exists (Upload new file to replace)</span>
                  </div>
                ) : (
                  <div className="file-info">No file selected</div>
                )}
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="upload-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <span>{uploadProgress}%</span>
                </div>
              )}
              {uploadError && <div className="error-message">{uploadError}</div>}
            </div>
          </div>
          
          <div className="form-columns">
            <div className="form-column">
              <div className="form-group">
                <label>First Name*</label>
                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Last Name*</label>
                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email*</label>
                <input
                  type="email"
                  name="EmailID"
                  value={formData.EmailID}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone Number*</label>
                <div className="phone-input">
                  <select
                    name="CountryCode"
                    value={formData.CountryCode}
                    onChange={handleChange}
                    required
                  >
                    {countryCodes.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="PhoneNumber1"
                    value={formData.PhoneNumber1}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Alternate Phone</label>
                <input
                  type="tel"
                  name="PhoneNumber2"
                  value={formData.PhoneNumber2}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Passport Number</label>
                <input
                  type="text"
                  name="PassportNo"
                  value={formData.PassportNo}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-group">
                <label>Current Location</label>
                <input
                  type="text"
                  name="CurrentLocation"
                  value={formData.CurrentLocation}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>Current Salary</label>
                <input
                  type="number"
                  name="CurrentSalary"
                  value={formData.CurrentSalary}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="form-group">
                <label>Expected Salary</label>
                <input
                  type="number"
                  name="ExpectedSalary"
                  value={formData.ExpectedSalary}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                />
              </div>
              
              <div className="form-group">
                <label>Notice Period</label>
                <input
                  type="text"
                  name="NoticePeriod"
                  value={formData.NoticePeriod}
                  onChange={handleChange}
                  placeholder="e.g., 30 days, 2 months"
                />
              </div>
              
              <div className="form-group">
                <label>Current Employer</label>
                <input
                  type="text"
                  name="CurrentEmployer"
                  value={formData.CurrentEmployer}
                  onChange={handleChange}
                />
              </div>

              {/* TOTAL YEARS OF EXPERIENCE */}
              <div className="form-group">
                <label>Total Years of Experience</label>
                <input
                  type="text"
                  name="Experience"
                  value={formData.Experience}
                  onChange={handleChange}
                  placeholder="e.g., 5, 5.5, 10+"
                  title="Enter total years of experience (e.g., 5, 5.5, 10+)"
                />
              </div>

              {/* RELEVANT YEARS OF EXPERIENCE - NEW FIELD */}
              <div className="form-group">
                <label>Relevant Years of Experience</label>
                <input
                  type="text"
                  name="RelevantExperience"
                  value={formData.RelevantExperience}
                  onChange={handleChange}
                  placeholder="e.g., 3, 3.5, 5+"
                  title="Enter relevant years of experience in this domain (e.g., 3, 3.5, 5+)"
                />
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="Dob"
                  value={formData.Dob}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group">
                <label>LinkedIn Profile</label>
                <input
                  type="url"
                  name="LinkedInProfile"
                  value={formData.LinkedInProfile}
                  onChange={handleChange}
                  placeholder="https://www.linkedin.com/in/username"
                />
              </div>
              
              <div className="form-group">
                <label>Job Role Applied*</label>
                <div className="job-role-dropdown-container" style={{ position: 'relative' }}>
                  <div className="job-role-input-wrapper" style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="JobRoleApplied"
                      value={formData.JobRoleApplied}
                      onChange={handleJobRoleInputChange}
                      onFocus={() => setJobRoleDropdownOpen(true)}
                      placeholder="Type to search or select a role"
                      required
                      style={{
                        width: '100%',
                        padding: '8px 30px 8px 12px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <ChevronDown 
                      size={16} 
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#666'
                      }}
                      onClick={() => setJobRoleDropdownOpen(!jobRoleDropdownOpen)}
                    />
                  </div>
                  
                  {jobRoleDropdownOpen && (
                    <div 
                      className="job-role-dropdown"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        backgroundColor: 'white',
                        border: '1px solid #ddd',
                        borderTop: 'none',
                        borderRadius: '0 0 4px 4px',
                        zIndex: 1000,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    >
                      {filteredJobRoles.length > 0 ? (
                        filteredJobRoles.map((role, index) => (
                          <div
                            key={index}
                            className="job-role-option"
                            onClick={() => handleJobRoleSelect(role)}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f0f0f0',
                              fontSize: '14px',
                              ':hover': {
                                backgroundColor: '#f5f5f5'
                              }
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                          >
                            {role}
                          </div>
                        ))
                      ) : (
                        <div 
                          style={{
                            padding: '8px 12px',
                            fontSize: '14px',
                            color: '#666',
                            fontStyle: 'italic'
                          }}
                        >
                          No roles found. You can type a custom role.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label>Skills</label>
                <textarea
                  name="Skills"
                  value={formData.Skills}
                  onChange={handleChange}
                  placeholder="Enter skills separated by commas"
                  rows="2"
                />
              </div>
              
              <div className="form-group">
                <label>Education</label>
                <input
                  type="text"
                  name="Education"
                  value={formData.Education}
                  onChange={handleChange}
                  placeholder="Highest education degree"
                />
              </div>
              
              <div className="form-group">
                <label>Certifications</label>
                <textarea
                  name="Certifications"
                  value={formData.Certifications}
                  onChange={handleChange}
                  placeholder="Enter certifications separated by commas"
                  rows="2"
                />
              </div>
            </div>
          </div>
          
          <div className="form-columns">
            <div className="form-column">
              <div className="form-group">
                <label>Candidate Info (Summary)</label>
                <textarea
                  name="CandidateInfo"
                  value={formData.CandidateInfo}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Brief summary about the candidate"
                />
              </div>
            </div>
            
            <div className="form-column">
              <div className="form-group">
                <label>Cover Letter</label>
                <textarea
                  name="CoverLetter"
                  value={formData.CoverLetter}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Cover letter content"
                />
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isSubmitting || (uploadProgress > 0 && uploadProgress < 100)}
            >
              <Save size={16} /> 
              {isSubmitting ? 'Submitting...' : (candidate ? 'Update Candidate' : 'Save Candidate')}
            </button>
          </div>
        </form>
      </div>
      
      {jobRoleDropdownOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setJobRoleDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default AddModal;