"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function MainNavigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showComponentsMenu, setShowComponentsMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect for the navbar
  if (typeof window !== 'undefined') {
    // Add scroll event listener
    window.addEventListener('scroll', () => {
      setScrolled(window.scrollY > 10);
    });
  }
  
  // Always visible core nav items
  const coreNavItems = [
    { href: "/", label: "Home", icon: "🏠" }
  ];
  
  // Toggleable nav items
  const [navItemsVisibility, setNavItemsVisibility] = useState({
    'project': true,
    'architecture': true,
    'ui-ux': true,
    'flowchart': true,
    'dashboard': true,
  });

  // Nav items that can be toggled on/off
  const toggleableNavItems = [
    { id: "project", href: "/project", label: "Project", icon: "📋" },
    { id: "architecture", href: "/architecture", label: "Architecture", icon: "🏗️" },
    { id: "ui-ux", href: "/ux", label: "UI/UX", icon: "🎨" },
    { id: "flowchart", href: "/flowchart", label: "Flowchart", icon: "📊" },
    { id: "dashboard", href: "/dashboard", label: "Dashboard", icon: "📊" },
  ];
  
  // Get the visible nav items
  const visibleNavItems = [
    ...coreNavItems,
    ...toggleableNavItems.filter(item => navItemsVisibility[item.id as keyof typeof navItemsVisibility])
  ];
  
  // Toggle a nav item's visibility
  const toggleNavItemVisibility = (itemId: string) => {
    setNavItemsVisibility(prev => ({
      ...prev,
      [itemId]: !prev[itemId as keyof typeof navItemsVisibility]
    }));
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };
  
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg bg-opacity-90' : ''}`} style={{ 
      zIndex: 9999,
      pointerEvents: 'auto',
      position: 'sticky'
    }}>
      <div className={`nav-3d-glass ${scrolled ? 'backdrop-blur-md' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EI</span>
                </div>
                <span className="text-white font-semibold text-lg">Enterprise Insights</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {visibleNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive(item.href)
                        ? "bg-blue-600/80 text-white shadow-lg border border-blue-500/50"
                        : "text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
                    }`}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
                
                {/* Component Pages Toggle Button */}
                <button 
                  onClick={() => setShowComponentsMenu(!showComponentsMenu)}
                  className={`ml-4 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-300 flex items-center gap-2 ${
                    showComponentsMenu 
                      ? "border-purple-500/50 bg-purple-600/30 text-white" 
                      : "border-purple-500/30 bg-purple-600/20 text-white hover:bg-purple-600/40"
                  }`}
                >
                  <span>Components</span>
                  <span>⚙️</span>
                  {Object.values(navItemsVisibility).some(state => !state) && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  )}
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-black/80">
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? "bg-blue-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span>{item.icon}</span> {item.label}
                </Link>
              ))}
              <button
                onClick={() => setShowComponentsMenu(!showComponentsMenu)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                <div className="flex items-center gap-2">
                  <span>Components</span>
                  <span>⚙️</span>
                  {Object.values(navItemsVisibility).some(state => !state) && (
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{Object.values(navItemsVisibility).filter(v => v).length}/{Object.values(navItemsVisibility).length}</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Components Selection Panel */}
        {showComponentsMenu && (
          <div className="absolute right-4 top-16 z-50 w-64 bg-white/10 backdrop-blur-xl rounded-lg shadow-xl border border-white/20">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center justify-between">
                <span>Toggle Navigation Items</span>
                <button 
                  onClick={() => setShowComponentsMenu(false)}
                  className="text-white/70 hover:text-white"
                >
                  ✕
                </button>
              </h3>
              <div className="space-y-2 mt-3">
                {toggleableNavItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.icon}</span>
                      <span className="text-white font-medium">{item.label}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={navItemsVisibility[item.id as keyof typeof navItemsVisibility]}
                        onChange={() => toggleNavItemVisibility(item.id)}
                      />
                      <div className="w-11 h-6 bg-gray-700/50 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600/70"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
