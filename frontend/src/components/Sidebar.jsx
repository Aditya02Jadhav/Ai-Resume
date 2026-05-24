import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, ChevronRight, Trash2, BarChart2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

function GradeChip({ grade }) {
  return (
    <span className={clsx('grade-' + grade, 'text-white text-xs font-bold px-2 py-0.5 rounded-full')}>
      {grade}
    </span>
  )
}

export default function Sidebar({ history, activeId, onSelect, onDelete }) {
  return (
    <aside className="w-72 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 z-20 transition-colors duration-300">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-white/5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-600/10 dark:bg-violet-600/20 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-black dark:text-white tracking-tight">ResumeAI</h1>
            <p className="text-[10px] text-black dark:text-white uppercase font-semibold">Agentic Analyser</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] text-black dark:text-white font-medium">Connected With LLM</span>
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        <p className="text-[10px] text-black dark:text-white uppercase tracking-widest font-bold px-2 mb-3 flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Recent Analyses
        </p>

        <AnimatePresence>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-12 px-4"
            >
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-black dark:text-white" />
              </div>
              <p className="text-black dark:text-white text-xs leading-relaxed font-medium">
                No analyses yet.<br />Upload a resume to begin.
              </p>
            </motion.div>
          ) : (
            history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(item.id)}
                className={clsx(
                  'group relative rounded-xl p-3 cursor-pointer transition-all duration-200 border',
                  activeId === item.id
                    ? 'bg-violet-600/5 dark:bg-violet-600/15 border-violet-500/20 dark:border-violet-500/30'
                    : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/5'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <GradeChip grade={item.grade} />
                      <span className="text-xs text-violet-600 dark:text-violet-300 font-bold">{item.overallScore}%</span>
                    </div>
                    <p className="text-sm text-black dark:text-white font-bold truncate tracking-tight">{item.candidate}</p>
                    {item.jobTitle && (
                      <p className="text-[11px] text-black dark:text-white truncate mt-0.5 font-medium">{item.jobTitle}</p>
                    )}
                    <p className="text-[10px] text-black dark:text-white mt-2 font-semibold">
                      {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(item.id); }}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-black dark:text-white hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-black dark:text-white" />
                  </div>
                </div>
                {activeId === item.id && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-violet-500 rounded-r-full"
                  />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-transparent">
        <p className="text-[10px] text-black dark:text-white text-center font-bold tracking-widest uppercase">
          Powered by Gemini · LangGraph
        </p>
      </div>
    </aside>
  )
}
