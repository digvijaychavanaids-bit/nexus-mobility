import { motion } from 'framer-motion';
import AboutHero from './About/AboutHero';
import MissionStats from './About/MissionStats';
import CoreTechnologies from './About/CoreTechnologies';
import StrategicPartners from './About/StrategicPartners';
import VisionaryTeam from './About/VisionaryTeam';
import AboutFooter from './About/AboutFooter';

const About = () => {
  return (
    <div className="flex-1 flex flex-col min-h-screen tonal-transition">
      <header className="sticky top-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl flex justify-between items-center px-8 h-16 w-full border-b border-on-surface/5 font-manrope">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-black tracking-tighter text-sky-400 antialiased">Nexus Mobility</h1>
          <nav className="hidden lg:flex items-center gap-8">
            <a className="text-on-surface font-black text-[10px] uppercase tracking-widest hover:text-sky-300 transition-all cursor-pointer" href="#">Infrastructure</a>
            <a className="text-on-surface font-black text-[10px] uppercase tracking-widest hover:text-sky-300 transition-all cursor-pointer" href="#">Case Studies</a>
            <a className="text-sky-400 font-black text-[10px] uppercase tracking-widest border-b-2 border-sky-400 pb-1" href="#">About Mission</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-sm">notifications</span>
          </button>
          <div className="h-8 w-8 rounded-full overflow-hidden border border-sky-400/30 shadow-lg">
            <img 
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAomZDKX2ndRoWLXiZ5N8DaYrffLskH7Nji_bGSMpAIRrfrhMt4K4BdgIOcwqAhArvM2lMQBxQslbKNXr4Zs3XTAPb5gMJXM_07mWcqTt2u7-A9pJgfZ_ARNXRyUW2yggTOEyv8mEnMspJic9A_qkP8oUaetvj_lDf_dt7QcGENPlJhSh6wRMsu3n8u8PAU8t7hQvX5nhfnqTdfFHlE-gvI_zGn5b6XJFXuXU97sIRwiqNjcdrcvS15kcduTyP-efABuMmxf_Dx-nc" 
              alt="User profile"
            />
          </div>
        </div>
      </header>

      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 lg:p-12 space-y-24 max-w-[1400px] mx-auto w-full"
      >
        <AboutHero />
        <MissionStats />
        <CoreTechnologies />
        <StrategicPartners />
        <VisionaryTeam />
      </motion.main>
      
      <AboutFooter />
    </div>
  );
};

export default About;






