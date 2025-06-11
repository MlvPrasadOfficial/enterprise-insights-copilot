"use client";
import React, { useState, useEffect } from 'react';
import { AgentStatus, AgentFlowChartProps } from '../types';

/**
 * Component that visualizes agent decisions and routing with animated flows
 */
const AgentFlowChart: React.FC<AgentFlowChartProps> = ({ activeAgents }) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [agentMap, setAgentMap] = useState<Record<string, AgentStatus>>({});    // Create a mapping of agent types to their status objects
  useEffect(() => {
    if (!Array.isArray(activeAgents)) {
      console.warn("activeAgents is not an array in AgentFlowChart:", activeAgents);
      return;
    }
    
    const newMap: Record<string, AgentStatus> = {};
    activeAgents.forEach(agent => {
      if (agent && agent.type) {
        newMap[agent.type] = agent;
      }
    });
    setAgentMap(newMap);
    
    // Log the mapping for debugging
    console.log("Agent mapping in AgentFlowChart:", newMap);
  }, [activeAgents]);// Get agent color based on type with glassmorphic design
  const getAgentColor = (type: string) => {
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
  
  // Get icon for agent type
  const getAgentIcon = (type: string) => {
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
  };  // Get status color for agent with glassmorphic design
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'bg-amber-500/20 text-amber-200 border border-amber-400/30';
      case 'complete': return 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30';
      case 'error': return 'bg-red-500/20 text-red-200 border border-red-400/30';
      default: return 'bg-white/10 text-white/70 border border-white/20';
    }
  };  
  // Get agent description
  // const getAgentDescription = (type: string) => {
  //   switch (type) {
  //     case 'planner': return "Routes queries to specialized agents";
  //     case 'chart': return "Creates visualizations from your data";
  //     case 'sql': return "Translates questions into SQL queries";
  //     case 'insight': return "Analyzes data for patterns and summaries";
  //     case 'critique': return "Reviews outputs for accuracy";
  //     case 'debate': return "Explores multiple solution perspectives";
  //     case 'data_cleaner': return "Preprocesses and normalizes data";
  //     case 'retrieval': return "Fetches relevant context information";
  //     case 'narrative': return "Creates explanatory stories from data";
  //     default: return "Specialized agent for data analysis";
  //   }
  // };
  // Only render if we have at least one agent and activeAgents is defined
  if (!activeAgents || !Array.isArray(activeAgents) || !activeAgents.length) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
        <h3 className="font-medium mb-2 text-center text-sm text-white/80">Agent Flow</h3>
        <div className="text-center p-4 text-white/60 text-xs">
          No active agents to visualize
        </div>
      </div>
    );
  }  // Create connector classes based on routing decision
  // const getConnectorClass = (targetType: string) => {
  //   const baseClass = "absolute border transition-all duration-500";
    
  //   // Only highlight the path that the planner selected
  //   if (routingDecision && targetType === routingDecision) {
  //     return `${baseClass} border-emerald-400/60 z-10 animate-pulse`;
  //   }
  //   return `${baseClass} border-white/20`;
  // };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-3">
      <h3 className="font-medium mb-3 text-center text-sm text-white/80">Agent Flow</h3>
      
      {/* Compact Agent Flow - Horizontal Layout */}
      <div className="relative h-24">
        {/* Main 3 agents in a row */}
        <div className="flex justify-between items-center h-full px-2">
          {/* Planning Agent */}
          <div className={`w-16 h-16 rounded-xl p-2 cursor-pointer transition-all ${
            agentMap.planner ? getAgentColor('planner') : 'bg-white/5 border border-white/10'
          } backdrop-blur-sm border hover:scale-105`}
            onClick={() => setSelectedAgent('planner')}
          >
            <div className="text-center h-full flex flex-col justify-center">
              <div className="text-lg">{getAgentIcon('planner')}</div>
              <div className="text-xs text-white/90 font-medium">Plan</div>
              {agentMap.planner && (
                <div className={`mt-1 h-1 w-full rounded-full ${
                  agentMap.planner.status === 'working' ? 'bg-amber-400' :
                  agentMap.planner.status === 'complete' ? 'bg-emerald-400' :
                  agentMap.planner.status === 'error' ? 'bg-red-400' : 'bg-white/40'
                }`}></div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex justify-center">
            <svg className="w-6 h-6 text-white/40" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

          {/* SQL Agent */}
          <div className={`w-16 h-16 rounded-xl p-2 cursor-pointer transition-all ${
            agentMap.sql ? getAgentColor('sql') : 'bg-white/5 border border-white/10'
          } backdrop-blur-sm border hover:scale-105`}
            onClick={() => setSelectedAgent('sql')}
          >
            <div className="text-center h-full flex flex-col justify-center">
              <div className="text-lg">{getAgentIcon('sql')}</div>
              <div className="text-xs text-white/90 font-medium">SQL</div>
              {agentMap.sql && (
                <div className={`mt-1 h-1 w-full rounded-full ${
                  agentMap.sql.status === 'working' ? 'bg-amber-400' :
                  agentMap.sql.status === 'complete' ? 'bg-emerald-400' :
                  agentMap.sql.status === 'error' ? 'bg-red-400' : 'bg-white/40'
                }`}></div>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex-1 flex justify-center">
            <svg className="w-6 h-6 text-white/40" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Chart Agent */}
          <div className={`w-16 h-16 rounded-xl p-2 cursor-pointer transition-all ${
            agentMap.chart ? getAgentColor('chart') : 'bg-white/5 border border-white/10'
          } backdrop-blur-sm border hover:scale-105`}
            onClick={() => setSelectedAgent('chart')}
          >
            <div className="text-center h-full flex flex-col justify-center">
              <div className="text-lg">{getAgentIcon('chart')}</div>
              <div className="text-xs text-white/90 font-medium">Chart</div>
              {agentMap.chart && (
                <div className={`mt-1 h-1 w-full rounded-full ${
                  agentMap.chart.status === 'working' ? 'bg-amber-400' :
                  agentMap.chart.status === 'complete' ? 'bg-emerald-400' :
                  agentMap.chart.status === 'error' ? 'bg-red-400' : 'bg-white/40'
                }`}></div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Selected agent details - compact */}
      {selectedAgent && agentMap[selectedAgent] && (
        <div className="mt-3 p-2 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getAgentIcon(selectedAgent)}</span>
              <h4 className="text-sm font-medium text-white">{agentMap[selectedAgent].name}</h4>
            </div>
            <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
              getStatusColor(agentMap[selectedAgent].status)
            }`}>
              {agentMap[selectedAgent].status}
            </div>
          </div>
          
          <p className="text-white/70 text-xs leading-relaxed">
            {agentMap[selectedAgent].message}
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentFlowChart;
