import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!user) {
        setFavorites([]);
        return;
      }
      setLoading(true);
      try {
        const res = await axios.get('/api/favorites');
        setFavorites(res.data || []);
      } catch (_) {
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  async function toggleFavorite(item) {
    if (!user) return alert('Please log in to save favorites!');
    const type = item.postType === 'User' ? 'User' : 'MealDB';
    const payload = type === 'MealDB'
      ? { type, mealId: item.mealId, snapshot: { strMeal: item.strMeal, strMealThumb: item.strMealThumb, strCategory: item.strCategory } }
      : { type, recipeId: item._id };
    const existing = type === 'MealDB'
      ? favorites.find((f) => f.type === 'MealDB' && f.mealId === item.mealId)
      : favorites.find((f) => f.type === 'User' && String(f.recipe) === String(item._id));
    if (existing) {
      await axios.delete(`/api/favorites/${existing._id}`);
      setFavorites((prev) => prev.filter((f) => f._id !== existing._id));
    } else {
      const res = await axios.post('/api/favorites', payload);
      setFavorites((prev) => [res.data, ...prev]);
    }
  }

  const isFavorite = (item) => {
    if (!item) return false;
    if (item.postType === 'User') return favorites.some((f) => f.type === 'User' && String(f.recipe) === String(item._id));
    return favorites.some((f) => f.type === 'MealDB' && f.mealId === item.mealId);
  };

  const value = useMemo(() => ({ favorites, loading, toggleFavorite, isFavorite }), [favorites, loading]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}


