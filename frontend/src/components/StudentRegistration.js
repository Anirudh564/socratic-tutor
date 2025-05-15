// StudentRegistration.js
import React, { useState,useEffect } from 'react';
import './sturegister.css';

function StudentRegistration({ setPage }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch('http://localhost:5000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        setMessage(data.message);

        if (response.ok) {
            // Optionally, redirect to login page after successful registration
            setPage('login');
        }
    };

    return (
        <div className="registration-page">
            <div className="registration-container">
                <h2>Student Registration</h2>
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
                    <button type="submit" className="btn-primary2">
                        Register
                    </button>
                    {message && <p className="message">{message}</p>}
                </form>
                <button className="btn-secondary2" onClick={() => setPage('home')}>
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default StudentRegistration;