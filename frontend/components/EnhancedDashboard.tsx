"use client";
import { useState } from "react";
import Link from "next/link";

interface AgentNodeProps {
  name: string;
  status?: string;
  icon: string;
}

interface TimelineStepProps {
  label: string;
  time: string;
  color: string;
  icon: string;
}

function AgentNode({ name, status, icon }: AgentNodeProps) {
  return (
    <div className={`rounded-xl px-4 py-3 font-medium text-sm bg-white/10 backdrop-blur-sm text-white border border-white/20 flex items-center gap-2 ${
      status === "alerting" ? "border-blue-400 animate-pulse shadow-lg shadow-blue-400/30" : ""
    }`}>
      <span className="text-lg">{icon}</span>
      <span>{name}</span>
    </div>
  );
}

function TimelineStep({ label, time, color, icon }: TimelineStepProps) {
  return (
    <div className={`flex items-center gap-3 mb-3 rounded-lg px-4 py-2 font-medium text-sm ${color} shadow-sm`}>
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="text-xs opacity-75">{time}</span>
    </div>
  );
}

export default function EnhancedDashboard() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Your dataset describes 22 employees with an average age of 32. The average salary is approximately $414,187, and average performance score is 85.4.",
      timestamp: "09:45:12"
    },
    {
      role: "assistant", 
      content: "I've analyzed your HR data. The Engineering department has the highest average salary at $530,000, while Sales shows strong performance metrics across all age groups.",
      timestamp: "09:46:23"
    }
  ]);
  const sampleData = [
    { name: "Adun", age: 24, department: "Engineering", joinDate: "2021-04-18", salary: "530000", perf: 85, efficiency: 92 },
    { name: "Pallayi", age: 21, department: "Sales", joinDate: "2018-07-19", salary: "230000", perf: 85, efficiency: 88 },
    { name: "Sundi", age: 24, department: "Marketing", joinDate: "2019-03-15", salary: "180000", perf: 92, efficiency: 95 },
    { name: "Vishul", age: 23, department: "Sales", joinDate: "2020-05-17", salary: "500000", perf: 88, efficiency: 90 },
    { name: "Phalavi", age: 23, department: "Sales", joinDate: "2019-08-10", salary: "275000", perf: 91, efficiency: 89 },
  ];

  const agentSteps = [
    { name: "Planning Agent", status: "completed", progress: 100 },
    { name: "Data Analyzer", status: "running", progress: 75 },
    { name: "Insight Generator", status: "waiting", progress: 0 },
    { name: "Chart Creator", status: "waiting", progress: 0 },
  ];
  const handleSend = () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: query, timestamp }]);
    
    // Simulate AI processing with realistic delay
    setTimeout(() => {
      const responses = [
        `Based on your question "${query}", I found interesting correlations in your dataset. The Engineering department shows 23% higher efficiency ratings compared to other departments.`,
        `Analyzing "${query}" - I notice a strong positive correlation between tenure and performance scores. Employees with 3+ years show consistently higher ratings.`,
        `Your query about "${query}" reveals that salary ranges vary significantly by department, with Engineering and Sales leading in compensation packages.`,
        `Regarding "${query}" - The data suggests seasonal hiring patterns, with most employees joining in Q2 and Q3, which correlates with performance metrics.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: randomResponse,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
      }]);
      
      setIsLoading(false);
    }, 1500);
    
    setQuery("");
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#0a0a23] flex flex-col font-sans overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Enhanced Header with Glassmorphic Effect */}
      <header className="relative flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-xl bg-white/5 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-2xl h-12 w-12 flex items-center justify-center text-white text-xl shadow-2xl border border-white/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <span className="relative z-10">🤖</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Enterprise Insights Copilot
            </h1>
            <p className="text-xs text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              AI-Powered Business Intelligence • Live
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Status Indicators */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-300 font-medium">22 Records</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-300 font-medium">3 Agents Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/project" className="text-sm text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
              <span>📊</span>
              <span>Analysis</span>
            </Link>
            <Link href="/architecture" className="text-sm text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10">
              <span>🏗️</span>
              <span>Architecture</span>
            </Link>
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 border-2 border-white/20 overflow-hidden shadow-xl relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
              <div className="w-full h-full flex items-center justify-center text-white font-bold relative z-10">
                U
              </div>
            </div>
          </div>
        </div>
      </header>      {/* Main Content with Enhanced Layout */}
      <main className="relative flex-1 flex items-start justify-center gap-8 px-8 py-8 z-10">
        {/* Left Column - Enhanced with Modern Cards */}
        <section className="w-[580px] flex flex-col gap-6">
          {/* Upload Card with Ultra-Modern Design */}
          <div className="group relative rounded-3xl bg-gradient-to-br from-[#4E3CFA]/90 via-[#377DFF]/90 to-[#3332b5]/90 p-8 shadow-2xl border border-white/20 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8 mb-6 shadow-2xl border border-white/30 group-hover:scale-110 transition-transform duration-500">
                <span className="text-7xl">📤</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 group-hover:text-blue-100 transition-colors duration-300">
                Upload CSV or Drag & Drop
              </h3>
              <p className="text-blue-100 mb-6 text-lg">Instantly analyze your business data with AI</p>
              
              {/* Enhanced Success Badge */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-sm px-6 py-3 rounded-2xl border border-green-400/40 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="text-green-200 font-semibold text-sm">✓ 22 Rows Indexed Successfully</span>
                </div>
                <div className="w-px h-4 bg-green-400/30"></div>
                <span className="text-green-300 text-xs">Processing Time: 1.2s</span>
              </div>
            </div>
          </div>

          {/* Enhanced Data Table with Premium Design */}
          <div className="rounded-3xl bg-white/8 backdrop-blur-xl p-8 shadow-2xl border border-white/15 hover:border-white/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <span className="text-2xl">📊</span>
                </div>
                Data Preview
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>Showing 5 of 22 records</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-2xl bg-black/20 border border-white/10">
              <table className="w-full text-sm text-left text-gray-100">
                <thead>
                  <tr className="border-b border-white/20 bg-white/5">
                    <th className="px-4 py-4 font-semibold text-gray-300">Name</th>
                    <th className="px-4 py-4 font-semibold text-gray-300">Age</th>
                    <th className="px-4 py-4 font-semibold text-gray-300">Department</th>
                    <th className="px-4 py-4 font-semibold text-gray-300">Join Date</th>
                    <th className="px-4 py-4 font-semibold text-gray-300">Salary</th>
                    <th className="px-4 py-4 font-semibold text-gray-300">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleData.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/10 transition-all duration-200 group">
                      <td className="px-4 py-4 text-white font-medium group-hover:text-blue-300 transition-colors">{row.name}</td>
                      <td className="px-4 py-4 text-gray-300">{row.age}</td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-medium shadow-lg border ${
                          row.department === 'Engineering' ? 'bg-blue-500/25 text-blue-300 border-blue-400/30' :
                          row.department === 'Sales' ? 'bg-green-500/25 text-green-300 border-green-400/30' :
                          'bg-purple-500/25 text-purple-300 border-purple-400/30'
                        }`}>
                          {row.department}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-400 font-mono text-xs">{row.joinDate}</td>
                      <td className="px-4 py-4 text-green-300 font-semibold">${parseInt(row.salary).toLocaleString()}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-12 h-2 rounded-full overflow-hidden ${
                            row.perf >= 90 ? 'bg-green-900/50' : row.perf >= 85 ? 'bg-yellow-900/50' : 'bg-red-900/50'
                          }`}>
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                row.perf >= 90 ? 'bg-green-400' : row.perf >= 85 ? 'bg-yellow-400' : 'bg-red-400'
                              }`}
                              style={{width: `${row.perf}%`}}
                            ></div>
                          </div>
                          <span className={`font-semibold text-sm ${
                            row.perf >= 90 ? 'text-green-400' : row.perf >= 85 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {row.perf}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Chat Input with Loading States */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                disabled={isLoading}
                className="w-full rounded-2xl px-6 py-4 bg-black/40 backdrop-blur-sm text-white border border-white/20 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all placeholder-gray-400 disabled:opacity-50"
                placeholder={isLoading ? "AI is thinking..." : "Ask a question about your data..."}
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button 
              onClick={handleSend}
              disabled={isLoading || !query.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl px-8 py-4 font-semibold text-white shadow-2xl hover:shadow-3xl transition-all border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                <span>Send</span>
              )}
            </button>
          </div>

          {/* Enhanced Chat Messages with Better Design */}
          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {messages.map((message, i) => (
              <div key={i} className={`group rounded-3xl p-6 flex gap-4 shadow-xl border transition-all duration-300 hover:scale-[1.01] ${
                message.role === 'assistant' 
                  ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border-blue-400/30 hover:border-blue-400/50' 
                  : 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border-white/20 hover:border-white/30'
              }`}>
                <div className={`text-4xl p-2 rounded-2xl ${
                  message.role === 'assistant' 
                    ? 'bg-blue-500/20 border border-blue-400/30' 
                    : 'bg-white/20 border border-white/30'
                }`}>
                  {message.role === 'assistant' ? '🤖' : '👤'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-white">
                      {message.role === 'assistant' ? 'AI Copilot' : 'You'}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {message.timestamp}
                    </div>
                  </div>
                  <div className="text-gray-200 leading-relaxed">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="rounded-3xl p-6 flex gap-4 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm border border-blue-400/30 shadow-xl">
                <div className="text-4xl p-2 rounded-2xl bg-blue-500/20 border border-blue-400/30">
                  🤖
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white mb-2">AI Copilot</div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                    <span>Analyzing your data...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>        {/* Right Column - Ultra-Enhanced Agent Monitoring */}
        <section className="w-[450px] flex flex-col gap-6">
          {/* Real-time Agent Status with Advanced Monitoring */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-8 shadow-2xl border border-white/15 hover:border-white/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl border border-green-400/30">
                  <span className="text-2xl">🎯</span>
                </div>
                Agent Process Monitor
              </h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-xs font-medium">Live</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {agentSteps.map((agent, index) => (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        agent.status === 'completed' ? 'bg-green-400 shadow-lg shadow-green-400/50' :
                        agent.status === 'running' ? 'bg-yellow-400 animate-pulse shadow-lg shadow-yellow-400/50' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-white font-medium group-hover:text-blue-300 transition-colors">
                        {agent.name}
                      </span>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      agent.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                      agent.status === 'running' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${
                        agent.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                        agent.status === 'running' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        'bg-gray-600'
                      }`}
                      style={{width: `${agent.progress}%`}}
                    ></div>
                  </div>
                  
                  {agent.status === 'running' && (
                    <div className="text-xs text-gray-400 mt-1">Processing... {agent.progress}%</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Agent Flow Visualization */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-8 shadow-2xl border border-white/15 hover:border-white/25 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                <span className="text-2xl">🔄</span>
              </div>
              Agent Flow Diagram
            </h3>
            
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <AgentNode name="Planning Generator" icon="🧠" />
                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white/20">
                  <span className="text-xs">✓</span>
                </div>
              </div>
              
              {/* Enhanced Connection Lines */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-px h-6 bg-gradient-to-b from-green-400 via-blue-400 to-purple-400"></div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-8 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
                </div>
                <div className="w-px h-6 bg-gradient-to-b from-purple-400 via-blue-400 to-green-400"></div>
              </div>
              
              <div className="flex gap-8">
                <div className="relative">
                  <AgentNode name="Insight Generator" icon="💡" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-white/20 animate-pulse">
                    <span className="text-xs">⚡</span>
                  </div>
                </div>
                <div className="relative">
                  <AgentNode name="Chart Agent" status="alerting" icon="📊" />
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white/20 animate-bounce">
                    <span className="text-xs">⏳</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Timeline with Enhanced Design */}
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-8 shadow-2xl border border-white/15 hover:border-white/25 transition-all duration-300">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-xl border border-indigo-400/30">
                <span className="text-2xl">⏱️</span>
              </div>
              Agent Activity Timeline
            </h3>
            
            <div className="space-y-3 relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400"></div>
              
              <TimelineStep 
                label="Planning Agent Started" 
                time="00:01:04" 
                color="bg-gradient-to-r from-pink-500/15 to-purple-500/15 text-pink-200 border border-pink-400/30" 
                icon="🚀"
              />
              <TimelineStep 
                label="Data Analysis Completed" 
                time="00:03:03" 
                color="bg-gradient-to-r from-pink-500/15 to-purple-500/15 text-pink-200 border border-pink-400/30" 
                icon="✅"
              />
              <TimelineStep 
                label="Insight Generator Active" 
                time="00:04:15" 
                color="bg-gradient-to-r from-yellow-500/15 to-orange-500/15 text-yellow-200 border border-yellow-400/30" 
                icon="⚡"
              />
              <TimelineStep 
                label="Chart Agent Initializing" 
                time="00:04:20" 
                color="bg-gradient-to-r from-blue-500/15 to-cyan-500/15 text-blue-200 border border-blue-400/30" 
                icon="🔄"
              />
              <TimelineStep 
                label="Processing User Query" 
                time="00:04:45" 
                color="bg-gradient-to-r from-green-500/15 to-emerald-500/15 text-green-200 border border-green-400/30" 
                icon="🤔"
              />
            </div>
          </div>

          {/* System Metrics Card */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-xl p-6 shadow-2xl border border-indigo-400/30">
            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📈</span>
              System Performance
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-green-400">99.7%</div>
                <div className="text-xs text-gray-300">Uptime</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-blue-400">1.2s</div>
                <div className="text-xs text-gray-300">Avg Response</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-purple-400">256</div>
                <div className="text-xs text-gray-300">Queries Today</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 text-center border border-white/20">
                <div className="text-2xl font-bold text-yellow-400">3</div>
                <div className="text-xs text-gray-300">Active Agents</div>
              </div>
            </div>
          </div>
        </section>
      </main>      {/* Premium Footer with Enhanced Design */}
      <footer className="relative text-sm text-gray-400 px-8 py-8 border-t border-white/10 backdrop-blur-xl bg-white/5 z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span>Built with</span>
              <span className="text-red-400 animate-pulse">❤️</span>
              <span>by Enterprise AI Team</span>
            </div>
            <div className="hidden md:block w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-emerald-300 text-xs font-medium">All Systems Operational</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-white transition-all duration-300 flex items-center gap-1 hover:scale-105">
              <span>🔒</span>
              <span>Privacy Policy</span>
            </Link>
            <span className="text-gray-600 hidden md:inline">•</span>
            <Link href="#" className="hover:text-white transition-all duration-300 flex items-center gap-1 hover:scale-105">
              <span>💬</span>
              <span>Feedback</span>
            </Link>
            <span className="text-gray-600 hidden md:inline">•</span>
            <Link href="#" className="hover:text-white transition-all duration-300 flex items-center gap-1 hover:scale-105">
              <span>📚</span>
              <span>Documentation</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-gray-500 font-mono text-xs">
              v2.1.0 • Enterprise Edition
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 text-xs font-medium">Secure Connection</span>
            </div>
          </div>
        </div>
        
        {/* Performance Indicators */}
        <div className="flex justify-center mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center gap-8 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">API Latency:</span>
              <span className="text-green-400 font-mono">23ms</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Memory Usage:</span>
              <span className="text-blue-400 font-mono">234MB</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Active Sessions:</span>
              <span className="text-purple-400 font-mono">127</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Load Avg:</span>
              <span className="text-yellow-400 font-mono">0.45</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
