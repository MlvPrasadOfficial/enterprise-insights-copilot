"use client";
import { useState } from "react";

export default function UploadSimple() {
  const [msg, setMsg] = useState("");

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Data File</h3>
        
        {/* Simple file input */}
        <div className="bg-indigo-600/40 backdrop-blur-sm border-2 border-dashed border-indigo-400/50 rounded-xl p-8 text-center hover:border-indigo-300/60 transition-colors">
          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            <div>
              <p className="text-indigo-200 mb-2">Choose CSV file to upload</p>
              <input
                type="file"
                accept=".csv"
                className="block w-full text-sm text-indigo-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-500 file:text-white hover:file:bg-indigo-400"
              />
            </div>
          </div>
        </div>
        
        {msg && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg text-green-200 text-sm">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
