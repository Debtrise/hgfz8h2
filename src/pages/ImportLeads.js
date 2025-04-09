import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import "./ImportLeads.css";
import LoadingIcon from '../components/LoadingIcon';

const ImportLeads = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [importOptions, setImportOptions] = useState({
    skipHeader: true,
    updateExisting: false,
    defaultBrand: '',
    defaultSource: '',
    defaultLeadAge: 0
  });
  const [defaultPoolId, setDefaultPoolId] = useState('');
  const [leadPools, setLeadPools] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sources, setSources] = useState([]);
  const [availableFields, setAvailableFields] = useState([
    'phone',
    'firstName',
    'lastName',
    'email',
    'brand',
    'source',
    'leadAge'
  ]);

  useEffect(() => {
    fetchLeadPools();
    fetchBrandsAndSources();
  }, []);

  const fetchLeadPools = async () => {
    try {
      const response = await apiService.leadPools.getAll();
      setLeadPools(response.data || []);
    } catch (err) {
      console.error('Error fetching lead pools:', err);
      setError('Failed to load lead pools. Please try again later.');
    }
  };

  const fetchBrandsAndSources = async () => {
    try {
      const [brandsResponse, sourcesResponse] = await Promise.all([
        apiService.brands.getAll(),
        apiService.sources.getAll()
      ]);
      setBrands(brandsResponse.data || []);
      setSources(sourcesResponse.data || []);
    } catch (err) {
      console.error('Error fetching brands and sources:', err);
      setError('Failed to load brands and sources. Please try again later.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Preview file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setFilePreview(content);
        // Auto-detect field mapping based on headers
        detectFieldMapping(content);
      };
      reader.readAsText(selectedFile);
    }
  };

  const detectFieldMapping = (content) => {
    const lines = content.split('\n');
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim());
      const mapping = {};
      headers.forEach(header => {
        const normalizedHeader = header.toLowerCase().replace(/\s+/g, '');
        const matchingField = availableFields.find(field => 
          normalizedHeader.includes(field.toLowerCase())
        );
        if (matchingField) {
          mapping[matchingField] = header;
        }
      });
      setFieldMapping(mapping);
    }
  };

  const handleFieldMappingChange = (field, value) => {
    setFieldMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImportOptionsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setImportOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fieldMapping', JSON.stringify(fieldMapping));
      formData.append('options', JSON.stringify(importOptions));
      formData.append('defaultPoolId', defaultPoolId);

      const response = await apiService.leads.importFromFile(formData);
      setSuccess(response);
    } catch (err) {
      console.error('Error importing leads:', err);
      setError(err.message || 'Failed to import leads. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoadingIcon text="Importing leads..." isLoading={isLoading}>
      <div className="import-leads-container">
        <div className="page-container">
          <div className="content-container">
            <div className="content-header">
              <h1 className="page-title">Import Leads</h1>
              <div className="header-actions">
                <button 
                  className="button-secondary"
                  onClick={() => navigate('/leads')}
                >
                  Back to Leads
                </button>
              </div>
            </div>

            <div className="content-body">
              {error && (
                <div className="error-message">
                  {error}
                  <button className="dismiss-button" onClick={() => setError(null)}>×</button>
                </div>
              )}

              {success ? (
                <div className="import-success">
                  <h3>Import Successful!</h3>
                  <p>Successfully imported {success.imported || 0} leads.</p>
                  {success.skipped > 0 && (
                    <p>Skipped {success.skipped} leads due to duplicates or invalid data.</p>
                  )}
                  {success.importedLeads && success.importedLeads.length > 0 && (
                    <>
                      <h4>Imported Leads</h4>
                      <div className="imported-leads">
                        <ul>
                          {success.importedLeads.map((lead, index) => (
                            <li key={index}>
                              {lead.firstName} {lead.lastName} ({lead.phone})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  {success.skippedLeads && success.skippedLeads.length > 0 && (
                    <>
                      <h4>Skipped Leads</h4>
                      <div className="skipped-leads">
                        <ul>
                          {success.skippedLeads.map((lead, index) => (
                            <li key={index}>
                              {lead.firstName} {lead.lastName} ({lead.phone})
                              <span className="skip-reason">- {lead.reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  <div className="form-actions">
                    <button 
                      className="button-primary"
                      onClick={() => navigate('/leads')}
                    >
                      View All Leads
                    </button>
                    <button 
                      className="button-secondary"
                      onClick={() => {
                        setSuccess(null);
                        setFile(null);
                        setFilePreview(null);
                        setFieldMapping({});
                      }}
                    >
                      Import More
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-section">
                    <h2>Upload File</h2>
                    <div className="file-input-container">
                      <input
                        type="file"
                        className="file-input"
                        id="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file" className="button-primary">
                        Choose File
                      </label>
                      <p className="file-help">
                        Supported formats: CSV, Excel (XLSX, XLS)
                        <br />
                        Maximum file size: 50MB
                      </p>
                    </div>
                    {filePreview && (
                      <div className="file-preview">
                        <pre>{filePreview}</pre>
                      </div>
                    )}
                  </div>

                  <div className="form-section">
                    <h2>Field Mapping</h2>
                    <div className="mapping-container">
                      {availableFields.map(field => (
                        <div key={field} className="mapping-row">
                          <div className="mapping-field">{field}</div>
                          <select
                            className="mapping-select"
                            value={fieldMapping[field] || ''}
                            onChange={(e) => handleFieldMappingChange(field, e.target.value)}
                          >
                            <option value="">Select field</option>
                            {filePreview && filePreview.split('\n')[0].split(',').map(header => (
                              <option key={header} value={header.trim()}>
                                {header.trim()}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="form-section">
                    <h2>Import Options</h2>
                    <div className="options-container">
                      <div className="option-row">
                        <label>
                          <input
                            type="checkbox"
                            name="skipHeader"
                            checked={importOptions.skipHeader}
                            onChange={handleImportOptionsChange}
                          />
                          Skip header row
                        </label>
                      </div>
                      <div className="option-row">
                        <label>
                          <input
                            type="checkbox"
                            name="updateExisting"
                            checked={importOptions.updateExisting}
                            onChange={handleImportOptionsChange}
                          />
                          Update existing leads
                        </label>
                      </div>
                      <div className="option-row">
                        <label>Default Brand:</label>
                        <select
                          className="default-select"
                          name="defaultBrand"
                          value={importOptions.defaultBrand}
                          onChange={handleImportOptionsChange}
                        >
                          <option value="">Select brand</option>
                          {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="option-row">
                        <label>Default Source:</label>
                        <select
                          className="default-select"
                          name="defaultSource"
                          value={importOptions.defaultSource}
                          onChange={handleImportOptionsChange}
                        >
                          <option value="">Select source</option>
                          {sources.map(source => (
                            <option key={source.id} value={source.id}>
                              {source.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="option-row">
                        <label>Default Lead Age (days):</label>
                        <input
                          type="number"
                          className="default-input"
                          name="defaultLeadAge"
                          value={importOptions.defaultLeadAge}
                          onChange={handleImportOptionsChange}
                          min="0"
                        />
                      </div>
                      <div className="option-row">
                        <label>Default Lead Pool:</label>
                        <select
                          className="lead-pool-select"
                          value={defaultPoolId}
                          onChange={(e) => setDefaultPoolId(e.target.value)}
                        >
                          <option value="">Select lead pool</option>
                          {leadPools.map(pool => (
                            <option key={pool.id} value={pool.id}>
                              {pool.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="submit-button"
                      disabled={isLoading || !file}
                    >
                      Import Leads
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </LoadingIcon>
  );
};

export default ImportLeads; 