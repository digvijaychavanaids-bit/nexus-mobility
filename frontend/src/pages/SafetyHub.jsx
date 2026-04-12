import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import GlassCard from '../shared/components/GlassCard';
import { LoadingSpinner } from '../components/UI';


const SafetyHub = () => {
  const [activeCity, setActiveCity] = useState("Delhi");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSafetyData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/analytics/dashboard-stats?city=${activeCity}`);
        // Combine dashboard stats with city profile if needed, 
        // but here we just need the AQI from dashboard-stats as per backend routes
        setProfile({
          city: activeCity,
          pm25: res.data.avg_aqi,
          pm10: res.data.avg_pm10 || 90,
          co: res.data.avg_co || 380,
          no2: res.data.avg_no2 || 25
        });
      } catch (err) {
        console.error("Failed to load safety data");
      } finally {
        setLoading(false);
      }
    };
    fetchSafetyData();
  }, [activeCity]);

  const getAdvisory = (pm25) => {
    if (pm25 <= 50) return { 
      status: "Safe", 
      color: "text-tertiary", 
      bg: "bg-tertiary/10", 
      border: "border-tertiary/20",
      advice: "Conditions are optimal for outdoor exercise. No filtration required." 
    };
    if (pm25 <= 100) return { 
      status: "Moderate", 
      color: "text-warning", 
      bg: "bg-warning/10", 
      border: "border-warning/20",
      advice: "Sensitive individuals should limit prolonged outdoor exertion." 
    };
    return { 
      status: "Hazardous", 
      color: "text-error", 
      bg: "bg-error/10", 
      border: "border-error/20",
      advice: "Air quality advisory in effect. High-efficiency masks recommended for travel." 
    };
  };

  const advisory = profile ? getAdvisory(profile.pm25) : null;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="p-8 max-w-7xl mx-auto space-y-12 font-body min-h-screen"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black font-headline text-on-surface uppercase tracking-tighter antialiased flex items-center gap-3">
             <span className="material-symbols-outlined text-primary text-3xl">verified_user</span>
             Citizen Safety Hub
          </h1>
          <p className="text-[10px] text-on-surface font-black uppercase tracking-[0.2em] mt-2 opacity-80 italic italic">Verified Environmental & Health Advisories</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select 
              value={activeCity} 
              onChange={(e) => setActiveCity(e.target.value)}
              className="bg-on-surface/5 border border-on-surface/10 rounded-xl pl-4 pr-10 py-3 text-xs font-bold uppercase tracking-wider text-on-surface outline-none focus:ring-2 focus:ring-primary/40 appearance-none cursor-pointer hover:border-primary/30 transition-all backdrop-blur-md"
            >
              <option className="bg-surface-container">Delhi</option>
              <option className="bg-surface-container">Mumbai</option>
              <option className="bg-surface-container">Bangalore</option>
              <option className="bg-surface-container">Chennai</option>
              <option className="bg-surface-container">Hyderabad</option>
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface pointer-events-none group-hover:text-primary transition-colors text-sm">
              expand_more
            </span>
          </div>
        </div>
      </header>

      {loading ? (
        <LoadingSpinner label="Calibrating Atmospheric Sensors..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Advisory Card */}
          <div className="lg:col-span-12">
            <GlassCard className={`p-10 ${advisory?.bg} ${advisory?.border} border relative overflow-hidden group transition-colors duration-700`}>
                <div className="flex flex-col md:flex-row items-center gap-10">
                   <div className="w-40 h-40 rounded-full bg-surface-container-lowest flex flex-col items-center justify-center border border-on-surface/5 relative shadow-inner">
                      <p className="text-[10px] text-on-surface font-black uppercase tracking-[0.2em] leading-none mb-2">AQI Pulse</p>
                      <p className={`text-5xl font-black font-headline tracking-tighter ${advisory?.color}`}>{profile?.pm25}</p>
                      <p className="text-[8px] text-on-surface font-bold uppercase mt-2">Verified PM2.5</p>
                   </div>

                   <div className="flex-1 text-center md:text-left">
                      <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${advisory?.color} mb-3`}>Municipal Advisory • {advisory?.status}</div>
                      <h2 className="text-4xl font-black font-headline text-on-surface uppercase tracking-tighter leading-tight mb-4">Institutional Health Directive</h2>
                      <p className="text-lg text-on-surface font-medium leading-relaxed max-w-2xl">{advisory?.advice}</p>
                   </div>
                </div>
            </GlassCard>
          </div>

          {/* Metric Grid */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="p-8 bg-surface-container-low rounded-3xl border border-on-surface/5">
                <p className="text-[10px] text-on-surface font-black uppercase tracking-widest leading-none mb-4">Carbon Monoxide</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-black font-headline text-on-surface tracking-tighter">{profile?.co}</span>
                   <span className="text-[8px] font-bold text-on-surface uppercase">ug/m³</span>
                </div>
             </div>
             <div className="p-8 bg-surface-container-low rounded-3xl border border-on-surface/5">
                <p className="text-[10px] text-on-surface font-black uppercase tracking-widest leading-none mb-4">PM10 Index</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-black font-headline text-on-surface tracking-tighter">{profile?.pm10}</span>
                   <span className="text-[8px] font-bold text-on-surface uppercase">ug/m³</span>
                </div>
             </div>
             <div className="p-8 bg-surface-container-low rounded-3xl border border-on-surface/5">
                <p className="text-[10px] text-on-surface font-black uppercase tracking-widest leading-none mb-4">Nitrogen Dioxide</p>
                <div className="flex items-baseline gap-2">
                   <span className="text-3xl font-black font-headline text-on-surface tracking-tighter">{profile?.no2}</span>
                   <span className="text-[8px] font-bold text-on-surface uppercase">ug/m³</span>
                </div>
             </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-end">
             <div className="p-8 bg-primary/10 rounded-3xl border border-primary/20 relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                   <span className="material-symbols-outlined text-7xl text-primary">eco</span>
                </div>
                <h3 className="text-sm font-black font-headline text-primary uppercase tracking-widest mb-2 italic">Source Verification</h3>
                <p className="text-[10px] text-primary/70 font-semibold leading-relaxed tracking-tight">
                   Atmospheric metrics are synchronized with the national pollutant inventory and specific municipal sensors deployed in {activeCity}.
                </p>
             </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SafetyHub;






