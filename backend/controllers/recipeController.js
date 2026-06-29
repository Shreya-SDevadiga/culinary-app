const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');

// @desc  Get all approved recipes (public)
exports.getRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 12, category, difficulty, search, sort = '-createdAt' } = req.query;
    const query = { approvalStatus: 'approved' };

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [recipes, total] = await Promise.all([
      Recipe.find(query).populate('createdBy', 'name profileImage').sort(sort).skip(skip).limit(Number(limit)),
      Recipe.countDocuments(query),
    ]);

    res.json({
      success: true,
      recipes,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get featured recipes
exports.getFeaturedRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ approvalStatus: 'approved', isFeatured: true })
      .populate('createdBy', 'name profileImage')
      .sort('-createdAt')
      .limit(6);
    res.json({ success: true, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get latest recipes
exports.getLatestRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ approvalStatus: 'approved' })
      .populate('createdBy', 'name profileImage')
      .sort('-createdAt')
      .limit(8);
    res.json({ success: true, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get single recipe
exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('createdBy', 'name profileImage bio');
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    if (recipe.approvalStatus !== 'approved' && (!req.user || req.user.role !== 'admin')) {
      if (!req.user || recipe.createdBy._id.toString() !== req.user._id.toString()) {
        return res.status(404).json({ success: false, message: 'Recipe not found' });
      }
    }

    const comments = await Comment.find({ recipeId: recipe._id })
      .populate('userId', 'name profileImage')
      .sort('-createdAt');

    res.json({ success: true, recipe, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Create recipe
exports.createRecipe = async (req, res) => {
  try {
    const { title, description, ingredients, steps, cookingTime, prepTime, servings, difficulty, category, tags, referenceLinks, nutrition } = req.body;

    const recipeData = {
      title,
      description,
      ingredients: typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients,
      steps: typeof steps === 'string' ? JSON.parse(steps) : steps,
      cookingTime: Number(cookingTime),
      prepTime: Number(prepTime) || 0,
      servings: Number(servings) || 2,
      difficulty,
      category,
      tags: typeof tags === 'string' ? JSON.parse(tags) : tags || [],
      referenceLinks: typeof referenceLinks === 'string' ? JSON.parse(referenceLinks) : referenceLinks || [],
      nutrition: typeof nutrition === 'string' ? JSON.parse(nutrition) : nutrition,
      createdBy: req.user._id,
    };

    if (req.file) recipeData.image = `/uploads/recipes/${req.file.filename}`;

    const recipe = await Recipe.create(recipeData);
    res.status(201).json({ success: true, recipe, message: 'Recipe submitted for approval' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update recipe (owner or admin)
exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    if (recipe.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (updates.ingredients && typeof updates.ingredients === 'string') updates.ingredients = JSON.parse(updates.ingredients);
    if (updates.steps && typeof updates.steps === 'string') updates.steps = JSON.parse(updates.steps);
    if (updates.tags && typeof updates.tags === 'string') updates.tags = JSON.parse(updates.tags);
    if (req.file) updates.image = `/uploads/recipes/${req.file.filename}`;

    // Reset to pending if user edits
    if (req.user.role !== 'admin') updates.approvalStatus = 'pending';

    const updated = await Recipe.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, recipe: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete recipe
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    if (recipe.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Promise.all([Recipe.findByIdAndDelete(req.params.id), Comment.deleteMany({ recipeId: req.params.id })]);
    res.json({ success: true, message: 'Recipe deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Rate recipe
exports.rateRecipe = async (req, res) => {
  try {
    const { rating } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    const existingIndex = recipe.ratings.findIndex((r) => r.userId.toString() === req.user._id.toString());
    if (existingIndex > -1) {
      recipe.ratings[existingIndex].rating = rating;
    } else {
      recipe.ratings.push({ userId: req.user._id, rating });
    }

    recipe.updateAverageRating();
    await recipe.save();
    res.json({ success: true, averageRating: recipe.averageRating, totalRatings: recipe.totalRatings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle bookmark
exports.toggleBookmark = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    const bookmarked = recipe.bookmarks.includes(req.user._id);
    if (bookmarked) {
      recipe.bookmarks = recipe.bookmarks.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      recipe.bookmarks.push(req.user._id);
    }
    await recipe.save();
    res.json({ success: true, bookmarked: !bookmarked });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get user's own recipes
exports.getMyRecipes = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { createdBy: req.user._id };
    if (status) query.approvalStatus = status;

    const recipes = await Recipe.find(query).sort('-createdAt');
    res.json({ success: true, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get bookmarked recipes
exports.getBookmarkedRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ bookmarks: req.user._id, approvalStatus: 'approved' })
      .populate('createdBy', 'name profileImage')
      .sort('-createdAt');
    res.json({ success: true, recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
