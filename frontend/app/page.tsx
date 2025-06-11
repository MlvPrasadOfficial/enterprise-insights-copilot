"use client";
import { useState, useEffect, useCallback } from "react";
import CSVUpload from "../components/CSVUpload";
import ProcessVisualizer from "../components/ProcessVisualizer";
import DataQualityAnalyzer from "../components/DataQualityAnalyzer";
import SmartSuggestions from "../components/SmartSuggestions";
import DataExport from "../components/DataExport";
import MultiFileUpload from "../components/MultiFileUpload";
import EnhancedAgentStatus from "../components/EnhancedAgentStatus";

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

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome! Upload your CSV data and I'll help you analyze it with natural language queries.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }
  ]);  const [fileUploaded, setFileUploaded] = useState(false);
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
  }, [agentData.sessionId, agentData.activeAgents.length, sampleData.length, fileUploaded]);// Handle real CSV file upload
  const handleRealFileUpload = useCallback((fileName: string, data: any[], fileColumns: string[]) => {
    logger.info("Real CSV file uploaded", { fileName, rowCount: data.length, columns: fileColumns });
    
    setFileUploaded(true);
    setSampleData(data.slice(0, 5)); // Show first 5 rows for preview
    setAllData(data); // Store all data
    setColumns(fileColumns);
    setShowAllRows(false); // Reset to preview mode
    
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
    
    const stages = [
      { delay: 500, agentType: "planner", status: "working", message: "Planning analysis strategy..." },
      { delay: 1200, agentType: "insight", status: "working", message: "Extracting insights from data..." },
      { delay: 1800, agentType: "chart", status: "working", message: "Generating visualizations..." },
      { delay: 2200, agentType: "all", status: "complete", message: "Analysis complete!" }
    ];

    stages.forEach((stage) => {
      setTimeout(() => {
        logger.debug(`Agent workflow stage: ${stage.agentType}`, {
          status: stage.status,
          message: stage.message,
          delay: stage.delay
        });

        setAgentData(prev => ({
          ...prev,
          activeAgents: prev.activeAgents.map(agent => {
            if (stage.agentType === "all") {
              return { ...agent, status: "complete" as const, endTime: new Date().toISOString() };
            }
            if (agent.type === stage.agentType) {
              return { 
                ...agent, 
                status: stage.status === "working" ? "working" as const : "complete" as const, 
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
      response = `⭐ **Performance Insights**: Average performance score is ${avgPerf}. Found ${scores.length} employees with performance data. This suggests ${avgPerf > 80 ? 'strong' : avgPerf > 60 ? 'moderate' : 'varied'} team performance.`;
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
  }, [handleSend]);  return (
    <div className="min-h-screen gradient-bg-enhanced relative overflow-hidden" style={{ scrollBehavior: 'smooth' }}>
      {/* Enhanced Multi-layer Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900/20 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(78,60,250,0.15),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(233,240,255,0.08),transparent_50%)]"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(78,60,250,0.1)_0deg,transparent_60deg,rgba(233,240,255,0.05)_120deg,transparent_180deg)]"></div>
      
      {/* Enhanced Floating 3D Orbs */}
      <div className="absolute top-1/4 left-1/6 w-40 h-40 floating-orb-3d bg-gradient-to-r from-purple-500/20 to-blue-500/20"></div>
      <div className="absolute top-3/4 right-1/4 w-32 h-32 floating-orb-3d bg-gradient-to-r from-blue-500/15 to-cyan-500/15" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/6 w-48 h-48 floating-orb-3d bg-gradient-to-r from-violet-500/10 to-purple-500/15" style={{ animationDelay: '4s' }}></div>
      <div className="absolute bottom-1/3 left-1/3 w-36 h-36 floating-orb-3d bg-gradient-to-r from-emerald-500/10 to-teal-500/10" style={{ animationDelay: '6s' }}></div>
      
      {/* Enhanced Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(35)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400/40 to-blue-400/40 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
              boxShadow: '0 0 4px rgba(78, 60, 250, 0.3)'
            }}
          ></div>        ))}
      </div>

      {/* Enhanced Background Effects - Pure Gradients */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Background Layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/30 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-violet-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-purple-800/5 to-indigo-900/15"></div>
        
        {/* Floating Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/8 to-purple-500/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-500/8 to-pink-500/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-to-br from-cyan-500/6 to-blue-500/6 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 pt-20 p-6">
        <div className="max-w-7xl mx-auto">          {/* Enhanced Header without glass background */}          <div className="text-center mb-12">
            <div className="p-8 mb-8 max-w-5xl mx-auto">
              <h1 className="text-7xl font-black mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                  Enterprise Insights
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-300 via-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  Copilot
                </span>
              </h1>
              <div className="text-2xl text-gray-300 font-light tracking-wide">
                <span className="text-blue-200">AI-Powered</span> 
                <span className="mx-2">•</span>
                <span className="text-purple-200">Business Intelligence</span>
                <span className="mx-2">•</span>
                <span className="text-cyan-200">Platform</span>
              </div>
              <div className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto">
                Transform your data into actionable insights with intelligent multi-agent analysis
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column - Chat Interface */}
            <div className="lg:col-span-5 space-y-6">              {/* Enhanced 3D Glassmorphic Chat Interface */}
              <div className="glass-card-3d rounded-3xl p-8 relative overflow-hidden">
                {/* Additional 3D highlight layer */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500/60 via-blue-500/40 to-violet-600/60 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 border border-white/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                    <span className="text-2xl relative z-10">🤖</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-xl mb-1">AI Copilot</h3>
                    <p className="text-purple-200 text-sm">Your intelligent data assistant</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-full shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                  </div>
                </div>                {/* Enhanced 3D Upload Section */}
                <div className="glass-card-3d rounded-3xl p-8 mb-8 relative overflow-hidden">
                  {/* Top highlight line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                  
                  <div className="text-center relative z-10">
                    <div className="w-20 h-20 glass-card-3d rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-purple-500/10 rounded-3xl"></div>
                      <span className="relative z-10">📄</span>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-white font-bold text-xl">Upload CSV or Drag & Drop</h4>
                      <button
                        onClick={() => setUseMultiUpload(!useMultiUpload)}
                        className={`button-glossy-3d px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-400 ${
                          useMultiUpload 
                            ? 'bg-gradient-to-r from-white/25 to-white/15 text-white shadow-2xl border-white/30' 
                            : 'bg-gradient-to-r from-black/30 to-black/20 text-purple-200 hover:from-white/15 hover:to-white/10'
                        }`}
                      >
                        {useMultiUpload ? '📂 Multi' : '📄 Single'}
                      </button>
                    </div>{/* Upload Components */}
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
                )}                {/* Chat Input with enhanced styling */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={query}
                    onChange={handleQueryChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask a question about your data..."                    className="flex-1 glass-card-3d border-0 rounded-2xl px-6 py-4 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-300"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !query.trim()}
                    className="button-glossy-3d px-8 py-4 rounded-2xl font-semibold transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                  >
                    Send
                  </button>
                </div>
              </div>              {/* Enhanced 3D Chat Messages */}
              <div className="space-y-6">
                {messages.map((message, i) => (
                  <div key={i} className="glass-card-3d rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-2xl border border-white/20 relative overflow-hidden ${
                        message.role === 'assistant' 
                          ? 'bg-gradient-to-br from-purple-500/60 to-violet-500/60' 
                          : 'bg-gradient-to-br from-blue-500/60 to-cyan-500/60'
                      }`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                        <span className="relative z-10">{message.role === 'assistant' ? '🤖' : '👤'}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-white font-bold text-lg">
                            {message.role === 'assistant' ? 'AI Copilot' : 'You'}
                          </span>
                          <span className="text-purple-300 text-sm bg-purple-500/20 px-2 py-1 rounded-lg">{message.timestamp}</span>
                        </div>
                        <p className="text-gray-100 leading-relaxed text-base">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="glass-card-3d rounded-3xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/60 to-violet-500/60 rounded-2xl flex items-center justify-center text-lg shadow-2xl border border-white/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                        <span className="relative z-10">🤖</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full animate-bounce shadow-lg"></div>
                        <div className="w-4 h-4 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full animate-bounce delay-100 shadow-lg"></div>
                        <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-violet-400 rounded-full animate-bounce delay-200 shadow-lg"></div>
                        <span className="text-purple-200 ml-3 font-medium">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>            {/* Right Column - Enhanced Features */}
            <div className="lg:col-span-7 space-y-6">
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