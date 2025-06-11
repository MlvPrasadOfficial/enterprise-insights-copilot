"use client";
import { useState } from "react";
import PageBackground from "../../components/PageBackground";

interface FlowNode {
  id: string;
  label: string;
  category: string;
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon: string;
}

interface FlowConnection {
  from: string;
  to: string;
  label?: string;
  type: 'api' | 'data' | 'process' | 'deploy';
}

export default function FlowchartPage() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const nodes: FlowNode[] = [
    // Row 1: User Interface Layer
    { id: 'fe_upload', label: 'File Upload', category: 'frontend', description: 'CSV file upload interface', x: 80, y: 80, width: 130, height: 50, color: 'from-purple-500 to-violet-600', icon: '📤' },
    { id: 'fe_input', label: 'Query Input', category: 'frontend', description: 'Natural language queries', x: 230, y: 80, width: 130, height: 50, color: 'from-purple-500 to-violet-600', icon: '💬' },
    { id: 'fe_visualizer', label: 'Process Monitor', category: 'frontend', description: 'Agent status tracking', x: 380, y: 80, width: 130, height: 50, color: 'from-purple-500 to-violet-600', icon: '🤖' },
    { id: 'fe_charts', label: 'Results Display', category: 'frontend', description: 'Charts and insights', x: 530, y: 80, width: 130, height: 50, color: 'from-purple-500 to-violet-600', icon: '📊' },

    // Row 2: API & Processing Layer
    { id: 'be_api', label: 'API Gateway', category: 'backend', description: 'Request routing hub', x: 80, y: 180, width: 130, height: 50, color: 'from-blue-500 to-cyan-600', icon: '🌐' },
    { id: 'be_auth', label: 'Authentication', category: 'backend', description: 'User sessions', x: 230, y: 180, width: 130, height: 50, color: 'from-blue-500 to-cyan-600', icon: '🔐' },
    { id: 'be_orchestrator', label: 'Agent Orchestrator', category: 'backend', description: 'Workflow coordination', x: 380, y: 180, width: 130, height: 50, color: 'from-blue-500 to-cyan-600', icon: '🎭' },
    { id: 'be_parser', label: 'Query Parser', category: 'backend', description: 'NL processing', x: 530, y: 180, width: 130, height: 50, color: 'from-blue-500 to-cyan-600', icon: '🔍' },

    // Row 3: Data Storage Layer
    { id: 'ds_upload', label: 'File Storage', category: 'datastore', description: 'Raw uploaded files', x: 130, y: 280, width: 120, height: 50, color: 'from-emerald-500 to-teal-600', icon: '💾' },
    { id: 'ds_tables', label: 'Data Tables', category: 'datastore', description: 'Processed datasets', x: 280, y: 280, width: 120, height: 50, color: 'from-emerald-500 to-teal-600', icon: '🗃️' },
    { id: 'ds_vector', label: 'Vector Store', category: 'datastore', description: 'Embeddings & RAG', x: 430, y: 280, width: 120, height: 50, color: 'from-emerald-500 to-teal-600', icon: '🧠' },

    // Row 4: Core AI Agents
    { id: 'ag_planning', label: 'Planning Agent', category: 'agents', description: 'Task orchestration', x: 50, y: 380, width: 110, height: 45, color: 'from-amber-500 to-orange-600', icon: '🧠' },
    { id: 'ag_insight', label: 'Insight Agent', category: 'agents', description: 'Pattern analysis', x: 180, y: 380, width: 110, height: 45, color: 'from-amber-500 to-orange-600', icon: '💡' },
    { id: 'ag_sql', label: 'SQL Agent', category: 'agents', description: 'Query generation', x: 310, y: 380, width: 110, height: 45, color: 'from-amber-500 to-orange-600', icon: '🗄️' },
    { id: 'ag_chart', label: 'Chart Agent', category: 'agents', description: 'Visualizations', x: 440, y: 380, width: 110, height: 45, color: 'from-amber-500 to-orange-600', icon: '📊' },
    { id: 'ag_narrative', label: 'Report Agent', category: 'agents', description: 'Text generation', x: 570, y: 380, width: 110, height: 45, color: 'from-amber-500 to-orange-600', icon: '📝' },

    // Row 5: Specialized Agents
    { id: 'ag_datacleaner', label: 'Data Cleaner', category: 'agents', description: 'Data preprocessing', x: 115, y: 450, width: 110, height: 45, color: 'from-amber-500 to-orange-600', icon: '🧹' },
    { id: 'ag_critique', label: 'QA Agent', category: 'agents', description: 'Quality assurance', x: 245, y: 450, width: 110, height: 45, color: 'from-amber-500 to-orange-600', icon: '🔍' },
    { id: 'ag_retriever', label: 'Retrieval Agent', category: 'agents', description: 'Information search', x: 375, y: 450, width: 110, height: 45, color: 'from-amber-500 to-orange-600', icon: '🔎' },
    { id: 'ag_debate', label: 'Analysis Agent', category: 'agents', description: 'Multi-perspective', x: 505, y: 450, width: 110, height: 45, color: 'from-amber-500 to-orange-600', icon: '⚔️' },

    // Row 6: External Services
    { id: 'llm_api', label: 'LLM Services', category: 'llm', description: 'OpenAI, Gemini, Ollama', x: 280, y: 550, width: 180, height: 50, color: 'from-pink-500 to-rose-600', icon: '🤖' },

    // Row 7: Output & Deployment
    { id: 'out_result', label: 'Results Engine', category: 'output', description: 'Processed insights', x: 80, y: 650, width: 140, height: 45, color: 'from-indigo-500 to-purple-600', icon: '📈' },
    { id: 'out_status', label: 'Status Monitor', category: 'output', description: 'Real-time updates', x: 260, y: 650, width: 140, height: 45, color: 'from-indigo-500 to-purple-600', icon: '⏱️' },
    { id: 'ci_deploy', label: 'Cloud Deploy', category: 'cicd', description: 'Production hosting', x: 440, y: 650, width: 140, height: 45, color: 'from-gray-500 to-slate-600', icon: '🚀' },
  ];
  const connections: FlowConnection[] = [
    // Frontend to Backend Flow
    { from: 'fe_upload', to: 'be_api', label: 'Upload', type: 'api' },
    { from: 'fe_input', to: 'be_parser', label: 'Query', type: 'api' },
    { from: 'fe_visualizer', to: 'out_status', label: 'Status', type: 'api' },
    { from: 'fe_charts', to: 'out_result', label: 'Results', type: 'api' },

    // Backend Processing Flow
    { from: 'be_api', to: 'be_auth', type: 'process' },
    { from: 'be_api', to: 'ds_upload', label: 'Store', type: 'data' },
    { from: 'be_parser', to: 'be_orchestrator', type: 'process' },
    { from: 'be_orchestrator', to: 'ag_planning', type: 'process' },

    // Data Storage Flow
    { from: 'ds_upload', to: 'ds_tables', type: 'data' },
    { from: 'ds_tables', to: 'ds_vector', type: 'data' },

    // Agent Workflow
    { from: 'ag_planning', to: 'ag_insight', type: 'process' },
    { from: 'ag_planning', to: 'ag_sql', type: 'process' },
    { from: 'ag_planning', to: 'ag_chart', type: 'process' },
    { from: 'ag_insight', to: 'ag_narrative', type: 'process' },
    { from: 'ag_datacleaner', to: 'ds_tables', type: 'data' },
    { from: 'ag_critique', to: 'ag_narrative', type: 'process' },

    // LLM Integration
    { from: 'ag_insight', to: 'llm_api', type: 'api' },
    { from: 'ag_sql', to: 'llm_api', type: 'api' },
    { from: 'ag_chart', to: 'llm_api', type: 'api' },
    { from: 'ag_narrative', to: 'llm_api', type: 'api' },

    // Output Generation
    { from: 'ag_chart', to: 'out_result', type: 'data' },
    { from: 'ag_narrative', to: 'out_result', type: 'data' },
    { from: 'be_orchestrator', to: 'out_status', type: 'data' },

    // Deployment
    { from: 'out_result', to: 'ci_deploy', type: 'deploy' },
  ];
  const categories = [
    { id: 'all', label: 'All Components', count: nodes.length, color: 'text-white' },
    { id: 'frontend', label: 'Frontend (4)', count: nodes.filter(n => n.category === 'frontend').length, color: 'text-purple-400' },
    { id: 'backend', label: 'Backend (4)', count: nodes.filter(n => n.category === 'backend').length, color: 'text-blue-400' },
    { id: 'datastore', label: 'Data (3)', count: nodes.filter(n => n.category === 'datastore').length, color: 'text-emerald-400' },
    { id: 'agents', label: 'AI Agents (9)', count: nodes.filter(n => n.category === 'agents').length, color: 'text-amber-400' },
    { id: 'llm', label: 'LLM (1)', count: nodes.filter(n => n.category === 'llm').length, color: 'text-pink-400' },
    { id: 'output', label: 'Output (2)', count: nodes.filter(n => n.category === 'output').length, color: 'text-indigo-400' },
    { id: 'cicd', label: 'Deploy (1)', count: nodes.filter(n => n.category === 'cicd').length, color: 'text-gray-400' },
  ];
  const getConnectionPath = (from: FlowNode, to: FlowNode) => {
    const fromX = from.x + from.width / 2;
    const fromY = from.y + from.height;
    const toX = to.x + to.width / 2;
    const toY = to.y;
    
    // Use straight lines with right angles instead of curves
    const midY = fromY + (toY - fromY) / 2;
    
    if (Math.abs(fromX - toX) < 5) {
      // Straight vertical line if nodes are vertically aligned
      return `M ${fromX} ${fromY} L ${toX} ${toY}`;
    } else {
      // L-shaped connection: down, across, then down/up
      return `M ${fromX} ${fromY} L ${fromX} ${midY} L ${toX} ${midY} L ${toX} ${toY}`;
    }
  };

  const getConnectionColor = (type: string) => {
    switch (type) {
      case 'api': return 'stroke-blue-400';
      case 'data': return 'stroke-emerald-400';
      case 'process': return 'stroke-purple-400';
      case 'deploy': return 'stroke-gray-400';
      default: return 'stroke-gray-500';
    }
  };

  const filteredNodes = activeCategory === 'all' 
    ? nodes 
    : nodes.filter(node => node.category === activeCategory);

  const filteredConnections = connections.filter(conn => {
    const fromNode = nodes.find(n => n.id === conn.from);
    const toNode = nodes.find(n => n.id === conn.to);
    if (!fromNode || !toNode) return false;
    
    if (activeCategory === 'all') return true;
    return fromNode.category === activeCategory || toNode.category === activeCategory;
  });  return (
    <PageBackground>
      <div className="pt-20 px-4 py-8">
        <div className="max-w-[1600px] mx-auto">
          {/* Enhanced Header with Glassmorphic Design */}
          <div className="text-center mb-8">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-purple-500/10 mb-6">
              <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-200 via-white to-violet-200 bg-clip-text text-transparent">
                🔄 Interactive System Flowchart
              </h1>            
              <p className="text-gray-200 text-lg max-w-4xl mx-auto leading-relaxed">
                Clean, organized visualization of the Enterprise Insights system architecture - 
                from user interactions through AI processing to final deployment.
              </p>
            </div>
          </div>          {/* Enhanced Category Filter with Glassmorphic Design */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl p-8 border border-white/20 shadow-2xl shadow-purple-500/10">
              <h3 className="text-white font-semibold mb-6 text-lg flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500/40 to-violet-500/40 rounded-lg flex items-center justify-center">
                  🔍
                </div>
                Filter by Component Type
              </h3>
              <div className="flex flex-wrap gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-300 backdrop-blur-sm ${
                      activeCategory === category.id
                        ? 'bg-gradient-to-r from-purple-600/80 to-violet-600/80 text-white shadow-2xl shadow-purple-500/40 border border-purple-400/50 scale-105'
                        : 'bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white border border-white/20 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105'
                    }`}
                  >
                    {category.label} ({category.count})
                  </button>
                ))}
              </div>
            </div>
          </div>          {/* Enhanced Flowchart Container with Premium Glassmorphic Design */}
          <div className="bg-white/5 backdrop-blur-3xl rounded-3xl p-10 border border-white/20 overflow-hidden shadow-2xl shadow-purple-500/10 relative">
            {/* Additional glass effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 rounded-3xl"></div>
            
            {/* Enhanced Row Labels */}
            <div className="mb-8 grid grid-cols-7 gap-2 text-center text-sm font-medium relative z-10">
              <div className="text-purple-300 bg-purple-500/10 backdrop-blur-sm rounded-lg py-2 border border-purple-400/20">Frontend UI</div>
              <div className="text-blue-300 bg-blue-500/10 backdrop-blur-sm rounded-lg py-2 border border-blue-400/20">Backend API</div>
              <div className="text-emerald-300 bg-emerald-500/10 backdrop-blur-sm rounded-lg py-2 border border-emerald-400/20">Data Storage</div>
              <div className="text-amber-300 bg-amber-500/10 backdrop-blur-sm rounded-lg py-2 border border-amber-400/20">AI Agents</div>
              <div className="text-pink-300 bg-pink-500/10 backdrop-blur-sm rounded-lg py-2 border border-pink-400/20">LLM Services</div>
              <div className="text-indigo-300 bg-indigo-500/10 backdrop-blur-sm rounded-lg py-2 border border-indigo-400/20">Output</div>
              <div className="text-gray-300 bg-gray-500/10 backdrop-blur-sm rounded-lg py-2 border border-gray-400/20">Deployment</div>
            </div>

            <div className="relative z-10" style={{ height: '800px', width: '100%', maxWidth: '720px', margin: '0 auto' }}>              {/* Enhanced SVG for connections with glassmorphic effects */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                <defs>
                  <marker id="arrowhead" markerWidth="12" markerHeight="8" 
                    refX="10" refY="4" orient="auto" className="drop-shadow-lg">
                    <polygon points="0 0, 12 4, 0 8" fill="currentColor" />
                  </marker>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {filteredConnections.map((connection, index) => {
                  const fromNode = nodes.find(n => n.id === connection.from);
                  const toNode = nodes.find(n => n.id === connection.to);
                  if (!fromNode || !toNode) return null;

                  return (
                    <g key={index} className={`${getConnectionColor(connection.type)} opacity-70 hover:opacity-100 connection-pulse`}>
                      <path
                        d={getConnectionPath(fromNode, toNode)}
                        fill="none"
                        strokeWidth="3"
                        markerEnd="url(#arrowhead)"
                        className="transition-all duration-300 filter drop-shadow-lg"
                        filter="url(#glow)"
                      />
                      {connection.label && (
                        <text
                          x={(fromNode.x + fromNode.width / 2 + toNode.x + toNode.width / 2) / 2}
                          y={(fromNode.y + fromNode.height + toNode.y) / 2}
                          textAnchor="middle"
                          className="fill-current text-xs font-medium drop-shadow-lg"
                          style={{ fontSize: '11px' }}
                        >
                          {connection.label}
                        </text>
                      )}
                    </g>
                  );                })}
              </svg>              {/* Enhanced Nodes with Premium Glassmorphic Effects */}
              {filteredNodes.map((node) => (
                <div
                  key={node.id}
                  style={{
                    position: 'absolute',
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                    zIndex: 2
                  }}                  className={`bg-gradient-to-r ${node.color} rounded-2xl p-3 border border-white/40 cursor-pointer transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/30 shadow-xl backdrop-blur-sm node-glow ${
                    selectedNode === node.id ? 'ring-4 ring-white/60 scale-110 shadow-3xl' : ''
                  } ${hoveredNode === node.id ? 'z-10' : ''} group relative overflow-hidden`}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  {/* Glassmorphic overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="flex items-center space-x-3 h-full relative z-10">
                    <div className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {node.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-xs leading-tight drop-shadow-lg">
                        {node.label}
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced Tooltip with Glassmorphic Design */}
                  {hoveredNode === node.id && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-black/80 backdrop-blur-xl text-white text-xs rounded-xl whitespace-nowrap z-30 border border-white/30 shadow-2xl shadow-black/50 animate-fade-in">
                      <div className="font-medium mb-1">{node.description}</div>
                      <div className="text-xs text-gray-300 capitalize">{node.category}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-6 border-transparent border-t-black/80"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>          {/* Enhanced Node Details Panel with Glassmorphic Design */}
          {selectedNode && (
            <div className="mt-8 animate-fade-in">
              <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-8 border border-white/30 shadow-2xl shadow-purple-500/20 relative overflow-hidden">
                {/* Glassmorphic gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10 rounded-3xl"></div>
                
                <div className="relative z-10">
                  {(() => {
                    const node = nodes.find(n => n.id === selectedNode);
                    if (!node) return null;
                    
                    return (
                      <div>
                        <div className="flex items-center space-x-6 mb-6">
                          <div className={`w-16 h-16 bg-gradient-to-r ${node.color} rounded-2xl flex items-center justify-center text-2xl shadow-2xl shadow-purple-500/30 backdrop-blur-sm border border-white/30`}>
                            {node.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-bold text-2xl mb-1">{node.label}</h3>
                            <p className="text-purple-200 text-sm capitalize bg-purple-500/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm border border-purple-400/30">{node.category}</p>
                          </div>
                          <button
                            onClick={() => setSelectedNode(null)}
                            className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <span className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-xs">📋</span>
                              Description
                            </h4>
                            <p className="text-gray-200 text-sm leading-relaxed">{node.description}</p>
                          </div>
                          
                          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                              <span className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center text-xs">🔗</span>
                              Connections
                            </h4>
                            <div className="space-y-3">
                              {connections
                                .filter(conn => conn.from === selectedNode || conn.to === selectedNode)
                                .slice(0, 5)
                                .map((conn, index) => {
                                  const isOutgoing = conn.from === selectedNode;
                                  const otherNodeId = isOutgoing ? conn.to : conn.from;
                                  const otherNode = nodes.find(n => n.id === otherNodeId);
                                  
                                  return (
                                    <div key={index} className="flex items-center space-x-3 text-sm bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                                      <span className={`w-3 h-3 rounded-full ${getConnectionColor(conn.type).replace('stroke-', 'bg-')} shadow-lg`}></span>
                                      <span className="text-gray-200 flex-1">
                                        {isOutgoing ? '→' : '←'} {otherNode?.label}
                                      </span>
                                      {conn.label && (
                                        <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-1 rounded-lg">{conn.label}</span>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}          {/* Enhanced Architecture Summary with Glassmorphic Design */}
          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-8 border border-white/30 shadow-2xl shadow-purple-500/20 relative overflow-hidden">
              {/* Glassmorphic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-white font-bold mb-6 text-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500/40 to-violet-500/40 rounded-xl flex items-center justify-center shadow-lg">
                    🏗️
                  </div>
                  Clean Architecture Overview
                </h3>
                <div className="grid md:grid-cols-3 gap-8 text-sm">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
                    <h4 className="text-purple-300 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500/30 rounded-lg flex items-center justify-center text-xs">🎨</span>
                      User Interface (4 components)
                    </h4>
                    <p className="text-gray-200 leading-relaxed">
                      Streamlined frontend with file upload, query input, process monitoring, and results display.
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-amber-400/20 hover:border-amber-400/40 transition-all duration-300">
                    <h4 className="text-amber-300 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-amber-500/30 rounded-lg flex items-center justify-center text-xs">🤖</span>
                      AI Processing (9 agents)
                    </h4>
                    <p className="text-gray-200 leading-relaxed">
                      Specialized AI agents working in coordination for data analysis, visualization, and insights generation.
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
                    <h4 className="text-blue-300 font-semibold mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500/30 rounded-lg flex items-center justify-center text-xs">⚡</span>
                      Infrastructure (8 services)
                    </h4>
                    <p className="text-gray-200 leading-relaxed">
                      Robust backend API, data storage layers, and cloud deployment pipeline for production readiness.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Legend with Glassmorphic Design */}
          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-3xl rounded-3xl p-8 border border-white/30 shadow-2xl shadow-purple-500/20 relative overflow-hidden">
              {/* Glassmorphic gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-500/10 rounded-3xl"></div>
              
              <div className="relative z-10">
                <h3 className="text-white font-bold mb-6 text-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500/40 to-violet-500/40 rounded-xl flex items-center justify-center shadow-lg">
                    🔗
                  </div>
                  Connection Types
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/20">
                    <div className="w-6 h-1 bg-blue-400 rounded-full shadow-lg shadow-blue-400/50"></div>
                    <span className="text-blue-300 text-sm font-medium">API Calls</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-emerald-400/20">
                    <div className="w-6 h-1 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50"></div>
                    <span className="text-emerald-300 text-sm font-medium">Data Flow</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-purple-400/20">
                    <div className="w-6 h-1 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
                    <span className="text-purple-300 text-sm font-medium">Process Flow</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-gray-400/20">
                    <div className="w-6 h-1 bg-gray-400 rounded-full shadow-lg shadow-gray-400/50"></div>
                    <span className="text-gray-300 text-sm font-medium">Deployment</span>
                  </div>                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}
