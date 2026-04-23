const express = require('express');
const router = express.Router();
const {
  getDonations,
  getMyDonations,
  createDonation,
  acceptDonation,
  rejectDonation,
  completeDonation,
  getAnalytics,
} = require('../controllers/donationController');
const { protect, adminOnly, ngoOnly } = require('../middleware/auth');

// Public routes (no auth needed for map/leaderboard viewing)
router.get('/analytics', protect, getAnalytics);  // any logged-in user can see stats
router.get('/', getDonations);                     // public map & leaderboard

// Protected routes
router.get('/my', protect, getMyDonations);
router.post('/', protect, createDonation);
router.put('/:id/accept',   protect, ngoOnly,  acceptDonation);
router.put('/:id/reject',   protect, ngoOnly,  rejectDonation);
router.put('/:id/complete', protect,           completeDonation);

module.exports = router;
