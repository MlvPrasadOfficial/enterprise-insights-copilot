import React, { useState } from "react";

// Agent node definitions
const AGENTS = [
  { id: "planner", name: "Planning Agent", icon: "🧠", color: "from-blue-500 to-cyan-500" },
  { id: "query", name: "Query Agent", icon: "🔎", color: "from-indigo-500 to-blue-500" },
  { id: "cleaner", name: "Data Cleaner", icon: "🧹", color: "from-green-500 to-emerald-500" },
  { id: "sql", name: "SQL Agent", icon: "🗃️", color: "from-green-500 to-teal-500" },
  { id: "insight", name: "Insight Agent", icon: "💡", color: "from-amber-500 to-orange-500" },
  { id: "chart", name: "Chart Agent", icon: "📊", color: "from-purple-500 to-pink-500" },
  { id: "critique", name: "Critique Agent", icon: "📝", color: "from-pink-500 to-rose-500" },
  { id: "debate", name: "Debate Agent", icon: "🤔", color: "from-yellow-500 to-orange-500" },
  { id: "narrative", name: "Narrative Agent", icon: "📖", color: "from-blue-400 to-purple-400" },
  { id: "report", name: "Report Generator", icon: "📄", color: "from-indigo-500 to-blue-500" },
  { id: "retrieval", name: "Retrieval Agent", icon: "🔗", color: "from-cyan-500 to-blue-500" },
  { id: "data", name: "Data Agent", icon: "📂", color: "from-gray-500 to-gray-700" },
];

// Example edges (source, target)
const EDGES = [
  ["planner", "query"],
  ["query", "cleaner"],
  ["cleaner", "sql"],
  ["sql", "insight"],
  ["sql", "chart"],
  ["insight", "chart"],
  ["sql", "critique"],
  ["insight", "critique"],
  ["chart", "critique"],
  ["critique", "debate"],
  ["debate", "narrative"],
  ["narrative", "report"],
  ["retrieval", "planner"],
  ["data", "sql"],
  ["data", "insight"],
];

// Agent status types
const STATUS_COLORS = {
  idle: "bg-gray-400/40",
  running: "bg-blue-400/80 animate-pulse",
  success: "bg-green-500/80",
  error: "bg-red-500/80",
  working: "bg-blue-400/80 animate-pulse",
  complete: "bg-green-500/80",
};

// Workflow stage animations
const WORKFLOW_ANIMATIONS = {
  idle: "",
  progress: "animate-pulse",
  uploaded: "scale-105 transition-all duration-500",
  question: "animate-bounce-slow",
  complete: "ring-4 ring-green-400/30",
};

// Agent detail modal component
function AgentDetailModal({ agent, status, onClose }: { 
  agent: { id: string; name: string; icon: string; color: string; } | undefined, 
  status: string, 
  onClose: () => void 
}) {
  if (!agent) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-6 rounded-2xl border border-white/20 w-full max-w-lg mx-4 relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${agent.color} flex items-center justify-center text-2xl relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
            <span className="relative z-10">{agent.icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{agent.name}</h3>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                status === "idle" ? "bg-gray-500/40 text-gray-300" :
                status === "running" ? "bg-blue-500/40 text-blue-200" :
                status === "success" || status === "complete" ? "bg-green-500/40 text-green-200" :
                "bg-red-500/40 text-red-200"
              }`}>
                {status.toUpperCase()}
              </span>
              <span className="text-gray-400 text-xs">Agent ID: {agent.id}</span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="ml-auto bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2">Description</h4>
            <p className="text-sm text-gray-300">
              {getAgentDescription(agent.id)}
            </p>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2">Capabilities</h4>
            <ul className="space-y-1">
              {getAgentCapabilities(agent.id).map((capability, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2">Status Log</h4>
            <div className="text-xs text-gray-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Last active:</span>
                <span>Today, 14:35:22</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Success rate:</span>
                <span>98.7%</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Average response time:</span>
                <span>1.2s</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <button 
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors"
            onClick={onClose}
          >
            Close
          </button>
          {status === "idle" && (
            <button 
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium hover:from-blue-500 hover:to-indigo-500 transition-colors"
              onClick={() => {
                // Would trigger the agent in a real implementation
                onClose();
              }}
            >
              Activate Agent
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions for agent details
function getAgentDescription(agentId: string): string {
  const descriptions: Record<string, string> = {
    planner: "Central orchestration agent that analyzes queries and routes tasks to specialized agents. Makes high-level decisions about workflow and execution strategy.",
    query: "Processes natural language queries and extracts key entities, intents and parameters needed for data analysis.",
    cleaner: "Handles data preprocessing, normalization, and cleaning. Detects and manages missing values, outliers, and inconsistent formats.",
    sql: "Generates optimized SQL queries based on natural language requests and schema understanding.",
    insight: "Performs advanced statistical analysis to discover patterns, correlations, and anomalies in data.",
    chart: "Creates data visualizations tailored to the specific insights and data characteristics.",
    critique: "Evaluates the quality and accuracy of generated insights and visualizations.",
    debate: "Explores alternative perspectives and potential biases in the analysis.",
    narrative: "Converts analytical findings into clear, human-readable explanations and stories.",
    report: "Assembles insights, charts, and narratives into comprehensive reports.",
    retrieval: "Finds and retrieves relevant information from the knowledge base and vector store.",
    data: "Manages data access, storage, and transformation operations.",
  };
  
  return descriptions[agentId] || "Specialized AI agent that performs targeted operations within the system.";
}

function getAgentCapabilities(agentId: string): string[] {
  const capabilities: Record<string, string[]> = {
    planner: [
      "Task routing and orchestration",
      "Multi-agent coordination",
      "Execution planning and optimization",
      "Query intent classification"
    ],
    query: [
      "Natural language parsing",
      "Entity recognition",
      "Intent classification",
      "Parameter extraction"
    ],
    cleaner: [
      "Missing value detection and imputation",
      "Outlier identification",
      "Type conversion and validation",
      "Format normalization"
    ],
    sql: [
      "SQL generation from natural language",
      "Query optimization",
      "Schema understanding",
      "Join relationship mapping"
    ],
    insight: [
      "Statistical analysis",
      "Pattern recognition",
      "Correlation detection",
      "Trend identification"
    ],
    chart: [
      "Visualization type selection",
      "Chart customization",
      "Color palette optimization",
      "Interactive visualization generation"
    ],
    critique: [
      "Quality assessment",
      "Accuracy verification",
      "Bias detection",
      "Improvement suggestions"
    ],
    debate: [
      "Alternative viewpoint generation",
      "Assumption challenging",
      "Logical evaluation",
      "Perspective analysis"
    ],
    narrative: [
      "Natural language generation",
      "Content summarization",
      "Explanation creation",
      "Technical-to-plain language translation"
    ],
    report: [
      "Document composition",
      "Multi-format export (PDF, HTML)",
      "Layout optimization",
      "Visual hierarchy management"
    ],
    retrieval: [
      "Vector similarity search",
      "Relevance ranking",
      "Context window management",
      "Knowledge base integration"
    ],
    data: [
      "Data transformation",
      "Schema management",
      "Storage optimization",
      "Access control"
    ],
  };
  
  return capabilities[agentId] || [
    "Specialized processing",
    "AI-powered analysis",
    "Integration with other agents"
  ];
}

export default function AgentGraphVisualizer({ 
  agentStatus, 
  onNodeClick, 
  workflowStage = "idle", 
  activeAgentId 
}: {
  agentStatus: Record<string, "idle" | "running" | "success" | "error" | "working" | "complete">,
  onNodeClick?: (id: string) => void,
  workflowStage?: "idle" | "progress" | "uploaded" | "question" | "complete",
  activeAgentId?: string
}) {
  // State for the selected agent modal
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  
  // Find the agent object by ID
  const selectedAgent = selectedAgentId ? AGENTS.find(a => a.id === selectedAgentId) : undefined;

  // Layout: simple circle for now, can be improved with force-directed/graph lib
  const RADIUS = 200;
  const centerX = 320, centerY = 220;
  const angleStep = (2 * Math.PI) / AGENTS.length;

  // Get workflow animation class based on current stage
  const workflowAnimationClass = WORKFLOW_ANIMATIONS[workflowStage] || "";
  return (
    <div>
      <div className={`relative w-full h-[440px] mx-auto ${workflowAnimationClass}`}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-violet-800/10 to-indigo-800/10 rounded-xl"></div>
        {/* Edges */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" width="100%" height="100%" viewBox="0 0 640 440" preserveAspectRatio="xMidYMid meet">
          {EDGES.map(([from, to], i) => {
            const fromIdx = AGENTS.findIndex(a => a.id === from);
            const toIdx = AGENTS.findIndex(a => a.id === to);
            if (fromIdx === -1 || toIdx === -1) return null;
            const fx = centerX + RADIUS * Math.cos(angleStep * fromIdx - Math.PI/2);
            const fy = centerY + RADIUS * Math.sin(angleStep * fromIdx - Math.PI/2);
            const tx = centerX + RADIUS * Math.cos(angleStep * toIdx - Math.PI/2);
            const ty = centerY + RADIUS * Math.sin(angleStep * toIdx - Math.PI/2);
            
            // Highlight active edges (connected to activeAgentId)
            const isActiveEdge = activeAgentId && (from === activeAgentId || to === activeAgentId);
              // Use a gradient for the edge
            const gradientId = `gradient-${i}`;
            return (
              <g key={i}>
                <defs>
                  <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={isActiveEdge ? "#3b82f6" : "#475569"} stopOpacity="0.8" />
                    <stop offset="100%" stopColor={isActiveEdge ? "#60a5fa" : "#94a3b8"} stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <line 
                  x1={fx} 
                  y1={fy} 
                  x2={tx} 
                  y2={ty} 
                  stroke={`url(#${gradientId})`}
                  strokeWidth={isActiveEdge ? 3 : 1.5} 
                  strokeDasharray={isActiveEdge ? "" : "4,2"}
                  className={isActiveEdge ? "animate-pulse" : ""}
                  markerEnd="url(#arrowhead)" 
                />
                {/* Add data flow animation for active edges */}
                {isActiveEdge && (
                  <circle r="4" fill="#60a5fa">
                    <animateMotion 
                      dur="2s" 
                      repeatCount="indefinite"
                      path={`M${fx},${fy} L${tx},${ty}`} />
                  </circle>
                )}
              </g>
            );
          })}        <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 10 5, 0 10" fill="#60a5fa" stroke="#3b82f6" strokeWidth="1" />
            </marker>
          </defs>
          {/* Central hub glow effect */}
          <circle cx={centerX} cy={centerY} r="30" fill="url(#centralGlow)" />
          <radialGradient id="centralGlow">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </radialGradient>
        </svg>
        {/* Nodes */}
        {AGENTS.map((agent, i) => {
          const x = centerX + RADIUS * Math.cos(angleStep * i - Math.PI/2);
          const y = centerY + RADIUS * Math.sin(angleStep * i - Math.PI/2);
          const status = agentStatus[agent.id] || "idle";
          const isActiveAgent = activeAgentId === agent.id;
          
          return (
            <div
              key={agent.id}
              className={`absolute flex flex-col items-center transition-all duration-300 cursor-pointer group
                        ${isActiveAgent ? 'scale-110 z-10' : ''}`}
              style={{ left: x - 40, top: y - 40, width: 80, height: 80, zIndex: isActiveAgent ? 3 : 2 }}
              onClick={() => {
                onNodeClick?.(agent.id);
                setSelectedAgentId(agent.id);
              }}
              tabIndex={0}
              aria-label={agent.name}
            >            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-xl 
                            border-4 ${isActiveAgent ? 'border-blue-400/80' : 'border-white/30'} 
                            bg-gradient-to-r ${agent.color} ${STATUS_COLORS[status]} 
                            ${isActiveAgent ? 'ring-4 ring-blue-400/30 scale-110' : ''} 
                            group-hover:scale-110 group-hover:ring-4 group-hover:ring-blue-400/30 
                            transition-all duration-300 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full"></div>
                <span className="relative z-10">{agent.icon}</span>
                {/* Animated pulse effect for active agents */}
                {status === "running" && (
                  <div className="absolute inset-0 bg-white/20 animate-ping rounded-full opacity-75"></div>
                )}
              </div>
              <span className="mt-2 text-xs font-semibold text-white text-center drop-shadow-lg w-24 truncate">{agent.name}</span>
              <span className={`mt-1 text-[10px] px-2 py-0.5 rounded-full ${isActiveAgent ? 'bg-blue-500/30 text-blue-200' : 'bg-gray-700/50 text-gray-300'}`}>
                {status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Status Legend */}
      <div className="flex items-center justify-center gap-5 mt-4">
        {Object.entries(STATUS_COLORS).map(([status, colorClass]) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${colorClass.replace('bg-', 'bg-')}`}></div>
            <span className="text-xs text-gray-300 capitalize">{status}</span>
          </div>
        ))}
      </div>

      {/* Interaction Instructions */}
      <div className="text-center mt-3 text-xs text-gray-400">
        <p>Click on any agent node to see details and trigger actions</p>
      </div>

      {/* Agent Detail Modal */}
      <AgentDetailModal 
        agent={AGENTS.find(a => a.id === selectedAgentId)} 
        status={agentStatus[selectedAgentId || ""]} 
        onClose={() => setSelectedAgentId(null)} 
      />
    </div>
  );
}

// Add to your CSS (globals.css or module):
// .glassmorphic-3d-strong {
//   background: linear-gradient(135deg, rgba(40,40,60,0.65) 60%, rgba(80,60,120,0.45) 100%);
//   box-shadow: 0 8px 32px 0 rgba(31,38,135,0.37), 0 2px 32px 0 #0008;
//   backdrop-filter: blur(14px) saturate(1.4);
//   border-radius: 1.5rem;
//   border: 2px solid rgba(255,255,255,0.13);
// }
// @keyframes fadein { from { opacity: 0; transform: translateY(40px) scale(0.95);} to { opacity: 1; transform: none; } }
// .animate-fadein { animation: fadein 0.7s cubic-bezier(.23,1.02,.47,.98); }
