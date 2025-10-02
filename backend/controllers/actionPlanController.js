const ActionPlan = require('../models/actionPlanModel');
const { getPIC } = require('../utils/picMapping'); // nanti kita buat file mapping PIC

exports.getAllActionPlan = async (req, res) => {
  try {
    const data = await ActionPlan.getAllActionPlan();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getActionPlanById = async (req, res) => {
  try {
    const data = await ActionPlan.getActionPlanById(req.params.id);
    if (!data) return res.status(404).json({ error: 'Not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createActionPlan = async (req, res) => {
  try {
    // ambil payload dari frontend
    const payload = req.body;

    // generate PIC berdasarkan detail_aktivitas
    const pic = getPIC(payload.detail_aktivitas);

    // tambahkan PIC ke payload sebelum dikirim ke model
    const data = await ActionPlan.createActionPlan({
      ...payload,
      pic
    });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteActionPlan = async (req, res) => {
  try {
    await ActionPlan.deleteActionPlan(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
