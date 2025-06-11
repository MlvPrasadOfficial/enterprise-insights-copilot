"use client";
import React, { useMemo } from 'react';

interface DataQualityMetrics {
  totalRows: number;
  totalColumns: number;
  missingValues: number;
  duplicateRows: number;
  dataTypes: Record<string, string>;
  completenessScore: number;
  qualityScore: number;
  columnQuality: Array<{
    column: string;
    missingCount: number;
    missingPercentage: number;
    dataType: string;
    uniqueValues: number;
  }>;
}

interface DataQualityAnalyzerProps {
  data: any[];
  columns: string[];
}

export default function DataQualityAnalyzer({ data, columns }: DataQualityAnalyzerProps) {
  const qualityMetrics = useMemo((): DataQualityMetrics => {
    if (!data || data.length === 0 || !columns || columns.length === 0) {
      return {
        totalRows: 0,
        totalColumns: 0,
        missingValues: 0,
        duplicateRows: 0,
        dataTypes: {},
        completenessScore: 0,
        qualityScore: 0,
        columnQuality: []
      };
    }

    // Calculate missing values and data types
    let totalMissing = 0;
    const dataTypes: Record<string, string> = {};
    const columnQuality = columns.map(column => {
      const values = data.map(row => row[column]);
      const missingCount = values.filter(val => val === null || val === undefined || val === '').length;
      const nonMissingValues = values.filter(val => val !== null && val !== undefined && val !== '');
      
      // Determine data type
      let dataType = 'string';
      if (nonMissingValues.length > 0) {
        const sampleValue = nonMissingValues[0];
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
      
      dataTypes[column] = dataType;
      totalMissing += missingCount;
      
      return {
        column,
        missingCount,
        missingPercentage: (missingCount / data.length) * 100,
        dataType,
        uniqueValues: new Set(nonMissingValues).size
      };
    });

    // Calculate duplicate rows
    const duplicateRows = data.length - new Set(data.map(row => JSON.stringify(row))).size;

    // Calculate scores
    const totalCells = data.length * columns.length;
    const completenessScore = totalCells > 0 ? ((totalCells - totalMissing) / totalCells) * 100 : 0;
    const qualityScore = Math.max(0, completenessScore - (duplicateRows / data.length) * 10);

    return {
      totalRows: data.length,
      totalColumns: columns.length,
      missingValues: totalMissing,
      duplicateRows,
      dataTypes,
      completenessScore,
      qualityScore,
      columnQuality
    };
  }, [data, columns]);

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getQualityBadge = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 70) return { label: 'Good', color: 'bg-yellow-500' };
    if (score >= 50) return { label: 'Fair', color: 'bg-orange-500' };
    return { label: 'Poor', color: 'bg-red-500' };
  };
  if (qualityMetrics.totalRows === 0) {
    return (
      <div className="glass-card-3d p-6">
        <div className="text-center text-gray-400 py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg">
            📊
          </div>
          <p className="text-sm text-white/80">Upload data to see quality analysis</p>
        </div>
      </div>
    );
  }
  const badge = getQualityBadge(qualityMetrics.qualityScore);
  return (
    <div className="glass-card-3d p-6 space-y-6">
      {/* Highlight lines */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
      <div className="absolute top-0 right-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500/40 to-teal-500/40 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm">
            🔍
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Data Quality Analysis
            </h3>
            <p className="text-white/70 text-sm">Comprehensive data validation</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-lg border border-white/20 backdrop-blur-sm ${badge.color}`}>
          {badge.label}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card-3d p-4 bg-gradient-to-br from-black/30 to-black/10">
          <div className="text-white/60 text-xs mb-2 font-medium">Overall Quality</div>
          <div className={`text-xl font-bold ${getQualityColor(qualityMetrics.qualityScore)} drop-shadow-lg`}>
            {qualityMetrics.qualityScore.toFixed(1)}%
          </div>
        </div>
        <div className="glass-card-3d p-4 bg-gradient-to-br from-black/30 to-black/10">
          <div className="text-white/60 text-xs mb-2 font-medium">Completeness</div>
          <div className={`text-xl font-bold ${getQualityColor(qualityMetrics.completenessScore)} drop-shadow-lg`}>
            {qualityMetrics.completenessScore.toFixed(1)}%
          </div>
        </div>
        <div className="glass-card-3d p-4 bg-gradient-to-br from-black/30 to-black/10">
          <div className="text-white/60 text-xs mb-2 font-medium">Missing Values</div>
          <div className="text-xl font-bold text-white drop-shadow-lg">
            {qualityMetrics.missingValues}
          </div>
        </div>
        <div className="glass-card-3d p-4 bg-gradient-to-br from-black/30 to-black/10">
          <div className="text-white/60 text-xs mb-2 font-medium">Duplicate Rows</div>
          <div className="text-xl font-bold text-white drop-shadow-lg">
            {qualityMetrics.duplicateRows}
          </div>
        </div>
      </div>

      {/* Column Quality Details */}
      <div className="space-y-3">
        <h4 className="text-white text-sm font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Column Quality
        </h4>
        <div className="glass-card-3d p-3 bg-gradient-to-br from-black/20 to-black/5 max-h-40 overflow-y-auto space-y-2">
          {qualityMetrics.columnQuality.map((col, index) => (
            <div key={index} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2 border border-white/10 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <span className="text-white text-xs font-medium">{col.column}</span>
                <span className="text-white/60 text-xs bg-white/10 px-2 py-1 rounded-md">
                  {col.dataType}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-white/70 text-xs">
                  {col.uniqueValues} unique
                </span>
                {col.missingPercentage > 0 && (
                  <span className={`text-xs px-2 py-1 rounded-md ${col.missingPercentage > 20 ? 'text-red-300 bg-red-500/20' : 'text-yellow-300 bg-yellow-500/20'}`}>
                    {col.missingPercentage.toFixed(1)}% missing
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quality Recommendations */}
      {qualityMetrics.qualityScore < 80 && (
        <div className="glass-card-3d p-4 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-400/30">
          <div className="text-yellow-300 text-sm font-medium mb-3 flex items-center space-x-2">
            <span>💡</span>
            <span>Quality Recommendations</span>
          </div>
          <ul className="text-yellow-100/90 text-sm space-y-2">
            {qualityMetrics.duplicateRows > 0 && (
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Remove {qualityMetrics.duplicateRows} duplicate rows</span>
              </li>
            )}
            {qualityMetrics.missingValues > 0 && (
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Address {qualityMetrics.missingValues} missing values</span>
              </li>
            )}
            {qualityMetrics.columnQuality.some(col => col.missingPercentage > 50) && (
              <li className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>Consider removing columns with &gt;50% missing data</span>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
