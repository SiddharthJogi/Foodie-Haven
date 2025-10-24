import { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import RecipeChat from './RecipeChat.jsx';

export default function RecipeDetailsModal({ open, onClose, recipe }) {
  const [showChat, setShowChat] = useState(false);
  const { user } = useAuth();
  
  if (!open || !recipe) return null;

  const hasVideo = !!recipe.strYoutube;
  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <div className="fixed inset-0 bg-black/60 overflow-y-auto" style={{ zIndex: 60, paddingTop: '4.5rem' }}>
      <div className="max-w-3xl mx-auto my-10 bg-white rounded-2xl p-6 shadow-2xl">
        <button onClick={onClose} className="float-right text-2xl" aria-label="Close">×</button>
        <h2 className="text-2xl font-semibold mb-2">{recipe.strMeal}</h2>
        {recipe.strMealThumb && (
          <img src={recipe.strMealThumb} alt={recipe.strMeal} className="w-full rounded-lg mb-3" />
        )}
        <p className="mb-2"><strong>Category:</strong> {recipe.strCategory || 'Unknown'}</p>
        <h3 className="text-lg font-semibold mt-4">Ingredients</h3>
        <ul className="list-disc ml-6 mb-3">
          {(recipe.ingredientsDetailed || recipe.ingredients || []).map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
        {recipe.strInstructions && (
          <>
            <h3 className="text-lg font-semibold">Instructions</h3>
            <p className="whitespace-pre-wrap">{recipe.strInstructions}</p>
          </>
        )}
        {hasVideo && (
          <a
            href={recipe.strYoutube}
            target="_blank"
            rel="noopener"
            className="inline-block mt-3"
            style={{ color: 'var(--color-primary)' }}
          >
            Watch Tutorial
          </a>
        )}
        <div className="mt-5 flex justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => toggleFavorite(recipe)}
              className="px-4 py-2 rounded-full text-white"
              style={{ backgroundColor: isFavorite(recipe) ? '#ff9800' : 'var(--color-primary)' }}
            >
              {isFavorite(recipe) ? '★ Remove from Favorites' : '☆ Add to Favorites'}
            </button>
            {user && (
              <button
                onClick={() => setShowChat(true)}
                className="px-4 py-2 rounded-full text-white bg-green-500 hover:bg-green-600"
              >
                💬 Live Chat
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Chat Modal */}
      <RecipeChat 
        recipe={recipe} 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />
    </div>
  );
}


