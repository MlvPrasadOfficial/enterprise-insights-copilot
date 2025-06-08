[User]
   │
   ▼
[Vercel Hosted Next.js Frontend]
   │
   ▼ (REST/API call)
[Render Hosted FastAPI Backend]
   │
   │ Receives query/upload/report/chart request
   │
   │ If CSV Upload:
   │   └─ Pandas: Clean & parse
   │   └─ Embedder: Vectorize data
   │   └─ Pinecone: Store vectors
   │
   │ If BI Question or Report/Chart Request:
   │   └─ Retriever: Pull relevant data/chunks from Pinecone
   │
   │   └─ [LangGraph Multi-Agent Orchestrator]
   │         │
   │         ├─ [InsightAgent]: Reads data, produces analytic insights
   │         ├─ [CritiqueAgent]: Evaluates and flags errors/hallucinations
   │         ├─ [NarrativeAgent]: Converts insights to a narrative report
   │         ├─ [DebateAgent]: (Optional) Resolves ambiguities via debate
   │         └─ [MemoryAgent]: (Optional) Maintains conversation/session memory
   │
   │   └─ [Agent Collaboration]: Agents pass intermediate results, critique, and improve each other's outputs (Agentic AI)
   │
   │   └─ [LLM Calls]: Each agent can use OpenAI GPT-4o (or Anthropic, etc.) to reason/generate language
   │
   │   └─ [LangSmith Monitoring]: Logs and traces every agent, every LLM step
   │
   │   └─ Compose final API response (answer, report, chart)
   │
   ▼
[Vercel Hosted Next.js Frontend]
   │
   ├─ Show answer in chat
   ├─ Render charts/tables
   └─ Download/share report
