"use client";
import React from 'react';

interface ProcessStage {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  icon: string;
}

interface ProcessTimelineProps {
  stages: ProcessStage[];
  currentStage: string;
}

export default function ProcessTimeline({ stages, currentStage }: ProcessTimelineProps) {
  // Check if a stage is active (current or completed)
  const isStageActive = (stage: ProcessStage) => {
    return stage.status === 'complete' || stage.id === currentStage;
  };
  
  // Get the highest completed stage index
  const getHighestCompletedIndex = () => {
    const completedStages = stages.filter(stage => stage.status === 'complete');
    return completedStages.length > 0 
      ? stages.findIndex(stage => stage.id === completedStages[completedStages.length - 1].id)
      : -1;
  };
  
  const highestCompletedIndex = getHighestCompletedIndex();
  const currentStageIndex = stages.findIndex(stage => stage.id === currentStage);

  return (
    <div className="glass-card-3d p-4">
      {/* Header */}
      <h3 className="text-white font-medium mb-4">Analysis Process</h3>
      
      {/* Timeline */}
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10"></div>
        
        {/* Stages */}
        <div className="space-y-6">
          {stages.map((stage, index) => {
            // Determine status styling
            const isActive = isStageActive(stage);
            const isCurrent = stage.id === currentStage;
            
            // Calculate progress percentage for the line connecting to the next stage
            const progressPercent = index < highestCompletedIndex 
              ? 100 // Completed stage
              : index === currentStageIndex 
                ? 50 // Current stage
                : 0; // Future stage
                
            return (
              <div key={stage.id} className="relative">
                {/* Stage dot */}
                <div className="flex items-start">
                  <div className={`
                    relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                    ${isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-400'}
                    ${isCurrent ? 'ring-2 ring-blue-300 animate-pulseGlow' : ''}
                  `}>
                    <span role="img" aria-label={stage.name}>{stage.icon}</span>
                  </div>
                  
                  {/* Stage content */}
                  <div className={`ml-4 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                    <h4 className={`font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>
                      {stage.name}
                    </h4>
                    <p className="text-sm text-white/70">
                      {stage.description}
                    </p>
                    
                    {/* Status indicator */}
                    <div className="mt-1 flex items-center">
                      <div className={`h-1.5 w-1.5 rounded-full mr-2 
                        ${stage.status === 'complete' ? 'bg-green-400' : 
                          stage.status === 'in-progress' ? 'bg-blue-400 animate-pulse' : 
                          stage.status === 'error' ? 'bg-red-400' : 
                          'bg-gray-600'}
                      `}></div>
                      <span className="text-xs text-white/50">
                        {stage.status === 'complete' ? 'Completed' : 
                         stage.status === 'in-progress' ? 'In Progress' :
                         stage.status === 'error' ? 'Error' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Connecting line to next stage (if not last) */}
                {index < stages.length - 1 && (
                  <div className="absolute left-4 ml-[15px] top-8 bottom-0 w-0.5 h-6">
                    <div className="h-full bg-gray-700"></div>
                    <div 
                      className="absolute top-0 left-0 bg-blue-500 w-full transition-all duration-500 ease-out"
                      style={{ height: `${progressPercent}%` }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
