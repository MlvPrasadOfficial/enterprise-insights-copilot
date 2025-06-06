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
from typing import Any

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
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Upload a valid CSV file (file is empty).")
        # File size limit (10MB)
        MAX_SIZE = 10 * 1024 * 1024
        if file_size > MAX_SIZE:
            logger.warning(f"[UPLOAD] File too large: {file_size} bytes > {MAX_SIZE} bytes")
            from fastapi import HTTPException
            raise HTTPException(status_code=413, detail=f"File too large (>{MAX_SIZE//1024//1024}MB). Please upload a smaller file.")
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
        import json
        rows = []
        skipped = []
        for doc in docs:
            try:
                rows.append(json.loads(doc.page_content))
            except Exception as e:
                skipped.append(doc.page_content[:100])
        logger.info(f"[UPLOAD] Parsed {len(rows)} docs, skipped {len(skipped)} docs.")
        if skipped:
            logger.info(f"[UPLOAD] Sample skipped content: {skipped[:2]}")
        if not rows:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="No valid rows found in CSV. Please upload a valid CSV file.")
        df = pd.DataFrame(rows)
        if df.empty:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Uploaded CSV contains no data rows.")
        cleaner = DataCleanerAgent(df)
        df = cleaner.clean()
        logger.info(f"[UPLOAD] DataFrame shape after clean: {df.shape}")
        memory.update(df, file.filename)
        logger.info(f"[UPLOAD] memory.df is set: {memory.df is not None}, filename: {memory.filename}")
        ids = [f"{file.filename}_{idx}" for idx in df.index]
        texts = [row.to_json() for _, row in df.iterrows()]
        from backend.core.llm_rag import upsert_documents_batch
        upsert_documents_batch(ids, texts)
        logger.info("[UPLOAD] All rows batch upserted.")
        elapsed = time.time() - start_time
        mem_mb = process.memory_info().rss / 1024 / 1024
        logger.info(f"[UPLOAD] Completed in {elapsed:.2f}s, memory usage: {mem_mb:.2f} MB")
        return {"status": "success", "rows_indexed": len(df), "elapsed": elapsed, "mem_mb": mem_mb}
    except Exception as e:
        elapsed = time.time() - start_time
        mem_mb = process.memory_info().rss / 1024 / 1024
        logger.error(f"❌ Error in /index: {str(e)} | Elapsed: {elapsed:.2f}s | Mem: {mem_mb:.2f} MB")
        logger.error(traceback.format_exc())
        from fastapi import HTTPException
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
        return {"answer": answer, "evaluation": eval_report, "usage": usage_tracker.get_usage(user_id)}
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
        logger.info(f"[CHART] Chart generated for x={req.x}, y={req.y}, type={req.chart_type}")
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
# 

@api_v1.post("/insights")
def generate_insights(req: InsightRequest):
    logger.info(f"[INSIGHTS] /insights called. memory.df is None? {memory.df is None}")
    df = memory.df
    if df is None:
        logger.error("[INSIGHTS] No data uploaded in session.")
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="No data uploaded in session.")
    try:
        agent = InsightAgent(df)
        result = agent.generate_summary()
        logger.info(f"[INSIGHTS] Insights generated: {result}")
        critique = CritiqueAgent(df.columns.tolist())
        eval_report = critique.evaluate("insights", result)
        logger.info(f"[INSIGHTS] Critique: {eval_report}")
        return {"insights": result, "evaluation": eval_report}
    except Exception as e:
        logger.error(f"[INSIGHTS] Exception: {e}")
        logger.error(traceback.format_exc())
        from fastapi import HTTPException
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
        chart_type = agent.guess_chart(query)
        x, y = agent.guess_axes()
        chart = agent.render_chart(x, y, chart_type)
        logger.info(f"[AUTO-CHART] Chart generated: type={chart_type}, x={x}, y={y}")
        return {
            "chart_type": chart_type,
            "x": x,
            "y": y,
            "chart": chart.to_json(),
        }
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
        from fastapi import HTTPException
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
    except Exception as e:
        logger.error(f"[DEBATE] Exception: {e}")
        logger.error(traceback.format_exc())
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Debate failed: {str(e)}")

app.include_router(api_v1)
