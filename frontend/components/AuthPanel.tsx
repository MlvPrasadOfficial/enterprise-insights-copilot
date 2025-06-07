import React, { useState } from "react";

interface AuthPanelProps {
  onAuth: (keys: { openaiKey: string; deeplakeKey: string; orgId: string }) => void;
}

const AuthPanel: React.FC<AuthPanelProps> = ({ onAuth }) => {
  const [openaiKey, setOpenaiKey] = useState("");
  const [deeplakeKey, setDeeplakeKey] = useState("");
  const [orgId, setOrgId] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <h3 className="font-bold text-lg mb-2">🔑 Authentication</h3>
      <input
        className="input input-bordered"
        type="password"
        placeholder="OpenAI API Key"
        value={openaiKey}
        onChange={e => setOpenaiKey(e.target.value)}
      />
      <input
        className="input input-bordered"
        type="password"
        placeholder="DeepLake Token"
        value={deeplakeKey}
        onChange={e => setDeeplakeKey(e.target.value)}
      />
      <input
        className="input input-bordered"
        type="text"
        placeholder="Organisation ID"
        value={orgId}
        onChange={e => setOrgId(e.target.value)}
      />
      <button
        className="btn btn-primary mt-2"
        onClick={() => onAuth({ openaiKey, deeplakeKey, orgId })}
      >
        Authenticate
      </button>
    </div>
  );
};

export default AuthPanel;
