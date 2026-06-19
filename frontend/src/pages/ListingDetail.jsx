import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Star, Clock, DollarSign, Tag, MessageSquare, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ListingDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Hiring Form State
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [hireLoading, setHireLoading] = useState(false);
  const [hireSuccess, setHireSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        const listingRes = await api.get(`/api/listings/${id}/`);
        setListing(listingRes.data);
        
        // Fetch reviews of the provider
        const providerId = listingRes.data.provider.id;
        const reviewsRes = await api.get(`/api/reviews/provider/${providerId}/`);
        setReviews(reviewsRes.data);
      } catch (err) {
        setError('Failed to load listing details.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleHireSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'customer') {
      setError('Only customers can hire service providers.');
      return;
    }

    setHireLoading(true);
    setError('');
    try {
      // Create a Project (contract) linked to this listing
      await api.post('/api/projects/', {
        provider_id: listing.provider.id,
        listing_id: listing.id,
        title: listing.title,
        description: requirements,
        budget: budget || listing.price,
        deadline: deadline
      });
      setHireSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit service request. Please check fields.');
    } finally {
      setHireLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading service details...</p>
      </div>
    );
  }

  if (error && !listing) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-14 h-14 text-red-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Error Loading Page</h3>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link to="/" className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl">
          Back to Listings
        </Link>
      </div>
    );
  }

  const providerProfile = listing.provider.provider_profile || {};
  const isOwner = user && user.id === listing.provider.id;

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-200">
      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white font-semibold mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Catalog
        </Link>

        {hireSuccess && (
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 border border-emerald-200 dark:border-emerald-900/50">
            <CheckCircle className="w-6 h-6 shrink-0" />
            <span className="font-semibold text-sm">Hiring proposal sent successfully! Redirecting to dashboard...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                  {listing.category_display}
                </span>
                <span className="text-sm text-slate-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {listing.delivery_time} days delivery
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold mb-6 leading-tight text-slate-800 dark:text-white font-heading">
                {listing.title}
              </h1>

              <h3 className="text-lg font-bold mb-3 text-slate-700 dark:text-slate-350">Service Description</h3>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Provider Detailed Profile Card */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white font-heading border-b pb-3 border-slate-100 dark:border-slate-850">
                About The Provider
              </h3>
              
              <div className="flex flex-col sm:flex-row sm:items-start gap-6 mb-6">
                <div className="w-16 h-16 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-2xl text-white shadow-md">
                  {listing.provider.username.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-extrabold text-slate-800 dark:text-white">{listing.provider.username}</h4>
                      <p className="text-sm text-slate-500">{providerProfile.experience || 'Professional Service Provider'}</p>
                    </div>
                    {user && user.id !== listing.provider.id && (
                      <Link
                        to={`/chat?user=${listing.provider.id}`}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 rounded-xl transition-all"
                        title="Chat with provider"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm font-semibold">
                    <span className="text-amber-500 flex items-center gap-0.5">
                      <Star className="w-4 h-4 fill-current" />
                      {providerProfile.average_rating || '5.0'} ({providerProfile.total_reviews || 0} reviews)
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-600 dark:text-slate-350">Rate: ${providerProfile.hourly_rate || '0.00'}/hr</span>
                  </div>
                </div>
              </div>

              {providerProfile.bio && (
                <div className="mb-6">
                  <h5 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Biography</h5>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{providerProfile.bio}</p>
                </div>
              )}

              {providerProfile.skills && providerProfile.skills.length > 0 && (
                <div className="mb-6">
                  <h5 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Skills & Expertise</h5>
                  <div className="flex flex-wrap gap-2">
                    {providerProfile.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-750 dark:text-slate-250 text-xs font-semibold rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {providerProfile.portfolio_items && providerProfile.portfolio_items.length > 0 && (
                <div>
                  <h5 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Portfolio Items</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {providerProfile.portfolio_items.map((item, idx) => (
                      <div key={idx} className="p-4 bg-slate-55 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="block font-bold text-slate-750 dark:text-slate-200 text-sm mb-1">{item.title}</span>
                        <span className="block text-xs text-slate-500 mb-2">{item.description}</span>
                        {item.link && (
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                            View Live Project →
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
              <h3 className="text-xl font-bold mb-6 text-slate-800 dark:text-white font-heading border-b pb-3 border-slate-100 dark:border-slate-850">
                Customer Feedback ({reviews.length})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-slate-500 text-sm py-4">No reviews have been left for this provider yet.</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="border-b border-slate-100 dark:border-slate-850 pb-6 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-sm">
                            {rev.customer.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block text-sm font-bold">{rev.customer.username}</span>
                            <span className="text-xs text-slate-400">
                              {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center text-amber-500 font-bold text-sm gap-0.5">
                          <Star className="w-4.5 h-4.5 fill-current" />
                          {rev.rating}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-350 leading-relaxed italic">
                        "{rev.feedback}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action / Hiring Form Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-md">
              <div className="mb-6 flex items-center justify-between">
                <span className="text-slate-500 text-sm">Service Cost</span>
                <span className="text-3xl font-extrabold text-slate-800 dark:text-white flex items-center">
                  <DollarSign className="w-6 h-6 text-indigo-600 shrink-0" />
                  {listing.price}
                </span>
              </div>

              {isOwner ? (
                <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-150 dark:border-indigo-900/30 text-sm text-center">
                  You created this listing. You can manage and edit it in your Provider Dashboard.
                </div>
              ) : (
                <form onSubmit={handleHireSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2 border border-red-200 dark:border-red-900/50 text-xs">
                      <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Describe Requirements
                    </label>
                    <textarea
                      required
                      rows="4"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
                      placeholder="Specify requirements, links, or expectations for the freelancer..."
                      value={requirements}
                      onChange={(e) => setRequirements(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Custom Budget (Optional)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        $
                      </span>
                      <input
                        type="number"
                        className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white transition-all"
                        placeholder={listing.price}
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Desired Deadline
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:text-white cursor-pointer transition-all"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={hireLoading || hireSuccess}
                    className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all glow-btn disabled:opacity-50"
                  >
                    {hireLoading ? 'Submitting proposal...' : 'Order / Hire Provider'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
