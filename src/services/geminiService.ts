import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for ATS Resume Checker
export interface ATSAnalysisResult {
  score: number;
  findings: {
    strengths: string[];
    weaknesses: string[];
    formatting: string[];
  };
  missingKeywords: string[];
  actionPlan: string[];
}

// Types for Interview Chat
export interface InterviewEvaluation {
  score: number; // 0 to 100
  accuracyScore: number;
  deliveryScore: number;
  structureScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  modelAnswer: string;
}

// Types for Skill Gap and Roadmap
export interface SkillGapItem {
  name: string;
  status: 'match' | 'missing';
  criticality: 'low' | 'medium' | 'high';
}

export interface RoadmapStep {
  id: number;
  title: string;
  description: string;
  duration: string;
  resource: string;
  resourceTitle: string;
  status: 'completed' | 'active' | 'pending';
}

export interface SkillGapRoadmapResult {
  skillsAnalysis: SkillGapItem[];
  roadmap: RoadmapStep[];
}

// Types for Internships
export interface InternshipSkill {
  name: string;
  match: boolean;
}

export interface Internship {
  id: number;
  title: string;
  company: string;
  matchScore: number;
  location: string;
  stipend: string;
  skills: InternshipSkill[];
  tags: string[];
  description: string;
}

// Local mock service if no API Key is provided
const generateSimulatedATS = (resumeText: string, jobDesc: string): ATSAnalysisResult => {
  const score = Math.floor(Math.random() * 25) + 60; // 60 - 85
  
  // Extract some potential keywords based on job description or default
  const jdLower = jobDesc.toLowerCase();
  const resumeLower = resumeText.toLowerCase();
  
  const keywordsList = [
    'react', 'typescript', 'javascript', 'node.js', 'python', 'sql', 'html', 'css', 
    'rest api', 'git', 'aws', 'docker', 'machine learning', 'data analysis', 'agile'
  ];
  
  const missingKeywords: string[] = [];
  const matchedKeywords: string[] = [];
  
  keywordsList.forEach(kw => {
    if (jdLower.includes(kw)) {
      if (resumeLower.includes(kw)) {
        matchedKeywords.push(kw.toUpperCase());
      } else {
        missingKeywords.push(kw.toUpperCase());
      }
    }
  });

  if (missingKeywords.length === 0) {
    missingKeywords.push('SYSTEM DESIGN', 'CI/CD PIPELINES', 'UNIT TESTING');
  }
  
  return {
    score: score,
    findings: {
      strengths: [
        matchedKeywords.length > 0 
          ? `Good inclusion of key skills: ${matchedKeywords.slice(0, 3).join(', ')}.` 
          : 'Clean document layout and readable section headings.',
        'Proper reverse-chronological order of work history.',
        'Professional tone and active verb usage.'
      ],
      weaknesses: [
        missingKeywords.length > 0
          ? `Lacks optimization for major keywords found in job description: ${missingKeywords.slice(0, 2).join(', ')}.`
          : 'Could include more quantifiable metrics for achievements.',
        'Missing links to professional portfolios or GitHub repositories.'
      ],
      formatting: [
        'Document structure is clean, but keep columns simplified to a single-column layout for ATS parser readability.',
        'Avoid text inside shapes, boxes, or tables as some ATS parsers ignore these sections.'
      ]
    },
    missingKeywords: missingKeywords.slice(0, 5),
    actionPlan: [
      `Integrate missing keywords: ${missingKeywords.slice(0, 3).join(', ')} naturally into your skills or project sections.`,
      'Rewrite project bullet points using the STAR method (Situation, Task, Action, Result) with quantifiable results.',
      'Add a dedicated Projects section highlighting real-world applications of your skills.'
    ]
  };
};

const generateSimulatedQuestion = (jobTitle: string, type: string, index: number): string => {
  const technicalQuestions = [
    "Could you explain the difference between virtual DOM and real DOM in React, and how React reconciles changes?",
    "How does asynchronous execution work in JavaScript/TypeScript? Explain event loops, promises, and async/await.",
    "What is the difference between state management using React Context versus tools like Redux or Zustand, and when would you use each?",
    "Can you explain standard REST API design principles and how you secure an endpoint from unauthorized access?",
    "How do you optimize a slow database query or a slow loading frontend page? Walk me through your profiling strategy."
  ];

  const behavioralQuestions = [
    "Tell me about a time you faced a difficult technical challenge in a project. How did you identify the issue and resolve it?",
    "Can you share an experience where you had to work with a team member who had a different opinion or working style? How did you align?",
    "Describe a situation where you had a tight deadline and realized you wouldn't be able to finish all tasks on time. What did you do?",
    "Tell me about a project you're most proud of. What role did you play, and what was the impact?",
    "How do you keep your technical skills up to date, and can you share an example of a new technology you learned recently and applied?"
  ];

  const genericQuestions = [
    `Why are you interested in a role as a ${jobTitle || 'Software Engineer'}, and what makes you a good fit?`,
    "What is your preferred development environment and what tools do you use to maximize your productivity?",
    "Can you talk about your experience writing tests (unit, integration, or E2E) and why they are important?",
    "What is your approach to code reviews, both as a reviewer and when receiving feedback?",
    "Where do you see yourself technically in the next two to three years?"
  ];

  let list = genericQuestions;
  if (type.toLowerCase() === 'technical') list = technicalQuestions;
  if (type.toLowerCase() === 'behavioral') list = behavioralQuestions;

  return list[index % list.length];
};

const generateSimulatedEvaluation = (_question: string, answer: string): InterviewEvaluation => {
  const ansMuted = answer.trim().toLowerCase();
  
  // Check for very short, negative, or invalid responses
  const isInvalid = ansMuted.length < 12 || 
                    ansMuted === 'no' || 
                    ansMuted === 'yes' || 
                    ansMuted === 'skip' || 
                    ansMuted === 'pass' || 
                    ansMuted.includes("don't know") || 
                    ansMuted.includes("no idea") || 
                    ansMuted === 'idk';
                    
  if (isInvalid) {
    return {
      score: 5,
      accuracyScore: 0,
      deliveryScore: 10,
      structureScore: 5,
      feedback: `You did not provide a substantive answer to the question. A response like "${answer}" does not demonstrate technical knowledge or communication capability. Please try to elaborate, explain what you know, or walk through your thought process, even if you are unsure of the exact solution.`,
      strengths: [
        "Delivered a response quickly."
      ],
      weaknesses: [
        "Answer is too short or represents a refusal/skipping of the question.",
        "Missing technical concepts and explanation.",
        "Did not follow any structured explanation method (like STAR)."
      ],
      modelAnswer: `A strong answer would address the core concepts directly. For example: "React Context is built-in and excellent for low-frequency updates like themes or auth sessions, but it can trigger unnecessary re-renders across all consumers on frequent updates. External state managers like Redux or Zustand use selectors and optimized stores to scale state management for high-frequency updates and complex state logic in larger applications..."`
    };
  }
  
  // Otherwise, check for topic keywords to score relevance
  let scoreModifier = 0;
  const qKeywords = ['context', 'redux', 'zustand', 'state', 'asynchronous', 'promise', 'loop', 'api', 'rest', 'query', 'jest', 'test', 'virtal dom', 'reconcile'];
  const matchedKeywords = qKeywords.filter(kw => ansMuted.includes(kw));
  
  if (matchedKeywords.length === 0) {
    // Answer lacks technical depth or is off-topic
    const accuracy = Math.floor(Math.random() * 15) + 30; // 30 to 45
    const delivery = Math.floor(Math.random() * 20) + 50; // 50 to 70
    const structure = Math.floor(Math.random() * 15) + 25; // 25 to 40
    const score = Math.round(accuracy * 0.4 + delivery * 0.3 + structure * 0.3);
    
    return {
      score: score,
      accuracyScore: accuracy,
      deliveryScore: delivery,
      structureScore: structure,
      feedback: `Your response shows effort, but it misses the core technical concepts of the question. Try to include terminology such as hooks, virtual DOM, event loops, or state updates to back up your explanations.`,
      strengths: [
        "Communicates in a professional conversational tone."
      ],
      weaknesses: [
        "Lacks key technical concepts and definitions.",
        "Does not provide real-world examples or use cases."
      ],
      modelAnswer: `A high-quality answer would cover the structural differences and use cases. E.g. "React Context passes data down the component tree without prop-drilling, whereas Zustand or Redux provide centralized stores using pub/sub mechanisms. Context is perfect for static settings like localization, whereas Zustand excels at high-performance rendering optimization."`
    };
  } else {
    scoreModifier = Math.min(matchedKeywords.length * 8, 20); // add up to 20 points for keyword matches
  }

  const accuracy = Math.floor(Math.random() * 15) + 65 + scoreModifier; // 65 to 85 + mod
  const delivery = Math.floor(Math.random() * 10) + 80; // 80 to 90
  const structure = Math.floor(Math.random() * 15) + 70; // 70 to 85
  const score = Math.min(Math.round(accuracy * 0.4 + delivery * 0.3 + structure * 0.3), 100);

  return {
    score: score,
    accuracyScore: accuracy,
    deliveryScore: delivery,
    structureScore: structure,
    feedback: `You provided a solid technical explanation and correctly touched upon key concepts. You outlined the differences clearly. To optimize this, walk through a concrete production use case where you chose one tool over another and how it affected rendering performance.`,
    strengths: [
      "Demonstrates clear understanding of core terminology.",
      "Clear, audible delivery and professional tone."
    ],
    weaknesses: [
      "Could outline specific challenges faced during implementation.",
      "Did not detail how performance constraints or edge cases were optimized."
    ],
    modelAnswer: `A stellar answer would explicitly mention the theoretical concepts (e.g., Virtual DOM reconciliation algorithm, call stack, microtask queue) and then transition into a concrete example: "In my previous project, we had a rendering performance issue. By using React.memo and useCallback, we avoided unnecessary re-renders of list items..."`
  };
};

const generateSimulatedRoadmap = (_resumeText: string, _jobTitle: string): SkillGapRoadmapResult => {
  const defaultSkills: SkillGapItem[] = [
    { name: 'HTML5 & CSS3', status: 'match', criticality: 'low' },
    { name: 'JavaScript (ES6+)', status: 'match', criticality: 'medium' },
    { name: 'React.js', status: 'match', criticality: 'high' },
    { name: 'TypeScript', status: 'missing', criticality: 'high' },
    { name: 'REST APIs & Integration', status: 'missing', criticality: 'high' },
    { name: 'State Management (Redux/Zustand)', status: 'missing', criticality: 'medium' },
    { name: 'Testing (Jest/React Testing Library)', status: 'missing', criticality: 'low' },
    { name: 'Git & GitHub Version Control', status: 'match', criticality: 'medium' }
  ];

  const roadmap: RoadmapStep[] = [
    {
      id: 1,
      title: 'Master TypeScript Foundations',
      description: 'Learn static typing, interfaces, types, generics, and combining TypeScript with React components.',
      duration: '1-2 Weeks',
      resource: 'https://www.typescriptlang.org/docs/handbook/intro.html',
      resourceTitle: 'Official TypeScript Handbook',
      status: 'active'
    },
    {
      id: 2,
      title: 'Advanced API Design & Integration',
      description: 'Learn data fetching using Axios and React Query, authentication flows, and handling API errors.',
      duration: '1 Week',
      resource: 'https://tanstack.com/query/latest/docs/framework/react/overview',
      resourceTitle: 'TanStack Query (React Query) Documentation',
      status: 'pending'
    },
    {
      id: 3,
      title: 'Modern State Management',
      description: 'Implement global state managers like Zustand or Redux Toolkit to build scaleable react apps.',
      duration: '1 Week',
      resource: 'https://zustand-demo.pmnd.rs/',
      resourceTitle: 'Zustand React Guide',
      status: 'pending'
    },
    {
      id: 4,
      title: 'Unit Testing React Apps',
      description: 'Write robust unit tests for UI elements and hooks using Vitest and React Testing Library.',
      duration: '1 Week',
      resource: 'https://testing-library.com/docs/react-testing-library/intro/',
      resourceTitle: 'React Testing Library Intro',
      status: 'pending'
    }
  ];

  return {
    skillsAnalysis: defaultSkills,
    roadmap: roadmap
  };
};

const generateSimulatedInternships = (skills: SkillGapItem[]): Internship[] => {
  const hasTypeScript = skills.find(s => s.name === 'TypeScript' && s.status === 'match');
  
  return [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'InnovateTech Solutions',
      matchScore: 88,
      location: 'Remote (US/Canada/India)',
      stipend: '$800 - $1,200 / month',
      skills: [
        { name: 'React.js', match: true },
        { name: 'HTML5 & CSS3', match: true },
        { name: 'TypeScript', match: !!hasTypeScript },
        { name: 'REST APIs & Integration', match: false }
      ],
      tags: ['Remote', 'Paid', 'Flexible hours', '3-6 Months'],
      description: 'Join our agile frontend team building SaaS solutions. You will participate in creating pixel-perfect pages, building reusable React components, and integrating RESTful APIs.'
    },
    {
      id: 2,
      title: 'Software Engineering Intern (Web)',
      company: 'WebSphere Studio',
      matchScore: 78,
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
};

// Main Service Class wrapping Gemini API and Simulator Fallback
export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string = 'gemini-2.5-flash';

  constructor(apiKey?: string, model?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    if (model) {
      this.modelName = model;
    }
  }

  // Helper to check if live API is active
  public isLive(): boolean {
    return this.genAI !== null;
  }

  // Feature 1: ATS Resume Checker
  public async analyzeResume(resumeText: string, jobDescription: string): Promise<ATSAnalysisResult> {
    if (!this.genAI) {
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateSimulatedATS(resumeText, jobDescription);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        You are an expert ATS (Applicant Tracking System) parser and experienced technical recruiter.
        Analyze the following student Resume against the Target Job Description.
        
        Provide a detailed analysis in JSON format containing:
        1. "score": An integer ATS match score from 0 to 100.
        2. "findings": An object with arrays of strings detailing:
           - "strengths": Things done well in the resume (formatting, experiences, writing style).
           - "weaknesses": Areas of improvement or lacking sections.
           - "formatting": Visual and structure feedback (ATS readability issues).
        3. "missingKeywords": Up to 6 key industry skills or keywords from the Job Description that are missing or underrepresented in the Resume (use ALL CAPS).
        4. "actionPlan": 3-5 concrete, step-by-step actionable recommendations to improve the resume match score.
        
        RESUME:
        """
        ${resumeText}
        """
        
        TARGET JOB DESCRIPTION:
        """
        ${jobDescription}
        """
        
        Format the response EXACTLY as this JSON object structure (no markdown formatting outside the JSON output):
        {
          "score": 75,
          "findings": {
            "strengths": ["...", "..."],
            "weaknesses": ["...", "..."],
            "formatting": ["...", "..."]
          },
          "missingKeywords": ["KEYWORD1", "KEYWORD2"],
          "actionPlan": ["Recommendation 1", "Recommendation 2"]
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as ATSAnalysisResult;
    } catch (error) {
      console.error('Error analyzing resume with Gemini API, falling back to simulation:', error);
      return generateSimulatedATS(resumeText, jobDescription);
    }
  }

  // Feature 2: Generate Interview Question
  public async generateNextQuestion(
    jobTitle: string,
    type: string,
    history: { role: 'user' | 'model'; parts: { text: string }[] }[]
  ): Promise<string> {
    if (!this.genAI) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return generateSimulatedQuestion(jobTitle, type, history.length);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: this.modelName });
      
      const chatHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.parts[0].text }]
      }));

      const prompt = `
        You are a senior tech lead and interviewer. We are conducting a mock ${type} interview for a ${jobTitle} role.
        
        Please generate the next appropriate interview question.
        - If this is the start (no history), ask an introductory or warm-up question.
        - Keep your response brief, conversational, and direct. Do not add metadata or extra commentary.
        - Ask exactly one clear question.
      `;

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 150,
        }
      });

      const result = await chat.sendMessage(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Error in generating question with Gemini:', error);
      return generateSimulatedQuestion(jobTitle, type, history.length);
    }
  }

  // Feature 2 (cont): Evaluate Interview Answer
  public async evaluateResponse(question: string, userAnswer: string): Promise<InterviewEvaluation> {
    if (!this.genAI) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateSimulatedEvaluation(question, userAnswer);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        Evaluate the student's mock interview response to the interviewer's question.
        
        INTERVIEWER QUESTION:
        "${question}"
        
        STUDENT RESPONSE:
        "${userAnswer}"
        
        CRITICAL GRADING CRITERIA:
        - If the student's response is extremely short, gibberish, off-topic, blank, represents a refusal, or simply says 'no', 'yes', 'skip', 'idk', 'pass', 'don't know' or similar, you MUST grade it strictly. Set the overall score, accuracyScore, and structureScore to a value between 0 and 10. In the feedback, constructively explain that they did not provide a substantive answer and explain what they should have talked about.
        - Be a rigorous evaluator. Do not award high scores (70+) for weak, incomplete, or technically shallow answers. Give failing scores (30-50) for answers that show some effort but miss the core concept.
        
        Evaluate the answer and return a JSON object with:
        1. "accuracyScore": An integer from 0 to 100 assessing technical accuracy (correctness of facts, concepts, definitions, and technology usage).
        2. "deliveryScore": An integer from 0 to 100 assessing communication clarity (tone, flow, explanation quality, and vocabulary).
        3. "structureScore": An integer from 0 to 100 assessing structural delivery (logical flow, completeness, and usage of structuring methods like the STAR method).
        4. "score": An integer overall weighted average score from 0 to 100 (weighted as 40% accuracy, 30% delivery, 30% structure).
        5. "feedback": A detailed, encouraging paragraph of constructive analysis on what they can focus on technically or behaviorally.
        6. "strengths": An array of 2-3 strings listing specific points the student explained well.
        7. "weaknesses": An array of 2-3 strings listing specific technical gaps, missing facts, or structure errors in their answer.
        8. "modelAnswer": A sample exemplary answer (1-2 paragraphs) they can study to learn how to perfect their response.
        
        Output format:
        {
          "accuracyScore": 85,
          "deliveryScore": 80,
          "structureScore": 75,
          "score": 81,
          "feedback": "...",
          "strengths": ["...", "..."],
          "weaknesses": ["...", "..."],
          "modelAnswer": "..."
        }
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as InterviewEvaluation;
    } catch (error) {
      console.error('Error in evaluating response with Gemini:', error);
      return generateSimulatedEvaluation(question, userAnswer);
    }
  }

  // Feature 3 & 4: Skill Gap & Learning Roadmap
  public async generateSkillGapAndRoadmap(resumeText: string, jobTitle: string): Promise<SkillGapRoadmapResult> {
    if (!this.genAI) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      return generateSimulatedRoadmap(resumeText, jobTitle);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        Analyze the student's Resume against the Target Job Title: "${jobTitle}".
        Identify skill gaps and generate a step-by-step learning roadmap of 3-5 milestones to close those gaps.
        
        Your response must be a JSON object with the following schema:
        {
          "skillsAnalysis": [
            { "name": "Skill Name", "status": "match" or "missing", "criticality": "low" or "medium" or "high" }
          ],
          "roadmap": [
            {
              "id": 1,
              "title": "Milestone Title (e.g. Learn TypeScript Essentials)",
              "description": "Short description of what to focus on.",
              "duration": "Estimated time (e.g. 1-2 Weeks)",
              "resource": "A valid, real documentation link or high-quality learning URL (e.g., https://react.dev/learn)",
              "resourceTitle": "The name of the resource site (e.g., React Official Documentation)",
              "status": "completed" or "active" or "pending" (Set the first missing skill milestone to "active" and subsequent ones to "pending". Set matched skills ones to "completed" if applicable or omit them from roadmap).
            }
          ]
        }
        
        Provide a total list of 6-8 core technical or soft skills in "skillsAnalysis", classifying them as "match" if they appear in the resume, or "missing" if they are crucial for a ${jobTitle} but absent.
        
        RESUME TEXT:
        """
        ${resumeText}
        """
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as SkillGapRoadmapResult;
    } catch (error) {
      console.error('Error in skill gap roadmap generation:', error);
      return generateSimulatedRoadmap(resumeText, jobTitle);
    }
  }

  // Feature 5: Internship Recommendations
  public async generateInternshipRecommendations(skills: SkillGapItem[], jobTitle: string): Promise<Internship[]> {
    if (!this.genAI) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateSimulatedInternships(skills);
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const skillsListStr = skills.map(s => `${s.name} (${s.status})`).join(', ');

      const prompt = `
        Based on the target job title "${jobTitle}" and the student's skills list [${skillsListStr}], generate 3 highly relevant and realistic internship recommendations that match their current profile.
        
        Provide the response in JSON format. The JSON must contain a list of objects with this schema:
        [
          {
            "id": 1,
            "title": "Internship Job Title",
            "company": "Fictional or Real Company Name",
            "matchScore": 85, // An integer match score based on matching skills
            "location": "Remote, Hybrid, or Location name",
            "stipend": "Estimated monthly stipend (e.g., $1000 - $1500 / mo or 'Competitive')",
            "skills": [
              { "name": "Skill Name 1", "match": true },
              { "name": "Skill Name 2", "match": false }
            ],
            "tags": ["Remote", "Paid", "Part-time", "3 Months"],
            "description": "Brief description of the internship duties (2-3 sentences)."
          }
        ]
        
        List 4-5 skills per internship, indicating "match": true if it matches a skill marked as "match" in the student's profile, and false if they are missing it.
      `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text) as Internship[];
    } catch (error) {
      console.error('Error generating internships with Gemini:', error);
      return generateSimulatedInternships(skills);
    }
  }
}
