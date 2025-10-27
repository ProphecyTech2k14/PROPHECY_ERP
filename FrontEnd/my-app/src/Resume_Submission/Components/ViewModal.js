import React, { useState, useEffect } from 'react';
import { Download, X, FileText, AlertCircle, Loader, RefreshCw } from 'lucide-react';
import { exportCandidateData } from '../utils/resumeParser';
import BASE_URL from "../../url";

const ViewModal = ({ candidate, onClose }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  // Retry mechanism for failed loads
  const retryLoad = () => {
    setRetryCount(prev => prev + 1);
    setPdfError(null);
    setPdfUrl(null);
    setIframeLoaded(false);
  };

  // Fetch file information and setup PDF URL
  useEffect(() => {
    const fetchFileInfo = async () => {
      if (!candidate?.Resume_ID) {
        setPdfError('No candidate ID provided');
        setPdfLoading(false);
        return;
      }

      setPdfLoading(true);
      setPdfError(null);
      setIframeLoaded(false);

      try {
        const token = getAuthToken();
        
        if (!token) {
          throw new Error('Authentication token not found. Please login again.');
        }

        console.log('Fetching file info for Resume_ID:', candidate.Resume_ID);

        // First, get file information
        const response = await fetch(`${BASE_URL}/api/resumes/${candidate.Resume_ID}/file-info`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        console.log('File info response:', data);

        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        setFileInfo(data);

        if (data.success && data.fileAvailable) {
          // For PDF preview, use the preview endpoint with auth token in URL
          if (data.fileInfo.canPreview) {
            const previewUrl = `${BASE_URL}/api/resumes/${candidate.Resume_ID}/preview?token=${encodeURIComponent(token)}&t=${Date.now()}`;
            console.log('Setting PDF URL for preview:', previewUrl);
            setPdfUrl(previewUrl);
          } else {
            setPdfError(`Preview not available for ${data.fileInfo.fileExtension.toUpperCase()} files. You can download the file instead.`);
          }
        } else {
          setPdfError(data.message || 'Resume file not available');
        }

      } catch (error) {
        console.error('Error fetching file info:', error);
        setPdfError(error.message || 'Failed to load resume information');
      } finally {
        setPdfLoading(false);
      }
    };

    fetchFileInfo();
  }, [candidate, retryCount]);

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setPdfError(null);
    console.log('PDF iframe loaded successfully');
  };

  const handleIframeError = () => {
    console.error('PDF iframe failed to load');
    setPdfError('Failed to load resume preview in iframe. The file may be corrupted or access denied.');
    setIframeLoaded(false);
  };

  const handleDownload = async () => {
    if (!candidate?.Resume_ID) {
      alert('No candidate ID available for download');
      return;
    }

    try {
      const token = getAuthToken();
      
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      console.log('Downloading resume for ID:', candidate.Resume_ID);

      const response = await fetch(`${BASE_URL}/api/resumes/${candidate.Resume_ID}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${candidate.FirstName}_${candidate.LastName}_Resume.pdf`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/['"]/g, '');
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
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('Download completed:', filename);

    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download resume: ${error.message}`);
    }
  };

  const handleExport = (format) => {
    exportCandidateData(candidate, format);
  };

  const formatSkills = (skills) => {
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

  const formatEducation = (education) => {
    if (!education) return 'N/A';
    if (Array.isArray(education)) return education.join(', ');
    if (typeof education === 'string') {
      try {
        const parsed = JSON.parse(education);
        return Array.isArray(parsed) ? parsed.join(', ') : education;
      } catch {
        return education;
      }
    }
    return education.toString();
  };

  const formatCertifications = (certifications) => {
    if (!certifications) return 'N/A';
    if (Array.isArray(certifications)) return certifications.join(', ');
    if (typeof certifications === 'string') {
      try {
        const parsed = JSON.parse(certifications);
        return Array.isArray(parsed) ? parsed.join(', ') : certifications;
      } catch {
        return certifications;
      }
    }
    return certifications.toString();
  };

  const formatSalary = (salary) => {
    if (!salary) return 'N/A';
    const numSalary = parseFloat(salary);
    if (isNaN(numSalary)) return salary;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numSalary);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!candidate) return null;

  return (
    <div className="view-modal-overlay">
      <div className="view-modal-container">
        <div className="view-modal-header">
          <h2 className="view-modal-title">
            {candidate.FirstName} {candidate.LastName} - Overview
          </h2>
          <div className="view-modal-header-actions">
            <button 
              className="view-modal-btn view-modal-btn-primary" 
              onClick={handleDownload}
              disabled={!fileInfo?.fileAvailable}
              title={fileInfo?.fileAvailable ? "Download resume" : "Resume not available"}
            >
              <Download size={16} /> Download
            </button>
            <button className="view-modal-btn view-modal-btn-secondary" onClick={onClose}>
              <X size={16} /> 
            </button>
          </div>
        </div>
        
        <div className="view-modal-content-wrapper">
          {/* Left side - Candidate details */}
          <div className="view-modal-details-panel">
            <div className="view-modal-section">
              <h3 className="view-modal-candidate-name">{candidate.FirstName} {candidate.LastName}</h3>
              <p className="view-modal-candidate-role">{candidate.JobRoleApplied}</p>
              {candidate.Dob && (
                <p className="view-modal-candidate-info">
                  <strong>Date of Birth:</strong> {new Date(candidate.Dob).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="view-modal-section">
              <h4 className="view-modal-section-title">Contact Information</h4>
              <div className="view-modal-contact-grid">
                <div className="view-modal-contact-item">
                  <strong>Email:</strong> <span className="view-modal-email">{candidate.EmailID}</span>
                </div>
                <div className="view-modal-contact-item">
                  <strong>Phone:</strong> <span>{candidate.CountryCode} {candidate.PhoneNumber1}</span>
                </div>
                {candidate.PhoneNumber2 && (
                  <div className="view-modal-contact-item">
                    <strong>Alt Phone:</strong> <span>{candidate.PhoneNumber2}</span>
                  </div>
                )}
                {candidate.CurrentLocation && (
                  <div className="view-modal-contact-item">
                    <strong>Location:</strong> <span>{candidate.CurrentLocation}</span>
                  </div>
                )}
                {candidate.LinkedInProfile && (
                  <div className="view-modal-contact-item">
                    <strong>LinkedIn:</strong> 
                    <a href={candidate.LinkedInProfile} target="_blank" rel="noopener noreferrer" className="view-modal-linkedin-link">
                      {candidate.LinkedInProfile}
                    </a>
                  </div>
                )}
                {candidate.PassportNo && (
                  <div className="view-modal-contact-item">
                    <strong>Passport No:</strong> <span>{candidate.PassportNo}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="view-modal-section">
              <h4 className="view-modal-section-title">Professional Details</h4>
              <div className="view-modal-professional-grid">
                <div className="view-modal-professional-item">
                  <strong>Current Employer:</strong> <span>{candidate.CurrentEmployer || 'N/A'}</span>
                </div>
                <div className="view-modal-professional-item">
                  <strong>Current Salary:</strong> <span>{formatSalary(candidate.CurrentSalary)}</span>
                </div>
                <div className="view-modal-professional-item">
                  <strong>Expected Salary:</strong> <span>{formatSalary(candidate.ExpectedSalary)}</span>
                </div>
                <div className="view-modal-professional-item">
                  <strong>Notice Period:</strong> <span>{candidate.NoticePeriod || 'N/A'}</span>
                </div>
                <div className="view-modal-professional-item">
                  <strong>Total Years of Experience:</strong> 
                  <span className="view-modal-experience-total">
                    {candidate.Experience || '0'} years
                  </span>
                </div>
                
                <div className="view-modal-professional-item">
                  <strong>Relevant Years of Experience:</strong> 
                  <span className="view-modal-experience-relevant">
                    {candidate.RelevantExperience || '0'} years
                  </span>
                </div>
              </div>
            </div>

            <div className="view-modal-section">
              <h4 className="view-modal-section-title">Application Details</h4>
              <div className="view-modal-application-status">
                <div className="view-modal-status-item">
                  <strong>Status:</strong> 
                  <span className={`view-modal-status-badge view-modal-status-${(candidate.Status || 'new').toLowerCase()}`}>
                    {candidate.Status || 'New'}
                  </span>
                </div>
                <div className="view-modal-application-item">
                  <strong>Submitted On:</strong> <span>{new Date(candidate.CreatedDt).toLocaleDateString()}</span>
                </div>
                <div className="view-modal-application-item">
                  <strong>Submitted By:</strong> <span>{candidate.CreatedBy}</span>
                </div>
              </div>
              
              <div className="view-modal-skills-section">
                <div className="view-modal-info-block">
                  <strong className="view-modal-info-label">Skills:</strong>
                  <div className="view-modal-info-content">
                    {formatSkills(candidate.Skills)}
                  </div>
                </div>

                <div className="view-modal-info-block">
                  <strong className="view-modal-info-label">Education:</strong>
                  <div className="view-modal-info-content">
                    {formatEducation(candidate.Education)}
                  </div>
                </div>

                <div className="view-modal-info-block">
                  <strong className="view-modal-info-label">Certifications:</strong>
                  <div className="view-modal-info-content">
                    {formatCertifications(candidate.Certifications)}
                  </div>
                </div>
              </div>
            </div>

            {candidate.CandidateInfo && (
              <div className="view-modal-section">
                <h4 className="view-modal-section-title">Additional Information</h4>
                <div className="view-modal-additional-info">
                  {candidate.CandidateInfo}
                </div>
              </div>
            )}

            {candidate.CoverLetter && (
              <div className="view-modal-section">
                <h4 className="view-modal-section-title">Cover Letter</h4>
                <div className="view-modal-cover-letter">
                  {candidate.CoverLetter}
                </div>
              </div>
            )}

            {/* File Info Section */}
            {fileInfo && (
              <div className="view-modal-section view-modal-file-info-section">
                <h4 className="view-modal-section-title">File Information</h4>
                {fileInfo.fileAvailable ? (
                  <div className="view-modal-file-details">
                    <div className="view-modal-file-item">
                      <strong>File Name:</strong> <span>{fileInfo.fileInfo.fileName}</span>
                    </div>
                    <div className="view-modal-file-item">
                      <strong>File Size:</strong> <span>{formatFileSize(fileInfo.fileInfo.fileSize)}</span>
                    </div>
                    <div className="view-modal-file-item">
                      <strong>File Type:</strong> <span>{fileInfo.fileInfo.fileExtension.toUpperCase()}</span>
                    </div>
                    <div className="view-modal-file-item">
                      <strong>Can Preview:</strong> <span>{fileInfo.fileInfo.canPreview ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="view-modal-file-item">
                      <strong>Last Modified:</strong> <span>{new Date(fileInfo.fileInfo.lastModified).toLocaleString()}</span>
                    </div>
                    <div className="view-modal-file-item">
                      <strong>Original Path:</strong> <span className="view-modal-file-path">{fileInfo.fileInfo.originalPath}</span>
                    </div>
                  </div>
                ) : (
                  <p className="view-modal-file-error">{fileInfo.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Right side - Resume preview */}
          <div className="view-modal-preview-panel">
            <div className="view-modal-preview-header">
              <h4 className="view-modal-preview-title">Resume Preview</h4>
              {pdfError && (
                <button 
                  onClick={retryLoad}
                  className="view-modal-retry-btn"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              )}
            </div>
            
            <div className="view-modal-preview-content">
              {pdfLoading ? (
                <div className="view-modal-loading-state">
                  <Loader size={32} className="view-modal-loading-icon" />
                  <div className="view-modal-loading-text">Loading resume information...</div>
                </div>
              ) : pdfError ? (
                <div className="view-modal-error-state">
                  <AlertCircle size={48} className="view-modal-error-icon" />
                  <div className="view-modal-error-content">
                    <strong className="view-modal-error-title">Resume Preview Failed</strong>
                    <div className="view-modal-error-message">{pdfError}</div>
                  </div>
                  {fileInfo?.fileAvailable && fileInfo.fileInfo && (
                    <button 
                      onClick={handleDownload}
                      className="view-modal-download-btn"
                    >
                      <Download size={16} />
                      Download {fileInfo.fileInfo.fileExtension.toUpperCase()} File
                    </button>
                  )}
                  {/* Add debugging info in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="view-modal-debug-info">
                      <p>Debug Info:</p>
                      <p>PDF URL: {pdfUrl}</p>
                      <p>File Available: {fileInfo?.fileAvailable ? 'Yes' : 'No'}</p>
                      <p>Can Preview: {fileInfo?.fileInfo?.canPreview ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </div>
              ) : pdfUrl ? (
                <div className="view-modal-pdf-viewer">
                  {/* Loading overlay for iframe */}
                  {!iframeLoaded && (
                    <div className="view-modal-iframe-loading">
                      <div className="view-modal-iframe-loading-content">
                        <Loader size={20} className="view-modal-loading-icon" />
                        <span>Loading PDF preview...</span>
                      </div>
                    </div>
                  )}

                  {/* PDF iframe */}
                  <iframe
                    src={pdfUrl}
                    className="view-modal-pdf-iframe"
                    title={`Resume of ${candidate.FirstName} ${candidate.LastName}`}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="view-modal-no-resume">
                  No resume file available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const viewModalStyles = `
  .view-modal-experience-total {
    display: inline-block;
    background-color: #e3f2fd;
    color: #1565c0;
    padding: 4px 8px;
    border-radius: 4px;
    margin-left: 8px;
    font-weight: 600;
  }

  .view-modal-experience-relevant {
    display: inline-block;
    background-color: #f3e5f5;
    color: #7b1fa2;
    padding: 4px 8px;
    border-radius: 4px;
    margin-left: 8px;
    font-weight: 600;
    border-left: 3px solid #7b1fa2;
    padding-left: 6px;
  }

  .view-modal-professional-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
    margin-top: 10px;
  }

  .view-modal-professional-item {
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 4px;
    border-left: 3px solid #1a6f66ff;
  }

  .view-modal-professional-item strong {
    display: block;
    margin-bottom: 5px;
    color: #333;
    font-size: 0.9em;
  }

  .view-modal-professional-item span {
    display: block;
    color: #555;
    margin-top: 4px;
  }
`;

export default ViewModal;