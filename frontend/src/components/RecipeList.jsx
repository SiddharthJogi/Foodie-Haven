import { useEffect, useMemo, useState } from 'react';
import axios from '../config/api.js';
import SearchBar from './SearchBar.jsx';
import RecipeDetailsModal from './RecipeDetailsModal.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Users } from 'lucide-react';

const MEALDB_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

export default function RecipeList({ showFavoritesOnly = false, onRefresh }) {
  const [mealDbRecipes, setMealDbRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [filter, setFilter] = useState('all'); // all | user | mealdb
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState({ query: 'chicken', isCategory: false });
  const [selected, setSelected] = useState(null);
  const { favorites, toggleFavorite, isFavorite, favoriteCount } = useFavorites();

  // Function to refresh recipes
  const refreshRecipes = async () => {
    setLoading(true);
    setError('');
    try {
      // Refresh user recipes
      const userRes = await axios.get('api/recipes').then((r) => r.data);
      setUserRecipes(userRes || []);
      
      // Refresh MealDB recipes based on current search
      const mealUrl = search.isCategory
        ? `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(search.query)}`
        : `${MEALDB_URL}${encodeURIComponent(search.query)}`;
      const mealDbRes = await fetch(mealUrl).then((r) => r.json());
      const mealsArray = Array.isArray(mealDbRes.meals) ? mealDbRes.meals : [];
      const mealDb = mealsArray.map((m) => ({
        mealId: m.idMeal,
        strMeal: m.strMeal,
        strMealThumb: m.strMealThumb,
        strCategory: m.strCategory || (search.isCategory ? search.query : undefined),
        strInstructions: m.strInstructions,
        ingredients: [],
        postedBy: null,
        postType: 'MealDB',
      }));
      setMealDbRecipes(mealDb);
    } catch (err) {
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefresh) {
      onRefresh(refreshRecipes);
    }
  }, [onRefresh]);

  // Load user recipes separately (only once on mount)
  useEffect(() => {
    let isMounted = true;
    async function loadUserRecipes() {
      try {
        const userRes = await axios.get('api/recipes').then((r) => r.data);
        if (!isMounted) return;
        setUserRecipes(userRes || []);
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load user recipes:', err);
      }
    }
    loadUserRecipes();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load MealDB recipes based on search
  useEffect(() => {
    let isMounted = true;
    async function loadMealDbRecipes() {
      setLoading(true);
      setError('');
      try {
        const mealUrl = search.isCategory
          ? `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(search.query)}`
          : `${MEALDB_URL}${encodeURIComponent(search.query)}`;
        
        const mealDbRes = await fetch(mealUrl).then((r) => r.json());
        const mealsArray = Array.isArray(mealDbRes.meals) ? mealDbRes.meals : [];
        const mealDb = mealsArray.map((m) => ({
          mealId: m.idMeal,
          strMeal: m.strMeal,
          strMealThumb: m.strMealThumb,
          strCategory: m.strCategory || (search.isCategory ? search.query : undefined),
          strInstructions: m.strInstructions, // only available for search endpoint, not filter
          ingredients: [],
          postedBy: null,
          postType: 'MealDB',
        }));
        
        if (!isMounted) return;
        setMealDbRecipes(mealDb);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load recipes');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadMealDbRecipes();
    return () => {
      isMounted = false;
    };
  }, [search]);

  const combined = useMemo(() => {
    // Filter user recipes based on search query
    const filteredUserRecipes = userRecipes.filter(recipe => {
      if (!search.query || search.query === 'chicken') return true; // Show all on default
      
      const searchTerm = search.query.toLowerCase();
      return (
        recipe.strMeal.toLowerCase().includes(searchTerm) ||
        recipe.strCategory?.toLowerCase().includes(searchTerm) ||
        recipe.ingredients?.some(ing => ing.toLowerCase().includes(searchTerm))
      );
    });

    const all = [...filteredUserRecipes, ...mealDbRecipes];
    if (filter === 'user') return all.filter((r) => r.postType === 'User');
    if (filter === 'mealdb') return all.filter((r) => r.postType === 'MealDB');
    return all;
  }, [userRecipes, mealDbRecipes, filter, search.query]);

  const visible = useMemo(() => {
    if (!showFavoritesOnly) return combined;
    const isFav = (item) => isFavorite(item);
    return combined.filter((r) => isFav(r));
  }, [combined, isFavorite, showFavoritesOnly]);

  async function openMealDbDetails(mealId) {
    try {
      const r = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
      const data = await r.json();
      const meal = data?.meals?.[0];
      if (!meal) return;
      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const qty = meal[`strMeasure${i}`];
        if (ing && ing.trim()) ingredients.push(`${qty || ''} ${ing}`.trim());
      }
      setSelected({
        mealId,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory,
        strInstructions: meal.strInstructions,
        ingredientsDetailed: ingredients,
        strYoutube: meal.strYoutube,
      });
    } catch (_) {}
  }

  if (loading) return <div className="py-8 text-center">Loading recipes…</div>;
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>;

  return (
    <section>
      <SearchBar onSearch={setSearch} />
      
      {/* Search status indicator */}
      {search.query && search.query !== 'chicken' && (
        <div className="text-center mb-4">
          <p className="text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
            🔍 Showing results for: <strong>"{search.query}"</strong>
            {search.isCategory && <span> (category)</span>}
          </p>
          <button
            onClick={() => setSearch({ query: 'chicken', isCategory: false })}
            className="mt-2 px-4 py-2 rounded-full text-sm border transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: 'var(--color-card)', 
              color: 'var(--color-text)', 
              borderColor: 'var(--color-border)' 
            }}
          >
            ✨ Show All Recipes
          </button>
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-8 justify-center">
        <motion.button 
          onClick={() => setFilter('all')} 
          className="px-8 py-4 rounded-2xl border-2 transition-all duration-300 font-semibold flex items-center gap-2"
          style={{
            backgroundColor: filter === 'all' ? '#3b82f6' : 'var(--color-card)',
            color: filter === 'all' ? 'white' : 'var(--color-text)',
            borderColor: filter === 'all' ? '#3b82f6' : 'var(--color-border)',
            boxShadow: filter === 'all' ? '0 8px 25px rgba(59, 130, 246, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          ⭐ All Posts
        </motion.button>
        <motion.button 
          onClick={() => setFilter('user')} 
          className="px-8 py-4 rounded-2xl border-2 transition-all duration-300 font-semibold flex items-center gap-2"
          style={{
            backgroundColor: filter === 'user' ? '#10b981' : 'var(--color-card)',
            color: filter === 'user' ? 'white' : 'var(--color-text)',
            borderColor: filter === 'user' ? '#10b981' : 'var(--color-border)',
            boxShadow: filter === 'user' ? '0 8px 25px rgba(16, 185, 129, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          👤 User Posts
        </motion.button>
        <motion.button 
          onClick={() => setFilter('mealdb')} 
          className="px-8 py-4 rounded-2xl border-2 transition-all duration-300 font-semibold flex items-center gap-2"
          style={{
            backgroundColor: filter === 'mealdb' ? '#8b5cf6' : 'var(--color-card)',
            color: filter === 'mealdb' ? 'white' : 'var(--color-text)',
            borderColor: filter === 'mealdb' ? '#8b5cf6' : 'var(--color-border)',
            boxShadow: filter === 'mealdb' ? '0 8px 25px rgba(139, 92, 246, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          🌐 Website Posts
        </motion.button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {visible.map((r, index) => (
            <motion.article 
              key={(r._id || r.mealId)} 
              className="rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group" 
              style={{ backgroundColor: 'var(--color-card)' }}
              onClick={() => (r.postType === 'MealDB' ? openMealDbDetails(r.mealId) : setSelected(r))}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className="relative overflow-hidden">
                {r.strMealThumb && (
                  <img 
                    src={r.strMealThumb} 
                    alt={r.strMeal} 
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                )}
                <div className="absolute top-4 right-4">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(r);
                    }}
                    className="p-2 rounded-full backdrop-blur-sm transition-all duration-200"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Star 
                      className="w-5 h-5" 
                      style={{ 
                        color: isFavorite(r) ? '#ff9800' : '#999',
                        fill: isFavorite(r) ? '#ff9800' : 'transparent'
                      }} 
                    />
                  </motion.button>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', color: 'var(--color-text)' }}
                    >
                      {r.strCategory || 'Uncategorized'}
                    </span>
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm"
                      style={{ 
                        backgroundColor: r.postType === 'User' ? 'var(--color-accent)' : 'rgba(255, 255, 255, 0.9)',
                        color: r.postType === 'User' ? '#000' : 'var(--color-text)'
                      }}
                    >
                      {r.postType === 'User' ? '👤 User' : '🌐 MealDB'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3 line-clamp-2" style={{ color: 'var(--color-text)' }}>
                  {r.strMeal}
                </h3>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Quick</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>4-6</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
      {visible.length === 0 && (
        <div className="text-center py-10" style={{ color: 'var(--color-text)', opacity: 0.7 }}>No recipes found.</div>
      )}
      <RecipeDetailsModal open={!!selected} onClose={() => setSelected(null)} recipe={selected} />
    </section>
  );
}


