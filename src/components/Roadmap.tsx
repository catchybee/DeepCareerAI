import React from 'react';
import { 
  Map, 
  CheckCircle2, 
  ExternalLink, 
  Circle, 
  AlertCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import type { SkillGapRoadmapResult, RoadmapStep } from '../services/geminiService';

interface RoadmapProps {
  targetRole: string;
  roadmapResult: SkillGapRoadmapResult | null;
  onUpdateStepStatus: (stepId: number, status: 'completed' | 'active' | 'pending') => void;
}

export const Roadmap: React.FC<RoadmapProps> = ({
  targetRole,
  roadmapResult,
  onUpdateStepStatus
}) => {
  if (!roadmapResult) {
    return (
      <div className="card animate-page-entry" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-secondary)' }}>
        <Map size={64} color="var(--card-border)" style={{ marginBottom: '1.5rem' }} />
        <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No Roadmap Generated</h3>
        <p style={{ fontSize: '0.9rem', maxWidth: '400px' }}>
          Please go to the <strong>ATS Resume Checker</strong> tab and perform an analysis first. This will extract your skills, analyze the gap, and build your personalized learning roadmap.
        </p>
      </div>
    );
  }

  const { skillsAnalysis, roadmap } = roadmapResult;

  // Calculate statistics
  const matchedSkills = skillsAnalysis.filter(s => s.status === 'match');
  const missingSkills = skillsAnalysis.filter(s => s.status === 'missing');
  const matchPercentage = Math.round((matchedSkills.length / skillsAnalysis.length) * 100) || 0;

  // Render Criticality Badge
  const renderCriticality = (level: string) => {
    let color = 'var(--text-secondary)';
    let bg = 'rgba(255,255,255,0.03)';
    
    if (level === 'high') {
      color = 'var(--error)';
      bg = 'rgba(239, 68, 68, 0.1)';
    } else if (level === 'medium') {
      color = 'var(--warning)';
      bg = 'rgba(245, 158, 11, 0.1)';
    } else if (level === 'low') {
      color = 'var(--secondary)';
      bg = 'rgba(20, 184, 166, 0.1)';
    }

    return (
      <span style={{ 
        fontSize: '0.7rem', 
        color, 
        background: bg, 
        padding: '0.15rem 0.5rem', 
        borderRadius: '4px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        {level} Priority
      </span>
    );
  };

  // Toggle step checklist completion state
  const handleCheckboxToggle = (step: RoadmapStep) => {
    const nextStatus = step.status === 'completed' ? 'active' : 'completed';
    onUpdateStepStatus(step.id, nextStatus);
  };

  return (
    <div className="animate-page-entry" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Personalized Learning Roadmap</h1>
          <span className="page-subtitle">Your strategic learning milestones to close skill gaps for: <strong style={{ color: 'var(--secondary)' }}>{targetRole}</strong></span>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
        
        {/* Left Side: Skill Gap Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Skill Progress Stats Card */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 className="card-title">
              <TrendingUp size={20} color="var(--secondary)" /> Skill Profile Progress
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Overall Skill Match</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>{matchPercentage}%</strong>
            </div>

            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${matchPercentage}%` }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--success)' }}>{matchedSkills.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Matched Skills</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--error)' }}>{missingSkills.length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Missing Gaps</div>
              </div>
            </div>
          </div>

          {/* Skill Checklist Card */}
          <div className="card">
            <h3 className="card-title">
              <Award size={20} color="var(--primary)" /> Skill Gap Breakdown
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {skillsAnalysis.map((skill, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'rgba(255,255,255,0.01)',
                    borderRadius: '10px',
                    border: '1px solid var(--card-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {skill.status === 'match' ? (
                      <CheckCircle2 size={18} color="var(--success)" />
                    ) : (
                      <AlertCircle size={18} color="var(--error)" />
                    )}
                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: skill.status === 'match' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {skill.name}
                    </span>
                  </div>
                  
                  {skill.status === 'missing' && renderCriticality(skill.criticality)}
                  {skill.status === 'match' && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--success)', background: 'rgba(16,185,129,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 'bold' }}>
                      VERIFIED
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Timeline Steps */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
            <Map size={20} color="var(--primary)" /> Step-by-Step Learning Timeline
          </h3>

          <div className="roadmap-timeline">
            {roadmap.map((step, index) => {
              const isCompleted = step.status === 'completed';
              const isActive = step.status === 'active';
              
              return (
                <div 
                  key={step.id} 
                  className={`roadmap-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                >
                  {/* Circular step badge icon */}
                  <div className="roadmap-step-badge">
                    {isCompleted ? (
                      <CheckCircle2 size={24} />
                    ) : isActive ? (
                      <Circle size={20} className="animate-pulse" style={{ fill: 'rgba(139,92,246,0.2)' }} />
                    ) : (
                      <Circle size={20} color="var(--text-muted)" />
                    )}
                  </div>

                  {/* Step details panel */}
                  <div className="roadmap-step-content" style={{ 
                    borderLeft: isActive ? '3px solid var(--primary)' : '1px solid var(--card-border)'
                  }}>
                    
                    <div className="roadmap-step-title">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.9rem', color: isCompleted ? 'var(--success)' : isActive ? 'var(--primary)' : 'var(--text-secondary)', fontWeight: 'bold' }}>
                          Milestone {index + 1}
                        </span>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{step.title}</h4>
                      </div>
                      <span className="roadmap-step-duration">{step.duration}</span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.75rem 0', lineHeight: 1.5 }}>
                      {step.description}
                    </p>

                    {/* Interactive Completion Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: isCompleted ? 'var(--success)' : 'var(--text-secondary)' }}>
                        <input 
                          type="checkbox" 
                          checked={isCompleted}
                          onChange={() => handleCheckboxToggle(step)}
                          style={{ 
                            width: '16px', 
                            height: '16px', 
                            cursor: 'pointer',
                            accentColor: 'var(--success)'
                          }} 
                        />
                        <span>{isCompleted ? 'Marked as Learned' : 'Mark Milestone as Completed'}</span>
                      </label>

                      {step.resource && (
                        <a 
                          href={step.resource} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="roadmap-resource-link"
                          style={{ margin: 0 }}
                        >
                          {step.resourceTitle || 'Resource link'} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};
