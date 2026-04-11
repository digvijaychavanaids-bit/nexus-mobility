import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';


const LocationGrid = ({ city }) => {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        const res = await api.get(`/analytics/sector-stats?city=${city}`);
        setSectors(res.data);
      } catch (err) {
        console.error("Failed to load municipal sectors");
      } finally {
        setLoading(false);
      }
    };
    fetchSectors();
  }, [city]);

  if (loading) return (
    <div className="h-[300px] flex items-center justify-center bg-white/5 rounded-3xl border border-white/5 animate-pulse">
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Mapping City Sectors...</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      {sectors.map((sector) => (
        <motion.div
          key={sector.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-500 ${
            sector.val >= 80 
              ? 'bg-error/10 border-error/20 text-error' 
              : sector.val >= 60 
                ? 'bg-warning/10 border-warning/20 text-warning'
                : 'bg-primary/10 border-primary/20 text-primary'
          }`}
        >
          <div className="relative z-10">
            <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Sector {sector.id}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black font-headline tracking-tighter">{Math.round(sector.val)}</span>
              <span className="text-[8px] font-bold uppercase opacity-60">% Load</span>
            </div>
          </div>
          
          {/* Visual Indicator */}
          <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20" style={{ width: `${sector.val}%` }}></div>
          
          {sector.val >= 80 && (
            <div className="absolute -right-2 -top-2 opacity-10">
              <span className="material-symbols-outlined text-4xl">warning</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default LocationGrid;
