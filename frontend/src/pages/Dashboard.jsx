import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  DollarSign, Briefcase, FileText, Star, Plus, Shield, Users, Layers, Activity,
  Settings, Save, Upload, PlusCircle, Trash2, CheckCircle2, Clock, AlertCircle, Edit2
} from 'lucide-react';

export default function Dashboard() {
  const { user, updateProfile, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, projects, listings/requests, profile, admin
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [userRequests, setUserRequests] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Profile Form States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState(''); // comma-separated for editing
  const [portfolio, setPortfolio] = useState([]); // array of dicts
  
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');
  const [newPortLink, setNewPortLink] = useState('');
  
  const [profileSuccess, setProfileSuccess] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarSuccess, setAvatarSuccess] = useState(false);

  // Listing creation form state (for providers)
  const [showListingModal, setShowListingModal] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [listCategory, setListCategory] = useState('web-dev');
  const [listPrice, setListPrice] = useState('');
  const [listDelivery, setListDelivery] = useState('');
  const [listError, setListError] = useState('');
  const [listSuccess, setListSuccess] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      // Load stats
      const statsRes = await api.get('/api/users/dashboard/');
      setStats(statsRes.data);

      if (user.role === 'customer') {
        // Load projects
        const projRes = await api.get('/api/projects/');
        setProjects(projRes.data);
        // Load requests
        const reqRes = await api.get(`/api/requests/?customer_id=${user.id}`);
        setUserRequests(reqRes.data);
      } else if (user.role === 'provider') {
        // Load projects
        const projRes = await api.get('/api/projects/');
        setProjects(projRes.data);
        // Load provider listings
        const listRes = await api.get(`/api/listings/?provider_id=${user.id}`);
        setUserListings(listRes.data);
      }
    } catch (err) {
      setError('Failed to fetch dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Initialize profile form states
    setEmail(user.email || '');
    setPhone(user.phone || '');
    
    if (user.role === 'provider' && user.provider_profile) {
      const p = user.provider_profile;
      setBio(p.bio || '');
      setHourlyRate(p.hourly_rate || '0.00');
      setExperience(p.experience || '');
      setSkills(p.skills ? p.skills.join(', ') : '');
      setPortfolio(p.portfolio_items || []);
    }

    fetchDashboardData();
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');
    setError('');
    
    const formattedSkills = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    const patchData = {
      email,
      phone,
      provider_profile: user.role === 'provider' ? {
        bio,
        experience,
        hourly_rate: hourlyRate,
        skills: formattedSkills,
        portfolio_items: portfolio
      } : undefined
    };

    try {
      await updateProfile(patchData);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile.');
    }
  };

  const handleAvatarUpload = async (e) => {
    e.preventDefault();
    if (!avatarFile) return;
    
    const formData = new FormData();
    formData.append('profile_picture', avatarFile);
    
    try {
      const res = await api.post('/api/users/profile/avatar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAvatarSuccess(true);
      // Reload profile context
      const profRes = await api.get('/api/users/profile/');
      setUser(profRes.data);
      setTimeout(() => setAvatarSuccess(false), 3000);
    } catch (err) {
      alert('Avatar upload failed.');
    }
  };

  const handleAddPortfolio = () => {
    if (!newPortTitle) return;
    const newItem = {
      title: newPortTitle,
      description: newPortDesc,
      link: newPortLink
    };
    setPortfolio([...portfolio, newItem]);
    setNewPortTitle('');
    setNewPortDesc('');
    setNewPortLink('');
  };

  const handleRemovePortfolio = (index) => {
    setPortfolio(portfolio.filter((_, idx) => idx !== index));
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    setListError('');
    setListSuccess(false);

    try {
      await api.post('/api/listings/', {
        title: listTitle,
        description: listDesc,
        category: listCategory,
        price: listPrice,
        delivery_time: listDelivery
      });
      setListSuccess(true);
      setListTitle('');
      setListDesc('');
      setListPrice('');
      setListDelivery('');
      
      // Reload listings
      const listRes = await api.get(`/api/listings/?provider_id=${user.id}`);
      setUserListings(listRes.data);
      
      setTimeout(() => {
        setShowListingModal(false);
        setListSuccess(false);
      }, 1500);
    } catch (err) {
      setListError('Failed to create service listing.');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500">Loading user dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-950 transition-colors duration-200 flex flex-col md:flex-row min-h-screen">
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 shrink-0 p-6 space-y-8">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white font-heading">Control Panel</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{user.role} workspace</p>
        </div>

        <nav className="flex flex-col gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => setActiveTab('projects')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-between ${
              activeTab === 'projects' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
            }`}
          >
            Projects / Contracts
            {projects.length > 0 && (
              <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === 'projects' ? 'bg-white text-indigo-600' : 'bg-indigo-100 text-indigo-700'}`}>
                {projects.length}
              </span>
            )}
          </button>

          {user.role === 'customer' ? (
            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'requests' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
              }`}
            >
              My Service Requests
            </button>
          ) : user.role === 'provider' ? (
            <button
              onClick={() => setActiveTab('listings')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'listings' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
              }`}
            >
              My Listings
            </button>
          ) : user.role === 'admin' ? (
            <button
              onClick={() => setActiveTab('admin')}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'admin' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
              }`}
            >
              Platform Administration
            </button>
          ) : null}

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-300'
            }`}
          >
            Profile & Settings
          </button>
        </nav>
      </aside>

      {/* Main dashboard content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-semibold">{error}</span>
          </div>
        )}

        {/* tab CONTENT: OVERVIEW */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-heading">
                Hello, {user.username}!
              </h1>
              <p className="text-slate-500">Welcome to your Teyzix control panel.</p>
            </div>

            {/* Role-specific Metrics Cards */}
            {user.role === 'customer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Active Projects</span>
                    <span className="text-2xl font-extrabold">{stats.active_projects_count}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Completed Contracts</span>
                    <span className="text-2xl font-extrabold">{stats.completed_projects_count}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Posted Requests</span>
                    <span className="text-2xl font-extrabold">{stats.active_requests_count}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Total Hires Spend</span>
                    <span className="text-2xl font-extrabold">${stats.total_spent}</span>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'provider' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Total Earnings</span>
                    <span className="text-2xl font-extrabold">${stats.earnings}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Active Projects</span>
                    <span className="text-2xl font-extrabold">{stats.active_projects_count}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Pending Orders</span>
                    <span className="text-2xl font-extrabold">{stats.pending_requests_count}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">My Listings</span>
                    <span className="text-2xl font-extrabold">{stats.listings_count}</span>
                  </div>
                </div>
              </div>
            )}

            {user.role === 'admin' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Total Users</span>
                    <span className="text-2xl font-extrabold">{stats.users.total}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Service Listings</span>
                    <span className="text-2xl font-extrabold">{stats.services.total_listings}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Active Contracts</span>
                    <span className="text-2xl font-extrabold">{stats.projects.total}</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex items-center gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-bold uppercase tracking-wider">Transaction Vol.</span>
                    <span className="text-2xl font-extrabold">${stats.projects.transaction_volume}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Action Dashboard widgets */}
            <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80">
              <h3 className="text-lg font-bold mb-4">Quick Worksheets</h3>
              <div className="flex flex-wrap gap-4">
                {user.role === 'customer' && (
                  <>
                    <Link to="/requests/create" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md">
                      Post An Open Request
                    </Link>
                    <Link to="/" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all border border-slate-200 dark:border-slate-750">
                      Browse Vetted Freelancers
                    </Link>
                  </>
                )}
                {user.role === 'provider' && (
                  <>
                    <button
                      onClick={() => setShowListingModal(true)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
                    >
                      Create Service Listing
                    </button>
                    <Link to="/requests" className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm transition-all border border-slate-200 dark:border-slate-750">
                      Browse Customer Requests Feed
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* tab CONTENT: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-heading">My Projects / Contracts</h2>
                <p className="text-slate-500 text-sm">Track active hires, status timeline, and submit deliverables.</p>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-slate-500 text-lg mb-2">No projects have been initiated yet.</p>
                <p className="text-slate-400 text-xs">Start a project by ordering from a service listing or accepting an open request.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                          proj.status === 'delivered' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200' :
                          proj.status === 'completed' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border-indigo-200' :
                          proj.status === 'in_progress' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-200' :
                          'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200'
                        }`}>
                          {proj.status.toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">Project #{proj.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white font-heading">{proj.title}</h3>
                      <p className="text-xs text-slate-400">
                        {user.role === 'customer' ? `Freelancer: ${proj.provider.username}` : `Client: ${proj.customer.username}`} • Deadline: {new Date(proj.deadline).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto shrink-0 border-t border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:border-0">
                      <div className="text-left md:text-right">
                        <span className="block text-xs text-slate-400 font-semibold">Budget</span>
                        <span className="text-lg font-extrabold text-slate-800 dark:text-white">${proj.budget}</span>
                      </div>
                      <Link
                        to={`/projects/${proj.id}`}
                        className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md"
                      >
                        Track Status
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* tab CONTENT: CUSTOMER REQUESTS */}
        {activeTab === 'requests' && user.role === 'customer' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-heading">My Open Service Requests</h2>
                <p className="text-slate-500 text-sm">Requests you have posted for providers to browse.</p>
              </div>
              <Link to="/requests/create" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1 shadow-md">
                <Plus className="w-4 h-4" />
                Post Request
              </Link>
            </div>

            {userRequests.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-slate-500 text-lg mb-2">You haven't posted any open requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userRequests.map((req) => (
                  <div key={req.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-900/30">
                        {req.category_display}
                      </span>
                      <span className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{req.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{req.requirements}</p>
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 border-t pt-4 border-slate-100 dark:border-slate-850">
                      <span>Budget: ${req.budget}</span>
                      <span>Target: {req.target_provider?.username || 'Open Pool'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* tab CONTENT: PROVIDER LISTINGS */}
        {activeTab === 'listings' && user.role === 'provider' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-heading">My Service Listings</h2>
                <p className="text-slate-500 text-sm">Services you offer to customers on the platform catalog.</p>
              </div>
              <button
                onClick={() => setShowListingModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all flex items-center gap-1 shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create Listing
              </button>
            </div>

            {userListings.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                <p className="text-slate-500 text-lg mb-2">You haven't created any service listings yet.</p>
                <button
                  onClick={() => setShowListingModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs mt-4"
                >
                  Create Your First Listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {userListings.map((lst) => (
                  <div key={lst.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 font-semibold">{lst.category_display}</span>
                        <span className="text-xs text-slate-400 font-semibold">{lst.delivery_time}d delivery</span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white line-clamp-2">{lst.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{lst.description}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-850 pt-4 mt-6">
                      <span className="font-bold text-slate-800 dark:text-white">${lst.price}</span>
                      <button
                        onClick={async () => {
                          if (confirm('Delete this listing?')) {
                            try {
                              await api.delete(`/api/listings/${lst.id}/`);
                              setUserListings(userListings.filter(l => l.id !== lst.id));
                            } catch(e) { alert('Delete failed'); }
                          }
                        }}
                        className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* tab CONTENT: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="max-w-3xl space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-heading">Profile Details</h2>
              <p className="text-slate-500 text-sm">Update your public details and provider portfolio settings.</p>
            </div>

            {profileSuccess && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-3 border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="font-semibold text-sm">{profileSuccess}</span>
              </div>
            )}

            {/* Avatar Upload Panel (For Providers) */}
            {user.role === 'provider' && (
              <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                <h3 className="text-lg font-bold mb-4">Profile Avatar</h3>
                <form onSubmit={handleAvatarUpload} className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-3xl text-white shadow-md overflow-hidden">
                    {user.provider_profile?.profile_picture ? (
                      <img src={`${api.defaults.baseURL}${user.provider_profile.profile_picture}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 space-y-3 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAvatarFile(e.target.files[0])}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    <button
                      type="submit"
                      disabled={!avatarFile}
                      className="py-2 px-5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50"
                    >
                      Upload New Avatar
                    </button>
                    {avatarSuccess && <span className="block text-xs text-emerald-500 mt-1">Avatar uploaded!</span>}
                  </div>
                </form>
              </div>
            )}

            {/* General details form */}
            <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800/80 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Username (Read-only)</label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-sm"
                    value={user.username}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Account Role (Read-only)</label>
                  <input
                    type="text"
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 text-sm capitalize"
                    value={user.role}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Provider Profile Sub-Settings */}
              {user.role === 'provider' && (
                <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-850">
                  <h3 className="text-lg font-bold font-heading">Freelancer Profile Metrics</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Hourly Rate ($/hr)</label>
                      <input
                        type="number"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Years of Experience (Brief Summary)</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                        placeholder="e.g. 5 years in senior mobile development"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Skills (Comma-separated)</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                      placeholder="e.g. React, Python, Django, Figma"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Professional Summary / Biography</label>
                    <textarea
                      rows="4"
                      className="w-full p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none dark:text-white"
                      placeholder="Explain your services, qualifications, and core focus..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  {/* Portfolio Manager */}
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Portfolio Items ({portfolio.length})</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {portfolio.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl relative">
                          <button
                            type="button"
                            onClick={() => handleRemovePortfolio(idx)}
                            className="absolute right-3 top-3 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <span className="block text-sm font-bold">{item.title}</span>
                          <span className="block text-xs text-slate-400 mt-1">{item.description}</span>
                          {item.link && (
                            <a href={item.link} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-650 mt-2 block hover:underline">
                              {item.link}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add portfolio fields */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-350 dark:border-slate-750 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Add Portfolio Item</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          type="text"
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          placeholder="Project Title"
                          value={newPortTitle}
                          onChange={(e) => setNewPortTitle(e.target.value)}
                        />
                        <input
                          type="text"
                          className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                          placeholder="Web Link (Optional)"
                          value={newPortLink}
                          onChange={(e) => setNewPortLink(e.target.value)}
                        />
                      </div>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs"
                        placeholder="Short Description"
                        value={newPortDesc}
                        onChange={(e) => setNewPortDesc(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={handleAddPortfolio}
                        className="py-1.5 px-4 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add Item
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* tab CONTENT: ADMIN PANEL */}
        {activeTab === 'admin' && user.role === 'admin' && stats && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white font-heading">Platform Administration</h2>
              <p className="text-slate-500 text-sm">Review sitewide diagnostics and overall usage counts.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Membership Roles</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b pb-2 border-slate-50 dark:border-slate-850">
                    <span>Customers</span>
                    <span className="font-extrabold">{stats.users.customers}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2 border-slate-50 dark:border-slate-850">
                    <span>Service Providers</span>
                    <span className="font-extrabold">{stats.users.providers}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1">
                    <span>Total Members</span>
                    <span>{stats.users.total}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Service Catalogs</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b pb-2 border-slate-50 dark:border-slate-850">
                    <span>Active Listings</span>
                    <span className="font-extrabold">{stats.services.total_listings}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Open Service Requests</span>
                    <span className="font-extrabold">{stats.services.total_requests}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-xs">
                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Project Milestones</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm border-b pb-2 border-slate-50 dark:border-slate-850">
                    <span>Total Contracts Started</span>
                    <span className="font-extrabold">{stats.projects.total}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2 border-slate-50 dark:border-slate-850">
                    <span>Delivered Contracts</span>
                    <span className="font-extrabold">{stats.projects.completed}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1">
                    <span>Exchange Volume</span>
                    <span>${stats.projects.transaction_volume}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* CREATE LISTING MODAL (For Providers) */}
      {showListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setShowListingModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold font-heading mb-6">Create Service Listing</h3>
            
            {listSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm">
                Service listing posted successfully!
              </div>
            )}
            {listError && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-sm">
                {listError}
              </div>
            )}

            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Service Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build modern React Landing Page"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none dark:text-white"
                  value={listTitle}
                  onChange={(e) => setListTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category</label>
                  <select
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none cursor-pointer"
                    value={listCategory}
                    onChange={(e) => setListCategory(e.target.value)}
                  >
                    <option value="web-dev">Website Development</option>
                    <option value="design">Logo & Graphic Design</option>
                    <option value="writing">Content Writing</option>
                    <option value="marketing">Digital Marketing</option>
                    <option value="video">Video Editing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Price ($)</label>
                  <input
                    type="number"
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none dark:text-white"
                    placeholder="250"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Delivery Time (days)</label>
                <input
                  type="number"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none dark:text-white"
                  placeholder="5"
                  value={listDelivery}
                  onChange={(e) => setListDelivery(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Service Description</label>
                <textarea
                  required
                  rows="4"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-sm focus:outline-none dark:text-white"
                  placeholder="Elaborate on details included, stack details, number of drafts..."
                  value={listDesc}
                  onChange={(e) => setListDesc(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
              >
                Post Service Listing
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
