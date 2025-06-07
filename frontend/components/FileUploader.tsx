import React, { useRef } from "react";
import Papa from "papaparse";

interface FileUploaderProps {
  onUpload: (data: any[], file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          onUpload(results.data as any[], file);
        },
      });
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6 shadow-md border border-white/10">
      <label className="block font-bold text-white mb-2 text-lg">
        Upload CSV or Reference File
      </label>
      <label className="w-full cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-xl p-6 bg-background/60 hover:bg-primary/10 transition">
        <span className="text-primary font-semibold mb-2">Choose File</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.txt,.pdf,.md"
          className="hidden"
          onChange={handleFileChange}
        />
        <span className="text-xs text-gray-400 mt-1">
          CSV, TXT, PDF, or MD
        </span>
      </label>
    </div>
  );
};

export default FileUploader;
