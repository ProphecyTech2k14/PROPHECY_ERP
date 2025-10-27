// src/Bench_Sales/Components/BenchSalesDashboard.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/BenchSalesStyles.css";
import axios from "axios";
import BASE_URL from "../../url";
import Swal from "sweetalert2";
import { 
  Calendar, 
  LayoutDashboard as LuLayoutDashboard,
  Users as LuUsers,
  Edit3, 
  Save,
  Send,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Upload,
  File,
  Image,
  FileSpreadsheet,
  Trash2,
  Play,
  Square
} from 'lucide-react';

const BenchSalesDashboard = ({ isManagerView = false }) => {
  const [stats, setStats] = useState({
    benchStrength: 0,
    activeRequirements: 0,
    weeklySubmissions: 0,
    interviewsScheduled: 0,
  });
  const [utilizationData, setUtilizationData] = useState({
    utilized: 75,
    bench: 25
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        Swal.fire("Error", "Authentication token not found", "error");
        setLoading(false);
        return;
      }

      // Fetch dashboard stats - using the correct endpoint from your backend
      const statsResponse = await axios.get(`${BASE_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }
      
      // Fetch utilization data - using the correct endpoint from your backend
      const utilizationResponse = await axios.get(`${BASE_URL}/api/dashboard/utilization`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (utilizationResponse.data.success) {
        setUtilizationData(utilizationResponse.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        Swal.fire("Session Expired", "Please login again", "warning").then(() => {
          window.location.href = "/login";
        });
      } else if (error.response?.status === 404) {
        // If endpoints don't exist, use mock data
        setStats({
          benchStrength: 25,
          activeRequirements: 18,
          weeklySubmissions: 45,
          interviewsScheduled: 12,
        });
        setUtilizationData({
          utilized: 75,
          bench: 25
        });
        console.log("Using mock data as API endpoints are not available");
      } else {
        Swal.fire("Error", "Failed to load dashboard data", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Submission data for visualization
  const submissionData = [
    { month: "Jan", submissions: 65, hires: 28 },
    { month: "Feb", submissions: 59, hires: 48 },
    { month: "Mar", submissions: 80, hires: 40 },
    { month: "Apr", submissions: 81, hires: 19 },
    { month: "May", submissions: 56, hires: 26 },
    { month: "Jun", submissions: 55, hires: 27 },
  ];

  if (loading) {
    return (
      <div className="bench-dashboard-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bench-dashboard-wrapper">
      <div className="bench-dashboard-header">
        <h1>{isManagerView ? "Bench Sales Manager Dashboard" : "Bench Sales Recruiter Dashboard"}</h1>
        <div className="bench-dashboard-quick-actions">
          <button className="bench-dashboard-btn-primary" onClick={() => navigate("/bench-candidates")}>
            <span>+</span> Add Candidate
          </button>
          <button className="bench-dashboard-btn-primary" onClick={() => navigate("/bench-requirements")}>
            <span>+</span> Add Requirement
          </button>
          <button className="bench-dashboard-btn-primary" onClick={() => navigate("/bench-submissions")}>
            <span></span> Resume Submission
          </button>
        </div>
      </div>

      <div className="bench-dashboard-stats-grid">
        <div className="bench-dashboard-stat-card">
          <h3>Bench Strength</h3>
          <div className="bench-dashboard-stat-value">{stats.benchStrength}</div>
          <div className="bench-dashboard-stat-label">Employees</div>
        </div>
        <div className="bench-dashboard-stat-card">
          <h3>Active Requirements</h3>
          <div className="bench-dashboard-stat-value">{stats.activeRequirements}</div>
          <div className="bench-dashboard-stat-label">Open Positions</div>
        </div>
        <div className="bench-dashboard-stat-card">
          <h3>Submissions This Week</h3>
          <div className="bench-dashboard-stat-value">{stats.weeklySubmissions}</div>
          <div className="bench-dashboard-stat-label">Resumes Sent</div>
        </div>
        <div className="bench-dashboard-stat-card">
          <h3>Interviews Scheduled</h3>
          <div className="bench-dashboard-stat-value">{stats.interviewsScheduled}</div>
          <div className="bench-dashboard-stat-label">This Week</div>
        </div>
      </div>

      <div className="bench-dashboard-charts-container">
        <div className="bench-dashboard-chart-card">
          <h3>Candidate Utilization</h3>
          <div className="bench-dashboard-utilization-visual">
            <div className="bench-dashboard-utilization-bar">
              <div 
                className="bench-dashboard-utilized-portion" 
                style={{ width: `${utilizationData.utilized}%` }}
              >
                <span>{utilizationData.utilized}% Utilized</span>
              </div>
              <div 
                className="bench-dashboard-bench-portion" 
                style={{ width: `${utilizationData.bench}%` }}
              >
                <span>{utilizationData.bench}% On Bench</span>
              </div>
            </div>
            <div className="bench-dashboard-utilization-labels">
              <div className="bench-dashboard-label-item">
                <span className="bench-dashboard-color-dot bench-dashboard-utilized-dot"></span>
                <span>Utilized: {utilizationData.utilized}%</span>
              </div>
              <div className="bench-dashboard-label-item">
                <span className="bench-dashboard-color-dot bench-dashboard-bench-dot"></span>
                <span>On Bench: {utilizationData.bench}%</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bench-dashboard-chart-card">
          <h3>Submissions vs Hires</h3>
          <div className="bench-dashboard-submissions-visual">
            {submissionData.map((item, index) => (
              <div key={index} className="bench-dashboard-submission-bar-group">
                <div className="bench-dashboard-bar-container">
                  <div 
                    className="bench-dashboard-submission-bar" 
                    style={{ height: `${item.submissions}%` }}
                    title={`${item.submissions} submissions`}
                  ></div>
                  <div 
                    className="bench-dashboard-hire-bar" 
                    style={{ height: `${item.hires}%` }}
                    title={`${item.hires} hires`}
                  ></div>
                </div>
                <div className="bench-dashboard-month-label">{item.month}</div>
              </div>
            ))}
          </div>
          <div className="bench-dashboard-submission-legend">
            <div className="bench-dashboard-legend-item">
              <span className="bench-dashboard-color-box bench-dashboard-submission-color"></span>
              <span>Submissions</span>
            </div>
            <div className="bench-dashboard-legend-item">
              <span className="bench-dashboard-color-box bench-dashboard-hire-color"></span>
              <span>Hires</span>
            </div>
          </div>
        </div>
      </div>

      {isManagerView && (
        <div className="bench-dashboard-manager-section">
          <h2>Team Performance</h2>
          <div className="bench-dashboard-performance-grid">
            <div className="bench-dashboard-performance-card">
              <h4>Top Performers</h4>
              <ul>
                <li>John Doe - 12 placements</li>
                <li>Jane Smith - 10 placements</li>
                <li>Mike Johnson - 8 placements</li>
              </ul>
            </div>
            <div className="bench-dashboard-performance-card">
              <h4>Revenue Forecast</h4>
              <div className="bench-dashboard-revenue-item">
                <span>This Month:</span>
                <span>$125,000</span>
              </div>
              <div className="bench-dashboard-revenue-item">
                <span>Next Month:</span>
                <span>$145,000</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BenchSalesDashboard;