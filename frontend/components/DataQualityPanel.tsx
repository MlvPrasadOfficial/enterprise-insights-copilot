"use client";
import React, { useMemo, useState, useEffect } from 'react';

interface DataQualityPanelProps {
  data: any[];
  columns: string[];
}

interface ColumnQualityMetric {
  column: string;
  missingCount: number;
  missingPercentage: number;
  dataType: string;
  uniqueValues: number;
  minValue?: any;
  maxValue?: any;
  avgValue?: number;
  recommendations: string[];
}

export default function DataQualityPanel({ data, columns }: DataQualityPanelProps) {
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(false);
  
  // Auto-select first column when data/columns change
  useEffect(() => {
    if (columns && columns.length > 0 && !selectedColumn) {
      setSelectedColumn(columns[0]);
    }
  }, [columns, selectedColumn]);
  
  const qualityMetrics = useMemo(() => {
    if (!data || data.length === 0 || !columns || columns.length === 0) {
      return {
        totalRows: 0,
        totalColumns: 0,
        missingValues: 0,
        duplicateRows: 0,
        completenessScore: 0,
        qualityScore: 0,
        columnMetrics: []
      };
    }

    // Calculate column-level metrics
    let totalMissingValues = 0;
    const columnMetrics: ColumnQualityMetric[] = columns.map(column => {
      const values = data.map(row => row[column]);
      const nonNullValues = values.filter(val => val !== null && val !== undefined && val !== '');
      const missingCount = values.length - nonNullValues.length;
      totalMissingValues += missingCount;
      
      // Determine data type
      let dataType = 'string';
      if (nonNullValues.length > 0) {
        const sampleValue = nonNullValues[0];
        if (typeof sampleValue === 'number') {
          dataType = 'number';
        } else if (typeof sampleValue === 'boolean') {
          dataType = 'boolean';
        } else if (typeof sampleValue === 'string') {
          // Check if it looks like a date
          if (!isNaN(Date.parse(sampleValue))) {
            dataType = 'date';
          } else if (!isNaN(Number(sampleValue)) && sampleValue.trim() !== '') {
            dataType = 'number';
          }
        }
      }
      
      // Calculate numeric statistics if applicable
      let minValue, maxValue, avgValue;
      if (dataType === 'number') {
        const numericValues = nonNullValues.map(v => typeof v === 'string' ? Number(v) : v);
        minValue = Math.min(...numericValues);
        maxValue = Math.max(...numericValues);
        avgValue = numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
      } else if (dataType === 'date') {
        const dateValues = nonNullValues.map(v => new Date(v).getTime());
        minValue = new Date(Math.min(...dateValues)).toISOString().split('T')[0];
        maxValue = new Date(Math.max(...dateValues)).toISOString().split('T')[0];
      }
      
      // Generate recommendations based on data quality
      const recommendations: string[] = [];
      const missingPercentage = (missingCount / values.length) * 100;
      
      if (missingPercentage > 20) {
        recommendations.push(`High missing data rate (${missingPercentage.toFixed(1)}%). Consider imputation or filtering.`);
      }
      
      const uniqueValues = new Set(nonNullValues).size;
      const uniqueRatio = uniqueValues / nonNullValues.length;
      
      if (uniqueRatio === 1 && nonNullValues.length > 10) {
        recommendations.push('All values are unique. This may be an ID column.');
      }
      
      if (uniqueRatio < 0.01 && nonNullValues.length > 100) {
        recommendations.push('Very low cardinality. Consider using as a categorical feature.');
      }
      
      return {
        column,
        missingCount,
        missingPercentage,
        dataType,
        uniqueValues,
        minValue,
        maxValue,
        avgValue,
        recommendations
      };
    });
    
    // Calculate overall metrics
    const totalCells = data.length * columns.length;
    const completenessScore = ((totalCells - totalMissingValues) / totalCells) * 100;
    
    // Detect duplicate rows
    const stringifiedRows = data.map(row => JSON.stringify(row));
    const uniqueRows = new Set(stringifiedRows).size;
    const duplicateRows = data.length - uniqueRows;
    
    // Calculate quality score (basic algorithm)
    // Factors: completeness, duplicates, data type consistency
    const qualityScore = Math.max(0, completenessScore - (duplicateRows / data.length * 10));
    
    return {
      totalRows: data.length,
      totalColumns: columns.length,
      missingValues: totalMissingValues,
      duplicateRows,
      completenessScore,
      qualityScore,
      columnMetrics
    };
  }, [data, columns]);
  
  // Get quality color based on score
  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-lime-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };
  
  // Get quality indicator color based on percentage
  const getIndicatorColor = (percentage: number) => {
    if (percentage <= 5) return 'bg-green-400';
    if (percentage <= 20) return 'bg-lime-400';
    if (percentage <= 40) return 'bg-yellow-400';
    if (percentage <= 60) return 'bg-orange-400';
    return 'bg-red-400';
  };
  
  // Handle column selection
  const handleColumnSelect = (column: string) => {
    setSelectedColumn(column);
  };
  
  // Get metrics for selected column
  const selectedColumnMetrics = selectedColumn 
    ? qualityMetrics.columnMetrics.find(metrics => metrics.column === selectedColumn)
    : null;
  
  if (data.length === 0 || columns.length === 0) {
    return (
      <div className="glass-card-3d p-4 space-y-4 bg-gradient-to-br from-green-600/10 to-teal-600/10 animate-slideDown transition-all">
        <div className="relative">
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent"></div>
          <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-green-500/30 to-transparent"></div>
          <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-green-500/30 to-transparent"></div>
          
          <div className="flex items-center justify-between mb-2 pt-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-green-800/40 flex items-center justify-center border border-green-700/50 shadow-glow">
                <span role="img" aria-label="data quality" className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="text-white font-medium">Data Quality Analysis</h3>
                <p className="text-white/70 text-xs">Upload data to see quality metrics</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-8">
          <p className="text-white/70 text-sm">No data available for quality analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card-3d p-4 space-y-4 bg-gradient-to-br from-green-600/10 to-teal-600/10 animate-slideDown transition-all duration-300 ${panelExpanded ? 'max-h-[800px]' : 'max-h-[350px]'}`}>
      <div className="relative">
        <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent"></div>
        <div className="absolute top-0 left-0 w-px h-4 bg-gradient-to-b from-green-500/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-px h-4 bg-gradient-to-b from-green-500/30 to-transparent"></div>
        
        <div className="flex items-center justify-between mb-2 pt-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-800/40 flex items-center justify-center border border-green-700/50 shadow-glow">
              <span role="img" aria-label="data quality" className="text-xl">📊</span>
            </div>
            <div>
              <h3 className="text-white font-medium">Data Quality Analysis</h3>
              <p className="text-white/70 text-xs">Metrics and recommendations</p>
            </div>
          </div>
          <div onClick={() => setPanelExpanded(!panelExpanded)} className="cursor-pointer">
            {panelExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </div>
      
      {/* Summary statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="glass-card-light p-3 rounded-lg">
          <div className="text-xs text-white/70 mb-1">Overall Quality</div>
          <div className={`text-xl font-bold ${getQualityColor(qualityMetrics.qualityScore)}`}>
            {qualityMetrics.qualityScore.toFixed(1)}%
          </div>
        </div>
        
        <div className="glass-card-light p-3 rounded-lg">
          <div className="text-xs text-white/70 mb-1">Completeness</div>
          <div className={`text-xl font-bold ${getQualityColor(qualityMetrics.completenessScore)}`}>
            {qualityMetrics.completenessScore.toFixed(1)}%
          </div>
        </div>
        
        <div className="glass-card-light p-3 rounded-lg">
          <div className="text-xs text-white/70 mb-1">Rows</div>
          <div className="text-xl font-bold text-white">
            {qualityMetrics.totalRows.toLocaleString()}
          </div>
        </div>
        
        <div className="glass-card-light p-3 rounded-lg">
          <div className="text-xs text-white/70 mb-1">Duplicate Rows</div>
          <div className="text-xl font-bold text-white">
            {qualityMetrics.duplicateRows.toLocaleString()}
          </div>
        </div>
      </div>
      
      {/* Column selector */}
      <div>
        <div className="text-sm text-white font-medium mb-2">Column Quality Details</div>
        <div className="flex overflow-x-auto pb-2 hide-scrollbar space-x-2">
          {columns.map(column => (
            <button 
              key={column} 
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs ${
                selectedColumn === column 
                  ? 'bg-green-500/30 text-white border border-green-500/50' 
                  : 'bg-white/5 text-white/80 border border-white/10 hover:bg-white/10'
              }`}
              onClick={() => handleColumnSelect(column)}
            >
              {column}
            </button>
          ))}
        </div>
      </div>
      
      {/* Selected column details */}
      {selectedColumnMetrics && (
        <div className="glass-card-light p-3 rounded-lg bg-white/5">
          <div className="flex justify-between mb-3">
            <h4 className="text-white font-medium">{selectedColumnMetrics.column}</h4>
            <span className="text-xs px-2 py-0.5 rounded bg-gray-800/50 border border-white/10">
              {selectedColumnMetrics.dataType}
            </span>
          </div>
          
          <div className="space-y-3">
            {/* Missing values meter */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/70">Missing Values</span>
                <span className={`${selectedColumnMetrics.missingPercentage > 20 ? 'text-orange-400' : 'text-green-400'}`}>
                  {selectedColumnMetrics.missingCount} ({selectedColumnMetrics.missingPercentage.toFixed(1)}%)
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10">
                <div 
                  className={`h-1.5 rounded-full ${getIndicatorColor(selectedColumnMetrics.missingPercentage)}`} 
                  style={{ width: `${Math.min(100, selectedColumnMetrics.missingPercentage)}%` }}
                ></div>
              </div>
            </div>
            
            {/* Unique values */}
            <div className="flex justify-between text-xs">
              <span className="text-white/70">Unique Values</span>
              <span className="text-white">
                {selectedColumnMetrics.uniqueValues.toLocaleString()} ({(selectedColumnMetrics.uniqueValues / Math.max(1, data.length) * 100).toFixed(1)}%)
              </span>
            </div>
            
            {/* Range if numeric */}
            {selectedColumnMetrics.dataType === 'number' && (
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Range</span>
                <span className="text-white">
                  {selectedColumnMetrics.minValue?.toLocaleString()} – {selectedColumnMetrics.maxValue?.toLocaleString()}
                </span>
              </div>
            )}
            
            {/* Date range if date */}
            {selectedColumnMetrics.dataType === 'date' && (
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Date Range</span>
                <span className="text-white">
                  {selectedColumnMetrics.minValue} – {selectedColumnMetrics.maxValue}
                </span>
              </div>
            )}
            
            {/* Average if numeric */}
            {selectedColumnMetrics.avgValue !== undefined && (
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Average</span>
                <span className="text-white">{selectedColumnMetrics.avgValue.toLocaleString()}</span>
              </div>
            )}
          </div>
          
          {/* Recommendations */}
          {selectedColumnMetrics.recommendations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <h5 className="text-white text-xs font-medium mb-2">Recommendations</h5>
              <ul className="space-y-1">
                {selectedColumnMetrics.recommendations.map((rec, index) => (
                  <li key={index} className="text-xs text-white/80 flex items-start">
                    <span className="text-green-400 mr-1.5">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
