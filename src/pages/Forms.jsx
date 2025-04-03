import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Campaigns.css"; // Reusing the same CSS file

const Forms = () => {
  const navigate = useNavigate();

  // Sample forms data with metrics
  const [forms, setForms] = useState([
    {
      id: 1,
      name: "Lead Generation Form",
      description: "Multi-step form for collecting lead information",
      active: true,
      createdDate: "3/18/24",
      pages: 3,
      fields: 12,
      type: "leads",
      metrics: {
        submissions: 2547,
        conversions: 183,
        conversionRate: 7.2,
        avgCompletionTime: "2.5 min"
      }
    },
    {
      id: 2,
      name: "Client Onboarding",
      description: "Comprehensive client information collection",
      active: true,
      createdDate: "3/15/24",
      pages: 4,
      fields: 18,
      type: "clients",
      metrics: {
        submissions: 1865,
        conversions: 98,
        conversionRate: 5.3,
        avgCompletionTime: "4.2 min"
      }
    },
    {
      id: 3,
      name: "Product Feedback",
      description: "Customer feedback and satisfaction survey",
      active: false,
      createdDate: "3/10/24",
      pages: 2,
      fields: 8,
      type: "feedback",
      metrics: {
        submissions: 3210,
        conversions: 142,
        conversionRate: 4.4,
        avgCompletionTime: "1.8 min"
      }
    },
  ]);

  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("name_asc");
  const [togglingId, setTogglingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formToDelete, setFormToDelete] = useState(null);

  // Simulate loading on first render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle navigation to form builder
  const handleCreateForm = () => {
    navigate("/forms/new");
  };

  // Handle edit form
  const handleEditForm = (id) => {
    navigate(`/forms/${id}/edit`);
  };

  // Handle form deletion
  const handleDeleteForm = (id) => {
    setFormToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirm form deletion
  const confirmDelete = () => {
    setForms(forms.filter(form => form.id !== formToDelete));
    setShowDeleteModal(false);
    setFormToDelete(null);
  };

  // Handle toggle form active status
  const handleToggleActive = (id) => {
    setTogglingId(id);
    
    setTimeout(() => {
      setForms(
        forms.map((form) =>
          form.id === id
            ? { ...form, active: !form.active }
            : form
        )
      );
      setTogglingId(null);
    }, 500);
  };

  // Handle viewing form details
  const handleViewForm = (id) => {
    navigate(`/forms/${id}/detail`);
  };
  
  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };
  
  // Filter & sort forms with useMemo
  const filteredForms = useMemo(() => {
    let result = forms.filter(form => {
      const matchesSearch = searchTerm === "" || 
        form.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        form.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === "all" || form.type === typeFilter;
      
      return matchesSearch && matchesType;
    });
    
    return result.sort((a, b) => {
      switch (sortOption) {
        case "name_asc":
          return a.name.localeCompare(b.name);
        case "name_desc":
          return b.name.localeCompare(a.name);
        case "date_asc":
          return new Date(a.createdDate) - new Date(b.createdDate);
        case "date_desc":
          return new Date(b.createdDate) - new Date(a.createdDate);
        case "conversion_rate":
          return b.metrics.conversionRate - a.metrics.conversionRate;
        default:
          return 0;
      }
    });
  }, [forms, searchTerm, typeFilter, sortOption]);
  
  // Get current forms for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentForms = filteredForms.slice(indexOfFirstItem, indexOfLastItem);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="page-container">
        <div className="content-container">
          <div className="content-header">
            <h1 className="page-title">Forms</h1>
            <div className="skeleton skeleton-button"></div>
          </div>
          <div className="content-body">
            <div className="skeleton skeleton-search"></div>
            <div className="skeleton-filters">
              <div className="skeleton skeleton-filter"></div>
              <div className="skeleton skeleton-filter"></div>
            </div>
            {[1, 2, 3].map((item) => (
              <div key={item} className="skeleton skeleton-campaign-item"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <h1 className="page-title">Forms</h1>
          <button className="update-button" onClick={handleCreateForm}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Form
          </button>
        </div>

        <div className="content-body">
          {/* Search and filters section */}
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search forms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="type">Type:</label>
              <div className="select-wrapper">
                <select 
                  id="type" 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="leads">Leads</option>
                  <option value="clients">Clients</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="sort">Sort By:</label>
              <div className="select-wrapper">
                <select 
                  id="sort" 
                  value={sortOption}
                  onChange={handleSortChange}
                >
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="date_asc">Date (Oldest)</option>
                  <option value="date_desc">Date (Newest)</option>
                  <option value="conversion_rate">Conversion Rate</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Form metrics summary */}
          <div className="stats-summary">
            <div className="stat-card">
              <div className="stat-title">Total Forms</div>
              <div className="stat-value">{forms.length}</div>
              <div className="stat-subtitle">{forms.filter(f => f.active).length} active</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Total Submissions</div>
              <div className="stat-value">
                {forms.reduce((sum, form) => sum + form.metrics.submissions, 0).toLocaleString()}
              </div>
              <div className="stat-subtitle">Across all forms</div>
            </div>
            <div className="stat-card">
              <div className="stat-title">Average Conversion</div>
              <div className="stat-value">
                {(forms.reduce((sum, form) => sum + form.metrics.conversionRate, 0) / forms.length).toFixed(1)}%
              </div>
              <div className="stat-subtitle">All forms</div>
            </div>
          </div>

          {/* Forms list */}
          <div className="campaigns-list">
            {currentForms.length > 0 ? (
              currentForms.map((form) => (
                <div className="campaign-item" key={form.id}>
                  <div className="campaign-info" onClick={() => handleViewForm(form.id)}>
                    <h2 className="campaign-name">{form.name}</h2>
                    <p className="campaign-description">{form.description}</p>
                    <div className="campaign-tags">
                      <span className="campaign-tag">{form.type}</span>
                      <span className="campaign-tag">{form.pages} pages</span>
                      <span className="campaign-tag">{form.fields} fields</span>
                      <span className="campaign-tag">
                        {form.metrics.conversionRate}% conv.
                      </span>
                    </div>
                  </div>
                  <div className="campaign-status">
                    <div className="status-date">
                      {form.active ? 'Active since' : 'Inactive since'}: {form.createdDate}
                    </div>
                    <label className="toggle-switch" title={form.active ? "Deactivate form" : "Activate form"}>
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={() => handleToggleActive(form.id)}
                        disabled={togglingId === form.id}
                      />
                      <span className={`toggle-slider ${togglingId === form.id ? 'toggling' : ''}`}></span>
                    </label>
                    <div className="campaign-actions">
                      <button 
                        className="action-button"
                        onClick={() => handleViewForm(form.id)}
                        title="View form details"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button 
                        className="action-button edit-button"
                        onClick={() => handleEditForm(form.id)}
                        title="Edit form"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="action-button delete-button"
                        onClick={() => handleDeleteForm(form.id)}
                        title="Delete form"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No forms found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredForms.length > itemsPerPage && (
            <div className="pagination">
              <button 
                className="pagination-button"
                onClick={() => paginate(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = index + 1;
                } else if (currentPage <= 3) {
                  pageNum = index + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + index;
                } else {
                  pageNum = currentPage - 2 + index;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => paginate(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="pagination-button"
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Delete Form</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this form? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button className="button-outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="button-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Forms; 