import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PlayCircle, Wifi, ShieldCheck, Speaker } from "lucide-react";

interface HomePageProps {
  onStartDemo: () => void;
}

export const HomePage = ({ onStartDemo }: HomePageProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(49,_87,_255,_0.2),_transparent_40%)]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
      </div>

      <div className="container mx-auto px-4 py-16 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 pb-4">
            FireSync Watch Party
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-300 max-w-3xl">
            The Next-Generation Synchronized Streaming Experience. Experience movies and shows together, wherever you are. Real-time sync, AI-powered recommendations, voice control, and smart home integration - all in one seamless platform.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-12"
        >
          <Button
            size="lg"
            className="h-14 px-8 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-full shadow-lg shadow-blue-500/20"
            onClick={onStartDemo}
          >
            <PlayCircle className="w-6 h-6 mr-3" />
            Start Interactive Demo
          </Button>
        </motion.div>

        <motion.div 
          className="mt-20 w-full max-w-5xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 backdrop-blur-lg grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-left">
              <h2 className="text-3xl font-bold text-white">Fire TV & Mobile, Perfectly in Sync</h2>
              <p className="mt-2 text-slate-400">Control the watch party from any device. Your streams are synchronized with less than 100ms latency.</p>
            </div>
            <div className="relative h-48 bg-slate-800/50 rounded-lg flex items-center justify-center">
                <div className="absolute text-blue-300/50"><PlayCircle size={80} strokeWidth={1}/></div>
                <div className="z-10 text-white font-mono text-sm">Fire TV</div>
                <div className="absolute top-4 right-4 text-xs text-green-400 flex items-center gap-1"><Wifi size={14}/> Synchronized</div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-lg text-left">
                    <Wifi className="w-8 h-8 text-blue-400 mb-3"/>
                    <h3 className="text-xl font-semibold">Ultra-Low Latency</h3>
                    <p className="text-slate-400 mt-1">Sub-100ms latency ensures everyone is watching the exact same moment.</p>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }}>
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-lg text-left">
                    <ShieldCheck className="w-8 h-8 text-green-400 mb-3"/>
                    <h3 className="text-xl font-semibold">99.9% Uptime</h3>
                    <p className="text-slate-400 mt-1">Reliable, scalable infrastructure means your party never gets interrupted.</p>
                </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.0 }}>
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-lg text-left">
                    <Speaker className="w-8 h-8 text-purple-400 mb-3"/>
                    <h3 className="text-xl font-semibold">50+ Voice Commands</h3>
                    <p className="text-slate-400 mt-1">Control playback, get recommendations, and more, all with your voice.</p>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}; 