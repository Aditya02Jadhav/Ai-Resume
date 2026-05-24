'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, Clipboard, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

interface ResumeUploaderProps {
  resumeText: string
  setResumeText: (t: string) => void
  jobDescription: string
  setJobDescription: (t: string) => void
  resumeFile: File | null
  setResumeFile: (f: File | null) => void
  onAnalyze: () => void
  isLoading: boolean
}

export default function ResumeUploader({
  resumeText, setResumeText,
  jobDescription, setJobDescription,
  resumeFile, setResumeFile,
  onAnalyze, isLoading,
}: ResumeUploaderProps) {
  const [inputMode, setInputMode] = useState<'upload' | 'paste'>('upload')
  const [jdExpanded, setJdExpanded] = useState(true)

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) {
      setResumeFile(accepted[0])
      setResumeText('')
    }
  }, [setResumeFile, setResumeText])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'] },
    maxFiles: 1,
    disabled: isLoading,
  })

  const canAnalyze = (resumeText.trim() || resumeFile) && jobDescription.trim() && !isLoading

  return (
    <div className="space-y-4">
      {/* Resume input */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex border-b border-white/5">
          <button
            onClick={() => setInputMode('upload')}
            className={clsx(
              'flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors',
              inputMode === 'upload' ? 'text-violet-400 bg-violet-500/10' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>
          <button
            onClick={() => setInputMode('paste')}
            className={clsx(
              'flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-2 transition-colors',
              inputMode === 'paste' ? 'text-violet-400 bg-violet-500/10' : 'text-slate-500 hover:text-slate-300'
            )}
          >
            <Clipboard className="w-3.5 h-3.5" /> Paste Text
          </button>
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            {inputMode === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <div
                  {...getRootProps()}
                  className={clsx(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300',
                    isDragActive
                      ? 'border-violet-500 bg-violet-500/10'
                      : resumeFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5'
                  )}
                >
                  <input {...getInputProps()} />
                  {resumeFile ? (
                    <div>
                      <FileText className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                      <p className="text-sm text-emerald-400 font-medium">{resumeFile.name}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {(resumeFile.size / 1024).toFixed(1)} KB · Click to replace
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); setResumeFile(null); }}
                        className="mt-2 text-xs text-red-400/70 hover:text-red-400 flex items-center gap-1 mx-auto"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 font-medium">
                        {isDragActive ? 'Drop your resume here' : 'Drag & drop or click to upload'}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">PDF or TXT · Max 10MB</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="paste"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <textarea
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  rows={10}
                  disabled={isLoading}
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500/50 transition-colors font-mono"
                />
                <p className="text-xs text-slate-600 mt-1">{resumeText.length} characters</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Job Description */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden">
        <button
          onClick={() => setJdExpanded(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-200 hover:text-white transition-colors"
        >
          <span>Job Description</span>
          <ChevronDown className={clsx('w-4 h-4 text-slate-500 transition-transform', jdExpanded && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {jdExpanded && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4">
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  rows={8}
                  disabled={isLoading}
                  className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Analyze button */}
      <motion.button
        onClick={onAnalyze}
        disabled={!canAnalyze}
        whileTap={{ scale: 0.97 }}
        className="btn-primary w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analysing...
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Analyse Resume
          </>
        )}
      </motion.button>
    </div>
  )
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}
