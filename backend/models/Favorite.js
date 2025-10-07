const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['MealDB', 'User'], required: true },
    // For MealDB favorites
    mealId: { type: String, index: true },
    snapshot: {
      strMeal: String,
      strMealThumb: String,
      strCategory: String,
    },
    // For User-posted recipes
    recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  },
  { timestamps: true }
);

favoriteSchema.index({ user: 1, type: 1, mealId: 1 }, { unique: true, partialFilterExpression: { mealId: { $exists: true } } });
favoriteSchema.index({ user: 1, type: 1, recipe: 1 }, { unique: true, partialFilterExpression: { recipe: { $exists: true } } });

module.exports = mongoose.model('Favorite', favoriteSchema);


