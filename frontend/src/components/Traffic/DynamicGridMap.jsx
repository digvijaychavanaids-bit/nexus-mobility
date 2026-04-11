import React, { useMemo } from 'react';
import { motion } from 'framer-motion';


const DynamicGridMap = React.memo(({ 
  city = 'Delhi', 
  trafficLoad = 0,
  activeAlerts = 0 
}) => {
  // Use useMemo to generate the grid of nodes once or when props change significantly
  // This avoids re-calculating nodes unnecessarily on every frame
  const nodes = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: 15 + (i * 7) % 70,
      y: 20 + (i * 13) % 60,
      size: 2 + (i % 3),
      delay: i * 0.2
    }));
  }, []);

  return (
    <div className="w-full aspect-[21/9] bg-slate-950 rounded-[2.5rem] overflow-hidden relative font-body border border-white/5 shadow-2xl group transform-gpu">
      {/* Neural Mesh Background (SVG) */}
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,204,255,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        
        {/* Connection Lines (Moving) - Linear ease for smoother performance */}
        <motion.path
          d="M 10 20 L 90 80 M 30 10 L 70 90 M 10 90 L 90 10"
          stroke="rgba(148,204,255,0.03)"
          strokeWidth="1"
          strokeDasharray="10 10"
          animate={{ strokeDashoffset: [0, -100] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />

        {/* Pulsating Nodes - Optimized for hardware acceleration */}
        {nodes.map((node) => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r={node.size}
            fill={node.id % 4 === 0 ? "rgba(148,204,255,0.4)" : "rgba(148,204,255,0.15)"}
            initial={{ opacity: 0.2 }}
            animate={{ 
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1] 
            }}
            transition={{ 
              duration: 4, 
              delay: node.delay, 
              repeat: Infinity 
            }}
            style={{ willChange: 'transform, opacity' }}
          />
        ))}
      </svg>
      {/* Floating Meta-Data Overlays */}
      <div className="absolute top-8 left-8 space-y-2 pointer-events-none">
        <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-3xl px-4 py-2 rounded-full border border-white/10 ring-1 ring-white/5">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(148,204,255,1)]" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Neural Mesh Tracking: {city.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/40 backdrop-blur-3xl px-4 py-2 rounded-full border border-white/10 ring-1 ring-white/5 w-fit">
          <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60">Resolution: 1.4m GSD</span>
        </div>
      </div>

      <div className="absolute top-8 right-8 text-right hidden lg:block pointer-events-none">
        <p className="text-[10px] font-black text-white uppercase tracking-widest opacity-20 font-mono">INFRASTRUCTURE_LINK_ACTIVE</p>
        <p className="text-[10px] font-black text-primary uppercase tracking-widest font-mono mt-1">SECURED_NODE_CHANNELS: {trafficLoad > 0 ? (120 + (trafficLoad % 30)) : 142}</p>
      </div>

      {/* Center Metric Panels */}
      <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row items-center justify-center gap-4">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-slate-950/80 backdrop-blur-2xl px-6 py-5 rounded-[1.5rem] border border-white/10 shadow-3xl min-w-[180px] ring-1 ring-white/5 cursor-default"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Metropolitan Load</span>
            <span className="material-symbols-outlined text-sm text-primary">analytics</span>
          </div>
          <div className="text-3xl font-black text-white tracking-tighter tabular-nums flex items-baseline gap-1">
            {trafficLoad}<span className="text-xs text-primary font-bold">%</span>
          </div>
          <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(trafficLoad, 100)}%` }}
              className="h-full bg-primary shadow-[0_0_15px_rgba(148,204,255,0.6)]"
            />
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-slate-950/80 backdrop-blur-2xl px-6 py-5 rounded-[1.5rem] border border-white/10 shadow-3xl min-w-[180px] ring-1 ring-white/5 cursor-default"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Anomalies</span>
            <span className="material-symbols-outlined text-sm text-error">warning</span>
          </div>
          <div className={`text-3xl font-black tracking-tighter tabular-nums ${activeAlerts > 5 ? 'text-error' : 'text-white'}`}>
            {activeAlerts.toString().padStart(2, '0')}
          </div>
          <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((activeAlerts / 15) * 100, 100)}%` }}
              className={`h-full ${activeAlerts > 5 ? 'bg-error shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-primary'}`}
            />
          </div>
        </motion.div>
      </div>

      {/* Subtle scanline overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(0deg,transparent_50%,rgba(148,204,255,0.1)_50%)] bg-[length:100%_2px]" />
    </div>
  );
});

export default DynamicGridMap;
