"use client";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import React from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Upload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [preview, setPreview] = useState<{ columns: string[]; rows: any[] } | null>(null);  // Main upload handler for file input change
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
    }, 10000); // Show message after 10 seconds
    
    // Setup to handle page unload during upload
    const beforeUnloadListener = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "Upload in progress. Are you sure you want to leave?";
      return "Upload in progress. Are you sure you want to leave?";
    };
    
    // Add beforeunload event listener
    window.addEventListener('beforeunload', beforeUnloadListener);
    
    try {
      // Step 1: Upload the file
      const formData = new FormData();
      formData.append("file", file);
      
      await axios.post(`${API_URL}/upload`, formData, {
        headers: {"Content-Type": "multipart/form-data"},
        timeout: 30000 // 30 seconds timeout for initial upload
      });
      
      setMsg("Upload successful! Indexing data...");
      
      // Step 2: Index the uploaded file
      const indexForm = new FormData();
      indexForm.append("file", file);
      
      const indexRes = await axios.post(`${API_URL}/api/v1/index`, indexForm, {
        headers: {"Content-Type": "multipart/form-data"},
        timeout: 60000 // 60 seconds timeout for indexing (can be longer)
      });
      
      const indexData: any = indexRes.data;
      if (indexData && indexData.status === "success") {
        setMsg(`Upload and indexing successful! Rows indexed: ${indexData.rows_indexed}`);
        if (indexData.preview && indexData.preview.columns && indexData.preview.rows) {
          setPreview(indexData.preview);
        }
      } else {
        setMsg("Upload successful, but indexing failed. Please try again.");
      }
    } catch (err: any) {
      let detail = "Upload or indexing failed.";
      
      if (err.code === 'ECONNABORTED') {
        detail = "Request timed out. The file may be too large or the server is busy.";
      } else if (err.message && err.message.includes('Network Error')) {
        detail = "Network error. Please check your connection and try again.";
      } else if (err.response) {
        if (err.response.status === 413) {
          detail = "File too large. Please upload a smaller file.";
        } else if (err.response.data && err.response.data.detail) {
          detail += ` ${err.response.data.detail}`;
        }
      }
      
      setMsg(detail);
      setPreview(null);
      console.error("Upload/index error:", err);
    } finally {
      if (uploadTimeout) {
        clearTimeout(uploadTimeout);
      }
      setUploading(false);
      // Remove event listener
      window.removeEventListener('beforeunload', beforeUnloadListener);    }
  };

  useEffect(() => {
    if (msg && !msg.includes('successful')) {
      const debugDiv = document.getElementById('upload-debug');
      if (debugDiv) debugDiv.textContent = 'Check browser console and Network tab for details.';
    }
  }, [msg]);
  return (
    <div className="max-w-xl mx-auto p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl mt-4 flex flex-col items-center">
      <p className="text-sm text-gray-600 mb-2">Upload CSV files (max 10MB)</p>
      <input type="file" accept=".csv,.xlsx" ref={fileRef} onChange={handleUpload} className="mb-2" />{uploading ? (
        <div className="flex flex-col items-center space-y-2">
          <div className="text-yellow-400">
            <div className="flex items-center space-x-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="animate-pulse font-medium">Uploading and processing data...</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">Please do not close this window</div>
        </div>
      ) : (
        <div className="my-2">
          {msg && (
            <div className={msg.includes("successful") ? "text-green-500 font-bold" : "text-red-500 font-bold mb-2"}>
              {msg}
            </div>
          )}
          {msg && !msg.includes("successful") && fileRef.current?.files?.[0] && (
            <button 
              onClick={() => processUpload(fileRef.current!.files![0])}
              className="mt-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            >
              Retry Upload
            </button>
          )}
        </div>
      )}
      <div id="upload-debug" className="mt-2 text-xs text-gray-400"></div>      {preview && preview.columns && preview.rows && preview.rows.length > 0 && (
        <div className="w-full overflow-x-auto mt-4">
          <div className="font-semibold mb-2 text-center">Preview (first {preview.rows.length} rows):</div>
          <table className="min-w-full border text-xs mb-4">
            <thead>
              <tr>
                {preview.columns.map((col) => (
                  <th key={col} className="border px-2 py-1 bg-zinc-100 dark:bg-zinc-800">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.rows.map((row, i) => (
                <tr key={i}>
                  {preview.columns.map((col) => (
                    <td key={col} className="border px-2 py-1">{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
