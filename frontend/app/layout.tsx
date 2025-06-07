import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Enterprise Insights Copilot",
  description: "GenAI Insights Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="dark bg-background text-white font-heading min-h-screen">
        {/* Hex Background Overlay */}
        <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none" style={{ background: "url('/hex-bg.svg') repeat" }} />
        {children}
      </body>
    </html>
  );
}
