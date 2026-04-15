import { motion } from 'framer-motion';

const PredictionResultCard = ({ result }) => {
  const percentage = result?.congestion || 0;
  const strokeDasharray = `${percentage}, 100`;

  return (
    <div className="bg-surface-container-high rounded-[2.5rem] overflow-hidden shadow-2xl border border-on-surface/10 font-body transition-all hover:shadow-primary/5">
      <div className="p-10 flex flex-col lg:flex-row gap-12 items-center">
        {/* Visual Gauge */}
        <div className="relative w-56 h-56 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path 
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
              fill="none" 
              stroke="#1e2022" 
              strokeDasharray="100, 100" 
              strokeWidth="3"
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
              strokeWidth="3"
            ></motion.path>
            <defs>
              <linearGradient id="predictGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#4fd1c5"></stop>
                <stop offset="50%" stopColor="#f6ad55"></stop>
                <stop offset="100%" stopColor="#f56565"></stop>
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-on-surface tracking-tighter">{percentage}%</span>
            <span className="text-[10px] text-on-surface font-black uppercase tracking-[0.3em] opacity-60">Congestion</span>
          </div>
        </div>

        {/* Summary & Details */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="space-y-3">
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 items-center">
              <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                {result.city}
              </span>
              <span className="px-4 py-1.5 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full border border-secondary/20">
                {result.label} ({result.day})
              </span>
              <span className="px-4 py-1.5 bg-tertiary/10 text-tertiary text-[10px] font-black uppercase tracking-widest rounded-full border border-tertiary/20">
                {result.time}
              </span>
            </div>
            <h4 className="text-3xl font-black text-on-surface uppercase tracking-tight">
              {result.emoji} {result.status}
            </h4>
            <p className="text-on-surface text-sm font-medium opacity-70 max-w-xl">
              {result.advice} Simulation predicts an estimated delay of <b>+{result.delay} minutes</b> compared to free-flow traffic.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-on-surface/5 p-5 rounded-[1.5rem] border border-on-surface/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary uppercase font-black text-[8px]">
                {result.weather}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Weather Factor</p>
                <p className="text-sm font-black text-on-surface uppercase">{result.weather}</p>
              </div>
            </div>
            <div className="bg-on-surface/5 p-5 rounded-[1.5rem] border border-on-surface/5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-xl">{result.is_holiday ? 'event_available' : 'event_busy'}</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Special Status</p>
                <p className="text-sm font-black text-on-surface uppercase">
                  {result.is_holiday ? 'Public Holiday' : result.is_event ? 'Special Event' : 'Standard Day'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-10 py-6 bg-on-surface/5 border-t border-on-surface/5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${result.is_peak ? 'bg-error animate-pulse' : 'bg-success'}`}></span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface opacity-60">
            {result.is_peak ? 'Peak Hour Surcharge Probability: High' : 'Standard Traffic Window'}
          </span>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface opacity-40">
          Source: Neural Mobility Engine v5.0-Enhanced
        </div>
      </div>
    </div>
  );
};

export default PredictionResultCard;
