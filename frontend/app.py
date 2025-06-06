import streamlit as st
import pandas as pd
import requests
import altair as alt
import io

# Try to import FPDF, but set a flag if it fails
try:
    from fpdf import FPDF
    FPDF_AVAILABLE = True
except ImportError:
    FPDF_AVAILABLE = False

# === Config === =
st.set_page_config(page_title="Enterprise Insights Copilot", page_icon="📊", layout="wide")

# === Secrets ===
BACKEND_URL = st.secrets["BACKEND_URL"]

# === Modern Styles ===
st.markdown('''
<style>
body { background: linear-gradient(135deg, #e0e7ff 0%, #f8fafc 100%) !important; }
section.main > div { background: #f8fafc !important; border-radius: 18px; box-shadow: 0 2px 16px #0001; padding: 2rem 2rem 1rem 2rem; }
.stButton>button { background: linear-gradient(90deg, #4e8cff, #38bdf8); color: white; border-radius: 8px; font-weight: 600; font-size: 1.1rem; padding: 0.5rem 1.5rem; }
.stTextInput>div>div>input { background: #f1f5f9; color: #222; border-radius: 6px; font-size: 1.1rem; }
.stDataFrame { border-radius: 10px; overflow: hidden; }
.stMarkdown h3 { color: #4e8cff; }
footer { visibility: hidden; }
</style>
''', unsafe_allow_html=True)

# === Sidebar ===
st.sidebar.image("https://img.shields.io/badge/GenAI-BI-blueviolet?style=for-the-badge", use_container_width=True)
st.sidebar.title("Enterprise Insights Copilot")
st.sidebar.markdown("""
- [GitHub](https://github.com/your-name/enterprise-insights-copilot)
- [Docs](https://github.com/your-name/enterprise-insights-copilot#readme)
- [API Reference](/docs)
""")
st.sidebar.markdown("---")
st.sidebar.info("Upload a CSV, ask a question, and get instant insights! 🚀")

# === Header ===
st.markdown("""
# 📊 Enterprise Insights Copilot
<small>Conversational BI with LLMs, RAG, and instant analytics for everyone.</small>
""", unsafe_allow_html=True)

# === Dark/Light Mode Toggle ===
mode = st.sidebar.toggle('🌗 Dark Mode', value=False)
if mode:
    st.markdown('''<style>body, section.main > div { background: #181825 !important; color: #f1f5f9 !important; } .stTextInput>div>div>input { background: #232634; color: #f1f5f9; } .stButton>button { background: linear-gradient(90deg, #6366f1, #38bdf8); } .stDataFrame { background: #232634; color: #f1f5f9; } .stMarkdown h3 { color: #38bdf8; }</style>''', unsafe_allow_html=True)

# === Session State for Chat History ===
if 'chat_history' not in st.session_state:
    st.session_state['chat_history'] = []

# === File Upload Card ===
with st.container():
    st.markdown("### 📁 Upload CSV", unsafe_allow_html=True)
    uploaded_file = st.file_uploader("Drop your CSV file here", type=["csv"])
    if uploaded_file:
        df = pd.read_csv(uploaded_file)
        st.dataframe(df.head(), use_container_width=True)
        if st.button("📤 Upload & Index Data", key="upload1"):
            with st.spinner("Uploading to backend..."):
                files = {"file": uploaded_file.getvalue()}
                res = requests.post(f"{BACKEND_URL}/api/v1/index", files=files)
                st.success("📁 File uploaded and indexed!")

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
        "Summarize this dataset's key patterns"
    ]

if 'example_idx' not in st.session_state:
    st.session_state['example_idx'] = 0

example_questions = get_example_questions(df if 'df' in locals() else None)

if st.button('✨ Try Example'):
    st.session_state['example_idx'] = (st.session_state['example_idx'] + 1) % len(example_questions)
    st.session_state['example_query'] = example_questions[st.session_state['example_idx']]
else:
    if 'example_query' not in st.session_state:
        st.session_state['example_query'] = example_questions[0]

# === Settings Sidebar ===
st.sidebar.markdown('---')
st.sidebar.markdown('**Settings**')
chunk_size = st.sidebar.slider('Chunk Size', 128, 2048, 512, step=64)
model = st.sidebar.selectbox('Model', ['gpt-4', 'gpt-3.5-turbo'])

# === Live Metrics ===
if st.sidebar.button('🔄 Refresh Usage Metrics'):
    try:
        metrics = requests.get(f"{BACKEND_URL}/api/v1/metrics").json()
        st.session_state['metrics'] = metrics
    except:
        st.session_state['metrics'] = {'error': 'Could not fetch metrics'}
if 'metrics' in st.session_state:
    st.sidebar.markdown(f"**Tokens Used:** {st.session_state['metrics'].get('anonymous', {}).get('tokens', 0)}")
    st.sidebar.markdown(f"**Cost:** ${st.session_state['metrics'].get('anonymous', {}).get('cost', 0):.4f}")

# --- Insights Panel ---
def fetch_auto_insights():
    try:
        response = requests.post(f"{BACKEND_URL}/api/v1/insights", json={"data": []})
        result = response.json()
        return result.get("insights", "No insights available."), result.get("evaluation", "")
    except Exception:
        return "No insights available.", ""

# --- Download Results ---
def download_insights_pdf(insights):
    if not FPDF_AVAILABLE:
        st.error("PDF export is unavailable (fpdf not installed). Please contact your administrator or install fpdf.")
        return None
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, 'AI Copilot Insights', ln=True, align='C')
    pdf.set_font('Arial', '', 12)
    pdf.multi_cell(0, 10, insights)
    buf = io.BytesIO()
    pdf.output(buf)
    buf.seek(0)
    return buf

def download_insights_csv(insights):
    buf = io.StringIO()
    buf.write('Insight\n')
    buf.write('"' + insights.replace('"', '""') + '"\n')
    buf.seek(0)
    return buf

# === Query Section Card (with Chat History & Insights) ===
with st.container():
    st.markdown('---')
    st.markdown('### 💬 Ask a Question', unsafe_allow_html=True)
    query = st.text_input('e.g., Compare revenue across product categories', value=st.session_state.get('example_query', ''))
    if st.button('🚀 Run Query'):
        if not uploaded_file:
            st.warning('Please upload a CSV first.')
        elif not query:
            st.warning('Enter a query to run.')
        else:
            with st.spinner('Querying Copilot...'):
                try:
                    response = requests.post(f"{BACKEND_URL}/api/v1/query", json={"query": query})
                    result = response.json()
                    answer = result.get('answer')
                    if not answer or answer == 'No answer returned.':
                        answer = 'No answer. Please try a different question or re-upload your data.'
                    st.session_state['chat_history'].append((query, answer))
                    # Fetch auto insights after query
                    insights, evaluation = fetch_auto_insights()
                    st.session_state['last_insights'] = insights
                    st.session_state['last_evaluation'] = evaluation
                    st.success('✅ Query complete!')
                except Exception as e:
                    st.error('❌ Failed to query backend.')
    # Show chat history
    if st.session_state['chat_history']:
        st.markdown('---')
        st.markdown('#### 🗨️ Chat History')
        for q, a in reversed(st.session_state['chat_history'][-6:]):
            st.markdown(f"<div style='margin-bottom:8px;'><b>🧑‍💼 You:</b> {q}</div>", unsafe_allow_html=True)
            st.markdown(f"<div style='margin-bottom:16px; background:#e0e7ff; border-radius:8px; padding:8px; display:flex; align-items:center;'><img src='https://img.icons8.com/fluency/48/000000/robot-2.png' width='24' style='margin-right:8px;'/> <b>AI:</b> {a}</div>", unsafe_allow_html=True)
    # Show insights panel
    if st.session_state.get('last_insights'):
        st.markdown('---')
        st.markdown('### 📈 Auto Insights')
        st.info(st.session_state['last_insights'])
        if st.session_state.get('last_evaluation'):
            st.caption(f"Evaluation: {st.session_state['last_evaluation']}")
        # === Download Buttons ===
        col1, col2 = st.columns(2)
        with col1:
            st.download_button(
                label="⬇️ Download Insights as PDF",
                data=download_insights_pdf(st.session_state['last_insights']),
                file_name="insights.pdf",
                mime="application/pdf"
            )
        with col2:
            st.download_button(
                label="⬇️ Download Insights as CSV",
                data=download_insights_csv(st.session_state['last_insights']),
                file_name="insights.csv",
                mime="text/csv"
            )

# === Clear Session Button ===
if st.sidebar.button('🧹 Clear Session'):
    st.session_state['chat_history'] = []
    st.session_state['metrics'] = {}
    st.experimental_rerun()

# === Footer ===
st.markdown("""
---
<center>
<sub>Made with ❤️ by [Your Name](https://github.com/your-name) | Powered by OpenAI, Pinecone, FastAPI, and Streamlit</sub>
</center>
""", unsafe_allow_html=True)
