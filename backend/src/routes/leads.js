const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getLeads, importLeads, importFromFile, getLeadsByLeadPool } = require('../controllers/leadsController');
const upload = require('../middleware/fileUpload');

// Get leads with pagination and filtering
router.get('/', protect, getLeads);

// Get leads by lead pool ID
router.get('/by-lead-pool/:leadPoolId', protect, getLeadsByLeadPool);

// Import leads from JSON
router.post('/import', protect, importLeads);

// Import leads from file
router.post('/import-file', protect, upload.single('file'), importFromFile);

module.exports = router; 