import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Check, Star, Zap } from 'lucide-react';

export default function Pricing() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Simple, transparent pricing</h2>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Get comprehensive AI-powered resume analytics and stand out from the crowd.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-300 dark:border-slate-700 relative">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Guest / Free</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">Perfect to test the waters.</p>
          <div className="text-5xl font-black text-slate-900 dark:text-white mb-8">$0<span className="text-lg text-slate-500 font-medium">/forever</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
               <Check className="text-indigo-600 dark:text-indigo-400" size={20}/> <span>1 free resume scan</span>
            </li>
            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
               <Check className="text-indigo-600 dark:text-indigo-400" size={20}/> <span>Basic ATS Score</span>
            </li>
            <li className="flex items-center gap-3 text-slate-500 opacity-50">
               <Zap size={20}/> <span>Advanced AI Suggestions (Locked)</span>
            </li>
          </ul>
          <button className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold border border-slate-300 dark:border-slate-600 hover:bg-slate-300 dark:hover:bg-slate-700 transition">Current Plan</button>
        </div>

        {/* Pro Plan */}
        <div className="p-8 justify-between flex flex-col rounded-3xl bg-gradient-to-b from-indigo-100 dark:from-indigo-600/20 to-indigo-200 dark:to-indigo-900/40 border-2 border-indigo-500 relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(79,70,229,0.2)]">
          <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl uppercase tracking-wider">Most Popular</div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">Pro <Star className="fill-indigo-500 dark:fill-indigo-400 text-indigo-500 dark:text-indigo-400" size={20}/></h3>
            <p className="text-indigo-800 dark:text-indigo-200 mb-6">For serious job seekers.</p>
            <div className="text-5xl font-black text-slate-900 dark:text-white mb-8">$9<span className="text-lg text-indigo-700 dark:text-indigo-300 font-medium">/month</span></div>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                 <Check className="text-indigo-600 dark:text-indigo-400" size={20}/> <span>Unlimited resume scans</span>
              </li>
              <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                 <Check className="text-indigo-600 dark:text-indigo-400" size={20}/> <span>Deep Keyword Analytics</span>
              </li>
              <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                 <Check className="text-indigo-600 dark:text-indigo-400" size={20}/> <span>AI-Powered Rewrite Suggestions</span>
              </li>
              <li className="flex items-center gap-3 text-slate-900 dark:text-white">
                 <Check className="text-indigo-600 dark:text-indigo-400" size={20}/> <span>Export unlimited PDFs</span>
              </li>
            </ul>
          </div>
          <button className="w-full btn-primary py-4 text-lg font-bold">Upgrade to Pro</button>
        </div>
      </div>
    </div>
  );
}
