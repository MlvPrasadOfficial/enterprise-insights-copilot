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
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen text-white antialiased" style={{
        fontFamily: 'Inter, sans-serif',
        background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #1a0d2e 50%, #2d1b3d 75%, #000000 100%)'
      }}>
        {/* Navigation Header */}
        <MainNavigation />
        
        {/* Main Content with padding for fixed header */}
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
