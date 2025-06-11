"use client";
import { useRef, useState, useCallback } from "react";
import React from "react";

// Enhanced logging utility
const logger = {
  info: (message: string, data?: any) => {
    console.log(`[UPLOAD-INFO] ${new Date().toISOString()} - ${message}`, data ? data : '');
  },
  error: (message: string, error?: any) => {
    console.error(`[UPLOAD-ERROR] ${new Date().toISOString()} - ${message}`, error ? error : '');
  },
  debug: (message: string, data?: any) => {
    console.debug(`[UPLOAD-DEBUG] ${new Date().toISOString()} - ${message}`, data ? data : '');
  },
  warn: (message: string, data?: any) => {
    console.warn(`[UPLOAD-WARN] ${new Date().toISOString()} - ${message}`, data ? data : '');
  }
};

interface CSVUploadProps {
  onFileUpload: (fileName: string, data: any[], columns: string[]) => void;
  disabled?: boolean;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

export default function CSVUpload({ onFileUpload, disabled = false, onUploadStart, onUploadComplete }: CSVUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'reading' | 'parsing' | 'complete' | 'error'>('idle');
  const [dragActive, setDragActive] = useState(false);

  // Parse CSV file content
  const parseCSV = useCallback((content: string): { data: any[]; columns: string[] } => {
    logger.debug("Starting CSV parsing", { contentLength: content.length });
    
    const lines = content.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('Empty CSV file');
    }

    // Parse header row
    const headers = lines[0].split(',').map(header => header.trim().replace(/['"]/g, ''));
    logger.debug("CSV headers parsed", { headers, headerCount: headers.length });

    // Parse data rows
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',').map(value => value.trim().replace(/['"]/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          // Try to parse as number, otherwise keep as string
          row[header] = isNaN(Number(value)) || value === '' ? value : Number(value);
        });
        
        data.push(row);
      }
    }

    logger.info("CSV parsing completed", { 
      totalRows: data.length, 
      columns: headers,
      sampleRow: data[0] 
    });

    return { data, columns: headers };
  }, []);
  // Handle file selection and processing
  const handleFileProcessing = useCallback(async (file: File) => {
    if (!file) {
      logger.warn("No file provided for processing");
      return;
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      logger.error("Invalid file type", { fileName: file.name, fileType: file.type });
      setUploadStatus('error');
      alert('Please select a CSV file (.csv extension required)');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      logger.error("File too large", { fileName: file.name, fileSize: file.size, maxSize });
      setUploadStatus('error');
      alert('File size must be less than 10MB');
      return;
    }

    logger.info("Starting file processing", { 
      fileName: file.name, 
      fileSize: file.size,
      fileType: file.type 
    });

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('reading');
    onUploadStart?.();

    try {
      // Simulate progress for reading file
      setUploadProgress(20);
      await new Promise(resolve => setTimeout(resolve, 300));

      // Read file content
      setUploadStatus('reading');
      setUploadProgress(40);
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            resolve(result);
          } else {
            reject(new Error('Failed to read file as text'));
          }
        };
        reader.onerror = () => reject(new Error('File reading failed'));
        reader.readAsText(file);
      });

      // Simulate progress for parsing
      setUploadStatus('parsing');
      setUploadProgress(70);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Parse CSV content
      const { data, columns } = parseCSV(content);

      // Validate parsed data
      if (data.length === 0) {
        throw new Error('No data rows found in CSV file');
      }

      if (columns.length === 0) {
        throw new Error('No columns found in CSV file');
      }

      setUploadProgress(90);
      await new Promise(resolve => setTimeout(resolve, 200));

      setUploadStatus('complete');
      setUploadProgress(100);

      logger.info("File processing successful", {
        fileName: file.name,
        rowCount: data.length,
        columnCount: columns.length,
        columns: columns
      });

      // Call the callback with processed data
      onFileUpload(file.name, data, columns);
      onUploadComplete?.();

      // Reset after success
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 1000);

    } catch (error) {
      logger.error("File processing failed", error);
      setUploadStatus('error');
      alert(`Failed to process CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Reset on error
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);
    } finally {
      setUploading(false);
      
      // Reset file input
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }, [parseCSV, onFileUpload, onUploadStart, onUploadComplete]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcessing(file);
    }
  }, [handleFileProcessing]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) {
      logger.warn("Drop ignored - component disabled or uploading");
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    logger.debug("Files dropped", { fileCount: files.length });

    if (files.length > 0) {
      const file = files[0];
      handleFileProcessing(file);
    }
  }, [disabled, uploading, handleFileProcessing]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setDragActive(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  // Handle click to open file dialog
  const handleClick = useCallback(() => {
    if (!disabled && !uploading) {
      fileRef.current?.click();
    }
  }, [disabled, uploading]);
  return (
    <div className="w-full">
      {/* Enhanced Drag and drop area */}
      <div 
        className={`glass-card-3d relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group ${
          dragActive 
            ? 'border-blue-400/70 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 shadow-lg shadow-blue-500/20' 
            : 'border-white/30 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 hover:border-white/50 hover:shadow-lg hover:shadow-indigo-500/20'
        } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        {/* Highlight lines */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
        
        <div className="space-y-6">
          {/* Enhanced Upload icon */}
          <div className={`text-6xl transition-all duration-500 ${!disabled && !uploading ? 'group-hover:scale-110 group-hover:rotate-3' : ''} drop-shadow-lg`}>
            {uploading ? '⏳' : dragActive ? '📥' : '📄'}
          </div>
            
          {/* Enhanced Upload text */}
          <div>
            <p className="text-white font-semibold mb-4 text-xl bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {uploadStatus === 'reading' ? 'Reading CSV file...' :
               uploadStatus === 'parsing' ? 'Parsing data...' :
               uploadStatus === 'complete' ? 'Upload complete!' :
               uploadStatus === 'error' ? 'Upload failed!' :
               uploading 
                ? 'Processing CSV file...' 
                : dragActive 
                  ? 'Drop CSV file here' 
                  : 'Drag & drop CSV file or click to browse'
              }
            </p>
            
            {/* Enhanced Progress bar */}
            {uploading && (
              <div className="mb-6">
                <div className="w-full bg-black/30 rounded-full h-3 mb-3 border border-white/20">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-200 text-center font-medium">{uploadProgress}%</p>
              </div>
            )}
            
            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={disabled || uploading}
              className="hidden"
            />
            
            {/* Enhanced Browse button */}
            {!uploading && uploadStatus !== 'complete' && (
              <button 
                type="button"
                disabled={disabled}
                className={`button-glossy-3d px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg ${
                  disabled 
                    ? 'bg-gray-600/50 border-gray-500/30 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:shadow-lg hover:shadow-indigo-500/25 text-white border-indigo-400/30 hover:scale-[1.02]'
                }`}
              >
                Choose CSV File
              </button>
            )}

            {/* Enhanced Success indicator */}
            {uploadStatus === 'complete' && (
              <div className="flex items-center justify-center space-x-3 text-green-300 bg-green-500/20 px-6 py-3 rounded-xl border border-green-400/30">
                <span className="text-3xl">✅</span>
                <span className="font-semibold text-lg">Upload Complete!</span>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Upload progress indicator */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/60 to-purple-900/60 rounded-2xl backdrop-blur-md">
            <div className="flex items-center space-x-4 text-white">
              <div className="animate-spin h-8 w-8 border-3 border-white border-t-transparent rounded-full shadow-lg"></div>
              <span className="font-semibold text-lg">Processing CSV...</span>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced File requirements */}
      <div className="mt-6 glass-card-3d p-4 bg-gradient-to-br from-white/5 to-white/2">
        <div className="text-sm text-white/80 text-center space-y-2 font-medium">
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-indigo-400 rounded-full"></span>
            <p>Supported format: CSV (.csv)</p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            <p>Maximum file size: 10MB</p>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
            <p>First row should contain column headers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
