import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  Map, 
  Briefcase, 
  Settings as SettingsIcon,
  Sparkles
} from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ATSResumeChecker } from './components/ATSResumeChecker';
import { MockInterviews } from './components/MockInterviews';
import { Roadmap } from './components/Roadmap';
import { Internships } from './components/Internships';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { ATSAnalysisResult, SkillGapRoadmapResult, Internship } from './services/geminiService';

// 1. Root Entry Component
export default function App({ isConvexActive }: { isConvexActive: boolean }) {
  // Session User Auth state managed at the top common parent
  const [user, setUser] = useState<{
    userId: string;
    name: string;
    email: string;
    targetRole: string;
    education: string;
  } | null>(() => {
    const saved = localStorage.getItem('deepcareer_session');
    return saved ? JSON.parse(saved) : null;
  });

  const handleAuthSuccess = (u: any) => {
    setUser(u);
    localStorage.setItem('deepcareer_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('deepcareer_session');
  };

  return (
    <>
      {/* Premium background decorative blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      {isConvexActive ? (
        <AppWithConvex 
          user={user} 
          onAuthSuccess={handleAuthSuccess} 
          onLogout={handleLogout} 
        />
      ) : (
        <AppContent 
          isConvexActive={false} 
          user={user} 
          onAuthSuccess={handleAuthSuccess} 
          onLogout={handleLogout} 
        />
      )}
    </>
  );
}

// 2. Convex Hook Binder Component (Rendered conditionally based on VITE_CONVEX_URL check)
function AppWithConvex({ user, onAuthSuccess, onLogout }: {
  user: any;
  onAuthSuccess: (u: any) => void;
  onLogout: () => void;
}) {
  const signup = useMutation(api.users.signup);
  const login = useMutation(api.users.login);
  const updateProfile = useMutation(api.users.updateProfile);
  
  // Live user profile fetch hook called unconditionally inside this component context
  const liveUser = useQuery(api.users.get, user?.userId ? { userId: user.userId } : "skip" as any);

  return (
    <AppContent
      isConvexActive={true}
      user={user}
      liveUser={liveUser}
      onAuthSuccess={onAuthSuccess}
      onLogout={onLogout}
      convexSignup={signup}
      convexLogin={login}
      convexUpdateProfile={updateProfile}
    />
  );
}

// 3. Main Content / Layout View Component
function AppContent({
  isConvexActive,
  user,
  liveUser,
  onAuthSuccess,
  onLogout,
  convexSignup,
  convexLogin,
  convexUpdateProfile
}: {
  isConvexActive: boolean;
  user: any;
  liveUser?: any;
  onAuthSuccess: (u: any) => void;
  onLogout: () => void;
  convexSignup?: any;
  convexLogin?: any;
  convexUpdateProfile?: any;
}) {
  // Navigation View
  const [view, setView] = useState<string>('dashboard');

  // User Profile States (loaded from localStorage or defaults)
  const [name, setName] = useState<string>('Alex Johnson');
  const [targetRole, setTargetRole] = useState<string>('Frontend Engineer');
  const [education, setEducation] = useState<string>('BS in Computer Science');
  
  // API settings
  const [apiKey, setApiKey] = useState<string>('');
  const [model, setModel] = useState<string>('gemini-2.5-flash');

  // Data analysis states
  const [resumeText, setResumeText] = useState<string>('');
  const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
  const [roadmapResult, setRoadmapResult] = useState<SkillGapRoadmapResult | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);

  // Mock interview stats
  const [interviewsCount, setInterviewsCount] = useState<number>(0);
  const [averageInterviewScore, setAverageInterviewScore] = useState<number | null>(null);

  // Sync state changes with user-isolated localStorage whenever the active user changes
  useEffect(() => {
    if (user) {
      const suffix = user.userId;
      
      const savedName = localStorage.getItem(`deepcareer_${suffix}_name`) || user.name;
      const savedRole = localStorage.getItem(`deepcareer_${suffix}_targetRole`) || user.targetRole;
      const savedEdu = localStorage.getItem(`deepcareer_${suffix}_education`) || user.education;
      
      setName(savedName);
      setTargetRole(savedRole);
      setEducation(savedEdu);

      const savedAts = localStorage.getItem(`deepcareer_${suffix}_atsResult`);
      setAtsResult(savedAts ? JSON.parse(savedAts) : null);

      const savedRoadmap = localStorage.getItem(`deepcareer_${suffix}_roadmapResult`);
      setRoadmapResult(savedRoadmap ? JSON.parse(savedRoadmap) : null);

      const savedInternships = localStorage.getItem(`deepcareer_${suffix}_internships`);
      setInternships(savedInternships ? JSON.parse(savedInternships) : []);

      const savedCount = localStorage.getItem(`deepcareer_${suffix}_interviewsCount`);
      setInterviewsCount(savedCount ? parseInt(savedCount, 10) : 0);

      const savedAvg = localStorage.getItem(`deepcareer_${suffix}_averageInterviewScore`);
      setAverageInterviewScore(savedAvg ? parseInt(savedAvg, 10) : null);

      const savedResume = localStorage.getItem(`deepcareer_${suffix}_resumeText`);
      setResumeText(savedResume || '');
      
      const savedApiKey = localStorage.getItem(`deepcareer_${suffix}_apiKey`);
      setApiKey(savedApiKey || '');
      
      const savedModel = localStorage.getItem(`deepcareer_${suffix}_model`);
      setModel(savedModel || 'gemini-2.5-flash');
    } else {
      // Clear/Reset to defaults
      setName('Alex Johnson');
      setTargetRole('Frontend Engineer');
      setEducation('BS in Computer Science');
      setApiKey('');
      setModel('gemini-2.5-flash');
      setResumeText('');
      setAtsResult(null);
      setRoadmapResult(null);
      setInternships([]);
      setInterviewsCount(0);
      setAverageInterviewScore(null);
    }
  }, [user]);

  // Sync live profile details when liveUser query updates from Convex
  useEffect(() => {
    const lu = liveUser as any;
    if (isConvexActive && lu && user) {
      setName(lu.name);
      setTargetRole(lu.targetRole);
      setEducation(lu.education);
      if (lu.apiKey) {
        setApiKey(lu.apiKey);
        localStorage.setItem(`deepcareer_${user.userId}_apiKey`, lu.apiKey);
      }
    }
  }, [liveUser, isConvexActive, user]);

  // Save changes to local storage when state changes (only for active user session)
  useEffect(() => {
    if (user) {
      const suffix = user.userId;
      localStorage.setItem(`deepcareer_${suffix}_name`, name);
      localStorage.setItem(`deepcareer_${suffix}_targetRole`, targetRole);
      localStorage.setItem(`deepcareer_${suffix}_education`, education);
      localStorage.setItem(`deepcareer_${suffix}_apiKey`, apiKey);
      localStorage.setItem(`deepcareer_${suffix}_model`, model);
      localStorage.setItem(`deepcareer_${suffix}_resumeText`, resumeText);
      localStorage.setItem(`deepcareer_${suffix}_interviewsCount`, interviewsCount.toString());
      if (averageInterviewScore !== null) {
        localStorage.setItem(`deepcareer_${suffix}_averageInterviewScore`, averageInterviewScore.toString());
      } else {
        localStorage.removeItem(`deepcareer_${suffix}_averageInterviewScore`);
      }
      if (atsResult) {
        localStorage.setItem(`deepcareer_${suffix}_atsResult`, JSON.stringify(atsResult));
      } else {
        localStorage.removeItem(`deepcareer_${suffix}_atsResult`);
      }
      if (roadmapResult) {
        localStorage.setItem(`deepcareer_${suffix}_roadmapResult`, JSON.stringify(roadmapResult));
      } else {
        localStorage.removeItem(`deepcareer_${suffix}_roadmapResult`);
      }
      localStorage.setItem(`deepcareer_${suffix}_internships`, JSON.stringify(internships));
    }
  }, [user, name, targetRole, education, apiKey, model, resumeText, interviewsCount, averageInterviewScore, atsResult, roadmapResult, internships]);

  // Handler for saving settings page
  const handleSaveSettings = async () => {
    if (user) {
      const suffix = user.userId;
      localStorage.setItem(`deepcareer_${suffix}_name`, name);
      localStorage.setItem(`deepcareer_${suffix}_targetRole`, targetRole);
      localStorage.setItem(`deepcareer_${suffix}_education`, education);
      localStorage.setItem(`deepcareer_${suffix}_apiKey`, apiKey);
      localStorage.setItem(`deepcareer_${suffix}_model`, model);

      // Save in local storage session
      const updatedUser = { ...user, name, targetRole, education };
      onAuthSuccess(updatedUser); // Update user state in root component

      // Save in mock list of users
      const usersRaw = localStorage.getItem('deepcareer_users') || '[]';
      const users = JSON.parse(usersRaw);
      const updatedUsers = users.map((u: any) => u.userId === user.userId ? { ...u, name, targetRole, education } : u);
      localStorage.setItem('deepcareer_users', JSON.stringify(updatedUsers));

      // Save in live Convex database if active
      if (isConvexActive && convexUpdateProfile) {
        try {
          await convexUpdateProfile({
            userId: user.userId,
            name,
            targetRole,
            education,
            apiKey: apiKey || undefined,
          });
        } catch (err) {
          console.error("Failed to sync profile update to Convex:", err);
        }
      }
    }
  };

  // Handler when ATS Check succeeds
  const handleAnalysisSuccess = (skillsResult: SkillGapRoadmapResult) => {
    setRoadmapResult(skillsResult);
    if (user) {
      localStorage.setItem(`deepcareer_${user.userId}_roadmapResult`, JSON.stringify(skillsResult));
    }

    // Generate internship recommendations matching the new skills analysis
    const hasTypeScript = skillsResult.skillsAnalysis.find(s => s.name === 'TypeScript' && s.status === 'match');
    const mockInternships: Internship[] = [
      {
        id: 1,
        title: 'Frontend Developer Intern',
        company: 'InnovateTech Solutions',
        matchScore: skillsResult.skillsAnalysis.filter(s => s.status === 'match').length > 5 ? 90 : 75,
        location: 'Remote',
        stipend: '$800 - $1,200 / month',
        skills: [
          { name: 'React.js', match: true },
          { name: 'HTML5 & CSS3', match: true },
          { name: 'TypeScript', match: !!hasTypeScript },
          { name: 'REST APIs & Integration', match: skillsResult.skillsAnalysis.find(s => s.name.includes('API') && s.status === 'match') !== undefined }
        ],
        tags: ['Remote', 'Paid', 'Flexible hours', '3-6 Months'],
        description: 'Join our agile frontend team building SaaS solutions. You will participate in creating pixel-perfect pages, building reusable React components, and integrating RESTful APIs.'
      },
      {
        id: 2,
        title: 'Software Engineering Intern (Web)',
        company: 'WebSphere Studio',
        matchScore: skillsResult.skillsAnalysis.filter(s => s.status === 'match').length > 6 ? 85 : 68,
        location: 'Hybrid (San Francisco, CA)',
        stipend: '$1,500 - $2,000 / month',
        skills: [
          { name: 'JavaScript (ES6+)', match: true },
          { name: 'React.js', match: true },
          { name: 'Git & GitHub Version Control', match: true },
          { name: 'TypeScript', match: !!hasTypeScript }
        ],
        tags: ['Hybrid', 'Paid', 'Mentorship Program', 'Summer 2026'],
        description: 'Collaborate closely with product designers and senior backend developers to build next-generation collaboration tools. Mentorship will be provided by our senior engineers.'
      },
      {
        id: 3,
        title: 'React Native Mobile Developer Intern',
        company: 'AppVenture Digital',
        matchScore: 65,
        location: 'Remote',
        stipend: '$600 - $900 / month',
        skills: [
          { name: 'JavaScript (ES6+)', match: true },
          { name: 'React.js', match: true },
          { name: 'TypeScript', match: !!hasTypeScript },
          { name: 'State Management (Redux/Zustand)', match: false }
        ],
        tags: ['Remote', 'Paid', 'Early-stage Startup', 'Part-time'],
        description: 'Contribute directly to our mobile application codebases. Opportunity to learn React Native, mobile layouts, and pushing updates via CodePush.'
      }
    ];

    setInternships(mockInternships);
    if (user) {
      localStorage.setItem(`deepcareer_${user.userId}_internships`, JSON.stringify(mockInternships));
    }
  };

  // Handler for roadmaps step checklist status updates
  const handleUpdateStepStatus = (stepId: number, status: 'completed' | 'active' | 'pending') => {
    if (!roadmapResult || !user) return;

    const updatedRoadmap = roadmapResult.roadmap.map(step => {
      if (step.id === stepId) {
        return { ...step, status };
      }
      return step;
    });

    const targetStep = roadmapResult.roadmap.find(s => s.id === stepId);
    let updatedSkills = [...roadmapResult.skillsAnalysis];
    
    if (targetStep && status === 'completed') {
      const matchedSkill = updatedSkills.find(s => targetStep.title.toLowerCase().includes(s.name.toLowerCase()));
      if (matchedSkill) {
        updatedSkills = updatedSkills.map(s => s.name === matchedSkill.name ? { ...s, status: 'match' as const } : s);
      }
    } else if (targetStep && status !== 'completed') {
      const matchedSkill = updatedSkills.find(s => targetStep.title.toLowerCase().includes(s.name.toLowerCase()));
      if (matchedSkill) {
        updatedSkills = updatedSkills.map(s => s.name === matchedSkill.name ? { ...s, status: 'missing' as const } : s);
      }
    }

    const newResult = {
      skillsAnalysis: updatedSkills,
      roadmap: updatedRoadmap
    };

    setRoadmapResult(newResult);
    localStorage.setItem(`deepcareer_${user.userId}_roadmapResult`, JSON.stringify(newResult));

    // Update internships skill match accordingly
    const hasTypeScript = updatedSkills.find(s => s.name === 'TypeScript' && s.status === 'match');
    const updatedInternships = internships.map(internship => {
      const updatedSkillsList = internship.skills.map(s => {
        if (s.name === 'TypeScript') {
          return { ...s, match: !!hasTypeScript };
        }
        const skillProfileItem = updatedSkills.find(us => us.name === s.name);
        return { ...s, match: skillProfileItem ? skillProfileItem.status === 'match' : s.match };
      });

      const matchedCount = updatedSkillsList.filter(s => s.match).length;
      const newScore = Math.round((matchedCount / updatedSkillsList.length) * 100);

      return {
        ...internship,
        skills: updatedSkillsList,
        matchScore: newScore
      };
    });

    setInternships(updatedInternships);
    localStorage.setItem(`deepcareer_${user.userId}_internships`, JSON.stringify(updatedInternships));
  };

  // Handler for mock interview rating success
  const handleInterviewComplete = (score: number) => {
    setInterviewsCount(prev => prev + 1);
    setAverageInterviewScore(prev => {
      if (prev === null) return score;
      return Math.round((prev * interviewsCount + score) / (interviewsCount + 1));
    });
  };

  // Callback to set ATS checker results directly
  const handleAtsResultUpdate = (result: ATSAnalysisResult | null) => {
    setAtsResult(result);
    if (user) {
      if (result) {
        localStorage.setItem(`deepcareer_${user.userId}_atsResult`, JSON.stringify(result));
      } else {
        localStorage.removeItem(`deepcareer_${user.userId}_atsResult`);
      }
    }
  };

  // Navigation Renderer
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <Dashboard 
            name={name}
            targetRole={targetRole}
            atsResult={atsResult}
            roadmapResult={roadmapResult}
            interviewsCount={interviewsCount}
            averageInterviewScore={averageInterviewScore}
            setView={setView}
          />
        );
      case 'ats':
        return (
          <ATSResumeChecker 
            apiKey={apiKey}
            model={model}
            resumeText={resumeText}
            setResumeText={setResumeText}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            atsResult={atsResult}
            setAtsResult={handleAtsResultUpdate}
            onAnalysisSuccess={handleAnalysisSuccess}
          />
        );
      case 'interview':
        return (
          <MockInterviews 
            apiKey={apiKey}
            model={model}
            targetRole={targetRole}
            onInterviewComplete={handleInterviewComplete}
          />
        );
      case 'roadmap':
        return (
          <Roadmap 
            targetRole={targetRole}
            roadmapResult={roadmapResult}
            onUpdateStepStatus={handleUpdateStepStatus}
          />
        );
      case 'internships':
        return (
          <Internships 
            skills={roadmapResult ? roadmapResult.skillsAnalysis : []}
            internships={internships}
            onApply={() => {}}
          />
        );
      case 'settings':
        return (
          <Settings 
            name={name}
            setName={setName}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            education={education}
            setEducation={setEducation}
            apiKey={apiKey}
            setApiKey={setApiKey}
            model={model}
            setModel={setModel}
            onSave={handleSaveSettings}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  const isConnected = !!apiKey;

  // Gate navigation behind authorisation
  if (!user) {
    return (
      <Auth 
        isConvexActive={isConvexActive}
        onAuthSuccess={onAuthSuccess} 
        convexSignup={convexSignup}
        convexLogin={convexLogin}
      />
    );
  }

  return (
    <div className="app-container">
      
      {/* Side Navigation Bar */}
      <nav className="sidebar">
        
        {/* Logo */}
        <div className="logo-container">
          <div className="logo-icon">
            <Sparkles size={22} fill="white" />
          </div>
          <span className="logo-text">DeepCareer AI</span>
        </div>

        {/* Links */}
        <ul className="nav-links">
          <li>
            <button 
              className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
              onClick={() => setView('dashboard')}
            >
              <LayoutDashboard className="nav-item-icon" />
              <span>Dashboard</span>
            </button>
          </li>
          
          <li>
            <button 
              className={`nav-item ${view === 'ats' ? 'active' : ''}`}
              onClick={() => setView('ats')}
            >
              <FileText className="nav-item-icon" />
              <span>ATS Resume Scan</span>
            </button>
          </li>

          <li>
            <button 
              className={`nav-item ${view === 'interview' ? 'active' : ''}`}
              onClick={() => setView('interview')}
            >
              <Video className="nav-item-icon" />
              <span>AI Mock Interview</span>
            </button>
          </li>

          <li>
            <button 
              className={`nav-item ${view === 'roadmap' ? 'active' : ''}`}
              onClick={() => setView('roadmap')}
            >
              <Map className="nav-item-icon" />
              <span>Skill Roadmap</span>
            </button>
          </li>

          <li>
            <button 
              className={`nav-item ${view === 'internships' ? 'active' : ''}`}
              onClick={() => setView('internships')}
            >
              <Briefcase className="nav-item-icon" />
              <span>Internship Matches</span>
            </button>
          </li>

          <li>
            <button 
              className={`nav-item ${view === 'settings' ? 'active' : ''}`}
              onClick={() => setView('settings')}
            >
              <SettingsIcon className="nav-item-icon" />
              <span>Settings</span>
            </button>
          </li>
        </ul>

        {/* Footer User Profile Badge */}
        <div className="nav-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="user-badge">
            <div className="user-avatar">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{name}</span>
              <span className="user-title" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  borderRadius: '50%', 
                  background: isConnected ? 'var(--success)' : 'var(--warning)' 
                }} />
                {isConnected ? 'API Connected' : 'Simulation Mode'}
              </span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.4rem 0.5rem', fontSize: '0.8rem', borderRadius: '8px' }}
          >
            Log Out
          </button>
        </div>

      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {renderView()}
      </main>

    </div>
  );
}
