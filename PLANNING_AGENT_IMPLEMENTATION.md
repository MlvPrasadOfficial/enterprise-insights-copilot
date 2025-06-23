# Planning Agent Dynamic Data Implementation & Testing Guide

This guide provides step-by-step instructions to ensure that the Planning Agent in the enterprise_insights_copilot project always produces and displays real-time, dynamic, data-driven outputs for resource allocation and processing pipeline in the frontend Home UI after sending a query.

## Implementation Status

The Planning Agent has been updated to generate dynamic resource allocation and processing pipeline data based on the content of the query. Key improvements include:

1. Enhanced dynamic resource allocation in the Planning Agent that varies significantly based on query keywords
2. Context-aware processing pipeline generation with timestamps to make dynamic data obvious
3. Improved logging throughout the backend and frontend
4. Fixed indentation and logic errors in main.py and planning_agent.py
5. Added defensive code in the agent-status endpoint to ensure real data is always returned

## Step-by-Step Testing Process

Follow these steps precisely to verify the implementation:

### Step 1: Start the Backend

```
conda activate aiproject
cd C:\SAFEVERSION\
# Note: This project now uses only Llama 3.1 via Ollama - no OpenAI dependencies required
# Remove any OpenAI environment variables if set
$env:OPENAI_API_KEY=""
uvicorn enterprise_insights_copilot.backend.main:app --reload
```

**Important**: After running the above command, check the terminal output carefully for any errors. The output should show:
- Backend starting successfully
- No Python errors, import errors, or indentation errors
- The server running on http://127.0.0.1:8000

If there are errors, fix them before proceeding. Common errors might include:
- Indentation errors in main.py
- Import errors for missing modules
- Configuration errors

### Step 2: Start the Frontend

Open a new terminal and run:

```
conda activate aiproject
cd C:\SAFEVERSION\enterprise_insights_copilot\frontend
npm run dev
```

**Important**: After running the above command, check the terminal output carefully for any errors. The output should show:
- Frontend starting successfully
- No build errors or TypeScript errors
- The frontend running on http://localhost:3000

If there are errors, fix them before proceeding.

### Step 3: Test with the Verification Script

Once both the backend and frontend are running successfully, run the verification script:

```
conda activate aiproject
cd C:\SAFEVERSION\enterprise_insights_copilot
python verify_planner_agent.py
```

This script will:
1. Reset the agent status
2. Send multiple test queries with different keywords
3. Check if the Planning Agent generates dynamic resource allocation and processing pipeline data
4. Verify that the data source is marked as 'dynamic' and not 'placeholder'
5. Output success or failure messages

### Step 4: Manual Frontend Verification

1. Open a browser and navigate to http://localhost:3000
2. Upload a sample CSV file if prompted
3. Send a test query like "Analyze the correlation between marketing spend and revenue"
4. Observe the Planning Agent panel in the Home UI
5. Verify that:
   - The resource allocation chart shows percentages that sum to 100%
   - The processing pipeline shows multiple steps
   - The data changes when different queries are sent
   - No placeholder data is displayed

## Troubleshooting

If dynamic data is not being displayed:

1. **Backend Issues:**
   - Check the backend terminal for errors
   - Verify that the agent-status endpoint is returning data for the planner agent
   - Check if resource_allocation and processing_pipeline fields are present in the response
   - Ensure the source fields (resource_allocation_source, processing_pipeline_source) are set to 'dynamic'

2. **Frontend Issues:**
   - Check the browser console for errors
   - Look for warning messages about placeholder data
   - Verify that the AgentPanel.tsx component is receiving and displaying dynamic data
   - Check if conditional rendering is working correctly

## Key Code Locations

The following files are central to the Planning Agent's dynamic data generation:

1. **Backend:**
   - `backend/agents/planning_agent.py`: Generates dynamic resource allocation and processing pipeline
   - `backend/main.py`: Agent-status endpoint that sends data to the frontend
   - `backend/core/agent_status.py`: Manages agent status tracking

2. **Frontend:**
   - `frontend/components/AgentPanel.tsx`: Renders planner agent data
   - `frontend/components/LiveFlow.tsx`: Manages overall agent display
   - `frontend/app/page.tsx`: Fetches agent status from the backend

## Expected Behavior

When working correctly:

1. The backend planning_agent.py file generates dynamic resource allocation that varies based on query keywords
2. The backend main.py agent-status endpoint always returns dynamic data with the source fields set to 'dynamic'
3. The frontend AgentPanel.tsx displays this dynamic data in the UI
4. Resource allocations sum to 100% and show a realistic distribution
5. Processing pipeline shows relevant steps based on the query
6. No placeholder data is displayed, and warnings are shown if dynamic data is missing

By following this guide, you can verify that the Planning Agent always produces and displays real-time, dynamic data-driven outputs for resource allocation and processing pipeline in the Home UI.
