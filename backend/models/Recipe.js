const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    mealId: { type: String, unique: true, sparse: true },
    strMeal: { type: String, required: true },
    strMealThumb: { type: String },
    strCategory: { type: String },
    strInstructions: { type: String },
    ingredients: { type: [String], default: [] },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postType: { type: String, enum: ['User', 'MealDB'], default: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Recipe', recipeSchema);


