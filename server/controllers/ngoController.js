const NGO = require('../models/NGO');
const User = require('../models/User');

// @desc    Get all NGOs
// @route   GET /api/ngos
const getAllNGOs = async (req, res) => {
  try {
    const ngos = await NGO.find({ isActive: true })
      .populate('user', 'name email phone address location organization')
      .sort({ createdAt: -1 });
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearest NGO to coordinates (simple distance calc)
// @route   GET /api/ngos/nearest
const getNearestNGO = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng required' });
    }

    const ngos = await NGO.find({ isActive: true }).populate('user');

    const withDistance = ngos.map((ngo) => {
      const dlat = ngo.location.lat - parseFloat(lat);
      const dlng = ngo.location.lng - parseFloat(lng);
      const distance = Math.sqrt(dlat * dlat + dlng * dlng) * 111; // rough km
      return { ...ngo.toObject(), distance };
    });

    withDistance.sort((a, b) => a.distance - b.distance);
    res.json(withDistance.slice(0, 5));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update NGO profile
// @route   POST /api/ngos
const createNGOProfile = async (req, res) => {
  try {
    const { ngoName, registrationNumber, focusArea, serviceRadius, location } = req.body;

    let ngo = await NGO.findOne({ user: req.user._id });
    if (ngo) {
      ngo.ngoName = ngoName || ngo.ngoName;
      ngo.registrationNumber = registrationNumber || ngo.registrationNumber;
      ngo.focusArea = focusArea || ngo.focusArea;
      ngo.serviceRadius = serviceRadius || ngo.serviceRadius;
      ngo.location = location || ngo.location;
    } else {
      ngo = new NGO({
        user: req.user._id,
        ngoName,
        registrationNumber,
        focusArea,
        serviceRadius,
        location: location || req.user.location,
      });
    }

    await ngo.save();
    res.status(201).json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllNGOs, getNearestNGO, createNGOProfile };
