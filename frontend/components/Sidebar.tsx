import Link from "next/link";

export default function Sidebar() {
  return (
    <nav className="fixed top-0 left-0 h-full w-48 bg-background/70 border-r border-white/10 z-20 flex flex-col py-8 px-4 hidden md:flex">
      <div className="mb-10 flex flex-col items-start">
        <span className="text-3xl font-bold text-primary">GENAI</span>
        <span className="text-xl font-semibold text-accent">BI</span>
      </div>
      <ul className="flex-1 space-y-5">
        <li>
          <Link href="/" className="text-gray-200 hover:text-accent transition font-medium">Dashboard</Link>
        </li>
        <li>
          <Link href="#upload" className="text-gray-200 hover:text-accent transition">Upload CSV</Link>
        </li>
        <li>
          <Link href="#chat" className="text-gray-200 hover:text-accent transition">Ask Question</Link>
        </li>
        <li>
          <Link href="#timeline" className="text-gray-200 hover:text-accent transition">Timeline</Link>
        </li>
        <li>
          <a href="https://enterprise-insights-copilot.onrender.com/docs" target="_blank" className="text-gray-400 hover:text-accent transition">API Docs</a>
        </li>
        <li>
          <a href="https://github.com/MlvPrasadOfficial/enterprise-insights-copilot" target="_blank" className="text-gray-400 hover:text-accent transition">GitHub</a>
        </li>
      </ul>
      <footer className="mt-auto pt-8 text-xs text-gray-600 opacity-70">© {new Date().getFullYear()} GENAI Copilot</footer>
    </nav>
  );
}
