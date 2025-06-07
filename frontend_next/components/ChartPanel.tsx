import React from "react";

interface ChartPanelProps {
  chartUrl?: string;
}

const ChartPanel: React.FC<ChartPanelProps> = ({ chartUrl }) => {
  return (
    <div className="p-4 border rounded bg-white shadow">
      <h3 className="font-bold mb-2">Chart</h3>
      {chartUrl ? (
        <img src={chartUrl} alt="Chart" className="w-full h-64 object-contain" />
      ) : (
        <div className="text-gray-400 text-center py-12">No chart to display.</div>
      )}
    </div>
  );
};

export default ChartPanel;
