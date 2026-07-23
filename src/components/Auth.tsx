import React, { useState } from 'react';
import { 
  Sparkles, 
  Lock, 
  Mail, 
  BookOpen, 
  TrendingUp, 
  User
} from 'lucide-react';
interface AuthProps {
  isConvexActive: boolean;
  onAuthSuccess: (user: {
    userId: string;
    name: string;
    email: string;
    targetRole: string;
    education: string;
  }) => void;
  convexSignup?: any;
  convexLogin?: any;
}

export const Auth: React.FC<AuthProps> = ({ isConvexActive, onAuthSuccess, convexSignup, convexLogin }) => {

  const [tab, setTab] = useState<'login' | 'signup'>('login');
  
  // Signup states
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('Frontend Engineer');
  const [signupEducation, setSignupEducation] = useState('BS in Computer Science');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Error/loading states
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim() || !signupRole.trim() || !signupEducation.trim()) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

    if (signupPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    if (isConvexActive && convexSignup) {
      try {
        const userId = await convexSignup({
          name: signupName,
          email: signupEmail,
          password: signupPassword,
          targetRole: signupRole,
          education: signupEducation,
        });
        setIsLoading(false);
        onAuthSuccess({
          userId: userId as string,
          name: signupName,
          email: signupEmail,
          targetRole: signupRole,
          education: signupEducation,
        });
        return;
      } catch (err: any) {
        setErrorMessage(err.message || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }
    }
    
    // Simulate database write
    setTimeout(() => {
      // Local storage mock DB
      const usersRaw = localStorage.getItem('deepcareer_users') || '[]';
      const users = JSON.parse(usersRaw);
      
      const emailExists = users.some((u: any) => u.email === signupEmail);
      if (emailExists) {
        setErrorMessage('A user with this email address already exists.');
        setIsLoading(false);
        return;
      }

      const newUserId = Math.random().toString(36).slice(2, 11);
      const newUser = {
        userId: newUserId,
        name: signupName,
        email: signupEmail,
        password: signupPassword, // Simulating password hashing locally
        targetRole: signupRole,
        education: signupEducation
      };

      users.push(newUser);
      localStorage.setItem('deepcareer_users', JSON.stringify(users));
      
      setIsLoading(false);
      onAuthSuccess({
        userId: newUserId,
        name: signupName,
        email: signupEmail,
        targetRole: signupRole,
        education: signupEducation
      });
    }, 1200);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter email and password.');
      return;
    }

    setIsLoading(true);

    if (isConvexActive && convexLogin) {
      try {
        const safeUser = await convexLogin({
          email: loginEmail,
          password: loginPassword,
        });
        setIsLoading(false);
        onAuthSuccess({
          userId: safeUser._id as string,
          name: safeUser.name,
          email: safeUser.email,
          targetRole: safeUser.targetRole,
          education: safeUser.education,
        });
        return;
      } catch (err: any) {
        setErrorMessage(err.message || "Login failed. Please verify credentials.");
        setIsLoading(false);
        return;
      }
    }

    setTimeout(() => {
      // Check local storage mock DB
      const usersRaw = localStorage.getItem('deepcareer_users') || '[]';
      const users = JSON.parse(usersRaw);

      // Default user bypass so it runs instantly without registration
      if (loginEmail === 'demo@deepcareer.ai' && loginPassword === 'password') {
        setIsLoading(false);
        onAuthSuccess({
          userId: 'demo-user-id',
          name: 'Alex Johnson',
          email: 'demo@deepcareer.ai',
          targetRole: 'Frontend Engineer',
          education: 'BS in Computer Science'
        });
        return;
      }

      const matchedUser = users.find((u: any) => u.email === loginEmail);
      
      if (!matchedUser) {
        setErrorMessage('No account found with this email address.');
        setIsLoading(false);
        return;
      }

      if (matchedUser.password !== loginPassword) {
        setErrorMessage('Incorrect password. Please try again.');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      onAuthSuccess({
        userId: matchedUser.userId,
        name: matchedUser.name,
        email: matchedUser.email,
        targetRole: matchedUser.targetRole,
        education: matchedUser.education
      });
    }, 1200);
  };

  return (
    <div className="auth-overlay-container">
      <div className="auth-card">
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <div className="logo-icon" style={{ width: '36px', height: '36px', borderRadius: '10px' }}>
            <Sparkles size={20} fill="white" />
          </div>
          <span className="logo-text" style={{ fontSize: '1.4rem', fontWeight: 800 }}>DeepCareer AI</span>
        </div>

        {/* Tab switchers */}
        <div className="auth-tabs">
          <button 
            type="button"
            className={`auth-tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => {
              setTab('login');
              setErrorMessage('');
            }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setTab('signup');
              setErrorMessage('');
            }}
          >
            Create Account
          </button>
        </div>

        {/* Error panel */}
        {errorMessage && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.08)', 
            border: '1px solid rgba(239, 68, 68, 0.15)', 
            borderRadius: '12px', 
            padding: '0.75rem 1rem', 
            fontSize: '0.85rem', 
            color: 'var(--error)', 
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontWeight: 500
          }}>
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', margin: 0 }}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. name@domain.com"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', margin: 0 }}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', marginTop: '0.75rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying Account...' : 'Sign In'}
            </button>

            <div style={{ 
              marginTop: '0.75rem', 
              fontSize: '0.8rem', 
              color: 'var(--text-secondary)', 
              textAlign: 'center',
              background: 'var(--bg-tertiary)',
              padding: '0.75rem',
              borderRadius: '8px'
            }}>
              <strong>Demo Bypass Creds:</strong><br />
              Email: <code>demo@deepcareer.ai</code> | Password: <code>password</code>
            </div>
          </form>
        )}

        {/* Signup Form */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }}>
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', margin: 0 }}
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }}>
                  <Mail size={18} />
                </span>
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', margin: 0 }}
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="e.g. alex@gmail.com"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }}>
                  <Lock size={18} />
                </span>
                <input 
                  type="password" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', margin: 0 }}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Target Role</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }}>
                  <TrendingUp size={18} />
                </span>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', margin: 0 }}
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value)}
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Highest Education</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }}>
                  <BookOpen size={18} />
                </span>
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '2.5rem', margin: 0 }}
                  value={signupEducation}
                  onChange={(e) => setSignupEducation(e.target.value)}
                  placeholder="e.g. BS in Computer Science"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', marginTop: '0.75rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Creating Profile...' : 'Register'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
