"use client";
import { useRef, useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Upload() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setMsg("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${API_URL}/upload`, formData, {
        headers: {"Content-Type": "multipart/form-data"}
      });
      setMsg("Upload successful! Indexing...");
      // Automatically index after upload
      const indexForm = new FormData();
      indexForm.append("file", file);
      const indexRes = await axios.post(`${API_URL}/api/v1/index`, indexForm, {
        headers: {"Content-Type": "multipart/form-data"}
      });
      // TypeScript fix: treat indexRes.data as any
      const indexData: any = indexRes.data;
      if (indexData && indexData.status === "success") {
        setMsg(`Upload and indexing successful! Rows indexed: ${indexData.rows_indexed}`);
      } else {
        setMsg("Upload successful, but indexing failed.");
      }
    } catch (err: any) {
      let detail = "Upload or indexing failed.";
      if (err.response && err.response.data && err.response.data.detail) {
        detail += ` ${err.response.data.detail}`;
      }
      setMsg(detail);
      // Log error for debugging
      console.error("Upload/index error:", err);
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (msg && !msg.includes('successful')) {
      const debugDiv = document.getElementById('upload-debug');
      if (debugDiv) debugDiv.textContent = 'Check browser console and Network tab for details.';
    }
  }, [msg]);

  return (
    <div className="max-w-xl mx-auto p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl mt-4 flex flex-col items-center">
      <input type="file" accept=".csv,.xlsx" ref={fileRef} onChange={handleUpload} className="mb-2" />
      {uploading ? (
        <div className="text-yellow-400 animate-pulse">Uploading...</div>
      ) : msg && (
        <div className={msg.includes('successful') ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
          {msg}
        </div>
      )}
      <div id="upload-debug" className="mt-2 text-xs text-gray-400"></div>
    </div>
  );
}
