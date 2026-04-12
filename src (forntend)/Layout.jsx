import MobileNav from "@/components/MobileNav";
import DesktopNav from "@/components/DesktopNav";
import HistorySidebar from "@/components/HistorySidebar";
import { useLocation } from "react-router-dom";

export default function Layout({ children, currentPageName }) {
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const location = useLocation();

  // Listen for history search param
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("history") === "open") {
      setHistoryOpen(true);
    }
  }, [location]);


  const navItems = [
    { name: "Home", icon: <Home size={18} />, path: "/" },
    { name: "Assistant", icon: <Zap size={18} />, path: "/Assistant" },
    { name: "Rooms", icon: <MessageSquare size={18} />, path: "/Rooms" },
    { name: "Topics", icon: <BookOpen size={18} />, path: "/Topics" },
    { name: "PDF", icon: <FileText size={18} />, path: "/PDF" },
    { name: "Canvas", icon: <CanvasIcon size={18} />, path: "/Canvas" },
    { name: "History", icon: <History size={18} />, path: "#", onClick: () => setHistoryOpen(true), badge: true },
  ];

  const historyCount = (() => {
    try { return JSON.parse(localStorage.getItem("nexaHistory") || "[]").length; } catch { return 0; }
  })();

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0D0D0D]">
      <div className="bg-mesh" />
      <div className="bg-mesh-glow" />
      
      {/* RENDER NAVIGATION BASED ON PLATFORM */}
      {currentPageName !== "Landing" && (
        <>
            {/* DESKTOP VIEW */}
            <DesktopNav 
                navItems={navItems} 
                currentPageName={currentPageName} 
                historyCount={historyCount} 
                onHistoryClick={() => setHistoryOpen(true)}
            />

            {/* MOBILE TOP HEADER (Lean) */}
            <nav className="fixed top-0 left-0 right-0 z-[100] md:hidden px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-3xl">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-orange-500 to-yellow-400 rounded-lg flex items-center justify-center">
                        <Globe className="text-white" size={18} />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">NexaAI</span>
                </Link>
                <button onClick={() => setHistoryOpen(true)} className="p-2 text-purple-400 rounded-lg bg-purple-500/5 border border-purple-500/10 active:scale-90 transition-all">
                    <History size={16} />
                </button>
            </nav>

            {/* MOBILE BOTTOM TAB BAR */}
            <MobileNav 
                navItems={navItems} 
                currentPageName={currentPageName} 
                historyCount={historyCount} 
                onHistoryClick={() => setHistoryOpen(true)}
            />

            {/* GLOBAL HISTORY SIDEBAR */}
            <HistorySidebar isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
        </>
      )}

      {/* Main Content Area */}
      <main className="relative z-10 w-full h-full pt-20 md:pt-4 pb-24 md:pb-4 animate-in fade-in duration-1000">
        {children}
      </main>
    </div>
  );
}