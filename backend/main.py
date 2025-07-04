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
# Use the fixed langgraph flow
from backend.agentic.langgraph_flow_fixed import run_multiagent_flow
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
# Use our fixed langgraph flow file
from backend.agentic.langgraph_flow_fixed import run_multiagent_flow
from config.config import get_env_var

# --- API Metadata ---
app = FastAPI(
    title="Enterprise Insights Copilot API",
    description="Conversational BI backend with LLM, RAG, and multi-retriever support.",
    version="1.0.0",
)

# --- CORS & Security ---
ALLOWED_ORIGINS = get_env_var("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8501").split(",")
# Remove any empty strings and strip whitespace
ALLOWED_ORIGINS = [origin.strip() for origin in ALLOWED_ORIGINS if origin.strip()]

# More restrictive CORS for production security
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
    expose_headers=["X-Total-Count", "X-Request-ID"],
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: StarletteRequest, call_next):
        response: Response = await call_next(request)
        # Enhanced security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        response.headers["X-Request-ID"] = f"req-{int(time.time())}-{hash(request.url)}"
        return response


app.add_middleware(SecurityHeadersMiddleware)

# --- Logging Configuration ---
LOG_LEVEL = get_env_var("LOG_LEVEL", "INFO")
logger = logging.getLogger("fastapi_app")
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL.upper()),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)


# --- Request/Response Logging Middleware ---
@app.middleware("http")
async def log_requests(request: FastAPIRequest, call_next):
    start_time = time.time()
    request_id = f"req-{int(start_time)}-{hash(str(request.url))}"
    logger.info(f"[{request_id}] {request.method} {request.url}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"[{request_id}] Response: {response.status_code} ({process_time:.3f}s)")
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as e:
        process_time = time.time() - start_time
        tb = traceback.format_exc()
        logger.error(f"[{request_id}] EXCEPTION ({process_time:.3f}s): {e}\n{tb}")
        return JSONResponse(
            status_code=500, 
            content={
                "error": "Internal Server Error",
                "message": "An unexpected error occurred",
                "request_id": request_id,
                "timestamp": int(time.time())
            }
        )


@app.exception_handler(FastAPIRequestValidationError)
async def validation_exception_handler(request, exc):
    logger.warning(f"Validation error on {request.method} {request.url}: {exc}")
    return JSONResponse(
        status_code=422, 
        content={
            "error": "Validation Error",
            "message": "Request validation failed",
            "details": str(exc),
            "timestamp": int(time.time())
        }
    )


# --- Centralized Exception Handling ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, 'request_id', 'unknown')
    logger.error(f"[{request_id}] Unhandled error on {request.method} {request.url}: {exc}")
    logger.error(traceback.format_exc())
    
    # Don't expose internal error details in production
    is_debug = get_env_var("DEBUG", "false").lower() == "true"
    error_detail = str(exc) if is_debug else "An internal server error occurred"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
        content={
            "error": "Internal Server Error",
            "message": error_detail,
            "request_id": request_id,
            "timestamp": int(time.time())
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Request validation error on {request.method} {request.url}: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Request Validation Error",
            "message": "Invalid request data",
            "details": exc.errors(),
            "timestamp": int(time.time())
        },
    )


# --- Health & Readiness Endpoints ---
@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/healthz")
def health_check():
    return {"status": "ok"}


@app.get('/healthcheck')
async def healthcheck():
    """
    Simple health check endpoint to verify that the server is running.
    Returns: {"status": "healthy", "timestamp": current_time}
    """
    return {"status": "healthy", "timestamp": int(time.time())}


@app.get("/ready")
def ready():
    # Optionally check vector DB, LLM, etc.
    return {"status": "ready"}


# --- API Versioning Helper ---
from fastapi import APIRouter

# Define API v1 router
api_v1 = APIRouter(prefix="/api/v1")

# Register the API endpoints with the router
@api_v1.get("/agent-status")
async def get_agent_status(request: Request):
    """
    Get the current status of all agents for a particular session.
    Optional query param: session_id (defaults to "default")
    Returns: {"agents": List[Dict]}
    """
    try:
        from backend.core.agent_status import get_agent_statuses
        
        session_id = request.query_params.get("session_id", "default")
        agent_statuses = get_agent_statuses(session_id)
        
        # Debug log the agent statuses for troubleshooting
        logger.info(f"[AGENT-STATUS] Returning agent statuses: {agent_statuses}")
        
        # Ensure we have the Data Cleaner agent with cleaning results
        cleaner_agents = [agent for agent in agent_statuses if agent.get('type') == 'cleaner']
        
        # If we have a Data Cleaner without cleaningResult, try to recreate it (happens during development/testing)
        if cleaner_agents and not any('cleaningResult' in agent for agent in cleaner_agents):
            logger.warning("[AGENT-STATUS] Data Cleaner without cleaningResult found, recreating status")
            
            # This is a fallback - in production, real data should be tracked
            # You would normally remove this block when the issue is fixed
            try:
                # This is where you could regenerate all statuses if needed
                pass
            except Exception as recreate_error:
                logger.error(f"[AGENT-STATUS] Failed to recreate cleaner status: {recreate_error}")
                
        return {"agents": agent_statuses}
    except Exception as e:
        logger.error(f"[AGENT-STATUS] Exception: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to retrieve agent status: {str(e)}")


@api_v1.post("/reset-agent-status")
async def reset_agent_status(request: Request):
    """
    Reset/clear agent status for a particular session.
    Expects JSON: {"session_id": str (optional)}
    Returns: {"status": "success"}
    """
    try:
        from backend.core.agent_status import clear_agent_statuses
        
        data = await request.json()
        session_id = data.get("session_id", "default")
        clear_agent_statuses(session_id)
        
        return {"status": "success", "message": f"Agent statuses cleared for session {session_id}"}
    except Exception as e:
        logger.error(f"[RESET-AGENT-STATUS] Exception: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to reset agent status: {str(e)}")


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
        dict: Status and indexing info.    Raises:
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
        # File size limit from environment variable (default 10MB)
        MAX_SIZE_MB = int(get_env_var("MAX_FILE_SIZE_MB", "10"))
        MAX_SIZE = MAX_SIZE_MB * 1024 * 1024
        if file_size > MAX_SIZE:
            logger.warning(
                f"[UPLOAD] File too large: {file_size} bytes > {MAX_SIZE} bytes"
            )
            raise HTTPException(
                status_code=413,
                detail=f"File too large (> {MAX_SIZE_MB}MB). Please upload a smaller file.",
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
        result = cleaner._execute("", df)  # Use _execute to get the full result dict
        df = result["cleaned_data"]
        
        # Store the cleaner results in agent status
        from backend.core.agent_status import update_agent_status
        session_id = "default"  # Use request's session ID if available
        
        # Prepare cleaning results for the frontend - include detailed_results
        cleaning_result = {
            "operations": result["operations"],
            "cleaning_stats": result["cleaning_stats"],
            "detailed_results": result.get("detailed_results", {})
        }
        
        # Log detailed cleaning results for debugging
        logger.info(f"[UPLOAD] Real cleaning operations: {result['operations']}")
        logger.info(f"[UPLOAD] Cleaning stats: {result['cleaning_stats']}")
        logger.info(f"[UPLOAD] Detailed results present: {True if result.get('detailed_results') else False}")
        
        # Update the agent status with real cleaning results
        update_agent_status(
            session_id=session_id,
            agent_name="Data Cleaner",
            status="complete",
            agent_type="cleaner",
            message="Data cleaning completed successfully",
            additional_data={"cleaningResult": cleaning_result}
        )
        
        # Log agent status update for debugging
        from backend.core.agent_status import get_agent_statuses
        agent_statuses = get_agent_statuses(session_id)
        logger.info(f"[UPLOAD] Updated agent statuses: {agent_statuses}")
        
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
        from backend.core.agent_status import clear_agent_statuses, update_agent_status
        from backend.agentic.langgraph_flow import run_multiagent_flow
        
        data = await request.json()
        query = data.get("query")
        session_id = data.get("session_id", "default")
        if not query:
            raise HTTPException(status_code=400, detail="Missing 'query' in request body.")
        
        # Reset agent statuses for this session
        clear_agent_statuses(session_id)
        
        # Initialize planning agent status
        update_agent_status(
            session_id=session_id,
            agent_name="Planning Agent",
            status="working",
            agent_type="planner",
            message="Analyzing query and deciding which agents to invoke"
        )
        
        # Use session memory for history if available
        if session_id not in session_memory:
            session_memory[session_id] = []
            
        # Use the multi-agent flow directly instead of rebuilding the graph
        result = run_multiagent_flow(
            query=query,
            data=memory.df if hasattr(memory, "df") else None,
            session_id=session_id
        )
        
        return {"steps": result.get("steps", []), "result": result.get("result", "")}
    except Exception as e:
        logger.error(f"[MULTIAGENT-QUERY] Exception: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Multiagent flow failed: {str(e)}")


@app.post("/multiagent")
async def multiagent_api(request: Request):
    body = await request.json()
    query = body["query"]
    session_id = body.get("session_id", "default")
    # For demo: use memory.df or pass an empty DataFrame
    import pandas as pd
    data = memory.df if hasattr(memory, 'df') and memory.df is not None else pd.DataFrame()
    
    # Clear and initialize agent status
    try:
        from backend.core.agent_status import clear_agent_statuses, update_agent_status
        clear_agent_statuses(session_id)
        update_agent_status(
            session_id=session_id,
            agent_name="Planning Agent",
            status="working",
            agent_type="planner",
            message="Analyzing query and deciding which agents to invoke"
        )
    except Exception as e:
        logger.error(f"Failed to initialize agent status: {e}")
    
    result = run_multiagent_flow(query, data, session_id)
    return result


# --- LangSmith/LangChain Tracing Setup ---
# Configure LangSmith tracing from environment variables
LANGSMITH_TRACING = get_env_var("LANGSMITH_TRACING", "false").lower() == "true"
if LANGSMITH_TRACING:
    LANGSMITH_ENDPOINT = get_env_var("LANGSMITH_ENDPOINT", "https://api.smith.langchain.com")
    LANGSMITH_API_KEY = get_env_var("LANGSMITH_API_KEY", required=False)
    LANGSMITH_PROJECT = get_env_var("LANGSMITH_PROJECT", "enterprise-insights-copilot")
    
    if LANGSMITH_API_KEY:
        os.environ["LANGSMITH_TRACING"] = "true"
        os.environ["LANGSMITH_ENDPOINT"] = LANGSMITH_ENDPOINT
        os.environ["LANGSMITH_API_KEY"] = LANGSMITH_API_KEY
        os.environ["LANGSMITH_PROJECT"] = LANGSMITH_PROJECT
        
        tracer = LangChainTracer(project_name=LANGSMITH_PROJECT)
        logger.info(f"[INIT] LangSmith tracing enabled for project: {LANGSMITH_PROJECT}")
    else:
        logger.warning("[INIT] LangSmith tracing requested but API key not provided")
else:
    logger.info("[INIT] LangSmith tracing disabled")

# Include the API v1 router
app.include_router(api_v1)

# --- API Key Security Configuration ---
from fastapi import Depends
from fastapi.security import APIKeyHeader

API_KEY = get_env_var("API_KEY", required=False)
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

def get_api_key(api_key: str = Depends(api_key_header)):
    """
    Validate API key for protected endpoints.
    If API_KEY is not set in environment, endpoints are unprotected.
    """
    if API_KEY and api_key != API_KEY:
        logger.warning(f"[SECURITY] Invalid API key attempt: {api_key[:8]}...")
        raise HTTPException(
            status_code=403, 
            detail={
                "error": "Forbidden",
                "message": "Invalid or missing API key",
                "timestamp": int(time.time())
            }
        )
    return api_key
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
        HTTPException: If file is empty or too large.    """
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
        # File size limit from environment variable (default 10MB)
        MAX_SIZE_MB = int(get_env_var("MAX_FILE_SIZE_MB", "10"))
        MAX_SIZE = MAX_SIZE_MB * 1024 * 1024
        if file_size > MAX_SIZE:
            logger.warning(
                f"[UPLOAD] File too large: {file_size} bytes > {MAX_SIZE} bytes"
            )
            raise HTTPException(
                status_code=413,
                detail=f"File too large (> {MAX_SIZE_MB}MB). Please upload a smaller file.",
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


@app.post("/load_csv_memory")
async def load_csv_memory(file: UploadFile = File(...)):
    """
    Load a CSV file directly into memory without saving it to disk
    
    Args:
        file (UploadFile): The CSV file to load
        
    Returns:
        dict: Status message with row count
    """
    try:
        contents = await file.read()
        if not contents:
            raise HTTPException(status_code=400, detail="Empty file")
            
        # Parse CSV with pandas
        import pandas as pd
        import io
        
        # Try to decode the CSV
        try:
            df = pd.read_csv(io.BytesIO(contents))
            logger.info(f"[LOAD_CSV] Successfully loaded DataFrame with shape: {df.shape}")
            
            # Store in memory for the agents to use
            from backend.core.session_memory import memory
            memory.df = df
            
            return {
                "status": "success",
                "rows": len(df),
                "columns": list(df.columns)
            }
        except Exception as e:
            logger.error(f"[LOAD_CSV] Failed to parse CSV: {e}")
            raise HTTPException(status_code=400, detail=f"Failed to parse CSV: {str(e)}")
            
    except Exception as e:
        logger.error(f"[LOAD_CSV] Error: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"CSV loading failed: {str(e)}")


@api_v1.get("/data-cleaner-results")
async def get_data_cleaner_results(request: Request):
    """
    Get the most recent Data Cleaner agent results.
    Optional query param: session_id (defaults to "default")
    Returns: {
        "operations": List of cleaning operations,
        "cleaning_stats": Statistics about the cleaning impact,
        "detailed_results": Detailed breakdown of cleaning operations
    }
    """
    logger.info(f"[DATA-CLEANER] Endpoint called with request: {request.query_params}")
    try:
        from backend.core.agent_status import get_agent_statuses
        import pandas as pd
        import traceback
        from backend.agents.data_cleaner_agent import DataCleanerAgent
        
        session_id = request.query_params.get("session_id", "default")
        logger.info(f"[DATA-CLEANER] Getting results for session_id: {session_id}")
        
        agent_statuses = get_agent_statuses(session_id)
        logger.info(f"[DATA-CLEANER] Found {len(agent_statuses)} total agents")
        
        # Find the Data Cleaner agent
        cleaner_agents = [agent for agent in agent_statuses if agent.get('type') == 'cleaner']
        logger.info(f"[DATA-CLEANER] Found {len(cleaner_agents)} cleaner agents")
        
        # First try to get results from agent status
        cleaning_result = {}
        if cleaner_agents:
            # Get the most recent Data Cleaner agent
            cleaner_agent = cleaner_agents[-1]
            logger.info(f"[DATA-CLEANER] Latest cleaner agent: {cleaner_agent.get('name')}, status: {cleaner_agent.get('status')}")
            
            # Look for cleaningResult or any similar property
            agent_data_keys = list(cleaner_agent.keys())
            logger.info(f"[DATA-CLEANER] Agent data keys: {agent_data_keys}")
            
            for key in cleaner_agent:
                if key.lower() == 'cleaningresult':
                    cleaning_result = cleaner_agent[key]
                    logger.info(f"[DATA-CLEANER] Found cleaning results in agent status with keys: {list(cleaning_result.keys()) if isinstance(cleaning_result, dict) else 'not a dict'}")
                    break
                    
        # If we don't have results from status, try to regenerate them if possible
        if (not cleaning_result or 
            not cleaning_result.get("operations") or 
            not cleaning_result.get("cleaning_stats")):
            
            logger.info(f"[DATA-CLEANER] No complete cleaning results found in agent status, trying to regenerate")
            
            # Let's check if we have data in memory from the file upload
            try:
                from backend.core.session_memory import memory
                
                memory_has_data = memory.df is not None and not memory.df.empty
                logger.info(f"[DATA-CLEANER] Memory check: has_data={memory_has_data}, " + 
                           f"filename={memory.filename}, " + 
                           f"shape={memory.df.shape if memory_has_data else 'None'}")
                
                if memory_has_data:
                    logger.info(f"[DATA-CLEANER] Regenerating results from memory DataFrame with shape: {memory.df.shape}")
                    
                    # Create a new cleaner instance and clean the data
                    try:
                        cleaner = DataCleanerAgent(memory.df)
                        logger.info(f"[DATA-CLEANER] Created DataCleanerAgent instance")
                        
                        result = cleaner._execute("", memory.df)
                        logger.info(f"[DATA-CLEANER] Executed cleaner with result keys: {list(result.keys())}")
                        
                        # Format cleaning results for the frontend including detailed results
                        cleaning_result = {
                            "operations": result["operations"],
                            "cleaning_stats": result["cleaning_stats"],
                            "detailed_results": result.get("detailed_results", {})
                        }
                        
                        logger.info(f"[DATA-CLEANER] Regenerated cleaning_result with {len(result['operations'])} operations, " + 
                                   f"{len(result['cleaning_stats'])} stats entries, and " + 
                                   f"detailed_results={True if result.get('detailed_results') else False}")
                        
                        # Log detailed information about what was performed
                        logger.info(f"[DATA-CLEANER] Cleaning operations performed: {len(result['operations'])}")
                        for op_type, count in result['cleaning_stats'].get('operations_by_type', {}).items():
                            logger.info(f"[DATA-CLEANER] {op_type}: {count} operations")
                            
                        if 'operation_details' in result['cleaning_stats']:
                            for op_type, details in result['cleaning_stats']['operation_details'].items():
                                logger.info(f"[DATA-CLEANER] {op_type} details: {details}")
                                
                            # Update the agent status with the enhanced results
                            from backend.core.agent_status import update_agent_status
                            update_agent_status(
                                session_id=session_id,
                                agent_name="Data Cleaner",
                                status="complete",
                                agent_type="cleaner",
                                message="Data cleaning completed with detailed results",
                                additional_data={"cleaningResult": cleaning_result}
                            )
                            
                            logger.info(f"[DATA-CLEANER] Generated enhanced cleaning results")
                    except Exception as cleaner_error:
                        logger.error(f"[DATA-CLEANER] Error generating cleaning results: {cleaner_error}")
                        logger.error(traceback.format_exc())
            except ImportError as e:
                logger.error(f"[DATA-CLEANER] Import error accessing memory: {e}")
                logger.error(traceback.format_exc())
                memory_has_data = False
                
            # Check if memory has data outside of the try-except blocks
            if not memory_has_data:
                logger.warning("[DATA-CLEANER] No data available in memory to clean")
        
        # If still no results, create minimal structure with detailed results placeholders
        if not cleaning_result:
            logger.warning(f"[DATA-CLEANER] No cleaning results found, returning empty structure")
            cleaning_result = {
                "operations": [],
                "cleaning_stats": {
                    "operations_count": 0,
                    "operations_by_type": {},
                    "columns_modified": [],
                    "rows_before": 0,
                    "rows_after": 0,
                    "row_count_change": 0,
                    "missing_values_before": 0,
                    "missing_values_after": 0,
                    "missing_values_change": 0
                },
                "detailed_results": {
                    "units_normalized": [],
                    "numeric_conversions": [],
                    "date_conversions": [],
                    "outliers_fixed": [],
                    "duplicates_removed": 0
                }
            }
        
        return cleaning_result
    except Exception as e:
        logger.error(f"[DATA-CLEANER] Exception: {e}")
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to retrieve data cleaner results: {str(e)}")
