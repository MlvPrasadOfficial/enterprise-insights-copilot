"use client";
import React, { useState, useEffect } from 'react';

interface LiveAgentDashboardProps {
  agents: any[];
  fileUploaded: boolean;
  currentQuery: string;
}

export default function LiveAgentDashboard({ agents, fileUploaded, currentQuery }: LiveAgentDashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Count agents by status
  const workingAgents = agents.filter(agent => agent.status === 'working').length;
  const completeAgents = agents.filter(agent => agent.status === 'complete').length;
  const errorAgents = agents.filter(agent => agent.status === 'error').length;
  const totalActiveAgents = agents.filter(agent => agent.status !== 'idle').length;
  
  // Determine if a RAG workflow is in progress
  const workflowInProgress = workingAgents > 0;
  
  useEffect(() => {
    if (workflowInProgress || completeAgents > 0) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [workingAgents, completeAgents, workflowInProgress]);
  
  if (!fileUploaded || (!workflowInProgress && completeAgents === 0)) {
    return null;
  }
  
  return (
    <div 
      className={`fixed bottom-5 left-5 z-50 glass-card-3d p-3 rounded-xl shadow-2xl bg-gradient-to-br from-black/80 to-gray-900/80 border border-indigo-800/30
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}
      style={{
        maxWidth: '300px',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${workflowInProgress ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
          Live Agent Dashboard
        </h3>
        <div className="text-xs px-2 py-1 rounded-full bg-indigo-900/40 text-white/80 border border-indigo-700/30">
          {workflowInProgress ? 'In Progress' : 'Complete'}
        </div>
      </div>
      
      {/* Status indicators */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-black/40 rounded-lg p-2 text-center">
          <div className="text-indigo-400 text-xl font-bold">{workingAgents}</div>
          <div className="text-xs text-white/70">Working</div>
        </div>
        <div className="bg-black/40 rounded-lg p-2 text-center">
          <div className="text-green-400 text-xl font-bold">{completeAgents}</div>
          <div className="text-xs text-white/70">Complete</div>
        </div>
        <div className="bg-black/40 rounded-lg p-2 text-center">
          <div className="text-red-400 text-xl font-bold">{errorAgents}</div>
          <div className="text-xs text-white/70">Errors</div>
        </div>
      </div>
      
      {/* Active agents list */}
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {agents
          .filter(agent => agent.status !== 'idle')
          .map(agent => (
            <div key={agent.type} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`inline-block w-2 h-2 rounded-full mr-2
                  ${agent.status === 'working' ? 'bg-indigo-500 animate-pulse' : 
                    agent.status === 'complete' ? 'bg-green-500' : 'bg-red-500'}`}
                ></span>
                <span className="text-xs text-white/90">{agent.name}</span>
              </div>
              <div className={`text-xs px-1.5 py-0.5 rounded
                ${agent.status === 'working' ? 'bg-indigo-900/50 text-indigo-200' : 
                  agent.status === 'complete' ? 'bg-green-900/50 text-green-200' : 'bg-red-900/50 text-red-200'}`}
              >
                {agent.status === 'working' ? 'Running...' : 
                 agent.status === 'complete' ? 'Done' : 'Error'}
              </div>
            </div>
          ))}
      </div>
      
      {workflowInProgress && (
        <div className="w-full h-1 bg-gray-800 rounded-full mt-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 animate-pulse" 
            style={{ width: `${(completeAgents / totalActiveAgents) * 100}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
