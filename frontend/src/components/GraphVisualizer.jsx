import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Zap } from 'lucide-react'
import NodeCard from './NodeCard'

const NODES = [
  { id: 'parser_node', label: 'Resume Parser' },
  { id: 'scoring_node', label: 'ATS Scorer' },
  { id: 'critique_node', label: 'AI Critique' },
  { id: 'finalizer_node', label: 'Report Builder' },
]

export default function GraphVisualizer({ nodeStatuses, nodeDetails, isRunning }) {
  const completedCount = Object.values(nodeStatuses).filter(s => s === 'complete').length
  const progress = (completedCount / NODES.length) * 100

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isRunning ? 'bg-violet-600/10 dark:bg-violet-500/20' : 'bg-slate-100 dark:bg-white/5'}`}>
            <Cpu className={`w-5 h-5 ${isRunning ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-600'}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">Agent Workflow</h3>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              {isRunning ? 'Processing...' : completedCount > 0 ? `${completedCount}/${NODES.length} nodes complete` : 'Ready to begin'}
            </p>
          </div>
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 scale-90 sm:scale-100">
            <Zap className="w-3 h-3 text-amber-500 animate-pulse fill-amber-500" />
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-black uppercase">Live</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* Nodes */}
      <div className="space-y-0">
        {NODES.map((node, i) => (
          <NodeCard
            key={node.id}
            nodeId={node.id}
            label={node.label}
            status={nodeStatuses[node.id] || 'idle'}
            detail={nodeDetails[node.id]}
            index={i}
            isLast={i === NODES.length - 1}
          />
        ))}
      </div>

      {/* Agent flow legend */}
      <AnimatePresence>
        {completedCount === NODES.length && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
              ✓ All nodes completed successfully
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
