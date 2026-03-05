import React, { useState } from "react";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi there! 👋 I'm your Skill Swap assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const responses = {
    hello: "Hey! 👋 How’s it going?",
    hi: "Hello! How can I assist you today?",
    help: "Sure! You can ask me things like:\n- How to register\n- How to find a skill\n- How to contact a tutor",
    register: "To register, go to the signup page and fill out your details.",
    skill: "You can browse or search for skills under the 'Find Skill' section.",
    contact: "To contact a tutor, open their profile and click the 'Message' button.",
    thank: "I loved helping you",
    default: "Sorry, I didn’t quite get that. Try asking 'help' to see what I can do 😊",
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    const lowerInput = input.toLowerCase();
    let reply = responses.default;

    for (const key in responses) {
      if (lowerInput.includes(key)) {
        reply = responses[key];
        break;
      }
    }

    const botMsg = { sender: "bot", text: reply };
    setMessages((prev) => [...prev, botMsg]);
    setInput("");
  };

  return (
    <div className="chatbot-container">
      {/* Floating bubble button */}
      {!isOpen && (
        <button className="chat-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot">
          <div className="chat-header">
            <span>Skill Swap Assistant 🤖</span>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              ✖
            </button>
          </div>

          <div className="chatbox">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="input-area">
            <input
              type="text"
              value={input}
              placeholder="Type your message..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
