import ReportChart from "@/components/ReportChart";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600 dark:text-blue-300">Reports & Charts</h1>
      <ReportChart />
    </div>
  );
}
