// App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import StudentRegistration from './components/StudentRegistration';
import StudentLogin from './components/StudentLogin';
import StudentDashboard from './components/StudentDashboard';
import chatImage from "./chat1.jpg";

function App() {
    const [page, setPage] = useState('home');
    const [theme, setTheme] = useState('light');
    const [studentId, setStudentId] = useState(null); // Track logged-in student
    const [studentName, setStudentName] = useState(''); // Track logged-in student's name

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);
        // Check local storage for existing login
        const storedStudentId = localStorage.getItem('studentId');
        const storedStudentName = localStorage.getItem('studentName');
        if (storedStudentId) {
            setStudentId(storedStudentId);
            setStudentName(storedStudentName);
            setPage('dashboard'); // Navigate to dashboard
        }
    }, []);

    const handleLogin = (id, name) => {
        setStudentId(id);
        setStudentName(name);
        localStorage.setItem('studentId', id);
        localStorage.setItem('studentName', name);
        setPage('dashboard'); // Navigate to dashboard
    };

    const handleLogout = () => {
        setStudentId(null);
        setStudentName('');
        localStorage.removeItem('studentId');
        localStorage.removeItem('studentName');
        setPage('home');
    };

    // Redirect to dashboard if already logged in
    const handleStudentLoginClick = () => {
        if (studentId) {
            setPage('dashboard');
        } else {
            setPage('login');
        }
    };

    return (
        <div className={`App ${theme}`}>
            <header className="app-header">
                <h1 className="he">Socratic Tutor<span>🤖</span></h1>
                <button className="btn-student" onClick={() => setPage('registration')}>
                    Student Registration
                </button>
                <button className="btn-student1" onClick={handleStudentLoginClick}>
                    Student Login
                </button>
                {studentId && (
                    <button className="btn-logout" onClick={handleLogout}>
                        Logout
                    </button>
                )}
            </header>
            <main className="app-content">
                {page === 'home' && (
                    <LandingPage setPage={setPage} />
                )}
                {page === 'registration' && (
                    <StudentRegistration setPage={setPage} />
                )}
                {page === 'login' && (
                    <StudentLogin setPage={setPage} onLogin={handleLogin} />
                )}
                {page === 'dashboard' && (
                    <StudentDashboard studentId={studentId} studentName={studentName} goHome={() => setPage('home')} />
                )}
                {page === 'code' && <CodeEditor goHome={() => setPage('home')} />}
                {page === 'chatbot' && <Chatbot goHome={() => setPage('home')} />}
                {page === 'visualizer' && <AlgorithmVisualizer goHome={() => setPage('home')} />}
                {page === 'progress' && <ProgressTracker studentId={studentId} studentName={studentName} goHome={() => setPage('home')} />}
                {page === 'concept' && <ConceptMapper goHome={() => setPage('home')} />}
            </main>
            <footer className="app-footer">
                <p>© 2024 Socratic Tutor. All rights reserved.</p>
            </footer>
        </div>
    );
}


function LandingPage({ setPage }) {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-content">
                    <h1>Welcome to Socratic Tutor for DSA</h1>
                    <p>Learn Data Structures and Algorithms interactively with a Socratic teaching methodology.</p>
                    <div className="button-container">
                        <button className="btn-primary" onClick={() => setPage('code')}>
                            Code Editor
                        </button>
                        <button className="btn-secondary" onClick={() => setPage('chatbot')}>
                            Chatbot
                        </button>
                        <button className="btn-tertiary" onClick={() => setPage('visualizer')}>
                            Algorithm Visualizer
                        </button>
                        <button className="btn-quaternary" onClick={() => setPage('progress')}>
                            Progress Tracker
                        </button>
                        <button className="btn-quinary" onClick={() => setPage('concept')}>
                            Concept Mapper
                        </button>
                    </div>
                </div>
                <div className="hero-graphic">
                    <img src={chatImage} alt="Learning Graphic" />
                </div>
            </div>

            {/* Feature Section */}
            <div className="feature-section">
                <h2>Why Choose Socratic Tutor?</h2>
                <div className="feature-cards">
                    {/* Original Cards */}
                    <div className="feature-card">
                        <span>📚</span>
                        <h3>Interactive Learning</h3>
                        <p>Engage with interactive tools like code editors, chatbots, and visualizers.</p>
                    </div>
                    <div className="feature-card">
                        <span>🧠</span>
                        <h3>Socratic Methodology</h3>
                        <p>Learn by asking questions and solving problems step-by-step.</p>
                    </div>
                    <div className="feature-card">
                        <span>📊</span>
                        <h3>Track Your Progress</h3>
                        <p>Monitor your learning journey with our progress tracker.</p>
                    </div>
                    {/* Duplicate Cards for Infinite Scroll */}
                    <div className="feature-card">
                        <span>📚</span>
                        <h3>Interactive Learning</h3>
                        <p>Engage with interactive tools like code editors, chatbots, and visualizers.</p>
                    </div>
                    <div className="feature-card">
                        <span>🧠</span>
                        <h3>Socratic Methodology</h3>
                        <p>Learn by asking questions and solving problems step-by-step.</p>
                    </div>
                    <div className="feature-card">
                        <span>📊</span>
                        <h3>Track Your Progress</h3>
                        <p>Monitor your learning journey with our progress tracker.</p>
                    </div>
                </div>
            </div>

            {/* How It Works Section */}
            <div className="how-it-works-section">
                <h2>How It Works</h2>
                <div className="steps-container">
                    <div className="step">
                        <span>1</span>
                        <h3>Sign Up</h3>
                        <p>Create your account to get started with personalized learning.</p>
                    </div>
                    <div className="step">
                        <span>2</span>
                        <h3>Choose a Tool</h3>
                        <p>Select from our interactive tools like Code Editor, Chatbot, or Visualizer.</p>
                    </div>
                    <div className="step">
                        <span>3</span>
                        <h3>Mark Your Progress</h3>
                        <p>Manually track your learning by marking completed topics and concepts.</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="landing-footer">
                <p>© 2024 Socratic Tutor. All rights reserved.</p>
                <div className="social-links">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
            </div>
        </div>
    );
}


function CodeEditor({ goHome }) {
    const [code, setCode] = useState('');
    const [response, setResponse] = useState('');
    const [language, setLanguage] = useState('python');
    const [showChatbot, setShowChatbot] = useState(false);
    const [chatbotMessages, setChatbotMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null); // Unique session ID

    useEffect(() => {
        // Generate a unique session ID when the component mounts
        const newSessionId = Math.random().toString(36).substring(2, 15);
        setSessionId(newSessionId);
    }, []);

    const handleAsk = async () => {
        setShowChatbot(true);
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: code, error: response.includes('Error'), language, session_id: sessionId }),
            });
            const data = await res.json();
            setChatbotMessages([{ sender: 'bot', message: data.question }]);
        } finally {
            setLoading(false);
        }
    };

    const handleExplain = async () => {
        setShowChatbot(true);
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/ask', {  // Reusing /ask endpoint for explanation
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: `Explain this code: ${code}`, language, session_id: sessionId }),
            });
            const data = await res.json();
            setChatbotMessages([{ sender: 'bot', message: data.question }]);
        } finally {
            setLoading(false);
        }
    };

    const handleExecute = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language }),
            });
            const data = await res.json();
            setResponse(data.output);
        } finally {
            setLoading(false);
        }
    };

    const handleChatbotSubmit = async (message) => {
        setChatbotMessages([...chatbotMessages, { sender: 'user', message }]);
        try {
            const res = await fetch('http://localhost:5000/chatbot', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: message, session_id: sessionId }),
            });
            const data = await res.json();
            setChatbotMessages((prev) => [...prev, { sender: 'bot', message: data.response }]);
        } catch (error) {
            console.error("Chatbot submission error:", error);
        }
    };

    return (
        <div className="code-editor-page">
            <div className="code-editor-container">
                <div className="editor-header">
                    <button className="btn-home" onClick={goHome}>
                        Back to Home
                    </button>
                    <h2>Code Editor</h2>
                </div>
                <div className="editor-content">
                    <div className="code-input">
                        <label htmlFor="language-select">Language:</label>
                        <select id="language-select" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="javascript">JavaScript</option>
                            <option value="ruby">Ruby</option>
                        </select>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter your code here..."
                            rows={20}
                            cols={80}
                        />
                    </div>
                    <div className="editor-buttons">
                        <button className="btn-execute" onClick={handleExecute} disabled={loading}>
                            {loading ? <div className="loading-spinner"></div> : 'Execute Code'}
                        </button>
                        <button className="btn-debug" onClick={handleAsk} disabled={loading}>
                            {loading ? <div className="loading-spinner"></div> : 'Debug Code (Socratic)'}
                        </button>
                        <button className="btn-explain" onClick={handleExplain} disabled={loading}>
                            {loading ? <div className="loading-spinner"></div> : 'Explain Code (Socratic)'}
                        </button>
                    </div>
                    <div className="code-output">
                        <h3>Output:</h3>
                        <pre>{response}</pre>
                    </div>
                </div>
            </div>

            {showChatbot && (
                <div className="chatbot-sidebar">
                    <h3>Socratic Tutor</h3>
                    <div className="chatbot-messages">
                        {chatbotMessages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                {msg.message}
                            </div>
                        ))}
                    </div>
                    <div className="chatbot-input">
                        <input
                            type="text"
                            placeholder="Type your answer..."
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleChatbotSubmit(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function Chatbot({ goHome }) {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);

    useEffect(() => {
        // Generate a unique session ID when the component mounts
        const newSessionId = Math.random().toString(36).substring(2, 15);
        setSessionId(newSessionId);
    }, []);

    const handleAsk = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/chatbot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question, session_id: sessionId }),
            });
            const data = await res.json();
            setMessages([...messages, { sender: 'user', message: question }, { sender: 'bot', message: data.response }]);
            setQuestion('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-page">
            <div className="chatbot-container">
                <div className="chatbot-header">
                    <button className="btn-home" onClick={goHome}>
                        Back to Home
                    </button>
                    <h2>Chatbot Interface</h2>
                </div>
                <div className="chatbot-messages">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender}`}>
                            {msg.message}
                        </div>
                    ))}
                </div>
                <div className="chatbot-input">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ask a question about DSA..."
                    />
                    <button className="btn-ask" onClick={handleAsk} disabled={loading}>
                        {loading ? <div className="loading-spinner"></div> : 'Ask'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ProgressTracker({ studentId, studentName, goHome }) {
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (studentId) {
            fetchProgress();
        }
    }, [studentId]);

    const fetchProgress = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/get_progress?student_id=${studentId}`);
            const data = await res.json();
            setProgress(data.progress || []); // Ensure progress is an array
        } catch (error) {
            console.error("Error fetching progress:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="progress-tracker-page">
            <div className="progress-container">
                <div className="progress-header">
                    <button className="btn-home" onClick={goHome}>
                        Back to Home
                    </button>
                    <h2>Progress Tracker</h2>
                </div>
                <div className="progress-input">
                    <h3>Progress for {studentName}</h3>
                </div>
                <div className="progress-list">
                    {loading ? (
                        <div className="loading-spinner"></div>
                    ) : progress.length > 0 ? (
                        progress.map((item, index) => (
                            <div key={index} className="progress-item">
                                {item}
                            </div>
                        ))
                    ) : (
                        <p>No progress recorded yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function AlgorithmVisualizer({ goHome }) {
    const [algorithm, setAlgorithm] = useState('bubbleSort');
    const [data, setData] = useState([64, 34, 25, 12, 22, 11, 90]);
    const [visualization, setVisualization] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleVisualize = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/visualize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ algorithm, data }),
            });
            const result = await res.json();
            setVisualization(result.visualization);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="visualizer-page">
            <div className="visualizer-container">
                <div className="visualizer-header">
                    <button className="btn-home" onClick={goHome}>
                        Back to Home
                    </button>
                    <h2>Algorithm Visualizer</h2>
                </div>
                <div className="visualizer-input">
                    <label htmlFor="algorithm-select">Algorithm:</label>
                    <select id="algorithm-select" value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                        <option value="bubbleSort">Bubble Sort</option>
                        <option value="quickSort">Quick Sort</option>
                        <option value="mergeSort">Merge Sort</option>
                        <option value="dijkstra">Dijkstra's Algorithm</option>
                        <option value="binarySearch">Binary Search</option>
                        <option value="linearSearch">Linear Search</option>
                        <option value="BFS">BFS</option>
                        <option value="DFS">DFS</option>
                    </select>
                    <textarea
                        value={data.join(', ')}
                        onChange={(e) => setData(e.target.value.split(',').map(Number))}
                        placeholder="Enter data to visualize..."
                        rows={5}
                        cols={40}
                    />
                </div>
                <button className="btn-visualize" onClick={handleVisualize} disabled={loading}>
                    {loading ? <div className="loading-spinner"></div> : 'Visualize'}
                </button>
                <div className="visualization">
                    {visualization.map((step, index) => (
                        <div key={index} className="visualization-step">
                            {step.join(', ')}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function ConceptMapper({ goHome }) {
    const [conceptMap, setConceptMap] = useState({
        "Data Structures": ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs", "Hash Tables"],
        "Algorithms": ["Sorting", "Searching", "Dynamic Programming", "Greedy Algorithms", "Backtracking", "Divide and Conquer"],
        "Graph Algorithms": ["BFS", "DFS", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Prim's Algorithm"],
        "Advanced Topics": ["Trie", "Segment Tree", "Fenwick Tree", "AVL Tree", "Red-Black Tree"]
    });
    const [loading, setLoading] = useState(false);

    return (
        <div className="concept-mapper-page">
            <div className="concept-container">
                <div className="concept-header">
                    <button className="btn-home" onClick={goHome}>
                        Back to Home
                    </button>
                    <h2>Concept Mapper</h2>
                </div>
                {loading ? (
                    <div className="loading-spinner"></div>
                ) : (
                    Object.keys(conceptMap).map((category, index) => (
                        <div key={index} className="concept-item">
                            <h3>{category}</h3>
                            <ul>
                                {conceptMap[category].map((concept, i) => (
                                    <li key={i}>{concept}</li>
                                ))}
                            </ul>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default App;