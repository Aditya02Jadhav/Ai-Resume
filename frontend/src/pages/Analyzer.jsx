import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Briefcase, Shield,
  Target, AlertCircle, CheckCircle2, Sparkles, Mail
} from 'lucide-react'
import Sidebar from '../components/Sidebar'
import GraphVisualizer from '../components/GraphVisualizer'
import ResumeUploader from '../components/ResumeUploader'
import ScoreRadar from '../components/ScoreRadar'
import CritiquePanel from '../components/CritiquePanel'
import { useAnalyzer } from '../contexts/AnalyzerContext'

const API_BASE = 'http://localhost:8000'
const NODE_SEQUENCE = ['parser_node', 'scoring_node', 'critique_node', 'finalizer_node']

function GradeBadge({ grade, score }) {
  return (
    <div className="flex items-center gap-6">
      <div className={`grade-${grade} w-24 h-24 rounded-2xl flex flex-col items-center justify-center shadow-xl`}>
        <span className="text-4xl font-black text-white">{grade}</span>
      </div>
      <div>
        <p className="text-5xl font-black text-slate-900 dark:text-white leading-tight">
          {score}<span className="text-2xl text-slate-400 dark:text-slate-500 font-normal">/100</span>
        </p>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">Overall Resume Score</p>
      </div>
    </div>
  )
}

function InfoChip({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 shadow-sm">
      <div className="text-violet-600 dark:text-violet-400">{icon}</div>
      <div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">{label}</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  )
}

function KeywordPills({ keywords, type }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {keywords.slice(0, 12).map((kw, i) => (
        <span
          key={i}
          className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
            type === 'matched'
              ? 'bg-emerald-100 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-red-100 dark:bg-red-500/10 border-red-300 dark:border-red-500/20 text-red-700 dark:text-red-300'
          }`}
        >
          {kw}
        </span>
      ))}
    </div>
  )
}

export default function Analyzer() {
  const {
    report, setReport,
    resumeText, setResumeText,
    jobDescription, setJobDescription,
    nodeStatuses, setNodeStatuses,
    nodeDetails, setNodeDetails,
    appState, setAppState,
    history, setHistory,
    historyReports, setHistoryReports
  } = useAnalyzer()

  const [resumeFile, setResumeFile] = useState(null)
  const [error, setError] = useState(null)
  const [activeHistoryId, setActiveHistoryId] = useState(null)
  const [activeTab, setActiveTab] = useState('scores')
  const abortRef = useRef(null)

  const resetNodeStates = () => {
    const initial = {}
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

      const reader = response.body.getReader()
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
          } catch (err) { /* skip malformed */ }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Connection failed. Is the backend running?')
        setAppState('error')
      }
    }
  }, [resumeText, jobDescription, resumeFile])

  const handleSSEEvent = (evt) => {
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
        const r = evt.report
        setReport(r)
        setAppState('done')
        const id = crypto.randomUUID()
        const histItem = {
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

  const handleSelectHistory = (id) => {
    setActiveHistoryId(id)
    const r = historyReports[id]
    if (r) {
      setReport(r)
      setAppState('done')
      const final = {}
      NODE_SEQUENCE.forEach(n => (final[n] = 'complete'))
      setNodeStatuses(final)
    }
  }

  const handleDeleteHistory = (id) => {
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
    <div className="flex relative z-10 bg-white dark:bg-slate-900 min-h-screen transition-colors duration-300">
      {/* Sidebar */}
      <Sidebar
        history={history}
        activeId={activeHistoryId}
        onSelect={handleSelectHistory}
        onDelete={handleDeleteHistory}
      />

      {/* Main content */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-950/50 transition-colors duration-300">
        <div className="w-full px-8 py-10">

          {/* Page header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-3"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-500" />
              <span>Agentic AI · LangGraph Pipeline · Gemini Flash</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: -8 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.05 }}
              className="text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            >
              Resume Analyser
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
              className="text-slate-600 dark:text-slate-400 text-sm mt-1"
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
                <h2 className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-semibold mb-3 flex items-center gap-1.5">
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
                    className="bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/30 p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700 dark:text-red-300">Analysis Failed</p>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">{error}</p>
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
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-white/10 p-8 shadow-xl">
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <GradeBadge grade={report.grade} score={report.overall_score} />
                        <div className="text-right">
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Candidate</p>
                          <p className="text-lg font-bold text-slate-900 dark:text-white">{report.candidate}</p>
                          <div className="mt-2 inline-flex items-center gap-1.5 bg-violet-100 dark:bg-violet-500/10 border border-violet-300 dark:border-violet-500/20 rounded-full px-3 py-1">
                            <Target className="w-3 h-3 text-violet-600 dark:text-violet-400" />
                            <span className="text-xs font-semibold text-violet-700 dark:text-violet-300">{report.hire_likelihood}</span>
                          </div>
                        </div>
                      </div>

                      {/* Executive summary */}
                      <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-xl p-5 mb-6">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 font-bold font-sans">Executive Summary</p>
                        <p className="text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{report.executive_summary}</p>
                      </div>

                      {/* Strength / Fix chips */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-500/20 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2 opacity-5">
                             <CheckCircle2 size={40} className="text-emerald-500" />
                          </div>
                          <div className="flex items-center gap-2 mb-2 relative z-10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Top Strength</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-snug relative z-10">{report.top_strength}</p>
                        </div>
                        <div className="bg-amber-50 dark:bg-amber-500/5 rounded-2xl p-5 border border-amber-200 dark:border-amber-500/20 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-2 opacity-10">
                             <AlertCircle size={40} className="text-amber-500" />
                          </div>
                          <div className="flex items-center gap-2 mb-2 relative z-10">
                            <AlertCircle className="w-4 h-4 text-amber-500 font-bold" />
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Critical Fix</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-200 font-bold leading-snug relative z-10">{report.critical_fix}</p>
                        </div>
                      </div>
                    </div>

                    {/* Parsed resume summary */}
                    {report.parsed_resume && (
                      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                             <User className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                          </div>
                          Parsed Candidate Profile
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {report.parsed_resume.email && (
                            <InfoChip icon={<Mail className="w-4 h-4" />} label="Email" value={report.parsed_resume.email} />
                          )}
                          {report.parsed_resume.location && (
                            <InfoChip icon={<Target className="w-4 h-4" />} label="Location" value={report.parsed_resume.location} />
                          )}
                          {report.parsed_resume.total_years_experience != null && (
                            <InfoChip icon={<Briefcase className="w-4 h-4" />} label="Experience" value={`${report.parsed_resume.total_years_experience} years`} />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Tabs: Scores / Critique / Keywords */}
                    <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl">
                      <div className="flex border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/30">
                        {(['scores', 'critique', 'keywords']).map(tab => (
                          <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                              activeTab === tab
                                ? 'text-violet-600 dark:text-violet-400 bg-white dark:bg-violet-500/10 border-b-2 border-violet-600 dark:border-violet-500'
                                : 'text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300'
                            }`}
                          >
                            {tab === 'scores' ? '📊 Fit Summary' : tab === 'critique' ? '🔍 Expert Critique' : '🔑 Key Gaps'}
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
                                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2.5 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Matched Keywords
                                </p>
                                <KeywordPills keywords={report.scores?.matched_keywords ?? []} type="matched" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2.5 flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5" /> Missing Keywords
                                </p>
                                <KeywordPills keywords={report.scores?.missing_keywords ?? []} type="missing" />
                              </div>
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
              <h2 className="text-xs text-slate-600 dark:text-slate-400 uppercase tracking-widest font-semibold flex items-center gap-1.5">
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
                      className="mt-4 bg-white dark:bg-slate-900/50 rounded-xl p-4 border border-slate-200 dark:border-white/5 text-center shadow-sm"
                    >
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Fill in the resume and job description, then click <span className="text-violet-600 dark:text-violet-400 font-semibold">Analyse Resume</span> to watch the agents run.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
