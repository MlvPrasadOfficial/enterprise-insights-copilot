import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MainNavigation from "../components/MainNavigation";

// Configure Inter font
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enterprise Insights Copilot",
  description: "AI-Powered Data Analytics Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen text-white antialiased relative overflow-x-hidden" style={{
        fontFamily: 'Inter, sans-serif',
        background: '#000000',
      }}>
        {/* Animated background elements */}
        <div className="fixed inset-0 z-[-1] overflow-hidden">
          {/* Radial glow center */}
          <div className="absolute w-[800px] h-[800px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-radial from-purple-900/20 to-transparent opacity-50 animate-pulse"></div>
          
          {/* Corner glows */}
          <div className="absolute top-[-300px] left-[-300px] w-[600px] h-[600px] rounded-full bg-gradient-radial from-purple-800/10 to-transparent blur-3xl"></div>
          <div className="absolute bottom-[-200px] right-[-200px] w-[400px] h-[400px] rounded-full bg-gradient-radial from-indigo-800/10 to-transparent blur-3xl"></div>
          
          {/* Moving particles/stars */}
          <div className="stars"></div>
        </div>
        
        {/* Navigation Header - Changed to be scrollable with the page */}
        <MainNavigation />
        
        {/* Main Content - Removed padding since navigation is now sticky not fixed */}
        <main className="relative z-[1]">
          {children}
        </main>
      </body>
    </html>
  );
}
