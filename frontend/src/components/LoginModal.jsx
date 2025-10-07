import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginModal({ open, onClose }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, isRegister);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
          {isRegister ? 'Create account' : 'Welcome back'}
        </h2>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={isRegister} onChange={(e) => setIsRegister(e.target.checked)} />
              Register new account
            </label>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded border"
            >
              Cancel
            </button>
          </div>
          <button
            disabled={loading}
            className="w-full px-4 py-2 rounded text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {loading ? 'Please wait…' : isRegister ? 'Register & Login' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}


