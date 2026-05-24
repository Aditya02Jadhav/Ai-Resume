'use client'
import { motion } from 'framer-motion'
import { Check, X, Loader2, FileSearch, BarChart3, MessageSquareWarning, ClipboardList } from 'lucide-react'
import clsx from 'clsx'

export type NodeStatus = 'idle' | 'processing' | 'complete' | 'error'

export interface NodeInfo {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  status: NodeStatus
  detail?: string
}

const NODE_ICONS: Record<string, React.ReactNode> = {
  parser_node: <FileSearch className="w-5 h-5" />,
  scoring_node: <BarChart3 className="w-5 h-5" />,
  critique_node: <MessageSquareWarning className="w-5 h-5" />,
  finalizer_node: <ClipboardList className="w-5 h-5" />,
}

const NODE_DESCRIPTIONS: Record<string, string> = {
  parser_node: 'Extracting structured data',
  scoring_node: 'Scoring vs job description',
  critique_node: 'Identifying gaps & AI phrasing',
  finalizer_node: 'Compiling final report',
}

function StatusIcon({ status }: { status: NodeStatus }) {
  if (status === 'processing') return <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
  if (status === 'complete') return <Check className="w-4 h-4 text-emerald-400" />
  if (status === 'error') return <X className="w-4 h-4 text-red-400" />
  return <div className="w-4 h-4 rounded-full border border-white/10" />
}

interface NodeCardProps {
  nodeId: string
  label: string
  status: NodeStatus
  detail?: string
  index: number
  isLast: boolean
}

export default function NodeCard({ nodeId, label, status, detail, index, isLast }: NodeCardProps) {
  const borderClass = {
    idle: 'node-idle',
    processing: 'node-processing',
    complete: 'node-complete',
    error: 'node-error',
  }[status]

  const bgClass = {
    idle: 'bg-white/[0.02]',
    processing: 'bg-violet-500/10',
    complete: 'bg-emerald-500/10',
    error: 'bg-red-500/10',
  }[status]

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        className={clsx(
          'relative w-full rounded-2xl border p-4 transition-all duration-500',
          bgClass, borderClass
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
            status === 'idle' ? 'bg-white/5 text-slate-600' :
            status === 'processing' ? 'bg-violet-500/20 text-violet-400' :
            status === 'complete' ? 'bg-emerald-500/20 text-emerald-400' :
            'bg-red-500/20 text-red-400'
          )}>
            {NODE_ICONS[nodeId]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={clsx(
                'text-sm font-semibold leading-tight',
                status === 'idle' ? 'text-slate-600' : 'text-slate-100'
              )}>
                {label}
              </p>
              <StatusIcon status={status} />
            </div>
            <p className={clsx(
              'text-xs mt-0.5',
              status === 'processing' ? 'text-violet-400' :
              status === 'complete' ? 'text-emerald-400/80' :
              'text-slate-600'
            )}>
              {detail || NODE_DESCRIPTIONS[nodeId]}
            </p>
          </div>
        </div>

        {/* Step number */}
        <div className={clsx(
          'absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center',
          status === 'idle' ? 'bg-[#0a0a1e] text-slate-600 border border-white/10' :
          status === 'processing' ? 'bg-violet-600 text-white' :
          status === 'complete' ? 'bg-emerald-600 text-white' :
          'bg-red-600 text-white'
        )}>
          {index + 1}
        </div>
      </motion.div>

      {/* Connector line */}
      {!isLast && (
        <div className={clsx(
          'w-0.5 h-6 my-1 rounded-full transition-all duration-500',
          status === 'complete' ? 'bg-gradient-to-b from-emerald-500/70 to-violet-500/40' :
          status === 'processing' ? 'bg-violet-500/50 pipeline-line-active' :
          'bg-white/5'
        )} />
      )}
    </div>
  )
}

export { NODE_ICONS, NODE_DESCRIPTIONS }
