import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import "./ListPages.css";
import LoadingSpinner from "../components/LoadingSpinner";

const ImportLeads = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [availableFields, setAvailableFields] = useState([]);
  const [leadPools, setLeadPools] = useState([]);
  const [selectedLeadPool, setSelectedLeadPool] = useState("");
  const [mapping, setMapping] = useState({});
  const [options, setOptions] = useState({
    skipHeader: true,
    updateExisting: false,
    validateData: true
  });

  // Fetch lead pools on component mount
  useEffect(() => {
    fetchLeadPools();
  }, []);

  const fetchLeadPools = async () => {
    try {
      const response = await apiService.leadPools.getAll();
      setLeadPools(response.data || []);
      
      // Set default selected lead pool if available
      if (response.data && response.data.length > 0) {
        setSelectedLeadPool(response.data[0].id.toString());
      }
    } catch (err) {
      console.error("Error fetching lead pools:", err);
      setError("Failed to load lead pools. Please try again later.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Preview the file
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvContent = event.target.result;
        const lines = csvContent.split('\n').slice(0, 5); // Get first 5 lines for preview
        setFilePreview(lines.join('\n'));
    
        // Extract headers from the first line
        if (lines.length > 0) {
          const headers = lines[0].split(',').map(header => header.trim());
          setAvailableFields(headers);
          
          // Set default mapping
          const defaultMapping = {};
          headers.forEach(header => {
            // Try to match common field names
            const normalizedHeader = header.toLowerCase().replace(/\s+/g, '_');
            if (normalizedHeader.includes('first') || normalizedHeader.includes('fname')) {
              defaultMapping[header] = 'first_name';
            } else if (normalizedHeader.includes('last') || normalizedHeader.includes('lname')) {
              defaultMapping[header] = 'last_name';
            } else if (normalizedHeader.includes('email')) {
              defaultMapping[header] = 'email';
            } else if (normalizedHeader.includes('phone') || normalizedHeader.includes('tel')) {
              defaultMapping[header] = 'phone';
            } else if (normalizedHeader.includes('address') || normalizedHeader.includes('street')) {
              defaultMapping[header] = 'address';
            } else if (normalizedHeader.includes('city')) {
              defaultMapping[header] = 'city';
            } else if (normalizedHeader.includes('state') || normalizedHeader.includes('province')) {
              defaultMapping[header] = 'state';
            } else if (normalizedHeader.includes('zip') || normalizedHeader.includes('postal')) {
              defaultMapping[header] = 'zip_code';
            } else {
              defaultMapping[header] = '';
            }
          });
          setMapping(defaultMapping);
        }
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleMappingChange = (header, field) => {
    setMapping({
      ...mapping,
      [header]: field
    });
  };
  
  const handleOptionChange = (e) => {
    const { name, checked } = e.target;
    setOptions({
      ...options,
      [name]: checked
    });
  };

  const handleLeadPoolChange = (e) => {
    setSelectedLeadPool(e.target.value);
  };

  const handleImport = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select a file to import");
      return;
    }
    
    if (!selectedLeadPool) {
      setError("Please select a lead pool");
      return;
    }
    
    // Check if required fields are mapped
    const requiredFields = ['first_name', 'last_name', 'email', 'phone'];
    const mappedFields = Object.values(mapping);
    const missingRequired = requiredFields.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      setError(`Please map the following required fields: ${missingRequired.join(', ')}`);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mapping', JSON.stringify(mapping));
      formData.append('options', JSON.stringify(options));
      
      await apiService.leadPools.importLeads(selectedLeadPool, formData);
      
      setSuccess("Leads imported successfully!");
      
      // Reset form
      setFile(null);
      setFilePreview(null);
      setAvailableFields([]);
      setMapping({});
      
      // Navigate to the lead pool detail page
      setTimeout(() => {
        navigate(`/lead-pools/${selectedLeadPool}`);
      }, 2000);
    } catch (err) {
      console.error("Error importing leads:", err);
      setError("Failed to import leads. Please check your file format and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/leads");
  };

  return (
    <div className="page-container">
      <div className="content-container">
        <div className="content-header">
          <div className="header-with-back">
            <button className="back-button" onClick={handleCancel}>
              <i className="back-icon"></i>
              <span>Back to Leads</span>
            </button>
            <h1 className="page-title">Import Leads</h1>
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

          <div className="import-form-container">
            <form onSubmit={handleImport}>
              <div className="form-section">
                <h2>Select Lead Pool</h2>
                <div className="form-group">
                  <label htmlFor="leadPool">Lead Pool:</label>
                  <select
                    id="leadPool"
                    value={selectedLeadPool}
                    onChange={handleLeadPoolChange}
                    required
                  >
                    <option value="">Select a Lead Pool</option>
                    {leadPools.map(pool => (
                      <option key={pool.id} value={pool.id}>
                        {pool.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-section">
                <h2>Upload File</h2>
                <div className="form-group">
                  <label htmlFor="file">CSV File:</label>
                  <input
                    type="file"
                    id="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    required
                  />
                  <p className="form-help">Upload a CSV file with lead information</p>
                </div>

                {filePreview && (
                  <div className="file-preview">
                    <h3>File Preview</h3>
                    <pre>{filePreview}</pre>
                  </div>
                )}
              </div>

              {availableFields.length > 0 && (
                <div className="form-section">
                  <h2>Field Mapping</h2>
                  <p className="form-help">Map CSV columns to lead fields</p>
                  <div className="mapping-table">
                    <div className="mapping-header">
                      <div className="mapping-cell">CSV Column</div>
                      <div className="mapping-cell">Lead Field</div>
                    </div>
                    {availableFields.map(field => (
                      <div key={field} className="mapping-row">
                        <div className="mapping-cell">{field}</div>
                        <div className="mapping-cell">
                          <select
                            value={mapping[field] || ''}
                            onChange={(e) => handleMappingChange(field, e.target.value)}
                          >
                            <option value="">-- Select Field --</option>
                            <option value="first_name">First Name</option>
                            <option value="last_name">Last Name</option>
                            <option value="email">Email</option>
                            <option value="phone">Phone</option>
                            <option value="address">Address</option>
                            <option value="city">City</option>
                            <option value="state">State</option>
                            <option value="zip_code">ZIP Code</option>
                            <option value="notes">Notes</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="form-section">
                <h2>Import Options</h2>
                <div className="option-group">
                  <label>
                    <input
                      type="checkbox"
                      name="skipHeader"
                      checked={options.skipHeader}
                      onChange={handleOptionChange}
                    />
                    Skip header row
                  </label>
                </div>
                <div className="option-group">
                  <label>
                    <input
                      type="checkbox"
                      name="updateExisting"
                      checked={options.updateExisting}
                      onChange={handleOptionChange}
                    />
                    Update existing leads
                  </label>
                </div>
                <div className="option-group">
                  <label>
                    <input
                      type="checkbox"
                      name="validateData"
                      checked={options.validateData}
                      onChange={handleOptionChange}
                    />
                    Validate data before import
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="button-outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button-blue"
                  disabled={isLoading || !file || !selectedLeadPool}
                >
                  {isLoading ? (
                    <>
                      <span className="button-spinner"></span>
                      Importing...
                    </>
                  ) : (
                    "Import Leads"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportLeads; 