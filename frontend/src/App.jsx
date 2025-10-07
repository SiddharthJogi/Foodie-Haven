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

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#fff8e1' }}>
        <Header onLogin={() => setShowLogin(true)} onPost={() => setShowPost(true)} onShowFavorites={() => setShowFavorites((v) => !v)} />
        <main className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<RecipeList showFavoritesOnly={showFavorites} />} />
            <Route path="/auth" element={<AuthPage />} />
          </Routes>
        </main>
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
        <PostRecipeModal open={showPost} onClose={() => setShowPost(false)} />
      </div>
    </ThemeProvider>
  );
}

export default App;
