import { useState } from 'react';
import './App.css';
import Header from './components/Header.jsx';
import RecipeList from './components/RecipeList.jsx';
import LoginModal from './components/LoginModal.jsx';
import PostRecipeModal from './components/PostRecipeModal.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage.jsx';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showPost, setShowPost] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [refreshRecipes, setRefreshRecipes] = useState(null);

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
        <Header 
          onLogin={() => setShowLogin(true)} 
          onPost={() => setShowPost(true)} 
          onShowFavorites={() => setShowFavorites((v) => !v)}
          showFavorites={showFavorites}
        />
        <main className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<RecipeList showFavoritesOnly={showFavorites} onRefresh={setRefreshRecipes} />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
        <PostRecipeModal 
          open={showPost} 
          onClose={() => setShowPost(false)} 
          onRecipePosted={refreshRecipes}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
