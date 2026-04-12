import { motion } from 'framer-motion';
import AdminHero from './Admin/AdminHero';
import PersonnelManagement from './Admin/PersonnelManagement';
import SystemLogs from './Admin/SystemLogs';
import DataIngestion from './Admin/DataIngestion';
import AccessProtocols from './Admin/AccessProtocols';
import AdminQuickStats from './Admin/AdminQuickStats';
import BroadcastConsole from './Admin/BroadcastConsole';

const AdminPanel = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-8 max-w-[1600px] mx-auto pb-20 font-body"
    >
      <AdminHero />

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Main Content: Personnel & Logs */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          <PersonnelManagement />
          <SystemLogs />
        </div>

        {/* Sidebar: Communications, Data Ingestion & Protocols */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          <BroadcastConsole />
          <DataIngestion />
          <AccessProtocols />
          <AdminQuickStats />
        </div>
      </div>

      <footer className="mt-12 pt-8 border-t border-on-surface/10/50 flex justify-between items-center text-on-surface text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
        <span>© 2026 Nexus Mobility Systems • v4.8.2-delta</span>
        <div className="flex gap-6">
          <a className="hover:text-primary transition-colors" href="#">Privacy Protocol</a>
          <a className="hover:text-primary transition-colors" href="#">Compliance</a>
          <a className="hover:text-primary transition-colors" href="#">System Support</a>
        </div>
      </footer>
    </motion.div>
  );
};

export default AdminPanel;






