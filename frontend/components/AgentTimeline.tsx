import React from "react";

// Define the AgentStep interface that was previously imported
interface AgentStep {
  agent?: string;
  output?: string;
  [key: string]: any;
}

// Time formatting utility
const formatTime = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

// Calculate duration between two timestamps in seconds
const calculateDuration = (startTime?: string, endTime?: string) => {
  if (!startTime || !endTime) return null;
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return Math.round((end - start) / 100) / 10; // in seconds with 1 decimal
};

// Support both legacy AgentStep and new AgentStatus interfaces
type Props = { steps?: AgentStep[], agents?: AgentStatus[] };

// Interface for agent status
interface AgentStatus {
  name: string;
  status: 'idle' | 'working' | 'complete' | 'error';
  type: 'planner' | 'chart' | 'sql' | 'insight' | 'critique' | 'debate';
  message: string;
  startTime?: string;
  endTime?: string;
}

export default function AgentTimeline({ steps, agents }: Props) {
  // If using legacy steps format
  if (steps && steps.length > 0) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Agent Timeline</h2>
        <ol className="border-l-2 border-blue-600">
          {steps.map((step, i) => (
            <li key={i} className="mb-4 ml-4">
              <div className="font-bold">{step.agent || `Step ${i + 1}`}</div>
              <div className="ml-2">{step.output || JSON.stringify(step)}</div>
            </li>
          ))}
        </ol>
      </div>
    );
  }
  
  // If using new agent status format
  if (!agents || agents.length === 0) return null;
  
  // Sort agents by start time
  const sortedAgents = [...agents].sort((a, b) => {
    if (!a.startTime) return 1;
    if (!b.startTime) return -1;
    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

  // Find the earliest and latest timestamps to set the timeline scale
  let minTime = Number.MAX_SAFE_INTEGER;
  let maxTime = 0;
  
  sortedAgents.forEach(agent => {
    if (agent.startTime) {
      const startMs = new Date(agent.startTime).getTime();
      if (startMs < minTime) minTime = startMs;
    }
    if (agent.endTime) {
      const endMs = new Date(agent.endTime).getTime();
      if (endMs > maxTime) maxTime = endMs;
    } else if (agent.status === 'working' && agent.startTime) {
      // For working agents with no end time, use current time
      const now = new Date().getTime();
      if (now > maxTime) maxTime = now;
    }
  });

  // If we have no valid times or only one agent with no end time
  if (minTime === Number.MAX_SAFE_INTEGER || maxTime === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Agent Timeline</h2>
        <div className="text-gray-500">Timeline will appear when agents start processing</div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Agent Timeline</h2>
      
      <div className="text-xs text-gray-500 flex justify-between mb-1">
        <span>{formatTime(new Date(minTime).toISOString())}</span>
        <span>{formatTime(new Date(maxTime).toISOString())}</span>
      </div>
      
      <div className="space-y-3 mt-2">
        {sortedAgents.map((agent, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <div className="w-24 flex-shrink-0 text-sm font-medium">{agent.name}</div>
            <div className="flex-grow h-8 bg-gray-100 dark:bg-zinc-800 rounded-md relative">
              {agent.startTime && (
                <div 
                  className={`absolute h-full ${getStatusColor(agent.status)} rounded-md`}
                  style={{
                    left: `${((new Date(agent.startTime).getTime() - minTime) / (maxTime - minTime)) * 100}%`,
                    width: agent.endTime 
                      ? `${((new Date(agent.endTime).getTime() - new Date(agent.startTime).getTime()) / (maxTime - minTime)) * 100}%`
                      : `${((new Date().getTime() - new Date(agent.startTime).getTime()) / (maxTime - minTime)) * 100}%`,
                    minWidth: '10px'
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Status color mapping
function getStatusColor(status: AgentStatus['status']) {
  switch (status) {
    case 'working': return 'bg-yellow-400';
    case 'complete': return 'bg-green-400';
    case 'error': return 'bg-red-400';
    default: return 'bg-gray-300';
  }
}
