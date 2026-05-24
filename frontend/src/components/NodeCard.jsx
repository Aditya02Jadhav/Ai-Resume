import React from 'react'
import { motion } from 'framer-motion'
import { Check, X, Loader2, FileSearch, BarChart3, MessageSquareWarning, ClipboardList } from 'lucide-react'
import clsx from 'clsx'

const NODE_ICONS = {
  parser_node: <FileSearch className="w-5 h-5" />,
  scoring_node: <BarChart3 className="w-5 h-5" />,
  critique_node: <MessageSquareWarning className="w-5 h-5" />,
  finalizer_node: <ClipboardList className="w-5 h-5" />,
}

const NODE_DESCRIPTIONS = {
  parser_node: 'Extracting structured data',
  scoring_node: 'Scoring vs job description',
  critique_node: 'Identifying gaps & AI phrasing',
  finalizer_node: 'Compiling final report',
}

function StatusIcon({ status }) {
  if (status === 'processing') return <Loader2 className="w-4 h-4 animate-spin text-violet-600 dark:text-violet-400" />
  if (status === 'complete') return <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 font-bold" />
  if (status === 'error') return <X className="w-4 h-4 text-red-500 dark:text-red-400 font-bold" />
  return <div className="w-4 h-4 rounded-full border border-slate-200 dark:border-white/10" />
}

export default function NodeCard({ nodeId, label, status, detail, index, isLast }) {
  const borderClass = {
    idle: 'border-slate-200 dark:border-white/10',
    processing: 'border-violet-600/30 dark:border-violet-500/50',
    complete: 'border-emerald-600/30 dark:border-emerald-500/50',
    error: 'border-red-500/30 dark:border-red-500/50',
  }[status] || 'border-slate-200 dark:border-white/10'

  const bgClass = {
    idle: 'bg-slate-50 dark:bg-white/[0.02]',
    processing: 'bg-violet-600/5 dark:bg-violet-500/10',
    complete: 'bg-emerald-600/5 dark:bg-emerald-500/10',
    error: 'bg-red-500/5 dark:bg-red-500/10',
  }[status] || 'bg-slate-50 dark:bg-white/[0.02]'

  return (
    <div className="flex flex-col items-center w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        className={clsx(
          'relative w-full rounded-2xl border p-4 transition-all duration-500',
          bgClass, borderClass,
          status !== 'idle' && 'shadow-lg'
        )}
      >
        {/* Processing pulse ring */}
        {status === 'processing' && (
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-violet-500"
            animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.02, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        <div className="flex items-center gap-3">
          {/* Icon container */}
          <div className={clsx(
            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-500',
            status === 'idle' ? 'bg-slate-200 dark:bg-white/5 text-black dark:text-white' :
            status === 'processing' ? 'bg-violet-600/20 text-violet-600 dark:text-violet-400' :
            status === 'complete' ? 'bg-emerald-600/20 text-emerald-600 dark:text-emerald-400' :
            'bg-red-500/20 text-red-500 dark:text-red-400'
          )}>
            {NODE_ICONS[nodeId]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={clsx(
                'text-sm font-bold tracking-tight',
                status === 'idle' ? 'text-black dark:text-white' : 'text-black dark:text-white'
              )}>
                {label}
              </p>
              <StatusIcon status={status} />
            </div>
            <p className={clsx(
              'text-[11px] mt-0.5 leading-tight font-medium',
              status === 'processing' ? 'text-violet-700 dark:text-violet-300 font-bold' :
              status === 'complete' ? 'text-emerald-700 dark:text-emerald-300 font-bold' :
              'text-black/70 dark:text-white/70'
            )}>
              {detail || NODE_DESCRIPTIONS[nodeId]}
            </p>
          </div>
        </div>

        {/* Step number */}
        <div className={clsx(
          'absolute -top-2.5 -left-2.5 w-6 h-6 rounded-full text-[11px] font-black flex items-center justify-center border-2 border-white dark:border-slate-900',
          status === 'idle' ? 'bg-slate-200 text-slate-500' :
          status === 'processing' ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/40' :
          status === 'complete' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/40' :
          'bg-red-600 text-white shadow-lg shadow-red-500/40'
        )}>
          {index + 1}
        </div>
      </motion.div>

      {/* Connector line */}
      {!isLast && (
        <div className={clsx(
          'w-0.5 h-6 my-1 rounded-full transition-all duration-500',
          status === 'complete' ? 'bg-gradient-to-b from-emerald-500/70 to-violet-500/40' :
          status === 'processing' ? 'bg-violet-500/50' :
          'bg-slate-200 dark:bg-white/5'
        )} />
      )}
    </div>
  )
}

export { NODE_ICONS, NODE_DESCRIPTIONS }
