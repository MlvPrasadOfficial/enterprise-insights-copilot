"use client";
import React from "react";
import Papa from "papaparse";

export default function EvalSetButton({ onLoad }: { onLoad: (data: any[]) => void }) {
  // Loads the eval_set.csv from public and parses it, then calls onLoad
  const handleLoadEval = async () => {
    const res = await fetch("/eval_set.csv");
    const text = await res.text();
    const parsed = Papa.parse(text, { header: true });
    onLoad(parsed.data);
  };
  return (
    <button
      onClick={handleLoadEval}
      className="ml-4 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
      title="Load the sample eval set CSV for charting"
    >
      Use Sample Eval Set
    </button>
  );
}
