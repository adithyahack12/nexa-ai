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

const DEFAULT_ROOMS = [
    { id: "general", name: "General Intelligence", agents: ["researcher", "coder", "creative"] },
    { id: "student-circle", name: "Student Study Circle", agents: ["tutor", "researcher"], isGroup: true },
    { id: "dev-hub", name: "Developer Nexus", agents: ["coder"] },
    { id: "lab", name: "Quantum Lab", agents: ["researcher"] }
];

export default function ChatRooms() {
    const [rooms, setRooms] = useState(() => {
        try {
            const saved = localStorage.getItem("nexaRooms");
            return saved ? JSON.parse(saved) : DEFAULT_ROOMS;
        } catch { return DEFAULT_ROOMS; }
    });
    const [selectedRoom, setSelectedRoom] = useState(rooms[0]);
    const [selectedAgent, setSelectedAgent] = useState(AGENTS.find(a => a.id === rooms[0].agents[0]));
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);
    const [newRoomData, setNewRoomData] = useState({ name: "", agents: ["tutor"] });

    // Persist rooms to localStorage
    React.useEffect(() => {
        localStorage.setItem("nexaRooms", JSON.stringify(rooms));
    }, [rooms]);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (!newRoomData.name.trim()) return;

        const newRoom = {
            id: `room-${Date.now()}`,
            name: newRoomData.name,
            agents: newRoomData.agents,
            isGroup: true
        };

        setRooms([...rooms, newRoom]);
        setIsCreatingRoom(false);
        setNewRoomData({ name: "", agents: ["tutor"] });
    };

    const deleteRoom = (id, e) => {
        e.stopPropagation();
        if (id === "general") return; // Keep general
        const updated = rooms.filter(r => r.id !== id);
        setRooms(updated);
        if (selectedRoom.id === id) {
            setSelectedRoom(updated[0]);
            setSelectedAgent(AGENTS.find(a => a.id === updated[0].agents[0]));
        }
    };

    return (
        <div className="h-screen bg-[#030303] text-slate-200 flex flex-col relative overflow-hidden">
            
            <div className="flex flex-1 pt-20 overflow-hidden">
                {/* Sidebar: Rooms */}
                <div className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col">
                    <div className="p-6">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Neural Channels</h2>
                    <div className="space-y-1">
                        {rooms.map(room => (
                            <div key={room.id} className="relative group">
                                <button
                                    onClick={() => {
                                        setSelectedRoom(room);
                                        setSelectedAgent(AGENTS.find(a => a.id === room.agents[0]));
                                    }}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                                        selectedRoom.id === room.id ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "text-slate-500 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <Hash size={18} className={selectedRoom.id === room.id ? "text-white" : "text-slate-700 group-hover:text-slate-400"} />
                                    {room.name}
                                </button>
                                {room.id !== "general" && (
                                    <button 
                                        onClick={(e) => deleteRoom(room.id, e)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-700 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                                    >
                                        <Plus size={14} className="rotate-45" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-6 border-t border-white/5">
                    <button 
                        onClick={() => setIsCreatingRoom(true)}
                        className="w-full py-4 border border-dashed border-white/10 rounded-3xl text-xs font-medium text-slate-600 hover:border-orange-500/50 hover:text-orange-500 transition-all flex items-center justify-center gap-2"
                    >
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

            {/* CREATE ROOM MODAL */}
            {isCreatingRoom && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsCreatingRoom(false)} />
                    <form 
                        onSubmit={handleCreateRoom}
                        className="relative w-full max-w-lg bg-[#111] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-300"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 italic">Initialize Neural Channel</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Channel Name</label>
                                <input 
                                    autoFocus
                                    type="text" 
                                    required
                                    value={newRoomData.name}
                                    onChange={e => setNewRoomData({...newRoomData, name: e.target.value})}
                                    placeholder="e.g. Physics Study Group..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Select Active Agents</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {AGENTS.map(agent => (
                                        <button
                                            key={agent.id}
                                            type="button"
                                            onClick={() => {
                                                const current = newRoomData.agents;
                                                setNewRoomData({
                                                    ...newRoomData,
                                                    agents: current.includes(agent.id) 
                                                        ? current.filter(id => id !== agent.id)
                                                        : [...current, agent.id]
                                                });
                                            }}
                                            className={cn(
                                                "p-3 rounded-xl border text-[10px] font-bold transition-all flex items-center gap-2",
                                                newRoomData.agents.includes(agent.id) ? "bg-orange-500/20 border-orange-500/50 text-white" : "bg-white/5 border-white/5 text-slate-500"
                                            )}
                                        >
                                            <span className="text-sm">{agent.icon}</span>
                                            {agent.name.split(' ')[0]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button 
                                type="button"
                                onClick={() => setIsCreatingRoom(false)}
                                className="flex-1 py-4 bg-white/5 text-slate-500 font-bold rounded-2xl hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={newRoomData.agents.length === 0}
                                className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-600/30 disabled:opacity-50"
                            >
                                Create Channel
                            </button>
                        </div>
                    </form>
                </div>
            )}
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

