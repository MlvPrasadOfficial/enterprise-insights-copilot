"use client";
import React, { useState, useEffect } from 'react';
import DataCleanerResults from './DataCleanerResults';

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

// Define the interfaces for the cleaning operation results
interface CleaningOperation {
  operation: string;
  column?: string;
  count_changed?: number;
  from_type?: string;
  to_type?: string;
  outlier_count?: number;
  lower_bound?: number;
  upper_bound?: number;
  count_removed?: number;
  original_count?: number;
  new_count?: number;
}

interface CleaningStats {
  operations_count: number;
  operations_by_type: Record<string, number>;
  columns_modified: string[];
  rows_before: number;
  rows_after: number;
  row_count_change: number;
  missing_values_before: number;
  missing_values_after: number;
  missing_values_change: number;
}

interface CleaningResult {
  operations: CleaningOperation[];
  cleaning_stats: CleaningStats;
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
  cleaningResult?: CleaningResult; // Added for Data Cleaner agent
}

interface EnhancedAgentPanelProps {
  agent: EnhancedAgent;
  selectedAgent: string | null;
  setSelectedAgent: (agentType: string | null) => void;
  agentLogs: Record<string, string[]>;
  getStatusBackground: (status: string) => string;
  getStatusColor: (status: string) => string;
  formatDuration: (ms: number) => string;
}

export default function EnhancedAgentPanel({
  agent,
  selectedAgent,
  setSelectedAgent,
  agentLogs,
  getStatusBackground,
  getStatusColor,
  formatDuration
}: EnhancedAgentPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Determine if this panel should be focused (either working or selected)
  const isFocused = agent.status === 'working' || selectedAgent === agent.type;
  
  // Effect for automatic expansion when agent starts working
  useEffect(() => {
    if (agent.status === 'working') {
      setIsExpanded(true);
    }
  }, [agent.status]);
  
  // Logs for this agent
  const logs = agentLogs[agent.type] || [];

  // Handle agent pause/resume
  const handlePauseResume = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    console.log(`${agent.status === 'working' ? 'Pausing' : 'Resuming'} ${agent.name}`);
    // Here you would dispatch an action to pause/resume the agent
  };
  
  // Handle agent prioritize
  const handlePrioritize = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log(`Prioritizing ${agent.name}`);
    // Here you would dispatch an action to prioritize the agent
  };

  return (
    <div 
      className={`
        glass-panel relative transition-all duration-300 ease-in-out
        ${isCollapsed ? 'h-10 overflow-hidden' : 'h-auto'} 
        ${isFocused ? 'ring-2 ring-offset-1 ring-opacity-50' : ''}
        ${agent.status === 'working' ? 'ring-blue-400' : 
           agent.status === 'complete' ? 'ring-green-400' : 
           agent.status === 'error' ? 'ring-red-400' : ''}
      `}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setShowTooltip(false);
      }}
    >
      {/* Animated progress bar for working agents */}
      {agent.status === 'working' && (
        <div 
          className="absolute bottom-0 left-0 h-0.5 bg-blue-400"
          style={{ 
            width: `${agent.progress || 0}%`, 
            transition: 'width 0.5s ease-in-out' 
          }}
        />
      )}

      {/* Agent header - always visible */}
      <div 
        className={`
          flex items-center justify-between p-3 cursor-pointer
          ${getStatusBackground(agent.status)}
          transition-colors duration-300
        `}
        onClick={() => {
          setIsExpanded(!isExpanded);
          setSelectedAgent(selectedAgent === agent.type ? null : agent.type);
        }}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            agent.status === 'working' ? 'animate-pulse' : ''
          }`}>
            <span role="img" aria-label={agent.name} className="text-xl">{agent.icon}</span>
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">{agent.name}</h4>
            <p className={`text-xs ${getStatusColor(agent.status)}`}>
              {agent.status === 'working' ? agent.currentTask || 'Processing...' : agent.message}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status indicator */}
          <div className={`h-2 w-2 rounded-full ${
            agent.status === 'idle' ? 'bg-gray-400' :
            agent.status === 'working' ? 'bg-blue-400 animate-pulse' :
            agent.status === 'complete' ? 'bg-green-400' :
            'bg-red-400'
          }`}></div>
          
          {/* Tooltip button */}
          <button 
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(!showTooltip);
            }}
          >
            ?
          </button>
          
          {/* Collapse/expand button */}
          <button 
            className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
          >
            {isCollapsed ? '↓' : '↑'}
          </button>
        </div>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-12 w-64 p-3 bg-gray-900/90 backdrop-blur-sm rounded-lg z-10 border border-white/20 shadow-xl">
          <h5 className="font-medium text-white mb-1">{agent.name}</h5>
          <p className="text-xs text-white/70 mb-2">
            {getAgentDescription(agent.type)}
          </p>
          <div className="text-xs text-white/60 space-y-1">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={getStatusColor(agent.status)}>{agent.status}</span>
            </div>
            {agent.startTime && (
              <div className="flex justify-between">
                <span>Started:</span>
                <span>{agent.startTime}</span>
              </div>
            )}
            {agent.estimatedTimeRemaining !== undefined && agent.status === 'working' && (
              <div className="flex justify-between">
                <span>Est. completion:</span>
                <span>{formatDuration(agent.estimatedTimeRemaining)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expandable content area */}
      {!isCollapsed && isExpanded && (
        <div className="p-3 space-y-4 animate-fadeIn">
          {/* Agent action buttons */}
          <div className="flex space-x-2">
            <button 
              onClick={handlePauseResume}
              className="px-2 py-1 text-xs rounded bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              {agent.status === 'working' ? 'Pause' : 'Resume'}
            </button>
            <button 
              onClick={handlePrioritize}
              className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-blue-200 transition-colors"
            >
              Prioritize
            </button>
          </div>
          
          {/* Progress Steps */}
          {agent.steps && agent.steps.length > 0 && (
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
              <div className="space-y-1 bg-black/30 rounded-lg p-2 border border-white/10 max-h-32 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="text-xs text-gray-300 font-mono">{log}</div>
                ))}
              </div>
            </div>
          )}          {/* Data Cleaner Results - only shown for Data Cleaner agent */}
          {agent.type === 'cleaner' && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <h5 className="text-white/80 text-lg font-medium mb-4">Data Cleaning Results</h5>
              
              {/* Check for cleaningResult under different possible property names */}
              {(() => {
                // Try to find the cleaningResult property (case insensitive)
                if (agent.cleaningResult) {
                  console.log("Using agent.cleaningResult:", agent.cleaningResult);
                  return <DataCleanerResults cleaningResult={agent.cleaningResult} />;
                }
                
                const resultKey = Object.keys(agent).find(
                  key => key.toLowerCase() === 'cleaningresult'
                );
                
                if (resultKey && agent[resultKey]) {
                  console.log(`Using agent.${resultKey}:`, agent[resultKey]);
                  return <DataCleanerResults cleaningResult={agent[resultKey]} />;
                }
                
                // If we can't find the results, show a message
                console.warn("No cleaning results found in agent:", agent);
                return (
                  <div className="p-4 bg-black/30 rounded-lg">
                    <p className="text-white/70">Loading real cleaning results...</p>
                    <p className="text-white/50 text-xs mt-2">
                      If this message persists, try processing another file or check the console for errors.
                    </p>
                  </div>
                );
              })()}
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
}

// Helper function to get appropriate agent descriptions
function getAgentDescription(agentType: string): string {
  switch (agentType) {
    case 'planner':
      return "Routes your query to the right specialists and orchestrates the analysis workflow.";
    case 'query':
      return "Processes your natural language questions and extracts key information.";
    case 'retrieval':
      return "Finds relevant information from knowledge bases to support your queries.";
    case 'data':
      return "Analyzes your uploaded data files to provide statistical profiles and insights.";
    case 'cleaner':
      return "Prepares and cleans your data for analysis by handling missing values, outliers, and format issues.";
    case 'sql':
      return "Generates and runs SQL queries against your data to answer specific questions.";
    case 'insight':
      return "Analyzes patterns and trends in your data to generate meaningful interpretations.";
    case 'chart':
      return "Creates visualizations of your data based on analysis needs and query context.";
    case 'critique':
      return "Reviews analysis results for accuracy, completeness, and quality.";
    case 'debate':
      return "Explores multiple perspectives on complex questions to provide balanced conclusions.";
    case 'narrative':
      return "Creates coherent explanations and stories from analysis results.";
    case 'report':
      return "Compiles all analysis artifacts into comprehensive, formatted reports.";
    default:
      return "Specialized agent for data analysis and insights.";
  }
}
