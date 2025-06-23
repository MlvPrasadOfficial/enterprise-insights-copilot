"use client";
import React, { useState, useMemo } from 'react';

interface AgentWorkflowDisplayProps {
  agents: any[];
  currentQuery: string;
  isLoading: boolean;
}

interface AgentOutput {
  id: string;
  name: string;
  type: string;
  status: 'idle' | 'working' | 'complete' | 'error';
  output?: any;
  progress?: number;
  icon: string;
  color: string;
  borderColor: string;
  activeColor: string;
  activeBorder: string;
  timestamp?: string;
  result?: string;
  duration?: string;
}

export default function AgentWorkflowDisplay({ 
  agents, 
  currentQuery, 
  isLoading 
}: AgentWorkflowDisplayProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Agent configurations with enhanced glassmorphic design - STABLE REFERENCE
  const agentConfigs = useMemo(() => [
    { id: 'cleaner', name: 'Data Cleaner', icon: '🧹', color: 'from-purple-500/30 to-violet-600/30', borderColor: 'border-purple-400/30', activeColor: 'from-green-500/40 to-emerald-500/40', activeBorder: 'border-green-400/50' },
    { id: 'planner', name: 'Planning Agent', icon: '🎯', color: 'from-blue-500/30 to-cyan-500/30', borderColor: 'border-blue-400/30', activeColor: 'from-green-500/40 to-emerald-500/40', activeBorder: 'border-green-400/50' },
    { id: 'sql', name: 'SQL Agent', icon: '💾', color: 'from-green-500/30 to-emerald-500/30', borderColor: 'border-green-400/30', activeColor: 'from-green-500/40 to-emerald-500/40', activeBorder: 'border-green-400/50' },
    { id: 'insight', name: 'Insight Agent', icon: '💡', color: 'from-yellow-500/30 to-orange-500/30', borderColor: 'border-yellow-400/30', activeColor: 'from-green-500/40 to-emerald-500/40', activeBorder: 'border-green-400/50' },
    { id: 'chart', name: 'Chart Agent', icon: '📊', color: 'from-pink-500/30 to-rose-500/30', borderColor: 'border-pink-400/30', activeColor: 'from-green-500/40 to-emerald-500/40', activeBorder: 'border-green-400/50' },
    { id: 'critique', name: 'Critique Agent', icon: '⚖️', color: 'from-indigo-500/30 to-purple-500/30', borderColor: 'border-indigo-400/30', activeColor: 'from-green-500/40 to-emerald-500/40', activeBorder: 'border-green-400/50' },
    { id: 'debate', name: 'Debate Agent', icon: '🗣️', color: 'from-red-500/30 to-pink-500/30', borderColor: 'border-red-400/30', activeColor: 'from-green-500/40 to-emerald-500/40', activeBorder: 'border-green-400/50' },
    { id: 'narrative', name: 'Narrative Agent', icon: '📝', color: 'from-teal-500/30 to-cyan-500/30', borderColor: 'border-teal-400/30', activeColor: 'from-green-500/40 to-emerald-500/40', activeBorder: 'border-green-400/50' },
    { id: 'report', name: 'Report Agent', icon: '📋', color: 'from-slate-500/30 to-gray-500/30', borderColor: 'border-slate-400/30', activeColor: 'from-green-500/40 to-emerald-500/40', activeBorder: 'border-green-400/50' }
  ], []);

  // Transform agents data - ALWAYS SHOW ALL AGENTS
  const displayAgents = useMemo(() => {
    return agentConfigs.map(config => {
      // Match agents by id or type (flexible matching)
      const agentData = agents.find(a => 
        a.id === config.id || 
        a.type === config.id || 
        a.type === config.id.replace('_', '') ||
        (config.id === 'cleaner' && (a.type === 'data_cleaner' || a.id === 'data_cleaner')) ||
        (config.id === 'planner' && (a.type === 'planning' || a.id === 'planning')) ||
        (config.id === 'sql' && (a.type === 'query' || a.id === 'query'))
      );
      
      return {
        ...config,
        type: config.id,
        status: agentData?.status || 'idle',
        output: agentData?.output || agentData,
        progress: agentData?.progress || (agentData?.status === 'working' ? 65 : agentData?.status === 'complete' ? 100 : 0),
        timestamp: agentData?.timestamp || agentData?.startTime,
        result: agentData?.result || agentData?.message,
        duration: agentData?.duration
      };
    });
  }, [agents, agentConfigs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'working': return '⚡';
      case 'complete': return '✅';
      case 'error': return '❌';
      default: return '⏸️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-yellow-400';
      case 'complete': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-3">
      {/* Current Query Display */}
      {currentQuery && (
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-lg flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-sm">🔍</span>
            </div>
            <h4 className="text-white font-medium text-sm">Current Query</h4>
          </div>
          <p className="text-white/80 text-sm bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            &ldquo;{currentQuery}&rdquo;
          </p>
        </div>
      )}

      {/* Agent Workflow Grid - ALWAYS VISIBLE */}
      <div className="grid grid-cols-3 gap-3">
        {displayAgents.map((agent) => {
          const isActive = agent.status !== 'idle';
          const cardColor = isActive ? agent.activeColor : agent.color;
          const borderColor = isActive ? agent.activeBorder : agent.borderColor;
          
          return (
            <div
              key={agent.id}
              className={`
                bg-gradient-to-br ${cardColor} backdrop-blur-sm border ${borderColor} rounded-2xl p-4 
                cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-lg hover:border-white/30
                ${selectedAgent === agent.id ? 'ring-2 ring-white/50 scale-105' : ''}
                ${agent.status === 'working' ? 'animate-pulse ring-2 ring-green-400/50' : ''}
                ${agent.status === 'complete' ? 'ring-2 ring-green-500/70 shadow-green-500/20' : ''}
                ${isActive ? 'shadow-lg shadow-green-500/10' : ''}
              `}
              onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
            >
              {/* Agent Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20 ${isActive ? 'bg-green-500/30 border-green-400/50' : 'bg-white/20'}`}>
                    <span className="text-sm">{agent.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white text-xs font-medium truncate">{agent.name}</h5>
                    <p className={`text-xs ${getStatusColor(agent.status)} flex items-center gap-1`}>
                      <span>{getStatusIcon(agent.status)}</span>
                      <span className="capitalize">{agent.status}</span>
                    </p>
                  </div>
                </div>
                {/* Active indicator */}
                {isActive && (
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                )}
              </div>

              {/* Progress Bar - Show for all non-idle */}
              {agent.status !== 'idle' && (
                <div className="mb-3">
                  <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${agent.status === 'complete' ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-white/60 to-white/80'}`}
                      style={{ width: `${agent.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-white/60">Progress</span>
                    <span className="text-xs text-white/80 font-mono">{agent.progress}%</span>
                  </div>
                </div>
              )}

              {/* Enhanced Agent Output Preview */}
              {agent.status !== 'idle' && agent.result && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 mb-2">
                  <h6 className="text-white/80 text-xs font-medium mb-1">Output:</h6>
                  <p className="text-white/70 text-xs line-clamp-3">
                    {typeof agent.result === 'string' ? agent.result : JSON.stringify(agent.result).slice(0, 80) + '...'}
                  </p>
                </div>
              )}

              {/* Idle State Display */}
              {agent.status === 'idle' && (
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                  <p className="text-white/50 text-xs text-center">Ready to process</p>
                </div>
              )}

              {/* Timestamp */}
              {agent.timestamp && (
                <div className="mt-2 text-xs text-white/50 flex justify-between">
                  <span>{new Date(agent.timestamp).toLocaleTimeString()}</span>
                  {agent.duration && <span>{agent.duration}</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Output Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-white/20 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            {(() => {
              const agent = displayAgents.find(a => a.id === selectedAgent);
              if (!agent) return null;
              
              return (
                <>
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${agent.color} backdrop-blur-sm rounded-2xl flex items-center justify-center border ${agent.borderColor}`}>
                        <span className="text-xl">{agent.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-white text-lg font-bold">{agent.name}</h3>
                        <p className={`text-sm ${getStatusColor(agent.status)} flex items-center gap-1`}>
                          <span>{getStatusIcon(agent.status)}</span>
                          <span className="capitalize">{agent.status}</span>
                          {agent.duration && <span>• {agent.duration}</span>}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAgent(null)}
                      className="text-white/60 hover:text-white text-2xl font-bold w-8 h-8 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>

                  {/* Modal Content */}
                  <div className="space-y-4">
                    {/* Progress */}
                    {agent.status !== 'idle' && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-white/80 text-sm">Progress</span>
                          <span className="text-white text-sm font-mono">{agent.progress}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 transition-all duration-500"
                            style={{ width: `${agent.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Output */}
                    {agent.output && (
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                        <h4 className="text-white/80 text-sm font-medium mb-3">Output</h4>
                        <pre className="text-white/70 text-xs bg-black/30 rounded-lg p-3 overflow-auto max-h-60 border border-white/10">
                          {typeof agent.output === 'string' ? agent.output : JSON.stringify(agent.output, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <h4 className="text-white/80 text-sm font-medium mb-3">Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-white/60">Agent ID:</span>
                          <span className="text-white/80 ml-2 font-mono">{agent.id}</span>
                        </div>
                        <div>
                          <span className="text-white/60">Type:</span>
                          <span className="text-white/80 ml-2">{agent.type}</span>
                        </div>
                        {agent.timestamp && (
                          <div>
                            <span className="text-white/60">Started:</span>
                            <span className="text-white/80 ml-2">{new Date(agent.timestamp).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Active Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <span className="text-white/60 text-xs ml-2">Agents processing...</span>
        </div>
      )}
    </div>
  );
}
