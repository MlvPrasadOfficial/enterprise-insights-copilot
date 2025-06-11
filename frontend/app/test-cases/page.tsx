"use client";
import { useState, useEffect } from 'react';
import ProcessVisualizer from '@/components/ProcessVisualizer';
import { AgentStatus, FileUploadStatus } from '@/types';

export default function TestVisualizerPage() {
  // Visualizer test states
  const [testCase, setTestCase] = useState<string>('idle');
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [fileStatus, setFileStatus] = useState<FileUploadStatus>({
    fileName: '',
    indexed: false,
    rowCount: 0
  });

  // Generate sample agents in different states
  useEffect(() => {
    const currentTime = new Date().toISOString();
    let olderTime = new Date(Date.now() - 5000).toISOString();
    
    switch (testCase) {
      case 'idle':
        // All agents in idle state
        setAgents([
          {
            name: 'Planning Agent',
            status: 'idle',
            type: 'planner',
            message: 'Ready to process queries'
          },
          {
            name: 'SQL Agent',
            status: 'idle',
            type: 'sql',
            message: 'Ready to execute SQL queries'
          },
          {
            name: 'Chart Agent',
            status: 'idle',
            type: 'chart',
            message: 'Ready to create visualizations'
          }
        ]);
        break;
        
      case 'planner_working':
        // Planner working, others idle
        setAgents([
          {
            name: 'Planning Agent',
            status: 'working',
            type: 'planner',
            message: 'Analyzing query and determining route',
            startTime: currentTime
          },
          {
            name: 'SQL Agent',
            status: 'idle',
            type: 'sql',
            message: 'Ready to execute SQL queries'
          },
          {
            name: 'Chart Agent',
            status: 'idle',
            type: 'chart',
            message: 'Ready to create visualizations'
          }
        ]);
        break;
        
      case 'sql_working':
        // Planner done, SQL working, chart idle
        setAgents([
          {
            name: 'Planning Agent',
            status: 'complete',
            type: 'planner',
            message: 'Routed query to SQL agent',
            startTime: olderTime,
            endTime: currentTime
          },
          {
            name: 'SQL Agent',
            status: 'working',
            type: 'sql',
            message: 'Executing SQL query against dataset',
            startTime: currentTime
          },
          {
            name: 'Chart Agent',
            status: 'idle',
            type: 'chart',
            message: 'Ready to create visualizations'
          }
        ]);
        break;
        
      case 'chart_working':
        // Planner done, SQL done, chart working
        setAgents([
          {
            name: 'Planning Agent',
            status: 'complete',
            type: 'planner',
            message: 'Routed query to SQL agent for chart data',
            startTime: olderTime,
            endTime: new Date(Date.now() - 8000).toISOString()
          },
          {
            name: 'SQL Agent',
            status: 'complete',
            type: 'sql',
            message: 'Query executed successfully, passing to chart agent',
            startTime: new Date(Date.now() - 7000).toISOString(),
            endTime: new Date(Date.now() - 2000).toISOString()
          },
          {
            name: 'Chart Agent',
            status: 'working',
            type: 'chart',
            message: 'Creating bar chart visualization',
            startTime: new Date(Date.now() - 2000).toISOString()
          }
        ]);
        break;
        
      case 'all_complete':
        // All agents complete
        setAgents([
          {
            name: 'Planning Agent',
            status: 'complete',
            type: 'planner',
            message: 'Routed query to SQL agent for chart data',
            startTime: new Date(Date.now() - 10000).toISOString(),
            endTime: new Date(Date.now() - 9000).toISOString()
          },
          {
            name: 'SQL Agent',
            status: 'complete',
            type: 'sql',
            message: 'Query executed successfully',
            startTime: new Date(Date.now() - 8000).toISOString(),
            endTime: new Date(Date.now() - 5000).toISOString()
          },
          {
            name: 'Chart Agent',
            status: 'complete',
            type: 'chart',
            message: 'Created bar chart visualization',
            startTime: new Date(Date.now() - 5000).toISOString(),
            endTime: currentTime
          }
        ]);
        break;
        
      case 'complex':
        // More agents involved in a complex workflow
        setAgents([
          {
            name: 'Planning Agent',
            status: 'complete',
            type: 'planner',
            message: 'Complex query requires multiple agents',
            startTime: new Date(Date.now() - 15000).toISOString(),
            endTime: new Date(Date.now() - 14000).toISOString()
          },
          {
            name: 'SQL Agent',
            status: 'complete',
            type: 'sql',
            message: 'Query executed successfully',
            startTime: new Date(Date.now() - 14000).toISOString(),
            endTime: new Date(Date.now() - 10000).toISOString()
          },
          {
            name: 'Data Cleaner Agent',
            status: 'complete',
            type: 'data_cleaner',
            message: 'Data normalized and cleaned',
            startTime: new Date(Date.now() - 10000).toISOString(),
            endTime: new Date(Date.now() - 8000).toISOString()
          },
          {
            name: 'Chart Agent',
            status: 'complete',
            type: 'chart',
            message: 'Created visualization',
            startTime: new Date(Date.now() - 8000).toISOString(),
            endTime: new Date(Date.now() - 6000).toISOString()
          },
          {
            name: 'Insight Agent',
            status: 'complete',
            type: 'insight',
            message: 'Generated insights from data',
            startTime: new Date(Date.now() - 6000).toISOString(),
            endTime: new Date(Date.now() - 2000).toISOString()
          },
          {
            name: 'Critique Agent',
            status: 'working',
            type: 'critique',
            message: 'Reviewing insights for accuracy',
            startTime: new Date(Date.now() - 2000).toISOString()
          }
        ]);
        break;
        
      case 'error':
        // Error handling test
        setAgents([
          {
            name: 'Planning Agent',
            status: 'complete',
            type: 'planner',
            message: 'Routed query to SQL agent',
            startTime: new Date(Date.now() - 10000).toISOString(),
            endTime: new Date(Date.now() - 9000).toISOString()
          },
          {
            name: 'SQL Agent',
            status: 'error',
            type: 'sql',
            message: 'Error: Table "nonexistent_table" not found',
            startTime: new Date(Date.now() - 8000).toISOString(),
            endTime: currentTime
          },
        ]);
        break;
        
      case 'with_file':
        // With file upload status
        setAgents([
          {
            name: 'Planning Agent',
            status: 'working',
            type: 'planner',
            message: 'Processing query on uploaded file data',
            startTime: currentTime
          }
        ]);
        
        setFileStatus({
          fileName: 'sales_data_2023.csv',
          indexed: true,
          rowCount: 5243
        });
        break;
    }
  }, [testCase]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Process Visualizer Test Cases</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Test Cases</h2>
            
            <div className="space-y-2 mb-6">
              <button
                onClick={() => setTestCase('idle')}
                className={`w-full text-left p-2 rounded transition-colors ${
                  testCase === 'idle'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                Idle Agents
              </button>
              
              <button
                onClick={() => setTestCase('planner_working')}
                className={`w-full text-left p-2 rounded transition-colors ${
                  testCase === 'planner_working'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                Planner Working
              </button>
              
              <button
                onClick={() => setTestCase('sql_working')}
                className={`w-full text-left p-2 rounded transition-colors ${
                  testCase === 'sql_working'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                SQL Agent Working
              </button>
              
              <button
                onClick={() => setTestCase('chart_working')}
                className={`w-full text-left p-2 rounded transition-colors ${
                  testCase === 'chart_working'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                Chart Agent Working
              </button>
              
              <button
                onClick={() => setTestCase('all_complete')}
                className={`w-full text-left p-2 rounded transition-colors ${
                  testCase === 'all_complete'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                All Agents Complete
              </button>
              
              <button
                onClick={() => setTestCase('complex')}
                className={`w-full text-left p-2 rounded transition-colors ${
                  testCase === 'complex'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                Complex Workflow
              </button>
              
              <button
                onClick={() => setTestCase('error')}
                className={`w-full text-left p-2 rounded transition-colors ${
                  testCase === 'error'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                Error State
              </button>
              
              <button
                onClick={() => setTestCase('with_file')}
                className={`w-full text-left p-2 rounded transition-colors ${
                  testCase === 'with_file'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                With File Upload
              </button>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Test Data</h3>
              <pre className="bg-gray-100 dark:bg-zinc-800 text-xs p-3 rounded max-h-96 overflow-auto">
                {JSON.stringify(agents, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="lg:w-2/3">
          <ProcessVisualizer
            _sessionId="test-session"
            currentQuery="What are the top selling products by region?"
            activeAgents={agents}
            fileUploadStatus={fileStatus}
          />
        </div>
      </div>
    </div>
  );
}
