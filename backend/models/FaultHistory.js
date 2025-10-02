// models/FaultHistory.js - UPDATED for locomotive_number schema
const pool = require('../db');

class FaultHistory {
  // ⚠️ UPDATED: Get fault history with filters and pagination (NO JOIN to locomotives)
  static async getAll(filters = {}) {
    const { 
      startDate, 
      endDate, 
      locomotiveNumbers = [], // ⚠️ CHANGED from locomotiveId to locomotiveNumbers array
      faultTypes = [],        // ⚠️ CHANGED from faultType to faultTypes array
      faultCodes = [],        // ⚠️ CHANGED from faultCode to faultCodes array
      priorityLevels = [],    // ⚠️ NEW parameter
      page = 1, 
      limit = 50 
    } = filters;
  
    // Build WHERE conditions
    let whereConditions = 'WHERE date_occurred BETWEEN $1 AND $2';
    const values = [startDate, endDate];
    let paramCount = 2;
  
    // ⚠️ UPDATED: Filter by locomotive_number (array)
    if (locomotiveNumbers.length > 0) {
      const placeholders = locomotiveNumbers.map((_, i) => `$${paramCount + i + 1}`).join(',');
      whereConditions += ` AND locomotive_number IN (${placeholders})`;
      values.push(...locomotiveNumbers);
      paramCount += locomotiveNumbers.length;
    }
    
    // ⚠️ UPDATED: Filter by fault_type (array)
    if (faultTypes.length > 0) {
      const placeholders = faultTypes.map((_, i) => `$${paramCount + i + 1}`).join(',');
      whereConditions += ` AND fault_type IN (${placeholders})`;
      values.push(...faultTypes);
      paramCount += faultTypes.length;
    }
    
    // ⚠️ UPDATED: Filter by fault_code (array)
    if (faultCodes.length > 0) {
      const placeholders = faultCodes.map((_, i) => `$${paramCount + i + 1}`).join(',');
      whereConditions += ` AND fault_code IN (${placeholders})`;
      values.push(...faultCodes);
      paramCount += faultCodes.length;
    }

    // ⚠️ NEW: Filter by priority_level (array)
    if (priorityLevels.length > 0) {
      const placeholders = priorityLevels.map((_, i) => `$${paramCount + i + 1}`).join(',');
      whereConditions += ` AND priority_level IN (${placeholders})`;
      values.push(...priorityLevels);
      paramCount += priorityLevels.length;
    }
  
    // ⚠️ UPDATED: Count query (NO JOIN to locomotives)
    const countQuery = `
      SELECT COUNT(*) as total
      FROM fault_history
      ${whereConditions}
    `;
  
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);
  
    // ⚠️ UPDATED: Main query (NO JOIN to locomotives, locomotive_number langsung dari fault_history)
    const query = `
      SELECT 
        id,
        locomotive_number,  -- ⚠️ Langsung dari fault_history, tidak perlu join
        fault_type,
        fault_code,
        fault_description,
        priority_level,
        priority_description,
        counter,
        date_occurred,
        created_at,
        updated_at
      FROM fault_history
      ${whereConditions}
      ORDER BY date_occurred DESC, id DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
  
    // Add pagination parameters to values array
    const queryValues = [...values, limit, (page - 1) * limit];
    
    const result = await pool.query(query, queryValues);
  
    return {
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  // ⚠️ UPDATED: Get summary counters for filters (NO JOIN to locomotives)
  static async getSummaryCounters(filters = {}) {
    const { 
      startDate, 
      endDate, 
      locomotiveNumbers = [], 
      faultTypes = [], 
      faultCodes = [],
      priorityLevels = []
    } = filters;

    let baseWhere = 'WHERE date_occurred BETWEEN $1 AND $2';
    const values = [startDate, endDate];
    let paramCount = 2;

    // ⚠️ UPDATED: Build WHERE conditions for arrays
    if (locomotiveNumbers.length > 0) {
      const placeholders = locomotiveNumbers.map((_, i) => `$${paramCount + i + 1}`).join(',');
      baseWhere += ` AND locomotive_number IN (${placeholders})`;
      values.push(...locomotiveNumbers);
      paramCount += locomotiveNumbers.length;
    }
    if (faultTypes.length > 0) {
      const placeholders = faultTypes.map((_, i) => `$${paramCount + i + 1}`).join(',');
      baseWhere += ` AND fault_type IN (${placeholders})`;
      values.push(...faultTypes);
      paramCount += faultTypes.length;
    }
    if (faultCodes.length > 0) {
      const placeholders = faultCodes.map((_, i) => `$${paramCount + i + 1}`).join(',');
      baseWhere += ` AND fault_code IN (${placeholders})`;
      values.push(...faultCodes);
      paramCount += faultCodes.length;
    }
    if (priorityLevels.length > 0) {
      const placeholders = priorityLevels.map((_, i) => `$${paramCount + i + 1}`).join(',');
      baseWhere += ` AND priority_level IN (${placeholders})`;
      values.push(...priorityLevels);
      paramCount += priorityLevels.length;
    }

    // ⚠️ UPDATED: Summary queries (NO JOIN to locomotives)
    const queries = {
      locomotives: `
        SELECT 
          locomotive_number,
          COUNT(*) as counter
        FROM fault_history
        ${baseWhere}
        GROUP BY locomotive_number
        ORDER BY counter DESC
      `,
      faultTypes: `
        SELECT 
          fault_type,
          COUNT(*) as counter
        FROM fault_history
        ${baseWhere}
        GROUP BY fault_type
        ORDER BY counter DESC
      `,
      faultCodes: `
        SELECT 
          fault_code,
          fault_description,
          COUNT(*) as counter
        FROM fault_history
        ${baseWhere}
        GROUP BY fault_code, fault_description
        ORDER BY counter DESC
      `
    };

    const results = {};
    for (const [key, query] of Object.entries(queries)) {
      const result = await pool.query(query, values);
      results[key] = result.rows;
    }

    return results;
  }

  // ⚠️ UPDATED: Calculate next counter for locomotive_number + fault_code combination
  static async getNextCounter(locomotiveNumber, faultCode) {
    const query = `
      SELECT COALESCE(MAX(counter), 0) + 1 as next_counter
      FROM fault_history 
      WHERE locomotive_number = $1 AND fault_code = $2
    `;
    const result = await pool.query(query, [locomotiveNumber, faultCode]);
    return result.rows[0].next_counter;
  }

  // ⚠️ UPDATED: Insert new fault record (NO locomotive lookup needed!)
  static async create(faultData) {
    const {
      locomotive_number,    // ⚠️ Direct locomotive_number (no lookup needed)
      date_occurred,
      fault_type,
      fault_code,
      fault_description,
      priority_level,
      priority_description,
      counter              // ⚠️ Counter bisa dari CSV atau auto-generate
    } = faultData;

    // ⚠️ Get next counter jika tidak ada di CSV
    const finalCounter = counter || await this.getNextCounter(locomotive_number, fault_code);

    const query = `
      INSERT INTO fault_history (
        locomotive_number,  -- ⚠️ Direct insert locomotive_number
        date_occurred, 
        fault_type, 
        fault_code, 
        fault_description, 
        priority_level, 
        priority_description, 
        counter
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      locomotive_number,    // ⚠️ Direct value
      date_occurred, 
      fault_type, 
      fault_code,
      fault_description, 
      priority_level, 
      priority_description,
      finalCounter
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // ⚠️ NEW: Get distinct locomotives dari fault_history table
  static async getDistinctLocomotives() {
    const query = `
      SELECT DISTINCT locomotive_number
      FROM fault_history
      WHERE locomotive_number IS NOT NULL AND locomotive_number != ''
      ORDER BY locomotive_number
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.locomotive_number);
  }

  // Get distinct fault types
  static async getDistinctFaultTypes() {
    const query = `
      SELECT DISTINCT fault_type
      FROM fault_history
      WHERE fault_type IS NOT NULL AND fault_type != ''
      ORDER BY fault_type
    `;
    const result = await pool.query(query);
    return result.rows.map(row => row.fault_type);
  }

  // Get distinct fault codes with descriptions
  static async getDistinctFaultCodes() {
    const query = `
      SELECT DISTINCT fault_code, fault_description
      FROM fault_history
      WHERE fault_code IS NOT NULL
      ORDER BY fault_code
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // ⚠️ UPDATED: Get fault history by ID (NO JOIN to locomotives)
  static async getById(id) {
    const query = `
      SELECT 
        id,
        locomotive_number,  -- ⚠️ Langsung dari fault_history
        fault_type,
        fault_code,
        fault_description,
        priority_level,
        priority_description,
        counter,
        date_occurred,
        created_at,
        updated_at
      FROM fault_history
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Update fault history record
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    // Dynamic update query building
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = $${++paramCount}`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Add updated_at
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE fault_history 
      SET ${fields.join(', ')}
      WHERE id = $${++paramCount}
      RETURNING *
    `;
    values.push(id);

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete fault history record
  static async delete(id) {
    const query = 'DELETE FROM fault_history WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // ⚠️ UPDATED: Get fault statistics for a specific locomotive (use locomotive_number)
  static async getLocomotiveStats(locomotiveNumber, startDate, endDate) {
    const query = `
      SELECT 
        COUNT(*) as total_faults,
        COUNT(DISTINCT fault_type) as unique_fault_types,
        COUNT(DISTINCT fault_code) as unique_fault_codes,
        AVG(priority_level) as avg_priority,
        fault_type,
        COUNT(*) as fault_count
      FROM fault_history
      WHERE locomotive_number = $1 
        AND date_occurred BETWEEN $2 AND $3
      GROUP BY fault_type
      ORDER BY fault_count DESC
    `;
    
    const result = await pool.query(query, [locomotiveNumber, startDate, endDate]);
    return result.rows;
  }

  // Get trending fault codes
  static async getTrendingFaultCodes(days = 30, limit = 10) {
    const query = `
      SELECT 
        fault_code,
        fault_description,
        COUNT(*) as occurrence_count,
        COUNT(DISTINCT locomotive_number) as affected_locomotives  -- ⚠️ Use locomotive_number
      FROM fault_history
      WHERE date_occurred >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY fault_code, fault_description
      ORDER BY occurrence_count DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows;
  }

  // ⚠️ NEW: Get priority level statistics
  static async getPriorityStats(startDate, endDate) {
    const query = `
      SELECT 
        priority_level,
        priority_description,
        COUNT(*) as count,
        COUNT(DISTINCT locomotive_number) as affected_locomotives
      FROM fault_history
      WHERE date_occurred BETWEEN $1 AND $2
      GROUP BY priority_level, priority_description
      ORDER BY priority_level
    `;
    
    const result = await pool.query(query, [startDate, endDate]);
    return result.rows;
  }
}

module.exports = FaultHistory;