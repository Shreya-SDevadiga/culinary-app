const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { protect } = require('../middleware/auth');

// Get user public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -status');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const recipes = await Recipe.find({ createdBy: req.params.id, approvalStatus: 'approved' }).sort('-createdAt').limit(10);
    res.json({ success: true, user, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
