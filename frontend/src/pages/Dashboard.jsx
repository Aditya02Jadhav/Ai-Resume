import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, XCircle, FileEdit, AlertTriangle, ArrowLeft } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function Dashboard() {
  const location = useLocation();
  const scoreData = location.state?.scoreData;

  if (!scoreData) {
    return <Navigate to="/upload" />;
  }

  const { overall_score = 0, breakdown = {}, suggestions = {}, keyword_matches = {} } = scoreData;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-red-400";
  };
  
  const getRingColor = (score) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 space-y-8 animate-in fade-in zoom-in duration-500">
      <Link to="/upload" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Update Resume
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Overall Score Card */}
        <div className="md:col-span-1 glass-panel p-8 flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-300 mb-6">Overall ATS Score</h2>
          
          <div className="relative w-48 h-48 flex flex-col items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" className="stroke-slate-200 dark:stroke-slate-700/50" />
              <circle 
                cx="50" cy="50" r="45" fill="none" strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (overall_score / 100) * 283}
                className={`${getRingColor(overall_score)} transition-all duration-1000 ease-out`} 
                strokeLinecap="round"
              />
            </svg>
            <span className={`text-6xl font-black ${getScoreColor(overall_score)} z-10 block`}>{overall_score}</span>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400 z-10">/ 100</span>
          </div>
          
          <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
            {overall_score >= 80 ? "Great job! You are highly compatible with ATS." : 
             overall_score >= 60 ? "Good start, but there's significant room for improvement." : 
             "Needs major overhaul. Fix the critical issues below."}
          </p>
        </div>

        {/* Breakdown & Feedback */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-8 flex-1">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><FileEdit className="text-indigo-500 dark:text-indigo-400"/> Critical Analysis</h3>
             <div className="space-y-6">
                {Object.entries(breakdown)
                  .filter(([, value]) => typeof value === 'number' && !isNaN(value))
                  .map(([key, value]) => {
                    const maxScore = key==="keywords"?40:key==="formatting"?10:key==="education"?10:100;
                    const percentage = Math.min((value / maxScore) * 100, 100);
                    return (
                      <div key={key} className="flex flex-col gap-2">
                        <div className="flex justify-between text-sm items-center">
                          <span className="text-slate-700 dark:text-slate-300 capitalize font-medium">{key}</span>
                          <span className="font-semibold text-slate-900 dark:text-white">{Math.round(value)} / {maxScore}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                           <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500" style={{width: `${percentage}%`}}></div>
                        </div>
                      </div>
                    );
                  })}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel p-8">
             <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><AlertTriangle className="text-amber-500 dark:text-amber-400"/> Actionable Suggestions</h3>
             <ul className="space-y-4">
               {suggestions && suggestions.length > 0 ? suggestions.map((s, i) => (
                 <li key={i} className="flex gap-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
                   <ChevronRight className="text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5" size={18} />
                   <span>{s}</span>
                 </li>
               )) : <li className="text-emerald-400 flex items-center gap-2"><CheckCircle2/> All looks good!</li>}
             </ul>
          </div>
          
          {keyword_matches && Array.isArray(keyword_matches) && keyword_matches.length > 0 && (
            <div className="glass-panel p-8">
               <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><CheckCircle2 className="text-emerald-400"/> Identified Keywords</h3>
               <div className="flex flex-wrap gap-2">
                 {keyword_matches.map(kw => (
                   <span key={kw} className="px-3 py-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 rounded-full text-sm font-medium capitalize">
                     {kw}
                   </span>
                 ))}
               </div>
            </div>
          )}
      </div>

      <div className="pt-4 pb-8">
        <AdBanner dataAdSlot="DASHBOARD_BOTTOM_AD" className="min-h-[120px]" format="auto" />
      </div>
    </div>
  );
}
