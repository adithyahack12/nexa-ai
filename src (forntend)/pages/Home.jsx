import React, { useState, useRef } from "react";
import AIAssistant from "@/components/AIAssistant";
import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare,
  FileText,
  Code,
  Layout as DiagramIcon,
  Settings,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Zap,
  Globe,
  Mic,
  Send,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [chatStarted, setChatStarted] = useState(false);
  const [initialInput, setInitialInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    const SpeechRecognition = window['SpeechRecognition'] || window['webkitSpeechRecognition'];
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInitialInput(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = (err) => {
        console.error("Speech Recognition Error (Home):", err);
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleStartChat = () => {
    if (initialInput.trim()) {
      setChatStarted(true);
    }
  };

  // Support for deep linking via ?q=... (used by History)
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q");
    if (q) {
      setInitialInput(q);
      setChatStarted(true);
    }
  }, [location.search]);

  return (
    <div className="min-h-screen text-slate-200 selection:bg-orange-500/30 selection:text-white flex flex-col relative">

      <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-10 px-6">
        {!chatStarted ? (
          <div className="max-w-4xl w-full flex flex-col items-center text-center animate-in fade-in zoom-in duration-1000">
            <div className="mb-8 md:mb-12 opacity-5 pointer-events-none select-none">
              <span className="text-6xl md:text-[120px] font-black tracking-tighter uppercase italic">System 1</span>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl md:text-8xl font-bold tracking-tight bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-300 bg-clip-text text-transparent italic leading-tight pb-2">
                NexaAI
              </h1>
              <p className="text-slate-400 text-base md:text-xl font-medium max-w-2xl mx-auto leading-relaxed px-4">
                Intelligence without boundaries. <span className="text-white/60">Everything is free</span> — analyze, visualize, and create in real-time.
              </p>
            </div>

            {/* Suggestions */}
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <SuggestionPill label="Simulate black hole merger" onClick={() => { setInitialInput("Simulate black hole merger"); setChatStarted(true); }} />
              <SuggestionPill label="Refactor this React logic" onClick={() => { setInitialInput("Refactor this React logic"); setChatStarted(true); }} />
              <SuggestionPill label="System design for scaling" onClick={() => { setInitialInput("System design for scaling"); setChatStarted(true); }} />
              <SuggestionPill label="Draft a technical proposal" onClick={() => { setInitialInput("Draft a technical proposal"); setChatStarted(true); }} />
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl h-full animate-in fade-in slide-in-from-bottom-8 duration-700">
            <AIAssistant fullWidth={true} initialQuery={initialInput} />
          </div>
        )}
      </main>

      {/* Hero Input Bar */}
      {!chatStarted && (
        <div className="fixed bottom-20 md:bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-[#020205] via-[#020205]/95 to-transparent z-40">
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative group overflow-hidden rounded-3xl md:rounded-[2.5rem] border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-2xl transition-all focus-within:border-orange-500/30 focus-within:ring-4 focus-within:ring-orange-500/5 flex flex-col">
              <textarea
                value={initialInput}
                onChange={(e) => setInitialInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleStartChat(); }
                }}
                placeholder="Start a session..."
                className="w-full bg-transparent border-none outline-none px-6 py-6 md:px-10 md:py-8 text-base md:text-xl text-white placeholder:text-slate-700 resize-none min-h-[100px] md:min-h-[120px] leading-relaxed pb-20 md:pb-8"
              />
              <div className="absolute right-3 bottom-3 md:right-6 md:bottom-6 flex items-center gap-2 md:gap-4">
                <button
                  onClick={toggleListening}
                  className={cn(
                    "p-3 md:p-4 transition-all active:scale-95 rounded-xl md:rounded-2xl border shadow-xl relative",
                    isListening ? "bg-red-500/20 border-red-500/50 text-red-500 animate-pulse" : "bg-white/5 border-white/10 text-slate-600 hover:text-white hover:bg-white/10"
                  )}
                  title={isListening ? "Listening..." : "Voice Input"}
                >
                  {isListening ? <Mic size={20} className="animate-bounce md:w-6 md:h-6" /> : <Mic size={20} className="md:w-6 md:h-6" />}
                </button>
                <button
                  onClick={handleStartChat}
                  disabled={!initialInput.trim()}
                  className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-xl md:rounded-[1.5rem] font-bold flex items-center gap-2 md:gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-orange-600/20 group text-sm md:text-lg disabled:opacity-50 disabled:hover:scale-100"
                >
                  Ask <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform md:w-5 md:h-5" />
                </button>
              </div>
            </div>
            <p className="hidden md:block text-center mt-6 text-[10px] font-black text-slate-800 uppercase tracking-[0.4em]">
              Experimental Phase • 2026
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const NavPill = ({ icon, label, active = false }) => (
  <button className={cn(
    "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all uppercase tracking-wider",
    active ? "bg-orange-600 text-white shadow-lg shadow-orange-600/20" : "text-slate-500 hover:text-white hover:bg-white/5"
  )}>
    {icon} {label}
  </button>
);

const SuggestionPill = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-6 py-3 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-slate-500 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all active:scale-95"
  >
    {label}
  </button>
);