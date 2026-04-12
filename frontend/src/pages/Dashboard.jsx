import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { LoadingSpinner, ErrorAlert } from '../components/UI';
import NexusLiveMonitor from '../modules/nexus/NexusLiveMonitor';
import IntelligencePanel from '../modules/analytics/IntelligencePanel';
import BroadcastConsole from '../components/Admin/BroadcastConsole';
import { getCurrentRole } from '../services/session';


const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeCity, setActiveCity] = useState("Delhi");

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch stats and alerts concurrently for performance
      const [statsRes] = await Promise.all([
        api.get(`/analytics/dashboard-stats?city=${activeCity}`),
        api.get(`/analytics/alerts?city=${activeCity}`) // Still fetching to ensure backend data availability
      ]);
      
      const trafficIndex = Math.round(statsRes.data.avg_traffic_index || 0);
      const alertCount = statsRes.data.active_alerts || 0;
      
      setStats({
        avg_traffic_index: trafficIndex,
        avg_aqi: Math.round(statsRes.data.avg_aqi || 0),
        active_alerts: alertCount,
        active_vehicles: statsRes.data.active_vehicles || 0,
        network_health: `${Math.max(65, Math.min(98, 100 - (alertCount * 3)))}%`,
        velocity: `${Math.max(15, Math.round(75 - (trafficIndex * 0.4)))} km/h`
      });
      
      setError(null);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError("Unable to fetch data. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCity]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => fetchDashboardData(true), 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-80px)] flex flex-col p-6 space-y-6 overflow-hidden"
    >
      {/* Header with City Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-headline text-white uppercase tracking-tighter antialiased">
            Operational Hub
          </h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.25em] mt-1 opacity-80">
            Real-Time Municipal Terminal Grid
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Sector</span>
            <select 
              value={activeCity}
              onChange={(e) => setActiveCity(e.target.value)}
              className="bg-transparent text-xs font-black text-white uppercase tracking-wider outline-none cursor-pointer"
            >
              <option value="Delhi" className="bg-slate-900">Delhi Sector</option>
              <option value="Mumbai" className="bg-slate-900">Mumbai Sector</option>
              <option value="Bengaluru" className="bg-slate-900">Bengaluru Sector</option>
              <option value="Chennai" className="bg-slate-900">Chennai Sector</option>
              <option value="Hyderabad" className="bg-slate-900">Hyderabad Sector</option>
            </select>
          </div>

          <button 
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className={`p-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all ${refreshing ? 'animate-spin' : ''}`}
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        {/* Live Monitor - Takes more space */}
        <div className="lg:col-span-8 h-full min-h-[400px]">
          <NexusLiveMonitor city={activeCity} stats={stats} />
        </div>
        
        {/* Intelligence Panel - Sidebar */}
        <div className="lg:col-span-4 h-full overflow-y-auto custom-scrollbar pr-2 space-y-6">
          {(getCurrentRole() === 'Admin' || getCurrentRole() === 'Analyst') && (
            <BroadcastConsole />
          )}
          <IntelligencePanel 
            stats={stats} 
            city={activeCity}
            onRefresh={() => fetchDashboardData(true)} 
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
