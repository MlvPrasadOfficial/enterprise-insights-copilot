import React from "react";

interface AgentStep {
  agent: string;
  description: string;
  output: string;
}

interface AgentTimelineProps {
  steps: AgentStep[];
}

const AgentTimeline: React.FC<AgentTimelineProps> = ({ steps }) => {
  return (
    <div className="p-4 border rounded bg-white shadow">
      <h3 className="font-bold mb-2">Agentic Timeline</h3>
      <ol className="relative border-l border-blue-200">
        {steps.map((step, idx) => (
          <li key={idx} className="mb-6 ml-6">
            <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-8 ring-white">
              <span className="text-blue-600 font-bold">{idx + 1}</span>
            </span>
            <div className="flex flex-col">
              <span className="font-semibold text-blue-700">{step.agent}</span>
              <span className="text-gray-600 text-sm">{step.description}</span>
              <span className="text-gray-800 mt-1">{step.output}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default AgentTimeline;
