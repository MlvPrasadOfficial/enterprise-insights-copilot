# Agent Activity Tracking Implementation

## Overview

The agent activity tracking system provides real-time visibility into the Enterprise Insights Copilot's multi-agent system. This feature helps users understand which AI agents are working on their queries and what they're doing at any given moment.

## System Components

### Backend Components

1. **Agent Status Module** (`backend/core/agent_status.py`)
   - Thread-safe in-memory store for tracking agent statuses
   - Functions for updating, retrieving, and clearing agent status information
   - Session-based tracking to support multiple concurrent users

2. **LangGraph Flow Integration** (`backend/agentic/langgraph_flow.py`)
   - Agent node functions updated to report their status
   - Status updates at the start, completion, and error states
   - Session ID propagation through the agent flow

3. **API Endpoints** (`backend/main.py`)
   - `/api/v1/agent-status` - Get current agent statuses for a session
   - `/api/v1/reset-agent-status` - Reset agent statuses for a session
   - `/api/v1/multiagent-query` - Enhanced to include session tracking
   - `/healthcheck` - Simple endpoint to verify backend is running

### Frontend Components

1. **Agent Dashboard Component** (`frontend/components/AgentDashboard.tsx`)
   - Visual representation of agent activities
   - Status indicators with color coding
   - Agent descriptions and current messages
   - Real-time updates during query processing

2. **Chat Component Integration** (`frontend/components/Chat.tsx`)
   - Session management for tracking
   - Status polling during query processing
   - Integration of the Agent Dashboard in the UI layout
   - API integration with backend status endpoints

3. **Test Page** (`frontend/public/agent_test.html`)
   - Standalone test interface for agent status tracking
   - Test functionality for session creation, queries, and status polling
   - Helps with debugging and verification

## Implementation Details

### Agent Status Tracking Flow

1. User submits a query in the Chat interface
2. Frontend generates a unique session ID and resets agent status
3. Query is sent to backend with the session ID
4. Backend routes the query through the multi-agent system
5. Each agent updates its status as it starts and completes work
6. Frontend polls the agent status endpoint during processing
7. Agent Dashboard displays real-time updates of agent activities

### Agent Status Object Structure

```typescript
interface AgentStatus {
  name: string;                 // Display name of the agent
  status: 'idle' | 'working' | 'complete' | 'error';  // Current status
  type: 'planner' | 'chart' | 'sql' | 'insight' | 'critique' | 'debate';  // Agent type
  message: string;              // Current activity or status message
  startTime?: string;           // ISO timestamp when agent started
  endTime?: string;             // ISO timestamp when agent completed
}
```

## Testing and Verification

### Manual Testing

1. Start the backend server: `python backend/main.py`
2. Start the frontend server: `cd frontend && npm run dev`
3. Access the application at http://localhost:3000
4. Upload a CSV file and ask questions to see the agents in action
5. Verify the Agent Dashboard shows the correct activities

### Automated Testing

1. Run the agent status unit tests: `python tests/test_agent_status.py`
2. Use the verification script: `python scripts/verify_agent_tracking.py`
3. For detailed API testing, open: http://localhost:3000/agent_test.html

## Future Improvements

1. **Persistent Storage**: Replace in-memory storage with a database for status persistence
2. **WebSockets**: Implement WebSocket connections for push notifications instead of polling
3. **Agent Timelines**: Add visualization of agent processing timelines and dependencies
4. **Detailed Logs**: Add more detailed logs from each agent for debugging
5. **Performance Metrics**: Track and display agent processing times and performance metrics

## References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [React Polling Best Practices](https://react.dev/reference/react/useEffect)
- [FastAPI WebSockets](https://fastapi.tiangolo.com/advanced/websockets/)
