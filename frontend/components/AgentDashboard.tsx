"use client";
import React, { useState, useEffect } from 'react';

// Define types for agent status
interface AgentStatus {
  name: string;
  status: 'idle' | 'working' | 'complete' | 'error';
  type: 'planner' | 'chart' | 'sql' | 'insight' | 'critique' | 'debate';
  message: string;
  startTime?: string; // ISO string dates
  endTime?: string;   // ISO string dates
}

interface AgentDashboardProps {
  currentQuery?: string | null;
  activeAgents: AgentStatus[];
}

const AgentDashboard: React.FC<AgentDashboardProps> = ({ currentQuery, activeAgents }) => {
  // Agent descriptions
  const agentDescriptions = {
    planner: "Analyzes queries and decides which specialist agents to invoke",
    chart: "Generates visualizations from data based on query intent",
    sql: "Converts natural language to SQL queries and executes them",
    insight: "Analyzes data to provide statistical summaries and insights",
    critique: "Evaluates outputs and checks for errors or inconsistencies",
    debate: "Explores multiple perspectives for complex queries"
  };
  
  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'working': return 'bg-yellow-400 animate-pulse';
      case 'complete': return 'bg-green-400';
      case 'error': return 'bg-red-400';
      default: return 'bg-gray-300';
    }
  };

  const getAgentIcon = (type: AgentStatus['type']) => {
    switch (type) {
      case 'planner': return '🧠';
      case 'chart': return '📊';
      case 'sql': return '📝';
      case 'insight': return '💡';
      case 'critique': return '🔍';
      case 'debate': return '⚖️';
      default: return '🤖';
    }
  };
  
  const getStatusText = (status: AgentStatus['status']) => {
    switch (status) {
      case 'working': return 'Working...';
      case 'complete': return 'Completed';
      case 'error': return 'Error';
      default: return 'Idle';
    }
  };
  
  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl mt-4">
      <h3 className="text-lg font-semibold mb-4">Agent Activity Dashboard</h3>
      
      {currentQuery && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="font-medium">Current Query:</div>
          <div className="italic text-gray-700 dark:text-gray-300">{currentQuery}</div>
        </div>
      )}
      
      <div className="space-y-3">
        {activeAgents.map((agent, idx) => (
          <div key={idx} className="flex items-start border rounded-lg p-3 bg-gray-50 dark:bg-zinc-800">
            <div className="flex-shrink-0 text-2xl mr-3">{getAgentIcon(agent.type)}</div>
            <div className="flex-grow">              <div className="flex justify-between">
                <div className="font-medium">{agent.name}</div>
                <div className={`px-2 py-1 text-xs rounded-full ${getStatusColor(agent.status)}`}>
                  {getStatusText(agent.status)}
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {agentDescriptions[agent.type]}
              </div>
              <div className="mt-1 text-sm">{agent.message}</div>
            </div>
          </div>
        ))}
        
        {activeAgents.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No agent activity. Submit a query to see agents in action.
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDashboard;
