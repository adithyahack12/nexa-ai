import React, { useState, useEffect, useRef } from "react";
import { Send, User, Bot, Loader2, RotateCcw, Image as ImageIcon, Mic, MicOff, Volume2, Maximize2, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";
import { cn } from "@/lib/utils";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "Inter, sans-serif",
  flowchart: { htmlLabels: false, curve: "basis" },
});

// Deep sanitizer for Mermaid v11 compatibility
const sanitizeMermaid = (raw) => {
  // Step 1: Strip markdown code fences
  let code = raw
    .replace(/```mermaid/gi, "")
    .replace(/```/g, "")
    .trim();

  // Step 2: Extract only lines from 'graph' onwards (drop AI preamble text)
  const lines = code.split("\n");
  const graphStart = lines.findIndex(l => /^\s*(graph|flowchart)\s+(TD|LR|TB|RL|BT)/i.test(l));
  if (graphStart === -1) return code; // return as is if no graph tag found
  const diagramLines = lines.slice(graphStart);

  // Step 3: Clean each line
  const cleaned = diagramLines.map(line => {
    let l = line;
    // Replace smart/curly quotes
    l = l.replace(/[\u2018\u2019\u201C\u201D`]/g, "'");
    // Remove edge label text e.g. -->|label| → --> to avoid v11 parse issues
    l = l.replace(/-->[|]([^|]*)[|]/g, "-->");
    l = l.replace(/---[|]([^|]*)[|]/g, "---");
    // Clean colons inside square-bracket labels
    l = l.replace(/\[([^\]]*)\]/g, (match, inner) => {
      const safe = inner
        .replace(/:/g, " -")
        .replace(/[{}()/\\<>]/g, " ")
        .replace(/"/g, "'")
        .replace(/  +/g, " ")
        .trim();
      return `[${safe}]`;
    });
    // Fix node IDs that start with a digit → prefix with 'N'
    l = l.replace(/^(\s*)(\d)(\w*)(\s*-->|\s*---)/g, '$1N$2$3$4');
    return l;
  });

  return cleaned.join("\n").trim();
};

const Mermaid = ({ chart }) => {
  const ref = useRef(null);
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!ref.current || !chart) return;
    setError(false);
    setErrMsg("");

    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    const renderDiagram = async () => {
      try {
        // Re-initialize to clear any stale state from previous renders
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "Inter, sans-serif",
          flowchart: { htmlLabels: false, curve: "basis" },
        });

        const cleaned = sanitizeMermaid(chart);
        await mermaid.parse(cleaned);
        const { svg } = await mermaid.render(id, cleaned);
        if (ref.current) ref.current.innerHTML = svg;
      } catch (e) {
        console.error("Mermaid Render Error:", e);
        setError(true);
        setErrMsg(e?.message || "Diagram syntax issue");
      }
    };

    renderDiagram();
  }, [chart]);

  if (error) {
    return (
      <div className="my-6 p-6 bg-red-900/10 rounded-2xl border border-red-500/20 text-center">
        <p className="text-red-400 text-xs font-bold mb-1">⚠ Diagram Syntax Error</p>
        <p className="text-[10px] text-red-300/50 italic line-clamp-2">{errMsg}</p>
      </div>
    );
  }

  return (
    <div className="my-6 p-6 bg-slate-900/50 rounded-2xl border border-white/10 shadow-2xl overflow-x-auto flex justify-center">
      <div ref={ref} className="mermaid transition-all duration-500 hover:scale-[1.01]" />
    </div>
  );
};

const ChatBubble = ({ role, content, onImageClick }) => {
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const downloadImage = (url, name) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "diagram.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className="flex w-full items-start gap-4 md:gap-6"
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 transition-transform",
            role === "user"
              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
              : "bg-white/10 text-slate-300 border border-white/10"
          )}
        >
          {role === "user" ? <User size={16} /> : <Bot size={16} />}
        </div>
        <div
          className={cn(
            "flex-1 text-[15px] leading-7 text-slate-200 break-words overflow-hidden py-1",
            role === "user" ? "font-medium" : ""
          )}
        >
          {role === "assistant" && (
            <button
              onClick={() => speak(content)}
              className="absolute -right-10 top-2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Read Aloud"
            >
              <Volume2 size={14} />
            </button>
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              img: ({ node, src, alt, ...props }) => (
                <div className="my-4 rounded-xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-100 relative group/img">
                  <img
                    src={src}
                    alt={alt}
                    className="max-w-full h-auto cursor-zoom-in transition-transform duration-500 hover:scale-[1.02]"
                    onClick={() => onImageClick({ src, alt })}
                  />
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover/img:opacity-100 transition-opacity">
                    <button
                      onClick={() => onImageClick({ src, alt })}
                      className="p-2 bg-black/60 text-white rounded-lg backdrop-blur-md hover:bg-black/80"
                    >
                      <Maximize2 size={14} />
                    </button>
                    <button
                      onClick={() => downloadImage(src, alt)}
                      className="p-2 bg-black/60 text-white rounded-lg backdrop-blur-md hover:bg-black/80"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ),
              code: ({ node, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const cleanProps = Object.fromEntries(
                  Object.entries(props).filter(([key]) => key !== 'inline')
                );
                if (match && match[1] === "mermaid") {
                  return <Mermaid chart={String(children).replace(/\n$/, "")} />;
                }
                return match ? (
                  <div className="my-4 rounded-lg overflow-hidden border border-slate-900 shadow-2xl">
                    <div className="bg-slate-800 px-4 py-1 text-[10px] text-slate-400 font-mono border-b border-white/5 flex justify-between items-center">
                      <span>{match[1].toUpperCase()}</span>
                    </div>
                    <code className={cn("block p-4 bg-slate-900 text-pink-400 text-xs font-mono overflow-x-auto", className)} {...cleanProps}>{children}</code>
                  </div>
                ) : (
                  <code className="bg-white/10 text-pink-500 px-1.5 py-0.5 rounded text-xs font-mono font-bold" {...cleanProps}>{children}</code>
                );
              },
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default function AIAssistant({ fullWidth = false, initialQuery = "" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const recognitionRef = useRef(null);
  const endOfChatRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (initialQuery) {
      handleDirectMessage(initialQuery);
    }
  }, [initialQuery]);

  const handleDirectMessage = async (text) => {
    if (!text.trim()) return;
    const userMessage = { role: "user", content: text };
    setMessages([userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [userMessage] }),
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingText(fullResponse);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: fullResponse }]);
      setStreamingText("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const SpeechRecognition = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = (err) => {
        console.error("Speech Recognition Error (Assistant):", err);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const scrollToBottom = () => {
    endOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText, isLoading]);

  const sendMessage = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingText("");
    try {
      // Save to global history
      const savedHistory = JSON.parse(localStorage.getItem("nexaHistory") || "[]");
      const newEntry = { id: Date.now(), prompt: text, mode: "chat", time: new Date() };
      localStorage.setItem("nexaHistory", JSON.stringify([newEntry, ...savedHistory].slice(0, 50)));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingText(fullResponse);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: fullResponse }]);
      setStreamingText("");
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `❌ Error: ${error.message}\n\nPlease check your GEMINI_API_KEY in .env.local and ensure the server is running.` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingText("");
    setIsLoading(false);
  };

  const downloadImage = (url, name) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = name || "diagram.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={cn(
      "flex flex-col w-full max-w-full mx-auto relative",
      fullWidth ? "h-[calc(100vh-120px)]" : "h-[750px] rounded-3xl border border-white/5 bg-black/40 backdrop-blur-3xl shadow-2xl"
    )}>
      {!fullWidth && (
        <div className="p-5 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" /></div>
            <div>
              <h2 className="font-bold text-sm text-white tracking-tight">Nexa Study Buddy</h2>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Academic Support Active</p>
            </div>
          </div>
          <button onClick={clearChat} className="p-2 px-4 text-xs font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-2 transition-all active:scale-95 border border-white/10">
            <RotateCcw size={14} /> Reset
          </button>
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 md:px-0 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        <div className="max-w-3xl mx-auto w-full py-8 md:py-12">
        {messages.length === 0 && !streamingText && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 text-white shadow-2xl transition-transform hover:rotate-6 duration-300">
              <Bot size={40} />
            </div>
            <h3 className="font-bold text-2xl text-white mb-3 tracking-tight">What are we studying today?</h3>
            <p className="text-slate-400 max-w-[320px] text-sm leading-relaxed">
              Ask me to <span className="text-indigo-400 font-bold">explain a concept</span>, solve a math problem, or visualize a complex process step-by-step.
            </p>
          </div>
        )}
        {messages.map((m, i) => <ChatBubble key={i} {...m} onImageClick={setSelectedImage} />)}
        {streamingText && <ChatBubble role="assistant" content={streamingText} onImageClick={setSelectedImage} />}
        {isLoading && !streamingText && (
          <div className="flex justify-start items-center gap-3 mb-6 animate-pulse">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/10"><Loader2 size={18} className="animate-spin text-indigo-400" /></div>
            <div className="h-10 w-24 bg-white/5 rounded-2xl border border-white/5" />
          </div>
        )}
        </div>
        <div ref={endOfChatRef} />
      </div>

      <form onSubmit={sendMessage} className="pb-4 pt-2 px-4 md:px-0 bg-transparent">
        <div className="max-w-3xl mx-auto w-full relative">
          <div className="bg-[#1f1f1f] border border-white/10 rounded-[28px] p-2 flex items-end gap-2 shadow-2xl focus-within:border-white/20">
            <button
              type="button"
              onClick={() => document.getElementById('file-upload').click()}
              className="p-3 mb-0.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 shrink-0"
              title="Upload File"
            >
              <RotateCcw size={20} className="rotate-45" />
            </button>

            <button
              type="button"
              onClick={() => document.getElementById('image-upload').click()}
              className="p-3 mb-0.5 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 shrink-0"
              title="Upload Image"
            >
              <ImageIcon size={20} />
            </button>

            <textarea 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }} 
              placeholder="Ask anything..." 
              rows={1} 
              disabled={isLoading} 
              className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-[15px] text-white placeholder:text-slate-500 resize-none max-h-[200px] overflow-y-auto scrollbar-none" 
            />

            <div className="flex items-center gap-1 mb-0.5 mr-1">
              <button 
                type="button" 
                onClick={toggleListening} 
                className={cn(
                  "p-3 rounded-full transition-all active:scale-95",
                  isListening ? "bg-red-500/20 text-red-500" : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              <button 
                type="submit" 
                disabled={isLoading || !input.trim()} 
                className={cn(
                  "p-3 rounded-full transition-all flex items-center justify-center",
                  isLoading || !input.trim() 
                    ? "text-slate-700 cursor-not-allowed" 
                    : "bg-white text-black hover:bg-slate-200 active:scale-90"
                )}
              >
                <Send size={18} fill="currentColor" />
              </button>
            </div>
          </div>
          <p className="text-center mt-3 text-[11px] text-slate-500">
            NexaAI can make mistakes. Check important info.
          </p>
        </div>
      </form>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedImage(null)} className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center">
              <img src={selectedImage.src} alt={selectedImage.alt} className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-[0_0_100px_rgba(255,255,255,0.1)]" />
              <div className="mt-6 flex flex-col items-center gap-4">
                <p className="text-white font-bold text-lg text-center">{selectedImage.alt}</p>
                <div className="flex gap-4">
                  <button onClick={(e) => { e.stopPropagation(); downloadImage(selectedImage.src, selectedImage.alt); }} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:scale-105 shadow-xl"><Download size={20} /> Download</button>
                  <button onClick={() => setSelectedImage(null)} className="px-6 py-3 bg-white/10 text-white rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all">Close</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
