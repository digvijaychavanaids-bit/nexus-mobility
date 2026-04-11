import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { LoadingSpinner } from '../components/UI';
import GlassCard from '../shared/components/GlassCard';

const Inbox = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotif, setSelectedNotif] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/auth/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Inbox fetch failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    try {
      await api.post(`/auth/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Failed to mark as read");
    }
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'priority') return n.type === 'alert' || n.type === 'warning';
    return true;
  });

  if (loading) return <LoadingSpinner label="Decrypting Secure Inbox..." />;

  return (
    <div className="p-8 max-w-6xl mx-auto font-body min-h-screen">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter antialiased">Command Inbox</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-2 opacity-80 italic">Official Municipal Communications Archive</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5 backdrop-blur-md">
          {(['all', 'unread', 'priority']).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                filter === f ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List View */}
        <div className="lg:col-span-5 space-y-3 h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar pr-2">
          {filteredNotifs.length > 0 ? filteredNotifs.map((notif) => (
            <motion.div
              layout
              key={notif.id}
              onClick={() => { setSelectedNotif(notif); if (!notif.read) markRead(notif.id); }}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedNotif?.id === notif.id 
                  ? 'bg-primary/20 border-primary ring-1 ring-primary/30' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10'
              } relative group`}
            >
              {!notif.read && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-lg"></div>}
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.type === 'alert' ? 'bg-error/20 text-error' : 
                  notif.type === 'warning' ? 'bg-warning/20 text-warning' : 
                  notif.type === 'success' ? 'bg-tertiary/20 text-tertiary' : 'bg-primary/20 text-primary'
                }`}>
                  <span className="material-symbols-outlined">
                    {notif.type === 'alert' ? 'emergency' : notif.type === 'warning' ? 'notification_important' : 'mail'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className={`text-xs font-black truncate uppercase tracking-tight ${!notif.read ? 'text-white' : 'text-slate-400'}`}>
                      {notif.title}
                    </p>
                    <span className="text-[8px] text-slate-600 font-bold tabular-nums">
                      {new Date(notif.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="p-12 text-center bg-white/5 rounded-3xl border border-white/5 border-dashed">
              <span className="material-symbols-outlined text-4xl text-slate-700 mb-4 block">drafts</span>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Archival Registry Empty</p>
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className="lg:col-span-7 h-[calc(100vh-250px)]">
          <AnimatePresence mode="wait">
            {selectedNotif ? (
              <motion.div
                key={selectedNotif.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <GlassCard className="h-full p-8 flex flex-col items-start relative overflow-hidden group">
                  {/* Visual Decoration */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>
                  
                  <div className="w-full flex justify-between items-start mb-8 relative z-10">
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${
                      selectedNotif.type === 'alert' ? 'bg-error/20 text-error' : 
                      selectedNotif.type === 'warning' ? 'bg-warning/20 text-warning' : 
                      'bg-primary/20 text-primary'
                    }`}>
                      System {selectedNotif.type} • Official
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Transmission ID</p>
                      <p className="text-[10px] text-white font-mono opacity-40 uppercase">{selectedNotif.id.split('-')[0]}</p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-4 leading-tight relative z-10">
                    {selectedNotif.title}
                  </h2>
                  
                  <div className="flex items-center gap-4 mb-8 p-3 bg-white/5 rounded-2xl w-full border border-white/5 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0">
                      <span className="material-symbols-outlined text-primary">security</span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Dispatcher</p>
                      <p className="text-xs text-white font-bold mt-1 uppercase tracking-tight">{selectedNotif.sender_role} • {selectedNotif.sender.split('@')[0]}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Timestamp</p>
                      <p className="text-xs text-slate-200 mt-1">{new Date(selectedNotif.timestamp).toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex-1 w-full text-slate-300 text-sm leading-relaxed space-y-4 pr-4 overflow-y-auto custom-scrollbar font-normal relative z-10">
                    {selectedNotif.message.split('\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>

                  <div className="w-full pt-6 mt-auto border-t border-white/5 flex gap-3 relative z-10">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black text-[9px] uppercase tracking-widest py-3 rounded-xl transition-all border border-white/5 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">print</span>
                      Export
                    </button>
                    <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-black text-[9px] uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-2 px-4">
                      <span className="material-symbols-outlined text-sm">reply</span>
                      Acknowledge
                    </button>
                  </div>
                </GlassCard>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-white/5 rounded-[40px] border border-white/5 border-dashed p-12 text-center opacity-40">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-slate-600">visibility</span>
                </div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">Selective Inspection Required</h3>
                <p className="text-xs text-slate-500 mt-2 max-w-[280px]">Select a municipal record from the dispatch queue to read the full intelligence directive.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
