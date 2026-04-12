import { 
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';


const CongestionMetrics = ({ data: apiData }) => {
  const chartData = apiData?.length > 0 ? apiData.map((row) => ({
    time: row.time,
    arterial: row.isForecast ? null : row.congestion,
    forecast: row.isForecast ? row.congestion : (row.time === apiData.find((d) => d.isForecast)?.time ? row.congestion : null),
    secondary: Math.max(10, Number(row.congestion) - 12),
  })) : [];

  // Special logic to connect the last historical point to the first forecast point
  // For simplicity, we'll just use the isForecast flag to style the Area.

  return (
    <div className="col-span-12 lg:col-span-8 bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] p-8 flex flex-col font-body border border-on-surface/5 shadow-2xl hover:bg-white/[0.04] transition-all">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-xl font-black text-on-surface uppercase tracking-tight">Congestion Flow Metrics</h3>
          <p className="text-[10px] text-on-surface font-black uppercase tracking-[0.2em] opacity-60">Comparative analysis: Arterial vs. Secondary Routes</p>
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(148,204,255,0.5)]"></span>
            <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">Live Telemetry</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></span>
            <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">ML Forecast</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 min-h-[350px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorArterial" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94ccff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#94ccff" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255,255,255,0.05)" 
            />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 900 }} 
              dy={15}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
              contentStyle={{ 
                background: 'rgba(15, 23, 42, 0.9)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '16px',
                padding: '12px 16px',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
              }}
              labelStyle={{ color: '#fff', fontWeight: 900, marginBottom: '8px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              itemStyle={{ fontSize: '12px', fontWeight: 700, padding: '2px 0' }}
            />
            <Area 
              type="monotone" 
              dataKey="arterial" 
              stroke="#94ccff" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorArterial)"
              animationDuration={2000}
              connectNulls
            />
            <Area 
              type="monotone" 
              dataKey="forecast" 
              stroke="#fbbf24" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorForecast)" 
              strokeDasharray="8 8"
              animationDuration={2500}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CongestionMetrics;






