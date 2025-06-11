// Test script for ProcessVisualizer and AgentFlowChart components
import { AgentStatus } from '../types';

// Mock data for testing the agent visualization
export const mockActiveAgents: AgentStatus[] = [
  {
    name: "Planner Agent",
    status: 'working',
    type: 'planner',
    message: "Analyzing query and routing to appropriate specialist agent",
    startTime: new Date().toISOString(),
  },
  {
    name: "SQL Agent",
    status: 'idle',
    type: 'sql',
    message: "Ready to execute SQL queries",
  },
  {
    name: "Chart Agent",
    status: 'idle',
    type: 'chart',
    message: "Ready to create visualizations",
  }
];

// Simulate the planner completing its work and activating the SQL agent
export function simulatePlannerCompletion(agents: AgentStatus[]): AgentStatus[] {
  return agents.map(agent => {
    if (agent.type === 'planner') {
      return {
        ...agent,
        status: 'complete',
        message: "Routed query to SQL agent",
        endTime: new Date().toISOString()
      };
    } else if (agent.type === 'sql') {
      return {
        ...agent,
        status: 'working',
        message: "Executing SQL query against dataset",
        startTime: new Date().toISOString()
      };
    }
    return agent;
  });
}

// Simulate the SQL agent completing its work and activating the Chart agent
export function simulateSqlCompletion(agents: AgentStatus[]): AgentStatus[] {
  return agents.map(agent => {
    if (agent.type === 'sql') {
      return {
        ...agent,
        status: 'complete',
        message: "SQL query executed successfully",
        endTime: new Date().toISOString()
      };
    } else if (agent.type === 'chart') {
      return {
        ...agent,
        status: 'working',
        message: "Creating visualization from query results",
        startTime: new Date().toISOString()
      };
    }
    return agent;
  });
}

// Simulate all agents completing their work
export function simulateAllComplete(agents: AgentStatus[]): AgentStatus[] {
  return agents.map(agent => {
    if (agent.status === 'working') {
      return {
        ...agent,
        status: 'complete',
        message: `${agent.name} completed successfully`,
        endTime: new Date().toISOString()
      };
    }
    return agent;
  });
}

// Create mock file upload status
export const mockFileUploadStatus = {
  fileName: 'sample_data.csv',
  indexed: true,
  rowCount: 1245
};

// Usage instructions:
// 1. Import these functions in your component where you're testing
// 2. Use setState to update the agent status over time
// 3. Example:
//    const [testAgents, setTestAgents] = useState(mockActiveAgents);
//    
//    // In a useEffect or button click handler:
//    setTimeout(() => {
//      setTestAgents(simulatePlannerCompletion(testAgents));
//    }, 2000);
//    
//    setTimeout(() => {
//      setTestAgents(simulateSqlCompletion(testAgents));
//    }, 4000);
//    
//    setTimeout(() => {
//      setTestAgents(simulateAllComplete(testAgents));
//    }, 6000);
