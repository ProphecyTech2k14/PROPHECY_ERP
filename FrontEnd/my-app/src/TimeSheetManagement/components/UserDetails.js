import React, { useState, useEffect } from 'react';
import { 
  Clock, Edit3, Save, Send, BarChart3, FileText, Timer, Coffee, 
  Settings, ChevronDown, ChevronRight, Plus, Search, Filter, Download, 
  Eye, CheckCircle2, AlertCircle, XCircle, MessageSquare, Users, User, 
  X, FileSpreadsheet, Trash2, Image, File, ArrowLeft
} from 'lucide-react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from "../../url";
import Swal from 'sweetalert2';
import '../styles/EmployeeDetails.css';

// Helper function to get file icon
const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
      return Image;
    case 'xlsx':
    case 'xls':
    case 'csv':
      return FileSpreadsheet;
    default:
      return FileText;
  }
};

const EmployeeDetailsPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get employee and company from navigation state
  const passedEmployee = location.state?.employee;
  const passedCompany = location.state?.company;
  
  // View states
  const [activeView, setActiveView] = useState('employeeDetails');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data states
  const [employee, setEmployee] = useState(passedEmployee || null);
  const [company, setCompany] = useState(passedCompany || null);
  const [editedEmployee, setEditedEmployee] = useState({});
  const [timesheets, setTimesheets] = useState([]);
  const [externalTimesheets, setExternalTimesheets] = useState([]);
  const [statements, setStatements] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({});

  // Statement-related states
  const [isAddingNewRow, setIsAddingNewRow] = useState(false);
  const [newStatementRow, setNewStatementRow] = useState({
    date: '',
    retention: '',
    description: '',
    hours: '',
    payRate: '',
    credit: '',
    debit: '',
    balance: ''
  });

  // Fetch employee details and all related data
  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (!employeeId) {
        Swal.fire({
          title: 'Error',
          text: 'Missing employee information',
          icon: 'error'
        });
        navigate(-1);
        return;
      }

      // If employee data was passed via state, use it directly
      if (passedEmployee && passedCompany) {
        console.log('Using passed employee data:', passedEmployee);
        console.log('Company:', passedCompany);
        
        setEmployee(passedEmployee);
        setCompany(passedCompany);
        setEditedEmployee(passedEmployee);
        
        // Fetch only stats using the employee's database Id
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          };

          // Use the database Id for stats
          const statsResponse = await axios.get(
            `${BASE_URL}/api/employees/company/${passedCompany.id}/${passedEmployee.Id}/details`,
            { headers }
          );

          if (statsResponse.data.success) {
            setStats(statsResponse.data.data.stats || {});
          }
        } catch (error) {
          console.error('Error fetching employee stats:', error);
        } finally {
          setLoading(false);
        }
        return;
      }

      // If no employee data passed, this is an error
      Swal.fire({
        title: 'Error',
        text: 'No employee data available. Please navigate from the employee list.',
        icon: 'error'
      });
      navigate(-1);
    };

    fetchEmployeeData();
  }, [employeeId, navigate, passedEmployee, passedCompany]);

  // Fetch data based on active view
  useEffect(() => {
    const fetchViewData = async () => {
      if (!company?.id || !employee?.EmployeeId) return;

      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      try {
        switch (activeView) {
          case 'internalTimesheets':
            console.log('Fetching internal timesheets for employee ID (database):', employee.Id);
            const timesheetsResponse = await axios.get(
              `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/timesheets`,
              { headers, params: { status: filterStatus !== 'all' ? filterStatus : undefined } }
            );
            if (timesheetsResponse.data.success) {
              setTimesheets(timesheetsResponse.data.data);
            }
            break;

          case 'externalTimesheets':
            console.log('Fetching external timesheets for EmployeeId:', employee.EmployeeId);
            const externalResponse = await axios.get(
              `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}/external-timesheets`,
              { headers }
            );
            console.log('External timesheets response:', externalResponse.data);
            if (externalResponse.data.success) {
              setExternalTimesheets(externalResponse.data.data);
            }
            break;

          case 'statement':
            const statementsResponse = await axios.get(
              `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/statements`,
              { headers }
            );
            if (statementsResponse.data.success) {
              setStatements(statementsResponse.data.data);
            }
            break;

          case 'report':
            const reportsResponse = await axios.get(
              `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/reports`,
              { headers }
            );
            if (reportsResponse.data.success) {
              setReports(reportsResponse.data.data);
            }
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${activeView} data:`, error);
        Swal.fire({
          title: 'Error',
          text: `Failed to load ${activeView}: ${error.response?.data?.message || error.message}`,
          icon: 'error'
        });
      }
    };

    fetchViewData();
  }, [activeView, company, employee, filterStatus]);

  // Add this new useEffect after your employee data fetch useEffect and BEFORE the fetchViewData useEffect:

useEffect(() => {
  if (!company?.id || !employee?.EmployeeId) return;

  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const fetchExternalTimesheetsForBadge = async () => {
    try {
      const externalResponse = await axios.get(
        `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}/external-timesheets`,
        { headers }
      );
      if (externalResponse.data.success) {
        setExternalTimesheets(externalResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching external timesheets for badge:', error);
    }
  };

  fetchExternalTimesheetsForBadge();
}, [company, employee]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Statement helper functions
  const handleAddNewRow = async () => {
    if (isAddingNewRow) {
      if (!newStatementRow.date || !newStatementRow.description) {
        Swal.fire({
          title: 'Validation Error',
          text: 'Please fill in Date and Description fields',
          icon: 'warning'
        });
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/statements`,
          {
            checkDate: newStatementRow.date,
            period: newStatementRow.retention,
            description: newStatementRow.description,
            hours: newStatementRow.hours || 0,
            payRate: newStatementRow.payRate || 0,
            credit: newStatementRow.credit.replace(/,/g, '') || 0,
            debit: newStatementRow.debit.replace(/,/g, '') || 0,
            balance: newStatementRow.balance.replace(/,/g, '') || 0
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          Swal.fire({
            title: 'Success!',
            text: 'Statement row added successfully',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          
          const statementsResponse = await axios.get(
            `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/statements`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (statementsResponse.data.success) {
            setStatements(statementsResponse.data.data);
          }
          
          setIsAddingNewRow(false);
          setNewStatementRow({
            date: '',
            retention: '',
            description: '',
            hours: '',
            payRate: '',
            credit: '',
            debit: '',
            balance: ''
          });
        }
      } catch (error) {
        console.error('Error adding statement:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Failed to add statement',
          icon: 'error'
        });
      }
    } else {
      setIsAddingNewRow(true);
    }
  };

  const handleNewRowInputChange = (e) => {
    const { name, value } = e.target;
    setNewStatementRow(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancelNewRow = () => {
    setIsAddingNewRow(false);
    setNewStatementRow({
      date: '',
      retention: '',
      description: '',
      hours: '',
      payRate: '',
      credit: '',
      debit: '',
      balance: ''
    });
  };

  // Employee edit functions
  const handleEdit = () => setIsEditing(true);

  const handleSave = async () => {
    if (!editedEmployee.Name?.trim() || !editedEmployee.Email?.trim() || !editedEmployee.Department?.trim()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Name, Email, and Department are required fields',
        icon: 'error'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedEmployee.Email.trim())) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please enter a valid email address',
        icon: 'error'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}`,
        {
          name: editedEmployee.Name.trim(),
          email: editedEmployee.Email.trim(),
          department: editedEmployee.Department.trim(),
          phone: editedEmployee.Phone?.trim(),
          position: editedEmployee.Position?.trim(),
          employmentType: editedEmployee.EmploymentType,
          status: editedEmployee.Status,
          hireDate: editedEmployee.HireDate,
          location: editedEmployee.Location?.trim()
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setEmployee(response.data.data);
        setEditedEmployee(response.data.data);
        setIsEditing(false);
        Swal.fire({
          title: 'Success!',
          text: 'Employee updated successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to update employee',
        icon: 'error'
      });
    }
  };

  const handleCancel = () => {
    setEditedEmployee(employee);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete Employee?',
      text: `Are you sure you want to delete ${employee.Name}? This will also delete all associated timesheets.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.delete(
          `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          Swal.fire({
            title: 'Deleted!',
            text: response.data.message,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          navigate(-1);
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        Swal.fire({
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete employee',
          icon: 'error'
        });
      }
    }
  };

  // Export timesheet to CSV
  const exportTimesheetToCSV = (timesheet, entries) => {
    const csvRows = [];
    
    // Add header information
    csvRows.push(`Timesheet Tasks - ${employee.Name}`);
    csvRows.push(`Period:,${new Date(timesheet.PeriodStart).toLocaleDateString()} - ${new Date(timesheet.PeriodEnd).toLocaleDateString()}`);
    csvRows.push(`Total Hours:,${timesheet.totalHours || 0} hours`);
    csvRows.push(`Status:,${timesheet.status}`);
    if (timesheet.notes) {
      csvRows.push(`Notes:,${timesheet.notes}`);
    }
    csvRows.push(''); // Empty row
    
    // Add table headers
    csvRows.push('Date,Day,Hours,Type,Task');
    
    // Add entries
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    entries.forEach(entry => {
      const entryDate = new Date(entry.Date);
      const dayName = dayNames[entryDate.getDay()];
      const task = (entry.Task || 'General Work').replace(/,/g, ';'); // Replace commas in task
      
      // Format date with tab character to force text format in Excel
      const formattedDate = `="${entryDate.toLocaleDateString()}"`;
      
      csvRows.push(`${formattedDate},${dayName},${entry.Hours || 0},${entry.DayType || 'Regular'},${task}`);
    });
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `Timesheet_${employee.Name}_${new Date(timesheet.PeriodStart).toLocaleDateString().replace(/\//g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // View Timesheet Tasks - FIXED VERSION WITH CORRECT ID PROPERTY
  const handleViewTimesheetTasks = async (timesheetId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔍 Fetching timesheet details for ID:', timesheetId);
      
      // First, get the timesheet basic info
      const timesheetResponse = await axios.get(
        `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/timesheets`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!timesheetResponse.data.success) {
        throw new Error('Failed to fetch timesheets');
      }

      // Find the specific timesheet - FIX: use lowercase 'id' to match
      const timesheet = timesheetResponse.data.data.find(ts => ts.id === timesheetId);
      
      if (!timesheet) {
        throw new Error('Timesheet not found');
      }

      console.log('✅ Found timesheet:', timesheet);

      // Now fetch the entries for this timesheet
      const entriesResponse = await axios.get(
        `${BASE_URL}/api/timesheets/${timesheetId}/entries`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Entries response:', entriesResponse.data);

      const entries = entriesResponse.data.entries || entriesResponse.data || [];

      // Format entries for display
      let entriesHtml = '<div style="max-height: 400px; overflow-y: auto;">';
      
      if (entries.length > 0) {
        entriesHtml += '<table style="width: 100%; border-collapse: collapse; text-align: left;">';
        entriesHtml += '<thead><tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">';
        entriesHtml += '<th style="padding: 12px;">Date</th>';
        entriesHtml += '<th style="padding: 12px;">Day</th>';
        entriesHtml += '<th style="padding: 12px;">Hours</th>';
        entriesHtml += '<th style="padding: 12px;">Type</th>';
        entriesHtml += '<th style="padding: 12px;">Task</th>';
        entriesHtml += '</tr></thead><tbody>';
        
        entries.forEach(entry => {
          const entryDate = new Date(entry.Date);
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayName = dayNames[entryDate.getDay()];
          
          entriesHtml += '<tr style="border-bottom: 1px solid #e5e7eb;">';
          entriesHtml += `<td style="padding: 10px;">${entryDate.toLocaleDateString()}</td>`;
          entriesHtml += `<td style="padding: 10px;">${dayName}</td>`;
          entriesHtml += `<td style="padding: 10px; font-weight: 600;">${entry.Hours || 0} hrs</td>`;
          entriesHtml += `<td style="padding: 10px;">${entry.DayType || 'Regular'}</td>`;
          entriesHtml += `<td style="padding: 10px; max-width: 300px; white-space: normal; word-wrap: break-word;">${entry.Task || 'General Work'}</td>`;
          entriesHtml += '</tr>';
        });
        
        entriesHtml += '</tbody></table>';
      } else {
        entriesHtml += '<p style="text-align: center; padding: 20px; color: #6b7280;">No entries found for this timesheet.</p>';
      }
      
      entriesHtml += '</div>';

      Swal.fire({
        title: `Timesheet Tasks - ${employee.Name}`,
        html: `
          <div style="text-align: left; margin-bottom: 20px;">
            <p><strong>Period:</strong> ${new Date(timesheet.PeriodStart).toLocaleDateString()} - ${new Date(timesheet.PeriodEnd).toLocaleDateString()}</p>
            <p><strong>Total Hours:</strong> ${timesheet.totalHours || 0} hours</p>
            <p><strong>Status:</strong> <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; background: ${
              timesheet.status === 'Approved' ? '#d1fae5' : 
              timesheet.status === 'Rejected' ? '#fee2e2' : '#fff3cd'
            }; color: ${
              timesheet.status === 'Approved' ? '#065f46' : 
              timesheet.status === 'Rejected' ? '#991b1b' : '#856404'
            };">${timesheet.status}</span></p>
            ${timesheet.notes ? `<p><strong>Notes:</strong> ${timesheet.notes}</p>` : ''}
          </div>
          ${entriesHtml}
        `,
        width: '900px',
        showCancelButton: true,
        confirmButtonText: 'Export CSV',
        cancelButtonText: 'Close',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          exportTimesheetToCSV(timesheet, entries);
          Swal.fire({
            title: 'Exported!',
            text: 'Timesheet has been exported to CSV',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      });
    } catch (error) {
      console.error('❌ Error fetching timesheet details:', error);
      console.error('Error response:', error.response?.data);
      
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to load timesheet details',
        icon: 'error'
      });
    }
  };

  // Approve Internal Timesheet
  const handleApproveInternalTimesheet = async (timesheetId) => {
    const result = await Swal.fire({
      title: 'Approve Timesheet?',
      text: 'Are you sure you want to approve this timesheet?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.post(
          `${BASE_URL}/api/timesheets/${timesheetId}/approve`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Refresh the timesheets list
          const timesheetsResponse = await axios.get(
            `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/timesheets`,
            { 
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              params: { status: filterStatus !== 'all' ? filterStatus : undefined } 
            }
          );
          
          if (timesheetsResponse.data.success) {
            setTimesheets(timesheetsResponse.data.data);
          }

          // Refresh stats
          const statsResponse = await axios.get(
            `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/details`,
            { 
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (statsResponse.data.success) {
            setStats(statsResponse.data.data.stats || {});
          }

          Swal.fire({
            title: 'Approved!',
            text: 'Timesheet has been approved successfully.',
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
    }
  };

  // Reject Internal Timesheet
  const handleRejectInternalTimesheet = async (timesheetId) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Reject Timesheet?',
      input: 'textarea',
      inputLabel: 'Rejection Reason (optional)',
      inputPlaceholder: 'Enter reason for rejection...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel'
    });

    if (isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.post(
          `${BASE_URL}/api/timesheets/${timesheetId}/reject`,
          { 
            reason: reason || 'No reason provided' 
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Refresh the timesheets list
          const timesheetsResponse = await axios.get(
            `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/timesheets`,
            { 
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              params: { status: filterStatus !== 'all' ? filterStatus : undefined } 
            }
          );
          
          if (timesheetsResponse.data.success) {
            setTimesheets(timesheetsResponse.data.data);
          }

          // Refresh stats
          const statsResponse = await axios.get(
            `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/details`,
            { 
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (statsResponse.data.success) {
            setStats(statsResponse.data.data.stats || {});
          }

          Swal.fire({
            title: 'Rejected!',
            text: 'Timesheet has been rejected.',
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
    }
  };

  // Delete Internal Timesheet
  const deleteInternalTimesheet = async (timesheetId) => {
    const result = await Swal.fire({
      title: 'Delete Timesheet?',
      text: 'Are you sure you want to delete this timesheet? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${BASE_URL}/api/timesheets/${timesheetId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        // Refresh the timesheets list
        setTimesheets(prev => prev.filter(ts => ts.Id !== timesheetId));
        
        // Refresh stats
        const statsResponse = await axios.get(
          `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/details`,
          { 
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data.stats || {});
        }

        Swal.fire({
          title: 'Deleted!',
          text: 'Timesheet has been deleted.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error deleting timesheet:', error);
        Swal.fire('Error', 'Failed to delete timesheet', 'error');
      }
    }
  };

  // Approve external timesheet
  const handleApproveExternalTimesheet = async (timesheetId) => {
    const result = await Swal.fire({
      title: 'Approve Timesheet?',
      text: 'Are you sure you want to approve this external timesheet?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, approve it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.post(
          `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}/external-timesheets/${timesheetId}/approve`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Refresh the external timesheets list
          const timesheetsResponse = await axios.get(
            `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}/external-timesheets`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (timesheetsResponse.data.success) {
            setExternalTimesheets(timesheetsResponse.data.data);
          }

          Swal.fire({
            title: 'Approved!',
            text: 'External timesheet has been approved successfully.',
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
    }
  };

  // Reject external timesheet
  const handleRejectExternalTimesheet = async (timesheetId) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: 'Reject Timesheet?',
      input: 'textarea',
      inputLabel: 'Rejection Reason (optional)',
      inputPlaceholder: 'Enter reason for rejection...',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel'
    });

    if (isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.post(
          `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}/external-timesheets/${timesheetId}/reject`,
          { 
            reason: reason || 'No reason provided' 
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          // Refresh the external timesheets list
          const timesheetsResponse = await axios.get(
            `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}/external-timesheets`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (timesheetsResponse.data.success) {
            setExternalTimesheets(timesheetsResponse.data.data);
          }

          Swal.fire({
            title: 'Rejected!',
            text: 'External timesheet has been rejected.',
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
    }
  };

  // Download external timesheet
  const handleDownloadExternalTimesheet = async (timesheetId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}/external-timesheets/${timesheetId}/download`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to download file',
        icon: 'error'
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEmployee(prev => ({ ...prev, [name]: value }));
  };

  // File upload handlers
  const handleReportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'Custom Report');
    formData.append('description', '');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/reports`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        Swal.fire({
          title: 'Success!',
          text: 'Report uploaded successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        const reportsResponse = await axios.get(
          `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/reports`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (reportsResponse.data.success) {
          setReports(reportsResponse.data.data);
        }
      }
    } catch (error) {
      console.error('Error uploading report:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to upload report',
        icon: 'error'
      });
    }
  };

  // Delete handlers
  const deleteExternalTimesheet = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Timesheet?',
      text: 'Are you sure you want to delete this timesheet?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${BASE_URL}/api/employees/company/${company.id}/${employee.EmployeeId}/external-timesheets/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setExternalTimesheets(prev => prev.filter(ts => ts.Id !== id));
        Swal.fire('Deleted!', 'Timesheet has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting timesheet:', error);
        Swal.fire('Error', 'Failed to delete timesheet', 'error');
      }
    }
  };

  const deleteReport = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Report?',
      text: 'Are you sure you want to delete this report?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/reports/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setReports(prev => prev.filter(report => report.Id !== id));
        Swal.fire('Deleted!', 'Report has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting report:', error);
        Swal.fire('Error', 'Failed to delete report', 'error');
      }
    }
  };

  const deleteStatement = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Statement?',
      text: 'Are you sure you want to delete this statement?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `${BASE_URL}/api/employees/company/${company.id}/${employee.Id}/statements/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        setStatements(prev => prev.filter(statement => statement.Id !== id));
        Swal.fire('Deleted!', 'Statement has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting statement:', error);
        Swal.fire('Error', 'Failed to delete statement', 'error');
      }
    }
  };

  if (loading || !employee) {
    return (
      <div className="employee-details-main-container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  const filteredTimesheets = timesheets.filter(ts => {
    const matchesSearch = ts.EmployeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ts.Period?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="employee-details-main-container">
      {/* Header */}
      <div className="employee-details-header">
        <div className="employee-details-header-content">
          <div className="employee-details-header-left">
            <button className="employee-details-back-button" onClick={() => navigate(-1)}>
              <ArrowLeft size={20} />
              Back
            </button>
            <div>
              <h1>{employee.Name} - Employee Details</h1>
              <p>Employee ID: {employee.EmployeeId}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="employee-details-navigation-tabs">
          <button 
            className={`employee-details-tab-button ${activeView === 'employeeDetails' ? 'active' : ''}`}
            onClick={() => setActiveView('employeeDetails')}
          >
            <User size={16} />
            Employee Details
          </button>
          <button 
            className={`employee-details-tab-button ${activeView === 'internalTimesheets' ? 'active' : ''}`}
            onClick={() => setActiveView('internalTimesheets')}
          >
            <FileText size={16} />
            Internal Timesheets
            {stats.timesheets?.pending > 0 && (
              <span style={{
                marginLeft: '8px',
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '11px'
              }}>
                {stats.timesheets.pending}
              </span>
            )}
          </button>
         <button 
          className={`employee-details-tab-button ${activeView === 'externalTimesheets' ? 'active' : ''}`}
          onClick={() => setActiveView('externalTimesheets')}
        >
          <FileSpreadsheet size={16} />
          External Timesheets
          {externalTimesheets.filter(ts => ts.Status === 'Pending').length > 0 && (
            <span style={{
              marginLeft: '8px',
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              padding: '2px 6px',
              fontSize: '11px'
            }}>
              {externalTimesheets.filter(ts => ts.Status === 'Pending').length}
            </span>
          )}
        </button>
          <button 
            className={`employee-details-tab-button ${activeView === 'statement' ? 'active' : ''}`}
            onClick={() => setActiveView('statement')}
          >
            <BarChart3 size={16} />
            Statement
          </button>
          <button 
            className={`employee-details-tab-button ${activeView === 'report' ? 'active' : ''}`}
            onClick={() => setActiveView('report')}
          >
            <FileText size={16} />
            Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="employee-details-main-content">
        {/* Employee Details View */}
        {activeView === 'employeeDetails' && (
          <div className="employee-details-content-section">
            <div className="employee-details-card">
              <div className="employee-details-card-header">
                <h3>Employee Details - {employee.Name}</h3>
                
                {isEditing ? (
                  <div className="employee-details-action-buttons">
                    <button className="employee-details-btn employee-details-btn-success" onClick={handleSave}>
                      <Save size={16} />
                      Save
                    </button>
                    <button className="employee-details-btn employee-details-btn-danger" onClick={handleCancel}>
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="employee-details-action-buttons">
                    <button className="employee-details-btn employee-details-btn-primary" onClick={handleEdit}>
                      <Edit3 size={16} />
                      Edit
                    </button>
                    <button className="employee-details-btn employee-details-btn-danger" onClick={handleDelete}>
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              <div className="employee-details-info-grid">
                <div className="employee-details-employee-card">
                  <div className="employee-details-header-info">
                    <div className="employee-details-avatar">
                      {employee.Name.charAt(0)}
                    </div>
                    <div>
                      {isEditing ? (
                        <input
                          name="Name"
                          value={editedEmployee.Name}
                          onChange={handleInputChange}
                          className="employee-details-edit-input"
                        />
                      ) : (
                        <h4>{employee.Name}</h4>
                      )}
                      {isEditing ? (
                        <input
                          name="Position"
                          value={editedEmployee.Position}
                          onChange={handleInputChange}
                          className="employee-details-edit-input"
                        />
                      ) : (
                        <p>{employee.Position}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="employee-details-list">
                    <div className="employee-details-detail-row">
                      <span>Employee ID:</span>
                      <span>{employee.EmployeeId}</span>
                    </div>
                    <div className="employee-details-detail-row">
                      <span>Department:</span>
                      {isEditing ? (
                        <input
                          name="Department"
                          value={editedEmployee.Department}
                          onChange={handleInputChange}
                          className="employee-details-edit-input small"
                        />
                      ) : (
                        <span>{employee.Department}</span>
                      )}
                    </div>
                    <div className="employee-details-detail-row">
                      <span>Email:</span>
                      {isEditing ? (
                        <input
                          name="Email"
                          value={editedEmployee.Email}
                          onChange={handleInputChange}
                          className="employee-details-edit-input medium"
                        />
                      ) : (
                        <span>{employee.Email}</span>
                      )}
                    </div>
                    <div className="employee-details-detail-row">
                      <span>Hire Date:</span>
                      {isEditing ? (
                        <input
                          type="date"
                          name="HireDate"
                          value={editedEmployee.HireDate?.split('T')[0]}
                          onChange={handleInputChange}
                          className="employee-details-edit-input small"
                        />
                      ) : (
                        <span>{employee.HireDate ? new Date(employee.HireDate).toLocaleDateString() : 'N/A'}</span>
                      )}
                    </div>
                    <div className="employee-details-detail-row">
                      <span>Location:</span>
                      {isEditing ? (
                        <input
                          name="Location"
                          value={editedEmployee.Location}
                          onChange={handleInputChange}
                          className="employee-details-edit-input medium"
                        />
                      ) : (
                        <span>{employee.Location}</span>
                      )}
                    </div>
                    <div className="employee-details-detail-row">
                      <span>Phone:</span>
                      {isEditing ? (
                        <input
                          name="Phone"
                          value={editedEmployee.Phone}
                          onChange={handleInputChange}
                          className="employee-details-edit-input medium"
                        />
                      ) : (
                        <span>{employee.Phone}</span>
                      )}
                    </div>
                    <div className="employee-details-detail-row">
                      <span>Employment Type:</span>
                      {isEditing ? (
                        <select
                          name="EmploymentType"
                          value={editedEmployee.EmploymentType}
                          onChange={handleInputChange}
                          className="employee-details-status-select"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                        </select>
                      ) : (
                        <span>{employee.EmploymentType}</span>
                      )}
                    </div>
                    <div className="employee-details-detail-row">
                      <span>Status:</span>
                      {isEditing ? (
                        <select
                          name="Status"
                          value={editedEmployee.Status}
                          onChange={handleInputChange}
                          className="employee-details-status-select"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      ) : (
                        <span className="employee-details-status-badge">{employee.Status}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Internal Timesheets View */}
        {activeView === 'internalTimesheets' && (
          <div className="employee-details-content-section">
            <div className="employee-details-card">
              <h3>Timesheet Overview - {employee.Name}</h3>
              <div className="employee-details-stats-grid">
                <div className="employee-details-stat-card">
                  <span className="employee-details-stat-label">Pending</span>
                  <span className="employee-details-stat-value">{stats.timesheets?.pending || 0}</span>
                </div>
                <div className="employee-details-stat-card">
                  <span className="employee-details-stat-label">Approved</span>
                  <span className="employee-details-stat-value">{stats.timesheets?.approved || 0}</span>
                </div>
                <div className="employee-details-stat-card">
                  <span className="employee-details-stat-label">Rejected</span>
                  <span className="employee-details-stat-value">{stats.timesheets?.rejected || 0}</span>
                </div>
                <div className="employee-details-stat-card">
                  <span className="employee-details-stat-label">Total</span>
                  <span className="employee-details-stat-value">{stats.timesheets?.total || 0}</span>
                </div>
              </div>
            </div>

            <div className="employee-details-card">
              <div className="employee-details-card-header">
                <h3>Timesheets</h3>
                
                <div className="employee-details-filter-controls">
                  <div className="employee-details-search-container">
                    <Search size={18} />
                    <input
                      type="text"
                      placeholder="Search timesheets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
              
              {filteredTimesheets.length > 0 ? (
                <div className="employee-details-timesheet-list">
                  {filteredTimesheets.map((timesheet) => (
                    <div key={timesheet.Id} className="employee-details-timesheet-item">
                      <div className="employee-details-timesheet-header">
                        <div>
                          <h4>Period: {new Date(timesheet.PeriodStart).toLocaleDateString()} - {new Date(timesheet.PeriodEnd).toLocaleDateString()}</h4>
                          <p>Submitted: {new Date(timesheet.SubmittedDate || timesheet.CreatedAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="employee-details-timesheet-status">
                          <span className={`employee-details-status-badge ${timesheet.Status?.toLowerCase()}`}>
                            {timesheet.Status}
                          </span>
                          
                          <div className="employee-details-hours-display">
                            <Clock size={16} />
                            {timesheet.totalHours || timesheet.TotalHours || 0} hrs
                          </div>
                        </div>
                      </div>
                      
                      {timesheet.Notes && (
                        <div className="employee-details-timesheet-notes">
                          <p><strong>Notes:</strong> {timesheet.Notes}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="employee-details-timesheet-actions" style={{
                        display: 'flex',
                        gap: '8px',
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid #e5e7eb',
                        flexWrap: 'wrap',
                        alignItems: 'center'
                      }}>
                        {/* View Tasks Button - Always Visible */}
                        <button 
                          className="employee-details-action-btn primary"
                          onClick={() => handleViewTimesheetTasks(timesheet.id)}
                          title="View Tasks"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#188858ff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#16a34aff'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#188858ff'}
                        >
                          <Eye size={16} />
                          View Tasks
                        </button>

                        {/* Approve Button - Only show for Pending timesheets */}
                        {timesheet.status === 'Pending' && (
                          <button 
                            className="employee-details-action-btn success"
                            onClick={() => handleApproveInternalTimesheet(timesheet.id)}
                            title="Approve"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              backgroundColor: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                          >
                            <CheckCircle2 size={16} />
                            Approve
                          </button>
                        )}

                        {/* Reject Button - Only show for Pending timesheets */}
                        {timesheet.status === 'Pending' && (
                          <button 
                            className="employee-details-action-btn warning"
                            onClick={() => handleRejectInternalTimesheet(timesheet.id)}
                            title="Reject"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 16px',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '500',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        )}

                        {/* Delete Button - Show for all statuses, aligned to the right */}
                        <button 
                          onClick={() => deleteInternalTimesheet(timesheet.id)}
                          className="employee-details-action-btn danger"
                          title="Delete"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            marginLeft: 'auto',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="employee-details-empty-state">
                  <FileText size={48} />
                  <p>No timesheets found for this employee.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* External Timesheets View */}
        {activeView === 'externalTimesheets' && (
          <div className="employee-details-content-section">
            <div className="employee-details-card">
              <div className="employee-details-card-header">
                <h3>External Timesheets - {employee.Name}</h3>
              </div>
              
              {externalTimesheets.length > 0 ? (
                <div className="employee-details-file-list">
                  <div className="employee-details-file-list-header">
                    <div>File Name</div>
                    <div>Upload Date</div>
                    <div>Period</div>
                    <div>Status</div>
                    <div>Actions</div>
                  </div>
                  
                  {externalTimesheets.map((timesheet) => {
                    const FileIcon = getFileIcon(timesheet.FileName);
                    return (
                      <div key={timesheet.Id} className="employee-details-file-list-item">
                        <div className="employee-details-file-info">
                          <FileIcon size={18} />
                          <span>{timesheet.FileName}</span>
                        </div>
                        <div>{new Date(timesheet.UploadDate).toLocaleDateString()}</div>
                        <div>{timesheet.Period}</div>
                        <div>
                          <span className={`employee-details-status-badge ${timesheet.Status?.toLowerCase()}`}>
                            {timesheet.Status}
                          </span>
                        </div>
                        <div className="employee-details-file-actions">
                          <button 
                            className="employee-details-icon-btn"
                            onClick={() => handleDownloadExternalTimesheet(timesheet.Id, timesheet.FileName)}
                            title="Download"
                          >
                            <Download size={16} />
                          </button>
                          
                          {timesheet.Status === 'Pending' && (
                            <>
                              <button 
                                className="employee-details-icon-btn success"
                                onClick={() => handleApproveExternalTimesheet(timesheet.Id)}
                                title="Approve"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <button 
                                className="employee-details-icon-btn warning"
                                onClick={() => handleRejectExternalTimesheet(timesheet.Id)}
                                title="Reject"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          
                          <button 
                            onClick={() => deleteExternalTimesheet(timesheet.Id)}
                            className="employee-details-icon-btn danger"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="employee-details-empty-state">
                  <FileSpreadsheet size={48} />
                  <p>No external timesheets found for this employee.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statement View */}
        {activeView === 'statement' && (
          <div className="employee-details-content-section">
            <div className="employee-details-card">
              <div className="employee-details-card-header">
                <h3>Payroll Statement - {employee.Name}</h3>
                
                <button 
                  onClick={handleAddNewRow}
                  className={`employee-details-btn ${isAddingNewRow ? 'employee-details-btn-success' : 'employee-details-btn-primary'}`}
                >
                  <Plus size={16} />
                  {isAddingNewRow ? 'Save New Row' : 'Add New Row'}
                </button>
              </div>
              
              <div className="employee-details-statement-info">
                <div>
                  <span className="employee-details-info-label">Pay Frequency:</span>
                  <span>Monthly</span>
                </div>
                <div>
                  <span className="employee-details-info-label">Employee:</span>
                  <span>{employee.Name}</span>
                </div>
              </div>
              
              <div className="employee-details-table-container">
                <table className="employee-details-statement-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Ret.</th>
                      <th>Description</th>
                      <th className="text-right">Hours</th>
                      <th className="text-right">Pay Rate</th>
                      <th className="text-right">Credit</th>
                      <th className="text-right">Debit</th>
                      <th className="text-right">Balance</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isAddingNewRow && (
                      <tr className="employee-details-new-row">
                        <td>
                          <input
                            type="date"
                            name="date"
                            value={newStatementRow.date}
                            onChange={handleNewRowInputChange}
                            placeholder="MM/DD/YYYY"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="retention"
                            value={newStatementRow.retention}
                            onChange={handleNewRowInputChange}
                            placeholder="Retention"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="description"
                            value={newStatementRow.description}
                            onChange={handleNewRowInputChange}
                            placeholder="Description"
                          />
                        </td>
                        <td className="text-right">
                          <input
                            type="text"
                            name="hours"
                            value={newStatementRow.hours}
                            onChange={handleNewRowInputChange}
                            placeholder="Hours"
                          />
                        </td>
                        <td className="text-right">
                          <input
                            type="text"
                            name="payRate"
                            value={newStatementRow.payRate}
                            onChange={handleNewRowInputChange}
                            placeholder="Rate"
                          />
                        </td>
                        <td className="text-right">
                          <input
                            type="text"
                            name="credit"
                            value={newStatementRow.credit}
                            onChange={handleNewRowInputChange}
                            placeholder="Credit"
                          />
                        </td>
                        <td className="text-right">
                          <input
                            type="text"
                            name="debit"
                            value={newStatementRow.debit}
                            onChange={handleNewRowInputChange}
                            placeholder="Debit"
                          />
                        </td>
                        <td className="text-right">
                          <input
                            type="text"
                            name="balance"
                            value={newStatementRow.balance}
                            onChange={handleNewRowInputChange}
                            placeholder="Balance"
                          />
                        </td>
                        <td className="text-center">
                          <div className="employee-details-action-buttons">
                            <button
                              onClick={handleAddNewRow}
                              className="employee-details-icon-btn success"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancelNewRow}
                              className="employee-details-icon-btn danger"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {statements.map((statement) => (
                      <tr key={statement.Id}>
                        <td>{new Date(statement.CheckDate).toLocaleDateString()}</td>
                        <td>{statement.Period}</td>
                        <td>{statement.Description}</td>
                        <td className="text-right">{statement.Hours || 0}</td>
                        <td className="text-right">{statement.PayRate || 0}</td>
                        <td className="text-right credit">{statement.Credit || ''}</td>
                        <td className="text-right debit">{statement.Debit || ''}</td>
                        <td className="text-right balance">{statement.Balance || ''}</td>
                        <td className="text-center">
                          <div className="employee-details-action-buttons">
                            <button className="employee-details-icon-btn primary">
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => deleteStatement(statement.Id)}
                              className="employee-details-icon-btn danger"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Report View */}
        {activeView === 'report' && (
          <div className="employee-details-content-section">
            <div className="employee-details-card">
              <div className="employee-details-card-header">
                <h3>Reports - {employee.Name}</h3>
                
                <div>
                  <label htmlFor="report-upload" className="employee-details-btn employee-details-btn-primary">
                    <Plus size={16} />
                    Upload Report
                  </label>
                  <input
                    type="file"
                    id="report-upload"
                    style={{ display: 'none' }}
                    onChange={handleReportUpload}
                  />
                </div>
              </div>
              
              {reports.length > 0 ? (
                <div className="employee-details-file-list">
                  <div className="employee-details-file-list-header">
                    <div>File Name</div>
                    <div>Upload Date</div>
                    <div>Type</div>
                    <div>Description</div>
                    <div>Actions</div>
                  </div>
                  
                  {reports.map((report) => {
                    const FileIcon = getFileIcon(report.FileName);
                    return (
                      <div key={report.Id} className="employee-details-file-list-item">
                        <div className="employee-details-file-info">
                          <FileIcon size={18} />
                          <span>{report.FileName}</span>
                        </div>
                        <div>{new Date(report.UploadDate).toLocaleDateString()}</div>
                        <div>{report.Type}</div>
                        <div>{report.Description}</div>
                        <div className="employee-details-file-actions">
                          <button className="employee-details-icon-btn">
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => deleteReport(report.Id)}
                            className="employee-details-icon-btn danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="employee-details-empty-state">
                  <FileText size={48} />
                  <p>No reports found for this employee.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetailsPage;