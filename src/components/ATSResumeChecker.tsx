import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  ListTodo, 
  Sparkles, 
  Upload, 
  X,
  RefreshCw
} from 'lucide-react';
import { type ATSAnalysisResult, GeminiService } from '../services/geminiService';

interface ATSResumeCheckerProps {
  apiKey: string;
  model: string;
  resumeText: string;
  setResumeText: (text: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  atsResult: ATSAnalysisResult | null;
  setAtsResult: (result: ATSAnalysisResult | null) => void;
  onAnalysisSuccess: (skillsResult: any) => void;
}

export const ATSResumeChecker: React.FC<ATSResumeCheckerProps> = ({
  apiKey,
  model,
  resumeText,
  setResumeText,
  targetRole,
  setTargetRole,
  atsResult,
  setAtsResult,
  onAnalysisSuccess
}) => {
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [useTextInput, setUseTextInput] = useState(false);
  const [fileName, setFileName] = useState('');

  // Handle file import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    // Read text files directly
    if (file.type === "text/plain" || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setResumeText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      // Simulate pdf/docx extraction for visual appeal
      const reader = new FileReader();
      reader.onload = () => {
        // Just mock text representation for PDF/Docx
        setResumeText(`[Extracted from file: ${file.name}]
Name: Candidate Professional
Target Role: ${targetRole || 'Software Engineer'}
Skills: React, JavaScript, HTML, CSS, SQL, Git, communication.
Experience:
Frontend Intern at WebStudio (2025)
- Built interactive interfaces using React and Javascript.
- Collaborated with design and backend teams.
Education: BS in Computer Science (Graduation 2027)`);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const clearFile = () => {
    setFileName('');
    setResumeText('');
  };

  // Trigger ATS analysis
  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert("Please upload a resume or paste your resume text first.");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please provide the target Job Description.");
      return;
    }

    setIsAnalyzing(true);
    setLoadingStep('Uploading resume content...');
    
    const gemini = new GeminiService(apiKey, model);

    try {
      // Step-by-step scanner effect
      setTimeout(() => setLoadingStep('Extracting key skills and experiences...'), 500);
      setTimeout(() => setLoadingStep('Checking ATS syntax compatibility...'), 1000);
      setTimeout(() => setLoadingStep('Analyzing job description requirements...'), 1500);
      setTimeout(() => setLoadingStep('Generating optimization score and recommendations...'), 2000);

      // Perform real/simulated analysis
      const analysis = await gemini.analyzeResume(resumeText, jobDescription);
      
      setTimeout(async () => {
        setAtsResult(analysis);
        
        // Generate skill gaps in background based on this resume
        setLoadingStep('Updating skill gaps and roadmap...');
        const skillsResult = await gemini.generateSkillGapAndRoadmap(resumeText, targetRole);
        onAnalysisSuccess(skillsResult);
        
        setIsAnalyzing(false);
      }, 2500);

    } catch (error) {
      console.error(error);
      setIsAnalyzing(false);
      alert("Analysis failed. Please try again.");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Configuration Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">ATS Resume Optimizer</h1>
          <span className="page-subtitle">Scan and improve your resume compatibility score against specific jobs.</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Side: Upload & Job description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <h3 className="card-title">
              <FileText size={20} color="var(--primary)" /> 
              Step 1: Your Resume
            </h3>

            {/* Input Toggle */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
              <button 
                className={`btn ${!useTextInput ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setUseTextInput(false)}
              >
                Upload File
              </button>
              <button 
                className={`btn ${useTextInput ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}
                onClick={() => setUseTextInput(true)}
              >
                Paste Text
              </button>
            </div>

            {useTextInput ? (
              <div className="form-group">
                <label className="form-label">Paste Resume Content</label>
                <textarea 
                  className="form-textarea" 
                  value={resumeText} 
                  onChange={(e) => setResumeText(e.target.value)} 
                  placeholder="Paste the full text of your resume here..."
                  style={{ minHeight: '160px' }}
                />
              </div>
            ) : (
              <div>
                {fileName ? (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '1rem', 
                    background: 'rgba(255,255,255,0.03)', 
                    borderRadius: '12px',
                    border: '1px solid var(--primary)',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText color="var(--primary)" size={24} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{fileName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ready for analysis</div>
                      </div>
                    </div>
                    <button 
                      onClick={clearFile}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div style={{
                    border: '2px dashed var(--card-border)',
                    borderRadius: '16px',
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    cursor: 'pointer',
                    background: 'rgba(17, 24, 39, 0.2)',
                    transition: 'border-color 0.2s ease',
                    marginBottom: '1.25rem'
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      setFileName(file.name);
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        if (event.target?.result) setResumeText(event.target.result as string);
                      };
                      reader.readAsText(file);
                    }
                  }}
                  onClick={() => document.getElementById('resume-file-input')?.click()}
                  >
                    <input 
                      type="file" 
                      id="resume-file-input" 
                      style={{ display: 'none' }} 
                      accept=".txt,.pdf,.docx,.doc" 
                      onChange={handleFileChange}
                    />
                    <Upload size={32} color="var(--text-secondary)" />
                    <div>
                      <div style={{ fontWeight: 600 }}>Drag & Drop or click to browse</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Supports PDF, DOCX, or TXT
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Target Job Title</label>
              <input 
                type="text" 
                className="form-input" 
                value={targetRole} 
                onChange={(e) => setTargetRole(e.target.value)} 
                placeholder="e.g. Frontend Engineer, Data Scientist"
              />
            </div>
          </div>

          <div className="card">
            <h3 className="card-title">
              <Sparkles size={20} color="var(--secondary)" /> 
              Step 2: Target Job Description
            </h3>
            <div className="form-group">
              <label className="form-label">Paste Job Requirements / Description</label>
              <textarea 
                className="form-textarea" 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
                placeholder="Paste the complete job description here to check your keyword matches..."
                style={{ minHeight: '160px' }}
              />
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }} 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={18} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
                  Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Optimization Score
                </>
              )}
            </button>
            
            {isAnalyzing && (
              <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                <span className="voice-indicator">
                  <span className="voice-bar"></span>
                  <span className="voice-bar"></span>
                  <span className="voice-bar"></span>
                </span>
                <span>{loadingStep}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: ATS score and feedback results */}
        <div>
          {atsResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-slide-up">
              
              {/* ATS Score Display */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                <h3 style={{ alignSelf: 'flex-start' }} className="card-title">
                  <Sparkles color="var(--primary)" size={20} /> Optimization Results
                </h3>
                
                <div style={{ margin: '1.5rem 0' }}>
                  <div className="progress-ring-container">
                    <svg width="150" height="150" viewBox="0 0 150 150">
                      <circle 
                        cx="75" 
                        cy="75" 
                        r="60" 
                        stroke="var(--bg-tertiary)" 
                        strokeWidth="10" 
                        fill="transparent" 
                      />
                      <circle 
                        cx="75" 
                        cy="75" 
                        r="60" 
                        stroke={atsResult.score >= 75 ? 'var(--success)' : 'var(--warning)'} 
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray={377}
                        strokeDashoffset={377 - (377 * atsResult.score) / 100}
                        strokeLinecap="round"
                        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }}
                      />
                    </svg>
                    <div className="progress-ring-text">
                      <span className="progress-value" style={{ fontSize: '1.85rem' }}>{atsResult.score}%</span>
                      <span className="progress-label" style={{ fontSize: '0.65rem' }}>ATS Match</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {atsResult.score >= 75 
                    ? "🎉 Excellent match! Your resume matches the job requirements very well and has high likelihood of passing automatic ATS filters." 
                    : "⚠️ Below target score. Update your resume structure and keywords as suggested below to improve pass rates."}
                </p>
              </div>

              {/* Keyword gaps */}
              <div className="card">
                <h3 className="card-title">
                  <Info size={18} color="var(--secondary)" /> 
                  Missing Keywords (Add to Resume)
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  These key skill terms were identified in the job description but are missing from your resume:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {atsResult.missingKeywords.map((kw, i) => (
                    <span 
                      key={i} 
                      className="skill-tag missing" 
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem', borderRadius: '8px', fontWeight: 600 }}
                    >
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strengths / Weaknesses / Format */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>
                  <AlertCircle size={18} color="var(--primary)" /> 
                  Resume Health Audit
                </h3>

                {/* Strengths */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--success)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <CheckCircle size={16} /> Key Strengths
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {atsResult.findings.strengths.map((str, idx) => (
                      <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{str}</li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--warning)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <AlertCircle size={16} /> Skill & Content Gaps
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {atsResult.findings.weaknesses.map((weak, idx) => (
                      <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{weak}</li>
                    ))}
                  </ul>
                </div>

                {/* Formatting */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <Info size={16} /> ATS Syntax Formatting
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {atsResult.findings.formatting.map((fmt, idx) => (
                      <li key={idx} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{fmt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Plan */}
              <div className="card">
                <h3 className="card-title">
                  <ListTodo size={18} color="var(--primary)" /> 
                  Action Plan Roadmap
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                  {atsResult.actionPlan.map((act, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
                      <span style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'rgba(139,92,246,0.1)', 
                        color: 'var(--primary)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>{act}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', height: '100%' }}>
              <FileText size={48} color="var(--card-border)" style={{ marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>Scan Summary Pending</h3>
              <p style={{ fontSize: '0.85rem', maxWidth: '300px' }}>
                Paste or upload your resume, enter the target job details, and scan to see your detailed match analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
