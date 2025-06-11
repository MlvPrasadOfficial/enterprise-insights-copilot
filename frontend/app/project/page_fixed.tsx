"use client";
import { useState } from "react";
import PageBackground from "../../components/PageBackground";

export default function ProjectPage() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", title: "📊 What I Understood", icon: "📊" },
    { id: "pros", title: "✅ Pros List", icon: "✅" },
    { id: "cons", title: "❌ Cons List", icon: "❌" },
    { id: "improvements", title: "🚀 Improvement Plan", icon: "🚀" },
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="glass-card-3d p-8">
        <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-3">
          <span>🏗️</span>
          <span>Architecture Overview - Complete Analysis</span>
        </h3>
        <p className="text-gray-200 mb-6 text-lg leading-relaxed">
          The application is a <strong className="text-blue-300">full-stack conversational BI platform</strong> with enterprise-grade multi-agent architecture featuring 15+ specialized agents, LangGraph orchestration, and production-ready infrastructure.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-white font-semibold mb-4">🎯 Core Features</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• CSV file upload and intelligent processing</li>
              <li>• Natural language query interface</li>
              <li>• Multi-agent orchestration with LangGraph</li>
              <li>• Real-time chart generation and insights</li>
              <li>• Interactive glassmorphic UI design</li>
            </ul>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-white font-semibold mb-4">⚙️ Technical Stack</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Frontend: Next.js 15, React 19, TypeScript</li>
              <li>• Backend: FastAPI, Python 3.12</li>
              <li>• AI: LangGraph, OpenAI GPT-4, Pinecone</li>
              <li>• UI: Tailwind CSS, Glassmorphism</li>
              <li>• Data: Pandas, SQL, Vector embeddings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPros = () => (
    <div className="space-y-6">
      <div className="bg-green-500/10 backdrop-blur-md rounded-2xl p-6 border border-green-500/20">
        <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center space-x-2">
          <span>🏆</span>
          <span>Excellent Architecture</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "Modular Agent Design - Clean separation of concerns",
            "Modern Tech Stack - Next.js 15, React 19, FastAPI",
            "Real-time UI - Glassmorphic design with live updates",
            "Comprehensive RAG - Vector store integration",
            "Session Management - Multi-user support",
            "Error Resilience - Fallback mechanisms",
            "Type Safety - Full TypeScript implementation",
            "State Management - LangGraph workflows"
          ].map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
              <span className="text-green-400 text-sm mt-1">✓</span>
              <span className="text-gray-300 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCons = () => (
    <div className="space-y-6">
      <div className="bg-red-500/10 backdrop-blur-md rounded-2xl p-6 border border-red-500/20">
        <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center space-x-2">
          <span>⚠️</span>
          <span>Areas for Improvement</span>
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            "Production Deployment - Limited deployment configuration",
            "Error Handling - Some edge cases not covered",
            "Testing Coverage - Unit tests need expansion",
            "Documentation - API docs could be more detailed",
            "Performance - Some optimization opportunities",
            "Security - Additional authentication features needed",
            "Monitoring - Production monitoring setup required",
            "Scalability - Horizontal scaling considerations"
          ].map((item, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-red-500/5 rounded-lg border border-red-500/10">
              <span className="text-red-400 text-sm mt-1">!</span>
              <span className="text-gray-300 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderImprovements = () => (
    <div className="space-y-6">
      <div className="bg-purple-500/10 backdrop-blur-md rounded-2xl p-6 border border-purple-500/20">
        <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center space-x-2">
          <span>🚀</span>
          <span>Strategic Improvement Plan</span>
        </h3>
        
        <div className="space-y-6">
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-white font-semibold mb-4">🎯 Phase 1: Production Readiness (2-3 weeks)</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Add comprehensive error handling and logging</li>
              <li>• Implement proper authentication and authorization</li>
              <li>• Set up production deployment with Docker</li>
              <li>• Add monitoring and health checks</li>
              <li>• Expand test coverage to 80%+</li>
            </ul>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-white font-semibold mb-4">⚡ Phase 2: Performance & Scale (3-4 weeks)</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Implement caching for common queries</li>
              <li>• Add database connection pooling</li>
              <li>• Optimize agent orchestration workflows</li>
              <li>• Add horizontal scaling capabilities</li>
              <li>• Implement rate limiting and API versioning</li>
            </ul>
          </div>
          
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h4 className="text-white font-semibold mb-4">🌟 Phase 3: Advanced Features (4-6 weeks)</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li>• Add support for multiple data formats (Excel, JSON)</li>
              <li>• Implement advanced analytics and ML insights</li>
              <li>• Add collaborative features and sharing</li>
              <li>• Create mobile-responsive design</li>
              <li>• Build enterprise SSO integration</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <PageBackground>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent mb-6">
            🚀 Project Analysis
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Comprehensive evaluation of the Enterprise Insights Copilot platform architecture, features, and optimization opportunities
          </p>
        </div>

        {/* Section Navigation */}
        <div className="glass-card-3d p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${
                  activeSection === section.id
                    ? "button-glossy-3d text-white"
                    : "text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Content */}
        <div className="space-y-8">
          {activeSection === "overview" && renderOverview()}
          {activeSection === "pros" && renderPros()}
          {activeSection === "cons" && renderCons()}
          {activeSection === "improvements" && renderImprovements()}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <p className="text-gray-400 text-sm">
            The codebase shows <strong className="text-green-400">excellent architectural foundation</strong> with 
            modern technologies and sophisticated agent orchestration. The main areas for improvement are{" "}
            <strong className="text-yellow-400">production readiness</strong>, <strong className="text-blue-400">scalability</strong>, 
            and <strong className="text-purple-400">code organization</strong>. With focused development,
            this can become an <strong className="text-white">enterprise-grade conversational BI platform</strong>.
          </p>
        </div>
      </div>
    </PageBackground>
  );
}
