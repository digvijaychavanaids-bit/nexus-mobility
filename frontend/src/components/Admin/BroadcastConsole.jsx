import { useState } from 'react';
import api from '../../services/api';
import { getCurrentRole } from '../../services/session';

const BroadcastConsole = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('User');
  const [type, setType] = useState('info');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  
  const role = getCurrentRole();

  const handleBroadcast = async () => {
    if (!title || !message) {
      setStatus({ type: 'error', text: 'All directive fields are required.' });
      return;
    }

    setLoading(true);
    setStatus(null);
    
    try {
      const endpoint = role === 'Admin' ? '/admin/broadcast' : '/analyst/notify-users';
      await api.post(endpoint, {
        title,
        message,
        type,
        user_email: target
      });
      
      setStatus({ type: 'success', text: 'Municipal broadcast successful.' });
      setTitle('');
      setMessage('');
    } catch (err) {
      setStatus({ type: 'error', text: 'Broadcast failed. Unauthorized or registry error.' });
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 5000);
    }
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-white/5 shadow-2xl font-body relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 blur-[60px] rounded-full group-hover:bg-primary/20 transition-all duration-500"></div>

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>broadcast_on_home</span>
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest leading-none">Broadcast Console</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60 italic">Emergency & Policy Directives</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Directive Class</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
            >
              <option value="info">Information</option>
              <option value="warning">Warning</option>
              <option value="alert">Critical Alert</option>
              <option value="success" className="text-tertiary">Operational Success</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Target Personnel</label>
            <select 
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
            >
              <option value="User">General Users</option>
              {role === 'Admin' && <option value="Analyst">All Analysts</option>}
              {role === 'Admin' && <option value="all">Global Broadcast</option>}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Subject</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g. System Maintenance, Peak Congestion..."
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-slate-700"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Message Content</label>
          <textarea 
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide detailed instructions or alerts here..."
            className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-primary transition-all resize-none placeholder:text-slate-700"
          ></textarea>
        </div>

        {status && (
          <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl border animate-in fade-in slide-in-from-top-2 duration-300 ${status.type === 'success' ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 'bg-error/10 border-error/20 text-error'}`}>
            {status.text}
          </div>
        )}

        <button 
          onClick={handleBroadcast}
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
          ) : (
            <span className="material-symbols-outlined text-sm">send</span>
          )}
          {loading ? 'Transmitting...' : 'Initiate Broadcast'}
        </button>
      </div>
    </div>
  );
};

export default BroadcastConsole;
