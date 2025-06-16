"use client";
import React, { useState } from 'react';

interface ResponsivePanelProps {
  children: React.ReactNode;
  className?: string;
  mobileBreakpoint?: string;
}

export default function ResponsivePanel({
  children,
  className = '',
  mobileBreakpoint = 'sm'
}: ResponsivePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Get the correct breakpoint classes
  const getBreakpointClasses = () => {
    switch (mobileBreakpoint) {
      case 'sm': return 'sm:flex-row sm:items-start';
      case 'md': return 'md:flex-row md:items-start';
      case 'lg': return 'lg:flex-row lg:items-start';
      default: return 'sm:flex-row sm:items-start';
    }
  };
  
  return (
    <div className={`
      relative 
      ${className}
    `}>
      {/* Mobile expand/collapse button (only visible on small screens) */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          absolute -top-3 right-2 z-10
          sm:hidden p-1 rounded-full
          bg-white/10 text-white/80 hover:bg-white/20
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
        </svg>
      </button>
      
      {/* Content container with responsive behavior */}
      <div className={`
        flex flex-col space-y-4
        ${getBreakpointClasses()}
        transition-all duration-300
        ${isExpanded ? 'max-h-[2000px]' : 'max-h-40 sm:max-h-full overflow-hidden sm:overflow-visible'}
      `}>
        {children}
      </div>
      
      {/* Fade overlay for collapsed state on mobile */}
      {!isExpanded && (
        <div className={`
          absolute bottom-0 left-0 right-0 h-20
          bg-gradient-to-t from-gray-900 to-transparent
          sm:hidden
          pointer-events-none
        `}></div>
      )}
    </div>
  );
}
