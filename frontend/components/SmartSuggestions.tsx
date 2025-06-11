"use client";
import React, { useMemo, useState } from 'react';

interface QuerySuggestion {
  id: string;
  category: string;
  icon: string;
  question: string;
  description: string;
  relevance: number;
}

interface SmartSuggestionsProps {
  data: any[];
  columns: string[];
  onSuggestionClick: (question: string) => void;
  disabled?: boolean;
}

export default function SmartSuggestions({ data, columns, onSuggestionClick, disabled = false }: SmartSuggestionsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const suggestions = useMemo((): QuerySuggestion[] => {
    if (!data || data.length === 0 || !columns || columns.length === 0) {
      return [];
    }

    const suggestions: QuerySuggestion[] = [];
    
    // Analyze available columns to generate relevant suggestions
    const hasAge = columns.some(col => col.toLowerCase().includes('age'));
    const hasDepartment = columns.some(col => col.toLowerCase().includes('department') || col.toLowerCase().includes('dept'));
    const hasSalary = columns.some(col => col.toLowerCase().includes('salary') || col.toLowerCase().includes('compensation') || col.toLowerCase().includes('pay'));
    const hasPerformance = columns.some(col => col.toLowerCase().includes('perf') || col.toLowerCase().includes('rating') || col.toLowerCase().includes('score'));
    const hasDate = columns.some(col => col.toLowerCase().includes('date') || col.toLowerCase().includes('time'));
    const hasLocation = columns.some(col => col.toLowerCase().includes('city') || col.toLowerCase().includes('location') || col.toLowerCase().includes('office'));
    const hasExperience = columns.some(col => col.toLowerCase().includes('experience') || col.toLowerCase().includes('years'));

    // General Overview Questions
    suggestions.push({
      id: 'overview-1',
      category: 'overview',
      icon: '📊',
      question: 'What is the overall summary of this dataset?',
      description: 'Get a comprehensive overview of your data',
      relevance: 100
    });

    suggestions.push({
      id: 'overview-2',
      category: 'overview',
      icon: '🔍',
      question: 'What are the key insights from this data?',
      description: 'Discover important patterns and trends',
      relevance: 95
    });

    // Age-related suggestions
    if (hasAge) {
      suggestions.push({
        id: 'demo-1',
        category: 'demographics',
        icon: '👥',
        question: 'What is the age distribution of employees?',
        description: 'Analyze workforce age demographics',
        relevance: 90
      });

      suggestions.push({
        id: 'demo-2',
        category: 'demographics',
        icon: '📈',
        question: 'Who are the youngest and oldest employees?',
        description: 'Find age extremes in your workforce',
        relevance: 85
      });
    }

    // Department-related suggestions
    if (hasDepartment) {
      suggestions.push({
        id: 'org-1',
        category: 'organization',
        icon: '🏢',
        question: 'How many employees are in each department?',
        description: 'See department size distribution',
        relevance: 90
      });

      suggestions.push({
        id: 'org-2',
        category: 'organization',
        icon: '⚖️',
        question: 'Which department has the most employees?',
        description: 'Identify the largest department',
        relevance: 85
      });
    }

    // Performance-related suggestions
    if (hasPerformance) {
      suggestions.push({
        id: 'perf-1',
        category: 'performance',
        icon: '⭐',
        question: 'What is the average performance score?',
        description: 'Get overall performance metrics',
        relevance: 88
      });

      suggestions.push({
        id: 'perf-2',
        category: 'performance',
        icon: '🏆',
        question: 'Who are the top performers?',
        description: 'Identify highest performing employees',
        relevance: 86
      });
    }

    // Salary-related suggestions
    if (hasSalary) {
      suggestions.push({
        id: 'comp-1',
        category: 'compensation',
        icon: '💰',
        question: 'What is the salary distribution?',
        description: 'Analyze compensation patterns',
        relevance: 87
      });

      suggestions.push({
        id: 'comp-2',
        category: 'compensation',
        icon: '📊',
        question: 'What is the average salary by department?',
        description: 'Compare departmental compensation',
        relevance: 85
      });
    }

    // Date/Time-related suggestions
    if (hasDate) {
      suggestions.push({
        id: 'time-1',
        category: 'temporal',
        icon: '📅',
        question: 'What are the hiring trends over time?',
        description: 'Analyze recruitment patterns',
        relevance: 82
      });

      suggestions.push({
        id: 'time-2',
        category: 'temporal',
        icon: '⏰',
        question: 'Who are the newest and oldest employees by tenure?',
        description: 'Find tenure extremes',
        relevance: 80
      });
    }

    // Location-related suggestions
    if (hasLocation) {
      suggestions.push({
        id: 'geo-1',
        category: 'geographic',
        icon: '🌍',
        question: 'How are employees distributed by location?',
        description: 'See geographic distribution',
        relevance: 83
      });
    }

    // Experience-related suggestions
    if (hasExperience) {
      suggestions.push({
        id: 'exp-1',
        category: 'experience',
        icon: '🎯',
        question: 'What is the experience level distribution?',
        description: 'Analyze workforce experience',
        relevance: 84
      });
    }

    // Cross-category correlation suggestions
    if (hasAge && hasDepartment) {
      suggestions.push({
        id: 'corr-1',
        category: 'correlations',
        icon: '🔗',
        question: 'How does age vary by department?',
        description: 'Find age patterns across departments',
        relevance: 88
      });
    }

    if (hasPerformance && hasDepartment) {
      suggestions.push({
        id: 'corr-2',
        category: 'correlations',
        icon: '📊',
        question: 'Which departments have the best performance?',
        description: 'Compare performance by department',
        relevance: 89
      });
    }

    if (hasSalary && hasPerformance) {
      suggestions.push({
        id: 'corr-3',
        category: 'correlations',
        icon: '💼',
        question: 'Is there a correlation between salary and performance?',
        description: 'Analyze pay-performance relationship',
        relevance: 91
      });
    }

    // Sort by relevance
    return suggestions.sort((a, b) => b.relevance - a.relevance);
  }, [data, columns]);

  const categories = useMemo(() => {
    const cats = ['all', ...new Set(suggestions.map(s => s.category))];
    return cats.map(cat => ({
      id: cat,
      label: cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1),
      count: cat === 'all' ? suggestions.length : suggestions.filter(s => s.category === cat).length
    }));
  }, [suggestions]);

  const filteredSuggestions = useMemo(() => {
    if (selectedCategory === 'all') return suggestions;
    return suggestions.filter(s => s.category === selectedCategory);
  }, [suggestions, selectedCategory]);
  if (suggestions.length === 0) {
    return (
      <div className="glass-card-3d rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        <div className="text-center text-gray-300 py-6 relative z-10">
          <div className="w-16 h-16 glass-card-3d rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl">
            💡
          </div>
          <p className="text-sm font-medium">Upload data to see smart suggestions</p>
        </div>
      </div>
    );
  }
  return (
    <div className="glass-card-3d rounded-3xl p-8 space-y-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
      
      {/* Enhanced Header */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/60 to-violet-500/60 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
          <span className="text-xl relative z-10">💡</span>
        </div>
        <div>
          <h3 className="text-white font-bold text-xl">Smart Suggestions</h3>
          <p className="text-purple-200 text-sm">AI-powered query recommendations</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/40 to-violet-500/40 rounded-2xl flex items-center justify-center shadow-lg">
            💡
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Smart Suggestions</h3>
            <p className="text-purple-200 text-sm">AI-powered query recommendations</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-purple-500/20 rounded-xl border border-purple-400/30">
          <span className="text-purple-300 text-sm font-medium">{filteredSuggestions.length} suggestions</span>
        </div>
      </div>      
      {/* Enhanced Category Filter */}
      <div className="flex flex-wrap gap-3 relative z-10">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`button-glossy-3d px-6 py-3 rounded-2xl text-sm font-medium transition-all duration-400 ${
              selectedCategory === category.id
                ? 'shadow-2xl shadow-purple-500/40 scale-105'
                : 'bg-white/10 text-purple-200 hover:bg-white/20 hover:text-white border border-white/20 hover:border-purple-400/40 hover:scale-105'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>      

      {/* Enhanced Suggestions List */}
      <div className="space-y-4 max-h-80 overflow-y-auto custom-scrollbar relative z-10">
        {filteredSuggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => !disabled && onSuggestionClick(suggestion.question)}
            disabled={disabled}
            className={`w-full text-left glass-card-3d p-6 rounded-2xl transition-all duration-400 relative overflow-hidden ${
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20'
            }`}
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/40 to-violet-500/40 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-white/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
                <span className="relative z-10">{suggestion.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-base mb-2 leading-tight text-white">
                  {suggestion.question}
                </div>
                <div className="text-sm text-purple-200 leading-relaxed">
                  {suggestion.description}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className={`w-4 h-4 rounded-full shadow-lg ${
                  suggestion.relevance >= 90 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                  suggestion.relevance >= 80 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'
                }`}></div>
                <span className="text-sm text-purple-300 font-mono bg-purple-500/20 px-2 py-1 rounded-lg">
                  {suggestion.relevance}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredSuggestions.length === 0 && selectedCategory !== 'all' && (
        <div className="text-center text-gray-300 py-6 relative z-10">
          <div className="w-12 h-12 glass-card-3d rounded-2xl mx-auto mb-4 flex items-center justify-center text-2xl">
            🔍
          </div>
          <p className="text-sm font-medium">No suggestions for this category</p>
        </div>
      )}
    </div>
  );
}
