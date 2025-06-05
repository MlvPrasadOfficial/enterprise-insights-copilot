import streamlit as st
import pandas as pd
import requests
import os
import altair as alt
import json

# Use Streamlit secrets for backend URL if available, else fallback to env or default
BACKEND_URL = st.secrets.get("BACKEND_URL", os.getenv("BACKEND_URL", "http://localhost:8000"))

# Streamlit entry point
st.set_page_config(page_title="Enterprise Insights Copilot", layout="wide")

st.title("📊 Enterprise Insights Copilot")
st.markdown("Ask questions about your data. Upload a CSV and start chatting.")

# Upload section
uploaded_file = st.file_uploader("Upload your CSV file", type=["csv"])
df = None
if uploaded_file:
    df = pd.read_csv(uploaded_file)
    st.success("File uploaded successfully!")
    st.dataframe(df.head(5))

    # Optionally send the data to backend to embed chunks
    if st.button("Index this dataset"):
        response = requests.post(
            f"{BACKEND_URL}/index",
            files={"file": uploaded_file}
        )
        st.write("✅ Dataset indexed." if response.status_code == 200 else "❌ Failed to index")

# Chat section
if df is not None:
    st.markdown("### 💬 Ask Your Question")
    query = st.text_input("Type your question here")

    if query:
        with st.spinner("Thinking..."):
            response = requests.post(
                f"{BACKEND_URL}/query",
                json={"query": query}
            )
            if response.ok:
                answer = response.json().get("answer", "")
                st.markdown("### 🧠 Answer")
                st.markdown(answer)
            else:
                st.error("Failed to get answer from server.")

    # Chart generator UI
    st.markdown("### 📈 Generate a Chart")

    chart_types = ["line", "bar", "scatter", "hist"]
    chart_type = st.selectbox("Select chart type", chart_types)

    x_axis = st.selectbox("X-axis column", df.columns)
    y_axis = st.selectbox("Y-axis column", df.columns)

    if st.button("Generate Chart"):
        payload = {
            "x": x_axis,
            "y": y_axis,
            "chart_type": chart_type,
            "data": df.to_dict(orient="records")
        }

        res = requests.post(f"{BACKEND_URL}/chart", json=payload)

        if res.ok:
            chart_json = res.json()["chart"]
            chart = alt.Chart.from_json(chart_json)
            st.altair_chart(chart, use_container_width=True)
            # Save chart as PNG for report generation
            import os
            os.makedirs("logs", exist_ok=True)
            chart.save("logs/last_chart.png")
        else:
            st.error("Chart generation failed.")

    # SQL Query UI
    st.markdown("### 🧠 Ask a Question (SQL Powered)")
    sql_query = st.text_input("Ask something that can be answered with a SQL-like query")

    if st.button("Run SQL Agent"):
        payload = {
            "query": sql_query,
            "data": df.to_dict(orient="records")
        }
        res = requests.post(f"{BACKEND_URL}/sql", json=payload)

        if res.ok:
            data = res.json()
            st.markdown("**📝 Generated SQL:**")
            st.code(data.get("sql", "No SQL generated."), language="sql")

            if "result" in data:
                st.markdown("**📊 Query Result:**")
                st.dataframe(pd.DataFrame(data["result"]))
            else:
                st.error(f"Error executing SQL: {data.get('error')}")
        else:
            st.error("SQL Agent failed to respond.")

    # Insight summary section
    st.markdown("### 📌 Get Automatic Insights")
    if st.button("Generate Business Insights"):
        payload = {"data": df.to_dict(orient="records")}
        res = requests.post(f"{BACKEND_URL}/insights", json=payload)

        if res.ok:
            st.markdown("**🧠 Insights:**")
            st.markdown(res.json().get("insights", "No insights found."))
        else:
            st.error("Failed to generate insights.")

    # Auto-Chart from Query
    st.markdown("### 🤖 Ask and Get Auto Chart")
    auto_query = st.text_input("Ask a chartable question", key="auto_chart_query")

    if st.button("Generate Auto Chart"):
        res = requests.post(f"{BACKEND_URL}/auto-chart", json={"query": auto_query})

        if res.ok:
            data = res.json()
            st.markdown(f"**Chart Type**: {data['chart_type']}  |  **X**: {data['x']}  |  **Y**: {data['y']}")
            st.altair_chart(alt.Chart.from_json(data["chart"]), use_container_width=True)
        else:
            st.error("Chart generation failed.")

# Evaluation Dashboard
st.markdown("## 🧪 Evaluation Dashboard")

eval_file = "logs/eval_results.csv"

if not os.path.exists(eval_file):
    st.warning("No evaluation results found.")
else:
    df_eval = pd.read_csv(eval_file)
    st.dataframe(df_eval[["query", "winner", "score"]])

    st.markdown("### 📊 Pass Rate")
    total = len(df_eval)
    passed = (df_eval["score"] == "pass").sum()
    st.metric("Total Evaluated", total)
    st.metric("Passed", passed)
    st.metric("Pass Rate", f"{round(passed / total * 100, 2)}%")

    selected = st.selectbox("Review a test case", df_eval["query"].unique())

    if selected:
        row = df_eval[df_eval["query"] == selected].iloc[0]
        st.markdown(f"**Query:** {row['query']}")
        st.markdown(f"**Winner:** {row['winner']}")
        st.markdown(f"**Score:** {row['score']}")
        st.markdown(f"**Reason:** {row.get('reason', 'N/A')}")

        # Optionally show full responses
        log_file = "logs/debate_log.json"
        if os.path.exists(log_file):
            with open(log_file) as f:
                logs = json.load(f)
                log_match = next((log for log in logs if log["query"] == selected), None)
                if log_match:
                    st.markdown("### 🧠 Agent Responses")
                    for agent, response in log_match["responses"].items():
                        st.markdown(f"**{agent}**")
                        st.code(response, language="markdown")

                    st.markdown("### 🔍 Evaluations")
                    st.json(log_match["evaluations"])
