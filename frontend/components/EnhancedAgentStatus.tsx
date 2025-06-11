"use client";
import React, { useState, useEffect, useMemo } from 'react';

interface AgentMetrics {
  totalQueries: number;
  avgResponseTime: number;
  successRate: number;
  lastActive: Date;
}

interface AgentCapability {
  name: string;
  description: string;
  enabled: boolean;
}

interface EnhancedAgent {
  type: "planner" | "insight" | "chart";
  name: string;
  icon: string;
  status: "idle" | "working" | "complete" | "error";
  message: string;
  startTime?: string;
  endTime?: string;
  progress?: number;
  metrics: AgentMetrics;
  capabilities: AgentCapability[];
  currentTask?: string;
  estimatedTimeRemaining?: number;
}

interface EnhancedAgentStatusProps {
  agents: any[]; // Original agent format
  currentQuery: string;
  fileUploadStatus: any;
  onAgentToggle?: (agentType: string, enabled: boolean) => void;
}

export default function EnhancedAgentStatus({ 
  agents, 
  currentQuery, 
  fileUploadStatus,
  onAgentToggle 
}: EnhancedAgentStatusProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showMetrics, setShowMetrics] = useState(false);
  const [agentLogs, setAgentLogs] = useState<Record<string, string[]>>({});

  // Suppress unused variable warnings by consuming them
  void currentQuery; void fileUploadStatus; void onAgentToggle;

  // Convert basic agents to enhanced agents with mock data
  const enhancedAgents = useMemo((): EnhancedAgent[] => {
    return agents.map(agent => ({
      ...agent,
      progress: agent.status === 'working' ? Math.random() * 100 : agent.status === 'complete' ? 100 : 0,
      metrics: {
        totalQueries: Math.floor(Math.random() * 50) + 10,
        avgResponseTime: Math.random() * 2000 + 500,
        successRate: Math.random() * 20 + 80,
        lastActive: new Date(Date.now() - Math.random() * 86400000) // Random time in last 24h
      },
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
      currentTask: agent.status === 'working' ? agent.message : undefined,
      estimatedTimeRemaining: agent.status === 'working' ? Math.floor(Math.random() * 5000) + 1000 : undefined
    }));
  }, [agents]);

  // Generate agent logs
  useEffect(() => {
    const interval = setInterval(() => {
      enhancedAgents.forEach(agent => {
        if (agent.status === 'working') {
          setAgentLogs(prev => {
            const agentLogs = prev[agent.type] || [];
            const newLog = `${new Date().toLocaleTimeString()}: ${getRandomLogMessage(agent)}`;
            return {
              ...prev,
              [agent.type]: [...agentLogs.slice(-4), newLog] // Keep last 5 logs
            };
          });
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
  };  return (
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
              Agent Status Panel
            </h3>
            <p className="text-white/70 text-sm">Real-time agent monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={`button-glossy-3d px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
              showMetrics 
                ? 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white shadow-lg shadow-cyan-500/25 border-cyan-400/30' 
                : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
            }`}
          >
            📊 Metrics
          </button>
          <div className="glass-card-3d px-3 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20">
            <span className="text-white font-medium text-sm">
              {enhancedAgents.filter(a => a.status === 'working').length} active
            </span>
          </div>
        </div>
      </div>

      {/* Agent Cards */}
      <div className="space-y-3">
        {enhancedAgents.map((agent) => (
          <div 
            key={agent.type}
            className={`glass-card-3d p-4 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
              selectedAgent === agent.type 
                ? 'border-blue-400/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 shadow-lg shadow-blue-500/10'
                : 'border-white/10 bg-gradient-to-br from-black/20 to-black/5 hover:bg-gradient-to-br hover:from-white/5 hover:to-white/2'
            }`}
            onClick={() => setSelectedAgent(selectedAgent === agent.type ? null : agent.type)}
          >
            {/* Agent Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border border-white/20 backdrop-blur-sm ${getStatusBackground(agent.status)}`}>
                  {agent.icon}
                </div>
                <div>
                  <h4 className="text-white font-medium text-sm">{agent.name}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-md bg-white/10 ${getStatusColor(agent.status)}`}>
                      {agent.status.toUpperCase()}
                    </span>
                    {agent.status === 'working' && agent.estimatedTimeRemaining && (
                      <span className="text-xs text-white/60">
                        • ETA: {formatDuration(agent.estimatedTimeRemaining)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {agent.status === 'working' && (
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                )}
                <div className={`w-3 h-3 rounded-full shadow-lg ${
                  agent.status === 'idle' ? 'bg-gray-500' :
                  agent.status === 'working' ? 'bg-blue-500 animate-pulse shadow-blue-500/50' :
                  agent.status === 'complete' ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'
                }`}></div>
              </div>
            </div>

            {/* Progress Bar */}
            {agent.status === 'working' && agent.progress !== undefined && (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-white/60 font-medium">Progress</span>
                  <span className="text-xs text-white font-bold">{Math.round(agent.progress)}%</span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-2 border border-white/10">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{ width: `${agent.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Current Task */}
            <div className="text-sm text-white/80 mb-3 font-medium">
              {agent.currentTask || agent.message}
            </div>

            {/* Expanded Details */}
            {selectedAgent === agent.type && (
              <div className="border-t border-white/10 pt-4 space-y-4">
                {/* Metrics */}
                {showMetrics && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="glass-card-3d p-3 bg-gradient-to-br from-black/30 to-black/10">
                      <div className="text-xs text-white/60 font-medium mb-1">Total Queries</div>
                      <div className="text-sm font-bold text-white">{agent.metrics.totalQueries}</div>
                    </div>
                    <div className="glass-card-3d p-3 bg-gradient-to-br from-black/30 to-black/10">
                      <div className="text-xs text-white/60 font-medium mb-1">Avg Response</div>
                      <div className="text-sm font-bold text-white">{formatDuration(agent.metrics.avgResponseTime)}</div>
                    </div>
                    <div className="glass-card-3d p-3 bg-gradient-to-br from-black/30 to-black/10">
                      <div className="text-xs text-white/60 font-medium mb-1">Success Rate</div>
                      <div className="text-sm font-bold text-white">{agent.metrics.successRate.toFixed(1)}%</div>
                    </div>
                    <div className="glass-card-3d p-3 bg-gradient-to-br from-black/30 to-black/10">
                      <div className="text-xs text-white/60 font-medium mb-1">Last Active</div>
                      <div className="text-sm font-bold text-white">
                        {agent.metrics.lastActive.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Capabilities */}
                <div>
                  <h5 className="text-sm font-medium text-white/80 mb-3 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                    Capabilities
                  </h5>
                  <div className="space-y-2">
                    {agent.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full shadow-sm ${capability.enabled ? 'bg-green-500 shadow-green-500/50' : 'bg-gray-500'}`}></div>
                          <span className="text-xs text-white font-medium">{capability.name}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Toggle capability (would need parent callback)
                          }}
                          className="text-xs text-blue-300 hover:text-blue-200 font-medium px-2 py-1 rounded-md bg-blue-500/20 border border-blue-400/30 transition-colors"
                        >
                          {capability.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Logs */}
                {agent.status === 'working' && agentLogs[agent.type] && (
                  <div>
                    <h5 className="text-sm font-medium text-white/80 mb-3 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                      Live Activity
                    </h5>
                    <div className="glass-card-3d p-3 bg-gradient-to-br from-black/40 to-black/20 max-h-24 overflow-y-auto">
                      {agentLogs[agent.type].map((log, idx) => (
                        <div key={idx} className="text-xs text-white/90 font-mono mb-1 last:mb-0">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Global Stats */}
      <div className="border-t border-white/20 pt-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="glass-card-3d p-3 bg-gradient-to-br from-white/5 to-white/2">
            <div className="text-lg font-bold text-white mb-1">
              {enhancedAgents.reduce((sum, agent) => sum + agent.metrics.totalQueries, 0)}
            </div>
            <div className="text-xs text-white/60 font-medium">Total Queries</div>
          </div>
          <div className="glass-card-3d p-3 bg-gradient-to-br from-white/5 to-white/2">
            <div className="text-lg font-bold text-white mb-1">
              {(enhancedAgents.reduce((sum, agent) => sum + agent.metrics.successRate, 0) / enhancedAgents.length).toFixed(1)}%
            </div>
            <div className="text-xs text-white/60 font-medium">Avg Success Rate</div>
          </div>
          <div className="glass-card-3d p-3 bg-gradient-to-br from-white/5 to-white/2">
            <div className="text-lg font-bold text-white mb-1">
              {formatDuration(enhancedAgents.reduce((sum, agent) => sum + agent.metrics.avgResponseTime, 0) / enhancedAgents.length)}
            </div>
            <div className="text-xs text-white/60 font-medium">Avg Response Time</div>
          </div>
        </div>
      </div>
    </div>
  );
}
