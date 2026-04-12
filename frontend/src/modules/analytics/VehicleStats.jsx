import { motion } from 'framer-motion';

const VehicleStats = () => {
    const stats = [
        { label: 'Cars / Sedans', count: 1422, icon: 'directions_car', color: 'text-primary' },
        { label: 'Heavy Trucks', count: 86, icon: 'local_shipping', color: 'text-error' },
        { label: 'Motorcycles', count: 412, icon: 'motorcycle', color: 'text-tertiary' },
        { label: 'Public Bus', count: 12, icon: 'directions_bus', color: 'text-primary' },
        { label: 'E-Mobility', count: 28, icon: 'directions_bike', color: 'text-tertiary' },
    ];

    return (
        <div className="space-y-3">
            <h5 className="text-[9px] font-black text-on-surface uppercase tracking-[0.25em] opacity-40">Live Vessel Breakdown</h5>
            <div className="space-y-2.5">
                {stats.map((s, i) => (
                    <motion.div
                        key={s.label}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-on-surface/5 flex items-center justify-center border border-on-surface/10 group-hover:bg-on-surface/10 transition-all shrink-0">
                                <span className={`material-symbols-outlined ${s.color} text-sm`}>{s.icon}</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-on-surface uppercase tracking-tight leading-none">{s.label}</p>
                                <div className="h-0.5 w-16 bg-on-surface/5 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ width: ['20%', '60%', '45%'] }}
                                        transition={{ duration: 3 + i, repeat: Infinity }}
                                        className={`h-full ${s.color.replace('text-', 'bg-')}`}
                                    />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs font-black text-on-surface tabular-nums">{s.count.toLocaleString()}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default VehicleStats;






