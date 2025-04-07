import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import "./ListPages.css";

const DIDsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dids, setDIDs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });
  const [sortField, setSortField] = useState("lastUsed");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filters, setFilters] = useState({
    poolId: "all",
    provider: "all",
    status: "all"
  });
  const [error, setError] = useState(null);

  // Fetch DIDs when filters or pagination changes
  useEffect(() => {
    fetchDIDs();
  }, [pagination.page, filters, searchTerm]);

  const fetchDIDs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm || undefined,
        poolId: filters.poolId !== "all" ? filters.poolId : undefined,
        provider: filters.provider !== "all" ? filters.provider : undefined,
        status: filters.status !== "all" ? filters.status : undefined
      };

      const response = await apiService.dids.getAll(params);
      setDIDs(response.data);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Error fetching DIDs:', err);
      setError('Failed to load DIDs. Please try again later.');
      setDIDs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      page
    }));
    // Scroll to top of the list
    window.scrollTo({
      top: document.querySelector('.content-body').offsetTop - 20,
      behavior: 'smooth'
    });
  };

  // Handle status toggle
  const handleToggleStatus = async (e, didId, currentStatus) => {
    e.stopPropagation();
    try {
      await apiService.dids.update(didId, {
        status: currentStatus === "active" ? "inactive" : "active"
      });
      fetchDIDs(); // Refresh the list
    } catch (err) {
      console.error('Error updating DID status:', err);
      setError('Failed to update DID status. Please try again.');
    }
  };

  // Navigate to DID details
  const viewDIDDetails = (didId) => {
    if (didId) {
      navigate(`/dids/${didId}`);
    }
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">DID Management</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search DIDs..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button
              className="button-primary"
              onClick={() => navigate('/dids/import')}
            >
              Import DIDs
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button className="dismiss-button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="content-body">
          {/* Filters */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Pool:</label>
              <select
                name="poolId"
                value={filters.poolId}
                onChange={handleFilterChange}
              >
                <option value="all">All Pools</option>
                {/* Add pool options dynamically */}
              </select>
            </div>
            <div className="filter-group">
              <label>Provider:</label>
              <select
                name="provider"
                value={filters.provider}
                onChange={handleFilterChange}
              >
                <option value="all">All Providers</option>
                <option value="Twilio">Twilio</option>
                <option value="Bandwidth">Bandwidth</option>
                <option value="Vonage">Vonage</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Phone Number</th>
                  <th>Pool</th>
                  <th>Provider</th>
                  <th>Caller ID Name</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th>Monthly Cost</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="9" className="loading-state">
                      Loading DIDs...
                    </td>
                  </tr>
                ) : dids.length > 0 ? (
                  dids.map((did) => (
                    <tr key={did.id} onClick={() => viewDIDDetails(did.id)}>
                      <td>{did.phone_number}</td>
                      <td>{did.pool_name}</td>
                      <td>{did.provider}</td>
                      <td>{did.caller_id_name}</td>
                      <td>{did.region}</td>
                      <td>
                        <div className="toggle-container" onClick={(e) => e.stopPropagation()}>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={did.status === "active"}
                              onChange={(e) => handleToggleStatus(e, did.id, did.status)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <span className="toggle-status">{did.status}</span>
                        </div>
                      </td>
                      <td>${did.monthly_cost}</td>
                      <td>{new Date(did.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-button view-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              viewDIDDetails(did.id);
                            }}
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-state">
                      No DIDs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
              >
                First
              </button>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
              {[...Array(pagination.pages)].map((_, i) => {
                // Show current page, first, last, and pages around current
                if (
                  i === 0 ||
                  i === pagination.pages - 1 ||
                  (i >= pagination.page - 2 && i <= pagination.page + 2)
                ) {
                  return (
                    <button
                      key={i}
                      className={`pagination-button ${pagination.page === i + 1 ? "active" : ""}`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (
                  i === pagination.page - 3 ||
                  i === pagination.page + 3
                ) {
                  return <span key={i}>...</span>;
                }
                return null;
              })}
              <button
                className="pagination-button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
              <button
                className="pagination-button"
                onClick={() => handlePageChange(pagination.pages)}
                disabled={pagination.page === pagination.pages}
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

export default DIDsList;
