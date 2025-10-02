const PantauanRoda = require('../models/pantauanRodaModel');
const db = require('../db');

// GET seluruh data detail inspeksi roda (join ke pantauan_roda)
exports.getAllPantauanRodaDetail = async (req, res) => {
  try {
    const sql = `
      SELECT d.*, r.nomor_lokomotif AS loko, r.tanggal_inspeksi AS date, r.inspector_name, r.keterangan
      FROM pantauan_roda_detail d
      JOIN pantauan_roda r ON d.pantauan_roda_id = r.id
      ORDER BY r.tanggal_inspeksi DESC, r.nomor_lokomotif, d.posisi
    `;
    const detail = await db.query(sql);
    res.json(detail.rows ?? detail);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data detail pantauan roda', detail: err.message });
  }
};

exports.getAllPantauanRoda = async (req, res) => {
  try {
    // Ambil semua pantauan_roda utama
    const pantauanList = await PantauanRoda.getAllPantauanRoda();
    // Group by loko, urutkan per tanggal inspeksi DESC
    const grouped = pantauanList.reduce((acc, row) => {
      if (!acc[row.loko]) acc[row.loko] = [];
      acc[row.loko].push(row);
      return acc;
    }, {});

    // Parameter perhitungan
    const DIAMETER_AWAL = 1067;
    const THICKNESS_AWAL = 32;
    const DIAMETER_MIN = 992;
    const THICKNESS_MIN = 22;
    const LAJU_KEAUSAN_DIAMETER = 0.02; // mm/hari
    const LAJU_KEAUSAN_THICKNESS = 0.01; // mm/hari

    // Untuk setiap loko, hitung lifetime_diameter & lifetime_thickness dari histori terakhir
    // Status logic (copy dari createPantauanRoda)
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
    const result = Object.entries(grouped).map(([loko, items]) => {
      // Urutkan histori DESC (terbaru dulu)
      const sorted = items.sort((a, b) => new Date(b.date) - new Date(a.date));
      const latest = sorted[0];
      // Cari histori sebelumnya (jika ada)
      const prev = sorted[1];
      // Nilai sekarang
      const curr_diameter = Number(latest.diameter) || DIAMETER_AWAL;
      const curr_thickness = Number(latest.thickness) || THICKNESS_AWAL;
      const curr_height = Number(latest.height);
      // Rumus lifetime = (nilai_sekarang - batas_min) / laju_keausan
      let lifetime_diameter = (curr_diameter - DIAMETER_MIN) / LAJU_KEAUSAN_DIAMETER;
      let lifetime_thickness = (curr_thickness - THICKNESS_MIN) / LAJU_KEAUSAN_THICKNESS;
      lifetime_diameter = Math.round(lifetime_diameter);
      lifetime_thickness = Math.round(lifetime_thickness);
      // Status per parameter
      const diameter_status = getStatus('diameter', curr_diameter);
      const thickness_status = getStatus('thickness', curr_thickness);
      const height_status = getStatus('flange', curr_height);
      return {
        ...latest,
        lifetime_diameter,
        lifetime_thickness,
        diameter_status,
        thickness_status,
        height_status
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Gagal mengambil data pantauan roda', detail: err.message });
  }
};

const PantauanRodaDetail = require('../models/pantauanRodaDetailModel');

exports.createPantauanRoda = async (req, res) => {
  try {
    // Ambil data utama dan array detail dari body
    const { nomor_lokomotif, tanggal_inspeksi, inspector_name, keterangan, detail } = req.body;
    if (!Array.isArray(detail) || detail.length !== 12) {
      return res.status(400).json({ error: 'Data detail harus array 12 data!' });
    }
    // Hitung min
    const diameter_min = Math.min(...detail.map(d => Number(d.diameter)));
    const thickness_min = Math.min(...detail.map(d => Number(d.thickness)));
    const height_min = Math.min(...detail.map(d => Number(d.height)));

    // Logic status baru
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
    // Status summary box = status terburuk dari diameter, thickness, height
    const statusList = [
      getStatus('diameter', diameter_min),
      getStatus('thickness', thickness_min),
      getStatus('flange', height_min)
    ];
    let worstStatus = 'NORMAL';
    if (statusList.includes('URGENT')) worstStatus = 'URGENT';
    else if (statusList.includes('WARNING')) worstStatus = 'WARNING';
    else if (statusList.includes('INVALID')) worstStatus = 'INVALID';

    // Hitung estimasi lifetime dan tanggal keausan penuh (flange thickness)
    const thickness_min_limit = 22;
    const laju_keausan_thickness = 0.01; // mm/hari
    let estimate_lifetime_thickness = null;
    let tanggal_keausan_thickness = null;
    if (typeof thickness_min === 'number' && !isNaN(thickness_min)) {
      estimate_lifetime_thickness = (thickness_min - thickness_min_limit) / laju_keausan_thickness;
      if (estimate_lifetime_thickness > 0) {
        const tgl = new Date(tanggal_inspeksi);
        tgl.setDate(tgl.getDate() + Math.round(estimate_lifetime_thickness));
        tanggal_keausan_thickness = tgl.toISOString().slice(0,10);
      } else {
        estimate_lifetime_thickness = 0;
        tanggal_keausan_thickness = new Date(tanggal_inspeksi).toISOString().slice(0,10);
      }
    }
    // Simpan main ke pantauan_roda
    const mainData = await PantauanRoda.createPantauanRoda({
      loko: nomor_lokomotif,
      date: tanggal_inspeksi,
      diameter: diameter_min,
      thickness: thickness_min,
      height: height_min,
      status: worstStatus,
      lifetime: 0, // default 0, jangan string kosong
      inspector_name,
      keterangan,
      estimate_lifetime_thickness,
      tanggal_keausan_thickness
    });
    // Set status untuk setiap detail batch (jaga-jaga jika belum diisi FE)
    const detailWithStatus = detail.map(d => ({
      ...d,
      status_diameter: getStatus('diameter', Number(d.diameter)),
      status_thickness: getStatus('thickness', Number(d.thickness)),
      status_flange: getStatus('flange', Number(d.height))
    }));
    // Simpan detail ke pantauan_roda_detail
    await PantauanRodaDetail.createBatch(mainData.id, detailWithStatus);
    res.status(201).json({
      pantauan_roda: mainData,
      detail_count: detail.length
    });
  } catch (err) {
    console.error('Pantauan Roda POST Error:', err); // Log error detail ke terminal
    res.status(500).json({ error: 'Gagal menambah data pantauan roda', detail: err.message, stack: err.stack });
  }
};

exports.deletePantauanRoda = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PantauanRoda.deletePantauanRoda(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Data tidak ditemukan' });
    }
    res.json({ message: 'Data berhasil dihapus', deleted });
  } catch (err) {
    res.status(500).json({ error: 'Gagal menghapus data pantauan roda', detail: err.message });
  }
};
