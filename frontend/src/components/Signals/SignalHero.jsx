import { motion } from 'framer-motion';


const SignalHero = ({ city, onCityChange }) => {
  const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad"];

  return (
    <div className="flex flex-col lg:flex-row justify-between lg:items-end gap-10 font-body relative">
      <div className="max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2.5 px-4 py-2 mb-8 bg-primary/10 backdrop-blur-xl text-primary rounded-full text-xs font-black tracking-[0.2em] uppercase border border-primary/20 shadow-[0_0_20px_rgba(148,204,255,0.1)]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Neural Grid Synchronization: Active
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-[0.95] mb-6"
        >
          Smart Signal <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-400 to-tertiary">Optimization</span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-on-surface-variant leading-relaxed font-medium text-base lg:text-lg opacity-60 max-w-2xl"
        >
          The Nexus Optimization Engine synchronizes city-wide intersection flow using real-time neural telemetry. 
          Analyzing {city}'s municipal grid for autonomous phase adjustments and throughput maximization.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap items-center gap-6"
      >
        <div className="flex bg-white/[0.03] backdrop-blur-2xl p-1.5 rounded-[1.5rem] border border-white/10 shadow-2xl overflow-hidden">
          {cities.map((c) => (
            <button 
              key={c}
              onClick={() => onCityChange(c)}
              className={`px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-500 relative group ${
                city === c 
                  ? 'text-white' 
                  : 'text-on-surface-variant hover:text-white'
              }`}
            >
              {city === c && (
                <motion.div 
                  layoutId="activeCity"
                  className="absolute inset-0 bg-primary rounded-xl shadow-[0_0_20px_rgba(148,204,255,0.4)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{c}</span>
            </button>
          ))}
        </div>

        <button className="h-16 px-10 rounded-2xl bg-gradient-to-br from-primary to-sky-600 text-white text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:shadow-[0_0_30px_rgba(148,204,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl group">
          <span className="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-700">sync</span>
          Force Neural Sync
        </button>
      </motion.div>
    </div>
  );
};

export default SignalHero;

