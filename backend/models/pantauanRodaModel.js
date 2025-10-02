const db = require('../db');

const PantauanRoda = {
  async getAllPantauanRoda() {
    const result = await db.query(`
      SELECT
        id,
        nomor_lokomotif AS loko,
        tanggal_inspeksi AS date,
        diameter_min AS diameter,
        flens_thickness_min AS thickness,
        flens_height_min AS height,
        status,
        estimate_lifetime AS lifetime,
        estimate_lifetime_thickness,
        tanggal_keausan_thickness
      FROM pantauan_roda
      ORDER BY tanggal_inspeksi DESC
    `);
    return result.rows;
  },

  async createPantauanRoda(data) {
    const { loko, date, diameter, thickness, height, status, lifetime, inspector_name, keterangan, estimate_lifetime_thickness, tanggal_keausan_thickness } = data;
    const result = await db.query(
      `INSERT INTO pantauan_roda
        (nomor_lokomotif, tanggal_inspeksi, diameter_min, flens_thickness_min, flens_height_min, status, estimate_lifetime, inspector_name, keterangan, estimate_lifetime_thickness, tanggal_keausan_thickness)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id`,
      [loko, date, diameter, thickness, height, status, lifetime, inspector_name || '', keterangan || '', estimate_lifetime_thickness, tanggal_keausan_thickness]
    );
    return { id: result.rows[0].id, ...data };
  },

  // Hapus pantauan roda berdasarkan id
  async deletePantauanRoda(id) {
    const result = await db.query('DELETE FROM pantauan_roda WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // Optional: update, dsb
};

module.exports = PantauanRoda;
