const SettingsFooter = ({ onSave, onCancel }) => {
  return (
    <div className="pt-10 border-t border-outline-variant/10 flex flex-col md:flex-row items-center justify-between gap-8 font-body">
      <div className="flex flex-col sm:flex-row items-center gap-6 text-[10px] text-on-surface-variant uppercase font-black tracking-widest opacity-60">
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>history</span> 
          Last change: 42 days ago
        </span>
        <span className="hidden sm:block w-1.5 h-1.5 bg-outline/20 rounded-full"></span>
        <span className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>sync</span> 
          City Planning API Synced
        </span>
      </div>
      
      <div className="flex items-center gap-4 w-full md:w-auto">
        <button 
          onClick={onCancel}
          className="flex-1 md:flex-none px-10 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface hover:bg-surface-container-highest/50 transition-all rounded-full border border-white/5 active:scale-95"
        >
          Cancel Changes
        </button>
        <button 
          onClick={onSave}
          className="flex-1 md:flex-none cta-gradient px-12 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-on-primary rounded-full shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-[0.97] transition-all"
        >
          Save All Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsFooter;
