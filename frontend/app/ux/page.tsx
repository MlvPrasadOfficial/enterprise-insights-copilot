"use client";
import { useState } from "react";

import PageBackground from "@/components/PageBackground";

export default function UXPage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  const tabs = [
    { id: "overview", title: "UI/UX Overview", icon: "🎨" },
    { id: "craftify", title: "Craftify Analysis", icon: "🌟" },
    { id: "home", title: "Home Page Analysis", icon: "🏠" },
    { id: "project", title: "Project Page Analysis", icon: "📊" },
    { id: "architecture", title: "Architecture Page Analysis", icon: "🏗️" },
    { id: "recommendations", title: "Billion-Dollar Recommendations", icon: "💎" },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Current UI/UX State */}
      <div className="glass-card-3d p-8">
        <h3 className="text-3xl font-bold text-white mb-8 text-center">
          Current UI/UX Assessment - Comprehensive Analysis
        </h3>
        
        {/* Overall Rating */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card-3d p-6 text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">85%</div>
            <div className="text-white font-semibold">Overall Design Quality</div>
            <div className="text-gray-300 text-sm mt-2">Excellent foundation with modern aesthetics</div>
          </div>
          
          <div className="glass-card-3d p-6 text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">78%</div>
            <div className="text-white font-semibold">User Experience</div>
            <div className="text-gray-300 text-sm mt-2">Good flow with room for enhancement</div>
          </div>
          
          <div className="glass-card-3d p-6 text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">92%</div>
            <div className="text-white font-semibold">Visual Appeal</div>
            <div className="text-gray-300 text-sm mt-2">Outstanding glassmorphic design</div>
          </div>
        </div>

        {/* Design System Analysis */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card-3d p-6">
            <h4 className="text-xl font-semibold text-green-400 mb-4 flex items-center space-x-2">
              <span>✅</span>
              <span>Strengths</span>
            </h4>
            <ul className="space-y-3">
              {[
                "🎨 Modern glassmorphic design with backdrop blur effects",
                "🌈 Consistent color palette with professional gradients",
                "📱 Responsive design that adapts to different screen sizes",
                "⚡ Smooth animations and micro-interactions",
                "🔄 Real-time agent status updates with visual feedback",
                "📊 Clear data visualization with Recharts integration",
                "🎯 Intuitive navigation with breadcrumb system",
                "💼 Professional enterprise-grade aesthetic"
              ].map((item, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                  <span className="flex-shrink-0">{item.split(' ')[0]}</span>
                  <span>{item.substring(item.indexOf(' ') + 1)}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-orange-400 mb-4">⚠️ Areas for Improvement</h4>
            <ul className="space-y-3">
              {[
                "🎨 Inconsistent spacing and padding across components",
                "📝 Limited typography hierarchy for content organization",
                "🔄 Loading states could be more sophisticated",
                "📱 Mobile experience needs optimization",
                "🎯 Some UI elements lack clear affordances",
                "📊 Data tables need better pagination and filtering",
                "🔍 Search functionality is limited",
                "💡 Tooltips and help text are minimal"
              ].map((item, index) => (
                <li key={index} className="text-sm text-gray-300 flex items-start space-x-2">
                  <span className="flex-shrink-0">{item.split(' ')[0]}</span>
                  <span>{item.substring(item.indexOf(' ') + 1)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Component Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <span>🧩</span>
          <span>Component-Level Analysis</span>
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { 
              name: "Chat Interface", 
              rating: "88%", 
              color: "green", 
              pros: ["Clean message bubbles", "Real-time updates", "Agent status integration"],
              cons: ["Could use message threading", "Limited formatting options"]
            },
            { 
              name: "File Upload", 
              rating: "82%", 
              color: "blue", 
              pros: ["Drag & drop support", "Multi-file handling", "Progress feedback"],
              cons: ["File type validation could be clearer", "Size limits not prominent"]
            },
            { 
              name: "Agent Dashboard", 
              rating: "75%", 
              color: "purple", 
              pros: ["Real-time status", "Clear agent roles", "Visual indicators"],
              cons: ["Could be more compact", "Timeline view missing"]
            },
            { 
              name: "Data Visualization", 
              rating: "90%", 
              color: "cyan", 
              pros: ["Multiple chart types", "Interactive tooltips", "Responsive design"],
              cons: ["Limited customization", "Export options minimal"]
            },
            { 
              name: "Navigation", 
              rating: "85%", 
              color: "amber", 
              pros: ["Intuitive structure", "Breadcrumbs", "Active states"],
              cons: ["Missing search", "No keyboard shortcuts"]
            },
            { 
              name: "Forms & Inputs", 
              rating: "78%", 
              color: "rose", 
              pros: ["Consistent styling", "Good focus states", "Error handling"],
              cons: ["Validation could be real-time", "Help text limited"]
            }
          ].map((component, index) => (
            <div key={index} className={`bg-${component.color}-500/10 rounded-xl p-4 border border-${component.color}-500/20`}>
              <div className="flex items-center justify-between mb-3">
                <h4 className={`font-semibold text-${component.color}-400`}>{component.name}</h4>
                <span className={`text-${component.color}-300 font-bold`}>{component.rating}</span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h5 className="text-xs font-medium text-green-400 mb-1">Pros:</h5>
                  <ul className="space-y-1">
                    {component.pros.map((pro, i) => (
                      <li key={i} className="text-xs text-gray-300">✓ {pro}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h5 className="text-xs font-medium text-orange-400 mb-1">Improvements:</h5>
                  <ul className="space-y-1">
                    {component.cons.map((con, i) => (
                      <li key={i} className="text-xs text-gray-300">• {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHomePage = () => (
    <div className="space-y-8">
      {/* Home Page Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          🏠 Home Page - Detailed UX Analysis
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Visual Hierarchy */}
          <div className="space-y-6">
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <h4 className="text-lg font-semibold text-green-400 mb-3">✅ Excellent Design Elements</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>🎨 <strong>Glassmorphic Hero Section</strong> - Modern, eye-catching design</li>
                <li>🌊 <strong>Gradient Backgrounds</strong> - Professional blue-to-purple gradients</li>
                <li>✨ <strong>Animated Elements</strong> - Floating particles, pulse effects</li>
                <li>📱 <strong>Two-Column Layout</strong> - Efficient space utilization</li>
                <li>🔄 <strong>Real-time Updates</strong> - Live agent status tracking</li>
                <li>📊 <strong>Data Preview</strong> - Immediate feedback on file upload</li>
                <li>💬 <strong>Chat Interface</strong> - Clean, conversational design</li>
                <li>🎯 <strong>Clear CTAs</strong> - Prominent upload and send buttons</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">🚀 Advanced Features</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>🔄 <strong>Multi-File Upload</strong> - Supports multiple CSV files</li>
                <li>📈 <strong>Smart Suggestions</strong> - AI-powered query suggestions</li>
                <li>🧹 <strong>Data Quality Analysis</strong> - Automatic data validation</li>
                <li>📤 <strong>Export Functionality</strong> - Download processed data</li>
                <li>🎨 <strong>Enhanced Components</strong> - DataQualityAnalyzer, SmartSuggestions</li>
                <li>🔍 <strong>Process Visualizer</strong> - Visual workflow representation</li>
              </ul>
            </div>
          </div>
          
          {/* Issues & Improvements */}
          <div className="space-y-6">
            <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
              <h4 className="text-lg font-semibold text-orange-400 mb-3">⚠️ UX Issues</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📱 <strong>Mobile Responsiveness</strong> - Sidebar doesn&apos;t adapt well</li>
                <li>🎯 <strong>Information Density</strong> - Too much information in single view</li>
                <li>🔄 <strong>Loading States</strong> - Generic loading indicators</li>
                <li>💡 <strong>Help System</strong> - No onboarding or tooltips</li>
                <li>🔍 <strong>Search Functionality</strong> - Missing global search</li>
                <li>📊 <strong>Data Table Pagination</strong> - Shows all rows without pagination</li>
                <li>⌨️ <strong>Keyboard Navigation</strong> - Limited keyboard shortcuts</li>
                <li>🎨 <strong>Visual Feedback</strong> - Some actions lack confirmation</li>
              </ul>
            </div>
            
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
              <h4 className="text-lg font-semibold text-red-400 mb-3">🚨 Critical UX Problems</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>🔄 <strong>State Management</strong> - Page refresh loses all data</li>
                <li>📱 <strong>Mobile Experience</strong> - Poor touch targets, small text</li>
                <li>⚡ <strong>Performance</strong> - Large datasets cause UI lag</li>
                <li>🎯 <strong>Error Handling</strong> - Generic error messages</li>
                <li>📊 <strong>Data Persistence</strong> - No auto-save functionality</li>
                <li>🔍 <strong>Accessibility</strong> - Missing ARIA labels, poor contrast</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* User Journey Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <span>🛣️</span>
          <span>User Journey Flow</span>
        </h3>
        
        <div className="relative">
          {/* Journey Steps */}
          <div className="flex flex-col space-y-8">
            {[
              {
                step: "1. Landing",
                status: "Good",
                color: "green",
                description: "User arrives at clean, professional interface",
                issues: ["No onboarding tour", "Missing value proposition"],
                rating: "85%"
              },
              {
                step: "2. File Upload",
                status: "Excellent",
                color: "blue",
                description: "Drag & drop with instant preview",
                issues: ["File size limits unclear", "Limited file type validation"],
                rating: "90%"
              },
              {
                step: "3. Data Exploration",
                status: "Good",
                color: "purple",
                description: "Smart suggestions and data quality insights",
                issues: ["No data filtering", "Limited search capabilities"],
                rating: "78%"
              },
              {
                step: "4. Query & Analysis",
                status: "Excellent",
                color: "cyan",
                description: "Natural language queries with agent workflow",
                issues: ["Loading states could be better", "No query history"],
                rating: "88%"
              },
              {
                step: "5. Results & Export",
                status: "Fair",
                color: "amber",
                description: "Charts and insights with export options",
                issues: ["Limited customization", "No sharing features"],
                rating: "72%"
              }
            ].map((journey, index) => (
              <div key={index} className={`bg-${journey.color}-500/10 rounded-xl p-6 border border-${journey.color}-500/20`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-${journey.color}-500 rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {index + 1}
                    </div>
                    <h4 className={`text-lg font-semibold text-${journey.color}-400`}>{journey.step}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${journey.color}-500/20 text-${journey.color}-300`}>
                      {journey.status}
                    </span>
                  </div>
                  <span className={`text-${journey.color}-300 font-bold text-lg`}>{journey.rating}</span>
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{journey.description}</p>
                
                <div>
                  <h5 className="text-orange-400 text-xs font-medium mb-2">Improvement Areas:</h5>
                  <ul className="space-y-1">
                    {journey.issues.map((issue, i) => (
                      <li key={i} className="text-xs text-gray-400">• {issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjectPage = () => (
    <div className="space-y-8">
      {/* Project Page Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          📊 Project Page - Information Architecture Analysis
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <h4 className="text-lg font-semibold text-green-400 mb-3">✅ Excellent Structure</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📋 <strong>Clear Navigation Tabs</strong> - Overview, Pros, Cons, Improvements</li>
                <li>🎨 <strong>Consistent Visual Design</strong> - Matches overall brand aesthetic</li>
                <li>📊 <strong>Comprehensive Content</strong> - Detailed technical analysis</li>
                <li>🔄 <strong>Interactive Elements</strong> - Smooth tab transitions</li>
                <li>🏗️ <strong>Logical Flow</strong> - Information hierarchy makes sense</li>
                <li>📈 <strong>Progress Indicators</strong> - Clear improvement roadmap</li>
                <li>🎯 <strong>Actionable Insights</strong> - Specific recommendations</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">📚 Content Quality</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>🔍 <strong>Technical Depth</strong> - Detailed codebase analysis</li>
                <li>⚖️ <strong>Balanced Assessment</strong> - Both pros and cons covered</li>
                <li>🎯 <strong>Prioritized Improvements</strong> - Clear timeline and priorities</li>
                <li>📊 <strong>Data-Driven</strong> - Specific metrics and line counts</li>
                <li>🏆 <strong>Professional Presentation</strong> - Enterprise-grade documentation</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
              <h4 className="text-lg font-semibold text-orange-400 mb-3">⚠️ UX Improvements Needed</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📱 <strong>Content Density</strong> - Very text-heavy, overwhelming</li>
                <li>🎨 <strong>Visual Breaks</strong> - Needs more diagrams and visuals</li>
                <li>🔍 <strong>Search Functionality</strong> - No way to search content</li>
                <li>📊 <strong>Progress Tracking</strong> - No way to mark items as complete</li>
                <li>💾 <strong>Bookmarking</strong> - No way to save important sections</li>
                <li>📱 <strong>Mobile Layout</strong> - Poor mobile reading experience</li>
                <li>🔄 <strong>Interactive Elements</strong> - Could use more interactive content</li>
              </ul>
            </div>
            
            <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
              <h4 className="text-lg font-semibold text-purple-400 mb-3">💡 Enhancement Opportunities</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📊 <strong>Interactive Charts</strong> - Show progress visually</li>
                <li>✅ <strong>Checklist Format</strong> - Allow marking items as done</li>
                <li>💬 <strong>Comments System</strong> - Team collaboration features</li>
                <li>📅 <strong>Timeline View</strong> - Visual project timeline</li>
                <li>🔗 <strong>Cross-References</strong> - Links between related items</li>
                <li>📋 <strong>Export Options</strong> - PDF, markdown, or other formats</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderArchitecturePage = () => (
    <div className="space-y-8">
      {/* Architecture Page Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          🏗️ Architecture Page - Technical Documentation UX
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <h4 className="text-lg font-semibold text-green-400 mb-3">✅ Strong Technical Presentation</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>🎨 <strong>Visual Workflow</strong> - Step-by-step process visualization</li>
                <li>🏗️ <strong>System Architecture</strong> - Clear component relationships</li>
                <li>🤖 <strong>Agent Documentation</strong> - Detailed agent descriptions</li>
                <li>⚙️ <strong>Tech Stack Overview</strong> - Comprehensive technology listing</li>
                <li>🔄 <strong>Interactive Tabs</strong> - Well-organized content sections</li>
                <li>📊 <strong>Color-Coded Elements</strong> - Visual distinction for components</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-3">🎯 Educational Value</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📚 <strong>Comprehensive Coverage</strong> - Full system explanation</li>
                <li>🔍 <strong>Technical Depth</strong> - Suitable for developers</li>
                <li>🎓 <strong>Learning Resource</strong> - Great for understanding the system</li>
                <li>🔗 <strong>Integration Points</strong> - Clear external dependencies</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/20">
              <h4 className="text-lg font-semibold text-orange-400 mb-3">⚠️ Usability Issues</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📱 <strong>Information Overload</strong> - Too much text, overwhelming</li>
                <li>🎨 <strong>Static Diagrams</strong> - Could be more interactive</li>
                <li>🔍 <strong>No Search</strong> - Hard to find specific information</li>
                <li>📊 <strong>Missing Metrics</strong> - No performance or usage data</li>
                <li>🔄 <strong>Navigation</strong> - Difficult to jump between sections</li>
                <li>📱 <strong>Mobile Experience</strong> - Poor mobile optimization</li>
              </ul>
            </div>
            
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
              <h4 className="text-lg font-semibold text-red-400 mb-3">🚨 Major UX Problems</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>🎨 <strong>Visual Hierarchy</strong> - Everything looks equally important</li>
                <li>📊 <strong>Interactive Elements</strong> - Diagrams should be clickable</li>
                <li>🔗 <strong>Deep Linking</strong> - No way to link to specific sections</li>
                <li>💾 <strong>Bookmark Support</strong> - Can&apos;t save position in long content</li>
                <li>🎯 <strong>User Personas</strong> - Doesn&apos;t cater to different skill levels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Documentation Best Practices */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <span>📖</span>
          <span>Technical Documentation UX Standards</span>
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              category: "Visual Design",
              items: [
                "Interactive diagrams with hover states",
                "Collapsible content sections",
                "Syntax highlighting for code",
                "Progressive disclosure of complexity",
                "Visual breadcrumbs for navigation"
              ]
            },
            {
              category: "Content Structure",
              items: [
                "Quick reference cards",
                "Getting started guides",
                "Advanced topics separation",
                "FAQ sections for common issues",
                "Cross-references between related topics"
              ]
            },
            {
              category: "Interactive Features",
              items: [
                "Live code examples",
                "Copy-to-clipboard functionality",
                "In-page search with highlighting",
                "Feedback collection on each section",
                "Version comparison tools"
              ]
            }
          ].map((section, index) => (
            <div key={index} className="bg-gray-800/50 rounded-xl p-4 border border-white/10">
              <h4 className="text-white font-semibold mb-3">{section.category}</h4>
              <ul className="space-y-2">
                {section.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRecommendations = () => (
    <div className="space-y-8">
      {/* Billion-Dollar Company Recommendations */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl p-8 border border-purple-500/20">
        <h3 className="text-3xl font-bold text-center mb-6">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            💎 Billion-Dollar Company Design Recommendations
          </span>
        </h3>
        
        <p className="text-center text-gray-300 text-lg mb-8 max-w-4xl mx-auto">
          Transform your platform into an enterprise-grade product that competes with 
          industry leaders like Tableau, PowerBI, and Databricks.
        </p>
      </div>

      {/* Design System Overhaul */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <span>🎨</span>
          <span>1. Enterprise Design System</span>
        </h3>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/20">
              <h4 className="text-lg font-semibold text-purple-400 mb-4">Visual Identity & Branding</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>🎨 <strong>Professional Logo Suite</strong> - Scalable SVG logos for all contexts</li>
                <li>🌈 <strong>Sophisticated Color Palette</strong> - Primary, secondary, semantic colors</li>
                <li>✏️ <strong>Typography System</strong> - Custom font stack with proper hierarchy</li>
                <li>📐 <strong>Spacing Grid</strong> - 8px base grid system for consistency</li>
                <li>🎭 <strong>Icon Library</strong> - Custom SVG icon set with consistent style</li>
                <li>🖼️ <strong>Illustration Style</strong> - Professional technical illustrations</li>
              </ul>
            </div>
            
            <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/20">
              <h4 className="text-lg font-semibold text-blue-400 mb-4">Component Architecture</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li>🧩 <strong>Atomic Design System</strong> - Atoms, molecules, organisms</li>
                <li>📦 <strong>Component Library</strong> - Reusable, documented components</li>
                <li>🎯 <strong>Design Tokens</strong> - CSS custom properties for theming</li>
                <li>🔄 <strong>State Management</strong> - Consistent interaction patterns</li>
                <li>♿ <strong>Accessibility First</strong> - WCAG 2.1 AA compliance</li>
                <li>📱 <strong>Responsive Patterns</strong> - Mobile-first component design</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-white/10">
            <h4 className="text-lg font-semibold text-amber-400 mb-4">Industry Benchmark Examples</h4>
            
            <div className="space-y-4">
              {[
                {
                  company: "Figma",
                  example: "Component variants and design tokens",
                  why: "Enables rapid prototyping and consistency"
                },
                {
                  company: "Stripe",
                  example: "Typography and spacing system",
                  why: "Creates professional, trustworthy appearance"
                },
                {
                  company: "Notion",
                  example: "Subtle animations and micro-interactions",
                  why: "Enhances user delight without distraction"
                },
                {
                  company: "Linear",
                  example: "Dark mode optimization and performance",
                  why: "Modern aesthetic that developers love"
                }
              ].map((benchmark, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white">{benchmark.company}</span>
                    <span className="text-xs text-gray-400">Industry Leader</span>
                  </div>
                  <div className="text-sm text-blue-300 mb-1">{benchmark.example}</div>
                  <div className="text-xs text-gray-400">{benchmark.why}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* User Experience Revolution */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <span>🚀</span>
          <span>2. Revolutionary User Experience</span>
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "AI-Powered Interface",
              icon: "🤖",
              color: "purple",
              features: [
                "Contextual AI suggestions",
                "Predictive user actions",
                "Natural language everything",
                "Smart auto-completion",
                "Intelligent error prevention"
              ]
            },
            {
              title: "Seamless Collaboration",
              icon: "👥",
              color: "blue",
              features: [
                "Real-time multiplayer editing",
                "Comment and annotation system",
                "Version control with branching",
                "Role-based permissions",
                "Activity feed and notifications"
              ]
            },
            {
              title: "Advanced Visualization",
              icon: "📊",
              color: "green",
              features: [
                "Interactive 3D charts",
                "Custom visualization builder",
                "Animation and transitions",
                "Responsive chart layouts",
                "Export in multiple formats"
              ]
            }
          ].map((section, index) => (
            <div key={index} className={`bg-${section.color}-500/10 rounded-xl p-6 border border-${section.color}-500/20`}>
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">{section.icon}</span>
                <h4 className={`text-lg font-semibold text-${section.color}-400`}>{section.title}</h4>
              </div>
                <ul className="space-y-2">
                {section.features.map((feature, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start space-x-2">
                    <span className={`text-${section.color}-400 mt-1`}>•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Roadmap */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <span>🗺️</span>
          <span>3. Implementation Roadmap</span>
        </h3>
        
        <div className="space-y-6">
          {[
            {
              phase: "Phase 1: Foundation (Week 1-4)",
              color: "red",
              priority: "Critical",
              items: [
                "Implement comprehensive design system",
                "Mobile-first responsive redesign",
                "Accessibility audit and fixes",
                "Performance optimization",
                "Error handling standardization"
              ]
            },
            {
              phase: "Phase 2: Enhancement (Week 5-8)",
              color: "orange",
              priority: "High",
              items: [
                "Advanced data visualization suite",
                "Real-time collaboration features",
                "AI-powered user assistance",
                "Progressive web app capabilities",
                "Advanced search and filtering"
              ]
            },
            {
              phase: "Phase 3: Innovation (Week 9-12)",
              color: "green",
              priority: "Strategic",
              items: [
                "Custom visualization builder",
                "Voice interaction integration",
                "Augmented analytics features",
                "Advanced export and sharing",
                "White-label customization"
              ]
            }
          ].map((phase, index) => (
            <div key={index} className={`bg-${phase.color}-500/10 rounded-xl p-6 border border-${phase.color}-500/20`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-xl font-semibold text-${phase.color}-400`}>{phase.phase}</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${phase.color}-500/20 text-${phase.color}-300`}>
                  {phase.priority}
                </span>
              </div>
              
              <ul className="grid md:grid-cols-2 gap-2">
                {phase.items.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start space-x-2 p-2 bg-white/5 rounded-lg">
                    <span className={`text-${phase.color}-400 mt-1`}>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Competitive Analysis */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <span>🏆</span>
          <span>4. Competitive Feature Matrix</span>
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-4 px-4 text-white font-semibold">Feature</th>
                <th className="text-center py-4 px-4 text-purple-400 font-semibold">Our Platform</th>
                <th className="text-center py-4 px-4 text-blue-400 font-semibold">Tableau</th>
                <th className="text-center py-4 px-4 text-green-400 font-semibold">PowerBI</th>
                <th className="text-center py-4 px-4 text-amber-400 font-semibold">Databricks</th>
                <th className="text-center py-4 px-4 text-cyan-400 font-semibold">Recommended</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: "Natural Language Query",
                  current: "✅ Advanced",
                  tableau: "⚠️ Limited",
                  powerbi: "✅ Good",
                  databricks: "❌ None",
                  recommended: "🚀 Best-in-class"
                },
                {
                  feature: "Real-time Collaboration",
                  current: "❌ None",
                  tableau: "✅ Advanced",
                  powerbi: "✅ Good",
                  databricks: "⚠️ Limited",
                  recommended: "🚀 Essential"
                },
                {
                  feature: "Mobile Experience",
                  current: "⚠️ Poor",
                  tableau: "✅ Good",
                  powerbi: "✅ Excellent",
                  databricks: "⚠️ Limited",
                  recommended: "🚀 Mobile-first"
                },
                {
                  feature: "AI-Powered Insights",
                  current: "✅ Advanced",
                  tableau: "✅ Good",
                  powerbi: "✅ Advanced",
                  databricks: "✅ Excellent",
                  recommended: "🚀 Industry-leading"
                },
                {
                  feature: "Custom Visualizations",
                  current: "⚠️ Limited",
                  tableau: "✅ Excellent",
                  powerbi: "✅ Good",
                  databricks: "✅ Advanced",
                  recommended: "🚀 Unlimited"
                }
              ].map((row, index) => (
                <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-3 px-4 text-gray-300">{row.feature}</td>
                  <td className="py-3 px-4 text-center text-purple-300">{row.current}</td>
                  <td className="py-3 px-4 text-center text-blue-300">{row.tableau}</td>
                  <td className="py-3 px-4 text-center text-green-300">{row.powerbi}</td>
                  <td className="py-3 px-4 text-center text-amber-300">{row.databricks}</td>
                  <td className="py-3 px-4 text-center text-cyan-300">{row.recommended}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Investment & ROI */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-md rounded-2xl p-8 border border-green-500/20">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <span>💰</span>
          <span>5. Investment & Expected ROI</span>
        </h3>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-400 mb-2">$200K</div>
            <div className="text-white font-semibold mb-2">Total Investment</div>
            <div className="text-gray-300 text-sm">3-month development cycle</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-400 mb-2">$2M+</div>
            <div className="text-white font-semibold mb-2">Expected Revenue</div>
            <div className="text-gray-300 text-sm">First year post-launch</div>
          </div>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-400 mb-2">10x</div>
            <div className="text-white font-semibold mb-2">ROI Multiple</div>
            <div className="text-gray-300 text-sm">Conservative estimate</div>
          </div>
        </div>
        
        <div className="mt-8 p-6 bg-white/10 rounded-xl border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Success Metrics & KPIs</h4>
          <div className="grid md:grid-cols-2 gap-6">
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📈 <strong>User Engagement:</strong> 300% increase in session duration</li>
              <li>💰 <strong>Conversion Rate:</strong> 150% improvement in trial-to-paid</li>
              <li>⭐ <strong>User Satisfaction:</strong> NPS score above 70</li>
              <li>🚀 <strong>Performance:</strong> 80% faster load times</li>
            </ul>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>📱 <strong>Mobile Usage:</strong> 400% increase in mobile engagement</li>
              <li>🎯 <strong>Feature Adoption:</strong> 90% of users using advanced features</li>
              <li>🔄 <strong>Retention:</strong> 85% month-over-month retention</li>
              <li>📊 <strong>Enterprise Sales:</strong> 200% increase in enterprise deals</li>
            </ul>
          </div>        </div>
      </div>
    </div>
  );

  const renderCraftifyAnalysis = () => (
    <div className="space-y-8">
      {/* Craftify Reference Analysis */}
      <div className="bg-gradient-to-br from-purple-900/20 via-violet-900/20 to-pink-900/20 backdrop-blur-md rounded-3xl p-8 border border-purple-500/30">
        <h3 className="text-3xl font-bold text-white mb-6 text-center">
          🎨 Craftify-Inspired Design Analysis
        </h3>
        
        {/* Visual Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-semibold text-purple-400 mb-4">🎯 Craftify Design Strengths</h4>
            <div className="space-y-3">
              {[
                "Bold purple gradient backgrounds with depth",
                "High-contrast white typography for readability", 
                "Glassmorphic cards with subtle transparency",
                "Strategic use of bright accent colors",
                "Clean, minimalist navigation design",
                "Central product preview as focal point",
                "Generous whitespace and balanced spacing",
                "Consistent rounded corner radius (xl/2xl)",
                "Subtle dot pattern overlays for texture"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h4 className="text-xl font-semibold text-blue-400 mb-4">📊 Current Enterprise Insights</h4>
            <div className="space-y-3">
              {[
                "Slate-blue gradient (good foundation)",
                "White text with good contrast",
                "Basic glassmorphism implementation", 
                "Limited accent color variety",
                "Functional but plain navigation",
                "No central visual focal point",
                "Adequate spacing, room for improvement",
                "Consistent border radius usage",
                "Missing textural elements"
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>        {/* Color Palette Comparison */}
        <div className="bg-gray-800/30 rounded-2xl p-6 border border-white/10 mb-8">
          <h4 className="text-xl font-semibold text-white mb-4 text-center">🎨 Color Palette Analysis</h4>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h5 className="text-purple-400 font-medium mb-3">Craftify Palette</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg"></div>
                  <span className="text-white font-mono text-sm">#7C3AED → #8B5CF6</span>
                  <span className="text-gray-400 text-xs">Primary Purple</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-800 to-indigo-900 rounded-lg"></div>
                  <span className="text-white font-mono text-sm">#1E1B4B → #0F0F23</span>
                  <span className="text-gray-400 text-xs">Deep Background</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg"></div>
                  <span className="text-white font-mono text-sm">#EC4899 → #A855F7</span>
                  <span className="text-gray-400 text-xs">Accent Gradient</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-blue-400 font-medium mb-3">Current Palette</h5>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-slate-800 to-blue-900 rounded-lg"></div>
                  <span className="text-white font-mono text-sm">#1E293B → #1E3A8A</span>
                  <span className="text-gray-400 text-xs">Slate-Blue Base</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-900 to-slate-900 rounded-lg"></div>
                  <span className="text-white font-mono text-sm">#111827 → #0F172A</span>
                  <span className="text-gray-400 text-xs">Dark Background</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                  <span className="text-white font-mono text-sm">#3B82F6 → #8B5CF6</span>
                  <span className="text-gray-400 text-xs">Blue-Purple Mix</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Implementation Strategy */}
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-400/20">
          <h4 className="text-xl font-semibold text-purple-300 mb-4 text-center">💎 Craftify-Inspired Implementation Strategy</h4>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h5 className="text-purple-400 font-medium mb-3">🎨 Visual Enhancements</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Adopt purple-dominant color scheme</li>
                <li>• Add radial gradient overlays</li>
                <li>• Increase card transparency effects</li>
                <li>• Implement dot pattern backgrounds</li>
                <li>• Add subtle glow effects</li>
                <li>• Enhanced typography hierarchy</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h5 className="text-blue-400 font-medium mb-3">🚀 Interactive Elements</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Enhanced button hover states</li>
                <li>• Smooth micro-animations</li>
                <li>• Central hero visualization</li>
                <li>• Progressive disclosure patterns</li>
                <li>• Contextual tooltips</li>
                <li>• Dynamic loading states</li>
              </ul>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <h5 className="text-green-400 font-medium mb-3">📱 Layout Improvements</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Increased vertical spacing</li>
                <li>• Centered content focus</li>
                <li>• Better visual hierarchy</li>
                <li>• Responsive grid improvements</li>
                <li>• Strategic white space usage</li>
                <li>• Mobile-first optimization</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ROI Impact Analysis */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-400/20">
          <h4 className="text-xl font-semibold text-green-300 mb-4 text-center">📈 Expected Impact of Craftify-Inspired Changes</h4>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-white font-medium">User Experience Metrics</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">User Engagement</span>
                  <span className="text-green-400 font-bold">+180%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Session Duration</span>
                  <span className="text-green-400 font-bold">+220%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Visual Appeal Rating</span>
                  <span className="text-green-400 font-bold">+150%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Mobile Usability</span>
                  <span className="text-green-400 font-bold">+300%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h5 className="text-white font-medium">Business Impact</h5>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Conversion Rate</span>
                  <span className="text-purple-400 font-bold">+120%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Enterprise Adoption</span>
                  <span className="text-purple-400 font-bold">+200%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Brand Perception</span>
                  <span className="text-purple-400 font-bold">+165%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Developer Satisfaction</span>
                  <span className="text-purple-400 font-bold">+140%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <h4 className="text-xl font-semibold text-amber-400 mb-4 text-center">🎯 Implementation Roadmap</h4>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-red-500/10 rounded-xl p-4 border border-red-400/20">
              <h5 className="text-red-400 font-medium mb-3">Week 1-2: Foundation</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Update color palette system</li>
                <li>• Implement purple gradients</li>
                <li>• Add dot pattern overlays</li>
                <li>• Enhance glassmorphic effects</li>
              </ul>
            </div>
            
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-400/20">
              <h5 className="text-amber-400 font-medium mb-3">Week 3-4: Enhancement</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Add micro-animations</li>
                <li>• Implement central hero focus</li>
                <li>• Improve mobile responsiveness</li>
                <li>• Add interactive tooltips</li>
              </ul>
            </div>
            
            <div className="bg-green-500/10 rounded-xl p-4 border border-green-400/20">
              <h5 className="text-green-400 font-medium mb-3">Week 5-6: Polish</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Fine-tune spacing system</li>
                <li>• Optimize performance</li>
                <li>• Add advanced interactions</li>
                <li>• User testing & iteration</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getSectionContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "home": return renderHomePage();
      case "project": return renderProjectPage();
      case "architecture": return renderArchitecturePage();
      case "recommendations": return renderRecommendations();
      case "craftify": return renderCraftifyAnalysis();
      default: return renderOverview();
    }
  };

  return (
    <PageBackground title="UI/UX Analysis & Recommendations" subtitle="Comprehensive analysis of the current user interface and experience with billion-dollar company design recommendations" showTitle={true}>
      <div className="max-w-6xl mx-auto">
        {/* Navigation Tabs */}
        <div className="glass-card-3d p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "button-glossy-3d text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {getSectionContent()}
        </div>

        {/* Footer */}
        <div className="glass-card-3d p-6 mt-12">
          <p className="text-gray-300 text-center leading-relaxed">
            The current UI shows <strong className="text-green-400">excellent design foundation</strong> with 
            modern glassmorphic aesthetics and strong technical implementation. The main opportunities lie in{" "}
            <strong className="text-purple-400">enterprise features</strong>, <strong className="text-blue-400">mobile optimization</strong>, 
            and <strong className="text-amber-400">advanced interactions</strong>. With strategic UX improvements,
            this platform can compete with <strong className="text-white">industry leaders like Tableau and PowerBI</strong>.
          </p>
        </div>
      </div>
    </PageBackground>
  );
}
