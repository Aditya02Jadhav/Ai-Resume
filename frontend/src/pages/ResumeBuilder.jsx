import React, { useState, useRef } from 'react';
import { useForm as useRHForm, useFieldArray } from 'react-hook-form';
import { Smartphone, Mail, Briefcase, GraduationCap, FileEdit, Download, FileText, Share2, Plus, Trash2, Code, LayoutTemplate } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function ResumeBuilder() {
  const [template, setTemplate] = useState('professional');
  
  const { register, control, handleSubmit, watch } = useRHForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      links: [{ label: 'LinkedIn', url: '' }],
      summary: '',
      experience: [{ jobTitle: '', company: '', jobDescription: '' }],
      education: [{ degree: '', school: '', year: '' }],
      skills: ''
    }
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });
  const { fields: linkFields, append: appendLink, remove: removeLink } = useFieldArray({ control, name: 'links' });
  
  const previewData = watch();
  const resumeRef = useRef(null);

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleDownloadDOC = () => {
    let linksHtml = '';
    if (previewData.email) linksHtml += `<span>Email: ${previewData.email}</span>&nbsp;&nbsp;&nbsp;`;
    if (previewData.phone) linksHtml += `<span>Phone: ${previewData.phone}</span>&nbsp;&nbsp;&nbsp;`;
    if (previewData.links && previewData.links.length > 0) {
       previewData.links.forEach(l => {
         if (l.url) linksHtml += `<span>${l.url}</span>&nbsp;&nbsp;&nbsp;`;
       });
    }

    let expHtml = '';
    if (previewData.experience) {
       previewData.experience.forEach(exp => {
         if (exp.jobTitle) {
           expHtml += `<div style="margin-bottom: 15px;">
             <table width="100%" cellpadding="0" cellspacing="0" border="0">
               <tr>
                 <td align="left"><strong style="font-size: 14pt;">${exp.jobTitle}</strong></td>
                 <td align="right" style="color: #555555;"><strong>${exp.company}</strong></td>
               </tr>
             </table>
             <p style="margin-top: 5px; font-size: 11pt; white-space: pre-wrap;">${exp.jobDescription}</p>
           </div>`;
         }
       });
    }

    let eduHtml = '';
    if (previewData.education) {
       previewData.education.forEach(edu => {
         if (edu.degree) {
           eduHtml += `<div style="margin-bottom: 10px;">
             <table width="100%" cellpadding="0" cellspacing="0" border="0">
               <tr>
                 <td align="left"><strong style="font-size: 12pt;">${edu.degree}</strong><br/><span style="color: #444;">${edu.school}</span></td>
                 <td align="right" valign="top"><strong>${edu.year}</strong></td>
               </tr>
             </table>
           </div>`;
         }
       });
    }

    const docBody = `
      <div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5;">
        <h1 style="text-align: center; font-size: 24pt; margin-bottom: 5px; text-transform: uppercase;">${previewData.firstName || ''} ${previewData.lastName || ''}</h1>
        <p style="text-align: center; font-size: 10pt; color: #333333; margin-top: 0;">${linksHtml}</p>
        
        ${previewData.summary ? `
          <h2 style="font-size: 14pt; border-bottom: 1px solid #000; padding-bottom: 2px; margin-top: 20px;">PROFILE</h2>
          <p style="text-align: justify;">${previewData.summary}</p>
        ` : ''}

        ${expHtml ? `
          <h2 style="font-size: 14pt; border-bottom: 1px solid #000; padding-bottom: 2px; margin-top: 20px;">EXPERIENCE</h2>
          ${expHtml}
        ` : ''}

        ${eduHtml ? `
          <h2 style="font-size: 14pt; border-bottom: 1px solid #000; padding-bottom: 2px; margin-top: 20px;">EDUCATION</h2>
          ${eduHtml}
        ` : ''}

        ${previewData.skills ? `
          <h2 style="font-size: 14pt; border-bottom: 1px solid #000; padding-bottom: 2px; margin-top: 20px;">SKILLS</h2>
          <p>${previewData.skills}</p>
        ` : ''}
      </div>
    `;

    const preHtml = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Resume</title><style>@page WordSection1 {size: 8.5in 11.0in; margin: 1.0in 1.0in 1.0in 1.0in;} div.WordSection1 {page: WordSection1;}</style></head><body><div class='WordSection1'>";
    const postHtml = "</div></body></html>";
    const html = preHtml + docBody + postHtml;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword;charset=utf-8'
    });
    
    const downloadLink = document.createElement("a");
    downloadLink.download = `${previewData.firstName || 'Resume'}_${previewData.lastName || 'Builder'}.doc`;
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.click();
  };

  return (
    <div className="max-w-[1400px] mx-auto flex flex-col gap-6 min-h-[85vh] print-mode-wrapper">
      <div className="shrink-0 no-print">
         <AdBanner dataAdSlot="BUILDER_TOP_AD" className="min-h-[90px]" format="horizontal" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Settings / Form Panel - Sticky */}
        <div className="w-full lg:w-[420px] shrink-0 no-print">
          <div className="lg:sticky lg:top-24 glass-panel p-6 shadow-2xl flex flex-col h-auto lg:max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-300 dark:border-slate-700 pb-4 mb-6">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resume Studio</h2>
               <div className="flex gap-2">
                 <button onClick={handleDownloadDOC} title="Export to Word" className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 transition">
                   <FileText size={18} />
                 </button>
                 <button onClick={handleDownloadPDF} title="Export to PDF" className="p-2 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-200 transition flex items-center gap-2 px-3 shadow-sm">
                   <Download size={18} /> <span className="font-semibold text-xs text-nowrap">Print</span>
                 </button>
               </div>
            </div>
            
            <form className="space-y-6 pb-6">
              <div className="space-y-3 pb-2">
                 <h3 className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-2"><LayoutTemplate size={14}/> Template</h3>
                 <div className="grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => setTemplate('professional')} className={`py-2 text-xs rounded-lg border-2 transition-all font-bold ${template === 'professional' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'}`}>Professional</button>
                    <button type="button" onClick={() => setTemplate('modern')} className={`py-2 text-xs rounded-lg border-2 transition-all font-bold ${template === 'modern' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'}`}>Modern</button>
                    <button type="button" onClick={() => setTemplate('creative')} className={`py-2 text-xs rounded-lg border-2 transition-all font-bold ${template === 'creative' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-indigo-300'}`}>Creative</button>
                 </div>
              </div>
              
              <div className="space-y-4">
                 <h3 className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-2"><Briefcase size={14}/> Personal</h3>
                 <div className="grid grid-cols-2 gap-3">
                    <input {...register("firstName")} placeholder="First Name" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                    <input {...register("lastName")} placeholder="Last Name" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                 </div>
                 <input {...register("email")} type="email" placeholder="Email Address" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
                 <input {...register("phone")} placeholder="Phone Number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none" />
              </div>

              <div className="space-y-4">
                 <h3 className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[11px] flex items-center justify-between">
                   <span className="flex items-center gap-2"><Share2 size={14}/> Socials</span>
                   <button type="button" onClick={() => appendLink({ label: '', url: '' })} className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">+ Add</button>
                 </h3>
                 {linkFields.map((field, index) => (
                    <div key={field.id} className="group relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                      {linkFields.length > 1 && (
                         <button type="button" onClick={() => removeLink(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                      )}
                      <div className="flex gap-2">
                         <input {...register(`links.${index}.label`)} placeholder="e.g. LinkedIn" className="w-1/3 bg-transparent border-b border-slate-200 dark:border-slate-800 p-1 text-xs text-slate-900 dark:text-white outline-none" />
                         <input {...register(`links.${index}.url`)} placeholder="URL..." className="w-2/3 bg-transparent border-b border-slate-200 dark:border-slate-800 p-1 text-xs text-slate-900 dark:text-white outline-none" />
                      </div>
                    </div>
                 ))}
              </div>

              <div className="space-y-3">
                 <h3 className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-2"><FileEdit size={14}/> Summary</h3>
                 <textarea {...register("summary")} rows="3" placeholder="A brief professional summary..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"></textarea>
              </div>
              
              <div className="space-y-4">
                 <h3 className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[11px] flex items-center justify-between">
                   <span className="flex items-center gap-2"><Briefcase size={14}/> Experience</span>
                   <button type="button" onClick={() => appendExp({ jobTitle: '', company: '', jobDescription: '' })} className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">+ Add Job</button>
                 </h3>
                 {expFields.map((field, index) => (
                    <div key={field.id} className="group relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                      {expFields.length > 1 && (
                         <button type="button" onClick={() => removeExp(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                      )}
                      <input {...register(`experience.${index}.jobTitle`)} placeholder="Job Title" className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 p-1 text-sm font-bold text-slate-900 dark:text-white outline-none" />
                      <input {...register(`experience.${index}.company`)} placeholder="Company & Dates" className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 p-1 text-xs text-slate-500 outline-none" />
                      <textarea {...register(`experience.${index}.jobDescription`)} rows="3" placeholder="Achievements..." className="w-full bg-white dark:bg-slate-800/50 rounded-md p-2 text-xs text-slate-700 dark:text-slate-300 outline-none"></textarea>
                    </div>
                 ))}
              </div>

              <div className="space-y-4">
                 <h3 className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[11px] flex items-center justify-between">
                   <span className="flex items-center gap-2"><GraduationCap size={14}/> Education</span>
                   <button type="button" onClick={() => appendEdu({ degree: '', school: '', year: '' })} className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">+ Add</button>
                 </h3>
                 {eduFields.map((field, index) => (
                    <div key={field.id} className="group relative bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2">
                      {eduFields.length > 1 && (
                         <button type="button" onClick={() => removeEdu(index)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                      )}
                      <input {...register(`education.${index}.degree`)} placeholder="Degree Name" className="w-full bg-transparent border-b border-slate-200 dark:border-slate-800 p-1 text-sm font-bold text-slate-900 dark:text-white outline-none" />
                      <div className="flex gap-2">
                         <input {...register(`education.${index}.school`)} placeholder="School" className="w-2/3 bg-transparent border-b border-slate-200 dark:border-slate-800 p-1 text-xs text-slate-500 outline-none" />
                         <input {...register(`education.${index}.year`)} placeholder="Year" className="w-1/3 bg-transparent border-b border-slate-200 dark:border-slate-800 p-1 text-xs text-slate-500 outline-none" />
                      </div>
                    </div>
                 ))}
              </div>

              <div className="space-y-3">
                 <h3 className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider text-[11px] flex items-center gap-2"><Code size={14}/> Skills</h3>
                 <textarea {...register("skills")} rows="3" placeholder="React, Python, AWS..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none"></textarea>
              </div>
            </form>
          </div>
        </div>

        {/* Real-time Preview Document Canvas */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-800/50 rounded-2xl p-6 sm:p-12 print-target flex flex-col items-center">
          <div className="w-full max-w-[210mm] shadow-2xl relative">
            <div 
              ref={resumeRef} 
              className="w-[210mm] bg-white min-h-[297mm] shadow-[0_0_50px_rgba(0,0,0,0.1)] print-exact mx-auto relative z-10 overflow-hidden"
            >
              {template === 'professional' && (
                <div className="p-10 sm:p-14 text-slate-900 font-serif leading-relaxed h-full">
                  <header className="text-center mb-10 border-b-2 border-slate-800 pb-6">
                    <h1 className="text-4xl lg:text-5xl uppercase tracking-widest font-black text-slate-900 mb-3">{previewData.firstName || 'Jane'} {previewData.lastName || 'Doe'}</h1>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] md:text-[14.5px] font-sans text-slate-700 tracking-wide font-medium">
                      {previewData.email && <span className="flex items-center gap-1"><Mail size={13}/> {previewData.email}</span>}
                      {previewData.phone && <span className="flex items-center gap-1"><Smartphone size={13}/> {previewData.phone}</span>}
                      {previewData.links?.map((link, i) => link.url && (
                        <span key={i} className="flex items-center gap-1"><Share2 size={13}/> {link.url.replace(/^https?:\/\//, '')}</span>
                      ))}
                    </div>
                  </header>

                  {previewData.summary && (
                    <section className="mb-8">
                      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-3 flex items-center gap-3"><span className="w-full h-px bg-slate-300"></span> PROFILE <span className="w-full h-px bg-slate-300"></span></h2>
                      <p className="text-[15px] font-sans text-slate-800 leading-[1.8] text-justify">{previewData.summary}</p>
                    </section>
                  )}

                  {(previewData.experience && previewData.experience.length > 0 && previewData.experience[0].jobTitle) ? (
                    <section className="mb-8">
                      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-5 flex items-center gap-3"><span className="w-full h-px bg-slate-300"></span> EXPERIENCE <span className="w-full h-px bg-slate-300"></span></h2>
                      <div className="space-y-6">
                        {previewData.experience.map((exp, idx) => exp.jobTitle && (
                          <div key={idx}>
                            <div className="flex justify-between items-baseline mb-2 border-b border-slate-100 pb-1">
                              <h3 className="text-[17px] font-bold text-slate-900">{exp.jobTitle}</h3>
                              <span className="text-[13px] font-bold font-sans tracking-wide text-slate-600 uppercase">{exp.company}</span>
                            </div>
                            <p className="text-[14px] font-sans text-slate-700 leading-relaxed whitespace-pre-wrap pl-3 border-l-2 border-slate-200">{exp.jobDescription}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {(previewData.education && previewData.education.length > 0 && previewData.education[0].degree) ? (
                    <section className="mb-8">
                      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-5 flex items-center gap-3"><span className="w-full h-px bg-slate-300"></span> EDUCATION <span className="w-full h-px bg-slate-300"></span></h2>
                      <div className="space-y-4 font-sans">
                        {previewData.education.map((edu, idx) => edu.degree && (
                          <div key={idx} className="flex justify-between text-[15px]">
                            <div>
                              <strong className="text-slate-900 block font-serif tracking-wide">{edu.degree}</strong>
                              <span className="text-slate-600 text-sm mt-0.5 block">{edu.school}</span>
                            </div>
                            <span className="text-[13px] font-semibold text-slate-500">{edu.year}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null}

                  {previewData.skills && (
                    <section className="mb-8">
                      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-3"><span className="w-full h-px bg-slate-300"></span> CORE EXPERTISE <span className="w-full h-px bg-slate-300"></span></h2>
                      <p className="text-[14.5px] font-sans font-medium text-slate-800 leading-relaxed">
                        {previewData.skills}
                      </p>
                    </section>
                  )}
                </div>
              )}

              {template === 'modern' && (
                <div className="font-sans text-slate-800 h-full flex flex-col">
                  <header className="bg-slate-800 text-white p-10 text-center">
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">{previewData.firstName || 'Jane'} {previewData.lastName || 'Doe'}</h1>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300 font-medium tracking-wide">
                      {previewData.email && <span className="flex items-center gap-1.5"><Mail size={14}/> {previewData.email}</span>}
                      {previewData.phone && <span className="flex items-center gap-1.5"><Smartphone size={14}/> {previewData.phone}</span>}
                      {previewData.links?.map((link, i) => link.url && (
                        <span key={i} className="flex items-center gap-1.5"><Share2 size={14}/> {link.url.replace(/^https?:\/\//, '')}</span>
                      ))}
                    </div>
                  </header>

                  <div className="py-10 px-12 flex-1">
                    {previewData.summary && (
                      <section className="mb-8">
                        <p className="text-[15px] leading-relaxed text-slate-600">{previewData.summary}</p>
                      </section>
                    )}

                    <div className="flex gap-10">
                      <div className="w-2/3">
                        {(previewData.experience && previewData.experience.length > 0 && previewData.experience[0].jobTitle) ? (
                          <section className="mb-10">
                            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-200 pb-2 mb-6">Work Experience</h2>
                            <div className="space-y-7">
                              {previewData.experience.map((exp, idx) => exp.jobTitle && (
                                <div key={idx}>
                                  <h3 className="text-lg font-bold text-indigo-700">{exp.jobTitle}</h3>
                                  <span className="text-sm font-bold text-slate-500 uppercase block mb-2">{exp.company}</span>
                                  <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.jobDescription}</p>
                                </div>
                              ))}
                            </div>
                          </section>
                        ) : null}
                      </div>

                      <div className="w-1/3">
                        {previewData.skills && (
                          <section className="mb-10">
                            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">Skills</h2>
                            <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                              {previewData.skills}
                            </p>
                          </section>
                        )}

                        {(previewData.education && previewData.education.length > 0 && previewData.education[0].degree) ? (
                          <section className="mb-10">
                            <h2 className="text-lg font-bold uppercase tracking-wider text-slate-800 border-b-2 border-slate-200 pb-2 mb-4">Education</h2>
                            <div className="space-y-4">
                              {previewData.education.map((edu, idx) => edu.degree && (
                                <div key={idx}>
                                  <strong className="text-slate-800 block text-[15px]">{edu.degree}</strong>
                                  <span className="text-slate-500 text-[13px] block mt-1 leading-tight">{edu.school}</span>
                                  <span className="text-[12px] font-semibold text-indigo-600 mt-1 block">{edu.year}</span>
                                </div>
                              ))}
                            </div>
                          </section>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {template === 'creative' && (
                <div className="font-sans text-slate-800 h-full flex">
                  <div className="w-1/3 bg-emerald-800 text-white p-10 flex flex-col justify-between min-h-full shrink-0">
                    <div>
                      <h1 className="text-4xl font-black mb-2 break-words leading-tight">{previewData.firstName || 'Jane'} <span className="text-emerald-300 block">{previewData.lastName || 'Doe'}</span></h1>
                      <div className="mt-8 space-y-4 text-sm font-medium text-emerald-100">
                        {previewData.email && <div className="flex items-center gap-3"><Mail className="text-emerald-400" size={16}/><span className="break-all">{previewData.email}</span></div>}
                        {previewData.phone && <div className="flex items-center gap-3"><Smartphone className="text-emerald-400" size={16}/><span>{previewData.phone}</span></div>}
                        {previewData.links?.map((link, i) => link.url && (
                          <div key={i} className="flex items-center gap-3"><Share2 className="text-emerald-400 shrink-0" size={16}/><span className="break-all w-full truncate">{link.url.replace(/^https?:\/\//, '')}</span></div>
                        ))}
                      </div>
                      {previewData.skills && (
                        <div className="mt-12">
                          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4 border-b border-emerald-700 pb-2">Expertise</h2>
                          <p className="text-sm leading-relaxed text-emerald-50 whitespace-pre-wrap">{previewData.skills}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-2/3 bg-white p-10">
                    {previewData.summary && (
                      <section className="mb-10">
                        <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 flex items-center gap-3 mb-4"><span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Profile</h2>
                        <p className="text-[14.5px] text-slate-600 leading-relaxed block pl-11">{previewData.summary}</p>
                      </section>
                    )}
                    {(previewData.experience && previewData.experience.length > 0 && previewData.experience[0].jobTitle) ? (
                      <section className="mb-10">
                        <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 flex items-center gap-3 mb-6"><span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Experience</h2>
                        <div className="space-y-8 pl-11">
                          {previewData.experience.map((exp, idx) => exp.jobTitle && (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[54px] top-1.5 w-3 h-3 bg-emerald-500 border-4 border-emerald-100 rounded-full"></div>
                              <div className="absolute -left-[49px] top-4 bottom-[-32px] w-0.5 bg-slate-100 last:hidden"></div>
                              <h3 className="text-[16px] font-bold text-slate-800">{exp.jobTitle}</h3>
                              <span className="text-[13px] font-semibold text-emerald-600 block mb-2">{exp.company}</span>
                              <p className="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.jobDescription}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    ) : null}
                    {(previewData.education && previewData.education.length > 0 && previewData.education[0].degree) ? (
                      <section className="mb-10">
                        <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900 flex items-center gap-3 mb-6"><span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Education</h2>
                        <div className="space-y-6 pl-11">
                          {previewData.education.map((edu, idx) => edu.degree && (
                            <div key={idx} className="relative">
                              <div className="absolute -left-[54px] top-1.5 w-3 h-3 bg-slate-400 border-4 border-slate-100 rounded-full"></div>
                              <strong className="text-slate-800 block text-[15px]">{edu.degree}</strong>
                              <span className="text-[14px] text-slate-500 block">{edu.school}</span>
                              <span className="text-[13px] font-semibold text-emerald-600 block mt-1">{edu.year}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
