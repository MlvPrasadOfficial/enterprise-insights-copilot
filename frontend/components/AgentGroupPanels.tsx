"use client";
import React from 'react';

interface AgentGroupPanelsProps {
  enhancedAgents: any[];
  renderAgentPanel: (agent: any) => React.ReactNode;
  fileUploaded?: boolean;
}

export { FileUploadAgentsPanel, ChatAgentsPanel, OutputAgentsPanel };

const FileUploadAgentsPanel:React.FC<FileUploadAgentsPanelProps> = ({ 
  enhancedAgents, 
  renderAgentPanel,
  fileUploaded = false
}) => {
  // First Data Agent, then Data Cleaner Agent
  const fileUploadAgentTypes = ['data', 'cleaner'];
  const fileUploadAgents = fileUploadAgentTypes
    .map(type => enhancedAgents.find(agent => agent.type === type))
    .filter(agent => agent !== undefined) as any[];
    
  // Debug log to check panel rendering
  console.log("FileUploadAgentsPanel render:", { 
    fileUploaded, 
    agentCount: fileUploadAgents.length,
    agentTypes: fileUploadAgents.map(a => a.type)
  });
  
  // Force display if file is uploaded, regardless of other conditions
  if (!fileUploaded) {
    console.log("FileUploadAgentsPanel not showing: fileUploaded is false");
    return null;
  }
    if (fileUploadAgents.length === 0) {
    console.log("FileUploadAgentsPanel not showing: no agents found");
    // Even if no agents found in the enhancedAgents, show a placeholder when file is uploaded
    if (fileUploaded) {
      return (
        <div className="glass-card-3d p-4 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20">
          <div className="text-center py-3">
            <p className="text-white/80 text-sm">File Upload Agents</p>
            <p className="text-white/60 text-xs mt-2">Processing uploaded file...</p>
          </div>
        </div>
      );
    }
    return null;
  }return (
    <div className="glass-card-3d p-4 space-y-4 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10 animate-slideDown transition-all opacity-0" style={{animationFillMode: 'forwards', animationDelay: '0.2s'}}>
      {/* Header with highlights */}
      <div className="relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
        <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-purple-500/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-purple-500/30 to-transparent"></div>

        <div className="flex items-center justify-between mb-2 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-purple-800/40 flex items-center justify-center border border-purple-700/50">
              <span role="img" aria-label="file upload" className="text-xl">📄</span>
            </div>
            <div>
              <h3 className="text-white font-medium">File Upload Agents</h3>
              <p className="text-white/70 text-xs">Data processing and cleaning</p>
            </div>
          </div>
          <div className="glass-pill px-2 py-1 bg-purple-800/30">
            <span className="text-white/80 text-xs">
              {fileUploadAgents.filter(a => a.status === 'working').length} active
            </span>
          </div>
        </div>
      </div>      {/* Agent panels with staggered animation */}
      <div className="space-y-2 stagger-anim">
        {fileUploadAgents.map((agent, index) => (
          <div key={agent.type} className="animate-fadeIn">
            {renderAgentPanel(agent)}
          </div>
        ))}
      </div>
    </div>
  );
};

const ChatAgentsPanel: React.FC<AgentGroupPanelsProps> = ({ 
  enhancedAgents, 
  renderAgentPanel,
  fileUploaded = false
}) => {
  // Reordering: planner, query, retrieval first, then analysis agents, critique and debate at the end
  const chatAgentTypes = ['planner', 'query', 'retrieval', 'sql', 'insight', 'chart', 'critique', 'debate'];
  const chatAgents = chatAgentTypes
    .map(type => enhancedAgents.find(agent => agent.type === type))
    .filter(agent => agent !== undefined) as any[];

  // Debug log to check panel rendering
  console.log("ChatAgentsPanel render:", { 
    fileUploaded, 
    agentCount: chatAgents.length,
    agentTypes: chatAgents.map(a => a.type)
  });
  
  // Force display if file is uploaded, regardless of other conditions
  if (!fileUploaded) {
    console.log("ChatAgentsPanel not showing: fileUploaded is false");
    return null;
  }
    if (chatAgents.length === 0) {
    console.log("ChatAgentsPanel not showing: no agents found");
    // Even if no agents found in the enhancedAgents, show a placeholder when file is uploaded
    if (fileUploaded) {
      return (
        <div className="glass-card-3d p-4 bg-gradient-to-br from-cyan-600/20 to-blue-600/20">
          <div className="text-center py-3">
            <p className="text-white/80 text-sm">Chat Response Agents</p>
            <p className="text-white/60 text-xs mt-2">Ready for query processing...</p>
          </div>
        </div>
      );
    }
    return null;
  }
  
  // Group these agents by function
  const mainProcessingAgents = chatAgents.filter(agent => 
    ['planner', 'query'].includes(agent.type)
  );
  
  const retrievalAgents = chatAgents.filter(agent => 
    ['retrieval'].includes(agent.type)
  );
  
  const analysisAgents = chatAgents.filter(agent => 
    ['sql', 'insight', 'chart'].includes(agent.type)
  );
  
  const qualityAgents = chatAgents.filter(agent => 
    ['critique', 'debate'].includes(agent.type)
  );
  return (
    <div className="glass-card-3d p-4 space-y-4 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 animate-slideInRight transition-all opacity-0" style={{animationFillMode: 'forwards', animationDelay: '0.3s'}}>
      {/* Header with highlights */}
      <div className="relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
        <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-cyan-500/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-cyan-500/30 to-transparent"></div>

        <div className="flex items-center justify-between mb-2 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-800/40 flex items-center justify-center border border-cyan-700/50">
              <span role="img" aria-label="chat" className="text-xl">💬</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Chat Response Agents</h3>
              <p className="text-white/70 text-xs">Query analysis and processing</p>
            </div>
          </div>
          <div className="glass-pill px-2 py-1 bg-cyan-800/30">
            <span className="text-white/80 text-xs">
              {chatAgents.filter(a => a.status === 'working').length} active
            </span>
          </div>
        </div>
      </div>      {/* Main processing agents and retrieval (in proper order) with staggered animation */}
      <div className="space-y-2 stagger-anim">
        {/* First show planner */}
        {mainProcessingAgents
          .filter(agent => agent.type === 'planner')
          .map((agent, index) => (
            <div key={agent.type} className="animate-fadeIn">
              {renderAgentPanel(agent)}
            </div>
          ))}
          
        {/* Then show query */}
        {mainProcessingAgents
          .filter(agent => agent.type === 'query')
          .map((agent, index) => (
            <div key={agent.type} className="animate-fadeIn">
              {renderAgentPanel(agent)}
            </div>
          ))}
          
        {/* Then show retrieval (moved below query) */}
        {retrievalAgents.map((agent, index) => (
          <div key={agent.type} className="animate-fadeIn">
            {renderAgentPanel(agent)}
          </div>
        ))}
      </div>      {/* Analysis agents in a grid with staggered animation */}
      {analysisAgents.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3 stagger-anim">
          {analysisAgents.map((agent, index) => (
            <div key={agent.type} className="animate-fadeIn">
              {renderAgentPanel(agent)}
            </div>
          ))}
        </div>
      )}
      
      {/* Quality agents (critique, debate) at the end of chat response agents */}
      {qualityAgents.length > 0 && (
        <div className="mt-4">          <h4 className="text-sm font-medium text-white/80 border-b border-cyan-500/30 pb-1 mb-2">Quality Control</h4>
          <div className="space-y-2 stagger-anim">
            {qualityAgents.map((agent, index) => (
              <div key={agent.type} className="animate-fadeIn">
                {renderAgentPanel(agent)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const OutputAgentsPanel: React.FC<AgentGroupPanelsProps> = ({ 
  enhancedAgents, 
  renderAgentPanel,
  fileUploaded = false
}) => {
  // Only narrative and report agents now
  const outputAgentTypes = ['narrative', 'report'];
  
  const outputAgents = outputAgentTypes
    .map(type => enhancedAgents.find(agent => agent.type === type))
    .filter(agent => agent !== undefined) as any[];

  // Debug log to check panel rendering
  console.log("OutputAgentsPanel render:", { 
    fileUploaded, 
    agentCount: outputAgents.length,
    agentTypes: outputAgents.map(a => a.type)
  });
  
  // Force display if file is uploaded, regardless of other conditions
  if (!fileUploaded) {
    console.log("OutputAgentsPanel not showing: fileUploaded is false");
    return null;
  }
    if (outputAgents.length === 0) {
    console.log("OutputAgentsPanel not showing: no agents found");
    // Even if no agents found in the enhancedAgents, show a placeholder when file is uploaded
    if (fileUploaded) {
      return (
        <div className="glass-card-3d p-4 bg-gradient-to-br from-emerald-600/20 to-teal-600/20">
          <div className="text-center py-3">
            <p className="text-white/80 text-sm">Output Generation Agents</p>
            <p className="text-white/60 text-xs mt-2">Ready for result generation...</p>
          </div>
        </div>
      );
    }
    return null;
  }
  return (
    <div className="glass-card-3d p-4 space-y-4 bg-gradient-to-br from-emerald-600/10 to-teal-600/10 animate-slideInUp transition-all opacity-0" style={{animationFillMode: 'forwards', animationDelay: '0.4s'}}>
      {/* Header with highlights */}
      <div className="relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"></div>
        <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-emerald-500/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-emerald-500/30 to-transparent"></div>

        <div className="flex items-center justify-between mb-2 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-800/40 flex items-center justify-center border border-emerald-700/50">
              <span role="img" aria-label="output" className="text-xl">📊</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Quality & Output Agents</h3>
              <p className="text-white/70 text-xs">Response enhancement and delivery</p>
            </div>
          </div>
          <div className="glass-pill px-2 py-1 bg-emerald-800/30">
            <span className="text-white/80 text-xs">
              {outputAgents.filter(a => a.status === 'working').length} active
            </span>
          </div>
        </div>
      </div>      {/* Output agents (narrative, report) with staggered animation */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white/80 border-b border-emerald-500/30 pb-1 mb-2">Final Output</h4>
        <div className="space-y-2 stagger-anim">
          {outputAgents.map((agent, index) => (
            <div key={agent.type} className="animate-fadeIn">
              {renderAgentPanel(agent)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
