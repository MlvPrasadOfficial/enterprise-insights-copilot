"use client";
import { useState } from "react";
import PageBackground from "../../components/PageBackground";

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const tabs = [
    { id: "overview", title: "🏗️ System Architecture", icon: "🏗️" },
    { id: "workflow", title: "🔄 Complete Workflow", icon: "🔄" },
    { id: "agents", title: "🤖 Agent Architecture", icon: "🤖" },
    { id: "tech", title: "⚙️ Tech Stack", icon: "⚙️" },
  ];

  const renderWorkflow = () => (
    <div className="space-y-8">
      {/* Main Workflow Diagram */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          🔄 Enterprise Insights Copilot - Complete Workflow
        </h3>
        
        <div className="relative">
          {/* Step 1: File Upload */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl border border-blue-400/50">
              📤
            </div>
            <div className="mt-3 text-center">
              <h4 className="text-white font-semibold">1. File Upload</h4>
              <p className="text-gray-300 text-sm">User uploads CSV file</p>
            </div>
            <div className="w-1 h-12 bg-gradient-to-b from-blue-400 to-green-400 mt-4"></div>
          </div>

          {/* Step 2: Data Processing */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-20 h-20 rounded-xl flex items-center justify-center text-white text-xl shadow-lg border border-green-400/50">
                🧹
              </div>
              <div className="mt-2 text-center">
                <h5 className="text-white font-medium text-sm">Data Cleaning</h5>
                <p className="text-gray-400 text-xs">DataCleanerAgent</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-xl flex items-center justify-center text-white text-xl shadow-lg border border-purple-400/50">
                🌲
              </div>
              <div className="mt-2 text-center">
                <h5 className="text-white font-medium text-sm">Vector Store</h5>
                <p className="text-gray-400 text-xs">Pinecone Indexing</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-20 h-20 rounded-xl flex items-center justify-center text-white text-xl shadow-lg border border-orange-400/50">
                💾
              </div>
              <div className="mt-2 text-center">
                <h5 className="text-white font-medium text-sm">Memory Storage</h5>
                <p className="text-gray-400 text-xs">Session DataFrame</p>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center mb-8">
            <div className="w-1 h-12 bg-gradient-to-b from-green-400 to-yellow-400"></div>
          </div>

          {/* Step 3: User Query */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl border border-yellow-400/50">
              💬
            </div>
            <div className="mt-3 text-center">
              <h4 className="text-white font-semibold">2. User Query</h4>
              <p className="text-gray-300 text-sm">Natural language question</p>
            </div>
            <div className="w-1 h-12 bg-gradient-to-b from-yellow-400 to-purple-400 mt-4"></div>
          </div>

          {/* Step 4: Agent Orchestration */}
          <div className="bg-gray-800/50 rounded-2xl p-6 border border-white/20 mb-8">
            <h4 className="text-white font-semibold text-center mb-4">3. Agent Orchestration (LangGraph)</h4>
            
            <div className="flex flex-col items-center space-y-6">
              {/* Planner Agent */}
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 w-20 h-20 rounded-xl flex items-center justify-center text-white text-xl shadow-lg border border-purple-400/50">
                  🧠
                </div>
                <div className="mt-2 text-center">
                  <h5 className="text-white font-medium">Planning Agent</h5>
                  <p className="text-gray-400 text-xs">Analyzes query & routes</p>
                </div>
              </div>

              {/* Routing Arrows */}
              <div className="grid md:grid-cols-3 gap-8 w-full">
                {/* Chart Route */}
                <div className="flex flex-col items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-blue-400"></div>
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-lg flex items-center justify-center text-white shadow-lg border border-blue-400/50">
                    📊
                  </div>
                  <div className="mt-2 text-center">
                    <h6 className="text-white text-sm font-medium">Chart Agent</h6>
                    <p className="text-gray-400 text-xs">Visualization</p>
                  </div>
                </div>

                {/* SQL Route */}
                <div className="flex flex-col items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-green-400"></div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-lg flex items-center justify-center text-white shadow-lg border border-green-400/50">
                    🗃️
                  </div>
                  <div className="mt-2 text-center">
                    <h6 className="text-white text-sm font-medium">SQL Agent</h6>
                    <p className="text-gray-400 text-xs">Query Generation</p>
                  </div>
                </div>

                {/* Insight Route */}
                <div className="flex flex-col items-center">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-amber-400"></div>
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 w-16 h-16 rounded-lg flex items-center justify-center text-white shadow-lg border border-amber-400/50">
                    💡
                  </div>
                  <div className="mt-2 text-center">
                    <h6 className="text-white text-sm font-medium">Insight Agent</h6>
                    <p className="text-gray-400 text-xs">Analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center mb-8">
            <div className="w-1 h-12 bg-gradient-to-b from-purple-400 to-pink-400"></div>
          </div>

          {/* Step 5: Quality Control */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl border border-pink-400/50">
              📝
            </div>
            <div className="mt-3 text-center">
              <h4 className="text-white font-semibold">4. Quality Control</h4>
              <p className="text-gray-300 text-sm">CritiqueAgent validates results</p>
            </div>
            <div className="w-1 h-12 bg-gradient-to-b from-pink-400 to-indigo-400 mt-4"></div>
          </div>

          {/* Step 6: Frontend Display */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-24 h-24 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl border border-indigo-400/50">
              🖥️
            </div>
            <div className="mt-3 text-center">
              <h4 className="text-white font-semibold">5. Frontend Display</h4>
              <p className="text-gray-300 text-sm">Real-time UI updates with results</p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Flow Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <span>📊</span>
            <span>Data Processing Pipeline</span>
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-blue-400">1.</span>
              <span className="text-gray-300">CSV Upload → FastAPI Endpoint</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-green-400">2.</span>
              <span className="text-gray-300">Data Validation & Cleaning</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-purple-400">3.</span>
              <span className="text-gray-300">Vector Embeddings (OpenAI)</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-orange-400">4.</span>
              <span className="text-gray-300">Pinecone Index Storage</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-red-400">5.</span>
              <span className="text-gray-300">Session Memory Update</span>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
          <h4 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <span>🤖</span>
            <span>Agent Decision Flow</span>
          </h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-yellow-400">1.</span>
              <span className="text-gray-300">Query Analysis & Intent Detection</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-blue-400">2.</span>
              <span className="text-gray-300">Agent Selection via LangGraph</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-green-400">3.</span>
              <span className="text-gray-300">Specialized Processing</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-pink-400">4.</span>
              <span className="text-gray-300">Response Validation</span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded-lg">
              <span className="text-indigo-400">5.</span>
              <span className="text-gray-300">Frontend Rendering</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-8">
      {/* Comprehensive Agent Overview */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          🤖 Advanced Multi-Agent Architecture - Complete Analysis
        </h3>
        
        {/* Agent Statistics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
            <div className="text-2xl font-bold text-blue-400">15+</div>
            <div className="text-white text-sm">Specialized Agents</div>
          </div>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
            <div className="text-2xl font-bold text-green-400">1,059</div>
            <div className="text-white text-sm">Lines in main.py</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-400/30">
            <div className="text-2xl font-bold text-purple-400">403</div>
            <div className="text-white text-sm">Lines in ChartAgent</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-400/30">
            <div className="text-2xl font-bold text-orange-400">LangGraph</div>
            <div className="text-white text-sm">Orchestration Engine</div>
          </div>
        </div>

        {/* Detailed Agent Breakdown */}
        <div className="space-y-6">
          {/* Core Orchestration */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-white/20">
            <h4 className="text-xl font-semibold text-blue-400 mb-4 flex items-center space-x-2">
              <span>🧠</span>
              <span>Core Orchestration Layer</span>
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h5 className="text-white font-medium">Planning Agent (router.py)</h5>
                  <p className="text-gray-300 text-sm mt-1">Advanced query analysis and routing decisions</p>
                  <div className="flex space-x-2 mt-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">Intent Classification</span>
                    <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">Dynamic Routing</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h5 className="text-white font-medium">LangGraph Coordinator</h5>
                  <p className="text-gray-300 text-sm mt-1">State management and workflow orchestration</p>
                  <div className="flex space-x-2 mt-2">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded">State Graphs</span>
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">Parallel Execution</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h5 className="text-white font-medium">Memory Manager</h5>
                  <p className="text-gray-300 text-sm mt-1">Session state and conversation context</p>
                  <div className="flex space-x-2 mt-2">
                    <span className="px-2 py-1 bg-teal-500/20 text-teal-300 text-xs rounded">Session Persistence</span>
                    <span className="px-2 py-1 bg-pink-500/20 text-pink-300 text-xs rounded">Context Tracking</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h5 className="text-white font-medium">Error Handler</h5>
                  <p className="text-gray-300 text-sm mt-1">Graceful fallback and recovery mechanisms</p>
                  <div className="flex space-x-2 mt-2">
                    <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">Exception Handling</span>
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">Retry Logic</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Specialized Processing Agents */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-white/20">
            <h4 className="text-xl font-semibold text-green-400 mb-4 flex items-center space-x-2">
              <span>⚡</span>
              <span>Specialized Processing Agents</span>
            </h4>            <div className="grid md:grid-cols-3 gap-4">
              {[
                {
                  name: "ChartAgent",
                  file: "chart_agent.py",
                  lines: "403 lines",
                  icon: "📊",
                  color: "from-blue-500 to-cyan-500",
                  features: ["Smart axis selection", "Interactive Altair charts", "Auto-scaling", "Multi-format export"],
                  description: "Advanced visualization with intelligent chart type selection"
                },
                {
                  name: "SQLAgent", 
                  file: "sql_agent.py",
                  lines: "285 lines",
                  icon: "🗃️",
                  color: "from-green-500 to-emerald-500",
                  features: ["Natural language parsing", "SQL generation", "Query optimization", "Safety validation"],
                  description: "Natural language to SQL with security validation"
                },
                {
                  name: "InsightAgent",
                  file: "insight_agent.py", 
                  lines: "320 lines",
                  icon: "💡",
                  color: "from-amber-500 to-orange-500",
                  features: ["Statistical analysis", "Pattern detection", "Correlation analysis", "Trend identification"],
                  description: "Automated pattern discovery and statistical insights"
                },
                {
                  name: "DataCleanerAgent",
                  file: "data_cleaner.py",
                  lines: "245 lines", 
                  icon: "🧹",
                  color: "from-teal-500 to-green-500",
                  features: ["Missing value handling", "Type inference", "Outlier detection", "Data validation"],
                  description: "Intelligent data preprocessing and quality assurance"
                },
                {
                  name: "CritiqueAgent",
                  file: "critique_agent.py",
                  lines: "180 lines",
                  icon: "📝", 
                  color: "from-pink-500 to-rose-500",
                  features: ["Response evaluation", "Quality scoring", "Accuracy validation", "Improvement suggestions"],
                  description: "Quality control and response validation system"
                },
                {
                  name: "ReportGenerator",
                  file: "report_generator.py",
                  lines: "225 lines",
                  icon: "📄",
                  color: "from-indigo-500 to-blue-500",
                  features: ["PDF generation", "Template system", "Chart embedding", "Executive summaries"],
                  description: "Professional PDF reports with embedded visualizations"
                }
              ].map((agent) => (
                <div key={agent.name} className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${agent.color} flex items-center justify-center text-white text-xl shadow-lg`}>
                      {agent.icon}
                    </div>
                    <div>
                      <h5 className="text-white font-medium">{agent.name}</h5>
                      <p className="text-gray-400 text-xs">{agent.file} • {agent.lines}</p>
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">{agent.description}</p>
                  <div className="space-y-1">
                    {agent.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                        <span className="text-gray-400 text-xs">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Agent Features */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-white/20">
            <h4 className="text-xl font-semibold text-purple-400 mb-4 flex items-center space-x-2">
              <span>🚀</span>
              <span>Advanced Agent Capabilities</span>
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h5 className="text-white font-medium mb-2">🔄 Dynamic Agent Coordination</h5>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• LangGraph-based workflow orchestration</li>
                    <li>• Conditional routing based on query complexity</li>
                    <li>• Parallel agent execution for performance</li>
                    <li>• Smart caching and result memoization</li>
                  </ul>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h5 className="text-white font-medium mb-2">🧠 Context-Aware Processing</h5>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Session memory across conversations</li>
                    <li>• Data schema understanding</li>
                    <li>• Previous query context awareness</li>
                    <li>• User preference learning</li>
                  </ul>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h5 className="text-white font-medium mb-2">📊 Intelligent Data Processing</h5>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Automatic data type inference</li>
                    <li>• Smart missing value imputation</li>
                    <li>• Outlier detection and handling</li>
                    <li>• Statistical distribution analysis</li>
                  </ul>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border border-white/10">
                  <h5 className="text-white font-medium mb-2">🔍 Quality Assurance System</h5>
                  <ul className="space-y-1 text-gray-300 text-sm">
                    <li>• Multi-agent response validation</li>
                    <li>• Confidence scoring mechanisms</li>
                    <li>• Automated fact-checking</li>
                    <li>• Human-readable explanations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Communication Flow */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-white/20 mt-8">
          <h4 className="text-xl font-semibold text-orange-400 mb-4 flex items-center space-x-2">
            <span>🔄</span>
            <span>Agent Communication Flow</span>
          </h4>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <span className="text-white">1. User Query Input</span>
              <span className="text-blue-400">→</span>
              <span className="text-gray-300">Planning Agent Analysis</span>
            </div>
            <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <span className="text-white">2. Intent Classification</span>
              <span className="text-green-400">→</span>
              <span className="text-gray-300">Route to Specialized Agents</span>
            </div>
            <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <span className="text-white">3. Parallel Processing</span>
              <span className="text-purple-400">→</span>
              <span className="text-gray-300">Data + Chart + Insight Agents</span>
            </div>
            <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <span className="text-white">4. Quality Validation</span>
              <span className="text-pink-400">→</span>
              <span className="text-gray-300">Critique Agent Review</span>
            </div>
            <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <span className="text-white">5. Response Assembly</span>
              <span className="text-orange-400">→</span>
              <span className="text-gray-300">Frontend Real-time Display</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Overview */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          ⚙️ Complete Technology Stack
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Backend Stack */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-blue-400 text-center">Backend Infrastructure</h4>
            
            <div className="space-y-4">
              {[
                { category: "Core Framework", items: ["FastAPI", "Python 3.12", "Uvicorn"], color: "from-blue-500 to-cyan-500", icon: "🐍" },
                { category: "AI/ML Stack", items: ["OpenAI GPT-4", "LangChain", "LangGraph", "tiktoken"], color: "from-green-500 to-emerald-500", icon: "🧠" },
                { category: "Data Processing", items: ["Pandas", "NumPy", "Altair", "DuckDB"], color: "from-purple-500 to-pink-500", icon: "📊" },
                { category: "Vector Database", items: ["Pinecone", "OpenAI Embeddings", "RAG Pipeline"], color: "from-orange-500 to-red-500", icon: "🌲" },
                { category: "Monitoring", items: ["Prometheus", "LangSmith", "Custom Logging"], color: "from-yellow-500 to-orange-500", icon: "📈" },
              ].map((stack) => (
                <div key={stack.category} className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stack.color} flex items-center justify-center text-white`}>
                      {stack.icon}
                    </div>
                    <h5 className="text-white font-medium">{stack.category}</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stack.items.map((item) => (
                      <span key={item} className="px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm border border-white/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frontend Stack */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-green-400 text-center">Frontend Infrastructure</h4>
            
            <div className="space-y-4">
              {[
                { category: "Core Framework", items: ["Next.js 15", "React 19", "TypeScript"], color: "from-blue-500 to-indigo-500", icon: "⚛️" },
                { category: "Styling", items: ["TailwindCSS", "Glassmorphism", "Custom CSS"], color: "from-cyan-500 to-blue-500", icon: "🎨" },
                { category: "State Management", items: ["React Hooks", "Local State", "Props"], color: "from-purple-500 to-violet-500", icon: "🔄" },
                { category: "HTTP Client", items: ["Fetch API", "Axios", "Error Handling"], color: "from-green-500 to-teal-500", icon: "🌐" },
                { category: "Build Tools", items: ["Turbopack", "ESLint", "PostCSS"], color: "from-orange-500 to-yellow-500", icon: "🔧" },
              ].map((stack) => (
                <div key={stack.category} className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stack.color} flex items-center justify-center text-white`}>
                      {stack.icon}
                    </div>
                    <h5 className="text-white font-medium">{stack.category}</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stack.items.map((item) => (
                      <span key={item} className="px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm border border-white/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure & DevOps */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h4 className="text-xl font-semibold text-white mb-6 text-center">Infrastructure & DevOps</h4>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { 
              title: "Development Environment", 
              items: ["Windows PowerShell", "VS Code", "Git", "npm/pip"], 
              color: "from-blue-500 to-cyan-500",
              icon: "💻"
            },
            { 
              title: "Deployment Ready", 
              items: ["Docker Support", "Render.yaml", "Environment Config", "Health Checks"], 
              color: "from-green-500 to-emerald-500",
              icon: "🚀"
            },
            { 
              title: "Security & Monitoring", 
              items: ["CORS Middleware", "API Key Auth", "Request Logging", "Error Tracking"], 
              color: "from-purple-500 to-pink-500",
              icon: "🛡️"
            },
          ].map((section) => (
            <div key={section.title} className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center text-white text-xl`}>
                  {section.icon}
                </div>
                <h5 className="text-white font-medium">{section.title}</h5>
              </div>
              <ul className="space-y-2">
                {section.items.map((item) => (
                  <li key={item} className="text-gray-300 text-sm flex items-center space-x-2">
                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* API Architecture */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
        <h4 className="text-xl font-semibold text-white mb-6 text-center">API Architecture</h4>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-blue-400 font-medium mb-3">Core Endpoints</h5>
            <div className="space-y-2">
              {[
                "POST /api/v1/index - File upload & indexing",
                "POST /api/v1/query - RAG-based querying",
                "POST /api/v1/chart - Chart generation",
                "POST /api/v1/sql - SQL query execution",
                "POST /api/v1/insights - Automated insights",
                "POST /api/v1/multiagent-query - Full pipeline",
              ].map((endpoint) => (
                <div key={endpoint} className="p-2 bg-gray-800/50 rounded-lg text-gray-300 text-sm font-mono">
                  {endpoint}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h5 className="text-green-400 font-medium mb-3">Architecture Patterns</h5>
            <div className="space-y-3">
              {[
                { pattern: "RESTful API Design", desc: "Standard HTTP methods and status codes" },
                { pattern: "Middleware Pipeline", desc: "CORS, logging, metrics, error handling" },
                { pattern: "Modular Agents", desc: "Specialized components with clear interfaces" },
                { pattern: "Session Management", desc: "Stateful user sessions with DataFrame storage" },
              ].map((item) => (
                <div key={item.pattern} className="p-3 bg-gray-800/50 rounded-lg border border-white/10">
                  <div className="text-white font-medium text-sm">{item.pattern}</div>
                  <div className="text-gray-400 text-xs">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemOverview = () => (
    <div className="space-y-8">
      {/* Architecture Overview Header */}
      <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-8 border border-blue-400/30">
        <h3 className="text-3xl font-bold text-white mb-4 text-center">
          🏗️ Enterprise Insights Copilot: System Architecture
        </h3>
        <p className="text-gray-300 text-center max-w-4xl mx-auto">
          A comprehensive MAANG-level architecture featuring multi-agent orchestration, 
          conversational AI, and enterprise-grade data processing capabilities.
        </p>
      </div>

      {/* System Flow Diagram */}
      <div className="grid gap-6">
        {/* Layer 1: User Interface */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-2xl">👤</span>
            1. User Interaction Layer (Frontend)
          </h4>
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-400/30">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">📁</div>
                <span className="text-white text-sm">Upload CSV/Data</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">💬</div>
                <span className="text-white text-sm">Natural Language Query</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">📊</div>
                <span className="text-white text-sm">See Agent Workflow</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">📈</div>
                <span className="text-white text-sm">View Results & Charts</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-lg border border-blue-400/30">
                <span className="text-blue-300 text-sm font-medium">Next.js 15 + React 19 + TypeScript + TailwindCSS</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-green-400"></div>
        </div>

        {/* Layer 2: API Gateway */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-2xl">🌐</span>
            2. API Gateway/Server (Backend)
          </h4>
          <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-400/30">
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">🔍</div>
                <span className="text-white text-sm">Receives file/query</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">✅</div>
                <span className="text-white text-sm">Validates input</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">🔐</div>
                <span className="text-white text-sm">Handles Auth/Session</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-2xl mb-2">📤</div>
                <span className="text-white text-sm">Sends to Orchestrator</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-lg border border-green-400/30">
                <span className="text-green-300 text-sm font-medium">FastAPI + Python 3.12 + Pydantic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 3: Agent Orchestration */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            3. Multi-Agent System
          </h4>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Core Agents */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-400/30">
              <h5 className="text-white font-semibold mb-3 text-center">Core Agents</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <span className="text-lg">🧠</span>
                  <span className="text-white text-sm">Planning Agent</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <span className="text-lg">📊</span>
                  <span className="text-white text-sm">Data Analyzer</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <span className="text-lg">💡</span>
                  <span className="text-white text-sm">Insight Generator</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <span className="text-lg">📈</span>
                  <span className="text-white text-sm">Chart Creator</span>
                </div>
              </div>
            </div>

            {/* Specialized Agents */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-400/30">
              <h5 className="text-white font-semibold mb-3 text-center">Specialized Agents</h5>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <span className="text-lg">🔍</span>
                  <span className="text-white text-sm">SQL Agent</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <span className="text-lg">✅</span>
                  <span className="text-white text-sm">Critique Agent</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <span className="text-lg">📝</span>
                  <span className="text-white text-sm">Narrative Agent</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-lg p-2">
                  <span className="text-lg">🧹</span>
                  <span className="text-white text-sm">Data Cleaner</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Summary */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-md rounded-2xl p-8 border border-gray-600/30">
          <h4 className="text-2xl font-bold text-white mb-6 text-center">
            📊 Architecture Summary
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="px-4 py-3 text-gray-300 font-semibold">Layer</th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">Component</th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">Function</th>
                  <th className="px-4 py-3 text-gray-300 font-semibold">Technologies</th>
                </tr>
              </thead>
              <tbody className="text-gray-200 text-sm">
                <tr className="border-b border-gray-700/50">
                  <td className="px-4 py-3 font-medium text-blue-400">Frontend</td>
                  <td className="px-4 py-3">React/NextJS UI</td>
                  <td className="px-4 py-3">Upload, chat, visualize, see agent flow</td>
                  <td className="px-4 py-3">Next.js 15, React 19, TypeScript, TailwindCSS</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="px-4 py-3 font-medium text-green-400">Backend</td>
                  <td className="px-4 py-3">FastAPI Server</td>
                  <td className="px-4 py-3">Auth, API, agent orchestration</td>
                  <td className="px-4 py-3">FastAPI, Python 3.12, Pydantic, CORS</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="px-4 py-3 font-medium text-purple-400">Agents</td>
                  <td className="px-4 py-3">Multi-Agent System</td>
                  <td className="px-4 py-3">Specialized analytics & reasoning</td>
                  <td className="px-4 py-3">LangGraph, LangChain, Custom Agent Framework</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="px-4 py-3 font-medium text-yellow-400">Data</td>
                  <td className="px-4 py-3">Data Processing</td>
                  <td className="px-4 py-3">Data ingest, indexing, retrieval</td>
                  <td className="px-4 py-3">Pandas, Pinecone, CSV/XLSX processing</td>
                </tr>
                <tr className="border-b border-gray-700/50">
                  <td className="px-4 py-3 font-medium text-orange-400">LLM</td>
                  <td className="px-4 py-3">AI Models</td>
                  <td className="px-4 py-3">NLQ, insights, critique, generation</td>
                  <td className="px-4 py-3">OpenAI GPT-4, LangChain, Custom prompts</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-cyan-400">CI/CD</td>
                  <td className="px-4 py-3">Deployment</td>
                  <td className="px-4 py-3">Auto test, build, deploy</td>
                  <td className="px-4 py-3">GitHub Actions, Docker, Vercel, Render</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>      </div>
    </div>
  );

  const renderTechStack = () => (
    <div className="space-y-8">
      {/* Tech Stack Overview */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          ⚙️ Complete Technology Stack
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Backend Stack */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-blue-400 text-center">Backend Infrastructure</h4>
            
            <div className="space-y-4">
              {[
                { category: "Core Framework", items: ["FastAPI", "Python 3.12", "Uvicorn"], color: "from-blue-500 to-cyan-500", icon: "🐍" },
                { category: "AI/ML Stack", items: ["OpenAI GPT-4", "LangChain", "LangGraph", "tiktoken"], color: "from-green-500 to-emerald-500", icon: "🧠" },
                { category: "Data Processing", items: ["Pandas", "NumPy", "Altair", "DuckDB"], color: "from-purple-500 to-pink-500", icon: "📊" },
                { category: "Vector Database", items: ["Pinecone", "OpenAI Embeddings", "RAG Pipeline"], color: "from-orange-500 to-red-500", icon: "🌲" },
                { category: "Monitoring", items: ["Prometheus", "LangSmith", "Custom Logging"], color: "from-yellow-500 to-orange-500", icon: "📈" },
              ].map((stack) => (
                <div key={stack.category} className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stack.color} flex items-center justify-center text-white`}>
                      {stack.icon}
                    </div>
                    <h5 className="text-white font-medium">{stack.category}</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stack.items.map((item) => (
                      <span key={item} className="px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm border border-white/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Frontend Stack */}
          <div className="space-y-6">
            <h4 className="text-xl font-semibold text-purple-400 text-center">Frontend Infrastructure</h4>
            
            <div className="space-y-4">
              {[
                { category: "Core Framework", items: ["Next.js 15", "React 19", "TypeScript"], color: "from-cyan-500 to-blue-500", icon: "⚛️" },
                { category: "UI/UX", items: ["Tailwind CSS", "Glassmorphism", "Responsive Design"], color: "from-pink-500 to-rose-500", icon: "🎨" },
                { category: "State Management", items: ["React Hooks", "Context API", "Real-time Updates"], color: "from-violet-500 to-purple-500", icon: "🔄" },
                { category: "Build Tools", items: ["Webpack 5", "SWC", "ESLint"], color: "from-emerald-500 to-teal-500", icon: "⚙️" },
                { category: "Deployment", items: ["Vercel", "Docker", "GitHub Actions"], color: "from-amber-500 to-yellow-500", icon: "🚀" },
              ].map((stack) => (
                <div key={stack.category} className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stack.color} flex items-center justify-center text-white`}>
                      {stack.icon}
                    </div>
                    <h5 className="text-white font-medium">{stack.category}</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stack.items.map((item) => (
                      <span key={item} className="px-3 py-1 bg-white/10 rounded-full text-gray-300 text-sm border border-white/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Integration & Communication */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-white/20">
          <h4 className="text-xl font-semibold text-orange-400 mb-6 text-center">Integration & Communication Layer</h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl shadow-lg mx-auto mb-3">
                🌐
              </div>
              <h5 className="text-white font-medium mb-2">API Layer</h5>
              <p className="text-gray-400 text-sm">RESTful APIs, WebSocket connections, Real-time communication</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl shadow-lg mx-auto mb-3">
                🔒
              </div>
              <h5 className="text-white font-medium mb-2">Security</h5>
              <p className="text-gray-400 text-sm">API key management, CORS protection, Data encryption</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl shadow-lg mx-auto mb-3">
                📊
              </div>
              <h5 className="text-white font-medium mb-2">Monitoring</h5>
              <p className="text-gray-400 text-sm">Performance metrics, Error tracking, Usage analytics</p>
            </div>
          </div>
        </div>

        {/* Technology Comparison Table */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-6 border border-white/20">
          <h4 className="text-xl font-semibold text-green-400 mb-6 text-center">Technology Selection Rationale</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left px-4 py-3 text-blue-400 font-semibold">Technology</th>
                  <th className="text-left px-4 py-3 text-green-400 font-semibold">Category</th>
                  <th className="text-left px-4 py-3 text-purple-400 font-semibold">Key Benefit</th>
                  <th className="text-left px-4 py-3 text-orange-400 font-semibold">Alternatives Considered</th>
                </tr>
              </thead>
              <tbody className="text-gray-300 text-sm">
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 font-medium text-cyan-400">FastAPI</td>
                  <td className="px-4 py-3">Backend Framework</td>
                  <td className="px-4 py-3">Auto-generated docs, Type hints, High performance</td>
                  <td className="px-4 py-3">Django, Flask, Express.js</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 font-medium text-cyan-400">Next.js 15</td>
                  <td className="px-4 py-3">Frontend Framework</td>
                  <td className="px-4 py-3">SSR, App router, Built-in optimization</td>
                  <td className="px-4 py-3">Create React App, Vite, Gatsby</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 font-medium text-cyan-400">LangGraph</td>
                  <td className="px-4 py-3">AI Orchestration</td>
                  <td className="px-4 py-3">Complex workflows, State management, Agent coordination</td>
                  <td className="px-4 py-3">LangChain, Crew AI, AutoGen</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 font-medium text-cyan-400">Pinecone</td>
                  <td className="px-4 py-3">Vector Database</td>
                  <td className="px-4 py-3">Managed service, Fast similarity search, Scalability</td>
                  <td className="px-4 py-3">Chroma, Weaviate, Qdrant</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="px-4 py-3 font-medium text-cyan-400">Tailwind CSS</td>
                  <td className="px-4 py-3">CSS Framework</td>
                  <td className="px-4 py-3">Utility-first, Customizable, Developer experience</td>
                  <td className="px-4 py-3">Bootstrap, Material-UI, Styled Components</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-cyan-400">GitHub Actions</td>
                  <td className="px-4 py-3">CI/CD</td>
                  <td className="px-4 py-3">Integrated with repository, Free tier, Easy setup</td>
                  <td className="px-4 py-3">Jenkins, GitLab CI, CircleCI</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case "overview": return renderSystemOverview();
      case "workflow": return renderWorkflow();
      case "agents": return renderAgents();
      case "tech": return renderTechStack();
      default: return renderSystemOverview();
    }
  };  return (
    <PageBackground>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏗️ System Architecture
          </h1>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Comprehensive overview of the Enterprise Insights Copilot architecture, 
            from data flow to agent orchestration and technology stack.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "bg-blue-600/80 text-white shadow-lg border border-blue-500/50"
                  : "bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 border border-white/20 hover:border-white/40"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.title}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mb-8">
          {getTabContent()}
        </div>        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm">
            The architecture demonstrates a <strong className="text-blue-400">modern microservices approach</strong> with 
            clear separation between frontend presentation, backend orchestration, and AI agent processing. 
            The <strong className="text-green-400">LangGraph-based agent system</strong> provides flexibility 
            for complex multi-step workflows while maintaining <strong className="text-purple-400">real-time user feedback</strong>.
          </p>
        </div>
      </div>
    </PageBackground>
  );
}
