# Project Flowchart

```mermaid
flowchart TD
    A[User Uploads Data/Query] --> B[FastAPI Backend Receives Request]
    B --> C[Session Memory / DataCleanerAgent]
    C --> D[DataFrame Cleaned & Normalized]
    D --> E[Agentic Orchestrator]
    E --> F{Agent Selection}
    F -->|Chart| G[ChartAgent]
    F -->|SQL| H[SQLAgent]
    F -->|Critique| I[CriticAgent]
    F -->|Debate| J[DebateAgent]
    F -->|Analyst| K[AnalystAgent]
    F -->|Retriever| L[RetrieverAgent]
    G --> M[Chart Rendered]
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    M --> N[Response Returned to User]
    N --> O[Frontend Displays Result]
```

## Directory Structure (Summary)

- `backend/` — FastAPI backend, agents, orchestrator, core logic
- `frontend/` — Frontend app (React or similar)
- `tests/` — All test modules
- `data/` — Sample datasets/uploads

## Main Flow

1. **User uploads data or submits a query via frontend.**
2. **Backend receives request, stores session, and cleans data.**
3. **Agentic orchestrator selects and runs the appropriate agent(s).**
4. **Agent(s) process data and generate results (charts, answers, critiques, etc.).**
5. **Backend returns the result to the frontend for display.**
