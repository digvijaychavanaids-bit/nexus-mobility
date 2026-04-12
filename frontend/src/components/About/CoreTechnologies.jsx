const CoreTechnologies = () => {
  const techs = [
    { 
      title: 'Edge-IoT Mesh', 
      desc: 'A distributed network of 5G-enabled thermal and optical sensors capturing millisecond-precision movement data without compromising citizen privacy.', 
      category: 'Hardware Layer', 
      icon: 'sensors',
      grid: 'lg:col-span-2'
    },
    { 
      title: 'Neural Networks', 
      desc: 'Deep learning models trained on decades of traffic patterns to predict gridlock before it starts.', 
      category: 'Intelligence Layer', 
      icon: 'neurology'
    },
    { 
      title: 'Digital Twin', 
      desc: 'Every city is mirrored in a virtual environment for stress-testing infrastructure changes in real-time.', 
      category: 'Simulation Layer', 
      icon: 'hub'
    },
    { 
      title: 'Cloud-Edge Hybrid', 
      desc: 'Processing data where it happens to minimize latency in emergency routing.', 
      category: 'Processing Layer', 
      icon: 'cloud_sync',
      grid: 'lg:col-span-3'
    },
    { 
      title: 'Zero Trust', 
      desc: 'End-to-end encryption for all municipal data and node authentication.', 
      category: 'Security Layer', 
      icon: 'security',
      align: 'center'
    }
  ];

  return (
    <section className="space-y-10 mb-20 font-body">
      <div className="flex flex-col gap-3">
        <h3 className="text-3xl font-black font-headline tracking-tighter text-on-surface uppercase antialiased">Core Technologies</h3>
        <p className="text-on-surface text-sm font-medium opacity-70">The hardware and logic driving our precision analytics suite.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {techs.map((tech, i) => (
          <div 
            key={i} 
            className={`${tech.grid || 'lg:col-span-1'} bg-surface-container-high/50 p-8 rounded-2xl border border-on-surface/5 shadow-2xl relative overflow-hidden group hover:border-primary/20 transition-all duration-700`}
          >
            <div className="flex justify-between items-start mb-8 relative z-20">
              <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-3xl leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>{tech.icon}</span>
              </div>
              <span className="text-[9px] font-black text-on-surface uppercase tracking-widest opacity-50">{tech.category}</span>
            </div>
            
            <h4 className="text-2xl font-black text-on-surface font-headline tracking-tighter mb-4 antialiased relative z-20">{tech.title}</h4>
            <p className="text-sm text-on-surface leading-relaxed font-medium opacity-90 relative z-20">{tech.desc}</p>
            
            {tech.title === 'Cloud-Edge Hybrid' && (
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-5 grayscale brightness-50 pointer-events-none group-hover:opacity-10 transition-opacity z-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNByvS_Ag3LfGMhaZ5oHds-5xYppYWYMfNm1PWQinH2ysLX6CalwXX1iegRN-71_zFnC6akInG4Gm4RG9cWBl1Oqu1FliqdvocowOR_mDWW4Dj3uD3g3x78VyAcBDMqz4K_0S3crXDtuy7gZkoIOExSFFqiPfx2p0Rm_5asIU29zkH1SFLwHK9pZNFmm3TcHKygERsJf1qd4qLzcJOAvHd0KNioP07WfkM94khJZfOpSjgtkCOOWFYNVqB73OjqGSaI-VihoVpjOA" 
                alt="Infrastructure"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoreTechnologies;






