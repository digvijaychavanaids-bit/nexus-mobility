import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, getDefaultRouteForRole, normalizeRole, setSession } from '../services/session';

const API_BASE = `${API_BASE_URL}/auth`;

const Login = () => {
  const [authMode, setAuthMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  // Proactive Session Detection: Redirect if already authenticated
  useEffect(() => {
    const token = sessionStorage.getItem('nexus_token') || localStorage.getItem('nexus_token');
    if (token) {
      const role = sessionStorage.getItem('role') || localStorage.getItem('role');
      if (role) {
        const normalizedRole = normalizeRole(role);
        navigate(getDefaultRouteForRole(normalizedRole));
      }
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'User'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (authMode === 'register') {
        await axios.post(`${API_BASE}/register`, {
          email: formData.email,
          password: formData.password,
          name: formData.fullName,
          role: formData.role
        });
        setNotice("Account initialization successful. You can now authenticate.");
        setAuthMode('login');
      } else if (authMode === 'forgot') {
        await axios.post(`${API_BASE}/forgot-password`, { email: formData.email });
        setNotice("If the email exists, recovery instructions have been dispatched.");
        setAuthMode('login');
      } else {
        const response = await axios.post(`${API_BASE}/login`, {
          email: formData.email,
          password: formData.password
        });

        const { access_token, user_id, role, name } = response.data;
        setSession({ 
          access_token, 
          role, 
          name,
          user_id 
        });
        
        const normalizedRole = normalizeRole(role);
        navigate(getDefaultRouteForRole(normalizedRole));
      }
    } catch (err) {
      if (!err.response) {
        setError("GRID CONNECTIVITY FAULT: Backend is unreachable. Ensure VITE_API_BASE_URL is set.");
      } else {
        setError(err.response?.data?.detail || "Authentication failed. Check credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-y-auto bg-black font-body flex flex-col items-center justify-center py-10 px-4">
      {/* Background: Metropolitan Telemetry Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen scale-110"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-night-city-traffic-from-above-41864-large.mp4" 
            type="video/mp4" 
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/90 to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,188,212,0.05)_0%,transparent_70%)]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo & Identity - Scaled Down for Visibility */}
        <div className="text-center mb-8 space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-xl mb-3 shadow-[0_0_20px_rgba(0,188,212,0.1)]">
            <span className="material-symbols-outlined text-primary text-2xl">traffic</span>
          </div>
          <h1 className="text-3xl font-headline font-black text-on-surface uppercase tracking-tighter leading-none">
            NEXUS <span className="text-primary italic">MOBILITY</span>
          </h1>
          <p className="text-[9px] text-on-surface font-bold uppercase tracking-[0.3em] opacity-60">
            Municipal Grid Command Center
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[2rem] border border-on-surface/10 shadow-2xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <AnimatePresence mode="wait">
              {authMode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface ml-1">Identity Name</label>
                    <input 
                      type="text" 
                      required
                      className="w-full bg-on-surface/5 border border-on-surface/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface/10 outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                      placeholder="Enter Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-on-surface ml-1">Grid Assignment</label>
                    <select 
                      className="w-full bg-on-surface/5 border border-on-surface/10 rounded-xl px-4 py-3 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary/30 appearance-none cursor-pointer"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="User" className="bg-surface-container">Citizen Terminal</option>
                      <option value="Analyst" className="bg-surface-container">Systems Analyst</option>
                      <option value="Admin" className="bg-surface-container">Grid Administrator</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-on-surface ml-1">Email Endpoint</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  className="w-full bg-on-surface/5 border border-on-surface/10 rounded-xl pl-11 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface/10 outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                  placeholder="name@nexus.gov"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface/20 text-lg">
                  alternate_email
                </span>
              </div>
            </div>

            {authMode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-on-surface">Security Key</label>
                  {authMode === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-[9px] font-black text-primary uppercase tracking-widest hover:underline opacity-60 hover:opacity-100 transition-opacity"
                    >
                      Recovery?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="password" 
                    required
                    className="w-full bg-on-surface/5 border border-on-surface/10 rounded-xl pl-11 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface/10 outline-none focus:ring-1 focus:ring-primary/30 transition-all font-medium"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface/20 text-lg">
                    key
                  </span>
                </div>
              </div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-3 bg-error/10 border border-error/20 rounded-xl flex gap-2.5 items-center"
              >
                <span className="material-symbols-outlined text-error text-base">warning</span>
                <p className="text-[10px] font-bold text-error leading-tight">{error}</p>
              </motion.div>
            )}

            {notice && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex gap-2.5 items-center"
              >
                <span className="material-symbols-outlined text-primary text-base">verified_user</span>
                <p className="text-[10px] font-bold text-primary leading-tight">{notice}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-black font-black uppercase tracking-[0.15em] py-3.5 rounded-xl transition-all shadow-[0_4px_20px_rgba(0,188,212,0.2)] active:scale-[0.98] disabled:opacity-50 relative overflow-hidden text-xs"
            >
              <span className="relative z-10">
                {loading ? "Decrypting..." : authMode === 'register' ? "Initialize Access" : authMode === 'forgot' ? "Request Recovery" : "Secure Launch"}
              </span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-on-surface/5 text-center flex flex-col gap-3">
            <button 
              onClick={() => { 
                setAuthMode(authMode === 'register' ? 'login' : 'register'); 
                setError(null); 
                setNotice(null); 
              }}
              className="text-[10px] font-bold text-on-surface hover:text-on-surface uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <span className="opacity-50">{authMode === 'register' ? "Already have a node?" : "Need grid access?"}</span>
              <span className="text-primary italic font-black">{authMode === 'register' ? "Authenticate" : "Requisition"}</span>
            </button>
            
            {authMode === 'forgot' && (
              <button 
                onClick={() => setAuthMode('login')}
                className="text-[10px] font-bold text-on-surface hover:text-on-surface uppercase tracking-widest"
              >
                Return to Login
              </button>
            )}
          </div>
        </div>

        {/* Utility Footer */}
        <div className="mt-8 flex justify-between items-center text-on-surface/30 font-bold px-2">
          <div className="flex gap-4">
            <div className="text-[7px] uppercase tracking-[0.2em] space-y-0.5">
              <p className="text-on-surface opacity-60">Status</p>
              <p className="text-primary">E2E Secure</p>
            </div>
            <div className="text-[7px] uppercase tracking-[0.2em] space-y-0.5">
              <p className="text-on-surface opacity-60">Uptime</p>
              <p>99.9%</p>
            </div>
          </div>
          <p className="text-[7px] uppercase tracking-[0.3em] font-black italic">Nexus Terminal Suite</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;






