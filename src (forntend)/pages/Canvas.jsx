import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Layout as DiagramIcon, Wand2, Download, Layers, MousePointer2, Type, Send, Loader2, Maximize2, Trash2, Image as ImageIcon, Sparkles, Zap, X, Mic, MicOff, BookOpen, History, Clock, RotateCcw } from "lucide-react";
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

// Sanitize AI-generated Mermaid code for v11 compatibility
const sanitizeMermaid = (raw) => {
    return raw
        .replace(/```mermaid/gi, "")
        .replace(/```/g, "")
        // Remove lines that are not graph syntax
        .split("\n")
        .map(line => {
            // Replace smart/curly quotes with straight quotes
            let l = line.replace(/[\u2018\u2019\u201C\u201D]/g, "'");
            // Remove colons inside node labels (outside brackets they break parsing)
            l = l.replace(/(\[[^\]]*):([^\]]*\])/g, "$1 -$2");
            return l;
        })
        .join("\n")
        .trim();
};

const MermaidPreview = ({ chart }) => {
    const ref = useRef(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (ref.current && chart) {
            setError(null);
            const id = `mermaid-${Date.now()}`;

            const renderDiagram = async () => {
                try {
                    // Validation Step
                    await mermaid.parse(chart);

                    const { svg } = await mermaid.render(id, chart);
                    if (ref.current) ref.current.innerHTML = svg;
                } catch (e) {
                    console.error("Mermaid Parse/Render Error:", e);
                    setError("Syntax Error in Diagram");
                }
            };

            renderDiagram();
        }
    }, [chart]);

    if (error) return <div className="text-red-400 text-xs bg-red-400/10 p-4 rounded-xl border border-red-400/20">{error}</div>;

    return <div ref={ref} className="mermaid-container transition-all scale-125 md:scale-150" />;
};

export default function Canvas() {
    const [mode, setMode] = useState("diagram");
    const [chart, setChart] = useState(`graph TD
    A[Voice Command] --> B[Real-time Art]
    B --> C[Neural Canvas]`);
    const [prompt, setPrompt] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [artUrl, setArtUrl] = useState("https://image.pollinations.ai/prompt/neural%20canvas%20abstract?width=1024&height=1024&nologo=true");
    const [selectedImage, setSelectedImage] = useState(null);
    const [isListening, setIsListening] = useState(false);
    const canvasRef = useRef(null);
    const debounceTimer = useRef(null);
    const recognitionRef = useRef(null);
    const toastTimerRef = useRef(null);

    const [isAcademic, setIsAcademic] = useState(true);
    const [safetyError, setSafetyError] = useState("");
    const [toast, setToast] = useState(null); // { type: 'success'|'info', message: string }
    // Load history from localStorage on mount
    const [history, setHistory] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem("nexaHistory") || "[]");
            return saved.map(h => ({ ...h, time: new Date(h.time) }));
        } catch { return []; }
    });
    const [historyOpen, setHistoryOpen] = useState(false);
    const historyEndRef = useRef(null);
    const location = useLocation();

    // Persist history to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("nexaHistory", JSON.stringify(history));
    }, [history]);

    // Auto-open history panel when navigated from navbar (?history=open)
    useEffect(() => {
        if (new URLSearchParams(location.search).get("history") === "open") {
            setHistoryOpen(true);
        }
    }, [location.search]);

    const addToHistory = (text, currentMode) => {
        setHistory(prev => [
            { id: Date.now(), prompt: text, mode: currentMode, time: new Date() },
            ...prev
        ].slice(0, 50)); // keep last 50
    };

    const isDiagram = mode === "diagram";
    const isImagine = mode === "imagine";

    const validateSafety = (text) => {
        const restricted = /\b(sex|porn|nsfw|adult|explicit|nude|sexual|violence|blood|gore)\b/i;
        if (restricted.test(text)) {
            setSafetyError("Content restricted for academic safety.");
            return false;
        }
        setSafetyError("");
        return true;
    };

    // VOICE COMMAND LOGIC
    useEffect(() => {
        const SpeechRecognition = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setPrompt(transcript);
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech Error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Your browser does not support Speech Recognition. Try Chrome or Edge.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const generateImage = () => {
        if (!prompt.trim() || !isImagine) return;
        if (!validateSafety(prompt)) return;

        setSafetyError("");
        setIsLoading(true);
        addToHistory(prompt, "imagine");

        // ⚡ Optimized prompt for faster rendering
        const academicSuffix = isAcademic
            ? ", academic illustration, clean 2D vector, white background, educational"
            : ", simple, high quality render";
        const optimizedPrompt = `${prompt}${academicSuffix}`;

        // ⚡ Get API Key from environment if available
        const apiKey = import.meta.env.VITE_POLLINATIONS_API_KEY || "";
        const size = 512;
        const seed = Math.floor(Math.random() * 10000);

        // ⚡ Use the the most modern endpoint (gen.pollinations.ai)
        // If an API key is present, use it to bypass 401/Unauthorized issues
        const baseUrl = apiKey ? "https://gen.pollinations.ai/image" : "https://image.pollinations.ai/prompt";
        const keyParam = apiKey ? `&key=${apiKey}` : "";
        const url = `${baseUrl}/${encodeURIComponent(optimizedPrompt)}?width=${size}&height=${size}&seed=${seed}&nologo=true&model=flux${keyParam}`;

        // Directly set the URL and let the browser handle loading
        setArtUrl(url);
        setPrompt("");
    };

    const generateDiagram = async () => {
        if (!prompt.trim() || !isDiagram) return;
        if (!validateSafety(prompt)) return;
        addToHistory(prompt, "diagram");
        setIsLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [{
                        role: "user",
                        content: `
Generate a VALID Mermaid diagram ONLY.

Rules:
- Use ONLY: graph TD
- Use --> for arrows
- Use professional academic terminology for the syllabus (CBSE/JNTU/SSC).
- For engineering topics, ensure technical schematic accuracy.
- Do NOT use special characters (), {}, :, etc except inside node brackets [ ]
- Do NOT include any explanation
- Output ONLY plain Mermaid code

Topic: ${prompt}
`
                    }]
                }),
            });
            const text = await res.text();
            const cleaned = sanitizeMermaid(text);

            console.log("Mermaid Output:", cleaned);

            if (!cleaned.startsWith("graph")) {
                setChart(`graph TD\n    A[Invalid Response] --> B[Please Try Again]`);
                return;
            }

            // Validate before setting to catch syntax errors early
            try {
                await mermaid.parse(cleaned);
                setChart(cleaned);
                setPrompt("");
            } catch (parseErr) {
                console.error("Mermaid validation failed:", parseErr);
                setChart(`graph TD\n    A[Diagram Error] --> B[Try a simpler topic]`);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (url = null) => {
        if (isImagine || url) {
            const link = document.createElement("a");
            link.download = `nexa-art-${Date.now()}.png`;
            link.href = url || artUrl;
            link.click();
            return;
        }

        if (canvasRef.current) {
            const canvas = await html2canvas(canvasRef.current, { backgroundColor: "#0D0D0D", scale: 3, useCORS: true });
            const link = document.createElement("a");
            link.download = `diagram-${Date.now()}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        }
    };

    return (
        <div className="flex h-screen bg-[#0D0D0D] text-slate-200 overflow-hidden pt-20">
            {/* Toolbar */}
            <div className="w-20 border-r border-white/5 bg-black/40 backdrop-blur-3xl flex flex-col items-center py-8 gap-6 z-10 shadow-2xl">
                <ToolIcon icon={<MousePointer2 size={20} />} active={isDiagram} onClick={() => setMode("diagram")} title="Diagram Mode" />
                <ToolIcon icon={<ImageIcon size={20} />} active={isImagine} onClick={() => setMode("imagine")} title="Imagine Mode" className="text-orange-400" />
                <div className="h-px w-8 bg-white/5 my-2" />
                <ToolIcon icon={<BookOpen size={20} />} active={isAcademic} onClick={() => setIsAcademic(!isAcademic)} title="Academic Mode" className="text-blue-400" />
                <div className="relative">
                    <ToolIcon icon={<History size={20} />} active={historyOpen} onClick={() => setHistoryOpen(o => !o)} title="Prompt History" className="text-purple-400" />
                    {history.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center pointer-events-none">
                            {history.length > 9 ? '9+' : history.length}
                        </span>
                    )}
                </div>
                <div className="h-px w-8 bg-white/5 my-2" />
                <div className="mt-auto flex flex-col gap-6">
                    <ToolIcon icon={<Download size={20} />} onClick={() => handleDownload()} className="text-green-500" title="Export Result" />
                    <ToolIcon icon={<Trash2 size={20} />} onClick={() => { setChart(""); setPrompt(""); setHistory([]); }} className="hover:text-red-500" title="Clear Canvas" />
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#ffffff05_1px,transparent_1px)] [background-size:40px_40px] flex flex-col">
                <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full backdrop-blur-xl group z-40">
                    <Sparkles className="text-orange-500" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                        {isDiagram ? "Neural Node: Diagram Mode" : "Neural Node: Imagine Mode"}
                    </span>
                </div>

                <div className="flex-1 overflow-auto p-12 flex items-center justify-center relative">
                    <div ref={canvasRef} className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] shadow-2xl backdrop-blur-3xl min-w-[75%] min-h-[65%] flex items-center justify-center relative group transition-all duration-500 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

                        {isDiagram && (
                            chart ? <MermaidPreview chart={chart} /> : <div className="text-center animate-pulse"><DiagramIcon size={64} className="mx-auto mb-6 text-slate-800" /></div>
                        )}

                        {isImagine && (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                                <div className="relative group/canvas cursor-zoom-in" onClick={() => setSelectedImage(artUrl)}>
                                    <img
                                        src={artUrl}
                                        alt="Nexa Art"
                                        className={cn(
                                            "max-w-full max-h-[70vh] rounded-2xl shadow-2xl transition-all duration-700",
                                            isLoading ? "opacity-30 blur-sm scale-95" : "opacity-100 blur-0 scale-100"
                                        )}
                                        onLoad={() => {
                                            setIsLoading(false);
                                            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
                                            setToast({ type: "success", message: "✨ Image ready! Click to preview or download." });
                                            toastTimerRef.current = setTimeout(() => setToast(null), 4000);
                                        }}
                                        onError={() => {
                                            setIsLoading(false);
                                            setToast({ type: "error", message: "❌ Failed to generate image. Please try a different prompt." });
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/canvas:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                                        <div className="p-4 bg-white/10 rounded-full border border-white/20"><Maximize2 className="text-white" size={32} /></div>
                                    </div>
                                </div>
                                {isLoading && <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><Zap size={48} className="text-orange-500 animate-pulse" /></div>}
                            </div>
                        )}

                        {isLoading && isDiagram && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-md rounded-[3rem] z-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-orange-400" size={48} />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-400">Nexa Neural Sync...</span>
                            </div>
                        )}
                    </div>

                    {/* Quality Badges */}
                    {isImagine && (
                        <div className="absolute top-10 right-14 flex flex-col gap-3">
                            <QualityBadge label="Cinematic" onClick={() => setPrompt(p => p + ", cinematic lighting, 8k, hyper-detailed")} />
                            <QualityBadge label="Cyberpunk" onClick={() => setPrompt(p => p + ", neon cyberpunk aesthetic")} />
                            <QualityBadge label="Fantasy" onClick={() => setPrompt(p => p + ", epic fantasy style, oil painting")} />
                        </div>
                    )}
                </div>

                {/* AI Input Area */}
                <div className="p-8 border-t border-white/5 bg-black/20 flex flex-col items-center gap-4 backdrop-blur-md">
                    <div className="w-full max-w-4xl flex items-center gap-4">

                        {/* Voice Input Button */}
                        <button
                            type="button"
                            onClick={toggleListening}
                            className={cn(
                                "p-5 rounded-2xl border transition-all active:scale-95 shadow-lg relative",
                                isListening ? "bg-red-500/10 border-red-500/50 text-red-500 animate-pulse" : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                            )}
                            title="Voice Command"
                        >
                            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        <div className="relative group flex-1">
                            <div className="absolute -inset-1 bg-orange-500/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity" />
                            <input
                                type="text"
                                value={prompt}
                                onChange={(e) => { setPrompt(e.target.value); setSafetyError(""); }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        if (isDiagram) generateDiagram();
                                        else if (isImagine) generateImage();
                                    }
                                }}
                                placeholder={safetyError || (isDiagram ? (isListening ? "Listening..." : "Type or speak to visualize...") : (isListening ? "Listening..." : "Type or speak to see art..."))}
                                className={cn(
                                    "w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 focus:ring-orange-500/50 transition-all pr-16 text-sm placeholder:text-slate-700 shadow-2xl relative z-10",
                                    safetyError ? "border-red-500/50 text-red-400 placeholder:text-red-400/50" : ""
                                )}
                            />
                            <button
                                onClick={isDiagram ? generateDiagram : generateImage}
                                disabled={isLoading || !prompt.trim() || !!safetyError}
                                className={cn(
                                    "absolute right-3 top-1/2 -translate-y-1/2 p-3 text-white rounded-xl transition-all z-10 shadow-lg flex items-center gap-2",
                                    "bg-orange-600 hover:scale-105 active:scale-95 shadow-orange-600/30",
                                    safetyError ? "bg-red-600/50 opacity-50" : ""
                                )}
                            >
                                {isDiagram ? <Wand2 size={20} /> : <Zap size={20} className="text-orange-500" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* HISTORY SIDEBAR */}
            <AnimatePresence>
                {historyOpen && (
                    <motion.div
                        key="history-panel"
                        initial={{ x: 320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 320, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                        className="absolute top-0 right-0 h-full w-80 z-30 flex flex-col border-l border-white/5 shadow-2xl"
                        style={{ background: 'linear-gradient(180deg, rgba(10,5,0,0.97) 0%, rgba(20,10,0,0.95) 100%)', backdropFilter: 'blur(24px)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/15 rounded-xl border border-purple-500/20">
                                    <History size={16} className="text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-400">Prompt History</p>
                                    <p className="text-[10px] text-slate-600 mt-0.5">{history.length} entries</p>
                                </div>
                            </div>
                            <button onClick={() => setHistoryOpen(false)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white transition-all">
                                <X size={14} />
                            </button>
                        </div>

                        {/* History List */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-hide">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                                    <div className="p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                                        <Clock size={32} className="text-slate-700 mx-auto" />
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium">No prompts yet.<br />Start generating to see history.</p>
                                </div>
                            ) : (
                                history.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="group relative p-4 bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-orange-500/20 rounded-2xl cursor-pointer transition-all"
                                        onClick={() => { setPrompt(item.prompt); setMode(item.mode); setHistoryOpen(false); }}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={cn(
                                                "mt-0.5 p-1.5 rounded-lg flex-shrink-0",
                                                item.mode === 'imagine' ? 'bg-orange-500/15 border border-orange-500/20' : 'bg-blue-500/15 border border-blue-500/20'
                                            )}>
                                                {item.mode === 'imagine'
                                                    ? <ImageIcon size={12} className="text-orange-400" />
                                                    : <DiagramIcon size={12} className="text-blue-400" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 group-hover:text-white transition-colors">{item.prompt}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full",
                                                        item.mode === 'imagine' ? 'bg-orange-500/15 text-orange-400' : 'bg-blue-500/15 text-blue-400'
                                                    )}>{item.mode}</span>
                                                    <span className="text-[9px] text-slate-600">
                                                        {item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <RotateCcw size={12} className="text-slate-700 group-hover:text-orange-400 transition-colors flex-shrink-0 mt-1" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {history.length > 0 && (
                            <div className="px-4 py-4 border-t border-white/5">
                                <button
                                    onClick={() => setHistory([])}
                                    className="w-full py-3 text-[10px] font-black uppercase tracking-[0.2em] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-xl transition-all"
                                >
                                    Clear All History
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* LIGHTBOX PREVIEW */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-8 cursor-zoom-out"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="relative max-w-5xl w-full h-full flex flex-col items-center justify-center text-center"
                            onClick={e => e.stopPropagation()}
                        >
                            <img src={selectedImage} alt="Preview" className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(249,115,22,0.2)]" />
                            <div className="mt-8 flex items-center gap-6">
                                <button onClick={() => handleDownload(selectedImage)} className="flex items-center gap-3 px-8 py-4 bg-orange-600 text-white rounded-full font-bold hover:scale-105 transition-all shadow-xl shadow-orange-600/30"><Download size={20} /> Download</button>
                                <button onClick={() => setSelectedImage(null)} className="p-4 bg-white/10 text-white rounded-full border border-white/20 hover:bg-white/20 transition-all"><X size={24} /></button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        key="toast"
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-8 right-8 z-[2000] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(249,115,22,0.18) 0%, rgba(30,12,0,0.92) 100%)',
                            borderColor: 'rgba(249,115,22,0.35)',
                            boxShadow: '0 8px 48px rgba(249,115,22,0.25), 0 2px 16px rgba(0,0,0,0.6)'
                        }}
                    >
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30">
                            <Sparkles size={20} className="text-orange-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-400">Neural Canvas</span>
                            <span className="text-sm text-slate-200 font-medium mt-0.5">{toast.message}</span>
                        </div>
                        <button
                            onClick={() => setToast(null)}
                            className="ml-2 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-all"
                        >
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

const ToolIcon = ({ icon, active = false, className = "", onClick = () => { }, title }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            className={cn(
                "p-3 rounded-2xl transition-all active:scale-90 relative",
                active ? "bg-orange-600 text-white shadow-lg shadow-orange-600/30" : "bg-white/5 text-slate-500 hover:text-white hover:bg-white/10",
                className
            )}
        >
            {icon}
        </button>
        {title && (
            <div className="absolute left-full ml-4 px-3 py-1 bg-orange-600 text-[10px] font-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50 uppercase tracking-[0.2em] translate-x-[-10px] group-hover:translate-x-0 shadow-xl">
                {title}
            </div>
        )}
    </div>
);

const QualityBadge = ({ label, onClick = () => { } }) => (
    <button onClick={onClick} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 hover:text-white hover:bg-orange-500/10 hover:border-orange-500/30 transition-all shadow-xl">
        {label}
    </button>
);
