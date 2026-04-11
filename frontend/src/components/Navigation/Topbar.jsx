import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../services/session';
import api from '../../services/api';


const Topbar = ({ user: initialUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(initialUser);
  
  // Use session-specific identity for unique avatar loading
  const userId = sessionStorage.getItem('user_id') || 'guest';
  const avatarKey = `nexus_avatar_${userId}`;
  const [avatar, setAvatar] = useState(localStorage.getItem(avatarKey) || "");
  
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [expandedNotif, setExpandedNotif] = useState(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/auth/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      const currentUserId = sessionStorage.getItem('user_id') || 'guest';
      const currentAvatarKey = `nexus_avatar_${currentUserId}`;
      const savedAvatar = localStorage.getItem(currentAvatarKey);
      if (savedAvatar) setAvatar(savedAvatar);
      
      setUser({
        name: sessionStorage.getItem('name') || initialUser?.name || 'System User',
        role: (sessionStorage.getItem('role')) || initialUser?.role || 'User'
      });
      fetchNotifications();
    };

    handleUpdate(); // Initial sync on mount
    
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    window.addEventListener('avatarUpdate', handleUpdate);
    window.addEventListener('storage', (e) => {
        if (e.key === avatarKey) handleUpdate();
    });
    return () => {
      window.removeEventListener('avatarUpdate', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, [initialUser, avatarKey]);

  const markRead = async (id) => {
    try {
      await api.post(`/auth/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      if (expandedNotif === id) setExpandedNotif(null);
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadNotifications = notifications.filter(n => !n.read);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const searchableNodes = [
    { title: 'Dashboard', path: '/dashboard', icon: 'dashboard', category: 'Node' },
    { title: 'Traffic Analysis', path: '/traffic', icon: 'traffic', category: 'Analysis' },
    { title: 'Mumbai Sector', path: '/traffic?city=Mumbai', icon: 'location_city', category: 'Region' },
    { title: 'Delhi Sector', path: '/traffic?city=Delhi', icon: 'location_city', category: 'Region' },
    { title: 'Bangalore Sector', path: '/traffic?city=Bangalore', icon: 'location_city', category: 'Region' },
    { title: 'Pollution Insights', path: '/pollution', icon: 'cloud', category: 'Analysis' },
    { title: 'Smart Signals', path: '/signals', icon: 'traffic_light', category: 'Automation' },
    { title: 'Mobility Predictions', path: '/predict', icon: 'online_prediction', category: 'Intelligence' },
    { title: 'Sector Reports', path: '/reports', icon: 'assessment', category: 'Data' },
    { title: 'Admin Governance', path: '/admin', icon: 'admin_panel_settings', category: 'System' },
    { title: 'System Settings', path: '/settings', icon: 'settings', category: 'Configuration' },
    { title: 'Command Inbox', path: '/inbox', icon: 'inbox', category: 'Communications' },
  ];

  const filteredResults = searchTerm.trim() 
    ? searchableNodes.filter(node => 
        node.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        node.category.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="w-full sticky top-0 z-50 bg-slate-900/90 backdrop-blur-xl flex justify-between items-center px-8 h-16 border-b border-white/5">
      <div className="flex items-center gap-6 w-1/2">
        <div className="relative w-full max-w-md group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-400 transition-colors pointer-events-none z-10">
            search
          </span>
          <input
            type="text"
            className="w-full bg-slate-800/50 border-none rounded-full pl-10 pr-4 py-2 text-sm text-on-surface focus:ring-2 focus:ring-sky-400 transition-all font-body placeholder:text-slate-500 placeholder:opacity-60"
            placeholder="Search nodes (e.g. Mumbai, Admin, Traffic)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          />

          <AnimatePresence>
            {isSearchFocused && searchTerm.trim() && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-3 bg-slate-900 border border-white/10 rounded-2xl shadow-3xl overflow-hidden z-[100] backdrop-blur-2xl"
              >
                <div className="p-2">
                  {filteredResults.length > 0 ? filteredResults.map((node, i) => (
                    <button
                      key={i}
                      onClick={() => { navigate(node.path); setSearchTerm(''); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-primary transition-colors">{node.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white leading-none">{node.title}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{node.category}</span>
                      </div>
                      <span className="material-symbols-outlined text-sm text-slate-600 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                    </button>
                  )) : (
                    <div className="px-4 py-6 text-center">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No results for "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            onClick={() => { setIsNotifOpen(!isNotifOpen); setIsProfileOpen(false); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors relative ${isNotifOpen ? 'bg-primary/20 text-primary' : 'text-slate-400 hover:text-sky-300 hover:bg-slate-800/50'}`}
          >
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-white text-[8px] font-black flex items-center justify-center rounded-full ring-2 ring-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-3 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl"
              >
                <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Notifications Center</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-black rounded-full uppercase tracking-widest">{unreadCount} New</span>
                  </div>
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {unreadNotifications.length > 0 ? unreadNotifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={`p-4 border-b border-white/5 transition-all relative group bg-indigo-500/5`}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'alert' ? 'bg-error/10 text-error' : 
                          notif.type === 'warning' ? 'bg-warning/10 text-warning' : 
                          'bg-sky-400/10 text-sky-400'
                        }`}>
                          <span className="material-symbols-outlined text-lg">
                            {notif.type === 'alert' ? 'emergency' : notif.type === 'warning' ? 'warning' : 'info'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white mb-1 leading-tight">{notif.title}</p>
                          <p className={`text-[10px] text-slate-400 leading-relaxed ${expandedNotif === notif.id ? '' : 'truncate'}`}>
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                             <button 
                               onClick={() => setExpandedNotif(expandedNotif === notif.id ? null : notif.id)}
                               className="text-[8px] text-primary font-black uppercase tracking-widest hover:text-sky-300 transition-colors"
                             >
                               {expandedNotif === notif.id ? 'Collapse Details' : 'Expand Alert News'}
                             </button>
                             <button 
                               onClick={() => markRead(notif.id)}
                               className="px-2 py-1 bg-white/5 hover:bg-primary text-[8px] text-slate-300 hover:text-white font-black uppercase tracking-widest rounded transition-all border border-white/5"
                             >
                               Archive Directive
                             </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center">
                      <span className="material-symbols-outlined text-4xl text-slate-700 mb-4 block">mail_lock</span>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nexus Inbox Clean</p>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white/5 border-t border-white/5">
                  <Link 
                    to="/inbox" 
                    onClick={() => setIsNotifOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-all group"
                  >
                    Open Command Inbox
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="h-8 w-[1px] bg-slate-800 mx-2"></div>
        
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-2 rounded-full hover:bg-white/5 transition-all outline-none border border-white/0 hover:border-white/5"
          >
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-white leading-tight uppercase tracking-tight">{user?.name || 'Alex Rivera'}</p>
              <p className="text-[8px] text-sky-400 font-bold uppercase tracking-widest mt-0.5 opacity-80">{user?.role || 'User'}</p>
            </div>
            <div className="relative flex-shrink-0">
              <img
                src={avatar || user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuA0AB9twQkxWvt6-lb0R_30tDec05uq8VOUaZhCarzyFQUcbGAo2QRoRezqsUKY1UEkzneKHCl8A2C832BsXGh2RxoRr0lmSoWLN_mA5DaKmk--a7INUurDbfdMiXPE1jwTFeZMotSvWRWiQRLfIxTRbtdyuBbRX04Ey8pZD9lVm-pKkl5FYod6OWKdjBjLvTBUDiAL6AEzzgeQQqAw-au8mU0RZWxrsmeaI80IMgVV7ssejI9_FZ-nq4I53xVPiRydPVQOyDIdvow"}
                alt="User profile"
                className="w-9 h-9 rounded-full border-2 border-slate-700 object-cover shadow-2xl ring-2 ring-sky-400/10"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-tertiary rounded-full border-2 border-slate-900 shadow-sm"></div>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] backdrop-blur-xl"
              >
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={avatar || user?.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuA0AB9twQkxWvt6-lb0R_30tDec05uq8VOUaZhCarzyFQUcbGAo2QRoRezqsUKY1UEkzneKHCl8A2C832BsXGh2RxoRr0lmSoWLN_mA5DaKmk--a7INUurDbfdMiXPE1jwTFeZMotSvWRWiQRLfIxTRbtdyuBbRX04Ey8pZD9lVm-pKkl5FYod6OWKdjBjLvTBUDiAL6AEzzgeQQqAw-au8mU0RZWxrsmeaI80IMgVV7ssejI9_FZ-nq4I53xVPiRydPVQOyDIdvow"}
                      alt="User avatar"
                      className="w-10 h-10 rounded-full border border-white/10 object-cover"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-tertiary rounded-full border-2 border-slate-900 shadow-sm"></div>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Command Control</p>
                    <p className="text-xs text-white font-bold truncate">{user?.name || 'Alex Rivera'}</p>
                    <p className="text-[9px] text-sky-400 font-bold uppercase tracking-widest opacity-60 mt-0.5">{user?.role || 'User'}</p>
                  </div>
                </div>
                
                <div className="p-2">
                  <Link 
                    to="/settings" 
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                  >
                    <span className="material-symbols-outlined text-xl group-hover:text-primary">account_circle</span>
                    <div className="flex flex-col">
                      <span className="font-bold leading-tight">Profile Settings</span>
                      <span className="text-[9px] text-slate-500 uppercase font-black mt-0.5">Edit username & avatar</span>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/settings" 
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all group"
                  >
                    <span className="material-symbols-outlined text-xl group-hover:text-tertiary">lock</span>
                    <div className="flex flex-col">
                      <span className="font-bold leading-tight">Security & Access</span>
                      <span className="text-[9px] text-slate-500 uppercase font-black mt-0.5">Change pass-codes</span>
                    </div>
                  </Link>
                </div>

                <div className="p-2 border-t border-white/5">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-error/70 hover:text-error hover:bg-error/5 rounded-xl transition-all font-bold"
                  >
                    <span className="material-symbols-outlined text-xl">logout</span>
                    Session Termination
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
