import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password);
      // login automatically or navigate to login
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 glass-panel">
      <h2 className="text-3xl font-bold mb-6 text-center text-slate-900 dark:text-white">Create Account</h2>
      {error && <div className="bg-red-500/20 text-red-500 dark:text-red-300 p-3 rounded-lg mb-4 text-sm border border-red-500/30">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
          <input 
            type="email" 
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            value={email} onChange={e => setEmail(e.target.value)} required 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Password</label>
          <input 
            type="password" 
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            value={password} onChange={e => setPassword(e.target.value)} required 
          />
        </div>
        <button type="submit" className="w-full btn-primary mt-4 py-3 text-lg">Register</button>
      </form>
      <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
        Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign In</Link>
      </p>
    </div>
  );
}
