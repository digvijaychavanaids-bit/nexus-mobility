const AboutHero = () => {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-20 font-body">
      <div className="lg:col-span-7 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tertiary/10 border border-tertiary/20 text-tertiary text-[10px] font-black uppercase tracking-[0.2em] antialiased">
          The Digital Cartographer
        </div>
        <h2 className="text-5xl lg:text-7xl font-headline font-black tracking-tighter text-white leading-[1.1] antialiased">
          Architecting the <span className="text-primary italic">Pulse</span> of Modern Cities.
        </h2>
        <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl font-medium opacity-90">
          Nexus Mobility is more than a dashboard. It's a neural infrastructure layer for urban environments, translating trillions of data points into fluid, human-centric movement patterns.
        </p>
        <div className="flex gap-4 pt-4">
          <button className="cta-gradient px-10 py-5 rounded-full text-on-primary font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.97] transition-all">
            View Technology Stack
          </button>
        </div>
      </div>
      
      <div className="lg:col-span-5 relative group">
        <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group-hover:ring-primary/30 transition-all duration-700">
          <img 
            className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2000ms]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDwn0vm78Lu9ItvSRZE5szsKF9C16jVGSfLkq53Mi3U4pcveQnWPULkTovlaicUlEF39ibzxxe8LPszLkRq0JqRVmlKLKGcefrUzUzuwnHp2Y5n4bTtc43izcGxXTZRIwolgeiVHH-UBBNudXCHNvLPhL4wzIZ_Uxzo4fnceqcfmyM82vipJDSHMlY_uo5Q8KJCf63BFX31v0LrEhJm1JMGnuRKAVnJCnfk--1pRcGe8gmGC6dS2H_AzUBG0hemMlbOMU6QzIVVIk" 
            alt="City Digital Grid"
          />
        </div>
        <div className="absolute -bottom-8 -left-8 bg-surface-container-high/95 backdrop-blur-2xl p-6 rounded-2xl border border-white/10 shadow-2xl max-w-[260px] z-10">
          <p className="text-primary font-black text-4xl font-headline tracking-tighter mb-2">99.8%</p>
          <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest opacity-80">Prediction Accuracy</p>
          <div className="mt-4 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-primary w-[99.8%] shadow-[0_0_8px_rgba(148,204,255,0.4)]"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
