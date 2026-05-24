import React, { useState, useCallback } from 'react';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileSelect, isUploading }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      setFile(selected);
      onFileSelect(selected);
    }
  }, [onFileSelect]);

  const handleChange = function(e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      onFileSelect(selected);
    }
  };

  return (
    <div 
        className={`relative p-10 border-2 border-dashed rounded-3xl text-center flex flex-col items-center justify-center transition-all duration-300
        ${dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500/50 bg-white/40 dark:bg-slate-800/40'}
        `}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
    >
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept=".pdf,.docx"
        disabled={isUploading}
      />
      {
        file ? (
          <div className="flex flex-col items-center gap-4 text-emerald-500 dark:text-emerald-400">
             <CheckCircle size={48} className="animate-bounce" />
             <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{file.name}</p>
             <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-500 dark:text-slate-400">
            <UploadCloud size={64} className="text-indigo-500 dark:text-indigo-400/80 mb-2" />
            <p className="text-xl font-medium text-slate-800 dark:text-slate-200">Drag & Drop your resume here</p>
            <p className="text-sm">Or click to browse files (PDF, DOCX)</p>
          </div>
        )
      }
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl z-10">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-500"></div>
        </div>
      )}
    </div>
  );
}
