import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ListPages.css"; // Using the updated CSS file

const LeadPools = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [poolToDelete, setPoolToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    brand: "all",
    source: "all",
    leadAge: "all",
  });

  // Sample lead pools data
  const [leadPools, setLeadPools] = useState([
    {
      id: 1,
      title: "New Leads - Web",
      description: "All web leads aged 0-15 days from all marketing platforms",
      leadAge: "0-15",
      brand: "BDS",
      source: "Web Forms, Fb, TikTok",
      tags: ["Fresh", "High Intent", "Web"],
      active: true,
      lastModified: "2025-01-24",
      stats: {
        totalLeads: 1245,
        activeDays: 31,
        conversionRate: 8.4
      }
    },
    {
      id: 2,
      title: "Callback Leads",
      description: "Leads that requested callbacks within last 30 days",
      leadAge: "0-30",
      brand: "BDS",
      source: "Callbacks",
      tags: ["Callbacks", "High Priority"],
      active: true,
      lastModified: "2025-01-20",
      stats: {
        totalLeads: 328,
        activeDays: 45,
        conversionRate: 12.7
      }
    },
    {
      id: 3,
      title: "Aged Email Leads",
      description: "Email leads older than 30 days for remarketing",
      leadAge: "30+",
      brand: "Lendvia",
      source: "Email Campaigns",
      tags: ["Remarketing", "Aged", "Email"],
      active: false,
      lastModified: "2025-01-15",
      stats: {
        totalLeads: 2817,
        activeDays: 90,
        conversionRate: 3.2
      }
    },
    {
      id: 4,
      title: "BDS High Intent",
      description: "High intent leads from all sources for priority dialing",
      leadAge: "0-7",
      brand: "BDS",
      source: "All",
      tags: ["High Intent", "Priority"],
      active: true,
      lastModified: "2025-01-22",
      stats: {
        totalLeads: 517,
        activeDays: 14,
        conversionRate: 15.3
      }
    },
    {
      id: 5,
      title: "SMS Re-engagement",
      description: "Leads for SMS re-engagement campaign with prior consent",
      leadAge: "15-45",
      brand: "Lendvia",
      source: "SMS Campaigns",
      tags: ["SMS", "Re-engagement"],
      active: true,
      lastModified: "2025-01-18",
      stats: {
        totalLeads: 956,
        activeDays: 30,
        conversionRate: 5.8
      }
    },
  ]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalPools: leadPools.length,
      activePools: leadPools.filter(pool => pool.active).length,
      totalLeads: leadPools.reduce((sum, pool) => sum + pool.stats.totalLeads, 0),
      averageConversion: (leadPools.reduce((sum, pool) => sum + pool.stats.conversionRate, 0) / leadPools.length).toFixed(1)
    };
  }, [leadPools]);

  // Functions for CRUD operations
  const handleCreateLeadPool = () => {
    navigate("/leads/pools/create");
  };

  const handleEditLeadPool = (id) => {
    navigate(`/leads/pools/edit/${id}`);
  };

  const handleDeleteLeadPool = (id) => {
    setPoolToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!poolToDelete) return;
    
    setIsDeleting(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      setLeadPools(leadPools.filter(pool => pool.id !== poolToDelete));
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPoolToDelete(null);
    }, 1000);
  };

  const handleToggleActive = (id) => {
    setLeadPools(
      leadPools.map((pool) =>
        pool.id === id ? { ...pool, active: !pool.active } : pool
      )
    );
  };

  const handleViewLeadPool = (id) => {
    navigate(`/leads/pools/${id}`);
  };
  
  // Search and filtering
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
    setCurrentPage(1);
  };

  // Apply filters and search
  const filteredPools = useMemo(() => {
    let result = [...leadPools];
    
    // Apply search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        pool => 
          pool.title.toLowerCase().includes(search) ||
          pool.description.toLowerCase().includes(search) ||
          pool.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }
    
    // Apply filters
    if (filters.brand !== "all") {
      result = result.filter(pool => pool.brand === filters.brand);
    }
    
    if (filters.source !== "all") {
      result = result.filter(pool => pool.source.includes(filters.source));
    }
    
    if (filters.leadAge !== "all") {
      result = result.filter(pool => pool.leadAge === filters.leadAge);
    }
    
    return result;
  }, [leadPools, searchTerm, filters]);

  // Pagination
  const poolsPerPage = 10;
  const indexOfLastPool = currentPage * poolsPerPage;
  const indexOfFirstPool = indexOfLastPool - poolsPerPage;
  const currentPools = filteredPools.slice(indexOfFirstPool, indexOfLastPool);
  const totalPages = Math.ceil(filteredPools.length / poolsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Filter options
  const getBrandOptions = () => {
    return ["all", ...new Set(leadPools.map((pool) => pool.brand))];
  };

  const getSourceOptions = () => {
    const sources = new Set();
    leadPools.forEach((pool) => {
      pool.source.split(", ").forEach((source) => {
        sources.add(source);
      });
    });
    return ["all", ...sources];
  };

  const getLeadAgeOptions = () => {
    return ["all", ...new Set(leadPools.map((pool) => pool.leadAge))];
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">Lead Pools</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search lead pools..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button className="button-blue" onClick={handleCreateLeadPool}>
              Create Lead Pool
            </button>
          </div>
        </div>

        <div className="content-body">
          {/* Stats Summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total Pools</div>
              <div className="stat-value">{stats.totalPools}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active Pools</div>
              <div className="stat-value">{stats.activePools}</div>
              <div className="stat-subtitle">{(stats.activePools / stats.totalPools * 100).toFixed(0)}% of total</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Leads</div>
              <div className="stat-value">{stats.totalLeads.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Avg. Conversion Rate</div>
              <div className="stat-value">{stats.averageConversion}%</div>
            </div>
          </div>

          {/* Filters */}
          <div className="filter-row">
            <div className="filter-group">
              <label>Brand:</label>
              <div className="select-wrapper">
                <select
                  name="brand"
                  value={filters.brand}
                  onChange={handleFilterChange}
                >
                  {getBrandOptions().map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All Brands" : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label>Source:</label>
              <div className="select-wrapper">
                <select
                  name="source"
                  value={filters.source}
                  onChange={handleFilterChange}
                >
                  {getSourceOptions().map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All Sources" : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="filter-group">
              <label>Lead Age:</label>
              <div className="select-wrapper">
                <select
                  name="leadAge"
                  value={filters.leadAge}
                  onChange={handleFilterChange}
                >
                  {getLeadAgeOptions().map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All Ages" : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Lead Pools List */}
          <div className="items-list">
            {currentPools.length > 0 ? (
              currentPools.map((pool) => (
                <div key={pool.id} className="list-item">
                  <div className="item-info" onClick={() => handleViewLeadPool(pool.id)}>
                    <div className="item-name">{pool.title}</div>
                    <div className="item-description">{pool.description}</div>
                    <div className="tags-container">
                      {pool.tags && pool.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div className="item-status">
                    <div className="status-date">
                      Modified: {new Date(pool.lastModified).toLocaleDateString()}
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={pool.active}
                        onChange={() => handleToggleActive(pool.id)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <div className="item-actions">
                      <button
                        className="action-button edit-button"
                        onClick={() => handleEditLeadPool(pool.id)}
                        title="Edit pool"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDeleteLeadPool(pool.id)}
                        title="Delete pool"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
                          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No lead pools found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredPools.length > poolsPerPage && (
            <div className="pagination">
              <button
                className="pagination-button"
                onClick={() => paginate(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
              <button
                className="pagination-button"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => {
                // Show current page, first, last, and pages around current
                if (
                  i === 0 ||
                  i === totalPages - 1 ||
                  (i >= currentPage - 2 && i <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={i}
                      className={`pagination-button ${
                        currentPage === i + 1 ? "active" : ""
                      }`}
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </button>
                  );
                } else if (
                  i === currentPage - 3 ||
                  i === currentPage + 3
                ) {
                  return <span key={i}>...</span>;
                }
                return null;
              })}
              <button
                className="pagination-button"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button
                className="pagination-button"
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Confirm Deletion</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this lead pool?</p>
              <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button
                className="button-outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="button-danger"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="button-spinner"></span>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadPools;
