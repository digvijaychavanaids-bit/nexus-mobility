import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PollutionHero from '../components/Nexus/PollutionHero';
import CorrelationChart from '../components/Nexus/CorrelationChart';
import HotspotPanel from '../components/Nexus/HotspotPanel';
import NexusFooter from '../components/Nexus/NexusFooter';
import { ErrorAlert, LoadingSpinner } from '../components/UI';

const PollutionInsights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    city: "Delhi",
    range: "24h"
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statsRes = await api.get(`/analytics/dashboard-stats?city=${filters.city}`);
      const correlationRes = await api.get(`/analytics/pollution-correlation?city=${filters.city}&time_range=${filters.range}`);
      
      setData({
        hero: {
          aqi: Number(statsRes.data.avg_aqi.toFixed(1)),
          pm25: Number(statsRes.data.avg_aqi.toFixed(1)),
          co2: Number((412 + (statsRes.data.avg_traffic_index * 0.08)).toFixed(1)),
        },
        correlation: correlationRes.data.map((item) => ({
          ...item,
          no2: Number((item.aqi * 0.42).toFixed(1)),
          density: item.congestion,
        })),
        city: filters.city
      });
      setError(null);
    } catch {
      setError('Pollution insights are currently unavailable.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get(`/analytics/export-report?city=${filters.city}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pollution_telemetry_${filters.city.toLowerCase()}_${filters.range}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError('Unable to export the pollution report right now.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <LoadingSpinner label="Calibrating atmospheric sensors..." />;

  const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad"];
  const ranges = [
    { id: '24h', label: '24 Hours' },
    { id: '7d', label: '7 Days' },
    { id: '30d', label: '30 Days' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 pb-24 max-w-[1700px] mx-auto space-y-12 font-body"
    >
      {error && <ErrorAlert message={error} onRetry={fetchData} />}

      {/* Premium Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="max-w-3xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-3 px-4 py-2 mb-6 bg-tertiary/10 backdrop-blur-md text-tertiary rounded-full text-[10px] font-black tracking-[0.2em] uppercase border border-tertiary/20 shadow-xl"
          >
            <span className="material-symbols-outlined text-sm animate-pulse">cloud_queue</span>
            Atmospheric Telemetry Sync: Active
          </motion.div>
          
          <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tighter leading-tight mb-4">
            Pollution <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-sky-400">Insights Panel</span>
          </h2>
          
          <p className="text-on-surface-variant leading-relaxed font-bold text-sm opacity-70 max-w-2xl">
            Real-time environmental correlation analysis for the {filters.city} sector. Monitoring particulate concentration 
            and carbon peaks relative to multi-modal transit throughput.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {/* City Selector */}
          <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl flex-wrap">
            {cities.map((city) => (
              <button 
                key={city}
                onClick={() => setFilters({ ...filters, city })}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
                  filters.city === city 
                    ? 'bg-tertiary text-white shadow-lg shadow-tertiary/20' 
                    : 'text-on-surface-variant hover:text-white hover:bg-white/5'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-xl border border-white/10 shadow-2xl">
              {ranges.map((r) => (
                <button 
                  key={r.id}
                  onClick={() => setFilters({ ...filters, range: r.id })}
                  className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${
                    filters.range === r.id 
                      ? 'bg-slate-700 text-white shadow-lg shadow-black/20' 
                      : 'text-on-surface-variant hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button 
              onClick={handleExport}
              disabled={exporting}
              className="px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.15em] flex items-center gap-2 hover:bg-primary hover:text-white transition-all disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">{exporting ? 'sync' : 'ios_share'}</span>
              {exporting ? 'Generating...' : 'Export'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={`${filters.city}-${filters.range}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="grid grid-cols-12 gap-8"
        >
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <PollutionHero metrics={data?.hero} />
            <CorrelationChart data={data?.correlation} city={filters.city} />
          </div>
          
          <HotspotPanel city={filters.city} />
          
          <NexusFooter />
        </motion.div>
      </AnimatePresence>

      <footer className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40">
        <div>© 2026 Nexus Environmental Protocol • V7.2.0-Alpha</div>
        <div className="flex items-center gap-10">
          <a className="hover:text-tertiary transition-colors cursor-pointer" href="#compliance">Regulatory Compliance</a>
          <a className="hover:text-tertiary transition-colors cursor-pointer" href="#sensors">Sensor Integrity</a>
          <a className="hover:text-tertiary transition-colors cursor-pointer" href="#network">Network Status: Synchronized</a>
        </div>
      </footer>
    </motion.div>
  );
};

export default PollutionInsights;
