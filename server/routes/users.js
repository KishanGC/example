const express = require('express');
const router = express.Router();
const { getMe, updateMe, getAllUsers } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.get('/', protect, adminOnly, getAllUsers);

module.exports = router;
