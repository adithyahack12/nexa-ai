import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Twitter, Facebook, Linkedin, MessageCircle, Instagram, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ShareModal({ isOpen, onClose, url, title }) {
    const [copied, setCopied] = React.useState(false);

    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareLinks = [
        {
            name: "WhatsApp",
            icon: <MessageCircle size={22} />,
            color: "bg-[#25D366] hover:shadow-[#25D366]/40",
            href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + "\n" + fullUrl)}`
        },
        {
            name: "X (Twitter)",
            icon: <Twitter size={22} />,
            color: "bg-[#000000] border border-white/20 hover:shadow-white/20",
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
        },
        {
            name: "Facebook",
            icon: <Facebook size={22} />,
            color: "bg-[#1877F2] hover:shadow-[#1877F2]/40",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
        },
        {
            name: "LinkedIn",
            icon: <Linkedin size={22} />,
            color: "bg-[#0A66C2] hover:shadow-[#0A66C2]/40",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`
        },
        {
            name: "Instagram",
            icon: <Instagram size={22} />,
            color: "bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:shadow-[#ee2a7b]/40",
            href: `https://www.instagram.com/`
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md" 
                        onClick={onClose} 
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 30 }}
                        className="relative w-full max-w-[420px] bg-[#0A0A0A] border border-white/10 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Decorative background glow */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 blur-[80px]" />
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 blur-[80px]" />

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <div>
                                <h2 className="text-3xl font-black text-white tracking-tighter italic">Share NexaAI</h2>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] mt-1">Spread the intelligence</p>
                            </div>
                            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 mb-8 relative z-10">
                            <p className="text-xs text-slate-300 leading-relaxed font-medium line-clamp-2 italic">"{title}"</p>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-10 relative z-10">
                            {shareLinks.map(link => (
                                <a 
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-2.5 group"
                                >
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all cursor-pointer group-hover:-translate-y-1 shadow-xl",
                                        link.color
                                    )}>
                                        {link.icon}
                                    </div>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center group-hover:text-white transition-colors">
                                        {link.name.split(' (')[0]}
                                    </span>
                                </a>
                            ))}
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Quick Link</p>
                            </div>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1.5 focus-within:border-orange-500/50 transition-all">
                                <div className="flex-1 truncate text-xs text-slate-400 px-3 font-mono">
                                    {fullUrl}
                                </div>
                                <button 
                                    onClick={handleCopy}
                                    className={cn(
                                        "px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shrink-0",
                                        copied ? "bg-green-600 text-white" : "bg-white text-black hover:bg-slate-200"
                                    )}
                                >
                                    {copied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                    {copied ? "Done" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
