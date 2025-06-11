"use client";

interface BackgroundProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showTitle?: boolean;
}

export default function PageBackground({ 
  children, 
  title, 
  subtitle, 
  showTitle = false 
}: BackgroundProps) {
  return (
    <div className="min-h-screen relative">
      {/* Enhanced Dark Background with gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Multi-layer dark gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900/30 to-black"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/20 via-transparent to-purple-900/10"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-indigo-900/5 to-black"></div>
        
        {/* Floating dark gradient orbs */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full mix-blend-screen filter blur-xl opacity-40 animate-float"
            style={{
              background: `radial-gradient(circle, ${
                [
                  'rgba(30, 30, 30, 0.6)', 
                  'rgba(45, 27, 61, 0.5)', 
                  'rgba(20, 20, 40, 0.7)',
                  'rgba(40, 20, 60, 0.4)'
                ][i % 4]
              } 0%, transparent 70%)`,
              width: `${Math.random() * 400 + 200}px`,
              height: `${Math.random() * 400 + 200}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          ></div>
        ))}
        
        {/* Subtle floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 6}s`,
              boxShadow: '0 0 6px rgba(255, 255, 255, 0.3)'
            }}
          ></div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {showTitle && title && (
          <div className="text-center py-16 px-6">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-purple-200 bg-clip-text text-transparent mb-6 leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-300 text-xl max-w-4xl mx-auto leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        <div className="px-6">
          {children}
        </div>
      </div>
    </div>
  );
}
