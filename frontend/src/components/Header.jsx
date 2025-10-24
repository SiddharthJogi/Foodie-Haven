import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useLocation } from 'react-router-dom';

export default function Header({ onLogin, onPost, onShowFavorites, showFavorites }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="text-3xl font-extrabold text-white">Foodie Haven</div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="px-4 py-2 rounded-full text-black border"
            style={{ backgroundColor: 'var(--color-accent)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user && (
            <button
              onClick={onShowFavorites}
              className={`px-4 py-2 rounded-full text-black border transition-all duration-200 ${
                showFavorites 
                  ? 'ring-2 ring-white ring-opacity-50 scale-105 shadow-lg' 
                  : 'hover:scale-105 hover:shadow-md'
              }`}
              style={{ 
                backgroundColor: showFavorites ? 'var(--color-accent)' : 'var(--color-accent)',
                opacity: showFavorites ? 1 : 0.8
              }}
            >
              ⭐ Favorites
            </button>
          )}
          {user && (
            <button
              onClick={onPost}
              className="px-4 py-2 rounded-full text-white border transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              ➕ Post Recipe
            </button>
          )}
          {!user ? (
            <button
              onClick={onLogin}
              className="px-4 py-2 rounded-full text-black border"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Login
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-full text-black border"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Logout ({user.username})
            </button>
          )}
        </div>
      </div>
    </header>
  );
}


