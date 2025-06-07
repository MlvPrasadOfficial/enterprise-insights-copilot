import React from "react";

export default function ExampleQueries({ onExample }: { onExample: (q: string) => void }) {
  const examples = [
    "Compare revenue across product categories",
    "Show sales trends over time",
    "Give some insights",
  ];
  return (
    <div className="my-4 flex flex-wrap gap-2">
      {examples.map((ex, i) => (
        <button
          key={i}
          className="px-3 py-1 rounded bg-accent/10 hover:bg-accent/20 text-accent"
          onClick={() => onExample(ex)}
        >
          {ex}
        </button>
      ))}
    </div>
  );
}
