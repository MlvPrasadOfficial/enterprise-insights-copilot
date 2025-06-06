# 🧠 Enterprise Insights Copilot

![GenAI BI](https://img.shields.io/badge/GenAI-BI-blueviolet?style=for-the-badge)
![FastAPI Backend](https://img.shields.io/badge/FastAPI-Backend-green?style=for-the-badge)
![Streamlit Frontend](https://img.shields.io/badge/Streamlit-Frontend-orange?style=for-the-badge)
![Pinecone RAG](https://img.shields.io/badge/Pinecone-RAG-9cf?style=for-the-badge)

**Conversational BI with LLMs, RAG, and instant analytics for everyone.**

---

## 🚀 Features

- 📁 **Upload CSVs** directly from the UI
- 💬 **Ask natural language questions** (e.g., "Show sales trend by region")
- 🧠 **Retrieval-Augmented Generation (RAG)** using OpenAI + Pinecone
- 📊 **Auto-generate charts** via Altair (line, bar, scatter, histogram)
- 🧾 **Natural Language → SQL → Result** using DuckDB + GPT-4
- 📌 **Auto-insights summary**: KPIs, anomalies, trends
- 🧱 **Modular multi-agent architecture** (DataAgent, QueryAgent, ChartAgent, SQLAgent, InsightAgent)

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

```text
enterprise_insights_copilot/
├── frontend/   # Streamlit UI
├── backend/    # FastAPI, Agents, Core logic
│   ├── agents/ # QueryAgent, ChartAgent, InsightAgent etc.
│   ├── core/   # LLM + Pinecone integration (RAG)
│   └── main.py
├── config/     # .env and settings
├── requirements.txt
├── README.md
```

---

## 🧪 Example Prompts

```text
Compare average profit across categories
What is the sales trend by month?
Show me outliers in recovery time by hospital
Summarize this dataset's key patterns
```

---

## ✅ Quickstart

```powershell
# 1. Clone the repo
git clone https://github.com/your-name/enterprise-insights-copilot.git

# 2. Setup virtual environment
python -m venv venv
.\venv\Scripts\activate

# 3. Install requirements
pip install -r requirements.txt

# 4. Run backend
cd backend
uvicorn main:app --reload --port 8000

# 5. Run frontend
cd ../frontend
streamlit run app.py
```

---

## 🌐 API Endpoints

- `GET /api/v1/health` — Health check
- `POST /api/v1/index` — Upload and index CSV
- `POST /api/v1/query` — Ask a question (RAG)
- `POST /api/v1/chart` — Auto-generate chart
- `POST /api/v1/sql` — Natural language to SQL
- `POST /api/v1/insights` — Get auto-insights
- `GET /api/v1/config` — View config/constants
- `GET /api/v1/metrics` — Usage/cost metrics
- ...and more!

---

## 📄 License

MIT License

---

> “Just upload a CSV and ask any question. The AI uses RAG to fetch context, generates charts, SQL queries, and auto-insights — all within seconds. No need for BI tools or SQL knowledge.”

---

## 🎨 Let’s polish this into a portfolio centerpiece. 🚀

---

## Deploying to Render.com

Make sure your start command uses the environment variable for the port:

```sh
uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

If you use a render.yaml file, it should look like this:

```yaml
services:
  - type: web
    name: enterprise-insights-copilot
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
    plan: free
    envVars:
      - key: PORT
        value: 10000
```

This ensures Render will detect the open port and route traffic correctly.
