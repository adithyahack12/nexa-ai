import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Zap, 
  Palette, 
  FileSearch, 
  MessageSquare, 
  Layers, 
  Share2, 
  ArrowRight,
  Sparkles,
  Globe,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { motion } from "framer-motion";
import ShareModal from "@/components/ShareModal";

export default function Landing() {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const features = [
    {
      title: "Neural Canvas",
      description: "Experience the future of creativity with our real-time AI image generation engine. Transform thoughts into visuals instantly.",
      icon: <Palette className="w-8 h-8 text-orange-500" />,
      link: "/Canvas",
      color: "from-orange-500/20 to-orange-500/0",
      border: "border-orange-500/20"
    },
    {
      title: "Smart PDF Q&A",
      description: "Upload any document and interact with it. Our AI extracts insights, summarizes content, and answers complex queries in seconds.",
      icon: <FileSearch className="w-8 h-8 text-blue-500" />,
      link: "/PDF",
      color: "from-blue-500/20 to-blue-500/0",
      border: "border-blue-500/20"
    },
    {
      title: "Collaborative Rooms",
      description: "Brainstorm with AI and humans in shared spaces. Perfect for team coordination and collective intelligence workflows.",
      icon: <MessageSquare className="w-8 h-8 text-purple-500" />,
      link: "/Rooms",
      color: "from-purple-500/20 to-purple-500/0",
      border: "border-purple-500/20"
    },
    {
      title: "Knowledge Topics",
      description: "Deep dive into any subject with AI-curated topics. Automatically generated roadmaps and comprehensive explanations.",
      icon: <Layers className="w-8 h-8 text-emerald-500" />,
      link: "/Topics",
      color: "from-emerald-500/20 to-emerald-500/0",
      border: "border-emerald-500/20"
    }
  ];

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white overflow-hidden relative selection:bg-orange-500/30">
      {/* Background Elements */}
      <div className="bg-mesh" />
      <div className="bg-mesh-glow" />
      
      {/* Navbar overlay */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-black/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-400 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">NexaAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Intelligence</a>
            <button 
              onClick={handleShare}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-all flex items-center gap-2"
            >
              <Share2 size={16} /> Share Link
            </button>
          </div>
          
          <button 
             onClick={handleShare}
             className="md:hidden p-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:text-white transition-all active:scale-95"
          >
             <Share2 size={18} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">v2.0 Intelligence Platform</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-none">
              Intelligence without <br />
              <span className="bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-300 bg-clip-text text-transparent italic">Boundaries.</span>
            </h1>
            
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              A comprehensive AI ecosystem designed for creators, researchers, and developers. 
              Everything is free — analyze, visualize, and generate in real-time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/Assistant" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-orange-600 to-orange-500 rounded-2xl text-lg font-bold hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-orange-600/20 flex items-center justify-center gap-3">
                Get Started <ArrowRight size={20} />
              </Link>
              <button 
                onClick={handleShare}
                className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl text-lg font-bold transition-all backdrop-blur-xl flex items-center justify-center gap-3"
              >
                Share with Friends <Share2 size={20} />
              </button>
            </div>
          </motion.div>
        </div>
        
        {/* Floating cards preview */}
        <div className="mt-32 relative max-w-5xl mx-auto h-[400px] hidden lg:block">
           <div className="absolute top-0 left-0 w-64 h-80 bg-white/5 border border-white/10 rounded-3xl rotate-[-12deg] backdrop-blur-xl -translate-x-20 translate-y-20 z-10 animate-pulse">
              <div className="p-6 h-full flex flex-col justify-between">
                <Palette className="w-10 h-10 text-orange-500" />
                <div className="space-y-2">
                  <div className="w-full h-2 bg-white/10 rounded" />
                  <div className="w-2/3 h-2 bg-white/10 rounded" />
                </div>
              </div>
           </div>
           
           <div className="absolute top-0 right-0 w-64 h-80 bg-white/5 border border-white/10 rounded-3xl rotate-[12deg] backdrop-blur-xl translate-x-20 translate-y-10 z-10">
              <div className="p-6 h-full flex flex-col justify-between">
                <FileSearch className="w-10 h-10 text-blue-500" />
                <div className="space-y-2">
                  <div className="w-full h-2 bg-white/10 rounded" />
                  <div className="w-3/4 h-2 bg-white/10 rounded" />
                </div>
              </div>
           </div>

           <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[2.5rem] shadow-2xl z-20 backdrop-blur-2xl p-8 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="w-3/4 h-4 bg-white/20 rounded-full" />
                  <div className="w-1/2 h-4 bg-white/10 rounded-full" />
                  <div className="w-5/6 h-32 bg-white/5 rounded-2xl border border-white/5" />
                  <div className="flex gap-4">
                    <div className="flex-1 h-3 bg-white/10 rounded-full" />
                    <div className="flex-1 h-3 bg-white/10 rounded-full" />
                  </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 relative z-30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Powerful suites of tools.</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Each module is built with state-of-the-art AI technology to provide zero-latency performance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className={`p-8 rounded-[2rem] border ${feature.border} bg-white/[0.02] backdrop-blur-3xl flex flex-col h-full`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-b ${feature.color} flex items-center justify-center mb-8`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-400 mb-8 leading-relaxed flex-1">
                  {feature.description}
                </p>
                <Link to={feature.link} className="flex items-center gap-2 text-sm font-bold text-slate-200 group">
                  Explore Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust/Stats section */}
      <section id="about" className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-black mb-2 tracking-tighter">100%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Free Forever</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 tracking-tighter">Real-time</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generation</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 tracking-tighter">No-Limit</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Processing</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 tracking-tighter">Secure</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Encrypted</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col gap-4 items-center md:items-start">
             <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-orange-500 fill-orange-500" />
              <span className="text-xl font-bold tracking-tighter">NexaAI</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs text-center md:text-left">
              The ultimate open-source intelligence platform for the next generation of building.
            </p>
          </div>
          
          <div className="flex gap-12">
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Modules</span>
              <Link to="/Canvas" className="text-sm text-slate-400 hover:text-white-transition-colors">Canvas</Link>
              <Link to="/PDF" className="text-sm text-slate-400 hover:text-white transition-colors">PDF Q&A</Link>
            </div>
             <div className="flex flex-col gap-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Company</span>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          <span>© 2026 NexaAI Systems • Experimental Phase</span>
          <div className="flex gap-4">
            <Globe size={14} />
            <ShieldCheck size={14} />
            <Cpu size={14} />
          </div>
        </div>
      </footer>
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={window.location.origin}
        title="Check out NexaAI: Intelligence without boundaries. Everything is free — analyze, visualize, and generate in real-time."
      />
    </div>
  );
}
