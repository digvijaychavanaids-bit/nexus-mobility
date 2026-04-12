import { motion } from 'framer-motion';

const PredictionResultCard = ({ result }) => {
  const percentage = result?.congestion || 72;
  const strokeDasharray = `${percentage}, 100`;

  return (
    <div className="bg-surface-container-high rounded-xl overflow-hidden shadow-2xl border border-on-surface/10/50 font-body transition-all hover:shadow-primary-container/[0.05]">
      <div className="p-8 flex flex-col md:flex-row gap-10 items-center">
        {/* Visual Gauge */}
        <div className="relative w-48 h-48 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path 
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              fill="none" 
              stroke="#1e2022" 
              strokeDasharray="100, 100" 
              strokeWidth="3.5"
            ></path>
            <motion.path 
              initial={{ strokeDasharray: "0, 100" }}
              animate={{ strokeDasharray }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              fill="none" 
              stroke="url(#predictGradient)" 
              strokeDasharray={strokeDasharray} 
              strokeLinecap="round" 
              strokeWidth="3.5"
            ></motion.path>
            <defs>
              <linearGradient id="predictGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#70d8c8"></stop>
                <stop offset="100%" stopColor="#ffb4ab"></stop>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-headline font-black text-on-surface tracking-tighter">{percentage}%</span>
            <span className="text-[10px] text-on-surface font-black uppercase tracking-widest leading-none">Congestion</span>
          </div>
        </div>

        {/* Summary & Variables */}
        <div className="flex-1 space-y-8 flex flex-col items-center md:items-start text-center md:text-left">
          <div className="w-full">
            <h4 className="text-xl font-black text-on-surface mb-2 leading-none tracking-tight uppercase">
              {percentage > 60 ? 'High Congestion Warning' : 'Optimal Path Clearance'}
            </h4>
            <p className="text-on-surface font-black text-[9px] uppercase tracking-[0.2em] opacity-40 leading-relaxed">
              Simulation indicates a {percentage > 60 ? 'high' : 'low'} probability of bottlenecking at major arterial nodes. Expected transit delay: +14.5 minutes.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            <div className="bg-on-surface/5 backdrop-blur-xl p-5 rounded-2xl border border-on-surface/10 shadow-xl flex flex-col items-center text-center">
              <span className="block text-[9px] text-on-surface font-black uppercase mb-3 tracking-[0.2em] opacity-50">Weather Impact</span>
              <div className="text-on-surface text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-lg leading-none">rainy</span>
                Moderate Rain
              </div>
            </div>
            <div className="bg-on-surface/5 backdrop-blur-xl p-5 rounded-2xl border border-on-surface/10 shadow-xl flex flex-col items-center text-center">
              <span className="block text-[9px] text-on-surface font-black uppercase mb-3 tracking-[0.2em] opacity-50">Public Transit</span>
              <div className="text-on-surface text-xs font-black uppercase tracking-widest flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary text-lg leading-none">subway</span>
                Full Op Capacity
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Scale Component */}
      <div className="px-8 pb-8">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-on-surface tracking-widest">
            <span>Relative Density Flow</span>
            <span>Predicted Surge: 17:45</span>
          </div>
          <div className="h-2.5 w-full bg-surface-container-lowest rounded-full overflow-hidden flex ring-1 ring-white/5">
            <div className="h-full bg-tertiary shadow-[0_0_10px_#70d8c8/50]" style={{ width: '30%' }}></div>
            <div className="h-full bg-primary shadow-[0_0_10px_#94ccff/50]" style={{ width: '25%' }}></div>
            <div className="h-full bg-error shadow-[0_0_10px_#ffb4ab/50]" style={{ width: '45%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionResultCard;






