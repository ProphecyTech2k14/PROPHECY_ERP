import React, { useState, useEffect } from "react";
import "../styles/InternalTimesheet.css";
import axios from 'axios';
import BASE_URL from '../../url';
import { LuClipboardList } from "react-icons/lu";

const InternalTimesheet = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [timesheetData, setTimesheetData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [contextMenu, setContextMenu] = useState(null);
  const [savedTimesheetId, setSavedTimesheetId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [taskModal, setTaskModal] = useState(null);
  const [taskInput, setTaskInput] = useState("");
  const [dailyTasks, setDailyTasks] = useState({});
  const [submittedWeeks, setSubmittedWeeks] = useState(new Set());
  const [timesheetStatus, setTimesheetStatus] = useState('draft'); // 'draft', 'Pending', 'Approved', 'Rejected'

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

  const statusTypes = [
    { label: "Filled Hours (8h)", color: "#86cb89" },
    { label: "Not Filled Hours (0h)", color: "#f44336" },
    { label: "Partially Filled Hours", color: "#FFC107" },
    { label: "Approved Leave", color: "#2196F3" },
    { label: "Holiday", color: "#9C27B0" }
  ];

  const today = new Date();
  const isCurrentMonth = selectedMonth === today.getMonth() + 1 && selectedYear === today.getFullYear();

  const isDateEditable = (day) => {
    if (!isCurrentMonth) return false;
    return day <= today.getDate();
  };

  const isWeekSubmittable = (week) => {
    return week.dates.some((date, idx) => {
      if (date === null) return false;
      if (!isDateEditable(date)) return false;
      return week.hours[idx] > 0;
    });
  };

  const isWeekSubmitted = (weekIndex) => {
    return submittedWeeks.has(weekIndex);
  };

  // Load timesheet data when month/year changes
  useEffect(() => {
    const loadData = async () => {
      generateTimesheetData();
      await loadTimesheetData();
    };
    loadData();
  }, [selectedMonth, selectedYear]);

  // Load submitted weeks from backend after timesheet is loaded
  useEffect(() => {
    const loadSubmittedWeeksFromBackend = async () => {
      if (savedTimesheetId) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `${BASE_URL}/api/timesheets/${savedTimesheetId}/submitted-weeks`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          if (response.data.success) {
            const submittedSet = new Set(response.data.submittedWeeks);
            setSubmittedWeeks(submittedSet);
            console.log('✅ Loaded submitted weeks from backend:', response.data.submittedWeeks);
          }
        } catch (error) {
          console.error("Error loading submitted weeks:", error);
        }
      }
    };
    
    loadSubmittedWeeksFromBackend();
  }, [savedTimesheetId]);

  const loadTimesheetData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/timesheets`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: 'internal',
          month: selectedMonth,
          year: selectedYear
        }
      });

      if (response.data.length > 0) {
        const timesheet = response.data[0];
        setSavedTimesheetId(timesheet.id);
        setTimesheetStatus(timesheet.Status || 'draft');
        
        const detailResponse = await axios.get(`${BASE_URL}/api/timesheets/${timesheet.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const fullTimesheet = detailResponse.data;
        
        if (fullTimesheet.entries && fullTimesheet.entries.length > 0) {
          populateTimesheetFromEntries(fullTimesheet.entries);
          loadDailyTasks(fullTimesheet.entries);
          loadSubmittedWeeks(fullTimesheet.entries);
        }
      } else {
        setSubmittedWeeks(new Set());
        setTimesheetStatus('draft');
      }
    } catch (error) {
      console.error("Error loading timesheet:", error);
    }
  };

  // Load which weeks were submitted by checking the metadata
  const loadSubmittedWeeks = (entries) => {
    // Group entries by week based on date ranges
    const submittedSet = new Set();
    
    if (timesheetData.length > 0) {
      timesheetData.forEach((week, weekIndex) => {
        const weekHasEntries = week.dates.some((date, idx) => {
          if (date === null) return false;
          const entryExists = entries.some(entry => {
            const entryDate = new Date(entry.date);
            return entryDate.getUTCDate() === date && 
                   entryDate.getUTCMonth() === selectedMonth - 1 &&
                   entryDate.getUTCFullYear() === selectedYear;
          });
          return entryExists;
        });
        
        if (weekHasEntries) {
          submittedSet.add(weekIndex);
        }
      });
    }
    
    setSubmittedWeeks(submittedSet);
  };

  const loadDailyTasks = (entries) => {
    const tasks = {};
    entries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const day = String(entryDate.getUTCDate()).padStart(2, '0');
      const month = String(entryDate.getUTCMonth() + 1).padStart(2, '0');
      const year = entryDate.getUTCFullYear();
      const dateKey = `${year}-${month}-${day}`;
      
      if (entry.task && entry.task.trim() !== '' && entry.task !== 'General Work') {
        tasks[dateKey] = entry.task;
      }
    });
    setDailyTasks(tasks);
  };

  const populateTimesheetFromEntries = (entries) => {
    const entriesMap = {};
    entries.forEach(entry => {
      const date = new Date(entry.date);
      const day = date.getDate();
      entriesMap[day] = {
        hours: parseFloat(entry.hours),
        type: entry.dayType || 'regular'
      };
    });

    setTimesheetData(prevData => {
      return prevData.map(week => ({
        ...week,
        hours: week.dates.map((date, idx) => {
          if (date !== null && entriesMap[date]) {
            return entriesMap[date].hours;
          }
          return week.hours[idx];
        }),
        types: week.dates.map((date, idx) => {
          if (date !== null && entriesMap[date]) {
            return entriesMap[date].type;
          }
          return week.types[idx];
        })
      }));
    });
  };

  const generateTimesheetData = () => {
    const firstDay = new Date(selectedYear, selectedMonth - 1, 1);
    const lastDay = new Date(selectedYear, selectedMonth, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const weeks = [];
    let currentWeek = {
      dates: [],
      hours: [],
      dayNames: [],
      types: []
    };

    const mondayStartOffset = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    
    for (let i = 0; i < mondayStartOffset; i++) {
      currentWeek.dates.push(null);
      currentWeek.hours.push(0);
      currentWeek.dayNames.push("");
      currentWeek.types.push('empty');
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth - 1, day);
      const dayOfWeek = date.getDay();
      
      currentWeek.dates.push(day);
      currentWeek.hours.push((dayOfWeek === 0 || dayOfWeek === 6) ? 0 : 8);
      currentWeek.dayNames.push(getDayName(dayOfWeek));
      currentWeek.types.push('regular');
      
      if (currentWeek.dates.length === 7) {
        weeks.push({ ...currentWeek });
        currentWeek = { dates: [], hours: [], dayNames: [], types: [] };
      }
    }
    
    if (currentWeek.dates.length > 0) {
      while (currentWeek.dates.length < 7) {
        currentWeek.dates.push(null);
        currentWeek.hours.push(0);
        currentWeek.dayNames.push("");
        currentWeek.types.push('empty');
      }
      weeks.push({ ...currentWeek });
    }
    
    setTimesheetData(weeks);
  };

  const getDayName = (dayIndex) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayIndex];
  };

  const getHourStatus = (hours, date, type) => {
    if (date === null || type === 'empty') return "empty";
    if (type === 'leave') return "leave";
    if (type === 'holiday') return "holiday";
    if (hours === 8) return "filled";
    if (hours === 0) return "not-filled";
    if (hours > 0 && hours < 8) return "partial";
    return "not-filled";
  };

  const handleHourClick = (weekIndex, dayIndex, currentHours, date, type) => {
    if (date === null || type === 'leave' || type === 'holiday' || !isDateEditable(date)) return;
    if (submittedWeeks.has(weekIndex)) return;
    
    setEditingCell({ weekIndex, dayIndex });
    setEditValue(currentHours.toString());
  };

  const handleRightClick = (e, weekIndex, dayIndex, date) => {
    e.preventDefault();
    if (date === null || !isDateEditable(date) || submittedWeeks.has(weekIndex)) return;
    
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      weekIndex,
      dayIndex
    });
  };

  const handleSetDayType = (type) => {
    if (contextMenu) {
      const { weekIndex, dayIndex } = contextMenu;
      const newData = [...timesheetData];
      newData[weekIndex].types[dayIndex] = type;
      
      if (type === 'leave' || type === 'holiday') {
        newData[weekIndex].hours[dayIndex] = 0;
      } else if (type === 'regular') {
        const dayOfWeek = new Date(selectedYear, selectedMonth - 1, newData[weekIndex].dates[dayIndex]).getDay();
        newData[weekIndex].hours[dayIndex] = (dayOfWeek === 0 || dayOfWeek === 6) ? 0 : 8;
      }
      
      setTimesheetData(newData);
    }
    setContextMenu(null);
  };

  const handleHourChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 24)) {
      setEditValue(value);
    }
  };

  const handleHourSave = () => {
    if (editingCell && editValue !== "") {
      const { weekIndex, dayIndex } = editingCell;
      const newData = [...timesheetData];
      newData[weekIndex].hours[dayIndex] = parseFloat(editValue) || 0;
      setTimesheetData(newData);
    }
    setEditingCell(null);
    setEditValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleHourSave();
    } else if (e.key === "Escape") {
      setEditingCell(null);
      setEditValue("");
    }
  };

  const openTaskModal = (day) => {
    if (!isDateEditable(day) || submittedWeeks.has(getCurrentWeekIndex(day))) return;
    
    const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setTaskModal(day);
    setTaskInput(dailyTasks[dateKey] || "");
  };

  const getCurrentWeekIndex = (day) => {
    return timesheetData.findIndex(week => week.dates.includes(day));
  };

  const saveTask = () => {
    const dateKey = getTaskDateKey(taskModal);
    const newTasks = { ...dailyTasks };
    if (taskInput.trim()) {
      newTasks[dateKey] = taskInput.trim();
    } else {
      delete newTasks[dateKey];
    }
    setDailyTasks(newTasks);
    setTaskModal(null);
    setTaskInput("");
  };

  const getTaskDisplay = (day) => {
    const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const task = dailyTasks[dateKey];
    return task ? <LuClipboardList size={16} /> : 'Add Task';
  };

  const getTaskTooltip = (day) => {
    const dateKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dailyTasks[dateKey] || '';
  };

  const getTaskDateKey = (day) => {
    return `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const calculateWeeklyTotal = (week) => {
    return week.hours.reduce((sum, hours) => sum + hours, 0);
  };

  const calculateMonthlyTotal = () => {
    return timesheetData.reduce((sum, week) => sum + calculateWeeklyTotal(week), 0);
  };

  const handleWeeklySubmit = async (weekIndex) => {
    setLoading(true);
    try {
      const week = timesheetData[weekIndex];
      const entries = [];
      
      week.dates.forEach((date, dayIndex) => {
        if (date !== null && isDateEditable(date)) {
          const dateKey = getTaskDateKey(date);
          const taskForDay = dailyTasks[dateKey] || "General Work";
          
          entries.push({
            date: date,
            hours: week.hours[dayIndex] || 0,
            dayType: week.types[dayIndex] || 'regular',
            project: "Default Project",
            task: taskForDay,
            description: `${week.dayNames[dayIndex]} work`
          });
        }
      });

      const payload = {
        month: selectedMonth,
        year: selectedYear,
        weekIndex: weekIndex,
        entries: entries,
        notes: `Week ${weekIndex + 1} timesheet`
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/timesheets/internal`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSavedTimesheetId(response.data.timesheetId);
      
      // Add this week to submitted set and persist state
      const newSubmittedWeeks = new Set([...submittedWeeks, weekIndex]);
      setSubmittedWeeks(newSubmittedWeeks);
      
      alert(`Week ${weekIndex + 1} submitted successfully! ${response.data.stats ? 
        `(${response.data.stats.successCount} entries saved)` : ''}`);
    } catch (error) {
      console.error("Error submitting week:", error);
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.message || 
                       error.message;
      alert(`Failed to submit week: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const entries = [];
      
      timesheetData.forEach((week, weekIndex) => {
        week.dates.forEach((date, dayIndex) => {
          if (date !== null && date !== undefined && isDateEditable(date)) {
            const dayName = week.dayNames[dayIndex];
            const dateKey = getTaskDateKey(date);
            const taskForDay = dailyTasks[dateKey] || "General Work";
            
            entries.push({
              date: date,
              hours: week.hours[dayIndex] || 0,
              dayType: week.types[dayIndex] || 'regular',
              project: "Default Project",
              task: taskForDay,
              description: `${dayName} work`
            });
          }
        });
      });

      const payload = {
        month: selectedMonth,
        year: selectedYear,
        entries: entries,
        notes: "Internal timesheet"
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/timesheets/internal`, 
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setSavedTimesheetId(response.data.timesheetId);
      setTimesheetStatus('draft');
      
      alert(`Timesheet saved successfully! ${response.data.stats ? 
        `(${response.data.stats.successCount} entries saved)` : ''}`);
    } catch (error) {
      console.error("Error saving timesheet:", error);
      const errorMsg = error.response?.data?.error || 
                       error.response?.data?.message || 
                       error.message;
      alert(`Failed to save timesheet: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!savedTimesheetId) {
      alert("Please save the timesheet before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${BASE_URL}/api/timesheets/${savedTimesheetId}/submit`, 
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTimesheetStatus('Pending');
      alert("Timesheet submitted for approval!");
    } catch (error) {
      console.error("Error submitting timesheet:", error);
      alert("Failed to submit timesheet. Please try again.");
    }
  };

  const handleExport = async () => {
    if (!savedTimesheetId) {
      alert("Please save the timesheet before exporting.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/timesheets/${savedTimesheetId}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timesheet-${selectedMonth}-${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting timesheet:", error);
      alert("Failed to export timesheet. Please try again.");
    }
  };

  const getCellDisplay = (hours, type) => {
    if (type === 'leave') return 'Leave';
    if (type === 'holiday') return 'Holiday';
    return `${hours}h`;
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="timesheet-container">
      <div className="timesheet-header">
        <h2 className="timesheet-title">
          Timesheet entry enabled till {today.getDate()}
          <sup>th</sup> {months[selectedMonth - 1]} {selectedYear}
        </h2>
        <div className="timesheet-selectors">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="timesheet-select"
          >
            {months.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="timesheet-select"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="timesheet-legend">
        {statusTypes.map((status, index) => (
          <div key={index} className="timesheet-legend-item">
            <div className="timesheet-legend-color" style={{ backgroundColor: status.color }}></div>
            <span className="timesheet-legend-text">{status.label}</span>
          </div>
        ))}
      </div>

      <div className="timesheet-table-container">
        <table className="timesheet-table">
          <thead>
            <tr>
              <th className="timesheet-th">Week</th>
              <th className="timesheet-th">Mon</th>
              <th className="timesheet-th">Tue</th>
              <th className="timesheet-th">Wed</th>
              <th className="timesheet-th">Thu</th>
              <th className="timesheet-th">Fri</th>
              <th className="timesheet-th">Sat</th>
              <th className="timesheet-th">Sun</th>
              <th className="timesheet-th">Total</th>
              <th className="timesheet-th">Action</th>
            </tr>
          </thead>
          <tbody>
            {timesheetData.map((week, weekIndex) => (
              <React.Fragment key={weekIndex}>
                <tr className="timesheet-date-row">
                  <td className="timesheet-td"><strong>Week {weekIndex + 1}</strong></td>
                  {week.dates.map((date, dayIndex) => (
                    <td key={dayIndex} className="timesheet-td">
                      {date !== null ? (
                        <div>
                          <div className={`timesheet-date-number ${!isDateEditable(date) || submittedWeeks.has(weekIndex) ? 'timesheet-date-frozen' : ''}`}>
                            {date}
                          </div>
                          <div className="timesheet-day-name">{week.dayNames[dayIndex]}</div>
                        </div>
                      ) : ""}
                    </td>
                  ))}
                  <td className="timesheet-td"></td>
                  <td className="timesheet-td"></td>
                </tr>
                <tr className="timesheet-hours-row">
                  <td className="timesheet-td"></td>
                  {week.hours.map((hours, dayIndex) => (
                    <td key={dayIndex} className="timesheet-td">
                      {week.dates[dayIndex] !== null ? (
                        editingCell?.weekIndex === weekIndex && editingCell?.dayIndex === dayIndex ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={handleHourChange}
                            onBlur={handleHourSave}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="timesheet-input"
                          />
                        ) : (
                          <div
                            className={`timesheet-hour-cell timesheet-hour-${getHourStatus(hours, week.dates[dayIndex], week.types[dayIndex])} ${!isDateEditable(week.dates[dayIndex]) || submittedWeeks.has(weekIndex) ? 'timesheet-hour-frozen' : ''}`}
                            onClick={() => handleHourClick(weekIndex, dayIndex, hours, week.dates[dayIndex], week.types[dayIndex])}
                            onContextMenu={(e) => handleRightClick(e, weekIndex, dayIndex, week.dates[dayIndex])}
                          >
                            {getCellDisplay(hours, week.types[dayIndex])}
                          </div>
                        )
                      ) : (
                        <div className="timesheet-hour-cell timesheet-hour-empty"></div>
                      )}
                    </td>
                  ))}
                  <td className="timesheet-weekly-total">
                    <strong>{calculateWeeklyTotal(week)}h</strong>
                  </td>
                  <td className="timesheet-td"></td>
                </tr>
                <tr className="timesheet-task-row">
                  <td className="timesheet-td"><small>Tasks</small></td>
                  {week.dates.map((date, dayIndex) => (
                    <td key={dayIndex} className="timesheet-td">
                      {date !== null ? (
                        <button
                          className={`timesheet-task-btn ${!isDateEditable(date) || submittedWeeks.has(weekIndex) ? 'timesheet-task-btn-disabled' : ''}`}
                          onClick={() => openTaskModal(date)}
                          title={getTaskTooltip(date)}
                          disabled={!isDateEditable(date) || submittedWeeks.has(weekIndex)}
                        >
                          {getTaskDisplay(date)}
                        </button>
                      ) : (
                        <div className="timesheet-hour-cell timesheet-hour-empty"></div>
                      )}
                    </td>
                  ))}
                  <td className="timesheet-td"></td>
                  <td className="timesheet-td">
                    <button 
                      className={`timesheet-btn timesheet-week-submit ${isWeekSubmitted(weekIndex) ? 'timesheet-week-submitted' : ''} ${!isWeekSubmittable(week) ? 'timesheet-btn-disabled' : ''}`}
                      onClick={() => handleWeeklySubmit(weekIndex)}
                      disabled={isWeekSubmitted(weekIndex) || !isWeekSubmittable(week) || loading}
                    >
                      {loading ? 'Submitting...' : isWeekSubmitted(weekIndex) ? '✓ Submitted' : 'Submit'}
                    </button>
                  </td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="timesheet-total-row">
              <td colSpan="8" className="timesheet-td" style={{ textAlign: "right", padding: "16px" }}>
                <strong>Monthly Total:</strong>
              </td>
              <td className="timesheet-monthly-total">
                <strong>{calculateMonthlyTotal()}h</strong>
              </td>
              <td className="timesheet-td"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {contextMenu && (
        <div 
          className="context-menu"
          style={{ 
            position: 'absolute', 
            top: contextMenu.y, 
            left: contextMenu.x,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="context-menu-item"
            onClick={() => handleSetDayType('regular')}
          >
            Regular Day
          </div>
          <div 
            className="context-menu-item"
            onClick={() => handleSetDayType('leave')}
          >
            Leave
          </div>
          <div 
            className="context-menu-item"
            onClick={() => handleSetDayType('holiday')}
          >
            Holiday
          </div>
        </div>
      )}

      {taskModal && (
        <div className="task-modal-overlay" onClick={() => setTaskModal(null)}>
          <div className="task-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Task for Day {taskModal}</h3>
            <textarea
              className="task-textarea"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter tasks completed today..."
              rows="4"
            />
            <div className="task-modal-buttons">
              <button className="task-btn-save" onClick={saveTask}>Save</button>
              <button className="task-btn-cancel" onClick={() => setTaskModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="timesheet-actions">
        <button 
          className="timesheet-btn timesheet-btn-primary" 
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Timesheet"}
        </button>
        <button className="timesheet-btn timesheet-btn-secondary" onClick={handleSubmit}>
          Submit for Approval
        </button>
        <button className="timesheet-btn timesheet-btn-outline" onClick={handleExport}>
          Export to CSV
        </button>
      </div>

      <div className="timesheet-info">
        <p className="timesheet-info-text">
          <strong>Note:</strong> Editable dates: 1st to today ({today.getDate()}th). 
          Future dates are frozen and cannot be edited.
          Submitted weeks remain locked even after manager rejection - you must make corrections to draft entries only.
          Left-click on hour cells to edit hours. 
          Right-click to mark as Leave or Holiday.
          Click task buttons to add daily tasks.
          Submit each week separately after filling editable dates.
          Press Enter to save or Escape to cancel. 
        </p>
      </div>
    </div>
  );
};

export default InternalTimesheet;