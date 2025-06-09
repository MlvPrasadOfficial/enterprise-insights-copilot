"use client";
import { useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell, Legend } from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ChartsPage() {
  const [chartJson, setChartJson] = useState<any>(null);
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chartType, setChartType] = useState<string>("");

  const handleSuggestChart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/v1/auto-chart`, { query: "Suggest the best chart for this dataset" });
      const data = res.data as any;
      setChartJson(data.chart);
      setChartType(data.chart_type);
      setDesc(`Chart type: ${data.chart_type}, x: ${data.x}, y: ${data.y}`);
    } catch {
      setError("Failed to fetch chart suggestion.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 rounded-2xl shadow-xl bg-white dark:bg-zinc-900">
      <button onClick={handleSuggestChart} className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4">
        Suggest & Plot Chart
      </button>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {chartJson && chartType === "table" && (
        <div>
          <TableFromAltair chartJson={{ chart_type: "table", columns: (chartJson.columns || []), data: (chartJson.data || []) }} />
        </div>
      )}
      {chartJson && chartType !== "table" && (
        <>
          {desc && <div className="mb-2 text-sm text-gray-600 font-semibold">{desc}</div>}
          <div className="mb-2 text-lg font-bold text-center">
            {chartJson && (chartJson.title || chartJson.chart && chartJson.chart.title) ? (chartJson.title || chartJson.chart.title) : "Chart"}
          </div>
          <div className="mb-4">
            {chartType === "bar" && parseAltairBarChart(chartJson).length > 0 ? (
              <div className="mb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={parseAltairBarChart(chartJson)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3182ce" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : chartType === "line" && parseAltairLineChart(chartJson).length > 0 ? (
              <div className="mb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={parseAltairLineChart(chartJson)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3182ce" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : chartType === "scatter" && parseAltairScatterChart(chartJson).length > 0 ? (
              <div className="mb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart>
                    <CartesianGrid />
                    <XAxis dataKey="x" />
                    <YAxis dataKey="y" />
                    <Tooltip />
                    <Scatter data={parseAltairScatterChart(chartJson)} fill="#3182ce" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            ) : chartType === "pie" && parseAltairPieChart(chartJson).length > 0 ? (
              <div className="mb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={parseAltairPieChart(chartJson)} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} fill="#3182ce">
                      {parseAltairPieChart(chartJson).map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
                Unable to render chart for this data.
              </div>
            )}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>XAxis: {chartJson && (chartJson.x || (chartJson.chart && chartJson.chart.x))}</span>
            <span>YAxis: {chartJson && (chartJson.y || (chartJson.chart && chartJson.chart.y))}</span>
          </div>
          <div className="bg-zinc-900 text-green-200 rounded p-2 text-xs font-mono overflow-x-auto mb-4">
            {typeof chartJson === "string" ? chartJson : JSON.stringify(chartJson, null, 2)}
          </div>
          <AltairPythonCodeBlock chartType={chartType} x={chartJson.x} y={chartJson.y} />
          <ChartInsights chartType={chartType} chartJson={chartJson} />
        </>
      )}
    </div>
  );
}

// Helper to parse Altair bar chart JSON to Recharts data
function parseAltairBarChart(chartJson: any): { label: string; value: number }[] {
  try {
    const chart = typeof chartJson === "string" ? JSON.parse(chartJson) : chartJson;
    if (chart && chart.data && Array.isArray(chart.data.values)) {
      const sample = chart.data.values[0];
      const keys = Object.keys(sample || {});
      if (keys.length >= 2) {
        return chart.data.values.map((row: any) => ({
          label: row[keys[0]],
          value: Number(row[keys[1]])
        }));
      }
    }
  } catch {}
  return [];
}

function parseAltairLineChart(chartJson: any): { label: string; value: number }[] {
  return parseAltairBarChart(chartJson);
}

function parseAltairScatterChart(chartJson: any): { x: number; y: number }[] {
  try {
    const chart = typeof chartJson === "string" ? JSON.parse(chartJson) : chartJson;
    if (chart && chart.data && Array.isArray(chart.data.values)) {
      const sample = chart.data.values[0];
      const keys = Object.keys(sample || {});
      if (keys.length >= 2) {
        return chart.data.values.map((row: any) => ({
          x: Number(row[keys[0]]),
          y: Number(row[keys[1]])
        }));
      }
    }
  } catch {}
  return [];
}

function parseAltairPieChart(chartJson: any): { label: string; value: number }[] {
  return parseAltairBarChart(chartJson);
}

const COLORS = ["#3182ce", "#e53e3e", "#38a169", "#d69e2e", "#805ad5", "#319795", "#f56565", "#ecc94b"];

function TableFromAltair({ chartJson }: { chartJson: string | any }) {
  try {
    // Accept both stringified and parsed JSON
    const chart = typeof chartJson === "string" ? JSON.parse(chartJson) : chartJson;
    if (chart && chart.chart_type === "table" && Array.isArray(chart.data) && Array.isArray(chart.columns)) {
      const rows = chart.data;
      const keys: string[] = chart.columns;
      return (
        <table className="min-w-full border text-xs mb-4">
          <thead>
            <tr>
              {keys.map((k: string) => (
                <th key={k} className="border px-2 py-1 bg-zinc-100 dark:bg-zinc-800">{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any, i: number) => (
              <tr key={i}>
                {keys.map((k: string) => (
                  <td key={k} className="border px-2 py-1">{row[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
  } catch {
    // ignore
  }
  return <div className="p-4 bg-yellow-100 text-yellow-800 rounded mb-4">Unable to display table.</div>;
}

// Add ChartInsights component
function ChartInsights({ chartType, chartJson }: { chartType: string; chartJson: any }) {
  // Try to extract data for insights
  let data: any[] = [];
  if (chartJson && chartJson.data && Array.isArray(chartJson.data.values)) {
    data = chartJson.data.values;
  } else if (chartJson && chartJson.data_values && Array.isArray(chartJson.data_values)) {
    data = chartJson.data_values;
  }
  if (!data || data.length === 0) return null;

  // 5 lines of insights for bar/line/pie
  if (["bar", "line", "pie"].includes(chartType)) {
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const max = sorted[0];
    const min = sorted[sorted.length - 1];
    const avg = (sorted.reduce((sum, d) => sum + d.value, 0) / sorted.length).toFixed(2);
    const total = sorted.reduce((sum, d) => sum + d.value, 0);
    const range = max.value - min.value;
    return (
      <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        <strong>Chart Insights:</strong>
        <ul className="list-disc ml-6">
          <li>Highest: <b>{max.label}</b> ({max.value})</li>
          <li>Lowest: <b>{min.label}</b> ({min.value})</li>
          <li>Average: <b>{avg}</b></li>
          <li>Total: <b>{total}</b></li>
          <li>Range: <b>{range}</b></li>
        </ul>
      </div>
    );
  }
  // For scatter/histogram, show 5 lines of basic stats
  if (["scatter", "histogram"].includes(chartType)) {
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    const xAvg = (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2);
    const yAvg = (ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(2);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    return (
      <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        <strong>Chart Insights:</strong>
        <ul className="list-disc ml-6">
          <li>X min: <b>{xMin}</b>, X max: <b>{xMax}</b></li>
          <li>Y min: <b>{yMin}</b>, Y max: <b>{yMax}</b></li>
          <li>X avg: <b>{xAvg}</b></li>
          <li>Y avg: <b>{yAvg}</b></li>
          <li>Points: <b>{data.length}</b></li>
        </ul>
      </div>
    );
  }
  return null;
}

function AltairPythonCodeBlock({ chartType, x, y }: { chartType: string, x?: string, y?: string }) {
  let code = "";
  if (chartType === "bar") {
    code = `import altair as alt\nchart = alt.Chart(df).mark_bar().encode(x='${x}', y='${y}')`;
  } else if (chartType === "line") {
    code = `import altair as alt\nchart = alt.Chart(df).mark_line().encode(x='${x}', y='${y}')`;
  } else if (chartType === "pie") {
    code = `import altair as alt\nchart = alt.Chart(df).mark_arc().encode(theta='${y}', color='${x}')`;
  } else if (chartType === "scatter") {
    code = `import altair as alt\nchart = alt.Chart(df).mark_circle().encode(x='${x}', y='${y}')`;
  } else if (chartType === "histogram") {
    code = `import altair as alt\nchart = alt.Chart(df).mark_bar().encode(x=alt.X('${x}', bin=True), y='count()')`;
  }
  if (!code) return null;
  return (
    <pre className="bg-zinc-900 text-yellow-200 rounded p-2 text-xs font-mono overflow-x-auto mb-4">
      <code>{code}</code>
    </pre>
  );
}
