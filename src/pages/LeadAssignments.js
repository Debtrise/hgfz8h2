import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import "./ListPages.css";
import LoadingSpinner from "../components/LoadingSpinner";

const LeadAssignments = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [leadPools, setLeadPools] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [filters, setFilters] = useState({
    leadPool: "",
    status: "",
    assignedTo: "",
    dateRange: "all"
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [currentPage, filters, searchTerm]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch leads with filters
      const leadsResponse = await apiService.leads.getAll({
        page: currentPage,
        leadPool: filters.leadPool,
        status: filters.status,
        assignedTo: filters.assignedTo,
        dateRange: filters.dateRange,
        search: searchTerm
      });
      
      setLeads(leadsResponse.data || []);
      setTotalPages(leadsResponse.totalPages || 1);
      
      // Fetch agents if not already loaded
      if (agents.length === 0) {
        const agentsResponse = await apiService.users.getAll({ role: "agent" });
        setAgents(agentsResponse.data || []);
      }
      
      // Fetch lead pools if not already loaded
      if (leadPools.length === 0) {
        const poolsResponse = await apiService.leadPools.getAll();
        setLeadPools(poolsResponse.data || []);
      }
      
      // Fetch assignment history if showing history
      if (showHistory) {
        const historyResponse = await apiService.leads.getAssignmentHistory({
          leadPool: filters.leadPool,
          dateRange: filters.dateRange
        });
        setAssignmentHistory(historyResponse.data || []);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchData();
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLeads(leads.map(lead => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => {
      if (prev.includes(leadId)) {
        return prev.filter(id => id !== leadId);
      } else {
        return [...prev, leadId];
      }
    });
  };

  const handleAssignLeads = async (agentId) => {
    if (selectedLeads.length === 0) {
      setError("Please select leads to assign");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.leads.assignLeads({
        leadIds: selectedLeads,
        agentId: agentId
      });
      
      setSuccess("Leads assigned successfully!");
      setSelectedLeads([]);
      fetchData();
    } catch (err) {
      console.error("Error assigning leads:", err);
      setError("Failed to assign leads. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignLeads = async () => {
    if (selectedLeads.length === 0) {
      setError("Please select leads to unassign");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await apiService.leads.unassignLeads(selectedLeads);
      
      setSuccess("Leads unassigned successfully!");
      setSelectedLeads([]);
      fetchData();
    } catch (err) {
      console.error("Error unassigning leads:", err);
      setError("Failed to unassign leads. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory) {
      fetchData();
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <div className="header-with-back">
            <button className="back-button" onClick={() => navigate("/leads")}>
              <i className="back-icon"></i>
              <span>Back to Leads</span>
            </button>
            <h1 className="page-title">Lead Assignments</h1>
          </div>
        </div>

        <div className="content-body">
          {error && (
            <div className="error-message">
              {error}
              <button className="dismiss-button" onClick={() => setError(null)}>×</button>
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
              <button className="dismiss-button" onClick={() => setSuccess(null)}>×</button>
            </div>
          )}

          <div className="filters-container">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </form>

            <div className="filters-group">
              <select
                name="leadPool"
                value={filters.leadPool}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Lead Pools</option>
                {leadPools.map(pool => (
                  <option key={pool.id} value={pool.id}>
                    {pool.name}
                  </option>
                ))}
              </select>

              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>

              <select
                name="assignedTo"
                value={filters.assignedTo}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">All Agents</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>

              <select
                name="dateRange"
                value={filters.dateRange}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          <div className="bulk-actions">
            <div className="bulk-actions-left">
              <label>
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length}
                  onChange={handleSelectAll}
                />
                Select All
              </label>
              <span className="selected-count">
                {selectedLeads.length} selected
              </span>
            </div>
            
            <div className="bulk-actions-right">
              <select
                onChange={(e) => handleAssignLeads(e.target.value)}
                value=""
                disabled={selectedLeads.length === 0}
                className="action-select"
              >
                <option value="">Assign to Agent...</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleUnassignLeads}
                disabled={selectedLeads.length === 0}
                className="button-outline"
              >
                Unassign
              </button>
              
              <button
                onClick={toggleHistory}
                className={`button-outline ${showHistory ? 'active' : ''}`}
              >
                {showHistory ? 'Hide History' : 'Show History'}
              </button>
            </div>
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : showHistory ? (
            <div className="history-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Lead</th>
                    <th>Previous Agent</th>
                    <th>New Agent</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentHistory.map(record => (
                    <tr key={record.id}>
                      <td>{new Date(record.date).toLocaleString()}</td>
                      <td>{record.lead_name}</td>
                      <td>{record.previous_agent || 'Unassigned'}</td>
                      <td>{record.new_agent || 'Unassigned'}</td>
                      <td>{record.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="leads-table">
              <table>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedLeads.length === leads.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Name</th>
                    <th>Lead Pool</th>
                    <th>Status</th>
                    <th>Assigned To</th>
                    <th>Last Contact</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                        />
                      </td>
                      <td>{`${lead.first_name} ${lead.last_name}`}</td>
                      <td>{lead.lead_pool_name}</td>
                      <td>
                        <span className={`status-badge ${lead.status}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td>{lead.assigned_to_name || 'Unassigned'}</td>
                      <td>{lead.last_contact ? new Date(lead.last_contact).toLocaleDateString() : 'Never'}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          className="button-link"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!showHistory && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                First
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-button"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`pagination-button ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadAssignments; 