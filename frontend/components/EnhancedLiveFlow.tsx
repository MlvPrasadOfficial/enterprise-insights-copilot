"use client";
import React, { useState } from 'react';
import { FileUploadAgentsPanel, ChatAgentsPanel, OutputAgentsPanel } from './AgentGroupPanels';
import EnhancedAgentPanel from './EnhancedAgentPanel';
import ProcessTimeline from './ProcessTimeline';
import CollapsibleSection from './CollapsibleSection';
import ResponsivePanel from './ResponsivePanel';
import '../styles/animations.css';
import { getDataCleanerResults } from '../utils/api';

interface EnhancedLiveFlowProps {
  agents: any[];
  currentQuery: string;
  fileUploadStatus: any;
  agentStatus?: Record<string, string>;
  onAgentToggle?: (agentType: string, enabled: boolean) => void;
}

export default function EnhancedLiveFlow({
  agents,
  currentQuery,
  fileUploadStatus,
  agentStatus,
  onAgentToggle
}: EnhancedLiveFlowProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  // Add state for real cleaning results
  const [realCleanerResults, setRealCleanerResults] = useState<any>(null);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  
  // Effect to fetch real data cleaner results
  useEffect(() => {
    const fetchRealCleanerResults = async () => {
      try {
        setIsLoadingResults(true);
        const results = await getDataCleanerResults();
        console.log("Got real data cleaner results from API:", results);
        if (results && (results.operations || results.cleaning_stats)) {
          setRealCleanerResults(results);
        }
      } catch (error) {
        console.error("Failed to fetch real data cleaner results:", error);
      } finally {
        setIsLoadingResults(false);
      }
    };
    
    // Fetch real results when component mounts
    fetchRealCleanerResults();
    
    // Refresh every 5 seconds while viewing
    const interval = setInterval(fetchRealCleanerResults, 5000);
    return () => clearInterval(interval);
  }, []);const [agentLogs] = useState<Record<string, string[]>>({
    planner: ["Analyzing query intent...", "Identifying required agents..."],
    query: ["Parsing natural language input...", "Extracting entities..."],
    data: ["Loading dataset...", "Analyzing column types...", "Dataset profile completed"],
    cleaner: [
      "Started cleaning process...",
      "Normalizing units in weight column",
      "Converted 25 values to standardized units",
      "Processing date fields...",
      "Standardized 18 date formats in purchase_date column",
      "Converting price column to numeric type (object → float64)",
      "Detecting outliers in age column",
      "Found 3 outliers outside bounds [18, 65]",
      "Checking for duplicate rows...",
      "Removed 12 duplicate entries",
      "Handling missing values in address column",
      "Data cleaning completed successfully!"
    ]
  });
  
  // Process stages for the timeline
  const processStages = [
    {
      id: 'data-processing',
      name: 'Data Processing',
      description: 'Uploading and preparing data for analysis',
      status: 'complete' as const,
      icon: '📊'
    },
    {
      id: 'query-analysis',
      name: 'Query Analysis',
      description: 'Understanding your question and planning the approach',
      status: 'in-progress' as const,
      icon: '🔍'
    },
    {
      id: 'data-analysis',
      name: 'Data Analysis',
      description: 'Executing queries and generating insights',
      status: 'pending' as const,
      icon: '📈'
    },
    {
      id: 'output-generation',
      name: 'Output Generation',
      description: 'Creating visualizations and narrative explanations',
      status: 'pending' as const,
      icon: '📝'
    }
  ];
    // Sample cleaning result for the Data Cleaner agent
  const sampleCleaningResult = {
    operations: [
      {
        operation: "normalize_units",
        column: "weight",
        count_changed: 25
      },
      {
        operation: "normalize_dates",
        column: "purchase_date",
        count_changed: 18
      },
      {
        operation: "convert_numeric",
        column: "price",
        from_type: "object",
        to_type: "float64"
      },
      {
        operation: "handle_outliers",
        column: "age",
        outlier_count: 3,
        lower_bound: 18,
        upper_bound: 65
      },
      {
        operation: "remove_duplicates",
        count_removed: 12,
        original_count: 250,
        new_count: 238
      },
      {
        operation: "handle_missing",
        column: "address"
      }
    ],
    cleaning_stats: {
      operations_count: 6,
      operations_by_type: {
        normalize_units: 1,
        normalize_dates: 1,
        convert_numeric: 1,
        handle_outliers: 1,
        remove_duplicates: 1,
        handle_missing: 1
      },
      columns_modified: ["weight", "purchase_date", "price", "age", "address"],
      rows_before: 250,
      rows_after: 238,
      row_count_change: -12,
      missing_values_before: 45,
      missing_values_after: 28,
      missing_values_change: -17
    }
  };
  // Log agents data for debugging
  console.log("Raw agents data received:", JSON.stringify(agents));
  
  // Example agent data for demonstration
  const enhancedAgents = agents.map(agent => {
    // Debug log for each agent
    console.log(`Processing agent ${agent.name} of type ${agent.type}:`, agent);
    
    const baseAgent = {
      ...agent,
      capabilities: [
        { name: "Process Data", description: "Analyze uploaded datasets", enabled: true },
        { name: "Generate Insights", description: "Create natural language insights", enabled: true },
        { name: "Respond to Queries", description: "Answer questions about the data", enabled: agent.type !== 'cleaner' }
      ],
      steps: [
        { id: 1, description: "Initializing", status: "complete" as const, timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
        { id: 2, description: "Processing request", status: "complete" as const, timestamp: new Date(Date.now() - 2000).toLocaleTimeString() },
        { id: 3, description: "Finalizing results", status: "complete" as const, timestamp: new Date().toLocaleTimeString() }
      ]
    };
      // Add real cleaning results for the Data Cleaner agent
    if (agent.type === 'cleaner') {      // Log agent specific data for debugging
      console.log("Data cleaner agent found:", agent);
      console.log("Has cleaning result?", !!agent.cleaningResult);
      
      // Check for any cleaningResult property regardless of casing
      const cleaningResultProp = Object.keys(agent).find(
        key => key.toLowerCase() === 'cleaningresult'
      );
      
      const agentCleaningResult = cleaningResultProp ? agent[cleaningResultProp] : null;
      console.log("Agent cleaning result property:", cleaningResultProp);
      console.log("Agent cleaning result data:", agentCleaningResult);
      console.log("Real API cleaning result:", realCleanerResults);
      
      // Show loading indicator when fetching results
      if (isLoadingResults && !agentCleaningResult && !realCleanerResults) {
        return {
          ...baseAgent,
          message: "Loading real cleaning results...",
          status: "working" as const,
        };
      }
      
      return {
        ...baseAgent,
        message: "Data cleaning completed successfully",
        status: "complete" as const,
        // Prioritize results: 1. Real API results, 2. Agent results, 3. Sample data
        cleaningResult: realCleanerResults || agentCleaningResult || agent.cleaningResult || sampleCleaningResult,
        steps: [
          { id: 1, description: "Analyzing data types", status: "complete" as const, timestamp: new Date(Date.now() - 25000).toLocaleTimeString() },
          { id: 2, description: "Normalizing units", status: "complete" as const, timestamp: new Date(Date.now() - 20000).toLocaleTimeString() },
          { id: 3, description: "Converting data types", status: "complete" as const, timestamp: new Date(Date.now() - 15000).toLocaleTimeString() },
          { id: 4, description: "Handling outliers", status: "complete" as const, timestamp: new Date(Date.now() - 10000).toLocaleTimeString() },
          { id: 5, description: "Removing duplicates", status: "complete" as const, timestamp: new Date(Date.now() - 5000).toLocaleTimeString() }
        ]
      };
    }
    
    return baseAgent;
  });

  // UI helper functions
  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'working': return 'bg-blue-500/10 border-blue-500/30';
      case 'complete': return 'bg-green-500/10 border-green-500/30';
      case 'error': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-white/5 border-white/10';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-blue-400';
      case 'complete': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-white/70';
    }
  };
  
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Function to render an agent panel with the enhanced component
  const renderAgentPanel = (agent: any) => (
    <EnhancedAgentPanel
      key={agent.type}
      agent={agent}
      selectedAgent={selectedAgent}
      setSelectedAgent={setSelectedAgent}
      agentLogs={agentLogs}
      getStatusBackground={getStatusBackground}
      getStatusColor={getStatusColor}
      formatDuration={formatDuration}
    />
  );

  // Determine active section based on agent activity
  const isFileUploadActive = enhancedAgents.some(a => 
    ['data', 'cleaner'].includes(a.type) && a.status === 'working'
  );
  
  const isChatResponseActive = enhancedAgents.some(a => 
    ['planner', 'query', 'retrieval', 'sql', 'insight', 'chart'].includes(a.type) && a.status === 'working'
  );
  
  const isOutputActive = enhancedAgents.some(a => 
    ['critique', 'debate', 'narrative', 'report'].includes(a.type) && a.status === 'working'
  );

  return (
    <div className="glass-card-3d p-6 space-y-6">
      {/* Highlight lines */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
      <div className="absolute top-0 right-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
      
      {/* Header with enhanced styling */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/40 to-blue-500/40 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm">
            🤖
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Live Flow
            </h3>
            <p className="text-white/70 text-sm">Real-time agent monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-card-3d px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
            <span className="text-white font-medium text-sm">
              {enhancedAgents.filter(a => a.status === 'working').length} active
            </span>
          </div>
        </div>
      </div>
      
      {/* Process Timeline */}
      <CollapsibleSection 
        title="Process Overview" 
        icon="📋" 
        defaultExpanded={true}
      >
        <ProcessTimeline 
          stages={processStages}
          currentStage="query-analysis"
        />
      </CollapsibleSection>

      {/* Responsive panels container */}
      <ResponsivePanel>
        <div className="space-y-6 w-full">
          {/* File Upload Agents Group with status-based focus */}
          <div className={`transition-all duration-300 ${
            isFileUploadActive ? 'scale-100 opacity-100 focus-highlight' : 'scale-98 opacity-90'
          }`}>
            <FileUploadAgentsPanel 
              enhancedAgents={enhancedAgents} 
              renderAgentPanel={renderAgentPanel} 
            />
          </div>

          {/* Chat Agents Group with status-based focus */}
          <div className={`transition-all duration-300 ${
            isChatResponseActive ? 'scale-100 opacity-100 focus-highlight' : 'scale-98 opacity-90'
          }`}>
            <ChatAgentsPanel 
              enhancedAgents={enhancedAgents} 
              renderAgentPanel={renderAgentPanel} 
            />
          </div>

          {/* Output Agents Group with status-based focus */}
          <div className={`transition-all duration-300 ${
            isOutputActive ? 'scale-100 opacity-100 focus-highlight' : 'scale-98 opacity-90'
          }`}>
            <OutputAgentsPanel 
              enhancedAgents={enhancedAgents} 
              renderAgentPanel={renderAgentPanel} 
            />
          </div>
        </div>
      </ResponsivePanel>
    </div>
  );
}
