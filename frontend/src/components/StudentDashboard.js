// StudentDashboard.js

import React, { useState, useEffect } from 'react';
import './studash.css';

const dsaTopics = [
    "Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Graphs",
    "Sorting", "Searching", "Dynamic Programming", "Greedy Algorithms"
];

function StudentDashboard({ studentId, goHome }) {
    const [studentData, setStudentData] = useState(null);
    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    const [message, setMessage] = useState('');
    const [topicProgress, setTopicProgress] = useState({});

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const response = await fetch(`http://localhost:5000/student/${studentId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStudentData(data);
                try{
                    setTopicProgress(JSON.parse(data.problems_solved));
                }catch(e){
                    console.log(e)
                }
                setLeetcodeUsername(data.leetcode_username || ''); // Initialize with existing username
            } catch (error) {
                console.error("Could not fetch student data:", error);
                setMessage("Failed to load student data.");
            }
        };

        if (studentId) {
            fetchStudentData();
        }
    }, [studentId]);

    const handleTopicCompletion = async (topic) => {
        try {
            const response = await fetch('http://localhost:5000/mark_topic_completed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ student_id: studentId, topic: topic }),
            });

            const data = await response.json();
            setMessage(data.message);
            // Refresh data
            const response2 = await fetch(`http://localhost:5000/student/${studentId}`);
            const data2 = await response2.json();
            setStudentData(data2);

        } catch (error) {
            console.error("Could not mark topic as completed:", error);
            setMessage("Failed to mark topic as completed.");
        }
    };

    const handleProblemsSolvedChange = (topic, count) => {
        setTopicProgress({...topicProgress,[topic]:count})
    };

    const handleRecordProblemsSolved = async (topic) => {
        try {
            const response = await fetch('http://localhost:5000/record_problems_solved', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ student_id: studentId, topic: topic, count: topicProgress[topic] }),
            });

            const data = await response.json();
            setMessage(data.message);
             // Refresh data
             const response2 = await fetch(`http://localhost:5000/student/${studentId}`);
             const data2 = await response2.json();
             setStudentData(data2);

        } catch (error) {
            console.error("Could not record problems solved:", error);
            setMessage("Failed to record problems solved.");
        }
    };


    if (!studentData) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-container">
                    <h2>Loading Student Data...</h2>
                    {message && <p className="message">{message}</p>}
                    <button className="btn-secondary" onClick={goHome}>
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }
    let completedTopics = [];
    try {
        completedTopics = JSON.parse(studentData.completed_topics || '[]'); // Default to empty object
    } catch (e) {
        console.error("Error parsing completed_topics:", e);
        completedTopics = []; // Ensure it's an array
    }


    return (
        <div className="dashboard-page">
            <div className="dashboard-container">
                <h2>Student Dashboard</h2>
                <p>Welcome, {studentData.username}!</p>

                <div className="progress-section">
                    <h3>Your Progress</h3>
                    <ul>
                        {dsaTopics.map((topic) => (
                            <li key={topic}>
                                {topic}:
                                {completedTopics.includes(topic) ? (
                                    <span> Completed!</span>
                                ) : (
                                    <button className="btn-mark-complete" onClick={() => handleTopicCompletion(topic)}>
                                        Mark Complete
                                    </button>
                                )}

                                {!completedTopics.includes(topic) &&(

                                    <span> 
                                    Problems Solved:
                                    <input
                                        type="number"
                                        value={topicProgress[topic] || 0}
                                        onChange={(e) => handleProblemsSolvedChange(topic, e.target.value)}
                                    />
                                    <button className="btn-record-progress" onClick={() => handleRecordProblemsSolved(topic)}>
                                        Record
                                    </button>
                                     </span>
                                )}
                                
                            </li>
                        ))}
                    </ul>
                </div>

                {message && <p className="message">{message}</p>}

                <button className="btn-secondary3" onClick={goHome}>
                    Back to Home
                </button>
            </div>
        </div>
    );
}

export default StudentDashboard;