print("[DEBUG] Starting backend/main.py...")

"""
Enterprise Insights Copilot API - FastAPI backend entry point.
This module provides a conversational BI backend with LLM, RAG, and multi-retriever support.
It includes endpoints for data upload, indexing, querying, charting, SQL, insights, agentic flows,
multi-agent orchestration, reporting, and debate. It also features CORS/security middleware,
logging, Prometheus metrics, and session/user management.

Key Features:
-------------
- CSV and file upload with validation, cleaning, and indexing to vector store.
- Conversational querying using Retrieval-Augmented Generation (RAG).
- Chart generation and auto-charting via LLM-powered agents.
- SQL generation and execution with critique/evaluation.
- Automated insight generation using agentic orchestrators.
- Multi-agent orchestration (planner, retriever, analyst, critic, debate) via LangGraph.
- PDF report generation with insights and charts.
- Debate mode for multi-perspective analysis.
- User/session-aware uploads and memory.
- Prometheus metrics for monitoring.
- Centralized logging and exception handling.
- API key protection for sensitive endpoints.
- Debug endpoints for memory and vector store management.

Main Components:
----------------
- FastAPI app instance with CORS and security middleware.
- API routers for versioned endpoints.
- Data models for request validation (Pydantic).
- In-memory and session-based DataFrame storage.
- Integration with OpenAI, LangChain, and LangSmith for LLM and tracing.
- Modular agent classes for charting, SQL, insights, cleaning, critique, reporting, and debate.
- Utility functions for user/session extraction, logging, and audit.

Environment Variables:
----------------------
- OPENAI_API_KEY: Required for LLM access.
- ALLOWED_ORIGINS: CORS configuration.
- API_KEY: Optional, for protecting sensitive endpoints.

Endpoints Overview:
-------------------
- /api/v1/index: Upload and index CSV file.
- /api/v1/query: Query data using RAG.
- /api/v1/chart: Generate chart from data.
- /api/v1/sql: Generate and run SQL query.
- /api/v1/insights: Generate insights using agentic orchestrator.
- /api/v1/auto-chart: Auto-generate chart from query.
- /api/v1/agentic: Run agentic chain.
- /api/v1/agentic-flow: Run agentic flow (async).
- /api/v1/langgraph: Run multi-agent LangGraph flow.
- /api/v1/report: Generate PDF report.
- /api/v1/debate: Run debate agent.
- /api/v1/multiagent-query: Orchestrate multi-agent pipeline.
- /multiagent: Run multi-agent flow (non-versioned).
- /upload, /user-upload: File upload endpoints with audit logging.
- /ask: Ask question using current in-memory DataFrame.
- /debug/memory_df: Debug endpoint for current DataFrame.
- /reset_index: Clear vector store.
- /generate-report: Generate insight report and suggest categorical columns.
- /generate-chart: Generate chart data for a categorical column.

Middleware:
-----------
- CORS and security headers.
- Request/response logging.
- Prometheus metrics.
- User/session ID extraction.

Exception Handling:
-------------------
- Centralized handlers for HTTP and validation errors.

Logging:
--------
- Structured logging for requests, uploads, queries, and errors.
- Audit logging for file uploads and user actions.

Tracing:
--------
- LangSmith/LangChain tracing enabled for agentic flows.

Note:
-----
- This file is intended to be run as the main FastAPI app entry point.
- Some endpoints and agent logic require additional modules (see imports).
- For production, ensure environment variables and API keys are securely managed.
"""

# FastAPI app runner entry point

import sys
import os
import pandas as pd
import numpy as np
import json
import time
import tempfile
import traceback
import logging
from dotenv import load_dotenv
from io import StringIO
from fastapi import status, HTTPException
from typing import Any, Dict, List, Optional

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
from backend.agentic.orchestrator import agentic_flow
import altair as alt
from backend.core.session_memory import memory, session_memory
from backend.agents.critique_agent import CritiqueAgent
from backend.agents.report_generator import ReportGenerator
from fastapi.responses import FileResponse
from backend.agents.debate_agent import DebateAgent
from backend.core.debate_log import log_debate_entry
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.core.loader import load_and_split, get_user_data_dir
from backend.core.models import get_openai_client, get_tokenizer
from backend.core.prompts import RAG_PROMPT, INSIGHT_PROMPT, SQL_PROMPT
from backend.core.utils import clean_string_for_storing
from backend.core.logging import usage_tracker, logger, audit_log
from fastapi.responses import JSONResponse
from fastapi.requests import Request as FastAPIRequest
from fastapi.exception_handlers import RequestValidationError
from fastapi.exceptions import RequestValidationError as FastAPIRequestValidationError
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request as StarletteRequest
from starlette.responses import Response
from langchain.callbacks.tracers import LangChainTracer
from backend.agentic.graph_flow import build_graph
from backend.agentic.langgraph_flow import run_multiagent_flow
from config.config import get_env_var

# --- API Metadata ---
app = FastAPI(
    title="Enterprise Insights Copilot API",
    description="Conversational BI backend with LLM, RAG, and multi-retriever support.",
    version="1.0.0",
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
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")


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
        return JSONResponse(
            status_code=500, content={"detail": f"Internal server error: {e}"}
        )


@app.exception_handler(FastAPIRequestValidationError)
async def validation_exception_handler(request, exc):
    logger.error(f"[VALIDATION ERROR] {exc}")
    return JSONResponse(status_code=422, content={"detail": str(exc)})


# --- Centralized Exception Handling ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={"detail": str(exc)}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


# --- Health & Readiness Endpoints ---
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/healthz")
def health_check():
    return {"status": "ok"}


@app.get("/ready")
def ready():
    # Optionally check vector DB, LLM, etc.
    return {"status": "ready"}


# --- API Versioning Helper ---
from fastapi import APIRouter

api_v1 = APIRouter(prefix="/api/v1")


class QueryInput(BaseModel):
    """Input model for /query and similar endpoints."""

    query: str


class ChartRequest(BaseModel):
    """Input model for /chart endpoint."""

    x: str
    y: str
    chart_type: str
    data: list[Any]


class SQLQuery(BaseModel):
    """Input model for /sql endpoint."""

    query: str
    data: list[Any]


class InsightRequest(BaseModel):
    """Input model for /insights endpoint."""

    data: list[Any]


# Helper to extract user/session id (stub: replace with real auth/session logic)
def get_user_id(request: Request) -> str:
    """
    Extract the user ID from the request headers. Defaults to 'anonymous'.
    Args:
        request (Request): The FastAPI request object.
    Returns:
        str: The user ID.
    """
    return request.headers.get("X-User-Id", "anonymous")


OPENAI_API_KEY = get_env_var("OPENAI_API_KEY", required=True)


try:
    from prometheus_client import Counter, Histogram, start_http_server

    REQUEST_COUNT = Counter('api_requests_total', 'Total API Requests', ['endpoint'])
    REQUEST_LATENCY = Histogram('api_request_latency_seconds', 'API Request Latency', ['endpoint'])
    start_http_server(8001)  # Prometheus metrics on :8001

    # Example FastAPI middleware for metrics
    from fastapi import Request as FastAPIRequest
    from starlette.middleware.base import BaseHTTPMiddleware

    class MetricsMiddleware(BaseHTTPMiddleware):
        async def dispatch(self, request: FastAPIRequest, call_next):
            endpoint = request.url.path
            REQUEST_COUNT.labels(endpoint=endpoint).inc()
            start = time.time()
            response = await call_next(request)
            latency = time.time() - start
            REQUEST_LATENCY.labels(endpoint=endpoint).observe(latency)
            return response

    app.add_middleware(MetricsMiddleware)
except ImportError:
    print("[INFO] prometheus_client not installed, metrics disabled.")


@api_v1.post("/index")
async def index_csv(file: UploadFile = File(...)) -> Any:
    """
    Upload and index a CSV file. Returns success or actionable error message.
    Args:
        file (UploadFile): The uploaded CSV file.
    Returns:
        dict: Status and indexing info.
    Raises:
        HTTPException: If file is empty, too large, or processing fails.
    """
    import time
    import psutil

    start_time = time.time()
    process = psutil.Process(os.getpid())
    try:
        contents = await file.read()
        file_size = len(contents)
        logger.info(f"[UPLOAD] Received file: {file.filename}, size: {file_size} bytes")
        if not contents:
            raise HTTPException(
                status_code=400, detail="Upload a valid CSV file (file is empty)."
            )
        # File size limit (10MB)
        MAX_SIZE = 10 * 1024 * 1024
        if file_size > MAX_SIZE:
            logger.warning(
                f"[UPLOAD] File too large: {file_size} bytes > {MAX_SIZE} bytes"
            )
            raise HTTPException(
                status_code=413,
                detail=f"File too large (> {MAX_SIZE//1024//1024}MB). Please upload a smaller file.",
            )
        # Save uploaded file to a cross-platform temp path with original extension
        import uuid

        filename = file.filename or f"upload_{uuid.uuid4()}.csv"
        suffix = os.path.splitext(filename)[1] or ".csv"
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"upload_{uuid.uuid4()}{suffix}")
        logger.info(f"[UPLOAD] Saving file to temp path: {temp_path}")
        with open(temp_path, "wb") as f:
            f.write(contents)
        # Use modular loader abstraction
        logger.info(f"[UPLOAD] Loading and splitting file: {temp_path}")
        docs = load_and_split(temp_path)
        logger.info(f"[UPLOAD] Loader returned {len(docs)} docs.")
        
        rows = []
        skipped = []
        for doc in docs:
            try:
                rows.append(json.loads(doc.page_content))
            except Exception as e:
                logger.warning(f"[UPLOAD] Failed to parse row: {str(e)[:200]}")
                skipped.append(doc.page_content[:100])
                
        logger.info(f"[UPLOAD] Parsed {len(rows)} docs, skipped {len(skipped)} docs.")
        if skipped:
            logger.info(f"[UPLOAD] Sample skipped content: {skipped[:2]}")
        if not rows:
            logger.error("[UPLOAD] No valid rows found in the uploaded file")
            raise HTTPException(
                status_code=400,
                detail="No valid rows found in CSV. Please check the file format and try again.",
            )
        df = pd.DataFrame(rows)
        if df.empty:
            raise HTTPException(
                status_code=400, detail="Uploaded CSV contains no data rows."
            )
        cleaner = DataCleanerAgent(df)
        df = cleaner.clean()
        logger.info(f"[UPLOAD] DataFrame shape after clean: {df.shape}")
        memory.update(df, file.filename)
        logger.info(
            f"[UPLOAD] memory.df is set: {memory.df is not None}, filename: {memory.filename}"
        )
        ids = [f"{file.filename}_{idx}" for idx in df.index]
        texts = [row.to_json() for _, row in df.iterrows()]
        from backend.core.llm_rag import upsert_documents_batch

        # Use parallelized upsert with higher max_workers to test limits
        try:
            upsert_documents_batch(ids, texts, batch_size=100, max_workers=16)
            logger.info("[UPLOAD] All rows batch upserted.")
            upsert_warning = None
        except Exception as upsert_exc:
            logger.error(f"[UPLOAD] Error during parallel upsert: {upsert_exc}")
            logger.error(traceback.format_exc())
            upsert_warning = (
                "Some or all rows failed to index due to system or API limits. "
                "Try a smaller file or contact support if this persists."
            )
        elapsed = time.time() - start_time
        mem_mb = process.memory_info().rss / 1024 / 1024
        logger.info(
            f"[UPLOAD] Completed in {elapsed:.2f}s, memory usage: {mem_mb:.2f} MB"
        )
        response = {
            "status": "success",
            "rows_indexed": len(df),
            "elapsed": elapsed,
            "mem_mb": mem_mb,
        }
        # Add DataFrame preview (first 5 rows and columns)
        preview_df = df.head(5)
        response["preview"] = {
            "columns": list(preview_df.columns),
            "rows": preview_df.to_dict(orient="records")
        }
        if upsert_warning:
            response["warning"] = upsert_warning
        return response
    except HTTPException:
        raise
    except Exception as e:
        elapsed = time.time() - start_time
        mem_mb = process.memory_info().rss / 1024 / 1024
        logger.error(
            f"❌ Error in /index: {str(e)} | Elapsed: {elapsed:.2f}s | Mem: {mem_mb:.2f} MB"
        )
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


@api_v1.post("/query")
async def query_rag(data: QueryInput, request: Request):
    logger.info(f"[QUERY] /query called with data: {data}")
    df = memory.df
    if df is None:
        logger.error("[QUERY] No data uploaded in session.")
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    try:
        answer = run_rag(data.query)
        logger.info(f"[QUERY] RAG answer: {answer}")
        critique = CritiqueAgent(df.columns.tolist())
        eval_report = critique.evaluate(data.query, answer)
        logger.info(f"[QUERY] Critique: {eval_report}")
        user_id = get_user_id(request)
        usage_tracker.log(user_id, tokens=100, cost=0.01)
        logger.info(f"[QUERY] Usage logged for user {user_id}")
        return {
            "answer": answer,
            "evaluation": eval_report,
            "usage": usage_tracker.get_usage(user_id),
        }
    except Exception as e:
        logger.error(f"[QUERY] Exception: {e}")
        logger.error(traceback.format_exc())
        from fastapi import HTTPException

        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")


@api_v1.post("/chart")
def chart_handler(req: ChartRequest):
    logger.info(f"[CHART] /chart called with req: {req}")
    df = memory.df
    if df is None:
        logger.error("[CHART] No data uploaded in session.")
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    try:
        agent = ChartAgent(df)
        chart = agent.render_chart(req.x, req.y, req.chart_type)
        logger.info(
            f"[CHART] Chart generated for x={req.x}, y={req.y}, type={req.chart_type}"
        )
        return {"chart": chart.to_json()}
    except Exception as e:
        logger.error(f"[CHART] Exception: {e}")
        logger.error(traceback.format_exc())
        from fastapi import HTTPException

        raise HTTPException(status_code=500, detail=f"Chart failed: {str(e)}")


@api_v1.post("/sql")
def sql_endpoint(req: SQLQuery):
    logger.info(f"[SQL] /sql called with req: {req}")
    df = memory.df
    if df is None:
        logger.error("[SQL] No data uploaded in session.")
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    agent = SQLAgent(df)
    sql = agent.generate_sql(req.query)
    logger.info(f"[SQL] Generated SQL: {sql}")
    try:
        result = agent.run_sql(sql)
        logger.info(f"[SQL] SQL executed successfully.")
        result_string = result.to_markdown()
        critique = CritiqueAgent(df.columns.tolist())
        eval_report = critique.evaluate(req.query, result_string)
        logger.info(f"[SQL] Critique: {eval_report}")
        return {
            "sql": sql,
            "result": result.to_dict(orient="records"),
            "evaluation": eval_report,
        }
    except Exception as e:
        logger.error(f"[SQL] Exception: {e}")
        logger.error(traceback.format_exc())
        return {"error": str(e), "sql": sql}


@api_v1.post("/insights")
def generate_insights(req: InsightRequest):
    logger.info(f"[INSIGHTS] /insights called. memory.df is None? {memory.df is None}")
    df = memory.df
    if df is None:
        logger.error("[INSIGHTS] No data uploaded in session.")
        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    try:
        # Use agentic orchestrator for insights
        from backend.agentic.orchestrator import AgenticOrchestrator

        orchestrator = AgenticOrchestrator()
        results = orchestrator.run("insights", df)
        logger.info(f"[INSIGHTS] Agentic orchestrator results: {results}")
        return {"steps": results}
    except Exception as e:
        logger.error(f"[INSIGHTS] Exception: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Insights failed: {str(e)}")


@api_v1.post("/auto-chart")
def auto_chart(req: QueryInput):
    logger.info(f"[AUTO-CHART] /auto-chart called with req: {req}")
    if memory.df is None:
        logger.error("[AUTO-CHART] No data in session.")
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="No data in session.")
    try:
        query = req.query
        df = memory.df
        agent = ChartAgent(df)
        chart_type = agent.guess_chart_llm(query)
        x, y = agent.guess_axes()
        chart = agent.render_chart(x, y, chart_type)
        logger.info(f"[AUTO-CHART] Chart generated: type={chart_type}, x={x}, y={y}")
        if chart_type == "table":
            return {
                "chart_type": "table",
                "columns": chart["columns"],
                "data": chart["data"]
            }
        else:
            # chart is already a dict with all required fields
            return chart
    except Exception as e:
        logger.error(f"[AUTO-CHART] Exception: {e}")
        logger.error(traceback.format_exc())
        from fastapi import HTTPException

        raise HTTPException(status_code=500, detail=f"Auto-chart failed: {str(e)}")


@api_v1.post("/agentic")
def agentic_chain(req: QueryInput):
    logger.info(f"[AGENTIC] /agentic called with req: {req}")
    try:
        agent = get_agent_executor()
        result = agent.run(req.query)
        logger.info(f"[AGENTIC] Result: {result}")
        return {"response": result}
    except Exception as e:
        logger.error(f"[AGENTIC] Exception: {e}")
        logger.error(traceback.format_exc())
        from fastapi import HTTPException

        raise HTTPException(status_code=500, detail=f"Agentic chain failed: {str(e)}")


@api_v1.post("/agentic-flow")
async def run_agentic_flow(request: Request):
    body = await request.json()
    user_query = body["query"]
    df = memory.df
    if df is None:
        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    from backend.agentic.orchestrator import agentic_flow
    # LangChainTracer does not have start_trace; use as a callback if supported, else just call agentic_flow
    result = agentic_flow(user_query, df)
    return result


@api_v1.post("/langgraph")
def run_graph(req: QueryInput):
    logger.info(f"[LANGGRAPH] /langgraph called with req: {req}")
    user_id = "default"  # You can sessionize this later
    if user_id not in session_memory:
        session_memory[user_id] = []
    try:
        graph = build_graph()
        state = graph.invoke(
            {
                "query": req.query,
                "result": "",
                "steps": [],
                "history": session_memory[user_id],
            }
        )
        session_memory[user_id] = state["history"]
        logger.info(f"[LANGGRAPH] Steps: {state['steps']}, Output: {state['result']}")
        return {"steps": state["steps"], "output": state["result"]}
    except Exception as e:
        logger.error(f"[LANGGRAPH] Exception: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Langgraph failed: {str(e)}")


@api_v1.post("/report")
def generate_report():
    logger.info("[REPORT] /report called.")
    df = memory.df
    if df is None:
        logger.error("[REPORT] No data uploaded.")
        from fastapi import HTTPException

        raise HTTPException(status_code=400, detail="No data uploaded")
    try:
        insight = InsightAgent(df).generate_summary()
        logger.info(f"[REPORT] Insight: {insight}")
        report = ReportGenerator()
        report.add_title()
        report.add_insight_section(insight)
        chart_path = "logs/last_chart.png"
        if os.path.exists(chart_path):
            report.add_chart(chart_path)
            logger.info(f"[REPORT] Chart added from {chart_path}")
        report_path = "logs/report.pdf"
        report.save(report_path)
        logger.info(f"[REPORT] Report saved to {report_path}")
        return FileResponse(
            report_path, media_type="application/pdf", filename="insight_report.pdf"
        )
    except Exception as e:
        logger.error(f"[REPORT] Exception: {e}")
        logger.error(traceback.format_exc())
        from fastapi import HTTPException

        raise HTTPException(status_code=500, detail=f"Report failed: {str(e)}")


@api_v1.post("/debate")
def debate_mode(req: QueryInput):
    logger.info(f"[DEBATE] /debate called with req: {req}")
    try:
        df = memory.df
        if df is None:
            logger.error("[DEBATE] No data uploaded.")
            raise HTTPException(status_code=400, detail="No data uploaded")
        agent = DebateAgent(df)
        result = agent.run_debate(req.query)
        logger.info(f"[DEBATE] Result: {result}")
        log_debate_entry(
            req.query,
            result["responses"],
            result["evaluations"],
            result["decision"],
        )
        logger.info("[DEBATE] Debate entry logged.")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[DEBATE] Exception: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Debate failed: {str(e)}")


@api_v1.post("/multiagent-query")
async def multiagent_query(request: Request):
    """
    Orchestrate planner, retriever, analyst, critic, and debate agents in a single pipeline using LangGraph.
    Expects JSON: {"query": str, "session_id": str (optional)}
    Returns: {"result": ...}
    """
    try:
        data = await request.json()
        query = data.get("query")
        session_id = data.get("session_id", "default")
        if not query:
            raise HTTPException(status_code=400, detail="Missing 'query' in request body.")
        # Use session memory for history if available
        if session_id not in session_memory:
            session_memory[session_id] = []
        graph = build_graph()
        state = graph.invoke({
            "query": query,
            "result": "",
            "steps": [],
            "history": session_memory[session_id],
        })
        session_memory[session_id] = state.get("history", [])
        return {"steps": state.get("steps", []), "result": state.get("result", "")}
    except Exception as e:
        logger.error(f"[MULTIAGENT-QUERY] Exception: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Multiagent flow failed: {str(e)}")


@app.post("/multiagent")
async def multiagent_api(request: Request):
    body = await request.json()
    query = body["query"]
    # For demo: use memory.df or pass dummy data
    data = memory.df if hasattr(memory, 'df') and memory.df is not None else {}
    result = run_multiagent_flow(query, data)
    return result


# --- LangSmith/LangChain Tracing Setup ---
import os

os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_ENDPOINT"] = "https://api.smith.langchain.com"
os.environ["LANGSMITH_API_KEY"] = "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"
os.environ["LANGSMITH_PROJECT"] = "aiagent"

tracer = LangChainTracer(project_name="EnterpriseInsightsCopilot")

app.include_router(api_v1)

from fastapi import Depends
from fastapi.security import APIKeyHeader
API_KEY = os.getenv("API_KEY")
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def get_api_key(api_key: str = Depends(api_key_header)):
    if API_KEY and api_key != API_KEY:
        raise HTTPException(status_code=403, detail="Invalid or missing API key.")
    return api_key


# Example: protect sensitive endpoints
@app.post("/secure-agentic")
async def secure_agentic(request: Request, api_key: str = Depends(get_api_key)):
    # ...existing agentic logic...
    return {"status": "ok"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...), user: str = None):
    """
    Upload a file and log the upload event.
    Args:
        file (UploadFile): The file to upload.
        user (str, optional): The user ID, extracted from request headers.
    Returns:
        dict: Status message.
    Raises:
        HTTPException: If file is empty or too large.
    """
    import time
    import psutil

    start_time = time.time()
    process = psutil.Process(os.getpid())
    try:
        contents = await file.read()
        file_size = len(contents)
        logger.info(f"[UPLOAD] Received file: {file.filename}, size: {file_size} bytes")
        if not contents:
            raise HTTPException(
                status_code=400, detail="Upload a valid file (file is empty)."
            )
        # File size limit (10MB)
        MAX_SIZE = 10 * 1024 * 1024
        if file_size > MAX_SIZE:
            logger.warning(
                f"[UPLOAD] File too large: {file_size} bytes > {MAX_SIZE} bytes"
            )
            raise HTTPException(
                status_code=413,
                detail=f"File too large (> {MAX_SIZE//1024//1024}MB). Please upload a smaller file.",
            )
        # Save uploaded file to a cross-platform temp path with original extension
        import uuid

        filename = file.filename or f"upload_{uuid.uuid4()}"
        suffix = os.path.splitext(filename)[1] or ""
        temp_dir = tempfile.gettempdir()
        temp_path = os.path.join(temp_dir, f"upload_{uuid.uuid4()}{suffix}")
        logger.info(f"[UPLOAD] Saving file to temp path: {temp_path}")
        with open(temp_path, "wb") as f:
            f.write(contents)
        # Log the file upload to audit log
        audit_log("file_upload", user=user, details={"filename": file.filename})
        elapsed = time.time() - start_time
        mem_mb = process.memory_info().rss / 1024 / 1024
        logger.info(
            f"[UPLOAD] File uploaded and logged in {elapsed:.2f}s, memory usage: {mem_mb:.2f} MB"
        )
        return {"status": "uploaded"}
    except HTTPException:
        raise
    except Exception as e:
        elapsed = time.time() - start_time
        mem_mb = process.memory_info().rss / 1024 / 1024
        logger.error(
            f"❌ Error in /upload: {str(e)} | Elapsed: {elapsed:.2f}s | Mem: {mem_mb:.2f} MB"
        )
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")


@app.middleware("http")
async def add_user_id_to_request(request: Request, call_next):
    user_id = request.headers.get("X-User-Id", "anonymous")
    request.state.user_id = user_id
    response = await call_next(request)
    return response


@app.post("/user-upload")
async def user_upload(file: UploadFile = File(...), request: Request = None):
    user_id = request.state.user_id if request else "anonymous"
    user_dir = get_user_data_dir(user_id)
    file_path = os.path.join(user_dir, file.filename)
    with open(file_path, "wb") as f:
        f.write(await file.read())
    audit_log("user_file_upload", user=user_id, details={"filename": file.filename})
    return {"status": "uploaded", "user": user_id}


from pydantic import BaseModel

class QueryRequest(BaseModel):
    query: str

@app.post("/ask")
def ask(query_req: QueryRequest):
    # Use only the current in-memory DataFrame for context
    import pandas as pd
    from backend.core.models import get_openai_client
    df = memory.df
    if df is None or df.empty:
        return {"answer": "No data uploaded."}
    # For summary, show a sample of the data
    context = df.head(10).to_csv(index=False)
    prompt = f"You are an HR data assistant. Here is the data:\n{context}\n\nUser question: {query_req.query}\n\nAnswer:"
    client = get_openai_client()
    completion = client.chat.completions.create(
        model="gpt-4", messages=[{"role": "user", "content": prompt}]
    )
    return {"answer": completion.choices[0].message.content.strip()}


@app.get("/debug/memory_df")
def debug_memory_df():
    """Return the current in-memory DataFrame as JSON for debugging."""
    if memory.df is not None:
        return memory.df.to_dict(orient="records")
    return {"error": "No data loaded."}


@app.post("/reset_index")
def reset_index():
    """Clear the vector store (for new upload or debugging)."""
    from backend.core.llm_rag import vector_store
    vector_store.clear()
    return {"status": "cleared"}


class ChartRequest(BaseModel):
    chart_type: str = "bar"
    column: str = "Department"

@app.post("/generate-report")
def generate_report():
    df = memory.df
    if df is None or df.empty:
        return {"report": "No data loaded.", "top_categorical": []}
    # Use InsightAgent to generate a summary/insight
    from backend.agents.insight_agent import InsightAgent
    try:
        insight = InsightAgent(df).generate_summary()
    except Exception as e:
        insight = f"Auto-insight failed: {e}"
    # Find top 3 categorical columns by unique value count (excluding columns with too many unique values)
    cat_cols = df.select_dtypes(include=["object", "category"]).columns
    col_uniques = [(col, df[col].nunique()) for col in cat_cols]
    filtered = [(col, n) for col, n in col_uniques if n > 1 and n <= 30]
    filtered.sort(key=lambda x: (-x[1], x[0]))
    top_categorical = [col for col, _ in filtered[:3]]
    return {
        "report": insight,
        "top_categorical": top_categorical,
    }

@app.post("/generate-chart")
def generate_chart(req: ChartRequest):
    df = memory.df
    if df is None or df.empty:
        return {"labels": [], "values": []}
    counts = df[req.column].value_counts().to_dict()
    return {"labels": list(counts.keys()), "values": list(counts.values())}
