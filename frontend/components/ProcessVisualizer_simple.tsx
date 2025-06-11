"use client";
import { useState, useEffect } from "react";

interface ProcessVisualizerProps {
  currentQuery?: string;
  activeAgents?: any[];
  fileUploadStatus?: { fileName?: string; indexed: boolean; rowCount?: number };
}

export default function ProcessVisualizerSimple({ 
  currentQuery = "", 
  activeAgents = [], 
  fileUploadStatus = { fileName: "", indexed: false, rowCount: 0 } 
}: ProcessVisualizerProps) {
  const [agents, setAgents] = useState([
    { type: 'planner', name: 'Planning Agent', icon: '🧠', color: 'from-purple-500 to-purple-600', status: 'idle' },
    { type: 'insight', name: 'Insight Generator', icon: '💡', color: 'from-amber-500 to-orange-500', status: 'idle' },
    { type: 'chart', name: 'Chart Agent', icon: '📊', color: 'from-blue-500 to-cyan-500', status: 'idle' }
  ]);

  const [timeline, setTimeline] = useState([
    { time: "12:30:45", event: "System initialized", type: "system" },
    { time: "12:30:46", event: "Waiting for user input", type: "info" }
  ]);

  // Simulate agent activity when query changes
  useEffect(() => {
    if (currentQuery) {
      // Simulate agent activation
      setAgents(prev => prev.map(agent => ({
        ...agent,
        status: agent.type === 'planner' ? 'working' : 'idle'
      })));
      
      // Add timeline event
      const newEvent = {
        time: new Date().toLocaleTimeString(),
        event: `Processing query: "${currentQuery.substring(0, 30)}${currentQuery.length > 30 ? '...' : ''}"`,
        type: "query"
      };
      setTimeline(prev => [...prev, newEvent]);
    }
  }, [currentQuery]);

  // Update agents based on active agents prop
  useEffect(() => {
    if (activeAgents && activeAgents.length > 0) {
      setAgents(prev => prev.map(agent => {
        const activeAgent = activeAgents.find(a => a.type === agent.type);
        return activeAgent ? { ...agent, status: activeAgent.status } : agent;
      }));
    }
  }, [activeAgents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-yellow-500';
      case 'complete': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'working': return 'Working';
      case 'complete': return 'Complete';
      case 'error': return 'Error';
      default: return 'Idle';
    }
  };
  return (
    <div className="bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-6 border border-cyan-400/30 shadow-2xl shadow-cyan-500/10 space-y-6">
      {/* Header with enhanced styling */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/40 to-blue-500/40 rounded-2xl flex items-center justify-center shadow-lg">
            🤖
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Agent Process Monitor</h3>
            <p className="text-cyan-200 text-sm">Real-time AI agent status</p>
          </div>
        </div>
      </div>      {/* Agent Grid with enhanced glassmorphic design */}
      <div className="grid grid-cols-1 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.type}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:border-cyan-400/40 transition-all duration-300 hover:bg-white/15 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`text-2xl bg-gradient-to-r ${agent.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/20`}>
                  {agent.icon}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{agent.name}</h4>
                  <p className="text-cyan-200 text-sm capitalize">{agent.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full ${getStatusColor(agent.status)} shadow-lg animate-pulse`}></div>
                <span className="text-sm text-gray-200 font-medium px-3 py-1 bg-white/10 rounded-lg">{getStatusText(agent.status)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>      {/* File Status with enhanced styling */}
      {fileUploadStatus.fileName && (
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm rounded-2xl p-5 border border-emerald-400/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-xl flex items-center justify-center">
              📁
            </div>
            <h4 className="text-white font-semibold">Data Status</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-emerald-200">File:</span>
              <span className="text-white font-medium">{fileUploadStatus.fileName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-200">Indexed:</span>
              <span className={`font-medium px-2 py-1 rounded-lg ${fileUploadStatus.indexed ? "text-green-400 bg-green-500/20" : "text-yellow-400 bg-yellow-500/20"}`}>
                {fileUploadStatus.indexed ? "✅ Yes" : "⏳ Processing"}
              </span>
            </div>
            {fileUploadStatus.rowCount && (
              <div className="flex justify-between items-center">
                <span className="text-emerald-200">Rows:</span>
                <span className="text-white font-medium">{fileUploadStatus.rowCount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}      {/* Activity Timeline with enhanced design */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500/40 to-violet-500/40 rounded-xl flex items-center justify-center">
            📈
          </div>
          <h4 className="text-white font-semibold">Activity Timeline</h4>
        </div>
        <div className="space-y-4 max-h-48 overflow-y-auto custom-scrollbar">
          {timeline.slice(-6).map((event, index) => (
            <div key={index} className="flex items-start space-x-4 text-sm">
              <span className="text-purple-300 font-mono text-xs w-20 flex-shrink-0 mt-1">{event.time}</span>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 shadow-lg ${
                event.type === 'query' ? 'bg-blue-400' : 
                event.type === 'system' ? 'bg-green-400' : 
                'bg-gray-400'
              }`}></div>
              <span className={`flex-1 leading-relaxed ${
                event.type === 'query' ? 'text-blue-300' : 
                event.type === 'system' ? 'text-green-300' : 
                'text-gray-300'
              }`}>
                {event.event}
              </span>
            </div>
          ))}
          {timeline.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <div className="w-16 h-16 bg-gray-500/20 rounded-2xl mx-auto mb-3 flex items-center justify-center text-3xl">
                ⏳
              </div>
              <span className="text-sm">No activity yet</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
