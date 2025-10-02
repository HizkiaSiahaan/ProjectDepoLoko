// services/FaultHistoryService.js - UPDATED for locomotive_number schema
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

class FaultHistoryService {
  
  /**
   * Get fault history data with filters and pagination
   */
  static async getFaultHistory(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          if (Array.isArray(filters[key]) && filters[key].length > 0) {
            queryParams.append(key, filters[key].join(','));
          } else if (!Array.isArray(filters[key])) {
            queryParams.append(key, filters[key]);
          }
        }
      });

      const url = `${API_BASE_URL}/fault-history?${queryParams.toString()}`;
      console.log('📡 Fetching fault history:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch fault history');
      }

      return {
        data: result.data || [],
        pagination: result.pagination || { total: 0, page: 1, pages: 1 }
      };

    } catch (error) {
      console.error('❌ Error fetching fault history:', error);
      throw error;
    }
  }

  /**
   * Get summary counters for dashboard tables
   */
  static async getSummaryCounters(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          if (Array.isArray(filters[key]) && filters[key].length > 0) {
            queryParams.append(key, filters[key].join(','));
          } else if (!Array.isArray(filters[key])) {
            queryParams.append(key, filters[key]);
          }
        }
      });

      const url = `${API_BASE_URL}/fault-history/summary?${queryParams.toString()}`;
      console.log('📡 Fetching summary counters:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch summary counters');
      }

      return result.data || {};

    } catch (error) {
      console.error('❌ Error fetching summary counters:', error);
      throw error;
    }
  }

  /**
   * ⚠️ UPDATED: Get locomotives dari fault_history table (bukan dari table locomotives)
   */
  static async getLocomotives() {
    try {
      const url = `${API_BASE_URL}/fault-history/locomotives`;
      console.log('📡 Fetching locomotives from fault_history:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch locomotives');
      }

      // ⚠️ Transform data untuk sesuai dengan format yang diharapkan frontend
      // Backend return: ['CC205 13 18', 'CC205 21 27', ...]
      // Frontend expect: [{ locomotive_number: 'CC205 13 18' }, ...]
      const locomotives = result.data.map(locoNumber => ({
        locomotive_number: locoNumber
      }));

      return locomotives;

    } catch (error) {
      console.error('❌ Error fetching locomotives:', error);
      throw error;
    }
  }

  /**
   * Get distinct fault types for dropdown
   */
  static async getFaultTypes() {
    try {
      const url = `${API_BASE_URL}/fault-history/fault-types`;
      console.log('📡 Fetching fault types:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch fault types');
      }

      return result.data || [];

    } catch (error) {
      console.error('❌ Error fetching fault types:', error);
      throw error;
    }
  }

  /**
   * Get distinct fault codes for dropdown
   */
  static async getFaultCodes() {
    try {
      const url = `${API_BASE_URL}/fault-history/fault-codes`;
      console.log('📡 Fetching fault codes:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch fault codes');
      }

      return result.data || [];

    } catch (error) {
      console.error('❌ Error fetching fault codes:', error);
      throw error;
    }
  }

  /**
   * Import CSV file
   */
  static async importCSV(file) {
    try {
      const formData = new FormData();
      formData.append('csvFile', file); // ⚠️ Make sure parameter name matches backend

      console.log('📡 Uploading CSV file:', file.name);

      const response = await fetch(`${API_BASE_URL}/fault-history/import`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to import CSV');
      }

      console.log('✅ CSV import successful:', result);
      return result;

    } catch (error) {
      console.error('❌ Error importing CSV:', error);
      throw error;
    }
  }

  /**
   * Format date for API (YYYY-MM-DD format)
   */
  static formatDateForAPI(date) {
    if (!date) return null;
    
    // Handle Date object
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    
    // Handle string dates
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    }
    
    return null;
  }

  /**
   * ⚠️ UPDATED: Build filters object for API dari component state (sesuai dengan parameter backend yang baru)
   */
  static buildFilters({
    startDate,
    endDate,
    selectedLocos = [],
    selectedFaultTypes = [],
    selectedFaultCodes = [],
    selectedPriorityLevels = [],
    page = 1,
    limit = 50
  }) {
    const filters = {
      page,
      limit
    };

    // Add date filters
    if (startDate) {
      filters.startDate = this.formatDateForAPI(startDate);
    }
    if (endDate) {
      filters.endDate = this.formatDateForAPI(endDate);
    }

    // ⚠️ UPDATED: Parameter names sesuai dengan backend yang baru
    if (selectedLocos.length > 0) {
      filters.locomotiveNumbers = selectedLocos; // ⚠️ CHANGED from locomotiveIds to locomotiveNumbers
    }
    if (selectedFaultTypes.length > 0) {
      filters.faultTypes = selectedFaultTypes; // ⚠️ CHANGED from faultType to faultTypes
    }
    if (selectedFaultCodes.length > 0) {
      filters.faultCodes = selectedFaultCodes; // ⚠️ CHANGED from faultCode to faultCodes
    }
    if (selectedPriorityLevels.length > 0) {
      filters.priorityLevels = selectedPriorityLevels; // ⚠️ NEW parameter
    }

    console.log('🔧 Built filters for API:', filters);
    return filters;
  }
}

export default FaultHistoryService;