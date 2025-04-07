const db = require('../config/db');
const logger = require('../utils/logger');

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
    
    const whereClause = filters.length > 0 
      ? `AND ${filters.join(' AND ')}` 
      : '';
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM leads
      WHERE tenant_id = $1 ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, params.slice(0, paramIndex - 1));
    const total = parseInt(countResult.rows[0].total);
    
    // Add limit and offset to params
    params.push(limit);
    params.push(offset);
    
    // Get paginated leads with simple pool names
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
        (
          SELECT string_agg(lp.name, ', ')
          FROM lead_pool_assignments lpa
          JOIN lead_pools lp ON lpa.lead_pool_id = lp.id
          WHERE lpa.lead_id = l.id
        ) as pools
      FROM leads l
      WHERE l.tenant_id = $1 ${whereClause}
      ORDER BY l.created_at DESC
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