"use client";
import React, { useMemo, useState } from 'react';

interface QuerySuggestion {
  id: string;
  category: 'overview' | 'sql' | 'chart' | 'insight' | 'demographic' | 'temporal';
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

export default function EnhancedSmartSuggestions({ 
  data, 
  columns, 
  onSuggestionClick, 
  disabled = false 
}: SmartSuggestionsProps) {
  // Single tab management for all categories
  const [selectedTab, setSelectedTab] = useState<string>('all');
  
  // Generate smart suggestions based on column analysis
  const suggestions = useMemo((): QuerySuggestion[] => {
    if (!data || data.length === 0 || !columns || columns.length === 0) {
      return [];
    }

    const suggestions: QuerySuggestion[] = [];
    
    // Analyze column types to create better suggestions
    const columnTypes = analyzeColumns(columns, data);
    
    // Generate suggestions for each category based on actual column data
    suggestions.push(...generateOverviewSuggestions(columns));
    suggestions.push(...generateSQLSuggestions(columns, columnTypes));
    suggestions.push(...generateChartSuggestions(columns, columnTypes));
    suggestions.push(...generateInsightSuggestions(columns, columnTypes));
    
    return suggestions;
  }, [data, columns]);
    // Filter suggestions based on selected category
  
  // Filter suggestions based on selected tab
  const filteredSuggestions = useMemo(() => {
    if (selectedTab === 'all') {
      return suggestions;
    }
    return suggestions.filter(s => s.category === selectedTab);
  }, [suggestions, selectedTab]);
  
  // Count suggestions by category for the tabs
  const categoryCounts = useMemo(() => {
    const counts = {
      all: suggestions.length,
      overview: suggestions.filter(s => s.category === 'overview').length,
      sql: suggestions.filter(s => s.category === 'sql').length,
      chart: suggestions.filter(s => s.category === 'chart').length,
      insight: suggestions.filter(s => s.category === 'insight').length,
      demographic: suggestions.filter(s => s.category === 'demographic').length,
      temporal: suggestions.filter(s => s.category === 'temporal').length
    };
    return counts;
  }, [suggestions]);
  return (
    <div className="glass-card-3d p-6 space-y-4 relative backdrop-blur-sm bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 shadow-lg transition-all duration-300 hover:shadow-amber-500/10 animate-glassMorphism">
      {/* Glassmorphism highlights */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-80 rounded-lg pointer-events-none"></div>
      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"></div>
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>
      <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-amber-500/40 to-transparent"></div>
      <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-amber-500/40 to-transparent"></div>
      
      {/* Single header - remove duplication */}
      <div className="flex items-center space-x-3 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400/30 to-yellow-600/30 flex items-center justify-center border border-amber-400/30 shadow-inner animate-pulse-subtle">
          <span role="img" aria-label="Smart Suggestions" className="text-xl">💡</span>
        </div>
        <div>
          <h3 className="text-white font-medium">Smart Suggestions</h3>
          <p className="text-white/70 text-sm">AI-powered query recommendations</p>
        </div>
        <div className="ml-auto glass-pill px-2 py-1 bg-amber-500/20 border border-amber-500/30 animate-glow">
          <span className="text-amber-300 text-xs">{suggestions.length} suggestions</span>
        </div>
      </div>

      {/* Enhanced Category Tabs with more descriptive icons */}
      <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
        <button
          onClick={() => setSelectedTab('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center whitespace-nowrap ${
            selectedTab === 'all' 
              ? 'bg-gradient-to-r from-amber-600 to-orange-500 text-white' 
              : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          <span className="mr-1">🔍</span> All ({categoryCounts.all})
        </button>
        
        {categoryCounts.overview > 0 && (
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center whitespace-nowrap ${
              selectedTab === 'overview' 
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span className="mr-1">📊</span> Overview ({categoryCounts.overview})
          </button>
        )}
        
        {categoryCounts.chart > 0 && (
          <button
            onClick={() => setSelectedTab('chart')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center whitespace-nowrap ${
              selectedTab === 'chart' 
                ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span className="mr-1">📈</span> Charts ({categoryCounts.chart})
          </button>
        )}
        
        {categoryCounts.sql > 0 && (
          <button
            onClick={() => setSelectedTab('sql')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center whitespace-nowrap ${
              selectedTab === 'sql' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span className="mr-1">🗃️</span> SQL ({categoryCounts.sql})
          </button>
        )}
        
        {categoryCounts.insight > 0 && (
          <button
            onClick={() => setSelectedTab('insight')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center whitespace-nowrap ${
              selectedTab === 'insight' 
                ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white' 
                : 'bg-white/10 text-white/70 hover:bg-white/15'
            }`}
          >
            <span className="mr-1">💡</span> Insights ({categoryCounts.insight})
          </button>
        )}
      </div>      {/* Horizontal compact suggestions with scrolling */}
      <div className="overflow-x-auto hide-scrollbar pb-2">
        <div className="flex space-x-3 min-w-max">
          {filteredSuggestions.map((suggestion) => (
            <CompactSuggestionCard 
              key={suggestion.id} 
              suggestion={suggestion} 
              onClick={() => onSuggestionClick(suggestion.question)} 
              disabled={disabled}
            />
          ))}
        </div>
        
        {filteredSuggestions.length === 0 && (
          <div className="text-center py-4 w-full">
            <div className="mx-auto w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center mb-2">
              <span className="text-lg">🔍</span>
            </div>
            <h4 className="text-white/80 font-medium text-sm">No suggestions available</h4>
            <p className="text-white/60 text-xs mt-1">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Category Tab Component
function CategoryTab({ 
  name, 
  label, 
  count, 
  isActive, 
  onClick 
}: { 
  name: string; 
  label: string; 
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
        isActive 
          ? 'bg-yellow-500/30 text-yellow-300 hover:bg-yellow-500/40' 
          : 'bg-white/5 text-white/70 hover:bg-white/10'
      }`}
    >
      {label} {count > 0 && <span className="ml-1 opacity-70">({count})</span>}
    </button>
  );
}

// Suggestion Card Component
function SuggestionCard({ 
  suggestion, 
  onClick,
  disabled
}: { 
  suggestion: QuerySuggestion;
  onClick: () => void;
  disabled: boolean;
}) {
  const { category, icon, question, description } = suggestion;
  
  // Define category-specific styling
  const getCategoryStyles = () => {
    switch(category) {
      case 'sql':
        return 'from-blue-500/20 to-blue-700/20 hover:from-blue-500/30 hover:to-blue-700/30';
      case 'chart':
        return 'from-emerald-500/20 to-green-700/20 hover:from-emerald-500/30 hover:to-green-700/30';
      case 'insight':
        return 'from-purple-500/20 to-indigo-700/20 hover:from-purple-500/30 hover:to-indigo-700/30';
      case 'demographic':
        return 'from-pink-500/20 to-red-700/20 hover:from-pink-500/30 hover:to-red-700/30';
      case 'temporal':
        return 'from-cyan-500/20 to-blue-700/20 hover:from-cyan-500/30 hover:to-blue-700/30';
      default:
        return 'from-amber-500/20 to-yellow-700/20 hover:from-amber-500/30 hover:to-yellow-700/30';
    }
  };
  // Get category color
  const getCategoryColor = () => {
    switch(category) {
      case 'sql':
        return 'blue';
      case 'chart':
        return 'emerald';
      case 'insight':
        return 'purple';
      case 'demographic':
        return 'pink';
      case 'temporal':
        return 'cyan';
      default:
        return 'amber';
    }
  };
  
  const color = getCategoryColor();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`glass-card-3d relative w-full text-left p-4 rounded-lg backdrop-blur-sm 
        bg-gradient-to-br ${getCategoryStyles()} 
        transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.99]
        border border-${color}-500/20 shadow-lg hover:shadow-${color}-500/10
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer animate-glassMorphism-slow'}`}
    >
      {/* Glassmorphism highlights */}
      <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-${color}-500/30 to-transparent`}></div>
      <div className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-${color}-500/10 to-transparent`}></div>
      <div className={`absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-${color}-500/30 to-transparent`}></div>
      <div className={`absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-${color}-500/30 to-transparent`}></div>
      
      <div className="flex items-start space-x-3 relative z-10">
        <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center flex-shrink-0 
          border border-${color}-500/30 shadow-inner transition-transform hover:scale-110 duration-300`}>
          <span className="text-lg animate-float-subtle">{icon}</span>
        </div>
        <div>
          <h4 className="text-white font-medium">{question}</h4>
          <p className="text-white/70 text-sm mt-1">{description}</p>
          
          {/* Category tag */}
          <div className="mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Confidence indicator with animation */}
        <div className="ml-auto flex items-center space-x-1 flex-shrink-0">
          <div className="bg-green-500 h-2 w-2 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs">
            {Math.round((suggestion.relevance / 100) * 100)}%
          </span>
        </div>
      </div>
    </button>
  );
}

// Compact Suggestion Card for horizontal layout
function CompactSuggestionCard({ 
  suggestion, 
  onClick,
  disabled
}: { 
  suggestion: QuerySuggestion;
  onClick: () => void;
  disabled: boolean;
}) {
  const { category, icon, question, description, relevance } = suggestion;
  
  // Define category-specific styling
  const getCategoryStyles = () => {
    switch(category) {
      case 'sql':
        return 'from-blue-500/20 to-blue-700/20 hover:from-blue-500/30 hover:to-blue-700/30';
      case 'chart':
        return 'from-emerald-500/20 to-green-700/20 hover:from-emerald-500/30 hover:to-green-700/30';
      case 'insight':
        return 'from-purple-500/20 to-indigo-700/20 hover:from-purple-500/30 hover:to-indigo-700/30';
      case 'demographic':
        return 'from-pink-500/20 to-red-700/20 hover:from-pink-500/30 hover:to-red-700/30';
      case 'temporal':
        return 'from-cyan-500/20 to-blue-700/20 hover:from-cyan-500/30 hover:to-blue-700/30';
      default:
        return 'from-amber-500/20 to-yellow-700/20 hover:from-amber-500/30 hover:to-yellow-700/30';
    }
  };
  
  // Get category color
  const getCategoryColor = () => {
    switch(category) {
      case 'sql': return 'blue';
      case 'chart': return 'emerald';
      case 'insight': return 'purple';
      case 'demographic': return 'pink';
      case 'temporal': return 'cyan';
      default: return 'amber';
    }
  };
  
  const color = getCategoryColor();
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`glass-card-3d relative text-left p-3 rounded-lg backdrop-blur-sm 
        bg-gradient-to-br ${getCategoryStyles()} 
        transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]
        border border-${color}-500/20 shadow-lg hover:shadow-${color}-500/10
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer animate-glassMorphism-slow'}
        min-w-[240px] max-w-[280px] h-[130px] flex flex-col`}
    >
      {/* Glassmorphism highlights */}
      <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-${color}-500/30 to-transparent`}></div>
      <div className={`absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-${color}-500/10 to-transparent`}></div>
      
      <div className="flex items-center space-x-2 mb-1 relative z-10">
        <div className={`w-6 h-6 rounded-lg bg-${color}-500/20 flex items-center justify-center flex-shrink-0 
          border border-${color}-500/30 shadow-inner`}>
          <span className="text-sm animate-float-subtle">{icon}</span>
        </div>
        
        {/* Category tag and confidence next to icon */}
        <span className={`text-xs px-2 py-0.5 rounded-full bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </span>
        
        {/* Confidence indicator */}
        <div className="ml-auto flex items-center space-x-1 flex-shrink-0">
          <div className="bg-green-500 h-1.5 w-1.5 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs">
            {Math.round(relevance)}%
          </span>
        </div>
      </div>
      
      <h4 className="text-white font-medium text-sm line-clamp-2 mb-1">{question}</h4>
      <p className="text-white/70 text-xs line-clamp-2 mt-auto">{description}</p>
    </button>
  );
}

// Helper function to analyze columns and determine data types
function analyzeColumns(columns: string[], data: any[]) {
  const columnTypes: Record<string, string> = {};
  
  columns.forEach(col => {
    // Simple type inference based on column name
    if (col.toLowerCase().includes('date') || col.toLowerCase().includes('time')) {
      columnTypes[col] = 'date';
    } else if (col.toLowerCase().includes('id') && !col.toLowerCase().includes('idea')) {
      columnTypes[col] = 'id';
    } else if (
      col.toLowerCase().includes('price') || 
      col.toLowerCase().includes('cost') || 
      col.toLowerCase().includes('salary') || 
      col.toLowerCase().includes('revenue') ||
      col.toLowerCase().includes('sale')
    ) {
      columnTypes[col] = 'currency';
    } else if (
      col.toLowerCase().includes('age') || 
      col.toLowerCase().includes('count') || 
      col.toLowerCase().includes('number') ||
      col.toLowerCase().includes('qty') ||
      col.toLowerCase().includes('amount')
    ) {
      columnTypes[col] = 'number';
    } else if (
      col.toLowerCase().includes('ratio') || 
      col.toLowerCase().includes('percent') || 
      col.toLowerCase().includes('rate')
    ) {
      columnTypes[col] = 'percentage';
    } else if (
      col.toLowerCase().includes('name') || 
      col.toLowerCase().includes('title') || 
      col.toLowerCase().includes('description') || 
      col.toLowerCase().includes('comment')
    ) {
      columnTypes[col] = 'text';
    } else if (
      col.toLowerCase().includes('country') || 
      col.toLowerCase().includes('city') || 
      col.toLowerCase().includes('state') || 
      col.toLowerCase().includes('address') ||
      col.toLowerCase().includes('location')
    ) {
      columnTypes[col] = 'location';
    } else if (
      col.toLowerCase().includes('category') || 
      col.toLowerCase().includes('type') || 
      col.toLowerCase().includes('status') || 
      col.toLowerCase().includes('department') ||
      col.toLowerCase().includes('gender') ||
      col.toLowerCase().includes('level') ||
      col.toLowerCase().includes('priority')
    ) {
      columnTypes[col] = 'category';
    } else {
      // Try to infer from data if column name doesn't give clear indication
      if (data.length > 0) {
        const sample = data[0][col];
        if (typeof sample === 'number') {
          columnTypes[col] = 'number';
        } else if (typeof sample === 'boolean') {
          columnTypes[col] = 'boolean';
        } else if (typeof sample === 'string') {
          // Check if it's a date
          if (!isNaN(Date.parse(sample))) {
            columnTypes[col] = 'date';
          } else {
            columnTypes[col] = 'text';
          }
        } else {
          columnTypes[col] = 'unknown';
        }
      } else {
        columnTypes[col] = 'unknown';
      }
    }
  });
  
  return columnTypes;
}

// Generate overview suggestions with LLM-oriented queries
function generateOverviewSuggestions(columns: string[]): QuerySuggestion[] {
  const colString = columns.join(', ');
  
  return [
    {
      id: 'overview-1',
      category: 'overview',
      icon: '📊',
      question: `Analyze this dataset containing ${columns.length} variables including ${colString.substring(0, 60)}${colString.length > 60 ? '...' : ''}`,
      description: 'Generate a comprehensive analysis with key statistics and patterns',
      relevance: 100
    },
    {
      id: 'overview-2',
      category: 'overview',
      icon: '🔍',
      question: `What are the most significant correlations and relationships between variables in this dataset?`,
      description: 'Identify hidden patterns and meaningful associations',
      relevance: 95
    },
    {
      id: 'overview-3',
      category: 'overview',
      icon: '📋',
      question: `Perform a detailed data quality assessment on all ${columns.length} variables`,
      description: 'Detect missing values, outliers, and data integrity issues',
      relevance: 90
    }
  ];
}

// Generate SQL-focused suggestions
function generateSQLSuggestions(columns: string[], columnTypes: Record<string, string>): QuerySuggestion[] {
  const suggestions: QuerySuggestion[] = [];
  
  // Get column names to create more targeted, LLM-oriented SQL questions
  const numericColumns = columns.filter(col => 
    columnTypes[col] === 'numeric' || 
    ['amount', 'value', 'price', 'cost', 'salary', 'revenue', 'profit', 'score', 'rating', 'count', 'age'].some(term => 
      col.toLowerCase().includes(term)
    )
  );
    
  const categoricalColumns = columns.filter(col => 
    columnTypes[col] === 'category' || 
    ['type', 'category', 'department', 'region', 'status', 'industry', 'segment', 'group'].some(term => 
      col.toLowerCase().includes(term)
    )
  );
  
  const dateColumns = columns.filter(col => 
    columnTypes[col] === 'date' || 
    ['date', 'time', 'year', 'month', 'day', 'created', 'updated', 'timestamp'].some(term => 
      col.toLowerCase().includes(term)
    )
  );
    // 1. Natural Language to SQL Conversion based on actual columns
  suggestions.push({
    id: `sql-nlp-1`,
    category: 'sql',
    icon: '🤖',
    question: `Convert this to an optimized SQL query: "Find records where ${
      columns.length > 0 ? columns[0] : 'the first column'
    } has the highest values and group by ${
      categoricalColumns.length > 0 ? categoricalColumns[0] : 'category fields'
    }"`,
    description: `AI-generated SQL with optimal indexing and execution plan`,
    relevance: 95
  });
  
  // 2. Complex Join Logic with specific table references
  if (columns.length > 3) {
    suggestions.push({
      id: `sql-join-1`,
      category: 'sql',
      icon: '🔄',
      question: `Write a SQL query that efficiently analyzes relationships between ${
        columns.slice(0, Math.min(columns.length, 3)).join(', ')
      } with proper joins`,
      description: `LLM-optimized query with join strategy and performance considerations`,
      relevance: 93
    });
  }
  
  // 3. Advanced Filtering with LLM help - more specific to data
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const catCol = categoricalColumns[0];
    const numCol = numericColumns[0];
    
    suggestions.push({
      id: `sql-advanced-filter-1`,
      category: 'sql',
      icon: '🔍',
      question: `Generate a SQL query with advanced filtering to analyze ${numCol} distribution across different ${catCol} categories`,
      description: `AI-generated SQL with sophisticated WHERE clauses and subqueries`,
      relevance: 90
    });
  }
  
  // 4. Time Series Analysis
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = dateColumns[0];
    const numCol = numericColumns[0];
    
    suggestions.push({
      id: `sql-time-series-1`,
      category: 'sql',
      icon: '📅',
      question: `Generate SQL for time series analysis of ${numCol} over ${dateCol}`,
      description: `Advanced temporal analysis with window functions and period comparisons`,
      relevance: 92
    });
  }
  
  // 5. Performance-Optimized Aggregations
  if (numericColumns.length > 0) {
    const numCol = numericColumns.length > 1 ? numericColumns.slice(0, 2).join(' and ') : numericColumns[0];
    
    suggestions.push({
      id: `sql-performance-1`,
      category: 'sql',
      icon: '⚡',
      question: `Write a high-performance SQL query to analyze ${numCol}`,
      description: `AI-optimized query with execution plan considerations`,
      relevance: 91
    });
  }
    // 6. Data Quality Assessment
  suggestions.push({
    id: `sql-quality-1`,
    category: 'sql',
    icon: '✓',
    question: `Generate SQL to identify data quality issues and anomalies`,
    description: `Comprehensive data validation and integrity checking queries`,
    relevance: 88
  });
  
  // 7. Top Performers (only if we have categorical and numeric columns)
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const catCol = categoricalColumns[0];
    const numCol = numericColumns[0];
    
    suggestions.push({
      id: `sql-filter-1`,
      category: 'sql',
      icon: '💾',
      question: `Which ${catCol} has the highest ${numCol}?`,
      description: `SQL query to find top performers by ${numCol}`,
      relevance: 85
    });
  }
  
  return suggestions;
}

// Generate chart-focused suggestions
function generateChartSuggestions(columns: string[], columnTypes: Record<string, string>): QuerySuggestion[] {
  const suggestions: QuerySuggestion[] = [];
  
  // Find numeric columns for charts
  const numericColumns = Object.entries(columnTypes)
    .filter(([_, type]) => ['number', 'currency', 'percentage'].includes(type))
    .map(([col, _]) => col);
    
  // Find categorical columns for grouping
  const categoricalColumns = Object.entries(columnTypes)
    .filter(([_, type]) => ['category', 'location', 'boolean'].includes(type))
    .map(([col, _]) => col);
  
  // Find date columns for time series
  const dateColumns = Object.entries(columnTypes)
    .filter(([_, type]) => type === 'date')
    .map(([col, _]) => col);
  
  // Bar chart suggestions
  if (numericColumns.length > 0 && categoricalColumns.length > 0) {
    const numCol = numericColumns[0];
    const catCol = categoricalColumns[0];
      suggestions.push({
      id: `chart-bar-1`,
      category: 'chart',
      icon: '📊',
      question: `Generate an advanced bar chart visualization comparing ${numCol} across ${catCol} with statistical significance indicators`,
      description: `LLM-enhanced visualization with error bars, significance testing, and insights annotation`,
      relevance: 95
    });
  }
  
  // Line chart suggestions for time series
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = dateColumns[0];
    const numCol = numericColumns[0];
    
    suggestions.push({
      id: `chart-line-1`,
      category: 'chart',
      icon: '📈',
      question: `Create a multi-dimensional time series analysis of ${numCol} over ${dateCol} with trend forecasting`,
      description: `AI-powered trend visualization with seasonality decomposition and future predictions`,
      relevance: 90
    });
  }
  
  // Pie chart suggestions
  if (numericColumns.length > 0 && categoricalColumns.length > 0) {
    const numCol = numericColumns[0];
    const catCol = categoricalColumns[0];
    
    suggestions.push({
      id: `chart-pie-1`,
      category: 'chart',
      icon: '🥧',
      question: `Design an interactive donut chart visualizing ${catCol} distribution by ${numCol} with drill-down capabilities`,
      description: `LLM-enhanced proportional visualization with interactive segments and insight callouts`,
      relevance: 85
    });
  }
  
  // Scatter plot for correlation
  if (numericColumns.length > 1) {
    const numericColNames = numericColumns.slice(0, Math.min(numericColumns.length, 3)).join(', ');
    
    suggestions.push({
      id: `chart-scatter-1`,
      category: 'chart',
      icon: '🔮',
      question: `Generate a matrix of scatter plots with regression analysis for ${numericColNames}`,
      description: `AI-powered correlation analysis with statistical significance testing and outlier detection`,
      relevance: 80
    });
  }
  
  return suggestions;
}

// Generate insight-focused suggestions
function generateInsightSuggestions(columns: string[], columnTypes: Record<string, string>): QuerySuggestion[] {
  const suggestions: QuerySuggestion[] = [];
  
  // Get column names to create more targeted, LLM-oriented questions
  const numericColumns = columns.filter(col => 
    columnTypes[col] === 'numeric' || 
    ['amount', 'value', 'price', 'cost', 'salary', 'revenue', 'profit', 'score', 'rating', 'count', 'age'].some(term => 
      col.toLowerCase().includes(term)
    )
  );
    
  const categoricalColumns = columns.filter(col => 
    columnTypes[col] === 'category' || 
    ['type', 'category', 'department', 'region', 'status', 'industry', 'segment', 'group'].some(term => 
      col.toLowerCase().includes(term)
    )
  );
  
  const dateColumns = columns.filter(col => 
    columnTypes[col] === 'date' || 
    ['date', 'time', 'year', 'month', 'day', 'created', 'updated', 'timestamp'].some(term => 
      col.toLowerCase().includes(term)
    )
  );
  
  const nameColumns = columns.filter(col =>
    ['name', 'title', 'label', 'description'].some(term =>
      col.toLowerCase().includes(term)
    )
  );
  
  // Advanced LLM-oriented suggestions based on data context
    // 1. Context-aware executive summary with variable specifics
  suggestions.push({
    id: `insight-context-1`,
    category: 'insight',
    icon: '🔍',
    question: `Generate a comprehensive executive summary of this dataset with focus on ${
      numericColumns.length > 0 ? 'key metrics like ' + numericColumns.slice(0, 2).join(', ') : 'key metrics'
    }`,
    description: `GPT-powered analysis with business implications and strategic recommendations`,
    relevance: 98
  });
  
  // 2. Advanced pattern recognition with specific columns
  if (numericColumns.length > 0 && categoricalColumns.length > 0) {
    const numCol = numericColumns[0];
    const catCol = categoricalColumns[0];
    
    suggestions.push({
      id: `insight-pattern-1`,
      category: 'insight',
      icon: '🧠',
      question: `Perform multivariate analysis to uncover hidden causal relationships between ${numCol} and ${catCol}`,
      description: `LLM-enhanced statistical analysis revealing non-obvious correlations and potential causation`,
      relevance: 95
    });
  }
  
  // 3. Anomaly detection with explanation - more sophisticated LLM prompt
  if (numericColumns.length > 0) {
    const numCol = numericColumns[0];
    
    suggestions.push({
      id: `insight-anomaly-1`,
      category: 'insight',
      icon: '⚠️',
      question: `Use statistical methods to identify significant outliers in ${numCol} and provide detailed contextual explanations`,
      description: `AI-powered anomaly detection with root cause analysis and business impact assessment`,
      relevance: 92
    });
  }
  
  // 4. Predictive insights with more sophisticated prompting
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    const dateCol = dateColumns[0];
    const numCol = numericColumns[0];
    
    suggestions.push({
      id: `insight-predictive-1`,
      category: 'insight',
      icon: '🔮',
      question: `Develop a time series forecast model for ${numCol} with seasonal decomposition and confidence intervals`,
      description: `Advanced predictive analytics with trend analysis and scenario modeling for future outcomes`,
      relevance: 94
    });
  }
    // 5. Narrative-based insights with storytelling capabilities
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const catCol = categoricalColumns[0];
    const numCol = numericColumns[0];
    
    suggestions.push({
      id: `insight-narrative-1`,
      category: 'insight',
      icon: '📖',
      question: `Construct a data-driven narrative explaining how ${numCol} evolved across different ${catCol} segments and key turning points`,
      description: `LLM-generated business storytelling with key event identification and causal analysis`,
      relevance: 90
    });
  }
  
  // 6. Decision support with specific actionable strategies
  suggestions.push({
    id: `insight-decision-1`,
    category: 'insight',
    icon: '🎯',
    question: `Develop a prioritized list of data-backed strategic recommendations with implementation roadmap`,
    description: `AI-generated decision framework with impact assessment and execution guidelines`,
    relevance: 93
  });
  
  // General insights prompt with specificity
  suggestions.push({
    id: `insight-general-1`,
    category: 'insight',
    icon: '💡',
    question: `Extract three high-impact actionable insights with quantifiable business value from this dataset`,
    description: `LLM-powered analysis identifying opportunities with measurable ROI potential`,
    relevance: 92
  });
  
  return suggestions;
}
