# DUMMY SYNC LINE - 2025-06-07

# 🧠 Enterprise Insights Copilot

[![CI](https://github.com/MlvPrasadOfficial/enterprise-insights-copilot/actions/workflows/ci.yml/badge.svg)](https://github.com/MlvPrasadOfficial/enterprise-insights-copilot/actions/workflows/ci.yml)
![GenAI BI](https://img.shields.io/badge/GenAI-BI-blueviolet?style=for-the-badge)
![FastAPI Backend](https://img.shields.io/badge/FastAPI-Backend-green?style=for-the-badge)
![Streamlit Frontend](https://img.shields.io/badge/Streamlit-Frontend-orange?style=for-the-badge)
![Pinecone RAG](https://img.shields.io/badge/Pinecone-RAG-9cf?style=for-the-badge)
![LangGraph](https://img.shields.io/badge/LangGraph-MultiAgent-blue?style=for-the-badge)
![CrewAI](https://img.shields.io/badge/CrewAI-Orchestration-yellow?style=for-the-badge)

> **Conversational BI with LLMs, RAG, multi-agent orchestration, and instant analytics for everyone.**

---

## 🚀 Features

- 📁 **Upload CSVs** directly from the UI
- 💬 **Ask natural language questions** (e.g., "Show sales trend by region")
- 🧠 **Retrieval-Augmented Generation (RAG)** using OpenAI + Pinecone
- 📊 **Auto-generate charts** via Altair (line, bar, scatter, histogram)
- 🧾 **Natural Language → SQL → Result** using DuckDB + GPT-4
- 📌 **Auto-insights summary**: KPIs, anomalies, trends
- 🧱 **Modular multi-agent architecture** (DataAgent, QueryAgent, ChartAgent, SQLAgent, InsightAgent)
- 🤖 **Multi-agent workflows**: LangGraph, CrewAI, Debate Mode
- 🧩 **Robust error handling, actionable user-facing errors**
- 🧪 **Comprehensive test suite and CI integration**
- 🔎 **LangSmith/LangChain tracing** for observability

---

## ⚙️ Tech Stack

| Layer          | Stack                                |
|----------------|---------------------------------------|
| LLM Core       | GPT-4 via OpenAI API                  |
| RAG Retrieval  | Pinecone vector DB                    |
| SQL Engine     | DuckDB                                |
| Frontend       | Streamlit                             |
| Backend        | FastAPI                               |
| Charting       | Altair                                |
| Multi-Agent    | LangGraph, CrewAI                     |
| Tracing        | LangSmith/LangChain                   |

---

## 🗂 Folder Structure

```text
enterprise_insights_copilot/
├── backend/           # FastAPI, Agents, Core logic
│   ├── agents/        # QueryAgent, ChartAgent, InsightAgent, etc.
│   ├── agentic/       # Multi-agent: planner, retriever, analyst, critic, debate, graph_flow, crews
│   ├── core/          # LLM, Pinecone integration, loader, utils
│   ├── api/           # (reserved for future API modules)
│   └── main.py        # FastAPI entrypoint
├── config/            # .env, settings, constants, prompts
│   ├── prompts/       # Prompt templates
├── frontend/          # Streamlit UI
│   └── app.py         # Streamlit entrypoint
├── data/              # Sample/test data
├── tests/             # Pytest-based tests (unit + e2e)
├── requirements.txt   # Backend requirements
├── setup.bat / .sh    # Quickstart scripts (Windows/Linux)
├── render.yaml        # Render.com deployment config
├── .env               # Environment variables (see below)
├── README.md
```

---

## ✅ Quickstart

```powershell
# 1. Clone the repo
git clone https://github.com/your-name/enterprise-insights-copilot.git
cd enterprise_insights_copilot

# 2. Setup virtual environment
python -m venv venv
.\venv\Scripts\activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Set up environment variables
copy .env.example .env  # Or create .env and fill in required keys (see below)

# 5. Run backend
cd backend
uvicorn main:app --reload --port 8000

# 6. Run frontend (in a new terminal)
cd ../frontend
streamlit run app.py
```

---

## 🔑 Environment Variables

Create a `.env` file in the project root or `config/` with:

```
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_ENV=us-east-1-aws
ALLOWED_ORIGINS=http://localhost,http://localhost:8501
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your-langsmith-key
LANGSMITH_PROJECT=your-project-name
```

---

## 🧪 Running Tests & CI

```powershell
pytest tests/
```
- All major modules and endpoints are covered by unit and end-to-end tests.
- CI runs on every PR via GitHub Actions (`.github/workflows/ci.yml`).

---

## 🧪 Example Prompts

```text
Compare average profit across categories
What is the sales trend by month?
Show me outliers in recovery time by hospital
Summarize this dataset's key patterns
Which gender has the highest salary?
Which city has the highest salary?
```

---

## 🌐 API Endpoints

- `GET /health` — Health check
- `GET /ready` — Readiness check
- `POST /api/v1/index` — Upload and index CSV
- `POST /api/v1/query` — Ask a question (RAG)
- `POST /api/v1/chart` — Auto-generate chart
- `POST /api/v1/sql` — Natural language to SQL
- `POST /api/v1/insights` — Get auto-insights
- `POST /api/v1/auto-chart` — Auto chart from query
- `POST /api/v1/agentic` — Run agentic chain
- `POST /api/v1/langgraph` — Run multi-agent LangGraph workflow
- `POST /api/v1/crewai` — Run CrewAI workflow
- `POST /api/v1/debate` — Run debate mode
- `POST /api/v1/report` — Generate PDF report

---

## 🤖 Multi-Agent Workflows

### LangGraph
- Orchestrates planner, retriever, analyst, critic, and debate agents in a directed graph.
- See `backend/agentic/graph_flow.py` for the workflow definition.
- Run via `/api/v1/langgraph` endpoint.

### CrewAI
- Assigns specialized agents to tasks and coordinates their collaboration.
- See `backend/agentic/crews.py` for crew/task setup.
- Run via `/api/v1/crewai` endpoint.

### Debate Mode
- Two LLM agents debate a question, a judge agent summarizes the best answer.
- See `backend/agentic/debate_mode.py`.
- Run via `/api/v1/debate` endpoint.

---

## 🔎 LangSmith/LangChain Tracing

- Enable advanced tracing and observability for all agentic and LLM workflows.
- All traces are sent to your LangSmith dashboard if environment variables are set.
- See [LangSmith docs](https://docs.smith.langchain.com/) for more.

---

## 🛠️ Troubleshooting

- **Missing .env or API keys:** Ensure `.env` is present and contains valid OpenAI, Pinecone, and LangSmith keys.
- **CORS errors:** Set `ALLOWED_ORIGINS` in `.env` to include your frontend URL.
- **File upload issues:** Only CSV files are supported for upload; max size 10MB.
- **Backend/Frontend connection:** Ensure `BACKEND_URL` in Streamlit secrets or config matches your backend address.
- **Test failures:** Check that all dependencies are installed and test data files exist in `data/`.
- **Windows path issues:** Use PowerShell and ensure paths use `\` or `/` as appropriate.

---

## 📄 License eee

MIT License

---

> “Just upload a CSV and ask any question. The AI uses RAG to fetch context, generates charts, SQL queries, and auto-insights — all within seconds. No need for BI tools or SQL knowledge.”

---

## 🚀 Deployment

### Render.com

- Use the provided `render.yaml` or set the start command:

```sh
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

- Place your `.env` file in the project root and set environment variables in the Render dashboard (Settings > Environment) as needed.
- If deploying frontend, deploy Streamlit separately or use a static site host. Ensure backend and frontend URLs are set correctly in both environments.

---

## 🎨 Portfolio Ready

- Modular, production-grade codebase
- Actionable errors and robust test coverage
- Multi-agent orchestration (LangGraph, CrewAI, Debate)
- CI/CD ready for professional deployment

---

For advanced usage and architecture, see `README_ADVANCED.md`.
