// controllers/faultHistoryController.js - UPDATED for locomotive_number schema
const FaultHistory = require('../models/FaultHistory');

class FaultHistoryController {
  // GET /api/fault-history - Get fault history with filters and pagination
  static async getFaultHistory(req, res) {
    try {
      const {
        startDate,
        endDate,
        locomotiveNumbers, // ⚠️ CHANGED from locomotiveId to locomotiveNumbers
        faultTypes,        // ⚠️ CHANGED from faultType to faultTypes (array)
        faultCodes,        // ⚠️ CHANGED from faultCode to faultCodes (array)
        priorityLevels,    // ⚠️ NEW parameter
        page = 1,
        limit = 50
      } = req.query;

      // Validation
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: startDate, endDate'
        });
      }

      const filters = {
        startDate,
        endDate,
        locomotiveNumbers: locomotiveNumbers ? locomotiveNumbers.split(',') : [], // ⚠️ Handle array
        faultTypes: faultTypes ? faultTypes.split(',') : [],
        faultCodes: faultCodes ? faultCodes.split(',').map(c => parseInt(c)) : [],
        priorityLevels: priorityLevels ? priorityLevels.split(',').map(p => parseInt(p)) : [],
        page: parseInt(page),
        limit: parseInt(limit)
      };

      console.log('🔍 Fault History Filters:', filters);

      const result = await FaultHistory.getAll(filters);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Error fetching fault history:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/fault-history/summary - Get summary counters for filtering
  static async getSummaryCounters(req, res) {
    try {
      const {
        startDate,
        endDate,
        locomotiveNumbers,
        faultTypes,
        faultCodes,
        priorityLevels
      } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: startDate, endDate'
        });
      }

      const filters = {
        startDate,
        endDate,
        locomotiveNumbers: locomotiveNumbers ? locomotiveNumbers.split(',') : [],
        faultTypes: faultTypes ? faultTypes.split(',') : [],
        faultCodes: faultCodes ? faultCodes.split(',').map(c => parseInt(c)) : [],
        priorityLevels: priorityLevels ? priorityLevels.split(',').map(p => parseInt(p)) : []
      };

      const summary = await FaultHistory.getSummaryCounters(filters);

      res.json({
        success: true,
        data: summary
      });

    } catch (error) {
      console.error('Error fetching summary:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/fault-history/import - Import CSV
  static async importCSV(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No CSV file uploaded'
        });
      }

      const csvText = req.file.buffer.toString('utf8');
      const result = await FaultHistoryController.processCSVData(csvText);

      res.json({
        success: true,
        message: 'CSV imported successfully',
        stats: result
      });

    } catch (error) {
      console.error('Error importing CSV:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ⚠️ UPDATED CSV Processing Logic untuk FAULT HISTORY format yang benar
  static async processCSVData(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Auto-detect separator
    let separator = ',';
    if (lines[0].includes(';') && lines[0].split(';').length > lines[0].split(',').length) {
      separator = ';';
    } else if (lines[0].includes('\t')) {
      separator = '\t';
    }
    
    const headers = lines[0].split(separator).map(h => h.trim().replace(/"/g, '').replace(/\r/g, ''));
    
    // ⚠️ FIXED Column mapping - PRIORITAS YANG BENAR
    const COLUMN_MAPPING = {
      // ⚠️ PRIMARY mappings - yang UTAMA untuk CSV PT KAI
      'Locomotive Number': 'locomotive_number',  // ✅ INI YANG BENAR: "CC205 21 15"
      'Date Occurred': 'date_occurred',
      'Fault Code': 'fault_code',
      'Description': 'fault_description',        
      'Fault Type': 'fault_type',                
      'Priority Level': 'priority_level',
      'Priority Description': 'priority_description',
      '24 Hr Count': 'counter',                  
      
      // ⚠️ Alternative column names HANYA untuk fallback (JANGAN override primary!)
      'Locomotive': 'locomotive_number',         // Fallback jika tidak ada "Locomotive Number"
      'Loco Number': 'locomotive_number',        // Fallback jika tidak ada "Locomotive Number"
      // ❌ HAPUS 'Unit #': locomotive_number - INI YANG BIKIN CONFLICT!
      'Type': 'fault_type',
      'Code': 'fault_code',
      'Fault Description': 'fault_description',
      'Priority': 'priority_level',
      'Priority Desc': 'priority_description',
      'Date': 'date_occurred',
      'Timestamp': 'date_occurred',
      'Count': 'counter',
      'Counter': 'counter',
      
      // ⚠️ MAPPING untuk "Unit #" ke field terpisah jika diperlukan
      'Unit #': 'unit_number',                   // ✅ Map ke field lain, bukan locomotive_number!
      'Asset Name': 'asset_name',               // Optional fields
      'Status': 'status'                        // Optional fields
    };

    // ⚠️ IMPROVED: Find column indexes dengan PRIORITAS YANG BENAR
    const columnIndexes = {};
    
    // ⚠️ STEP 1: Cari kolom primary dulu (yang penting)
    const primaryColumns = {
      'Locomotive Number': 'locomotive_number',
      'Date Occurred': 'date_occurred',
      'Fault Code': 'fault_code',
      'Description': 'fault_description',
      'Fault Type': 'fault_type',
      'Priority Level': 'priority_level',
      'Priority Description': 'priority_description',
      '24 Hr Count': 'counter'
    };
    
    // Cari kolom primary dulu
    Object.keys(primaryColumns).forEach(csvColumn => {
      const index = headers.findIndex(header => 
        header.toLowerCase().trim() === csvColumn.toLowerCase().trim()
      );
      if (index !== -1) {
        columnIndexes[primaryColumns[csvColumn]] = index;
        console.log(`✅ Found PRIMARY column: "${csvColumn}" at index ${index} → ${primaryColumns[csvColumn]}`);
      }
    });
    
    // ⚠️ STEP 2: Cari kolom fallback hanya jika primary tidak ada
    const fallbackColumns = {
      'Locomotive': 'locomotive_number',
      'Loco Number': 'locomotive_number',
      'Type': 'fault_type',
      'Code': 'fault_code',
      'Fault Description': 'fault_description',
      'Priority': 'priority_level',
      'Priority Desc': 'priority_description',
      'Date': 'date_occurred',
      'Timestamp': 'date_occurred',
      'Count': 'counter',
      'Counter': 'counter'
    };
    
    // Hanya cari fallback jika primary belum ada
    Object.keys(fallbackColumns).forEach(csvColumn => {
      const targetField = fallbackColumns[csvColumn];
      if (!columnIndexes[targetField]) { // ⚠️ HANYA jika belum ada primary mapping
        const index = headers.findIndex(header => 
          header.toLowerCase().trim() === csvColumn.toLowerCase().trim()
        );
        if (index !== -1) {
          columnIndexes[targetField] = index;
          console.log(`✅ Found FALLBACK column: "${csvColumn}" at index ${index} → ${targetField}`);
        }
      }
    });
    
    // ⚠️ STEP 3: Optional columns (tidak critical)
    const optionalColumns = {
      'Unit #': 'unit_number',
      'Asset Name': 'asset_name',
      'Status': 'status'
    };
    
    Object.keys(optionalColumns).forEach(csvColumn => {
      const index = headers.findIndex(header => 
        header.toLowerCase().trim() === csvColumn.toLowerCase().trim()
      );
      if (index !== -1) {
        columnIndexes[optionalColumns[csvColumn]] = index;
        console.log(`✅ Found OPTIONAL column: "${csvColumn}" at index ${index} → ${optionalColumns[csvColumn]}`);
      }
    });

    // Validate required columns exist
    const requiredColumns = ['locomotive_number', 'fault_type', 'fault_code', 'date_occurred'];
    const missingColumns = requiredColumns.filter(col => columnIndexes[col] === undefined);
    
    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}. Available columns: ${headers.join(', ')}`);
    }

    console.log(`📊 Fault History CSV Analysis:`);
    console.log(`   Total columns: ${headers.length}`);
    console.log(`   Headers found:`, headers.slice(0, 10), '...' ); // Show first 10 headers
    console.log(`   Mapped columns: ${Object.keys(columnIndexes).length}`);
    console.log(`   Column mapping:`, columnIndexes);
    console.log(`   Required columns check: locomotive_number=${columnIndexes['locomotive_number']}, fault_type=${columnIndexes['fault_type']}, fault_code=${columnIndexes['fault_code']}, date_occurred=${columnIndexes['date_occurred']}`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process all data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(separator).map(v => v.trim().replace(/"/g, '').replace(/\r/g, ''));
        
        // ⚠️ EXTRACT required fields dengan VALIDATION yang lebih baik
        const locomotiveNumber = values[columnIndexes['locomotive_number']] || '';
        const faultType = values[columnIndexes['fault_type']] || '';
        const faultCode = values[columnIndexes['fault_code']] || '';
        const dateOccurred = values[columnIndexes['date_occurred']] || '';

        // ⚠️ DEBUG: Log extracted values untuk memastikan benar
        console.log(`🔍 Row ${i} extracted values:`);
        console.log(`   Locomotive Number (index ${columnIndexes['locomotive_number']}): "${locomotiveNumber}"`);
        console.log(`   Fault Type (index ${columnIndexes['fault_type']}): "${faultType}"`);
        console.log(`   Fault Code (index ${columnIndexes['fault_code']}): "${faultCode}"`);
        console.log(`   Date Occurred (index ${columnIndexes['date_occurred']}): "${dateOccurred}"`);

        // Validate required fields
        if (!locomotiveNumber || !faultType || !faultCode || !dateOccurred) {
          throw new Error(`Missing required data: locomotive_number="${locomotiveNumber}", fault_type="${faultType}", fault_code="${faultCode}", date_occurred="${dateOccurred}"`);
        }

        // ⚠️ ADDITIONAL VALIDATION: Pastikan locomotive_number bukan format "PTKA XXXXXX"
        if (locomotiveNumber.startsWith('PTKA') || locomotiveNumber.includes('PTKA')) {
          console.log(`⚠️ Warning: Row ${i} - locomotive_number "${locomotiveNumber}" looks like Unit # instead of Locomotive Number. Checking for alternative...`);
          
          // Coba cari di kolom lain jika ada mistake mapping
          const altLocoNumber = values[0]; // Biasanya Locomotive Number di kolom pertama
          if (altLocoNumber && !altLocoNumber.startsWith('PTKA') && altLocoNumber.match(/^CC\d+/)) {
            console.log(`✅ Found alternative locomotive number: "${altLocoNumber}" in column 0`);
            // Update mapping for next rows
            columnIndexes['locomotive_number'] = 0;
            throw new Error(`Row ${i}: Column mapping issue detected. Locomotive Number should be "${altLocoNumber}", not "${locomotiveNumber}". Please check CSV column mapping.`);
          }
        }

        // Parse date
        const parsedDate = FaultHistoryController.parseDate(dateOccurred);
        if (!parsedDate) {
          throw new Error(`Invalid date format: ${dateOccurred}`);
        }

        // Extract optional fields
        const faultDescription = values[columnIndexes['fault_description']] || '';
        const priorityLevel = columnIndexes['priority_level'] !== undefined ? 
          (parseInt(values[columnIndexes['priority_level']]) || 1) : 1;
        const priorityDescription = values[columnIndexes['priority_description']] || '';
        
        // ⚠️ UPDATED: Counter dari "24 Hr Count" column atau default 1
        const counter = columnIndexes['counter'] !== undefined ? 
          (parseInt(values[columnIndexes['counter']]) || 1) : 1;

        console.log(`📊 Parsed data - Loco: ${locomotiveNumber}, Type: ${faultType}, Code: ${faultCode}, Date: ${dateOccurred}, Counter: ${counter}`);

        // ⚠️ PREPARE FAULT DATA (LANGSUNG PAKAI locomotive_number, TIDAK PERLU getOrCreate locomotive!)
        const faultData = {
          locomotive_number: locomotiveNumber,  // ⚠️ Direct assignment
          fault_type: faultType,
          fault_code: parseInt(faultCode),
          fault_description: faultDescription,
          priority_level: priorityLevel,
          priority_description: priorityDescription,
          date_occurred: parsedDate,
          counter: counter                      // ⚠️ From "24 Hr Count" atau default 1
        };

        // ⚠️ INSERT TO DATABASE (tanpa locomotive lookup!)
        await FaultHistory.create(faultData);
        successCount++;

        console.log(`✅ Imported row ${i}: ${locomotiveNumber} - Fault ${faultCode} on ${dateOccurred}`);

      } catch (error) {
        errorCount++;
        errors.push(`Row ${i + 1}: ${error.message}`);
        console.error(`❌ Error row ${i + 1}:`, error.message);
      }
    }

    console.log(`📊 Fault History Import completed: ${successCount} success, ${errorCount} errors`);

    return {
      total_rows: lines.length - 1,
      success_count: successCount,
      error_count: errorCount,
      errors: errors.slice(0, 10),
      column_analysis: {
        total_columns: headers.length,
        mapped_columns: Object.keys(columnIndexes).length,
        available_columns: headers,
        mapped_fields: columnIndexes
      }
    };
  }

  // Helper method to parse different date formats (OPTIMIZED untuk format PT KAI)
  static parseDate(dateString) {
    if (!dateString) return null;
    
    dateString = dateString.trim();
    console.log(`🔍 Parsing date: "${dateString}"`);
    
    try {
      // Format 1: DD/MM/YYYY HH:MM (format di CSV user: "21/07/2025 03:30")
      const ddmmyyyyHHMM = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})$/);
      if (ddmmyyyyHHMM) {
        const [, day, month, year, hour, minute] = ddmmyyyyHHMM;
        const date = new Date(year, month - 1, day, hour, minute);
        if (!isNaN(date.getTime())) {
          console.log(`✅ Parsed DD/MM/YYYY HH:MM: ${date.toISOString().split('T')[0]}`);
          return date.toISOString().split('T')[0];
        }
      }
      
      // Format 2: DD/MM/YYYY (date only)
      const ddmmyyyy = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          console.log(`✅ Parsed DD/MM/YYYY: ${date.toISOString().split('T')[0]}`);
          return date.toISOString().split('T')[0];
        }
      }
      
      // Format 3: YYYY-MM-DD (ISO date)
      const isoDate = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (isoDate) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          console.log(`✅ Parsed ISO date: ${date.toISOString().split('T')[0]}`);
          return date.toISOString().split('T')[0];
        }
      }
      
      // Format 4: DD-MM-YYYY with various separators
      const ddmmyyyyDash = dateString.match(/^(\d{1,2})[-.](\d{1,2})[-.](\d{4})$/);
      if (ddmmyyyyDash) {
        const [, day, month, year] = ddmmyyyyDash;
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          console.log(`✅ Parsed DD-MM-YYYY: ${date.toISOString().split('T')[0]}`);
          return date.toISOString().split('T')[0];
        }
      }
      
      // Format 5: Try native Date parsing as last resort
      const nativeDate = new Date(dateString);
      if (!isNaN(nativeDate.getTime())) {
        console.log(`✅ Parsed native: ${nativeDate.toISOString().split('T')[0]}`);
        return nativeDate.toISOString().split('T')[0];
      }
      
    } catch (error) {
      console.error(`❌ Date parsing error for "${dateString}":`, error.message);
    }
    
    console.error(`❌ Failed to parse date: "${dateString}"`);
    return null;
  }

  // ⚠️ UPDATED: Get locomotives dari fault_history table langsung (BUKAN dari table locomotives!)
  static async getLocomotives(req, res) {
    try {
      const locomotives = await FaultHistory.getDistinctLocomotives();

      res.json({
        success: true,
        data: locomotives
      });

    } catch (error) {
      console.error('Error fetching locomotives:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/fault-history/fault-types - Get distinct fault types
  static async getFaultTypes(req, res) {
    try {
      const faultTypes = await FaultHistory.getDistinctFaultTypes();

      res.json({
        success: true,
        data: faultTypes
      });

    } catch (error) {
      console.error('Error fetching fault types:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/fault-history/fault-codes - Get distinct fault codes
  static async getFaultCodes(req, res) {
    try {
      const faultCodes = await FaultHistory.getDistinctFaultCodes();

      res.json({
        success: true,
        data: faultCodes
      });

    } catch (error) {
      console.error('Error fetching fault codes:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = FaultHistoryController;