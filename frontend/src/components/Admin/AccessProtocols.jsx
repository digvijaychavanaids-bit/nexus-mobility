const AccessProtocols = () => {
  return (
    <div className="bg-surface-container rounded-xl p-6 relative overflow-hidden group shadow-lg border border-slate-800/50 font-body">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl group-hover:bg-tertiary/20 transition-all"></div>
      <div className="flex items-start justify-between mb-4 relative z-10">
        <span className="px-3 py-1 rounded text-[10px] font-black bg-tertiary text-on-tertiary uppercase tracking-widest leading-none">Super Admin Access</span>
        <span className="material-symbols-outlined text-tertiary leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
      </div>
      <h4 className="text-sm font-black text-white mb-2 uppercase tracking-tighter antialiased">Enhanced Control Protocols</h4>
      <p className="text-xs text-on-surface-variant leading-relaxed font-medium">Your account has root-level permissions. All actions are logged and subject to audit by the Central Governing Entity.</p>
      
      <div className="mt-6 flex items-center gap-4">
        <div className="flex -space-x-2">
          <img className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVbem0HphhBbtf4IrNyCMy3dRWeu8l_KY0er6Xup5wHN8bMJ2iruIBAGtD3RyfSgh4SmyIsrH5kF-1wqqrhEWupYpSUa1XEwBGQ4uLKdwvW4WgQIpdiRY-GGlAhaP3WU5DIlxNJOXJiSZPN00_h1DnqtDb91suifXAC9WbLULqIFNio5jS1js7GGOz5KDQPmLtD1vNCuO8T0jAIxdUJdl102fEgTmDjNU_LEKED2hlgdrj9CvteT8W2Rt9pW8sYJWLcyiijwqsYa4" alt="Team member" />
          <img className="w-8 h-8 rounded-full border-2 border-slate-900 object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDeRHzo2zOrjYDhlbq3H-iYPuqnLjG6Y_ikYjXDP9nCiOr6noWOgCb69FDZMA1uBpmg3cv5-9F0Fd07s5CSdhJx6PM6E_X2yF6qbzMy7G-Bhacv1ZcSLT6r39dEqfw-7-yuAtak8WPrehPgbh-ArHeuK_0OCfkDxrfufADh99j5RZ8Th87wHkh6mfiglbpRNYAftayyegL2FL3j9AqLEMR64trDgMVqz3BUxZI91Y2R_XlOB9JTIB-6VG6RdyTygoA3pNBbwGTCO2g" alt="Team member" />
          <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-400">+4</div>
        </div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Other root admins online</p>
      </div>
    </div>
  );
};

export default AccessProtocols;
