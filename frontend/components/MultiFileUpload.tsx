"use client";
import React, { useState, useRef, useCallback } from 'react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  data: any[];
  columns: string[];
  uploadTime: Date;
  status: 'processing' | 'completed' | 'error';
  errorMessage?: string;
}

interface MultiFileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onFileSelected: (file: UploadedFile) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export default function MultiFileUpload({ 
  onFilesUploaded, 
  onFileSelected, 
  disabled = false,
  maxFiles = 5 
}: MultiFileUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Parse CSV content
  const parseCSV = useCallback((content: string): { data: any[]; columns: string[] } => {
    const lines = content.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('Empty CSV file');
    }

    const headers = lines[0].split(',').map(header => header.trim().replace(/['"]/g, ''));
    const data: any[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        const values = line.split(',').map(value => value.trim().replace(/['"]/g, ''));
        const row: any = {};
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          row[header] = isNaN(Number(value)) || value === '' ? value : Number(value);
        });
        
        data.push(row);
      }
    }

    return { data, columns: headers };
  }, []);

  // Process a single file
  const processFile = useCallback(async (file: File): Promise<UploadedFile> => {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create initial file entry
    const uploadedFile: UploadedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      data: [],
      columns: [],
      uploadTime: new Date(),
      status: 'processing'
    };

    try {
      // Validate file
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Only CSV files are supported');
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('File size must be less than 10MB');
      }

      // Read file content
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

      // Parse CSV
      const { data, columns } = parseCSV(content);

      if (data.length === 0) {
        throw new Error('No data rows found in CSV file');
      }

      uploadedFile.data = data;
      uploadedFile.columns = columns;
      uploadedFile.status = 'completed';

    } catch (error) {
      uploadedFile.status = 'error';
      uploadedFile.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    return uploadedFile;
  }, [parseCSV]);

  // Handle multiple file upload
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (disabled || uploading) return;

    const fileArray = Array.from(files);
    
    // Check file count limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - uploadedFiles.length} more files.`);
      return;
    }

    setUploading(true);

    try {
      const processedFiles: UploadedFile[] = [];
      
      // Process files sequentially to avoid overwhelming the browser
      for (const file of fileArray) {
        const processedFile = await processFile(file);
        processedFiles.push(processedFile);
        
        // Update state after each file
        setUploadedFiles(prev => {
          const updated = [...prev, processedFile];
          return updated;
        });
      }

      // Notify parent component
      onFilesUploaded(processedFiles);

      // Auto-select the first successfully uploaded file
      const firstSuccessful = processedFiles.find(f => f.status === 'completed');
      if (firstSuccessful && !activeFileId) {
        setActiveFileId(firstSuccessful.id);
        onFileSelected(firstSuccessful);
      }

    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      
      // Reset file input
      if (fileRef.current) {
        fileRef.current.value = '';
      }
    }
  }, [disabled, uploading, uploadedFiles.length, maxFiles, processFile, onFilesUploaded, activeFileId, onFileSelected]);

  // Handle file input change
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // Handle drag and drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  }, [disabled, uploading, handleFileUpload]);

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

  // Handle file selection
  const handleFileSelect = useCallback((file: UploadedFile) => {
    if (file.status === 'completed') {
      setActiveFileId(file.id);
      onFileSelected(file);
    }
  }, [onFileSelected]);

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    
    if (activeFileId === fileId) {
      const remaining = uploadedFiles.filter(f => f.id !== fileId && f.status === 'completed');
      if (remaining.length > 0) {
        setActiveFileId(remaining[0].id);
        onFileSelected(remaining[0]);
      } else {
        setActiveFileId(null);
      }
    }
  }, [activeFileId, uploadedFiles, onFileSelected]);

  // Format file size
  const formatFileSize = useCallback((bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);
  return (
    <div className="glass-card-3d p-6 space-y-6">
      {/* Highlight lines */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      <div className="absolute top-0 left-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
      <div className="absolute top-0 right-0 w-px h-6 bg-gradient-to-b from-white/30 to-transparent"></div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500/40 to-red-500/40 rounded-2xl flex items-center justify-center shadow-lg border border-white/20 backdrop-blur-sm">
            📂
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Multi-File Upload
            </h3>
            <p className="text-white/70 text-sm">Upload multiple CSV files</p>
          </div>
        </div>
        <div className="glass-card-3d px-3 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20">
          <div className="text-white/90 text-sm font-medium">
            {uploadedFiles.length}/{maxFiles} files
          </div>
        </div>
      </div>

      {/* Enhanced Upload Area */}
      <div 
        className={`glass-card-3d relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
          dragActive 
            ? 'border-blue-400/70 bg-gradient-to-br from-blue-500/30 to-cyan-500/20 shadow-lg shadow-blue-500/20' 
            : 'border-white/30 bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:border-white/50 hover:shadow-lg hover:shadow-orange-500/20'
        } ${disabled || uploading || uploadedFiles.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && uploadedFiles.length < maxFiles && fileRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="text-6xl transition-transform duration-300 hover:scale-110 drop-shadow-lg">
            {uploading ? '⏳' : dragActive ? '📥' : '📂'}
          </div>
          <div>
            <p className="text-white font-semibold text-lg mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {uploading 
                ? 'Processing files...' 
                : uploadedFiles.length >= maxFiles
                  ? `Maximum ${maxFiles} files reached`
                  : dragActive 
                    ? 'Drop CSV files here' 
                    : 'Drag & drop CSV files or click to browse'
              }
            </p>
            <p className="text-white/70 text-sm font-medium">
              {uploadedFiles.length < maxFiles && `${maxFiles - uploadedFiles.length} more files allowed`}
            </p>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          multiple
          onChange={handleFileChange}
          disabled={disabled || uploading || uploadedFiles.length >= maxFiles}
          className="hidden"
        />
      </div>

      {/* Enhanced Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white text-sm font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            Uploaded Files
          </h4>
          <div className="glass-card-3d p-3 bg-gradient-to-br from-black/20 to-black/5 max-h-48 overflow-y-auto space-y-2">
            {uploadedFiles.map((file) => (
              <div 
                key={file.id}
                className={`glass-card-3d flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                  activeFileId === file.id 
                    ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-400/50 shadow-lg shadow-blue-500/10' 
                    : 'bg-gradient-to-br from-white/5 to-white/2 hover:bg-gradient-to-br hover:from-white/10 hover:to-white/5'
                } ${file.status === 'error' ? 'border-l-4 border-red-500' : ''}`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center border border-white/30 text-xl">
                  {file.status === 'processing' ? '⏳' : 
                   file.status === 'error' ? '❌' : '📄'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-white text-sm font-medium truncate">
                      {file.name}
                    </span>
                    {activeFileId === file.id && (
                      <div className="px-3 py-1 bg-blue-500/30 text-blue-200 text-xs rounded-full border border-blue-400/40 font-medium">
                        Active
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-white/70 font-medium">
                    {formatFileSize(file.size)}
                    {file.status === 'completed' && ` • ${file.data.length} rows, ${file.columns.length} columns`}
                    {file.status === 'processing' && ' • Processing...'}
                    {file.status === 'error' && ` • Error: ${file.errorMessage}`}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(file.id);
                  }}
                  className="w-8 h-8 bg-red-500/20 text-red-300 hover:text-red-200 hover:bg-red-500/30 rounded-lg border border-red-400/30 transition-colors flex items-center justify-center"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Instructions */}
      <div className="glass-card-3d p-4 bg-gradient-to-br from-white/5 to-white/2">
        <div className="text-sm text-white/80 space-y-2 font-medium">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
            <p>Multiple CSV files supported (max {maxFiles})</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span>
            <p>Maximum file size: 10MB per file</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            <p>Click on a file to make it active for analysis</p>
          </div>
        </div>
      </div>
    </div>
  );
}
