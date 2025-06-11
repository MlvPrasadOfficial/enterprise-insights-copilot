"use client";
import React, { useEffect, useState } from 'react';
import { ActivityLog, ProcessVisualizerProps } from '../types';

const ProcessVisualizer: React.FC<ProcessVisualizerProps> = ({ 
  currentQuery, 
  activeAgents,
  fileUploadStatus 
}) => {
  // Debug logging to see if props are coming in correctly
  useEffect(() => {
    console.log("ProcessVisualizer received agents:", activeAgents);
    console.log("Current query:", currentQuery);
    console.log("File upload status:", fileUploadStatus);
  }, [activeAgents, currentQuery, fileUploadStatus]);  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [processedAgents, setProcessedAgents] = useState<string[]>([]);
    // Generate activity log from agent status updates and file uploads
  useEffect(() => {
    const newLogs: ActivityLog[] = [];
    const processedAgentIds: string[] = [];
    
    // Add file upload events if available - using fileName as key to prevent duplicates
    if (fileUploadStatus?.fileName && !processedAgents.includes(`file-${fileUploadStatus.fileName}`)) {
      newLogs.push({
        timestamp: new Date().toISOString(),
        event: "File Upload",
        details: `File "${fileUploadStatus.fileName}" uploaded successfully`
      });
      
      if (fileUploadStatus.indexed && !processedAgents.includes(`index-${fileUploadStatus.fileName}`)) {
        newLogs.push({
          timestamp: new Date().toISOString(),
          event: "Indexing Complete",
          details: `${fileUploadStatus.rowCount || 'Unknown number of'} rows indexed`
        });
      }
    }
    
    // Add agent activity events
    if (Array.isArray(activeAgents)) {
      activeAgents.forEach(agent => {
        if (!agent || !agent.name) return; // Skip invalid agents
        
        const agentId = `${agent.type}-${agent.name}`;
        processedAgentIds.push(agentId);
        
        // Create an initial "Started" event for each agent
        if (agent.startTime && !processedAgents.includes(`${agentId}-start`)) {
          newLogs.push({
            timestamp: agent.startTime,
            event: `${agent.name} Started`,
            details: agent.message || "Processing request",
            agentType: agent.type
          });
        }
        
        // Create a completion event for agents that are done
        if (agent.status === 'complete' && agent.endTime && !processedAgents.includes(`${agentId}-complete`)) {
          newLogs.push({
            timestamp: agent.endTime,
            event: `${agent.name} Completed`,
            details: agent.message || "Task completed",
            agentType: agent.type
          });
        }
        
        // Create an error event for agents with errors
        if (agent.status === 'error' && agent.endTime && !processedAgents.includes(`${agentId}-error`)) {
          newLogs.push({
            timestamp: agent.endTime,
            event: `${agent.name} Error`,
            details: agent.message || "An error occurred",
            agentType: agent.type
          });
        }
      });
    } else {
      console.warn("activeAgents is not an array:", activeAgents);
    }
    
    // Sort by timestamp and set in state
    const sortedLogs = newLogs.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Only update if we have new logs to prevent unnecessary rerenders
    if (sortedLogs.length > 0) {      // Update processed agents to prevent duplicates
      setProcessedAgents(prev => [
        ...prev,
        ...sortedLogs.map(log => {
          if (log.event.includes("Started")) return `${log.agentType}-${log.event.replace(" Started", "")}-start`;
          if (log.event.includes("Completed")) return `${log.agentType}-${log.event.replace(" Completed", "")}-complete`;
          if (log.event.includes("Error")) return `${log.agentType}-${log.event.replace(" Error", "")}-error`;
          if (log.event === "File Upload" && log.details) {
            const fileName = log.details.match(/File "([^"]+)"/)?.[1] || "";
            return `file-${fileName}`;
          }
          if (log.event === "Indexing Complete" && log.details) {
            const fileName = fileUploadStatus?.fileName || "";
            return `index-${fileName}`;
          }
          return "";
        }).filter(Boolean)
      ]);
        setActivityLog(prev => {
        // Add a custom key that includes the file name for file-related events to ensure better deduplication
        const combined = [...prev, ...sortedLogs];
        // Deduplicate logs with enhanced logic for file uploads
        const seen = new Set();
        return combined.filter(log => {
          // Create a more specific key for file upload events
          let key = '';
          if (log.event === "File Upload" && log.details?.includes('uploaded successfully')) {
            // Use just the filename part as the key for file uploads
            const fileName = log.details.match(/File "([^"]+)"/)?.[1] || "";
            key = `file-upload-${fileName}`;
          } else if (log.event === "Indexing Complete") {
            // Use just the row count for indexing events
            const rowCount = log.details?.match(/(\d+) rows/)?.[1] || "";
            key = `indexing-${rowCount}`;
          } else {
            // Use the timestamp-event-details combination for other events
            key = `${log.timestamp}-${log.event}-${log.details || ""}`;
          }
          
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      });
    }
  }, [activeAgents, fileUploadStatus, processedAgents]);
  
  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        fractionalSecondDigits: 3 
      });
    } catch {
      // No need to capture error variable if unused
      return 'Invalid time';
    }
  };
  // Get color for agent type with glassmorphic design
  const getAgentColor = (type?: string) => {
    switch (type) {
      case 'planner': return 'bg-purple-500/20 border-purple-400/30 text-white shadow-purple-500/10';
      case 'chart': return 'bg-blue-500/20 border-blue-400/30 text-white shadow-blue-500/10';
      case 'sql': return 'bg-green-500/20 border-green-400/30 text-white shadow-green-500/10';
      case 'insight': return 'bg-amber-500/20 border-amber-400/30 text-white shadow-amber-500/10';
      case 'critique': return 'bg-red-500/20 border-red-400/30 text-white shadow-red-500/10';
      case 'debate': return 'bg-indigo-500/20 border-indigo-400/30 text-white shadow-indigo-500/10';
      case 'data_cleaner': return 'bg-teal-500/20 border-teal-400/30 text-white shadow-teal-500/10';
      case 'retrieval': return 'bg-cyan-500/20 border-cyan-400/30 text-white shadow-cyan-500/10';
      case 'narrative': return 'bg-rose-500/20 border-rose-400/30 text-white shadow-rose-500/10';
      default: return 'bg-white/10 border-white/20 text-white shadow-white/5';
    }
  };
  
  // Get icon for agent type or event
  const getIcon = (event: string, type?: string) => {
    if (event.includes('File Upload')) return '📄';
    if (event.includes('Indexing')) return '🔍';
    
    switch (type) {
      case 'planner': return '🧠';
      case 'chart': return '📊';
      case 'sql': return '📝';
      case 'insight': return '💡';
      case 'critique': return '🔍';
      case 'debate': return '⚖️';
      case 'data_cleaner': return '🧹';
      case 'retrieval': return '🔎';
      case 'narrative': return '📚';
      default: return '🤖';
    }
  };  // Create the main 3 agent cards as shown in screenshot
  const mainAgents = [
    { type: 'planner', name: 'Planning Agent', icon: '🧠', color: 'from-purple-500 to-purple-600' },
    { type: 'insight', name: 'Insight Generator', icon: '💡', color: 'from-amber-500 to-orange-500' },
    { type: 'chart', name: 'Chart Agent', icon: '📊', color: 'from-blue-500 to-cyan-500' }
  ];
  return (
    <div className="h-full space-y-4">
      {/* Current Query Display - Enhanced 3D */}
      {currentQuery && (
        <div className="glass-card-3d p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
            <span className="text-white font-medium text-sm bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Current Query</span>
          </div>
          <p className="text-white/90 text-sm leading-relaxed font-medium">{currentQuery}</p>
        </div>
      )}

      {/* Main Agent Status Cards - Enhanced 3D Grid */}
      <div className="grid grid-cols-3 gap-4">
        {mainAgents.map((agentType) => {
          const activeAgent = activeAgents.find(a => a.type === agentType.type);
          const isActive = !!activeAgent;
          const status = activeAgent?.status || 'inactive';
          
          return (
            <div 
              key={agentType.type}
              className={`glass-card-3d p-4 transition-all duration-300 hover:scale-[1.02] ${
                isActive ? 'shadow-lg border-white/30' : 'opacity-70 border-white/10'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-12 h-12 bg-gradient-to-r ${agentType.color} rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm ${
                  status === 'working' ? 'animate-pulse shadow-lg' : ''
                }`}>
                  <span className="text-xl">{agentType.icon}</span>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold text-sm leading-tight mb-2">{agentType.name}</h3>
                  
                  {/* Enhanced Status indicator */}
                  <div className="flex items-center justify-center">
                    {status === 'working' && (
                      <div className="flex items-center space-x-2 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
                        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shadow-amber-400/50"></div>
                        <span className="text-amber-200 text-xs font-medium">Working</span>
                      </div>
                    )}
                    {status === 'complete' && (
                      <div className="flex items-center space-x-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-emerald-400/50"></div>
                        <span className="text-emerald-200 text-xs font-medium">Complete</span>
                      </div>
                    )}
                    {status === 'error' && (
                      <div className="flex items-center space-x-2 bg-red-500/20 px-3 py-1 rounded-full border border-red-400/30">
                        <div className="w-2 h-2 bg-red-400 rounded-full shadow-red-400/50"></div>
                        <span className="text-red-200 text-xs font-medium">Error</span>
                      </div>
                    )}
                    {!isActive && (
                      <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                        <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                        <span className="text-white/60 text-xs font-medium">Inactive</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Enhanced Agent message */}
              {activeAgent?.message && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <p className="text-white/80 text-xs leading-relaxed text-center font-medium">
                    {activeAgent.message.length > 60 ? `${activeAgent.message.substring(0, 60)}...` : activeAgent.message}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Enhanced Additional Active Agents */}
      {activeAgents.filter(a => !mainAgents.some(m => m.type === a.type)).length > 0 && (
        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Additional Agents</h3>
          <div className="grid grid-cols-2 gap-3">
            {activeAgents
              .filter(a => !mainAgents.some(m => m.type === a.type))
              .map((agent, idx) => (
                <div 
                  key={idx}
                  className={`glass-card-3d p-3 ${getAgentColor(agent.type)} hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                      <span className="text-sm">{getIcon('', agent.type)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white text-sm font-medium truncate">{agent.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className={`w-2 h-2 rounded-full shadow-sm ${
                          agent.status === 'working' ? 'bg-amber-400 shadow-amber-400/50' :
                          agent.status === 'complete' ? 'bg-emerald-400 shadow-emerald-400/50' :
                          agent.status === 'error' ? 'bg-red-400 shadow-red-400/50' : 'bg-white/60'
                        }`}></div>
                        <span className="text-white/80 text-xs font-medium capitalize">{agent.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Enhanced Process Timeline */}
      {activityLog.length > 0 && (
        <div className="glass-card-3d p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg shadow-blue-400/50"></div>
            <h3 className="text-white font-medium text-sm bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Process Timeline
            </h3>
          </div>
          
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {activityLog.slice(-6).map((log, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-sm bg-white/5 rounded-lg p-2 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center border border-white/30">
                  <span className="text-xs">{getIcon(log.event, log.agentType)}</span>
                </div>
                <span className="text-white/90 flex-1 truncate font-medium">{log.event}</span>
                <span className="text-white/60 font-mono text-xs bg-black/20 px-2 py-1 rounded-md">
                  {formatTime(log.timestamp).split(':').slice(0, 2).join(':')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Empty state */}
      {activeAgents.length === 0 && (
        <div className="glass-card-3d p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30">
            <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-white/80 text-sm font-medium mb-2">No active agents</p>
          <p className="text-white/60 text-xs">Submit a query to see agents in action</p>
        </div>
      )}
    </div>
  );
};

export default ProcessVisualizer;
