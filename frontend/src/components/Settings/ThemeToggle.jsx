
const ThemeToggle = ({ currentTheme, onToggle }) => {
  return (
    <section className="bg-surface-container-low rounded-xl p-8 border border-on-surface/5 shadow-2xl font-body group relative overflow-hidden">
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-tertiary/5 rounded-full blur-3xl group-hover:bg-tertiary/10 transition-all"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              {currentTheme === 'dark' ? 'dark_mode' : 'light_mode'}
            </span>
            <h3 className="text-lg font-black text-on-surface font-headline tracking-tighter uppercase antialiased">Interface Theme</h3>
          </div>
          <p className="text-[10px] uppercase font-black tracking-[0.2em] text-on-surface opacity-60">Visual System Protocol</p>
        </div>
        
        <button 
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-1 ring-white/10 ${
            currentTheme === 'dark' ? 'bg-primary-container' : 'bg-slate-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            currentTheme === 'dark' ? 'translate-x-6' : 'translate-x-1'
          }`}></span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6 relative z-10">
        <div 
          onClick={() => currentTheme !== 'dark' && onToggle()}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 group/dark ${
            currentTheme === 'dark' ? 'border-primary bg-primary/5' : 'border-on-surface/5 bg-transparent hover:bg-on-surface/5'
          }`}
        >
          <div className="w-full h-16 bg-surface-container rounded-lg border border-on-surface/10 overflow-hidden flex shadow-inner">
            <div className="w-6 h-full bg-surface-container-high border-r border-slate-700/50"></div>
            <div className="flex-1 p-3 space-y-2">
              <div className="w-10 h-1.5 bg-slate-700 rounded-full"></div>
              <div className="w-16 h-1.5 bg-slate-700/50 rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${currentTheme === 'dark' ? 'text-primary' : 'text-on-surface'}`}>
              High Contrast Dark
            </span>
            {currentTheme === 'dark' && <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
          </div>
        </div>

        <div 
          onClick={() => currentTheme !== 'light' && onToggle()}
          className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-3 group/light ${
            currentTheme === 'light' ? 'border-primary bg-primary/5' : 'border-on-surface/5 bg-transparent hover:bg-on-surface/5'
          }`}
        >
          <div className="w-full h-16 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex shadow-inner">
            <div className="w-6 h-full bg-slate-200 border-r border-slate-300/50"></div>
            <div className="flex-1 p-3 space-y-2">
              <div className="w-10 h-1.5 bg-slate-300 rounded-full"></div>
              <div className="w-16 h-1.5 bg-slate-300/50 rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-black uppercase tracking-widest ${currentTheme === 'light' ? 'text-primary' : 'text-on-surface'}`}>
              Precision Light
            </span>
            {currentTheme === 'light' && <span className="material-symbols-outlined text-primary text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThemeToggle;






