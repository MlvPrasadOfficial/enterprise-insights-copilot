"use client";
import React, { useState, useEffect } from 'react';
import ProcessVisualizer from '@/components/ProcessVisualizer';
import { mockActiveAgents, simulatePlannerCompletion, simulateSqlCompletion, simulateAllComplete, mockFileUploadStatus } from '@/components/test_visualizer';

export default function VisualizerTestPage() {
  const [testAgents, setTestAgents] = useState(mockActiveAgents);
  const [testQuery, setTestQuery] = useState("Show me a chart of sales by region");
  const [testFile, setTestFile] = useState(mockFileUploadStatus);
  
  // Simulate agent workflow
  useEffect(() => {
    const step1 = setTimeout(() => {
      console.log("Step 1: Planner completes and activates SQL Agent");
      setTestAgents(simulatePlannerCompletion(testAgents));
    }, 3000);
    
    const step2 = setTimeout(() => {
      console.log("Step 2: SQL Agent completes and activates Chart Agent");
      setTestAgents(simulateSqlCompletion(testAgents));
    }, 6000);
    
    const step3 = setTimeout(() => {
      console.log("Step 3: All agents complete their tasks");
      setTestAgents(simulateAllComplete(testAgents));
    }, 9000);
    
    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
    };
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agent Visualizer Test</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-3/5 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow">
          <h2 className="text-xl mb-4">Control Panel</h2>
          
          <div className="mb-4">
            <label className="block mb-2">Test Query</label>
            <input 
              type="text" 
              value={testQuery} 
              onChange={(e) => setTestQuery(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-2">Agent Status</h3>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-64">
              {JSON.stringify(testAgents, null, 2)}
            </pre>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setTestAgents(mockActiveAgents)}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Reset
            </button>
            <button 
              onClick={() => setTestAgents(simulatePlannerCompletion(testAgents))}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Step 1
            </button>
            <button 
              onClick={() => setTestAgents(simulateSqlCompletion(testAgents))}
              className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600"
            >
              Step 2
            </button>
            <button 
              onClick={() => setTestAgents(simulateAllComplete(testAgents))}
              className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
            >
              Complete All
            </button>
          </div>
        </div>
        
        <div className="lg:w-2/5">
          <ProcessVisualizer 
            _sessionId="test-session"
            currentQuery={testQuery}
            activeAgents={testAgents}
            fileUploadStatus={testFile}
          />
        </div>
      </div>
    </div>
  );
}
