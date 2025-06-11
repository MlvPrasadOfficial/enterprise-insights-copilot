"use client";
import { useState } from "react";
import Link from "next/link";
import PageBackground from "../../components/PageBackground";

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
          
          <div className="glass-card-3d p-6">
            <h4 className="text-xl font-semibold text-orange-400 mb-4 flex items-center space-x-2">
              <span>⚠️</span>
              <span>Areas for Improvement</span>
            </h4>
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
    </div>
  );

  const getSectionContent = () => {
    switch (activeTab) {
      case "overview": return renderOverview();
      case "home": return <div className="glass-card-3d p-8 text-center text-gray-300">Home Page Analysis - Coming Soon</div>;
      case "project": return <div className="glass-card-3d p-8 text-center text-gray-300">Project Page Analysis - Coming Soon</div>;
      case "architecture": return <div className="glass-card-3d p-8 text-center text-gray-300">Architecture Page Analysis - Coming Soon</div>;
      case "recommendations": return <div className="glass-card-3d p-8 text-center text-gray-300">Billion-Dollar Recommendations - Coming Soon</div>;
      case "craftify": return <div className="glass-card-3d p-8 text-center text-gray-300">Craftify Analysis - Coming Soon</div>;
      default: return renderOverview();
    }
  };

  return (
    <PageBackground 
      title="UI/UX Analysis & Recommendations" 
      subtitle="Comprehensive analysis of the current user interface and experience with billion-dollar company design recommendations"
      showTitle={true}
    >
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
