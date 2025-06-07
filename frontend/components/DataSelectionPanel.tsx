import React from "react";

export interface DataSelectionPanelProps {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

const DataSelectionPanel: React.FC<DataSelectionPanelProps> = ({ options, selected, onSelect }) => (
  <div className="flex flex-col gap-4">
    <h3 className="font-bold text-lg mb-2">📚 Data Selection</h3>
    <select
      className="input input-bordered"
      value={selected}
      onChange={e => onSelect(e.target.value)}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default DataSelectionPanel;
