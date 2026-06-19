import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { id: 'web-dev', name: 'Website Development' },
  { id: 'design', name: 'Logo & Graphic Design' },
  { id: 'writing', name: 'Content Writing' },
  { id: 'marketing', name: 'Digital Marketing' },
  { id: 'video', name: 'Video Editing' }
];

export default function RequestCreate() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [requirements, setRequirements] = useState('');
  const [category, setCategory] = useState('web-dev');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || user.role !== 'customer') {
      setError('Only customers can post service requests.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/requests/', {
        title,
        requirements,
        category,
        budget,
        deadline
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError('Failed to post request. Please check inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle className="w-6 h-6 shrink-0" />
            <span className="font-semibold text-sm">Request posted successfully! Redirecting...</span>
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight gradient-text font-heading">Post a Service Request</h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Describe what you need and set your budget and timeline</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-900/50">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Project Title</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all duration-200"
                placeholder="e.g. Build a Shopify landing page"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Category</label>
                <select
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all cursor-pointer"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Your Budget ($)</label>
                <input
                  type="number"
                  required
                  min="5"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all duration-200"
                  placeholder="e.g. 500"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Required Deadline</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white cursor-pointer transition-all"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Requirements Detail</label>
              <textarea
                required
                rows="6"
                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
                placeholder="Give a thorough explanation of what needs to be delivered, any specific technology stack, or file formats..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/30 glow-btn disabled:opacity-50"
            >
              {loading ? 'Posting request...' : 'Post Open Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
