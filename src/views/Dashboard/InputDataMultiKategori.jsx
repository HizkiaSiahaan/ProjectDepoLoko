import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Tabs,
  Tab,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
  Autocomplete
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { id as idLocale } from 'date-fns/locale';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSelector } from 'react-redux';
import detailAktivitasToPic from '../../utils/actionPlanPicMapping';
import dayjs from 'dayjs';

const blueGradient = 'linear-gradient(180deg, #5de0e6, #004aad)';

const tabLabels = [
  'Data Manpower',
  'Pantauan Roda',
  'Action Plan',
  'Fasilitas'
];

function TabPanel({ children, value, index }) {
  return value === index && (
    <Box sx={{ pt: 2 }}>{children}</Box>
  );
}

// --- Deklarasi mapping Action Plan (pindahkan ke atas agar tidak error) ---
const komponenOptions = [
  "Companion Alternator",
  "Motor Blower",
  "Power Assembly",
  "IPM",
  "EM2000",
  "Power Supply Module",
  "VDCL",
  "PCM 500",
  "Kompressor",
  "EFCO",
  "Water Pump",
  "Flexible Hose",
  "Plug PD2",
  "BPCP",
  "MPU",
  "PSU 500",
  "Turbocharger",
  "Fuel Pump",
  "Wiper",
  "Pemasir",
  "MPIO",
  "Relay GR",
  "Roda",
  "Bearing"
];
const komponenMap = {
  "Companion Alternator": {
    lagging: ["Slip Ring Alternator Cacat"],
    leading: [
      "Penggantian Slip Ring (Stainless Steel)",
      "Penambahan Brush Holder 1 Set",
      "Pengukuran dan Penggantian Carbon Brush (Standar 42 mm)"
    ]
  },
  "Motor Blower": {
    lagging: ["Motor Blower Terbakar"],
    leading: [
      "Inspeksi dan Pemeriksaan Motor Blower (Dial & Shaking)",
      "Penggantian Bearing Setiap 1,5 Tahun",
      "Join Inspection dengan DC THN",
      "21 serie Modifikasi bearing housing kedua sisi",
      "Penggantian Impeler (21 Series) dengan bahan yang lebih ringan"
    ]
  },
  "Power Assembly": {
    lagging: [
      "Power Assembly Failure (Ring Piston Patah, Liner Bocor, P Pipe Lepas, Cylinder Head Crack)",
      "Power Assembly Failure (Gagal Pelumasan, Scuffing)"
    ],
    leading: [
      "Flushing Fuel Setiap Perawatan",
      "Drain BBM 1L setiap Perawatan",
      "Pemeriksaan Ring Piston Setiap P3",
      "Pemeriksaan Piston Cooling Pipe Pada Saat Perawatan Pertama di 2025",
      "Pemeriksaan & Inspeksi Piston Cooling Pipe & Seal P12"
    ]
  },
  "IPM": {
    lagging: ["IPM Error"],
    leading: [
      "Instal Ulang Software IPM P12",
      "Pengecekan kondisi IPM & Test Air Brake",
      "Periksa dan Pembersihan Komponen Internal IPM setiap 3 Tahun",
      "Memastikan proses pengelasan sesuai Prosedur dari PRL",
      "Recyce ALL CB sampai Battery tunggu 1 Minute setiap Bulan IPM"
    ]
  },
  "EM2000": {
    lagging: ["EM2000 Error"],
    leading: [
      "Instal Ulang Software EM2000 setiap 3 Tahun",
      "Pengecekan & Pembersihan EM2000",
      "Recycle ALL CB sampai Battery tunggu 1 Minute P1",
      "Pemeriksaan dan Pengamanan Kabel Traction Alternator dari Cacat atau Rubbing"
    ]
  },
  "Power Supply Module": {
    lagging: ["PSM Error (Suhu Ruang Abnormal)"],
    leading: [
      "Pemasangan Cooling Fan pada PSM Compartment",
      "Pengecekan dan Pembersihan kondisi PSM",
      "Reposisi Resistor oleh PRL",
      "Pengecekan kabel High Voltage pada CT A,B,C di Alternator",
      "Pengecekan shield kabel PSM"
    ]
  },
  "VDCL": {
    lagging: ["Temperatur VDCL Abnormal, Undervoltage, Overvoltage"],
    leading: [
      "Inspeksi Sistem Pendingan E Locker Setiap Perawatan",
      "Melakukan Pengecekan, Pembersihan Phase Module seluruh lokomotif",
      "Membuat alat pemantauan suhu E Locker terintegrasi IoT",
      "Periksa sikuit dari ground setiap Perawatan"
    ]
  },
  "PCM 500": {
    lagging: ["PCM 500 Error"],
    leading: [
      "Instal Ulang Software PCM 500 setiap 3 Tahun",
      "Pengecekan & Pembersihan PCM 500 Setiap Perawatan",
      "Recyce ALL CB sampai Battery tunggu 1 Minute setiap Bulan",
      "Pemeriksaan Low Voltage Ground setiap bulan",
      "Periksa ground AC setiap perawatan"
    ]
  },
  "Kompressor": {
    lagging: ["Kompressor Failure (STT Klep Bocor, Gagal Pelumasan)"],
    leading: [
      "Pengecekan fungsi dan kondisi CLOPS setiap Bulan",
      "Pengecekan Kebocoran & Volume Pelumas setiap Bulan",
      "Pembuatan alat DC LINK berbasis IoT (Daily Checker Locomotive Integrated NetworK)"
    ]
  },
  "EFCO": {
    lagging: ["EFCO Error (Tidak bisa ditrigger)"],
    leading: [
      "Pemeriksaan Kondisi Terminal EFCO L & R Setiap Perawatan",
      "Pengecekan & Penggantian Matras EFCO"
    ]
  },
  "Water Pump": {
    lagging: ["Water Pump Bocor, Pipa Air Pendingin Bocor"],
    leading: [
      "Pengecekan semua kondisi Pipa Water Pump setiap Bulan",
      "Melakukan Pemantauan tekanan in dan out melalui Parameter Uptime",
      "Pengecekan dan Penggantian Mur (Jika Sudah Maksimal)",
      "Pemeriksaan Posisi Coupling setiap Bulan"
    ]
  },
  "Flexible Hose": {
    lagging: ["Flexible Hose Rusak"],
    leading: [
      "Pengecekan Semua Kondisi Flexible Hose setiap Bulan",
      "Penggantian setiap 3 Tahun"
    ]
  },
  "Plug PD2": {
    lagging: ["Plug PD2 Kendor & Aus"],
    leading: ["Pengecekan semua kondisi PLUG PD2"]
  },
  "BPCP": {
    lagging: ["BPCP Modul Bocor"],
    leading: [
      "Pemeriksaan Kondisi BPCP setiap Bulan",
      "Reload EPCU Software P36",
      "Recyce ALL CB sampai Battery tunggu 1 Minute setiap Bulan BPCP",
      "Drain Manual MR setiap Bulan"
    ]
  },
  "MPU": {
    lagging: ["MPU Error"],
    leading: [
      "Instal Ulang MPU Setiap setiap 3 Tahun",
      "Pengecekan dan Pembersihan MPU setiap perawatan",
      "Recyce ALL CB sampai Battery tunggu 1 Minute setiap Bulan MPU"
    ]
  },
  "PSU 500": {
    lagging: ["PSU 500 tidak mengeluarkan tegangan"],
    leading: [
      "Pengecekan dan Pembersihan PSU 500 Setiap Perawatan",
      "Recyce ALL CB sampai Battery tunggu 1 Minute setiap Bulan PSU 500"
    ]
  },
  "Turbocharger": {
    lagging: ["Turbocharger Cacat"],
    leading: [
      "Pemeriksaan Kondisi Turbocharger (Mur, Baut, TPURPM)",
      "Pembuatan alat DC LINK berbasis IoT (Daily Checker Locomotive Integrated NetworK)",
      "Pemeriksaan GAP Clearence Impeler Air Inlet Setiap Perawatan"
    ]
  },
  "Fuel Pump": {
    lagging: ["Inverter Trip"],
    leading: [
      "Pengecekan dan pengukuran Fuel Pump Setiap Perawatan",
      "Flushing Fuel Setiap Perawatan (FP)"
    ]
  },
  "Wiper": {
    lagging: ["Wiper Patah"],
    leading: [
      "Pengecekan dan Penggantian Komponen Wiper (Blade, Cup Nut, Baut) setiap Bulan",
      "Setup Langkah Blade setiap Bulan"
    ]
  },
  "Pemasir": {
    lagging: ["Pemasir tersumbat"],
    leading: ["Pengecekan Semua Komponen Pemasir"]
  },
  "MPIO": {
    lagging: ["MPIO Error"],
    leading: [
      "Pengecekan dan Pembersihan MPIO Setiap Perawatan",
      "Recyce ALL CB sampai Battery tunggu 1 Minute setiap Bulan MPIO",
      "Reload EPCU Software setiap 36 Bulan (MPIO)"
    ]
  },
  "Relay GR": {
    lagging: ["Relay GR tidak bisa reset"],
    leading: [
      "Pengecekan Semua Kondisi Relay GR & Koneksinya",
      "Melakukan Ground Test semua lokomotif saat perawatan"
    ]
  },
  "Roda": {
    lagging: ["Diameter Roda Berkurang Lebih Cepat"],
    leading: ["Melakukan Pengukuran Roda Periode 1 Bulan"]
  },
  "Bearing": {
    lagging: ["Bearing Failure Mendekati KM Tempuh Maksimal"],
    leading: [
      "Melakukan Pengecekan Suhu Bearing",
      "Pengecekan Seal Cap (Tidak Meler/Rusak)",
      "Pengecekan Baut End Cup Kencang dan Lengkap"
    ]
  }
};
const targetOptions = [
  "Setiap Perawatan",
  "Setiap Bulan",
  "Setiap 12 Bulan",
  "Setiap 1,5 Tahun",
  "Setiap 3 Tahun",
  "Setiap P36/36 Bulan",
  "Tim PRL dan Tim 8"
];

export default function InputDataMultiKategori() {
  // Ambil role user dari Redux (default ke 'user' jika tidak ada)
  const role = useSelector(state => state.auth?.user?.role || 'user');
  const [tab, setTab] = useState(1);

  // Auto sync role-based UI: jika role berubah ke 'user', paksa tab ke Pantauan Roda
  useEffect(() => {
    if (role === 'user' && tab !== 1) setTab(1);
  }, [role]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // State for each form
  const [manpower, setManpower] = useState({
  nipp: '',
  nama: '',
  jabatan: '',
  regu: '',
  tempatLahir: '',
  tanggalLahir: null,
  tmtPensiun: null,
  pendidikan: '',
  diklatT2PRS: null,
  diklatT2PMS: null,
  diklatT3PRS: null,
  diklatT3PMS: null,
  diklatT4: null,
  diklatSMDP: null,
  diklatJMDP: null,
  diklatDIKSAR: null,
  dtoPRS: null,
  dtoPMS: null
});
// Sertifikasi hanya satu per pegawai
const [sertifikasi, setSertifikasi] = useState({
  sertifikasi: '',
  nomor_sertifikat: '',
  tanggal_terbit: null,
  berlaku_sampai: null,
  masa_berlaku: null,
  status: ''
});
  const [pantauan, setPantauan] = useState({ diameter: '', flensKanan: '', flensKiri: '', tinggiKanan: '', tinggiKiri: '' });
  const nomorLokomotifOptions = [
  'CC 205 01', 'CC 205 02', 'CC 205 03', 'CC 205 04', 'CC 205 05', 'CC 205 06', 'CC 205 07', 'CC 205 08', 'CC 205 09', 'CC 205 10',
];
const kategoriFasilitasOptions = [
  'Alat Angkut', 'Evakuasi', 'Safety', 'Perawatan', 'Pendukung',
];
const kategoriStandardisasiOptions = [
  'UJI BERKALA', 'KALIBRASI', 'VERIFIKASI',
];

const [fasilitas, setFasilitas] = useState({
  nomorAset: '',
  namaPemeriksa: '',
  kategori: '',
  namaFasilitas: '',
  jumlahSatuan: '',
  baik: '',
  pantauan: '',
  rusak: '',
  spesifikasi: '',
  merk: '',
  tahunPengadaan: '',
  tahunMulaiDinas: '',
  tanggalPerawatan: null,
  kategoriStandardisasi: '',
  tanggalSertifikasi: null,
  lokasiPenyimpanan: '',
  umurKomponen: '',
  foto: null,
  fotoError: '',
  fotoPreview: null,
});

// Tambahkan deklarasi state actionPlan agar tidak error
const [actionPlan, setActionPlan] = useState({
  namaPemeriksa: '',
  tanggal: null,
  nomorLokomotif: '',
  komponen: '',
  aktivitas: '',
  detailAktivitas: '',
  target: '',
  foto: null
});

  // Handlers
const handleTabChange = (_, newValue) => setTab(newValue);
const handleManpowerChange = (e) => setManpower({ ...manpower, [e.target.name]: e.target.value });
const handleManpowerDateChange = (field, value) => setManpower({ ...manpower, [field]: value });
const handlePantauanChange = (e) => setPantauan({ ...pantauan, [e.target.name]: e.target.value });
const handleActionPlanChange = (e) => setActionPlan({ ...actionPlan, [e.target.name]: e.target.value });
const handleActionPlanDateChange = (value) => setActionPlan({ ...actionPlan, tanggal: value });
const handleActionPlanSelectChange = (field, value) => setActionPlan({ ...actionPlan, [field]: value });

// Handler untuk perubahan Komponen pada Action Plan
const handleKomponenChange = (event, value) => {
  setActionPlan(prev => ({
    ...prev,
    komponen: value || '',
    aktivitas: '',
    detailAktivitas: '',
    target: ''
  }));
};

// Handler untuk perubahan Aktivitas (lagging)
const handleAktivitasChange = (event, value) => {
  setActionPlan(prev => ({
    ...prev,
    aktivitas: value || '',
    detailAktivitas: '' // reset detailAktivitas jika aktivitas berubah
  }));
};

// Handler untuk perubahan Detail Aktivitas (leading)
const handleDetailAktivitasChange = (event, value) => {
  setActionPlan(prev => ({
    ...prev,
    detailAktivitas: value || ''
  }));
};

// Handler untuk perubahan Target
const handleTargetChange = (event, value) => {
  setActionPlan(prev => ({
    ...prev,
    target: value || ''
  }));
};

// --- Dropdown dinamis Action Plan ---
// komponenOptions dan komponenMap sudah lengkap (lihat bagian atas file)
const laggingOptions = komponenMap[actionPlan.komponen]?.lagging || [];
const leadingOptions = komponenMap[actionPlan.komponen]?.leading || [];
// targetOptions sudah ada di bagian bawah mapping

const handleActionPlanFile = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      setActionPlan((prev) => ({ ...prev, foto: null, fotoError: 'Ukuran file maksimal 10MB', fotoPreview: null }));
      return;
    }
    setActionPlan((prev) => ({ ...prev, foto: file, fotoError: '', fotoPreview: URL.createObjectURL(file) }));
  } else {
    setActionPlan((prev) => ({ ...prev, foto: null, fotoError: '', fotoPreview: null }));
  }
};

// Alias agar kompatibel dengan JSX lama
const handleFotoChange = handleActionPlanFile;

const handleActionPlanDrop = (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      setActionPlan((prev) => ({ ...prev, foto: null, fotoError: 'Ukuran file maksimal 10MB', fotoPreview: null }));
      return;
    }
    setActionPlan((prev) => ({ ...prev, foto: file, fotoError: '', fotoPreview: URL.createObjectURL(file) }));
  }
};
const handleActionPlanDragOver = (e) => e.preventDefault();
const handleFasilitasChange = (e) => setFasilitas({ ...fasilitas, [e.target.name]: e.target.value });
const handleFasilitasSelectChange = (field, value) => setFasilitas({ ...fasilitas, [field]: value });
const handleFasilitasDateChange = (field, value) => setFasilitas({ ...fasilitas, [field]: value });
const handleFasilitasFile = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      setFasilitas((prev) => ({ ...prev, foto: null, fotoError: 'Ukuran file maksimal 10MB', fotoPreview: null }));
      return;
    }
    setFasilitas((prev) => ({ ...prev, foto: file, fotoError: '', fotoPreview: URL.createObjectURL(file) }));
  }
};
const handleFasilitasDrop = (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      setFasilitas((prev) => ({ ...prev, foto: null, fotoError: 'Ukuran file maksimal 10MB', fotoPreview: null }));
      return;
    }
    setFasilitas((prev) => ({ ...prev, foto: file, fotoError: '', fotoPreview: URL.createObjectURL(file) }));
  }
};
const handleFasilitasDragOver = (e) => e.preventDefault();

  // File inputs
  // (handleActionPlanFile and handleFasilitasFile already defined above with validation and preview handling)

  // Integrasi submit ke backend
const handleSertifikasiChange = (field, value) => {
  setSertifikasi(prev => ({ ...prev, [field]: value }));
};

const handleSubmit = async (kategori) => {
let data;
switch (kategori) {
  case 'manpower':
  case 'actionPlan':
  case 'fasilitas':
    if (role === 'user') return; // user tidak boleh submit ini
    break;
  default:
    break;
}

switch (kategori) {
  case 'manpower':
    data = manpower;
    break;
  case 'pantauan':
    data = pantauan;
    break;
  case 'pantauanRoda':
    data = pantauanRoda;
    break;
  case 'actionPlan':
    // Mapping camelCase ke snake_case untuk backend
    // Mapping otomatis PIC berdasarkan detailAktivitas
// (import detailAktivitasToPic di bagian atas file)
    // Fungsi mapping PIC robust: normalisasi key (trim & lower case)
    // Pastikan detailAktivitas hanya bisa dipilih dari dropdown leadingOptions, yang sumbernya dari Object.keys(detailAktivitasToPic)
const getPic = (detailAktivitas) => {
  const normalized = (detailAktivitas || '').trim().toLowerCase();
  const mapping = {};
  Object.keys(detailAktivitasToPic).forEach(key => {
    mapping[key.trim().toLowerCase()] = detailAktivitasToPic[key];
  });
  return mapping[normalized] || null;
};
// Log detail value dan perbandingan dengan key mapping
console.log('[DEBUG] detail_aktivitas (asli):', actionPlan.detailAktivitas, '| length:', (actionPlan.detailAktivitas||'').length);
console.log('[DEBUG] detail_aktivitas (trim,lower):', (actionPlan.detailAktivitas||'').trim().toLowerCase(), '| length:', (actionPlan.detailAktivitas||'').trim().toLowerCase().length);
Object.keys(detailAktivitasToPic).forEach(k => {
  if ((actionPlan.detailAktivitas||'').trim().toLowerCase() === k.trim().toLowerCase()) {
    console.log('[DEBUG] MATCHED KEY:', k, '| length:', k.length);
  }
});
const pic = getPic(actionPlan.detailAktivitas);
data = {
      nama_pemeriksa: actionPlan.namaPemeriksa,
      tanggal: actionPlan.tanggal,
      nomor_lokomotif: actionPlan.nomorLokomotif,
      komponen: actionPlan.komponen,
      aktivitas: actionPlan.aktivitas,
      detail_aktivitas: actionPlan.detailAktivitas,
      pic,
      target: actionPlan.target,
      foto_path: actionPlan.fotoPath
    };
    break;
  case 'fasilitas':
    data = fasilitas;
    break;
  default:
    data = {};
}

if (kategori === 'manpower') {
  // Validasi field wajib (frontend)
  const required = [
    { field: 'nipp', label: 'NIPP' },
    { field: 'nama', label: 'Nama' },
    { field: 'jabatan', label: 'Jabatan' },
    { field: 'pendidikan', label: 'Pendidikan' },
    { field: 'tmtPensiun', label: 'TMT Pensiun' },
    { field: 'tanggalLahir', label: 'Tanggal Lahir' },
  ];
  const missing = required.filter(r => !manpower[r.field]);
  if (missing.length > 0) {
    alert('Field wajib belum diisi: ' + missing.map(m => m.label).join(', '));
    return;
  }
  // Mapping ke backend
  const payload = {
    nipp: manpower.nipp,
    nama: manpower.nama,
    jabatan: manpower.jabatan,
    regu: manpower.regu,
    tempat_lahir: manpower.tempatLahir,
    tanggal_lahir: manpower.tanggalLahir ? dayjs(manpower.tanggalLahir).format('YYYY-MM-DD') : null,
    tmt_pensiun: manpower.tmtPensiun ? dayjs(manpower.tmtPensiun).format('YYYY-MM-DD') : null,
    pendidikan: manpower.pendidikan,
    is_active: true
  };
  try {
    // 1. Submit identitas
    const res = await fetch('/api/manpower', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Gagal menyimpan data manpower: ' + (err.message || 'Unknown error'));
      return;
    }
    // 2. Submit diklat
    const diklatPayload = {
      nipp: manpower.nipp,
      dto_prs: manpower.diklatT2PRS ? dayjs(manpower.diklatT2PRS).format('YYYY-MM-DD') : null,
      dto_pms: manpower.diklatT2PMS ? dayjs(manpower.diklatT2PMS).format('YYYY-MM-DD') : null,
      t2_prs: manpower.diklatT2PRS ? dayjs(manpower.diklatT2PRS).format('YYYY-MM-DD') : null,
      t2_pms: manpower.diklatT2PMS ? dayjs(manpower.diklatT2PMS).format('YYYY-MM-DD') : null,
      t3_prs: manpower.diklatT3PRS ? dayjs(manpower.diklatT3PRS).format('YYYY-MM-DD') : null,
      t3_pms: manpower.diklatT3PMS ? dayjs(manpower.diklatT3PMS).format('YYYY-MM-DD') : null,
      t4_mps: manpower.diklatT4 ? dayjs(manpower.diklatT4).format('YYYY-MM-DD') : null,
      smdp: manpower.diklatSMDP ? dayjs(manpower.diklatSMDP).format('YYYY-MM-DD') : null,
      jmdp: manpower.diklatJMDP ? dayjs(manpower.diklatJMDP).format('YYYY-MM-DD') : null
    };
    await fetch('/api/manpower-diklat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(diklatPayload)
    });
    // 3. Submit satu sertifikasi (jika ada)
    if (sertifikasi.sertifikasi) {
      const sertPayload = {
        nipp: manpower.nipp,
        sertifikasi: sertifikasi.sertifikasi,
        nomor_sertifikat: sertifikasi.nomor_sertifikat,
        tanggal_terbit: sertifikasi.tanggal_terbit ? dayjs(sertifikasi.tanggal_terbit).format('YYYY-MM-DD') : null,
        berlaku_sampai: sertifikasi.berlaku_sampai ? dayjs(sertifikasi.berlaku_sampai).format('YYYY-MM-DD') : null,
        masa_berlaku: sertifikasi.masa_berlaku ? dayjs(sertifikasi.masa_berlaku).format('YYYY-MM-DD') : null,
        status: sertifikasi.status
      };
      await fetch('/api/manpower-sertifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sertPayload)
      });
    }
    alert('Data manpower, diklat, dan sertifikasi berhasil disimpan!');
    setManpower({
      nipp: '', nama: '', jabatan: '', regu: '', tempatLahir: '', tanggalLahir: null, tmtPensiun: null, pendidikan: '',
      diklatT2PRS: null, diklatT2PMS: null, diklatT3PRS: null, diklatT3PMS: null, diklatT4: null, diklatSMDP: null, diklatJMDP: null, diklatDIKSAR: null,
      dtoPRS: null, dtoPMS: null
    });
    setSertifikasi({ sertifikasi: '', nomor_sertifikat: '', tanggal_terbit: null, berlaku_sampai: null, masa_berlaku: null, status: '' });
  } catch (error) {
    alert('Gagal submit data: ' + error.message);
  }
  return;
}

if (kategori === 'fasilitas') {
  // Mapping field camelCase ke snake_case sesuai tabel DB
  const fasilitasPayload = {
    nomor_aset: data.nomorAset,
    nama_fasilitas: data.namaFasilitas,
    kategori: data.kategori,
    jumlah_satuan: data.jumlahSatuan ? parseInt(data.jumlahSatuan) : 0,
    baik: data.baik ? parseInt(data.baik) : 0,
    pantauan: data.pantauan ? parseInt(data.pantauan) : 0,
    rusak: data.rusak ? parseInt(data.rusak) : 0,
    spesifikasi: data.spesifikasi,
    merk: data.merk,
    tahun_pengadaan: data.tahunPengadaan ? parseInt(data.tahunPengadaan) : null,
    tahun_mulai_dinas: data.tahunMulaiDinas ? parseInt(data.tahunMulaiDinas) : null,
    tanggal_perawatan: data.tanggalPerawatan ? dayjs(data.tanggalPerawatan).format('YYYY-MM-DD') : null,
    kategori_standardisasi: data.kategoriStandardisasi,
    tanggal_sertifikasi: data.tanggalSertifikasi ? dayjs(data.tanggalSertifikasi).format('YYYY-MM-DD') : null,
    lokasi_penyimpanan: data.lokasiPenyimpanan,
    umur_komponen: data.umurKomponen ? parseInt(data.umurKomponen) : null,
    foto_path: data.foto ? data.foto.name : null, // Untuk demo, hanya simpan nama file
    is_active: true
  };
  try {
    const res = await fetch('/api/fasilitas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fasilitasPayload)
    });
    if (res.ok) {
      alert('Data fasilitas berhasil disimpan!');
      // Optionally, reset form here
    } else {
      const err = await res.json();
      alert('Gagal menyimpan data fasilitas: ' + (err.message || 'Unknown error'));
    }
  } catch (error) {
    alert('Gagal menyimpan data fasilitas: ' + error.message);
  }
  return;
}

// ===== SUBMIT ACTION PLAN =====
if (kategori === 'actionPlan') {
  // Validasi field wajib (frontend)
  const required = [
    { field: 'namaPemeriksa', label: 'Nama Pemeriksa' },
    { field: 'tanggal', label: 'Tanggal' },
    { field: 'nomorLokomotif', label: 'Nomor Lokomotif' },
    { field: 'komponen', label: 'Komponen' },
    { field: 'aktivitas', label: 'Aktivitas (Lagging Indicator)' },
    { field: 'detailAktivitas', label: 'Detail Aktivitas (Leading Indicator)' },
    { field: 'target', label: 'Target' }
  ];
  const missing = required.filter(r => !actionPlan[r.field] || String(actionPlan[r.field]).trim() === '');
  if (missing.length > 0) {
    alert('Field wajib belum diisi: ' + missing.map(m => m.label).join(', '));
    return;
  }
  // Mapping ke backend
  const payload = {
    nama_pemeriksa: actionPlan.namaPemeriksa,
    tanggal: actionPlan.tanggal ? dayjs(actionPlan.tanggal).format('YYYY-MM-DD') : null,
    nomor_lokomotif: actionPlan.nomorLokomotif,
    komponen: actionPlan.komponen,
    aktivitas: actionPlan.aktivitas, // lagging indicator
    detail_aktivitas: actionPlan.detailAktivitas, // leading indicator
    target: actionPlan.target,
    foto_path: actionPlan.foto ? actionPlan.foto.name : null // Simpan nama file jika ada
  };
  try {
    const res = await fetch('/api/action-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Gagal menyimpan data action plan: ' + (err.message || 'Unknown error'));
      return;
    }
    alert('Data action plan berhasil disimpan!');
    setActionPlan({
      namaPemeriksa: '',
      tanggal: null,
      nomorLokomotif: '',
      komponen: '',
      aktivitas: '',
      detailAktivitas: '',
      target: '',
      foto: null,
      fotoError: '',
      fotoPreview: null
    });
    // Optionally, trigger a dashboard refresh if needed (e.g. via callback/props)
  } catch (error) {
    alert('Gagal submit data action plan: ' + error.message);
  }
  return;
}

// ===== SUBMIT PANTAUAN RODA =====
if (kategori === 'pantauanRoda') {
  // Validasi identitas dasar
  const required = ['nipp','nama','jabatan','depo','nomorLokomotif'];
  const missing = required.filter(f => !pantauanRoda[f] || String(pantauanRoda[f]).trim() === '');
  if (missing.length > 0) {
    alert('Field identitas wajib belum diisi: ' + missing.join(', '));
    return;
  }
  // Mapping 12 pasang data diameter/thickness/height
  const wheelLabels = [1,2,3,4,5,6];
  console.log('[DEBUG] pantauanRoda sebelum mapping batch:', pantauanRoda);
  const batch = [];
  for (let n of wheelLabels) {
    // Kanan
    batch.push({
      loko: pantauanRoda.nomorLokomotif,
      date: new Date().toISOString().slice(0,10),
      diameter: parseFloat(pantauanRoda[`diameterRight${n}`]) || null,
      thickness: parseFloat(pantauanRoda[`flangeThicknessRight${n}`]) || null,
      height: parseFloat(pantauanRoda[`flangeHeightRight${n}`]) || null,
      status: '', // opsional, backend bisa hitung status
      lifetime: '', // opsional
      posisi: `KANAN${n}`,
      nipp: pantauanRoda.nipp,
      nama: pantauanRoda.nama,
      jabatan: pantauanRoda.jabatan,
      depo: pantauanRoda.depo
    });
    // Kiri
    batch.push({
      loko: pantauanRoda.nomorLokomotif,
      date: new Date().toISOString().slice(0,10),
      diameter: parseFloat(pantauanRoda[`diameterLeft${n}`]) || null,
      thickness: parseFloat(pantauanRoda[`flangeThicknessLeft${n}`]) || null,
      height: parseFloat(pantauanRoda[`flangeHeightLeft${n}`]) || null,
      status: '',
      lifetime: '',
      posisi: `KIRI${n}`,
      nipp: pantauanRoda.nipp,
      nama: pantauanRoda.nama,
      jabatan: pantauanRoda.jabatan,
      depo: pantauanRoda.depo
    });
  }
  // Pastikan minimal 12 data diameter/thickness/height terisi
  const validCount = batch.filter(d => d.diameter && d.thickness && d.height).length;
  if (validCount < 12) {
    alert('Minimal 12 data diameter/thickness/height harus diisi lengkap!');
    return;
  }
  try {
    // Hitung min untuk preview status (frontend)
    const diameter_min = Math.min(...batch.map(d => Number(d.diameter)));
    const thickness_min = Math.min(...batch.map(d => Number(d.thickness)));
    const height_min = Math.min(...batch.map(d => Number(d.height)));
    // Logic status baru (sama seperti backend)
    function getStatus(param, value) {
      if (param === 'diameter') {
        if (value < 990 || value > 1067) return 'INVALID';
        if (value >= 990 && value <= 998) return 'URGENT';
        if (value >= 999 && value <= 1015) return 'WARNING';
        if (value >= 1016 && value <= 1067) return 'NORMAL';
      }
      if (param === 'thickness') {
        if (value < 22 || value > 32) return 'INVALID';
        if (value >= 22 && value <= 23) return 'URGENT';
        if (value >= 24 && value <= 25) return 'WARNING';
        if (value >= 26 && value <= 32) return 'NORMAL';
      }
      if (param === 'flange') {
        if (value === 33) return 'URGENT';
        if (value >= 31 && value <= 32) return 'WARNING';
        if (value >= 28 && value <= 30) return 'NORMAL';
        return 'INVALID';
      }
      return 'INVALID';
    }
    const statusList = [
      getStatus('diameter', diameter_min),
      getStatus('thickness', thickness_min),
      getStatus('flange', height_min)
    ];
    let worstStatus = 'NORMAL';
    if (statusList.includes('URGENT')) worstStatus = 'URGENT';
    else if (statusList.includes('WARNING')) worstStatus = 'WARNING';
    else if (statusList.includes('INVALID')) worstStatus = 'INVALID';
    // Set status untuk setiap detail batch
    const batchWithStatus = batch.map(d => {
      return {
        ...d,
        status_diameter: getStatus('diameter', Number(d.diameter)),
        status_thickness: getStatus('thickness', Number(d.thickness)),
        status_flange: getStatus('flange', Number(d.height))
      };
    });
    // Payload sesuai backend
    const payload = {
      nomor_lokomotif: pantauanRoda.nomorLokomotif,
      tanggal_inspeksi: pantauanRoda.tanggalInspeksi ? (typeof pantauanRoda.tanggalInspeksi === 'string' ? pantauanRoda.tanggalInspeksi : pantauanRoda.tanggalInspeksi.toISOString().slice(0,10)) : new Date().toISOString().slice(0,10),
      inspector_name: pantauanRoda.nama, // atau field lain jika ada
      keterangan: pantauanRoda.keterangan || '',
      detail: batchWithStatus,
      status_preview: worstStatus // opsional, untuk preview di FE
    };

    // (opsional: tampilkan status preview ke user sebelum submit)
    // alert('Status summary box (preview): ' + worstStatus);
    console.log('Batch detail yang dikirim:', batchWithStatus);
    const res = await fetch('/api/pantauan-roda', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Gagal menyimpan data pantauan roda: ' + (err.message || 'Unknown error'));
      return;
    }
    alert('Data pantauan roda berhasil disimpan!');
    // Reset form
    const state = {};
    ['nipp','nama','jabatan','depo','nomorLokomotif','tanggalInspeksi'].forEach(f => { state[f] = ''; });
    ['diameter','flangeThickness','flangeHeight'].forEach(kat => {
      wheelLabels.forEach(n => {
        state[`${kat}Right${n}`] = '';
        state[`${kat}Left${n}`] = '';
      });
    });
    setPantauanRoda(state);
  } catch (error) {
    alert('Gagal submit data pantauan roda: ' + error.message);
  }
  return;
}
if (kategori === 'actionPlan') {
  // Validasi field wajib (frontend)
  const required = [
    { field: 'namaPemeriksa', label: 'Nama Pemeriksa' },
    { field: 'tanggal', label: 'Tanggal Pelaksanaan' },
    { field: 'nomorLokomotif', label: 'Nomor Lokomotif' },
    { field: 'komponen', label: 'Komponen' },
    { field: 'aktivitas', label: 'Aktivitas' },
    { field: 'detailAktivitas', label: 'Detail Aktivitas' }
  ];
  const missing = required.filter(r => !actionPlan[r.field]);
  if (missing.length > 0) {
    alert('Field wajib belum diisi: ' + missing.map(m => m.label).join(', '));
    return;
  }
  try {
    const formData = new FormData();
    formData.append('nama_pemeriksa', actionPlan.namaPemeriksa);
    formData.append('tanggal', actionPlan.tanggal ? dayjs(actionPlan.tanggal).format('YYYY-MM-DD') : '');
    formData.append('nomor_lokomotif', actionPlan.nomorLokomotif);
    formData.append('komponen', actionPlan.komponen);
    formData.append('aktivitas', actionPlan.aktivitas);
    formData.append('detail_aktivitas', actionPlan.detailAktivitas);
    formData.append('pic', pic);
    // Jika ingin simpan target, masukkan ke keterangan (opsional)
    // formData.append('keterangan', actionPlan.target || '');
    if (actionPlan.foto) {
      formData.append('foto', actionPlan.foto);
    }
    const res = await fetch('/api/action-plan', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json();
      alert('Gagal menyimpan data Action Plan: ' + (err.message || 'Unknown error'));
      return;
    }
    alert('Data Action Plan berhasil disimpan!');
    setActionPlan({
      namaPemeriksa: '',
      tanggal: null,
      nomorLokomotif: '',
      komponen: '',
      aktivitas: '',
      detailAktivitas: '',
      foto: null
    });
  } catch (error) {
    alert('Gagal submit Action Plan: ' + error.message);
  }
  return;
}
// Untuk kategori lain, tetap pakai alert simulasi
alert('Data disimpan untuk kategori: ' + kategori + '\n' + JSON.stringify(data, null, 2));
};  

  // Form UI
  const formCardStyle = {
    borderRadius: 4,
    boxShadow: 3,
    mb: 3,
    bgcolor: '#fff',
    p: { xs: 2, md: 4 },
    maxWidth: 600,
    mx: 'auto',
  };

  const headerStyle = {
    background: blueGradient,
    color: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    px: 3,
    py: 2,
    mb: 2,
    display: 'flex',
    alignItems: 'center',
    minHeight: 56
  };

// --- FORMS ---
  const pendidikanOptions = [
  'SLTA', 'D3', 'D1', 'SD'
  ];
  const sertifikasiOptions = [
  'Sertifikat A', 'Sertifikat B', 'Sertifikat C', 'Sertifikat D'
  ];

  const ManpowerForm = (
    <Card sx={formCardStyle}>
      <Box sx={headerStyle}>
        <Typography variant="h6" fontWeight={700}>Input Data Manpower</Typography>
      </Box>
      <CardContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
          {/* Identitas Dasar */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Identitas Dasar</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}><TextField name="nipp" label="NIPP" fullWidth value={manpower.nipp} onChange={handleManpowerChange} size="small" sx={{ mb: { xs: 2, md: 0 } }} /></Grid>
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}><TextField name="nama" label="Nama" fullWidth value={manpower.nama} onChange={handleManpowerChange} size="small" sx={{ mb: { xs: 2, md: 0 } }} /></Grid>
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}><TextField name="jabatan" label="Jabatan" fullWidth value={manpower.jabatan} onChange={handleManpowerChange} size="small" sx={{ mb: { xs: 2, md: 0 } }} /></Grid>
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}><TextField name="regu" label="Regu" fullWidth value={manpower.regu} onChange={handleManpowerChange} size="small" sx={{ mb: { xs: 2, md: 0 } }} /></Grid>
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}><TextField name="tempatLahir" label="Tempat Lahir" fullWidth value={manpower.tempatLahir} onChange={handleManpowerChange} size="small" sx={{ mb: { xs: 2, md: 0 } }} /></Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}>
            <DatePicker
              label="Tanggal Lahir"
              value={manpower.tanggalLahir}
              onChange={(v) => handleManpowerDateChange('tanggalLahir', v)}
              slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }}
            />
          </Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}>
            <DatePicker
              label="TMT Pensiun"
              value={manpower.tmtPensiun}
              onChange={(v) => handleManpowerDateChange('tmtPensiun', v)}
              slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <Autocomplete
              options={pendidikanOptions}
              value={manpower.pendidikan}
              onChange={(_, v) => setManpower({ ...manpower, pendidikan: v })}
              renderInput={(params) => <TextField {...params} label="Pendidikan Diakui" fullWidth size="small" />}
              fullWidth
              disableClearable
              autoHighlight
              sx={{ mb: { xs: 2, md: 0 } }}
            />
          </Grid>
          {/* Pendidikan & Diklat */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Pendidikan & Diklat</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}><DatePicker label="Diklat T2 PRS" value={manpower.diklatT2PRS} onChange={(v) => handleManpowerDateChange('diklatT2PRS', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}><DatePicker label="Diklat T2 PMS" value={manpower.diklatT2PMS} onChange={(v) => handleManpowerDateChange('diklatT2PMS', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}><DatePicker label="Diklat T3 PRS" value={manpower.diklatT3PRS} onChange={(v) => handleManpowerDateChange('diklatT3PRS', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}><DatePicker label="Diklat T3 PMS" value={manpower.diklatT3PMS} onChange={(v) => handleManpowerDateChange('diklatT3PMS', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}><DatePicker label="Diklat T4" value={manpower.diklatT4} onChange={(v) => handleManpowerDateChange('diklatT4', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}><DatePicker label="SMDP" value={manpower.diklatSMDP} onChange={(v) => handleManpowerDateChange('diklatSMDP', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}><DatePicker label="JMDP" value={manpower.diklatJMDP} onChange={(v) => handleManpowerDateChange('diklatJMDP', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}><DatePicker label="DIKSAR" value={manpower.diklatDIKSAR} onChange={(v) => handleManpowerDateChange('diklatDIKSAR', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
          {/* Sertifikasi Satu Entry */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Sertifikasi</Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          <Grid item xs={12} md={3} sx={{ minWidth: 0 }}>
            <FormControl fullWidth size="small">
            <InputLabel id="jenis-sertifikasi-label">Jenis Sertifikasi</InputLabel>
            <Select
              labelId="jenis-sertifikasi-label"
              value={sertifikasi.jenis}
              label="Jenis Sertifikasi"
              onChange={e => handleSertifikasiChange('jenis', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Pilih Jenis</MenuItem>
              <MenuItem value="ths">THS</MenuItem>
              <MenuItem value="prs pelaksana">PRS Pelaksana</MenuItem>
              <MenuItem value="pms pelaksana">PMS Pelaksana</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3} sx={{ minWidth: 0 }}>
          <TextField name="nomorSertifikat" label="Nomor Sertifikat" fullWidth value={sertifikasi.nomor_sertifikat} onChange={e => handleSertifikasiChange('nomor_sertifikat', e.target.value)} size="small" sx={{ mb: { xs: 2, md: 0 } }} />
        </Grid>
        <Grid item xs={12} md={2} sx={{ minWidth: 0 }}>
          <DatePicker label="Tanggal Terbit" value={sertifikasi.tanggal_terbit} onChange={v => handleSertifikasiChange('tanggal_terbit', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} />
        </Grid>
        <Grid item xs={12} md={2} sx={{ minWidth: 0 }}>
          <DatePicker label="Masa Berlaku" value={sertifikasi.masa_berlaku} onChange={v => handleSertifikasiChange('masa_berlaku', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} />
        </Grid>
<Grid item xs={12} md={2} sx={{ minWidth: 0 }}>
  <FormControl fullWidth size="small">
    <InputLabel id="status-sertifikasi-label">Status</InputLabel>
    <Select
      labelId="status-sertifikasi-label"
      value={sertifikasi.status}
      label="Status"
      onChange={e => handleSertifikasiChange('status', e.target.value)}
      displayEmpty
    >
      <MenuItem value="">Pilih Status</MenuItem>
      <MenuItem value="THS">THS</MenuItem>
      <MenuItem value="Belum">Belum</MenuItem>
      <MenuItem value="OK">OK</MenuItem>
      <MenuItem value="Expired">Expired</MenuItem>
    </Select>
  </FormControl>
</Grid>
          {/* Status Teknik Operasi */}
          <Grid item xs={12} sx={{ mt: 3 }}>
  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Status Teknik Operasi</Typography>
  <Divider sx={{ mb: 2 }} />
</Grid>
<Grid item xs={12} md={6} sx={{ minWidth: 0 }}><DatePicker label="DTO PRS" value={manpower.dtoPRS} onChange={(v) => handleManpowerDateChange('dtoPRS', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
<Grid item xs={12} md={6} sx={{ minWidth: 0 }}><DatePicker label="DTO PMS" value={manpower.dtoPMS} onChange={(v) => handleManpowerDateChange('dtoPMS', v)} slotProps={{ textField: { fullWidth: true, size: 'small', sx: { mb: { xs: 2, md: 0 } } } }} /></Grid>
</Grid>
</LocalizationProvider>
<Box display="flex" gap={2} mt={4}>
  {role === 'admin' && (
    <>
      <Button variant="contained" color="primary" sx={{ fontWeight: 700, minWidth: 120, px: 4, borderRadius: 3, background: blueGradient, boxShadow: 2 }} onClick={() => handleSubmit('manpower')}>Simpan</Button>
    </>
  )}
</Box>
</CardContent>
</Card>
);

// Identitas Dasar fields for Pantauan Roda
const identitasDasarPantauanFields = [
  { name: 'nipp', label: 'NIPP', helper: 'Nomor Induk Pegawai' },
  { name: 'nama', label: 'Nama Pegawai', helper: 'Nama lengkap petugas' },
  { name: 'jabatan', label: 'Jabatan', helper: 'Jabatan pegawai' },
  { name: 'depo', label: 'Depo', helper: 'Nama depo' },
  { name: 'nomorLokomotif', label: 'Nomor Lokomotif', helper: 'Nomor identitas lokomotif' },
  { name: 'tanggalInspeksi', label: 'Tanggal Inspeksi/Perawatan', helper: 'Tanggal pemeriksaan/perawatan (YYYY-MM-DD)', type: 'date' }
];

const wheelLabels = [1,2,3,4,5,6];
const sectionConfigs = [
  {
    key: 'diameter',
    title: 'Diameter Roda',
    subtitle: 'Wheel Diameter',
    bg: 'linear-gradient(90deg, #5de0e6 0%, #2563eb 100%)',
    inputs: wheelLabels.map(n => ([
      {
        name: `diameterRight${n}`,
        label: `Right Wheel ${n} – Wheel Diameter`,
        helper: `Roda ${n} Kanan – Diameter Roda`
      },
      {
        name: `diameterLeft${n}`,
        label: `Left Wheel ${n} – Wheel Diameter`,
        helper: `Roda ${n} Kiri – Diameter Roda`
      }
    ])).flat()
  },
  {
    key: 'flangeThickness',
    title: 'Ketebalan Flens',
    subtitle: 'Flange Thickness',
    bg: 'linear-gradient(90deg, #e0e7ff 0%, #2563eb 100%)',
    inputs: wheelLabels.map(n => ([
      {
        name: `flangeThicknessRight${n}`,
        label: `Right Wheel ${n} – Flange Thickness`,
        helper: `Roda ${n} Kanan – Ketebalan Flens`
      },
      {
        name: `flangeThicknessLeft${n}`,
        label: `Left Wheel ${n} – Flange Thickness`,
        helper: `Roda ${n} Kiri – Ketebalan Flens`
      }
    ])).flat()
  },
  {
    key: 'flangeHeight',
    title: 'Ketinggian Flens',
    subtitle: 'Flange Height',
    bg: 'linear-gradient(90deg, #f5f7fa 0%, #2563eb 100%)',
    inputs: wheelLabels.map(n => ([
      {
        name: `flangeHeightRight${n}`,
        label: `Right Wheel ${n} – Flange Height`,
        helper: `Roda ${n} Kanan – Ketinggian Flens`
      },
      {
        name: `flangeHeightLeft${n}`,
        label: `Left Wheel ${n} – Flange Height`,
        helper: `Roda ${n} Kiri – Ketinggian Flens`
      }
    ])).flat()
  }
];

const checklistIcon = <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#2563eb"/><path d="M7 13l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></Box>;

const [pantauanRoda, setPantauanRoda] = useState(() => {
  const state = {};
  identitasDasarPantauanFields.forEach(f => { state[f.name] = ''; });
  sectionConfigs.forEach(sec => sec.inputs.forEach(inp => { state[inp.name] = ''; }));
  return state;
});
const handlePantauanRodaChange = e => {
  const { name, value } = e.target;
  setPantauanRoda(prev => {
    const next = { ...prev, [name]: value };
    console.log('[DEBUG] Change field:', name, 'value:', value, 'pantauanRoda:', next);
    return next;
  });
};

const PantauanRodaForm = (
  <Card sx={formCardStyle}>
    {/* Identitas Dasar Section */}
    <Box sx={{ mb: 4, borderRadius: 3, boxShadow: 1, bgcolor: '#f8fafc' }}>
      <Box sx={{
        background: 'linear-gradient(90deg, #5de0e6 0%, #2563eb 100%)',
        color: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        px: 3,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        mb: 2
      }}>
        {checklistIcon}
        <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>Identitas Dasar <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: 8 }}>(Basic Identity)</span></Typography>
      </Box>
      <CardContent sx={{ pt: 0 }}>
        <Grid container spacing={2}>
          {identitasDasarPantauanFields.map((f, i) => (
            <Grid item xs={12} md={6} key={f.name} sx={{ minWidth: 0 }}>
              {f.type === 'date' ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={f.label}
                    value={pantauanRoda[f.name] || null}
                    onChange={v => setPantauanRoda(pr => ({ ...pr, [f.name]: v }))}
                    slotProps={{ textField: { fullWidth: true, size: 'small', helperText: f.helper } }}
                  />
                </LocalizationProvider>
              ) : (
                <TextField
                  name={f.name}
                  label={f.label}
                  value={pantauanRoda[f.name]}
                  onChange={handlePantauanRodaChange}
                  fullWidth
                  size="small"
                  helperText={f.helper}
                  sx={{ mb: { xs: 2, md: 0 } }}
                />
              )}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Box>
    {sectionConfigs.map((section, idx) => (
      <Box key={section.key} sx={{ mb: 4, borderRadius: 3, boxShadow: 1, bgcolor: '#f8fafc' }}>
        <Box sx={{
          background: section.bg,
          color: '#fff',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          px: 3,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          mb: 2
        }}>
          {checklistIcon}
          <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>{section.title} <span style={{ fontWeight: 400, opacity: 0.7, marginLeft: 8 }}>({section.subtitle})</span></Typography>
        </Box>
        <CardContent sx={{ pt: 0 }}>
          <Grid container spacing={2}>
            {section.inputs.map((inp, i) => (
              <Grid item xs={12} md={6} key={inp.name} sx={{ minWidth: 0 }}>
                <TextField
                  name={inp.name}
                  label={inp.label}
                  value={pantauanRoda[inp.name]}
                  onChange={handlePantauanRodaChange}
                  fullWidth
                  size="small"
                  helperText={inp.helper}
                  sx={{ mb: { xs: 2, md: 0 } }}
                />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Box>
    ))}
    <Box display="flex" gap={2} mt={2} mb={1} justifyContent="flex-end">
      <Button variant="contained" color="primary" sx={{ fontWeight: 700, minWidth: 120, px: 4, borderRadius: 3, background: blueGradient, boxShadow: 2 }} onClick={() => handleSubmit('pantauanRoda')}>Simpan</Button>
    </Box>
  </Card>
);


  const ActionPlanForm = (
  <Card sx={formCardStyle}>
    {/* Card Header */}
    <Box sx={{
      background: 'linear-gradient(90deg, #5de0e6 0%, #2563eb 100%)',
      color: '#fff',
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      px: 3,
      py: 2,
      mb: 2,
      display: 'flex',
      alignItems: 'center',
      minHeight: 56
    }}>
      <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1 }}>ACTION PLAN</Typography>
    </Box>
    <CardContent>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Grid container spacing={2}>
          {/* Nama Pemeriksa */}
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <TextField
              name="namaPemeriksa"
              label="Nama Pemeriksa"
              value={actionPlan.namaPemeriksa}
              onChange={e => setActionPlan(prev => ({ ...prev, namaPemeriksa: e.target.value }))}
              fullWidth
              size="small"
              helperText="Nama lengkap pemeriksa"
            />
          </Grid>
          {/* Tanggal Pelaksanaan */}
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={idLocale}>
              <DatePicker
                label="Tanggal Pelaksanaan"
                value={actionPlan.tanggal}
                onChange={date => setActionPlan(prev => ({ ...prev, tanggal: date }))}
                renderInput={(params) => <TextField {...params} fullWidth size="small" />}
              />
            </LocalizationProvider>
          </Grid>
          {/* Nomor Lokomotif */}
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <Autocomplete
              options={nomorLokomotifOptions}
              value={actionPlan.nomorLokomotif}
              onChange={(e, value) => setActionPlan(prev => ({ ...prev, nomorLokomotif: value || '' }))}
              renderInput={(params) => <TextField {...params} label="Nomor Lokomotif" fullWidth size="small" helperText="Pilih nomor lokomotif" />}
              fullWidth
              disableClearable
              autoHighlight
            />
          </Grid>
          {/* Komponen Action Plan */}
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <Autocomplete
              options={komponenOptions}
              value={actionPlan.komponen}
              onChange={handleKomponenChange}
              renderInput={(params) => <TextField {...params} label="Komponen Action Plan" fullWidth size="small" helperText="Pilih komponen" />}
              fullWidth
              disableClearable
              autoHighlight
            />
          </Grid>
          {/* Aktivitas Action Plan */}
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <Autocomplete
              options={laggingOptions}
              value={actionPlan.aktivitas}
              onChange={handleAktivitasChange}
              renderInput={(params) => <TextField {...params} label="Aktivitas Action Plan" fullWidth size="small" helperText="Pilih aktivitas" />}
              fullWidth
              disableClearable
              autoHighlight
              disabled={!actionPlan.komponen}
            />
          </Grid>
          {/* Detail Aktivitas Action Plan */}
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <Autocomplete
              options={leadingOptions}
              value={actionPlan.detailAktivitas}
              onChange={handleDetailAktivitasChange}
              renderInput={(params) => <TextField {...params} label="Detail Aktivitas Action Plan" fullWidth size="small" helperText="Pilih detail aktivitas" />}
              fullWidth
              disableClearable
              autoHighlight
              disabled={!actionPlan.komponen}
            />
          </Grid>
          {/* Target */}
          <Grid item xs={12} md={6} sx={{ minWidth: 0 }}>
            <Autocomplete
              options={targetOptions}
              value={actionPlan.target}
              onChange={handleTargetChange}
              renderInput={(params) => <TextField {...params} label="Target" fullWidth size="small" helperText="Pilih target" />}
              fullWidth
              disableClearable
              autoHighlight
            />
          </Grid>
          {/* Upload Foto Action Plan */}
          <Grid item xs={12} md={6}>
            <Button
              variant="contained"
              component="label"
              fullWidth
              sx={{ height: 56 }}
              color={actionPlan.fotoError ? 'error' : 'primary'}
            >
              {actionPlan.foto ? actionPlan.foto.name : 'Upload Foto (JPG/PNG)'}
              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                hidden
                onChange={handleFotoChange}
              />
            </Button>
            {actionPlan.fotoError && (
              <Typography color="error" variant="caption">{actionPlan.fotoError}</Typography>
            )}
            {actionPlan.fotoPreview && !actionPlan.fotoError && (
              <Box mt={1}>
                <img src={actionPlan.fotoPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 120 }} />
              </Box>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Box mt={2}>
              {actionPlan.foto && (
                <Typography variant="caption" color="#2563eb">{actionPlan.foto.name}</Typography>
              )}
              {actionPlan.fotoPreview && (
                <Box mt={1}><img src={actionPlan.fotoPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 6 }} /></Box>
              )}
              {actionPlan.fotoError && (
                <Typography variant="caption" color="error">{actionPlan.fotoError}</Typography>
              )}
            </Box>
          </Grid>
        </Grid>
        <Box display="flex" gap={2} mt={4}>
          <Button variant="contained" color="primary" sx={{ fontWeight: 700, minWidth: 120, px: 4, borderRadius: 3, background: blueGradient, boxShadow: 2 }} onClick={() => handleSubmit('actionPlan')} disabled={role === 'user'}>Simpan</Button>
        </Box>
      </LocalizationProvider>
    </CardContent>
  </Card>
);

// ...
  const clipboardIcon = <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}><svg width="24" height="24" fill="none" viewBox="0 0 24 24"><rect x="4" y="2" width="16" height="20" rx="4" fill="#2563eb"/><rect x="8" y="6" width="8" height="2" rx="1" fill="#fff"/></svg></Box>;

  const FasilitasForm = (
    <Card sx={formCardStyle}>
      {/* Card Header */}
      <Box sx={{
        background: 'linear-gradient(90deg, #2563eb 0%, #5de0e6 100%)',
        color: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        px: 3,
        py: 2,
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        minHeight: 56
      }}>
        {clipboardIcon}
        <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 1 }}>FASILITAS</Typography>
      </Box>
      <CardContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Grid container spacing={2}>
            {/* Nomor Aset */}
            <Grid item xs={12} md={6}><TextField name="nomorAset" label="Nomor Aset" value={fasilitas.nomorAset} onChange={handleFasilitasChange} fullWidth size="small" helperText="Nomor identitas aset fasilitas" /></Grid>
            {/* Nama Pemeriksa */}
            <Grid item xs={12} md={6}><TextField name="namaPemeriksa" label="Nama Pemeriksa" value={fasilitas.namaPemeriksa} onChange={handleFasilitasChange} fullWidth size="small" helperText="Nama lengkap pemeriksa" /></Grid>
            {/* Kategori */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={kategoriFasilitasOptions}
                value={fasilitas.kategori}
                onChange={(_, v) => handleFasilitasSelectChange('kategori', v)}
                renderInput={(params) => <TextField {...params} label="Kategori" fullWidth size="small" helperText="Pilih kategori fasilitas" />}
                fullWidth
                disableClearable
                autoHighlight
              />
            </Grid>
            {/* Nama Fasilitas Alat Kerja */}
            <Grid item xs={12} md={6}><TextField name="namaFasilitas" label="Nama Fasilitas Alat Kerja" value={fasilitas.namaFasilitas} onChange={handleFasilitasChange} fullWidth size="small" helperText="Nama alat kerja atau fasilitas" /></Grid>
            {/* Jumlah Satuan */}
            <Grid item xs={12} md={6}><TextField name="jumlahSatuan" label="Jumlah Satuan" value={fasilitas.jumlahSatuan} onChange={handleFasilitasChange} fullWidth size="small" helperText="Jumlah unit/satuan alat" type="number" /></Grid>
            {/* Baik */}
            <Grid item xs={12} md={6}><TextField name="baik" label="Baik" value={fasilitas.baik} onChange={handleFasilitasChange} fullWidth size="small" helperText="Jumlah alat dalam kondisi baik" type="number" /></Grid>
            {/* Pantauan */}
            <Grid item xs={12} md={6}><TextField name="pantauan" label="Pantauan" value={fasilitas.pantauan} onChange={handleFasilitasChange} fullWidth size="small" helperText="Jumlah alat dalam pantauan" type="number" /></Grid>
            {/* Rusak */}
            <Grid item xs={12} md={6}><TextField name="rusak" label="Rusak" value={fasilitas.rusak} onChange={handleFasilitasChange} fullWidth size="small" helperText="Jumlah alat rusak" type="number" /></Grid>
            {/* Spesifikasi */}
            <Grid item xs={12} md={6}><TextField name="spesifikasi" label="Spesifikasi" value={fasilitas.spesifikasi} onChange={handleFasilitasChange} fullWidth size="small" helperText="Spesifikasi teknis alat" /></Grid>
            {/* Merk */}
            <Grid item xs={12} md={6}><TextField name="merk" label="Merk" value={fasilitas.merk} onChange={handleFasilitasChange} fullWidth size="small" helperText="Merk alat" /></Grid>
            {/* Tahun Pengadaan */}
            <Grid item xs={12} md={6}><TextField name="tahunPengadaan" label="Tahun Pengadaan" value={fasilitas.tahunPengadaan} onChange={handleFasilitasChange} fullWidth size="small" helperText="Tahun pembelian/pengadaan alat" type="number" /></Grid>
            {/* Tahun Mulai Dinas */}
            <Grid item xs={12} md={6}><TextField name="tahunMulaiDinas" label="Tahun Mulai Dinas" value={fasilitas.tahunMulaiDinas} onChange={handleFasilitasChange} fullWidth size="small" helperText="Tahun mulai operasional alat" type="number" /></Grid>
            {/* Tanggal Perawatan */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Tanggal Perawatan"
                value={fasilitas.tanggalPerawatan}
                onChange={(v) => handleFasilitasDateChange('tanggalPerawatan', v)}
                slotProps={{ textField: { fullWidth: true, size: 'small', helperText: 'Tanggal terakhir perawatan alat' } }}
              />
            </Grid>
            {/* Kategori Standardisasi */}
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={kategoriStandardisasiOptions}
                value={fasilitas.kategoriStandardisasi}
                onChange={(_, v) => handleFasilitasSelectChange('kategoriStandardisasi', v)}
                renderInput={(params) => <TextField {...params} label="Kategori Standardisasi" fullWidth size="small" helperText="Pilih kategori standardisasi" />}
                fullWidth
                disableClearable
                autoHighlight
              />
            </Grid>
            {/* Tanggal Sertifikasi */}
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Tanggal Sertifikasi"
                value={fasilitas.tanggalSertifikasi}
                onChange={(v) => handleFasilitasDateChange('tanggalSertifikasi', v)}
                slotProps={{ textField: { fullWidth: true, size: 'small', helperText: 'Tanggal sertifikasi alat' } }}
              />
            </Grid>
            {/* Lokasi Penyimpanan */}
            <Grid item xs={12} md={6}><TextField name="lokasiPenyimpanan" label="Lokasi Penyimpanan" value={fasilitas.lokasiPenyimpanan} onChange={handleFasilitasChange} fullWidth size="small" helperText="Lokasi alat disimpan" /></Grid>
            {/* Umur Komponen */}
            <Grid item xs={12} md={6}><TextField name="umurKomponen" label="Umur Komponen (tahun)" value={fasilitas.umurKomponen} onChange={handleFasilitasChange} fullWidth size="small" helperText="Umur teknis komponen (tahun)" type="number" /></Grid>
            {/* Upload Foto Alat */}
            <Grid item xs={12} md={6}>
              <Box
                onDrop={handleFasilitasDrop}
                onDragOver={handleFasilitasDragOver}
                sx={{
                  border: '2px dashed #2563eb',
                  borderRadius: 3,
                  p: 2,
                  textAlign: 'center',
                  bgcolor: '#f8fafc',
                  cursor: 'pointer',
                  minHeight: 120,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#5de0e6' }
                }}
                onClick={() => document.getElementById('fasilitasFotoInput').click()}
              >
                <input
                  id="fasilitasFotoInput"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFasilitasFile}
                />
                <Box sx={{ mb: 1 }}>
                  <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#2563eb" fillOpacity="0.08"/><path d="M16 32h16M24 16v16M24 16l-5 5M24 16l5 5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Box>
                <Typography variant="body2" color="#2563eb" fontWeight={600} sx={{ mb: 0.5 }}>Drag & Drop atau Klik untuk Upload Foto Alat</Typography>
                <Typography variant="caption" color="text.secondary">Maksimal 10MB, format gambar</Typography>
                {fasilitas.foto && (
                  <Box mt={2}>
                    <Typography variant="caption" color="#2563eb">{fasilitas.foto.name}</Typography>
                    {fasilitas.fotoPreview && (
                      <Box mt={1}><img src={fasilitas.fotoPreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: 100, borderRadius: 6 }} /></Box>
                    )}
                  </Box>
                )}
                {fasilitas.fotoError && (
                  <Typography variant="caption" color="error">{fasilitas.fotoError}</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
          <Box display="flex" gap={2} mt={4}>
            <Button variant="contained" color="primary" sx={{ fontWeight: 700, minWidth: 120, px: 4, borderRadius: 3, background: blueGradient, boxShadow: 2 }} onClick={() => handleSubmit('fasilitas')} disabled={role === 'user'}>Simpan</Button>
          </Box>
        </LocalizationProvider>
      </CardContent>
    </Card>
  );

  // --- MAIN RENDER ---
  return (
    <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
      <Card sx={{ borderRadius: 4, boxShadow: 3, mb: 4, p: 0, bgcolor: '#f5f7fa' }}>
        <Box sx={{ background: 'linear-gradient(135deg, #5de0e6, #2563eb)', color: '#fff', borderRadius: '16px 16px 0 0', px: 3, py: 2 }}>
          <Typography variant="h5" fontWeight={700}>Input Data Multi-Kategori</Typography>
        </Box>
        <CardContent sx={{ p: { xs: 1, md: 3 } }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{ mb: 2, '& .MuiTab-root': { fontWeight: 700 } }}
          >
            <Tab label="Data Manpower" disabled={role === 'user'} />
<Tab label="Pantauan Roda" />
<Tab label="Action Plan" disabled={role === 'user'} />
<Tab label="Fasilitas" disabled={role === 'user'} />
          </Tabs>
          <Divider sx={{ mb: 2 }} />
          <TabPanel value={tab} index={0}>{ManpowerForm}</TabPanel>
          <TabPanel value={tab} index={1}>{PantauanRodaForm}</TabPanel>
          <TabPanel value={tab} index={2}>{ActionPlanForm}</TabPanel>
          <TabPanel value={tab} index={3}>{FasilitasForm}</TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
}
