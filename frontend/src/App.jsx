import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import UploadResume from './pages/UploadResume'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Login from './pages/Login'
import Register from './pages/Register'
import Pricing from './pages/Pricing'
import Account from './pages/Account'
import Analyzer from './pages/Analyzer'
import MockPanel from './pages/MockPanel'

import { useAuth } from './contexts/AuthContext'

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 transition-colors duration-300">
      <Navbar />
      <main className="pt-24 min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/upload" element={<UploadResume />} />
          <Route path="/dashboard/:id" element={<Dashboard />} />
          <Route path="/builder" element={<PrivateRoute><ResumeBuilder /></PrivateRoute>} />
          <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/mock-panel" element={<MockPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </main>
    </div>
  )
}

export default App
