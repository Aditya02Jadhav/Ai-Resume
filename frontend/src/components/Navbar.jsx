import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LogOut, Sun, Moon, Zap, Menu, X, UploadCloud, ChevronDown, UserCircle, Star } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  // Handle scroll detection for glassmorphism transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Upload', path: '/upload' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Builder', path: '/builder' },
    { name: 'Analyser', path: '/analyzer' },
    { name: 'Mock Panel', path: '/mock-panel' },
  ];


  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 py-3 px-4 md:px-8 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-slate-200/50 dark:border-slate-800/50 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-indigo-500/20 shadow-lg"
          >
            <Zap className="text-white fill-white" size={22} />
          </motion.div>
          <span className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 tracking-tight">
            RESUME<span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`relative px-4 py-2 font-bold text-sm transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${
                isActive(link.path) 
                  ? 'text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {link.name}
              {isActive(link.path) && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute bottom-1 left-4 right-4 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Theme Toggle */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme} 
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all shadow-sm"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          {/* User / CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
               <div className="relative">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300 shadow-sm transition-all"
                  >
                     <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-black ring-2 ring-indigo-100 dark:ring-indigo-900/30">
                        {user.email?.[0]?.toUpperCase() || 'U'}
                     </div>
                     Account
                     <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-0" onClick={() => setDropdownOpen(false)} />
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
                        >
                          <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                             <p className="text-xs text-slate-500 uppercase font-black">Logged in as</p>
                             <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.email || 'User'}</p>
                          </div>
                          <Link to="/account" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800 transition-colors">
                              <UserCircle size={18} className="text-indigo-500" /> Account Settings
                          </Link>
                          <Link to="/pricing" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-800 transition-colors">
                              <Star size={18} className="text-amber-500" /> Upgrade Pro
                          </Link>
                          <button 
                            onClick={() => {
                              setDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <LogOut size={18} /> Logout
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
               </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2">Login</Link>
                <Link to="/upload" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all hover:-translate-y-0.5 text-sm">
                   <UploadCloud size={18} /> Upload Resume
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-900 dark:text-white"
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col p-4 gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="px-4 py-3 text-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-slate-200 dark:bg-slate-800 my-2" />
              {!user && (
                <div className="flex flex-col gap-3">
                  <Link to="/login" className="px-4 py-3 text-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">Login</Link>
                  <Link to="/upload" className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg">
                    <UploadCloud size={20} /> Upload Resume
                  </Link>
                </div>
              )}
              {user && (
                <>
                  <div className="px-4 py-2">
                     <p className="text-xs text-slate-500 uppercase font-black">Logged in as</p>
                     <p className="font-bold text-slate-900 dark:text-white">{user.email}</p>
                  </div>
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-lg font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl">
                    Account Settings
                  </Link>
                  <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-4 py-4 text-red-600 font-bold bg-red-50 dark:bg-red-900/10 rounded-xl">
                    <LogOut size={20} /> Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

