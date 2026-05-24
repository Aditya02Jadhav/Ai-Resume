import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-2xl transition-colors duration-300">
        <p className="text-violet-600 dark:text-violet-300 font-black text-[10px] uppercase tracking-widest mb-1">{payload[0].payload.subject}</p>
        <p className="text-slate-900 dark:text-white font-black text-xl">{payload[0].value}<span className="text-slate-400 text-sm ml-0.5">/100</span></p>
      </div>
    )
  }
  return null
}

function ScoreBar({ label, value, color }) {
  return (
    <div className="space-y-2 w-full">
      <div className="flex justify-between items-center px-1">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{label}</span>
        <span className="text-xs font-black text-slate-900 dark:text-slate-200">{value}%</span>
      </div>
      <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full shadow-sm"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

export default function ScoreRadar({ scores }) {
  const data = [
    { subject: 'ATS Fit', value: scores.ats_compatibility ?? 0 },
    { subject: 'Keywords', value: scores.keyword_match ?? 0 },
    { subject: 'Experience', value: scores.experience_relevance ?? 0 },
    { subject: 'Format', value: scores.format_quality ?? 0 },
    { subject: 'Overall', value: scores.overall_fit ?? 0 },
  ]

  return (
    <div className="space-y-6 w-full">
      {/* Radar */}
      <div className="h-60 w-full bg-slate-50/50 dark:bg-white/[0.02] rounded-3xl p-2 border border-slate-100 dark:border-transparent mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <PolarGrid
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              className="dark:stroke-slate-700 opacity-30 px-10"
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800, textTransform: 'uppercase' }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.15}
              strokeWidth={3}
              animationDuration={1500}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#7c3aed', strokeWidth: 1 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score bars */}
      <div className="space-y-4 px-1">
        <ScoreBar label="ATS Compatibility" value={scores.ats_compatibility ?? 0} color="linear-gradient(90deg, #7c3aed, #a78bfa)" />
        <ScoreBar label="Keyword Relevance" value={scores.keyword_match ?? 0} color="linear-gradient(90deg, #06b6d4, #67e8f9)" />
        <ScoreBar label="Experience Depth" value={scores.experience_relevance ?? 0} color="linear-gradient(90deg, #10b981, #34d399)" />
        <ScoreBar label="Formatting Pro" value={scores.format_quality ?? 0} color="linear-gradient(90deg, #f59e0b, #fcd34d)" />
        <ScoreBar label="Overall Pipeline Fit" value={scores.overall_fit ?? 0} color="linear-gradient(90deg, #8b5cf6, #06b6d4)" />
      </div>
    </div>
  )
}
