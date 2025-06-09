"use client";
import Chat from "@/components/Chat";
import Upload from "@/components/Upload";
import EvalSetButton from "@/components/EvalSetButton";
import Link from "next/link";
import axios from "axios";

export default function Home() {
  // Handler to load and index the eval set
  const handleEvalSetLoad = async (rows: any[]) => {
    // Convert rows to CSV string
    const csv = [
      Object.keys(rows[0]).join(","),
    ]
      .concat(rows.map((r: any) => Object.values(r).join(",")))
      .join("\n");
    // Create a Blob and File for upload
    const blob = new Blob([csv], { type: "text/csv" });
    const file = new File([blob], "eval_set.csv", { type: "text/csv" });
    const formData = new FormData();
    formData.append("file", file);
    // Upload and index as in Upload.tsx
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      const indexForm = new FormData();
      indexForm.append("file", file);
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1/index`,
        indexForm,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Sample eval set loaded and indexed!");
    } catch (err) {
      alert("Failed to load sample eval set. See console for details.");
      console.error(err);
    }
  };
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600 dark:text-blue-300">
        Enterprise Insights Copilot
      </h1>
      <div className="flex justify-center items-center gap-4 mb-4">
        <Upload />
        <EvalSetButton onLoad={handleEvalSetLoad} />
      </div>
      <Chat />
      <div className="text-center mt-6">
        <Link
          href="/charts"
          className="text-blue-400 underline hover:text-blue-600"
        >
          View Reports & Charts
        </Link>
      </div>
    </div>
  );
}
