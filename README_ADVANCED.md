# Enterprise Insights Copilot – Advanced Usage & Architecture

## 🚀 Advanced Features

- Modular loader abstraction (CSV, TXT, PDF, DOCX, MD, HTML, PPTX, IPYNB, etc.)
- SmartFAQSplitter for FAQ-style docs
- Runtime override of chunk size, overlap, model, embedding, and splitter type
- MultiRetrieverFAQChain for multi-retriever (knowledge base + FAQ) and streaming responses
- Async job orchestration for ingestion and upsert
- Retry logic with exponential backoff for OpenAI/Pinecone API calls
- Usage/cost tracking per user/session
- Per-user/session chat history and vector store management
- Multi-agent orchestration: LangGraph, CrewAI, Debate Mode
- LangSmith/LangChain tracing for all agentic and LLM workflows
- Test suite for loader, chain, and agentic orchestration

## ⚙️ Config Options

- See `config/constants.py` for all overridable parameters
- Runtime overrides supported via API/frontend (see loader and chain docs)
- Multi-agent workflow configuration in `backend/agentic/`

## 🧠 Multi-Agent Architecture

```
[User/Frontend]
      |
  [FastAPI Backend] <--- [Streamlit Frontend]
      |
  [Loader/Chain/Job/Session Modules]
      |
  [Agentic Orchestrator]
      |
  [LangGraph] <-> [CrewAI] <-> [Debate Mode]
      |
  [Pinecone Vector DB] + [OpenAI LLM]
```

- **LangGraph**: Directed graph of planner, retriever, analyst, critic, and debate agents. See `backend/agentic/graph_flow.py`.
- **CrewAI**: Crew/task-based agent collaboration. See `backend/agentic/crews.py`.
- **Debate Mode**: Two LLM agents debate, a judge agent summarizes. See `backend/agentic/debate_mode.py`.

## 🛠️ Extending

- Add new file types: update `backend/core/loader.py` FILE_LOADER_MAPPING
- Add new chains: extend `backend/core/chain.py`
- Add new jobs: extend `backend/core/jobs.py`
- Add new agents or workflows: add to `backend/agentic/`

## 🧪 Testing

- See `tests/` for examples
- All major agentic and chain logic is covered

## 🔎 Tracing & Observability

- Enable LangSmith/LangChain tracing by setting environment variables in `.env`:
  ```
  LANGSMITH_TRACING=true
  LANGSMITH_ENDPOINT=https://api.smith.langchain.com
  LANGSMITH_API_KEY=your-langsmith-key
  LANGSMITH_PROJECT=your-project-name
  ```
- All agentic and LLM runs are visible in your LangSmith dashboard

## 🚀 Deployment

- Windows, Linux, and cloud (Render) ready
- See Dockerfile, requirements.txt, and render.yaml
- Place `.env` in project root and set environment variables as needed

---

## 🔗 How to Integrate with Your Codebase

### Endpoints

Expose new FastAPI endpoints for multi-agent workflows in `backend/main.py`:

- `/api/v1/langgraph` — Run LangGraph multi-agent workflow
- `/api/v1/crewai` — Run CrewAI workflow
- `/api/v1/debate` — Run debate mode
- `/api/v1/multiagent` — (Optional: for custom orchestrations)

### Frontend

- Add multi-agent mode toggles in your Streamlit UI (e.g., sidebar or top bar)
- Show agent messages as a conversation, timeline, or flowchart for transparency
- Display intermediate agent outputs and critiques for user trust

### LangSmith Integration

Set up tracing hooks in each agent function for full observability:

```python
from langsmith import trace

@trace
def analyst_agent(...):
    ...
```

- Ensure LangSmith environment variables are set in `.env` or your deployment config
- All agentic and LLM runs will be visible in your LangSmith dashboard

### Tests

- Add sample scenarios in `tests/agentic/` (use `pytest` or `unittest`)
- Test each agent and the full workflow (e.g., ambiguous queries, critique feedback, debate resolution)

---

## 📝 Sample LangGraph YAML (for Documentation)

```yaml
agents:
  - planner
  - retriever
  - analyst
  - critic
  - debate
flow:
  entry: planner
  planner: retriever
  retriever: analyst
  analyst: critic
  critic:
    - debate
    - END
  debate: critic  # Loop if debate triggers more critique
```

---

For more, see the main README and code comments.
