import React, { useState } from "react";

interface ChatBoxProps {
  onSend: (message: string) => void;
  messages: { sender: string; text: string }[];
}

const ChatBox: React.FC<ChatBoxProps> = ({ onSend, messages }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow flex flex-col h-96">
      <div className="flex-1 overflow-y-auto mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 ${msg.sender === "user" ? "text-right" : "text-left"}`}>
            <span className={`inline-block px-3 py-2 rounded-lg ${msg.sender === "user" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
              <b>{msg.sender === "user" ? "You" : "Copilot"}:</b> {msg.text}
            </span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Type your question..."
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
