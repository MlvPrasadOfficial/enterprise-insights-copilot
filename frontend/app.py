import streamlit as st
import pandas as pd
import requests
import altair as alt

# === Config === =
st.set_page_config(page_title="Enterprise Insights Copilot", page_icon="📊", layout="wide")

# === Secrets ===
BACKEND_URL = st.secrets["BACKEND_URL"]

# === Styles ===
st.markdown("""
<style>
h1 { font-size: 2.5rem !important; color: #4e8cff; }
.stTextInput>div>div>input { background-color: #0e1117; color: white; }
</style>
""", unsafe_allow_html=True)

# === Header ===
st.title("📊 Enterprise Insights Copilot")
st.markdown("Ask questions about your data. Upload a CSV and start chatting with your Copilot.")

# === File Upload ===
st.markdown("### 📁 Upload CSV")
uploaded_file = st.file_uploader("Drop your CSV file here", type=["csv"])

if uploaded_file:
    df = pd.read_csv(uploaded_file)
    st.dataframe(df.head(), use_container_width=True)

    # Send to backend
    if st.button("🔁 Send to Copilot"):
        with st.spinner("Uploading to backend..."):
            files = {"file": uploaded_file.getvalue()}
            res = requests.post(f"{BACKEND_URL}/upload", files=files)
            st.success("📁 File uploaded successfully!")

# === Query Section ===
st.markdown("---")
st.markdown("### 💬 Ask a Question")
query = st.text_input("e.g., Compare revenue across product categories")

if st.button("🚀 Run Query"):
    if not uploaded_file:
        st.warning("Please upload a CSV first.")
    elif not query:
        st.warning("Enter a query to run.")
    else:
        with st.spinner("Querying..."):
            try:
                response = requests.post(f"{BACKEND_URL}/query", json={"query": query})
                result = response.json()
                st.markdown("### 🧠 Copilot Insight")
                st.success(result["answer"])
            except Exception as e:
                st.error("❌ Failed to query backend.")
