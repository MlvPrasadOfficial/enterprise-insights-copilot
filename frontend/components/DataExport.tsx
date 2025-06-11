"use client";
import React, { useState, useCallback } from 'react';

interface DataExportProps {
  data: any[];
  columns: string[];
  originalFileName: string;
  onExportStart?: () => void;
  onExportComplete?: () => void;
  disabled?: boolean;
}

export default function DataExport({ 
  data, 
  columns, 
  originalFileName, 
  onExportStart, 
  onExportComplete,
  disabled = false 
}: DataExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx'>('csv');
  const [exportOptions, setExportOptions] = useState({
    includeHeaders: true,
    includeIndex: false,
    selectedColumns: columns,
    filterEmpty: false,
    dateFormat: 'ISO'
  });

  // Generate filename based on format and original name
  const generateFileName = useCallback((format: string) => {
    const baseName = originalFileName.replace(/\.[^/.]+$/, '') || 'data_export';
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    return `${baseName}_export_${timestamp}.${format}`;
  }, [originalFileName]);

  // Export as CSV
  const exportAsCSV = useCallback(() => {
    const filteredData = exportOptions.filterEmpty 
      ? data.filter(row => exportOptions.selectedColumns.some(col => row[col] !== null && row[col] !== undefined && row[col] !== ''))
      : data;

    let csvContent = '';
    
    // Add headers if enabled
    if (exportOptions.includeHeaders) {
      const headers = exportOptions.includeIndex 
        ? ['Index', ...exportOptions.selectedColumns]
        : exportOptions.selectedColumns;
      csvContent += headers.map(header => `"${header}"`).join(',') + '\n';
    }

    // Add data rows
    filteredData.forEach((row, index) => {
      const rowData = exportOptions.selectedColumns.map(col => {
        let value = row[col];
        
        // Handle different data types
        if (value === null || value === undefined) {
          value = '';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains comma
          value = value.includes(',') || value.includes('"') || value.includes('\n') 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        } else if (value instanceof Date) {
          value = exportOptions.dateFormat === 'ISO' ? value.toISOString() : value.toLocaleDateString();
        } else {
          value = String(value);
        }
        
        return value;
      });

      if (exportOptions.includeIndex) {
        rowData.unshift(String(index + 1));
      }

      csvContent += rowData.join(',') + '\n';
    });

    return csvContent;
  }, [data, exportOptions]);

  // Export as JSON
  const exportAsJSON = useCallback(() => {
    const filteredData = exportOptions.filterEmpty 
      ? data.filter(row => exportOptions.selectedColumns.some(col => row[col] !== null && row[col] !== undefined && row[col] !== ''))
      : data;

    const jsonData = filteredData.map((row, index) => {
      const exportRow: any = {};
      
      if (exportOptions.includeIndex) {
        exportRow.index = index + 1;
      }

      exportOptions.selectedColumns.forEach(col => {
        exportRow[col] = row[col];
      });

      return exportRow;
    });

    return JSON.stringify(jsonData, null, 2);
  }, [data, exportOptions]);

  // Trigger download
  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // Handle export
  const handleExport = useCallback(async () => {
    if (!data || data.length === 0 || isExporting || disabled) return;

    setIsExporting(true);
    onExportStart?.();

    try {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing

      let content: string;
      let mimeType: string;
      let filename: string;

      switch (exportFormat) {
        case 'csv':
          content = exportAsCSV();
          mimeType = 'text/csv;charset=utf-8;';
          filename = generateFileName('csv');
          break;
        case 'json':
          content = exportAsJSON();
          mimeType = 'application/json;charset=utf-8;';
          filename = generateFileName('json');
          break;
        case 'xlsx':
          // For now, export as CSV with .xlsx extension (would need a library like xlsx for real XLSX)
          content = exportAsCSV();
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;';
          filename = generateFileName('xlsx');
          break;
        default:
          throw new Error('Unsupported export format');
      }

      downloadFile(content, filename, mimeType);
      onExportComplete?.();

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }, [data, exportFormat, exportAsCSV, exportAsJSON, generateFileName, downloadFile, isExporting, disabled, onExportStart, onExportComplete]);

  // Handle column selection
  const toggleColumn = useCallback((column: string) => {
    setExportOptions(prev => ({
      ...prev,
      selectedColumns: prev.selectedColumns.includes(column)
        ? prev.selectedColumns.filter(col => col !== column)
        : [...prev.selectedColumns, column]
    }));
  }, []);
  if (!data || data.length === 0) {
    return (
      <div className="glass-card-3d p-6">
        <div className="text-center text-gray-400 py-8">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl mx-auto mb-4 flex items-center justify-center text-3xl shadow-lg">
            📤
          </div>
          <p className="text-sm text-white/80">Upload data to enable export options</p>
        </div>
      </div>
    );
  }
  return (
    <div className="glass-card-3d p-6 space-y-6">
      {/* Highlight lines */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
      <div className="absolute top-0 right-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm">
            📤
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Export Data
            </h3>
            <p className="text-white/70 text-sm">Configure export settings</p>
          </div>
        </div>
        <div className="glass-card-3d px-3 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
          <div className="text-white/90 text-xs font-medium">
            {data.length} rows • {exportOptions.selectedColumns.length}/{columns.length} columns
          </div>
        </div>
      </div>

      {/* Export Format Selection */}
      <div className="space-y-3">
        <label className="text-white text-sm font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Export Format
        </label>
        <div className="flex gap-3">
          {(['csv', 'json', 'xlsx'] as const).map(format => (
            <button
              key={format}
              onClick={() => setExportFormat(format)}
              className={`button-glossy-3d px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                exportFormat === format
                  ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white shadow-lg shadow-purple-500/25 border-purple-400/30'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
              }`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="space-y-3">
        <label className="text-white text-sm font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          Options
        </label>
        
        <div className="grid grid-cols-1 gap-3">
          <label className="flex items-center space-x-3 text-sm bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.includeHeaders}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeHeaders: e.target.checked }))}
              className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-white/90 font-medium">Include headers</span>
          </label>
          
          <label className="flex items-center space-x-3 text-sm bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.includeIndex}
              onChange={(e) => setExportOptions(prev => ({ ...prev, includeIndex: e.target.checked }))}
              className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-white/90 font-medium">Include row numbers</span>
          </label>
          
          <label className="flex items-center space-x-3 text-sm bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer">
            <input
              type="checkbox"
              checked={exportOptions.filterEmpty}
              onChange={(e) => setExportOptions(prev => ({ ...prev, filterEmpty: e.target.checked }))}
              className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
            />
            <span className="text-white/90 font-medium">Filter empty rows</span>
          </label>
        </div>
      </div>

      {/* Column Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-white text-sm font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Columns to Export
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setExportOptions(prev => ({ ...prev, selectedColumns: [...columns] }))}
              className="text-xs text-purple-300 hover:text-purple-200 font-medium px-2 py-1 rounded-md bg-purple-500/20 border border-purple-400/30 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={() => setExportOptions(prev => ({ ...prev, selectedColumns: [] }))}
              className="text-xs text-pink-300 hover:text-pink-200 font-medium px-2 py-1 rounded-md bg-pink-500/20 border border-pink-400/30 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="glass-card-3d p-3 bg-gradient-to-br from-black/20 to-black/5 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {columns.map(column => (
              <label key={column} className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white/5 p-2 rounded-md transition-colors">
                <input
                  type="checkbox"
                  checked={exportOptions.selectedColumns.includes(column)}
                  onChange={() => toggleColumn(column)}
                  className="w-4 h-4 text-purple-600 bg-white/20 border-white/30 rounded focus:ring-purple-500 focus:ring-2"
                />
                <span className="text-white/90 truncate font-medium">{column}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={isExporting || disabled || exportOptions.selectedColumns.length === 0}
        className={`button-glossy-3d w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 ${
          isExporting || disabled || exportOptions.selectedColumns.length === 0
            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed border-gray-500/30'
            : 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white hover:shadow-lg hover:shadow-purple-500/25 border-purple-400/30 hover:scale-[1.02]'
        }`}
      >
        {isExporting ? (
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            <span>Exporting...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl">📤</span>
            <span>Export as {exportFormat.toUpperCase()}</span>
          </div>
        )}
      </button>

      {/* Preview Info */}
      <div className="glass-card-3d p-3 bg-gradient-to-br from-white/5 to-white/2 text-center">
        <div className="text-sm text-white/70 font-medium">
          Export will include <span className="text-white font-bold">{exportOptions.selectedColumns.length}</span> columns and <span className="text-white font-bold">{data.length}</span> rows
          {exportOptions.filterEmpty && <span className="text-purple-300"> (after filtering empty rows)</span>}
        </div>
      </div>
    </div>
  );
}
