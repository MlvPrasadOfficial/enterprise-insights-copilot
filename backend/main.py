# FastAPI app runner entry point

import sys
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# ✅ Add project root to PYTHONPATH so backend/, config/, etc. are accessible
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from backend.core.llm_rag import upsert_document, run_rag
from config.settings import load_prompt
from backend.agents.chart_agent import ChartAgent
from backend.agents.sql_agent import SQLAgent
from backend.agents.insight_agent import InsightAgent
from backend.agents.data_cleaner_agent import DataCleanerAgent
from backend.agentic.agent_executor import get_agent_executor
from backend.agentic.graph_runner import build_graph
import altair as alt
import json
from core.session_memory import memory
from backend.agents.critique_agent import CritiqueAgent
from backend.agents.report_generator import ReportGenerator
from fastapi.responses import FileResponse
from backend.agents.debate_agent import DebateAgent
from core.debate_log import log_debate_entry
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

# Allow Streamlit frontend to access FastAPI backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryInput(BaseModel):
    query: str


class ChartRequest(BaseModel):
    x: str
    y: str
    chart_type: str
    data: list


class SQLQuery(BaseModel):
    query: str
    data: list


class InsightRequest(BaseModel):
    data: list


@app.post("/index")
async def index_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(pd.compat.StringIO(contents.decode("utf-8")))
    cleaner = DataCleanerAgent(df)
    df = cleaner.clean()  # 🔧 Cleaned before embedding
    memory.update(df, file.filename)
    for idx, row in df.iterrows():
        upsert_document(f"{file.filename}_{idx}", row.to_json())
    return {"status": "success", "rows_indexed": len(df)}


@app.post("/query")
async def query_rag(data: QueryInput):
    df = memory.df
    if df is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    answer = run_rag(data.query)
    critique = CritiqueAgent(df.columns.tolist())
    eval_report = critique.evaluate(data.query, answer)
    return {"answer": answer, "evaluation": eval_report}


@app.post("/chart")
def chart_handler(req: ChartRequest):
    df = memory.df
    if df is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    agent = ChartAgent(df)
    chart = agent.render_chart(req.x, req.y, req.chart_type)
    return {"chart": chart.to_json()}


@app.post("/sql")
def sql_endpoint(req: SQLQuery):
    df = memory.df
    if df is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    agent = SQLAgent(df)
    sql = agent.generate_sql(req.query)
    try:
        result = agent.run_sql(sql)
        result_string = result.to_markdown()
        critique = CritiqueAgent(df.columns.tolist())
        eval_report = critique.evaluate(req.query, result_string)
        return {
            "sql": sql,
            "result": result.to_dict(orient="records"),
            "evaluation": eval_report,
        }
    except Exception as e:
        return {"error": str(e), "sql": sql}


@app.post("/insights")
def generate_insights(req: InsightRequest):
    df = memory.df
    if df is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    agent = InsightAgent(df)
    result = agent.generate_summary()
    critique = CritiqueAgent(df.columns.tolist())
    eval_report = critique.evaluate("insights", result)
    return {"insights": result, "evaluation": eval_report}


@app.post("/auto-chart")
def auto_chart(req: QueryInput):
    if memory.df is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data in session.")

    query = req.query
    df = memory.df

    agent = ChartAgent(df)

    chart_type = agent.guess_chart(query)
    x, y = agent.guess_axes()
    chart = agent.render_chart(x, y, chart_type)

    return {
        "chart_type": chart_type,
        "x": x,
        "y": y,
        "chart": chart.to_json(),
    }


@app.post("/agentic")
def agentic_chain(req: QueryInput):
    agent = get_agent_executor()
    result = agent.run(req.query)
    return {"response": result}


session_memory = {}


@app.post("/langgraph")
def run_graph(req: QueryInput):
    user_id = "default"  # You can sessionize this later
    if user_id not in session_memory:
        session_memory[user_id] = []

    # Load memory from previous session
    graph = build_graph()
    state = graph.invoke(
        {
            "query": req.query,
            "result": "",
            "steps": [],
            "history": session_memory[user_id],
        }
    )

    # Update memory for next turn
    session_memory[user_id] = state["history"]
    return {"steps": state["steps"], "output": state["result"]}


@app.post("/report")
def generate_report():
    df = memory.df
    if df is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data uploaded")

    # Get insights
    insight = InsightAgent(df).generate_summary()

    # Generate report
    report = ReportGenerator()
    report.add_title()
    report.add_insight_section(insight)

    # Optional: attach last chart image (save from Streamlit or backend)
    chart_path = "logs/last_chart.png"
    if os.path.exists(chart_path):
        report.add_chart(chart_path)

    report_path = "logs/report.pdf"
    report.save(report_path)
    return FileResponse(
        report_path, media_type="application/pdf", filename="insight_report.pdf"
    )


@app.post("/debate")
def debate_mode(req: QueryInput):
    df = memory.df
    agent = DebateAgent(df)
    result = agent.run_debate(req.query)

    log_debate_entry(
        req.query,
        result["responses"],
        result["evaluations"],
        result["decision"],
    )

    return result
