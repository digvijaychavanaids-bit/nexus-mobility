import { useState, useEffect } from 'react'; 
import api from '../../services/api';
import GlassCard from '../../shared/components/GlassCard';


const GoldenWindow = ({ city }) => {
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/analytics/trends?city=${city}`);
        setTrends(data.map((v, i) => ({
          hour: `${i}:00`,
          load: v
        })));
      } catch (err) {
        console.error("Failed to fetch trends", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [city]);

  const goldenHour = trends.reduce((min, p) => (p.load < min.load ? p : min), trends[0] || { hour: '—', load: 100 });

  return (
    <GlassCard className="p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className="material-symbols-outlined text-6xl">wb_sunny</span>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Efficiency Protocol</h3>
          <h2 className="text-xl font-black text-on-surface uppercase tracking-tighter antialiased">Golden Window</h2>
        </div>

        {loading ? (
          <div className="h-24 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-on-surface uppercase tracking-widest">Optimal Transit</p>
                <p className="text-2xl font-black text-on-surface">{goldenHour.hour}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-on-surface uppercase tracking-widest">Saturation</p>
                <p className="text-2xl font-black text-tertiary">{Math.round(goldenHour.load)}%</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[8px] font-black text-on-surface uppercase tracking-widest">
                <span>Load Profile</span>
                <span>24H Cycle</span>
              </div>
              <div className="h-1.5 bg-on-surface/5 rounded-full overflow-hidden flex gap-0.5">
                {trends.slice(0, 12).map((t, i) => (
                  <div 
                    key={i}
                    className="flex-1 transition-all"
                    style={{ 
                      height: '100%', 
                      backgroundColor: t.load > 60 ? 'var(--color-error)' : t.load > 30 ? 'var(--color-primary)' : 'var(--color-tertiary)',
                      opacity: t.load / 100 + 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <button className="w-full py-3 bg-on-surface/5 hover:bg-on-surface/10 border border-on-surface/5 hover:border-primary/30 rounded-xl text-[9px] font-black text-on-surface uppercase tracking-[0.2em] transition-all">
          Generate Full Forecast
        </button>
      </div>
    </GlassCard>
  );
};

export default GoldenWindow;






