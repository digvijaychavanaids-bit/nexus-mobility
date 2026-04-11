import { motion } from 'framer-motion';


const DistrictHeatmap = ({ data: apiData }) => {
  // Municipal sector density mapping
  const sectors = apiData?.sectors || [
    { id: 'A1', val: 30, alert: false },
    { id: 'A2', val: 60, alert: false },
    { id: 'A3', val: 40, alert: false },
    { id: 'A4', val: 80, alert: true },
    { id: 'B2', val: 20, alert: false },
    { id: 'C2', val: 90, alert: true },
    { id: 'D3', val: 30, alert: false },
    { id: 'E5', val: 60, alert: false },
  ];

  return (
    <div className="col-span-12 lg:col-span-4 bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] p-8 font-body shadow-2xl border border-white/5 hover:bg-white/[0.04] transition-all">
      <div className="mb-10">
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">District Saturation</h3>
        <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">Intensity heatmap per sector 24h average</p>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {sectors.map((sector, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`aspect-square rounded-2xl border flex items-center justify-center transition-all hover:scale-110 cursor-pointer relative group ${
              sector.val > 70 
                ? 'bg-error-container/40 border-error/20 text-error shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : sector.val > 50
                  ? 'bg-secondary-container/20 border-secondary/20 text-secondary'
                  : 'bg-white/5 border-white/5 text-white/40'
            }`}
          >
            {sector.alert ? (
              <span className="material-symbols-outlined text-lg animate-pulse">warning</span>
            ) : (
              <span className="text-[10px] font-black">{sector.id}</span>
            )}
            
            {/* Tooltip Simulation */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-[9px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-2xl">
              Sector {sector.id}% Load
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">Load Gradient</span>
          <span className="text-[9px] font-black text-white uppercase tracking-widest px-2 py-0.5 bg-white/5 rounded-full border border-white/5">0% → 100%</span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden bg-white/5 relative">
           <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/40 to-error/60"></div>
           <div className="absolute top-0 right-0 h-full w-1/4 bg-error shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
        </div>
      </div>
    </div>
  );
};

export default DistrictHeatmap;
