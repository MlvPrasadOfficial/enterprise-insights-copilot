"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ChartPanel from "./ChartPanel";
import { AgentStatus, Message } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ChatProps {
  onAgentDataChange?: (data: {
    activeAgents: AgentStatus[];
    currentQuery: string;
    sessionId: string;
    fileUploadStatus: any;
  }) => void;
}

export default function Chat({ onAgentDataChange }: ChatProps) {

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [activeAgents, setActiveAgents] = useState<AgentStatus[]>([]);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  
  // Polling function to get agent status updates
  const fetchAgentStatus = async () => {
    try {
      console.log(`Fetching agent status for session: ${sessionId}`);
      const res = await axios.get(`${API_URL}/api/v1/agent-status`, {
        params: { session_id: sessionId }
      });
      const data: any = res.data;
      console.log("Agent status data:", data);
      if (data && Array.isArray(data.agents)) {
        console.log("Setting active agents:", data.agents);
        setActiveAgents(data.agents);
      } else {
        console.warn("Invalid agent status data format:", data);
      }    } catch (error) {
      console.error("Error fetching agent status:", error);
    }
  };
  
  // Set up polling when loading state changes
  // We'll use a direct fetch without the error state for simplicity
  const fetchAgentStatusWithErrorHandling = async () => {
    try {
      await fetchAgentStatus();
    } catch (err: any) {
      console.error("Error fetching agent status:", err.message || "Unknown error");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (loading) {
      // Start polling every second when request is in progress
      interval = setInterval(fetchAgentStatusWithErrorHandling, 1000);
    } else {
      // Do one final fetch to get final status after loading completes
      fetchAgentStatusWithErrorHandling();
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
        session_id: sessionId // Ensure session_id is passed correctly
      });
      const responseData: any = res.data;
        let content = "";
      let type: "text" | "chart" | "table" = "text";
      let data = null;
      
      // Check for error or empty data responses
      if (responseData.result?.error) {
        content = responseData.result.error;
        type = "text";
      }
      // Handle different response types based on what agent was used
      else if (responseData.steps?.includes("chart")) {
        if (responseData.result?.message?.includes("No data")) {
          // Handle the no data available case for charts
          type = "text";
          content = "No data is available for chart generation. Please upload a dataset first.";
        } else {
          type = "chart";
          content = responseData.result?.message || "Generated chart.";
          data = responseData.result?.chart_spec;
        }
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
      ]);
    } catch (error) {
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
  };  // Render different types of messages
  const renderMessage = (msg: Message, idx: number) => {
    const isUser = msg.role === "user";
    
    // If it's a user message, render it simply
    if (isUser) {
      return (
        <div key={idx} className="flex justify-end mb-4">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-400 text-white px-4 py-3 rounded-2xl rounded-br-md max-w-xs lg:max-w-md shadow-lg">
            <p className="text-sm font-medium">{msg.content}</p>
          </div>
        </div>
      );
    }
    
    // For assistant messages
    return (
      <div key={idx} className="flex justify-start mb-4">
        <div className="flex space-x-3 max-w-xs lg:max-w-2xl">
          {/* AI Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-400 rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Message Content */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-2xl rounded-bl-md">
            <p className="text-white/90 text-sm leading-relaxed">{msg.content}</p>
            
            {/* Chart visualization */}
            {msg.type === "chart" && msg.data && (
              <div className="mt-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <svg className="w-4 h-4 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                  </svg>
                  <span className="text-white/70 text-xs font-medium">Chart Visualization</span>
                </div>
                <div className="h-64 bg-white/5 rounded-lg">
                  {msg.data && <ChartPanel chartData={msg.data.data || []} chartType={msg.data.chart_type || "bar"} />}
                </div>
              </div>
            )}
            
            {/* Table results */}
            {msg.type === "table" && msg.data && (
              <div className="mt-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                <div className="flex items-center space-x-2 p-3 border-b border-white/10">
                  <svg className="w-4 h-4 text-primary-300" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white/70 text-xs font-medium">Query Results</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        {msg.data.columns.map((col: string, i: number) => (
                          <th key={i} className="px-4 py-2 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msg.data.rows.map((row: any, i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          {msg.data.columns.map((col: string, j: number) => (
                            <td key={j} className="px-4 py-2 text-xs text-white/80">
                              {row[col]?.toString()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Track file upload status for ProcessVisualizer
  const [fileUploadStatus, setFileUploadStatus] = useState({
    fileName: '',
    indexed: false,
    rowCount: 0
  });

  // Subscribe to file upload events
  useEffect(() => {
    const handleFileUpload = (event: CustomEvent) => {
      setFileUploadStatus(prevState => ({
        ...prevState,
        fileName: event.detail.fileName || '',
        rowCount: event.detail.rowCount || 0,
        indexed: false
      }));
    };

    const handleFileIndexed = (event: CustomEvent) => {
      setFileUploadStatus(prevState => ({
        ...prevState,
        indexed: true,
        rowCount: event.detail.rowCount || prevState.rowCount
      }));
    };

    // Add custom event listeners
    window.addEventListener('file-uploaded' as any, handleFileUpload as EventListener);
    window.addEventListener('file-indexed' as any, handleFileIndexed as EventListener);

    return () => {
      // Clean up
      window.removeEventListener('file-uploaded' as any, handleFileUpload as EventListener);      window.removeEventListener('file-indexed' as any, handleFileIndexed as EventListener);
    };
  }, []);

  // Send data to parent component whenever it changes
  useEffect(() => {
    if (onAgentDataChange) {
      onAgentDataChange({
        activeAgents,
        currentQuery,
        sessionId,
        fileUploadStatus
      });
    }
  }, [activeAgents, currentQuery, sessionId, fileUploadStatus, onAgentDataChange]);  return (
    <div className="w-full">
      {/* Chat Messages Container - matching screenshot style */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-4 shadow-xl">
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white font-medium mb-1">Copilot</p>
              <p className="text-white/60 text-sm">Ask a question about your data...</p>
            </div>
          )}
          
          {messages.map((msg, idx) => renderMessage(msg, idx))}
          
          {loading && (
            <div className="flex justify-start mb-3">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <div className="w-3 h-3 bg-blue-300 rounded-full animate-pulse"></div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-2xl">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-white/70 text-sm">Analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input - simplified design */}
      <div className="flex space-x-3">
        <input
          className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask a question about your data..."
          disabled={loading}
        />
        
        <button 
          onClick={handleSend} 
          disabled={loading || !input.trim()} 
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
