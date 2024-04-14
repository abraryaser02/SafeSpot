const mongoose = require('mongoose');

const ZoneSchema = new mongoose.Schema({
  zipCode: {
    type: String,
    required: true,
    unique: true
  },
  reports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }]
});

module.exports = mongoose.model('Zone', ZoneSchema);
