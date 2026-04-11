import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '../../services/api';


const FlowForecast = ({ city = 'Delhi', aqi = 50 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/predictions/forecast?city=${city}&aqi=${aqi}`);
        setData(res.data);
      } catch (err) {
        console.error('Forecast error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();
  }, [city, aqi]);

  if (loading) {
    return (
      <div className="bg-surface-container-low rounded-xl p-6 h-64 flex items-center justify-center animate-pulse">
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Calculating Future Flow...</span>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-low rounded-xl p-6 space-y-4 border border-slate-800/50 shadow-lg font-body">
      <div className="flex justify-between items-start">
        <h5 className="text-sm font-headline font-black text-white uppercase tracking-widest leading-none">Flow Forecast</h5>
        <span className="bg-primary/20 text-primary text-[10px] font-black px-2 py-0.5 rounded uppercase ring-1 ring-primary/10 tracking-widest leading-none">6H Prediction</span>
      </div>
      
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
            <XAxis 
              dataKey="hour" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} 
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
              labelStyle={{ color: '#94a3b8', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
              itemStyle={{ color: '#38bdf8', fontSize: '12px', fontWeight: '900' }}
            />
            <Line 
              type="monotone" 
              dataKey="congestion" 
              stroke="#38bdf8" 
              strokeWidth={3}
              dot={{ fill: '#38bdf8', r: 4 }}
              activeDot={{ r: 6, stroke: '#38bdf8', strokeWidth: 2, fill: '#0f172a' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
        Anticipated metropolitan density shift based on atmospheric and historical neural weights.
      </p>
    </div>
  );
};

export default FlowForecast;
