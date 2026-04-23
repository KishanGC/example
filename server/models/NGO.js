const mongoose = require('mongoose');

const NGOSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngoName: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      default: '',
    },
    focusArea: {
      type: String,
      enum: ['food_distribution', 'composting', 'both'],
      default: 'food_distribution',
    },
    serviceRadius: {
      type: Number, // in kilometers
      default: 10,
    },
    location: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.209 },
    },
    totalAccepted: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('NGO', NGOSchema);
