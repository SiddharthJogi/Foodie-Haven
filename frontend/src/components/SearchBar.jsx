import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChefHat, Sparkles } from 'lucide-react';

const CATEGORIES = [
  'beef','chicken','dessert','lamb','miscellaneous','pasta','pork','seafood','side','starter','vegan','vegetarian','breakfast','goat'
];

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const trigger = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const trimmed = query.trim();
    if (!trimmed) return alert('Please enter a meal name or category');
    const isCategory = CATEGORIES.some((cat) => cat.toLowerCase() === trimmed.toLowerCase());
    console.log('Search triggered:', { query: trimmed, isCategory });
    onSearch({ query: trimmed, isCategory });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      trigger();
    }
  };

  return (
    <motion.section 
      className="w-full rounded-3xl overflow-hidden shadow-2xl"
      style={{ backgroundColor: 'var(--color-search-bg)', marginBottom: '2rem' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-6xl mx-auto py-12 px-6 text-center relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20" style={{ backgroundColor: 'var(--color-primary)' }}></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: 'var(--color-accent)' }}></div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="w-8 h-8 mr-3" style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
              Welcome, Food Lovers!
            </h2>
            <Sparkles className="w-6 h-6 ml-3" style={{ color: 'var(--color-accent)' }} />
          </div>
          
          <motion.p 
            className="mb-8 text-lg" 
            style={{ color: 'var(--color-text)', opacity: 0.8 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            Discover culinary delights crafted by the world's finest chefs
          </motion.p>
        </motion.div>

        <form onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submitted!');
          trigger(e);
        }}>
          <div className="flex gap-3 justify-center items-center">
            <div className="relative flex-1 max-w-2xl">
              <label htmlFor="searchInput" className="sr-only">Search for food</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: 'var(--color-text)', opacity: 0.5 }} />
                <input
                  id="searchInput"
                  type="text"
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all duration-300"
                  style={{ 
                    borderColor: 'var(--color-primary)', 
                    backgroundColor: 'var(--color-card)',
                    color: 'var(--color-text)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  placeholder="Search meals (e.g., pizza) or categories (e.g., dessert)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>
            
            <button
              id="searchBtn"
              onClick={(e) => {
                console.log('Button clicked!');
                e.preventDefault();
                e.stopPropagation();
                trigger(e);
              }}
              onMouseDown={() => console.log('Mouse down on button')}
              onMouseUp={() => console.log('Mouse up on button')}
              onMouseEnter={() => console.log('Mouse enter button')}
              className="px-8 py-4 rounded-2xl text-white font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                pointerEvents: 'auto',
                zIndex: 10,
                position: 'relative'
              }}
              type="button"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </form>
      </div>
    </motion.section>
  );
}


