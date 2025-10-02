const express = require('express');
const router = express.Router();
const actionPlanController = require('../controllers/actionPlanController');
const multer = require('multer');
const upload = multer(); // memory storage untuk parsing field FormData

// GET all
router.get('/', actionPlanController.getAllActionPlan);
// GET by id
router.get('/:id', actionPlanController.getActionPlanById);
// POST create pakai upload.none() agar field FormData bisa dibaca di req.body
router.post('/', upload.none(), actionPlanController.createActionPlan);
// DELETE
router.delete('/:id', actionPlanController.deleteActionPlan);

module.exports = router;
