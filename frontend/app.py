import streamlit as st
import pandas as pd
import requests
import altair as alt

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
            "http://localhost:8000/index",
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
                "http://localhost:8000/query",
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

        res = requests.post("http://localhost:8000/chart", json=payload)

        if res.ok:
            chart_json = res.json()["chart"]
            st.altair_chart(alt.Chart.from_json(chart_json), use_container_width=True)
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
        res = requests.post("http://localhost:8000/sql", json=payload)

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
        res = requests.post("http://localhost:8000/insights", json=payload)

        if res.ok:
            st.markdown("**🧠 Insights:**")
            st.markdown(res.json().get("insights", "No insights found."))
        else:
            st.error("Failed to generate insights.")

    # Auto-Chart from Query
    st.markdown("### 🤖 Ask and Get Auto Chart")
    auto_query = st.text_input("Ask a chartable question", key="auto_chart_query")

    if st.button("Generate Auto Chart"):
        res = requests.post("http://localhost:8000/auto-chart", json={"query": auto_query})

        if res.ok:
            data = res.json()
            st.markdown(f"**Chart Type**: {data['chart_type']}  |  **X**: {data['x']}  |  **Y**: {data['y']}")
            st.altair_chart(alt.Chart.from_json(data["chart"]), use_container_width=True)
        else:
            st.error("Chart generation failed.")
