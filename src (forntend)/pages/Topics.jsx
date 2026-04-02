import React, { useState } from "react";
import { BookOpen, Search, ArrowRight, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const TOPICS = [
    { id: 1, title: "Quantum Physics", category: "Science", progress: 65, description: "Wave-particle duality and Schrödinger's equation." },
    { id: 2, title: "React Architecture", category: "Code", progress: 90, description: "Advanced patterns, hooks optimization and state management." },
    { id: 3, title: "World History", category: "Arts", progress: 30, description: "The Industrial Revolution and its global impact." },
];

export default function Topics() {
    return (
        <div className="flex flex-col h-screen bg-[#0D0D0D] text-slate-200 overflow-hidden pt-24 px-8">
            <div className="max-w-6xl mx-auto w-full">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Topic Master</h1>
                    <p className="text-slate-500 font-medium">Manage and explore your academic knowledge base.</p>
                </header>

                <div className="relative mb-12">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search for a concept to master..." 
                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-16 text-lg outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 transition-all"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {TOPICS.map(topic => (
                        <div key={topic.id} className="group p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] hover:border-white/10 transition-all hover:scale-[1.02] cursor-pointer">
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-4 py-1.5 bg-orange-500/10 text-orange-400 text-[10px] font-bold uppercase tracking-widest rounded-full">{topic.category}</span>
                                <Bookmark size={18} className="text-slate-700 group-hover:text-slate-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{topic.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-6">{topic.description}</p>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                    <span>Mastery</span>
                                    <span>{topic.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${topic.progress}%` }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
