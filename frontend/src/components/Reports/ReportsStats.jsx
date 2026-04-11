const ReportsStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 font-body">
      {/* Total Reports */}
      <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group border border-slate-800/50 shadow-lg">
        <div className="relative z-10">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">Total Reports</span>
          <div className="text-3xl font-headline font-black text-white mt-1 antialiased">1,284</div>
          <div className="flex items-center gap-1 text-tertiary mt-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-xs leading-none">trending_up</span>
            <span>12% this month</span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-8xl">description</span>
        </div>
      </div>

      {/* Data Accuracy */}
      <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden group border border-slate-800/50 shadow-lg">
        <div className="relative z-10">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">Data Accuracy</span>
          <div className="text-3xl font-headline font-black text-white mt-1 antialiased">99.4%</div>
          <div className="flex items-center gap-1 text-tertiary mt-2 text-[10px] font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-xs leading-none">verified</span>
            <span>Sensor Validated</span>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-8xl">precision_manufacturing</span>
        </div>
      </div>

      {/* System Health / Node Distribution */}
      <div className="md:col-span-2 bg-surface-container-low rounded-xl overflow-hidden flex border border-slate-800/50 shadow-lg">
        <div className="p-6 flex-1">
          <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black">System Health</span>
          <div className="text-xl font-headline font-black text-white mt-1 tracking-tight">Node Distribution</div>
          <div className="mt-4 flex gap-1 h-1.5 shadow-inner bg-slate-800 rounded-full overflow-hidden">
            <div className="w-[60%] bg-tertiary" title="Active"></div>
            <div className="w-[25%] bg-primary" title="Maintenance"></div>
            <div className="w-[15%] bg-error" title="Error"></div>
          </div>
          <div className="flex justify-between mt-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_8px_rgba(112,216,200,0.5)]"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Active (4,821)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(148,204,255,0.5)]"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Maint (142)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-error shadow-[0_0_8px_rgba(255,180,171,0.5)]"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Error (12)</span>
            </div>
          </div>
        </div>
        <div className="w-32 bg-surface-container-high/50 flex items-center justify-center border-l border-white/5">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 font-light">hub</span>
        </div>
      </div>
    </div>
  );
};

export default ReportsStats;
