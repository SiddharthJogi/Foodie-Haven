import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import SearchBar from './SearchBar.jsx';
import RecipeDetailsModal from './RecipeDetailsModal.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

const MEALDB_URL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

export default function RecipeList({ showFavoritesOnly = false }) {
  const [mealDbRecipes, setMealDbRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const [filter, setFilter] = useState('all'); // all | user | mealdb
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState({ query: 'chicken', isCategory: false });
  const [selected, setSelected] = useState(null);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const mealUrl = search.isCategory
          ? `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(search.query)}`
          : `${MEALDB_URL}${encodeURIComponent(search.query)}`;
        const [mealDbRes, userRes] = await Promise.all([
          fetch(mealUrl).then((r) => r.json()),
          axios.get('/api/recipes').then((r) => r.data),
        ]);
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
        setUserRecipes(userRes || []);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load recipes');
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [search]);

  const combined = useMemo(() => {
    const all = [...userRecipes, ...mealDbRecipes];
    if (filter === 'user') return all.filter((r) => r.postType === 'User');
    if (filter === 'mealdb') return all.filter((r) => r.postType === 'MealDB');
    return all;
  }, [userRecipes, mealDbRecipes, filter]);

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
      <div className="flex items-center gap-2 mb-6 justify-center">
        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full border ${filter==='all' ? 'bg-gray-100' : 'bg-white'}`}>All Posts</button>
        <button onClick={() => setFilter('user')} className={`px-4 py-2 rounded-full border ${filter==='user' ? 'bg-gray-100' : 'bg-white'}`}>User Posts</button>
        <button onClick={() => setFilter('mealdb')} className={`px-4 py-2 rounded-full border ${filter==='mealdb' ? 'bg-gray-100' : 'bg-white'}`}>Website Posts</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {visible.map((r) => (
          <article key={(r._id || r.mealId)} className="rounded-2xl overflow-hidden bg-white shadow-lg transition-transform duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => (r.postType === 'MealDB' ? openMealDbDetails(r.mealId) : setSelected(r))}>
            {r.strMealThumb && (
              <img src={r.strMealThumb} alt={r.strMeal} className="w-full h-56 object-cover" />
            )}
            <div className="p-5">
              <div className="text-lg font-semibold mb-1 line-clamp-2">{r.strMeal}</div>
              <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                <span className="inline-block px-2 py-0.5 rounded-full border">{r.strCategory || 'Uncategorized'}</span>
                <span className="inline-block px-2 py-0.5 rounded-full" style={{ backgroundColor: r.postType === 'User' ? 'var(--color-accent)' : '#eee' }}>
                  {r.postType === 'User' ? 'User' : 'MealDB'}
                </span>
              </div>
              <div className="flex items-center justify-end mt-2">
                <button
                  onClick={() => toggleFavorite(r)}
                  className="text-lg"
                  aria-label="favorite"
                  style={{ color: isFavorite(r) ? '#ff9800' : '#999' }}
                >
                  {isFavorite(r) ? '★' : '☆'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="text-center text-gray-600 py-10">No recipes found.</div>
      )}
      <RecipeDetailsModal open={!!selected} onClose={() => setSelected(null)} recipe={selected} />
    </section>
  );
}


