"use client";
import Chat from "@/components/Chat";
import Upload from "@/components/Upload";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600 dark:text-blue-300">
        Enterprise Insights Copilot
      </h1>
      <Upload />
      <Chat />
      <div className="text-center mt-6">
        <Link
          href="/reports"
          className="text-blue-400 underline hover:text-blue-600"
        >
          View Reports & Charts
        </Link>
      </div>
    </div>
  );
}
