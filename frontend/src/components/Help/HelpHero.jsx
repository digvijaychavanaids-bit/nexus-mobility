const HelpHero = () => {
  const quickLinks = [
    { icon: 'auto_stories', label: 'Guides', active: true },
    { icon: 'terminal', label: 'API Docs', active: false },
    { icon: 'forum', label: 'Forum', active: false },
    { icon: 'support_agent', label: 'Tickets', active: false },
  ];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-surface-container-low p-12 border border-white/5 shadow-2xl font-body group">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none grayscale brightness-50 group-hover:scale-105 transition-transform duration-[5000ms]" 
        style={{ 
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD5gA53WLt8LHY4LqEPsSTrLHFUHkxsTnFZtuWVPkLgsUoYJsfHWFgm_t_fxJrPUW07Qixb9UnqWrMd7u1Btr8rjERtCTmSadIhMkeNFNjbsyyV1MDmpFgc_4u2_3yAtEKOPB_wNGL_IkItoUgKRCawyZthDoqskr15tOTLmoBmda6MMGj8lyUozBKit4Tp8Fs2rtmeMv5-6GKhKvfBcGOK5DHxxZ2dL4hOEWdak14MsBlAwOiZBnkBBO1DvM9hMgarNgmbJKWVpek')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        <h2 className="text-4xl font-black font-headline tracking-tighter text-white antialiased leading-tight">
          How can we assist your city planning today?
        </h2>
        <p className="text-on-surface-variant font-medium text-sm leading-relaxed max-w-md mx-auto opacity-80">
          Access detailed tutorials, technical documentation, and community-driven solutions for the Nexus Mobility ecosystem.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {quickLinks.map((link, i) => (
            <div 
              key={i} 
              className={`p-6 bg-slate-900/50 backdrop-blur-xl rounded-xl border-b-2 transition-all cursor-pointer group/link hover:bg-slate-800 ${
                link.active ? 'border-primary' : 'border-transparent hover:border-primary/50'
              }`}
            >
              <span className={`material-symbols-outlined text-2xl mb-2 transition-transform group-hover/link:scale-110 ${
                link.active ? 'text-primary' : 'text-on-surface-variant'
              }`}>
                {link.icon}
              </span>
              <p className="text-[10px] font-black uppercase tracking-widest text-white leading-none">{link.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HelpHero;
