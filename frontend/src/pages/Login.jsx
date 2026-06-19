import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { AlertCircle, Lock, User as UserIcon } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="w-full max-w-md p-8 glass rounded-2xl shadow-xl flex flex-col">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight gradient-text font-heading">Welcome Back</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Log in to manage your projects and hires</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <UserIcon className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all duration-200"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 glow-btn disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
