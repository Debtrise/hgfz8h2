import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import LoadingSpinner from "../components/LoadingSpinner";
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
    status: "all",
    region: "all"
  });
  const [error, setError] = useState(null);
  const [didPools, setDidPools] = useState([]);

  // Fetch DIDs when filters or pagination changes
  useEffect(() => {
    fetchDIDs();
  }, [pagination.page, filters, searchTerm, sortField, sortDirection]);

  // Fetch DID pools for the filter dropdown
  useEffect(() => {
    fetchDidPools();
  }, []);

  const fetchDidPools = async () => {
    try {
      const response = await apiService.didPools.getAll();
      setDidPools(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching DID pools:', err);
    }
  };

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
        status: filters.status !== "all" ? filters.status : undefined,
        region: filters.region !== "all" ? filters.region : undefined,
        sortBy: sortField,
        sortOrder: sortDirection
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

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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
          <h1 className="page-title">All DIDs</h1>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button className="dismiss-button" onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="filter-row">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search DIDs..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <button 
              className="search-button"
              onClick={() => {
                setPagination(prev => ({ ...prev, page: 1 }));
                fetchDIDs();
              }}
            >
              <i className="fas fa-search"></i>
            </button>
          </div>
          <div className="filter-group">
            <label>Pool:</label>
            <div className="select-wrapper">
              <select
                name="poolId"
                value={filters.poolId}
                onChange={handleFilterChange}
              >
                <option value="all">All Pools</option>
                {didPools.map(pool => (
                  <option key={pool.id} value={pool.id}>{pool.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="filter-group">
            <label>Provider:</label>
            <div className="select-wrapper">
              <select
                name="provider"
                value={filters.provider}
                onChange={handleFilterChange}
              >
                <option value="all">All Providers</option>
                <option value="Twilio">Twilio</option>
                <option value="Bandwidth">Bandwidth</option>
                <option value="Vonage">Vonage</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <div className="select-wrapper">
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
          <div className="filter-group">
            <label>Region:</label>
            <div className="select-wrapper">
              <select
                name="region"
                value={filters.region}
                onChange={handleFilterChange}
              >
                <option value="all">All Regions</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
              </select>
            </div>
          </div>
        </div>

        <div className="content-body">
          {isLoading ? (
            <div className="loading-state">
              <LoadingSpinner size="medium" text="Loading DIDs..." />
            </div>
          ) : dids.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSortChange('phoneNumber')} className="sortable">
                      Phone Number
                      {sortField === 'phoneNumber' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('pool')} className="sortable">
                      Pool
                      {sortField === 'pool' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('provider')} className="sortable">
                      Provider
                      {sortField === 'provider' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('callerIdName')} className="sortable">
                      Caller ID Name
                      {sortField === 'callerIdName' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('region')} className="sortable">
                      Region
                      {sortField === 'region' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('status')} className="sortable">
                      Status
                      {sortField === 'status' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('monthlyCost')} className="sortable">
                      Monthly Cost
                      {sortField === 'monthlyCost' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th onClick={() => handleSortChange('createdAt')} className="sortable">
                      Created At
                      {sortField === 'createdAt' && (
                        <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>
                      )}
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dids.map(did => (
                    <tr key={did.id} onClick={() => viewDIDDetails(did.id)}>
                      <td>{did.phoneNumber}</td>
                      <td>{did.pool?.name || 'N/A'}</td>
                      <td>{did.provider}</td>
                      <td>{did.callerIdName}</td>
                      <td>{did.region}</td>
                      <td>
                        <span 
                          className={`status-badge ${did.status.toLowerCase()}`}
                          onClick={(e) => handleToggleStatus(e, did.id, did.status)}
                        >
                          {did.status}
                        </span>
                      </td>
                      <td>${did.monthlyCost?.toFixed(2) || '0.00'}</td>
                      <td>{new Date(did.createdAt).toLocaleString()}</td>
                      <td className="action-buttons">
                        <button 
                          className="action-button edit-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dids/${did.id}/edit`);
                          }}
                          title="Edit DID"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="action-button delete-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(e, did.id, did.status);
                          }}
                          title="Toggle Status"
                        >
                          <i className={`fas fa-${did.status === 'active' ? 'ban' : 'check'}`}></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No DIDs found. Add DIDs to a pool to get started.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(1)}
                disabled={pagination.page === 1}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <i className="fas fa-angle-left"></i>
              </button>
              <span className="pagination-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button 
                className="pagination-button"
                onClick={() => handlePageChange(pagination.pages)}
                disabled={pagination.page === pagination.pages}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DIDsList;
