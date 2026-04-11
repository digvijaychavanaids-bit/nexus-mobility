import { useState } from 'react';
import api from '../../services/api';

const SecuritySettings = () => {
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleUpdate = async () => {
    if (passwords.new !== passwords.confirm) {
      return setMessage({ type: 'error', text: 'Ciphers do not match.' });
    }
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        old_password: passwords.old,
        new_password: passwords.new
      });
      setMessage({ type: 'success', text: 'Access protocols updated.' });
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Protocol rejection.' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <section className="bg-surface-container-low rounded-xl p-8 space-y-8 border border-white/5 shadow-2xl font-body relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
            <span className="material-symbols-outlined text-primary leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-headline tracking-tighter uppercase antialiased">Security & Access</h3>
            <p className="text-on-surface-variant text-[10px] uppercase font-black tracking-widest leading-none">Authentication Protocols</p>
          </div>
        </div>
        <button 
          onClick={handleUpdate}
          disabled={loading || !passwords.old || !passwords.new}
          className="px-6 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Rotating...' : 'Rotate Cipher'}
        </button>
      </div>

      {message && (
        <div className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg border ${message.type === 'success' ? 'bg-tertiary/10 border-tertiary/20 text-tertiary' : 'bg-error/10 border-error/20 text-error'}`}>
          {message.text}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div className="space-y-2 md:col-span-2">
          <label className="text-[10px] font-black text-on-surface-variant tracking-widest uppercase opacity-60">Current Access Cipher</label>
          <input 
            className="w-full bg-surface-container-highest/50 border border-white/5 rounded-lg px-4 py-4 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:bg-surface-container-highest transition-all outline-none"
            placeholder="••••••••••••" 
            type="password"
            value={passwords.old}
            onChange={(e) => setPasswords({...passwords, old: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant tracking-widest uppercase opacity-60">New Access Cipher</label>
          <input 
            className="w-full bg-surface-container-highest/50 border border-white/5 rounded-lg px-4 py-4 text-sm text-on-surface focus:ring-1 focus:ring-primary transition-all outline-none"
            placeholder="Enter new code"
            type="password"
            value={passwords.new}
            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-on-surface-variant tracking-widest uppercase opacity-60">Confirm New Cipher</label>
          <input 
            className="w-full bg-surface-container-highest/50 border border-white/5 rounded-lg px-4 py-4 text-sm text-on-surface focus:ring-1 focus:ring-primary transition-all outline-none"
            placeholder="Re-enter new code"
            type="password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
          />
        </div>
      </div>
    </section>
  );
};

export default SecuritySettings;
