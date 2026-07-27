import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  Award, 
  Play, 
  RotateCcw, 
  BookOpen,
  RefreshCw
} from 'lucide-react';
import { GeminiService, type InterviewEvaluation } from '../services/geminiService';

interface ChatMessage {
  id: string;
  sender: 'interviewer' | 'student';
  text: string;
  evaluation?: InterviewEvaluation; // Store evaluation if student response
}

interface MockInterviewsProps {
  apiKey: string;
  model: string;
  targetRole: string;
  onInterviewComplete: (score: number) => void;
}

export const MockInterviews: React.FC<MockInterviewsProps> = ({
  apiKey,
  model,
  targetRole,
  onInterviewComplete
}) => {
  // Interview configuration
  const [role, setRole] = useState(targetRole || 'Frontend Engineer');
  const [difficulty, setDifficulty] = useState('Medium');
  const [interviewType, setInterviewType] = useState('Technical');
  
  // Game states
  const [gameState, setGameState] = useState<'setup' | 'active' | 'summary'>('setup');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const maxQuestions = 5;

  // Voice/Speech settings
  const [voiceSynthesisActive, setVoiceSynthesisActive] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  // Text to Speech voice generation
  const speakText = (text: string) => {
    if (voiceSynthesisActive && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error(error);
      }
    }
  };

  // Start the interview
  const handleStartInterview = async () => {
    setGameState('active');
    setMessages([]);
    setQuestionCount(1);
    setIsGeneratingQuestion(true);

    const gemini = new GeminiService(apiKey, model);
    try {
      const firstQuestion = await gemini.generateNextQuestion(role, interviewType, []);
      
      const interviewerMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'interviewer',
        text: firstQuestion
      };
      
      setMessages([interviewerMsg]);
      speakText(firstQuestion);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  // Submit student answer and evaluate
  const handleSendAnswer = async () => {
    if (!inputValue.trim() || isEvaluating || isGeneratingQuestion) return;

    const studentAnswerText = inputValue.trim();
    setInputValue('');

    // Add student message
    const studentMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'student',
      text: studentAnswerText
    };

    setMessages(prev => [...prev, studentMsg]);
    setIsEvaluating(true);

    // Stop recording if active
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Cancel speech synthesis if it is talking
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const gemini = new GeminiService(apiKey, model);
    const lastQuestion = messages[messages.length - 1].text;

    try {
      // Evaluate answer
      const evaluation = await gemini.evaluateResponse(lastQuestion, studentAnswerText);
      
      // Update student message with evaluation
      setMessages(prev => prev.map(m => m.id === studentMsg.id ? { ...m, evaluation } : m));
      setIsEvaluating(false);

      // Check if we should ask the next question or complete
      if (questionCount < maxQuestions) {
        setIsGeneratingQuestion(true);
        
        // Build chat history for Gemini
        const chatHistoryForGemini = messages.concat(studentMsg).map(m => ({
          role: m.sender === 'student' ? 'user' as const : 'model' as const,
          parts: [{ text: m.text }]
        }));

        const nextQuestion = await gemini.generateNextQuestion(role, interviewType, chatHistoryForGemini);
        
        setQuestionCount(prev => prev + 1);
        const nextInterviewerMsg: ChatMessage = {
          id: Math.random().toString(),
          sender: 'interviewer',
          text: nextQuestion
        };

        setMessages(prev => [...prev, nextInterviewerMsg]);
        speakText(nextQuestion);
        setIsGeneratingQuestion(false);
      } else {
        // Complete interview
        handleFinishInterview(messages.concat(studentMsg).map(m => m.id === studentMsg.id ? { ...m, evaluation } : m));
      }

    } catch (error) {
      console.error(error);
      setIsEvaluating(false);
      setIsGeneratingQuestion(false);
    }
  };

  const handleFinishInterview = (finalMessages: ChatMessage[]) => {
    setGameState('summary');
    
    // Stop voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Calculate average score
    const studentMessages = finalMessages.filter(m => m.sender === 'student' && m.evaluation);
    const totalScore = studentMessages.reduce((sum, m) => sum + (m.evaluation?.score || 0), 0);
    const averageScore = studentMessages.length > 0 
      ? Math.round(totalScore / studentMessages.length) 
      : 0;

    // Report completed interview score
    onInterviewComplete(averageScore);
  };

  // Calculate final dashboard values for summary view
  const studentEvaluations = messages.filter(m => m.sender === 'student' && m.evaluation);
  const finalAverageScore = studentEvaluations.reduce((sum, m) => sum + (m.evaluation?.score || 0), 0);
  const averagePercent = studentEvaluations.length > 0 
    ? Math.round(finalAverageScore / studentEvaluations.length) 
    : 0;

  const averageAccuracy = studentEvaluations.length > 0
    ? Math.round(studentEvaluations.reduce((sum, m) => sum + (m.evaluation?.accuracyScore || 0), 0) / studentEvaluations.length)
    : 0;

  const averageStructure = studentEvaluations.length > 0
    ? Math.round(studentEvaluations.reduce((sum, m) => sum + (m.evaluation?.structureScore || 0), 0) / studentEvaluations.length)
    : 0;

  const averageDelivery = studentEvaluations.length > 0
    ? Math.round(studentEvaluations.reduce((sum, m) => sum + (m.evaluation?.deliveryScore || 0), 0) / studentEvaluations.length)
    : 0;

  return (
    <div className="animate-page-entry" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div className="page-header">
        <div className="page-title-area">
          <h1 className="page-title">AI Mock Interview Simulator</h1>
          <span className="page-subtitle">Simulate real job interviews with immediate grading and model answers.</span>
        </div>
      </div>

      {gameState === 'setup' && (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <h3 className="card-title">
            <Video size={20} color="var(--primary)" /> Setup Your Session
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
            
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <input 
                type="text" 
                className="form-input" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                placeholder="e.g. Frontend Developer, Product Manager"
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Interview Type</label>
                <select 
                  className="form-select" 
                  value={interviewType} 
                  onChange={(e) => setInterviewType(e.target.value)}
                >
                  <option value="Technical">Technical</option>
                  <option value="Behavioral">Behavioral</option>
                  <option value="System Design">System Design</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select 
                  className="form-select" 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
              <button 
                onClick={() => setVoiceSynthesisActive(!voiceSynthesisActive)}
                style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {voiceSynthesisActive ? <Volume2 size={24} /> : <VolumeX size={24} />}
              </button>
              <div style={{ fontSize: '0.85rem' }}>
                <strong>Voice Mode {voiceSynthesisActive ? 'Enabled' : 'Disabled'}</strong>: 
                {voiceSynthesisActive ? ' The AI recruiter will ask questions out loud using text-to-speech synthesis.' : ' Questions will be display as chat bubbles only.'}
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }} 
              onClick={handleStartInterview}
            >
              <Play size={18} /> Start Session (5 Questions)
            </button>

          </div>
        </div>
      )}

      {gameState === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Active status panel */}
          <div className="card" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span className="voice-indicator">
                <span className="voice-bar"></span>
                <span className="voice-bar"></span>
                <span className="voice-bar"></span>
              </span>
              <div>
                <strong style={{ fontSize: '0.95rem' }}>Recruiting Panel AI</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Role: {role} ({interviewType}) | Level: {difficulty}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Question <strong>{questionCount}</strong> of <strong>{maxQuestions}</strong>
              </div>
              <button 
                className="btn btn-danger" 
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
                onClick={() => handleFinishInterview(messages)}
              >
                End Session
              </button>
            </div>
          </div>

          {/* Chat Window */}
          <div className="chat-window">
            <div className="chat-messages">
              {messages.map((msg) => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Bubble */}
                  <div className={`message-bubble ${msg.sender}`}>
                    <div className="message-avatar-info">
                      <span className="message-avatar">
                        {msg.sender === 'interviewer' ? 'R' : 'S'}
                      </span>
                      <span>{msg.sender === 'interviewer' ? 'AI Recruiter' : 'You'}</span>
                    </div>
                    <div className="message-content">
                      {msg.text}
                    </div>
                  </div>

                  {/* Immediate Feedback under Student Answer */}
                  {msg.sender === 'student' && msg.evaluation && (
                    <div className="animate-fade-in" style={{ 
                      marginLeft: 'auto', 
                      marginRight: '0', 
                      maxWidth: '75%', 
                      background: 'rgba(79, 70, 229, 0.03)',
                      border: '1px solid rgba(79, 70, 229, 0.1)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      marginTop: '0.75rem',
                      marginBottom: '0.75rem',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Award size={16} /> Real-time Answer Grade
                        </span>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          fontWeight: 'bold', 
                          background: 'var(--primary-glow)', 
                          color: 'var(--primary)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '6px'
                        }}>
                          Score: {msg.evaluation.score}/100
                        </span>
                      </div>
                      
                      {/* Precise Score breakdown gauges */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem', background: 'rgba(0,0,0,0.02)', padding: '0.5rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Accuracy</div>
                          <strong style={{ color: 'var(--secondary)' }}>{msg.evaluation.accuracyScore || 0}%</strong>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Structure</div>
                          <strong style={{ color: 'var(--primary)' }}>{msg.evaluation.structureScore || 0}%</strong>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Delivery</div>
                          <strong style={{ color: 'var(--accent)' }}>{msg.evaluation.deliveryScore || 0}%</strong>
                        </div>
                      </div>

                      <div style={{ color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                        <strong>Feedback:</strong> {msg.evaluation.feedback}
                      </div>

                      {/* Strengths & Gaps bullet arrays */}
                      {msg.evaluation.strengths && msg.evaluation.strengths.length > 0 && (
                        <div style={{ marginBottom: '0.75rem' }}>
                          <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '0.25rem' }}>✓ Key Strengths:</strong>
                          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                            {msg.evaluation.strengths.map((str: string, sIdx: number) => (
                              <li key={sIdx}>{str}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.evaluation.weaknesses && msg.evaluation.weaknesses.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <strong style={{ color: 'var(--error)', display: 'block', marginBottom: '0.25rem' }}>✗ Knowledge Gaps:</strong>
                          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', color: 'var(--text-secondary)' }}>
                            {msg.evaluation.weaknesses.map((weak: string, wIdx: number) => (
                              <li key={wIdx}>{weak}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <details>
                        <summary style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500, outline: 'none' }}>
                          Show Exemplary Model Response
                        </summary>
                        <div style={{ 
                          marginTop: '0.5rem', 
                          padding: '0.75rem', 
                          background: 'rgba(0,0,0,0.02)', 
                          borderLeft: '3px solid var(--primary)', 
                          borderRadius: '4px',
                          color: 'var(--text-secondary)',
                          lineHeight: 1.4
                        }}>
                          {msg.evaluation.modelAnswer}
                        </div>
                      </details>
                    </div>
                  )}
                  
                </div>
              ))}

              {isEvaluating && (
                <div className="message-bubble student" style={{ alignSelf: 'flex-end' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />
                    Evaluating response...
                  </div>
                </div>
              )}

              {isGeneratingQuestion && (
                <div className="message-bubble interviewer">
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="voice-indicator">
                      <span className="voice-bar"></span>
                      <span className="voice-bar"></span>
                      <span className="voice-bar"></span>
                    </span>
                    AI is writing next question...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="chat-input-area">
              <button 
                className={`btn ${isRecording ? 'btn-accent' : 'btn-secondary'}`}
                style={{ padding: '0.85rem', borderRadius: '12px' }}
                onClick={toggleRecording}
                title="Speak answer (Speech to Text)"
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <input 
                type="text" 
                className="form-input" 
                style={{ margin: 0, height: '46px' }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isRecording ? "Listening... speak now." : "Type your professional response here..."}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendAnswer();
                }}
                disabled={isEvaluating || isGeneratingQuestion}
              />

              <button 
                className="btn btn-primary"
                style={{ padding: '0.85rem', borderRadius: '12px' }}
                onClick={handleSendAnswer}
                disabled={isEvaluating || isGeneratingQuestion || !inputValue.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'summary' && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Card Scorecard */}
          <div className="card" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto', width: '100%' }}>
            <h3 className="card-title" style={{ justifyContent: 'center' }}>
              <Award size={24} color="var(--primary)" /> Mock Session Completed!
            </h3>

            <div style={{ margin: '2rem 0' }}>
              <div className="progress-ring-container">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="68" stroke="var(--bg-tertiary)" strokeWidth="10" fill="transparent" />
                  <circle 
                    cx="80" 
                    cy="80" 
                    r="68" 
                    stroke="url(#summaryGrad)" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={427}
                    strokeDashoffset={427 - (427 * averagePercent) / 100}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                  <defs>
                    <linearGradient id="summaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="var(--secondary)" />
                      <stop offset="100%" stopColor="var(--primary)" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="progress-ring-text">
                  <span className="progress-value" style={{ fontSize: '2.1rem' }}>{averagePercent}%</span>
                  <span className="progress-label">Avg Rating</span>
                </div>
              </div>
            </div>

            {/* Score dimensions summary card row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', maxWidth: '520px', margin: '1rem auto 2.25rem auto' }}>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.25rem' }}>Tech Accuracy</div>
                <strong style={{ fontSize: '1.25rem', color: 'var(--secondary)' }}>{averageAccuracy}%</strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.25rem' }}>Logical Structure</div>
                <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{averageStructure}%</strong>
              </div>
              <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '0.25rem' }}>Clarity & Delivery</div>
                <strong style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>{averageDelivery}%</strong>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 1.5rem auto', fontSize: '0.9rem' }}>
              Great practice! You have completed a full mock interview loop for the role of <strong>{role}</strong>. Study the question breakdown and feedback history below to review gaps.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleStartInterview}>
                <RotateCcw size={16} /> Re-run Session
              </button>
              <button className="btn btn-secondary" onClick={() => setGameState('setup')}>
                <Video size={16} /> Change Settings
              </button>
            </div>
          </div>

          {/* Breakdown List */}
          <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={20} color="var(--secondary)" /> Detailed Answer Transcript
            </h3>

            {messages.map((msg) => {
              if (msg.sender !== 'student') return null;
              
              // Find matching interviewer question
              const studentIndex = messages.indexOf(msg);
              const questionText = studentIndex > 0 ? messages[studentIndex - 1].text : "Introductory question";

              return (
                <div key={msg.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', background: 'var(--bg-tertiary)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
                        QUESTION {Math.floor(studentIndex / 2) + 1}
                      </span>
                      <div style={{ fontWeight: '600', fontSize: '0.95rem', marginTop: '0.5rem', color: 'white' }}>
                        "{questionText}"
                      </div>
                    </div>
                    {msg.evaluation && (
                      <span style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 'bold', 
                        color: msg.evaluation.score >= 80 ? 'var(--success)' : 'var(--warning)',
                        background: 'rgba(255,255,255,0.02)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        Grade: {msg.evaluation.score}/100
                      </span>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>
                      Your Answer:
                    </span>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontStyle: 'italic', background: 'rgba(255,255,255,0.01)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
                      "{msg.text}"
                    </p>
                  </div>

                  {msg.evaluation && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'rgba(79,70,229,0.02)', padding: '1.25rem', borderRadius: '8px', borderLeft: '3px solid var(--secondary)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', fontSize: '0.8rem' }}>
                        <div><strong>Accuracy:</strong> {msg.evaluation.accuracyScore || 0}%</div>
                        <div><strong>Structure:</strong> {msg.evaluation.structureScore || 0}%</div>
                        <div><strong>Delivery:</strong> {msg.evaluation.deliveryScore || 0}%</div>
                      </div>
                      
                      <div>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--secondary)', display: 'block', marginBottom: '0.25rem' }}>AI Evaluator Feedback:</strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{msg.evaluation.feedback}</p>
                      </div>

                      {msg.evaluation.strengths && msg.evaluation.strengths.length > 0 && (
                        <div>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--success)', display: 'block', marginBottom: '0.25rem' }}>✓ Strengths:</strong>
                          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {msg.evaluation.strengths.map((str: string, idx: number) => (
                              <li key={idx}>{str}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {msg.evaluation.weaknesses && msg.evaluation.weaknesses.length > 0 && (
                        <div>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--error)', display: 'block', marginBottom: '0.25rem' }}>✗ Gaps:</strong>
                          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {msg.evaluation.weaknesses.map((weak: string, idx: number) => (
                              <li key={idx}>{weak}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div>
                        <strong style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block', marginBottom: '0.25rem' }}>Model Reference Response:</strong>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{msg.evaluation.modelAnswer}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
