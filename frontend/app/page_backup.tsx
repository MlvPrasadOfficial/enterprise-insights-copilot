"use client";
import { useState } from "react";
import UploadFixed from "../components/Upload_fixed";
import ProcessVisualizerSimple from "../components/ProcessVisualizer_simple";
import Link from "next/link";

export default function HomePage() {
  const [agentData] = useState({
    activeAgents: [] as any[],
    currentQuery: "",
    sessionId: "default",
    fileUploadStatus: { fileName: "", indexed: false, rowCount: 0 }
  });

  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Welcome! Upload your CSV data and I'll help you analyze it with natural language queries.",
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false })
    }
  ]);

  const sampleData = [
    { name: "Adun", age: 24, department: "Engineering", joinDate: "2021-04-18", salary: "530000", perf: 85 },
    { name: "Pallayi", age: 21, department: "Sales", joinDate: "2018-07-19", salary: "230000", perf: 85 },
    { name: "Sundi", age: 24, department: "Marketing", joinDate: "2019-03-15", salary: "180000", perf: 92 },
    { name: "Vishul", age: 23, department: "Sales", joinDate: "2020-05-17", salary: "500000", perf: 88 },
    { name: "Phalavi", age: 23, department: "Sales", joinDate: "2019-08-10", salary: "275000", perf: 91 },
  ];

  const agentSteps = [
    { name: "Planning Agent", status: "completed", progress: 100, icon: "🧠" },
    { name: "Data Analyzer", status: "running", progress: 75, icon: "📊" },
    { name: "Insight Generator", status: "waiting", progress: 0, icon: "💡" },
    { name: "Chart Creator", status: "waiting", progress: 0, icon: "📈" },
  ];

  const handleSend = () => {
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
    
    // Add user message
    setMessages(prev => [...prev, { role: "user", content: query, timestamp }]);
    
    // Simulate AI processing with realistic delay
    setTimeout(() => {
      const responses = [
        `Based on your question "${query}", I found interesting correlations in your dataset. The Engineering department shows 23% higher efficiency ratings.`,
        `Analyzing "${query}" - I notice a strong positive correlation between tenure and performance scores. Employees with 3+ years show consistently higher ratings.`,
        `Your query about "${query}" reveals that salary ranges vary significantly by department, with Engineering and Sales leading in compensation.`,
        `Regarding "${query}" - The data suggests seasonal hiring patterns, with most employees joining in Q2 and Q3.`
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-8 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Enterprise Insights Copilot
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-Powered Conversational Business Intelligence Platform with Multi-Agent Orchestration
          </p>
          
          {/* Quick Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Link 
              href="/project"
              className="px-6 py-3 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-xl transition-all duration-300 font-medium backdrop-blur-sm border border-blue-500/50 hover:border-blue-400/60 shadow-lg flex items-center space-x-2"
            >
              <span>📊</span>
              <span>View Project Analysis</span>
            </Link>
            <Link 
              href="/architecture"
              className="px-6 py-3 bg-purple-600/80 hover:bg-purple-500/80 text-white rounded-xl transition-all duration-300 font-medium backdrop-blur-sm border border-purple-500/50 hover:border-purple-400/60 shadow-lg flex items-center space-x-2"
            >
              <span>🏗️</span>
              <span>Explore Architecture</span>
            </Link>
            <button 
              onClick={() => {
                // Scroll to dashboard section
                document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-500/80 hover:to-purple-500/80 text-white rounded-xl transition-all duration-300 font-medium backdrop-blur-sm border border-indigo-500/50 hover:border-indigo-400/60 shadow-lg flex items-center space-x-2"
            >
              <span>✨</span>
              <span>Try Live Demo</span>
            </button>
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                🤖
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Multi-Agent System</h3>
              <p className="text-gray-300 text-sm">
                Specialized AI agents for charts, SQL, insights, and data processing with LangGraph orchestration
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                💬
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Conversational BI</h3>
              <p className="text-gray-300 text-sm">
                Natural language queries with RAG-powered responses using OpenAI GPT-4 and Pinecone vector store
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all duration-300">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl">
                📊
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Visualizations</h3>
              <p className="text-gray-300 text-sm">
                Automatic chart generation with intelligent axis selection and real-time data insights
              </p>
            </div>
          </div>
        </div>

        {/* Main Application Interface - Enhanced Design */}
        <div id="dashboard-section" className="grid lg:grid-cols-8 gap-8 mb-16">
          {/* Left Column - Enhanced Chat Interface */}
          <div className="lg:col-span-5 space-y-6">
            {/* Chat Messages */}
            <div className="rounded-3xl bg-white/8 backdrop-blur-xl p-6 shadow-2xl border border-white/15 h-80">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-xl border border-green-400/30">
                  <span className="text-xl">💬</span>
                </div>
                AI Assistant
              </h3>
              
              <div className="space-y-3 h-48 overflow-y-auto custom-scrollbar">
                {messages.map((message, i) => (
                  <div key={i} className={`rounded-2xl p-4 flex gap-3 transition-all duration-300 ${
                    message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-400/30' 
                      : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20'
                  }`}>
                    <div className={`text-2xl p-1 rounded-xl ${
                      message.role === 'assistant' 
                        ? 'bg-blue-500/20' 
                        : 'bg-white/20'
                    }`}>
                      {message.role === 'assistant' ? '🤖' : '👤'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-white text-sm">
                          {message.role === 'assistant' ? 'AI Copilot' : 'You'}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {message.timestamp}
                        </div>
                      </div>
                      <div className="text-gray-200 text-sm leading-relaxed">{message.content}</div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="rounded-2xl p-4 flex gap-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-400/30">
                    <div className="text-2xl p-1 rounded-xl bg-blue-500/20">🤖</div>
                    <div className="flex-1">
                      <div className="font-medium text-white text-sm mb-1">AI Copilot</div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                        </div>
                        <span>Analyzing your data...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Chat Input */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  disabled={isLoading}
                  className="w-full rounded-2xl px-4 py-3 bg-black/40 backdrop-blur-sm text-white border border-white/20 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all placeholder-gray-400 disabled:opacity-50"
                  placeholder={isLoading ? "AI is thinking..." : "Ask about your data..."}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <button 
                onClick={handleSend}
                disabled={isLoading || !query.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl px-6 py-3 font-semibold text-white shadow-2xl hover:shadow-3xl transition-all border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Sending</span>
                  </div>
                ) : (
                  <span className="text-sm">Send</span>
                )}
              </button>
            </div>
          </div>

          {/* Upload Section */}
          <div className="group relative rounded-3xl bg-gradient-to-br from-indigo-600/90 via-blue-500/90 to-indigo-700/90 p-6 shadow-2xl border border-white/20 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <UploadFixed />
            </div>
          </div>

          {/* Data Preview */}
          <div className="rounded-3xl bg-white/8 backdrop-blur-xl p-6 shadow-2xl border border-white/15 hover:border-white/25 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
                  <span className="text-xl">📊</span>
                </div>
                Data Preview
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>5 of 22 records</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-2xl bg-black/20 border border-white/10">
              <table className="w-full text-xs text-left text-gray-100">
                <thead>
                  <tr className="border-b border-white/20 bg-white/5">
                    <th className="px-3 py-3 font-semibold text-gray-300">Name</th>
                    <th className="px-3 py-3 font-semibold text-gray-300">Dept</th>
                    <th className="px-3 py-3 font-semibold text-gray-300">Perf</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleData.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/10 transition-all duration-200">
                      <td className="px-3 py-3 text-white font-medium">{row.name}</td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          row.department === 'Engineering' ? 'bg-blue-500/25 text-blue-300' :
                          row.department === 'Sales' ? 'bg-green-500/25 text-green-300' :
                          'bg-purple-500/25 text-purple-300'
                        }`}>
                          {row.department}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-1.5 rounded-full overflow-hidden ${
                            row.perf >= 90 ? 'bg-green-900/50' : 'bg-yellow-900/50'
                          }`}>
                            <div 
                              className={`h-full rounded-full ${
                                row.perf >= 90 ? 'bg-green-400' : 'bg-yellow-400'
                              }`}
                              style={{ width: `${row.perf}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-300">{row.perf}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - Agent Monitoring */}
        <div className="lg:col-span-3 space-y-6">
            {/* Agent Status */}
            <div className="rounded-3xl bg-white/10 backdrop-blur-xl p-6 shadow-2xl border border-white/15">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <div className="p-1 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg">
                    <span className="text-lg">🎯</span>
                  </div>
                  Agents
                </h3>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 border border-green-400/30">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-300 text-xs font-medium">Live</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {agentSteps.map((agent, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{agent.icon}</span>
                        <span className="text-white font-medium text-sm">{agent.name}</span>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        agent.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        agent.status === 'running' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {agent.status}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${
                          agent.status === 'completed' ? 'bg-gradient-to-r from-green-400 to-green-500' :
                          agent.status === 'running' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          'bg-gray-600'
                        }`}
                        style={{ width: `${agent.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Legacy Process Visualizer */}
            <div className="rounded-3xl bg-white/5 backdrop-blur-sm p-4 border border-white/10">
              <ProcessVisualizerSimple 
                currentQuery={agentData.currentQuery}
                activeAgents={agentData.activeAgents}
                fileUploadStatus={agentData.fileUploadStatus}
              />
            </div>
          </div>
        </div>

        {/* Technology Stack Preview */}
        <div className="mt-16 bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Technology Stack</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">Backend Infrastructure</h3>
              <div className="space-y-2">
                {[
                  "🐍 FastAPI + Python 3.12",
                  "🧠 OpenAI GPT-4 + LangChain",
                  "🌲 Pinecone Vector Database",
                  "📊 Pandas + Altair Charts",
                  "🔄 LangGraph Multi-Agent"
                ].map((item) => (
                  <div key={item} className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">Frontend Experience</h3>
              <div className="space-y-2">
                {[
                  "⚛️ Next.js 15 + React 19",
                  "🎨 TailwindCSS + Glassmorphism",
                  "📱 Responsive Design",
                  "🔄 Real-time Agent Status",
                  "💻 TypeScript + Modern Tools"
                ].map((item) => (
                  <div key={item} className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
                    <span className="text-sm text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Explore?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Upload your CSV data and start asking questions in natural language. 
              Our AI agents will analyze, visualize, and provide insights automatically.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                href="/project"
                className="px-8 py-3 bg-blue-600/80 hover:bg-blue-500/80 text-white rounded-xl transition-all duration-300 font-medium backdrop-blur-sm border border-blue-500/50 hover:border-blue-400/60 shadow-lg"
              >
                📊 View Detailed Analysis
              </Link>
              <Link 
                href="/architecture"
                className="px-8 py-3 bg-purple-600/80 hover:bg-purple-500/80 text-white rounded-xl transition-all duration-300 font-medium backdrop-blur-sm border border-purple-500/50 hover:border-purple-400/60 shadow-lg"
              >
                🏗️ Explore System Design
              </Link>
            </div>
          </div>
        </div>

        {/* Premium Footer */}
        <footer className="mt-16 text-sm text-gray-400 px-8 py-8 border-t border-white/10 backdrop-blur-xl bg-white/5">
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
        </footer>
      </div>
    </div>
  );
}
