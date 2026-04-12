import React from 'react';
import { motion } from 'framer-motion';



const GlassCard = ({ children, className = "", hover = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      className={`bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-on-surface/5 shadow-2xl overflow-hidden transition-all duration-500 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;






