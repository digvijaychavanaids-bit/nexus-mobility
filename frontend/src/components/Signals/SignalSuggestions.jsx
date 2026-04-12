import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const SuggestionCard = ({ title, id, status, current, recommended, type }) => {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setApplying(false);
    setApplied(true);
  };

  const colorClass = type === 'error' ? 'text-error border-error/20 bg-error/5' : type === 'primary' ? 'text-primary border-primary/20 bg-primary/5' : 'text-tertiary border-tertiary/20 bg-tertiary/5';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={`bg-white/[0.03] backdrop-blur-3xl rounded-[2.2rem] p-6 border border-on-surface/10 space-y-6 cursor-pointer group shadow-2xl transition-all duration-500 relative overflow-hidden ring-1 ring-white/5`}
    >
      <div className="flex justify-between items-start relative z-10">
        <div className="space-y-1.5 flex-1 min-w-0">
          <h4 className="text-base font-black text-on-surface uppercase tracking-tight truncate group-hover:text-primary transition-colors">{title}</h4>
          <p className="text-[11px] text-on-surface font-black uppercase tracking-[0.2em] mt-1 opacity-50">ID_NODE: {id.slice(-8).toUpperCase()} • {status}</p>
        </div>
        <div className={`p-2.5 rounded-2xl bg-surface-container border border-on-surface/10 ${colorClass.split(' ')[0]} shadow-xl`}>
           <span className="material-symbols-outlined text-xl leading-none">
             {type === 'error' ? 'priority_high' : type === 'primary' ? 'neurology' : 'check_circle'}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div className="space-y-1.5">
          <span className="text-[10px] text-on-surface uppercase font-black tracking-[0.2em] opacity-40">Current Cycle</span>
          <div className="text-xl font-black text-on-surface tabular-nums">{current}s</div>
        </div>
        <div className="space-y-1.5 pl-4 border-l border-on-surface/10">
          <span className="text-[10px] text-primary uppercase font-black tracking-[0.2em] opacity-70">Proposed</span>
          <div className="text-xl font-black text-primary tabular-nums drop-shadow-[0_0_15px_rgba(148,204,255,0.4)]">{recommended}s</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!applied ? (
          <motion.button 
            key="apply"
            onClick={(e) => { e.stopPropagation(); handleApply(); }}
            disabled={applying}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="w-full h-12 bg-on-surface/5 border border-on-surface/10 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface rounded-xl hover:bg-primary transition-all shadow-xl disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative group/btn"
          >
            {applying ? (
              <>
                <motion.span 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="material-symbols-outlined text-lg"
                >
                  sync
                </motion.span>
                ULINKING TO MESH...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg group-hover/btn:translate-x-1 transition-transform">bolt</span>
                EXECUTE OPTIMIZATION
              </>
            )}
            {applying && (
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-white"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2 }}
              />
            )}
          </motion.button>
        ) : (
          <motion.div 
            key="applied"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-12 text-center text-[10px] font-black text-tertiary bg-tertiary/10 border border-tertiary/20 rounded-xl uppercase tracking-[0.2em] shadow-inner flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">done_all</span>
            PHASE SYNCHRONIZED
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const SignalSuggestions = ({ city, signals, loading }) => {
  return (
    <div className="bg-surface-container/30 backdrop-blur-3xl rounded-[3.5rem] p-8 h-full font-body border border-on-surface/5 shadow-2xl relative overflow-hidden flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <h3 className="text-sm font-black text-on-surface uppercase tracking-[0.3em] leading-none">Neural Mesh Proposals</h3>
          <p className="text-[10px] text-on-surface font-black uppercase tracking-[0.2em] opacity-30">Autonomous Modulation Queue</p>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] text-primary font-black tracking-[0.2em] uppercase">
             {signals.length} ACTIVE
           </span>
        </div>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout" initial={false}>
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center gap-6"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                </div>
              </div>
              <span className="text-xs font-black text-primary uppercase tracking-[0.4em] animate-pulse">Scanning Grid Telemetry...</span>
            </motion.div>
          ) : signals.length === 0 ? (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-32 text-center"
            >
              <span className="text-xs font-black text-on-surface uppercase tracking-[0.4em] opacity-40">No active proposals for {city}</span>
            </motion.div>
          ) : (
            signals.map((s, idx) => (
              <SuggestionCard 
                key={s.id} 
                title={s.intersection}
                id={s.id}
                status={s.status}
                current={60 + (idx * 5)}
                recommended={s.recommended_green_time}
                type={s.status === 'Critical Load' ? 'error' : s.status === 'Optimal Flow' ? 'tertiary' : 'primary'}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-10">
        <button className="w-full text-[10px] font-black text-on-surface flex items-center justify-center gap-3 hover:text-on-surface uppercase tracking-[0.2em] transition-all bg-on-surface/5 py-4 rounded-2xl border border-on-surface/5 hover:bg-on-surface/10 group">
          View Mesh Metadata for {city}
          <span className="material-symbols-outlined text-base group-hover:translate-x-2 transition-transform">arrow_right_alt</span>
        </button>
      </div>
    </div>
  );
};

export default SignalSuggestions;







