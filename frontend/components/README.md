# Agent Process Visualization

This folder contains components for visualizing the agent workflow and activity in the Enterprise Insights Copilot application.

## Components

### ProcessVisualizer

The main visualization component that shows agent activity, statuses, and the process flow. It includes:

- Current query display
- Active agents panel with status indicators
- Agent flow chart showing the decision process
- Timeline of agent activities and events

### AgentFlowChart

A visual representation of the agent workflow showing:

- Planning agent at the center
- Specialist agents (SQL, Chart, Insight, etc.)
- Routing decisions and connections
- Agent status indicators

## Debug Tools

Several debug tools are available to help test and visualize the agent process:

1. **Debug Page** (`/debug`)
   - Test different queries
   - Monitor agent status events
   - Simulate file uploads
   - View real-time debug logs

2. **Test Cases** (`/test-cases`)
   - Pre-defined test scenarios
   - View different agent states and flows
   - Test error handling
   - Verify visualization components

3. **Test Visualizer** (`/test-visualizer`)
   - Automated step-through visualization
   - Simulates a complete agent workflow

## Testing Agent Visualization

To test the agent visualization:

1. Start the backend: 
   ```
   cd c:\AIPROJECT\enterprise_insights_copilot
   ./start_backend.bat
   ```

2. Start the frontend:
   ```
   cd c:\AIPROJECT\enterprise_insights_copilot
   ./start_frontend.bat
   ```

3. Open one of the debug pages:
   - http://localhost:3000/debug
   - http://localhost:3000/test-cases
   - http://localhost:3000/test-visualizer

4. You can also use the Python test script:
   ```
   cd c:\AIPROJECT\enterprise_insights_copilot
   python scripts/test_agent_visualization.py
   ```

## Troubleshooting

If the visualization isn't working properly:

1. Check browser console for errors
2. Verify that agent status API is returning valid data
3. Test the `/api/v1/agent-status` endpoint directly
4. Use the agent_status_debugger.html page in public folder
5. Verify that the custom events are being dispatched

## Event Flow

The visualization relies on several events and data flows:

1. User submits a query
2. Frontend calls `/api/v1/multiagent-query` endpoint
3. Backend starts processing with the planner agent
4. Backend updates agent status during processing
5. Frontend polls `/api/v1/agent-status` endpoint
6. ProcessVisualizer component updates with agent data
7. AgentFlowChart updates to show the decision flow
8. Timeline updates with agent activities

File uploads follow a similar flow with custom events:
1. User uploads a file
2. `file-uploaded` event is dispatched
3. Backend processes and indexes the file
4. `file-indexed` event is dispatched
5. Visualization updates with file processing status
