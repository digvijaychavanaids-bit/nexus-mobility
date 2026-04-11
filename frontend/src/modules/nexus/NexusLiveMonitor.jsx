// import { motion } from 'framer-motion'; // Unused
import DynamicGridMap from '../../components/Traffic/DynamicGridMap';


const NexusLiveMonitor = ({ city = "Delhi", stats }) => {
  const trafficLoad = stats?.avg_traffic_index || 0;
  const activeAlerts = stats?.active_alerts || 0;
  
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] bg-black h-full">
      {/* Subtle Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_2px] opacity-10" />
      </div>

      {/* HUD Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-3 pointer-events-none flex justify-between items-start">
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
          <p className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Live • {city}</p>
        </div>
        
        <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
            Vehicles: {stats?.active_vehicles?.toLocaleString() || '—'}
          </p>
        </div>
      </div>

      {/* HUD Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 p-3 pointer-events-none flex justify-between items-end">
        <div className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-white/5">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Traffic Metrics</p>
          <div className="flex gap-3">
            <div>
              <p className="text-[7px] font-black text-slate-500 uppercase mb-0.5">Load</p>
              <p className="text-xs font-black text-primary">{trafficLoad}%</p>
            </div>
            <div className="w-px bg-white/5" />
            <div>
              <p className="text-[7px] font-black text-slate-500 uppercase mb-0.5">Speed</p>
              <p className="text-xs font-black text-tertiary">{stats?.velocity || '—'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-white/5">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${activeAlerts > 5 ? 'bg-error' : activeAlerts > 0 ? 'bg-yellow-500' : 'bg-green-500'}`} />
            <p className="text-xs font-black text-white">
              {activeAlerts > 5 ? 'Critical' : activeAlerts > 0 ? 'Warning' : 'Optimal'}
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="h-full relative z-10">
        <DynamicGridMap 
          city={city} 
          trafficLoad={trafficLoad}
          activeAlerts={activeAlerts}
        />
      </div>
    </div>
  );
};

export default NexusLiveMonitor;
