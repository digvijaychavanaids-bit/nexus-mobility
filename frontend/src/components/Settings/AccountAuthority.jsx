const AccountAuthority = ({ role }) => {
  return (
    <div className="bg-surface-container-highest/20 rounded-xl p-5 flex items-center justify-between border border-on-surface/5 font-body shadow-inner ring-1 ring-white/5 group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 transition-transform group-hover:rotate-12">
          <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
        </div>
        <span className="text-[10px] font-black text-secondary-fixed uppercase tracking-[0.2em] opacity-60">Account Authority</span>
      </div>
      <span className="px-4 py-1.5 rounded-full text-[10px] font-black bg-secondary-container text-on-secondary-container uppercase tracking-widest shadow-sm">
        {role || 'General User'}
      </span>
    </div>
  );
};

export default AccountAuthority;






