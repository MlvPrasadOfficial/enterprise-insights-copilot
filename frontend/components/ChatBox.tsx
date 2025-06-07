"use client";
/**
 * ChatBox - Chat with copilot. Sends query to /multiagent. Receives agent steps and chart data.
 */
import React, { useState } from "react";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type AgentStep = {
  agent: string;
  description: string;
  output: string;
};

type Props = {
  setTimeline: (steps: AgentStep[]) => void;
  setChartUrl: (url: string | undefined) => void;
};
type Message = { sender: "user" | "copilot"; text: string };

export default function ChatBox({ setTimeline, setChartUrl }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/multiagent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { sender: "copilot", text: data.result?.summary ?? "No answer." },
      ]);
      setTimeline((data.result?.steps as AgentStep[]) || []);
      setChartUrl(data.result?.chartUrl ?? undefined);
    } catch (err: any) {
      setMessages((msgs) => [
        ...msgs,
        { sender: "copilot", text: err.message || "Error from copilot." },
      ]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div className="mb-6">
      <label className="block font-semibold mb-2">Ask a Question</label>
      <div className="bg-gray-100 p-4 rounded-lg min-h-[120px] mb-2">
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender === "user" ? "text-right" : "text-left"}>
            <span className={`block ${msg.sender === "user" ? "font-bold" : "text-blue-700"}`}>
              {msg.sender === "user" ? "You: " : "Copilot: "}
              {msg.text}
            </span>
          </div>
        ))}
        {loading && <span className="text-blue-500">Thinking...</span>}
      </div>
      <div className="flex gap-2">
        <input
          className="input input-bordered flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="btn btn-primary" onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}
