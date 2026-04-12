const PredictionHero = () => {
  const stats = [
    { label: 'Prediction Accuracy', value: '98.4%', icon: 'verified', color: 'text-sky-400' },
    { label: 'Active Sensors', value: '1,204', icon: 'sensors', color: 'text-primary' },
    { label: 'Emission Reduction', value: '-14.2%', icon: 'eco', color: 'text-tertiary' },
    { label: 'Last Update', value: '0.4s ago', icon: 'update', color: 'text-on-surface' },
  ];

  return (
    <section className="w-full space-y-6 font-body">
      <div className="space-y-3">
        <span className="text-sky-400 font-headline font-bold text-sm tracking-widest uppercase">Predictive Intelligence</span>
        <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight leading-tight">Mobility Forecasting Engine</h2>
        <p className="text-on-surface max-w-2xl font-medium leading-relaxed opacity-90">
          Leverage neural network-driven analysis to anticipate urban flow patterns, congestion risks, and environmental impact before they occur.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-on-surface/5">
        {stats.map((stat, i) => (
          <div key={i} className="space-y-2 group">
            <div className="flex items-center gap-2 mb-1">
              <span className={`material-symbols-outlined text-base ${stat.color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                {stat.icon}
              </span>
              <span className="text-[9px] font-black text-on-surface uppercase tracking-widest">{stat.label}</span>
            </div>
            <p className="text-2xl font-headline font-black text-on-surface tracking-tighter group-hover:text-sky-300 transition-colors">
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PredictionHero;






