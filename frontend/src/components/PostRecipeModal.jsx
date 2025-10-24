import { useState } from 'react';
import axios from '../config/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function PostRecipeModal({ open, onClose, onRecipePosted }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    strMeal: '',
    strMealThumb: '',
    strCategory: '',
    strInstructions: '',
    ingredientsRaw: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ingredients = form.ingredientsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await axios.post('api/recipes', {
        strMeal: form.strMeal,
        strMealThumb: form.strMealThumb,
        strCategory: form.strCategory,
        strInstructions: form.strInstructions,
        ingredients,
      });
      
      // Reset form
      setForm({
        strMeal: '',
        strMealThumb: '',
        strCategory: '',
        strInstructions: '',
        ingredientsRaw: '',
      });
      
      onClose();
      
      // Trigger refresh of recipe list
      if (onRecipePosted) {
        onRecipePosted();
      }
      
      alert('Recipe posted!');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to post recipe');
    } finally {
      setLoading(false);
    }
  };

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
          Post a Recipe {user ? `as @${user.username}` : ''}
        </h2>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <form onSubmit={submit} className="grid grid-cols-1 gap-3">
          <input className="border rounded px-3 py-2" placeholder="Recipe Name" value={form.strMeal} onChange={update('strMeal')} />
          <input className="border rounded px-3 py-2" placeholder="Image URL" value={form.strMealThumb} onChange={update('strMealThumb')} />
          <input className="border rounded px-3 py-2" placeholder="Category" value={form.strCategory} onChange={update('strCategory')} />
          <textarea className="border rounded px-3 py-2" placeholder="Instructions" rows={4} value={form.strInstructions} onChange={update('strInstructions')} />
          <input className="border rounded px-3 py-2" placeholder="Ingredients (comma separated)" value={form.ingredientsRaw} onChange={update('ingredientsRaw')} />
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
            <button disabled={loading} className="px-4 py-2 rounded text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
              {loading ? 'Posting…' : 'Post Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


