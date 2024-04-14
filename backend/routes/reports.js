const express = require('express');
const Report = require('../models/Report');
const Zone = require('../models/Zone');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { drugType, notes, zipCode } = req.body;

    // Find the zone by ZIP code or create a new one if it doesn't exist
    let zone = await Zone.findOne({ zipCode });
    if (!zone) {
      zone = new Zone({ zipCode });
      await zone.save();
    }

    // Create and save the new report
    const report = new Report({ drugType, notes, zipCode });
    const savedReport = await report.save();

    // Associate the report with the zone
    zone.reports.push(savedReport._id);
    await zone.save();

    res.status(201).json(savedReport);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:zipCode', async (req, res) => {
  try {
    const { zipCode } = req.params;
    const zone = await Zone.findOne({ zipCode }).populate('reports');
    if (!zone) {
      return res.status(404).json({ message: 'No reports found for this ZIP code.' });
    }
    res.json(zone.reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
