import React from "react";

interface UsagePanelProps {
  usage: {
    totalTokens: number;
    totalCost: number;
    promptTokens: number;
    completionTokens: number;
    successfulRequests: number;
  };
}

const UsagePanel: React.FC<UsagePanelProps> = ({ usage }) => (
  <div className="flex flex-col gap-2">
    <h3 className="font-bold text-lg mb-2">📊 Usage & Cost</h3>
    <div className="flex flex-wrap gap-4">
      <div className="bg-indigo-50 rounded-lg px-4 py-2">
        <span className="font-mono text-xs text-gray-500">Total Tokens</span>
        <div className="font-bold text-indigo-700 text-lg">{usage.totalTokens}</div>
      </div>
      <div className="bg-indigo-50 rounded-lg px-4 py-2">
        <span className="font-mono text-xs text-gray-500">Total Cost ($)</span>
        <div className="font-bold text-indigo-700 text-lg">{usage.totalCost.toFixed(4)}</div>
      </div>
      <div className="bg-indigo-50 rounded-lg px-4 py-2">
        <span className="font-mono text-xs text-gray-500">Prompt Tokens</span>
        <div className="font-bold text-indigo-700 text-lg">{usage.promptTokens}</div>
      </div>
      <div className="bg-indigo-50 rounded-lg px-4 py-2">
        <span className="font-mono text-xs text-gray-500">Completion Tokens</span>
        <div className="font-bold text-indigo-700 text-lg">{usage.completionTokens}</div>
      </div>
      <div className="bg-indigo-50 rounded-lg px-4 py-2">
        <span className="font-mono text-xs text-gray-500">Requests</span>
        <div className="font-bold text-indigo-700 text-lg">{usage.successfulRequests}</div>
      </div>
    </div>
  </div>
);

export default UsagePanel;
