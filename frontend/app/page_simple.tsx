"use client";
import { useState, useEffect, useCallback } from "react";
import UploadFixed from "../components/Upload_fixed";
import ProcessVisualizerSimple from "../components/ProcessVisualizer_simple";
import Link from "next/link";
import LiveFlow from "../components/LiveFlow";

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome! Upload your CSV data and I'll help you analyze it with natural language queries.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }
  ]);
  
  // Sample agent data to pass to LiveFlow
  const [agentData, setAgentData] = useState({
    activeAgents: [
      { id: "data", name: "Data Agent", type: "data", icon: "📂", color: "from-gray-500 to-gray-700", status: "complete", message: "Data loaded successfully" },
      { id: "cleaner", name: "Data Cleaner", type: "cleaner", icon: "🧹", color: "from-green-500 to-emerald-500", status: "working", message: "Cleaning data..." }
    ],
    fileUploadStatus: {
      fileName: "",
      indexed: false,
      rowCount: 0
    }
  });
  
  // Handler for when a file is uploaded
  const handleFileUploadComplete = useCallback(() => {
    console.log("File upload complete, setting fileUploaded to true");
    setFileUploaded(true);
    setAgentData(prev => ({
      ...prev,
      fileUploadStatus: {
        ...prev.fileUploadStatus,
        indexed: true,
        fileName: "uploaded.csv",
        rowCount: 5
      }
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-white mb-6 text-center">
          Enterprise Insights Copilot
        </h1>
        <p className="text-xl text-gray-300 mb-8 text-center">
          AI-Powered Business Intelligence Platform
        </p>
        
        <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl mb-6">
          <UploadFixed onUploadComplete={handleFileUploadComplete} />
        </div>
        
        {fileUploaded && (
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl">
            <LiveFlow 
              agents={agentData.activeAgents} 
              currentQuery={query} 
              fileUploadStatus={agentData.fileUploadStatus}
              fileUploaded={fileUploaded}
            />
          </div>
        )}
      </div>
    </div>
  );
}
