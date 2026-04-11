import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';


const InsightCard = ({ title, value, sub, icon, color, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] relative overflow-hidden group border border-white/5 shadow-2xl hover:bg-white/[0.05] transition-all duration-700 ring-1 ring-white/5 h-full"
  >
    <div className="absolute -top-6 -right-6 p-10 opacity-[0.02] group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-1000">
      <span className={`material-symbols-outlined text-[10rem] leading-none ${color}`}>{icon}</span>
    </div>
    
    <div className="relative z-10 space-y-6">
      <div className="flex items-center gap-3">
        <span className={`material-symbols-outlined text-lg ${color}`}>{icon}</span>
        <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em] leading-none opacity-50 group-hover:opacity-100 transition-opacity">{title}</p>
      </div>
      
      <div className="space-y-1.5">
        <h4 className={`text-5xl font-black tracking-tighter ${color} tabular-nums group-hover:scale-105 transition-transform origin-left duration-500`}>{value}</h4>
        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{sub}</p>
      </div>
    </div>
    
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
  </motion.div>
);

const SignalInsights = ({ city }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/predictions/signal-insights?city=${city}`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch signal insights:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, [city]);

  if (loading || !data) return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-64 bg-white/5 rounded-[3rem] animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 font-body">
      <InsightCard 
        title="Mesh Efficiency" 
        value={data.efficiency} 
        sub={`Peak wait reduction across the ${city} municipal neural grid`} 
        icon="avg_pace" 
        color="text-primary" 
        delay={0.1}
      />
      <InsightCard 
        title="Emission Mitigation" 
        value={data.co2_saved} 
        sub="Estimated carbon offset from optimized idling protocols" 
        icon="eco" 
        color="text-tertiary" 
        delay={0.2}
      />
      <InsightCard 
        title="Node Reliability" 
        value={data.reliability} 
        sub={`Active sensor health across ${data.total_nodes} metropolitan nodes`} 
        icon="hub" 
        color="text-white" 
        delay={0.3}
      />
    </div>
  );
};

export default SignalInsights;

