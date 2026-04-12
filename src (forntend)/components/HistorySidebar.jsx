import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X, Clock, RotateCcw, ImageIcon, MessageSquare, Layout as DiagramIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function HistorySidebar({ isOpen, onClose }) {
    const [history, setHistory] = React.useState([]);
    const navigate = useNavigate();

    // Load history whenever the sidebar is opened
    React.useEffect(() => {
        if (isOpen) {
            try {
                const saved = JSON.parse(localStorage.getItem("nexaHistory") || "[]");
                setHistory(saved.reverse()); // Show newest first
            } catch (e) {
                console.error("Failed to load history", e);
            }
        }
    }, [isOpen]);

    const handleRestore = (item) => {
        if (item.mode === 'imagine' || item.mode === 'diagram') {
            navigate(`/Canvas?q=${encodeURIComponent(item.prompt)}`);
        } else {
            navigate(`/Assistant?q=${encodeURIComponent(item.prompt)}`);
        }
        onClose();
    };

    const clearHistory = () => {
        localStorage.removeItem("nexaHistory");
        setHistory([]);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150]"
                    />
                    
                    {/* Panel */}
                    <motion.div
                        key="history-sidebar"
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-24 right-4 bottom-24 w-[90vw] md:w-85 z-[151] flex flex-col border border-white/10 shadow-2xl overflow-hidden rounded-[2.5rem]"
                        style={{ background: 'linear-gradient(180deg, rgba(15,10,5,0.98) 0%, rgba(5,5,5,0.98) 100%)', backdropFilter: 'blur(32px)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-purple-500/15 rounded-2xl border border-purple-500/20">
                                    <History size={20} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-400">Prompt History</p>
                                    <p className="text-[10px] text-slate-600 mt-1">{history.length} Sessions Saved</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* History List */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4 scrollbar-hide">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-5 text-center px-6">
                                    <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/5">
                                        <Clock size={48} className="text-slate-700 mx-auto" />
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed">Your neural history is empty.<br /><span className="text-xs text-slate-700">Start a session to capture your journey.</span></p>
                                </div>
                            ) : (
                                history.map((item, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={item.id || idx}
                                        onClick={() => handleRestore(item)}
                                        className="group p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-orange-500/30 transition-all cursor-pointer relative"
                                    >
                                        <div className="flex gap-4 items-start">
                                            <div className={cn(
                                                "p-2.5 rounded-xl flex-shrink-0 border",
                                                item.mode === 'imagine' ? 'bg-orange-500/10 border-orange-500/20' : 
                                                item.mode === 'chat' ? 'bg-green-500/10 border-green-500/20' : 
                                                'bg-blue-500/10 border-blue-500/20'
                                            )}>
                                                {item.mode === 'imagine' ? <ImageIcon size={14} className="text-orange-400" /> : 
                                                 item.mode === 'chat' ? <MessageSquare size={14} className="text-green-400" /> : 
                                                 <DiagramIcon size={14} className="text-blue-400" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 group-hover:text-white transition-colors">{item.prompt}</p>
                                                <p className="text-[9px] text-slate-700 uppercase font-black tracking-widest mt-2">{new Date(item.time).toLocaleString()}</p>
                                            </div>
                                            <RotateCcw size={14} className="text-slate-800 group-hover:text-orange-400 transition-colors mt-1" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {history.length > 0 && (
                            <div className="px-6 py-6 bg-white/[0.01] border-t border-white/5">
                                <button
                                    onClick={clearHistory}
                                    className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all"
                                >
                                    Purge All History
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
