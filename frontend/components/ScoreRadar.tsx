'use client'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { motion } from 'framer-motion'

interface ScoreRadarProps {
  scores: {
    ats_compatibility?: number
    keyword_match?: number
    experience_relevance?: number
    format_quality?: number
    overall_fit?: number
  }
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass border border-white/10 rounded-xl px-3 py-2 text-xs">
        <p className="text-violet-300 font-semibold">{payload[0].payload.subject}</p>
        <p className="text-white font-bold text-base">{payload[0].value}<span className="text-slate-400 text-xs">/100</span></p>
      </div>
    )
  }
  return null
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-bold text-slate-200">{value}</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  )
}

export default function ScoreRadar({ scores }: ScoreRadarProps) {
  const data = [
    { subject: 'ATS', value: scores.ats_compatibility ?? 0, fullMark: 100 },
    { subject: 'Keywords', value: scores.keyword_match ?? 0, fullMark: 100 },
    { subject: 'Experience', value: scores.experience_relevance ?? 0, fullMark: 100 },
    { subject: 'Format', value: scores.format_quality ?? 0, fullMark: 100 },
    { subject: 'Overall Fit', value: scores.overall_fit ?? 0, fullMark: 100 },
  ]

  return (
    <div className="space-y-5">
      {/* Radar */}
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
            <PolarGrid
              stroke="rgba(255,255,255,0.06)"
              radialLines
            />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Inter' }}
            />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Score bars */}
      <div className="space-y-3 px-1">
        <ScoreBar label="ATS Compatibility" value={scores.ats_compatibility ?? 0} color="linear-gradient(90deg, #7c3aed, #a78bfa)" />
        <ScoreBar label="Keyword Match" value={scores.keyword_match ?? 0} color="linear-gradient(90deg, #06b6d4, #67e8f9)" />
        <ScoreBar label="Experience Relevance" value={scores.experience_relevance ?? 0} color="linear-gradient(90deg, #10b981, #34d399)" />
        <ScoreBar label="Format Quality" value={scores.format_quality ?? 0} color="linear-gradient(90deg, #f59e0b, #fcd34d)" />
        <ScoreBar label="Overall Fit" value={scores.overall_fit ?? 0} color="linear-gradient(90deg, #8b5cf6, #06b6d4)" />
      </div>
    </div>
  )
}
