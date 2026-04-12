import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Layout as DiagramIcon, Wand2, Download, Layers, MousePointer2, Type, Send, Loader2, Maximize2, Trash2, Image as ImageIcon, Sparkles, Zap, X, Mic, MicOff, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import mermaid from "mermaid";
import html2canvas from "html2canvas";

mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "Inter, sans-serif",
    flowchart: { htmlLabels: false },
});

// Deep sanitizer for Mermaid v11 compatibility
const sanitizeMermaid = (raw) => {
    let code = raw.replace(/```mermaid/gi, "").replace(/```/g, "").trim();
    const lines = code.split("\n");
    const graphStart = lines.findIndex(l => /^\s*(graph|flowchart)\s+(TD|LR|TB|RL|BT)/i.test(l));
    if (graphStart === -1) return "";
    const diagramLines = lines.slice(graphStart);
    const cleaned = diagramLines.map(line => {
        let l = line;
        l = l.replace(/[\u2018\u2019\u201C\u201D`]/g, "'");
        l = l.replace(/-->[|]([^|]*)[|]/g, "-->");
        l = l.replace(/---[|]([^|]*)[|]/g, "---");
        l = l.replace(/\[([^\]]*)\]/g, (match, inner) => {
            const safe = inner.replace(/:/g, " -").replace(/[{}()/\\<>]/g, " ").replace(/"/g, "'").replace(/  +/g, " ").trim();
            return `[${safe}]`;
        });
        l = l.replace(/^(\s*)(\d)(\w*)(\s*-->|\s*---)/g, '$1N$2$3$4');
        return l;
    });
    return cleaned.join("\n").trim();
};

const MermaidPreview = ({ chart }) => {
    const ref = useRef(null);
    const [error, setError] = useState(null);
    const [errMsg, setErrMsg] = useState("");

    useEffect(() => {
        if (!ref.current || !chart) return;
        setError(null);
        setErrMsg("");
        const id = `mermaid-${Date.now()}`;
        const renderDiagram = async () => {
            try {
                mermaid.initialize({
                    startOnLoad: false,
                    theme: "dark",
                    securityLevel: "loose",
                    fontFamily: "Inter, sans-serif",
                    flowchart: { htmlLabels: false, curve: "basis" },
                });
                await mermaid.parse(chart);
                const { svg } = await mermaid.render(id, chart);
                if (ref.current) ref.current.innerHTML = svg;
            } catch (e) {
                console.error("Mermaid Error:", e);
                setError(true);
                const msg = e?.message || "";
                setErrMsg(msg.includes("Parse") || msg.includes("Lexical") ? "Diagram syntax invalid — please try a different topic." : "Could not render diagram — please try again.");
            }
        };
        renderDiagram();
    }, [chart]);

    if (error) return (
        <div className="text-red-400 text-sm bg-red-400/10 p-5 rounded-xl border border-red-400/20 text-center space-y-2">
            <p className="font-bold">⚠ Diagram Error</p>
            <p className="text-xs text-red-300/70">{errMsg}</p>
        </div>
    );
    return <div ref={ref} className="mermaid-container transition-all scale-125 md:scale-150" />;
};

export default function Canvas() {
    const [mode, setMode] = useState("diagram");
    const [chart, setChart] = useState(`graph TD\n    A[Voice Command] --> B[Real-time Art]\n    B --> C[Neural Canvas]`);
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [artUrl, setArtUrl] = useState("https://image.pollinations.ai/prompt/neural%20canvas%20abstract?width=1024&height=1024&nologo=true");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const canvasRef = useRef(null);
    const recognitionRef = useRef(null);
    const toastTimerRef = useRef(null);
    const [isAcademic, setIsAcademic] = useState(true);
    const [safetyError, setSafetyError] = useState("");
    const [toast, setToast] = useState(null); 
    const location = useLocation();
    const navigate = useNavigate();

    // Load prompt from URL if present
    useEffect(() => {
        const q = new URLSearchParams(location.search).get("q");
        if (q) setPrompt(q);
    }, [location.search]);

    const addToHistoryLocally = (text, currentMode) => {
        try {
            const saved = JSON.parse(localStorage.getItem("nexaHistory") || "[]");
            const newItem = { id: Date.now(), prompt: text, mode: currentMode, time: new Date().toISOString() };
            const updated = [newItem, ...saved].slice(0, 50);
            localStorage.setItem("nexaHistory", JSON.stringify(updated));
        } catch (e) { console.error(e); }
    };

    const validateSafety = (text) => {
        const restricted = /\b(sex|porn|nsfw|adult|explicit|nude|sexual|violence|blood|gore)\b/i;
        if (restricted.test(text)) {
            setSafetyError("Content restricted for academic safety.");
            return false;
        }
        return true;
    };

    const generateImage = () => {
        if (!prompt.trim() || mode !== "imagine") return;
        if (!validateSafety(prompt)) return;
        setIsLoading(true);
        addToHistoryLocally(prompt, "imagine");
        const academicSuffix = isAcademic ? ", academic illustration, clean 2D vector, white background, educational style" : ", photorealistic, cinematic lighting, 8k resolution, highly detailed, masterpieces, natural textures";
        const optimizedPrompt = `${prompt}${academicSuffix}`;
        const apiKey = import.meta.env.VITE_POLLINATIONS_API_KEY || "";
        const size = 512;
        const seed = Math.floor(Math.random() * 10000);
        const baseUrl = apiKey ? "https://gen.pollinations.ai/image" : "https://image.pollinations.ai/prompt";
        const keyParam = apiKey ? `&key=${apiKey}` : "";
        const url = `${baseUrl}/${encodeURIComponent(optimizedPrompt)}?width=${size}&height=${size}&seed=${seed}&nologo=true&model=flux${keyParam}`;
        setArtUrl(url);
        setPrompt("");
    };

    const generateDiagram = async () => {
        if (!prompt.trim() || mode !== "diagram") return;
        if (!validateSafety(prompt)) return;
        setIsLoading(true);
        addToHistoryLocally(prompt, "diagram");
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{
                        role: "user",
                        content: `Generate a valid Mermaid flowchart diagram for: ${prompt}. Rules: graph TD, only --> arrows, only [] labels.`
                    }]
                }),
            });
            const text = await res.text();
            const cleaned = sanitizeMermaid(text);
            if (cleaned.startsWith("graph")) {
                setChart(cleaned);
                setPrompt("");
            }
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    const handleDownload = async (url = null) => {
        const link = document.createElement("a");
        link.download = `nexa-result-${Date.now()}.png`;
        link.href = url || artUrl;
        if (!url && mode === "diagram" && canvasRef.current) {
            const canvas = await html2canvas(canvasRef.current, { backgroundColor: "#0D0D0D", scale: 3, useCORS: true });
            link.href = canvas.toDataURL("image/png");
        }
        link.click();
    };

    return (
        <div className="flex h-screen bg-[#0D0D0D] text-slate-200 overflow-hidden pt-20">
            {/* Toolbar */}
            <div className="w-20 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col items-center py-8 gap-6 z-10">
                <ToolIcon icon={<DiagramIcon size={20} />} active={mode === "diagram"} onClick={() => setMode("diagram")} title="Diagrams" />
                <ToolIcon icon={<ImageIcon size={20} />} active={mode === "imagine"} onClick={() => setMode("imagine")} title="Art" className="text-orange-400" />
                <div className="h-px w-8 bg-white/5 my-2" />
                <ToolIcon icon={<BookOpen size={20} />} active={isAcademic} onClick={() => setIsAcademic(!isAcademic)} title="Academic" className="text-blue-400" />
                <div className="mt-auto flex flex-col gap-6">
                    <ToolIcon icon={<Download size={20} />} onClick={() => handleDownload()} className="text-green-500" title="Export" />
                    <ToolIcon icon={<Trash2 size={20} />} onClick={() => { setChart(""); setPrompt(""); }} className="hover:text-red-500" title="Clear" />
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:40px_40px] flex flex-col">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full backdrop-blur-xl z-40">
                    <Sparkles className="text-orange-500" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400"> Neural {mode} Node </span>
                </div>

                <div className="flex-1 overflow-auto p-12 flex items-center justify-center relative">
                    <div ref={canvasRef} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-3xl min-w-[75%] min-h-[65%] flex items-center justify-center relative overflow-hidden">
                        {mode === "diagram" ? (chart ? <MermaidPreview chart={chart} /> : <DiagramIcon size={64} className="text-slate-800" />) : (
                            <div className="relative cursor-zoom-in" onClick={() => setSelectedImage(artUrl)}>
                                <img src={artUrl} alt="Nexa Art" className={cn("max-w-full max-h-[70vh] rounded-2xl transition-all duration-700", isLoading ? "opacity-30 blur-sm scale-95" : "opacity-100")} onLoad={() => setIsLoading(false)} />
                                {isLoading && <Zap size={48} className="absolute inset-0 m-auto text-orange-500 animate-pulse" />}
                            </div>
                        )}
                        {isLoading && mode === "diagram" && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-orange-400" size={48} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400">Syncing...</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input area */}
                <div className="p-8 border-t border-white/5 bg-black/20 flex flex-col items-center gap-4 backdrop-blur-md">
                    <div className="w-full max-w-4xl flex items-center gap-4 relative">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => { setPrompt(e.target.value); setSafetyError(""); }}
                            onKeyDown={(e) => e.key === "Enter" && (mode === "diagram" ? generateDiagram() : generateImage())}
                            placeholder={safetyError || `Type to ${mode}...`}
                            className={cn("w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-sm shadow-2xl", safetyError ? "border-red-500/50 text-red-400" : "")}
                        />
                        <button onClick={mode === "diagram" ? generateDiagram : generateImage} disabled={isLoading || !prompt.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-orange-600 text-white rounded-xl hover:scale-105 transition-all shadow-lg active:scale-95">
                            {mode === "diagram" ? <Wand2 size={20} /> : <Zap size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8">
                        <img src={selectedImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
                        <button onClick={() => setSelectedImage(null)} className="absolute top-10 right-10 p-4 bg-white/10 text-white rounded-full"><X size={24} /></button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const ToolIcon = ({ icon, active = false, className = "", onClick = () => { }, title }) => (
    <div className="relative group">
        <button onClick={onClick} className={cn("p-3 rounded-2xl transition-all active:scale-90", active ? "bg-orange-600 text-white shadow-lg" : "bg-white/5 text-slate-500 hover:text-white", className)}>
            {icon}
        </button>
        {title && <div className="absolute left-full ml-4 px-3 py-1 bg-orange-600 text-[10px] font-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all uppercase whitespace-nowrap z-50">{title}</div>}
    </div>
);
