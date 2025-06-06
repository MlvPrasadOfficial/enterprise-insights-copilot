import streamlit as st
import pandas as pd
import requests
import altair as alt
import io
import logging
import traceback
import streamlit.components.v1 as components

# --- Logging helpers must be defined before any usage ---
if "log_messages" not in st.session_state:
    st.session_state["log_messages"] = []


def log_to_ui(message, level="info"):
    st.session_state["log_messages"].append((level, message))
    logging.log(getattr(logging, level.upper(), logging.INFO), message)


def log_exception_to_ui(e, context=""):
    tb = traceback.format_exc()
    msg = f"[EXCEPTION] {context}: {e}\n{tb}"
    log_to_ui(msg, level="error")
    st.error(f"❌ {context}: {e}")


# Try to import FPDF, but set a flag if it fails
try:
    from fpdf import FPDF

    FPDF_AVAILABLE = True
except ImportError:
    FPDF_AVAILABLE = False

# === Config === =
try:
    st.set_page_config(
        page_title="Enterprise Insights Copilot", page_icon="📊", layout="wide"
    )
    log_to_ui("Page config set.", "info")
except Exception as e:
    log_exception_to_ui(e, context="Page Config Error")

# === Secrets ===
try:
    BACKEND_URL = st.secrets["BACKEND_URL"]
    log_to_ui(f"Loaded BACKEND_URL: {BACKEND_URL}", "info")
except Exception as e:
    log_exception_to_ui(e, context="Secrets Error")

# === Modern Styles ===
st.markdown(
    """
<style>
body { background: linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%) !important; }
section.main > div { background: #f8fafc !important; border-radius: 18px; box-shadow: 0 2px 16px #0001; padding: 2rem 2rem 1rem 2rem; }
.stButton>button { background: linear-gradient(90deg, #4e8cff, #38bdf8); color: white; border-radius: 8px; font-weight: 600; font-size: 1.1rem; padding: 0.5rem 1.5rem; }
.stTextInput>div>div>input { background: #f1f5f9; color: #222; border-radius: 6px; font-size: 1.1rem; }
.stDataFrame { border-radius: 10px; overflow: hidden; }
.stMarkdown h3 { color: #4e8cff; }
footer { visibility: hidden; }
/* Chat history styles */
.chat-bubble-user { background: #e0e7ff; color: #222; border-radius: 8px; padding: 8px; margin-bottom: 8px; }
.chat-bubble-ai { background: #232634; color: #f1f5f9; border-radius: 8px; padding: 8px; margin-bottom: 16px; display: flex; align-items: center; }
body.dark .chat-bubble-user { background: #232634 !important; color: #f1f5f9 !important; }
body.dark .chat-bubble-ai { background: #181825 !important; color: #f1f5f9 !important; }
</style>
""",
    unsafe_allow_html=True,
)

# === Sidebar ===
st.sidebar.image(
    "https://img.shields.io/badge/GenAI-BI-blueviolet?style=for-the-badge",
    use_container_width=True,
)
st.sidebar.title("Enterprise Insights Copilot")
st.sidebar.markdown(
    """
- [GitHub](https://github.com/your-name/enterprise-insights-copilot)
- [Docs](https://github.com/your-name/enterprise-insights-copilot#readme)
- [API Reference](/docs)
"""
)
st.sidebar.markdown("---")
st.sidebar.info("Upload a CSV, ask a question, and get instant insights! 🚀")

# === Header ===
st.markdown(
    """
# 📊 Enterprise Insights Copilot
<small>Conversational BI with LLMs, RAG, and instant analytics for everyone.</small>
""",
    unsafe_allow_html=True,
)

# === Dark/Light Mode Toggle ===
mode = st.sidebar.toggle("🌗 Dark Mode", value=False)
if mode:
    st.markdown(
        """<style>body, section.main > div { background: #181825 !important; color: #f1f5f9 !important; } .stTextInput>div>div>input { background: #232634; color: #f1f5f9; } .stButton>button { background: linear-gradient(90deg, #6366f1, #38bdf8); } .stDataFrame { background: #232634; color: #f1f5f9; } .stMarkdown h3 { color: #38bdf8; }</style>""",
        unsafe_allow_html=True,
    )

# === Session State for Chat History ===
if "chat_history" not in st.session_state:
    st.session_state["chat_history"] = []

# === File Upload Card ===
with st.container():
    st.markdown("### 📁 Upload CSV", unsafe_allow_html=True)
    uploaded_file = st.file_uploader("Drop your CSV file here", type=["csv"])
    if uploaded_file:
        try:
            df = pd.read_csv(uploaded_file)
            st.dataframe(df.head(), use_container_width=True)
            log_to_ui("CSV file read successfully.", "info")
        except Exception as e:
            log_exception_to_ui(e, context="CSV Preview Error")
        if st.button("📤 Upload & Index Data", key="upload1"):
            with st.spinner("Uploading to backend..."):
                try:
                    # Set filename and content-type for backend compatibility
                    files = {
                        "file": (
                            uploaded_file.name,
                            uploaded_file.getvalue(),
                            "text/csv",
                        )
                    }
                    res = requests.post(f"{BACKEND_URL}/api/v1/index", files=files)
                    log_to_ui(
                        f"Upload response: {res.status_code} {res.text}", level="info"
                    )
                    if res.status_code == 200:
                        st.success("📁 File uploaded and indexed!")
                        log_to_ui("File uploaded and indexed successfully.", "info")
                    else:
                        # Try to parse JSON error, else show a generic error
                        try:
                            error_msg = res.json().get("detail", res.text)
                        except Exception:
                            if "<html" in res.text.lower():
                                error_msg = "Backend error (502/504 or server crash). Please try again later or check backend logs."
                            else:
                                error_msg = res.text
                        st.error(f"❌ Upload failed: {error_msg}")
                        log_to_ui(f"Upload failed: {error_msg}", "error")
                except Exception as e:
                    log_exception_to_ui(e, context="File Upload Error")


# --- Example Questions ---
def get_example_questions(df=None):
    # If df is provided, generate context-aware examples
    if df is not None:
        cols = list(df.columns)
        if len(cols) >= 2:
            return [
                f"Show {cols[0]} by {cols[1]}",
                f"Top 3 {cols[0]} by {cols[1]}",
                f"Average {cols[1]} by {cols[0]}",
                f"Trend of {cols[1]} over time",
            ]
    # Fallback generic examples
    return [
        "Compare revenue across product categories",
        "What is the sales trend by month?",
        "Show me outliers in recovery time by hospital",
        "Summarize this dataset's key patterns",
    ]


if "example_idx" not in st.session_state:
    st.session_state["example_idx"] = 0

example_questions = get_example_questions(df if "df" in locals() else None)

if st.button("✨ Try Example"):
    st.session_state["example_idx"] = (st.session_state["example_idx"] + 1) % len(
        example_questions
    )
    st.session_state["example_query"] = example_questions[
        st.session_state["example_idx"]
    ]
    log_to_ui(f"Example question tried: {st.session_state['example_query']}", "info")
else:
    if "example_query" not in st.session_state:
        st.session_state["example_query"] = example_questions[0]

# === Settings Sidebar ===
st.sidebar.markdown("---")
st.sidebar.markdown("**Settings**")
chunk_size = st.sidebar.slider("Chunk Size", 128, 2048, 512, step=64)
model = st.sidebar.selectbox("Model", ["gpt-4", "gpt-3.5-turbo"])

# === Live Metrics ===
if st.sidebar.button("🔄 Refresh Usage Metrics"):
    try:
        metrics = requests.get(f"{BACKEND_URL}/api/v1/metrics").json()
        st.session_state["metrics"] = metrics
        log_to_ui("Usage metrics refreshed.", "info")
    except:
        st.session_state["metrics"] = {"error": "Could not fetch metrics"}
        log_to_ui("Failed to refresh usage metrics.", "error")
if "metrics" in st.session_state:
    st.sidebar.markdown(
        f"**Tokens Used:** {st.session_state['metrics'].get('anonymous', {}).get('tokens', 0)}"
    )
    st.sidebar.markdown(
        f"**Cost:** ${st.session_state['metrics'].get('anonymous', {}).get('cost', 0):.4f}"
    )


# --- Insights Panel ---
def fetch_auto_insights(df=None):
    try:
        data = []
        if df is not None:
            # Send a sample of the data to backend for insights
            data = df.head(100).to_dict(orient="records")
        response = requests.post(f"{BACKEND_URL}/api/v1/insights", json={"data": data})
        result = response.json()
        log_to_ui(
            f"Insights response: {response.status_code} {response.text}", level="info"
        )
        return result.get("insights", "No insights available."), result.get(
            "evaluation", ""
        )
    except Exception:
        log_to_ui("Failed to fetch auto insights.", "error")
        return "No insights available.", ""


# --- Download Results ---
def download_insights_pdf(insights):
    if not FPDF_AVAILABLE:
        st.error(
            "PDF export is unavailable (fpdf not installed). Please contact your administrator or install fpdf."
        )
        return b"PDF export unavailable"
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(0, 10, "AI Copilot Insights", ln=True, align="C")
    pdf.set_font("Arial", "", 12)
    # Replace problematic unicode with ascii equivalents for FPDF
    safe_insights = insights.encode("latin1", "replace").decode("latin1")
    pdf.multi_cell(0, 10, safe_insights)
    pdf_bytes = pdf.output(dest="S").encode("latin1")
    # Always return bytes, not BytesIO, for Streamlit compatibility
    log_to_ui("Insights PDF downloaded.", "info")
    return pdf_bytes


def download_insights_csv(insights):
    import io

    buf = io.StringIO()
    buf.write("Insight\n")
    buf.write('"' + insights.replace('"', '""') + '"\n')
    csv_bytes = buf.getvalue().encode("utf-8")
    # Always return bytes, not BytesIO, for Streamlit compatibility
    log_to_ui("Insights CSV downloaded.", "info")
    return csv_bytes


# === Query Section Card (with Chat History & Insights) ===
with st.container():
    st.markdown("---")
    st.markdown("### 💬 Ask a Question", unsafe_allow_html=True)
    query = st.text_input(
        "GIVE SOME INSIGHTS", value=st.session_state.get("example_query", "")
    )
    if st.button("🚀 Run Query"):
        if not uploaded_file:
            st.warning("Please upload a CSV first.")
            log_to_ui("Query attempt without CSV upload.", "warning")
        elif not query:
            st.warning("Enter a query to run.")
            log_to_ui("Query submitted but empty.", "warning")
        else:
            with st.spinner("Querying Copilot..."):
                try:
                    response = requests.post(
                        f"{BACKEND_URL}/api/v1/query", json={"query": query}
                    )
                    log_to_ui(
                        f"Query response: {response.status_code} {response.text}",
                        level="info",
                    )
                    result = response.json()
                    answer = result.get("answer")
                    if not answer or answer == "No answer returned.":
                        answer = "No answer. Please try a different question or re-upload your data."
                    st.session_state["chat_history"].append((query, answer))
                    log_to_ui(
                        f"Query successful: {query} -> {answer[:50]}...", "info"
                    )  # Log first 50 chars of answer
                    # Fetch auto insights after query
                    insights, evaluation = fetch_auto_insights(
                        df if "df" in locals() else None
                    )
                    st.session_state["last_insights"] = insights
                    st.session_state["last_evaluation"] = evaluation
                    st.success("✅ Query complete!")
                except Exception as e:
                    log_exception_to_ui(e, context="Query Error")
                    log_to_ui("Query processing failed.", "error")
    # Show chat history
    if st.session_state["chat_history"]:
        st.markdown("---")
        st.markdown("#### 🗨️ Chat History")
        for q, a in reversed(st.session_state["chat_history"][-6:]):
            st.markdown(
                f"<div class='chat-bubble-user'><b>🧑‍💼 You:</b> {q}</div>",
                unsafe_allow_html=True,
            )
            st.markdown(
                f"<div class='chat-bubble-ai'><img src='https://img.icons8.com/fluency/48/000000/robot-2.png' width='24' style='margin-right:8px;'/><b>AI:</b> {a}</div>",
                unsafe_allow_html=True,
            )
    # Show insights panel
    if st.session_state.get("last_insights"):
        st.markdown("---")
        st.markdown("### 📈 Auto Insights")
        st.info(st.session_state["last_insights"])
        if st.session_state.get("last_evaluation"):
            st.caption(f"Evaluation: {st.session_state['last_evaluation']}")
        # === Download Buttons ===
        col1, col2 = st.columns(2)
        with col1:
            st.download_button(
                label="⬇️ Download Insights as PDF",
                data=download_insights_pdf(st.session_state["last_insights"]),
                file_name="insights.pdf",
                mime="application/pdf",
            )
        with col2:
            st.download_button(
                label="⬇️ Download Insights as CSV",
                data=download_insights_csv(st.session_state["last_insights"]),
                file_name="insights.csv",
                mime="text/csv",
            )

# === Log Dropdown Panel (Main Page) ===
with st.expander("🪵 Show Session Logs (Dropdown)", expanded=False):
    st.markdown(
        """<div style="font-size:0.95em;">All logs for this session are shown below. Most recent at bottom.</div>""",
        unsafe_allow_html=True,
    )
    log_text = "\n".join(
        [f"[{level.upper()}] {msg}" for level, msg in st.session_state["log_messages"]]
    )
    components.html(
        f"""
        <button onclick="navigator.clipboard.writeText(document.getElementById('logtext').innerText)" style="margin-bottom:8px;padding:6px 16px;border-radius:6px;background:#4e8cff;color:white;font-weight:600;border:none;cursor:pointer;">📋 Copy Log</button>
        <pre id="logtext" style="background:#f1f5f9;padding:12px;border-radius:8px;max-height:300px;overflow:auto;font-size:0.95em;">{log_text}</pre>
    """,
        height=340,
    )
    for level, msg in st.session_state["log_messages"]:
        st.markdown(f"**[{level.upper()}]** {msg}")

# === Streamlit logging setup ===
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("streamlit_app")

# Example: Log app start
log_to_ui("Streamlit app started.", "info")

# At the end of the app, show logs in an expander
with st.sidebar.expander("🪵 Show Logs", expanded=True):
    log_text = "\n".join(
        [f"[{level.upper()}] {msg}" for level, msg in st.session_state["log_messages"]]
    )
    components.html(
        f"""
        <button onclick="navigator.clipboard.writeText(document.getElementById('sidebarlogtext').innerText)" style="margin-bottom:8px;padding:6px 16px;border-radius:6px;background:#4e8cff;color:white;font-weight:600;border:none;cursor:pointer;">📋 Copy Log</button>
        <pre id="sidebarlogtext" style="background:#f1f5f9;padding:12px;border-radius:8px;max-height:300px;overflow:auto;font-size:0.95em;">{log_text}</pre>
    """,
        height=340,
    )
    for level, msg in st.session_state["log_messages"]:
        st.markdown(f"**[{level.upper()}]** {msg}")

# === Clear Session Button ===
if st.sidebar.button("🧹 Clear Session"):
    st.session_state["chat_history"] = []
    st.session_state["metrics"] = {}
    st.experimental_rerun()

# === Footer ===
st.markdown(
    """
---
<center>
<sub>Made with ❤️ by [Your Name](https://github.com/your-name) | Powered by OpenAI, Pinecone, FastAPI, and Streamlit</sub>
</center>
""",
    unsafe_allow_html=True,
)
