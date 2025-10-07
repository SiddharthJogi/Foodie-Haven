import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header({ onLogin, onPost, onShowFavorites }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
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
              className="px-4 py-2 rounded-full text-black border"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Favorites
            </button>
          )}
          {user && (
            <button
              onClick={onPost}
              className="px-4 py-2 rounded-full text-white border"
              style={{ backgroundColor: '#e63900' }}
            >
              Post Recipe
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


