const MissionStats = () => {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 font-body">
      <div className="md:col-span-2 bg-surface-container-low p-10 rounded-2xl space-y-8 border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        <h3 className="text-3xl font-black font-headline tracking-tighter text-white uppercase antialiased relative z-10">Our Global Mission</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
               <span className="material-symbols-outlined text-primary text-4xl">reduce_capacity</span>
            </div>
            <h4 className="text-xl font-black text-white tracking-tight uppercase">Congestion Neutrality</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed opacity-90 font-medium">Reducing idle time by 40% through real-time AI-driven signal synchronization and lane management.</p>
          </div>
          <div className="space-y-4">
            <div className="w-16 h-16 rounded-xl bg-tertiary/10 flex items-center justify-center border border-tertiary/20 shadow-inner">
               <span className="material-symbols-outlined text-tertiary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>nature_people</span>
            </div>
            <h4 className="text-xl font-black text-white tracking-tight uppercase">Carbon-Zero Flow</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed opacity-90 font-medium">Directing mobility patterns to minimize emissions hotspots in high-density residential areas.</p>
          </div>
        </div>
      </div>
      
      <div className="bg-primary-container p-10 rounded-2xl text-on-primary-container flex flex-col justify-between shadow-2xl shadow-primary/10 group hover:shadow-primary/20 active:scale-95 transition-all">
        <span className="material-symbols-outlined text-7xl opacity-20 group-hover:rotate-12 transition-transform duration-700 leading-none pointer-events-none">public</span>
        <div className="py-6 relative z-10">
          <h4 className="text-6xl font-black font-headline tracking-tighter antialiased leading-none">5</h4>
          <p className="text-sm font-black uppercase tracking-widest leading-tight mt-3">Smart Cities Integrated</p>
        </div>
        <div className="pt-6 border-t border-on-primary-container/20 relative z-10">
          <p className="text-[10px] uppercase tracking-widest font-black opacity-60">Global Presence Layer 0.4</p>
        </div>
      </div>
    </section>
  );
};

export default MissionStats;
