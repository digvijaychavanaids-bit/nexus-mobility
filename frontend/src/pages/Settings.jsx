import { motion } from 'framer-motion';
import { useTheme } from '../components/ThemeContext';
import SettingsHero from '../components/Settings/SettingsHero';
import ProfileSettings from '../components/Settings/ProfileSettings';
import SecuritySettings from '../components/Settings/SecuritySettings';
import ThemeToggle from '../components/Settings/ThemeToggle';
import NotificationPreferences from '../components/Settings/NotificationPreferences';
import AccountAuthority from '../components/Settings/AccountAuthority';
import SettingsFooter from '../components/Settings/SettingsFooter';

const SettingsPage = () => {
  const { theme, toggleTheme } = useTheme();

  const handleSave = () => window.alert('Settings synchronized successfully.');
  const handleCancel = () => window.alert('No changes were applied.');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-12 max-w-[1200px] mx-auto pb-20 font-body"
    >
      <SettingsHero />

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left Column: Profile & Security */}
        <div className="col-span-12 xl:col-span-7 space-y-8">
          <ProfileSettings />
          <SecuritySettings />
        </div>

        {/* Right Column: Preferences & Role */}
        <div className="col-span-12 xl:col-span-5 space-y-8">
          <ThemeToggle currentTheme={theme} onToggle={toggleTheme} />
          <NotificationPreferences />
          <AccountAuthority role={localStorage.getItem('role') || 'General User'} />
        </div>
      </div>

      <SettingsFooter onSave={handleSave} onCancel={handleCancel} />

      <footer className="mt-12 pt-8 border-t border-slate-800/50 flex justify-between items-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
        <span>© 2024 Nexus Mobility Systems • Security Protocol 8.41</span>
        <div className="flex gap-6">
          <a className="hover:text-primary transition-colors" href="#">System Audit</a>
          <a className="hover:text-primary transition-colors" href="#">Privacy Vault</a>
          <a className="hover:text-primary transition-colors" href="#">Root Access</a>
        </div>
      </footer>
    </motion.div>
  );
};

export default SettingsPage;
