# Enterprise Insights Copilot – Architecture

A production-ready, agentic GenAI platform for conversational BI:  
- Upload CSVs, ask business/data questions, auto-generate insights and visualizations, and download reports—all powered by multi-agent orchestration and LLMs.

---

## **System Flow Chart**

```text
[User]
  │
  ▼
[Next.js Frontend UI]
  │   ├─ Upload CSV/Data
  │   ├─ Chat Input (Ask Questions)
  │   ├─ View Insights (summary)
  │   ├─ View/Customize Charts
  │   └─ Download/Share Reports
  │
  ▼ REST/API calls
[FastAPI Backend]
  │
  ├─ /index: CSV Upload → DataCleanerAgent → Cleaned DataFrame in memory
  ├─ /columns: Return columns/types for chart building
  ├─ /auto-chart: ChartAgent
  │       └─ Suggests & builds best chart (auto, or by user axes)
  ├─ /chart: ChartAgent (custom axes/chart-type)
  ├─ /insights: InsightAgent (textual summary/stats)
  ├─ /query: RAG/QA pipeline (Retriever → LLM)
  ├─ /sql: SQLAgent (NL → SQL → Table)
  ├─ /report: Generate downloadable PDF/HTML of insights + charts
  ├─ /debate: DebateAgent (optional, advanced)
  └─ /multiagent, /langgraph: Multi-agent orchestration (Planner → [various agents])
  │
  ▼
[Agent Layer (LangGraph/LangChain)]
   │
   ├─ DataCleanerAgent (schema/units)
   ├─ ChartAgent (visualization)
   ├─ InsightAgent (narrative/stats)
   ├─ SQLAgent (NL → SQL)
   ├─ CritiqueAgent (self-eval)
   ├─ DebateAgent (optional)
   └─ Planner/Orchestrator
   │
   ▼
[OpenAI LLM / Pinecone Vector DB / LangSmith Tracing]
   │
   └─ Embedding, Retrieval, Reasoning, Tracing

---

[User] ─► [Frontend UI] ─► [Backend API] ─► [Agents] ─► [LLM/Vector/Tracing]
   ▲            ▲             │
   └────────────┴─────────────┘
    (All results rendered back to user: answers, charts, tables, downloads)
