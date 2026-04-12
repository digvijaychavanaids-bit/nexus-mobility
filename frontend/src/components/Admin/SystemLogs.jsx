import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';

const LogEntry = ({ time, status, details }) => {
  const statusColor = status === 'SUCCESS' ? 'text-tertiary' : status === 'WARN' ? 'text-error' : status === 'INFO' ? 'text-primary' : 'text-on-surface';
  const borderColor = status === 'SUCCESS' ? 'border-tertiary' : status === 'WARN' ? 'border-error' : status === 'INFO' ? 'border-primary' : 'border-slate-600';

  return (
    <div className={`p-3 rounded-md bg-surface-container-lowest border-l-2 ${borderColor} flex items-start gap-4 shadow-inner ring-1 ring-white/5`}>
      <span className="text-[10px] font-mono text-on-surface mt-0.5 shrink-0 uppercase tracking-tighter">{time}</span>
      <div className="flex-1">
        <p className="text-xs text-on-surface leading-relaxed font-body">
          <span className={`${statusColor} font-black uppercase tracking-widest mr-2`}>[{status}]</span> 
          {details}
        </p>
      </div>
    </div>
  );
};

const SystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await api.get('/admin/logs?limit=20');
      const mapped = res.data.map((log) => ({
        time: new Date(log.timestamp).toLocaleTimeString(),
        status: log.type?.includes('error') ? 'WARN' : log.type?.includes('admin') ? 'SYS' : 'SUCCESS',
        details: log.details || `${log.type} event recorded for ${log.admin_email || log.email || log.user || 'system'}`
      }));
      setLogs(mapped);
      setError(null);
    } catch {
      setError('Unable to load system logs.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    let interval;
    if (isLive) {
      interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchLogs();
        }
      }, 10000); // Poll every 10s only if visible
    }
    return () => clearInterval(interval);
  }, [isLive, fetchLogs]);

  return (
    <div className="bg-surface-container-low rounded-xl p-6 relative overflow-hidden border border-on-surface/10/50 shadow-2xl font-body">
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center border border-on-surface/5 shadow-sm">
            <span className="material-symbols-outlined text-primary leading-none">terminal</span>
          </div>
          <div>
            <h3 className="text-lg font-black font-headline text-on-surface tracking-tighter uppercase antialiased">System Logs</h3>
            <p className="text-on-surface text-[10px] uppercase tracking-widest font-black">Real-time Node Activity</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all text-[10px] font-black uppercase tracking-widest ${
              isLive ? 'bg-tertiary/10 border-tertiary text-tertiary shadow-[0_0_10px_rgba(112,216,200,0.2)]' : 'bg-on-surface/5 border-on-surface/10 text-on-surface hover:text-on-surface'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-tertiary animate-pulse' : 'bg-slate-600'}`}></div>
            {isLive ? 'Live Feed Active' : 'Enable Live Feed'}
          </button>
          <button 
            onClick={fetchLogs}
            disabled={refreshing}
            className={`text-primary transition-all hover:scale-110 active:scale-95 ${refreshing ? 'animate-spin' : ''}`}
          >
            <span className="material-symbols-outlined text-xl leading-none">sync</span>
          </button>
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-error">
          {error}
        </div>
      )}
      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.length > 0 ? (
          logs.map((log, i) => <LogEntry key={i} {...log} />)
        ) : (
          <div className="py-12 text-center text-on-surface uppercase text-[10px] font-black tracking-widest">
            Awaiting system handshake...
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;






