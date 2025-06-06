"use client";
/**
 * ChatBox - Chat with copilot. Sends query to /multiagent. Receives agent steps and chart data.
 */
import React, { useState } from "react";
import type { AgentStep } from "@/app/page";
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type Props = {
  setTimeline: (steps: AgentStep[]) => void;
  setChartData: (data: { label: string; value: number }[]) => void;
  handleChat: (query: string) => Promise<any>;
};
type Message = { sender: "user" | "copilot"; text: string };

export default function ChatBox({ setTimeline, setChartData, handleChat }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: "user", text: input }]);
    setLoading(true);
    try {
      const data = await handleChat(input);
      setMessages((msgs) => [
        ...msgs,
        { sender: "copilot", text: data.result?.summary ?? data.error ?? "No answer." },
      ]);
      setTimeline(Array.isArray(data.result?.steps) ? data.result.steps as AgentStep[] : []);
      setChartData(Array.isArray(data.result?.chartData) ? data.result.chartData : []);
    } catch (err: unknown) {
      let errorMsg = "Error from copilot.";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
      ) {
        errorMsg = (err as { message: string }).message;
      }
      setMessages((msgs) => [
        ...msgs,
        { sender: "copilot", text: errorMsg },
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
