import React, { useState } from "react";
import AIAssistant from "@/components/AIAssistant";
import { Link } from "react-router-dom";
import { Users, Bot, MessageSquare, Plus, Hash, Globe, Settings, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const AGENTS = [
    { id: "researcher", name: "Dr. Nova (Researcher)", icon: "🔬", description: "Specializes in deep scientific research and analysis.", model: "gemini-1.5-pro-latest" },
    { id: "coder", name: "BitMaster (Dev)", icon: "💻", description: "Expert in logic, React, and system architecture.", model: "gemini-1.5-flash-latest" },
    { id: "creative", name: "Lumina (Creative)", icon: "🎨", description: "Fueling your imagination with design and storytelling.", model: "gemini-1.5-pro-latest" },
    { id: "tutor", name: "Nexa Tutor", icon: "🎓", description: "Specializes in explaining concepts and solving academic doubts.", model: "gemini-1.5-pro-latest" }
];

const SHARED_NOTES = [
    { title: "Quantum Physics Basics", author: "Adithya", date: "2 mins ago", type: "PDF" },
    { title: "React Design Patterns", author: "BotMaster", date: "1 hour ago", type: "NOTE" },
    { title: "History Study Guide", author: "Sarah", date: "Yesterday", type: "LINK" }
];

const ROOMS = [
    { id: "general", name: "General Intelligence", agents: ["researcher", "coder", "creative"] },
    { id: "student-circle", name: "Student Study Circle", agents: ["tutor", "researcher"], isGroup: true },
    { id: "dev-hub", name: "Developer Nexus", agents: ["coder"] },
    { id: "lab", name: "Quantum Lab", agents: ["researcher"] }
];

export default function ChatRooms() {
    const [selectedRoom, setSelectedRoom] = useState(ROOMS[0]);
    const [selectedAgent, setSelectedAgent] = useState(AGENTS.find(a => a.id === selectedRoom.agents[0]));

    return (
        <div className="h-screen bg-[#030303] text-slate-200 flex flex-col relative overflow-hidden">
            
            <div className="flex flex-1 pt-20 overflow-hidden">
                {/* Sidebar: Rooms */}
                <div className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col">
                    <div className="p-6">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Neural Channels</h2>
                    <div className="space-y-1">
                        {ROOMS.map(room => (
                            <button
                                key={room.id}
                                onClick={() => {
                                    setSelectedRoom(room);
                                    setSelectedAgent(AGENTS.find(a => a.id === room.agents[0]));
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all group",
                                    selectedRoom.id === room.id ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "text-slate-500 hover:bg-white/5 hover:text-white"
                                )}
                            >
                                <Hash size={18} className={selectedRoom.id === room.id ? "text-white" : "text-slate-700 group-hover:text-slate-400"} />
                                {room.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <button className="w-full py-4 border border-dashed border-white/10 rounded-3xl text-xs font-medium text-slate-600 hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2">
                        <Plus size={16} /> Create Private Node
                    </button>
                </div>
                </div>

                {/* Main Area: Agents & Chat */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Agent Selector */}
                    <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center gap-4 overflow-x-auto min-h-[73px]">
                        <div className="flex items-center gap-2 px-4 py-1 border-r border-white/10 mr-2 shrink-0">
                            <Users size={16} className="text-slate-600" />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase">Agents Active:</span>
                        </div>
                        {selectedRoom.agents.map(agentId => {
                            const agent = AGENTS.find(a => a.id === agentId);
                            return (
                                <button
                                    key={agentId}
                                    onClick={() => setSelectedAgent(agent)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap border shrink-0",
                                        selectedAgent.id === agentId 
                                            ? "bg-white/10 border-white/20 text-white shadow-xl" 
                                            : "bg-transparent border-transparent text-slate-500 hover:text-white"
                                    )}
                                >
                                    <span className="text-lg">{agent.icon}</span>
                                    {agent.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* Chat Display */}
                    <div className="flex-1 p-6 overflow-hidden flex">
                        <div className="flex-1 overflow-hidden flex flex-col">
                            <AIAssistant 
                                fullWidth={true} 
                                key={`${selectedRoom.id}-${selectedAgent.id}`} 
                                initialQuery={selectedRoom.isGroup ? `Hello everyone! I'm here in the ${selectedRoom.name} to help with your academic doubts. Feel free to ask anything!` : `Hello ${selectedAgent.name}, I'm joining the ${selectedRoom.name} channel.`}
                            />
                        </div>

                        {selectedRoom.isGroup && (
                            <div className="w-80 ml-6 hidden xl:flex flex-col animate-in slide-in-from-right-10 duration-500">
                                <div className="p-6 bg-white/[0.03] border border-white/10 rounded-[2.5rem] h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-orange-500">Shared Resources</h3>
                                        <button className="p-2 bg-orange-500/10 text-orange-400 rounded-full hover:bg-orange-500/20 transition-all"><Plus size={14} /></button>
                                    </div>

                                    <div className="space-y-4 overflow-y-auto pr-2 scrollbar-none">
                                        {SHARED_NOTES.map((note, i) => (
                                            <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all cursor-pointer group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] bg-white/10 text-slate-400 px-2 py-0.5 rounded-full uppercase font-bold">{note.type}</span>
                                                    <span className="text-[9px] text-slate-600 font-medium">{note.date}</span>
                                                </div>
                                                <h4 className="text-[13px] font-bold text-slate-200 group-hover:text-orange-400 transition-colors">{note.title}</h4>
                                                <p className="text-[10px] text-slate-500 mt-1 font-medium italic">Shared by {note.author}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-white/5">
                                        <p className="text-[10px] text-slate-600 leading-relaxed">
                                            Students in this circle can view and contribute to these notes. Shared materials are optimized for academic integrity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const NavPill = ({ icon, label, active = false }) => (
    <div className={cn(
      "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-all uppercase tracking-wider cursor-pointer",
      active ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "text-slate-500 hover:text-white hover:bg-white/5"
    )}>
      {icon} {label}
    </div>
);

