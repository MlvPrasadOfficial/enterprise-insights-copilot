"use client";
import { useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Chat() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input) return;
    setMessages([...messages, {role: "user", content: input}]);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/ask`, {query: input});
      setMessages((prev) => [
        ...prev,
        {role: "assistant", content: res.data.answer || res.data.response || "No answer."}
      ]);
    } catch (e) {
      setMessages((prev) => [...prev, {role: "assistant", content: "Error contacting backend."}]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl mt-10">
      <div className="min-h-[200px] space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-2 rounded-xl ${msg.role === "user" ? "bg-blue-200 dark:bg-blue-900 text-right" : "bg-zinc-100 dark:bg-zinc-800 text-left"}`}>
            <span className="font-semibold">{msg.role === "user" ? "You" : "Copilot"}:</span> {msg.content}
          </div>
        ))}
        {loading && <div>Thinking...</div>}
      </div>
      <div className="flex mt-4 gap-2">
        <input
          className="flex-1 border px-3 py-2 rounded-lg dark:bg-zinc-800"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder="Ask a question about your data..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input} className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600">
          Send
        </button>
      </div>
    </div>
  );
}
