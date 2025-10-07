const express = require('express');
const Favorite = require('../models/Favorite');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/favorites - list current user's favorites
router.get('/', auth, async (req, res) => {
  const user = req.userId;
  const favs = await Favorite.find({ user }).lean();
  return res.json(favs);
});

// POST /api/favorites - add a favorite
// Body: { type: 'MealDB'|'User', mealId?, recipeId?, snapshot? }
router.post('/', auth, async (req, res) => {
  const user = req.userId;
  const { type, mealId, recipeId, snapshot } = req.body;
  if (!type || (type === 'MealDB' && !mealId) || (type === 'User' && !recipeId)) {
    return res.status(400).json({ message: 'Invalid favorite payload' });
  }
  try {
    let fav;
    if (type === 'MealDB') {
      fav = await Favorite.findOneAndUpdate(
        { user, type, mealId },
        { $setOnInsert: { snapshot: snapshot || {} } },
        { upsert: true, new: true }
      );
    } else {
      // Validate recipe exists
      const rec = await Recipe.findById(recipeId);
      if (!rec) return res.status(404).json({ message: 'Recipe not found' });
      fav = await Favorite.findOneAndUpdate(
        { user, type, recipe: recipeId },
        { $setOnInsert: { snapshot: { strMeal: rec.strMeal, strMealThumb: rec.strMealThumb, strCategory: rec.strCategory } } },
        { upsert: true, new: true }
      );
    }
    return res.status(201).json(fav);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/favorites/:id - remove a favorite by id
router.delete('/:id', auth, async (req, res) => {
  const user = req.userId;
  const { id } = req.params;
  const fav = await Favorite.findOneAndDelete({ _id: id, user });
  if (!fav) return res.status(404).json({ message: 'Not found' });
  return res.json({ ok: true });
});

// Convenience toggle endpoint
// POST /api/favorites/toggle { type, mealId?, recipeId?, snapshot? }
router.post('/toggle', auth, async (req, res) => {
  const user = req.userId;
  const { type, mealId, recipeId, snapshot } = req.body;
  try {
    let existing;
    if (type === 'MealDB') existing = await Favorite.findOne({ user, type, mealId });
    else existing = await Favorite.findOne({ user, type, recipe: recipeId });
    if (existing) {
      await Favorite.deleteOne({ _id: existing._id });
      return res.json({ removed: true });
    }
    // create
    if (type === 'MealDB') {
      const created = await Favorite.create({ user, type, mealId, snapshot: snapshot || {} });
      return res.status(201).json({ created });
    } else {
      const rec = await Recipe.findById(recipeId);
      if (!rec) return res.status(404).json({ message: 'Recipe not found' });
      const created = await Favorite.create({ user, type, recipe: recipeId, snapshot: { strMeal: rec.strMeal, strMealThumb: rec.strMealThumb, strCategory: rec.strCategory } });
      return res.status(201).json({ created });
    }
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


