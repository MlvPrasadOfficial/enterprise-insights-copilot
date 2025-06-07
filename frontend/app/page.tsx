"use client";
/**
 * Enterprise Insights Copilot - Main Dashboard Page
 * Combines CSV upload, chat UI, agent timeline, chart, and settings panel.
 */
import FileUploader from "@/components/FileUploader";
import ChatBox from "@/components/ChatBox";
import AgentTimeline from "@/components/AgentTimeline";
import ChartPanel from "@/components/ChartPanel";
import SettingsPanel from "@/components/SettingsPanel";
import { useState } from "react";

export default function Home() {
  // State for agent timeline, chart, and chat messages
  type AgentStep = {
    agent: string;
    description: string;
    output: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [timeline, setTimeline] = useState<AgentStep[]>([]);
  const [chartUrl, setChartUrl] = useState<string | undefined>(undefined);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Enterprise Insights Copilot</h1>
        <SettingsPanel />
        <div className="mb-6"><FileUploader onUpload={() => {}} /></div>
        <div className="mb-6"><ChatBox setTimeline={setTimeline} setChartUrl={setChartUrl} /></div>
        <div className="mb-6"><AgentTimeline steps={timeline} /></div>
        <ChartPanel chartUrl={chartUrl} />
      </div>
    </main>
  );
}
