import React, { useRef } from "react";

interface FileUploaderProps {
  onUpload: (file: File) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="p-4 border rounded bg-white shadow">
      <label className="block font-semibold mb-2">Upload CSV or Reference File</label>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt,.pdf,.md"
        className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default FileUploader;
