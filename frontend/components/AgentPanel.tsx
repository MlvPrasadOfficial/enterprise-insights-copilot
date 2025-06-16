"use client";
import React, { useState, useEffect } from 'react';

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

interface AgentOutput {
  title: string;
  content: string;
}

interface AgentPanelProps {
  agent: any;
  fileUploaded: boolean;
  agentOutputs?: AgentOutput[];
  agentCapabilities?: AgentCapability[];
}

export default function AgentPanel({ 
  agent, 
  fileUploaded,
  agentOutputs = [],
  agentCapabilities = []
}: AgentPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [showOutputs, setShowOutputs] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Animation effect when agent appears or changes status
  useEffect(() => {
    if (agent && fileUploaded) {
      // Delay visibility to create staggered appearance animation
      const delay = agent.type === 'data' ? 300 : 
                   agent.type === 'cleaner' ? 600 : 
                   agent.type === 'planner' ? 300 : 
                   agent.type === 'query' ? 600 : 
                   agent.type === 'retrieval' ? 900 : 1200;
                   
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [agent, fileUploaded]);
    
  // Don't render if not uploaded or agent not available
  if (!fileUploaded || !agent) return null;
  
  // For chat response agents, don't render if they are in idle state (before user clicks send)
  const chatResponseAgents = ['planner', 'query', 'retrieval', 'sql', 'insight', 'chart', 'critique', 'debate', 'narrative', 'report'];
  if (chatResponseAgents.includes(agent.type) && agent.status === 'idle') {
    // Special handling for chat agents - only show them if they've been activated
    return null;
  }
  // Agent types no longer need different background gradients as all use purple glass effect
  const getBackgroundGradient = () => {
    // Use same purple gradient for all agent types for consistency
    return 'from-purple-600/20 to-indigo-800/20';
  };

  // Get agent icon based on type
  const getAgentIcon = () => {
    const icons: Record<string, string> = {
      'planner': '🧠',
      'insight': '💡',
      'chart': '📊',
      'cleaner': '🧹',
      'data': '📁',
      'query': '🔍',
      'sql': '🗄️',
      'critique': '🔬',
      'debate': '⚖️',
      'retrieval': '📚',
      'narrative': '📖',
      'report': '📑'
    };
    
    return icons[agent.type] || '🤖';
  };  return (
    <div 
      className={`glass-card-3d agent-panel agent-glass-purple p-4 transition-all 
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}
        ${agent.status === 'working' ? 'working' : ''}
        ${agent.status === 'complete' ? 'complete' : ''}
        ${agent.status === 'error' ? 'error' : ''}
      `}
      style={{
        transformStyle: 'preserve-3d',
        animation: isVisible 
          ? (agent.status === 'working' 
              ? 'pulse-border 2s infinite' 
              : 'enhanced-fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards')
          : '',
        transitionProperty: 'all',
        transitionDuration: '0.5s',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}
    >      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border agent-icon-container
            ${agent.status === 'working' 
              ? 'bg-blue-800/40 border-blue-500/60 active' 
              : agent.status === 'complete'
              ? 'bg-green-800/30 border-green-500/40' 
              : agent.status === 'error'
              ? 'bg-red-800/30 border-red-500/40'
              : 'bg-blue-800/30 border-blue-700/30'
            }
          `}>
            <span role="img" aria-label={agent.type} className={`text-xl ${agent.status === 'working' ? 'animate-pulse' : ''}`}>
              {getAgentIcon()}
            </span>
          </div>          <div>
            <h3 className="text-white font-semibold">{agent.name}</h3>
            <p className="text-white/70 text-xs">
              {agent.message || `${agent.type} agent`}
              {agent.status === 'working' && (
                <span className="agent-loading-dots ml-1">
                  <span></span>
                  <span></span>
                  <span></span>
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {/* Expand/collapse icon only - moved buttons to bottom */}
          <div>
            {expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>
      
      {/* Action buttons moved to bottom of the panel */}
      <div className="mt-3 flex justify-center space-x-4">
        {/* Output button */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent panel expansion
            setShowOutputs(!showOutputs);
            setShowCapabilities(false);
          }}
          className={`px-4 py-1.5 text-xs ${showOutputs ? 'bg-indigo-600/60' : 'bg-indigo-800/40 hover:bg-indigo-700/50'} rounded-full text-white/90 border border-indigo-600/30 transition-all flex-1 max-w-[120px]`}
        >
          <span>Outputs</span>
        </button>
        
        {/* Capabilities button */}
        <button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent panel expansion
            setShowCapabilities(!showCapabilities);
            setShowOutputs(false);
          }}
          className={`px-4 py-1.5 text-xs ${showCapabilities ? 'bg-emerald-600/60' : 'bg-emerald-800/40 hover:bg-emerald-700/50'} rounded-full text-white/90 border border-emerald-600/30 transition-all flex-1 max-w-[120px]`}
        >
          <span>Capabilities</span>
        </button>
      </div>
      
      {/* Outputs section - expandable */}
      {showOutputs && (
        <div className="mt-3 animate-slideDown overflow-hidden">
          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-3 space-y-3">
            <h4 className="text-white/90 font-medium text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Agent Outputs
            </h4>
            
            <div className="space-y-2">
              {agentOutputs.length > 0 ? (
                agentOutputs.map((output, index) => (
                  <div key={index} className="bg-indigo-900/30 rounded p-3">
                    <div className="text-white/90 text-sm font-medium">{output.title}</div>
                    <div className="text-white/70 text-sm mt-1">{output.content}</div>
                  </div>
                ))
              ) : (
                <div className="bg-indigo-900/30 rounded p-3">
                  <div className="text-white/70 text-sm mt-1">No outputs available yet</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Capabilities section - expandable */}
      {showCapabilities && (
        <div className="mt-3 animate-slideDown overflow-hidden">
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3">
            <h4 className="text-white/90 font-medium text-sm flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Agent Capabilities
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
              {agentCapabilities.length > 0 ? (
                agentCapabilities.map((capability, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg text-sm ${capability.enabled ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-gray-800/30 border border-gray-700/30 opacity-60'}`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${capability.enabled ? 'bg-emerald-400' : 'bg-gray-500'}`}></div>
                      <span className="text-white font-medium">{capability.name}</span>
                    </div>
                    <p className="mt-1.5 text-white/70 text-sm">{capability.description}</p>
                  </div>
                ))
              ) : (
                <div className="bg-emerald-900/30 rounded p-3">
                  <div className="text-white/70 text-sm mt-1">No capabilities defined</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        {expanded && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          {agent.status === 'working' && (
            <div className="w-full bg-gray-700/30 h-1 rounded overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded transition-all duration-500 ease-in-out"
                style={{ width: `${agent.progress || 30}%` }}
              ></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
