import React from 'react';
import { 
  Award, 
  TrendingUp, 
  FileText, 
  Video, 
  CheckCircle2, 
  Map, 
  Briefcase, 
  ArrowRight,
  UserCheck
} from 'lucide-react';
import type { ATSAnalysisResult, SkillGapRoadmapResult } from '../services/geminiService';

interface DashboardProps {
  name: string;
  targetRole: string;
  atsResult: ATSAnalysisResult | null;
  roadmapResult: SkillGapRoadmapResult | null;
  interviewsCount: number;
  averageInterviewScore: number | null;
  setView: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  name,
  targetRole,
  atsResult,
  roadmapResult,
  interviewsCount,
  averageInterviewScore,
  setView
}) => {
  // Calculate stats
  const atsScore = atsResult ? atsResult.score : 0;
  
  // Calculate skills progress
  const skills = roadmapResult ? roadmapResult.skillsAnalysis : [];
  const matchedSkillsCount = skills.filter(s => s.status === 'match').length;
  const totalSkillsCount = skills.length || 8; // fallback to 8
  const skillsProgressPercent = totalSkillsCount > 0 
    ? Math.round((matchedSkillsCount / totalSkillsCount) * 100) 
    : 0;

  // Calculate overall Job Readiness Index (JRI)
  const interviewWeight = averageInterviewScore || 0;
  const jri = Math.round(
    (atsScore * 0.35) + 
    (skillsProgressPercent * 0.35) + 
    (interviewWeight * 0.30)
  ) || 0;

  // Determine readiness level description
  let readinessStatus = "Novice";
  let readinessColor = "var(--error)";
  if (jri >= 80) {
    readinessStatus = "Job Ready";
    readinessColor = "var(--success)";
  } else if (jri >= 50) {
    readinessStatus = "Developing";
    readinessColor = "var(--warning)";
  }

  // Get next learning milestone
  const nextMilestone = roadmapResult?.roadmap.find(step => step.status === 'active');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(20, 184, 166, 0.05) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2.5rem 2rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)' }}>
            Welcome back, {name || 'Aspiring Professional'}! 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px' }}>
            Here is your career preparation status for the target role: <strong style={{ color: 'var(--secondary)' }}>{targetRole || 'Software Engineer'}</strong>. Let's close your skill gaps and ace those interviews!
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setView('ats')}>
          Optimize Resume <ArrowRight size={18} />
        </button>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Left Side: JRI & Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Key Metrics Row */}
          <div className="stats-grid">
            <div className="card stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)' }}>
                <FileText size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{atsScore ? `${atsScore}%` : 'Not Checked'}</span>
                <span className="stat-label">ATS Resume Score</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--secondary)' }}>
                <UserCheck size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{matchedSkillsCount}/{totalSkillsCount}</span>
                <span className="stat-label">Skills Matched</span>
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent)' }}>
                <Video size={24} />
              </div>
              <div className="stat-details">
                <span className="stat-value">{interviewsCount}</span>
                <span className="stat-label">Mock Interviews</span>
              </div>
            </div>
          </div>

          {/* Action Center / Next Steps */}
          <div className="card">
            <h3 className="card-title"><TrendingUp size={20} color="var(--primary)" /> Action Center & Next Steps</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              
              {/* Task 1: Resume */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '12px',
                borderLeft: `4px solid ${atsScore >= 75 ? 'var(--success)' : 'var(--warning)'}`
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <CheckCircle2 size={20} color={atsScore >= 75 ? 'var(--success)' : 'var(--warning)'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Resume Optimization</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {atsScore === 0 
                        ? 'Upload your resume to check compatibility with job descriptions.' 
                        : atsScore < 75 
                          ? `Currently at ${atsScore}%. Target 75%+ to pass ATS checkers.` 
                          : 'ATS compatibility is in the green zone! Good job.'}
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setView('ats')}>
                  {atsScore === 0 ? 'Upload' : 'Improve'}
                </button>
              </div>

              {/* Task 2: Skills Roadmap */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '12px',
                borderLeft: `4px solid ${nextMilestone ? 'var(--primary)' : 'var(--success)'}`
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Map size={20} color={nextMilestone ? 'var(--primary)' : 'var(--success)'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Learning Roadmap</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {nextMilestone 
                        ? `Next Milestone: ${nextMilestone.title} (${nextMilestone.duration})` 
                        : 'Roadmap fully complete or not generated yet.'}
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setView('roadmap')}>
                  View Roadmap
                </button>
              </div>

              {/* Task 3: Mock Interview */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '1rem', 
                background: 'rgba(255,255,255,0.02)', 
                borderRadius: '12px',
                borderLeft: `4px solid ${averageInterviewScore ? 'var(--success)' : 'var(--accent)'}`
              }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Video size={20} color={averageInterviewScore ? 'var(--success)' : 'var(--accent)'} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Mock Interview Training</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {interviewsCount === 0 
                        ? 'Practice technical & behavioral questions with real-time AI evaluation.' 
                        : `Avg Score: ${averageInterviewScore || 0}/100. Practice more to raise scores.`}
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }} onClick={() => setView('interview')}>
                  {interviewsCount === 0 ? 'Start' : 'Retry'}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Job Readiness Index */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Circular Indicator Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', minHeight: '320px' }}>
            <h3 style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem' }}>
              <Award size={20} color="var(--secondary)" /> Job Readiness Index
            </h3>
            
            <div style={{ margin: '2rem 0' }}>
              {/* SVG Ring Progress */}
              <div className="progress-ring-container">
                <svg width="180" height="180" viewBox="0 0 180 180">
                  <circle 
                    cx="90" 
                    cy="90" 
                    r="75" 
                    stroke="var(--bg-tertiary)" 
                    strokeWidth="12" 
                    fill="transparent" 
                  />
                  <circle 
                    cx="90" 
                    cy="90" 
                    r="75" 
                    stroke="url(#gradientJRI)" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray={471}
                    strokeDashoffset={471 - (471 * jri) / 100}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }}
                  />
                  <defs>
                    <linearGradient id="gradientJRI" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--primary)" />
                      <stop offset="100%" stopColor="var(--secondary)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="progress-ring-text">
                  <span className="progress-value" style={{ textShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}>{jri}%</span>
                  <span className="progress-label" style={{ color: readinessColor }}>{readinessStatus}</span>
                </div>
              </div>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Computed dynamically from your Resume Check (35%), Roadmap completion (35%), and Mock Interview ratings (30%).
            </p>
          </div>

          {/* Quick Info / Recommended Internships Shortcut */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <Briefcase size={18} color="var(--secondary)" /> Match Internship
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Explore internship opportunities that match your verified skill set.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setView('internships')}>
              View Matches <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
