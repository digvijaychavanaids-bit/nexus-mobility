
const TrafficAssistant = () => {
    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/5 space-y-4 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20 shrink-0">
                    <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
                </div>
                <div className="space-y-0.5 min-w-0">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.15em]">Neural Traffic Insight</p>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary shrink-0" />
                        <span className="text-[9px] font-black text-tertiary uppercase animate-pulse">Deep-Node Active</span>
                    </div>
                </div>
            </div>

            <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                Pattern detection indicates a bottleneck at Sector 07. Heavy industrial load (+18%) correlated with local events. Neural routing distributed to all nodes.
            </p>

            <div className="flex gap-2 p-1.5 bg-black/40 rounded-xl border border-white/5">
                <input
                  type="text"
                  placeholder="Query system intelligence..."
                  className="w-full bg-transparent text-[10px] font-bold uppercase tracking-wide px-2 py-1.5 outline-none text-white placeholder-slate-600"
                />
                <button className="bg-primary/20 px-2.5 py-1.5 rounded-lg hover:bg-primary/40 transition-all shrink-0">
                    <span className="material-symbols-outlined text-primary text-base leading-none">send</span>
                </button>
            </div>
        </div>
    );
};

export default TrafficAssistant;
