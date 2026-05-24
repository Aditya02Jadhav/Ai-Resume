import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, History, Trash2, Eye, Key, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Account() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [pwdData, setPwdData] = useState({ current: '', new: '', confirm: '' });
  const [pwdMsg, setPwdMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user && activeTab === 'resumes') {
      fetchHistory();
    }
  }, [activeTab, user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-500 font-bold">Verifying Session...</p>
      </div>
    );
  }


  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/resume/history');
      setResumes(res.data);
    } catch (err) {
      setError('Failed to load resume history');
    } finally {
      setLoading(false);
    }
  };

  const deleteResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume scan?')) return;
    try {
      await api.delete(`/resume/${id}`);
      setResumes(resumes.filter(r => r.id !== id));
    } catch (err) {
      alert('Failed to delete resume');
    }
  };

  const handlePwdChange = async (e) => {
    e.preventDefault();
    setPwdMsg({ type: '', text: '' });
    if (pwdData.new !== pwdData.confirm) {
      return setPwdMsg({ type: 'error', text: 'New passwords do not match' });
    }
    if (pwdData.new.length < 6) {
      return setPwdMsg({ type: 'error', text: 'Password must be at least 6 characters' });
    }

    try {
      await api.post('/auth/change-password', {
        current_password: pwdData.current,
        new_password: pwdData.new
      });
      setPwdMsg({ type: 'success', text: 'Password updated successfully!' });
      setPwdData({ current: '', new: '', confirm: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to change password' });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-8"
      >
        {/* SIDEBAR TABS */}
        <div className="w-full md:w-64 space-y-2">
          <TabButton 
            active={activeTab === 'profile'} 
            onClick={() => setActiveTab('profile')}
            icon={<User size={18}/>} 
            label="My Profile" 
          />
          <TabButton 
            active={activeTab === 'resumes'} 
            onClick={() => setActiveTab('resumes')}
            icon={<History size={18}/>} 
            label="Resume History" 
          />
          <TabButton 
            active={activeTab === 'security'} 
            onClick={() => setActiveTab('security')}
            icon={<Shield size={18}/>} 
            label="Security" 
          />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-slate-200 dark:border-slate-700">
          
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Account Settings</h2>
                <p className="text-slate-500">Manage your profile information and preferences.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                   <p className="text-sm text-slate-500 font-bold uppercase mb-4 flex items-center gap-2 tracking-wider">
                     <Mail size={14}/> Email Address
                   </p>
                   <p className="text-lg font-bold text-slate-900 dark:text-white">{user?.email}</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                   <p className="text-sm text-slate-500 font-bold uppercase mb-4 flex items-center gap-2 tracking-wider">
                     <Shield size={14}/> Current Plan
                   </p>
                   <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                      {user?.plan_id === 1 ? 'Free Tier' : 'Pro Tier'}
                   </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resumes' && (
             <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Resume History</h2>
                  <p className="text-slate-500">Previous scans and analyzes performed on your account.</p>
                </div>

                {loading ? (
                   <div className="animate-pulse space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-20 bg-slate-100 dark:bg-slate-900/50 rounded-2xl"></div>)}
                   </div>
                ) : resumes.length === 0 ? (
                   <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                      <p className="text-slate-500 font-medium">No resumes found. Start by uploading one!</p>
                   </div>
                ) : (
                   <div className="space-y-4">
                      {resumes.map(resume => (
                         <div key={resume.id} className="group flex items-center justify-between p-5 bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                  <FileText size={24}/>
                               </div>
                               <div>
                                  <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{resume.original_filename}</p>
                                  <p className="text-sm text-slate-500">Scored on {new Date(resume.created_at).toLocaleDateString()}</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               {resume.scores?.[0] && (
                                  <a href={`/dashboard/${resume.scores[0].id}`} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors">
                                     <Eye size={20}/>
                                  </a>
                               )}
                               <button onClick={() => deleteResume(resume.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                  <Trash2 size={20}/>
                               </button>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
          )}

          {activeTab === 'security' && (
             <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Security & Password</h2>
                  <p className="text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
                </div>

                <form onSubmit={handlePwdChange} className="max-w-md space-y-5">
                   {pwdMsg.text && (
                      <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${pwdMsg.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                         {pwdMsg.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
                         {pwdMsg.text}
                      </div>
                   )}
                   <InputField 
                      label="Current Password" 
                      type="password" 
                      value={pwdData.current}
                      onChange={e => setPwdData({...pwdData, current: e.target.value})}
                      placeholder="••••••••"
                   />
                   <InputField 
                      label="New Password" 
                      type="password" 
                      value={pwdData.new}
                      onChange={e => setPwdData({...pwdData, new: e.target.value})}
                      placeholder="••••••••"
                   />
                   <InputField 
                      label="Confirm New Password" 
                      type="password" 
                      value={pwdData.confirm}
                      onChange={e => setPwdData({...pwdData, confirm: e.target.value})}
                      placeholder="••••••••"
                   />
                   <button type="submit" className="btn-primary w-full py-4 text-lg font-bold shadow-xl">
                      Update Password
                   </button>
                </form>
             </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ active, icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
        active 
          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function InputField({ label, ...props }) {
   return (
      <div className="space-y-2">
         <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">{label}</label>
         <input 
            {...props} 
            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
         />
      </div>
   );
}

