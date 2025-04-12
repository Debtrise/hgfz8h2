import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiService from "../services/apiService";
import "./ImportLeads.css";
import LoadingIcon from '../components/LoadingIcon';

// Utility function to get tenant ID
const getTenantId = () => {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  return currentUser.tenantId || 1;
};

const ImportLeads = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileValidationError, setFileValidationError] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [mappedRecordPreview, setMappedRecordPreview] = useState([]);
  const [showSkippedLeads, setShowSkippedLeads] = useState(false);
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
  const [missingFields, setMissingFields] = useState([]);

  useEffect(() => {
    fetchLeadPools();
    fetchBrandsAndSources();
  }, []);

  useEffect(() => {
    // Generate mapped record preview when field mapping changes
    if (filePreview && Object.keys(fieldMapping).length > 0) {
      generateMappedPreview();
    }
    
    // Update missing fields list
    const requiredFields = ['phone', 'firstName', 'lastName'];
    const missingFieldsList = requiredFields.filter(field => !fieldMapping[field]);
    setMissingFields(missingFieldsList);
  }, [fieldMapping, filePreview]);

  const fetchLeadPools = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.leadPools.getAll();
      setLeadPools(response.data || []);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching lead pools:', err);
      setError('Failed to load lead pools. Please try again later.');
      setIsLoading(false);
    }
  };

  const fetchBrandsAndSources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch brands and sources in parallel
      console.log('Fetching brands and sources...');
      const [brandsResponse, sourcesResponse] = await Promise.all([
        apiService.brands.getAll(),
        apiService.sources.getAll()
      ]);
      
      console.log('Raw brands response:', brandsResponse);
      console.log('Raw sources response:', sourcesResponse);
      
      // Process brands data
      if (brandsResponse && brandsResponse.data) {
        // Ensure we have a properly formatted array
        const formattedBrands = Array.isArray(brandsResponse.data) 
          ? brandsResponse.data 
          : [];
        
        console.log('Formatted brands before sorting:', formattedBrands);
        
        // Sort brands alphabetically by name
        const sortedBrands = [...formattedBrands].sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
        
        console.log('Sorted brands:', sortedBrands);
        setBrands(sortedBrands);
      } else {
        console.warn('Unexpected brands response format:', brandsResponse);
        setBrands([]);
      }
      
      // Process sources data
      if (sourcesResponse && sourcesResponse.data) {
        // Ensure we have a properly formatted array
        const formattedSources = Array.isArray(sourcesResponse.data) 
          ? sourcesResponse.data 
          : [];
        
        console.log('Formatted sources before sorting:', formattedSources);
        
        // Sort sources alphabetically by name
        const sortedSources = [...formattedSources].sort((a, b) => 
          (a.name || '').localeCompare(b.name || '')
        );
        
        console.log('Sorted sources:', sortedSources);
        setSources(sortedSources);
      } else {
        console.warn('Unexpected sources response format:', sourcesResponse);
        setSources([]);
      }
    } catch (err) {
      console.error('Error fetching brands and sources:', err);
      setError('Failed to load brands and sources. Please try again later.');
      setBrands([]);
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  };

  const retryFetchBrandsAndSources = async () => {
    setError(null);
    setIsLoading(true);
    await fetchBrandsAndSources();
    setIsLoading(false);
  };

  // Validate file type
  const validateFile = (file) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const allowedExtensions = ['csv', 'xls', 'xlsx'];
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      return 'Invalid file type. Please upload a CSV or Excel file.';
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB
      return 'File is too large. Maximum allowed size is 50MB.';
    }
    
    return null;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileValidationError(null);
    setError(null); // Clear any previous errors
    
    if (!selectedFile) {
      setFile(null);
      setFilePreview(null);
      setFieldMapping({});
      setMappedRecordPreview([]);
      return;
    }
    
    // Validate file
    const error = validateFile(selectedFile);
    if (error) {
      setFileValidationError(error);
      return;
    }
    
    setFile(selectedFile);
    
    // Preview file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      
      // Limit preview to first 10 lines
      const lines = content.split('\n');
      const previewLines = lines.slice(0, 10).join('\n');
      
      setFilePreview(previewLines);
      
      // Auto-detect field mapping based on headers
      if (lines.length > 0) {
        detectFieldMapping(content);
      }
    };
    reader.readAsText(selectedFile);
  };

  const detectFieldMapping = (content) => {
    const lines = content.split('\n');
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim());
      const mapping = {};
      
      // Common header variations for better detection
      const headerMappings = {
        phone: ['phone', 'telephone', 'cell', 'mobile', 'contact number', 'phone number', 'contact', 'tel', 'cell phone', 'mobile number', 'mob', 'ph', 'contact ph'],
        firstName: ['first name', 'firstname', 'given name', 'first', 'name', 'given', 'forename', 'name (first)', 'person first name', 'customer first name'],
        lastName: ['last name', 'lastname', 'surname', 'family name', 'last', 'family', 'name (last)', 'person last name', 'customer last name'],
        email: ['email', 'email address', 'e-mail', 'mail', 'emailaddress', 'contact email', 'customer email', 'user email', 'primary email', 'user mail', 'electronic mail', 'e mail', 'customer mail'],
        brand: ['brand', 'campaign', 'brand name', 'product', 'product brand', 'company brand', 'campaign brand', 'marketing brand'],
        source: ['source', 'lead source', 'origin', 'campaign source', 'marketing source', 'traffic source', 'acquisition source', 'utm source', 'ad source', 'channel'],
        leadAge: ['lead age', 'age', 'days', 'lead age (days)', 'days old', 'created days ago', 'days since creation', 'days in system']
      };
      
      // Try to match headers to fields - first do exact matches, then partial matches
      headers.forEach(header => {
        const headerLower = header.toLowerCase();
        
        // First attempt: exact match
        Object.entries(headerMappings).forEach(([field, variations]) => {
          if (!mapping[field]) {
            // Check for exact match
            if (variations.includes(headerLower)) {
              mapping[field] = header;
            }
          }
        });
        
        // Second attempt: partial match if no exact match was found
        Object.entries(headerMappings).forEach(([field, variations]) => {
          if (!mapping[field]) {
            if (variations.some(v => headerLower.includes(v.toLowerCase()))) {
              mapping[field] = header;
            }
          }
        });
      });

      // Special case: if only a single "name" column exists and no first/last name was mapped
      if (!mapping.firstName && !mapping.lastName) {
        const nameIndex = headers.findIndex(h => h.toLowerCase() === 'name');
        if (nameIndex !== -1) {
          // If we find a single "name" column, let's map it to firstName for now
          mapping.firstName = headers[nameIndex];
          // And generate a note to the user about this
          setError('Note: Found a single "name" column. It has been mapped to First Name. Please check if this is correct.');
        }
      }
      
      // Special case for email detection - look for columns that might contain @ symbol in data
      if (!mapping.email) {
        // Check the data rows for a column that contains @ symbol
        const dataRows = lines.slice(1, Math.min(lines.length, 5)); // Look at first few data rows
        
        for (let i = 0; i < headers.length; i++) {
          const columnValues = dataRows.map(row => {
            const values = row.split(',');
            return values[i] ? values[i].trim() : '';
          });
          
          // If most values in this column contain @, it's likely an email column
          const emailLikeCount = columnValues.filter(val => val.includes('@')).length;
          if (emailLikeCount > 0 && emailLikeCount >= columnValues.length * 0.5) {
            mapping.email = headers[i];
            console.log('Auto-detected email column from @ symbol presence:', headers[i]);
            break;
          }
        }
      }
      
      console.log('Auto-detected field mapping:', mapping);
      setFieldMapping(mapping);
    }
  };

  const generateMappedPreview = () => {
    if (!filePreview) return;
    
    const lines = filePreview.split('\n');
    if (lines.length <= 1) return;
    
    // Use up to 3 data lines for preview (skip header)
    const dataLines = lines.slice(1, 4);
    const headers = lines[0].split(',').map(h => h.trim());
    
    const preview = dataLines.map(line => {
      const values = line.split(',').map(v => v.trim());
      const record = {};
      
      Object.entries(fieldMapping).forEach(([field, headerName]) => {
        const index = headers.indexOf(headerName);
        if (index !== -1 && index < values.length) {
          // Ensure value is not undefined or null
          record[field] = values[index] || '';
          
          // Special handling for email fields to catch and display any formatting issues
          if (field === 'email' && record[field]) {
            console.log('Mapped email value:', record[field], 'length:', record[field].length);
            // Check if email looks valid
            if (!record[field].includes('@')) {
              console.log('Warning: Email mapping may be incorrect -', record[field]);
            }
          }
        } else {
          record[field] = '';
        }
      });
      
      return record;
    });
    
    console.log('Mapped record preview:', preview);
    setMappedRecordPreview(preview);
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

  const toggleSkippedLeads = () => {
    setShowSkippedLeads(!showSkippedLeads);
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return '';
    // Basic formatting for US numbers
    if (phone.length === 10) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    } else if (phone.startsWith('+1') && phone.length === 12) {
      return `+1 (${phone.slice(2, 5)}) ${phone.slice(5, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  const formatEmail = (email) => {
    if (!email) return '-';
    if (typeof email !== 'string') return '-';
    if (email.trim() === '') return '-';
    return email;
  };

  // Utility function to debug email values in the response
  const debugEmailValues = (data) => {
    if (!data) return;
    
    console.log('=== Email Debug Info ===');
    
    if (data.imported && data.imported.length > 0) {
      console.log('Imported leads email values:');
      data.imported.forEach((lead, index) => {
        console.log(`Lead ${index + 1}:`, {
          email: lead.email,
          emailType: typeof lead.email,
          emailLength: lead.email ? lead.email.length : 0,
          isNull: lead.email === null,
          isUndefined: lead.email === undefined,
          isEmpty: lead.email === '',
        });
      });
    }
    
    if (data.skipped && data.skipped.length > 0) {
      console.log('Skipped leads email values:');
      data.skipped.forEach((lead, index) => {
        console.log(`Lead ${index + 1}:`, {
          email: lead.email,
          emailType: typeof lead.email,
          emailLength: lead.email ? lead.email.length : 0,
          isNull: lead.email === null,
          isUndefined: lead.email === undefined,
          isEmpty: lead.email === '',
        });
      });
    }
    
    console.log('========================');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to import');
      return;
    }
    
    // Validate required field mappings
    const requiredFields = ['phone', 'firstName', 'lastName'];
    const missingFields = requiredFields.filter(field => !fieldMapping[field]);
    
    if (missingFields.length > 0) {
      setError(`Missing required field mappings: ${missingFields.join(', ')}. Please map all required fields marked with * before proceeding.`);
      
      // Scroll to the field mapping section
      const fieldMappingSection = document.querySelector('.form-section:nth-child(2)');
      if (fieldMappingSection) {
        fieldMappingSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Validate that a lead pool is selected - this is likely required by the API
    if (!defaultPoolId) {
      setError('Please select a default lead pool before proceeding. This is required for importing leads.');
      return;
    }

    setIsLoading(true);
    setImportProgress('Preparing import...');
    setError(null);
    setSuccess(null);

    try {
      // See if we can handle the file parsing and data transformation here
      // instead of relying on the API to do it correctly
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            setImportProgress('Processing CSV data...');
            const csvContent = event.target.result;
            const lines = csvContent.split('\n');
            if (lines.length <= 1) {
              throw new Error('CSV file appears to be empty or contains only headers');
            }
            
            // Get headers from first line
            const headers = lines[0].split(',').map(h => h.trim());
            
            // Process data rows - skip header if option is selected
            const startRow = importOptions.skipHeader ? 1 : 0;
            const dataRows = lines.slice(startRow);
            const leads = [];
            
            for (const line of dataRows) {
              if (!line.trim()) continue; // Skip empty lines
              
              const values = line.split(',').map(v => v.trim());
              const lead = {
                // Required fields
                phone: '',
                firstName: '',
                lastName: '',
                // Optional fields
                email: '',
                brand: '',
                source: '',
                leadAge: 0
              };
              
              // Map values based on field mapping
              Object.entries(fieldMapping).forEach(([field, headerName]) => {
                const index = headers.indexOf(headerName);
                if (index !== -1 && index < values.length) {
                  lead[field] = values[index];
                }
              });
              
              // Use default values where needed
              if (!lead.brand && importOptions.defaultBrand) {
                lead.brand = importOptions.defaultBrand;
              }
              
              if (!lead.source && importOptions.defaultSource) {
                lead.source = importOptions.defaultSource;
              }
              
              if (!lead.leadAge && importOptions.defaultLeadAge) {
                lead.leadAge = importOptions.defaultLeadAge;
              }
              
              // Ensure we have all required fields before adding to leads array
              if (lead.phone && lead.firstName && lead.lastName) {
                leads.push(lead);
              }
            }
            
            if (leads.length === 0) {
              throw new Error('No valid leads found in the CSV file. Please check your data and field mapping.');
            }
            
            setImportProgress(`Uploading ${leads.length} leads...`);
            
            // Option 1: Use the direct leads import API endpoint
            const importResponse = await apiService.leads.import({
              leads: leads,
              defaultPoolId: defaultPoolId,
              tenant_id: getTenantId(),
              updateExisting: importOptions.updateExisting
            });
            
            setImportProgress('Import complete!');
            setSuccess(importResponse);
          } catch (error) {
            console.error('Error processing CSV file:', error);
            setError(error.message || 'Failed to process CSV file');
            setIsLoading(false);
            setImportProgress('');
          }
        };
        
        reader.onerror = () => {
          setError('Failed to read the CSV file');
          setIsLoading(false);
          setImportProgress('');
        };
        
        reader.readAsText(file);
      } else {
        // For Excel files or if the direct processing fails, fall back to the file upload API
        const formData = new FormData();
        formData.append('file', file);
        
        // Make sure email field is properly handled
        const cleanedFieldMapping = {...fieldMapping};
        if (!cleanedFieldMapping.email) {
          console.log('No email mapping found - ensuring API knows this field is missing');
          // Explicitly set email to empty to signal the API that we don't have this field
          cleanedFieldMapping.email = '';
        }
        
        // Ensure the tenant_id is included in the field mapping data
        formData.append('fieldMapping', JSON.stringify(cleanedFieldMapping));
        
        // Include the default values in case they're needed
        const enhancedOptions = {
          ...importOptions,
          tenant_id: getTenantId(),
        };
        formData.append('options', JSON.stringify(enhancedOptions));
        
        // Make sure defaultPoolId is included - this might be required by the API
        formData.append('defaultPoolId', defaultPoolId);
        
        // Add tenant_id directly to the form data as well
        formData.append('tenant_id', getTenantId());

        setImportProgress('Uploading file...');
        const response = await apiService.leads.importFromFile(formData);
        
        // Debug email values in response
        debugEmailValues(response);
        
        setImportProgress('Import complete!');
        
        // Process the response to ensure emails are properly handled
        if (response.imported) {
          response.imported = response.imported.map(lead => ({
            ...lead,
            email: lead.email || '',
          }));
        }
        
        if (response.skipped) {
          response.skipped = response.skipped.map(lead => ({
            ...lead,
            email: lead.email || '',
          }));
        }
        
        // Debug email values after processing
        console.log('After processing:');
        debugEmailValues(response);
        
        setSuccess(response);
      }
    } catch (err) {
      console.error('Error importing leads:', err);
      let errorMessage = 'Failed to import leads. Please try again.';
      
      if (err.response && err.response.data && err.response.data.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setImportProgress('');
    }
  };

  return (
    <LoadingIcon isLoading={isLoading} loadingText={importProgress || "Loading..."}>
      <div className="page-container">
        <div className="content-container">
          <div className="content-header">
            <h1 className="page-title">Import Leads</h1>
            <div className="header-actions">
              <button
                className="button-secondary"
                onClick={() => navigate('/leads/webhooks')}
              >
                Setup Webhooks
              </button>
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
                <p>{error}</p>
              </div>
            )}
            
            {success ? (
              <div className="success-message">
                <h2>Import Completed Successfully!</h2>
                <p className="success-details">
                  {success.message}
                </p>
                <div className="import-stats">
                  <div className="stat-item">
                    <span className="stat-label">Imported</span>
                    <span className="stat-value">{success.imported ? success.imported.length : 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Updated</span>
                    <span className="stat-value">{success.updated ? success.updated.length : 0}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Skipped</span>
                    <span className="stat-value">{success.skipped ? success.skipped.length : 0}</span>
                  </div>
                </div>
                
                {/* Imported Leads Preview */}
                {success.imported && success.imported.length > 0 && (
                  <div className="imported-leads-section">
                    <div className="imported-leads-header">
                      <h3 className="imported-leads-title">Imported Leads Preview</h3>
                      <span className="imported-leads-count">
                        Showing {Math.min(5, success.imported.length)} of {success.imported.length}
                      </span>
                    </div>
                    <div className="imported-leads-content">
                      <table className="imported-leads-table">
                        <thead>
                          <tr>
                            <th>Phone</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Brand</th>
                            <th>Source</th>
                            <th>Lead Age</th>
                          </tr>
                        </thead>
                        <tbody>
                          {success.imported.slice(0, 5).map((lead, index) => (
                            <tr key={index}>
                              <td>{formatPhoneNumber(lead.phone)}</td>
                              <td>{`${lead.firstName} ${lead.lastName}`}</td>
                              <td>{formatEmail(lead.email)}</td>
                              <td>
                                <span className={lead.brand ? '' : 'default-value'}>
                                  {lead.brand || `${importOptions.defaultBrand || '-'} (default)`}
                                </span>
                              </td>
                              <td>
                                <span className={lead.source ? '' : 'default-value'}>
                                  {lead.source || `${importOptions.defaultSource || '-'} (default)`}
                                </span>
                              </td>
                              <td>
                                <span className={lead.leadAge ? '' : 'default-value'}>
                                  {lead.leadAge || `${importOptions.defaultLeadAge || '0'} (default)`}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* Skipped Leads Section */}
                {success.skipped && success.skipped.length > 0 && (
                  <div className="skipped-leads-section">
                    <div className="skipped-leads-header">
                      <h3 className="skipped-leads-title">Skipped Leads</h3>
                      <button 
                        className="skipped-leads-toggle"
                        onClick={toggleSkippedLeads}
                      >
                        {showSkippedLeads ? "Hide Details" : "Show Details"}
                        {showSkippedLeads ? " ▲" : " ▼"}
                      </button>
                    </div>
                    
                    {showSkippedLeads && (
                      <div className="skipped-leads-content">
                        <table className="skipped-leads-table">
                          <thead>
                            <tr>
                              <th>Phone</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Reason</th>
                            </tr>
                          </thead>
                          <tbody>
                            {success.skipped.map((lead, index) => (
                              <tr key={index}>
                                <td>{formatPhoneNumber(lead.phone)}</td>
                                <td>{`${lead.firstName} ${lead.lastName}`}</td>
                                <td>{formatEmail(lead.email)}</td>
                                <td>
                                  <span className="reason-badge">{lead.reason}</span>
                                  {lead.existingLead && (
                                    <div className="existing-lead-info">
                                      <small>
                                        Existing lead: {lead.existingLead.firstName} {lead.existingLead.lastName}
                                      </small>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                
                {success.skipped && success.skipped.length === 0 && (
                  <div className="no-skipped-message">
                    <p>No leads were skipped during import.</p>
                  </div>
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
                      setMappedRecordPreview([]);
                      setShowSkippedLeads(false);
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
                  
                  {fileValidationError && (
                    <div className="file-validation-error">
                      <p>{fileValidationError}</p>
                    </div>
                  )}
                  
                  {filePreview && (
                    <div className="file-preview">
                      <h3>File Preview</h3>
                      <pre>{filePreview}</pre>
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <h2>Field Mapping</h2>
                  <p className="mapping-help">Map CSV columns to lead fields. Required fields are marked with *</p>
                  
                  {missingFields && missingFields.length > 0 && (
                    <div className="field-mapping-error">
                      <p>Please map the following required fields: {missingFields.join(', ')}</p>
                    </div>
                  )}
                  
                  <div className="mapping-container">
                    {availableFields.map(field => (
                      <div key={field} className={`mapping-row ${['phone', 'firstName', 'lastName'].includes(field) && !fieldMapping[field] ? 'mapping-row-error' : ''}`}>
                        <div className="mapping-field">
                          {field} {['phone', 'firstName', 'lastName'].includes(field) && <span className="required">*</span>}
                        </div>
                        <select
                          className={`mapping-select ${['phone', 'firstName', 'lastName'].includes(field) && !fieldMapping[field] ? 'error' : ''}`}
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
                  
                  {mappedRecordPreview.length > 0 && (
                    <div className="mapped-preview">
                      <h3>Mapped Data Preview</h3>
                      <div className="mapped-preview-table">
                        <div className="mapped-preview-header">
                          {availableFields.map(field => (
                            <div key={field} className={`mapped-preview-cell ${['phone', 'firstName', 'lastName'].includes(field) && !fieldMapping[field] ? 'error' : ''}`}>
                              {field} {['phone', 'firstName', 'lastName'].includes(field) && <span className="required">*</span>}
                            </div>
                          ))}
                        </div>
                        {mappedRecordPreview.map((record, index) => (
                          <div key={index} className="mapped-preview-row">
                            {availableFields.map(field => (
                              <div key={field} className={`mapped-preview-cell ${['phone', 'firstName', 'lastName'].includes(field) && !fieldMapping[field] ? 'error' : ''}`}>
                                {record[field] || '-'}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                        className={`default-select ${error ? 'error' : ''}`}
                        name="defaultBrand"
                        value={importOptions.defaultBrand}
                        onChange={handleImportOptionsChange}
                        disabled={isLoading}
                      >
                        <option value="">Select brand</option>
                        {isLoading ? (
                          <option disabled>Loading brands...</option>
                        ) : error ? (
                          <option disabled>Error loading brands</option>
                        ) : brands && brands.length > 0 ? (
                          brands.map(brand => (
                            <option key={brand.id || Math.random()} value={brand.id || brand.name}>
                              {brand.name || "[Unknown brand]"}
                            </option>
                          ))
                        ) : (
                          <option disabled>No brands available</option>
                        )}
                      </select>
                      {brands && brands.length === 0 && !isLoading && !error && (
                        <div className="dropdown-help-text">
                          No brands available. You can still proceed without selecting a default brand.
                        </div>
                      )}
                    </div>
                    <div className="option-row">
                      <label>Default Source:</label>
                      <select
                        className={`default-select ${error ? 'error' : ''}`}
                        name="defaultSource"
                        value={importOptions.defaultSource}
                        onChange={handleImportOptionsChange}
                        disabled={isLoading}
                      >
                        <option value="">Select source</option>
                        {isLoading ? (
                          <option disabled>Loading sources...</option>
                        ) : error ? (
                          <option disabled>Error loading sources</option>
                        ) : sources && sources.length > 0 ? (
                          sources.map(source => (
                            <option key={source.id || Math.random()} value={source.id || source.name}>
                              {source.name || "[Unknown source]"}
                            </option>
                          ))
                        ) : (
                          <option disabled>No sources available</option>
                        )}
                      </select>
                      {sources && sources.length === 0 && !isLoading && !error && (
                        <div className="dropdown-help-text">
                          No sources available. You can still proceed without selecting a default source.
                        </div>
                      )}
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
                    {(!brands || brands.length === 0 || !sources || sources.length === 0) && !isLoading && (
                      <div className="option-row">
                        <button
                          type="button"
                          className="retry-button"
                          onClick={retryFetchBrandsAndSources}
                        >
                          Retry Loading Brands & Sources
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="submit-button"
                    disabled={isLoading || !file || fileValidationError}
                  >
                    Import Leads
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </LoadingIcon>
  );
};

export default ImportLeads; 