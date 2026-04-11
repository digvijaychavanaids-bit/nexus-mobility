import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

import { ErrorAlert, LoadingSpinner } from '../components/UI';
import CongestionMetrics from '../components/Traffic/CongestionMetrics';
import DistrictHeatmap from '../components/Traffic/DistrictHeatmap';
import DynamicGridMap from '../components/Traffic/DynamicGridMap';
import HotspotTable from '../components/Traffic/HotspotTable';
import TrafficHero from '../components/Traffic/TrafficHero';
import api from '../services/api';

const TrafficAnalysis = () => {
  const [trafficData, setTrafficData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    city: 'Delhi',
    range: '24h',
    minCongestion: 0,
  });

  const fetchTraffic = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRecalculating(true);

    try {
      // 1. Fetch Historical Trends, Sector Stats, AND Future Forecast
      const [trendsRes, sectorsRes, forecastRes] = await Promise.all([
        api.get(`/analytics/traffic-trends?city=${filters.city}&time_range=${filters.range}&min_congestion=${filters.minCongestion}`),
        api.get(`/analytics/sector-stats?city=${filters.city}`),
        api.get(`/predictions/forecast?city=${filters.city}`)
      ]);

      const trends = trendsRes.data;
      const sectors = sectorsRes.data;
      const forecast = forecastRes.data.map((f) => ({ ...f, isForecast: true }));
      
      // Combine for the chart (Trends + a slice of forecast for future vision)
      const combinedTrends = [...trends, ...forecast];

      const avgLoad = trends.length > 0 ? (trends.reduce((acc, t) => acc + t.congestion, 0) / trends.length) : 0;

      setTrafficData({
        trends: combinedTrends,
        avgLoad: Math.round(avgLoad),
        active_alerts: sectors.filter((s) => s.alert).length,
        active_hotspots: combinedTrends.filter((item) => Number(item.congestion) >= 70).length,
        sectors: sectors,
        // Map hotspots to actual high-congestion points in the data
        hotspots: combinedTrends
          .filter(t => t.congestion >= filters.minCongestion)
          .sort((a, b) => b.congestion - a.congestion)
          .slice(0, 4)
          .map((item, index) => {
            const congestion = Number(item.congestion || 0);
            const throughput = Math.max(3200, Math.round((100 - congestion) * 135));
            return {
              name: `${filters.city} ${item.isForecast ? 'Forecast' : 'Node'} ${index + 1}`,
              district: `${item.time} ${item.isForecast ? 'Window (Predicted)' : 'Current Window'} • Sector ${sectors[index % sectors.length]?.id || 'A' + index}`,
              delay: `${congestion >= 50 ? '+' : '-'}${Math.round(congestion * 1.6)}`,
              throughput: throughput.toLocaleString(),
              health: congestion >= 75 ? 'Degraded' : congestion <= 40 ? 'Optimal' : 'Average',
              congestion: congestion
            };
          }),
      });
      setError(null);
    } catch (err) {
      console.error("Traffic Fetch Error:", err);
      setError('Traffic analysis is currently unavailable.');
    } finally {
      setLoading(false);
      setRecalculating(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTraffic();
  }, [fetchTraffic]);

  if (loading) return <LoadingSpinner label="Decoding metropolitan flow..." />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-8 space-y-10 font-body max-w-[1700px] mx-auto pb-24"
    >
      <TrafficHero data={trafficData} filters={filters} setFilters={setFilters} />

      {error && <ErrorAlert message={error} onRetry={() => fetchTraffic(true)} />}

      <div className="grid grid-cols-12 gap-8 relative">
        {recalculating && (
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] z-20 pointer-events-none transition-opacity duration-300" />
        )}
        <CongestionMetrics data={trafficData?.trends} />
        <DistrictHeatmap data={trafficData} />
        <div className="col-span-12">
          <DynamicGridMap 
            city={filters.city} 
            trafficLoad={trafficData?.avgLoad} 
            activeAlerts={trafficData?.active_alerts} 
          />
        </div>
        <HotspotTable data={trafficData} />
      </div>

      <button
        onClick={() => fetchTraffic(true)}
        disabled={recalculating}
        className={`fixed bottom-8 right-8 w-14 h-14 flow-gradient-primary rounded-full shadow-2xl shadow-sky-900/50 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all group z-50 ${recalculating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className={`material-symbols-outlined text-2xl ${recalculating ? 'animate-spin' : ''}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          {recalculating ? 'sync' : 'bolt'}
        </span>
        <span className="absolute right-16 bg-slate-900/95 text-white px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 shadow-xl">
          {recalculating ? 'Refreshing telemetry...' : 'Refresh telemetry'}
        </span>
      </button>
    </motion.div>
  );
};

export default TrafficAnalysis;
