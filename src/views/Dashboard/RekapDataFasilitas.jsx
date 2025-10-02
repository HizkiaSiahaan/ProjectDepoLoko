import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { Box, Button, Divider, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Grid } from '@mui/material';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

import { useSelector } from 'react-redux';

export default function RekapDataFasilitas() {
  // Ambil role dari Redux
  const role = useSelector(state => state.auth?.role || 'user');

  // State untuk modal input SIO
  const [openSioModal, setOpenSioModal] = useState(false);
  // State untuk data form input SIO (semua field DB)
  const [sioForm, setSioForm] = useState({
    nipp: '',
    nama: '',
    jabatan: '',
    kedudukan: '',
    jenis_sertifikat: '',
    penerbit: '',
    nomor_sertifikat: '',
    tahun_perolehan: '',
    masa_aktif: '',
    link_sertifikat: ''
  });
  const [loadingSioSubmit, setLoadingSioSubmit] = useState(false);
  const [errorSioSubmit, setErrorSioSubmit] = useState('');

  // State untuk mode edit
  const [editSioId, setEditSioId] = useState(null);

  // Handler untuk edit (open modal dan isi form)
  const handleEditSio = (row) => {
    setEditSioId(row.id);
    setSioForm({
      nipp: row.nipp || '',
      nama: row.nama || '',
      jabatan: row.jabatan || '',
      kedudukan: row.kedudukan || '',
      jenis_sertifikat: row.jenis_sertifikat || '',
      penerbit: row.penerbit || '',
      nomor_sertifikat: row.nomor_sertifikat || '',
      tahun_perolehan: row.tahun_perolehan || '',
      masa_aktif: row.masa_aktif || '',
      link_sertifikat: row.link_sertifikat || ''
    });
    setOpenSioModal(true);
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

  // Handler untuk hapus
  const handleDeleteSio = async (id) => {
  if (!window.confirm('Yakin ingin menghapus data ini?')) return;
  try {
    const res = await fetch(`/api/sertifikat-sio/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      let msg = 'Gagal menghapus data';
      try { const data = await res.json(); msg = data.error || msg; } catch {}
      throw new Error(msg);
    }
    if (typeof fetchSio === 'function') await fetchSio();
  } catch (err) {
    alert(err.message || 'Gagal menghapus data');
  }
};

  // Handler submit form input SIO
  const handleSubmitSio = async (e) => {
  e && e.preventDefault && e.preventDefault();
  setLoadingSioSubmit(true);
  setErrorSioSubmit('');
  // Validasi simple: semua field utama wajib diisi
  const required = ['nipp','nama','jabatan','kedudukan','jenis_sertifikat','penerbit','nomor_sertifikat','tahun_perolehan','masa_aktif'];
  for (const key of required) {
    if (!sioForm[key] || String(sioForm[key]).trim() === '') {
      setErrorSioSubmit('Semua field wajib diisi!');
      setLoadingSioSubmit(false);
      return;
    }
  }
  try {
    let res, data;
    // Mapping field ke backend (pastikan sesuai struktur tabel baru)
    const payload = {
      nipp: sioForm.nipp,
      nama: sioForm.nama,
      jabatan: sioForm.jabatan,
      kedudukan: sioForm.kedudukan,
      jenis_sertifikat: sioForm.jenis_sertifikat,
      penerbit: sioForm.penerbit,
      nomor_sertifikat: sioForm.nomor_sertifikat,
      tahun_perolehan: sioForm.tahun_perolehan,
      masa_aktif: sioForm.masa_aktif,
      link_sertifikat: sioForm.link_sertifikat || ''
    };
    if (editSioId) {
      // Edit mode
      res = await fetch(`/api/sertifikat-sio/${editSioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal mengedit data');
    } else {
      // Tambah mode
      res = await fetch('/api/sertifikat-sio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menambah data');
    }
    // Refresh data tabel SIO
    // Update state tabel lokal agar langsung update (tanpa fetch ulang)
    if (editSioId) {
  // Update dengan data respons backend (id dan field terbaru)
  setSertifikatSio(prev => prev.map(item => item.id === editSioId ? { ...item, ...(data.sertifikat_sio || payload) } : item));
} else {
  // Gunakan data dari backend jika ada id baru
  setSertifikatSio(prev => [...prev, { ...(data.sertifikat_sio || payload) }]);
}
    setOpenSioModal(false);
    setEditSioId(null);
    setSioForm({
      nipp: '',
      nama: '',
      jabatan: '',
      kedudukan: '',
      jenis_sertifikat: '',
      penerbit: '',
      nomor_sertifikat: '',
      tahun_perolehan: '',
      masa_aktif: '',
      link_sertifikat: ''
    });
  } catch (err) {
    setErrorSioSubmit(err.message || 'Gagal menyimpan data');
  } finally {
    setLoadingSioSubmit(false);
  }
};
  const [selectedKategori, setSelectedKategori] = useState(null);

  // Data fasilitas dari backend
  const [mainFacilities, setMainFacilities] = useState([]);
  const [loadingFasilitas, setLoadingFasilitas] = useState(true);
  const [errorFasilitas, setErrorFasilitas] = useState('');

  useEffect(() => {
    const fetchFasilitas = async () => {
      setLoadingFasilitas(true);
      setErrorFasilitas('');
      try {
        const res = await fetch('/api/fasilitas');
        const data = await res.json();
        if (data.fasilitas) {
          setMainFacilities(data.fasilitas);
        } else {
          setMainFacilities([]);
        }
      } catch (err) {
        setErrorFasilitas('Gagal mengambil data fasilitas dari server');
        setMainFacilities([]);
      } finally {
        setLoadingFasilitas(false);
      }
    };
    fetchFasilitas();
  }, []);


  // Generate categories dari mainFacilities (pakai field snake_case DB)
  const normalizeKategori = (str) => (str || '').trim().toLowerCase();

const categories = React.useMemo(() => {
  const kategoriMap = {};
  mainFacilities.forEach(item => {
    const key = normalizeKategori(item.kategori);
    if (!kategoriMap[key]) {
      kategoriMap[key] = { name: item.kategori.trim(), baik: 0, pantauan: 0, rusak: 0, total: 0 };
    }
    kategoriMap[key].baik += Number(item.baik || 0);
    kategoriMap[key].pantauan += Number(item.pantauan || 0);
    kategoriMap[key].rusak += Number(item.rusak || 0);
    kategoriMap[key].total += Number(item.jumlah_satuan || 0);
  });
  return Object.values(kategoriMap);
}, [mainFacilities]);

  // Detail fasilitas per kategori diambil langsung dari mainFacilities (snake_case)
  const detailFasilitasByKategori = (kategori) =>
    mainFacilities
      .filter(item => item.kategori === kategori)
      .map((item, idx) => ({
        ...item,
        no: idx + 1
      }));

  // Sertifikat SIO Personel dari backend
  const [sertifikatSio, setSertifikatSio] = useState([]);
  const [loadingSio, setLoadingSio] = useState(true);
  const [filterSertifikat, setFilterSertifikat] = useState('');

  useEffect(() => {
    const fetchSio = async () => {
      setLoadingSio(true);
      try {
        const res = await fetch('/api/sertifikat-sio');
        const data = await res.json();
        setSertifikatSio(data.sertifikat_sio || []);
      } catch {
        setSertifikatSio([]);
      } finally {
        setLoadingSio(false);
      }
    };
    fetchSio();
  }, []);

  // Jenis sertifikat unik dari backend
  const jenisSertifikatOptions = [...new Set(sertifikatSio.map(row => row.jenis_sertifikat))];

  // Data hasil filter
  const filteredSertifikasi = filterSertifikat ? sertifikatSio.filter(row => row.jenis_sertifikat === filterSertifikat) : sertifikatSio;

  // Data Pie chart hasil filter
  const pieLabels = [...new Set(filteredSertifikasi.map(row => row.jenis_sertifikat))];
  const pieChartData = {
    labels: pieLabels,
    datasets: [
      {
        data: pieLabels.map(label => filteredSertifikasi.filter(row => row.jenis_sertifikat === label).length),
        backgroundColor: ['#43a047', '#2563eb', '#e53935', '#9c27b0', '#ffd600', '#ff9800', '#00bcd4'],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const createBarChart = (category) => ({
    labels: [''],
    datasets: [
      {
        label: 'GOOD',
        data: [category.baik],
        backgroundColor: '#4CAF50',
        barThickness: 25,
      },
      {
        label: 'PANTAUAN',
        data: [category.pantauan],
        backgroundColor: '#FFC107',
        barThickness: 25,
      },
      {
        label: 'BAD',
        data: [category.rusak],
        backgroundColor: '#F44336',
        barThickness: 25,
      },
    ],
  });

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
        beginAtZero: true,
      },
    },
  };

  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ position: 'relative', mb: 4 }}>
        <Card sx={{ background: '#f8fafc', color: '#2196f3', borderRadius: 4, boxShadow: '0 8px 32px 0 rgba(13,41,86,0.08)' }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', minHeight: 120, px: { xs: 2, md: 5 }, py: { xs: 3, md: 4 } }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1e3a8a', mb: 1 }}>
                Rekap Data Fasilitas
              </Typography>
              <Typography variant="body1" sx={{ color: '#334155' }}>
                Dashboard rekapitulasi dan status fasilitas depo
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Box>
        
      {/* Summary Table - Full Width */}
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#040606' }}>
            DATA FASILITAS UTAMA
          </Typography>
          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#2196f3' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Kategori</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Nama Fasilitas</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Jumlah</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>GOOD</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Pantauan</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>BAD</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>Tanggal Perawatan</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mainFacilities.map((item, idx) => (
                  <TableRow key={item.id || idx} sx={{ bgcolor: idx % 2 === 0 ? '#fff' : '#f7f9fc' }}>
                    <TableCell>{item.kategori}</TableCell>
                    <TableCell>{item.nama_fasilitas}</TableCell>
                    <TableCell>{item.jumlah_satuan}</TableCell>
                    <TableCell>{item.baik}</TableCell>
                    <TableCell>{item.pantauan}</TableCell>
                    <TableCell>{item.rusak}</TableCell>
                    <TableCell>{formatTanggalJakarta(item.tanggal_perawatan)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Responsive Category Boxes */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={2.4} key={category.name} sx={{ display: 'flex' }}>
            <Card sx={{ borderRadius: 3, boxShadow: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, bgcolor: '#fff', color: '#fff', minWidth: 0 }}>
              <Typography fontWeight={700} fontSize={15} align="center" sx={{ mb: 1, color: '#2196f3' }}>{category.name}</Typography>
              <Typography fontWeight={700} fontSize={28} align="center" sx={{ mb: 1, color: '#2196f3' }}>{category.total}</Typography>
              <Box sx={{ width: '100%', height: 40, mb: 1 }}>
                <Bar
                  data={createBarChart(category)}
                  options={{ ...barOptions, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }}
                  height={40}
                />
              </Box>
              <Button
                size="small"
                variant="contained"
                sx={{ background: 'linear-gradient(135deg, #5de0e6, #2563eb)', color: '#fff', fontWeight: 700, fontSize: 11, py: 0.5, px: 2, minWidth: 0, boxShadow: 'none' }}
                onClick={() => setSelectedKategori(category.name)}
              >
                Detail
              </Button>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>

    {/* Pie Chart Status Fasilitas & Pie Chart Sertifikat SIO Personel */}
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* Pie Chart Status Fasilitas */}
      <Grid item xs={12} md={6}>
        <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#040606' }}>
              REKAP STATUS FASILITAS
            </Typography>
            <Box sx={{ height: { xs: 220, md: 260 }, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie
                data={{
                  labels: ['GOOD', 'PANTAUAN', 'BAD'],
                  datasets: [
                    {
                      data: [
                        mainFacilities.reduce((a, b) => a + Number(b.baik || 0), 0),
                        mainFacilities.reduce((a, b) => a + Number(b.pantauan || 0), 0),
                        mainFacilities.reduce((a, b) => a + Number(b.rusak || 0), 0),
                      ],
                      backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                      borderWidth: 0,
                      borderRadius: 6,
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = context.raw || 0;
                          return `${label}: ${value}`;
                        }
                      }
                      }
                    }
                  }}
                  height={220}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                {[
                  { label: 'GOOD', value: mainFacilities.reduce((a, b) => a + Number(b.baik || 0), 0), color: '#4CAF50' },
                  { label: 'PANTAUAN', value: mainFacilities.reduce((a, b) => a + Number(b.pantauan || 0), 0), color: '#FFC107' },
                  { label: 'BAD', value: mainFacilities.reduce((a, b) => a + Number(b.rusak || 0), 0), color: '#F44336' },
                ].map((item) => (
                  <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mx: 1, my: 0.5 }}>
                    <Box sx={{ minWidth: 28, height: 28, borderRadius: 1.5, bgcolor: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 500, fontSize: 13, boxShadow: 1, border: '1.5px solid #e0e0e0', mr: 1 }}>
                      {item.value}
                    </Box>
                    <Typography fontWeight={400} fontSize={13} sx={{ color: item.color, letterSpacing: 0.2 }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Pie Chart Sertifikat SIO Personel */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#040606' }}>
                SERTIFIKAT SIO PERSONEL
              </Typography>
              <Box sx={{ height: { xs: 220, md: 260 }, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Pie
                  data={pieChartData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false,
                        position: 'right',
                        labels: { boxWidth: 18, font: { size: 13 } }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value}`;
                          }
                        }
                      }
                    }
                  }}
                  height={220}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2, flexWrap: 'wrap' }}>
                {pieLabels.map((label, idx) => (
                  <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mx: 1, my: 0.5 }}>
                    <Box sx={{ minWidth: 28, height: 28, borderRadius: 1.5, bgcolor: pieChartData.datasets[0].backgroundColor[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 500, fontSize: 13, boxShadow: 1, border: '1.5px solid #e0e0e0', mr: 1 }}>
                      {pieChartData.datasets[0].data[idx]}
                    </Box>
                    <Typography fontWeight={400} fontSize={13} sx={{ color: pieChartData.datasets[0].backgroundColor[idx], letterSpacing: 0.2 }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detail Table per Kategori */}
      {selectedKategori && (
        <Card sx={{ borderRadius: 2, boxShadow: 2, mt: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={700}>
                DETAIL DATA FASILITAS PER KATEGORI : {selectedKategori}
              </Typography>
              <Button 
                variant="outlined"
                size="small"
                onClick={() => setSelectedKategori(null)}
              >
                Tutup
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loadingFasilitas ? (
              <Typography align="center" sx={{ my: 2 }}>Loading data fasilitas...</Typography>
            ) : errorFasilitas ? (
              <Typography color="error" align="center" sx={{ my: 2 }}>{errorFasilitas}</Typography>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 1 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#8bb6ff' }}>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }}>NO</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }}>NAMA FASILITAS ALAT KERJA</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">JUMLAH</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">SATUAN</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">GOOD</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">FINE</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">BAD</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">TAHUN PENGADAAN</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">TAHUN MULAI DINAS</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">TANGGAL PERAWATAN</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">UJI BERKALA / KALIBRASI / VERIFIKASI</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">MASA BERLAKU</TableCell>
                      <TableCell sx={{ color: '#000000', fontWeight: 700 }} align="center">SPESIFIKASI</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detailFasilitasByKategori(selectedKategori).length === 0 ? (
                      <TableRow><TableCell colSpan={13} align="center">Tidak ada data fasilitas untuk kategori ini.</TableCell></TableRow>
                    ) : (
                      detailFasilitasByKategori(selectedKategori).map((item, idx) => (
                      <TableRow key={item.id || idx} sx={{ bgcolor: idx % 2 === 0 ? '#fff' : '#f7f9fc' }}>
                        <TableCell align="center">{item.no}</TableCell>
                        <TableCell align="center">{item.nama_fasilitas || '-'}</TableCell>
                        <TableCell align="center">{item.jumlah_satuan ?? '-'}</TableCell>
                        <TableCell align="center">{item.satuan || '-'}</TableCell>
                        <TableCell align="center">{item.baik ?? '-'}</TableCell>
                        <TableCell align="center">{item.pantauan ?? '-'}</TableCell>
                        <TableCell align="center">{item.rusak ?? '-'}</TableCell>
                        <TableCell align="center">{item.tahun_pengadaan || '-'}</TableCell>
                        <TableCell align="center">{item.tahun_mulai_dinas || '-'}</TableCell>
                        <TableCell align="center">{formatTanggalJakarta(item.tanggal_perawatan) || '-'}</TableCell>
                        <TableCell align="center">{item.kategori_standardisasi || '-'}</TableCell>
                        <TableCell align="center">{item.masa_berlaku || '-'}</TableCell>
                        <TableCell align="center">{item.spesifikasi || '-'}</TableCell>
                      </TableRow>
                    ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Spacer antara tabel fasilitas dan tabel SIO */}
      <Box sx={{ mb: { xs: 3, md: 4 } }} />

      {/* Tabel Data Sertifikat SIO Personel (sendiri) */}
      <Card sx={{ borderRadius: 2, boxShadow: 2, mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#040606' }}>
              DATA SERTIFIKAT SIO PERSONEL
            </Typography>
            {role === 'admin' && (
              <Button
                variant="contained"
                color="primary"
                sx={{ mb: 2 }}
                onClick={() => {
                  setEditSioId(null);
                  setSioForm({
                    nipp: '',
                    nama: '',
                    jabatan: '',
                    kedudukan: '',
                    jenis_sertifikat: '',
                    penerbit: '',
                    nomor_sertifikat: '',
                    tahun_perolehan: '',
                    masa_aktif: '',
                    link_sertifikat: ''
                  });
                  setOpenSioModal(true);
                }}
              >
                ADD
              </Button>
            )}
          </Box>

          {/* Filter dropdown jenis sertifikat */}
          <Box sx={{ mb: 2, maxWidth: 320 }}> 
            <select
              value={filterSertifikat}
              onChange={e => setFilterSertifikat(e.target.value)}
              style={{ width: '60%', padding: 8, borderRadius: 6, border: '1px solid #d1d5db', fontSize: 15 }}
            >
              <option value="">Jenis Sertifikat</option>
              {jenisSertifikatOptions.map((jenis, idx) => (
                <option key={idx} value={jenis}>{jenis}</option>
              ))}
            </select>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#2196f3' }}>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }}>NIPP</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">NAMA</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">JABATAN</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">SERTIFIKAT</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">KET</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">NO SERTIFIKAT</TableCell>
                  <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">MASA AKTIF</TableCell>
                  {role === 'admin' &&
                    <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="center">AKSI</TableCell>
                  }
                </TableRow>
              </TableHead>
            <TableBody>
              {filteredSertifikasi.map((row, idx) => (
                <TableRow key={row.id || idx} sx={{ bgcolor: idx % 2 === 0 ? '#fff' : '#f7f9fc' }}>
                  <TableCell>{row.nipp || '-'}</TableCell>
                  <TableCell align="center">{row.nama || '-'}</TableCell>
                  <TableCell align="center">{row.jabatan || '-'}</TableCell>
                  <TableCell align="center">{row.jenis_sertifikat || '-'}</TableCell>
                  <TableCell align="center">{row.penerbit || '-'}</TableCell>
                  <TableCell align="center">{row.nomor_sertifikat || '-'}</TableCell>
                  <TableCell align="center">{row.masa_aktif || '-'}</TableCell>
                  <TableCell align="center">
                    {role === 'admin' && (
                      <>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{ minWidth: 0, px: 1, mr: 1, fontSize: 12 }}
                          onClick={() => handleEditSio(row)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          sx={{ minWidth: 0, px: 1, fontSize: 12 }}
                          onClick={() => handleDeleteSio(row.id)}
                        >
                          Hapus
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Modal Input Sertifikat SIO Personel */}
      {role === 'admin' && (
        <Dialog open={openSioModal} onClose={() => setOpenSioModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Tambah Data Sertifikat SIO Personel</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="NIPP" value={sioForm.nipp} onChange={e => setSioForm(f => ({ ...f, nipp: e.target.value }))} fullWidth required />
              <TextField label="Nama" value={sioForm.nama} onChange={e => setSioForm(f => ({ ...f, nama: e.target.value }))} fullWidth required />
              <TextField label="Jabatan" value={sioForm.jabatan} onChange={e => setSioForm(f => ({ ...f, jabatan: e.target.value }))} fullWidth required />
              <TextField label="Kedudukan" value={sioForm.kedudukan} onChange={e => setSioForm(f => ({ ...f, kedudukan: e.target.value }))} fullWidth required />
              <TextField label="Jenis Sertifikat" value={sioForm.jenis_sertifikat} onChange={e => setSioForm(f => ({ ...f, jenis_sertifikat: e.target.value }))} fullWidth required />
              <TextField label="Penerbit" value={sioForm.penerbit} onChange={e => setSioForm(f => ({ ...f, penerbit: e.target.value }))} fullWidth required />
              <TextField label="Nomor Sertifikat" value={sioForm.nomor_sertifikat} onChange={e => setSioForm(f => ({ ...f, nomor_sertifikat: e.target.value }))} fullWidth required />
              <TextField label="Tahun Perolehan" value={sioForm.tahun_perolehan} onChange={e => setSioForm(f => ({ ...f, tahun_perolehan: e.target.value }))} fullWidth required />
              <TextField label="Masa Aktif" value={sioForm.masa_aktif} onChange={e => setSioForm(f => ({ ...f, masa_aktif: e.target.value }))} fullWidth required />
              <TextField label="Link Sertifikat" value={sioForm.link_sertifikat} onChange={e => setSioForm(f => ({ ...f, link_sertifikat: e.target.value }))} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSioModal(false)} color="secondary">Batal</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitSio}
            disabled={loadingSioSubmit}
          >
            {loadingSioSubmit ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    )}
  </Box>
  );
}
