import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './DIDPoolDetails.css';
import LoadingIcon from '../components/LoadingIcon';

// Pool Metrics Component
const PoolMetrics = ({ metrics }) => (
  <div className="metrics-section">
    <h2>Pool Metrics</h2>
    <div className="metrics-grid">
      <MetricCard value={metrics.total_dids || 0} label="Total DIDs" />
      <MetricCard value={metrics.call_count} label="Total Calls" />
      <MetricCard value={metrics.answered_calls} label="Answered Calls" />
      <MetricCard value={metrics.missed_calls} label="Missed Calls" />
      <MetricCard 
        value={`${Math.floor(metrics.total_duration / 60)}m ${metrics.total_duration % 60}s`} 
        label="Total Duration" 
      />
    </div>
  </div>
);

// Metric Card Component
const MetricCard = ({ value, label }) => (
  <div className="metric-card">
    <div className="metric-value">{value}</div>
    <div className="metric-label">{label}</div>
  </div>
);

// Pool Details Component
const PoolDetails = ({ pool }) => (
  <div className="details-section">
    <h2>Pool Details</h2>
    <div className="details-grid">
      <DetailItem label="Description" value={pool.description} defaultValue="No description provided" />
      <DetailItem label="Region" value={pool.region} />
      <DetailItem label="Timezone" value={pool.timezone} />
      <DetailItem 
        label="Status" 
        value={pool.status} 
        render={(value) => (
          <span className={`status-badge ${value || 'inactive'}`}>
            {(value || 'inactive').charAt(0).toUpperCase() + (value || 'inactive').slice(1)}
          </span>
        )}
      />
      <DetailItem label="Total DIDs" value={pool.total_dids} />
      <DetailItem 
        label="Created" 
        value={pool.createdAt} 
        render={(value) => value ? new Date(value).toLocaleString() : 'N/A'}
      />
      <DetailItem 
        label="Last Updated" 
        value={pool.updatedAt} 
        render={(value) => value ? new Date(value).toLocaleString() : 'N/A'}
      />
    </div>
  </div>
);

// Detail Item Component
const DetailItem = ({ label, value, defaultValue = 'N/A', render }) => (
  <div className="detail-item">
    <label>{label}</label>
    <p>{render ? render(value) : (value || defaultValue)}</p>
  </div>
);

// DID List Component
const DIDList = ({ dids, onEdit, onDelete, isLoading }) => {
  if (isLoading) {
    return <div className="loading">Loading DIDs...</div>;
  }

  if (!dids?.length) {
    return <div className="empty-state">No DIDs found in this pool</div>;
  }

  // Debug log to see the actual data structure
  console.log('DIDs in list:', dids);

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Phone Number</th>
            <th>Status</th>
            <th>Provider</th>
            <th>Region</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dids.map(did => (
            <DIDListItem 
              key={did._id || did.id} 
              did={did} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

// DID List Item Component
const DIDListItem = ({ did, onEdit, onDelete }) => {
  // Log the DID object to see its structure
  console.log('DID object:', did);
  
  // Extract the phone number from the did field
  const phoneNumber = did.did || did.phone_number || did.phoneNumber || did.number || 'N/A';
  
  return (
    <tr className="did-row">
      <td>{phoneNumber}</td>
      <td>
        <span className={`status-badge ${did.status?.toLowerCase() || 'inactive'}`}>
          {did.status || 'Inactive'}
        </span>
      </td>
      <td>{did.provider || 'N/A'}</td>
      <td>{did.region || 'N/A'}</td>
      <td>
        <div className="action-buttons">
          <button 
            className="btn btn-icon"
            onClick={() => onEdit(did._id)}
            title="Edit DID"
          >
            <i className="fas fa-edit" />
          </button>
          <button 
            className="btn btn-icon danger"
            onClick={() => onDelete(did._id)}
            title="Delete DID"
          >
            <i className="fas fa-trash" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Add DID Modal Component
const AddDIDModal = ({ show, onClose, onSubmit, formData, onChange }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add DID</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="number">
              Phone Number
              <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="number"
              name="number"
              value={formData.number}
              onChange={onChange}
              required
              placeholder="Enter phone number (e.g., +1234567890)"
            />
            <p className="help-text">Enter the phone number in international format (e.g., +1234567890)</p>
          </div>
          <div className="form-group">
            <label htmlFor="provider">Provider</label>
            <select
              id="provider"
              name="provider"
              value={formData.provider}
              onChange={onChange}
            >
              <option value="default">Default Provider</option>
              <option value="twilio">Twilio</option>
              <option value="bandwidth">Bandwidth</option>
              <option value="plivo">Plivo</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="callerIdName">Caller ID Name</label>
            <input
              type="text"
              id="callerIdName"
              name="callerIdName"
              value={formData.callerIdName}
              onChange={onChange}
              placeholder="Enter caller ID name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={onChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add DID
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Import DIDs Modal Component
const ImportDIDsModal = ({ show, onClose, onSubmit, importData, onChange }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Import DIDs</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="file">
              CSV File
              <span className="required">*</span>
            </label>
            <input
              type="file"
              id="file"
              accept=".csv"
              onChange={(e) => onChange({ ...importData, file: e.target.files[0] })}
              required
            />
            <p className="help-text">
              Upload a CSV file containing DID information. The file should include columns for number, status, and notes.
            </p>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={importData.skipHeader}
                onChange={(e) => onChange({ ...importData, skipHeader: e.target.checked })}
              />
              Skip header row
            </label>
          </div>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={importData.updateExisting}
                onChange={(e) => onChange({ ...importData, updateExisting: e.target.checked })}
              />
              Update existing DIDs
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Import DIDs
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main DIDPoolDetails Component
const DIDPoolDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    didPool: null,
    dids: [],
    isLoading: true,
    error: null,
    showAddModal: false,
    showImportModal: false,
    didsLoading: true,
    formData: {
      number: '',
      provider: 'default',
      callerIdName: '',
      status: 'active',
      monthlyCost: 0,
      notes: ''
    },
    importData: {
      file: null,
      skipHeader: true,
      updateExisting: false
    },
    filters: {
      search: '',
      region: ''
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    },
    sortConfig: {
      field: 'phone_number',
      direction: 'asc'
    },
    callMetrics: {
      call_count: 0,
      answered_calls: 0,
      missed_calls: 0,
      total_duration: 0
    }
  });

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // Data fetching logic
  const fetchData = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });
      
      const [poolResponse, statsResponse, didsResponse] = await Promise.all([
        apiService.didPools.getById(id),
        apiService.didPools.getDidPoolWithStats(id),
        apiService.didPools.getDids(id, {
          page: state.pagination.page,
          limit: state.pagination.limit,
          search: state.filters.search,
          region: state.filters.region,
          sort: `${state.sortConfig.field}:${state.sortConfig.direction}`
        })
      ]);

      console.log('DIDs Response:', didsResponse); // Add logging to inspect the response

      // Process pool data
      if (!poolResponse?.data) {
        throw new Error('Invalid pool response format');
      }

      // Process DIDs data
      let didsArray = [];
      let totalItems = 0;
      let totalPages = 1;

      if (didsResponse?.data) {
        // Handle different response formats
        if (Array.isArray(didsResponse.data)) {
          didsArray = didsResponse.data;
        } else if (Array.isArray(didsResponse.data.dids)) {
          didsArray = didsResponse.data.dids;
        } else if (Array.isArray(didsResponse.data.data)) {
          didsArray = didsResponse.data.data;
        }

        // Map the DID data to ensure consistent field names
        didsArray = didsArray.map(did => ({
          id: did.id,
          number: did.number || did.phoneNumber, // Handle both field names
          status: did.status || 'inactive',
          provider: did.provider || 'N/A',
          region: did.region || 'N/A',
          callerIdName: did.callerIdName || did.caller_id_name || '',
          monthlyCost: did.monthlyCost || did.monthly_cost || 0
        }));

        // Calculate pagination if not provided
        totalItems = didsArray.length;
        totalPages = Math.ceil(totalItems / state.pagination.limit);

        // Use pagination from response if available
        if (didsResponse.data.pagination) {
          totalItems = didsResponse.data.pagination.total || totalItems;
          totalPages = didsResponse.data.pagination.pages || totalPages;
        }
      }

      // Update state with processed data
      updateState({
        didPool: poolResponse.data,
        callMetrics: statsResponse?.data || state.callMetrics,
        dids: didsArray,
        pagination: {
          ...state.pagination,
          total: totalItems,
          pages: totalPages
        },
        isLoading: false,
        didsLoading: false
      });
    } catch (error) {
      console.error('Error fetching DID pool data:', error);
      updateState({
        error: error.message || 'Failed to load DID pool details',
        isLoading: false,
        didsLoading: false
      });
    }
  }, [id, state.pagination.page, state.pagination.limit, state.filters, state.sortConfig]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Event handlers
  const handleAddDid = async (e) => {
    e.preventDefault();
    try {
      updateState({ error: null });
      await apiService.didPools.addDidToPool(id, state.formData);
      updateState({ 
        showAddModal: false,
        formData: {
          number: '',
          provider: 'default',
          callerIdName: '',
          status: 'active',
          monthlyCost: 0,
          notes: ''
        }
      });
      fetchData();
    } catch (error) {
      updateState({ error: error.message || 'Failed to add DID' });
    }
  };

  const handleImportDids = async (e) => {
    e.preventDefault();
    try {
      updateState({ error: null });
      const formData = new FormData();
      formData.append('file', state.importData.file);
      formData.append('skipHeader', state.importData.skipHeader);
      formData.append('updateExisting', state.importData.updateExisting);
      
      await apiService.dids.import(formData);
      updateState({ 
        showImportModal: false,
        importData: {
          file: null,
          skipHeader: true,
          updateExisting: false
        }
      });
      fetchData();
    } catch (error) {
      updateState({ error: error.message || 'Failed to import DIDs' });
    }
  };

  const handleEditDid = useCallback((didId) => {
    console.log('Editing DID:', didId);
    // Add your edit logic here
  }, []);

  const handleDeleteDid = useCallback(async (didId) => {
    if (!didId) {
      console.error('Delete failed: No DID ID provided');
      return;
    }

    if (window.confirm('Are you sure you want to delete this DID?')) {
      try {
        updateState({ error: null });
        console.log('Deleting DID:', didId);
        await apiService.dids.delete(didId);
        fetchData(); // Refresh the list
      } catch (error) {
        console.error('Error deleting DID:', error);
        updateState({ 
          error: error.message || 'Failed to delete DID' 
        });
      }
    }
  }, [fetchData]);

  if (state.isLoading && !state.didPool) {
    return (
      <div className="page-container">
        <LoadingIcon text="Loading DID pool details..." />
      </div>
    );
  }

  if (!state.didPool) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h2>DID Pool Not Found</h2>
          <p>The DID pool you're looking for doesn't exist or has been removed.</p>
          <button className="btn btn-primary" onClick={() => navigate('/did-pools')}>
            Back to DID Pools
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <div className="header-left">
            <button className="back-button" onClick={() => navigate('/did-pools')}>
              <i className="fas fa-arrow-left" />
              Back to DID Pools
            </button>
            <h1 className="page-title">{state.didPool.name}</h1>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => updateState({ showImportModal: true })}
            >
              Import DIDs
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => updateState({ showAddModal: true })}
            >
              Add DID
            </button>
          </div>
        </div>

        {state.error && (
          <div className="alert alert-error">
            {state.error}
            <button 
              className="alert-close" 
              onClick={() => updateState({ error: null })}
            >
              ×
            </button>
          </div>
        )}

        <div className="content-body">
          <PoolDetails pool={state.didPool} />
          <PoolMetrics metrics={state.callMetrics} />

          <div className="dids-section">
            <div className="section-header">
              <h2>DIDs</h2>
              <div className="filters">
                <input
                  type="text"
                  placeholder="Search DIDs..."
                  value={state.filters.search}
                  onChange={(e) => updateState({ 
                    filters: { ...state.filters, search: e.target.value },
                    pagination: { ...state.pagination, page: 1 }
                  })}
                  className="search-input"
                />
                <select
                  value={state.filters.region}
                  onChange={(e) => updateState({ 
                    filters: { ...state.filters, region: e.target.value },
                    pagination: { ...state.pagination, page: 1 }
                  })}
                  className="filter-select"
                >
                  <option value="">All Regions</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
              </div>
            </div>

            <DIDList
              dids={state.dids}
              isLoading={state.didsLoading}
              onEdit={handleEditDid}
              onDelete={handleDeleteDid}
            />

            {state.pagination.total > state.pagination.limit && (
              <div className="pagination">
                <button
                  className="btn btn-icon"
                  onClick={() => updateState({ 
                    pagination: { ...state.pagination, page: state.pagination.page - 1 }
                  })}
                  disabled={state.pagination.page === 1}
                >
                  ‹
                </button>
                <span className="pagination-info">
                  Page {state.pagination.page} of {state.pagination.pages}
                </span>
                <button
                  className="btn btn-icon"
                  onClick={() => updateState({ 
                    pagination: { ...state.pagination, page: state.pagination.page + 1 }
                  })}
                  disabled={state.pagination.page >= state.pagination.pages}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddDIDModal
        show={state.showAddModal}
        onClose={() => updateState({ showAddModal: false })}
        onSubmit={handleAddDid}
        formData={state.formData}
        onChange={(e) => updateState({ 
          formData: { ...state.formData, [e.target.name]: e.target.value }
        })}
      />

      <ImportDIDsModal
        show={state.showImportModal}
        onClose={() => updateState({ showImportModal: false })}
        onSubmit={handleImportDids}
        importData={state.importData}
        onChange={(newData) => updateState({ importData: newData })}
      />
    </div>
  );
};

export default DIDPoolDetails;