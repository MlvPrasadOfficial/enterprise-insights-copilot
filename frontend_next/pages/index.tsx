import React, { useState } from "react";
import FileUploader from "../components/FileUploader";
import ChatBox from "../components/ChatBox";
import AgentTimeline from "../components/AgentTimeline";
import ChartPanel from "../components/ChartPanel";
import SettingsPanel from "../components/SettingsPanel";

export default function Home() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [steps, setSteps] = useState<any[]>([]);
  const [chartUrl, setChartUrl] = useState<string | undefined>(undefined);

  const handleUpload = (file: File) => {
    // TODO: Implement upload logic
    alert(`Uploaded: ${file.name}`);
  };

  const handleSend = (msg: string) => {
    setMessages((prev) => [...prev, { sender: "user", text: msg }]);
    // TODO: Call backend and update steps, chart, etc.
    setSteps([
      ...steps,
      { agent: "PlannerAgent", description: "Planned the workflow", output: msg },
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <SettingsPanel />
        <FileUploader onUpload={handleUpload} />
        <ChatBox onSend={handleSend} messages={messages} />
        <AgentTimeline steps={steps} />
        <ChartPanel chartUrl={chartUrl} />
      </div>
    </div>
  );
}
