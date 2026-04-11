const AboutFooter = () => {
  return (
    <footer className="mt-auto bg-surface-container-lowest py-16 px-12 border-t border-white/5 font-body">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-lg">transit_enterexit</span>
          </div>
          <span className="text-sm font-black tracking-widest text-white uppercase antialiased">Nexus Mobility © 2024</span>
        </div>
        
        <div className="flex gap-12 text-[10px] text-on-surface-variant font-black uppercase tracking-[0.3em] opacity-60">
          <a className="hover:text-primary transition-colors cursor-pointer" href="#">Privacy Policy</a>
          <a className="hover:text-primary transition-colors cursor-pointer" href="#">System Status</a>
          <a className="hover:text-primary transition-colors cursor-pointer" href="#">API Documentation</a>
        </div>
      </div>
    </footer>
  );
};

export default AboutFooter;
