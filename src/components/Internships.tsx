import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Sparkles,
  Search,
  Filter,
  CheckCircle,
  X,
  FileText
} from 'lucide-react';
import type { Internship, SkillGapItem } from '../services/geminiService';

interface InternshipsProps {
  skills: SkillGapItem[];
  internships: Internship[];
  onApply: (internshipId: number) => void;
}

export const Internships: React.FC<InternshipsProps> = ({
  skills: _skills,
  internships,
  onApply
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationStep, setApplicationStep] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  // Apply filters
  const filteredInternships = internships.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = locationFilter === 'All' || 
                            (locationFilter === 'Remote' && item.location.toLowerCase().includes('remote')) ||
                            (locationFilter === 'Hybrid' && item.location.toLowerCase().includes('hybrid')) ||
                            (locationFilter === 'Onsite' && !item.location.toLowerCase().includes('remote') && !item.location.toLowerCase().includes('hybrid'));

    return matchesSearch && matchesLocation;
  });

  // Mock AI application process
  const triggerApplication = (item: Internship) => {
    setIsApplying(true);
    setApplicationSuccess(false);
    setApplicationStep('Reading target job requirements...');
    
    setTimeout(() => {
      setApplicationStep('Tailoring cover letter using Gemini AI...');
    }, 800);
    
    setTimeout(() => {
      setApplicationStep('Formatting resume fields for ATS alignment...');
    }, 1600);

    setTimeout(() => {
      setApplicationStep('Submitting application package...');
    }, 2400);

    setTimeout(() => {
      setIsApplying(false);
      setApplicationSuccess(true);
      onApply(item.id);
    }, 3200);
  };

  const closeDrawer = () => {
    setSelectedInternship(null);
    setApplicationSuccess(false);
    setApplicationStep('');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Internship Recommendations</h1>
          <span className="page-subtitle">Matched opportunities based on your current resume skills and target career path.</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="card" style={{ padding: '1.25rem 2rem' }}>
        <div className="search-filter-row">
          
          {/* Search bar */}
          <div style={{ position: 'relative', flexGrow: 1, minWidth: '240px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }}>
              <Search size={18} />
            </span>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search internships by title or company..." 
              style={{ paddingLeft: '2.5rem', margin: 0, height: '44px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Location dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '180px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              <Filter size={16} />
            </span>
            <select 
              className="form-select" 
              style={{ margin: 0, height: '44px' }}
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Onsite">Onsite</option>
            </select>
          </div>

        </div>
      </div>

      {/* Grid of Results */}
      {filteredInternships.length > 0 ? (
        <div className="internships-grid">
          {filteredInternships.map((item) => (
            <div key={item.id} className="card internship-card">
              
              {/* Match score pill */}
              <div className="internship-match-pill" style={{
                background: item.matchScore >= 80 ? 'rgba(20, 184, 166, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: item.matchScore >= 80 ? 'var(--secondary)' : 'var(--warning)',
                borderColor: item.matchScore >= 80 ? 'rgba(20, 184, 166, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              }}>
                {item.matchScore}% Match
              </div>

              {/* Company Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '8px', 
                  background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1rem'
                }}>
                  {item.company.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{item.title}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.company}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="internship-tags">
                <span className="internship-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={12} /> {item.location}
                </span>
                <span className="internship-tag" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <DollarSign size={12} /> {item.stipend}
                </span>
                {item.tags.slice(2).map((tag, idx) => (
                  <span key={idx} className="internship-tag">{tag}</span>
                ))}
              </div>

              {/* Skill Matching Info */}
              <div style={{ margin: '0.5rem 0 1.25rem 0', flexGrow: 1 }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 500 }}>
                  Skill Matching:
                </span>
                <div className="skills-list">
                  {item.skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className={`skill-tag ${skill.match ? 'match' : 'missing'}`}
                    >
                      {skill.match ? '✓' : '+'} {skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => setSelectedInternship(item)}
              >
                Learn More & Apply
              </button>

            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <Briefcase size={48} color="var(--card-border)" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ color: 'white', marginBottom: '0.5rem' }}>No Internships Found</h3>
          <p style={{ fontSize: '0.85rem' }}>
            Try resetting your search query or choosing another location filter.
          </p>
        </div>
      )}

      {/* Applied Slide-out Drawer / Modal */}
      {selectedInternship && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(5, 7, 12, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'flex-end',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-out'
        }}>
          
          {/* Main Drawer Body */}
          <div style={{
            width: '100%',
            maxWidth: '560px',
            height: '100vh',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--card-border)',
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            overflowY: 'auto'
          }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: 'var(--secondary)', 
                  background: 'rgba(20,184,166,0.1)', 
                  padding: '0.25rem 0.6rem', 
                  borderRadius: '20px', 
                  fontWeight: 'bold' 
                }}>
                  {selectedInternship.matchScore}% Skills Match
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem', color: 'white' }}>
                  {selectedInternship.title}
                </h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                  {selectedInternship.company} — <span style={{ color: 'var(--text-muted)' }}>{selectedInternship.location}</span>
                </div>
              </div>
              <button 
                onClick={closeDrawer}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)' }} />

            {/* Description */}
            <div>
              <h3 style={{ fontSize: '1rem', color: 'white', marginBottom: '0.5rem' }}>About the Role</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {selectedInternship.description}
              </p>
            </div>

            {/* Matching profile */}
            <div>
              <h3 style={{ fontSize: '1rem', color: 'white', marginBottom: '0.5rem' }}>Skill Requirements</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
                {selectedInternship.skills.map((skill, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.01)', borderRadius: '8px', border: '1px solid var(--card-border)' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{skill.name}</span>
                    {skill.match ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 'bold' }}>✓ Matched in Resume</span>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--error)', fontWeight: 'bold' }}>+ Skill Gap</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--card-border)' }} />

            {/* Bottom Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {isApplying ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1.25rem', 
                  background: 'rgba(20,184,166,0.03)', 
                  border: '1px solid var(--secondary)', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  color: 'var(--secondary)',
                  fontSize: '0.9rem'
                }}>
                  <span className="voice-indicator">
                    <span className="voice-bar"></span>
                    <span className="voice-bar"></span>
                    <span className="voice-bar"></span>
                  </span>
                  <strong>{applicationStep}</strong>
                </div>
              ) : applicationSuccess ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1.25rem', 
                  background: 'rgba(16,185,129,0.05)', 
                  border: '1px solid var(--success)', 
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem',
                  color: 'var(--success)',
                  fontSize: '0.9rem'
                }}>
                  <strong style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <CheckCircle size={18} /> Application Submitted Successfully!
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Your optimized AI resume and cover letter have been submitted to {selectedInternship.company}.
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flexGrow: 1 }}
                    onClick={closeDrawer}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    style={{ flexGrow: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={() => triggerApplication(selectedInternship)}
                  >
                    <Sparkles size={16} /> Instant Apply with AI Resume
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <FileText size={12} /> Powered by Gemini ATS Reshaper
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
