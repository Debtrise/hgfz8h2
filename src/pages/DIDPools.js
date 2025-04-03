import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./ListPages.css"; // Using the updated CSS file

const DIDPools = () => {
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
    ingroups: "all",
  });

  // Sample DID pools data
  const [didPools, setDIDPools] = useState([
    {
      id: 1,
      title: "Main Sales DIDs",
      description: "Primary phone numbers for outbound sales campaigns",
      brand: "BDS",
      source: "Outbound Sales",
      ingroups: "Sales, Support",
      tags: ["Sales", "Primary", "Outbound"],
      active: true,
      lastModified: "2025-01-22",
      stats: {
        totalDIDs: 24,
        activeDIDs: 24,
        callsToday: 435,
        answerRate: 21.7
      }
    },
    {
      id: 2,
      title: "Support Lines",
      description: "Phone numbers for customer support callbacks",
      brand: "BDS",
      source: "Support",
      ingroups: "Support, Retention",
      tags: ["Support", "Callbacks"],
      active: true,
      lastModified: "2025-01-18",
      stats: {
        totalDIDs: 18,
        activeDIDs: 15,
        callsToday: 312,
        answerRate: 26.3
      }
    },
    {
      id: 3,
      title: "Lendvia Marketing",
      description: "Phone numbers for Lendvia marketing campaigns",
      brand: "Lendvia",
      source: "Marketing",
      ingroups: "Marketing, Sales",
      tags: ["Marketing", "Lendvia"],
      active: false,
      lastModified: "2025-01-10",
      stats: {
        totalDIDs: 12,
        activeDIDs: 0,
        callsToday: 0,
        answerRate: 19.8
      }
    },
    {
      id: 4,
      title: "SMS Campaign DIDs",
      description: "Phone numbers for SMS marketing and follow-ups",
      brand: "BDS",
      source: "SMS Campaigns",
      ingroups: "Marketing",
      tags: ["SMS", "Marketing"],
      active: true,
      lastModified: "2025-01-14",
      stats: {
        totalDIDs: 8,
        activeDIDs: 8,
        callsToday: 128,
        answerRate: 18.4
      }
    },
    {
      id: 5,
      title: "Regional Presence DIDs",
      description: "Local area codes for regional outreach campaigns",
      brand: "Lendvia",
      source: "Regional Marketing",
      ingroups: "Sales, Marketing",
      tags: ["Regional", "Local"],
      active: true,
      lastModified: "2025-01-16",
      stats: {
        totalDIDs: 32,
        activeDIDs: 28,
        callsToday: 216,
        answerRate: 24.1
      }
    },
  ]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalPools: didPools.length,
      activePools: didPools.filter(pool => pool.active).length,
      totalDIDs: didPools.reduce((sum, pool) => sum + pool.stats.totalDIDs, 0),
      totalActiveDIDs: didPools.reduce((sum, pool) => sum + pool.stats.activeDIDs, 0)
    };
  }, [didPools]);

  // Functions for CRUD operations
  const handleCreateDIDPool = () => {
    navigate("/dids/pools/create");
  };

  const handleEditDIDPool = (id) => {
    navigate(`/dids/pools/edit/${id}`);
  };

  const handleDeleteDIDPool = (id) => {
    setPoolToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!poolToDelete) return;
    
    setIsDeleting(true);
    
    // Simulate API call with a delay
    setTimeout(() => {
      setDIDPools(didPools.filter(pool => pool.id !== poolToDelete));
      setIsDeleting(false);
      setShowDeleteModal(false);
      setPoolToDelete(null);
    }, 1000);
  };

  const handleToggleActive = (id) => {
    setDIDPools(
      didPools.map((pool) =>
        pool.id === id ? { ...pool, active: !pool.active } : pool
      )
    );
  };

  const handleViewDIDPool = (id) => {
    navigate(`/dids/pools/${id}`);
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
    let result = [...didPools];
    
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
    
    if (filters.ingroups !== "all") {
      result = result.filter(pool => pool.ingroups.includes(filters.ingroups));
    }
    
    return result;
  }, [didPools, searchTerm, filters]);

  // Pagination
  const poolsPerPage = 10;
  const indexOfLastPool = currentPage * poolsPerPage;
  const indexOfFirstPool = indexOfLastPool - poolsPerPage;
  const currentPools = filteredPools.slice(indexOfFirstPool, indexOfLastPool);
  const totalPages = Math.ceil(filteredPools.length / poolsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Filter options
  const getBrandOptions = () => {
    return ["all", ...new Set(didPools.map((pool) => pool.brand))];
  };

  const getSourceOptions = () => {
    const sources = new Set();
    didPools.forEach((pool) => {
      pool.source.split(", ").forEach((source) => {
        sources.add(source);
      });
    });
    return ["all", ...sources];
  };

  const getIngroupOptions = () => {
    const ingroups = new Set();
    didPools.forEach((pool) => {
      pool.ingroups.split(", ").forEach((ingroup) => {
        ingroups.add(ingroup);
      });
    });
    return ["all", ...ingroups];
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">DID Pools</h1>
          <div className="header-actions">
            <div className="search-container">
              <input
                type="text"
                className="search-input"
                placeholder="Search DID pools..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button className="button-blue" onClick={handleCreateDIDPool}>
              Create DID Pool
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
              <div className="stat-title">Total DIDs</div>
              <div className="stat-value">{stats.totalDIDs}</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Active DIDs</div>
              <div className="stat-value">{stats.totalActiveDIDs}</div>
              <div className="stat-subtitle">{(stats.totalActiveDIDs / stats.totalDIDs * 100).toFixed(1)}% of total</div>
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
              <label>Ingroups:</label>
              <div className="select-wrapper">
                <select
                  name="ingroups"
                  value={filters.ingroups}
                  onChange={handleFilterChange}
                >
                  {getIngroupOptions().map((option) => (
                    <option key={option} value={option}>
                      {option === "all" ? "All Ingroups" : option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* DID Pools List */}
          <div className="items-list">
            {currentPools.length > 0 ? (
              currentPools.map((pool) => (
                <div key={pool.id} className="list-item">
                  <div className="item-info" onClick={() => handleViewDIDPool(pool.id)}>
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
                        onClick={() => handleEditDIDPool(pool.id)}
                        title="Edit pool"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                        </svg>
                      </button>
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDeleteDIDPool(pool.id)}
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
                <p>No DID pools found matching your criteria</p>
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
              <p>Are you sure you want to delete this DID pool?</p>
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

export default DIDPools;
