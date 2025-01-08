// routes/profileRoutes.js
const express = require('express');
const Profile = require('../models/Profile');
const router = express.Router();

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    res.json(profile);
  } catch (err) {
    res.status(500).send('Error fetching profile');
  }
});

module.exports = router;
