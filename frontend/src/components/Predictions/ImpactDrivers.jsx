import React, { useMemo } from 'react';



const ImpactDrivers = ({ city = "Delhi", congestion = 50 }) => {
  const drivers = useMemo(() => {
    // City specific baseline drivers
    const cityConfigs= {
      "Delhi": [
        { icon: 'factory', title: 'Industrial Sync', base: 2.4, color: 'text-error' },
        { icon: 'commute', title: 'Ring Road Flow', base: 4.1, color: 'text-error' },
        { icon: 'construction', title: 'Metro Expansion', base: 3.5, color: 'text-tertiary' }
      ],
      "Mumbai": [
        { icon: 'water', title: 'Tidal Swell', base: 1.8, color: 'text-primary' },
        { icon: 'directions_bus', title: 'BEST Logistics', base: 5.2, color: 'text-error' },
        { icon: 'apartment', title: 'Fin-District Load', base: 2.9, color: 'text-error' }
      ],
      "Bangalore": [
        { icon: 'data_thresholding', title: 'IT Node Density', base: 6.2, color: 'text-error' },
        { icon: 'celebration', title: 'Venue Influx', base: -1.4, color: 'text-tertiary' },
        { icon: 'hail', title: 'High-Tech Sprawl', base: 3.1, color: 'text-error' }
      ]
    };

    const config = cityConfigs[city] || cityConfigs["Delhi"];
    const intensity = (congestion / 50);

    return config.map(d => ({
      ...d,
      val: (d.base * intensity).toFixed(1) + '%',
      sub: d.base > 4 ? 'High Impact Node' : 'Secondary Correlation'
    }));
  }, [city, congestion]);

  return (
    <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2rem] p-8 space-y-6 border border-white/5 shadow-2xl font-body min-h-[350px]">
      <div className="flex items-center justify-between">
        <h5 className="text-[10px] font-black text-white uppercase tracking-[0.3em] leading-none opacity-60">Impact Drivers: {city}</h5>
        <span className="material-symbols-outlined text-primary text-sm">psychology</span>
      </div>
      
      <ul className="space-y-6 pt-6">
        {drivers.map((driver, i) => (
          <li key={i} className="flex items-center justify-between group cursor-pointer transition-all duration-300 hover:translate-x-3 py-2 border-b border-white/[0.03] last:border-0 pb-4 last:pb-0">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-xl group-hover:bg-white/10 transition-all duration-500">
                <span className={`material-symbols-outlined ${driver.color} text-2xl leading-none`}>{driver.icon}</span>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-black text-white uppercase tracking-tight leading-none">{driver.title}</p>
                <p className="text-[9px] text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-40">{driver.sub}</p>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className={`${driver.color} text-sm font-black tracking-widest block leading-none mb-1.5`}>{driver.val}</span>
              <div className="bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                <p className="text-[7px] text-on-surface-variant font-black uppercase tracking-tighter opacity-60">Neural Impact</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ImpactDrivers;
