import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Twitter, Facebook, Linkedin, MessageCircle, Instagram } from 'lucide-react';
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
            icon: <MessageCircle size={24} />,
            color: "bg-green-500 hover:bg-green-600",
            href: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + "\n" + fullUrl)}`
        },
        {
            name: "Twitter",
            icon: <Twitter size={24} />,
            color: "bg-sky-500 hover:bg-sky-600",
            href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
        },
        {
            name: "Facebook",
            icon: <Facebook size={24} />,
            color: "bg-blue-600 hover:bg-blue-700",
            href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`
        },
        {
            name: "LinkedIn",
            icon: <Linkedin size={24} />,
            color: "bg-blue-500 hover:bg-blue-600",
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`
        },
        {
            name: "Instagram",
            icon: <Instagram size={24} />,
            color: "bg-pink-500 hover:bg-pink-600",
            href: `https://www.instagram.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl" 
                        onClick={onClose} 
                    />
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#111] border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white italic">Share via</h2>
                            <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-6">{title}</p>

                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-8">
                            {shareLinks.map(link => (
                                <a 
                                    key={link.name}
                                    href={link.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex flex-col items-center gap-3 group"
                                >
                                    <div className={cn("w-14 h-14 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg", link.color)}>
                                        {link.icon}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">{link.name}</span>
                                </a>
                            ))}
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-3">Or copy link</p>
                            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-2 pl-4">
                                <div className="flex-1 truncate text-sm text-slate-300 mr-4">
                                    {fullUrl}
                                </div>
                                <button 
                                    onClick={handleCopy}
                                    className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0"
                                >
                                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
