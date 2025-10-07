import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AuthPage() {
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password, isRegister);
    } catch (err) {
      setError(err?.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fff8e1' }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-primary)' }}>Foodie Haven</h1>
        <p className="mb-6 text-sm text-gray-600">{isRegister ? 'Create your account' : 'Welcome back'}</p>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <input className="w-full border rounded px-3 py-2" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={isRegister} onChange={(e) => setIsRegister(e.target.checked)} />
              Register new account
            </label>
          </div>
          <button disabled={loading} className="w-full px-4 py-2 rounded text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? 'Please wait…' : isRegister ? 'Register & Login' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}


