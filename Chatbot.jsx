import React, { useState, useEffect } from 'react';
import './Chatbot.css'; // Optional: for styling

const Chatbot = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        // Initialize with a welcome message
        const welcomeMessage = {
            text: "Hello! I'm your college chatbot. I'm here to answer questions about courses, admissions, and campus life. How can I help you today?",
            sender: 'bot'
        };
        setMessages([welcomeMessage]);
    }, []);

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (input.trim()) {
            const userMessage = { text: input, sender: 'user' };
            setMessages(prevMessages => [...prevMessages, userMessage]);
            setInput('');
    
            try {
                const response = await fetch('http://localhost:5000/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: input })
                });
                const data = await response.json();
    
                const botMessage = { 
                    text: data.response.join('\n'), // Join with line breaks
                    sender: 'bot' 
                };
                setMessages(prevMessages => [...prevMessages, botMessage]);
            } catch (error) {
                console.error('Error:', error);
                const errorMessage = { text: 'Error: Unable to connect to server.', sender: 'bot' };
                setMessages(prevMessages => [...prevMessages, errorMessage]);
            }
        }
    };
    

    return (
        <div className="chatbot">
            <h1>Welcome to College Chatbot</h1>
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender}>
                        {msg.text}
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Type your message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};

export default Chatbot;
