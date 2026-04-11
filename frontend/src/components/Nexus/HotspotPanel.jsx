import { motion } from 'framer-motion';


const HotspotPanel = ({ city = 'Delhi' }) => {
  const sensors = [
    { name: '5th & Madison', traffic: '85% Gridlock', aqi: 128, impact: 'High Impact', color: 'error' },
    { name: 'Market St Square', traffic: '42% Flow', aqi: 64, impact: 'Moderate', color: 'tertiary' },
    { name: 'Lincoln Tunnel Exit', traffic: '96% Congestion', aqi: 142, impact: 'Critical', color: 'error' },
    { name: 'Central Park West', traffic: '12% Sparse', aqi: 18, impact: 'Minimal', color: 'tertiary' },
  ];

  return (
    <div className="col-span-12 lg:col-span-4 space-y-8 font-body">
      {/* Map Preview Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] overflow-hidden h-[320px] relative group cursor-pointer shadow-2xl border border-white/5"
      >
        <img 
          className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[2000ms]" 
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
          alt="Hotspot Map"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-8 flex flex-col justify-end">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-black text-white uppercase tracking-tighter">Particulate Grid</h4>
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">Live sensor network: {city}</p>
            </div>
            <div className="bg-tertiary/20 p-3 rounded-2xl backdrop-blur-md border border-tertiary/30 shadow-xl">
              <span className="material-symbols-outlined text-tertiary">satellite_alt</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Critical Intersections */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] p-8 shadow-2xl border border-white/5"
      >
        <div className="mb-8">
          <h3 className="text-lg font-black text-white uppercase tracking-tight">Critical Hubs</h3>
          <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60 mt-1">Metropolitan Particulate Peaks</p>
        </div>

        <div className="space-y-4">
          {sensors.map((sensor, i) => (
            <motion.div 
              key={i} 
              whileHover={{ x: 5 }}
              className="bg-white/[0.02] p-5 rounded-2xl flex items-center justify-between hover:bg-white/[0.05] transition-all group border border-white/5 shadow-sm"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-transform ${
                  sensor.color === 'error' 
                    ? 'bg-error/10 border-error/20 text-error shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                    : 'bg-tertiary/10 border-tertiary/20 text-tertiary shadow-[0_0_10px_rgba(112,216,200,0.2)]'
                }`}>
                  <span className="material-symbols-outlined text-xl">
                    {sensor.color === 'error' ? 'fluorescent' : 'eco'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white uppercase tracking-tight truncate">{sensor.name}</p>
                  <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate mt-0.5">{sensor.traffic}</p>
                </div>
              </div>
              <div className="text-right pl-4 shrink-0 border-l border-white/5 ml-2">
                <p className={`text-xl font-black leading-tight tabular-nums ${sensor.color === 'error' ? 'text-error' : 'text-tertiary'}`}>
                  {sensor.aqi}
                </p>
                <p className="text-[8px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">{sensor.impact}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <button className="w-full mt-8 py-4 rounded-2xl bg-white/5 text-white/60 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all border border-white/5 shadow-xl active:scale-95">
          View All 42 Sensor Nodes
        </button>
      </motion.div>
    </div>
  );
};

export default HotspotPanel;
