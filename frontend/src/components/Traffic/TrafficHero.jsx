import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';


const TrafficHero = ({ data, filters, setFilters }) => {
  const [showFilters, setShowFilters] = useState(false);
  const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad"];

  const ranges = [
    { id: '24h', label: 'Hour' },
    { id: '7d', label: 'Day' },
    { id: '30d', label: 'Week' }
  ];

  return (
    <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8 font-body z-10">
      <div className="max-w-3xl">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 mb-6 bg-on-surface/5 backdrop-blur-md text-primary rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-on-surface/10 shadow-xl"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Global Mobility Telemetry
        </motion.div>
        
        <h2 className="text-3xl lg:text-4xl font-black text-on-surface tracking-tighter mb-4 leading-tight">
          Metropolitan <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-sky-400">Traffic Analysis</span>
        </h2>
        
        <p className="text-on-surface leading-relaxed font-bold text-sm lg:text-base opacity-80 max-w-xl">
          {data ? `Synchronized telemetry from 142 transit nodes in ${filters.city}. Currently identifying ${data.active_hotspots || 8} critical congestion hotspots with a system-wide resolution of 2.4m.` : 
          "Visualizing arterial density and multimodal flow patterns across the metropolitan transit network. Analyze bottlenecks and historical trends to optimize signaling."}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-on-surface/5 backdrop-blur-md p-1.5 rounded-2xl border border-on-surface/10 shadow-2xl">
          {ranges.map((r) => (
            <button 
              key={r.id}
              onClick={() => setFilters({ ...filters, range: r.id })}
              className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${
                filters.range === r.id 
                  ? 'bg-primary text-on-surface shadow-lg shadow-primary/20 scale-105' 
                  : 'text-on-surface hover:text-on-surface hover:bg-on-surface/5'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button 
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-3 bg-surface-container-highest/20 backdrop-blur-xl border border-on-surface/10 text-on-surface px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-container-highest/30 transition-all active:scale-95 shadow-2xl"
        >
          <span className="material-symbols-outlined text-lg text-primary">tune</span>
          Advanced Filters
        </button>
      </div>

      {/* Advanced Filters Modal */}
      <AnimatePresence>
        {showFilters && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-surface-container border border-on-surface/10 rounded-[2.5rem] p-10 shadow-3xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8">
                <button onClick={() => setShowFilters(false)} className="text-on-surface/40 hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="mb-10">
                <h3 className="text-2xl font-black text-on-surface uppercase tracking-tighter mb-2">Sensor Configuration</h3>
                <p className="text-[10px] text-on-surface font-black uppercase tracking-widest opacity-60">Adjust regional telemetry parameters</p>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-widest mb-4 opacity-40">Regional Jurisdiction</label>
                  <div className="grid grid-cols-2 gap-3">
                    {cities.map(city => (
                      <button
                        key={city}
                        onClick={() => setFilters({ ...filters, city })}
                        className={`px-4 py-3 rounded-xl border text-[11px] font-black uppercase tracking-widest transition-all ${
                          filters.city === city 
                            ? 'bg-primary border-primary text-on-primary shadow-lg' 
                            : 'bg-on-surface/5 border-on-surface/5 text-on-surface/60 hover:border-on-surface/20 hover:bg-on-surface/10'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-on-surface uppercase tracking-widest mb-4 opacity-40">Minimum Congestion Baseline ({filters.minCongestion}%)</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={filters.minCongestion}
                    onChange={(e) => setFilters({ ...filters, minCongestion: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-on-surface/10 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-black text-on-surface/20 uppercase tracking-widest">
                    <span>Optimal</span>
                    <span>Critical</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full py-5 bg-primary text-on-surface rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-xl shadow-primary/20 mt-4"
                >
                  Apply Telemetry Sync
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrafficHero;






