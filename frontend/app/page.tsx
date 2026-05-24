'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Briefcase, Award, TrendingUp, Target, Shield,
  ChevronRight, Star, AlertCircle, CheckCircle2, Sparkles
} from 'lucide-react'
import Sidebar, { HistoryItem } from '@/components/Sidebar'
import GraphVisualizer from '@/components/GraphVisualizer'
import ResumeUploader from '@/components/ResumeUploader'
import ScoreRadar from '@/components/ScoreRadar'
import CritiquePanel from '@/components/CritiquePanel'
import { NodeStatus } from '@/components/NodeCard'

const API_BASE = 'http://localhost:8000'
const NODE_SEQUENCE = ['parser_node', 'scoring_node', 'critique_node', 'finalizer_node']

type AppState = 'idle' | 'running' | 'done' | 'error'

interface FinalReport {
  candidate: string
  grade: string
  overall_score: number
  scores: Record<string, number>
  parsed_resume: Record<string, any>
  critique: Record<string, any>
  executive_summary: string
  hire_likelihood: string
  top_strength: string
  critical_fix: string
}

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`grade-${grade} w-20 h-20 rounded-2xl flex flex-col items-center justify-center shadow-2xl`}>
        <span className="text-3xl font-black text-white">{grade}</span>
      </div>
      <div>
        <p className="text-4xl font-black text-white">{score}<span className="text-xl text-slate-400 font-normal">/100</span></p>
        <p className="text-sm text-slate-400 mt-1">Overall Score</p>
      </div>
    </div>
  )
}

function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-2.5">
      <div className="text-violet-400">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-600 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-200">{value}</p>
      </div>
    </div>
  )
}

function KeywordPills({ keywords, type }: { keywords: string[]; type: 'matched' | 'missing' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.slice(0, 12).map((kw, i) => (
        <span
          key={i}
          className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
            type === 'matched'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {kw}
        </span>
      ))}
    </div>
  )
}

export default function Home() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [appState, setAppState] = useState<AppState>('idle')
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({})
  const [nodeDetails, setNodeDetails] = useState<Record<string, string>>({})
  const [report, setReport] = useState<FinalReport | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null)
  const [historyReports, setHistoryReports] = useState<Record<string, FinalReport>>({})
  const [activeTab, setActiveTab] = useState<'scores' | 'critique' | 'keywords'>('scores')
  const abortRef = useRef<AbortController | null>(null)

  const resetNodeStates = () => {
    const initial: Record<string, NodeStatus> = {}
    NODE_SEQUENCE.forEach(n => (initial[n] = 'idle'))
    setNodeStatuses(initial)
    setNodeDetails({})
  }

  const handleAnalyze = useCallback(async () => {
    setAppState('running')
    setReport(null)
    setError(null)
    resetNodeStates()

    abortRef.current = new AbortController()

    const formData = new FormData()
    formData.append('job_description', jobDescription)

    if (resumeFile) {
      formData.append('resume_file', resumeFile)
    } else {
      formData.append('resume_text', resumeText)
    }

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        body: formData,
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Server error' }))
        throw new Error(err.detail || 'Analysis failed')
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const evt = JSON.parse(line.slice(6))
            handleSSEEvent(evt)
          } catch { /* skip malformed */ }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Connection failed. Is the backend running?')
        setAppState('error')
      }
    }
  }, [resumeText, jobDescription, resumeFile])

  const handleSSEEvent = (evt: Record<string, any>) => {
    switch (evt.event) {
      case 'node_start':
        setNodeStatuses(prev => ({ ...prev, [evt.node]: 'processing' }))
        break

      case 'node_complete':
        setNodeStatuses(prev => ({ ...prev, [evt.node]: 'complete' }))
        if (evt.node === 'parser_node' && evt.candidate) {
          setNodeDetails(prev => ({ ...prev, parser_node: `Found: ${evt.candidate}` }))
        }
        if (evt.node === 'scoring_node' && evt.overall_fit !== undefined) {
          setNodeDetails(prev => ({ ...prev, scoring_node: `Overall fit: ${evt.overall_fit}/100` }))
        }
        if (evt.node === 'critique_node' && evt.issues_found !== undefined) {
          setNodeDetails(prev => ({ ...prev, critique_node: `${evt.issues_found} gaps identified` }))
        }
        if (evt.node === 'finalizer_node' && evt.grade) {
          setNodeDetails(prev => ({ ...prev, finalizer_node: `Grade: ${evt.grade}` }))
        }
        break

      case 'node_error':
        setNodeStatuses(prev => ({ ...prev, [evt.node]: 'error' }))
        break

      case 'pipeline_complete': {
        const r: FinalReport = evt.report
        setReport(r)
        setAppState('done')
        const id = crypto.randomUUID()
        const histItem: HistoryItem = {
          id,
          candidate: r.candidate,
          grade: r.grade,
          overallScore: r.overall_score,
          timestamp: new Date(),
          jobTitle: jobDescription.split('\n')[0].slice(0, 40),
        }
        setHistory(prev => [histItem, ...prev])
        setHistoryReports(prev => ({ ...prev, [id]: r }))
        setActiveHistoryId(id)
        break
      }

      case 'pipeline_error':
        setError(evt.error)
        setAppState('error')
        break
    }
  }

  const handleSelectHistory = (id: string) => {
    setActiveHistoryId(id)
    const r = historyReports[id]
    if (r) {
      setReport(r)
      setAppState('done')
      const final: Record<string, NodeStatus> = {}
      NODE_SEQUENCE.forEach(n => (final[n] = 'complete'))
      setNodeStatuses(final)
    }
  }

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id))
    setHistoryReports(prev => { const n = { ...prev }; delete n[id]; return n })
    if (activeHistoryId === id) {
      setActiveHistoryId(null)
      setReport(null)
      setAppState('idle')
    }
  }

  const isRunning = appState === 'running'

  return (
    <div className="flex h-screen overflow-hidden relative z-10">
      {/* Sidebar */}
      <Sidebar
        history={history}
        activeId={activeHistoryId}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Page header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs text-slate-600 mb-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span>Agentic AI · LangGraph Pipeline · Gemini Flash</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl font-black text-white tracking-tight glow-text"
            >
              Resume Analyser
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-slate-500 text-sm mt-1"
            >
              Upload your resume and job description. Watch the AI agents work in real time.
            </motion.p>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

            {/* LEFT: Uploader + Results */}
            <div className="space-y-6">

              {/* Upload zone */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
                  <span className="w-1 h-3.5 bg-violet-500 rounded-full inline-block" />
                  Analysis Zone
                </h2>
                <ResumeUploader
                  resumeText={resumeText}
                  setResumeText={setResumeText}
                  jobDescription={jobDescription}
                  setJobDescription={setJobDescription}
                  resumeFile={resumeFile}
                  setResumeFile={setResumeFile}
                  onAnalyze={handleAnalyze}
                  isLoading={isRunning}
                />
              </motion.div>

              {/* Error state */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="glass rounded-2xl border border-red-500/30 p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">Analysis Failed</p>
                      <p className="text-xs text-slate-400 mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results */}
              <AnimatePresence>
                {report && appState === 'done' && (
                  <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="space-y-5"
                  >
                    {/* Report card */}
                    <div className="glass rounded-2xl border border-white/8 p-6">
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <GradeBadge grade={report.grade} score={report.overall_score} />
                        <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1">Candidate</p>
                          <p className="text-lg font-bold text-slate-100">{report.candidate}</p>
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
                            <Target className="w-3 h-3 text-violet-400" />
                            <span className="text-xs font-semibold text-violet-300">{report.hire_likelihood}</span>
                          </div>
                        </div>
                      </div>

                      {/* Executive summary */}
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-5">
                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Executive Summary</p>
                        <p className="text-sm text-slate-300 leading-relaxed">{report.executive_summary}</p>
                      </div>

                      {/* Strength / Fix chips */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="glass rounded-xl p-3.5 border border-emerald-500/20">
                          <div className="flex items-center gap-2 mb-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400">Top Strength</span>
                          </div>
                          <p className="text-sm text-slate-300">{report.top_strength}</p>
                        </div>
                        <div className="glass rounded-xl p-3.5 border border-amber-500/20">
                          <div className="flex items-center gap-2 mb-1.5">
                            <AlertCircle className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-400">Critical Fix</span>
                          </div>
                          <p className="text-sm text-slate-300">{report.critical_fix}</p>
                        </div>
                      </div>
                    </div>

                    {/* Parsed resume summary */}
                    {report.parsed_resume && (
                      <div className="glass rounded-2xl border border-white/5 p-5">
                        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                          <User className="w-4 h-4 text-violet-400" /> Parsed Profile
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {report.parsed_resume.email && (
                            <InfoChip icon={<Shield className="w-3.5 h-3.5" />} label="Email" value={report.parsed_resume.email} />
                          )}
                          {report.parsed_resume.location && (
                            <InfoChip icon={<Target className="w-3.5 h-3.5" />} label="Location" value={report.parsed_resume.location} />
                          )}
                          {report.parsed_resume.total_years_experience != null && (
                            <InfoChip icon={<Briefcase className="w-3.5 h-3.5" />} label="Experience" value={`${report.parsed_resume.total_years_experience} years`} />
                          )}
                        </div>
                        {report.parsed_resume.skills?.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-slate-500 mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                              {report.parsed_resume.skills.slice(0, 16).map((s: string, i: number) => (
                                <span key={i} className="text-xs bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2.5 py-1 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tabs: Scores / Critique / Keywords */}
                    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                      <div className="flex border-b border-white/5">
                        {(['scores', 'critique', 'keywords'] as const).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-3 text-xs font-semibold capitalize transition-colors ${
                              activeTab === tab
                                ? 'text-violet-400 bg-violet-500/10 border-b-2 border-violet-500'
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {tab === 'scores' ? '📊 Scores' : tab === 'critique' ? '🔍 Critique' : '🔑 Keywords'}
                          </button>
                        ))}
                      </div>
                      <div className="p-5">
                        <AnimatePresence mode="wait">
                          {activeTab === 'scores' && (
                            <motion.div key="scores" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <ScoreRadar scores={report.scores} />
                            </motion.div>
                          )}
                          {activeTab === 'critique' && (
                            <motion.div key="critique" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                              <CritiquePanel critique={report.critique} />
                            </motion.div>
                          )}
                          {activeTab === 'keywords' && (
                            <motion.div key="keywords" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                              className="space-y-5">
                              <div>
                                <p className="text-xs font-semibold text-emerald-400 mb-2.5 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Matched Keywords
                                </p>
                                <KeywordPills keywords={report.scores?.matched_keywords ?? []} type="matched" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-red-400 mb-2.5 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" /> Missing Keywords
                                </p>
                                <KeywordPills keywords={report.scores?.missing_keywords ?? []} type="missing" />
                              </div>
                              {report.scores?.scoring_rationale && (
                                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5">
                                  <p className="text-xs text-slate-400 leading-relaxed">{report.scores.scoring_rationale}</p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* RIGHT: Graph Visualizer */}
            <div className="space-y-4">
              <h2 className="text-xs text-slate-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                <span className="w-1 h-3.5 bg-cyan-500 rounded-full inline-block" />
                Agent Pipeline
              </h2>
              <div className="sticky top-8">
                <GraphVisualizer
                  nodeStatuses={nodeStatuses}
                  nodeDetails={nodeDetails}
                  isRunning={isRunning}
                />

                {/* Idle hint */}
                <AnimatePresence>
                  {appState === 'idle' && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="mt-4 glass rounded-xl p-4 border border-white/5 text-center"
                    >
                      <Star className="w-5 h-5 text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Fill in the resume and job description, then click <span className="text-violet-400 font-medium">Analyse Resume</span> to watch the agents run.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Node legend */}
                <div className="mt-4 glass rounded-xl p-4 border border-white/5">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-3">Node States</p>
                  <div className="space-y-2">
                    {[
                      { color: 'bg-slate-700', label: 'Idle' },
                      { color: 'bg-violet-500 animate-pulse', label: 'Processing' },
                      { color: 'bg-emerald-500', label: 'Complete' },
                      { color: 'bg-red-500', label: 'Error' },
                    ].map(s => (
                      <div key={s.label} className="flex items-center gap-2.5">
                        <div className={`w-2 h-2 rounded-full ${s.color}`} />
                        <span className="text-xs text-slate-500">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
