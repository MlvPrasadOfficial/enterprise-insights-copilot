"use client";
import React, { useState } from 'react';
import EnhancedAgentPanel from './EnhancedAgentPanel';
import DataCleanerResults from './DataCleanerResults';

// Sample data cleaner results for demonstration
const sampleCleaningResult = {
  operations: [
    {
      operation: "normalize_units",
      column: "weight",
      count_changed: 25
    },
    {
      operation: "normalize_dates",
      column: "purchase_date",
      count_changed: 18
    },
    {
      operation: "convert_numeric",
      column: "price",
      from_type: "object",
      to_type: "float64"
    },
    {
      operation: "handle_outliers",
      column: "age",
      outlier_count: 3,
      lower_bound: 18,
      upper_bound: 65
    },
    {
      operation: "remove_duplicates",
      count_removed: 12,
      original_count: 250,
      new_count: 238
    },
    {
      operation: "handle_missing",
      column: "address"
    }
  ],
  cleaning_stats: {
    operations_count: 6,
    operations_by_type: {
      normalize_units: 1,
      normalize_dates: 1,
      convert_numeric: 1,
      handle_outliers: 1,
      remove_duplicates: 1,
      handle_missing: 1
    },
    columns_modified: ["weight", "purchase_date", "price", "age", "address"],
    rows_before: 250,
    rows_after: 238,
    row_count_change: -12,
    missing_values_before: 45,
    missing_values_after: 28,
    missing_values_change: -17
  }
};

// Example agent for demonstration
const sampleAgents = [
  {
    type: "data",
    name: "Data Agent",
    icon: "📊",
    status: "complete",
    message: "Data profiling completed",
    progress: 100,
    capabilities: [
      { name: "Profile Data", description: "Generate statistical profiles", enabled: true },
      { name: "Detect Types", description: "Infer data types", enabled: true }
    ]
  },
  {
    type: "cleaner",
    name: "Data Cleaner Agent",
    icon: "🧹",
    status: "complete",
    message: "Data cleaning completed successfully",
    progress: 100,
    capabilities: [
      { name: "Fix Missing Values", description: "Handle null and empty values", enabled: true },
      { name: "Normalize Units", description: "Standardize measurement units", enabled: true },
      { name: "Handle Outliers", description: "Detect and address anomalies", enabled: true }
    ],
    steps: [
      { id: 1, description: "Analyzing data types", status: "complete", timestamp: "10:15:22 AM" },
      { id: 2, description: "Normalizing units", status: "complete", timestamp: "10:15:28 AM" },
      { id: 3, description: "Converting data types", status: "complete", timestamp: "10:15:35 AM" },
      { id: 4, description: "Handling outliers", status: "complete", timestamp: "10:15:42 AM" },
      { id: 5, description: "Removing duplicates", status: "complete", timestamp: "10:15:48 AM" }
    ],
    cleaningResult: sampleCleaningResult
  }
];

interface DataCleanerDemoProps {
  // Add any props if needed
}

export default function DataCleanerDemo({}: DataCleanerDemoProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>("cleaner");
  const [agentLogs] = useState<Record<string, string[]>>({
    cleaner: [
      "Started cleaning process...",
      "Normalizing units in weight column",
      "Converted 25 values to standardized units",
      "Processing date fields...",
      "Standardized 18 date formats",
      "Converting price column to numeric type",
      "Detecting outliers in age column",
      "Found 3 outliers outside bounds [18, 65]",
      "Checking for duplicate rows...",
      "Removed 12 duplicate entries",
      "Handling missing values in address column",
      "Cleaning process completed successfully"
    ]
  });
  
  const getStatusBackground = (status: string) => {
    switch (status) {
      case 'working': return 'bg-blue-500/10 border-blue-500/30';
      case 'complete': return 'bg-green-500/10 border-green-500/30';
      case 'error': return 'bg-red-500/10 border-red-500/30';
      default: return 'bg-white/5 border-white/10';
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'working': return 'text-blue-400';
      case 'complete': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-white/70';
    }
  };
  
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Get the Data Cleaner agent
  const cleanerAgent = sampleAgents.find(agent => agent.type === "cleaner");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Data Cleaner Agent Demo</h1>
      
      <div className="glass-card-3d p-6 space-y-6 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10">
        <h2 className="text-xl text-white font-medium">Real-time Cleaning Results</h2>
        
        {/* Display the agent panel */}
        {cleanerAgent && (
          <EnhancedAgentPanel
            agent={cleanerAgent}
            selectedAgent={selectedAgent}
            setSelectedAgent={setSelectedAgent}
            agentLogs={agentLogs}
            getStatusBackground={getStatusBackground}
            getStatusColor={getStatusColor}
            formatDuration={formatDuration}
          />
        )}
        
        {/* Divider */}
        <div className="border-t border-white/10 my-6"></div>
        
        {/* Display the detailed cleaning results */}
        <h2 className="text-xl text-white font-medium mb-4">Detailed Cleaning Results</h2>
        <DataCleanerResults cleaningResult={sampleCleaningResult} />
      </div>
    </div>
  );
}
