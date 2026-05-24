import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Briefcase, FileText, Loader2, Users, Cpu, UserCheck, BrainCircuit, Link as LinkIcon, Upload, X, Radar, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const agentConfig = {
  "HR": {
    color: "bg-emerald-500",
    glow: "shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)]",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: <Users className="w-5 h-5 text-emerald-100" />,
    label: "HR Ops",
  },
  "Technical Manager": {
    color: "bg-cyan-500",
    glow: "shadow-[0_0_30px_-5px_rgba(6,182,212,0.5)]",
    text: "text-cyan-400",
    border: "border-cyan-500/30",
    icon: <Cpu className="w-5 h-5 text-cyan-100" />,
    label: "Tech Lead",
  },
  "Hiring Manager": {
    color: "bg-indigo-500",
    glow: "shadow-[0_0_30px_-5px_rgba(99,102,241,0.5)]",
    text: "text-indigo-400",
    border: "border-indigo-500/30",
    icon: <UserCheck className="w-5 h-5 text-indigo-100" />,
    label: "Director",
  },
  "System": {
    color: "bg-zinc-600",
    glow: "",
    text: "text-zinc-400",
    border: "border-zinc-700",
    icon: <Bot className="w-5 h-5 text-zinc-300" />,
    label: "System",
  }
};

export default function MockPanel() {
  const [jobDescription, setJobDescription] = useState('');
  
  const [resumeType, setResumeType] = useState('upload'); // 'upload' or 'text'
  const [resumeText, setResumeText] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [decision, setDecision] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [activeAgent, setActiveAgent] = useState(null);
  const [currentThought, setCurrentThought] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isAnalyzing, currentThought]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const startPanel = async (e) => {
    e.preventDefault();
    if (!jobDescription) return;
    if (resumeType === 'text' && !resumeText) return;
    if (resumeType === 'upload' && !resumeFile) return;

    setIsAnalyzing(true);
    setMessages([]);
    setDecision(null);
    setConfidence(0);
    setActiveAgent(null);
    setCurrentThought(null);

    const formData = new FormData();
    formData.append('job_description', jobDescription);
    
    if (resumeType === 'text') {
      formData.append('resume_text', resumeText);
    } else if (resumeType === 'upload' && resumeFile) {
      formData.append('resume_file', resumeFile);
    }

    try {
      const response = await fetch('http://localhost:8000/mock-panel', {
        method: 'POST',
        body: formData,
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            if (data.event === 'panel_start') {
              setMessages(prev => [...prev, { agent: 'System', content: 'Uplink established. Agents engaging candidate profile...', thinking: null }]);
            } else if (data.event === 'node_start') {
              setActiveAgent(data.agent);
              setCurrentThought("Processing data vectors...");
            } else if (data.event === 'node_complete') {
              setActiveAgent(data.agent);
              if (data.thinking) {
                setCurrentThought(data.thinking);
                await new Promise(r => setTimeout(r, 1500));
              }
              setMessages(prev => [...prev, { agent: data.agent, content: data.content, thinking: data.thinking }]);
              setCurrentThought(null);
              setActiveAgent(null);
            } else if (data.event === 'panel_complete') {
              setDecision(data.decision);
              setConfidence(data.confidence || 0);
              setMessages(prev => [...prev, { agent: 'System', content: `Consensus reached. Link terminated.`, thinking: null }]);
              setIsAnalyzing(false);
              setActiveAgent(null);
              setCurrentThought(null);
            } else if (data.event === 'panel_error') {
              setMessages(prev => [...prev, { agent: 'System', content: `Critical Error: ${data.error}`, thinking: null }]);
              setIsAnalyzing(false);
              setActiveAgent(null);
              setCurrentThought(null);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error starting panel:", error);
      setMessages(prev => [...prev, { agent: 'System', content: `Connection lost: ${error.message}`, thinking: null }]);
      setIsAnalyzing(false);
      setActiveAgent(null);
      setCurrentThought(null);
    }
  };

  return (
    <div className="w-full relative bg-slate-50 dark:bg-[#0a0a0c] text-slate-800 dark:text-zinc-300 font-sans selection:bg-cyan-500/30 overflow-hidden transition-colors duration-300">
      {/* Background Grid - only visible in dark mode */}
      <div className="absolute inset-0 hidden dark:block bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      {/* Background Grid - light mode */}
      <div className="absolute inset-0 dark:hidden bg-[linear-gradient(to_right,#94a3b820_1px,transparent_1px),linear-gradient(to_bottom,#94a3b820_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#fff_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col xl:flex-row gap-8 min-h-[calc(100vh-96px)]">
        
        {/* LEFT COLUMN: MISSION CONTROL */}
        <div className="w-full xl:w-[400px] flex flex-col gap-6 z-10 shrink-0 h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 p-6 rounded-2xl shadow-2xl">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase flex items-center gap-3 mb-2">
              <Radar className="w-6 h-6 text-cyan-500 dark:text-cyan-400" /> Discussion Room
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-500 font-medium">Configure agent parameters and launch simulation.</p>
          </div>

          <form onSubmit={startPanel} className="flex-1 flex flex-col gap-6">
            {/* Job Input */}
            <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col gap-4 group hover:border-cyan-500/30 transition-all duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform duration-300" /> Target Role
                </h3>
              </div>
              <textarea
                placeholder="Paste Job Description..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-32 bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-zinc-700 custom-scrollbar"
              />
            </div>

            {/* Resume Input */}
            <div className="bg-white/80 dark:bg-zinc-900/50 backdrop-blur-xl border border-slate-200 dark:border-zinc-800/80 p-5 rounded-2xl shadow-xl flex flex-col gap-4 group hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform duration-300" /> Candidate Data
                </h3>
                <div className="flex bg-slate-100 dark:bg-zinc-950 rounded-lg p-1 border border-slate-200 dark:border-zinc-800">
                  <button type="button" onClick={() => setResumeType('upload')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${resumeType === 'upload' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}><Upload className="w-3 h-3"/> FILE</button>
                  <button type="button" onClick={() => setResumeType('text')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${resumeType === 'text' ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300'}`}>TEXT</button>
                </div>
              </div>
              
              {resumeType === 'upload' ? (
                <div className="w-full h-32 bg-slate-100/80 dark:bg-zinc-950/80 border border-dashed border-slate-300 dark:border-zinc-700 hover:border-emerald-500/80 hover:bg-emerald-500/5 rounded-xl flex flex-col items-center justify-center transition-all duration-300 relative group/file cursor-pointer">
                  <input type="file" accept=".pdf,.txt,.docx" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <Upload className="w-6 h-6 text-slate-400 dark:text-zinc-600 group-hover/file:text-emerald-400 group-hover/file:-translate-y-1 mb-2 transition-all duration-300" />
                  <span className="text-sm font-medium text-slate-500 dark:text-zinc-500 group-hover/file:text-emerald-500 dark:group-hover/file:text-emerald-300 transition-colors duration-300">
                    {resumeFile ? resumeFile.name : 'Select or drop resume'}
                  </span>
                </div>
              ) : (
                <textarea
                  placeholder="Paste Resume Text..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="w-full h-32 bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none placeholder:text-slate-400 dark:placeholder:text-zinc-700 custom-scrollbar"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="mt-auto w-full py-4 px-6 bg-slate-900 dark:bg-white hover:bg-slate-700 dark:hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] text-white dark:text-black rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> EXECUTING...</>
              ) : (
                <><Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> INITIATE PANEL</>
              )}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: ARENA & TERMINAL */}
        <div className="flex-1 flex flex-col gap-6 z-10 h-full min-h-[600px]">
          
          {/* Top Arena */}
          <div className="h-[280px] bg-white/60 dark:bg-zinc-900/40 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-zinc-800/80 relative flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-10 dark:opacity-20 mix-blend-multiply dark:mix-blend-screen pointer-events-none">
               <div className="w-[400px] h-[400px] border border-slate-400 dark:border-zinc-700 rounded-full absolute animate-[spin_60s_linear_infinite]" />
               <div className="w-[300px] h-[300px] border border-slate-400 dark:border-zinc-600 rounded-full absolute animate-[spin_40s_linear_infinite_reverse]" />
               <div className="w-[200px] h-[200px] border border-cyan-500 dark:border-cyan-900 rounded-full absolute animate-pulse" />
            </div>

            <div className="w-full max-w-3xl flex justify-between items-center px-10 relative z-10">
              {['HR', 'Hiring Manager', 'Technical Manager'].map((agentName) => {
                const config = agentConfig[agentName];
                const isActive = activeAgent === agentName;
                
                return (
                  <div key={agentName} className={`flex flex-col items-center gap-4 transition-all duration-700 ${isActive ? 'scale-125 z-20' : 'scale-90 opacity-40 grayscale'}`}>
                    
                    {/* Thought Node */}
                    <AnimatePresence>
                      {isActive && currentThought && (
                        <motion.div
                          initial={{ opacity: 0, y: 20, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`absolute -top-20 w-56 p-3 rounded-xl border bg-zinc-950/90 backdrop-blur-xl shadow-2xl z-30 ${config.border}`}
                        >
                          <div className={`text-[10px] font-black uppercase mb-1 flex items-center gap-1 ${config.text}`}>
                             <BrainCircuit className="w-3 h-3 animate-pulse" /> PROCESSING
                          </div>
                          <div className="text-xs text-zinc-300 font-mono leading-relaxed line-clamp-2">
                             {currentThought}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hexagon Avatar */}
                    <div className="relative">
                      {isActive && <div className={`absolute inset-0 rounded-full blur-2xl animate-pulse opacity-50 ${config.color}`} />}
                      <div className={`w-20 h-20 bg-slate-100 dark:bg-zinc-950 border-2 ${isActive ? config.border : 'border-slate-300 dark:border-zinc-800'} rounded-2xl rotate-45 flex items-center justify-center relative z-10 shadow-2xl transition-all duration-500 ${isActive ? config.glow : ''}`}>
                        <div className="-rotate-45">
                          {config.icon}
                        </div>
                      </div>
                    </div>

                    <div className={`text-xs font-black tracking-widest uppercase ${isActive ? config.text : 'text-slate-400 dark:text-zinc-500'}`}>
                      {config.label}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Decision Bar Overlay */}
            <AnimatePresence>
              {decision && (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-6 left-0 right-0 px-10 z-40"
                >
                  <div className="bg-white/95 dark:bg-zinc-950/90 backdrop-blur-xl border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                       <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-widest">
                         {decision.toLowerCase().includes('hire') && !decision.toLowerCase().includes('no hire') 
                           ? <><CheckCircle className="text-emerald-500 w-6 h-6" /> APPROVED</>
                           : <><ShieldAlert className="text-red-500 w-6 h-6" /> REJECTED</>
                         }
                       </h2>
                       <span className="font-mono text-2xl font-black tracking-tighter text-slate-900 dark:text-white">{confidence}% <span className="text-sm text-slate-500 dark:text-zinc-500">CONFIDENCE</span></span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden relative border border-zinc-800">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`absolute inset-y-0 left-0 ${decision.toLowerCase().includes('hire') && !decision.toLowerCase().includes('no hire') ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]'}`}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Terminal Log */}
          <div className="flex-1 bg-slate-100/80 dark:bg-zinc-950/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-zinc-800/80 flex flex-col overflow-hidden relative shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-zinc-800/50 flex items-center justify-between bg-white/50 dark:bg-zinc-900/30">
              <span className="text-xs font-black text-slate-400 dark:text-zinc-500 tracking-widest uppercase flex items-center gap-2">
                 <Bot className="w-4 h-4" /> Live Terminal Feed
              </span>
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-5 custom-scrollbar">
              {messages.length === 0 && !isAnalyzing ? (
                <div className="h-full flex items-center justify-center text-slate-400 dark:text-zinc-700">
                  <span className="animate-pulse">Awaiting input parameters...</span>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const config = agentConfig[msg.agent] || agentConfig['System'];
                  const isSys = msg.agent === 'System';
                  
                  return (
                    <div key={idx} className={`animate-in slide-in-from-left-4 fade-in duration-300`}>
                      <div className="flex items-baseline gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 w-24 text-right ${config.text}`}>
                          [{config.label}]
                        </span>
                        <div className={`flex-1 ${isSys ? 'text-slate-400 dark:text-zinc-500' : 'text-slate-700 dark:text-zinc-300'}`}>
                          {msg.thinking && (
                            <div className="text-slate-400 dark:text-zinc-600 mb-1 flex items-center gap-2">
                              <span className="text-[10px] bg-slate-200 dark:bg-zinc-800/50 text-slate-500 dark:text-zinc-400 px-2 py-0.5 rounded">THOUGHT</span> 
                              <span className="italic line-clamp-1">{msg.thinking}</span>
                            </div>
                          )}
                          <span className={isSys ? 'italic' : ''}>{msg.content}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {isAnalyzing && activeAgent && !currentThought && (
                <div className="flex items-baseline gap-3 animate-pulse">
                  <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 w-24 text-right ${agentConfig[activeAgent]?.text || 'text-zinc-500'}`}>
                    [{agentConfig[activeAgent]?.label}]
                  </span>
                  <div className="flex-1 text-slate-400 dark:text-zinc-600 flex items-center gap-1">
                    <div className="w-1.5 h-4 bg-slate-300 dark:bg-zinc-600 animate-bounce" />
                    <div className="w-1.5 h-4 bg-slate-300 dark:bg-zinc-600 animate-bounce" style={{animationDelay: '0.1s'}} />
                    <div className="w-1.5 h-4 bg-slate-300 dark:bg-zinc-600 animate-bounce" style={{animationDelay: '0.2s'}} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}} />
    </div>
  );
}
