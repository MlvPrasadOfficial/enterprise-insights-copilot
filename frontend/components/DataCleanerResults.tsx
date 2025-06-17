"use client";
import React from 'react';

// Define the interfaces for the cleaning operation results
interface CleaningOperation {
  operation: string;
  column?: string;
  count_changed?: number;
  from_type?: string;
  to_type?: string;
  outlier_count?: number;
  lower_bound?: number;
  upper_bound?: number;
  count_removed?: number;
  original_count?: number;
  new_count?: number;
  lower_outliers?: number;
  upper_outliers?: number;
  percentage_affected?: number;
  unit_types?: string[];
  success_rate?: string;
  values_converted?: number;
  format_detected?: string;
  date_range?: string;
  percentage_removed?: number;
}

interface CleaningStats {
  operations_count: number;
  operations_by_type: Record<string, number>;
  columns_modified: string[];
  rows_before: number;
  rows_after: number;
  row_count_change: number;
  missing_values_before: number;
  missing_values_after: number;
  missing_values_change: number;
  operation_details?: Record<string, any>;
  data_quality_score?: number;
  dtype_changes?: Array<{column: string, from_type: string, to_type: string}>;
}

// Interface for detailed results
interface DetailedResults {
  units_normalized: Array<{
    column: string;
    count_changed: number;
    unit_types: string[];
    examples: Array<{from: string; to: string}>;
    original_sample: string[];
    normalized_sample: string[];
  }>;
  numeric_conversions: Array<{
    column: string;
    from_type: string;
    to_type: string;
    success_rate: number;
    values_converted: number;
    total_values: number;
    na_before: number;
    na_after: number;
    examples: Array<{from: string; to: string; index: number}>;
    min_value: number | null;
    max_value: number | null;
  }>;
  date_conversions: Array<{
    column: string;
    from_type: string;
    to_type: string;
    success_rate: number;
    values_converted: number;
    format_detected: string;
    date_range: {min: string; max: string};
    examples: Array<{from: string; to: string; index: number}>;
    na_before: number;
    na_after: number;
    time_components: boolean;
  }>;
  outliers_fixed: Array<{
    column: string;
    total_outliers: number;
    lower_outliers: number;
    upper_outliers: number;
    percentage_of_data: number;
    bounds: {lower: number; upper: number; q1: number; q3: number; iqr: number};
    statistics: {mean: number; median: number; std: number};
    lower_samples: Array<{index: number; value: number; boundary: number}>;
    upper_samples: Array<{index: number; value: number; boundary: number}>;
  }>;
  duplicates_removed: number;
  duplicate_details?: {
    total_duplicates: number;
    percentage_of_data: number;
    potential_duplicate_columns: Array<{
      column: string;
      dominant_value: string;
      occurrence_count: number;
      percentage: number;
    }>;
    sample_rows: Record<string, any>[];
  };
}

interface CleaningResult {
  operations: CleaningOperation[];
  cleaning_stats: CleaningStats;
  detailed_results?: DetailedResults;
}

interface DataCleanerResultsProps {
  cleaningResult: CleaningResult;
}

// A helper function to format the operation description
const formatOperation = (op: CleaningOperation): string => {
  switch (op.operation) {
    case 'normalize_units':
      let unitDesc = `Normalized ${op.count_changed} values in column "${op.column}"`;
      if (op.unit_types && op.unit_types.length > 0) {
        unitDesc += ` (types: ${op.unit_types.join(', ')})`;
      }
      return unitDesc;
    
    case 'convert_numeric':
      let numericDesc = `Converted column "${op.column}" from ${op.from_type} to ${op.to_type}`;
      if (op.success_rate) {
        numericDesc += ` with ${op.success_rate} success rate`;
      }
      if (op.values_converted) {
        numericDesc += `, ${op.values_converted} values converted`;
      }
      return numericDesc;
    
    case 'convert_datetime':
      let dateDesc = `Standardized date formats in column "${op.column}"`;
      if (op.format_detected) {
        dateDesc += `, detected format: ${op.format_detected}`;
      }
      if (op.date_range) {
        dateDesc += `, range: ${op.date_range}`;
      }
      return dateDesc;
    
    case 'handle_outliers':
      let outlierDesc = `Handled ${op.outlier_count} outliers in column "${op.column}"`;
      if (op.lower_outliers !== undefined && op.upper_outliers !== undefined) {
        outlierDesc += ` (${op.lower_outliers} low, ${op.upper_outliers} high)`;
      }
      if (op.lower_bound !== undefined && op.upper_bound !== undefined) {
        outlierDesc += `, valid range: ${op.lower_bound.toFixed(2)} to ${op.upper_bound.toFixed(2)}`;
      }
      if (op.percentage_affected) {
        outlierDesc += `, ${op.percentage_affected}% of data`;
      }
      return outlierDesc;
    
    case 'remove_duplicates':
      let dupDesc = `Removed ${op.count_removed} duplicate rows (${op.original_count} → ${op.new_count})`;
      if (op.percentage_removed) {
        dupDesc += `, ${op.percentage_removed}% of data`;
      }
      return dupDesc;
    
    case 'handle_missing':
      return `Handled missing values in column "${op.column}"`;
      
    default:
      return `${op.operation} operation performed`;
  }
};

// Color coding for different operation types
const getOperationColor = (opType: string): string => {
  switch (opType) {
    case 'normalize_units': return 'text-blue-400';
    case 'convert_numeric': return 'text-purple-400';
    case 'normalize_dates': return 'text-yellow-400';
    case 'handle_outliers': return 'text-red-400';
    case 'remove_duplicates': return 'text-green-400';
    case 'handle_missing': return 'text-cyan-400';
    default: return 'text-white';
  }
};

// Icon for different operation types
const getOperationIcon = (opType: string): string => {
  switch (opType) {
    case 'normalize_units': return '📐';
    case 'convert_numeric': return '🔢';
    case 'normalize_dates': return '📅';
    case 'handle_outliers': return '⚠️';
    case 'remove_duplicates': return '🧹';
    case 'handle_missing': return '🔍';
    default: return '🔧';
  }
};

export default function DataCleanerResults({ cleaningResult }: DataCleanerResultsProps) {
  // Check if we have a valid cleaning result
  if (!cleaningResult || !cleaningResult.operations || !cleaningResult.cleaning_stats) {
    console.warn("Missing or incomplete cleaning result data:", cleaningResult);
    return (
      <div className="space-y-6">
        <div className="glass-card-3d p-4 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10">
          <h3 className="text-white text-lg font-medium mb-4">Cleaning Results</h3>
          <p className="text-white/70">No detailed cleaning results available. The data may not have required cleaning.</p>
          <div className="mt-2 text-xs text-white/50">
            <p>Received data: {JSON.stringify(cleaningResult || {}, null, 2)}</p>
            <p>Please upload a CSV file to see real cleaning results.</p>
          </div>
        </div>
      </div>
    );
  }
  
  const { operations, cleaning_stats, detailed_results } = cleaningResult;
  
  // Log the actual operations and detailed results for debugging
  console.log("Rendering DataCleanerResults with operations:", operations);  console.log("Cleaning stats:", cleaning_stats);
  console.log("Detailed results:", detailed_results);
  
  // Enhanced debug information in console
  console.log("DataCleanerResults: Rendering with props:", {
    hasData: !!cleaningResult,
    isRealData: cleaningResult?.isRealData,
    operationsCount: cleaningResult?.operations?.length || 0,
    hasDetailedResults: !!cleaningResult?.detailed_results,
    detailedResultsKeys: cleaningResult?.detailed_results ? Object.keys(cleaningResult.detailed_results) : [],
    unitConversions: cleaningResult?.detailed_results?.units_normalized?.length || 0,
    numericConversions: cleaningResult?.detailed_results?.numeric_conversions?.length || 0,
    dateConversions: cleaningResult?.detailed_results?.date_conversions?.length || 0,
  });
  
  return (
    <div className="space-y-6">
      {/* Debug info visible in the UI */}
      <div className="glass-card-3d p-2 mb-3 text-xs bg-gray-800/50 rounded">
        <p>Debug: {cleaningResult?.isRealData ? 'Real Data' : 'Placeholder'}</p>
        <p>Operations: {cleaningResult?.operations?.length || 0}</p>
        <p>Detailed Results: {cleaningResult?.detailed_results ? 'Yes' : 'No'}</p>
        <p>Unit Converts: {cleaningResult?.detailed_results?.units_normalized?.length || 0}</p>
        <p>Numeric Converts: {cleaningResult?.detailed_results?.numeric_conversions?.length || 0}</p>
        <p>Date Converts: {cleaningResult?.detailed_results?.date_conversions?.length || 0}</p>
      </div>
      
      {/* Summary Statistics */}
      <div className="glass-card-3d p-4 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10">
        <h3 className="text-white text-lg font-medium mb-4">Cleaning Summary</h3>
        
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="glass-card-3d p-3 bg-white/5">
            <h4 className="text-white/70 text-xs">Operations Performed</h4>
            <p className="text-white text-xl font-bold">{cleaning_stats.operations_count}</p>
          </div>
          
          <div className="glass-card-3d p-3 bg-white/5">
            <h4 className="text-white/70 text-xs">Columns Modified</h4>
            <p className="text-white text-xl font-bold">{cleaning_stats.columns_modified.length}</p>
          </div>
          
          <div className="glass-card-3d p-3 bg-white/5">
            <h4 className="text-white/70 text-xs">Rows Changed</h4>
            <p className="text-white text-xl font-bold">{Math.abs(cleaning_stats.row_count_change)}</p>
            <p className="text-xs text-white/50">{cleaning_stats.rows_before} → {cleaning_stats.rows_after}</p>
          </div>
          
          <div className="glass-card-3d p-3 bg-white/5">
            <h4 className="text-white/70 text-xs">Missing Values Fixed</h4>
            <p className={`text-xl font-bold ${
              cleaning_stats.missing_values_change < 0 ? 'text-green-400' : 'text-white'
            }`}>
              {Math.abs(cleaning_stats.missing_values_change)}
            </p>
            <p className="text-xs text-white/50">{cleaning_stats.missing_values_before} → {cleaning_stats.missing_values_after}</p>
          </div>
        </div>
        
        {/* Operation type distribution */}
        <div className="mt-4">
          <h4 className="text-white/70 text-sm mb-2">Operations by Type</h4>
          <div className="space-y-2">
            {Object.entries(cleaning_stats.operations_by_type).map(([opType, count]) => (
              <div key={opType} className="flex items-center">
                <span className="w-6 text-center mr-2">{getOperationIcon(opType)}</span>
                <div className="flex-grow">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${opType === 'normalize_units' ? 'bg-blue-500' : 
                                          opType === 'convert_numeric' ? 'bg-purple-500' :
                                          opType === 'normalize_dates' ? 'bg-yellow-500' :
                                          opType === 'handle_outliers' ? 'bg-red-500' :
                                          opType === 'remove_duplicates' ? 'bg-green-500' :
                                          opType === 'handle_missing' ? 'bg-cyan-500' :
                                          'bg-gray-500'}`}
                      style={{ width: `${(count / cleaning_stats.operations_count) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className={`ml-2 text-xs ${getOperationColor(opType)}`}>
                  {opType} ({count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Detailed Operations */}
      <div className="glass-card-3d p-4 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10">
        <h3 className="text-white text-lg font-medium mb-4">Detailed Cleaning Operations</h3>
        
        {/* Column-based summary */}
        <div className="mb-4">
          <h4 className="text-white/70 text-sm mb-2">Modified Columns</h4>
          <div className="flex flex-wrap gap-2">
            {cleaning_stats.columns_modified.map(column => (
              <span key={column} className="px-2 py-1 rounded bg-white/10 text-white/80 text-xs">
                {column}
              </span>
            ))}
          </div>
        </div>
        
        {/* Timeline of operations */}
        <div className="relative mt-6">
          <h4 className="text-white/70 text-sm mb-2">Operation Timeline</h4>
          
          {/* Timeline line */}
          <div className="absolute left-4 top-6 bottom-0 w-0.5 bg-white/10"></div>
          
          <div className="space-y-4">
            {operations.map((op, index) => (
              <div key={index} className="relative pl-10">
                {/* Operation dot */}
                <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center ${
                  op.operation === 'normalize_units' ? 'bg-blue-500/20 text-blue-400' : 
                  op.operation === 'convert_numeric' ? 'bg-purple-500/20 text-purple-400' :
                  op.operation === 'normalize_dates' ? 'bg-yellow-500/20 text-yellow-400' :
                  op.operation === 'handle_outliers' ? 'bg-red-500/20 text-red-400' :
                  op.operation === 'remove_duplicates' ? 'bg-green-500/20 text-green-400' :
                  op.operation === 'handle_missing' ? 'bg-cyan-500/20 text-cyan-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  <span>{getOperationIcon(op.operation)}</span>
                </div>
                
                {/* Operation content */}
                <div className="glass-card-3d p-3 bg-white/5">
                  <h5 className={`font-medium ${getOperationColor(op.operation)}`}>
                    {op.operation}
                  </h5>
                  <p className="text-white/80 text-sm">{formatOperation(op)}</p>
                  
                  {/* Operation details */}
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/60">
                    {op.column && (
                      <div className="flex justify-between">
                        <span>Column:</span>
                        <span className="text-white/80">{op.column}</span>
                      </div>
                    )}
                    
                    {op.count_changed !== undefined && (
                      <div className="flex justify-between">
                        <span>Values changed:</span>
                        <span className="text-white/80">{op.count_changed}</span>
                      </div>
                    )}
                    
                    {op.from_type && op.to_type && (
                      <div className="flex justify-between">
                        <span>Type conversion:</span>
                        <span className="text-white/80">{op.from_type} → {op.to_type}</span>
                      </div>
                    )}
                    
                    {op.outlier_count !== undefined && (
                      <div className="flex justify-between">
                        <span>Outliers detected:</span>
                        <span className="text-white/80">{op.outlier_count}</span>
                      </div>
                    )}
                    
                    {op.lower_bound !== undefined && op.upper_bound !== undefined && (
                      <div className="flex justify-between">
                        <span>Valid range:</span>
                        <span className="text-white/80">{op.lower_bound} to {op.upper_bound}</span>
                      </div>
                    )}
                    
                    {op.count_removed !== undefined && (
                      <div className="flex justify-between">
                        <span>Rows removed:</span>
                        <span className="text-white/80">{op.count_removed}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
        {/* Detailed Examples Section */}
      {detailed_results && (
        <div className="glass-card-3d p-4 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10">
          <h3 className="text-white text-lg font-medium mb-4">Detailed Examples</h3>
          
          {/* Unit Normalization Examples */}
          {detailed_results.units_normalized && detailed_results.units_normalized.length > 0 && (
            <div className="mb-6">
              <h4 className="text-blue-400 text-sm font-medium mb-2">Unit Normalization Examples</h4>
              <div className="space-y-3">
                {detailed_results.units_normalized.map((normalization, idx) => (
                  <div key={`unit-${idx}`} className="glass-card-3d p-3 bg-white/5">
                    <h5 className="font-medium text-sm text-white">Column: {normalization.column}</h5>
                    <p className="text-white/70 text-xs mb-2">
                      {normalization.count_changed} values normalized
                      {normalization.unit_types?.length > 0 && ` • Types: ${normalization.unit_types.join(', ')}`}
                    </p>
                    
                    {normalization.examples && normalization.examples.length > 0 && (
                      <div className="mt-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-white/50">
                              <th className="text-left">Original</th>
                              <th className="text-left">Normalized</th>
                            </tr>
                          </thead>
                          <tbody>
                            {normalization.examples.slice(0, 3).map((example, exIdx) => (
                              <tr key={exIdx} className="text-white/80">
                                <td className="py-1">{example.from}</td>
                                <td className="py-1">{example.to}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Numeric Conversion Examples */}
          {detailed_results.numeric_conversions && detailed_results.numeric_conversions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-purple-400 text-sm font-medium mb-2">Numeric Conversion Examples</h4>
              <div className="space-y-3">
                {detailed_results.numeric_conversions.map((conversion, idx) => (
                  <div key={`numeric-${idx}`} className="glass-card-3d p-3 bg-white/5">
                    <h5 className="font-medium text-sm text-white">Column: {conversion.column}</h5>
                    <p className="text-white/70 text-xs mb-2">
                      {conversion.values_converted} values converted ({conversion.success_rate}% success)
                      • Type: {conversion.from_type} → {conversion.to_type}
                    </p>
                    
                    {conversion.examples && conversion.examples.length > 0 && (
                      <div className="mt-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-white/50">
                              <th className="text-left">Original</th>
                              <th className="text-left">Converted</th>
                            </tr>
                          </thead>
                          <tbody>
                            {conversion.examples.slice(0, 3).map((example, exIdx) => (
                              <tr key={exIdx} className="text-white/80">
                                <td className="py-1">{example.from}</td>
                                <td className="py-1">{example.to}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {conversion.min_value !== null && conversion.max_value !== null && (
                      <p className="text-white/60 text-xs mt-2">Range: {conversion.min_value} to {conversion.max_value}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Date Conversion Examples */}
          {detailed_results.date_conversions && detailed_results.date_conversions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-yellow-400 text-sm font-medium mb-2">Date Standardization Examples</h4>
              <div className="space-y-3">
                {detailed_results.date_conversions.map((conversion, idx) => (
                  <div key={`date-${idx}`} className="glass-card-3d p-3 bg-white/5">
                    <h5 className="font-medium text-sm text-white">Column: {conversion.column}</h5>
                    <p className="text-white/70 text-xs mb-2">
                      {conversion.format_detected} format • {conversion.values_converted} dates converted
                      {conversion.time_components && ' • Includes time components'}
                    </p>
                    
                    {conversion.examples && conversion.examples.length > 0 && (
                      <div className="mt-2">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-white/50">
                              <th className="text-left">Original</th>
                              <th className="text-left">Standardized</th>
                            </tr>
                          </thead>
                          <tbody>
                            {conversion.examples.slice(0, 3).map((example, exIdx) => (
                              <tr key={exIdx} className="text-white/80">
                                <td className="py-1">{example.from}</td>
                                <td className="py-1">{example.to}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {conversion.date_range && (
                      <p className="text-white/60 text-xs mt-2">
                        Date range: {conversion.date_range.min || 'Unknown'} to {conversion.date_range.max || 'Unknown'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Outlier Examples */}
          {detailed_results.outliers_fixed && detailed_results.outliers_fixed.length > 0 && (
            <div className="mb-6">
              <h4 className="text-red-400 text-sm font-medium mb-2">Outlier Detection Examples</h4>
              <div className="space-y-3">
                {detailed_results.outliers_fixed.map((outlierInfo, idx) => (
                  <div key={`outlier-${idx}`} className="glass-card-3d p-3 bg-white/5">
                    <h5 className="font-medium text-sm text-white">Column: {outlierInfo.column}</h5>
                    <p className="text-white/70 text-xs mb-2">
                      {outlierInfo.total_outliers} outliers ({outlierInfo.percentage_of_data}% of data)
                      • {outlierInfo.lower_outliers} low, {outlierInfo.upper_outliers} high
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {/* Lower outliers */}
                      {outlierInfo.lower_samples && outlierInfo.lower_samples.length > 0 && (
                        <div>
                          <p className="text-white/60 text-xs mb-1">Low outliers (below {outlierInfo.bounds.lower.toFixed(2)}):</p>
                          <ul className="text-white/80 text-xs">
                            {outlierInfo.lower_samples.map((sample, sIdx) => (
                              <li key={`low-${sIdx}`}>{sample.value} → {outlierInfo.bounds.lower.toFixed(2)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Upper outliers */}
                      {outlierInfo.upper_samples && outlierInfo.upper_samples.length > 0 && (
                        <div>
                          <p className="text-white/60 text-xs mb-1">High outliers (above {outlierInfo.bounds.upper.toFixed(2)}):</p>
                          <ul className="text-white/80 text-xs">
                            {outlierInfo.upper_samples.map((sample, sIdx) => (
                              <li key={`high-${sIdx}`}>{sample.value} → {outlierInfo.bounds.upper.toFixed(2)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-white/10">
                      <p className="text-white/60 text-xs">
                        Normal range (Q1-Q3): {outlierInfo.bounds.q1.toFixed(2)} to {outlierInfo.bounds.q3.toFixed(2)} 
                        • Mean: {outlierInfo.statistics.mean.toFixed(2)} 
                        • Median: {outlierInfo.statistics.median.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Duplicate Details */}
          {detailed_results.duplicate_details && detailed_results.duplicates_removed > 0 && (
            <div className="mb-6">
              <h4 className="text-green-400 text-sm font-medium mb-2">Duplicate Removal Details</h4>
              <div className="glass-card-3d p-3 bg-white/5">
                <p className="text-white/80 text-sm">
                  {detailed_results.duplicates_removed} duplicates removed 
                  ({detailed_results.duplicate_details.percentage_of_data.toFixed(1)}% of data)
                </p>
                
                {detailed_results.duplicate_details.potential_duplicate_columns?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-white/60 text-xs mb-1">Potential columns causing duplicates:</p>
                    <div className="space-y-1">
                      {detailed_results.duplicate_details.potential_duplicate_columns.map((col, idx) => (
                        <div key={`dup-col-${idx}`} className="flex justify-between text-xs">
                          <span className="text-white/80">{col.column}</span>
                          <span className="text-white/60">{col.percentage}% with value "{col.dominant_value}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Before/After Column Values */}
      <div className="glass-card-3d p-4 bg-gradient-to-br from-purple-600/10 to-fuchsia-600/10">
        <h3 className="text-white text-lg font-medium mb-4">Cleaning Impact</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card-3d p-3 bg-white/5">
            <h4 className="text-white/70 text-sm mb-2">Row Count</h4>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-white/50">Before</span>
                <p className="text-white">{cleaning_stats.rows_before}</p>
              </div>
              <div className="text-xl mx-2">→</div>
              <div>
                <span className="text-xs text-white/50">After</span>
                <p className="text-white">{cleaning_stats.rows_after}</p>
              </div>
            </div>
          </div>
          
          <div className="glass-card-3d p-3 bg-white/5">
            <h4 className="text-white/70 text-sm mb-2">Missing Values</h4>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-white/50">Before</span>
                <p className="text-white">{cleaning_stats.missing_values_before}</p>
              </div>
              <div className="text-xl mx-2">→</div>
              <div>
                <span className="text-xs text-white/50">After</span>
                <p className="text-white">{cleaning_stats.missing_values_after}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Data quality score visualization */}
        <div className="mt-4">
          <h4 className="text-white/70 text-sm mb-2">Data Quality Score</h4>
          <div className="glass-card-3d p-3 bg-white/5">
            <div className="relative h-8">
              {/* Quality score bar */}
              <div className="absolute inset-0 bg-white/10 rounded-full overflow-hidden">
                {/* Use actual quality score if available, otherwise calculate based on operations */}
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                  style={{ 
                    width: `${cleaning_stats.data_quality_score !== undefined ? 
                      cleaning_stats.data_quality_score :
                      Math.min(100, 50 + 
                        (Math.min(cleaning_stats.row_count_change, 0) / cleaning_stats.rows_before * -50) + 
                        (cleaning_stats.missing_values_change / Math.max(1, cleaning_stats.missing_values_before) * -50)
                      )}%` 
                  }}
                ></div>
              </div>
              
              {/* Score markers */}
              <div className="absolute inset-y-0 left-1/4 w-0.5 bg-white/30"></div>
              <div className="absolute inset-y-0 left-2/4 w-0.5 bg-white/30"></div>
              <div className="absolute inset-y-0 left-3/4 w-0.5 bg-white/30"></div>
              
              {/* Score labels */}
              <div className="absolute -bottom-6 left-0 text-xs text-white/50">Poor</div>
              <div className="absolute -bottom-6 left-1/4 transform -translate-x-1/2 text-xs text-white/50">Fair</div>
              <div className="absolute -bottom-6 left-2/4 transform -translate-x-1/2 text-xs text-white/50">Good</div>
              <div className="absolute -bottom-6 left-3/4 transform -translate-x-1/2 text-xs text-white/50">Great</div>
              <div className="absolute -bottom-6 right-0 transform translate-x-0 text-xs text-white/50">Excellent</div>
              
              {/* Display actual score if available */}
              {cleaning_stats.data_quality_score !== undefined && (
                <div className="absolute inset-y-0 flex items-center justify-center w-full">
                  <span className="text-white text-sm font-bold">{cleaning_stats.data_quality_score}/100</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
