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
async function processCSV(filePath, fieldMapping = null) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = await parseCSV(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  // If no field mapping provided, try to detect it
  if (!fieldMapping) {
    fieldMapping = detectFieldMapping(Object.keys(records[0] || {}));
  }
  
  // Map the records according to the field mapping
  return records.map(record => {
    const lead = {};
    Object.entries(fieldMapping).forEach(([field, columnName]) => {
      if (record[columnName] !== undefined) {
        lead[field] = record[columnName];
      }
    });
    return lead;
  });
}

// Process Excel file
function processExcel(filePath, fieldMapping = null) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const records = xlsx.utils.sheet_to_json(worksheet);
  
  // If no field mapping provided, try to detect it
  if (!fieldMapping) {
    fieldMapping = detectFieldMapping(Object.keys(records[0] || {}));
  }
  
  // Map the records according to the field mapping
  return records.map(record => {
    const lead = {};
    Object.entries(fieldMapping).forEach(([field, columnName]) => {
      if (record[columnName] !== undefined) {
        lead[field] = record[columnName];
      }
    });
    return lead;
  });
}

// Main function to process file based on its type
async function processFile(filePath, fieldMapping = null) {
  const fileExtension = filePath.split('.').pop().toLowerCase();
  
  if (fileExtension === 'csv') {
    return await processCSV(filePath, fieldMapping);
  } else if (['xlsx', 'xls'].includes(fileExtension)) {
    return processExcel(filePath, fieldMapping);
  } else {
    throw new Error('Unsupported file type');
  }
}

module.exports = {
  processFile,
  detectFieldMapping
}; 