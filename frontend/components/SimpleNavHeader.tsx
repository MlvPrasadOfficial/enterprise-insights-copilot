"use client";
import React from 'react';
import Link from 'next/link';

export default function SimpleNavHeader() {
  // No need for pathname since we're not using it
  
  return (
    <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-500 rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Enterprise Insights</h1>
                <p className="text-xs text-white/60">AI-Powered Analytics</p>
              </div>
            </Link>
          </div>
          
          {/* Version Badge */}
          <div className="flex items-center">
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600/20 to-purple-500/20 backdrop-blur-sm text-blue-200 rounded-xl text-xs font-medium border border-blue-400/30">
              v2.0
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
