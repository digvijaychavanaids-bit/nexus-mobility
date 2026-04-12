import { BarChart, Bar, XAxis, YAxis, CartesianGrid, 
Tooltip, ResponsiveContainer, Cell
} from 'recharts';


const CorrelationChart = ({ data: apiData, city = 'Delhi' }) => {
  const chartData = apiData?.length > 0 ? apiData : [
    { time: '06:00', density: 40, no2: 35 },
    { time: '08:00', density: 60, no2: 55 },
    { time: '10:00', density: 85, no2: 82 },
    { time: '12:00', density: 45, no2: 40 },
    { time: '14:00', density: 50, no2: 48 },
    { time: '16:00', density: 95, no2: 98 },
    { time: '18:00', density: 75, no2: 70 },
    { time: '20:00', density: 30, no2: 25 },
  ];

  return (
    <div className="bg-surface-container-low backdrop-blur-md rounded-[2.5rem] p-10 font-body border border-on-surface/5 shadow-2xl hover:bg-surface-container transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
        <div>
          <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight">
            Traffic vs. Pollution Correlation
          </h3>
          <p className="text-[10px] text-on-surface mt-2 font-black uppercase tracking-[0.2em] opacity-60">
            Cross-referencing vehicle density against nitrogen dioxide peaks in {city}
          </p>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(148,204,255,0.5)]"></span>
            <span className="text-[10px] text-on-surface font-black uppercase tracking-widest">Density</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary shadow-[0_0_10px_rgba(112,216,200,0.5)]"></span>
            <span className="text-[10px] text-on-surface font-black uppercase tracking-widest">NO2 PEAK</span>
          </div>
        </div>
      </div>
      
      <div className="h-96 relative">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={12}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="var(--outline-variant)" 
              strokeOpacity={0.1}
            />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--on-surface-variant)', fontSize: 10, fontWeight: 900, opacity: 0.5 }} 
              dy={15}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              cursor={{ fill: 'var(--on-surface)', opacity: 0.05, radius: 10 }}
              contentStyle={{ 
                background: 'var(--surface-container-high)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--outline-variant)', 
                borderRadius: '20px',
                padding: '16px 20px',
                boxShadow: '0 25px 30px -5px rgb(0 0 0 / 0.2)'
              }}
              labelStyle={{ color: 'var(--on-surface)', fontWeight: 900, marginBottom: '10px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
              itemStyle={{ fontSize: '12px', fontWeight: 700, padding: '4px 0' }}
            />
            <Bar 
              dataKey="density" 
              fill="#94ccff" 
              radius={[6, 6, 0, 0]} 
              barSize={24}
              animationDuration={1500}
            >
               {chartData.map((_, index) => (
                  <Cell key={`cell-density-${index}`} fillOpacity={0.8} />
                ))}
            </Bar>
            <Bar 
              dataKey="no2" 
              fill="#70d8c8" 
              radius={[6, 6, 0, 0]} 
              barSize={24}
              animationDuration={2000}
            >
               {chartData.map((_, index) => (
                  <Cell key={`cell-no2-${index}`} fillOpacity={0.8} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CorrelationChart;






