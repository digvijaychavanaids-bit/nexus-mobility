import { useState } from 'react';
import { motion } from 'framer-motion';
import ReportsHero from '../components/Reports/ReportsHero';
import ReportsStats from '../components/Reports/ReportsStats';
import ReportsArchive from '../components/Reports/ReportsArchive';
import ReportGeneratorDrawer from '../components/Reports/ReportGeneratorDrawer';

const Reports = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-12 max-w-[1600px] mx-auto pb-20 font-body relative"
    >
      <ReportsHero onGenerate={() => setIsDrawerOpen(true)} />

      <div className="space-y-8">
        <ReportsStats />
        <ReportsArchive />
      </div>

      <ReportGeneratorDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </motion.div>
  );
};

export default Reports;
