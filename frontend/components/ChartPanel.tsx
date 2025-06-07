import React from "react";

type ChartDatum = { label: string; value: number };
type Props = { chartData: ChartDatum[] };

const ChartPanel: React.FC<Props> = ({ chartData }) => {
  if (!chartData || !Array.isArray(chartData)) return null;
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Chart</h2>
      {/* Add recharts/plotly code here as needed */}
      {chartData.map((d) => (
        <div key={d.label}>
          {d.label}: {d.value}
        </div>
      ))}
    </div>
  );
};

export default ChartPanel;
