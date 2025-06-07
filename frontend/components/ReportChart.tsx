"use client";
import { useState } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ReportChart() {
  const [showReport, setShowReport] = useState(false);
  const [report, setReport] = useState("");
  const [charts, setCharts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleShowReport = async () => {
    setLoading(true);
    setShowReport(true);
    // Fetch report (now also gets top_categorical columns)
    const reportRes = await axios.post(`${API_URL}/generate-report`);
    setReport((reportRes.data as any).report);
    const topCategorical = (reportRes.data as any).top_categorical || [];
    // Fetch all charts in parallel for the dynamic columns
    const chartPromises = topCategorical.map((col: string) =>
      axios.post(`${API_URL}/generate-chart`, { chart_type: "bar", column: col })
    );
    const chartResults = await Promise.all(chartPromises);
    setCharts(
      chartResults.map((res, i) => ({
        ...(res.data as any),
        label: `${topCategorical[i]} Distribution`,
        column: topCategorical[i],
      }))
    );
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 rounded-2xl shadow-xl bg-white dark:bg-zinc-900">
      <div className="flex gap-4 mb-4">
        <button
          onClick={handleShowReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold"
        >
          Want Reports?
        </button>
      </div>
      {loading && <div>Loading report and charts...</div>}
      {showReport && !loading && (
        <>
          <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <strong>Report Description:</strong>
            <div>{report}</div>
          </div>
          {charts.map((chart) => (
            <div key={chart.column} className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
              <strong>{chart.label}</strong>
              <ul>
                {chart.labels.map((label: string, i: number) => (
                  <li key={label}>
                    {label}: {chart.values[i]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
