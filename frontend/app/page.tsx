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

export type AgentStep = {
  agent: string;
  description: string;
  output: string;
};

// Add ChartDatum type for chartData state
type ChartDatum = { label: string; value: number };

export default function Home() {
  const [timeline, setTimeline] = useState<AgentStep[]>([]);
  const [chartData, setChartData] = useState<ChartDatum[]>([]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-6">Enterprise Insights Copilot</h1>
        <SettingsPanel />
        <div className="mb-6"><FileUploader onUpload={() => {}} /></div>
        <div className="mb-6"><ChatBox setTimeline={setTimeline} setChartData={setChartData} /></div>
        <div className="mb-6"><AgentTimeline steps={timeline} /></div>
        <ChartPanel chartData={chartData} />
      </div>
    </main>
  );
}
