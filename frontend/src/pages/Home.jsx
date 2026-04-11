import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import AboutHero from '../components/About/AboutHero';
import MissionStats from '../components/About/MissionStats';
import CoreTechnologies from '../components/About/CoreTechnologies';
import StrategicPartners from '../components/About/StrategicPartners';
import VisionaryTeam from '../components/About/VisionaryTeam';
import AboutFooter from '../components/About/AboutFooter';

const Home = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background tonal-transition overflow-y-auto">
      {/* Public Landing TopBar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl flex justify-between items-center px-6 md:px-8 h-20 w-full border-b border-white/5 font-manrope">
        <div className="flex items-center gap-8 md:gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined font-black">transit_enterexit</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white antialiased">Nexus Mobility</h1>
          </div>
          <nav className="hidden lg:flex items-center gap-6 md:gap-8">
            <a className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-300 transition-all cursor-pointer" href="#tech">Technology</a>
            <a className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-300 transition-all cursor-pointer" href="#mission">Mission</a>
            <Link to="/about" className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-300 transition-all cursor-pointer">About Mission</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link 
            to="/login" 
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all px-3 py-2"
          >
            Sign In
          </Link>
          <Link 
            to="/login" 
            className="cta-gradient px-6 md:px-8 py-3 rounded-full text-on-primary font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Launch Terminal
          </Link>
        </div>
      </header>

      <motion.main 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-8 lg:p-12 space-y-32 max-w-[1400px] mx-auto w-full"
      >
        <AboutHero />
        
        <div id="mission">
          <MissionStats />
        </div>

        <div id="tech">
          <CoreTechnologies />
        </div>

        <StrategicPartners />
        
        <VisionaryTeam />
      </motion.main>
      
      <AboutFooter />
    </div>
  );
};

export default Home;
