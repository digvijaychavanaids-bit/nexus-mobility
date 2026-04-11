import { motion } from 'framer-motion';

const NexusFooter = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 font-body"
    >
      <div className="flex flex-col gap-2 p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/5 shadow-xl">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] opacity-60">ML Precision</span>
        <span className="text-3xl font-black text-white tracking-tighter">98.4%</span>
        <div className="h-1 w-full bg-white/5 mt-4 overflow-hidden rounded-full shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '98.4%' }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full bg-primary shadow-[0_0_10px_rgba(148,204,255,0.5)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/5 shadow-xl">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] opacity-60">Active Nodes</span>
        <span className="text-3xl font-black text-white tracking-tighter">1,204</span>
        <div className="h-1 w-full bg-white/5 mt-4 overflow-hidden rounded-full shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '85%' }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full bg-tertiary shadow-[0_0_10px_rgba(112,216,200,0.5)]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/5 shadow-xl">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] opacity-60">Emission Redux</span>
        <span className="text-3xl font-black text-tertiary tracking-tighter">-14.2%</span>
        <div className="h-1 w-full bg-white/5 mt-4 overflow-hidden rounded-full shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '40%' }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="h-full bg-tertiary/40"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 p-6 bg-white/[0.02] rounded-[1.5rem] border border-white/5 shadow-xl">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] opacity-60">Last Update Sync</span>
        <span className="text-3xl font-black text-slate-400 tracking-tighter">0.4s ago</span>
        <div className="flex gap-2 mt-4">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_10px_#70d8c8]"></span>
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse delay-100 shadow-[0_0_10px_#70d8c8]"></span>
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse delay-200 shadow-[0_0_10px_#70d8c8]"></span>
        </div>
      </div>
    </motion.div>
  );
};

export default NexusFooter;
