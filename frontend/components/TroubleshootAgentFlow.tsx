"use client";
import React from 'react';

interface TroubleshootAgentFlowProps {
  agents: any[];
  fileUploaded: boolean;
  agentStatus?: Record<string, string>;
}

export default function TroubleshootAgentFlow({
  agents,
  fileUploaded,
  agentStatus
}: TroubleshootAgentFlowProps) {
  // Log what agents exist
  console.log("DEBUG - TroubleshootAgentFlow:", {
    fileUploaded,
    agentCount: agents.length,
    agentTypes: agents.map(a => a.type || a.id),
    agentStatus
  });

  // Special attention to narrative and report agents
  const narrativeAgent = agents.find(a => a.type === 'narrative' || a.id === 'narrative');
  const reportAgent = agents.find(a => a.type === 'report' || a.id === 'report');

  console.log("DEBUG - Narrative and Report agents:", {
    narrativeAgentExists: !!narrativeAgent,
    reportAgentExists: !!reportAgent,
    narrativeAgent,
    reportAgent
  });

  return (
    <div className="glass-card-3d p-4">
      <h3 className="text-white font-bold mb-4">Agent Troubleshooting Panel</h3>
      <p className="text-white/80 mb-4">
        File uploaded: <span className="font-bold">{fileUploaded ? "Yes" : "No"}</span>
      </p>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-white font-semibold mb-2">All Agents ({agents.length})</h4>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <ul className="list-disc list-inside text-white/70 space-y-1">
              {agents.map((agent, idx) => (
                <li key={idx}>
                  {agent.icon} {agent.name} ({agent.type || agent.id}) - Status: {agent.status}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Agent Status</h4>
          <div className="bg-gray-800/50 p-2 rounded-lg">
            <ul className="list-disc list-inside text-white/70 space-y-1">
              {agentStatus && Object.entries(agentStatus).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Special Focus: Narrative & Report Agents</h4>
          <div className="bg-gray-800/50 p-2 rounded-lg space-y-3">
            {narrativeAgent ? (
              <div className="text-white/70">
                <p className="font-medium">Narrative Agent:</p>
                <pre className="text-xs bg-black/30 p-2 rounded whitespace-pre-wrap">
                  {JSON.stringify(narrativeAgent, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-red-400">Narrative Agent not found!</p>
            )}

            {reportAgent ? (
              <div className="text-white/70">
                <p className="font-medium">Report Agent:</p>
                <pre className="text-xs bg-black/30 p-2 rounded whitespace-pre-wrap">
                  {JSON.stringify(reportAgent, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-red-400">Report Agent not found!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
