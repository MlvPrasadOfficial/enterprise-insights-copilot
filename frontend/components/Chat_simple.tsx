"use client";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatProps {
  onAgentDataChange?: (data: {
    activeAgents: any[];
    currentQuery: string;
    sessionId: string;
    fileUploadStatus: { fileName: string; indexed: boolean; rowCount: number };
  }) => void;
}

export default function ChatSimple({ onAgentDataChange }: ChatProps) {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    const userMessage = { role: "user", content: query };
    setMessages(prev => [...prev, userMessage]);
    
    // Notify parent of query start
    if (onAgentDataChange) {
      onAgentDataChange({
        activeAgents: [
          { name: "Planning Agent", status: "working", type: "planner", message: "Processing query..." }
        ],
        currentQuery: query,
        sessionId: `session_${Date.now()}`,
        fileUploadStatus: { fileName: "", indexed: false, rowCount: 0 }
      });
    }

    try {
      // Try to connect to the real backend
      const response = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          session_id: `session_${Date.now()}`
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = { 
          role: "assistant", 
          content: data.response || data.message || "I received your query and processed it successfully."
        };
        setMessages(prev => [...prev, aiResponse]);
        
        // Notify parent of completion
        if (onAgentDataChange) {
          onAgentDataChange({
            activeAgents: [
              { name: "Planning Agent", status: "complete", type: "planner", message: "Query completed" }
            ],
            currentQuery: query,
            sessionId: `session_${Date.now()}`,
            fileUploadStatus: { fileName: "", indexed: false, rowCount: 0 }
          });
        }
      } else {
        throw new Error('Backend not responding');
      }
    } catch (error) {
      // Fallback to simulated response
      console.log('Backend not available, using simulated response');
      setTimeout(() => {
        const aiResponse = { 
          role: "assistant", 
          content: `I received your query: "${query}". The backend is currently unavailable, but I would help you analyze your data when connected.`
        };
        setMessages(prev => [...prev, aiResponse]);
        
        // Notify parent of completion
        if (onAgentDataChange) {
          onAgentDataChange({
            activeAgents: [
              { name: "Planning Agent", status: "complete", type: "planner", message: "Query completed (simulated)" }
            ],
            currentQuery: query,
            sessionId: `session_${Date.now()}`,
            fileUploadStatus: { fileName: "", indexed: false, rowCount: 0 }
          });
        }
      }, 1500);
    }

    setIsLoading(false);
    setQuery("");
  };
  return (
    <div className="flex flex-col h-[500px]">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">AI Chat Assistant</h3>
        <p className="text-sm text-gray-300">Ask questions about your data</p>
      </div>
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-4 bg-gray-900/40 backdrop-blur-sm rounded-xl border border-white/10">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <div className="mb-4">💬</div>
            <p className="text-sm">Start a conversation by asking a question about your data.</p>
            <p className="text-xs text-gray-500 mt-2">Try: "What are the key trends in my data?"</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                  message.role === "user"
                    ? "bg-blue-600/80 backdrop-blur-sm text-white shadow-lg"
                    : "bg-white/10 backdrop-blur-sm text-gray-100 border border-white/20"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 backdrop-blur-sm text-gray-100 px-4 py-3 rounded-xl border border-white/20">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about your data..."
          className="flex-1 px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition-all"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="px-6 py-3 bg-blue-600/80 hover:bg-blue-500/80 disabled:bg-gray-600/40 disabled:cursor-not-allowed text-white rounded-xl transition-all backdrop-blur-sm border border-blue-500/30 hover:border-blue-400/50 font-medium"
        >
          Send
        </button>
      </form>
    </div>
  );
}
