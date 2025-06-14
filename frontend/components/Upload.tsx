"use client";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Upload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<{ columns: string[]; rows: any[] } | null>(null);
  
  // Main upload handler for file input change
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Start the upload process
    await processUpload(file);
  };
  
  // Process the actual upload with the given file
  const processUpload = async (file: File) => {
    setUploading(true);
    setMsg("");
    setPreview(null);
    
    // Set a visual timeout indicator for user feedback if upload takes too long
    const uploadTimeout = setTimeout(() => {
      if (uploading) {
        setMsg("Upload is taking longer than expected. Please wait...");
      }
    }, 5000);
    
    try {
      // Create form data for the file
      const formData = new FormData();
      formData.append("file", file);
        // Upload the file to the API
      const response = await axios.post(`${API_URL}/api/v1/index`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
        // Handle successful upload
      if (response.status === 200) {
        const data = response.data as any;
        setMsg(`File ${file.name} uploaded successfully! ${data.rows_indexed} rows indexed.`);
        
        // If there's preview data, set it
        if (data.preview && Array.isArray(data.preview.rows)) {
          setPreview({
            columns: data.preview.columns || [],
            rows: data.preview.rows || [],
          });
        }
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setMsg(
        `Error uploading file: ${
          error.response?.data?.detail || error.message || "Unknown error"
        }`
      );
    } finally {
      clearTimeout(uploadTimeout);
      setUploading(false);
    }
  };
  
  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processUpload(file);
    }
  };
  
  // Reset the file input when error occurs
  useEffect(() => {
    if (msg && msg.includes("Error")) {
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }, [msg]);

  return (
    <div className="my-6 w-full">
      {/* File upload box */}
      <div 
        className={`relative flex flex-col items-center justify-center w-full p-10 transition-all duration-300 border-2 border-dashed rounded-2xl text-center bg-indigo-600/40 backdrop-blur-sm border-indigo-400/50 ${
          uploading ? "opacity-50" : "opacity-100"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Upload icon */}
        <div className="mb-4">
          <div className="w-16 h-16 bg-indigo-600/60 rounded-2xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
        </div>

        {/* Upload text and input */}
        <h5 className="text-lg font-semibold text-white mb-2">Upload CSV or Drag & Drop</h5>
        <p className="text-sm text-gray-300 mb-4 max-w-sm">
          Upload your data CSV file to analyze with Enterprise Insights Copilot
        </p>

        <input
          type="file"
          accept=".csv"
          onChange={handleUpload}
          className="hidden"
          ref={fileRef}
          disabled={uploading}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Select CSV File"}
        </button>

        {/* File upload status */}
        {uploading && (
          <div className="mt-4 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span className="text-white text-sm">Uploading...</span>
          </div>
        )}

        {/* Rows indexed indicator */}
        {preview && (
          <div className="mt-4 px-3 py-1 bg-indigo-500/20 rounded-lg">
            <p className="text-indigo-200 text-sm font-medium flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Rows indexed: {preview.rows.length}</span>
            </p>
          </div>
        )}
      </div>

      {/* Error/success message */}
      {msg && (
        <div className="mt-4">
          <div className={`px-4 py-3 rounded-lg text-sm border ${
            msg.includes("success") 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : "bg-red-500/10 border-red-500/20"
          }`}>
            <p className={`${
              msg.includes("success") ? "text-emerald-200" : "text-red-200"
            }`}>
              {msg}
            </p>
            {!msg.includes("successful") && fileRef.current?.files?.[0] && (
              <button 
                onClick={() => processUpload(fileRef.current!.files![0])}
                className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Retry Upload
              </button>
            )}
          </div>
        </div>
      )}

      {/* Data Preview Table */}
      {preview && preview.columns && preview.rows && preview.rows.length > 0 && (
        <div className="mt-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-white">Data Preview</h4>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-200 rounded-lg text-sm font-medium">
              {preview.rows.length} rows shown
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {preview.columns.map((col: string) => (
                    <th key={col} className="py-2 px-4 text-left text-white font-medium text-sm">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                    {preview.columns.map((col: string) => (
                      <td key={col} className="py-3 px-4 text-white/80 text-sm">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
