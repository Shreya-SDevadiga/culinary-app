const Comment = require('../models/Comment');
const Recipe = require('../models/Recipe');

// @desc  Add comment
exports.addComment = async (req, res) => {
  try {
    const { comment, rating } = req.body;
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ success: false, message: 'Recipe not found' });

    const newComment = await Comment.create({
      userId: req.user._id,
      recipeId: req.params.recipeId,
      comment,
      rating,
    });

    if (rating) {
      const existingIndex = recipe.ratings.findIndex((r) => r.userId.toString() === req.user._id.toString());
      if (existingIndex > -1) {
        recipe.ratings[existingIndex].rating = rating;
      } else {
        recipe.ratings.push({ userId: req.user._id, rating });
      }
      recipe.updateAverageRating();
      await recipe.save();
    }

    const populated = await Comment.findById(newComment._id).populate('userId', 'name profileImage');
    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Update comment
exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    comment.comment = req.body.comment || comment.comment;
    comment.rating = req.body.rating || comment.rating;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate('userId', 'name profileImage');
    res.json({ success: true, comment: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc  Get all comments (admin)
exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('userId', 'name email profileImage')
      .populate('recipeId', 'title')
      .sort('-createdAt')
      .limit(100);
    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
