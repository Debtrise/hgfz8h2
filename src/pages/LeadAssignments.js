import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import "./ListPages.css";
import LoadingSpinner from "../components/LoadingSpinner";

const LeadAssignments = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterLeadPool, setFilterLeadPool] = useState("all");
  const [leadPools, setLeadPools] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsPerPage] = useState(10);

  // Fetch leads, agents, and lead pools
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch leads with pagination
        const leadsResponse = await apiService.leads.getAll({
          page: currentPage,
          limit: leadsPerPage,
          search: searchTerm,
          status: filterStatus !== "all" ? filterStatus : undefined,
          leadPoolId: filterLeadPool !== "all" ? filterLeadPool : undefined
        });
        
        setLeads(leadsResponse.leads || []);
        setTotalLeads(leadsResponse.pagination?.total || 0);
        
        // Fetch agents
        const agentsResponse = await apiService.callCenter.agents.getAll();
        console.log("Agents response:", agentsResponse);
        // Ensure agents is always an array
        setAgents(Array.isArray(agentsResponse.data) ? agentsResponse.data : []);
        
        // Fetch lead pools
        const leadPoolsResponse = await apiService.leadPools.getAll();
        setLeadPools(leadPoolsResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentPage, leadsPerPage, searchTerm, filterStatus, filterLeadPool]);

  const handleBack = () => {
    navigate("/leads");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "status") {
      setFilterStatus(value);
    } else if (name === "leadPool") {
      setFilterLeadPool(value);
    }
    setCurrentPage(1);
  };

  const handleLeadSelect = (leadId) => {
    if (selectedLeads.includes(leadId)) {
      setSelectedLeads(selectedLeads.filter(id => id !== leadId));
    } else {
      setSelectedLeads([...selectedLeads, leadId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead.id));
    }
  };

  const handleAgentChange = (e) => {
    setSelectedAgent(e.target.value);
  };

  const handleAssign = async () => {
    if (selectedLeads.length === 0) {
      setError("Please select at least one lead to assign.");
      return;
    }
    
    if (!selectedAgent) {
      setError("Please select an agent to assign the leads to.");
      return;
    }
    
    setIsAssigning(true);
    setError(null);
    
    try {
      await apiService.leads.assignLeads({
        leadIds: selectedLeads,
        agentId: selectedAgent
      });
      
      // Refresh the leads list
      const leadsResponse = await apiService.leads.getAll({
        page: currentPage,
        limit: leadsPerPage,
        search: searchTerm,
        status: filterStatus !== "all" ? filterStatus : undefined,
        leadPoolId: filterLeadPool !== "all" ? filterLeadPool : undefined
      });
      
      setLeads(leadsResponse.leads || []);
      setSelectedLeads([]);
      setSelectedAgent("");
    } catch (err) {
      console.error("Error assigning leads:", err);
      setError("Failed to assign leads. Please try again later.");
    } finally {
      setIsAssigning(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(totalLeads / leadsPerPage);

  if (isLoading && leads.length === 0) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="loading-state">
            <LoadingSpinner size="large" text="Loading leads..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <div className="header-with-back">
            <button className="back-button" onClick={handleBack}>
              <i className="back-icon"></i>
              <span>Back to Leads</span>
            </button>
            <h1 className="page-title">Assign Leads to Agents</h1>
          </div>
        </div>

        <div className="content-body">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="assignment-controls">
            <div className="search-filter-row">
              <form className="search-container" onSubmit={handleSearch}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <i className="search-icon"></i>
              </form>

              <div className="filter-row">
                <div className="filter-group">
                  <label htmlFor="status">Status:</label>
                  <div className="select-wrapper">
                    <select
                      id="status"
                      name="status"
                      value={filterStatus}
                      onChange={handleFilterChange}
                    >
                      <option value="all">All Statuses</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                </div>

                <div className="filter-group">
                  <label htmlFor="leadPool">Lead Pool:</label>
                  <div className="select-wrapper">
                    <select
                      id="leadPool"
                      name="leadPool"
                      value={filterLeadPool}
                      onChange={handleFilterChange}
                    >
                      <option value="all">All Lead Pools</option>
                      {leadPools.map((pool) => (
                        <option key={pool.id} value={pool.id}>
                          {pool.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="assignment-actions">
              <div className="agent-selector">
                <label htmlFor="agent">Select Agent:</label>
                <div className="select-wrapper">
                  <select
                    id="agent"
                    name="agent"
                    value={selectedAgent}
                    onChange={handleAgentChange}
                  >
                    <option value="">Choose an agent</option>
                    {Array.isArray(agents) && agents.map((agent) => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                className="button-blue"
                onClick={handleAssign}
                disabled={selectedLeads.length === 0 || !selectedAgent || isAssigning}
              >
                {isAssigning ? (
                  <>
                    <span className="button-spinner"></span>
                    Assigning...
                  </>
                ) : (
                  `Assign ${selectedLeads.length} Lead${selectedLeads.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selectedLeads.length === leads.length && leads.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Lead Pool</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id)}
                        onChange={() => handleLeadSelect(lead.id)}
                      />
                    </td>
                    <td>
                      <div className="lead-name" onClick={() => navigate(`/leads/${lead.id}`)}>
                        {lead.firstName} {lead.lastName}
                      </div>
                    </td>
                    <td>{lead.phone || 'N/A'}</td>
                    <td>{lead.email || 'N/A'}</td>
                    <td>
                      {lead.poolIds && lead.poolIds.length > 0
                        ? lead.poolIds.join(', ')
                        : 'None'}
                    </td>
                    <td>
                      <span className={`status-badge ${lead.status?.toLowerCase() || 'unknown'}`}>
                        {lead.status || 'Unknown'}
                      </span>
                    </td>
                    <td>{lead.agent?.name || 'Unassigned'}</td>
                  </tr>
                ))}

                {leads.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      <p>No leads found matching your criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                <i className="first-page-icon"></i>
              </button>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="prev-page-icon"></i>
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  // Show first page, last page, current page, and pages around current page
                  return (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  );
                })
                .map((page, index, array) => {
                  // Add ellipsis if there's a gap
                  if (index > 0 && array[index - 1] !== page - 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <span className="pagination-ellipsis">...</span>
                        <button
                          className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <button
                      key={page}
                      className={`pagination-button ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                })}
              
              <button
                className="pagination-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <i className="next-page-icon"></i>
              </button>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                <i className="last-page-icon"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadAssignments; 