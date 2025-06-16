"use client";
import React, { useState, useRef, useEffect } from 'react';

interface AgentWork {
  id: string;
  timestamp: string;
  description: string;
  result?: string;
}

interface AgentRole {
  id: string;
  name: string;
  description: string;
}

interface AgentStatusPanelProps {
  agents: any[];
  agentStatus?: Record<string, string>;
}

export default function AgentStatusPanel({ agents, agentStatus }: AgentStatusPanelProps) {
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [expandedDropdown, setExpandedDropdown] = useState<{ agent: string, type: 'work' | 'roles' } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExpandedDropdown(null);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate sample agent work for demo purposes
  const getAgentWork = (agentType: string): AgentWork[] => {
    const workItems: Record<string, AgentWork[]> = {
      'planner': [
        { id: 'w1', timestamp: '10:24:32', description: 'Analyzed query structure', result: 'Identified key operations: filter, group, calculate' },
        { id: 'w2', timestamp: '10:24:45', description: 'Created execution plan', result: 'Delegated to SQL, Insight, and Chart agents' }
      ],
      'query': [
        { id: 'w1', timestamp: '10:24:38', description: 'Parsed natural language', result: 'Identified intent: comparative analysis' },
        { id: 'w2', timestamp: '10:24:52', description: 'Extracted entities', result: 'Found columns: revenue, region, year' }
      ],
      'retrieval': [
        { id: 'w1', timestamp: '10:24:40', description: 'Retrieved context', result: 'Found 3 relevant examples' },
        { id: 'w2', timestamp: '10:24:55', description: 'Ranked information', result: 'Prioritized recent financial data' }
      ],
      'sql': [
        { id: 'w1', timestamp: '10:25:02', description: 'Generated SQL query', result: 'SELECT region, SUM(revenue) FROM data GROUP BY region' },
        { id: 'w2', timestamp: '10:25:10', description: 'Optimized query', result: 'Added indexing hint for performance' }
      ],
      'data': [
        { id: 'w1', timestamp: '10:23:45', description: 'Loaded CSV file', result: '5000 rows processed' },
        { id: 'w2', timestamp: '10:23:50', description: 'Indexed columns', result: 'Created lookup indices for 12 columns' }
      ],
      'cleaner': [
        { id: 'w1', timestamp: '10:23:55', description: 'Identified missing values', result: '34 missing values detected' },
        { id: 'w2', timestamp: '10:24:05', description: 'Applied data normalization', result: 'Standardized date formats' }
      ],
      'insight': [
        { id: 'w1', timestamp: '10:25:15', description: 'Analyzed patterns', result: 'Discovered 3 key correlations' },
        { id: 'w2', timestamp: '10:25:25', description: 'Generated insights', result: 'North region shows 24% higher growth' }
      ],
      'chart': [
        { id: 'w1', timestamp: '10:25:30', description: 'Selected visualization', result: 'Chose bar chart for comparison' },
        { id: 'w2', timestamp: '10:25:40', description: 'Applied styling', result: 'Added color coding by performance' }
      ],
      'critique': [
        { id: 'w1', timestamp: '10:25:45', description: 'Evaluated accuracy', result: '95% confidence in results' },
        { id: 'w2', timestamp: '10:25:55', description: 'Checked for biases', result: 'Limited data for Q4 noted' }
      ],
      'debate': [
        { id: 'w1', timestamp: '10:26:00', description: 'Considered alternatives', result: 'Explored 2 alternative interpretations' },
        { id: 'w2', timestamp: '10:26:10', description: 'Validated conclusions', result: 'Confirmed primary insight with statistical test' }
      ],
      'narrative': [
        { id: 'w1', timestamp: '10:26:15', description: 'Structured narrative', result: 'Created 3-part story structure' },
        { id: 'w2', timestamp: '10:26:25', description: 'Linked findings', result: 'Connected revenue growth to marketing spend' }
      ],
      'report': [
        { id: 'w1', timestamp: '10:26:30', description: 'Compiled components', result: 'Integrated 4 sections with visuals' },
        { id: 'w2', timestamp: '10:26:40', description: 'Finalized report', result: 'Created executive summary' }
      ]
    };
    
    return workItems[agentType] || [];
  };
  
  // Agent capabilities/roles definitions
  const getAgentRoles = (agentType: string): AgentRole[] => {
    const roles: Record<string, AgentRole[]> = {
      'planner': [
        { id: 'r1', name: 'Query Analysis', description: 'Breaks down complex queries into subtasks' },
        { id: 'r2', name: 'Resource Planning', description: 'Optimizes agent allocation for efficient processing' },
        { id: 'r3', name: 'Execution Strategy', description: 'Determines optimal processing sequence' }
      ],
      'query': [
        { id: 'r1', name: 'NL Understanding', description: 'Interprets natural language questions' },
        { id: 'r2', name: 'Intent Detection', description: 'Identifies the core purpose of queries' },
        { id: 'r3', name: 'Parameter Extraction', description: 'Isolates key variables from questions' }
      ],
      'retrieval': [
        { id: 'r1', name: 'Context Search', description: 'Finds relevant information from knowledge base' },
        { id: 'r2', name: 'Relevance Ranking', description: 'Prioritizes most relevant information' },
        { id: 'r3', name: 'Context Integration', description: 'Incorporates background knowledge into analysis' }
      ],
      'data': [
        { id: 'r1', name: 'Data Loading', description: 'Imports and processes data files' },
        { id: 'r2', name: 'Schema Detection', description: 'Identifies data structure and relationships' },
        { id: 'r3', name: 'Initial Analysis', description: 'Performs preliminary data assessment' }
      ],
      'cleaner': [
        { id: 'r1', name: 'Missing Value Detection', description: 'Identifies gaps in data' },
        { id: 'r2', name: 'Data Normalization', description: 'Standardizes formats and units' },
        { id: 'r3', name: 'Anomaly Detection', description: 'Flags outliers and unusual patterns' }
      ],
      'sql': [
        { id: 'r1', name: 'SQL Generation', description: 'Creates efficient database queries' },
        { id: 'r2', name: 'Query Optimization', description: 'Improves query performance' },
        { id: 'r3', name: 'Result Processing', description: 'Formats query results for analysis' }
      ],
      'insight': [
        { id: 'r1', name: 'Pattern Detection', description: 'Identifies trends and correlations' },
        { id: 'r2', name: 'Statistical Analysis', description: 'Applies statistical methods to data' },
        { id: 'r3', name: 'Insight Generation', description: 'Creates meaningful business insights' }
      ],
      'chart': [
        { id: 'r1', name: 'Chart Selection', description: 'Chooses optimal visualization types' },
        { id: 'r2', name: 'Data Visualization', description: 'Creates effective visual representations' },
        { id: 'r3', name: 'Visual Enhancement', description: 'Applies styling and interactive elements' }
      ],
      'critique': [
        { id: 'r1', name: 'Accuracy Evaluation', description: 'Validates findings and conclusions' },
        { id: 'r2', name: 'Bias Detection', description: 'Identifies potential biases in analysis' },
        { id: 'r3', name: 'Quality Assessment', description: 'Evaluates overall insight quality' }
      ],
      'debate': [
        { id: 'r1', name: 'Alternative Views', description: 'Considers multiple interpretations' },
        { id: 'r2', name: 'Evidence Analysis', description: 'Evaluates supporting and contradicting data' },
        { id: 'r3', name: 'Conclusion Validation', description: 'Ensures robust final conclusions' }
      ],
      'narrative': [
        { id: 'r1', name: 'Story Structure', description: 'Creates coherent narrative frameworks' },
        { id: 'r2', name: 'Content Connection', description: 'Links insights into meaningful stories' },
        { id: 'r3', name: 'Communication Clarity', description: 'Ensures clear, compelling communication' }
      ],
      'report': [
        { id: 'r1', name: 'Content Compilation', description: 'Gathers and organizes all outputs' },
        { id: 'r2', name: 'Format Optimization', description: 'Creates professional report layouts' },
        { id: 'r3', name: 'Summary Creation', description: 'Distills key findings into executive summaries' }
      ]
    };
    
    return roles[agentType] || [];
  };
  
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'idle': 'bg-gray-500/20',
      'working': 'bg-blue-500/30',
      'running': 'bg-blue-500/30',
      'complete': 'bg-green-500/30',
      'success': 'bg-green-500/30',
      'error': 'bg-red-500/30'
    };
    return statusColors[status] || 'bg-gray-500/20';
  };
  
  const getStatusText = (status: string) => {
    const statusText: Record<string, string> = {
      'idle': 'Idle',
      'working': 'Working',
      'running': 'Running',
      'complete': 'Complete',
      'success': 'Success',
      'error': 'Error'
    };
    return statusText[status] || 'Unknown';
  };

  return (
    <div className="glass-card-3d p-4 space-y-4 bg-gradient-to-br from-indigo-600/10 to-violet-600/10 animate-slideInUp transition-all">
      {/* Header with highlights */}
      <div className="relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
        <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-indigo-500/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-indigo-500/30 to-transparent"></div>

        <div className="flex items-center justify-between mb-2 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-800/40 flex items-center justify-center border border-indigo-700/50 shadow-glow">
              <span role="img" aria-label="agent status" className="text-xl">🤖</span>
            </div>
            <div>              <h3 className="text-white font-medium">Agent Status Panel</h3>
              <p className="text-white/70 text-xs">Real-time agent monitoring</p>
            </div>
          </div>
          <div className="glass-pill px-2 py-1 bg-indigo-800/30">
            <span className="text-white/80 text-xs">
              {agents.filter(a => a.status === 'working' || (agentStatus && agentStatus[a.type] === 'working')).length} active
            </span>
          </div>
        </div>
      </div>

      {/* Agent list */}
      <div className="space-y-2 stagger-anim max-h-96 overflow-y-auto hide-scrollbar">
        {agents.map((agent, index) => {
          // Sync agent status with the global agentStatus if available
          let currentStatus = agent.status;
          if (agentStatus && agentStatus[agent.type]) {
            currentStatus = agentStatus[agent.type];
          }
          
          const isExpanded = expandedAgent === agent.type;
          
          return (
            <div 
              key={agent.type}
              className={`animate-fadeIn transition-all duration-300 ${isExpanded ? 'bg-white/5' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className={`glass-card-light p-3 cursor-pointer ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'}`}
                onClick={() => setExpandedAgent(isExpanded ? null : agent.type)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center ${getStatusColor(currentStatus)}`}>
                      <span role="img" aria-label={agent.name}>{agent.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`h-1.5 w-1.5 rounded-full ${
                          currentStatus === 'working' || currentStatus === 'running' ? 'bg-blue-400 animate-pulse' :
                          currentStatus === 'complete' || currentStatus === 'success' ? 'bg-green-400' :
                          currentStatus === 'error' ? 'bg-red-400' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs text-white/70">{getStatusText(currentStatus)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3 items-center">
                    {isExpanded ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expanded content */}
              {isExpanded && (
                <div className="glass-card-light bg-white/5 p-3 rounded-b-lg border-t border-white/10">
                  <div className="flex justify-between mb-2">
                    {/* Work done dropdown button */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDropdown(
                            expandedDropdown?.agent === agent.type && expandedDropdown?.type === 'work'
                              ? null
                              : { agent: agent.type, type: 'work' }
                          );
                        }}
                        className="text-xs px-3 py-1.5 rounded-md bg-indigo-800/30 text-white flex items-center"
                      >
                        <span>Work Done</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Work dropdown */}
                      {expandedDropdown?.agent === agent.type && expandedDropdown?.type === 'work' && (
                        <div 
                          ref={dropdownRef}
                          className="absolute left-0 top-full mt-1 w-64 bg-gray-900/95 border border-indigo-500/30 rounded-md shadow-xl z-20 animate-fadeIn"
                        >
                          <div className="p-3 max-h-60 overflow-y-auto divide-y divide-white/10">
                            {getAgentWork(agent.type).map(work => (
                              <div key={work.id} className="py-2 first:pt-0 last:pb-0">
                                <div className="flex justify-between items-start">
                                  <span className="text-white/90 text-xs font-medium">{work.description}</span>
                                  <span className="text-white/50 text-xs">{work.timestamp}</span>
                                </div>
                                {work.result && (
                                  <p className="text-white/70 text-xs mt-1">{work.result}</p>
                                )}
                              </div>
                            ))}
                            {getAgentWork(agent.type).length === 0 && (
                              <p className="text-white/50 text-xs">No work history yet</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Capabilities dropdown button */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDropdown(
                            expandedDropdown?.agent === agent.type && expandedDropdown?.type === 'roles'
                              ? null
                              : { agent: agent.type, type: 'roles' }
                          );
                        }}
                        className="text-xs px-3 py-1.5 rounded-md bg-purple-800/30 text-white flex items-center"
                      >
                        <span>Capabilities</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* Roles dropdown */}
                      {expandedDropdown?.agent === agent.type && expandedDropdown?.type === 'roles' && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-0 top-full mt-1 w-64 bg-gray-900/95 border border-purple-500/30 rounded-md shadow-xl z-20 animate-fadeIn"
                        >
                          <div className="p-3 max-h-60 overflow-y-auto">
                            {getAgentRoles(agent.type).map(role => (
                              <div key={role.id} className="mb-2 last:mb-0 pb-2 last:pb-0 border-b border-white/10 last:border-b-0">
                                <h5 className="text-white/90 text-xs font-medium">{role.name}</h5>
                                <p className="text-white/70 text-xs mt-0.5">{role.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Current task if agent is working */}
                  {(currentStatus === 'working' || currentStatus === 'running') && agent.currentTask && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-white/80 mb-1">Current Task:</div>
                      <div className="p-2 rounded bg-blue-900/20 text-white/80 text-xs border border-blue-500/30">
                        {agent.currentTask || agent.message}
                      </div>
                    </div>
                  )}
                  
                  {/* Result if agent is complete */}
                  {(currentStatus === 'complete' || currentStatus === 'success') && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-white/80 mb-1">Completed:</div>
                      <div className="p-2 rounded bg-green-900/20 text-white/80 text-xs border border-green-500/30">
                        {agent.message || "Task completed successfully"}
                      </div>
                    </div>
                  )}
                  
                  {/* Error if agent has error */}
                  {currentStatus === 'error' && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-white/80 mb-1">Error:</div>
                      <div className="p-2 rounded bg-red-900/20 text-white/80 text-xs border border-red-500/30">
                        {agent.message || "An error occurred during processing"}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
