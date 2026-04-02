import React from "react";
import { Home, MessageSquare, BookOpen, FileText, Layout as CanvasIcon, Globe, Settings, RotateCcw, History, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Layout({ children, currentPageName }) {
  const navItems = [
    { name: "Home", icon: <Home size={18} />, path: "/" },
    { name: "Assistant", icon: <Zap size={18} />, path: "/Assistant" },
    { name: "Rooms", icon: <MessageSquare size={18} />, path: "/Rooms" },
    { name: "Topics", icon: <BookOpen size={18} />, path: "/Topics" },
    { name: "PDF", icon: <FileText size={18} />, path: "/PDF" },
    { name: "Canvas", icon: <CanvasIcon size={18} />, path: "/Canvas" },
    { name: "History", icon: <History size={18} />, path: "/Canvas?history=open", badge: true },
  ];

  // Count history entries from localStorage
  const historyCount = (() => {
    try { return JSON.parse(localStorage.getItem("nexaHistory") || "[]").length; } catch { return 0; }
  })();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0D0D0D]">
      <div className="bg-mesh" />
      <div className="bg-mesh-glow" />
      
      {/* Global Nexa Navigation Bar */}
      {currentPageName !== "Landing" && (
      <nav className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl transition-all">
         {/* Logo Section */}
         <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
            <Globe className="text-white fill-current" size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold tracking-tight text-white">NexaAI</h1>
            <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-widest">Quantum Intelligence</p>
          </div>
        </Link>

        {/* Shortcuts Section */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-2xl shadow-xl">
          {navItems.map((item) => {
            const isActive = currentPageName === item.name || (item.name === "Home" && currentPageName === "Landing");
            const isHistory = item.name === "History";
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-90 whitespace-nowrap uppercase tracking-[0.15em]",
                  isActive && isHistory
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                    : isActive
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-600/40"
                    : isHistory
                    ? "text-purple-400 hover:text-white hover:bg-purple-500/10"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >
                {item.icon}
                <span className="hidden lg:inline">{item.name}</span>
                {isHistory && historyCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {historyCount > 9 ? '9+' : historyCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Settings/Controls Section */}
        <div className="flex items-center gap-3">
          <button className="p-2 text-slate-500 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={() => window.location.reload()} className="p-2 text-slate-500 hover:text-white transition-colors">
            <RotateCcw size={20} />
          </button>
        </div>
      </nav>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full pt-4 animate-in fade-in duration-1000">
        {children}
      </main>
    </div>
  );
}