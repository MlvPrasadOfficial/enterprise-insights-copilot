import React from "react";

export default function AutoInsights({ insights }: { insights: string }) {
  if (!insights) return null;
  return (
    <div className="my-6 bg-blue-50 p-4 rounded shadow">
      <h3 className="font-bold text-accent mb-2">Auto Insights</h3>
      <pre className="whitespace-pre-wrap text-sm">{insights}</pre>
    </div>
  );
}
