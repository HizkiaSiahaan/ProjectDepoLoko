import React, { useState, useEffect, useCallback } from 'react';
import {
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormControlLabel,
  Button,
  FormControl,
  InputLabel,
  OutlinedInput,
  ListItemText,
  Select,
  MenuItem,
  Card,
  CardContent,
  TextField,
  Popover,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ReferenceLine,
  Legend,
} from 'recharts';

// Import service
import FaultHistoryService from '../../services/FaultHistoryService';

// Pareto Chart Component
function ParetoChart({ data, loading }) {
  if (loading) {
    return (
      <Card sx={{ mt: 3, mb: 3, boxShadow: 2, borderRadius: 2, minHeight: 400 }}>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 350 }}>
          <CircularProgress size={50} />
        </CardContent>
      </Card>
    );
  }

  // Group by description and sum counters
  const grouped = data.reduce((acc, row) => {
    const desc = row.fault_description || row.description || 'Unknown';
    if (!acc[desc]) {
      acc[desc] = { label: desc, count: 0 };
    }
    acc[desc].count += row.counter ? Number(row.counter) : 1;
    return acc;
  }, {});

  const rawData = Object.values(grouped).sort((a, b) => b.count - a.count);
  
  // Calculate cumulative percent
  const total = rawData.reduce((sum, d) => sum + d.count, 0);
  
  if (total === 0) {
    return (
      <Card sx={{ mt: 3, mb: 3, boxShadow: 2, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            PARETO CHART
          </Typography>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography variant="body1" color="text.secondary">
              No data available for chart
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  let cumulative = 0;
  const chartData = rawData.map((d) => {
    cumulative += d.count;
    return {
      ...d,
      cumulativePercent: ((cumulative / total) * 100).toFixed(1),
    };
  });

  return (
    <Card sx={{ mt: 3, mb: 3, boxShadow: 2, borderRadius: 2, overflow: 'visible', maxWidth: '100%' }}>
      <CardContent sx={{ pb: 2 }}>
        <Box display="flex" flexDirection="column" alignItems="flex-start" mb={1}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            PARETO CHART
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            * note : untuk pilihan spesifik bisa klik konten yg ada pada tabel maupun chart, atau gunakan tab 'period & filters'
          </Typography>
        </Box>
        <Box sx={{ width: '100%', maxHeight: 700, overflowX: 'auto', overflowY: 'auto', p: 0, mt: 0, display: 'block' }}>
          <Box sx={{ minWidth: { xs: 600, sm: 900, md: 1200 }, width: '100%' }}>
            <ResponsiveContainer width="100%" height={window.innerWidth < 600 ? 320 : 500}>
              <BarChart
                data={chartData}
                margin={{ top: 30, right: 50, left: 25, bottom: 80 }}
                barCategoryGap={"10%"}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  angle={-45}
                  textAnchor="end"
                  height={90}
                  interval={0}
                  tick={{ fontSize: 13, fontWeight: 500 }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 13 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 13 }}
                />
                <Tooltip
                  contentStyle={{ fontSize: 13 }}
                  formatter={(value, name) => name === 'cumulativePercent' ? `${value}%` : value}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ top: 0, right: 30, fontWeight: 700, fontSize: 13 }}
                />
                <ReferenceLine
                  yAxisId="right"
                  y={80}
                  label={{ value: '80%', position: 'right', fill: '#222', fontWeight: 700, fontSize: 13 }}
                  stroke="#616161"
                  strokeDasharray="5 5"
                />
                <Bar
                  yAxisId="left"
                  dataKey="count"
                  fill="#b71c1c"
                  name="Total Count"
                  label={{ position: "top", fill: "black", fontSize: 12, fontWeight: 700 }}
                  maxBarSize={32}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cumulativePercent"
                  stroke="#6a1b9a"
                  strokeWidth={3}
                  dot={{ r: 3, stroke: '#6a1b9a', fill: '#fff', strokeWidth: 2 }}
                  name="Cumulative"
                  activeDot={{ r: 5 }}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// Summary Table Component
function SummaryTable({ title, columns, rows, page, setPage, total, color, perPage, loading }) {
  if (loading) {
    return (
      <Paper sx={{ borderRadius: 2, boxShadow: 3, minHeight: 270 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={270}>
          <CircularProgress size={30} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, boxShadow: 3 }}>
      <TableContainer sx={{ minHeight: 270, maxHeight: 270, display: 'flex', flexDirection: 'column', justifyContent: 'stretch' }}>
        <Table stickyHeader size="small" sx={{ flex: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ backgroundColor: color, color: '#fff', fontWeight: 'bold', fontSize: 16, borderTopLeftRadius: 8, borderTopRightRadius: 8 }}>{title}</TableCell>
            </TableRow>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.key} align={col.key === 'counter' || col.key === 'count' ? 'right' : 'left'} sx={{ backgroundColor: color, color: '#fff', fontWeight: 'bold', fontSize: 15 }}>{col.label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={idx} hover>
                {columns.map(col => (
                  <TableCell key={col.key} align={col.key === 'counter' || col.key === 'count' ? 'right' : 'left'} sx={{ fontWeight: col.key === 'counter' || col.key === 'count' ? 700 : 400 }}>
                    {row[col.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 0.5, background: '#f5f5f5', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
        <IconButton size="small" onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}>
          {'<'}
        </IconButton>
        <Typography variant="caption" sx={{ mx: 1 }}>{`${page * perPage + 1} - ${Math.min((page + 1) * perPage, total)} / ${total}`}</Typography>
        <IconButton size="small" onClick={() => setPage(p => Math.min(p + 1, Math.ceil(total / perPage) - 1))} disabled={(page + 1) * perPage >= total}>
          {'>'}
        </IconButton>
      </Box>
    </Paper>
  );
}

export default function FaultHistory() {
  // Main data states
  const [faultData, setFaultData] = useState([]);
  const [summaryData, setSummaryData] = useState({});
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [importLoading, setImportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Filter states
  const [startDate, setStartDate] = useState(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState(new Date());
  const [includeToday, setIncludeToday] = useState(false);
  
  // ⚠️ NEW: Date Popover State
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Selection states
  const [selectedLocos, setSelectedLocos] = useState([]);
  const [selectedFaultTypes, setSelectedFaultTypes] = useState([]);
  const [selectedFaultCodes, setSelectedFaultCodes] = useState([]);
  const [selectedPriorityLevels, setSelectedPriorityLevels] = useState([]);

  // Dropdown options
  const [locomotives, setLocomotives] = useState([]);
  const [faultTypes, setFaultTypes] = useState([]);
  const [faultCodes, setFaultCodes] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);

  // Summary table pagination
  const [locoPage, setLocoPage] = useState(0);
  const [typePage, setTypePage] = useState(0);
  const [codePage, setCodePage] = useState(0);
  const perPage = 5;

  // ⚠️ NEW: Date Popover Handlers (SESUAI PERFORMANCE PAGE)
  const handleOpenPopover = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
  };

  // Load dropdown options
  const loadDropdownOptions = useCallback(async () => {
    try {
      const [locos, types, codes] = await Promise.all([
        FaultHistoryService.getLocomotives(),
        FaultHistoryService.getFaultTypes(),
        FaultHistoryService.getFaultCodes()
      ]);

      setLocomotives(locos);
      setFaultTypes(types);
      setFaultCodes(codes);
      
      // Extract unique priority levels from fault data (since this comes from main data)
      const uniquePriorities = [...new Set(faultData.map(item => 
        item.priority_level?.toString() || 'null'
      ))];
      setPriorityLevels(uniquePriorities);

    } catch (err) {
      console.error('Error loading dropdown options:', err);
      setError('Failed to load filter options');
    }
  }, [faultData]);

  // Load main fault data
  const loadFaultData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = FaultHistoryService.buildFilters({
        startDate,
        endDate,
        selectedLocos,
        selectedFaultTypes,
        selectedFaultCodes,
        selectedPriorityLevels,
        page: 1,
        limit: 1000 // Get more data for frontend processing
      });

      console.log('🔄 Loading fault data with filters:', filters);

      const result = await FaultHistoryService.getFaultHistory(filters);
      
      setFaultData(result.data || []);
      setPagination(result.pagination || { total: 0, page: 1, pages: 1 });

    } catch (err) {
      console.error('Error loading fault data:', err);
      setError(err.message || 'Failed to load fault history data');
      setFaultData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, selectedLocos, selectedFaultTypes, selectedFaultCodes, selectedPriorityLevels]);

  // Load summary data
  const loadSummaryData = useCallback(async () => {
    try {
      setSummaryLoading(true);

      const filters = FaultHistoryService.buildFilters({
        startDate,
        endDate,
        selectedLocos,
        selectedFaultTypes,
        selectedFaultCodes,
        selectedPriorityLevels
      });

      console.log('🔄 Loading summary data with filters:', filters);

      const summary = await FaultHistoryService.getSummaryCounters(filters);
      setSummaryData(summary);

    } catch (err) {
      console.error('Error loading summary data:', err);
      // Don't show error for summary since main data is more important
    } finally {
      setSummaryLoading(false);
    }
  }, [startDate, endDate, selectedLocos, selectedFaultTypes, selectedFaultCodes, selectedPriorityLevels]);

  // Initial data load
  useEffect(() => {
    loadFaultData();
  }, [loadFaultData]);

  // Load summary data
  useEffect(() => {
    loadSummaryData();
  }, [loadSummaryData]);

  // Load dropdown options after initial data load
  useEffect(() => {
    loadDropdownOptions();
  }, [loadDropdownOptions]);

  // Handle CSV import
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setImportLoading(true);
      setError(null);

      const result = await FaultHistoryService.importCSV(file);
      
      setSuccessMessage(`CSV import successful! ${result.stats?.success_count || 0} records imported.`);
      
      // Reload data after successful import
      loadFaultData();
      loadSummaryData();

    } catch (err) {
      console.error('Error importing CSV:', err);
      setError(err.message || 'Failed to import CSV file');
    } finally {
      setImportLoading(false);
      // Clear file input
      e.target.value = '';
    }
  };

  // Filter handlers
  const handleLocoChange = (event) => {
    const value = event.target.value;
    setSelectedLocos(typeof value === 'string' ? value.split(',') : value);
  };

  const handleFaultTypeChange = (event) => {
    const value = event.target.value;
    setSelectedFaultTypes(typeof value === 'string' ? value.split(',') : value);
  };

  const handleFaultCodeChange = (event) => {
    const value = event.target.value;
    setSelectedFaultCodes(typeof value === 'string' ? value.split(',') : value);
  };

  const handlePriorityLevelChange = (event) => {
    const value = event.target.value;
    setSelectedPriorityLevels(typeof value === 'string' ? value.split(',') : value);
  };

  // Generate summary tables data from main data
  const generateSummaryData = () => {
    // LOCO NUMBER summary
    const locoSummary = Object.entries(
      faultData.reduce((acc, row) => {
        const loco = row.locomotive_number || row.loco || 'Unknown';
        acc[loco] = (acc[loco] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([loco, counter]) => ({ loco, counter }))
      .sort((a, b) => b.counter - a.counter);

    // FAULT TYPE summary
    const typeSummary = Object.entries(
      faultData.reduce((acc, row) => {
        const type = row.fault_type || row.type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    // FAULT CODE summary
    const codeSummary = Object.values(
      faultData.reduce((acc, row) => {
        const code = row.fault_code || row.code || 'Unknown';
        const description = row.fault_description || row.description || 'Unknown';
        if (!acc[code]) acc[code] = { code, description, count: 0 };
        acc[code].count += 1;
        return acc;
      }, {})
    ).sort((a, b) => b.count - a.count);

    return { locoSummary, typeSummary, codeSummary };
  };

  const { locoSummary, typeSummary, codeSummary } = generateSummaryData();
  const topLocoRows = locoSummary.slice(locoPage * perPage, locoPage * perPage + perPage);
  const topTypeRows = typeSummary.slice(typePage * perPage, typePage * perPage + perPage);
  const topCodeRows = codeSummary.slice(codePage * perPage, codePage * perPage + perPage);

  // Handle refresh
  const handleRefresh = () => {
    loadFaultData();
    loadSummaryData();
    loadDropdownOptions();
  };

  return (
    <Box p={4}>
      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Snackbar */}
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={4000} 
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Import Button Area - SESUAI PERFORMANCE PAGE */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button
          component="label"
          variant="contained"
          startIcon={importLoading ? <CircularProgress size={16} color="inherit" /> : <UploadFileIcon />}
          disabled={importLoading}
          sx={{ 
            minWidth: 120, 
            backgroundColor: '#2563eb', 
            color: '#fff', 
            boxShadow: 1, 
            textTransform: 'none', 
            mr: 2 
          }}
        >
          {importLoading ? 'Importing...' : 'Import'}
          <input
            type="file"
            accept=".csv"
            hidden
            onChange={handleImport}
            disabled={importLoading}
          />
        </Button>
      </Box>

      {/* Pareto Chart */}
      <ParetoChart data={faultData} loading={loading} />

      {/* LAYOUT HORIZONTAL KOMPAK - SESUAI PERFORMANCE PAGE */}
      <Box display="flex" flexWrap="wrap" gap={4} mb={2} alignItems="center">
        {/* Refresh Button */}
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={loading}
          sx={{ 
            minWidth: 120,
            height: 56 // ⚠️ KONSISTEN HEIGHT
          }}
        >
          {loading ? 'Loading...' : 'Refresh'}
        </Button>

        {/* ⚠️ DATE PICKER DENGAN POPOVER ORANGE - SESUAI PERFORMANCE PAGE */}
        <TextField
          label="Filter by Date"
          variant="outlined"
          value={
            startDate && endDate
              ? `${format(startDate, "dd MMM yyyy")} - ${format(endDate, "dd MMM yyyy")}`
              : ""
          }
          onClick={handleOpenPopover}
          InputProps={{ readOnly: true }}
          sx={{ minWidth: 250, height: 56 }} // ⚠️ KONSISTEN HEIGHT
        />

        {/* ⚠️ POPOVER ORANGE - SESUAI PERFORMANCE PAGE! */}
        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          PaperProps={{
            sx: {
              p: 2,
              backgroundColor: "#ffa726", // ⚠️ ORANGE SESUAI PERFORMANCE PAGE!
              borderRadius: 2,
              boxShadow: 3,
              width: 300,
            },
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={includeToday}
                onChange={(e) => setIncludeToday(e.target.checked)}
              />
            }
            label="Include today"
          />
          <Box mb={2}>
            <Typography variant="subtitle2">Start Date</Typography>
            <DatePicker
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              format="dd MMM yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    backgroundColor: "#fff", // ⚠️ WHITE BACKGROUND SESUAI PERFORMANCE
                    borderRadius: 1,
                    width: "100%",
                  },
                },
              }}
            />
          </Box>
          <Box mb={2}>
            <Typography variant="subtitle2">End Date</Typography>
            <DatePicker
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              format="dd MMM yyyy"
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    backgroundColor: "#fff", // ⚠️ WHITE BACKGROUND SESUAI PERFORMANCE
                    borderRadius: 1,
                    width: "100%",
                  },
                },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: "#fff", textAlign: "center" }}>
            Range:{" "}
            {startDate ? format(startDate, "dd MMM yyyy") : "-"} -{" "}
            {endDate ? format(endDate, "dd MMM yyyy") : "-"}
          </Typography>
        </Popover>

        {/* ⚠️ LOCOMOTIVE DROPDOWN - KONSISTEN HEIGHT & WIDTH */}
        <FormControl sx={{ minWidth: 200, height: 56 }}>
          <InputLabel id="loco-filter-label">Locomotive Number</InputLabel>
          <Select
            labelId="loco-filter-label"
            multiple
            value={selectedLocos}
            onChange={handleLocoChange}
            input={<OutlinedInput label="Locomotive Number" />}
            renderValue={(selected) =>
              selected.length === 0
                ? ''
                : selected.length === 1
                  ? selected[0]
                  : `${selected.length} dipilih`
            }
            sx={{ height: 56 }}
          >
            {locomotives.map((loco) => (
              <MenuItem key={loco.locomotive_number} value={loco.locomotive_number}>
                <Checkbox checked={selectedLocos.indexOf(loco.locomotive_number) > -1} />
                <ListItemText primary={loco.locomotive_number} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ⚠️ FAULT TYPE DROPDOWN - KONSISTEN HEIGHT & WIDTH */}
        <FormControl sx={{ minWidth: 200, height: 56 }}>
          <InputLabel id="fault-type-filter-label">Fault Type</InputLabel>
          <Select
            labelId="fault-type-filter-label"
            multiple
            value={selectedFaultTypes}
            onChange={handleFaultTypeChange}
            input={<OutlinedInput label="Fault Type" />}
            renderValue={(selected) =>
              selected.length === 0
                ? ''
                : selected.length === 1
                  ? selected[0]
                  : `${selected.length} dipilih`
            }
            sx={{ height: 56 }}
          >
            {faultTypes.map((type) => (
              <MenuItem key={type} value={type}>
                <Checkbox checked={selectedFaultTypes.indexOf(type) > -1} />
                <ListItemText primary={type} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* ⚠️ FAULT CODE DROPDOWN - HANYA TAMPILKAN CODE (TIDAK DESCRIPTION) */}
        <FormControl sx={{ minWidth: 200, height: 56 }}>
          <InputLabel id="fault-code-filter-label">Fault Code</InputLabel>
          <Select
            labelId="fault-code-filter-label"
            multiple
            value={selectedFaultCodes}
            onChange={handleFaultCodeChange}
            input={<OutlinedInput label="Fault Code" />}
            renderValue={(selected) =>
              selected.length === 0
                ? ''
                : selected.length === 1
                  ? selected[0]
                  : `${selected.length} dipilih`
            }
            sx={{ height: 56 }}
          >
            {faultCodes.map((code) => (
              <MenuItem key={code.fault_code} value={code.fault_code}>
                <Checkbox checked={selectedFaultCodes.indexOf(code.fault_code) > -1} />
                {/* ⚠️ HANYA TAMPILKAN CODE, TIDAK DESCRIPTION */}
                <ListItemText primary={code.fault_code} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Tables */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* LOCO NUMBER TABLE */}
        <Grid item xs={12} md={4}>
          <SummaryTable
            title="LOCO NUMBER"
            columns={[{ label: 'LOCO NUMBER', key: 'loco' }, { label: 'COUNTER', key: 'counter' }]}
            rows={topLocoRows}
            page={locoPage}
            setPage={setLocoPage}
            total={locoSummary.length}
            color="#43a047"
            perPage={5}
            loading={loading}
          />
        </Grid>
        {/* FAULT TYPE TABLE */}
        <Grid item xs={12} md={4}>
          <SummaryTable
            title="FAULT TYPE"
            columns={[{ label: 'FAULT TYPE', key: 'type' }, { label: 'COUNTER', key: 'count' }]}
            rows={topTypeRows}
            page={typePage}
            setPage={setTypePage}
            total={typeSummary.length}
            color="#1976d2"
            perPage={5}
            loading={loading}
          />
        </Grid>
        {/* FAULT CODE TABLE */}
        <Grid item xs={12} md={4}>
          <SummaryTable
            title="FAULT CODE"
            columns={[{ label: 'FAULT CODE', key: 'code' }, { label: 'DESCRIPTION', key: 'description' }, { label: 'COUNTER', key: 'count' }]}
            rows={topCodeRows}
            page={codePage}
            setPage={setCodePage}
            total={codeSummary.length}
            color="#8e24aa"
            perPage={5}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Main Data Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#2563eb !important' }}>
              {[
                'No',
                'Locomotive Number',
                'Fault Type',
                'Fault Code',
                'Fault Description',
                'Priority Level',
                'Priority Description',
                'Date Occurred',
                'Counter',
              ].map((header) => (
                <TableCell
                  key={header}
                  sx={{
                    color: '#fff',
                    fontWeight: 'bold',
                    backgroundColor: '#2563eb !important',
                  }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Loading fault history data...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : faultData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No data available. Try adjusting your filters or import a CSV file.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              faultData.map((row, index) => (
                <TableRow key={row.id || index} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{row.locomotive_number || row.loco || '-'}</TableCell>
                  <TableCell>{row.fault_type || row.type || '-'}</TableCell>
                  <TableCell>{row.fault_code || row.code || '-'}</TableCell>
                  <TableCell>{row.fault_description || row.description || '-'}</TableCell>
                  <TableCell align="center">{row.priority_level || row.priorityLevel || '-'}</TableCell>
                  <TableCell>{row.priority_description || row.priorityDesc || '-'}</TableCell>
                  <TableCell>{row.date_occurred ? format(new Date(row.date_occurred), 'dd MMM yyyy') : '-'}</TableCell>
                  <TableCell align="center">{row.counter || 1}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Data Summary */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Total Records: {pagination.total || faultData.length}
        </Typography>
        {pagination.total > 0 && (
          <Typography variant="body2" color="text.secondary">
            Showing: {faultData.length} records
          </Typography>
        )}
      </Box>
    </Box>
  );
}