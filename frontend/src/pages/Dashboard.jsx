import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import { LoadingSpinner, ErrorAlert } from '../components/UI';
import NexusLiveMonitor from '../modules/nexus/NexusLiveMonitor';
import IntelligencePanel from '../modules/analytics/IntelligencePanel';
import BroadcastConsole from '../components/Admin/BroadcastConsole';
import { getCurrentRole } from '../services/session';


import MetropolitanLeaderboard from '../components/Dashboard/MetropolitanLeaderboard';

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
    const interval = setInterval(() => fetchDashboardData(true), 3000); // Accelerated 3s sync
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
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[10px] text-primary font-black uppercase tracking-[0.25em] opacity-80">
              Real-Time Municipal Terminal Grid
            </p>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-error/10 border border-error/20 rounded-full">
              <span className="w-1 h-1 bg-error rounded-full animate-ping" />
              <span className="text-[8px] font-black text-error uppercase tracking-widest">Live Stream</span>
            </div>
          </div>
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

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-[1.2rem] border transition-all duration-500 group relative overflow-hidden backdrop-blur-xl ${
              refreshing 
              ? 'bg-primary/20 border-primary/40 text-primary' 
              : 'bg-white/5 border-white/10 text-white hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]'
            }`}
          >
            {/* Animated Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            
            <div className={`flex items-center justify-center ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`}>
              <span className="material-symbols-outlined text-sm font-bold">
                {refreshing ? 'autorenew' : 'refresh'}
              </span>
            </div>
            
            <span className="text-[10px] font-black uppercase tracking-[0.2em] antialiased">
              {refreshing ? 'Synchronizing...' : 'Manual Sync'}
            </span>

            {/* Success Micro-dot */}
            {!refreshing && (
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
            )}
          </motion.button>
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
          <MetropolitanLeaderboard />
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
