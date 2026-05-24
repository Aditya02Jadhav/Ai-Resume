'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Bot, Zap, BarChart, ChevronDown, ChevronRight, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

interface Gap { gap: string; severity: 'high' | 'medium' | 'low'; suggestion: string }
interface AiPhrase { phrase: string; reason: string; replacement: string }
interface WeakVerb { original: string; replacement: string }
interface QuantGap { bullet: string; suggestion: string }
interface Improvement { priority: number; action: string; impact: string }

interface Critique {
  semantic_gaps?: Gap[]
  ai_phrasing_flags?: AiPhrase[]
  weak_verbs?: WeakVerb[]
  quantification_gaps?: QuantGap[]
  top_improvements?: Improvement[]
  overall_critique?: string
}

interface CritiquePanelProps {
  critique: Critique
}

const severityColor: Record<string, string> = {
  high: 'text-red-400 bg-red-500/10 border-red-500/20',
  medium: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  low: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
}

function Section({ icon, title, count, color, children }: {
  icon: React.ReactNode
  title: string
  count: number
  color: string
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(true)
  return (
    <div className={clsx('rounded-xl border overflow-hidden', color)}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          {icon}
          <span className="text-sm font-semibold text-slate-200">{title}</span>
          <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded-full">{count}</span>
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>
      <AnimatePresence>
        {open && count > 0 && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2.5">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CritiquePanel({ critique }: CritiquePanelProps) {
  const gaps = critique.semantic_gaps ?? []
  const aiFlags = critique.ai_phrasing_flags ?? []
  const weakVerbs = critique.weak_verbs ?? []
  const quantGaps = critique.quantification_gaps ?? []
  const improvements = critique.top_improvements ?? []

  return (
    <div className="space-y-3">
      {/* Overall critique */}
      {critique.overall_critique && (
        <div className="glass rounded-xl p-4 border border-white/5">
          <p className="text-sm text-slate-300 leading-relaxed italic">
            &ldquo;{critique.overall_critique}&rdquo;
          </p>
        </div>
      )}

      {/* Priority improvements */}
      {improvements.length > 0 && (
        <div className="glass rounded-xl border border-violet-500/20 overflow-hidden">
          <div className="px-4 py-3 border-b border-violet-500/10 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-slate-200">Priority Actions</span>
          </div>
          <div className="p-4 space-y-3">
            {improvements.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {item.priority}
                </div>
                <div>
                  <p className="text-sm text-slate-200 font-medium">{item.action}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.impact}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Semantic gaps */}
      <Section
        icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        title="Semantic Gaps"
        count={gaps.length}
        color="border-amber-500/20 bg-amber-500/[0.03]"
      >
        {gaps.map((g, i) => (
          <div key={i} className="bg-white/[0.03] rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize', severityColor[g.severity])}>
                {g.severity}
              </span>
              <p className="text-sm text-slate-300">{g.gap}</p>
            </div>
            <div className="flex items-start gap-2 text-xs text-emerald-400/80">
              <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{g.suggestion}</span>
            </div>
          </div>
        ))}
      </Section>

      {/* AI phrasing */}
      <Section
        icon={<Bot className="w-4 h-4 text-blue-400" />}
        title="AI-Generated Phrasing"
        count={aiFlags.length}
        color="border-blue-500/20 bg-blue-500/[0.03]"
      >
        {aiFlags.map((f, i) => (
          <div key={i} className="bg-white/[0.03] rounded-lg p-3 space-y-2">
            <p className="text-xs text-slate-500 line-through">&ldquo;{f.phrase}&rdquo;</p>
            <p className="text-xs text-slate-400 italic">{f.reason}</p>
            <div className="flex items-center gap-2 text-xs text-emerald-400/80 font-medium">
              <ArrowRight className="w-3 h-3 flex-shrink-0" />
              &ldquo;{f.replacement}&rdquo;
            </div>
          </div>
        ))}
      </Section>

      {/* Quantification gaps */}
      <Section
        icon={<BarChart className="w-4 h-4 text-cyan-400" />}
        title="Missing Quantification"
        count={quantGaps.length}
        color="border-cyan-500/20 bg-cyan-500/[0.03]"
      >
        {quantGaps.map((q, i) => (
          <div key={i} className="bg-white/[0.03] rounded-lg p-3 space-y-1.5">
            <p className="text-xs text-slate-500 line-through">{q.bullet}</p>
            <div className="flex items-start gap-2 text-xs text-cyan-400/80">
              <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{q.suggestion}</span>
            </div>
          </div>
        ))}
      </Section>
    </div>
  )
}
