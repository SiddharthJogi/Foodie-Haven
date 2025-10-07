import { useState } from 'react';

const CATEGORIES = [
  'beef','chicken','dessert','lamb','miscellaneous','pasta','pork','seafood','side','starter','vegan','vegetarian','breakfast','goat'
];

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const trigger = () => {
    const trimmed = query.trim();
    if (!trimmed) return alert('Please enter a meal name or category');
    const isCategory = CATEGORIES.some((cat) => cat.toLowerCase() === trimmed.toLowerCase());
    onSearch({ query: trimmed, isCategory });
  };

  return (
    <section className="w-full" style={{ backgroundColor: '#ffe082', marginBottom: '1.5rem' }}>
      <div className="max-w-6xl mx-auto py-10 text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome, Food Lovers!</h2>
        <p className="mb-5">Discover culinary delights crafted by the world's finest chefs.</p>
        <div className="flex gap-2 justify-center">
          <label htmlFor="searchInput" className="sr-only">Search for food</label>
          <input
            id="searchInput"
            type="text"
            className="border-2 rounded-full px-5 py-3 focus:outline-none bg-white"
            style={{ borderColor: 'var(--color-primary)', width: '100%', maxWidth: 520, backgroundColor: '#ffffff' }}
            placeholder="Search meals (e.g., pizza) or categories (e.g., dessert)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            id="searchBtn"
            onClick={trigger}
            className="px-6 py-3 rounded-full text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Search
          </button>
        </div>
      </div>
    </section>
  );
}


