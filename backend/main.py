print("[DEBUG] Starting backend/main.py...")

# FastAPI app runner entry point

import sys
import os
import pandas as pd
from dotenv import load_dotenv
from io import StringIO
import tempfile
import traceback
import logging
from fastapi import status

# Add project root to sys.path for cloud and local compatibility
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

load_dotenv()  # Load environment variables from .env file

# ✅ Add project root to PYTHONPATH so backend/, config/, etc. are accessible
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
from backend.core.session_memory import memory
from backend.agents.critique_agent import CritiqueAgent
from backend.agents.report_generator import ReportGenerator
from fastapi.responses import FileResponse
from backend.agents.debate_agent import DebateAgent
from backend.core.debate_log import log_debate_entry
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.core.loader import load_and_split
from backend.core.models import get_openai_client, get_tokenizer
from backend.core.prompts import RAG_PROMPT, INSIGHT_PROMPT, SQL_PROMPT
from backend.core.utils import clean_string_for_storing
from backend.core.logging import usage_tracker, logger
from fastapi.responses import JSONResponse
from fastapi.requests import Request as FastAPIRequest
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import RequestValidationError as FastAPIRequestValidationError
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response

# --- API Metadata ---
app = FastAPI(
    title="Enterprise Insights Copilot API",
    description="Conversational BI backend with LLM, RAG, and multi-retriever support.",
    version="1.0.0"
)

# --- CORS & Security ---
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
app.add_middleware(SecurityHeadersMiddleware)

# --- Logging Configuration ---
logger = logging.getLogger("fastapi_app")
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')

# --- Request/Response Logging Middleware ---
@app.middleware("http")
async def log_requests(request: FastAPIRequest, call_next):
    logger.info(f"Request: {request.method} {request.url}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"[EXCEPTION] {e}\n{tb}")
        return JSONResponse(status_code=500, content={"detail": f"Internal server error: {e}"})

@app.exception_handler(FastAPIRequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"[VALIDATION ERROR] {exc}")
    return JSONResponse(status_code=422, content={"detail": str(exc)})

# --- Centralized Exception Handling ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": str(exc)}
    )

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()}
    )

# --- Health & Readiness Endpoints ---
@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/ready")
def ready():
    # Optionally check vector DB, LLM, etc.
    return {"status": "ready"}

# --- API Versioning Helper ---
from fastapi import APIRouter
api_v1 = APIRouter(prefix="/api/v1")


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


# Helper to extract user/session id (stub: replace with real auth/session logic)
def get_user_id(request: Request):
    return request.headers.get("X-User-Id", "anonymous")


@app.post("/index")
async def index_csv(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        print(f"[DEBUG] Received file: {file.filename}, size: {len(contents)} bytes")
        if not contents:
            raise ValueError("Uploaded file is empty.")
        # Save uploaded file to a cross-platform temp path
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, file.filename)
        with open(temp_path, "wb") as f:
            f.write(contents)
        # Use modular loader abstraction
        print(f"[DEBUG] Loading and splitting file: {temp_path}")
        docs = load_and_split(temp_path)
        print(f"[DEBUG] Loader returned {len(docs)} docs.")
        import json
        rows = []
        skipped = []
        for doc in docs:
            try:
                rows.append(json.loads(doc.page_content))
            except Exception as e:
                skipped.append(doc.page_content[:100])
        print(f"[DEBUG] Parsed {len(rows)} docs, skipped {len(skipped)} docs.")
        if skipped:
            print(f"[DEBUG] Sample skipped content: {skipped[:2]}")
        df = pd.DataFrame(rows)
        cleaner = DataCleanerAgent(df)
        df = cleaner.clean()
        print(f"[DEBUG] DataFrame shape after clean: {df.shape}")
        memory.update(df, file.filename)
        print(f"[DEBUG] memory.df is set: {memory.df is not None}, filename: {memory.filename}")
        ids = [f"{file.filename}_{idx}" for idx in df.index]
        texts = [row.to_json() for _, row in df.iterrows()]
        from backend.core.llm_rag import upsert_documents_batch
        upsert_documents_batch(ids, texts)
        print("[DEBUG] All rows batch upserted.")
        return {"status": "success", "rows_indexed": len(df)}
    except Exception as e:
        print(f"❌ Error in /index: {str(e)}")
        traceback.print_exc()
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


@app.post("/query")
async def query_rag(data: QueryInput, request: Request):
    df = memory.df
    if df is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    answer = run_rag(data.query)
    critique = CritiqueAgent(df.columns.tolist())
    eval_report = critique.evaluate(data.query, answer)
    # Log usage (stub: replace with real token/cost calculation)
    user_id = get_user_id(request)
    usage_tracker.log(user_id, tokens=100, cost=0.01)  # Example values
    return {"answer": answer, "evaluation": eval_report, "usage": usage_tracker.get_usage(user_id)}


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
    print(f"[DEBUG] /insights called. memory.df is None? {memory.df is None}")
    df = memory.df
    if df is None:
        from fastapi import HTTPException
        print("[DEBUG] No data uploaded in session for /insights.")
        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    agent = InsightAgent(df)
    result = agent.generate_summary()
    critique = CritiqueAgent(df.columns.tolist())
    eval_report = critique.evaluate("insights", result)
    print(f"[DEBUG] Insights generated: {result}")
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


@app.get("/")
def read_root():
    return {"message": "Enterprise Copilot API is running."}

# Move all endpoints to the versioned API router
@api_v1.post("/index")
async def index_csv_v1(file: UploadFile = File(...)):
    return await index_csv(file)

@api_v1.post("/query")
async def query_rag_v1(data: QueryInput, request: Request):
    return await query_rag(data, request)

@api_v1.post("/chart")
def chart_handler_v1(req: ChartRequest):
    return chart_handler(req)

@api_v1.post("/sql")
def sql_endpoint_v1(req: SQLQuery):
    return sql_endpoint(req)

@api_v1.post("/insights")
def generate_insights_v1(req: InsightRequest):
    return generate_insights(req)

@api_v1.post("/auto-chart")
def auto_chart_v1(req: QueryInput):
    return auto_chart(req)

@api_v1.post("/agentic")
def agentic_chain_v1(req: QueryInput):
    return agentic_chain(req)

@api_v1.post("/langgraph")
def run_graph_v1(req: QueryInput):
    return run_graph(req)

@api_v1.post("/report")
def generate_report_v1():
    return generate_report()

@api_v1.post("/debate")
def debate_mode_v1(req: QueryInput):
    return debate_mode(req)

# --- ENV Validation ---
REQUIRED_ENV_VARS = ["OPENAI_API_KEY", "PINECONE_API_KEY"]
for var in REQUIRED_ENV_VARS:
    if not os.getenv(var):
        raise RuntimeError(f"Missing required environment variable: {var}")

# --- Configurable Logging Level ---
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
logger.setLevel(getattr(logging, log_level, logging.INFO))

# --- Graceful Shutdown ---
@app.on_event("shutdown")
def shutdown_event():
    logger.info("Shutting down API and cleaning up resources...")
    # Optionally close DB/vector connections here

app.include_router(api_v1)

from fastapi.responses import PlainTextResponse

# --- Deprecation warning decorator ---
def deprecated_endpoint(func):
    async def wrapper(*args, **kwargs):
        logger.warning("[DEPRECATED] This endpoint will be removed in a future release. Please use /api/v1/ endpoints.")
        return await func(*args, **kwargs)
    return wrapper

# --- Unversioned endpoints now warn ---
@app.post("/index")
@deprecated_endpoint
def index_csv_deprecated(*args, **kwargs):
    return index_csv_v1(*args, **kwargs)

@app.post("/query")
@deprecated_endpoint
def query_rag_deprecated(*args, **kwargs):
    return query_rag_v1(*args, **kwargs)

@app.post("/chart")
@deprecated_endpoint
def chart_handler_deprecated(*args, **kwargs):
    return chart_handler_v1(*args, **kwargs)

@app.post("/sql")
@deprecated_endpoint
def sql_endpoint_deprecated(*args, **kwargs):
    return sql_endpoint_v1(*args, **kwargs)

@app.post("/insights")
@deprecated_endpoint
def generate_insights_deprecated(*args, **kwargs):
    return generate_insights_v1(*args, **kwargs)

@app.post("/auto-chart")
@deprecated_endpoint
def auto_chart_deprecated(*args, **kwargs):
    return auto_chart_v1(*args, **kwargs)

@app.post("/agentic")
@deprecated_endpoint
def agentic_chain_deprecated(*args, **kwargs):
    return agentic_chain_v1(*args, **kwargs)

@app.post("/langgraph")
@deprecated_endpoint
def run_graph_deprecated(*args, **kwargs):
    return run_graph_v1(*args, **kwargs)

@app.post("/report")
@deprecated_endpoint
def generate_report_deprecated(*args, **kwargs):
    return generate_report_v1(*args, **kwargs)

@app.post("/debate")
@deprecated_endpoint
def debate_mode_deprecated(*args, **kwargs):
    return debate_mode_v1(*args, **kwargs)

# --- Serve advanced docs as endpoint ---
@app.get("/docs/advanced", response_class=PlainTextResponse, tags=["docs"])
def advanced_docs():
    with open(os.path.join(PROJECT_ROOT, "enterprise_insights_copilot", "README_ADVANCED.md"), encoding="utf-8") as f:
        return f.read()

# --- Expose config/constants ---
@app.get("/config", tags=["config"])
def get_config():
    from config import constants
    return {k: getattr(constants, k) for k in dir(constants) if k.isupper()}

# --- Expose usage/cost metrics ---
@app.get("/metrics", tags=["metrics"])
def get_metrics():
    return usage_tracker.usage
