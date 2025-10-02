const db = require('../db');

const PantauanRodaDetail = {
  // Simpan batch array detail
  async createBatch(pantauan_roda_id, details) {
    const queries = details.map(d => {
      // Validasi dan parsing number
      const diameter = Number(d.diameter);
      const thickness = Number(d.thickness);
      const height = Number(d.height);
      if (isNaN(diameter) || isNaN(thickness) || isNaN(height)) {
        throw new Error('Semua field diameter, thickness, height harus angka dan tidak boleh kosong/null!');
      }
      console.log('Insert detail:', { diameter, thickness, height, posisi: d.posisi });
      return db.query(
        `INSERT INTO pantauan_roda_detail (pantauan_roda_id, posisi, diameter, thickness, height, kondisi, keterangan)
         VALUES ($1, $2, $3, $4, $5, $6, $7)` ,
        [pantauan_roda_id, d.posisi, diameter, thickness, height, d.kondisi || '', d.keterangan || '']
      );
    });
    await Promise.all(queries);
  },
  // Ambil semua detail untuk satu pantauan_roda_id
  async getByPantauanRodaId(pantauan_roda_id) {
    const result = await db.query('SELECT * FROM pantauan_roda_detail WHERE pantauan_roda_id = $1 ORDER BY posisi', [pantauan_roda_id]);
    return result.rows;
  }
};

module.exports = PantauanRodaDetail;
