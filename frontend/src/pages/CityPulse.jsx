import { useState } from 'react';
import { motion } from 'framer-motion';
import LocationGrid from '../modules/nexus/LocationGrid';
import GoldenWindow from '../modules/analytics/GoldenWindow';

const CityPulse = () => {
  const [activeCity, setActiveCity] = useState("Delhi");

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto space-y-12 font-body min-h-screen"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline text-white uppercase tracking-tighter antialiased">City Pulse</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-2 opacity-80 italic italic">Real-Time Municipal Sector Intelligence</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select 
              value={activeCity} 
              onChange={(e) => setActiveCity(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-wider text-white outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer hover:border-primary/30 transition-all backdrop-blur-md"
            >
              <option className="bg-slate-900">Delhi</option>
              <option className="bg-slate-900">Mumbai</option>
              <option className="bg-slate-900">Bangalore</option>
              <option className="bg-slate-900">Chennai</option>
              <option className="bg-slate-900">Hyderabad</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-primary transition-colors text-sm">
              expand_more
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Trend Forecaster */}
        <div className="lg:col-span-4 space-y-8 h-full">
          <GoldenWindow city={activeCity} />
          
          <div className="p-8 bg-surface-container-low rounded-3xl border border-white/5 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
            <h3 className="text-sm font-black font-headline text-white uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">analytics</span>
              Trend Validation
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Municipal intelligence is aggregated every 60 minutes. All predictions are derived directly from physical transit sensors deployed across {activeCity}.
            </p>
          </div>
        </div>

        {/* Right Column: Location Grid */}
        <div className="lg:col-span-8 space-y-8">
           <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 relative overflow-hidden group h-full">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black font-headline text-white uppercase tracking-tighter antialiased">Municipal Grid</h2>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 italic">Spatial Load across metropolitan divisions</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-1.5 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-[8px] font-black uppercase text-green-500 tracking-widest">Normal</span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    <span className="text-[8px] font-black uppercase text-red-500 tracking-widest">Congested</span>
                 </div>
              </div>
            </div>
            
            <LocationGrid city={activeCity} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CityPulse;
