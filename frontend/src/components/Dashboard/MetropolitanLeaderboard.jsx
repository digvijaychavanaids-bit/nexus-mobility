import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const MetropolitanLeaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await api.get('/analytics/metropolitan-leaderboard');
                setLeaderboard(res.data);
            } catch (err) {
                console.error("Failed to load metropolitan leaderboard");
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return null;

    return (
        <div className="bg-surface-container-low p-6 rounded-[2rem] border border-white/5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black text-white uppercase tracking-widest font-headline">Metropolitan Efficiency</h3>
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ranked by Least Traffic</span>
            </div>

            <div className="space-y-3">
                {leaderboard.map((item, index) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={item.city}
                        className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all group"
                    >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
                            index === 0 ? 'bg-primary text-on-primary' : 'bg-slate-800 text-slate-400'
                        }`}>
                            {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white truncate uppercase tracking-tight">{item.city}</p>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.status}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black text-primary tabular-nums">{item.congestion}%</p>
                            <p className="text-[8px] font-bold text-slate-600 uppercase">Load</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default MetropolitanLeaderboard;
