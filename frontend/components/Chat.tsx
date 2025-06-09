"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ChartPanel from "./ChartPanel";
import AgentDashboard from "./AgentDashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Chat() {
  interface Message {
    role: string;
    content: string;
    type?: "text" | "chart" | "table";
    data?: any;
  }
  // Use the same AgentStatus type as defined in AgentDashboard
  interface AgentStatus {
    name: string;
    status: 'idle' | 'working' | 'complete' | 'error';
    type: 'planner' | 'chart' | 'sql' | 'insight' | 'critique' | 'debate';
    message: string;
    startTime?: string; // This comes as ISO string from backend
    endTime?: string;   // This comes as ISO string from backend
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [activeAgents, setActiveAgents] = useState<AgentStatus[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  // Polling function to get agent status updates
  const fetchAgentStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v1/agent-status`, {
        params: { session_id: sessionId }
      });
      const data: any = res.data;
      if (data && Array.isArray(data.agents)) {
        setActiveAgents(data.agents);
      }
    } catch (error) {
      console.error("Error fetching agent status:", error);
    }
  };  // Set up polling when loading state changes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (loading) {
      // Start polling every second when request is in progress
      interval = setInterval(fetchAgentStatus, 1000);
    } else {
      // Do one final fetch to get final status after loading completes
      fetchAgentStatus();
    }
    
    // Clean up interval on component unmount or when loading changes
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sessionId]);

  const handleSend = async () => {
    if (!input) return;
    setMessages([...messages, {role: "user", content: input}]);
    setLoading(true);
    setCurrentQuery(input);
    
    // Reset agent status at the beginning of a new query
    try {
      await axios.post(`${API_URL}/api/v1/reset-agent-status`, { session_id: sessionId });
    } catch (error) {
      console.error("Failed to reset agent status:", error);
    }
      try {
      // Try the multi-agent endpoint first for more intelligent routing
      const res = await axios.post(`${API_URL}/api/v1/multiagent-query`, {
        query: input,
        session_id: sessionId
      });
      const responseData: any = res.data;
      
      let content = "";
      let type: "text" | "chart" | "table" = "text";
      let data = null;
      
      // Handle different response types based on what agent was used
      if (responseData.steps?.includes("chart")) {
        type = "chart";
        content = responseData.result?.message || "Generated chart.";
        data = responseData.result?.chart_spec;
      } else if (responseData.steps?.includes("sql")) {
        type = "table";
        content = responseData.result?.message || "SQL query results:";
        data = {
          columns: responseData.result?.columns || [],
          rows: responseData.result?.table_data || []
        };
      } else {
        // Default to text response
        content = responseData.result?.insights || responseData.result?.message || responseData.result || "No answer.";
      }
      
      setMessages((prev) => [
        ...prev,
        {role: "assistant", content, type, data}
      ]);    } catch (error) {
      // Log error from multi-agent endpoint
      console.error("Error with multiagent endpoint:", error);
      // Fallback to simple /ask endpoint if multi-agent fails
      try {
        const fallbackRes = await axios.post(`${API_URL}/ask`, {query: input});
        const fallbackData: any = fallbackRes.data;
        setMessages((prev) => [
          ...prev,
          {role: "assistant", content: fallbackData?.answer || fallbackData?.response || "No answer."}
        ]);
      } catch (fallbackError) {
        console.error("Error with fallback endpoint:", fallbackError);
        setMessages((prev) => [...prev, {role: "assistant", content: "Error contacting backend."}]);
      }
    }
    setInput("");
    setLoading(false);
  };
  // Render different types of messages
  const renderMessage = (msg: Message, idx: number) => {
    const isUser = msg.role === "user";
    const baseClasses = `p-3 rounded-xl ${isUser ? "bg-blue-200 dark:bg-blue-900 text-right" : "bg-zinc-100 dark:bg-zinc-800 text-left"}`;
    
    // If it's a user message, render it simply
    if (isUser) {
      return (
        <div key={idx} className={baseClasses}>
          <span className="font-semibold">You:</span> {msg.content}
        </div>
      );
    }
    
    // For assistant messages, check the type
    return (
      <div key={idx} className={baseClasses + " flex flex-col gap-2"}>
        <div>
          <span className="font-semibold">Copilot:</span> {msg.content}
        </div>
        
        {msg.type === "chart" && msg.data && (
          <div className="mt-2 border rounded p-2 bg-white dark:bg-zinc-700">
            {/* This assumes you've imported your ChartPanel component */}
            <div className="text-sm text-gray-500 mb-1">Chart visualization:</div>
            <div className="h-64">
              {/* If using Recharts or similar */}
              {msg.data && <ChartPanel chartData={msg.data.data || []} chartType={msg.data.chart_type || "bar"} />}
            </div>
          </div>
        )}
        
        {msg.type === "table" && msg.data && (
          <div className="mt-2 border rounded overflow-x-auto">
            <div className="text-sm text-gray-500 p-1">Query results:</div>
            <table className="min-w-full">
              <thead className="bg-gray-100 dark:bg-zinc-700">
                <tr>
                  {msg.data.columns.map((col: string, i: number) => (
                    <th key={i} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {msg.data.rows.map((row: any, i: number) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-zinc-800" : "bg-gray-50 dark:bg-zinc-900"}>
                    {msg.data.columns.map((col: string, j: number) => (
                      <td key={j} className="px-4 py-2 text-sm">
                        {row[col]?.toString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Chat interface - takes up 2/3 of the space on wider screens */}
        <div className="md:col-span-2">
          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl mt-10">
            <div className="min-h-[300px] space-y-3">
              {messages.map((msg, idx) => renderMessage(msg, idx))}
              {loading && (
                <div className="flex items-center space-x-2 p-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <div>Enterprise Insights Copilot is thinking...</div>
                </div>
              )}
            </div>
            <div className="flex mt-4 gap-2">
              <input
                className="flex-1 border px-3 py-2 rounded-lg dark:bg-zinc-800"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask a question about your data..."
                disabled={loading}
              />
              <button onClick={handleSend} disabled={loading || !input} className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600">
                Send
              </button>
            </div>
          </div>
        </div>
        
        {/* Agent Dashboard - takes up 1/3 of the space on wider screens */}
        <div className="md:col-span-1">
          <AgentDashboard 
            currentQuery={input || (messages.length > 0 ? messages[messages.length - 1].content : null)} 
            activeAgents={activeAgents} 
          />
        </div>
      </div>
    </div>
  );
}
