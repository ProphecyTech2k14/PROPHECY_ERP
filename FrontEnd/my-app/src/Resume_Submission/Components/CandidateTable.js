import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

const CandidateTable = ({ 
  candidates, 
  onView, 
  onEdit, 
  onDelete,
  visibleColumns
}) => {
  const [hoveredSkillsIndex, setHoveredSkillsIndex] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const candidatesToShow = Array.isArray(candidates) ? candidates : [];

  const handleDelete = (candidate) => {
    if (!candidate.Resume_ID) {
      return;
    }
    setDeleteConfirm(candidate);
  };

  const confirmDelete = () => {
    if (deleteConfirm && deleteConfirm.Resume_ID) {
      onDelete(deleteConfirm.Resume_ID);
      setDeleteConfirm(null);
    }
  };

  const handleView = (candidate) => {
    if (!candidate.Resume_ID) {
      return;
    }
    onView(candidate.Resume_ID);
  };

  const handleEdit = (candidate) => {
    if (!candidate.Resume_ID) {
      return;
    }
    onEdit(candidate);
  };

  const formatSkills = (skills) => {
    if (!skills) return { full: 'N/A', preview: 'N/A', hasMore: false };
    let skillsArray = [];
    
    if (Array.isArray(skills)) {
      skillsArray = skills;
    } else if (typeof skills === 'string') {
      try {
        const parsed = JSON.parse(skills);
        skillsArray = Array.isArray(parsed) ? parsed : [skills];
      } catch {
        skillsArray = skills.split(',').map(s => s.trim());
      }
    } else {
      skillsArray = [skills.toString()];
    }
    
    const full = skillsArray.join(', ');
    const preview = skillsArray.slice(0, 2).join(', ');
    const hasMore = skillsArray.length > 2;
    
    return { full, preview, hasMore, count: skillsArray.length };
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

  const getSubmittedByName = (candidate) => {
    const submittedBy = candidate.UpdatedBy || candidate.CreatedBy;
    
    if (!submittedBy || submittedBy === 'System') {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        return userInfo.username || userInfo.name || userInfo.email || 'Unknown User';
      } catch {
        return 'Unknown User';
      }
    }
    
    return submittedBy;
  };

  const SkillsCell = ({ skills, index }) => {
    const skillData = formatSkills(skills);
    
    return (
      <td className="candidate-table-skills-cell">
        <div className="candidate-table-skills-wrapper">
          <span 
            className="candidate-table-skills-text"
            onMouseEnter={() => setHoveredSkillsIndex(index)}
            onMouseLeave={() => setHoveredSkillsIndex(null)}
          >
            {skillData.preview}
            {skillData.hasMore && (
              <span className="candidate-table-skills-more">
                , +{skillData.count - 2} more
              </span>
            )}
          </span>
          
          {skillData.hasMore && hoveredSkillsIndex === index && (
            <div 
              className="candidate-table-skills-tooltip-box"
              onMouseEnter={() => setHoveredSkillsIndex(index)}
              onMouseLeave={() => setHoveredSkillsIndex(null)}
            >
              <strong>All Skills:</strong><br/>
              {skillData.full}
            </div>
          )}
        </div>
      </td>
    );
  };

  return (
    <>
      <style>{`
        .candidate-table-skills-cell {
          position: relative;
          padding: 12px 15px !important;
          vertical-align: top;
          overflow: visible;
        }

        .candidate-table-skills-wrapper {
          position: relative;
          display: inline-block;
          width: 100%;
          overflow: visible;
        }

        .candidate-table-skills-text {
          display: inline-block;
          position: relative;
          overflow: visible;
        }

        .candidate-table-skills-more {
          color: #3b82f6;
          cursor: pointer;
          text-decoration: underline;
        }

        .candidate-table-skills-tooltip-box {
          visibility: visible;
          position: absolute;
          bottom: 120%;
          left: 0;
          background-color: #2d3748;
          color: white;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          white-space: normal;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          line-height: 1.5;
          font-weight: 500;
          width: auto;
          width: 300px;
          pointer-events: auto;
        }

        .candidate-table-skills-tooltip-box::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 10px;
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #2d3748;
        }

        .confirmation-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }

        .confirmation-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
          max-width: 400px;
          text-align: center;
        }

        .confirmation-content h3 {
          color: #212529;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }

        .confirmation-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .btn-confirm {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 20px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-confirm-ok {
          background-color: #229C8B;
          color: white;
        }

        .btn-confirm-ok:hover {
          background-color: #187e71;
          transform: translateY(-2px);
        }

        .btn-confirm-cancel {
          background-color: #a8e6e1;
          color: #187e71;
        }

        .btn-confirm-cancel:hover {
          background-color: #7dd9d1;
        }
      `}</style>

      <div className="candidates-table-container">
        <table className="candidates-table">
          <thead>
            <tr>
              {visibleColumns.includes('Candidate') && <th>Candidate</th>}
              {visibleColumns.includes('ContactInfo') && <th>Contact Info</th>}
              {visibleColumns.includes('Location') && <th>Location</th>}
              {visibleColumns.includes('DateOfBirth') && <th>DOB</th>}
              {visibleColumns.includes('Employer') && <th>Employer</th>}
              {visibleColumns.includes('Salary') && <th>Salary</th>}
              {visibleColumns.includes('Experience') && <th>Experience</th>}
              {visibleColumns.includes('Skills') && <th>Skills</th>}
              {visibleColumns.includes('Education') && <th>Education</th>}
              {visibleColumns.includes('Certifications') && <th>Certifications</th>}
              {visibleColumns.includes('Submitted') && <th>Submitted</th>}
              {visibleColumns.includes('Actions') && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {candidatesToShow.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="no-results">
                  No candidates found
                </td>
              </tr>
            ) : (
              candidatesToShow.map((candidate, index) => (
                <tr key={candidate.Resume_ID || `candidate-${index}`}>
                  {visibleColumns.includes('Candidate') && (
                    <td>
                      <div className="candidate-name">
                        {candidate.FirstName} {candidate.LastName}
                      </div>
                      <div className="candidate-role">
                        {candidate.JobRoleApplied}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.includes('ContactInfo') && (
                    <td>
                      <div className="contact-info-wrapper">
                        <div className="contact-email">
                          {candidate.EmailID}
                        </div>
                        <div className="contact-phone">
                          {candidate.CountryCode} {candidate.PhoneNumber1}
                        </div>
                        {candidate.PhoneNumber2 && (
                          <div className="contact-phone-alt">
                            Alt: {candidate.PhoneNumber2}
                          </div>
                        )}
                        {candidate.LinkedInProfile && (
                          <div className="contact-linkedin">
                            <a href={candidate.LinkedInProfile} target="_blank" rel="noopener noreferrer">
                              LinkedIn
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.includes('Location') && (
                    <td>{candidate.CurrentLocation || 'N/A'}</td>
                  )}
                  
                  {visibleColumns.includes('DateOfBirth') && (
                    <td>
                      {candidate.Dob ? new Date(candidate.Dob).toLocaleDateString() : 'N/A'}
                    </td>
                  )}
                  
                  {visibleColumns.includes('Employer') && (
                    <td>
                      <div className="current-employer">
                        {candidate.CurrentEmployer || 'N/A'}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.includes('Salary') && (
                    <td>
                      <div className="current-salary">
                        <span style={{ fontSize: '0.8em', color: '#666' }}>Current:</span> {formatSalary(candidate.CurrentSalary)}
                      </div>
                      <div className="expected-salary">
                        <span style={{ fontSize: '0.8em', color: '#666' }}>Expected:</span> {formatSalary(candidate.ExpectedSalary)}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.includes('Experience') && (
                    <td>
                      <div className="experience-years">
                        <strong>Total:</strong> {candidate.Experience || '0'} years
                      </div>
                      <div className="relevant-experience">
                        <strong>Relevant:</strong> {candidate.RelevantExperience || '0'} years
                      </div>
                      <div className="notice-period">
                        <span className="detail-label">Notice:</span> 
                        {candidate.NoticePeriod || 'N/A'}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.includes("Skills") && (
                    <SkillsCell skills={candidate.Skills} index={index} />
                  )}
                  
                  {visibleColumns.includes("Education") && (
                    <td className="education-cell">
                      <div className="education-content" title={formatEducation(candidate.Education)}>
                        {formatEducation(candidate.Education)}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.includes("Certifications") && (
                    <td className="certifications-cell">
                      <div className="certifications-content" title={formatCertifications(candidate.Certifications)}>
                        {formatCertifications(candidate.Certifications)}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.includes('Submitted') && (
                    <td>
                      <div className="submitted-date">
                        {candidate.UpdatedDt ? 
                          `Updated: ${new Date(candidate.UpdatedDt).toLocaleDateString()}` :
                          `Created: ${candidate.CreatedDt ? new Date(candidate.CreatedDt).toLocaleDateString() : 'N/A'}`
                        }
                      </div>
                      <div className="submitted-by">
                        by {getSubmittedByName(candidate)}
                      </div>
                    </td>
                  )}
                  
                  {visibleColumns.includes('Actions') && (
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="action-btn view-btn" 
                          onClick={() => handleView(candidate)}
                          title="View Details"
                          disabled={!candidate.Resume_ID}
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => handleEdit(candidate)}
                          title="Edit Candidate"
                          disabled={!candidate.Resume_ID}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDelete(candidate)}
                          title="Delete Candidate"
                          disabled={!candidate.Resume_ID}
                          style={{ 
                            opacity: !candidate.Resume_ID ? 0.5 : 1,
                            cursor: !candidate.Resume_ID ? 'not-allowed' : 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteConfirm && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>
              Are you sure you want to delete {deleteConfirm.FirstName} {deleteConfirm.LastName}'s application?
            </h3>
            <div className="confirmation-buttons">
              <button 
                className="btn-confirm btn-confirm-ok"
                onClick={confirmDelete}
              >
                OK
              </button>
              <button 
                className="btn-confirm btn-confirm-cancel"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CandidateTable;