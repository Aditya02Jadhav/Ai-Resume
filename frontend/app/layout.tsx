import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ResumeAI — Agentic Resume Analyser',
  description: 'AI-powered resume analysis using LangGraph agents and Gemini. Get ATS scores, semantic critique, and actionable improvements in seconds.',
  keywords: ['resume analyser', 'AI resume', 'ATS score', 'LangGraph', 'Gemini AI'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#04040f] text-slate-100 antialiased">
        <div className="bg-radial fixed inset-0 pointer-events-none z-0" />
        {children}
      </body>
    </html>
  )
}
