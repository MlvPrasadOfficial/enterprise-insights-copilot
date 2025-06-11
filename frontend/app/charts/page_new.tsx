"use client";
import { useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell, Legend } from "recharts";
import PageBackground from "../../components/PageBackground";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const COLORS = ['#4E3CFA', '#9C3FFA', '#FA3CFA', '#FA3C9C', '#FA9C3C', '#9CFA3C'];

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
    <PageBackground 
      title="Charts & Visualizations" 
      subtitle="Generate intelligent charts and visualizations from your data with AI-powered suggestions"
      showTitle={true}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Chart Generation Controls */}
        <div className="glass-card-3d p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center justify-center space-x-3">
              <span>✨</span>
              <span>AI Chart Generator</span>
            </h2>
            <p className="text-gray-300">Let AI suggest the best visualization for your dataset</p>
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={handleSuggestChart} 
              className="button-glossy-3d px-8 py-4 text-white rounded-xl text-lg font-medium transition-all duration-300 hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="spinner-elegant w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Generating Chart...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <span>🎯</span>
                  <span>Suggest & Plot Chart</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="glass-card-3d p-6 border-red-500/20 bg-red-900/10">
            <div className="text-red-300 flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Chart Display */}
        {chartJson && (
          <div className="space-y-6">
            {chartType === "table" ? (
              <div className="glass-card-3d p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <span>📊</span>
                  <span>Data Table</span>
                </h3>
                <TableFromAltair chartJson={{ chart_type: "table", columns: (chartJson.columns || []), data: (chartJson.data || []) }} />
              </div>
            ) : (
              <div className="glass-card-3d p-6">
                {desc && (
                  <div className="mb-4 text-sm text-blue-200 font-semibold flex items-center space-x-2">
                    <span>📈</span>
                    <span>{desc}</span>
                  </div>
                )}
                
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold text-white">
                    {chartJson && (chartJson.title || chartJson.chart && chartJson.chart.title) ? 
                      (chartJson.title || chartJson.chart.title) : 
                      "Generated Chart"
                    }
                  </h3>
                </div>

                <div className="bg-black/20 rounded-xl p-4 mb-6">
                  {chartType === "bar" && parseAltairBarChart(chartJson).length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={parseAltairBarChart(chartJson)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }} 
                        />
                        <Bar dataKey="value" fill="#4E3CFA" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : chartType === "line" && parseAltairLineChart(chartJson).length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={parseAltairLineChart(chartJson)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="label" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }} 
                        />
                        <Line type="monotone" dataKey="value" stroke="#4E3CFA" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : chartType === "scatter" && parseAltairScatterChart(chartJson).length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <ScatterChart>
                        <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="x" stroke="#94a3b8" />
                        <YAxis dataKey="y" stroke="#94a3b8" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }} 
                        />
                        <Scatter data={parseAltairScatterChart(chartJson)} fill="#4E3CFA" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  ) : chartType === "pie" && parseAltairPieChart(chartJson).length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <PieChart>
                        <Pie 
                          data={parseAltairPieChart(chartJson)} 
                          dataKey="value" 
                          nameKey="label" 
                          cx="50%" 
                          cy="50%" 
                          outerRadius={120} 
                          fill="#4E3CFA"
                        >
                          {parseAltairPieChart(chartJson).map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0,0,0,0.8)', 
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            color: '#fff'
                          }} 
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="glass-card-3d p-6 border-red-500/20 bg-red-900/10">
                      <div className="text-red-300 flex items-center justify-center space-x-2">
                        <span>⚠️</span>
                        <span>Unable to render chart for this data.</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <MatplotlibCodeBlock chartType={chartType} x={chartJson.x} y={chartJson.y} chartJson={chartJson} />
                  <ChartInsights chartType={chartType} chartJson={chartJson} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageBackground>
  );
}

// Helper functions
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
  } catch (e) {
    console.error("Error parsing bar chart data:", e);
  }
  return [];
}

function parseAltairLineChart(chartJson: any): { label: string; value: number }[] {
  return parseAltairBarChart(chartJson);
}

function parseAltairPieChart(chartJson: any): { label: string; value: number }[] {
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
  } catch (e) {
    console.error("Error parsing scatter chart data:", e);
  }
  return [];
}

function MatplotlibCodeBlock({ chartType, x, y, chartJson }: { chartType: string; x?: string; y?: string; chartJson: any }) {
  if (!chartType || !x || !y) return null;
  
  const code = `import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# Load your data
df = pd.read_csv('your_data.csv')

# Create ${chartType} chart
plt.figure(figsize=(10, 6))
${chartType === 'bar' ? `plt.bar(df['${x}'], df['${y}'])` : 
  chartType === 'line' ? `plt.plot(df['${x}'], df['${y}'])` :
  chartType === 'scatter' ? `plt.scatter(df['${x}'], df['${y}'])` :
  'plt.plot(df["x"], df["y"])'}

plt.xlabel('${x}')
plt.ylabel('${y}')
plt.title('${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart: ${x} vs ${y}')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`;

  return (
    <div className="glass-card-3d p-4">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
        <span>🐍</span>
        <span>Python Code (Matplotlib)</span>
      </h3>
      <pre className="bg-black/50 text-green-300 rounded-lg p-4 text-sm font-mono overflow-x-auto border border-white/10">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ChartInsights({ chartType, chartJson }: { chartType: string; chartJson: any }) {
  if (!["bar", "line", "pie", "scatter"].includes(chartType)) return null;
  
  if (chartType === "scatter") {
    const data = parseAltairScatterChart(chartJson);
    if (!data || data.length === 0) return null;
    
    const xValues = data.map(d => d.x);
    const yValues = data.map(d => d.y);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const xAvg = (xValues.reduce((sum, val) => sum + val, 0) / xValues.length).toFixed(2);
    const yAvg = (yValues.reduce((sum, val) => sum + val, 0) / yValues.length).toFixed(2);

    return (
      <div className="glass-card-3d p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <span>📈</span>
          <span>Scatter Plot Insights</span>
        </h3>
        <ul className="space-y-2 text-gray-200">
          <li className="flex items-center space-x-2">
            <span>📊</span>
            <span>X range: <span className="font-semibold text-blue-300">{xMin}</span> to <span className="font-semibold text-blue-300">{xMax}</span></span>
          </li>
          <li className="flex items-center space-x-2">
            <span>📉</span>
            <span>X average: <span className="font-semibold text-green-300">{xAvg}</span></span>
          </li>
          <li className="flex items-center space-x-2">
            <span>📈</span>
            <span>Y average: <span className="font-semibold text-purple-300">{yAvg}</span></span>
          </li>
        </ul>
      </div>
    );
  }

  const data = parseAltairBarChart(chartJson);
  if (!data || data.length === 0) return null;
  
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = sorted[0];
  const min = sorted[sorted.length - 1];
  const avg = (sorted.reduce((sum, d) => sum + d.value, 0) / sorted.length).toFixed(2);

  return (
    <div className="glass-card-3d p-4">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
        <span>📊</span>
        <span>Chart Insights</span>
      </h3>
      <ul className="space-y-2 text-gray-200">
        <li className="flex items-center space-x-2">
          <span>🏆</span>
          <span>Highest: <span className="font-semibold text-blue-300">{max.label}</span> ({max.value})</span>
        </li>
        <li className="flex items-center space-x-2">
          <span>📉</span>
          <span>Lowest: <span className="font-semibold text-purple-300">{min.label}</span> ({min.value})</span>
        </li>
        <li className="flex items-center space-x-2">
          <span>📈</span>
          <span>Average: <span className="font-semibold text-green-300">{avg}</span></span>
        </li>
      </ul>
    </div>
  );
}

function TableFromAltair({ chartJson }: { chartJson: any }) {
  if (!chartJson || !chartJson.data || !Array.isArray(chartJson.data)) return null;
  
  const columns = chartJson.columns || [];
  const data = chartJson.data || [];
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-gray-200">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col: string, idx: number) => (
              <th key={idx} className="text-left py-3 px-4 font-semibold text-white">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((row: any, idx: number) => (
            <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
              {columns.map((col: string, colIdx: number) => (
                <td key={colIdx} className="py-2 px-4">
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <div className="text-center py-4 text-gray-400">
          Showing first 10 of {data.length} rows
        </div>
      )}
    </div>
  );
}
