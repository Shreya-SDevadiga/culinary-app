const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment');

// @desc  Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalRecipes, approvedRecipes, pendingRecipes, rejectedRecipes, recentRecipes, recentUsers] =
      await Promise.all([
        User.countDocuments({ role: 'user' }),
        Recipe.countDocuments(),
        Recipe.countDocuments({ approvalStatus: 'approved' }),
        Recipe.countDocuments({ approvalStatus: 'pending' }),
        Recipe.countDocuments({ approvalStatus: 'rejected' }),
        Recipe.find().populate('createdBy', 'name').sort('-createdAt').limit(5),
        User.find({ role: 'user' }).sort('-createdAt').limit(5),
      ]);

    // Category distribution
    const categoryStats = await Recipe.aggregate([
      { $match: { approvalStatus: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalRecipes, approvedRecipes, pendingRecipes, rejectedRecipes },
      recentRecipes,
      recentUsers,
      categoryStats,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all recipes for admin
exports.getAllRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 15, status, category, search } = req.query;
    const query = {};
    if (status) query.approvalStatus = status;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [recipes, total] = await Promise.all([
      Recipe.find(query).populate('createdBy', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
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

// @desc  Approve recipe
exports.approveRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'approved', rejectionReason: '' },
      { new: true }
    ).populate('createdBy', 'name email');
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, recipe, message: 'Recipe approved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Reject recipe
exports.rejectRecipe = async (req, res) => {
  try {
    const { reason } = req.body;
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: 'rejected', rejectionReason: reason || 'Does not meet our guidelines' },
      { new: true }
    ).populate('createdBy', 'name email');
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, recipe, message: 'Recipe rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle featured
exports.toggleFeatured = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });
    recipe.isFeatured = !recipe.isFeatured;
    await recipe.save();
    res.json({ success: true, isFeatured: recipe.isFeatured });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 15, search, status } = req.query;
    const query = { role: 'user' };
    if (status) query.status = status;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Toggle user block
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot block admin' });

    user.status = user.status === 'active' ? 'blocked' : 'active';
    await user.save();
    res.json({ success: true, status: user.status, message: `User ${user.status}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin' });

    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Recipe.deleteMany({ createdBy: req.params.id }),
      Comment.deleteMany({ userId: req.params.id }),
    ]);
    res.json({ success: true, message: 'User and their content deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
