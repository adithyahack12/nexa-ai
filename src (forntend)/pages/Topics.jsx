import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Sparkles, Bookmark, ArrowRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_TOPICS = [
    { id: 1, title: "Quantum Physics", category: "Science", progress: 65, description: "Wave-particle duality and Schrödinger's equation." },
    { id: 2, title: "React Architecture", category: "Code", progress: 90, description: "Advanced patterns, hooks optimization and state management." },
    { id: 3, title: "World History", category: "Arts", progress: 30, description: "The Industrial Revolution and its global impact." },
];

export default function Topics() {
    const [topics, setTopics] = useState(() => {
        try {
            const saved = localStorage.getItem("nexaTopics");
            return saved ? JSON.parse(saved) : DEFAULT_TOPICS;
        } catch { return DEFAULT_TOPICS; }
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [newTopic, setNewTopic] = useState({ title: "", category: "General", description: "" });

    const navigate = useNavigate();

    // Persist topics to localStorage
    React.useEffect(() => {
        localStorage.setItem("nexaTopics", JSON.stringify(topics));
    }, [topics]);

    const filteredTopics = topics.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddTopic = (e) => {
        e.preventDefault();
        if (!newTopic.title.trim()) return;

        const topic = {
            id: Date.now(),
            ...newTopic,
            progress: 0
        };
        setTopics([topic, ...topics]);
        setNewTopic({ title: "", category: "General", description: "" });
        setIsAdding(false);
    };

    const handleTopicClick = (title) => {
        navigate(`/Assistant?q=Tell me more about ${encodeURIComponent(title)}`);
    };

    const deleteTopic = (id, e) => {
        e.stopPropagation();
        setTopics(topics.filter(t => t.id !== id));
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#0D0D0D] text-slate-200 pt-24 px-8 pb-20">
            <div className="max-w-6xl mx-auto w-full">
                <header className="mb-12 flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2 italic">Topic Master</h1>
                        <p className="text-slate-500 font-medium">Click any topic to begin your neural learning session.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-orange-600 hover:border-orange-500 transition-all shadow-xl flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Custom Topic
                    </button>
                </header>

                <div className="relative mb-12">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search for a concept or category..."
                        className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-16 text-lg outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/30 transition-all placeholder:text-slate-700"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => navigate(`/Assistant?q=${encodeURIComponent(searchQuery)}`)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-orange-600 text-white text-xs font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                        >
                            Ask NexaAI
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTopics.map(topic => (
                        <div
                            key={topic.id}
                            onClick={() => handleTopicClick(topic.title)}
                            className="group p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.05] hover:border-orange-500/30 transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles className="text-orange-500" size={20} />
                            </div>
                            <div className="flex justify-between items-start mb-6">
                                <span className={cn(
                                    "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full",
                                    topic.category === "Science" ? "bg-blue-500/10 text-blue-400" :
                                        topic.category === "Code" ? "bg-purple-500/10 text-purple-400" : "bg-orange-500/10 text-orange-400"
                                )}>{topic.category}</span>
                                <button
                                    onClick={(e) => deleteTopic(topic.id, e)}
                                    className="p-2 text-slate-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                    title="Delete Topic"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">{topic.title}</h3>
                            <p className="text-sm text-slate-500 leading-relaxed mb-8 line-clamp-2">{topic.description || "Start a session to build your mastery in this subject."}</p>

                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                                    <span>Mastery Progress</span>
                                    <span className="text-slate-400">{topic.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000" style={{ width: `${topic.progress}%` }} />
                                </div>
                                <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-orange-500 opacity-0 group-hover:opacity-100 transition-all">
                                    START MASTERY SESSION <ArrowRight size={12} />
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredTopics.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-slate-500 mb-4">No topics found matching your search.</p>
                            <button
                                onClick={() => navigate(`/Assistant?q=${encodeURIComponent(searchQuery)}`)}
                                className="px-8 py-4 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all"
                            >
                                Start a custom session for "{searchQuery}"
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD TOPIC MODAL */}
            {isAdding && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setIsAdding(false)} />
                    <form
                        onSubmit={handleAddTopic}
                        className="relative w-full max-w-lg bg-[#111] border border-white/10 p-10 rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-300"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6 italic">Add Neural Topic</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Topic Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    value={newTopic.title}
                                    onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
                                    placeholder="e.g. Astrophysics, UX Design..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Category</label>
                                <select
                                    value={newTopic.category}
                                    onChange={e => setNewTopic({ ...newTopic, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-slate-300 outline-none focus:border-orange-500/50 transition-all font-medium appearance-none"
                                >
                                    <option value="General">General</option>
                                    <option value="Science">Science</option>
                                    <option value="Code">Code</option>
                                    <option value="Arts">Arts</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Short Description</label>
                                <textarea
                                    value={newTopic.description}
                                    onChange={e => setNewTopic({ ...newTopic, description: e.target.value })}
                                    placeholder="What do you want to learn about?"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-orange-500/50 transition-all font-medium h-24 resize-none"
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="flex-1 py-4 bg-white/5 text-slate-500 font-bold rounded-2xl hover:bg-white/10 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-4 bg-orange-600 text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-600/30"
                            >
                                Create Topic
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
