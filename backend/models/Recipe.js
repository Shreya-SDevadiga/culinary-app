const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: String, required: true },
  unit: { type: String, default: '' },
});

const stepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  instruction: { type: String, required: true },
  image: { type: String, default: '' },
});

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Recipe title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    ingredients: [ingredientSchema],
    steps: [stepSchema],
    cookingTime: { type: Number, required: true, comment: 'in minutes' },
    prepTime: { type: Number, default: 0, comment: 'in minutes' },
    servings: { type: Number, default: 2 },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    category: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverages', 'Appetizer', 'Salad', 'Soup', 'Other'],
      required: true,
    },
    tags: [String],
    image: { type: String, default: '' },
    referenceLinks: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
  },
  { timestamps: true }
);

// Update average rating
recipeSchema.methods.updateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.ratings.length) * 10) / 10;
    this.totalRatings = this.ratings.length;
  }
};

recipeSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Recipe', recipeSchema);
