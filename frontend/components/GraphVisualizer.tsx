'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Zap } from 'lucide-react'
import NodeCard, { NodeStatus } from './NodeCard'

const NODES = [
  { id: 'parser_node', label: 'Resume Parser' },
  { id: 'scoring_node', label: 'ATS Scorer' },
  { id: 'critique_node', label: 'AI Critique' },
  { id: 'finalizer_node', label: 'Report Builder' },
]

interface GraphVisualizerProps {
  nodeStatuses: Record<string, NodeStatus>
  nodeDetails: Record<string, string>
  isRunning: boolean
}

export default function GraphVisualizer({ nodeStatuses, nodeDetails, isRunning }: GraphVisualizerProps) {
  const completedCount = Object.values(nodeStatuses).filter(s => s === 'complete').length
  const progress = (completedCount / NODES.length) * 100

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRunning ? 'bg-violet-500/20' : 'bg-white/5'}`}>
            <Cpu className={`w-4 h-4 ${isRunning ? 'text-violet-400' : 'text-slate-600'}`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">LangGraph Pipeline</h3>
            <p className="text-[11px] text-slate-500">
              {isRunning ? 'Processing...' : completedCount > 0 ? `${completedCount}/${NODES.length} nodes complete` : 'Ready to run'}
            </p>
          </div>
        </div>
        {isRunning && (
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs text-amber-400 font-medium">Live</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-5 h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full score-bar-fill rounded-full"
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
            <span className="text-xs text-emerald-400 font-medium">
              ✓ All nodes completed successfully
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
