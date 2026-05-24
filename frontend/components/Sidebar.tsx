'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, ChevronRight, Trash2, BarChart2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

export interface HistoryItem {
  id: string
  candidate: string
  grade: string
  overallScore: number
  timestamp: Date
  jobTitle?: string
}

interface SidebarProps {
  history: HistoryItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function GradeChip({ grade }: { grade: string }) {
  return (
    <span className={clsx('grade-' + grade, 'text-white text-xs font-bold px-2 py-0.5 rounded-full')}>
      {grade}
    </span>
  )
}

export default function Sidebar({ history, activeId, onSelect, onDelete }: SidebarProps) {
  return (
    <aside className="w-72 flex-shrink-0 h-screen sticky top-0 flex flex-col glass border-r border-white/5 z-20">
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <BarChart2 className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">ResumeAI</h1>
            <p className="text-[10px] text-slate-500">Agentic Analyser</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-slate-500">Connected With LLM</span>
        </div>
      </div>

      {/* History list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold px-2 mb-3 flex items-center gap-1.5">
          <Clock className="w-3 h-3" /> Recent Analyses
        </p>

        <AnimatePresence>
          {history.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-center py-10 px-4"
            >
              <FileText className="w-8 h-8 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-600 text-xs leading-relaxed">
                No analyses yet.<br />Upload a resume to get started.
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
                  'group relative rounded-xl p-3 cursor-pointer transition-all duration-200',
                  activeId === item.id
                    ? 'bg-violet-600/15 border border-violet-500/30'
                    : 'glass-hover border border-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <GradeChip grade={item.grade} />
                      <span className="text-xs text-violet-300 font-semibold">{item.overallScore}%</span>
                    </div>
                    <p className="text-sm text-slate-200 font-medium truncate">{item.candidate}</p>
                    {item.jobTitle && (
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.jobTitle}</p>
                    )}
                    <p className="text-[10px] text-slate-600 mt-1.5">
                      {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={e => { e.stopPropagation(); onDelete(item.id); }}
                      className="p-1 rounded-md hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </div>
                </div>
                {activeId === item.id && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-violet-500 rounded-r-full"
                  />
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <p className="text-[10px] text-slate-700 text-center">
          Powered by Google Gemini · LangGraph
        </p>
      </div>
    </aside>
  )
}
