import React from 'react';
import AgentWorkflowDisplay from '../components/AgentWorkflowDisplay';

// Sample agent data to demonstrate the functionality
const sampleAgents = [
  {
    id: 'cleaner',
    name: 'Data Cleaner',
    type: 'cleaner',
    status: 'idle',
    message: 'Data Cleaner ready'
  },
  {
    id: 'planner',
    name: 'Planning Agent',
    type: 'planner',
    status: 'working',
    message: 'Analyzing data requirements...',
    progress: 75,
    timestamp: new Date().toISOString()
  },
  {
    id: 'sql',
    name: 'SQL Agent',
    type: 'sql',
    status: 'complete',
    message: 'Query executed successfully',
    result: 'SELECT * FROM employees WHERE department = "Engineering"',
    progress: 100,
    timestamp: new Date().toISOString(),
    duration: '2.3s'
  },
  {
    id: 'insight',
    name: 'Insight Agent',
    type: 'insight',
    status: 'error',
    message: 'Failed to generate insights',
    progress: 25,
    timestamp: new Date().toISOString()
  }
];

export default function AgentTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-8 text-center">
          Agent Workflow Display Test
        </h1>
        
        <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
          <AgentWorkflowDisplay 
            agents={sampleAgents}
            currentQuery="Show me all employees in the Engineering department"
            isLoading={false}
          />
        </div>

        <div className="mt-8 text-white/70 text-sm space-y-2">
          <p><strong>Features demonstrated:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>All 9 agents are always visible in a 3x3 glassmorphic grid</li>
            <li>Agents turn green when active (working, complete, or error states)</li>
            <li>Progress bars and enhanced output display for active agents</li>
            <li>Click any agent to see detailed output in a modal</li>
            <li>Real-time status indicators with appropriate icons and colors</li>
            <li>Responsive design that works on all screen sizes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
