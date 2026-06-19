import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Search, Filter, Star, Clock, Tag, ArrowRight, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: '', name: 'All Categories' },
  { id: 'web-dev', name: 'Website Development' },
  { id: 'design', name: 'Logo & Graphic Design' },
  { id: 'writing', name: 'Content Writing' },
  { id: 'marketing', name: 'Digital Marketing' },
  { id: 'video', name: 'Video Editing' }
];

export default function Home() {
  const [listings, setListings] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState('price');

  const fetchListings = async () => {
    setLoading(true);
    try {
      let url = '/api/listings/';
      const params = [];
      if (search) params.push(`search=${search}`);
      if (category) params.push(`category=${category}`);
      if (ordering) params.push(`ordering=${ordering}`);
      
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }
      
      const res = await api.get(url);
      setListings(res.data);
    } catch (err) {
      console.error('Failed to load listings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, ordering]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 bg-linear-to-br from-indigo-900 via-slate-950 to-purple-950 text-white text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_60%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/15 border border-indigo-500/35 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
            Teyzix Core Marketplace
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 font-heading leading-tight">
            Find the Perfect Professional <br />
            <span className="gradient-text">Freelance Services</span> for Your Business
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with vetted programmers, UI designers, content writers, and marketing specialists instantly.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="What service are you looking for today?"
                className="w-full pl-12 pr-4 py-3 bg-transparent text-slate-800 dark:text-white focus:outline-none placeholder:text-slate-400"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="py-3 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 glow-btn"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Catalog */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                  category === cat.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 shrink-0">Sort By:</span>
            <select
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none dark:text-white cursor-pointer"
            >
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="-created_at">Newest Listings</option>
            </select>
          </div>
        </div>

        {/* Directory Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500">Loading catalog items...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl p-8 max-w-lg mx-auto">
            <p className="text-lg text-slate-500 mb-4">No service listings found matching your criteria.</p>
            <button
              onClick={() => { setSearch(''); setCategory(''); }}
              className="px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden"
              >
                <div className="p-6 flex-1 flex flex-col">
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center gap-1.5 border border-indigo-100 dark:border-indigo-900/30">
                      <Tag className="w-3.5 h-3.5" />
                      {listing.category_display}
                    </span>
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-4.5 h-4.5" />
                      {listing.delivery_time}d delivery
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <Link
                    to={`/services/${listing.id}`}
                    className="text-lg font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200 mb-2 line-clamp-2 font-heading"
                  >
                    {listing.title}
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-3 leading-relaxed">
                    {listing.description}
                  </p>

                  {/* Provider Info */}
                  <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-xs">
                        {listing.provider.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                          {listing.provider.username}
                        </span>
                        <span className="text-xs text-amber-500 flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {listing.provider.provider_profile?.average_rating || '5.0'} ({listing.provider.provider_profile?.total_reviews || 0})
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-xs text-slate-400">Starting At</span>
                      <span className="text-lg font-extrabold text-slate-800 dark:text-white">
                        ${listing.price}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom interactive card bar */}
                <Link
                  to={`/services/${listing.id}`}
                  className="bg-slate-50 dark:bg-slate-850 py-3.5 px-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm font-bold text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300"
                >
                  Hire / View Details
                  <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
