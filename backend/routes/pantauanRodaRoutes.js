const express = require('express');
const router = express.Router();
const pantauanRodaController = require('../controllers/pantauanRodaController');

// GET all pantauan roda
router.get('/', pantauanRodaController.getAllPantauanRoda);
// GET all pantauan roda detail
router.get('/detail', pantauanRodaController.getAllPantauanRodaDetail);

// POST new pantauan roda
router.post('/', pantauanRodaController.createPantauanRoda);

// DELETE pantauan roda by id
router.delete('/:id', pantauanRodaController.deletePantauanRoda);

module.exports = router;
