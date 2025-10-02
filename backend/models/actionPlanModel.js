const db = require('../db');

// GET all action plan
exports.getAllActionPlan = async () => {
  const result = await db.query('SELECT * FROM action_plan ORDER BY tanggal DESC, id DESC');
  return result.rows;
};

// GET by id
exports.getActionPlanById = async (id) => {
  const result = await db.query('SELECT * FROM action_plan WHERE id = $1', [id]);
  return result.rows[0];
};

// CREATE action plan
exports.createActionPlan = async (data) => {
  // Jangan destruktur pic langsung, ambil dari data.pic
  const {
    nama_pemeriksa, tanggal, nomor_lokomotif, komponen, aktivitas, detail_aktivitas, target, foto_path
  } = data;
  let pic = data.pic;
  console.log('[DEBUG] typeof data.pic:', typeof pic, '| value:', pic);
  // Jika pic string kosong, null, atau 'null' (string), ubah ke null
  if (typeof pic === 'string') {
    if (!pic.trim() || pic.trim().toLowerCase() === 'null') {
      pic = null;
    } else {
      pic = pic.trim();
    }
  } else if (!pic) {
    pic = null;
  }
  console.log('[DEBUG] Insert Action Plan:', { ...data, pic });
  const result = await db.query(
    `INSERT INTO action_plan (nama_pemeriksa, tanggal, nomor_lokomotif, komponen, aktivitas, detail_aktivitas, pic, target, foto_path)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [nama_pemeriksa, tanggal, nomor_lokomotif, komponen, aktivitas, detail_aktivitas, pic, target, foto_path]
  );
  return result.rows[0];
};

// DELETE action plan
exports.deleteActionPlan = async (id) => {
  const result = await db.query('DELETE FROM action_plan WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};
