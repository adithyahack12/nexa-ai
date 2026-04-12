import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function MobileNav({ navItems, currentPageName, historyCount }) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] md:hidden px-4 pb-6 pt-3 bg-black/60 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around">
            {navItems.filter(item => item.name !== "Canvas").map((item) => {
                const isActive = currentPageName === item.name || (item.name === "Home" && currentPageName === "Landing");
                const isHistory = item.name === "History";
                
                return (
                    <Link
                        key={item.name}
                        to={item.path}
                        onClick={(e) => {
                            if (item.onClick) {
                              e.preventDefault();
                              item.onClick();
                            }
                        }}
                        className={cn(
                            "flex flex-col items-center gap-1.5 transition-all active:scale-90 relative",
                            isActive ? "text-orange-500" : isHistory ? "text-purple-400" : "text-slate-600"
                        )}
                    >
                        <div className={cn(
                            "p-2.5 rounded-xl transition-all",
                            isActive ? "bg-orange-600/10" : "bg-transparent"
                        )}>
                            {item.icon}
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest">{item.name}</span>
                        {isHistory && historyCount > 0 && (
                            <span className="absolute top-1 right-1/2 translate-x-3 w-4 h-4 bg-orange-500 text-white text-[8px] font-black rounded-full flex items-center justify-center scale-90 border-2 border-black">
                                {historyCount}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
