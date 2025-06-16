"use client";
import React, { useState } from 'react';

interface ReportAgentPanelProps {
  agent: any;
  fileUploaded: boolean;
}

export default function ReportAgentPanel({ agent, fileUploaded }: ReportAgentPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const [showOutputs, setShowOutputs] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  
  // Don't render if not uploaded or agent not available
  if (!fileUploaded || !agent) return null;
  
  const reportCapabilities = [
    { id: 1, name: "Dynamic Template Generation", enabled: true, 
      description: "Creates custom templates based on content needs" },
    { id: 2, name: "Advanced Styling", enabled: true, 
      description: "Applies brand-compliant styling with accessibility features" },
    { id: 3, name: "Interactive Visualization", enabled: true, 
      description: "Embeds interactive charts and data elements" },
    { id: 4, name: "Multi-Format Output", enabled: true, 
      description: "Generates reports in PDF, HTML, PPTX, and dashboard formats" },
    { id: 5, name: "Rich Metadata", enabled: false, 
      description: "Adds searchable metadata and categorization" },
    { id: 6, name: "Version Control", enabled: false, 
      description: "Tracks changes across report versions" },
    { id: 7, name: "Modular Components", enabled: true, 
      description: "Uses reusable components for consistent reporting" },
    { id: 8, name: "Automated Executive Summary", enabled: true, 
      description: "Creates concise summaries highlighting key points" },
    { id: 9, name: "Contextual Recommendations", enabled: true, 
      description: "Provides actionable next steps based on findings" },
    { id: 10, name: "Conditional Content", enabled: false, 
      description: "Adapts content based on audience and purpose" },
    { id: 11, name: "Collaborative Annotations", enabled: false, 
      description: "Enables feedback and notes on report sections" },
    { id: 12, name: "Scheduled Distribution", enabled: false, 
      description: "Automates report generation and sharing" }
  ];

  const reportFormats = [
    { id: "pdf", name: "PDF Report", icon: "📄", enabled: true },
    { id: "html", name: "Web Report", icon: "🌐", enabled: true },
    { id: "pptx", name: "Presentation", icon: "📊", enabled: true },
    { id: "dashboard", name: "Interactive Dashboard", icon: "📱", enabled: false },
    { id: "excel", name: "Excel Workbook", icon: "📊", enabled: false },
  ];

  return (
    <div className="glass-card-3d p-4 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 transition-all">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-800/30 flex items-center justify-center border border-indigo-700/30">
            <span role="img" aria-label="report" className="text-xl">📄</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">Advanced Report Generator</h3>
            <p className="text-white/70 text-xs">Creates multi-format professional reports</p>
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
              Report Outputs
            </h4>
            
            <div className="space-y-2">
              <div className="bg-indigo-900/30 rounded p-3">
                <div className="text-white/90 text-sm font-medium">Report Components</div>
                <div className="text-white/70 text-sm mt-1">
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Executive Summary - Key findings and recommendations</li>
                    <li>Methodology - Data collection and analysis approach</li>
                    <li>Detailed Findings - Comprehensive analysis with visualizations</li>
                    <li>Recommendations - Data-driven action items</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-indigo-900/30 rounded p-3">
                <div className="text-white/90 text-sm font-medium">Available Output Formats</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {reportFormats.map(format => (
                    <div 
                      key={format.id}
                      className={`px-2 py-1 rounded-md flex items-center space-x-1.5 ${format.enabled ? 'bg-indigo-900/40 border border-indigo-500/30' : 'bg-gray-800/30 border border-gray-700/30 opacity-60'}`}
                    >
                      <span className="text-base">{format.icon}</span>
                      <span className={`text-xs ${format.enabled ? 'text-white' : 'text-white/60'}`}>{format.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-indigo-900/30 rounded p-3">
                <div className="text-white/90 text-sm font-medium">Citation & Source Management</div>
                <div className="text-white/70 text-sm mt-1">All insights are linked to their source data, analysis methods, and timestamp for complete traceability</div>
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
              Report Generator Capabilities
            </h4>
            
            <div className="grid grid-cols-1 gap-2">
              {reportCapabilities.map(capability => (
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
            <h4 className="text-white font-medium text-sm mb-2">Available Report Formats</h4>
            <div className="flex flex-wrap gap-2">
              {reportFormats.map(format => (
                <div 
                  key={format.id} 
                  className={`p-2 rounded-lg flex items-center space-x-2 ${format.enabled ? 'bg-indigo-900/30 border border-indigo-500/30' : 'bg-gray-800/30 border border-gray-700/30 opacity-60'}`}
                >
                  <span className="text-lg">{format.icon}</span>
                  <span className="text-white text-xs">{format.name}</span>
                  {format.enabled && <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-medium text-sm mb-2">Advanced Capabilities</h4>
            <div className="grid grid-cols-2 gap-2">
              {reportCapabilities.map(capability => (
                <div 
                  key={capability.id} 
                  className={`p-2 rounded-lg text-xs ${capability.enabled ? 'bg-indigo-900/30 border border-indigo-500/30' : 'bg-gray-800/30 border border-gray-700/30 opacity-60'}`}
                >
                  <div className="flex items-center space-x-1.5">
                    <div className={`h-2 w-2 rounded-full ${capability.enabled ? 'bg-indigo-400' : 'bg-gray-500'}`}></div>
                    <span className="text-white">{capability.name}</span>
                  </div>
                  <p className="mt-1 text-white/70 text-xs">{capability.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium text-sm mb-2">Report Generation Process</h4>
            <div className="bg-black/20 p-3 rounded-lg space-y-2">
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                <span className="text-white/80 text-xs">Content Collection</span>
                <span className="text-green-400 text-xs">Completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                <span className="text-white/80 text-xs">Template Selection</span>
                <span className="text-green-400 text-xs">Completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse"></div>
                <span className="text-white/80 text-xs">Component Assembly</span>
                <span className="text-blue-400 text-xs">In Progress</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                <span className="text-white/80 text-xs">Format Generation</span>
                <span className="text-gray-400 text-xs">Pending</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400"></div>
                <span className="text-white/80 text-xs">Quality Assurance</span>
                <span className="text-gray-400 text-xs">Pending</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
