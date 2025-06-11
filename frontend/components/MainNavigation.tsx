"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function MainNavigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navItems = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/project", label: "Project", icon: "📊" },
    { href: "/architecture", label: "Architecture", icon: "🏗️" },
    { href: "/ux", label: "UI/UX", icon: "🎨" },
    { href: "/flowchart", label: "Flowchart", icon: "🔄" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };  return (
    <nav className="fixed top-0 left-0 right-0 z-[99999] pointer-events-auto" style={{ 
      zIndex: 99999,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      pointerEvents: 'auto'
    }}>
      <div className="nav-3d-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
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
            <div className="ml-10 flex items-baseline space-x-4">              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}                  onClick={(e) => {
                    console.log('Navigation click:', item.href);
                  }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer pointer-events-auto ${
                    isActive(item.href)
                      ? "bg-blue-600/80 text-white shadow-lg border border-blue-500/50"
                      : "text-gray-300 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
                  }`}
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 999999,
                    position: 'relative'
                  }}                >
                  <span>{item.label}</span>
                </Link>
              ))}
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
            </button>          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden glass-card-3d mt-2 mb-4">
            <div className="px-2 pt-2 pb-3 space-y-1">              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}                  onClick={(e) => {
                    console.log('Mobile navigation click:', item.href);
                    setIsMenuOpen(false);
                  }}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer pointer-events-auto ${
                    isActive(item.href)
                      ? "bg-blue-600/80 text-white shadow-lg"
                      : "text-gray-300 hover:text-white hover:bg-white/10"
                  }`}
                  style={{
                    pointerEvents: 'auto',
                    zIndex: 999999,
                    position: 'relative'
                  }}
                >
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>        )}
        </div>
      </div>
    </nav>
  );
}
