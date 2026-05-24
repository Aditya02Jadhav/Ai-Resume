import { createContext, useContext, useState, useEffect } from 'react'

const AnalyzerContext = createContext()

export const useAnalyzer = () => {
  const context = useContext(AnalyzerContext)
  if (!context) {
    throw new Error('useAnalyzer must be used within AnalyzerProvider')
  }
  return context
}

export function AnalyzerProvider({ children }) {
  const [report, setReport] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [nodeStatuses, setNodeStatuses] = useState({})
  const [nodeDetails, setNodeDetails] = useState({})
  const [appState, setAppState] = useState('idle')
  const [history, setHistory] = useState([])
  const [historyReports, setHistoryReports] = useState({})

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedAnalyzer = localStorage.getItem('analyzerData')
      if (savedAnalyzer) {
        const data = JSON.parse(savedAnalyzer)
        setReport(data.report)
        setResumeText(data.resumeText)
        setJobDescription(data.jobDescription)
        setNodeStatuses(data.nodeStatuses)
        setNodeDetails(data.nodeDetails)
        setAppState(data.appState)
        setHistory(data.history)
        setHistoryReports(data.historyReports)
      }
    } catch (error) {
      console.error('Failed to load analyzer data from localStorage:', error)
    }
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('analyzerData', JSON.stringify({
        report,
        resumeText,
        jobDescription,
        nodeStatuses,
        nodeDetails,
        appState,
        history,
        historyReports
      }))
    } catch (error) {
      console.error('Failed to save analyzer data to localStorage:', error)
    }
  }, [report, resumeText, jobDescription, nodeStatuses, nodeDetails, appState, history, historyReports])

  const value = {
    report,
    setReport,
    resumeText,
    setResumeText,
    jobDescription,
    setJobDescription,
    nodeStatuses,
    setNodeStatuses,
    nodeDetails,
    setNodeDetails,
    appState,
    setAppState,
    history,
    setHistory,
    historyReports,
    setHistoryReports
  }

  return (
    <AnalyzerContext.Provider value={value}>
      {children}
    </AnalyzerContext.Provider>
  )
}
