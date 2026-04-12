import { motion } from 'framer-motion';
import HelpHero from '../components/Help/HelpHero';
import FAQAccordion from '../components/Help/FAQAccordion';
import OnboardingGuide from '../components/Help/OnboardingGuide';
import ExpertDirectory from '../components/Help/ExpertDirectory';
import CategoryGrid from '../components/Help/CategoryGrid';

const HelpCenter = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-12 max-w-[1400px] mx-auto pb-24 font-body relative"
    >
      <HelpHero />

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-12">
          <FAQAccordion />
          <CategoryGrid />
        </div>
        
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <OnboardingGuide />
          <ExpertDirectory />
          
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border border-primary/20 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl">contact_support</span>
             </div>
             <h4 className="text-xl font-black font-headline text-white mb-2 uppercase tracking-tighter antialiased">Still need help?</h4>
             <p className="text-[10px] text-on-surface-variant mb-6 uppercase font-black tracking-widest opacity-60 leading-relaxed">Our designated urban planners are available 24/7 for technical escalation.</p>
             <button className="w-full py-4 rounded-full bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all shadow-xl active:scale-95">
                Start Live Session
             </button>
          </div>
        </div>
      </div>

      <button className="fixed bottom-10 right-10 w-16 h-16 rounded-full bg-primary text-on-primary shadow-2xl shadow-primary/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group border-4 border-slate-950">
        <div className="absolute -top-12 right-0 bg-white text-slate-900 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-2xl pointer-events-none">
          Live Assistant
        </div>
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
      </button>

      <footer className="mt-12 pt-8 border-t border-slate-800/50 flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
        <span>© 2026 Nexus Mobility Support • Protocol 9.1</span>
        <div className="flex gap-6">
          <a className="hover:text-primary transition-colors" href="#">Service SLA</a>
          <a className="hover:text-primary transition-colors" href="#">Legal Compliance</a>
          <a className="hover:text-primary transition-colors" href="#">Emergency Ops</a>
        </div>
      </footer>
    </motion.div>
  );
};

export default HelpCenter;
