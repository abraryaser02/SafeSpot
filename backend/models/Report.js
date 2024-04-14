const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  drugType: {
    type: String,
    required: true,
    enum: ['heroin', 'cocaine', 'meth', 'other'] // Enum for known drug types and an 'other' option
  },
  notes: {
    type: String
  },
  zipCode: {
    type: String,
    required: true
  },
  reportedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
