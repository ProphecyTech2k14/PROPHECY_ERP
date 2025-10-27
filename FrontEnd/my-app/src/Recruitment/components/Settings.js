import React, { useState } from 'react';
import { Settings, User, Palette, Bell, Lock } from 'lucide-react';
import '../styles/Settings.css';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('account');
  const [theme, setTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('#00796b');
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false
  });

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  const accentColors = [
    { name: 'Teal', value: '#00796b' },
    { name: 'Blue', value: '#1976d2' },
    { name: 'Purple', value: '#7b1fa2' },
    { name: 'Pink', value: '#c2185b' },
    { name: 'Orange', value: '#f57c00' },
    { name: 'Green', value: '#388e3c' }
  ];

  return (
    <div className={`settings-page ${theme === 'dark' ? 'dark-mode' : ''}`}>
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <h1>Settings & Preferences</h1>
          <p>Customize your application experience</p>
        </div>

        <div className="settings-layout">
          {/* Sidebar */}
          <div className="settings-sidebar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  style={activeTab === tab.id ? { backgroundColor: accentColor } : {}}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="settings-content">
            <div className="content-card">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="tab-content">
                  <h2>Account Settings</h2>
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" placeholder="Change username" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="Change email" />
                  </div>
                  <button className="btn-primary" style={{ backgroundColor: accentColor }}>
                    Save Changes
                  </button>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="tab-content">
                  <h2>Appearance</h2>
                  
                  {/* Theme Selection */}
                  <div className="theme-section">
                    <label className="section-label">Theme</label>
                    <div className="theme-options">
                      <button
                        onClick={() => setTheme('light')}
                        className={`theme-card ${theme === 'light' ? 'active' : ''}`}
                        style={theme === 'light' ? { borderColor: accentColor } : {}}
                      >
                        <div className="theme-preview light-preview">
                          <div className="preview-bar"></div>
                          <div className="preview-bar short"></div>
                        </div>
                        <span>Light</span>
                      </button>
                      
                      <button
                        onClick={() => setTheme('dark')}
                        className={`theme-card ${theme === 'dark' ? 'active' : ''}`}
                        style={theme === 'dark' ? { borderColor: accentColor } : {}}
                      >
                        <div className="theme-preview dark-preview">
                          <div className="preview-bar"></div>
                          <div className="preview-bar short"></div>
                        </div>
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="color-section">
                    <label className="section-label">Accent Color</label>
                    <div className="color-grid">
                      {accentColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setAccentColor(color.value)}
                          className={`color-btn ${accentColor === color.value ? 'active' : ''}`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="tab-content">
                  <h2>Notification Preferences</h2>
                  <div className="notification-list">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="notification-item">
                        <div className="notification-info">
                          <p className="notification-title">{key.charAt(0).toUpperCase() + key.slice(1)} Notifications</p>
                          <p className="notification-desc">Receive notifications via {key}</p>
                        </div>
                        <button
                          onClick={() => setNotifications({ ...notifications, [key]: !value })}
                          className={`toggle-switch ${value ? 'active' : ''}`}
                          style={value ? { backgroundColor: accentColor } : {}}
                        >
                          <div className="toggle-thumb" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="tab-content">
                  <h2>Security Settings</h2>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" placeholder="Enter current password" />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" placeholder="Confirm new password" />
                  </div>
                  <button className="btn-primary" style={{ backgroundColor: accentColor }}>
                    Update Password
                  </button>
                </div>
              )}

              {/* Preferences */}
              {activeTab === 'preferences' && (
                <div className="tab-content">
                  <h2>General Preferences</h2>
                  <div className="form-group">
                    <label>Language</label>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="hi">Hindi</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date Format</label>
                    <select>
                      <option>MM/DD/YYYY</option>
                      <option>DD/MM/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Time Zone</label>
                    <select>
                      <option>Asia/Kolkata (IST)</option>
                      <option>America/New_York (EST)</option>
                      <option>Europe/London (GMT)</option>
                      <option>Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                  <button className="btn-primary" style={{ backgroundColor: accentColor }}>
                    Save Preferences
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;