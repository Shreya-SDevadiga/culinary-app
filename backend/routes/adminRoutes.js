const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllRecipes, approveRecipe, rejectRecipe,
  toggleFeatured, getAllUsers, toggleBlockUser, deleteUser
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/recipes', getAllRecipes);
router.put('/recipes/:id/approve', approveRecipe);
router.put('/recipes/:id/reject', rejectRecipe);
router.put('/recipes/:id/featured', toggleFeatured);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
