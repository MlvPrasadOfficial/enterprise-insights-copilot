"use client";
import { useState } from "react";
import UploadFixed from "../components/Upload_fixed";
import ProcessVisualizerSimple from "../components/ProcessVisualizer_simple";
import Link from "next/link";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome! Upload your CSV data and I'll help you analyze it with natural language queries.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-6 text-center">
          Enterprise Insights Copilot
        </h1>
        <p className="text-xl text-gray-300 mb-8 text-center">
          AI-Powered Business Intelligence Platform
        </p>
        
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl">
          <UploadFixed />
        </div>
      </div>
    </div>
  );
}
