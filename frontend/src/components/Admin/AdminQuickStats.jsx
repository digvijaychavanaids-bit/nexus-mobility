import { useEffect, useState } from 'react';
import api from '../../services/api';

const AdminQuickStats = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch admin stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 font-body">
      <div className="bg-surface-container-low p-5 rounded-xl border border-slate-800/50 shadow-lg group hover:border-primary/30 transition-all cursor-default">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">Total Personnel</p>
        <h4 className="text-2xl font-black text-primary tracking-tighter antialiased tabular-nums">{stats?.total_users || 0}</h4>
        <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden shadow-inner">
          <div className="bg-primary h-full transition-all duration-1000 shadow-[0_0_8px_rgba(148,204,255,0.4)]" style={{ width: `${Math.min((stats?.total_users / 50) * 100, 100)}%` }}></div>
        </div>
      </div>
      <div className="bg-surface-container-low p-5 rounded-xl border border-slate-800/50 shadow-lg group hover:border-tertiary/30 transition-all cursor-default">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-tertiary transition-colors">System Logs</p>
        <h4 className="text-2xl font-black text-tertiary tracking-tighter antialiased tabular-nums">{stats?.total_logs || 0}</h4>
        <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden shadow-inner">
          <div className="bg-tertiary h-full transition-all duration-1000 shadow-[0_0_8px_rgba(112,216,200,0.4)]" style={{ width: `${Math.min((stats?.total_logs / 1000) * 100, 100)}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default AdminQuickStats;
