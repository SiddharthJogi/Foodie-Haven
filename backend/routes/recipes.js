const express = require('express');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/recipes - create a user recipe (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { strMeal, strMealThumb, strCategory, strInstructions, ingredients } = req.body;
    if (!strMeal) return res.status(400).json({ message: 'Recipe name is required' });
    const recipe = await Recipe.create({
      strMeal,
      strMealThumb,
      strCategory,
      strInstructions,
      ingredients: Array.isArray(ingredients) ? ingredients : [],
      postedBy: req.userId,
      postType: 'User',
    });
    return res.status(201).json(recipe);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/recipes - fetch user recipes with optional filters
router.get('/', async (req, res) => {
  try {
    const { postedBy } = req.query;
    const query = { postType: 'User' };
    if (postedBy) query.postedBy = postedBy;
    const recipes = await Recipe.find(query).sort({ createdAt: -1 }).populate('postedBy', 'username');
    return res.json(recipes);
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


