const csv = require('csv-parse');
const xlsx = require('xlsx');
const fs = require('fs');
const { promisify } = require('util');

// Promisify the csv-parse function
const parseCSV = promisify(csv.parse);

// Common column name mappings for intelligent detection
const commonColumnMappings = {
  phone: ['phone', 'phone number', 'mobile', 'mobile number', 'contact', 'contact number'],
  firstName: ['first name', 'firstname', 'first', 'given name', 'fname'],
  lastName: ['last name', 'lastname', 'last', 'family name', 'surname', 'lname'],
  email: ['email', 'email address', 'e-mail', 'mail'],
  brand: ['brand', 'campaign', 'product', 'service'],
  source: ['source', 'lead source', 'origin', 'referral source'],
  leadAge: ['lead age', 'age', 'days since sign up', 'signup age', 'days old']
};

// Detect field mapping from headers
function detectFieldMapping(headers) {
  const mapping = {};
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
  
  Object.entries(commonColumnMappings).forEach(([field, variations]) => {
    const index = normalizedHeaders.findIndex(h => variations.includes(h));
    if (index !== -1) {
      mapping[field] = headers[index];
    }
  });
  
  return mapping;
}

// Process CSV file
async function processCSV(filePath, fieldMapping = null, skipHeader = true) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Parse options for CSV - if skipHeader is false, we handle headers differently 
  const parseOptions = {
    columns: skipHeader, // Use first row as column names if skipHeader is true
    skip_empty_lines: true
  };
  
  const records = await parseCSV(fileContent, parseOptions);
  
  // If no field mapping provided and we're using headers, try to detect it
  if (!fieldMapping && skipHeader) {
    // For columns: true, records will be an array of objects with column names as keys
    // Get the headers from the first record
    if (records.length > 0) {
      fieldMapping = detectFieldMapping(Object.keys(records[0] || {}));
    } else {
      return []; // Empty file
    }
  } else if (!fieldMapping && !skipHeader) {
    // If not skipping header, we need to extract headers from first row
    const lines = fileContent.split('\n');
    if (lines.length > 0) {
      const headers = lines[0].split(',').map(h => h.trim());
      fieldMapping = detectFieldMapping(headers);
    }
  }
  
  // Map the records according to the field mapping
  let processedRecords = [];
  
  if (skipHeader) {
    // With skipHeader=true, records is an array of objects
    processedRecords = records.map(record => {
      const lead = {};
      Object.entries(fieldMapping).forEach(([field, columnName]) => {
        if (record[columnName] !== undefined) {
          lead[field] = record[columnName];
        }
      });
      return lead;
    });
  } else {
    // With skipHeader=false, we need to parse the file manually
    const lines = fileContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Start from the second line (index 1) because we're not skipping the header
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '') continue; // Skip empty lines
      
      const values = lines[i].split(',').map(v => v.trim());
      const record = {};
      
      Object.entries(fieldMapping).forEach(([field, columnName]) => {
        const index = headers.indexOf(columnName);
        if (index !== -1 && index < values.length) {
          record[field] = values[index];
        }
      });
      
      processedRecords.push(record);
    }
  }
  
  return processedRecords;
}

// Process Excel file
function processExcel(filePath, fieldMapping = null, skipHeader = true) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert Excel sheet to JSON with appropriate options
  const options = {
    header: skipHeader ? 1 : undefined, // Use first row as headers if skipHeader is true
    raw: false // Convert dates to strings
  };
  
  const records = xlsx.utils.sheet_to_json(worksheet, options);
  
  // If no field mapping provided and we're using headers, try to detect it
  if (!fieldMapping && skipHeader) {
    if (records.length > 0) {
      fieldMapping = detectFieldMapping(Object.keys(records[0] || {}));
    } else {
      return []; // Empty file
    }
  } else if (!fieldMapping && !skipHeader) {
    // If not skipping header, handle differently
    // Get the headers from the first row
    const headerRow = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0];
    if (headerRow) {
      fieldMapping = detectFieldMapping(headerRow);
    }
  }
  
  // Map the records according to the field mapping
  let processedRecords = [];
  
  if (skipHeader) {
    // With skipHeader=true, records is an array of objects with column names as keys
    processedRecords = records.map(record => {
      const lead = {};
      Object.entries(fieldMapping).forEach(([field, columnName]) => {
        if (record[columnName] !== undefined) {
          lead[field] = record[columnName];
        }
      });
      return lead;
    });
  } else {
    // With skipHeader=false, we need to handle the data differently
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
    const headers = rows[0];
    
    // Process all rows including header
    for (let i = 0; i < rows.length; i++) {
      const values = rows[i];
      const record = {};
      
      Object.entries(fieldMapping).forEach(([field, columnName]) => {
        const index = headers.indexOf(columnName);
        if (index !== -1 && index < values.length) {
          record[field] = values[index];
        }
      });
      
      processedRecords.push(record);
    }
  }
  
  return processedRecords;
}

// Main function to process file based on its type
async function processFile(filePath, fieldMapping = null, skipHeader = true) {
  const fileExtension = filePath.split('.').pop().toLowerCase();
  
  if (fileExtension === 'csv') {
    return await processCSV(filePath, fieldMapping, skipHeader);
  } else if (['xlsx', 'xls'].includes(fileExtension)) {
    return processExcel(filePath, fieldMapping, skipHeader);
  } else {
    throw new Error('Unsupported file type');
  }
}

module.exports = {
  processFile,
  detectFieldMapping
}; 