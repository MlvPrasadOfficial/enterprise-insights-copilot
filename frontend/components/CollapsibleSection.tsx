"use client";
import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  icon?: string;
  defaultExpanded?: boolean;
  badge?: string | number;
  badgeColor?: string;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  icon,
  defaultExpanded = false,
  badge,
  badgeColor = 'bg-blue-500/30 text-blue-300',
  children
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="glass-card-3d overflow-hidden transition-all duration-300">
      {/* Section header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white/80">
              <span role="img" aria-label={title}>{icon}</span>
            </div>
          )}
          <h3 className="text-white font-medium">{title}</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Optional badge */}
          {badge !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full ${badgeColor}`}>
              {badge}
            </span>
          )}
          
          {/* Expand/collapse indicator */}
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Collapsible content */}
      <div 
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="p-3 border-t border-white/10 animate-fadeIn">
          {children}
        </div>
      </div>
    </div>
  );
}
