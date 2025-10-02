import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  EventAvailable as EventIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ManpowerDataManage() {
  const [manpowerTable, setManpowerTable] = React.useState([]);
  const [loadingManpower, setLoadingManpower] = React.useState(true);
  const [errorManpower, setErrorManpower] = React.useState('');

  const [showDetail, setShowDetail] = useState(false);
  const [detailKategori, setDetailKategori] = useState('');
  const [detailTitle, setDetailTitle] = useState('');

  React.useEffect(() => {
    const fetchManpower = async () => {
      setLoadingManpower(true);
      setErrorManpower('');
      try {
        const res = await fetch('/api/manpower');
        if (!res.ok) throw new Error('Gagal mengambil data manpower');
        const data = await res.json();
        setManpowerTable(normalizeManpowerData(data));
      } catch (err) {
        setErrorManpower(err.message || 'Gagal mengambil data manpower');
        setManpowerTable([]);
      } finally {
        setLoadingManpower(false);
      }
    };
    fetchManpower();
  }, []);

  // === Dynamic summary & chart data from manpowerTable ===
  const jabatanList = [
    'Kepala UPT',
    'Supervisor',
    'Pengawas Gudang',
    'Teknisi Gudang',
    'Pengawas Fasilitas',
    'Teknisi Fasilitas',
    'Pengawas LOS',
    'MC Crew',
    'BKO MSA',
    'Pengawas DC',
    'DC Crew',
    'Calon Teknisi',
    'Calon Pegawai',
    'KAI Service',
  ];
  const totalManpower = jabatanList.map(label => {
    let value = 0;
    manpowerTable.forEach(row => {
      const jabatan = (row.jabatan || '').toLowerCase();
      const regu = (row.regu || '').toLowerCase();
      if (label === 'Supervisor') {
        if (jabatan.includes('supervisor')) value++;
      } else if (label === 'MC Crew') {
        // MC Crew = jabatan mengandung 'mc crew' atau 'teknisi los'
        if (jabatan.includes('mc crew') || jabatan.includes('teknisi los')) value++;
      } else if (label === 'Calon Pegawai') {
        // Calon Pegawai = jabatan mengandung 'calon pegawai' atau 'calon pekerja'
        if (jabatan.includes('calon pegawai') || jabatan.includes('calon pekerja')) value++;
      } else if (label === 'BKO MSA') {
        // BKO MSA = regu mengandung 'bko msa', data bisa double jika juga jabatan teknisi los
        if (regu.includes('bko msa')) value++;
      } else {
        // Default: match persis label
        if (jabatan === label.toLowerCase()) value++;
      }
    });
    return { label, value };
  });

  // DTO Status
  const statusDTOLabels = ['Sudah', 'Belum'];
  const statusDTOCounts = statusDTOLabels.map(label => {
    let count = 0;
    manpowerTable.forEach(row => {
      if (Array.isArray(row.diklat) && row.diklat.length > 0) {
        // Anggap 'Sudah' jika ada salah satu dto_prs atau dto_pms yang TIDAK null
        const sudah = row.diklat.some(d => d.dto_prs || d.dto_pms);
        if (label === 'Sudah' && sudah) count++;
        if (label === 'Belum' && !sudah) count++;
      } else {
        if (label === 'Belum') count++;
      }
    });
    return count;
  });
  const statusDTO = {
    labels: statusDTOLabels,
    datasets: [{
      data: statusDTOCounts,
      backgroundColor: ['#43a047', '#e53935'],
      borderWidth: 0,
      borderRadius: 4,
    }]
  };

  // Diklat Fungsional
  const diklatLabels = ['>=5 Kali', '4 Kali', '3 Kali', '2 Kali', '1 Kali', 'Belum'];
  const diklatCounts = [
    // >=5 kali
    manpowerTable.filter(row => {
      if (!Array.isArray(row.diklat) || row.diklat.length === 0) return false;
      let total = 0;
      row.diklat.forEach(d => {
        const fields = ['dto_prs','dto_pms','t2_prs','t2_pms','t3_prs','t3_pms','t4_mps','smdp','jmdp'];
        fields.forEach(f => { if (d[f]) total++; });
      });
      return total >= 5;
    }).length,
    // 4 kali
    manpowerTable.filter(row => {
      if (!Array.isArray(row.diklat) || row.diklat.length === 0) return false;
      let total = 0;
      row.diklat.forEach(d => {
        const fields = ['dto_prs','dto_pms','t2_prs','t2_pms','t3_prs','t3_pms','t4_mps','smdp','jmdp'];
        fields.forEach(f => { if (d[f]) total++; });
      });
      return total === 4;
    }).length,
    // 3 kali
    manpowerTable.filter(row => {
      if (!Array.isArray(row.diklat) || row.diklat.length === 0) return false;
      let total = 0;
      row.diklat.forEach(d => {
        const fields = ['dto_prs','dto_pms','t2_prs','t2_pms','t3_prs','t3_pms','t4_mps','smdp','jmdp'];
        fields.forEach(f => { if (d[f]) total++; });
      });
      return total === 3;
    }).length,
    // 2 kali
    manpowerTable.filter(row => {
      if (!Array.isArray(row.diklat) || row.diklat.length === 0) return false;
      let total = 0;
      row.diklat.forEach(d => {
        const fields = ['dto_prs','dto_pms','t2_prs','t2_pms','t3_prs','t3_pms','t4_mps','smdp','jmdp'];
        fields.forEach(f => { if (d[f]) total++; });
      });
      return total === 2;
    }).length,
    // 1 kali
    manpowerTable.filter(row => {
      if (!Array.isArray(row.diklat) || row.diklat.length === 0) return false;
      let total = 0;
      row.diklat.forEach(d => {
        const fields = ['dto_prs','dto_pms','t2_prs','t2_pms','t3_prs','t3_pms','t4_mps','smdp','jmdp'];
        fields.forEach(f => { if (d[f]) total++; });
      });
      return total === 1;
    }).length,
    // Belum
    manpowerTable.filter(row => {
      if (!Array.isArray(row.diklat) || row.diklat.length === 0) return true;
      let total = 0;
      row.diklat.forEach(d => {
        const fields = ['dto_prs','dto_pms','t2_prs','t2_pms','t3_prs','t3_pms','t4_mps','smdp','jmdp'];
        fields.forEach(f => { if (d[f]) total++; });
      });
      return total === 0;
    }).length
  ];
  const diklatFungsional = {
    labels: diklatLabels,
    datasets: [{
      data: diklatCounts,
      backgroundColor: '#2563eb',
      borderWidth: 0,
      borderRadius: 4,
    }]
  };

  // Sertifikasi
  const sertifikasiLabels = ['OK', 'Belum', 'Expired', 'THS'];
  const sertifikasiCounts = sertifikasiLabels.map(label => {
    // Hitung jumlah sertifikasi dengan status sesuai label di seluruh pegawai
    let count = 0;
    manpowerTable.forEach(row => {
      if (Array.isArray(row.sertifikasi)) {
        count += row.sertifikasi.filter(s => (s.status || '').toLowerCase() === label.toLowerCase()).length;
      }
    });
    return count;
  });
  const sertifikasi = {
    labels: sertifikasiLabels,
    datasets: [{
      data: sertifikasiCounts,
      backgroundColor: ['#43a047', '#2563eb', '#e53935', '#9c27b0'],
      borderWidth: 0,
      borderRadius: 4,
    }]
  };

  // TMT Pensiun
  const tmtLabels = ['> 5 Tahun', '< 2 Tahun', '< 5 Tahun'];
  const tmtCounts = [
    manpowerTable.filter(row => {
      const tmt = parseInt(row.tmt_pensiun, 10);
      if (!tmt || isNaN(tmt)) return false;
      const diff = tmt - new Date().getFullYear();
      return diff > 5;
    }).length,
    manpowerTable.filter(row => {
      const tmt = parseInt(row.tmt_pensiun, 10);
      if (!tmt || isNaN(tmt)) return false;
      const diff = tmt - new Date().getFullYear();
      return diff <= 2;
    }).length,
    manpowerTable.filter(row => {
      const tmt = parseInt(row.tmt_pensiun, 10);
      if (!tmt || isNaN(tmt)) return false;
      const diff = tmt - new Date().getFullYear();
      return diff > 0 && diff <= 5;
    }).length,
  ];
  const tmtPensiun = {
    labels: tmtLabels,
    datasets: [{
      data: tmtCounts,
      backgroundColor: ['#43a047', '#e53935', '#ffd600'],
      borderWidth: 0,
      borderRadius: 4,
    }]
  };

  // Pendidikan
  const pendidikanLabels = ['SLTA', 'D3', 'D1', 'SD'];
  const pendidikanCounts = pendidikanLabels.map(label =>
    manpowerTable.filter(row => (row.pendidikan || '').toLowerCase() === label.toLowerCase()).length
  );
  const pendidikan = {
    labels: pendidikanLabels,
    datasets: [{
      data: pendidikanCounts,
      backgroundColor: ['#2563eb', '#43a047', '#ffd600', '#e53935'],
      borderWidth: 0,
      borderRadius: 4,
    }]
  };

  const totalEmployee = totalManpower.reduce((sum, item) => sum + item.value, 0);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 4,
      },
    },
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'OK':
        return { backgroundColor: '#e8f5e8', color: '#2e7d32' };
      case 'Expired':
      case 'Belum':
        return { backgroundColor: '#ffebee', color: '#c62828' };
      case 'THS':
        return { backgroundColor: '#f3e5f5', color: '#7b1fa2' };
      default:
        return { backgroundColor: '#f5f5f5', color: '#616161' };
    }
  };

  const handleDetailClick = (kategori, title) => {
    setDetailKategori(kategori);
    setDetailTitle(title);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailKategori('');
    setDetailTitle('');
  };

  const formatTanggalJakarta = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper: flatten data if needed
  function normalizeManpowerData(data) {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.manpower)) return data.manpower;
    if (data.manpower) return [data.manpower];
    return [];
  }

  return (
    <Box sx={{ flexGrow: 1, mt: 2, minHeight: '100vh', background: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Card sx={{ background: '#f8fafc', color: '#2196f3', borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(13,41,86,0.08)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 120, px: { xs: 2, md: 5 }, py: { xs: 3, md: 4 } }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1e3a8a', mb: 1 }}>
                Manpower Data Management
              </Typography>
              <Typography variant="body1" sx={{ color: '#334155' }}>
                Dashboard pengelolaan data kepegawaian
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Grid container spacing={3}>
        {/* Total Manpower Card */}
        <Grid item xs={12} lg={3}>
          <Card sx={{ height: 'fit-content', borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon sx={{ color: '#2196f3', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                  Total Manpower
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                {totalManpower.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: 13, color: '#666' }}>
                      {item.label}
                    </Typography>
                    <Chip
                      label={item.value}
                      size="small"
                      sx={{
                        backgroundColor: 'transparent',
                        color: '#040606',
                        fontWeight: 600,
                        fontSize: 12,
                        height: 29.2,
                      }}
                    />
                  </Box>
                ))}
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#040606' }}>
                  {totalEmployee}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts Grid */}
        <Grid item xs={12} lg={9}>
          <Grid container spacing={3}>
            {/* Top Row Charts */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4, boxShadow: 3, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ color: '#2196f3', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                      Status DTO
                    </Typography>
                  </Box>
                  <Box sx={{ height: 220 }}>
                    <Bar data={statusDTO} options={chartOptions} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4, boxShadow: 3, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ color: '#2196f3', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                      Diklat Fungsional
                    </Typography>
                  </Box>
                  <Box sx={{ height: 160 }}>
                    <Bar data={diklatFungsional} options={chartOptions} />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    onClick={() => handleDetailClick('diklat', 'Diklat Fungsional')}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #5de0e6, #2563eb)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #003a91, #1d4ed8)',
                      },
                    }}
                  >
                    Detail Diklat
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: 4, boxShadow: 3, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AssignmentIcon sx={{ color: '#2196f3', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                      Sertifikasi
                    </Typography>
                  </Box>
                  <Box sx={{ height: 180 }}>
                    <Bar data={sertifikasi} options={chartOptions} />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    onClick={() => handleDetailClick('sertifikasi', 'Sertifikasi')}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #5de0e6, #2563eb)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #003a91, #1d4ed8)',
                      },
                    }}
                  >
                    Detail Sertifikasi
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* Bottom Row Charts */}
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: 3, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EventIcon sx={{ color: '#2196f3', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                      TMT Pensiun
                    </Typography>
                  </Box>
                  <Box sx={{ height: 180 }}>
                    <Bar data={tmtPensiun} options={chartOptions} />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    onClick={() => handleDetailClick('tmt', 'TMT Pensiun & Pendidikan')}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #5de0e6, #2563eb)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #003a91, #1d4ed8)',
                      },
                    }}
                  >
                    Detail TMT Pensiun
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 4, boxShadow: 3, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SchoolIcon sx={{ color: '#2196f3', mr: 1, fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#2196f3' }}>
                      Pendidikan
                    </Typography>
                  </Box>
                  <Box sx={{ height: 180 }}>
                    <Bar data={pendidikan} options={chartOptions} />
                  </Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    onClick={() => handleDetailClick('tmt', 'TMT Pensiun & Pendidikan')}
                    sx={{
                      mt: 2,
                      background: 'linear-gradient(135deg, #5de0e6, #2563eb)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 13,
                      textTransform: 'none',
                      borderRadius: 2,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #003a91, #1d4ed8)',
                      },
                    }}
                  >
                    Detail Pendidikan
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Main Data Table */}
        <Grid item xs={12}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, mt: 2 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#2196f3' }}>
                Data Manpower
              </Typography>
              
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#2196f3' }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NIPP</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NAMA</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>JABATAN</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>PENSIUN</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>DTO</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>SERTIFIKASI</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loadingManpower ? (
                      <TableRow><TableCell colSpan={6} align="center">Loading...</TableCell></TableRow>
                    ) : errorManpower ? (
                      <TableRow><TableCell colSpan={6} align="center" style={{color: 'red'}}>{errorManpower}</TableCell></TableRow>
                    ) : manpowerTable.length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center">Tidak ada data manpower</TableCell></TableRow>
                    ) : manpowerTable.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{row.nipp}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{row.nama}</TableCell>
                        <TableCell>{row.jabatan}</TableCell>
                        <TableCell>{formatTanggalJakarta(row.tmt_pensiun || '-')}</TableCell>
                        <TableCell>{Array.isArray(row.diklat) && row.diklat.length > 0 ? 'Sudah' : 'Belum'}</TableCell>
                        <TableCell>{Array.isArray(row.sertifikasi) && row.sertifikasi.length > 0 ? (row.sertifikasi[0].status || '-') : '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detail Table Inline (show/hide Card, not Dialog) */}
      {showDetail && (
        <Card sx={{ mt: 3, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                Detail Manpower - {detailTitle}
              </Typography>
              <Button
                size="small"
                onClick={handleCloseDetail}
                sx={{
                  mt: 1,
                  background: 'linear-gradient(135deg, #5de0e6, #2563eb)',
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  border: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #003a91, #1d4ed8)',
                  },
                }}
              >
                Tutup
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {detailKategori === 'diklat' && (
              <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#2196f3' }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NIPP</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NAMA</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>JABATAN</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>DTO PRS</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>DTO PMS</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>T2 PRS</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>T2 PMS</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>T3 PRS</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>T3 PMS</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>T4 MPS</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>SMDP</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>JMDP</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {manpowerTable.map((row, idx) => (
                      Array.isArray(row.diklat) && row.diklat.length > 0 ? row.diklat.map((d, i) => (
                        <TableRow key={row.nipp + '-diklat-' + i}>
                          <TableCell>{row.nipp}</TableCell>
                          <TableCell>{row.nama}</TableCell>
                          <TableCell>{row.jabatan}</TableCell>
                          <TableCell>{formatTanggalJakarta(d.dto_prs || '-')}</TableCell>
                          <TableCell>{formatTanggalJakarta(d.dto_pms || '-')}</TableCell>
                          <TableCell>{formatTanggalJakarta(d.t2_prs || '-')}</TableCell>
                          <TableCell>{formatTanggalJakarta(d.t2_pms || '-')}</TableCell>
                          <TableCell>{formatTanggalJakarta(d.t3_prs || '-')}</TableCell>
                          <TableCell>{formatTanggalJakarta(d.t3_pms || '-')}</TableCell>
                          <TableCell>{formatTanggalJakarta(d.t4_mps || '-')}</TableCell>
                          <TableCell>{formatTanggalJakarta(d.smdp || '-')}</TableCell>
                          <TableCell>{formatTanggalJakarta(d.jmdp || '-')}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow key={row.nipp + '-diklat-empty'}>
                          <TableCell colSpan={12} align="center">Tidak ada data diklat</TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {detailKategori === 'sertifikasi' && (
              <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#2196f3' }}>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NIPP</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NAMA</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>JABATAN</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>SERTIFIKASI</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>TANGGAL TERBIT</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NOMOR SERTIFIKAT</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>BERLAKU SAMPAI</TableCell>
                      <TableCell sx={{ color: '#fff', fontWeight: 700 }}>STATUS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {manpowerTable.map((row, idx) => (
                      Array.isArray(row.sertifikasi) && row.sertifikasi.length > 0 ? row.sertifikasi.map((s, i) => (
                        <TableRow key={row.nipp + '-sertifikasi-' + i}>
                          <TableCell>{row.nipp}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{row.nama}</TableCell>
                          <TableCell>{row.jabatan}</TableCell>
                          <TableCell>{s.jenis_sertifikat || s.sertifikasi || '-'}</TableCell>
                          <TableCell>{s.tanggal_terbit ? new Date(s.tanggal_terbit).toLocaleDateString('id-ID', { timeZone: 'UTC' }) : '-'}</TableCell>
                          <TableCell>{s.nomor_sertifikat || '-'}</TableCell>
                          <TableCell>{s.berlaku_sampai ? new Date(s.berlaku_sampai).toLocaleDateString('id-ID', { timeZone: 'UTC' }) : (s.masa_aktif ? new Date(s.masa_aktif).toLocaleDateString('id-ID', { timeZone: 'UTC' }) : '-')}</TableCell>
                          <TableCell>
                            <Chip
                              label={s.status || '-'}
                              size="small"
                              sx={{
                                ...getStatusColor(s.status || ''),
                                fontWeight: 600,
                                fontSize: 11,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow key={row.nipp + '-sertifikasi-empty'}>
                          <TableCell colSpan={8} align="center">Tidak ada data sertifikasi</TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {detailKategori === 'tmt' && (
  <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 1 }}>
    <Table size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: '#2196f3' }}>
          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NIPP</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NAMA</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>JABATAN</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>PENDIDIKAN DIAKUI</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>USIA</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>TMT PENSIUN</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>COUNTER PENSIUN</TableCell>
          <TableCell sx={{ color: '#fff', fontWeight: 700 }}>KATEGORI PENSIUN</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(manpowerTable || []).map((row, index) => (
          <TableRow key={index} hover>
            <TableCell>{row.nipp}</TableCell>
            <TableCell sx={{ fontWeight: 600 }}>{row.nama}</TableCell>
            <TableCell>{row.jabatan}</TableCell>
            <TableCell>{row.pendidikan || '-'}</TableCell>
            <TableCell>{row.usia !== undefined ? row.usia : '-'}</TableCell>
            <TableCell>{row.tmt_pensiun ? new Date(row.tmt_pensiun).toLocaleDateString('id-ID', { timeZone: 'UTC' }) : '-'}</TableCell>
            <TableCell>{row.counter_pensiun !== undefined ? row.counter_pensiun : '-'}</TableCell>
            <TableCell>{row.kategori_pensiun || '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
