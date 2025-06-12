"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import CSVUpload from "../components/CSVUpload";
import ProcessVisualizer from "../components/ProcessVisualizer";
import DataQualityAnalyzer from "../components/DataQualityAnalyzer";
import SmartSuggestions from "../components/SmartSuggestions";
import DataExport from "../components/DataExport";
import MultiFileUpload from "../components/MultiFileUpload";
import EnhancedAgentStatus from "../components/EnhancedAgentStatus";
import AgentGraphVisualizer from "../components/AgentGraphVisualizer";

// Define types for better type safety
type AgentStatusType = "idle" | "working" | "complete" | "error" | "running" | "success";
type WorkflowStageType = "idle" | "progress" | "uploaded" | "question" | "complete";

// Enhanced logging utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data ? data : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error ? error : '');
  },
  debug: (message: string, data?: any) => {
    console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data ? data : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data ? data : '');
  }
};

// Toast component for feedback
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-base font-semibold transition-all duration-300
      ${type === 'success' ? 'bg-green-600/90 text-white border border-green-300/40' : 'bg-red-600/90 text-white border border-red-300/40'}`}
      role="alert"
      >
      <span>{type === 'success' ? '✅' : '❌'} {message}</span>
      <button onClick={onClose} className="ml-4 text-white/80 hover:text-white font-bold">×</button>
    </div>
  );
}

// Agent node definitions for reference in handleNodeClick
const AGENTS = [
  { id: "planner", name: "Planning Agent", icon: "🧠", color: "from-blue-500 to-cyan-500" },
  { id: "query", name: "Query Agent", icon: "🔎", color: "from-indigo-500 to-blue-500" },
  { id: "cleaner", name: "Data Cleaner", icon: "🧹", color: "from-green-500 to-emerald-500" },
  { id: "sql", name: "SQL Agent", icon: "🗃️", color: "from-green-500 to-teal-500" },
  { id: "insight", name: "Insight Agent", icon: "💡", color: "from-amber-500 to-orange-500" },
  { id: "chart", name: "Chart Agent", icon: "📊", color: "from-purple-500 to-pink-500" },
  { id: "critique", name: "Critique Agent", icon: "📝", color: "from-pink-500 to-rose-500" },
  { id: "debate", name: "Debate Agent", icon: "🤔", color: "from-yellow-500 to-orange-500" },
  { id: "narrative", name: "Narrative Agent", icon: "📖", color: "from-blue-400 to-purple-400" },
  { id: "report", name: "Report Generator", icon: "📄", color: "from-indigo-500 to-blue-500" },
  { id: "retrieval", name: "Retrieval Agent", icon: "🔗", color: "from-cyan-500 to-blue-500" },
  { id: "data", name: "Data Agent", icon: "📂", color: "from-gray-500 to-gray-700" }
];

export default function HomePage() {
  // Main state
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome! Upload your CSV data and I'll help you analyze it with natural language queries.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }
  ]);
  const [fileUploaded, setFileUploaded] = useState(false);
  
  // Agent workflow state
  const [workflowStage, setWorkflowStage] = useState<WorkflowStageType>("idle");
  const [agentStatus, setAgentStatus] = useState<Record<string, AgentStatusType>>({
    planner: "idle",
    query: "idle",
    cleaner: "idle",
    sql: "idle", 
    insight: "idle",
    chart: "idle",
    critique: "idle",
    debate: "idle",
    narrative: "idle",
    report: "idle",
    retrieval: "idle",
    data: "idle"
  });
  const [activeAgentId, setActiveAgentId] = useState<string | undefined>(undefined);
  
  // Historical state structure
  const [agentData, setAgentData] = useState({
    activeAgents: [
      { 
        type: "planner" as const, 
        name: "Planning Agent", 
        icon: "🧠", 
        status: "idle" as const,
        message: "Ready to analyze data",
        startTime: undefined as string | undefined,
        endTime: undefined as string | undefined
      },
      { 
        type: "insight" as const, 
        name: "Insight Generator", 
        icon: "💡", 
        status: "idle" as const,
        message: "Ready to generate insights",
        startTime: undefined as string | undefined,
        endTime: undefined as string | undefined
      },
      { 
        type: "chart" as const, 
        name: "Chart Agent", 
        icon: "📊", 
        status: "idle" as const,
        message: "Ready to create visualizations",
        startTime: undefined as string | undefined,
        endTime: undefined as string | undefined
      }
    ],
    currentQuery: query,
    sessionId: "session-" + Date.now(),
    fileUploadStatus: { 
      fileName: "", 
      indexed: false, 
      rowCount: 0 
    }
  });  const [sampleData, setSampleData] = useState<any[]>([]);  const [allData, setAllData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [showAllRows, setShowAllRows] = useState(false);  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);  const [useMultiUpload, setUseMultiUpload] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToast(null), 3500);
    }
    return () => { if (toastTimeout.current) clearTimeout(toastTimeout.current); };
  }, [toast]);

  // Handle file selection from multi-upload (moved before handleMultiFileUpload)
  const handleFileSelection = useCallback((file: any) => {
    logger.info("File selected from multi-upload", { fileName: file.name });
    
    setFileUploaded(true);
    setSampleData(file.data.slice(0, 5));
    setAllData(file.data);
    setColumns(file.columns);
    setShowAllRows(false);
    setActiveFileId(file.id);
    
    setAgentData(prev => ({
      ...prev,
      fileUploadStatus: {
        fileName: file.name,
        indexed: true,
        rowCount: file.data.length
      }
    }));

    // Reset agents
    setAgentData(prev => ({
      ...prev,
      activeAgents: prev.activeAgents.map(agent => ({
        ...agent,
        status: "idle" as const,
        message: `${agent.name} ready to process ${file.name}`,
        startTime: undefined,
        endTime: undefined
      }))
    }));

    // Add message
    setMessages(prev => [...prev, {
      role: "assistant", 
      content: `📁 Switched to file "${file.name}" - ${file.data.length} rows with ${file.columns.length} columns. Ready for analysis!`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }]);

    // Store data
    (window as any).uploadedData = file.data;
    (window as any).uploadedColumns = file.columns;

    setToast({ message: `Switched to file "${file.name}" successfully!`, type: 'success' });
  }, []);

  // Handle multi-file upload
  const handleMultiFileUpload = useCallback((files: any[]) => {
    logger.info("Multiple files uploaded", { fileCount: files.length });
    setUploadedFiles(files);
    
    // Auto-select first successful file
    const firstSuccessful = files.find(f => f.status === 'completed');    if (firstSuccessful) {
      setActiveFileId(firstSuccessful.id);
      handleFileSelection(firstSuccessful);
    }  }, [handleFileSelection]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((question: string) => {
    setQuery(question);
  }, []);

  // Component initialization logging
  useEffect(() => {
    logger.info("HomePage component initialized", {
      sessionId: agentData.sessionId,
      timestamp: new Date().toISOString(),
      agentCount: agentData.activeAgents.length,
      sampleDataSize: sampleData.length
    });
  }, [agentData.sessionId, agentData.activeAgents.length, sampleData.length, fileUploaded]);  // Handle real CSV file upload
  const handleRealFileUpload = useCallback((fileName: string, data: any[], fileColumns: string[]) => {
    logger.info("Real CSV file uploaded", { fileName, rowCount: data.length, columns: fileColumns });
    
    setFileUploaded(true);
    setSampleData(data.slice(0, 5)); // Show first 5 rows for preview
    setAllData(data); // Store all data
    setColumns(fileColumns);
    setShowAllRows(false); // Reset to preview mode
    setWorkflowStage("uploaded"); // Set workflow stage to uploaded
    
    setAgentData(prev => ({
      ...prev,
      fileUploadStatus: {
        fileName,
        indexed: true,
        rowCount: data.length
      }
    }));

    // Reset agents to initial state
    setAgentData(prev => ({
      ...prev,
      activeAgents: prev.activeAgents.map(agent => ({
        ...agent,
        status: "idle" as const,
        message: `${agent.name} ready to process ${fileName}`,
        startTime: undefined,
        endTime: undefined
      }))
    }));

    // Add welcome message for uploaded file
    setMessages(prev => [...prev, {
      role: "assistant", 
      content: `📁 File "${fileName}" uploaded successfully! Found ${data.length} rows with ${fileColumns.length} columns: ${fileColumns.slice(0, 3).join(', ')}${fileColumns.length > 3 ? '...' : ''}. You can now ask questions about your data.`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }]);

    setToast({ message: `File "${fileName}" uploaded successfully!`, type: 'success' });

    // Store full dataset for analysis (in real app, this would go to backend)
    (window as any).uploadedData = data;
    (window as any).uploadedColumns = fileColumns;
  }, []);
  // Enhanced agent simulation with realistic processing stages
  const simulateAgentWorkflow = useCallback(() => {
    if (!fileUploaded) {
      logger.warn("Cannot start agent workflow - no file uploaded");
      return;
    }

    logger.info("Starting agent workflow simulation", { query });
    
    // Update workflow stage to show progress
    setWorkflowStage("progress");
    
    const stages = [
      { delay: 500, agentType: "planner", status: "working", message: "Planning analysis strategy..." },
      { delay: 1200, agentType: "insight", status: "working", message: "Extracting insights from data..." },
      { delay: 1800, agentType: "chart", status: "working", message: "Generating visualizations..." },
      { delay: 2200, agentType: "all", status: "complete", message: "Analysis complete!" }
    ];

    // Reset all agent statuses first
    setAgentStatus(prev => ({
      ...prev,
      planner: "idle",
      insight: "idle",
      chart: "idle"
    }));

    stages.forEach((stage) => {
      setTimeout(() => {
        logger.debug(`Agent workflow stage: ${stage.agentType}`, {
          status: stage.status,
          message: stage.message,
          delay: stage.delay
        });
        
        // Update agent status
        if (stage.agentType === "all") {
          setAgentStatus(prev => {
            const newStatus = {...prev};
            newStatus.planner = "complete";
            newStatus.insight = "complete";
            newStatus.chart = "complete";
            return newStatus;
          });
          // Update workflow stage to complete
          setWorkflowStage("complete");
        } else {
          setAgentStatus(prev => ({
            ...prev,
            [stage.agentType]: stage.status as "working" | "complete"
          }));
          setActiveAgentId(stage.agentType);
        }

        setAgentData(prev => ({
          ...prev,
          activeAgents: prev.activeAgents.map(agent => {
            if (stage.agentType === "all") {
              return { ...agent, status: "idle", endTime: new Date().toISOString() };
            }
            if (agent.type === stage.agentType) {
              return { 
                ...agent, 
                status: stage.status === "working" ? "idle" : "idle", 
                message: stage.message,
                startTime: stage.status === "working" ? new Date().toISOString() : agent.startTime,
                endTime: stage.status === "complete" ? new Date().toISOString() : agent.endTime
              };
            }
            return agent;
          })
        }));      }, stage.delay);
    });
  }, [query, fileUploaded]);  // Generate smart insights based on the query
  const generateSmartResponse = useCallback((userQuery: string) => {
    if (!fileUploaded || sampleData.length === 0) {
      return "Please upload a CSV file first to analyze your data. I'll be ready to help once you have data loaded!";
    }

    logger.debug("Generating smart response", { userQuery, availableColumns: columns });
    
    const queryLower = userQuery.toLowerCase();
    const fullData = (window as any).uploadedData || sampleData;
    const totalEmployees = fullData.length;
    
    // Calculate insights based on available columns
    let response = "";

    if ((queryLower.includes('age') || queryLower.includes('old')) && columns.includes('age')) {
      const avgAge = Math.round(fullData.reduce((sum: number, emp: any) => sum + (emp.age || 0), 0) / totalEmployees);
      const ages = fullData.map((emp: any) => emp.age).filter((age: any) => age);
      const minAge = Math.min(...ages);
      const maxAge = Math.max(...ages);
      response = `📊 **Age Analysis**: Your dataset contains ${totalEmployees} employees with an average age of ${avgAge} years (range: ${minAge}-${maxAge}). The age distribution shows insights about your workforce demographics.`;
    } else if ((queryLower.includes('department') || queryLower.includes('team')) && columns.some(col => col.toLowerCase().includes('department'))) {
      const deptColumn = columns.find(col => col.toLowerCase().includes('department')) || 'department';
      const departments = [...new Set(fullData.map((emp: any) => emp[deptColumn]))].filter(Boolean);
      const deptCounts = departments.map(dept => ({
        dept,
        count: fullData.filter((emp: any) => emp[deptColumn] === dept).length
      }));
      response = `🏢 **Department Breakdown**: I found ${departments.length} departments: ${departments.slice(0, 3).join(', ')}${departments.length > 3 ? '...' : ''}. Distribution: ${deptCounts.slice(0, 2).map(d => `${d.dept} (${d.count})`).join(', ')}.`;
    } else if ((queryLower.includes('performance') || queryLower.includes('perf')) && columns.some(col => col.toLowerCase().includes('perf'))) {
      const perfColumn = columns.find(col => col.toLowerCase().includes('perf')) || 'perf';
      const scores = fullData.map((emp: any) => emp[perfColumn]).filter((score: any) => score !== undefined && score !== null);
      const avgPerf = scores.length > 0 ? (scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length).toFixed(1) : 'N/A';
      const avgPerfNum = avgPerf !== 'N/A' ? parseFloat(avgPerf) : 0;
      response = `⭐ **Performance Insights**: Average performance score is ${avgPerf}. Found ${scores.length} employees with performance data. This suggests ${avgPerfNum > 80 ? 'strong' : avgPerfNum > 60 ? 'moderate' : 'varied'} team performance.`;
    } else if (queryLower.includes('salary') || queryLower.includes('compensation')) {
      response = `💰 **Compensation Analysis**: I can help analyze salary distributions if your CSV contains compensation data. Available columns: ${columns.slice(0, 5).join(', ')}${columns.length > 5 ? '...' : ''}. Upload a file with salary/compensation columns for detailed analysis.`;
    } else {
      response = `🔍 **Data Overview**: Your dataset contains ${totalEmployees} records with ${columns.length} columns: ${columns.slice(0, 4).join(', ')}${columns.length > 4 ? '...' : ''}. I can analyze specific aspects like ${columns.includes('age') ? 'age demographics, ' : ''}${columns.some(c => c.toLowerCase().includes('department')) ? 'department distribution, ' : ''}${columns.some(c => c.toLowerCase().includes('perf')) ? 'performance trends, ' : ''}and more. What would you like to explore?`;
    }    logger.info("Smart response generated", {
      queryType: queryLower.includes('age') ? 'age' : 
                 queryLower.includes('department') ? 'department' : 
                 queryLower.includes('performance') ? 'performance' : 
                 queryLower.includes('salary') ? 'salary' : 'general',
      responseLength: response.length,
      totalEmployees,
      columnCount: columns.length,
      availableColumns: columns
    });

    return response;
  }, [sampleData, fileUploaded, columns]);
  const handleSend = useCallback(() => {
    if (!query.trim() || isLoading) {
      logger.warn("Send blocked", { queryEmpty: !query.trim(), isLoading });
      return;
    }

    if (!fileUploaded) {
      logger.warn("Send blocked - no file uploaded");
      setMessages(prev => [...prev, 
        { role: "user", content: query, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }) },
        { 
          role: "assistant", 
          content: "Please upload a CSV file first. I need data to analyze before I can help you with insights!",
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }
      ]);
      setQuery("");
      return;
    }
    
    // Update workflow stage to question
    setWorkflowStage("question");
    
    logger.info("User query submitted", { 
      query: query.trim(),
      queryLength: query.trim().length,
      messageCount: messages.length
    });
    
    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    // Add user message
    setMessages(prev => {
      const newMessages = [...prev, { role: "user", content: query, timestamp }];
      logger.debug("User message added", { messageCount: newMessages.length });
      return newMessages;
    });
    
    // Start enhanced agent workflow simulation
    simulateAgentWorkflow();
    
    // Generate smart AI response
    setTimeout(() => {
      try {
        const smartResponse = generateSmartResponse(query);
        
        setMessages(prev => {
          const newMessages = [...prev, {
            role: "assistant",
            content: smartResponse,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
          }];
          logger.info("AI response added", { 
            messageCount: newMessages.length,
            responseLength: smartResponse.length
          });
          return newMessages;
        });
        
        setIsLoading(false);
        logger.info("Query processing completed successfully");
      } catch (error) {
        logger.error("Error generating response", error);
        setIsLoading(false);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "I apologize, but I encountered an error while processing your query. Please try again.",
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
        }]);
      }
    }, 2500);
      setQuery("");
  }, [query, isLoading, messages.length, simulateAgentWorkflow, generateSmartResponse, fileUploaded]);

  // Handle input changes with logging
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    if (newQuery.length > 0 && newQuery.length % 20 === 0) {
      logger.debug("Query input progress", { queryLength: newQuery.length });
    }
  }, []);

  // Handle keyboard events
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      logger.debug("Enter key pressed for query submission");
      handleSend();
    }
  }, [handleSend]);  
  // Simulate agent invocation for demo (replace with backend events later)
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    // Only run animation if file is uploaded
    if (!fileUploaded) {
      return () => {};
    }
    
    // Update workflow stage to show progress
    setWorkflowStage("progress");
    
    // Animate through the agent workflow
    setAgentStatus(s => ({ ...s, planner: "running" }));
    timers.push(setTimeout(() => setAgentStatus(s => ({ ...s, planner: "success", query: "running" })), 1000));
    timers.push(setTimeout(() => setAgentStatus(s => ({ ...s, query: "success", cleaner: "running" })), 2000));
    timers.push(setTimeout(() => setAgentStatus(s => ({ ...s, cleaner: "success", sql: "running", insight: "running", chart: "running" })), 3000));
    timers.push(setTimeout(() => setAgentStatus(s => ({ ...s, sql: "success", insight: "success", chart: "success", critique: "running" })), 4500));
    timers.push(setTimeout(() => setAgentStatus(s => ({ ...s, critique: "success", debate: "running" })), 6000));
    timers.push(setTimeout(() => setAgentStatus(s => ({ ...s, debate: "success", narrative: "running" })), 7000));
    timers.push(setTimeout(() => setAgentStatus(s => ({ ...s, narrative: "success", report: "running" })), 8000));
    timers.push(setTimeout(() => setAgentStatus(s => ({ ...s, report: "success" })), 9000));
    
    return () => timers.forEach(t => clearTimeout(t));
  }, [fileUploaded]);

  // Node click handler (show details, trigger agent, etc.)
  const handleNodeClick = (id: string) => {
    logger.info(`Agent node clicked: ${id}`);
    
    // Flash the status to highlight it was clicked
    setAgentStatus(prev => ({
      ...prev,
      [id]: "running" 
    }));
    
    // Set as active agent
    setActiveAgentId(id);
    
    // Show a toast with agent info
    const agent = AGENTS.find(a => a.id === id);
    if (agent) {
      setToast({
        message: `${agent.icon} ${agent.name}: Status - ${agentStatus[id] || "idle"}`,
        type: "success"
      });
    }
    
    // Reset status after a short delay (for visual feedback)
    setTimeout(() => {
      setAgentStatus(prev => ({
        ...prev,
        [id]: prev[id] === "running" ? "idle" : prev[id]
      }));
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#18122B] via-[#1E1B3A] to-[#0F1021] text-white">
      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {/* Agent Graph Visualizer - Centered and Prominent */}
      <div className="w-full max-w-5xl mx-auto mt-6 mb-2 relative z-20">
        <div className="glass-card-3d p-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur-md">
          <h3 className="text-xl font-bold text-white text-center mb-2">Multi-Agent Enterprise System</h3>
          <AgentGraphVisualizer 
            agentStatus={agentStatus} 
            onNodeClick={handleNodeClick} 
            workflowStage={workflowStage}
            activeAgentId={activeAgentId} 
          />
        </div>
      </div>
      {/* Enhanced Multi-layer Background Effects (NO orbs/particles) */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(78,60,250,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(233,240,255,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(78,60,250,0.1)_0deg,transparent_60deg,rgba(233,240,255,0.05)_120deg,transparent_180deg)]"></div>
      {/* No floating orbs or pulsing particles */}
      <div className="relative z-10 pt-16 p-3">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-4">
            {/* Left Column - Chat Interface */}
            <div className="lg:col-span-5 space-y-4">
              {/* Compact Glassmorphic Chat Interface */}
              <div className="glass-card-3d rounded-2xl p-4 relative overflow-hidden border border-white/15 shadow-lg">
                {/* Additional 3D highlight layer */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500/60 via-blue-500/40 to-violet-600/60 rounded-xl flex items-center justify-center shadow-xl border border-white/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                    <span className="text-xl relative z-10">🤖</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base mb-0.5">AI Copilot</h3>
                    <p className="text-purple-200 text-xs">Your intelligent data assistant</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-full shadow relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                  </div>
                </div>                {/* Compact Upload Section */}
                <div className="glass-card-3d rounded-2xl p-4 mb-4 relative overflow-hidden border border-white/10">
                  {/* Top highlight line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="w-12 h-12 glass-card-3d rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-purple-500/10 rounded-2xl"></div>
                      <span className="relative z-10">📄</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-bold text-base">Upload CSV or Drag & Drop</h4>
                      <button
                        onClick={() => setUseMultiUpload(!useMultiUpload)}
                        className={`button-glossy-3d px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-400 border-2 focus:ring-2 focus:ring-blue-400/60
                          ${useMultiUpload
                            ? 'bg-gradient-to-r from-white/30 to-white/20 text-white border-blue-400/60 shadow-xl'
                            : 'bg-gradient-to-r from-black/40 to-black/20 text-purple-200 border-white/20 hover:from-white/10 hover:to-white/5'}
                        `}
                        aria-pressed={useMultiUpload}
                      >
                        {useMultiUpload ? '📂 Multi' : '📄 Single'}
                      </button>
                    </div>
                    {/* Upload Components */}
                    {useMultiUpload ? (
                      <div className="space-y-4">
                        <MultiFileUpload
                          onFilesUploaded={handleMultiFileUpload}
                          onFileSelected={handleFileSelection}
                          disabled={isLoading}
                          maxFiles={5}
                        />
                          {/* Enhanced File List Display */}
                        {uploadedFiles.length > 0 && (
                          <div className="glass-card-3d rounded-2xl p-4 relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                            <h5 className="text-white text-sm font-semibold mb-3 relative z-10">
                              📁 Uploaded Files ({uploadedFiles.length})
                            </h5>
                            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar relative z-10">
                              {uploadedFiles.map((file) => (
                                <div
                                  key={file.id}
                                  onClick={() => handleFileSelection(file)}
                                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                                    activeFileId === file.id
                                      ? 'glass-card-3d border-blue-400/60 shadow-lg shadow-blue-500/20'
                                      : 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
                                  }`}
                                >
                                  {activeFileId === file.id && (
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
                                  )}
                                  <div className="flex items-center space-x-3 flex-1 min-w-0 relative z-10">
                                    <span className="text-xs">
                                      {file.status === 'completed' ? '✅' : file.status === 'error' ? '❌' : '⏳'}
                                    </span>
                                    <span className="text-white text-xs truncate" title={file.name}>
                                      {file.name}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-xs text-gray-300">
                                    <span>{file.data?.length || 0} rows</span>
                                    {activeFileId === file.id && (
                                      <span className="text-blue-400">●</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>                    ) : (
                      <div>
                        {/* File Status Display */}
                        {fileUploaded ? (
                          <div className="glass-card-3d p-4 mb-4">
                            <div className="flex items-center justify-between">
                              <div className="space-y-2">
                                <p className="text-blue-100 text-sm">📊 Rows indexed: {agentData.fileUploadStatus.rowCount}</p>
                                <p className="text-blue-200 text-xs">📁 File: {agentData.fileUploadStatus.fileName}</p>
                              </div>
                              <button
                                onClick={() => {
                                  setFileUploaded(false);
                                  setSampleData([]);
                                  setAllData([]);
                                  setColumns([]);
                                  setShowAllRows(false);
                                  setUploadedFiles([]);
                                  setActiveFileId(null);
                                  setAgentData(prev => ({
                                    ...prev,
                                    fileUploadStatus: { fileName: "", indexed: false, rowCount: 0 },
                                    activeAgents: prev.activeAgents.map(agent => ({
                                      ...agent,
                                      status: "idle" as const,
                                      message: "Ready to analyze data",
                                      startTime: undefined,
                                      endTime: undefined
                                    }))
                                  }));
                                  setMessages([{
                                    role: "assistant",
                                    content: "Welcome! Upload your CSV data and I'll help you analyze it with natural language queries.",
                                    timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
                                  }]);
                                  (window as any).uploadedData = null;
                                  (window as any).uploadedColumns = null;
                                  logger.info("File data cleared - ready for new upload");
                                }}
                                className="button-glossy-3d bg-red-600/80 hover:bg-red-500/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                🗑️ Clear Data
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <CSVUpload 
                              onFileUpload={handleRealFileUpload}
                              disabled={isLoading}
                            />
                            <div className="flex items-center justify-center">
                              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1"></div>
                              <span className="text-xs text-white/60 px-3">or</span>
                              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent flex-1"></div>
                            </div>
                            <button 
                              onClick={() => {
                                const mockData = [
                                  { name: "Arlen", age: 24, department: "engineering", joiningDate: "2021-09-18", city: "dlkdri", perf: 85 },
                                  { name: "Pallavi", age: 21, department: "sales", joiningDate: "2018-07-19", city: "dlkat", perf: 85 },
                                  { name: "Survi", age: 28, department: "marketing", joiningDate: "51015/", city: "hycr", perf: 85 },
                                  { name: "Vishu", age: 28, department: "sales", joiningDate: "2019-18-17", city: "hydra", perf: 85 },
                                  { name: "Phalavi", age: 28, department: "sales", joiningDate: "760000000", city: "hydra", perf: 85 }
                                ];
                                const mockColumns = ["name", "age", "department", "joiningDate", "city", "perf"];
                                handleRealFileUpload("employee_data.csv", mockData, mockColumns);
                              }}
                              className="button-glossy-3d w-full bg-gradient-to-r from-gray-600/80 to-gray-500/80 hover:from-gray-500/80 hover:to-gray-400/80 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all"
                              disabled={isLoading}
                            >
                              📁 Use Sample Data
                            </button>
                          </div>
                        )}
                      </div>                    )}
                  </div>
                </div>{/* Data Preview */}
                {fileUploaded && sampleData.length > 0 ? (
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-medium">Preview</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-300 text-sm">
                          {showAllRows ? `All ${allData.length} rows` : `Preview (first 5 rows)`}
                        </span>
                        <button
                          onClick={() => setShowAllRows(!showAllRows)}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded transition-colors"
                        >
                          {showAllRows ? 'Show Preview' : 'Show All'}
                        </button>
                      </div>
                    </div>
                    
                    <div className={`overflow-auto rounded-lg ${showAllRows ? 'max-h-64' : ''}`}>
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-slate-800/90 backdrop-blur-sm">
                          <tr className="text-gray-300 border-b border-white/20">
                            {showAllRows && (
                              <th className="text-left p-2 w-12">#</th>
                            )}
                            {columns.map((col, index) => (
                              <th key={index} className="text-left p-2 capitalize min-w-24">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(showAllRows ? allData : sampleData).map((row, i) => (
                            <tr key={i} className="text-white border-b border-white/10 hover:bg-white/5">
                              {showAllRows && (
                                <td className="p-2 text-gray-400 font-mono text-xs">{i + 1}</td>
                              )}
                              {columns.map((col, colIndex) => (
                                <td key={colIndex} className="p-2">
                                  {row[col] !== undefined && row[col] !== null ? String(row[col]) : '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {showAllRows && allData.length > 10 && (
                      <div className="mt-2 text-xs text-gray-400 text-center">
                        Scroll to see more rows • Total: {allData.length} rows
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                    <div className="text-center text-gray-400 py-8">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-sm">Upload a CSV file to see data preview</p>
                    </div>
                  </div>
                )}                {/* Chat Input with enhanced action affordance */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question about your data..."
                    className="flex-1 glass-card-3d border-0 rounded-xl px-4 py-2 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-blue-400/60 text-sm transition-all duration-300"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !query.trim()}
                    className="button-glossy-3d px-5 py-2 rounded-xl font-bold transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg focus:ring-2 focus:ring-blue-400/60"
                    aria-label="Send query"
                  >
                    Send
                  </button>
                </div>
              </div>
              {/* Compact Chat Messages */}
              <div className="space-y-3">
                {messages.map((message, i) => (
                  <div key={i} className="glass-card-3d rounded-2xl p-4 relative overflow-hidden border border-white/10">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    <div className="flex items-start gap-3 relative z-10">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-xl border border-white/20 relative overflow-hidden ${
                        message.role === 'assistant'
                          ? 'bg-gradient-to-br from-purple-500/60 to-violet-500/60'
                          : 'bg-gradient-to-br from-blue-500/60 to-cyan-500/60'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                        <span className="relative z-10">{message.role === 'assistant' ? '🤖' : '👤'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-bold text-base">
                            {message.role === 'assistant' ? 'AI Copilot' : 'You'}
                          </span>
                          <span className="text-purple-300 text-xs bg-purple-500/20 px-2 py-0.5 rounded">{message.timestamp}</span>
                        </div>
                        <p className="text-gray-100 leading-relaxed text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="glass-card-3d rounded-2xl p-4 relative overflow-hidden border border-white/10">
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500/60 to-violet-500/60 rounded-xl flex items-center justify-center text-base shadow-xl border border-white/20 relative overflow-hidden">
                        <span className="relative z-10">🤖</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="loader-dot bg-purple-400"></span>
                        <span className="loader-dot bg-violet-400"></span>
                        <span className="loader-dot bg-purple-400"></span>
                        <span className="text-purple-200 ml-2 font-medium text-xs">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Right Column - Enhanced Features */}
            <div className="lg:col-span-7 space-y-4">
              {/* Smart Suggestions */}
              <SmartSuggestions
                data={allData}
                columns={columns}
                onSuggestionClick={handleSuggestionClick}
                disabled={isLoading}
              />

              {/* Data Quality Analyzer */}
              <DataQualityAnalyzer
                data={allData}
                columns={columns}
              />

              {/* Enhanced Agent Status */}
              <EnhancedAgentStatus
                agents={agentData.activeAgents}
                currentQuery={agentData.currentQuery}
                fileUploadStatus={agentData.fileUploadStatus}
              />

              {/* Data Export */}
              <DataExport
                data={allData}
                columns={columns}
                originalFileName={agentData.fileUploadStatus.fileName}
                disabled={!fileUploaded}
              />              {/* Original Process Visualizer */}
              <ProcessVisualizer
                currentQuery={agentData.currentQuery}
                activeAgents={agentData.activeAgents}
                fileUploadStatus={agentData.fileUploadStatus}              />
            </div>
          </div>
        </div>
      </div>      
      {/* Enhanced 3D Glassmorphic Footer */}
      <footer className="relative z-10 mt-20 glass-card-3d border-t-0 rounded-t-3xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">EI</span>
                </div>
                <span className="text-white font-semibold">Enterprise Insights</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered business intelligence platform for modern enterprises. 
                Transform your data into actionable insights.
              </p>
              <div className="flex space-x-4">
                <button className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  💼
                </button>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  🐙
                </button>
              </div>
            </div>
            
            {/* Product */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API Reference</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>© 2025 Enterprise Insights. All rights reserved.</span>
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All systems operational</span>
              </div>
              <span className="text-gray-600">|</span>
              <span className="text-sm text-gray-400">v2.1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/*
Add to globals.css:
.loader-dot {
  display: inline-block;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 9999px;
  margin-right: 0.15rem;
  animation: loader-bounce 1s infinite alternate;
}
.loader-dot:nth-child(2) { animation-delay: 0.15s; }
.loader-dot:nth-child(3) { animation-delay: 0.3s; }
@keyframes loader-bounce {
  0% { transform: translateY(0); opacity: 0.7; }
  100% { transform: translateY(-0.4rem); opacity: 1; }
}
*/