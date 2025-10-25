import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from '../config/api.js';
import { useAuth } from './AuthContext.jsx';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Create efficient lookup sets for O(1) checking
  const favoriteSets = useMemo(() => {
    const userFavorites = new Set();
    const mealDbFavorites = new Set();
    
    favorites.forEach(fav => {
      if (fav.type === 'User' && fav.recipe) {
        userFavorites.add(String(fav.recipe));
      } else if (fav.type === 'MealDB' && fav.mealId) {
        mealDbFavorites.add(String(fav.mealId));
      }
    });
    
    return { userFavorites, mealDbFavorites };
  }, [favorites]);

  useEffect(() => {
    async function load() {
      if (!user) {
        console.log('No user, clearing favorites');
        setFavorites([]);
        return;
      }
      setLoading(true);
      try {
        console.log('Loading favorites for user:', user.username, 'User ID:', user._id);
        const res = await axios.get('api/favorites');
        console.log('Favorites API response:', res);
        console.log('Favorites data:', res.data);
        console.log('Favorites count:', res.data?.length || 0);
        setFavorites(res.data || []);
      } catch (error) {
        console.error('Failed to load favorites:', error);
        console.error('Error details:', error.response?.data);
        console.error('Error status:', error.response?.status);
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
    const itemId = type === 'User' ? item._id : item.mealId;
    
    // Check if already favorite using efficient Set lookup
    const isCurrentlyFavorite = type === 'User' 
      ? favoriteSets.userFavorites.has(String(itemId))
      : favoriteSets.mealDbFavorites.has(String(itemId));
    
    try {
      if (isCurrentlyFavorite) {
        // Remove from favorites
        const existing = favorites.find(fav => 
          fav.type === type && 
          ((type === 'User' && String(fav.recipe) === String(itemId)) ||
           (type === 'MealDB' && String(fav.mealId) === String(itemId)))
        );
        
        if (existing) {
          console.log('Removing favorite:', existing);
          await axios.delete(`api/favorites/${existing._id}`);
          setFavorites(prev => prev.filter(f => f._id !== existing._id));
        }
      } else {
        // Add to favorites
        const payload = type === 'MealDB'
          ? { 
              type, 
              mealId: item.mealId, 
              snapshot: { 
                strMeal: item.strMeal, 
                strMealThumb: item.strMealThumb, 
                strCategory: item.strCategory 
              } 
            }
          : { type, recipeId: item._id };
        
        console.log('Adding favorite:', payload);
        const res = await axios.post('api/favorites', payload);
        console.log('Favorite added:', res.data);
        setFavorites(prev => [res.data, ...prev]);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('Failed to save favorite. Please try again.');
    }
  }

  // Ultra-fast O(1) favorite checking using Sets
  const isFavorite = (item) => {
    if (!item) return false;
    
    if (item.postType === 'User') {
      return favoriteSets.userFavorites.has(String(item._id));
    } else {
      return favoriteSets.mealDbFavorites.has(String(item.mealId));
    }
  };

  const value = useMemo(() => ({ 
    favorites, 
    loading, 
    toggleFavorite, 
    isFavorite,
    favoriteCount: favorites.length 
  }), [favorites, loading, favoriteSets]);
  
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}


