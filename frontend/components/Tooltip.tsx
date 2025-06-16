"use client";
import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactNode;
}

export default function Tooltip({ 
  content, 
  position = 'top',
  delay = 300,
  children 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const childRef = useRef<HTMLDivElement>(null);
  
  // Calculate position based on the trigger element
  const calculatePosition = () => {
    if (!childRef.current) return;
    
    const rect = childRef.current.getBoundingClientRect();
    
    switch (position) {
      case 'top':
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        });
        break;
      case 'bottom':
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 10
        });
        break;
      case 'left':
        setCoords({
          x: rect.left - 10,
          y: rect.top + rect.height / 2
        });
        break;
      case 'right':
        setCoords({
          x: rect.right + 10,
          y: rect.top + rect.height / 2
        });
        break;
    }
  };
  
  // Show the tooltip with delay
  const handleMouseEnter = () => {
    calculatePosition();
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };
  
  // Hide the tooltip and clear timeout
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Get tooltip positioning styles
  const getTooltipStyles = () => {
    const baseStyles = {
      opacity: isVisible ? 1 : 0,
      transition: 'all 0.2s ease-out',
      pointerEvents: isVisible ? 'auto' as const : 'none' as const,
      zIndex: 50
    };
    
    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          position: 'fixed' as const,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: `translate(-50%, -100%)`
        };
      case 'bottom':
        return {
          ...baseStyles,
          position: 'fixed' as const,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: `translate(-50%, 0)`
        };
      case 'left':
        return {
          ...baseStyles,
          position: 'fixed' as const,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: `translate(-100%, -50%)`
        };
      case 'right':
        return {
          ...baseStyles,
          position: 'fixed' as const,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: `translate(0, -50%)`
        };
    }
  };
  
  return (
    <div className="relative">
      {/* Tooltip trigger element */}
      <div 
        ref={childRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
      
      {/* Tooltip content */}
      <div
        className="bg-gray-900/95 backdrop-blur-sm text-white rounded-md p-2 shadow-lg border border-white/10 max-w-xs"
        style={getTooltipStyles()}
      >
        {/* Arrow */}
        <div className={`tooltip-arrow absolute w-2 h-2 bg-gray-900 transform rotate-45 border ${
          position === 'top' ? 'bottom-[-5px] left-1/2 translate-x-[-50%] border-t-0 border-l-0' :
          position === 'bottom' ? 'top-[-5px] left-1/2 translate-x-[-50%] border-b-0 border-r-0' :
          position === 'left' ? 'right-[-5px] top-1/2 translate-y-[-50%] border-l-0 border-b-0' :
          'left-[-5px] top-1/2 translate-y-[-50%] border-r-0 border-t-0'
        } border-white/10`}></div>
        
        {/* Content */}
        <div>
          {content}
        </div>
      </div>
    </div>
  );
}
