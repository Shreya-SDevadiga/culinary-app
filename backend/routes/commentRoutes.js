const express = require('express');
const router = express.Router();
const { addComment, updateComment, deleteComment, getAllComments } = require('../controllers/commentController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/recipe/:recipeId', protect, addComment);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.get('/admin/all', protect, adminOnly, getAllComments);

module.exports = router;
