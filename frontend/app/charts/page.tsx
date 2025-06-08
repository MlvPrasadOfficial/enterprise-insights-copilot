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
          {desc && <div className="mb-2 text-sm text-gray-600">{desc}</div>}
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
          <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded text-xs overflow-x-auto">
            {chartJson}
          </pre>
        </>
      )}
    </div>
  );
}

// Helper to parse Altair bar chart JSON to Recharts data
function parseAltairBarChart(chartJson: string): { label: string; value: number }[] {
  try {
    const chart = JSON.parse(chartJson);
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

function parseAltairLineChart(chartJson: string): { label: string; value: number }[] {
  // Same as bar, but for line chart
  return parseAltairBarChart(chartJson);
}

function parseAltairScatterChart(chartJson: string): { x: number; y: number }[] {
  try {
    const chart = JSON.parse(chartJson);
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

function parseAltairPieChart(chartJson: string): { label: string; value: number }[] {
  // Same as bar, but for pie chart
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
