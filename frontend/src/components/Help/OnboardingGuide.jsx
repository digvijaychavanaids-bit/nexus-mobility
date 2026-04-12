const OnboardingGuide = () => {
  const steps = [
    { num: '01', title: 'Configuring Data Streams', desc: 'Connect your city\'s IoT grid to our ingestion engine.' },
    { num: '02', title: 'Setting Prediction Thresholds', desc: 'Define alerting logic for traffic congestion events.' },
    { num: '03', title: 'Automated Signal Calibration', desc: 'Deploy AI-driven timing to physical intersections.' },
  ];

  return (
    <div className="bg-surface-container-high rounded-xl p-8 border-l-4 border-primary space-y-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
      
      <div className="space-y-2 relative z-10">
        <h4 className="text-xl font-black font-headline text-on-surface uppercase tracking-tighter antialiased">System Onboarding</h4>
        <p className="text-[10px] text-on-surface uppercase font-black tracking-widest opacity-60">Master precision in under 15 minutes.</p>
      </div>

      <div className="space-y-8 relative z-10">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-6 group/step cursor-pointer active:scale-95 transition-all">
            <div className="flex-none w-10 h-10 rounded-full border border-on-surface/5 bg-on-surface/5 flex items-center justify-center text-xs font-black text-on-surface group-hover/step:border-primary group-hover/step:text-primary group-hover/step:bg-primary/10 transition-all font-body">
              {step.num}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black text-on-surface uppercase tracking-tight group-hover/step:text-primary transition-colors">{step.title}</p>
              <p className="text-[10px] text-on-surface uppercase font-bold tracking-widest leading-relaxed opacity-60">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full py-4 px-6 rounded-full bg-gradient-to-br from-primary to-primary-container text-on-primary text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.03] active:scale-[0.97] transition-all shadow-xl shadow-primary/20">
        Launch Visual Guide
        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
      </button>
    </div>
  );
};

export default OnboardingGuide;






