import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import AdBanner from '../components/AdBanner';

const API_BASE = 'http://localhost:8000';

export default function UploadResume() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFileSelect = async (file) => {
    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(err.detail || 'Upload failed');
      }

      // Stream the analysis events
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let analysisReport = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.event === 'pipeline_complete' && data.report) {
                analysisReport = data.report;
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      // Map agent response to Dashboard expected format
      const scoreData = {
        overall_score: analysisReport.overall_score || 0,
        breakdown: analysisReport.scores || {},
        suggestions: analysisReport.critique || {},
        keyword_matches: analysisReport.keyword_analysis || {},
        parsed_resume: analysisReport.parsed_resume || {},
        ...analysisReport // Include all other data
      };

      navigate('/dashboard/current', { state: { scoreData } });
    } catch (err) {
      setError(err.message || "An error occurred while uploading.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4">
          ATS Resume Scanner
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Upload your resume below to instantly see your ATS compatibility score and get tailored feedback to improve your chances.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
           <ShieldAlert className="mt-0.5" size={20} />
           <div>
             <h3 className="font-semibold">Upload Failed</h3>
             <p className="text-sm text-red-300 opacity-80">{error}</p>
           </div>
        </div>
      )}

      <div className="mb-8">
        <FileUpload onFileSelect={handleFileSelect} isUploading={isUploading} />
      </div>

      <div className="mt-8 mb-6">
        <AdBanner dataAdSlot="UPLOAD_BOTTOM_AD" className="min-h-[100px]" format="horizontal" />
      </div>
      
      <div className="text-center text-sm text-slate-500">
        Strictly Confidential. We don't share your data with 3rd parties.
      </div>
    </div>
  );
}
