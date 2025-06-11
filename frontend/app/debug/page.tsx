"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProcessVisualizer from '@/components/ProcessVisualizer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DebugVisualizer() {
  const [sessionId, setSessionId] = useState(`debug-session-${Date.now()}`);
  const [activeAgents, setActiveAgents] = useState([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [fileUploadStatus, setFileUploadStatus] = useState({
    fileName: '',
    indexed: false,
    rowCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [debugLog, setDebugLog] = useState([]);

  // Add to debug log
  const logDebug = (message) => {
    setDebugLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      message
    }]);
  };

  // Fetch agent status
  const fetchAgentStatus = async () => {
    try {
      logDebug(`Fetching agent status for session: ${sessionId}`);
      const res = await axios.get(`${API_URL}/api/v1/agent-status`, {
        params: { session_id: sessionId }
      });
      
      const data = res.data;
      logDebug(`Received ${data.agents?.length || 0} agents`);
      
      if (data && Array.isArray(data.agents)) {
        setActiveAgents(data.agents);
      } else {
        logDebug("Warning: Invalid agent status data format");
      }
    } catch (error) {
      logDebug(`Error fetching agent status: ${error.message}`);
    }
  };

  // Reset agent status
  const resetAgentStatus = async () => {
    try {
      setLoading(true);
      logDebug(`Resetting agent status for session: ${sessionId}`);
      
      await axios.post(`${API_URL}/api/v1/reset-agent-status`, { 
        session_id: sessionId 
      });
      
      setActiveAgents([]);
      logDebug("Agent status reset successful");
    } catch (error) {
      logDebug(`Error resetting agent status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Send a test query
  const sendTestQuery = async (query) => {
    if (!query) return;
    
    try {
      setLoading(true);
      setCurrentQuery(query);
      logDebug(`Sending test query: "${query}"`);
      
      // First reset agent status
      await axios.post(`${API_URL}/api/v1/reset-agent-status`, { 
        session_id: sessionId 
      });
      
      // Now send the query
      const res = await axios.post(`${API_URL}/api/v1/multiagent-query`, {
        query,
        session_id: sessionId
      });
      
      logDebug(`Query response received: ${res.data?.steps?.join(", ") || "No steps"}`);
    } catch (error) {
      logDebug(`Error sending test query: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Simulate file upload
  const simulateFileUpload = (fileName, rowCount) => {
    logDebug(`Simulating file upload: ${fileName} with ${rowCount} rows`);
    
    try {
      // Create file upload event
      const fileUploadEvent = new CustomEvent('file-uploaded', {
        detail: {
          fileName,
          fileSize: rowCount * 100, // Fake file size
          timestamp: new Date().toISOString()
        }
      });
      
      // Dispatch event
      window.dispatchEvent(fileUploadEvent);
      
      // Create file indexed event
      const fileIndexedEvent = new CustomEvent('file-indexed', {
        detail: {
          fileName,
          rowCount,
          timestamp: new Date().toISOString()
        }
      });
      
      // Dispatch event
      window.dispatchEvent(fileIndexedEvent);
      
      setFileUploadStatus({
        fileName,
        indexed: true,
        rowCount
      });
      
      logDebug("File upload events dispatched successfully");
    } catch (error) {
      logDebug(`Error simulating file upload: ${error.message}`);
    }
  };

  // Setup polling
  useEffect(() => {
    let interval;
    
    if (loading) {
      // Poll every second while loading
      interval = setInterval(fetchAgentStatus, 1000);
    } else {
      // Single fetch when loading stops
      fetchAgentStatus();
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading, sessionId]);

  // Create some predefined test queries
  const testQueries = [
    { name: "Chart Query", query: "Show me a chart of sales by region" },
    { name: "SQL Query", query: "How many sales were made in each region?" },
    { name: "Insight Query", query: "What insights can you give me about the trends in this data?" },
    { name: "Error Test", query: "ERROR_TEST: Show data from non-existent table" }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Agent Visualizer Debug Tool</h1>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-[59%] bg-white dark:bg-zinc-900 p-4 rounded-xl shadow">
          <h2 className="text-xl mb-4">Control Panel</h2>
          
          {/* Session ID Control */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Session ID</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={sessionId} 
                onChange={(e) => setSessionId(e.target.value)}
                className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
              />
              <button 
                onClick={() => setSessionId(`debug-session-${Date.now()}`)}
                className="bg-gray-200 dark:bg-zinc-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-zinc-600"
              >
                New
              </button>
            </div>
          </div>
          
          {/* Test Queries */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Test Queries</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {testQueries.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => sendTestQuery(item.query)}
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  disabled={loading}
                >
                  {item.name}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={currentQuery}
                onChange={(e) => setCurrentQuery(e.target.value)}
                placeholder="Custom query..."
                className="flex-1 p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
              />
              <button 
                onClick={() => sendTestQuery(currentQuery)}
                disabled={!currentQuery || loading}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-zinc-700"
              >
                Send
              </button>
            </div>
          </div>
          
          {/* File Upload Simulator */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Simulate File Upload</label>
            <div className="flex gap-2">
              <button 
                onClick={() => simulateFileUpload("sample_data.csv", 1245)}
                className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600"
              >
                Sample CSV (1,245 rows)
              </button>
              <button 
                onClick={() => simulateFileUpload("large_dataset.csv", 50000)}
                className="bg-amber-500 text-white px-3 py-1 rounded hover:bg-amber-600"
              >
                Large Dataset (50,000 rows)
              </button>
            </div>
          </div>
          
          {/* Debug Actions */}
          <div className="mb-4">
            <label className="block mb-2 font-medium">Debug Actions</label>
            <div className="flex gap-2">
              <button 
                onClick={resetAgentStatus}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Reset Agent Status
              </button>
              <button 
                onClick={fetchAgentStatus}
                className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
              >
                Refresh Status
              </button>
            </div>
          </div>
          
          {/* Debug Log */}
          <div className="mt-6">
            <h3 className="font-medium mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"></path>
              </svg>
              Debug Log
            </h3>
            <div className="bg-gray-100 dark:bg-zinc-800 p-3 rounded-lg max-h-[300px] overflow-y-auto font-mono text-xs">
              {debugLog.map((log, idx) => (
                <div key={idx} className="mb-1">
                  <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                  {log.message}
                </div>
              ))}
              {debugLog.length === 0 && (
                <div className="text-gray-500">No log entries yet</div>
              )}
            </div>
            
            {debugLog.length > 0 && (
              <button 
                onClick={() => setDebugLog([])}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700"
              >
                Clear log
              </button>
            )}
          </div>
        </div>
        
        {/* Process Visualizer */}
        <div className="lg:w-[41%]">
          <div className="sticky top-2">
            <ProcessVisualizer 
              _sessionId={sessionId}
              currentQuery={currentQuery}
              activeAgents={activeAgents}
              fileUploadStatus={fileUploadStatus}
            />
          </div>
        </div>
      </div>
      
      {/* Current Agent Data */}
      <div className="mt-6 bg-white dark:bg-zinc-900 p-4 rounded-xl shadow">
        <h2 className="text-xl mb-4">Current Agent Data</h2>
        <pre className="bg-gray-100 dark:bg-zinc-800 p-4 rounded overflow-auto max-h-64 text-xs">
          {JSON.stringify(activeAgents, null, 2)}
        </pre>
      </div>
    </div>
  );
}
