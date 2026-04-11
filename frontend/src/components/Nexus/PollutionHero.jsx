import { motion } from 'framer-motion';


const AQICard = ({ label, value, subValue, icon, color, progress }) => {
  const colorMap = {
    tertiary: 'text-tertiary border-tertiary/20 bg-tertiary/5',
    primary: 'text-primary border-primary/20 bg-primary/5',
    error: 'text-error border-error/20 bg-error/5'
  };

  const glowMap = {
    tertiary: 'shadow-[0_0_20px_rgba(112,216,200,0.15)]',
    primary: 'shadow-[0_0_20px_rgba(148,204,255,0.15)]',
    error: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]'
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-10 rounded-[3rem] relative overflow-hidden group font-body border backdrop-blur-2xl ${colorMap[color]} ${glowMap[color]} transition-all duration-500 flex flex-col items-center text-center`}
    >
      <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 rotate-12 group-hover:rotate-0">
        <span className="material-symbols-outlined text-[15rem] font-light select-none">
          {icon}
        </span>
      </div>
      
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className={`p-3 rounded-xl bg-white/5 border border-white/10 ${colorMap[color].split(' ')[0]} shadow-xl mb-1`}>
             <span className="material-symbols-outlined text-xl leading-none">{icon}</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] opacity-50">{label}</p>
        </div>

        <div className="flex items-baseline justify-center gap-2 mb-8">
          <span className="text-5xl font-black tracking-tighter tabular-nums leading-none">{value}</span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">{subValue}</span>
        </div>

        <div className="space-y-5 w-full max-w-[200px]">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] opacity-40 px-1">
            <span>Intensity</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner p-[1px]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`h-full rounded-full ${
                color === 'tertiary' ? 'bg-tertiary' : color === 'primary' ? 'bg-primary' : 'bg-error'
              } shadow-[0_0_20px_currentColor]`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PollutionHero = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <AQICard 
        label="METRO AQI INDEX" 
        value={metrics?.aqi || 42} 
        subValue={metrics?.aqi > 100 ? "DEGRADED" : metrics?.aqi > 50 ? "MODERATE" : "OPTIMAL"} 
        icon="air" 
        color={metrics?.aqi > 100 ? "error" : metrics?.aqi > 50 ? "primary" : "tertiary"} 
        progress={Math.min(100, Math.round(metrics?.aqi / 3))} 
      />
      <AQICard 
        label="PM2.5 DENSITY" 
        value={metrics?.pm25 || 12.4} 
        subValue="µg/m³" 
        icon="compress" 
        color="primary" 
        progress={Math.min(100, Math.round(metrics?.pm25 * 2))} 
      />
      <AQICard 
        label="CARBON PEAK" 
        value={metrics?.co2 || 412} 
        subValue="PPM" 
        icon="factory" 
        color="error" 
        progress={Math.min(100, Math.round((metrics?.co2 - 400) * 4))} 
      />
    </div>
  );
};

export default PollutionHero;
