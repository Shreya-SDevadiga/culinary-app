const express = require('express');
const router = express.Router();
const { register, login, adminLogin, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadProfileImage } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.post('/admin/login', adminLogin);
router.get('/me', protect, getMe);
router.put('/profile', protect, uploadProfileImage, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
