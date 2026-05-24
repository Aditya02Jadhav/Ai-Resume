import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { ArrowRight, FileText, CheckCircle, Zap, UploadCloud, BarChart3, Wand2, Target, Briefcase, Star, ShieldCheck, Clock, Quote, Play, Download } from 'lucide-react';

// --- ANIMATION COMPONENTS ---

const TypingText = ({ text, className }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return <span className={className}>{displayedText}</span>;
};

const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = parseInt(value);
      if (start === end) return;
      
      let totalDuration = 2000;
      let incrementTime = totalDuration / end;
      
      let timer = setInterval(() => {
        start += 1;
        setCount(start);
        if (start === end) clearInterval(timer);
      }, incrementTime);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return <span ref={ref}>{count}</span>;
}

const ProgressBar = ({ targetWidth, colorClass }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="h-2 bg-slate-100 dark:bg-slate-800 rounded flex overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={isInView ? { width: targetWidth } : { width: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className={`h-full ${colorClass}`}
      />
    </div>
  );
};

export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="flex flex-col w-full -mt-8 relative scroll-smooth overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 origin-left z-[100]" style={{ scaleX }} />

      {/* 1. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 inset-x-0 h-[700px] -z-10 overflow-hidden">
           <motion.div 
             animate={{ 
               scale: [1, 1.1, 1],
               rotate: [0, 5, 0],
               opacity: [0.1, 0.2, 0.1]
             }}
             transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
             className="absolute -top-1/2 left-1/4 w-[600px] h-[600px] bg-indigo-400 blur-[120px] rounded-full"
           />
           <motion.div 
             animate={{ 
               scale: [1.2, 1, 1.2],
               rotate: [0, -5, 0],
               opacity: [0.1, 0.15, 0.1]
             }}
             transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
             className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-400 blur-[100px] rounded-full"
           />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto space-y-8 relative z-10"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-sm font-bold tracking-wide border border-indigo-200 dark:border-indigo-500/20 mb-2 shadow-sm cursor-default"
          >
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Zap size={16} className="text-amber-500" />
            </motion.div>
            Voted #1 AI Resume Tool of 2026
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            <TypingText text="Boost Your Resume Score" /> <br className="hidden md:block" />
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400"
            >
              Instantly & Get Hired.
            </motion.span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Stop guessing what recruiters want. Our AI-driven engine analyzes your resume against industry-standard ATS algorithms, providing actionable feedback to land 3x more interviews.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link to="/upload" className="btn-primary text-lg flex items-center justify-center gap-2 px-8 py-4 hero-btn-shadow transition-all group">
                 <UploadCloud size={24} className="group-hover:bounce" /> Upload Resume 
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Link to="/builder" className="text-lg px-8 py-4 rounded-xl bg-white dark:bg-slate-800 border-[2px] border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 text-slate-800 dark:text-white font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-center">
                <FileText size={24} className="text-indigo-500 dark:text-indigo-400" /> Build Resume
              </Link>
            </motion.div>
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-sm text-slate-500 dark:text-slate-400 mt-6 flex items-center justify-center gap-2 font-medium"
          >
             <ShieldCheck size={16} className="text-emerald-500"/> 100% Free to scan. No credit card required.
          </motion.p>
        </motion.div>
      </section>

      {/* 2. FEATURES SECTION */}
      <section className="py-24 bg-white dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Powerful Tools for Serious Job Seekers</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to bypass bots and impress human recruiters effortlessly.</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureBox 
              index={0}
              icon={<BarChart3 size={32} className="text-blue-500" />}
              title="ATS Score Checker"
              desc="Simulate exactly how Fortune 500 company software parses and scores your document."
            />
            <FeatureBox 
              index={1}
              icon={<Wand2 size={32} className="text-purple-500" />}
              title="AI Suggestions"
              desc="Receive intelligent grammar, metric, and strong action-verb recommendations instantly."
            />
            <FeatureBox 
              index={2}
              icon={<Target size={32} className="text-rose-500" />}
              title="Job Match Analysis"
              desc="Compare your resume's keyword density directly against your targeted job descriptions."
            />
            <FeatureBox 
              index={3}
              icon={<Briefcase size={32} className="text-emerald-500" />}
              title="Pro Resume Builder"
              desc="Generate beautiful, ATS-compliant formats natively tested to bypass screening filters."
            />
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto text-center">
           <motion.h2 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             viewport={{ once: true }}
             className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-16"
           >
             How It Works in 4 Simple Steps
           </motion.h2>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-12 relative">
              <div className="hidden md:block absolute top-[45px] left-[10%] right-[10%] h-[2px] bg-indigo-100 dark:bg-indigo-900/30 z-0 border-t-2 border-dashed border-indigo-200 dark:border-indigo-800/50" />
              
              <StepBox number="1" title="Upload" desc="Drag and drop your existing basic PDF or Word resume." icon={<UploadCloud size={24}/>} delay={0.1} />
              <StepBox number="2" title="Analyze" desc="Our engine scans formatting, keywords, and impact metrics." icon={<BarChart3 size={24}/>} delay={0.2} />
              <StepBox number="3" title="Improve" desc="Apply our tailored, field-tested AI recommendations." icon={<Wand2 size={24}/>} delay={0.3} />
              <StepBox number="4" title="Download" desc="Export a flawless, top-1% resume ready to send." icon={<Download size={24}/>} delay={0.4} />
           </div>
        </div>
      </section>

      {/* 4. BENEFITS SECTION */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800/20 px-4">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="w-full lg:w-1/2 space-y-8"
            >
               <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white">Why Use ResumeAI?</h2>
               <p className="text-lg text-slate-600 dark:text-slate-400">Over 70% of resumes are rejected by an ATS before a human ever sees them. Take the guesswork out of job hunting.</p>
               
               <ul className="space-y-6">
                 <li className="flex gap-4 items-start translate-x-0">
                   <div className="mt-1 bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full text-blue-600 dark:text-blue-400"><Target size={24}/></div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 dark:text-white">Increase Interview Chances</h4>
                     <p className="text-slate-600 dark:text-slate-400 mt-1">Users see a 300% increase in callbacks using our targeted keyword optimizations.</p>
                   </div>
                 </li>
                 <li className="flex gap-4 items-start translate-x-0">
                   <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full text-emerald-600 dark:text-emerald-400"><ShieldCheck size={24}/></div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 dark:text-white">100% ATS Optimized Formatting</h4>
                     <p className="text-slate-600 dark:text-slate-400 mt-1">Never worry about unreadable columns or fonts. Our builder enforces parser-friendly layouts.</p>
                   </div>
                 </li>
                 <li className="flex gap-4 items-start translate-x-0">
                   <div className="mt-1 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full text-purple-600 dark:text-purple-400"><Clock size={24}/></div>
                   <div>
                     <h4 className="text-xl font-bold text-slate-900 dark:text-white">Save Hours of Frustration</h4>
                     <p className="text-slate-600 dark:text-slate-400 mt-1">Re-write bullet points securely in seconds using context-aware AI instead of staring at a blank page.</p>
                   </div>
                 </li>
               </ul>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
               whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.8 }}
               className="w-full lg:w-1/2 relative"
            >
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-blue-400 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-xl"></div>
               <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 relative shadow-2xl">
                  <div className="flex border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                     <span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span>
                     <span className="w-3 h-3 rounded-full bg-amber-400 mr-2"></span>
                     <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                  </div>
                  <div className="flex items-center gap-6 mb-8">
                     <div className="text-6xl font-black text-emerald-500">
                        <AnimatedNumber value="92" />
                     </div>
                     <div>
                       <h5 className="font-bold text-lg dark:text-white">Excellent Score!</h5>
                       <p className="text-sm text-slate-500">Your resume is perfectly optimized.</p>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <ProgressBar targetWidth="95%" colorClass="bg-emerald-500" />
                     <ProgressBar targetWidth="88%" colorClass="bg-blue-500" />
                  </div>
                  
                  {/* Floating elements to feel alive */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -right-4 top-1/4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 max-w-[150px] z-20"
                  >
                     <p className="text-[10px] text-slate-400 mb-1 font-bold">KEYWORD ANALYSIS</p>
                     <div className="flex gap-1 flex-wrap">
                        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[8px] px-1.5 py-0.5 rounded">Python</span>
                        <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[8px] px-1.5 py-0.5 rounded">FastAPI</span>
                     </div>
                  </motion.div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="py-24 px-4">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">Trusted by Professionals</h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">See how thousands have transformed their careers.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <TestimonialCard 
                 index={0}
                 quote="After applying to 50+ places with no luck, I scored my resume here. Fixed 4 critical ATS errors and got 3 interviews the next week!"
                 name="Sarah Jenkins"
                 title="Senior Product Manager"
               />
               <TestimonialCard 
                 index={1}
                 quote="The AI suggestions completely overhauled my generic bullet points into hard-hitting impact statements. Absolutely worth it!"
                 name="David Chen"
                 title="Software Engineer"
               />
               <TestimonialCard 
                 index={2}
                 quote="I had no idea my fancy 2-column resume wasn't being read by recruitment software. The builder gave me a clean, professional template."
                 name="Michael Ramirez"
                 title="Financial Analyst"
               />
            </div>
         </div>
      </section>

      {/* 6. CTA / FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 pt-20 pb-10 px-4 mt-10">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="max-w-4xl mx-auto text-center mb-16"
         >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-8">Ready to Make the Next Move?</h2>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
               <Link to="/upload" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xl px-10 py-5 rounded-full shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_60px_rgba(99,102,241,0.6)] transition-all">
                  Score Your Resume For Free
               </Link>
            </motion.div>
         </motion.div>
         <div className="max-w-7xl mx-auto border-t border-slate-800 pt-10 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm gap-4">
            <div className="flex items-center gap-2 text-white font-bold text-xl"><Briefcase className="text-indigo-400"/> ResumeAI</div>
            <p>&copy; 2026 ResumeAI Platform. Built for success.</p>
            <div className="flex gap-6">
               <a href="#" className="hover:text-white transition">Terms</a>
               <a href="#" className="hover:text-white transition">Privacy Policy</a>
               <a href="#" className="hover:text-white transition">Contact Support</a>
            </div>
         </div>
      </footer>
    </div>
  );
}

function FeatureBox({ title, desc, icon, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      className="bg-slate-50 dark:bg-slate-800/20 hover:bg-white dark:hover:bg-slate-800/40 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 transition-all duration-300 group"
    >
      <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-transform text-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
    </motion.div>
  )
}

function StepBox({ number, title, desc, icon, delay }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center relative z-10 group"
    >
       <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full border-4 border-indigo-100 dark:border-indigo-900 flex items-center justify-center shadow-lg group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-colors mb-6 relative">
          <span className="absolute -top-2 -right-2 bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">{number}</span>
          <motion.div 
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="text-indigo-600 dark:text-indigo-400"
          >
            {icon}
          </motion.div>
       </div>
       <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
       <p className="text-slate-600 dark:text-slate-400 font-medium">{desc}</p>
    </motion.div>
  )
}

function TestimonialCard({ quote, name, title, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.2 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-200 dark:border-slate-700/50 shadow-sm"
    >
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-amber-400 text-amber-400" />)}
      </div>
      <Quote className="text-slate-200 dark:text-slate-700 mb-4" size={40} />
      <p className="text-slate-700 dark:text-slate-300 text-lg italic leading-relaxed mb-6 font-medium">"{quote}"</p>
      <div>
         <h5 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{name}</h5>
         <p className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold">{title}</p>
      </div>
    </motion.div>
  )
}
