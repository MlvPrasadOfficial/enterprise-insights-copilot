"use client";
import React, { useState, useEffect, useMemo } from 'react';

interface AgentCapability {
  name: string;
  description: string;
  enabled: boolean;
}

interface StepProcess {
  id: number;
  description: string;
  status: "pending" | "in-progress" | "complete" | "error";
  timestamp?: string;
}

interface EnhancedAgent {
  type: "planner" | "insight" | "chart" | "cleaner" | "data" | "query" | "sql" | "critique" | "debate" | "narrative" | "report" | "retrieval";
  name: string;
  icon: string;
  status: "idle" | "working" | "complete" | "error";
  message: string;
  startTime?: string;
  endTime?: string;
  progress?: number;
  capabilities: AgentCapability[];
  currentTask?: string;
  estimatedTimeRemaining?: number;
  steps?: StepProcess[];
}

interface LiveFlowProps {
  agents: any[]; // Original agent format
  currentQuery: string;
  fileUploadStatus: any;
  agentStatus?: Record<string, string>;
  onAgentToggle?: (agentType: string, enabled: boolean) => void;
}

export default function LiveFlow({ 
  agents, 
  currentQuery, 
  fileUploadStatus,
  agentStatus,
  onAgentToggle 
}: LiveFlowProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentLogs, setAgentLogs] = useState<Record<string, string[]>>({});
  const [agentStepProgress, setAgentStepProgress] = useState<Record<string, number>>({});

  // Suppress unused variable warnings by consuming them
  void currentQuery; void fileUploadStatus; void onAgentToggle; void agentStatus;

  // Agent workflow step definitions
  const getAgentSteps = (agentType: string): StepProcess[] => {
    const commonSteps: StepProcess[] = [
      { id: 1, description: "Initializing", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
      { id: 2, description: "Processing request", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
      { id: 3, description: "Finalizing results", status: "pending" }
    ];
    
    switch(agentType) {
      case 'planner':
        return [
          { id: 1, description: "Analyzing query", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Planning execution strategy", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Resource allocation", status: "pending" },
          { id: 4, description: "Generating execution plan", status: "pending" }
        ];
      case 'query':
        return [
          { id: 1, description: "Parsing natural language", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Extracting key parameters", status: "complete", timestamp: new Date(Date.now() - 3000).toLocaleTimeString() },
          { id: 3, description: "Analyzing intent", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 4, description: "Formulating structured query", status: "pending" }
        ];
      case 'retrieval':
        return [
          { id: 1, description: "Searching knowledge base", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Retrieving relevant context", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Ranking information relevance", status: "pending" },
          { id: 4, description: "Integrating retrieved data", status: "pending" }
        ];
      case 'data':
        return [
          { id: 1, description: "Identifying data sources", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Loading data structures", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Processing transformations", status: "pending" },
          { id: 4, description: "Preparing for analysis", status: "pending" }
        ];
      case 'cleaner':
        return [
          { id: 1, description: "Scanning for issues", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Detecting missing values", status: "complete", timestamp: new Date(Date.now() - 3000).toLocaleTimeString() },
          { id: 3, description: "Normalizing formats", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 4, description: "Validating integrity", status: "pending" }
        ];
      case 'sql':
        return [
          { id: 1, description: "Generating SQL", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Optimizing query", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Executing database query", status: "pending" },
          { id: 4, description: "Processing results", status: "pending" }
        ];
      case 'insight':
        return [
          { id: 1, description: "Processing correlations", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Statistical analysis", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Identifying patterns", status: "pending" },
          { id: 4, description: "Generating insights", status: "pending" }
        ];
      case 'chart':
        return [
          { id: 1, description: "Preparing data", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Selecting chart type", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Rendering visualization", status: "pending" },
          { id: 4, description: "Applying styling", status: "pending" }
        ];
      case 'critique':
        return [
          { id: 1, description: "Evaluating accuracy", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Checking validity", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Identifying biases", status: "pending" },
          { id: 4, description: "Generating feedback", status: "pending" }
        ];
      case 'debate':
        return [
          { id: 1, description: "Evaluating perspectives", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Analyzing evidence", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Forming counterarguments", status: "pending" },
          { id: 4, description: "Reaching conclusions", status: "pending" }
        ];
      case 'narrative':
        return [
          { id: 1, description: "Structuring story", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Developing narrative", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Connecting insights", status: "pending" },
          { id: 4, description: "Finalizing communication", status: "pending" }
        ];
      case 'report':
        return [
          { id: 1, description: "Gathering components", status: "complete", timestamp: new Date(Date.now() - 5000).toLocaleTimeString() },
          { id: 2, description: "Structuring report", status: "in-progress", timestamp: new Date().toLocaleTimeString() },
          { id: 3, description: "Formatting content", status: "pending" },
          { id: 4, description: "Creating summary", status: "pending" }
        ];
      default:
        return commonSteps;
    }
  };

  // Convert basic agents to enhanced agents with data from both agents and agentStatus
  const enhancedAgents = useMemo((): EnhancedAgent[] => {
    return agents.map(agent => {
      // Sync agent status with the global agentStatus if available
      let currentStatus = agent.status;
      if (agentStatus && agentStatus[agent.type]) {
        // Map from global status to component status
        const statusMap: Record<string, "idle" | "working" | "complete" | "error"> = {
          "idle": "idle",
          "running": "working",
          "working": "working",
          "success": "complete",
          "complete": "complete",
          "error": "error"
        };
        currentStatus = statusMap[agentStatus[agent.type]] || currentStatus;
      }

      return {
        ...agent,
        status: currentStatus,
        progress: currentStatus === 'working' ? Math.random() * 100 : currentStatus === 'complete' ? 100 : 0,
        capabilities: [
          { 
            name: agent.type === 'planner' ? 'Query Analysis' : agent.type === 'insight' ? 'Pattern Detection' : 'Chart Generation',
            description: agent.type === 'planner' ? 'Analyze and break down complex queries' : agent.type === 'insight' ? 'Find patterns and correlations in data' : 'Create visualizations and charts',
            enabled: true 
          },
          { 
            name: agent.type === 'planner' ? 'Resource Planning' : agent.type === 'insight' ? 'Statistical Analysis' : 'Interactive Dashboards',
            description: agent.type === 'planner' ? 'Optimize resource allocation for queries' : agent.type === 'insight' ? 'Perform statistical computations' : 'Build interactive data dashboards',
            enabled: Math.random() > 0.3 
          },
          { 
            name: agent.type === 'planner' ? 'Cost Estimation' : agent.type === 'insight' ? 'Anomaly Detection' : 'Export Options',
            description: agent.type === 'planner' ? 'Estimate query processing costs' : agent.type === 'insight' ? 'Identify data anomalies and outliers' : 'Export charts in multiple formats',
            enabled: Math.random() > 0.5 
          }
        ],
        currentTask: currentStatus === 'working' ? agent.message : undefined,
        estimatedTimeRemaining: currentStatus === 'working' ? Math.floor(Math.random() * 5000) + 1000 : undefined,
        steps: currentStatus !== 'idle' ? getAgentSteps(agent.type) : undefined
      };
    });
  }, [agents, agentStatus]);

  // Generate agent logs and update step progress
  useEffect(() => {
    const interval = setInterval(() => {
      enhancedAgents.forEach(agent => {
        if (agent.status === 'working') {
          // Generate logs
          setAgentLogs(prev => {
            const agentLogs = prev[agent.type] || [];
            const newLog = `${new Date().toLocaleTimeString()}: ${getRandomLogMessage(agent)}`;
            return {
              ...prev,
              [agent.type]: [...agentLogs.slice(-4), newLog] // Keep last 5 logs
            };
          });
          
          // Update step progress
          if (agent.steps) {
            // Simulate step progression
            // Only advance to next step with 20% probability to make it feel realistic
            if (Math.random() < 0.2) {
              const inProgressIndex = agent.steps.findIndex(step => step.status === 'in-progress');
              if (inProgressIndex >= 0 && inProgressIndex < agent.steps.length - 1) {
                agent.steps[inProgressIndex].status = 'complete';
                agent.steps[inProgressIndex].timestamp = new Date().toLocaleTimeString();
                agent.steps[inProgressIndex + 1].status = 'in-progress';
                agent.steps[inProgressIndex + 1].timestamp = new Date().toLocaleTimeString();
                
                // Update progress tracking
                setAgentStepProgress(prev => ({
                  ...prev, 
                  [agent.type]: (prev[agent.type] || 0) + 1
                }));
              }
            }
          }
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [enhancedAgents]);

  // Generate random log messages
  const getRandomLogMessage = (agent: EnhancedAgent) => {
    const messages = {
      planner: [
        'Analyzing query complexity...',
        'Estimating resource requirements...',
        'Planning execution strategy...',
        'Optimizing query parameters...',
        'Validating data access patterns...'
      ],
      query: [
        'Processing natural language query...',
        'Extracting key query parameters...',
        'Analyzing query intent...',
        'Formulating structured query...',
        'Refining query context...'
      ],
      cleaner: [
        'Detecting missing values...',
        'Normalizing data formats...',
        'Removing duplicate records...',
        'Standardizing column names...',
        'Validating data integrity...'
      ],
      sql: [
        'Generating SQL query...',
        'Optimizing join operations...',
        'Validating SQL syntax...',
        'Executing database query...',
        'Processing query results...'
      ],
      insight: [
        'Processing data correlations...',
        'Detecting statistical patterns...',
        'Computing trend analysis...',
        'Identifying key insights...',
        'Generating recommendations...'
      ],
      chart: [
        'Preparing visualization data...',
        'Selecting optimal chart type...',
        'Rendering interactive elements...',
        'Applying styling preferences...',
        'Optimizing for performance...'
      ],
      critique: [
        'Evaluating analysis accuracy...',
        'Identifying potential biases...',
        'Checking statistical validity...',
        'Reviewing methodology...',
        'Suggesting improvements...'
      ],
      debate: [
        'Considering alternative perspectives...',
        'Analyzing contradictory evidence...',
        'Presenting counterarguments...',
        'Evaluating multiple viewpoints...',
        'Synthesizing balanced conclusions...'
      ],
      narrative: [
        'Constructing data story...',
        'Developing narrative arc...',
        'Connecting insights to context...',
        'Refining explanatory language...',
        'Enhancing clarity of communication...'
      ],
      report: [
        'Compiling analysis results...',
        'Formatting report structure...',
        'Adding visual elements...',
        'Generating executive summary...',
        'Finalizing document formatting...'
      ],
      retrieval: [
        'Searching knowledge base...',
        'Retrieving relevant context...',
        'Ranking information relevance...',
        'Accessing external sources...',
        'Integrating retrieved data...'
      ],
      data: [
        'Processing data structures...',
        'Performing feature engineering...',
        'Handling data transformations...',
        'Managing data pipelines...',
        'Ensuring data consistency...'
      ]
    };
    
    const agentMessages = messages[agent.type] || ['Processing...'];
    return agentMessages[Math.floor(Math.random() * agentMessages.length)];
  };

  // Format duration
  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'text-gray-400';
      case 'working': return 'text-blue-400';
      case 'complete': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get status background
  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-gray-600/20';
      case 'working': return 'bg-blue-600/20';
      case 'complete': return 'bg-green-600/20';
      case 'error': return 'bg-red-600/20';
      default: return 'bg-gray-600/20';
    }
  };  

  // Define the AgentPanel component
  interface AgentPanelProps {
    agent: EnhancedAgent;
    selectedAgent: string | null;
    setSelectedAgent: (agent: string | null) => void;
    agentLogs: Record<string, string[]>;
    getStatusBackground: (status: string) => string;
    getStatusColor: (status: string) => string;
    formatDuration: (ms: number) => string;
  }

  const AgentPanel: React.FC<AgentPanelProps> = ({
    agent,
    selectedAgent,
    setSelectedAgent,
    agentLogs,
    getStatusBackground,
    getStatusColor,
    formatDuration
  }) => {
    const isExpanded = selectedAgent === agent.type;
    const logs = agentLogs[agent.type] || [];

    return (
      <div 
        key={agent.type}
        className={`glass-card-3d ${getStatusBackground(agent.status)} backdrop-blur-sm transition-all duration-300 ${
          isExpanded ? 'p-4' : 'p-3'
        }`}
      >
        {/* Agent Header */}
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setSelectedAgent(isExpanded ? null : agent.type)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gray-800/50 flex items-center justify-center shadow-inner border border-gray-700/50">
              <span className="text-xl">{agent.icon}</span>
            </div>
            <div>
              <h4 className="font-medium text-white">{agent.name}</h4>
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  agent.status === 'idle' ? 'bg-gray-400' : 
                  agent.status === 'working' ? 'bg-blue-400 animate-pulse' : 
                  agent.status === 'complete' ? 'bg-green-400' : 
                  'bg-red-400'
                }`}></div>
                <span className={`text-xs ${getStatusColor(agent.status)}`}>
                  {agent.status}
                  {agent.estimatedTimeRemaining && agent.status === 'working' && 
                    ` · ~${formatDuration(agent.estimatedTimeRemaining)} remaining`
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {agent.status === 'working' && (
              <div className="h-1 w-16 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full" 
                  style={{ width: `${agent.progress || 0}%` }}
                ></div>
              </div>
            )}
            <button 
              className="rounded-lg p-1 hover:bg-white/10 transition-colors"
              onClick={(e) => {
                e.stopPropagation(); 
                setSelectedAgent(isExpanded ? null : agent.type);
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-white transition-transform transform ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Progress Steps */}
            {agent.steps && (
              <div className="space-y-3">
                <h5 className="text-white/80 text-sm font-medium">Process Steps</h5>
                <div className="space-y-2">
                  {agent.steps.map((step) => (
                    <div key={step.id} className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        step.status === 'complete' ? 'bg-green-500/20 text-green-400' :
                        step.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400 animate-pulse' :
                        step.status === 'error' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {step.status === 'complete' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : step.status === 'in-progress' ? (
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        ) : step.status === 'error' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className={`text-sm ${
                            step.status === 'complete' ? 'text-green-400' :
                            step.status === 'in-progress' ? 'text-blue-400' :
                            step.status === 'error' ? 'text-red-400' :
                            'text-gray-400'
                          }`}>
                            {step.description}
                          </span>
                          {step.timestamp && (
                            <span className="text-xs text-gray-500">{step.timestamp}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Agent Logs */}
            {logs.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-white/80 text-sm font-medium">Recent Logs</h5>
                <div className="space-y-1 bg-black/30 rounded-lg p-2 border border-white/10">
                  {logs.map((log, i) => (
                    <div key={i} className="text-xs text-gray-300 font-mono">{log}</div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Capabilities */}
            <div className="space-y-2">
              <h5 className="text-white/80 text-sm font-medium">Capabilities</h5>
              <div className="grid grid-cols-1 gap-2">
                {agent.capabilities.map((capability, idx) => (
                  <div 
                    key={idx}
                    className={`text-xs p-2 rounded border ${
                      capability.enabled 
                        ? 'border-cyan-500/30 bg-cyan-500/5 text-cyan-400'
                        : 'border-gray-700/30 bg-gray-800/30 text-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{capability.name}</span>
                      <div className={`w-3 h-3 rounded-full ${
                        capability.enabled ? 'bg-cyan-400' : 'bg-gray-700'
                      }`}></div>
                    </div>
                    <p className="mt-1 text-xs opacity-80">{capability.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Function to render an agent panel consistently
  const renderAgentPanel = (agent: EnhancedAgent) => (
    <AgentPanel
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

      {/* Cleaner Agent Panel - 1st Panel */}
      {enhancedAgents.filter(agent => agent.type === 'cleaner').map(renderAgentPanel)}

      {/* Data Agent Panel - 2nd Panel */}
      {enhancedAgents.filter(agent => agent.type === 'data').map(renderAgentPanel)}

      {/* Planner Agent Panel - 3rd Panel (conceptual first step) */}
      {enhancedAgents.filter(agent => agent.type === 'planner').map(renderAgentPanel)}

      {/* Query Agent Panel - 4th Panel */}
      {enhancedAgents.filter(agent => agent.type === 'query').map(renderAgentPanel)}
      
      {/* SQL, Insight, Chart Agents Horizontal Panel */}
      <div className="grid grid-cols-3 gap-3">
        {enhancedAgents
          .filter(agent => ['sql', 'insight', 'chart'].includes(agent.type))
          .map(renderAgentPanel)}
      </div>

      {/* Retrieval Agent Panel - directly below Query Agent */}
      {enhancedAgents.filter(agent => agent.type === 'retrieval').map(renderAgentPanel)}

      {/* Other Agents - Critique, Debate, Narrative and Report */}
      {enhancedAgents
        .filter(agent => !['planner', 'sql', 'insight', 'chart', 'cleaner', 'data', 'query', 'retrieval'].includes(agent.type))
        .map(renderAgentPanel)}
    </div>
  );
}
