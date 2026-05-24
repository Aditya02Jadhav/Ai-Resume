import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, Clipboard, ChevronDown, Zap } from 'lucide-react'
import clsx from 'clsx'

export default function ResumeUploader({
  resumeText, setResumeText,
  jobDescription, setJobDescription,
  resumeFile, setResumeFile,
  onAnalyze, isLoading,
}) {
  const [inputMode, setInputMode] = useState('upload')
  const [jdExpanded, setJdExpanded] = useState(true)

  const onDrop = useCallback((accepted) => {
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

  const canAnalyze = (resumeText.trim() || resumeFile) && !isLoading

  return (
    <div className="space-y-5">
      {/* Resume input */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl transition-all duration-300">
        <div className="flex border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/30">
          <button
            onClick={() => setInputMode('upload')}
            className={clsx(
              'flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
              inputMode === 'upload' ? 'text-violet-600 dark:text-violet-400 bg-white dark:bg-violet-500/10' : 'text-black dark:text-white hover:text-violet-600 dark:hover:text-violet-400'
            )}
          >
            <Upload className="w-4 h-4" /> Upload
          </button>
          <button
            onClick={() => setInputMode('paste')}
            className={clsx(
              'flex-1 py-4 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all',
              inputMode === 'paste' ? 'text-violet-600 dark:text-violet-400 bg-white dark:bg-violet-500/10' : 'text-black dark:text-white hover:text-violet-600 dark:hover:text-violet-400'
            )}
          >
            <Clipboard className="w-4 h-4" /> Paste
          </button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {inputMode === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                <div
                  {...getRootProps()}
                  className={clsx(
                    'border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300',
                    isDragActive
                      ? 'border-violet-600 bg-violet-600/5 dark:bg-violet-500/10'
                      : resumeFile
                      ? 'border-emerald-500/50 bg-emerald-500/5'
                      : 'border-slate-200 dark:border-white/10 hover:border-violet-600/30 dark:hover:border-violet-500/40 hover:bg-slate-50 dark:hover:bg-violet-500/5'
                  )}
                >
                  <input {...getInputProps()} />
                  {resumeFile ? (
                    <div>
                      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                         <FileText className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-base text-black dark:text-white font-bold tracking-tight">{resumeFile.name}</p>
                      <p className="text-[11px] text-black dark:text-white mt-1 font-semibold uppercase tracking-widest opacity-60">
                        {(resumeFile.size / 1024).toFixed(1)} KB · Click to replace
                      </p>
                      <button
                        onClick={e => { e.stopPropagation(); setResumeFile(null); }}
                        className="mt-4 px-3 py-1.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-200 transition-colors mx-auto flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110">
                         <Upload className="w-8 h-8 text-black dark:text-white" />
                      </div>
                      <p className="text-base text-black dark:text-white font-black tracking-tight">
                        {isDragActive ? 'Drop it here!' : 'Drop resume or click to browse'}
                      </p>
                      <p className="text-[11px] text-black dark:text-white mt-1 font-bold uppercase tracking-widest opacity-50">PDF or TXT · Max 10MB</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="paste"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                <textarea
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                  placeholder="Paste your professional experience here..."
                  rows={10}
                  disabled={isLoading}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm text-black dark:text-white placeholder-black/40 dark:placeholder-white/30 resize-none focus:outline-none focus:border-violet-600/30 dark:focus:border-violet-500/50 transition-colors font-mono font-medium shadow-inner"
                />
                <div className="flex justify-between mt-2 px-1">
                   <p className="text-[10px] text-black dark:text-white font-bold uppercase tracking-widest">{resumeText.length} characters</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Job Description */}
      <div className="bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-xl transition-all duration-300">
        <button
          onClick={() => setJdExpanded(v => !v)}
          className="w-full flex items-center justify-between px-6 py-4 text-sm font-black text-black dark:text-white hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
        >
          <span className="uppercase tracking-widest">Job Description</span>
          <ChevronDown className={clsx('w-5 h-5 text-black dark:text-white transition-transform duration-500', jdExpanded && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {jdExpanded && (
            <motion.div
              initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                <textarea
                  value={jobDescription}
                  onChange={e => setJobDescription(e.target.value)}
                  placeholder="What is the ideal candidate for this role?"
                  rows={8}
                  disabled={isLoading}
                  className="w-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm text-black dark:text-white placeholder-black/40 dark:placeholder-white/30 resize-none focus:outline-none focus:border-violet-600/30 dark:focus:border-violet-500/50 transition-colors font-medium shadow-inner"
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
        whileTap={{ scale: 0.98 }}
        className="w-full py-5 rounded-2xl text-base font-black text-white flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 transition-colors disabled:opacity-60 shadow-lg shadow-blue-600/30 cursor-pointer disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <span className="uppercase tracking-[0.2em]">Processing...</span>
          </>
        ) : (
          <>
            <Zap className={clsx("w-5 h-5", canAnalyze && "fill-amber-400 text-amber-400")} />
            <span className="uppercase tracking-[0.2em]">Analyse Resume</span>
          </>
        )}
      </motion.button>
    </div>
  )
}
