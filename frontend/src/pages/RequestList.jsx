import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Calendar, DollarSign, Tag, Briefcase, FileText, ArrowRight, MessageSquare, AlertCircle } from 'lucide-react';

export default function RequestList() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applyLoading, setApplyLoading] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/requests/');
      setRequests(res.data);
    } catch (err) {
      setError('Failed to fetch service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApply = async (reqItem) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'provider') {
      alert('Only service providers can apply to customer requests.');
      return;
    }

    setApplyLoading(reqItem.id);
    try {
      // Create a Project (contract) linked to this customer request
      const res = await api.post('/api/projects/', {
        provider_id: user.id, // Freelancer is hiring themselves for this request
        request_id: reqItem.id,
        title: reqItem.title,
        description: reqItem.requirements,
        budget: reqItem.budget,
        deadline: reqItem.deadline
      });
      // Redirect to the newly created project visual tracking page
      navigate(`/projects/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit proposal.');
    } finally {
      setApplyLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading customer requests feed...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-3 font-heading leading-tight text-slate-800 dark:text-white">
            Browse Customer <span className="gradient-text">Service Requests</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Freelancers can review customer-posted requirements and start work directly.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl max-w-lg mx-auto p-8 shadow-xs">
            <p className="text-slate-500 text-lg mb-4">There are currently no active open requests.</p>
            {user?.role === 'customer' && (
              <Link to="/requests/create" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl inline-block">
                Post A Request Now
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((reqItem) => (
              <div
                key={reqItem.id}
                className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                      {reqItem.category_display}
                    </span>
                    <span className="text-xs text-slate-400">
                      Posted by {reqItem.customer.username} • {new Date(reqItem.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 dark:text-white font-heading">{reqItem.title}</h3>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed max-w-3xl whitespace-pre-line">
                    {reqItem.requirements}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500 pt-2">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      Budget: ${reqItem.budget}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      Deadline: {new Date(reqItem.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex md:flex-col gap-3 w-full md:w-auto shrink-0 border-t border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:border-0">
                  {user?.role === 'provider' ? (
                    <button
                      onClick={() => handleApply(reqItem)}
                      disabled={applyLoading === reqItem.id}
                      className="flex-1 md:w-44 py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 text-sm flex items-center justify-center gap-2"
                    >
                      {applyLoading === reqItem.id ? 'Sending...' : 'Accept Job'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    user?.id === reqItem.customer.id && (
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30 text-center w-full">
                        Your Own Request
                      </span>
                    )
                  )}

                  {user && user.id !== reqItem.customer.id && (
                    <Link
                      to={`/chat?user=${reqItem.customer.id}`}
                      className="flex-1 md:w-44 py-2.5 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-750"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contact Client
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
