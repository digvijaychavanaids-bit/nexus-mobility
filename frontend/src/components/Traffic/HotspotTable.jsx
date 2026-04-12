import { useState } from 'react';
import api from '../../services/api';


const HotspotTable = ({ data: apiData }) => {
  const [exporting, setExporting] = useState(false);
  const [focused, setFocused] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'congestion', direction: 'desc' });

  const handleSync = (name) => {
    setFocused(name);
    // Scroll to map for visual "Sync"
    const mapElement = document.querySelector('.aspect-\\[21\\/9\\]');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Map backend hotspots or fallback to simulation
  // Sort the hotspots based on configuration
  const sortedHotspots = [...(apiData?.hotspots || [])].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    // Handle string vs number comparison
    if (typeof aVal === 'string' && isNaN(Number(aVal.replace(/[^0-9.-]+/g,"")))) {
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    
    const numA = Number(aVal?.toString().replace(/[^0-9.-]+/g,"") || 0);
    const numB = Number(bVal?.toString().replace(/[^0-9.-]+/g,"") || 0);
    return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
  });

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('/analytics/export-report', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'traffic_hotspots_report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="col-span-12 bg-white/[0.03] backdrop-blur-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-on-surface/5 font-body">
      <div className="px-10 py-8 flex items-center justify-between border-b border-on-surface/5">
        <div>
          <h3 className="text-xl font-black text-on-surface uppercase tracking-tight leading-none">Active Congestion Hotspots</h3>
          <p className="text-[10px] text-on-surface font-black uppercase tracking-widest mt-2 opacity-60">Prioritized intersections requiring optimization</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-6 py-3 bg-on-surface/5 hover:bg-on-surface/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-primary transition-all border border-on-surface/5 active:scale-95 disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-lg">{exporting ? 'sync' : 'ios_share'}</span>
          {exporting ? 'Generating...' : 'Export Full Dataset'}
        </button>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-left font-body">
          <thead>
            <tr className="bg-white/[0.02] text-on-surface text-[10px] font-black uppercase tracking-[0.2em] opacity-40 selection:bg-transparent">
              <th className="px-10 py-4 cursor-pointer hover:text-on-surface" onClick={() => requestSort('name')}>Intersection Node</th>
              <th className="px-10 py-4 cursor-pointer hover:text-on-surface" onClick={() => requestSort('congestion')}>Avg Delay / Load</th>
              <th className="px-10 py-4 cursor-pointer hover:text-on-surface" onClick={() => requestSort('throughput')}>Throughput/hr</th>
              <th className="px-10 py-4 cursor-pointer hover:text-on-surface" onClick={() => requestSort('health')}>Signal Health</th>
              <th className="px-10 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedHotspots.map((spot) => (
              <tr key={spot.name} className="group hover:bg-white/[0.03] transition-all duration-300">
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${spot.health === 'Degraded' ? 'bg-error animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]' : spot.health === 'Optimal' ? 'bg-tertiary shadow-[0_0_10px_rgba(112,216,200,0.5)]' : 'bg-primary'}`}></div>
                    <div>
                      <div className="font-black text-on-surface uppercase tracking-tight">{spot.name}</div>
                      <div className="text-[9px] text-on-surface font-black uppercase tracking-widest opacity-40 mt-0.5">{spot.district}</div>
                    </div>
                  </div>
                </td>
                <td className={`px-10 py-6 font-black tabular-nums ${spot.delay.startsWith('+') ? 'text-error' : 'text-tertiary'}`}>
                  {spot.delay} <span className="text-[8px] opacity-40 ml-1">({spot.congestion}%)</span>
                </td>
                <td className="px-10 py-6 text-on-surface font-black tabular-nums opacity-80">{spot.throughput} <span className="text-[10px] opacity-40 ml-1">VPH</span></td>
                <td className="px-10 py-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    spot.health === 'Degraded' ? 'bg-error/10 text-error' : spot.health === 'Optimal' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'
                  } border border-current opacity-70 group-hover:opacity-100 transition-opacity`}>
                    {spot.health}
                  </span>
                </td>
                <td className="px-10 py-6 text-right">
                  <button 
                    onClick={() => handleSync(spot.name)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 border ${
                      focused === spot.name ? 'bg-primary text-on-surface border-primary' : 'bg-on-surface/5 text-on-surface/40 border-on-surface/5 hover:text-on-surface hover:border-white/20'
                    }`}
                  >
                    {focused === spot.name ? 'Synced' : 'Sync View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HotspotTable;






