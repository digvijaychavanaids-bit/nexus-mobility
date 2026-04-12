const ReportsHero = ({ onGenerate }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4 font-body">
      <div>
        <div className="flex items-center gap-2 text-[10px] text-on-surface mb-2 uppercase tracking-widest font-bold">
          <span>Analytics</span>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary">Mobility Reports</span>
        </div>
        <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface">Mobility Intelligence Reports</h2>
        <p className="text-on-surface mt-2 max-w-lg font-medium">Historical data aggregates and predictive flow analysis for metropolitan transit corridors.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex bg-surface-container-high rounded-full p-1 ring-1 ring-white/5 shadow-inner">
          <button className="px-4 py-1.5 text-[10px] font-black text-sky-400 bg-sky-400/10 rounded-full uppercase tracking-widest transition-all">PDF</button>
          <button className="px-4 py-1.5 text-[10px] font-black text-on-surface hover:text-on-surface transition-colors uppercase tracking-widest">CSV</button>
          <button className="px-4 py-1.5 text-[10px] font-black text-on-surface hover:text-on-surface transition-colors uppercase tracking-widest">JSON</button>
        </div>
        <button 
          onClick={onGenerate}
          className="bg-gradient-to-br from-primary to-primary-container text-on-primary font-black px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-primary/10 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-xl">add_chart</span>
          <span>Generate Report</span>
        </button>
      </div>
    </div>
  );
};

export default ReportsHero;






