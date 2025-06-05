# 🧠 Enterprise Insights Copilot

A GenAI-powered Conversational BI Platform that transforms natural language questions into actionable insights from structured data (CSV, SQL, dashboards).

Built for analysts, PMs, and executives who want instant answers, charts, and insights — without writing code.

---

## 🚀 Features

- 📁 Upload CSVs directly from the UI
- 💬 Ask natural language questions (e.g., "Show sales trend by region")
- 🧠 Retrieval-Augmented Generation (RAG) using OpenAI + Pinecone
- 📊 Auto-generate charts via Altair (line, bar, scatter, histogram)
- 🧾 Natural Language → SQL → Result using DuckDB + GPT-4
- 📌 Auto-insights summary: KPIs, anomalies, trends
- 🧱 Modular multi-agent architecture (DataAgent, QueryAgent, ChartAgent, SQLAgent, InsightAgent)

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
| Agent Framework| LangChain-style modular agents        |

---

## 🗂 Folder Structure

enterprise_insights_copilot/
├── frontend/ # Streamlit UI
├── backend/ # FastAPI, Agents, Core logic
│   ├── agents/ # QueryAgent, ChartAgent, InsightAgent etc.
│   ├── core/ # LLM + Pinecone integration (RAG)
│   └── main.py
├── config/ # .env and settings
├── requirements.txt
├── README.md

---

## 🧪 Example Prompts

```
"Compare average profit across categories"
"What is the sales trend by month?"
"Show me outliers in recovery time by hospital"
"Summarize this dataset's key patterns"
```

---

## ✅ Setup Instructions

```powershell
# Clone the repo
git clone https://github.com/your-name/enterprise-insights-copilot.git

# Setup virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run backend
cd backend
uvicorn main:app --reload --port 8000

# Run frontend
cd ../frontend
streamlit run app.py
```

---

## 📌 Demo Video Script (Optional)

“This is Enterprise Insights Copilot — a GenAI platform for business users. Just upload a CSV and ask any question. The AI uses RAG to fetch context, generates charts, SQL queries, and auto-insights — all within seconds. No need for BI tools or SQL knowledge.”

---

## 📄 License
MIT License

---

Would you like me to also generate:
- 📽️ A full **demo video script/voiceover**?
- 📊 LangSmith or logging for evaluation?
- 🧠 Prompt templates for each agent?

Let’s polish this into a portfolio center-piece.
