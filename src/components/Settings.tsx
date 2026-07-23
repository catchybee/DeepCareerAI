import React, { useState } from 'react';
import { 
  Key, 
  User, 
  Settings as SettingsIcon, 
  Check, 
  Eye, 
  EyeOff,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';

interface SettingsProps {
  name: string;
  setName: (name: string) => void;
  targetRole: string;
  setTargetRole: (role: string) => void;
  education: string;
  setEducation: (education: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  model: string;
  setModel: (model: string) => void;
  onSave: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  name,
  setName,
  targetRole,
  setTargetRole,
  education,
  setEducation,
  apiKey,
  setApiKey,
  model,
  setModel,
  onSave
}) => {
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    onSave();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">Agent Settings & Profile</h1>
          <span className="page-subtitle">Configure your professional details and Gemini API connection parameters.</span>
        </div>
      </div>

      <div className="grid-2">
        {/* Left Side: Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* User Profile Card */}
          <div className="card">
            <h3 className="card-title">
              <User size={20} color="var(--primary)" /> Profile Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Alex Johnson"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Career Role</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={targetRole} 
                  onChange={(e) => setTargetRole(e.target.value)} 
                  placeholder="e.g. Frontend Engineer, Product Manager"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Highest Education</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={education} 
                  onChange={(e) => setEducation(e.target.value)} 
                  placeholder="e.g. BS in Computer Science, self-taught"
                />
              </div>
            </div>
          </div>

          {/* AI Settings Card */}
          <div className="card">
            <h3 className="card-title">
              <Key size={20} color="var(--secondary)" /> LLM API Configuration
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
              
              {/* API Key */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Gemini API Key</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flexGrow: 1 }}>
                    <input 
                      type={showKey ? 'text' : 'password'} 
                      className="form-input" 
                      style={{ paddingRight: '2.5rem', margin: 0 }}
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)} 
                      placeholder="AIzaSy..."
                    />
                    <button 
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '12px', 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--text-secondary)',
                        cursor: 'pointer' 
                      }}
                    >
                      {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Model */}
              <div className="form-group">
                <label className="form-label">Gemini Model Choice</label>
                <select 
                  className="form-select" 
                  value={model} 
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Standard)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                </select>
              </div>

              {/* Save Settings */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flexGrow: 1 }}
                  onClick={handleSave}
                >
                  Save Settings & Profile
                </button>
              </div>

              {isSaved && (
                <div className="animate-fade-in" style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  color: 'var(--success)', 
                  fontSize: '0.9rem',
                  justifyContent: 'center',
                  fontWeight: 600
                }}>
                  <Check size={16} /> Configuration saved successfully!
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Right Side: Guide Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Guide Card */}
          <div className="card" style={{ 
            background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.08) 0%, rgba(139, 92, 246, 0.03) 100%)',
            border: '1px solid rgba(20, 184, 166, 0.2)'
          }}>
            <h3 className="card-title">
              <Sparkles size={20} color="var(--secondary)" /> How to activate Live AI?
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem', fontSize: '0.9rem', lineHeight: 1.6 }}>
              <p>
                By default, this application uses a high-fidelity **Simulation Mode** that mimics Gemini's responses locally. To unlock real-time, personalized AI checks:
              </p>
              
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ 
                  background: 'var(--secondary)', 
                  color: 'black', 
                  fontWeight: 'bold', 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  marginTop: '3px'
                }}>
                  1
                </span>
                <div>
                  Get a free API Key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--secondary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Google AI Studio <ExternalLink size={12} /></a>.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ 
                  background: 'var(--secondary)', 
                  color: 'black', 
                  fontWeight: 'bold', 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  marginTop: '3px'
                }}>
                  2
                </span>
                <div>
                  Paste the key into the <strong>Gemini API Key</strong> input on this screen.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ 
                  background: 'var(--secondary)', 
                  color: 'black', 
                  fontWeight: 'bold', 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  flexShrink: 0,
                  marginTop: '3px'
                }}>
                  3
                </span>
                <div>
                  Click <strong>Save Settings</strong>. The app will immediately authenticate and hook into the live Gemini SDK.
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                background: 'rgba(255,255,255,0.02)', 
                padding: '0.75rem 1rem', 
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                border: '1px solid var(--card-border)',
                alignItems: 'center',
                marginTop: '0.5rem'
              }}>
                <Info size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                <span>
                  <strong>Privacy First:</strong> Your key is saved locally in your own browser's storage and is sent directly to Google's API endpoint. No backend server stores or intercepts your credentials.
                </span>
              </div>
            </div>
          </div>

          {/* Current State Card */}
          <div className="card">
            <h3 className="card-title">
              <SettingsIcon size={20} color="var(--primary)" /> Connection Status
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <div style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: apiKey ? 'var(--success)' : 'var(--warning)',
                boxShadow: apiKey ? '0 0 10px rgba(16, 185, 129, 0.5)' : '0 0 10px rgba(245, 158, 11, 0.5)'
              }} />
              <div>
                <strong>Active Mode: {apiKey ? 'LIVE GEMINI API' : 'LOCAL SIMULATOR'}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {apiKey ? `Connected to ${model}` : 'Running in sandbox mode with mock results.'}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
