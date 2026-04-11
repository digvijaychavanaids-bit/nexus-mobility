import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SignalHero from '../components/Signals/SignalHero';
import SignalMap from '../components/Signals/SignalMap';
import SignalFlowScale from '../components/Signals/SignalFlowScale';
import SignalSuggestions from '../components/Signals/SignalSuggestions';
import SignalInsights from '../components/Signals/SignalInsights';
import api from '../services/api';

const SmartSignals = () => {
  const [city, setCity] = useState("Delhi");
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSignals = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/predictions/smart-signals?city=${city}`);
        setSignals(res.data);
      } catch (err) {
        console.error("Failed to fetch signals:", err);
        setSignals([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSignals();
  }, [city]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-16 max-w-[1700px] mx-auto pb-32 font-body"
    >
      <SignalHero city={city} onCityChange={setCity} />

      <AnimatePresence mode="wait">
        <motion.div 
          key={city}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-12 gap-10 items-start"
        >
          {/* Map View Section (Primary - Large) */}
          <div className="col-span-12 lg:col-span-8 space-y-10">
            <SignalMap city={city} signals={signals} loading={loading} />
            <SignalFlowScale />
          </div>

          {/* Signal Suggestions List (Side Rail) */}
          <div className="col-span-12 lg:col-span-4 h-full">
            <SignalSuggestions city={city} signals={signals} loading={loading} />
          </div>
          
          <div className="col-span-12">
            <SignalInsights city={city} />
          </div>
        </motion.div>
      </AnimatePresence>

      <footer className="pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-black text-on-surface-variant uppercase tracking-[0.4em] opacity-20">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Signal Protocol v5.1.0-Neural • Autonomous Grid Sync
        </div>
        <div className="flex items-center gap-12">
          <span className="hover:text-primary transition-colors cursor-help">Latency: 0.8ms</span>
          <span className="hover:text-primary transition-colors cursor-help">Nodes: 12,402</span>
          <span className="hover:text-primary transition-colors cursor-help">Security: AES-4096-QUANTUM</span>
        </div>
      </footer>
    </motion.div>
  );
};

export default SmartSignals;

