import React from "react";
import { IoClose } from "react-icons/io5";
import "../styles/ColumnFilterSidebar.css";

const ColumnFilterSidebar = ({ 
  availableColumns, 
  selectedColumns, 
  setSelectedColumns, 
  onClose,
  isOpen
}) => {
  const allSelected = selectedColumns.length === availableColumns.length;

  const handleSelectAll = () => {
    setSelectedColumns(allSelected ? [] : availableColumns.map(col => col.key));
  };

  const handleChange = (e) => {
    const { value, checked } = e.target;
    setSelectedColumns(prev =>
      checked ? [...prev, value] : prev.filter(col => col !== value)
    );
  };

  return (
    <div className={`column-filter-sidebar-wrapper ${isOpen ? 'open' : ''}`}>
      <div className="column-filter-sidebar-header">
        <h3>Manage Columns</h3>
        <IoClose 
          className="column-filter-sidebar-close-btn" 
          onClick={onClose} 
        />
      </div>

      <label className="column-filter-sidebar-item">
        <input 
          type="checkbox" 
          checked={allSelected} 
          onChange={handleSelectAll} 
        />
        Select All
      </label>

      {availableColumns.map(col => (
        <label key={col.key} className="column-filter-sidebar-item">
          <input
            type="checkbox"
            value={col.key}
            checked={selectedColumns.includes(col.key)}
            onChange={handleChange}
          />
          {col.label}
        </label>
      ))}
    </div>
  );
};

export default ColumnFilterSidebar;