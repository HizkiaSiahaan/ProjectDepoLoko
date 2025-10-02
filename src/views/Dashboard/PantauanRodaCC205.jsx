import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Divider,
  Select, MenuItem, FormControl, InputLabel, OutlinedInput, Stack, TextField
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';


// Mapping warna background cell sesuai status summary box (dengan alpha transparan)
function getStatusColor(status) {
  switch (status) {
    case 'URGENT':
      return 'rgba(244,67,54,0.08)'; // merah muda summary box
    case 'WARNING':
      return 'rgba(255,152,0,0.10)'; // oranye muda summary box
    case 'NORMAL':
      return 'rgba(76,175,80,0.08)'; // hijau muda summary box
    case 'INVALID':
      return 'rgba(117,117,117,0.10)'; // abu muda summary box
    default:
      return undefined;
  }
}

// Fungsi untuk menentukan status kategori (URGENT, WARNING, NORMAL, INVALID) sesuai param summary box
function getStatusKategori(val, param) {
  const num = Number(val);
  if (isNaN(num)) return 'INVALID';
  if (param === 'DIAMETER') {
    if (num >= 990 && num <= 998) return 'URGENT';
    if (num >= 999 && num <= 1015) return 'WARNING';
    if (num >= 1016 && num <= 1067) return 'NORMAL';
    return 'INVALID';
  }
  if (param === 'F THICKNESS') {
    if (num >= 22 && num <= 23) return 'URGENT';
    if (num >= 24 && num <= 25) return 'WARNING';
    if (num >= 26 && num <= 32) return 'NORMAL';
    return 'INVALID';
  }
  if (param === 'F HEIGHT') {
    if (num === 33) return 'URGENT';
    if (num >= 31 && num <= 32) return 'WARNING';
    if (num >= 28 && num <= 30) return 'NORMAL';
    return 'INVALID';
  }
  return 'INVALID';
}

// Helper untuk menampilkan angka tanpa .00 jika bulat
function formatNumber(val) {
  if (val === null || val === undefined || val === '') return '-';
  const num = Number(val);
  if (isNaN(num)) return '-';
  if (Number.isInteger(num)) return num;
  // Jika angka pecahan, tampilkan maksimal 2 digit desimal
  return num % 1 === 0 ? num : num.toFixed(2).replace(/\.00$/, '');
}

// Fungsi action status sesuai ketentuan user
function getActionStatus(diameter_status, thickness_status) {
  const d = (diameter_status || '').toUpperCase();
  const t = (thickness_status || '').toUpperCase();
  if (d === 'URGENT') return 'GR';
  if (d === 'WARNING' && t === 'URGENT') return 'BGR';
  if (d === 'NORMAL' && t === 'URGENT') return 'B';
  if (d === 'WARNING' && t === 'WARNING') return 'W';
  if (d === 'WARNING' && (t === 'NORMAL' || t === 'INVALID')) return 'W';
  if ((d === 'NORMAL' || d === 'INVALID') && t === 'WARNING') return 'W';
  if (d === 'NORMAL' && t === 'NORMAL') return 'N';
  return 'I';
}

export default function PantauanRodaCC205() {
  // State untuk data dari backend
  const [pantauanData, setPantauanData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  // Fetch data dari backend saat mount
  React.useEffect(() => {
    setLoading(true);
    setError('');
    fetch('/api/pantauan-roda')
      .then(res => res.json())
      .then(data => {
        setPantauanData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError('Gagal mengambil data dari server');
        setPantauanData([]);
        setLoading(false);
      });
  }, []);

  // Fungsi normalisasi nomor loko
  function normalizeLoko(loko) {
    return (loko || '').replace(/\s+/g, '').toUpperCase();
  }

  const formatTanggalJakarta = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Group data by normalized loko
  const groupByLoko = pantauanData.reduce((acc, row) => {
    const normLoko = normalizeLoko(row.loko);
    if (!acc[normLoko]) acc[normLoko] = [];
    acc[normLoko].push({ ...row, normLoko }); // simpan normLoko juga di row
    return acc;
  }, {});

  const statusPriority = ['URGENT', 'WARNING', 'NORMAL', 'INVALID'];

  const mainTableData = Object.entries(groupByLoko).map(([loko, items]) => {
  // Ambil field lifetime dari backend (sudah dikalkulasi controller)
  const latest = items[0];
  return {
    ...latest,
    // fallback jika backend lama
    lifetime_diameter: latest.lifetime_diameter ?? '-',
    lifetime_thickness: latest.lifetime_thickness ?? '-',
  };
});

  // Helper untuk summary dinamis
  const getSummaryData = React.useCallback(() => {
    const statusCount = {
      DIAMETER: { URGENT: 0, WARNING: 0, NORMAL: 0, INVALID: 0 },
      'F THICKNESS': { URGENT: 0, WARNING: 0, NORMAL: 0, INVALID: 0 },
      'F HEIGHT': { URGENT: 0, WARNING: 0, NORMAL: 0, INVALID: 0 },
    };
    // Asumsi: status di mainTableData sudah sesuai status diameter/thickness/height terburuk per inspeksi
    // Hitung status berdasarkan mainTableData
    mainTableData.forEach(row => {
      // DIAMETER
      if (row.diameter_status === 'URGENT') statusCount.DIAMETER.URGENT++;
      else if (row.diameter_status === 'WARNING') statusCount.DIAMETER.WARNING++;
      else if (row.diameter_status === 'NORMAL') statusCount.DIAMETER.NORMAL++;
      else statusCount.DIAMETER.INVALID++;
      // F THICKNESS
      if (row.thickness_status === 'URGENT') statusCount['F THICKNESS'].URGENT++;
      else if (row.thickness_status === 'WARNING') statusCount['F THICKNESS'].WARNING++;
      else if (row.thickness_status === 'NORMAL') statusCount['F THICKNESS'].NORMAL++;
      else statusCount['F THICKNESS'].INVALID++;
      // F HEIGHT
      if (row.height_status === 'URGENT') statusCount['F HEIGHT'].URGENT++;
      else if (row.height_status === 'WARNING') statusCount['F HEIGHT'].WARNING++;
      else if (row.height_status === 'NORMAL') statusCount['F HEIGHT'].NORMAL++;
      else statusCount['F HEIGHT'].INVALID++;
    });
    // Format untuk UI
    const diameterStatus = [
      { label: 'URGENT', color: '#f44336', sub: '(990-998)', value: statusCount.DIAMETER.URGENT },
      { label: 'WARNING', color: '#ff9800', sub: '(999-1015)', value: statusCount.DIAMETER.WARNING },
      { label: 'NORMAL', color: '#4caf50', sub: '(1016-1067)', value: statusCount.DIAMETER.NORMAL },
      { label: 'INVALID', color: '#757575', sub: '(<990/>1067)', value: statusCount.DIAMETER.INVALID },
    ];
    const thicknessStatus = [
      { label: 'URGENT', color: '#f44336', sub: '(22-23)', value: statusCount['F THICKNESS'].URGENT },
      { label: 'WARNING', color: '#ff9800', sub: '(24-25)', value: statusCount['F THICKNESS'].WARNING },
      { label: 'NORMAL', color: '#4caf50', sub: '(26-32)', value: statusCount['F THICKNESS'].NORMAL },
      { label: 'INVALID', color: '#757575', sub: '(<22/>32)', value: statusCount['F THICKNESS'].INVALID },
    ];
    const heightStatus = [
      { label: 'URGENT', color: '#f44336', sub: '(33)', value: statusCount['F HEIGHT'].URGENT },
      { label: 'WARNING', color: '#ff9800', sub: '(31-32)', value: statusCount['F HEIGHT'].WARNING },
      { label: 'NORMAL', color: '#4caf50', sub: '(28-30)', value: statusCount['F HEIGHT'].NORMAL },
      { label: 'INVALID', color: '#757575', sub: '(<28/>33)', value: statusCount['F HEIGHT'].INVALID },
    ];
    return [
      { title: 'DIAMETER', status: diameterStatus },
      { title: 'F THICKNESS', status: thicknessStatus },
      { title: 'F HEIGHT', status: heightStatus },
    ];
  }, [mainTableData]);

  const summaryData = getSummaryData();

  const [openDetail, setOpenDetail] = useState(false);
  const [activeParam, setActiveParam] = useState('DIAMETER');

  // Filter state
  const statusOptions = ['URGENT', 'WARNING', 'NORMAL', 'INVALID', 'EX KKA', 'PANTAUAN RCD'];
  // const uniqueLokos = [...new Set(mainTableData.map(row => row.loko))]; // Dihapus, gunakan uniqueLokos filter detail saja
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLoko, setFilterLoko] = useState('');
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);

  // Unique Lokos untuk filter main table (pakai norm + label asli)
  const uniqueLokosMap = new Map();
  mainTableData.forEach(row => {
    const norm = normalizeLoko(row.loko);
    if (!uniqueLokosMap.has(norm)) uniqueLokosMap.set(norm, row.loko);
  });
  const uniqueLokos = Array.from(uniqueLokosMap.values());

  // Filter logic main table
  const filteredMainTable = mainTableData.filter(row => {
    const statusMatch = filterStatus ? row.status === filterStatus : true;
    const lokoMatch = filterLoko ? normalizeLoko(row.loko) === normalizeLoko(filterLoko) : true;
    const dateMatch = (filterStartDate && filterEndDate)
      ? (new Date(row.date) >= new Date(filterStartDate) && new Date(row.date) <= new Date(filterEndDate))
      : true;
    return statusMatch && lokoMatch && dateMatch;
  });

  // --- DETAIL TABLE DATA: Fetch dari endpoint baru ---
const [detailData, setDetailData] = React.useState([]);
const [loadingDetail, setLoadingDetail] = React.useState(true);
const [errorDetail, setErrorDetail] = React.useState('');

React.useEffect(() => {
  setLoadingDetail(true);
  setErrorDetail('');
  fetch('/api/pantauan-roda/detail')
    .then(res => res.json())
    .then(data => {
      setDetailData(Array.isArray(data) ? data : []);
      setLoadingDetail(false);
      console.log('DEBUG detailData:', data);
    })
    .catch(err => {
      setErrorDetail('Gagal mengambil data detail dari server');
      setDetailData([]);
      setLoadingDetail(false);
    });
}, []);

const posisiList = ['KANAN1','KIRI1','KANAN2','KIRI2','KANAN3','KIRI3','KANAN4','KIRI4','KANAN5','KIRI5','KANAN6','KIRI6'];
const groupedDetail = {};
detailData
  .filter(row => !!row.posisi)
  .forEach(row => {
    const key = row.loko + '|' + row.date;
    if (!groupedDetail[key]) groupedDetail[key] = {};
    // Normalisasi posisi (case insensitive, hilangkan spasi)
    let normPos = (row.posisi||'').toUpperCase().replace(/\s+/g,'');
    if (!posisiList.includes(normPos)) {
      console.warn('Posisi tidak dikenal:', row.posisi, '=>', normPos, 'Data:', row);
    }
    groupedDetail[key][normPos] = row;
  });
const detailTableDataDiameter = Object.entries(groupedDetail).map(([key, posObj], idx) => {
  const [loko, date] = key.split('|');
  return {
    no: idx + 1,
    loko,
    date,
    r: posisiList.map(pos => {
      const val = posObj[pos]?.diameter;
      if (val === undefined || val === null || val === '') return '-';
      return val;
    }),
    r_status: posisiList.map(pos => getStatusKategori(posObj[pos]?.diameter, 'DIAMETER'))
  };
});
const detailTableDataThickness = Object.entries(groupedDetail).map(([key, posObj], idx) => {
  const [loko, date] = key.split('|');
  return {
    no: idx + 1,
    loko,
    date,
    r: posisiList.map(pos => {
      const val = posObj[pos]?.thickness;
      if (val === undefined || val === null || val === '') return '-';
      return val;
    }),
    r_status: posisiList.map(pos => getStatusKategori(posObj[pos]?.thickness, 'F THICKNESS'))
  };
});
const detailTableDataHeight = Object.entries(groupedDetail).map(([key, posObj], idx) => {
  const [loko, date] = key.split('|');
  return {
    no: idx + 1,
    loko,
    date,
    r: posisiList.map(pos => {
      const val = posObj[pos]?.height;
      if (val === undefined || val === null || val === '') return '-';
      return val;
    }),
    r_status: posisiList.map(pos => getStatusKategori(posObj[pos]?.height, 'F HEIGHT'))
  };
});

  // Filter state for detail table
  const [detailFilterLoko, setDetailFilterLoko] = useState('');
  const [detailFilterStartDate, setDetailFilterStartDate] = useState(null);
  const [detailFilterEndDate, setDetailFilterEndDate] = useState(null);
  // Detail table data by param
  const getFilteredDetail = (data) =>
    data.filter(row => {
      const lokoMatch = detailFilterLoko ? normalizeLoko(row.loko) === normalizeLoko(detailFilterLoko) : true;
      const dateMatch = (detailFilterStartDate && detailFilterEndDate)
        ? (new Date(row.date) >= new Date(detailFilterStartDate) && new Date(row.date) <= new Date(detailFilterEndDate))
        : true;
      return lokoMatch && dateMatch;
    });

  // Unique lokos & count for filter (pakai norm + label asli)
  const detailDataSource =
    activeParam === 'DIAMETER' ? detailTableDataDiameter :
    activeParam === 'F THICKNESS' ? detailTableDataThickness :
    activeParam === 'F HEIGHT' ? detailTableDataHeight : [];
  const uniqueDetailLokosMap = new Map();
  detailDataSource.forEach(row => {
    const norm = normalizeLoko(row.loko);
    if (!uniqueDetailLokosMap.has(norm)) uniqueDetailLokosMap.set(norm, { label: row.loko, count: 0 });
    uniqueDetailLokosMap.get(norm).count++;
  });
  const uniqueDetailLokos = Array.from(uniqueDetailLokosMap.values());
  const filteredDetailTable = detailDataSource;

  return (
    <Box sx={{ flexGrow: 1, mt: 2, minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Card sx={{ background: '#f8fafc', color: '#2196f3', borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(13,41,86,0.08)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 120, px: { xs: 2, md: 5 }, py: { xs: 3, md: 4 } }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1e3a8a', mb: 1 }}>
                Pantauan Roda CC205
              </Typography>
              <Typography variant="body1" sx={{ color: '#334155' }}>
                Dashboard monitoring kondisi roda lokomotif CC205
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      {/* Summary Box */}
      <Grid container spacing={3} mb={2}>
        {/* Summary box mengikuti filteredMainTable */}
        {summaryData.map((sum, idx) => (
          <Grid item xs={12} md={4} key={sum.title}>
            <Card sx={{ borderRadius: 4, boxShadow: 3, p: 0 }}>
              <CardContent>
                {['DIAMETER'].includes(sum.title) ? (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      fontWeight: 700,
                      fontSize: 18,
                      background: 'linear-gradient(135deg, #5de0e6, #2563eb)',
                      color: '#fff',
                      borderRadius: 2,
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4ecdc4, #1d4ed8)', // optional hover gradient
                      },
                    }}
                    onClick={() => {
                      setActiveParam('DIAMETER');
                      setOpenDetail(true);
                    }}
                  >
                    Diameter
                  </Button>
                </Box>
                ) : ['F THICKNESS'].includes(sum.title) ? (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        fontSize: 18,
                        background: 'linear-gradient(135deg, #5de0e6, #2563eb)',
                        color: '#fff',
                        borderRadius: 2,
                        py: 1.5,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4ecdc4, #1d4ed8)', // optional hover gradient
                        },
                      }}
                      onClick={() => {
                        setActiveParam('F THICKNESS');
                        setOpenDetail(true);
                      }}
                    >
                      F Thickness
                    </Button>
                  </Box>
                ) : ['F HEIGHT'].includes(sum.title) ? (
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        fontWeight: 700,
                        fontSize: 18,
                      background: 'linear-gradient(135deg, #5de0e6, #2563eb)',
                      color: '#fff',
                      borderRadius: 2,
                      py: 1.5,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4ecdc4, #1d4ed8)', // optional hover gradient
                      },
                    }}
                    onClick={() => {
                      setActiveParam('F HEIGHT');
                      setOpenDetail(true);
                    }}
                  >
                    F Height
                  </Button>
                </Box>
                ) : (
                  <Typography align="center" fontWeight={700} sx={{ bgcolor: '#2563eb', color: '#fff', borderRadius: 2, py: 1, mb: 2, fontSize: 18 }}>
                    {sum.title}
                  </Typography>
                )}

                <Grid container spacing={1}>
                  {(sum.status || []).map((st) => (
                    <Grid item xs={6} md={3} key={st.label}>
                      <Box
                        sx={{
                          bgcolor: st.color,
                          color: '#fff',
                          borderRadius: 2,
                          textAlign: 'center',
                          mb: 1,
                          boxShadow: 1,
                          minHeight: { xs: 72, sm: 90 },
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: 1,
                          overflow: 'hidden',
                          minWidth: 0,
                        }}
                      >
                        <Typography fontWeight={700} fontSize={{ xs: 16, sm: 20, md: 22 }} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{st.value}</Typography>
                        <Typography fontWeight={500} sx={{ fontSize: 'clamp(7.5px, 1.7vw, 11px)', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'normal', lineHeight: 1.15, maxWidth: '100%', flexShrink: 1, minWidth: 0 }}>{st.label}</Typography>
                        <Typography sx={{ fontSize: 'clamp(7px, 1.2vw, 9.5px)', opacity: 0.7, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', wordBreak: 'normal', lineHeight: 1.1, maxWidth: '100%', flexShrink: 1, minWidth: 0 }}>{st.sub}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {/* Main Table */}
      <Box mb={2}>
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2, maxHeight: 400, overflowY: 'auto' }}>
          {/* FILTER MAIN TABLE */}
          <Box px={2} pt={2} pb={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <FormControl sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  input={<OutlinedInput label="Status" />}
                >
                  <MenuItem value=""><em>Semua</em></MenuItem>
                  {statusOptions.map(opt => (
                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel>Seri Lokomotif</InputLabel>
                <Select
                  value={filterLoko}
                  onChange={e => setFilterLoko(e.target.value)}
                  input={<OutlinedInput label="Seri Lokomotif" />}
                >
                  <MenuItem value=""><em>Semua</em></MenuItem>
                  {uniqueLokos.map(loko => (
                    <MenuItem key={loko} value={loko}>{loko}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="Tanggal Awal"
                value={filterStartDate}
                onChange={setFilterStartDate}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
                format="yyyy-MM-dd"
              />
              <DatePicker
                label="Tanggal Akhir"
                value={filterEndDate}
                onChange={setFilterEndDate}
                slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
                format="yyyy-MM-dd"
              />
              <Button variant="outlined" size="small" onClick={() => { setFilterStatus(''); setFilterLoko(''); setFilterStartDate(null); setFilterEndDate(null); }}>Reset</Button>
            </Stack>
          </Box>
          <Table size="small" stickyHeader>
            <TableHead stickyHeader>
              <TableRow>
                <TableCell sx={{ background: '#2196f3', color: '#fff', fontWeight: 700 }}>No.</TableCell>
                <TableCell sx={{ background: '#2196f3', color: '#fff', fontWeight: 700 }}>LOCOMOTIVE NUMBER</TableCell>
                <TableCell sx={{ background: '#2196f3', color: '#fff', fontWeight: 700 }}>INSPECTION DATE</TableCell>
                <TableCell sx={{ background: '#2196f3', color: '#fff', fontWeight: 700 }}>MIN DIAMETER</TableCell>
                <TableCell sx={{ background: '#2196f3', color: '#fff', fontWeight: 700 }}>MIN FLANGE THICKNESS</TableCell>
                <TableCell sx={{ background: '#2196f3', color: '#fff', fontWeight: 700 }}>MIN FLANGE HEIGHT</TableCell>
                <TableCell sx={{ background: '#2196f3', color: '#fff', fontWeight: 700 }}>ACTION STATUS</TableCell>
                <TableCell sx={{ background: '#2196f3', color: '#fff', fontWeight: 700 }}>EST. LIFETIME DIAMETER (HARI)</TableCell>
                <TableCell sx={{ background: '#2196f3', color: '#fff', fontWeight: 700 }}>EST. LIFETIME THICKNESS (HARI)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
               {filteredMainTable.map((row, idx) => (
                <TableRow key={row.id || idx}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{row.loko}</TableCell>
                  <TableCell>{formatTanggalJakarta(row.date)}</TableCell>
                  <TableCell sx={{ bgcolor: getStatusColor(row.diameter_status) }}>
                    {formatNumber(row.diameter)}
                  </TableCell>
                  <TableCell sx={{ bgcolor: getStatusColor(row.thickness_status) }}>
                    {formatNumber(row.thickness)}
                  </TableCell>
                  <TableCell sx={{ bgcolor: getStatusColor(row.height_status) }}>
                    {formatNumber(row.height)}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 200, fontSize: 16 }}>
                    {getActionStatus(row.diameter_status, row.thickness_status)}
                  </TableCell>
                  <TableCell>{formatNumber(row.lifetime_diameter)}</TableCell>
                  <TableCell>{formatNumber(row.lifetime_thickness)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      {/* Tombol detail di box F HEIGHT */}
      <Box>
        {/* Inline detail parameter */}
        {openDetail && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              {/* FILTER DETAIL TABLE */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
                <FormControl size="small" sx={{ minWidth: 220, mr: 2 }}>
                  <InputLabel id="filter-loko-label">Seri Lokomotif</InputLabel>
                  <Select
                    labelId="filter-loko-label"
                    value={detailFilterLoko}
                    label="Seri Lokomotif"
                    onChange={e => setDetailFilterLoko(e.target.value)}
                    input={<OutlinedInput label="Seri Lokomotif" />}
                    renderValue={selected => {
                      if (!selected) return 'Semua Lokomotif';
                      const count = filteredDetailTable.filter(row => row.loko === selected).length;
                      return `${selected} (${count})`;
                    }}
                  >
                    <MenuItem value="">Semua Lokomotif</MenuItem>
                    {uniqueDetailLokos.map(({label, count}) => (
                      <MenuItem key={normalizeLoko(label)} value={label}>{`${label} (${count})`}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <DatePicker
                  label="Tanggal Awal"
                  value={detailFilterStartDate}
                  onChange={setDetailFilterStartDate}
                  slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
                  format="yyyy-MM-dd"
                />
                <DatePicker
                  label="Tanggal Akhir"
                  value={detailFilterEndDate}
                  onChange={setDetailFilterEndDate}
                  slotProps={{ textField: { size: 'small', sx: { minWidth: 140 } } }}
                  format="yyyy-MM-dd"
                />
                <Button variant="outlined" size="small" onClick={() => { setDetailFilterLoko(''); setDetailFilterStartDate(null); setDetailFilterEndDate(null); }}>Reset</Button>
                <Button variant="outlined" size="small" onClick={() => setOpenDetail(false)}>Tutup</Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
               <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 1, maxHeight: 400, overflowY: 'auto' }}>
                 <Table size="small" stickyHeader>
                  <TableHead stickyHeader>
                    <TableRow sx={{ bgcolor: '#8bb6ff' }}>
                      <TableCell sx={{ fontWeight: 700 }}>LOKOMOTIF</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>TANGGAL</TableCell>
                      {activeParam === 'DIAMETER' && Array.from({length: 6}).map((_, idx) => [
                        <TableCell key={`r${idx+1}kiri`} sx={{ fontWeight: 700 }}>{`R${idx+1} Kiri`}</TableCell>,
                        <TableCell key={`r${idx+1}kanan`} sx={{ fontWeight: 700 }}>{`R${idx+1} Kanan`}</TableCell>
                      ])}
                      {activeParam === 'F THICKNESS' && Array.from({length: 6}).map((_, idx) => [
                        <TableCell key={`r${idx+1}kiri`} sx={{ fontWeight: 700 }}>{`R${idx+1} Kiri`}</TableCell>,
                        <TableCell key={`r${idx+1}kanan`} sx={{ fontWeight: 700 }}>{`R${idx+1} Kanan`}</TableCell>
                      ])}
                      {activeParam === 'F HEIGHT' && Array.from({length: 6}).map((_, idx) => [
                        <TableCell key={`r${idx+1}kiri`} sx={{ fontWeight: 700 }}>{`R${idx+1} Kiri`}</TableCell>,
                        <TableCell key={`r${idx+1}kanan`} sx={{ fontWeight: 700 }}>{`R${idx+1} Kanan`}</TableCell>
                      ])}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredDetail(
                      activeParam === 'DIAMETER' ? detailTableDataDiameter :
                      activeParam === 'F THICKNESS' ? detailTableDataThickness :
                      activeParam === 'F HEIGHT' ? detailTableDataHeight :
                      []
                    ).map((row) => (
                      <TableRow key={row.no}>
                        <TableCell>{row.loko}</TableCell>
                        <TableCell>{formatTanggalJakarta(row.date)}</TableCell>
                        {Array.from({ length: 6 }).flatMap((_, idx) => [
                          <TableCell
                            key={`r${idx + 1}kiri`}
                            sx={{ bgcolor: getStatusColor(row.r_status?.[idx * 2]), fontWeight: 600 }}
                          >
                            {formatNumber(row.r[idx * 2])}
                          </TableCell>,
                          <TableCell
                            key={`r${idx + 1}kanan`}
                            sx={{ bgcolor: getStatusColor(row.r_status?.[idx * 2 + 1]), fontWeight: 600 }}
                          >
                            {formatNumber(row.r[idx * 2 + 1])}
                          </TableCell>
                        ])}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {(activeParam === 'DIAMETER' && detailTableDataDiameter.length === 0 ||
                activeParam === 'F THICKNESS' && detailTableDataThickness.length === 0 ||
                activeParam === 'F HEIGHT' && detailTableDataHeight.length === 0) && (
                <Typography align="center" sx={{ mt: 2 }}>
                  Belum ada data
                </Typography>
              )}
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
