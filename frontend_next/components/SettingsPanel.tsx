import React from "react";

const SettingsPanel: React.FC = () => {
  return (
    <div className="p-4 border rounded bg-white shadow flex flex-col gap-2">
      <h3 className="font-bold mb-2">Settings</h3>
      <label className="flex items-center gap-2">
        <span>Model:</span>
        <select className="border rounded px-2 py-1">
          <option value="gpt-4">GPT-4</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
        </select>
      </label>
      <label className="flex items-center gap-2">
        <span>Chunk Size:</span>
        <input type="number" className="border rounded px-2 py-1 w-24" defaultValue={512} min={128} max={2048} />
      </label>
    </div>
  );
};

export default SettingsPanel;
