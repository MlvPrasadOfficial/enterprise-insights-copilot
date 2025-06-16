"use client";
import React, { useState } from 'react';

interface NarrativeAgentPanelProps {
  agent: any;
  fileUploaded: boolean;
}

export default function NarrativeAgentPanel({ agent, fileUploaded }: NarrativeAgentPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [showOutputs, setShowOutputs] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  
  // Don't render if not uploaded or agent not available
  if (!fileUploaded || !agent) return null;
  
  const narrativeCapabilities = [
    { id: 1, name: "Adaptive Narrative Structures", enabled: true, 
      description: "Dynamically structures narrative based on content complexity and audience needs" },
    { id: 2, name: "Evidence Integration", enabled: true, 
      description: "Seamlessly combines quantitative data with qualitative insights" },
    { id: 3, name: "Audience-Aware Content", enabled: true, 
      description: "Adapts complexity and terminology to match audience expertise level" },
    { id: 4, name: "Narrative Coherence", enabled: true, 
      description: "Ensures logical flow with causal and temporal linking" },
    { id: 5, name: "Contradiction Management", enabled: true, 
      description: "Explicitly addresses conflicting insights and uncertainties" },
    { id: 6, name: "Multi-Format Output", enabled: false, 
      description: "Produces narrative in different formats (e.g., brief, detailed, technical)" },
    { id: 7, name: "Branching Narratives", enabled: false, 
      description: "Creates alternative explanations for exploring different perspectives" },
    { id: 8, name: "Metaphor Generation", enabled: true, 
      description: "Uses analogies to explain complex concepts clearly" },
    { id: 9, name: "Visual Storytelling Integration", enabled: false, 
      description: "Combines text narrative with visual elements" },
    { id: 10, name: "Narrative Pacing", enabled: true, 
      description: "Emphasizes key insights through strategic pacing" },
    { id: 11, name: "Emotional Resonance", enabled: true, 
      description: "Selects appropriate tone to create emotional connection" },
    { id: 12, name: "Implication Extraction", enabled: true, 
      description: "Develops clear implications and recommendations from findings" }
  ];

  return (
    <div className="glass-card-3d p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 transition-all">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-800/30 flex items-center justify-center border border-blue-700/30">
            <span role="img" aria-label="narrative" className="text-xl">📖</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Advanced Narrative Agent</h3>
            <p className="text-white/70 text-xs">Creates cohesive data narratives</p>
          </div>
        </div>        <div className="flex items-center space-x-3">
          {/* Output button */}
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent panel expansion
              setShowOutputs(!showOutputs);
              setShowCapabilities(false);
            }}
            className={`px-2 py-1 text-xs ${showOutputs ? 'bg-indigo-600/60' : 'bg-indigo-800/40 hover:bg-indigo-700/50'} rounded text-white/80 flex items-center space-x-1 border border-indigo-600/30 transition-all`}
          >
            <span>Outputs</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${showOutputs ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Capabilities button */}
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent panel expansion
              setShowCapabilities(!showCapabilities);
              setShowOutputs(false);
            }}
            className={`px-2 py-1 text-xs ${showCapabilities ? 'bg-emerald-600/60' : 'bg-emerald-800/40 hover:bg-emerald-700/50'} rounded text-white/80 flex items-center space-x-1 border border-emerald-600/30 transition-all`}
          >
            <span>Capabilities</span>
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 transition-transform ${showCapabilities ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Expand/collapse icon */}
          <div>
            {expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>
        {/* Outputs section - expandable */}
      {showOutputs && (
        <div className="mt-3 animate-slideDown overflow-hidden">
          <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-lg p-3 space-y-3">
            <h4 className="text-white/90 font-medium text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Narrative Outputs
            </h4>
            
            <div className="space-y-2">
              <div className="bg-indigo-900/30 rounded p-3">
                <div className="text-white/90 text-sm font-medium">Story Structure</div>
                <div className="text-white/70 text-sm mt-1">Problem → Analysis → Discovery → Recommendation</div>
                <div className="mt-2 text-xs text-white/50">This narrative follows a structured approach to ensure clear communication and logical flow</div>
              </div>
              
              <div className="bg-indigo-900/30 rounded p-3">
                <div className="text-white/90 text-sm font-medium">Content Highlights</div>
                <div className="text-white/70 text-sm mt-1">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Unexpected correlation between customer age and product usage</li>
                    <li>Regional variations in adoption rates</li>
                    <li>Key factors influencing customer satisfaction</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-indigo-900/30 rounded p-3">
                <div className="text-white/90 text-sm font-medium">Communication Style</div>
                <div className="text-white/70 text-sm mt-1">Executive summary with supporting detailed evidence</div>
                <div className="mt-2 text-xs text-white/50">Tailored for business stakeholders with both high-level insights and detailed analysis</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Capabilities section - expandable */}
      {showCapabilities && (
        <div className="mt-3 animate-slideDown overflow-hidden">
          <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3">
            <h4 className="text-white/90 font-medium text-sm flex items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Advanced Capabilities
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
              {narrativeCapabilities.map(capability => (
                <div 
                  key={capability.id} 
                  className={`p-3 rounded-lg text-sm ${capability.enabled ? 'bg-emerald-900/30 border border-emerald-500/30' : 'bg-gray-800/30 border border-gray-700/30 opacity-60'}`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${capability.enabled ? 'bg-emerald-400' : 'bg-gray-500'}`}></div>
                    <span className="text-white font-medium">{capability.name}</span>
                  </div>
                  <p className="mt-1.5 text-white/70 text-sm">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {expanded && (
        <div className="mt-4 space-y-4 animate-fadeIn">
          <div>
            <h4 className="text-white font-medium text-sm mb-2">Narrative Process</h4>
            <div className="bg-black/20 p-3 rounded-lg space-y-2">
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                <span className="text-white/80 text-xs">Content Analysis</span>
                <span className="text-green-400 text-xs">Completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                <span className="text-white/80 text-xs">Audience Assessment</span>
                <span className="text-green-400 text-xs">Completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-white/80 text-xs">Narrative Structure Creation</span>
                <span className="text-blue-400 text-xs">In Progress</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                <span className="text-white/80 text-xs">Insight Integration</span>
                <span className="text-gray-400 text-xs">Pending</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                <span className="text-white/80 text-xs">Narrative Refinement</span>
                <span className="text-gray-400 text-xs">Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
