import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const SignalIndicator = ({ x, y, label, color, pulse, delay = 0, congestion }) => (
  <motion.div 
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
    style={{ top: `${y}%`, left: `${x}%` }} 
    className={`absolute -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full backdrop-blur-2xl border flex flex-col items-center justify-center transition-all hover:scale-110 z-10 shadow-[0_0_40px_rgba(0,0,0,0.3)] group/indicator ${
      color === 'error' ? 'bg-error/10 border-error/30 text-error' : 
      color === 'tertiary' ? 'bg-tertiary/10 border-tertiary/30 text-tertiary' : 
      'bg-primary/10 border-primary/30 text-primary'
    }`}
  >
    <div className={`absolute inset-0 rounded-full ${pulse ? 'animate-ping opacity-20' : 'opacity-0'} ${
      color === 'error' ? 'bg-error' : color === 'tertiary' ? 'bg-tertiary' : 'bg-primary'
    }`} />
    
    <div className="relative z-10 flex flex-col items-center text-center">
      <span className="material-symbols-outlined text-xl mb-1 group-hover/indicator:rotate-12 transition-transform">
        {color === 'error' ? 'report' : color === 'tertiary' ? 'verified' : 'sensors'}
      </span>
      <span className="text-xs font-black uppercase tracking-tighter leading-none px-2 mb-1">{label}</span>
      <span className="text-[10px] font-bold opacity-60 tabular-nums">{congestion}% LOAD</span>
    </div>

    {/* Connection lines (Subtle) */}
    <div className="absolute top-1/2 left-1/2 w-[200%] h-[1px] bg-white/5 -rotate-45 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    <div className="absolute top-1/2 left-1/2 w-[200%] h-[1px] bg-white/5 rotate-45 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
  </motion.div>
);

const SignalMap = ({ city, signals, loading }) => {
  const [expandedMetrics, setExpandedMetrics] = useState(false);
  const [expandedMesh, setExpandedMesh] = useState(false);

  return (
    <div className="bg-slate-950 rounded-[3.5rem] overflow-hidden relative group aspect-video shadow-2xl border border-white/5 ring-1 ring-white/5">
      {/* Neural Grid Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
        
        {/* Animated Particles/Nodes in background */}
        <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
           {[...Array(20)].map((_, i) => (
             <motion.div
               key={i}
               className="absolute w-1 h-1 bg-primary rounded-full"
               initial={{ 
                 top: `${Math.random() * 100}%`, 
                 left: `${Math.random() * 100}%`,
                 opacity: 0 
               }}
               animate={{ 
                 opacity: [0, 1, 0],
                 scale: [0, 1.5, 0]
               }}
               transition={{ 
                 duration: 2 + Math.random() * 3,
                 repeat: Infinity,
                 delay: Math.random() * 5
               }}
             />
           ))}
        </div>

        <AnimatePresence>
          {!loading && signals.map((s, idx) => (
            <SignalIndicator 
              key={s.id}
              x={s.grid_x} 
              y={s.grid_y} 
              label={s.intersection} 
              color={s.status === 'Critical Load' ? 'error' : s.status === 'Optimal Flow' ? 'tertiary' : 'primary'} 
              pulse={s.status === 'Critical Load'} 
              delay={0.1 + idx * 0.1}
              congestion={s.current_congestion}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Map Overlay Controls */}
      {/* Top Left: Active Processes (Integrated Upperside Header) */}
      <div className="absolute top-6 left-10 z-30">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-primary/10 backdrop-blur-3xl px-4 py-1.5 rounded-xl border border-primary/20 inline-flex items-center gap-2 shadow-xl ring-1 ring-white/5"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(148,204,255,0.8)]"></span>
          </span>
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.3em]">LIVE RADIUS SCAN ACTIVE</span>
        </motion.div>
      </div>

      {/* Top Right: System Health Metrics (Collapsible) */}
      <div className="absolute top-10 right-10 z-20">
        <motion.div 
          layout
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl ring-1 ring-white/5 group/panel transition-all hover:bg-slate-900/50"
        >
          <div 
            onClick={() => setExpandedMetrics(!expandedMetrics)}
            className="p-5 cursor-pointer flex items-center justify-between min-w-[200px] gap-4"
          >
             <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-base">analytics</span>
                <span className="text-[11px] font-black text-white uppercase tracking-[0.25em]">Grid Telemetry</span>
             </div>
             <motion.span 
               animate={{ rotate: expandedMetrics ? 180 : 0 }}
               className="material-symbols-outlined text-on-surface-variant text-base opacity-40"
             >
               expand_more
             </motion.span>
          </div>

          <AnimatePresence>
            {expandedMetrics && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden px-6 pb-6 space-y-5 min-w-[280px]"
              >
                <div className="h-px w-full bg-white/5" />
                <div className="space-y-5">
                  <div className="flex items-center justify-between group/metric text-[11px]">
                    <div className="flex items-center gap-3 text-white uppercase tracking-[0.15em] font-black">
                      <div className="w-2.5 h-2.5 rounded-full bg-error shadow-[0_0_15px_rgba(255,180,171,0.5)] animate-pulse" />
                      {city} Grid Heat
                    </div>
                    <span className="font-black text-error tabular-nums uppercase">HIGH</span>
                  </div>

                  <div className="flex items-center justify-between group/metric text-[11px]">
                    <div className="flex items-center gap-3 text-white uppercase tracking-[0.15em] font-black">
                      <div className="w-2.5 h-2.5 rounded-full bg-tertiary shadow-[0_0_15px_rgba(112,216,200,0.5)]" />
                      Neural Efficiency
                    </div>
                    <span className="font-black text-tertiary tabular-nums uppercase">92%</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom Left: Grid Metadata (Collapsible) */}
      <div className="absolute bottom-10 left-10 z-20">
        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-3xl rounded-2xl border border-white/10 shadow-xl ring-1 ring-white/5 group/panel transition-all hover:bg-slate-900/50"
        >
          <div 
            onClick={() => setExpandedMesh(!expandedMesh)}
            className="px-6 py-4 cursor-pointer flex items-center gap-5"
          >
            <div className="flex flex-col gap-1 font-mono">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] opacity-30">Mesh Node Registry</span>
              <AnimatePresence mode="wait">
                {expandedMesh ? (
                  <motion.span 
                    key="expanded"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-black text-white uppercase tracking-[0.25em]"
                  >
                    {city.toUpperCase()}_SECTOR_ALPHA_{new Date().getFullYear()}
                  </motion.span>
                ) : (
                  <motion.span 
                    key="minimized"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-black text-primary uppercase tracking-[0.25em]"
                  >
                    DEPLOYED: ACTIVE_LINK
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <motion.span 
              animate={{ rotate: expandedMesh ? 180 : 0 }}
              className="material-symbols-outlined text-white/20 text-base"
            >
              expand_less
            </motion.span>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default SignalMap;


