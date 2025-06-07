import React from "react";
import type { AgentStep } from "../app/page";

type Props = { steps: AgentStep[] };

export default function AgentTimeline({ steps }: Props) {
  if (!steps || steps.length === 0) return null;
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Agent Timeline</h2>
      <ol className="border-l-2 border-blue-600">
        {steps.map((step, i) => (
          <li key={i} className="mb-4 ml-4">
            <div className="font-bold">{step.agent || `Step ${i + 1}`}</div>
            <div className="ml-2">{step.output || JSON.stringify(step)}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
