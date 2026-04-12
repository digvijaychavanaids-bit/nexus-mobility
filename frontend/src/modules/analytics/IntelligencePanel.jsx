import { useState, useEffect } from 'react';

// interface DashboardStats is implied by context if needed, but we use the inline definition below

const IntelligencePanel = ({ stats, city }) => {
  const [insight, setInsight] = useState("Analyzing municipal telemetry...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (stats) {
      setLoading(false);
      const traffic = stats.avg_traffic_index;
      const aqi = stats.avg_aqi;
      
      if (traffic > 60 && aqi > 150) setInsight(`Critical congestion and poor air quality in ${city}. Recommend restricted industrial logistics.`);
      else if (traffic > 60) setInsight(`High traffic density detected in ${city}. Automated signal optimization active.`);
      else if (aqi > 150) setInsight(`Air quality warning for ${city}. Activating municipal haze advisory.`);
      else setInsight(`Optimal urban flow in ${city}. Monitoring atmospheric consistency.`);
    }
  }, [stats, city]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black text-on-surface uppercase tracking-[0.25em] opacity-40">Intelligence Node</h2>
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-primary animate-ping"></div>
          <div className="w-1 h-1 rounded-full bg-primary animate-ping [animation-delay:0.2s]"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-on-surface/5 rounded-2xl border border-on-surface/5 space-y-1.5">
          <p className="text-[9px] font-black text-on-surface uppercase">Congestion Index</p>
          <p className={`text-xl font-black ${(stats?.avg_traffic_index || 0) > 50 ? 'text-error' : 'text-primary'}`}>
            {stats?.avg_traffic_index || '—'}
          </p>
        </div>
        <div className="p-4 bg-on-surface/5 rounded-2xl border border-on-surface/5 space-y-1.5">
          <p className="text-[9px] font-black text-on-surface uppercase">Atmospheric AQI</p>
          <p className={`text-xl font-black ${(stats?.avg_aqi || 0) > 100 ? 'text-error' : 'text-tertiary'}`}>
            {stats?.avg_aqi || '—'}
          </p>
        </div>
      </div>

      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-4xl text-primary">psychology</span>
        </div>
        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3">Governance Insight</p>
        <p className="text-sm font-black text-on-surface leading-relaxed tracking-tight relative z-10">
          {loading ? "..." : insight}
        </p>
      </div>
    </div>
  );
};

export default IntelligencePanel;






