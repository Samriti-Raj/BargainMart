import React, { useState } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! Let’s bargain. Tell me your offer.' }]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    const newMessage = { sender: 'user', text: input };
    setMessages([...messages, newMessage]);

    // Dummy reply – replace with API later
    const botReply = { sender: 'bot', text: `Hmm... how about a 10% discount?` };
    setMessages((prev) => [...prev, newMessage, botReply]);
    setInput('');
  };

  return (
    <div className="chatbot">
      <div className="chat-window">
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default Chatbot;
