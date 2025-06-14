"use client";
import React, { useState, useEffect } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  visible: boolean;
}

interface NavBarProps {
  brandName?: string;
  brandIcon?: string;
  onToggleComponent?: (componentId: string, isVisible: boolean) => void;
  visibleComponents?: Record<string, boolean>;
}

const NavBar: React.FC<NavBarProps> = ({ 
  brandName = "Enterprise Insights",
  brandIcon = "🤖",
  onToggleComponent,
  visibleComponents = {}
}) => {
  // Initial navigation items with visibility state - actual app components
  const [navItems, setNavItems] = useState<NavItem[]>([
    { id: 'agent-status', label: 'Agent Status', icon: '🤖', visible: true },
    { id: 'live-flow', label: 'Live Flow', icon: '📊', visible: true },
    { id: 'data-quality', label: 'Data Quality', icon: '🧹', visible: true },
    { id: 'smart-suggestions', label: 'Smart Suggestions', icon: '💡', visible: true },
    { id: 'data-export', label: 'Data Export', icon: '�', visible: false },
    { id: 'settings', label: 'Settings', icon: '⚙️', visible: false },
  ]);

  // Sync with parent state if visibleComponents prop is provided
  useEffect(() => {
    if (Object.keys(visibleComponents).length > 0) {
      setNavItems(items => 
        items.map(item => ({
          ...item,
          visible: visibleComponents[item.id] !== undefined 
            ? visibleComponents[item.id] 
            : item.visible
        }))
      );
    }
  }, [visibleComponents]);

  // State for settings dropdown
  const [showSettings, setShowSettings] = useState(false);
  // State for mobile menu
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Toggle menu item visibility
  const toggleItemVisibility = (itemId: string) => {
    // Get the current visibility state
    const currentItem = navItems.find(item => item.id === itemId);
    const newVisibility = !(currentItem?.visible);
    
    // Update local state
    setNavItems(items => 
      items.map(item => 
        item.id === itemId 
          ? { ...item, visible: newVisibility }
          : item
      )
    );
    
    // Notify parent component if callback exists
    if (onToggleComponent) {
      onToggleComponent(itemId, newVisibility);
    }
    
    // Auto-close settings after changing
    setShowSettings(false);
  };

  // Active navigation item (would be controlled by router in a real app)
  const [activeItem, setActiveItem] = useState('dashboard');

  return (    <div className="w-full">
      <div className="glass-card-3d border-b border-white/10 rounded-xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center px-4 py-3">
            {/* Brand logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500/40 to-blue-500/40 rounded-xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-sm">
                <span className="text-xl">{brandIcon}</span>
              </div>
              <span className="text-white font-bold text-lg bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
                {brandName}
              </span>
            </div>            {/* Primary navigation - Top level links */}
            <div className="flex items-center space-x-3">
              <a href="#" className="px-3 py-2 rounded-lg flex items-center space-x-2 transition-all bg-blue-500/30 text-white shadow-lg">
                <span>🏠</span>
                <span>Home</span>
              </a>
              <a href="#" className="px-3 py-2 rounded-lg flex items-center space-x-2 transition-all text-white/80 hover:bg-white/10 hover:text-white">
                <span>📋</span>
                <span>Project</span>
              </a>
              <a href="#" className="px-3 py-2 rounded-lg flex items-center space-x-2 transition-all text-white/80 hover:bg-white/10 hover:text-white">
                <span>🏗️</span>
                <span>Architecture</span>
              </a>
              <a href="#" className="px-3 py-2 rounded-lg flex items-center space-x-2 transition-all text-white/80 hover:bg-white/10 hover:text-white">
                <span>🎨</span>
                <span>UI/UX</span>
              </a>
              <a href="#" className="px-3 py-2 rounded-lg flex items-center space-x-2 transition-all text-white/80 hover:bg-white/10 hover:text-white">
                <span>📊</span>
                <span>Flowchart</span>
              </a>
              
              {/* Component visibility toggle button */}
              <div className="ml-4 flex items-center border-l border-white/10 pl-4">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center space-x-1 px-3 py-1 rounded-lg transition-all text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <span className="text-sm">Components</span>
                  <span className="text-base">⚙️</span>
                </button>
              </div>
              
              {/* Settings dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className={`ml-2 p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all ${
                    showSettings ? 'bg-white/15 text-white' : ''
                  }`}
                >
                  <span className="text-xl">⋮</span>
                </button>
                
                {/* Settings dropdown */}
                {showSettings && (
                  <div className="absolute right-0 mt-2 w-64 glass-card-3d rounded-xl shadow-2xl border border-white/10 py-2 z-10">
                    <div className="px-4 py-2 border-b border-white/10">
                      <h3 className="text-white font-semibold">Menu Settings</h3>
                      <p className="text-white/70 text-sm">Toggle menu items on/off</p>
                    </div>
                    <div className="px-2 py-2 max-h-60 overflow-y-auto">
                      {navItems.map(item => (
                        <div 
                          key={item.id}
                          className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <span>{item.icon}</span>
                            <span className="text-white">{item.label}</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={item.visible}
                              onChange={() => toggleItemVisibility(item.id)}
                              className="sr-only peer" 
                            />
                            <div className={`w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              >
                {mobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card-3d border-b border-white/10 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems
              .filter(item => item.visible)
              .map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveItem(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center space-x-3 ${
                    activeItem === item.id 
                      ? 'bg-white/15 text-white' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))
            }
            
            {/* Mobile menu settings */}
            <div className="border-t border-white/10 mt-2 pt-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-white/80 hover:bg-white/10 hover:text-white"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">⚙️</span>
                  <span>Menu Settings</span>
                </div>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 transition-transform ${showSettings ? 'rotate-180' : ''}`}
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showSettings && (
                <div className="px-2 py-2">
                  {navItems.map(item => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{item.icon}</span>
                        <span className="text-white">{item.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={item.visible}
                          onChange={() => toggleItemVisibility(item.id)}
                          className="sr-only peer" 
                        />
                        <div className={`w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
