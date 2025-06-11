"use client";
import { useState } from "react";
import UploadFixed from "../components/Upload_fixed";
import ProcessVisualizer from "../components/ProcessVisualizer";

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
  const [agentData, setAgentData] = useState({
    activeAgents: [
      { 
        type: "planner" as const, 
        name: "Planning Agent", 
        icon: "🧠", 
        status: "complete" as const,
        startTime: new Date(Date.now() - 3000).toISOString(),
        endTime: new Date(Date.now() - 1000).toISOString(),
        message: "Planning Agent Completed"
      },
      { 
        type: "insight" as const, 
        name: "Insight Generator", 
        icon: "💡", 
        status: "working" as const,
        startTime: new Date(Date.now() - 2000).toISOString(),
        message: "Insight Generator Started"
      },
      { 
        type: "chart" as const, 
        name: "Chart Agent", 
        icon: "📊", 
        status: "idle" as const,
        message: "Chart Agent Alerting"
      }
    ],
    currentQuery: query,
    sessionId: "session-" + Date.now(),
    fileUploadStatus: { 
      fileName: "employee_data.csv", 
      indexed: true, 
      rowCount: 22 
    }
  });

  const [sampleData] = useState([
    { name: "Arlen", age: 24, department: "engineering", joiningDate: "2021-09-18", city: "dlkdri", perf: 85 },
    { name: "Pallavi", age: 21, department: "sales", joiningDate: "2018-07-19", city: "dlkat", perf: 85 },
    { name: "Survi", age: 28, department: "marketing", joiningDate: "51015/", city: "hycr", perf: 85 },
    { name: "Vishu", age: 28, department: "sales", joiningDate: "2019-18-17", city: "hydra", perf: 85 },
    { name: "Phalavi", age: 28, department: "sales", joiningDate: "760000000", city: "hydra", perf: 85 }
  ]);

  const handleSend = () => {
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: query, timestamp }]);
      // Update agent status to simulate processing
    setAgentData(prev => ({
      ...prev,
      currentQuery: query,
      activeAgents: prev.activeAgents.map(agent => ({
        ...agent,
        status: agent.type === "planner" ? "working" as const : "idle" as const,
        startTime: agent.type === "planner" ? new Date().toISOString() : agent.startTime
      }))
    }));
    
    // Enhanced agent simulation with realistic processing stages
    const simulateAgentWorkflow = (userQuery: string) => {
      const stages = [
        { delay: 500, agentType: "planner", status: "working", message: "Planning analysis strategy..." },
        { delay: 1200, agentType: "insight", status: "working", message: "Extracting insights from data..." },
        { delay: 1800, agentType: "chart", status: "working", message: "Generating visualizations..." },
        { delay: 2200, agentType: "all", status: "complete", message: "Analysis complete!" }
      ];
    stages.forEach((stage) => {
      setTimeout(() => {
        setAgentData(prev => ({
          ...prev,
          activeAgents: prev.activeAgents.map(agent => {
            if (stage.agentType === "all") {
              return { ...agent, status: "complete" as const, endTime: new Date().toISOString() };
            }
            if (agent.type === stage.agentType) {
              return { 
                ...agent, 
                status: stage.status === "working" ? "working" as const : "complete" as const, 
                message: stage.message,
                startTime: stage.status === "working" ? new Date().toISOString() : agent.startTime,
                endTime: stage.status === "complete" ? new Date().toISOString() : agent.endTime
              };
            }
            return agent;
          })
        }));
      }, stage.delay);
    });
    };

    // Generate smart insights based on the query
    const generateSmartResponse = (userQuery: string) => {
      const queryLower = userQuery.toLowerCase();
      const avgAge = Math.round(sampleData.reduce((sum, emp) => sum + emp.age, 0) / sampleData.length);
      const departments = [...new Set(sampleData.map(emp => emp.department))];
      const totalEmployees = sampleData.length;

      if (queryLower.includes('age') || queryLower.includes('old')) {
        return `📊 **Age Analysis**: Your dataset contains ${totalEmployees} employees with an average age of ${avgAge} years. The age distribution shows most employees are in their mid-20s, indicating a young workforce.`;
      } else if (queryLower.includes('department') || queryLower.includes('team')) {
        return `🏢 **Department Breakdown**: I found ${departments.length} departments: ${departments.join(', ')}. Sales team has the highest representation with multiple team members.`;
      } else if (queryLower.includes('performance') || queryLower.includes('perf')) {
        return `⭐ **Performance Insights**: All employees maintain consistent performance scores around 85%. This suggests standardized evaluation criteria and strong team performance.`;
      } else if (queryLower.includes('salary') || queryLower.includes('compensation')) {
        return `💰 **Compensation Analysis**: Based on the data patterns, I can help analyze salary distributions across departments and experience levels. Upload more detailed compensation data for deeper insights.`;
      } else {
        return `🔍 **Data Overview**: Your dataset contains ${totalEmployees} employee records across ${departments.length} departments. Average age is ${avgAge} years with consistent performance ratings. I can analyze specific aspects like department distribution, age demographics, or performance trends. What would you like to explore?`;
      }
    };
    
    // Simulate AI processing
    setTimeout(() => {
      const responses = [
        `Your dataset describes ${sampleData.length} employees with an average age of ${Math.round(sampleData.reduce((sum, emp) => sum + emp.age, 0) / sampleData.length)}. The average salary is approximately $814177, and average performance score is ${sampleData[0].perf}.`,
        `Based on your query "${query}", I found interesting patterns in the employee data. The ${sampleData[0].department} department shows strong performance metrics.`,
        `Analyzing "${query}" - I notice the data contains employees from various departments including ${[...new Set(sampleData.map(emp => emp.department))].join(", ")}.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      }]);
        // Update agent status to completed
      setAgentData(prev => ({
        ...prev,
        activeAgents: prev.activeAgents.map(agent => ({
          ...agent,
          status: "complete" as const,
          endTime: new Date().toISOString()
        }))
      }));
      
      setIsLoading(false);
    }, 2000);
    
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Enterprise Insights Copilot
            </h1>
            <p className="text-gray-300">
              AI-Powered Business Intelligence Platform
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-12 gap-6">
            {/* Left Column - Chat Interface */}
            <div className="lg:col-span-5 space-y-6">
              {/* Copilot Chat */}
              <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-400/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center">
                    🤖
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Copilot</h3>
                  </div>
                  <div className="ml-auto w-10 h-10 bg-gray-400 rounded-full"></div>
                </div>

                {/* Upload Section */}
                <div className="bg-indigo-600/80 rounded-2xl p-6 mb-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white/20 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl">
                      📄
                    </div>
                    <h4 className="text-white font-medium mb-2">Upload CSV or Drag & Drop</h4>
                    <p className="text-blue-100 text-sm mb-4">📊 Rows indexed: {agentData.fileUploadStatus.rowCount}</p>
                    <div className="hidden">
                      <UploadFixed />
                    </div>
                  </div>
                </div>

                {/* Data Preview */}
                <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-white font-medium">Preview</span>
                    <span className="text-gray-300 text-sm">Preview (first 5 rows)</span>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-300 border-b border-white/20">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Age</th>
                          <th className="text-left p-2">Department</th>
                          <th className="text-left p-2">Joining Date</th>
                          <th className="text-left p-2">City</th>
                          <th className="text-left p-2">Perf</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleData.map((row, i) => (
                          <tr key={i} className="text-white border-b border-white/10">
                            <td className="p-2">{row.name}</td>
                            <td className="p-2">{row.age}</td>
                            <td className="p-2">{row.department}</td>
                            <td className="p-2">{row.joiningDate}</td>
                            <td className="p-2">{row.city}</td>
                            <td className="p-2">{row.perf}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question about your data..."
                    className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isLoading || !query.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="space-y-3">
                {messages.map((message, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center text-sm">
                        {message.role === 'assistant' ? '🤖' : '👤'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white font-medium text-sm">
                            {message.role === 'assistant' ? 'Copilot' : 'You'}
                          </span>
                          <span className="text-gray-400 text-xs">{message.timestamp}</span>
                        </div>
                        <p className="text-gray-200 text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center text-sm">
                        🤖
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                        <span className="text-gray-300 text-sm ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Agent Visualizer */}
            <div className="lg:col-span-7">
              <ProcessVisualizer
                currentQuery={agentData.currentQuery}
                activeAgents={agentData.activeAgents}
                fileUploadStatus={agentData.fileUploadStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}