import React, { useState } from 'react';
import '../styles/useraccounts.css'

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('employee-details');

  const renderTabContent = () => {
    switch(activeTab) {
      case 'employee-details':
        return <EmployeeDetails />;
      case 'statements':
        return <Statements />;
      case 'reports':
        return <Reports />;
      case 'benefits':
        return <Benefits />;
      case 'immigration':
        return <Immigration />;
      default:
        return <EmployeeDetails />;
    }
  };

  return (
    <div className="accounts-container">
      <div className="accounts-header">
        <h1>Accounts</h1>
      </div>

      

      <div className="accounts-tabs">
        <button 
          className={`accounts-tab-button ${activeTab === 'employee-details' ? 'active' : ''}`}
          onClick={() => setActiveTab('employee-details')}
        >
          Employee Details
        </button>
        <button 
          className={`accounts-tab-button ${activeTab === 'statements' ? 'active' : ''}`}
          onClick={() => setActiveTab('statements')}
        >
          Statements
        </button>
        <button 
          className={`accounts-tab-button ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
        <button 
          className={`accounts-tab-button ${activeTab === 'benefits' ? 'active' : ''}`}
          onClick={() => setActiveTab('benefits')}
        >
          Benefits
        </button>
        <button 
          className={`accounts-tab-button ${activeTab === 'immigration' ? 'active' : ''}`}
          onClick={() => setActiveTab('immigration')}
        >
          Immigration
        </button>
      </div>

      <div className="accounts-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Employee Details Component
const EmployeeDetails = () => {
  return (
    <div className="accounts-tab-content">
      <h2>Employee Details</h2>
      <div className="employee-details-grid">
        <div className="employee-detail-item">
          <label>Full Name:</label>
          <p>John Doe</p>
        </div>
        <div className="employee-detail-item">
          <label>Employee ID:</label>
          <p>EMP12345</p>
        </div>
        <div className="employee-detail-item">
          <label>Department:</label>
          <p>Engineering</p>
        </div>
        <div className="employee-detail-item">
          <label>Position:</label>
          <p>Senior Developer</p>
        </div>
        <div className="employee-detail-item">
          <label>Email:</label>
          <p>john.doe@company.com</p>
        </div>
        <div className="employee-detail-item">
          <label>Phone:</label>
          <p>+1 234-567-8900</p>
        </div>
        <div className="employee-detail-item">
          <label>Start Date:</label>
          <p>January 15, 2023</p>
        </div>
        <div className="employee-detail-item">
          <label>Manager:</label>
          <p>Jane Smith</p>
        </div>
      </div>
    </div>
  );
};

// Statements Component
// Statements Component
const Statements = () => {
  const [activeStatement, setActiveStatement] = useState('financial');

  const financialStatements = [
    { row: 1, date: '08/15/24', ref: 'ADP Pay', description: 'Payroll(paid after tax amount $1905.83 on 8/23/2021)', hours: '', payingRate: '', credit: '', debit: '2540.00', balance: '0.00' },
    { row: 2, date: '08/31/25', ref: 'August', description: 'Earnings', hours: '176', payingRate: '40.00', credit: '7040.00', debit: '', balance: '7040.00' },
    { row: 3, date: '08/31/24', ref: 'August', description: 'Payroll Fee to another person', hours: '', payingRate: '', credit: '', debit: '500.00', balance: '6540.00' },
    { row: 4, date: '09/15/25', ref: 'ADP Pay', description: 'Payroll', hours: '', payingRate: '', credit: '', debit: '6540.00', balance: '0.00' },
    { row: 5, date: '09/15/24', ref: 'ADP Pay', description: 'After Tax', hours: '', payingRate: '4255.47', credit: '', debit: '', balance: '0.00' },
    { row: 6, date: '09/17/24', ref: '', description: 'Paid( paid on 9/17/2021)', hours: '', payingRate: '2500.00', credit: '', debit: '', balance: '0.00' },
    { row: 7, date: '09/17/24', ref: '', description: 'Balance', hours: '', payingRate: '1755.47', credit: '', debit: '', balance: '0.00' },
  ]

  const payrollStatements = [
    { row: 1, date: '08/15/21', payPeriod: '08/01/21 - 08/15/21', grossPay: '2540.00', deductions: '634.17', netPay: '1905.83' },
    { row: 2, date: '09/15/21', payPeriod: '09/01/21 - 09/15/21', grossPay: '6540.00', deductions: '2284.53', netPay: '4255.47' },
    { row: 3, date: '10/15/21', payPeriod: '10/01/21 - 10/15/21', grossPay: '1400.00', deductions: '229.49', netPay: '1170.51' },
  ];

  const renderFinancialStatements = () => (
    <div className="excel-table-container">
      <table className="excel-table">
        <thead>
          <tr>
            <th className="excel-row-header"></th>
            <th>Date</th>
            <th>Ref.</th>
            <th>Description</th>
            <th>Hours</th>
            <th>Paying Rate</th>
            <th>Credit</th>
            <th>Debit</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {financialStatements.map((statement, index) => (
            <tr key={statement.row} className={statement.row === 3 ? 'excel-highlight-row' : ''}>
              <td className="excel-row-header">{statement.row}</td>
              <td>{statement.date}</td>
              <td className={statement.ref === 'Msg' || statement.ref === 'ADP Pay' ? 'excel-bold-text' : ''}>{statement.ref}</td>
              <td>{statement.description}</td>
              <td>{statement.hours}</td>
              <td>{statement.payingRate}</td>
              <td>{statement.credit}</td>
              <td>{statement.debit}</td>
              <td>{statement.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPayrollStatements = () => (
    <div className="excel-table-container">
      <table className="excel-table">
        <thead>
          <tr>
            <th className="excel-row-header"></th>
            <th>Date</th>
            <th>Pay Period</th>
            <th>Gross Pay</th>
            <th>Deductions</th>
            <th>Net Pay</th>
          </tr>
        </thead>
        <tbody>
          {payrollStatements.map((statement) => (
            <tr key={statement.row}>
              <td className="excel-row-header">{statement.row}</td>
              <td>{statement.date}</td>
              <td>{statement.payPeriod}</td>
              <td>${statement.grossPay}</td>
              <td>${statement.deductions}</td>
              <td>${statement.netPay}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="accounts-tab-content">
      <h2>Statements</h2>
      
      <div className="statements-button-group">
        <button 
          className={`statements-action-btn statements-financial-btn ${activeStatement === 'financial' ? 'active' : ''}`}
          onClick={() => setActiveStatement('financial')}
        >
          Financial Statements
        </button>
        <button 
          className={`statements-action-btn statements-payroll-btn ${activeStatement === 'payroll' ? 'active' : ''}`}
          onClick={() => setActiveStatement('payroll')}
        >
          Payroll Statements
        </button>
      </div>

      {activeStatement === 'financial' ? renderFinancialStatements() : renderPayrollStatements()}
    </div>
  );
};
// Reports Component
// Reports Component
const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  const reports = [
    { id: 1, name: 'Annual Performance Review', year: '2024', status: 'Completed' },
    { id: 2, name: 'Mid-Year Review', year: '2024', status: 'Completed' },
    { id: 3, name: 'Training Completion Report', year: '2024', status: 'In Progress' },
    { id: 4, name: 'Annual Performance Review', year: '2023', status: 'Completed' },
  ];

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Completed': 'accounts-status-badge-completed',
      'In Progress': 'accounts-status-badge-in-progress',
      'Active': 'accounts-status-badge-active',
      'Inactive': 'accounts-status-badge-inactive',
      'Renewal Pending': 'accounts-status-badge-renewal-pending'
    };
    return `accounts-status-badge ${statusMap[status] || 'accounts-status-badge-active'}`;
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    // No alert - directly opens the modal
    console.log('Viewing report:', report);
  };

  const handleCloseReport = () => {
    setSelectedReport(null);
  };

  const handleDownloadPDF = () => {
    // Add download functionality here
    alert(`Downloading ${selectedReport.name} PDF...`);
  };

  const handleViewFullReport = () => {
    // Add full report viewing functionality here
    alert(`Opening full ${selectedReport.name}...`);
  };

  return (
    <div className="accounts-tab-content">
      <h2>Reports</h2>
      
      {/* Report Details Modal */}
      {selectedReport && (
        <div className="report-modal" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '400px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Report Details</h3>
            <button 
              onClick={handleCloseReport}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <p><strong>Report Name:</strong> {selectedReport.name}</p>
            <p><strong>Year:</strong> {selectedReport.year}</p>
            <p><strong>Status:</strong> 
              <span className={getStatusBadgeClass(selectedReport.status)} style={{ marginLeft: '0.5rem' }}>
                {selectedReport.status}
              </span>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            {/* <button className="accounts-download-btn" onClick={handleDownloadPDF}>
              Download PDF
            </button> */}
            {/* <button className="accounts-view-btn" onClick={handleViewFullReport}>
              View Full Report
            </button> */}
            <button className="accounts-details-btn" onClick={handleCloseReport}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }} onClick={handleCloseReport}></div>
      )}

      <div className="reports-table-container">
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report Name</th>
              <th>Year</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map(report => (
              <tr key={report.id}>
                <td>{report.name}</td>
                <td>{report.year}</td>
                <td>
                  <span className={getStatusBadgeClass(report.status)}>
                    {report.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="accounts-view-btn"
                    onClick={() => handleViewReport(report)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Benefits Component
// Benefits Component
const Benefits = () => {
  const [selectedBenefit, setSelectedBenefit] = useState(null);

  const benefits = [
    { 
      id: 1, 
      name: 'Health Insurance', 
      provider: 'Blue Cross', 
      coverage: 'Family', 
      status: 'Active',
      plan: 'Gold PPO',
      startDate: '01/15/2023',
      endDate: '12/31/2024',
      premium: '$450/month',
     
     
    },
    { 
      id: 2, 
      name: 'Dental Insurance', 
      provider: 'Delta Dental', 
      coverage: 'Individual', 
      status: 'Active',
      plan: 'Premium Plan',
      startDate: '01/15/2023',
      endDate: '12/31/2024',
      premium: '$35/month',
    
    },
    { 
      id: 3, 
      name: '401(k) Retirement Plan', 
      provider: 'Fidelity', 
      coverage: 'N/A', 
      status: 'Active',
      plan: 'Traditional 401(k)',
      startDate: '01/15/2023',
      employerMatch: '4%',
      contribution: '8% of salary',
      vesting: '3 years'
    },
    { 
      id: 4, 
      name: 'Life Insurance', 
      provider: 'MetLife', 
      coverage: '$500,000', 
      status: 'Active',
      plan: 'Group Term Life',
      startDate: '01/15/2023',
      endDate: '12/31/2024',
      premium: 'Employer Paid',
      beneficiary: 'Primary: Spouse'
    },
  ];

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Completed': 'accounts-status-badge-completed',
      'In Progress': 'accounts-status-badge-in-progress',
      'Active': 'accounts-status-badge-active',
      'Inactive': 'accounts-status-badge-inactive',
      'Renewal Pending': 'accounts-status-badge-renewal-pending'
    };
    return `accounts-status-badge ${statusMap[status] || 'accounts-status-badge-active'}`;
  };

  const handleViewDetails = (benefit) => {
    setSelectedBenefit(benefit);
    console.log('Viewing benefit details:', benefit);
  };

  const handleCloseDetails = () => {
    setSelectedBenefit(null);
  };

  const renderBenefitDetails = (benefit) => {
    switch(benefit.name) {
      case 'Health Insurance':
        return (
          <div className="benefit-details-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Plan Type:</label>
                <p>{benefit.plan}</p>
              </div>
              <div className="detail-item">
                <label>Coverage Start:</label>
                <p>{benefit.startDate}</p>
              </div>
              <div className="detail-item">
                <label>Coverage End:</label>
                <p>{benefit.endDate}</p>
              </div>
              <div className="detail-item">
                <label>Monthly Premium:</label>
                <p>{benefit.premium}</p>
              </div>
              <div className="detail-item">
                <label>Deductible:</label>
                <p>{benefit.deductible}</p>
              </div>
              <div className="detail-item">
                <label>Co-Pay:</label>
                <p>{benefit.coPay}</p>
              </div>
            </div>
          </div>
        );
      
      case 'Dental Insurance':
        return (
          <div className="benefit-details-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Plan Type:</label>
                <p>{benefit.plan}</p>
              </div>
              <div className="detail-item">
                <label>Coverage Start:</label>
                <p>{benefit.startDate}</p>
              </div>
              <div className="detail-item">
                <label>Coverage End:</label>
                <p>{benefit.endDate}</p>
              </div>
              <div className="detail-item">
                <label>Monthly Premium:</label>
                <p>{benefit.premium}</p>
              </div>
              {/* <div className="detail-item">
                <label>Deductible:</label>
                <p>{benefit.deductible}</p>
              </div>
              <div className="detail-item">
                <label>Co-Pay:</label>
                <p>{benefit.coPay}</p>
              </div> */}
            </div>
          </div>
        );
      
      case '401(k) Retirement Plan':
        return (
          <div className="benefit-details-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Plan Type:</label>
                <p>{benefit.plan}</p>
              </div>
              <div className="detail-item">
                <label>Enrollment Date:</label>
                <p>{benefit.startDate}</p>
              </div>
              <div className="detail-item">
                <label>Employer Match:</label>
                <p>{benefit.employerMatch}</p>
              </div>
              <div className="detail-item">
                <label>Your Contribution:</label>
                <p>{benefit.contribution}</p>
              </div>
              <div className="detail-item">
                <label>Vesting Schedule:</label>
                <p>{benefit.vesting}</p>
              </div>
            </div>
          </div>
        );
      
      case 'Life Insurance':
        return (
          <div className="benefit-details-content">
            <div className="detail-grid">
              <div className="detail-item">
                <label>Plan Type:</label>
                <p>{benefit.plan}</p>
              </div>
              <div className="detail-item">
                <label>Coverage Start:</label>
                <p>{benefit.startDate}</p>
              </div>
              <div className="detail-item">
                <label>Coverage End:</label>
                <p>{benefit.endDate}</p>
              </div>
              <div className="detail-item">
                <label>Premium:</label>
                <p>{benefit.premium}</p>
              </div>
              <div className="detail-item">
                <label>Beneficiary:</label>
                <p>{benefit.beneficiary}</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return <p>Details not available.</p>;
    }
  };

  return (
    <div className="accounts-tab-content">
      <h2>Employee Benefits</h2>
      
      {/* Benefit Details Modal */}
      {selectedBenefit && (
        <div className="benefit-modal" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '500px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>{selectedBenefit.name} Details</h3>
            <button 
              onClick={handleCloseDetails}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
              <div>
                <strong>Provider:</strong> {selectedBenefit.provider}
              </div>
              <div>
                <strong>Status:</strong> 
                <span className={getStatusBadgeClass(selectedBenefit.status)} style={{ marginLeft: '0.5rem' }}>
                  {selectedBenefit.status}
                </span>
              </div>
            </div>
            <div>
              <strong>Coverage:</strong> {selectedBenefit.coverage}
            </div>
          </div>

          {renderBenefitDetails(selectedBenefit)}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
            {/* <button className="accounts-download-btn">Download Summary</button> */}
            <button className="accounts-details-btn" onClick={handleCloseDetails}>Close</button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {selectedBenefit && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }} onClick={handleCloseDetails}></div>
      )}

      <div className="benefits-table-container">
        <table className="benefits-table">
          <thead>
            <tr>
              <th>Benefit Name</th>
              <th>Provider</th>
              <th>Coverage</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {benefits.map(benefit => (
              <tr key={benefit.id}>
                <td>{benefit.name}</td>
                <td>{benefit.provider}</td>
                <td>{benefit.coverage}</td>
                <td>
                  <span className={getStatusBadgeClass(benefit.status)}>
                    {benefit.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="accounts-details-btn"
                    onClick={() => handleViewDetails(benefit)}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
// Immigration Component
// Immigration Component
const Immigration = () => {
  const [selectedDocument, setSelectedDocument] = useState(null);

  const documents = [
    { 
      id: 1, 
      type: 'Work Visa', 
      number: 'H1B-123456', 
      issued: '01/15/2023', 
      expires: '01/15/2026', 
      status: 'Active',
      category: 'H-1B Specialty Occupation',
      issuingAuthority: 'USCIS',
      notes: 'Primary work authorization'
    },
    { 
      id: 2, 
      type: 'I-94 Travel Record', 
      number: 'I94-789012', 
      issued: '01/15/2023', 
      expires: '01/15/2026', 
      status: 'Active',
      category: 'Arrival/Departure Record',
      issuingAuthority: 'CBP',
      notes: 'Electronic I-94 record'
    },
    { 
      id: 3, 
      type: 'EAD Card', 
      number: 'EAD-345678', 
      issued: '01/15/2023', 
      expires: '01/15/2025', 
      status: 'Renewal Pending',
      category: 'Employment Authorization Document',
      issuingAuthority: 'USCIS',
      notes: 'Renewal application submitted on 12/01/2024'
    },
  ];

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'Completed': 'accounts-status-badge-completed',
      'In Progress': 'accounts-status-badge-in-progress',
      'Active': 'accounts-status-badge-active',
      'Inactive': 'accounts-status-badge-inactive',
      'Renewal Pending': 'accounts-status-badge-renewal-pending'
    };
    return `accounts-status-badge ${statusMap[status] || 'accounts-status-badge-active'}`;
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
  };

  const handleCloseDocument = () => {
    setSelectedDocument(null);
  };

  const handleDownloadDocument = () => {
    // Add download functionality here
    alert(`Downloading ${selectedDocument.type} document...`);
  };

  return (
    <div className="accounts-tab-content">
      <h2>Immigration Documents</h2>
      
      {/* Document Details Modal */}
      {selectedDocument && (
        <div className="document-modal" style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 1000,
          minWidth: '500px',
          maxWidth: '600px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Document Details</h3>
            <button 
              onClick={handleCloseDocument}
              style={{ 
                background: 'none', 
                border: 'none', 
                fontSize: '1.5rem', 
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <div className="document-detail-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div className="detail-item">
                <label>Document Type:</label>
                <p>{selectedDocument.type}</p>
              </div>
              <div className="detail-item">
                <label>Document Number:</label>
                <p>{selectedDocument.number}</p>
              </div>
              <div className="detail-item">
                <label>Issue Date:</label>
                <p>{selectedDocument.issued}</p>
              </div>
              <div className="detail-item">
                <label>Expiry Date:</label>
                <p>{selectedDocument.expires}</p>
              </div>
              <div className="detail-item">
                <label>Category:</label>
                <p>{selectedDocument.category}</p>
              </div>
              <div className="detail-item">
                <label>Issuing Authority:</label>
                <p>{selectedDocument.issuingAuthority}</p>
              </div>
            </div>
            
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>Status:</label>
              <p>
                <span className={getStatusBadgeClass(selectedDocument.status)}>
                  {selectedDocument.status}
                </span>
              </p>
            </div>
            
            <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
              <label>Notes:</label>
              <p>{selectedDocument.notes}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            {/* <button className="accounts-download-btn" onClick={handleDownloadDocument}>
              Download Document
            </button> */}
            <button className="accounts-details-btn" onClick={handleCloseDocument}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal Overlay */}
      {selectedDocument && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 999
        }} onClick={handleCloseDocument}></div>
      )}

      <div className="immigration-table-container">
        <table className="immigration-table">
          <thead>
            <tr>
              <th>Document Type</th>
              <th>Document Number</th>
              <th>Issue Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {documents.map(doc => (
              <tr key={doc.id}>
                <td>{doc.type}</td>
                <td>{doc.number}</td>
                <td>{doc.issued}</td>
                <td>{doc.expires}</td>
                <td>
                  <span className={getStatusBadgeClass(doc.status)}>
                    {doc.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="accounts-view-btn"
                    onClick={() => handleViewDocument(doc)}
                  >
                    View
                  </button>
                  {/* <button className="accounts-download-btn">Download</button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Accounts;