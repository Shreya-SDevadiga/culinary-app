const express = require('express');
const router = express.Router();
const {
  getRecipes, getFeaturedRecipes, getLatestRecipes, getRecipe,
  createRecipe, updateRecipe, deleteRecipe, rateRecipe,
  toggleBookmark, getMyRecipes, getBookmarkedRecipes
} = require('../controllers/recipeController');
const { protect, optionalAuth } = require('../middleware/auth');
const { uploadRecipeImage } = require('../middleware/upload');

router.get('/', getRecipes);
router.get('/featured', getFeaturedRecipes);
router.get('/latest', getLatestRecipes);
router.get('/my-recipes', protect, getMyRecipes);
router.get('/bookmarks', protect, getBookmarkedRecipes);
router.get('/:id', optionalAuth, getRecipe);
router.post('/', protect, uploadRecipeImage, createRecipe);
router.put('/:id', protect, uploadRecipeImage, updateRecipe);
router.delete('/:id', protect, deleteRecipe);
router.post('/:id/rate', protect, rateRecipe);
router.post('/:id/bookmark', protect, toggleBookmark);

module.exports = router;
