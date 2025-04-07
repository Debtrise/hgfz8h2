const db = require('../config/db');
const logger = require('../utils/logger');
const fs = require('fs');

// Get leads with pagination and filtering
exports.getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Handle filters
    const filters = [];
    const params = [req.tenantId];
    let paramIndex = 2; // Start at 2 because we already have 1 param
    
    if (req.query.brand) {
      filters.push(`brand = $${paramIndex}`);
      params.push(req.query.brand);
      paramIndex++;
    }
    
    if (req.query.source) {
      filters.push(`source = $${paramIndex}`);
      params.push(req.query.source);
      paramIndex++;
    }
    
    if (req.query.status) {
      filters.push(`status = $${paramIndex}`);
      params.push(req.query.status);
      paramIndex++;
    }
    
    if (req.query.search) {
      filters.push(`(
        first_name ILIKE $${paramIndex} OR 
        last_name ILIKE $${paramIndex} OR 
        email ILIKE $${paramIndex} OR 
        phone ILIKE $${paramIndex}
      )`);
      params.push(`%${req.query.search}%`);
      paramIndex++;
    }
    
    if (req.query.leadPool && req.query.leadPool !== 'all') {
      filters.push(`EXISTS (
        SELECT 1 FROM lead_pool_assignments lpa
        JOIN lead_pools lp ON lpa.lead_pool_id = lp.id
        WHERE lpa.lead_id = l.id AND lp.name = $${paramIndex}
      )`);
      params.push(req.query.leadPool);
      paramIndex++;
    }
    
    const whereClause = filters.length > 0 
      ? `AND ${filters.join(' AND ')}` 
      : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM leads l
      WHERE tenant_id = $1 ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].total);
    
    // Add limit and offset to params
    params.push(limit);
    params.push(offset);
    
    // Handle sorting
    let orderByClause = 'l.created_at DESC'; // Default sorting
    
    if (req.query.sort) {
      const [field, direction] = req.query.sort.split(':');
      const validDirection = direction === 'asc' ? 'ASC' : 'DESC';
      
      // Map frontend field names to database column names
      const fieldMapping = {
        'first_name': 'l.first_name',
        'last_name': 'l.last_name',
        'email': 'l.email',
        'phone': 'l.phone',
        'lead_age': 'l.lead_age',
        'brand': 'l.brand',
        'source': 'l.source',
        'status': 'l.status',
        'created_at': 'l.created_at',
        'last_contacted_at': 'l.last_contacted_at',
        'lead_pool_name': '(SELECT string_agg(lp.name, \', \') FROM lead_pool_assignments lpa JOIN lead_pools lp ON lpa.lead_pool_id = lp.id WHERE lpa.lead_id = l.id)',
        'name': 'l.first_name',
        'dateAdded': 'l.created_at',
        'lastContact': 'l.last_contacted_at',
        'age': 'l.lead_age',
        'leadPool': '(SELECT string_agg(lp.name, \', \') FROM lead_pool_assignments lpa JOIN lead_pools lp ON lpa.lead_pool_id = lp.id WHERE lpa.lead_id = l.id)'
      };
      
      const dbField = fieldMapping[field] || 'l.created_at';
      orderByClause = `${dbField} ${validDirection}`;
    }
    
    // Get paginated leads with lead pool names
    const query = `
      SELECT 
        l.id, 
        l.phone, 
        l.first_name, 
        l.last_name, 
        l.email, 
        l.lead_age, 
        l.brand, 
        l.source, 
        l.status, 
        l.created_at,
        l.last_contacted_at,
        (
          SELECT string_agg(lp.name, ', ')
          FROM lead_pool_assignments lpa
          JOIN lead_pools lp ON lpa.lead_pool_id = lp.id
          WHERE lpa.lead_id = l.id
        ) as lead_pool_name
      FROM leads l
      WHERE l.tenant_id = $1 ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const result = await db.query(query, params);
    
    res.json({
      leads: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error(`Get leads error: ${err.message}`);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
};

// Import leads from file
exports.importFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse field mapping if provided
    let fieldMapping = null;
    if (req.body.fieldMapping) {
      try {
        fieldMapping = JSON.parse(req.body.fieldMapping);
      } catch (err) {
        return res.status(400).json({ message: 'Invalid field mapping JSON' });
      }
    }

    // Process the uploaded file
    const leads = await processFile(req.file.path, fieldMapping);

    // Validate leads
    const validatedLeads = leads.map(lead => {
      // Ensure required fields
      if (!lead.phone) {
        throw new Error('Phone number is required for each lead');
      }
      if (!lead.firstName) {
        throw new Error('First name is required for each lead');
      }
      if (!lead.lastName) {
        throw new Error('Last name is required for each lead');
      }

      // Set default values
      return {
        ...lead,
        tenant_id: req.tenantId,
        status: 'new',
        created_at: new Date(),
        updated_at: new Date()
      };
    });

    // Start a transaction
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Insert leads
      const insertedLeads = [];
      const skippedLeads = [];
      const updatedLeads = [];

      for (const lead of validatedLeads) {
        // Check for existing lead
        const existingLead = await client.query(
          'SELECT id FROM leads WHERE tenant_id = $1 AND phone = $2',
          [req.tenantId, lead.phone]
        );

        if (existingLead.rows.length > 0) {
          if (req.body.updateExisting === 'true') {
            // Update existing lead
            await client.query(
              `UPDATE leads 
               SET first_name = $1, last_name = $2, email = $3, 
                   lead_age = $4, brand = $5, source = $6, 
                   updated_at = $7
               WHERE id = $8`,
              [
                lead.firstName,
                lead.lastName,
                lead.email,
                lead.leadAge,
                lead.brand,
                lead.source,
                new Date(),
                existingLead.rows[0].id
              ]
            );
            updatedLeads.push(existingLead.rows[0].id);
          } else {
            skippedLeads.push(lead.phone);
          }
        } else {
          // Insert new lead
          const result = await client.query(
            `INSERT INTO leads 
             (tenant_id, phone, first_name, last_name, email, 
              lead_age, brand, source, status, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             RETURNING id`,
            [
              req.tenantId,
              lead.phone,
              lead.firstName,
              lead.lastName,
              lead.email,
              lead.leadAge,
              lead.brand,
              lead.source,
              lead.status,
              lead.created_at,
              lead.updated_at
            ]
          );
          insertedLeads.push(result.rows[0].id);

          // Assign to lead pool if specified
          if (req.body.defaultPoolId) {
            await client.query(
              'INSERT INTO lead_pool_assignments (lead_id, lead_pool_id) VALUES ($1, $2)',
              [result.rows[0].id, req.body.defaultPoolId]
            );
          }
        }
      }

      await client.query('COMMIT');

      // Clean up the uploaded file
      fs.unlinkSync(req.file.path);

      res.json({
        message: `${insertedLeads.length} leads imported, ${updatedLeads.length} updated, ${skippedLeads.length} skipped`,
        imported: insertedLeads,
        updated: updatedLeads,
        skipped: skippedLeads
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    logger.error(`Import leads from file error: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get leads by lead pool ID with pagination and filtering
exports.getLeadsByLeadPool = async (req, res) => {
  try {
    const { leadPoolId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    
    // Handle filters
    const filters = ['lpa.lead_pool_id = $1'];
    const params = [leadPoolId];
    let paramIndex = 2; // Start at 2 because we already have 1 param
    
    if (req.query.brand) {
      filters.push(`l.brand = $${paramIndex}`);
      params.push(req.query.brand);
      paramIndex++;
    }
    
    if (req.query.source) {
      filters.push(`l.source = $${paramIndex}`);
      params.push(req.query.source);
      paramIndex++;
    }
    
    if (req.query.status) {
      filters.push(`l.status = $${paramIndex}`);
      params.push(req.query.status);
      paramIndex++;
    }
    
    if (req.query.search) {
      filters.push(`(
        l.first_name ILIKE $${paramIndex} OR 
        l.last_name ILIKE $${paramIndex} OR 
        l.email ILIKE $${paramIndex} OR 
        l.phone ILIKE $${paramIndex}
      )`);
      params.push(`%${req.query.search}%`);
      paramIndex++;
    }
    
    const whereClause = filters.length > 0 
      ? `WHERE ${filters.join(' AND ')}` 
      : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT l.id) as total
      FROM leads l
      JOIN lead_pool_assignments lpa ON l.id = lpa.lead_id
      ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Add limit and offset to params
    params.push(limit);
    params.push(offset);
    
    // Get lead pool details
    const poolQuery = `
      SELECT id, name, description, lead_age_min, lead_age_max
      FROM lead_pools
      WHERE id = $1
    `;
    const poolResult = await db.query(poolQuery, [leadPoolId]);
    const leadPool = poolResult.rows[0];
    
    if (!leadPool) {
      return res.status(404).json({ message: 'Lead pool not found' });
    }
    
    // Handle sorting
    let orderByClause = 'l.created_at DESC'; // Default sorting
    
    if (req.query.sort) {
      const [field, direction] = req.query.sort.split(':');
      const validDirection = direction === 'asc' ? 'ASC' : 'DESC';
      
      // Map frontend field names to database column names
      const fieldMapping = {
        'first_name': 'l.first_name',
        'last_name': 'l.last_name',
        'email': 'l.email',
        'phone': 'l.phone',
        'lead_age': 'l.lead_age',
        'brand': 'l.brand',
        'source': 'l.source',
        'status': 'l.status',
        'created_at': 'l.created_at',
        'last_contacted_at': 'l.last_contacted_at',
        'lead_pool_name': '(SELECT string_agg(lp.name, \', \') FROM lead_pool_assignments lpa JOIN lead_pools lp ON lpa.lead_pool_id = lp.id WHERE lpa.lead_id = l.id)',
        'name': 'l.first_name',
        'dateAdded': 'l.created_at',
        'lastContact': 'l.last_contacted_at',
        'age': 'l.lead_age',
        'leadPool': '(SELECT string_agg(lp.name, \', \') FROM lead_pool_assignments lpa JOIN lead_pools lp ON lpa.lead_pool_id = lp.id WHERE lpa.lead_id = l.id)'
      };
      
      const dbField = fieldMapping[field] || 'l.created_at';
      orderByClause = `${dbField} ${validDirection}`;
    }
    
    // Get paginated leads
    const query = `
      SELECT 
        l.id, 
        l.phone, 
        l.first_name, 
        l.last_name, 
        l.email, 
        l.lead_age, 
        l.brand, 
        l.source, 
        l.status, 
        l.created_at,
        l.last_contacted_at,
        lpa.assigned_at
      FROM leads l
      JOIN lead_pool_assignments lpa ON l.id = lpa.lead_id
      ${whereClause}
      ORDER BY ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const result = await db.query(query, params);
    
    // Get analytics data
    const analyticsQuery = `
      SELECT 
        l.brand,
        l.source,
        l.status,
        COUNT(*) as count
      FROM leads l
      JOIN lead_pool_assignments lpa ON l.id = lpa.lead_id
      WHERE lpa.lead_pool_id = $1
      GROUP BY l.brand, l.source, l.status
    `;
    
    const analyticsResult = await db.query(analyticsQuery, [leadPoolId]);
    
    // Process analytics data
    const analytics = {
      brands: [],
      sources: [],
      statuses: []
    };
    
    const brandMap = new Map();
    const sourceMap = new Map();
    const statusMap = new Map();
    
    analyticsResult.rows.forEach(row => {
      if (row.brand) {
        brandMap.set(row.brand, (brandMap.get(row.brand) || 0) + parseInt(row.count));
      }
      if (row.source) {
        sourceMap.set(row.source, (sourceMap.get(row.source) || 0) + parseInt(row.count));
      }
      if (row.status) {
        statusMap.set(row.status, (statusMap.get(row.status) || 0) + parseInt(row.count));
      }
    });
    
    brandMap.forEach((count, brand) => {
      analytics.brands.push({ brand, count });
    });
    
    sourceMap.forEach((count, source) => {
      analytics.sources.push({ source, count });
    });
    
    statusMap.forEach((count, status) => {
      analytics.statuses.push({ status, count });
    });
    
    res.json({
      leadPool,
      leads: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      analytics
    });
  } catch (err) {
    logger.error(`Get leads by lead pool error: ${err.message}`);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 