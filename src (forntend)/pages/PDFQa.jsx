import React, { useState } from "react";
import { FileText, Upload, Brain, MessageSquare, Search } from "lucide-react";
import AIAssistant from "@/components/AIAssistant";
import { cn } from "@/lib/utils";

export default function PDFQa() {
    const [fileUploaded, setFileUploaded] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setFileUploaded(true);
        }
    };

    return (
        <div className="flex h-screen bg-[#0D0D0D] text-slate-200 overflow-hidden pt-20">
            {/* Left Panel: Document View */}
            <div className="w-1/2 border-r border-white/5 bg-black/40 backdrop-blur-3xl p-8 flex flex-col">
                <header className="mb-8">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">Source Analysis</h2>
                </header>

                {!fileUploaded ? (
                    <div className="flex-1 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center group hover:border-orange-500/30 transition-all cursor-pointer bg-white/[0.01]" onClick={() => document.getElementById('pdf-upload').click()}>
                        <input type="file" id="pdf-upload" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500/10 transition-all">
                            <Upload className="text-slate-500 group-hover:text-orange-500" size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Drop your PDF here</h3>
                        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">Analyze textbooks, research papers or technical manuals instantly.</p>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5">
                        <FileText size={64} className="text-orange-500 mb-6" />
                        <h3 className="text-xl font-bold text-white mb-2">{fileName}</h3>
                        <p className="text-sm text-slate-500 uppercase font-black tracking-widest">Document Parsed</p>
                        <button onClick={() => setFileUploaded(false)} className="mt-8 px-6 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors">Replace Document</button>
                    </div>
                )}
            </div>

            {/* Right Panel: AI Chat */}
            <div className="w-1/2 flex flex-col overflow-hidden">
                <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Brain size={18} className="text-orange-500" />
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Document Intelligence Active</span>
                    </div>
                </div>
                <div className="flex-1 p-6 overflow-hidden">
                    <AIAssistant 
                        fullWidth={true} 
                        initialQuery={fileUploaded ? `I've uploaded "${fileName}". Please analyze it and summarize the key findings.` : ""}
                    />
                </div>
            </div>
        </div>
    );
}
