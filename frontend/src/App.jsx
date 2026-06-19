import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ListingDetail from './pages/ListingDetail';
import RequestList from './pages/RequestList';
import RequestCreate from './pages/RequestCreate';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import Chat from './pages/Chat';

// Icons
import { 
  Sparkles, MessageSquare, Briefcase, User as UserIcon, LogOut, 
  Moon, Sun, PlusCircle, Search, Menu, X, Shield, FileText
} from 'lucide-react';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial class
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      setDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/30">
            <Sparkles className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-xl font-extrabold tracking-tight font-heading dark:text-white">
            Teyzix<span className="text-indigo-600 dark:text-indigo-400">Core</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold text-slate-650 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Services Catalog
          </Link>
          <Link to="/requests" className="text-sm font-semibold text-slate-650 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Open Requests Feed
          </Link>
          {user && (
            <>
              <Link to="/chat" className="text-sm font-semibold text-slate-650 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5 relative">
                <MessageSquare className="w-4.5 h-4.5" />
                Inbox
              </Link>
              <Link to="/dashboard" className="text-sm font-semibold text-slate-650 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                <Briefcase className="w-4.5 h-4.5" />
                Dashboard
              </Link>
            </>
          )}
        </div>

        {/* Right Auth controls */}
        <div className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <span className="block text-xs font-bold dark:text-white leading-none mb-0.5">{user.username}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">{user.role}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-800">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold hover:text-indigo-600 transition-colors">
                Log In
              </Link>
              <Link to="/register" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-3 md:hidden">
          <button onClick={toggleDarkMode} className="p-2 text-slate-500">
            {darkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-350">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-slideDown">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold">
            Services Catalog
          </Link>
          <Link to="/requests" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold">
            Open Requests Feed
          </Link>
          {user ? (
            <>
              <Link to="/chat" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold">
                Inbox Messages
              </Link>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-semibold">
                User Dashboard
              </Link>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="block text-sm font-bold">{user.username}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{user.role}</span>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-650 text-xs font-bold rounded-xl flex items-center gap-1.5">
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-150 dark:border-slate-800 flex gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-semibold border border-slate-200 rounded-xl">
                Log In
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 py-2 text-center text-sm font-bold bg-indigo-600 text-white rounded-xl">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

// Protected Route wrapper
function PrivateRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

function MainLayout() {
  return (
    <div className="flex-1 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/services/:id" element={<ListingDetail />} />
          <Route path="/requests" element={<RequestList />} />
          
          <Route path="/requests/create" element={
            <PrivateRoute>
              <RequestCreate />
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          
          <Route path="/projects/:id" element={
            <PrivateRoute>
              <ProjectDetail />
            </PrivateRoute>
          } />
          
          <Route path="/chat" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </Router>
  );
}
