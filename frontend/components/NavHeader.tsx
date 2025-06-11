"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavHeader() {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Debug Tools', path: '/debug' },
    { name: 'Test Cases', path: '/test-cases' },
    { name: 'Test Visualizer', path: '/test-visualizer' }
  ];
    return (
    <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors duration-200">
                  Enterprise Insights
                </h1>
                <p className="text-xs text-white/60">AI-Powered Analytics</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex ml-8">
              <ul className="flex space-x-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <li key={item.name}>
                      <Link 
                        href={item.path}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive 
                            ? 'bg-white/10 text-white backdrop-blur-sm border border-white/20' 
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
          
          {/* Right side - Version badge and mobile menu */}
          <div className="flex items-center space-x-4">
            {/* Version Badge */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-500/20 backdrop-blur-sm text-blue-200 rounded-xl text-xs font-medium border border-blue-400/30">
                v2.0
              </span>
            </div>
            
            {/* User Avatar / Profile (placeholder) */}
            <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-white/70" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            
            {/* Mobile menu button */}
            <button 
              type="button" 
              className="md:hidden p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile menu (hidden by default - you can add state management for toggle) */}
        <div className="md:hidden hidden">
          <div className="pt-4 pb-2 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-white/10 text-white backdrop-blur-sm border border-white/20' 
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}          </div>
        </div>
      </div>
    </header>  );
}

export default NavHeader;
