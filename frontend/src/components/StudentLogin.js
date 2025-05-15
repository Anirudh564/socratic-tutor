// StudentLogin.js
import React, { useState } from 'react';
import './stulogin.css'

function StudentLogin({ onLogin, setPage }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            setMessage(data.message);
            onLogin(data.student_id); // Call the onLogin function with student ID
        } else {
            setMessage(data.message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <h2>Student Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary1">
                        Login
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
                <button className="btn-secondary1" onClick={() => setPage('home')}>
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default StudentLogin;