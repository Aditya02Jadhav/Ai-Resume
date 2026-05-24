import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Bot, Zap, BarChart, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

const severityColor = {
  high: 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-200 dark:border-red-500/20',
  medium: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  low: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
}

function Section({ icon, title, count, color, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className={clsx('rounded-xl border overflow-hidden shadow-sm transition-colors duration-300', color)}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-900/5 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-bold text-black dark:text-slate-200 tracking-tight">{title}</span>
          <span className="text-[10px] bg-slate-200 dark:bg-white/10 text-black dark:text-black px-2 py-0.5 rounded-full font-black">{count}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 shadow-sm" /> : <ChevronRight className="w-4 h-4 text-slate-400 shadow-sm" />}
      </button>
      <AnimatePresence>
        {open && count > 0 && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CritiquePanel({ critique }) {
  const gaps = critique.semantic_gaps ?? []
  const aiFlags = critique.ai_phrasing_flags ?? []
  const weakVerbs = critique.weak_verbs ?? []
  const quantGaps = critique.quantification_gaps ?? []
  const improvements = critique.top_improvements ?? []

  return (
    <div className="space-y-4 w-full">
      {/* Overall critique */}
      {critique.overall_critique && (
        <div className="bg-slate-100 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-white/5 shadow-inner">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium italic">
            &ldquo;{critique.overall_critique}&rdquo;
          </p>
        </div>
      )}

      {/* Priority improvements */}
      {improvements.length > 0 && (
        <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-violet-200 dark:border-violet-500/20 overflow-hidden shadow-lg">
          <div className="px-5 py-4 border-b border-violet-100 dark:border-violet-500/10 flex items-center gap-3 bg-violet-50 dark:bg-violet-500/5">
            <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400 fill-violet-600/10" />
            <span className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Priority Actions</span>
          </div>
          <div className="p-5 space-y-4">
            {improvements.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 group"
              >
                <div className="w-8 h-8 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm group-hover:scale-110 transition-transform">
                  {item.priority}
                </div>
                <div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-bold leading-tight">{item.action}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1 font-medium">{item.impact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Semantic gaps */}
      <Section
        icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
        title="Semantic Gaps"
        count={gaps.length}
        color="border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/[0.03]"
      >
        {gaps.map((g, i) => (
          <div key={i} className="bg-white dark:bg-white/[0.03] rounded-xl p-4 space-y-2 border border-slate-100 dark:border-transparent shadow-sm">
            <div className="flex items-center gap-2">
              <span className={clsx('text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider', severityColor[g.severity])}>
                {g.severity}
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-300">{g.gap}</p>
            </div>
            <div className="flex items-start gap-2 text-xs text-emerald-600 dark:text-emerald-400/80 font-bold">
              <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{g.suggestion}</span>
            </div>
          </div>
        ))}
      </Section>

      {/* AI phrasing */}
      <Section
        icon={<Bot className="w-4 h-4 text-blue-500" />}
        title="AI Flags"
        count={aiFlags.length}
        color="border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/[0.03]"
      >
        {aiFlags.map((f, i) => (
          <div key={i} className="bg-white dark:bg-white/[0.03] rounded-xl p-4 space-y-2 border border-slate-100 dark:border-transparent shadow-sm">
            <p className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium italic">&ldquo;{f.phrase}&rdquo;</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{f.reason}</p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-black">
              <ArrowRight className="w-3 h-3 flex-shrink-0" />
              &ldquo;{f.replacement}&rdquo;
            </div>
          </div>
        ))}
      </Section>

      {/* Quantification gaps */}
      <Section
        icon={<BarChart className="w-4 h-4 text-cyan-500" />}
        title="Quantification"
        count={quantGaps.length}
        color="border-cyan-200 dark:border-cyan-500/20 bg-cyan-50 dark:bg-cyan-500/[0.03]"
      >
        {quantGaps.map((q, i) => (
          <div key={i} className="bg-white dark:bg-white/[0.03] rounded-xl p-4 space-y-2 border border-slate-100 dark:border-transparent shadow-sm">
            <p className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">{q.bullet}</p>
            <div className="flex items-start gap-2 text-xs text-violet-600 dark:text-cyan-400 font-black italic">
              <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-violet-600 dark:text-cyan-400" />
              <span>{q.suggestion}</span>
            </div>
          </div>
        ))}
      </Section>
    </div>
  )
}
