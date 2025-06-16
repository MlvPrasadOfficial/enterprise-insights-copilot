"use client";
import React, { useState } from 'react';
import AgentPanel from './AgentPanel';

interface AnalyticsPanelProps {
  agents: any[];
  fileUploaded: boolean;
  getAgentSampleOutput: (agentType: string) => any[];
  getAgentCapabilities: (agentType: string) => any[];
  currentQuery: string;
}

export default function AnalyticsPanel({
  agents,
  fileUploaded,
  getAgentSampleOutput,
  getAgentCapabilities,
  currentQuery
}: AnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('insight');

  // Find the agents we need
  const sqlAgent = agents.find(agent => agent.type === 'sql');
  const insightAgent = agents.find(agent => agent.type === 'insight');
  const chartAgent = agents.find(agent => agent.type === 'chart');

  // Only render if there's a query or if any of these agents are active
  const shouldRender = 
    (currentQuery && currentQuery.trim() !== '') || 
    agents.some(agent => 
      ['sql', 'insight', 'chart'].includes(agent.type) && 
      (agent.status === 'working' || agent.status === 'complete')
    );

  if (!shouldRender || !fileUploaded) return null;

  // Define tab button style based on active state
  const getTabStyle = (tabName: string) => {
    return `px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 focus:outline-none ${
      activeTab === tabName 
        ? 'text-white border-purple-500 bg-purple-800/20' 
        : 'text-white/60 border-transparent hover:text-white/90 hover:border-purple-400/40'
    }`;
  };

  return (
    <div className="w-full glass-card-3d p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-xl shadow-xl">
      <h5 className="text-white font-semibold mb-3">Analytics Dashboard</h5>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-700/30 mb-4">
        <button
          className={getTabStyle('insight')}
          onClick={() => setActiveTab('insight')}
        >
          💡 Insights
        </button>
        <button
          className={getTabStyle('sql')}
          onClick={() => setActiveTab('sql')}
        >
          🗃️ SQL Query
        </button>
        <button
          className={getTabStyle('chart')}
          onClick={() => setActiveTab('chart')}
        >
          📊 Charts
        </button>
      </div>
      
      {/* Content area */}
      <div className="mt-2 animate-fadeIn">
        {activeTab === 'insight' && insightAgent && (
          <AgentPanel
            agent={insightAgent}
            fileUploaded={fileUploaded}
            agentOutputs={getAgentSampleOutput('insight')}
            agentCapabilities={getAgentCapabilities('insight')}
          />
        )}
        
        {activeTab === 'sql' && sqlAgent && (
          <AgentPanel
            agent={sqlAgent}
            fileUploaded={fileUploaded}
            agentOutputs={getAgentSampleOutput('sql')}
            agentCapabilities={getAgentCapabilities('sql')}
          />
        )}
        
        {activeTab === 'chart' && chartAgent && (
          <AgentPanel
            agent={chartAgent}
            fileUploaded={fileUploaded}
            agentOutputs={getAgentSampleOutput('chart')}
            agentCapabilities={getAgentCapabilities('chart')}
          />
        )}
      </div>
    </div>
  );
}
