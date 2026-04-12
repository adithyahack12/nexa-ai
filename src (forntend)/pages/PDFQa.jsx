import React, { useState } from "react";
import { FileText, Upload, Brain, MessageSquare, Search } from "lucide-react";
import AIAssistant from "@/components/AIAssistant";
import { cn } from "@/lib/utils";

export default function PDFQa() {
    const [fileUploaded, setFileUploaded] = useState(false);
    const [fileName, setFileName] = useState("");
    const [extractedText, setExtractedText] = useState("");
    const [isParsing, setIsParsing] = useState(false);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file.name);
            setIsParsing(true);
            
            try {
                // Load pdfjs from CDN dynamically if not already present
                if (!window['pdfjsLib']) {
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
                    document.head.appendChild(script);
                    await new Promise(resolve => script.onload = resolve);
                }

                const pdfjsLib = window['pdfjsLib'];
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                
                let fullText = "";
                for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limit to 10 pages for speed
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map(item => item.str).join(" ") + "\n";
                }

                setExtractedText(fullText);
                setFileUploaded(true);
            } catch (error) {
                console.error("PDF Parsing Error:", error);
                alert("Failed to parse PDF. Please try a simpler file.");
            } finally {
                setIsParsing(false);
            }
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
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                        {isParsing ? (
                             <div className="flex flex-col items-center animate-pulse">
                                <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">Neural Extraction...</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest">Parsing Document Context</p>
                             </div>
                        ) : (
                            <>
                                <FileText size={64} className="text-orange-500 mb-6" />
                                <h3 className="text-xl font-bold text-white mb-2">{fileName}</h3>
                                <p className="text-sm text-slate-500 uppercase font-black tracking-widest">Document Integrated</p>
                                <div className="mt-6 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
                                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">{extractedText.split(' ').length} Words Analyzed</span>
                                </div>
                                <button onClick={() => { setFileUploaded(false); setExtractedText(""); }} className="mt-8 px-6 py-2 text-xs font-bold text-slate-500 hover:text-white transition-colors">Replace Document</button>
                            </>
                        )}
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
                        key={`${fileName}-${extractedText.length}`} 
                        initialQuery={fileUploaded ? `I've successfully integrated the document "${fileName}".\n\nCONTEXT FROM DOCUMENT:\n${extractedText.substring(0, 3000)}\n\nBased on this context, please provide a comprehensive summary and let me know if you'd like to dive into specific details.` : ""}
                    />
                </div>
            </div>
        </div>
    );
}
