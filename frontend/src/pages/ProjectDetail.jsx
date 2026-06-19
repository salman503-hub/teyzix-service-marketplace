import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { 
  CheckCircle2, Clock, DollarSign, Calendar, FileText, ArrowRight,
  AlertCircle, Upload, Star, ChevronRight, MessageSquare
} from 'lucide-react';

const STEPS = [
  { id: 'pending', name: 'Proposal Sent' },
  { id: 'accepted', name: 'Accepted' },
  { id: 'in_progress', name: 'In Progress' },
  { id: 'completed', name: 'Submitted' },
  { id: 'delivered', name: 'Delivered / Approved' }
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Deliver/Submit Work State
  const [deliveryNote, setDeliveryNote] = useState('');
  const [deliveryFile, setDeliveryFile] = useState(null);

  // Review Form State (For Customer)
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/api/projects/${id}/`);
      setProject(res.data);
    } catch (err) {
      setError('Failed to fetch project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleStatusChange = async (actionPath, payload = null, headers = {}) => {
    setActionLoading(true);
    setError('');
    try {
      const res = await api.post(`/api/projects/${id}/${actionPath}/`, payload, { headers });
      setProject(res.data);
    } catch (err) {
      setError(err.response?.data?.error || `Action failed: ${actionPath}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    
    const formData = new FormData();
    if (deliveryFile) {
      formData.append('delivery_file', deliveryFile);
    }
    formData.append('delivery_note', deliveryNote);

    try {
      const res = await api.post(`/api/projects/${id}/complete/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setProject(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit deliverables.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess(false);
    try {
      await api.post('/api/reviews/', {
        project_id: project.id,
        rating,
        feedback
      });
      setReviewSuccess(true);
      // Refresh project to update review relation check if needed
      fetchProjectDetails();
    } catch (err) {
      setReviewError(err.response?.data?.non_field_errors?.[0] || 'Failed to submit rating feedback.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading project pipeline...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Project</h3>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link to="/dashboard" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isCustomer = user && user.id === project.customer.id;
  const isProvider = user && user.id === project.provider.id;
  
  // Find current step index
  const currentStepIdx = STEPS.findIndex(s => s.id === project.status);

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Workspace / Project Tracker</span>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-heading mt-1">{project.title}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to={`/chat?user=${isCustomer ? project.provider.id : project.customer.id}`}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl flex items-center gap-2 border border-slate-200 dark:border-slate-750"
            >
              <MessageSquare className="w-4.5 h-4.5" />
              Chat Room
            </Link>
            <Link to="/dashboard" className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold text-sm">
              My Dashboard
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* 1. Visual Progress Timeline Workflow */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 relative">
            {/* Horizontal timeline bar for desktop */}
            <div className="hidden sm:block absolute left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800 top-1/2 -translate-y-1/2 pointer-events-none z-0" />
            
            {STEPS.map((step, idx) => {
              const isCompleted = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isFuture = idx > currentStepIdx;
              
              return (
                <div key={step.id} className="flex flex-row sm:flex-col items-center gap-3 relative z-10 w-full sm:w-auto">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all ${
                    isCompleted ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs' :
                    isCurrent ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/35 ring-4 ring-indigo-500/20' :
                    'bg-white dark:bg-slate-900 border-slate-250 dark:border-slate-750 text-slate-400'
                  }`}>
                    {isCompleted ? '✓' : idx + 1}
                  </div>
                  <span className={`text-xs font-bold text-center ${isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Main Project details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <h3 className="text-xl font-bold font-heading mb-4 border-b pb-3 border-slate-100 dark:border-slate-850">
                Contract Requirements
              </h3>
              <p className="text-slate-650 dark:text-slate-305 text-sm leading-relaxed whitespace-pre-wrap mb-6">
                {project.description || 'No requirements notes specified.'}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-400 border-t pt-4 border-slate-100 dark:border-slate-850">
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                  Budget: ${project.budget}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  Deadline: {new Date(project.deadline).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Delivery File Display (If delivered or completed) */}
            {(project.status === 'completed' || project.status === 'delivered') && (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                <h3 className="text-xl font-bold font-heading mb-4 text-slate-800 dark:text-white">
                  Freelancer Deliverables
                </h3>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
                  {project.delivery_file ? (
                    <div>
                      <span className="block text-xs font-bold text-slate-400 mb-1">Delivered Document / Link</span>
                      <a
                        href={`${api.defaults.baseURL}${project.delivery_file}`}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                      >
                        <FileText className="w-4.5 h-4.5" />
                        Download Deliverable Files
                      </a>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-500">Delivered via summary notes.</span>
                  )}
                  {project.delivery_note && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                      <span className="block text-xs font-bold text-slate-400 mb-1">Freelancer Notes</span>
                      <p className="text-xs text-slate-650 dark:text-slate-350 italic">"{project.delivery_note}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Review Form (Customer leaves review after deliverables are submitted or approved) */}
            {isCustomer && (project.status === 'completed' || project.status === 'delivered') && (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                <h3 className="text-xl font-bold font-heading mb-6 border-b pb-3 border-slate-100 dark:border-slate-850">
                  Rate Freelancer & Leave Feedback
                </h3>
                
                {reviewSuccess ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Review submitted successfully! Vetted rating computed.
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    {reviewError && (
                      <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                        <span>{reviewError}</span>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-semibold mb-2">Score (1-5 Stars)</label>
                      <select
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:outline-none cursor-pointer text-amber-500"
                        value={rating}
                        onChange={(e) => setRating(parseInt(e.target.value))}
                      >
                        <option value="5">⭐⭐⭐⭐⭐ Excellent (5)</option>
                        <option value="4">⭐⭐⭐⭐ Good (4)</option>
                        <option value="3">⭐⭐⭐ Satisfactory (3)</option>
                        <option value="2">⭐⭐ Fair (2)</option>
                        <option value="1">⭐ Poor (1)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">Feedback Comment</label>
                      <textarea
                        required
                        rows="3"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                        placeholder="Share your experience working with this freelancer..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                    </div>

                    <button
                      type="submit"
                      className="py-2.5 px-6 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20"
                    >
                      Post Review
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Action panel */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Action Worksheet</h4>
              
              {/* Timeline status summaries */}
              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <span className="block font-bold mb-1">State: {project.status.toUpperCase()}</span>
                {project.status === 'pending' && <p>Awaiting freelancer acceptance of this contract.</p>}
                {project.status === 'accepted' && <p>Freelancer has accepted! Awaiting project start.</p>}
                {project.status === 'in_progress' && <p>Work is underway. Awaiting freelancer file delivery.</p>}
                {project.status === 'completed' && <p>Freelancer submitted deliverables. Client must approve.</p>}
                {project.status === 'delivered' && <p>Project completed, approved, and fully closed.</p>}
              </div>

              {/* Status workflow execution triggers */}
              {isProvider && (
                <div className="space-y-3 pt-2">
                  {project.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange('accept')}
                      disabled={actionLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      Accept Contract Proposal
                    </button>
                  )}

                  {project.status === 'accepted' && (
                    <button
                      onClick={() => handleStatusChange('start')}
                      disabled={actionLoading}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      Start Project Work
                    </button>
                  )}

                  {project.status === 'in_progress' && (
                    <form onSubmit={handleDeliverySubmit} className="space-y-4 pt-2">
                      <h5 className="text-xs font-bold text-slate-500">Submit Deliverables</h5>
                      
                      <div>
                        <label className="block text-[10px] text-slate-450 uppercase mb-1">Attach Source Zip / Documents</label>
                        <input
                          type="file"
                          onChange={(e) => setDeliveryFile(e.target.files[0])}
                          className="w-full text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-450 uppercase mb-1">Summary Delivery Notes</label>
                        <textarea
                          required
                          rows="3"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          placeholder="e.g. Here is the final source code and layout files. Let me know if you need tweaks."
                          value={deliveryNote}
                          onChange={(e) => setDeliveryNote(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md"
                      >
                        Submit Deliverables & Complete
                      </button>
                    </form>
                  )}
                </div>
              )}

              {isCustomer && (
                <div className="pt-2">
                  {project.status === 'completed' && (
                    <button
                      onClick={() => handleStatusChange('deliver')}
                      disabled={actionLoading}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md"
                    >
                      Approve Delivery & Release Funds
                    </button>
                  )}

                  {project.status === 'pending' && (
                    <span className="block text-xs text-slate-400 text-center italic">Waiting for developer to accept proposal.</span>
                  )}
                  {project.status === 'accepted' && (
                    <span className="block text-xs text-slate-400 text-center italic">Developer accepted proposal. Work starting soon.</span>
                  )}
                  {project.status === 'in_progress' && (
                    <span className="block text-xs text-slate-400 text-center italic">Developer is currently coding / designing.</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
