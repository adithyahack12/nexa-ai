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
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
            <Globe className="text-white fill-current" size={20} />
          </div>
          <div className="block">
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white leading-none">NexaAI</h1>
            <p className="text-[7px] md:text-[8px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Quantum Intelligence</p>
          </div>
        </Link>

        {/* Shortcuts Section - HIDDEN ON MOBILE */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-2xl shadow-xl">
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
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-500 hover:text-white transition-colors hidden md:block">
            <Settings size={18} />
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-500 hover:text-white transition-all active:scale-95"
          >
            <RotateCcw size={14} className="md:size-[18px]" />
            <span className="hidden sm:inline uppercase tracking-widest">Reset</span>
          </button>
        </div>
      </nav>
      )}

      {/* MOBILE BOTTOM NAVIGATION */}
      {currentPageName !== "Landing" && (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-4 pb-6 pt-3 bg-black/60 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around">
            {navItems.filter(item => item.name !== "Canvas").map((item) => {
                const isActive = currentPageName === item.name || (item.name === "Home" && currentPageName === "Landing");
                const isHistory = item.name === "History";
                return (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={cn(
                            "flex flex-col items-center gap-1.5 transition-all active:scale-90",
                            isActive ? "text-orange-500" : isHistory ? "text-purple-400" : "text-slate-600"
                        )}
                    >
                        <div className={cn(
                            "p-2.5 rounded-xl transition-all",
                            isActive ? "bg-orange-600/10" : ""
                        )}>
                            {item.icon}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest">{item.name}</span>
                        {isHistory && historyCount > 0 && (
                            <span className="absolute top-2 right-1/2 translate-x-4 w-4 h-4 bg-orange-500 text-white text-[8px] font-black rounded-full flex items-center justify-center scale-90 border-2 border-black">
                                {historyCount}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full pt-2 pb-24 md:pb-4 animate-in fade-in duration-1000">
        {children}
      </main>
    </div>
  );
}