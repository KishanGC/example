const express = require('express');
const router = express.Router();
const { getAllNGOs, getNearestNGO, createNGOProfile } = require('../controllers/ngoController');
const { protect, ngoOnly } = require('../middleware/auth');

router.get('/', protect, getAllNGOs);
router.get('/nearest', protect, getNearestNGO);
router.post('/', protect, ngoOnly, createNGOProfile);

module.exports = router;
