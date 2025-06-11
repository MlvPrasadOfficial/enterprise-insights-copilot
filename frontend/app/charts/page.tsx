"use client";
import { useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { LineChart, Line, ScatterChart, Scatter, PieChart, Pie, Cell, Legend } from "recharts";
import PageBackground from "../../components/PageBackground";

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
    <PageBackground 
      title="📊 Charts & Visualizations" 
      subtitle="Generate intelligent charts and visualizations from your data with AI-powered suggestions"
      showTitle={true}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Chart Generation Controls */}
        <div className="glass-card-3d p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">AI Chart Generator</h2>
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
                  <span>✨</span>
                  <span>Suggest & Plot Chart</span>
                </div>
              )}
            </button>
          </div>
        </div>
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
    <div className="min-h-screen">
      {/* Background with gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/30 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 via-transparent to-purple-900/20"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-indigo-900/10 to-blue-900/20"></div>
        
        {/* Floating gradient orbs */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"
            style={{
              background: `radial-gradient(circle, ${
                ['rgba(99, 102, 241, 0.4)', 'rgba(168, 85, 247, 0.4)', 'rgba(59, 130, 246, 0.4)'][i % 3]
              } 0%, transparent 70%)`,
              width: `${Math.random() * 300 + 200}px`,
              height: `${Math.random() * 300 + 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto pt-10 px-6">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4">
            📊 Charts Dashboard
          </h1>
          <p className="text-gray-300 text-lg">
            Auto-generate intelligent charts from your data
          </p>
        </div>

        {/* Main Chart Container */}
        <div className="glass-card-3d p-8 mb-8">
          <button 
            onClick={handleSuggestChart} 
            className="button-glossy-3d w-full sm:w-auto px-8 py-4 text-white font-semibold rounded-xl mb-6 transition-all duration-300 hover:scale-105"
          >
            🎯 Suggest & Plot Chart
          </button>          {loading && (
            <div className="glass-card-3d p-6 mb-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="spinner-elegant w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-blue-200">Generating chart...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="glass-card-3d p-6 mb-6 border-red-500/20 bg-red-900/10">
              <div className="text-red-300 flex items-center space-x-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}          {chartJson && chartType === "table" && (
            <div className="glass-card-3d p-6 mb-6">
              <TableFromAltair chartJson={{ chart_type: "table", columns: (chartJson.columns || []), data: (chartJson.data || []) }} />
            </div>
          )}
          
          {chartJson && chartType !== "table" && (
            <div className="glass-card-3d p-6">
              {desc && <div className="mb-4 text-sm text-blue-200 font-semibold">{desc}</div>}
              <div className="mb-4 text-xl font-bold text-center text-white">
                {chartJson && (chartJson.title || chartJson.chart && chartJson.chart.title) ? (chartJson.title || chartJson.chart.title) : "📈 Generated Chart"}
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
              </div>            ) : (
              <div className="glass-card-3d p-6 border-red-500/20 bg-red-900/10">
                <div className="text-red-300 flex items-center justify-center space-x-2">
                  <span>⚠️</span>
                  <span>Unable to render chart for this data.</span>
                </div>
              </div>
            )}
            
            <div className="mt-6 space-y-4">
              <MatplotlibCodeBlock chartType={chartType} x={chartJson.x} y={chartJson.y} chartJson={chartJson} />
              <ChartInsights chartType={chartType} chartJson={chartJson} />
            </div>
          </div>
        )}
      </div>
    </div>
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

function getXYFromChartJson(chartJson: any): { x?: string, y?: string } {
  // Try to get x and y from chartJson, else infer from data
  let x = chartJson?.x;
  let y = chartJson?.y;
  if (!x || !y) {
    // Try to infer from chartJson.data.values
    let data = [];
    if (chartJson && chartJson.data && Array.isArray(chartJson.data.values)) {
      data = chartJson.data.values;
    } else if (chartJson && chartJson.data_values && Array.isArray(chartJson.data_values)) {
      data = chartJson.data_values;
    }
    if (data.length > 0) {
      const keys = Object.keys(data[0] || {});
      if (!x && keys.length > 0) x = keys[0];
      if (!y && keys.length > 1) y = keys[1];
    }
  }
  return { x, y };
}

function MatplotlibCodeBlock({ chartType, x, y, chartJson }: { chartType: string, x?: string, y?: string, chartJson?: any }) {
  // Use robust x/y extraction
  const axes = getXYFromChartJson(chartJson || {});
  x = x || axes.x;
  y = y || axes.y;
  let code = "";  if (chartType === "bar") {
    // Using a more generic approach that works for both categorical and numerical data
    code = `import matplotlib.pyplot as plt
import pandas as pd

# Check if we need to aggregate the data
if df['${x}'].nunique() < len(df) * 0.5:  # If x has duplicate values, we likely need aggregation
    # Use value_counts for categorical data or count aggregation
    chart_data = df.groupby('${x}')['${y}'].agg(['mean', 'count']).reset_index()
    
    plt.figure(figsize=(10, 6))
    bars = plt.bar(chart_data['${x}'], chart_data['mean'])
    
    # Add count labels on top of bars
    for i, bar in enumerate(bars):
        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.1, 
                 f"n={chart_data['count'][i]}", ha='center')
else:
    # For non-categorical data, just plot directly
    plt.figure(figsize=(10, 6))
    plt.bar(df['${x}'], df['${y}'])

plt.xlabel('${x}')
plt.ylabel('${y}')
plt.title('${y} by ${x}')
plt.xticks(rotation=45)
plt.tight_layout()
plt.show()`
  } else if (chartType === "line") {
    code = `import matplotlib.pyplot as plt
import pandas as pd

# Check if we need to aggregate the data
if df['${x}'].nunique() < len(df) * 0.5:  # If x has duplicate values, we likely need aggregation
    # For line charts with repeated x values, aggregate with mean
    chart_data = df.groupby('${x}')['${y}'].mean().reset_index()
    
    plt.figure(figsize=(10, 6))
    plt.plot(chart_data['${x}'], chart_data['${y}'], marker='o')
else:
    # For non-repeating data, just plot directly
    plt.figure(figsize=(10, 6))
    plt.plot(df['${x}'], df['${y}'], marker='o')

plt.xlabel('${x}')
plt.ylabel('${y}')
plt.title('${y} over ${x}')
plt.grid(True, linestyle='--', alpha=0.7)
plt.tight_layout()
plt.show()`;  } else if (chartType === "pie") {
    code = `import matplotlib.pyplot as plt
import pandas as pd

# Check if we need to aggregate the data
if df['${x}'].nunique() < len(df) * 0.5:  # If x has duplicate values, we likely need aggregation
    # For pie charts, we should aggregate the data
    chart_data = df.groupby('${x}')['${y}'].agg(['mean']).reset_index()
    
    plt.figure(figsize=(10, 6))
    plt.pie(chart_data['mean'], labels=chart_data['${x}'], autopct='%1.1f%%')
else:
    # For non-categorical data, just plot directly
    plt.figure(figsize=(10, 6))
    plt.pie(df['${y}'], labels=df['${x}'], autopct='%1.1f%%')

plt.ylabel('')
plt.title('${y} by ${x} (Pie Chart)')
plt.axis('equal')  # Equal aspect ratio ensures that pie is drawn as a circle
plt.tight_layout()
plt.show()`  } else if (chartType === "scatter") {
    code = `import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Create scatter plot
plt.figure(figsize=(10, 6))
plt.scatter(df['${x}'], df['${y}'], alpha=0.6)

# Add regression line
slope, intercept, r_value, p_value, std_err = stats.linregress(df['${x}'], df['${y}'])
x_line = np.array([df['${x}'].min(), df['${x}'].max()])
y_line = slope * x_line + intercept
plt.plot(x_line, y_line, 'r--', label=f'y = {slope:.2f}x + {intercept:.2f}\\nR² = {r_value**2:.2f}')

# Add labels and styling
plt.xlabel('${x}')
plt.ylabel('${y}')
plt.title('${y} vs ${x}')
plt.grid(True, linestyle='--', alpha=0.7)
plt.legend()
plt.tight_layout()
plt.show()`;  } else if (chartType === "histogram") {
    code = `import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

plt.figure(figsize=(10, 6))

# Get the data and compute statistics
data = df['${x}'].dropna()
mean = data.mean()
median = data.median()
std_dev = data.std()

# Create histogram with KDE
counts, bins, patches = plt.hist(data, bins=20, alpha=0.7, density=True, color='steelblue')
plt.axvline(mean, color='red', linestyle='dashed', linewidth=1, label=f'Mean: {mean:.2f}')
plt.axvline(median, color='green', linestyle='dashed', linewidth=1, label=f'Median: {median:.2f}')

# Add KDE curve
xmin, xmax = plt.xlim()
x = np.linspace(xmin, xmax, 100)
kde = stats.gaussian_kde(data)
plt.plot(x, kde(x), 'k--', label='KDE')

# Add labels and styling
plt.xlabel('${x}')
plt.ylabel('Density')
plt.title(f'Distribution of ${x} (std dev: {std_dev:.2f})')
plt.grid(True, linestyle='--', alpha=0.7)
plt.legend()
plt.tight_layout()
plt.show()`;
  }
  if (!code || !x || !y) return null;  return (
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

// Add ChartInsights component
function ChartInsights({ chartType, chartJson }: { chartType: string; chartJson: any }) {
  let data: any[] = [];
  if (["bar", "line", "pie"].includes(chartType)) {
    data = parseAltairBarChart(chartJson);
    if (!data || data.length === 0) return null;
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const max = sorted[0];
    const min = sorted[sorted.length - 1];
    const avg = (sorted.reduce((sum, d) => sum + d.value, 0) / sorted.length).toFixed(2);    return (
      <div className="glass-card-3d p-4">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <span>📊</span>
          <span>Chart Insights</span>
        </h3>
        <ul className="space-y-2 text-gray-200">
          <li className="flex items-center space-x-2">
            <span>🏆</span>
            <span>Highest: <span className="font-semibold text-blue-300">{max.label}</span> ({max.value})</span>
          </li>          <li className="flex items-center space-x-2">
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
  if (["scatter", "histogram"].includes(chartType)) {
    data = parseAltairScatterChart(chartJson);
    if (!data || data.length === 0) return null;
    const xs = data.map(d => d.x);
    const ys = data.map(d => d.y);
    const xAvg = (xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2);
    const yAvg = (ys.reduce((a, b) => a + b, 0) / ys.length).toFixed(2);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    return (
      <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
        <strong>Chart Insights:</strong>
        <ul className="list-disc ml-6">
          <li>X min: <b>{xMin}</b>, X max: <b>{xMax}</b></li>
          <li>X avg: <b>{xAvg}</b></li>
          <li>Y avg: <b>{yAvg}</b></li>
        </ul>
      </div>
    );
  }
  return null;
}
