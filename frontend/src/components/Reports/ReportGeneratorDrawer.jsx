import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import api from '../../services/api';

const cities = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad'];

const ReportGeneratorDrawer = ({ isOpen, onClose }) => {
  const [city, setCity] = useState('Delhi');
  const [minCongestion, setMinCongestion] = useState(40);
  const [maxCongestion, setMaxCongestion] = useState(95);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await api.get(
        `/analytics/export-report`,
        { 
          params: { city, min_congestion: minCongestion, max_congestion: maxCongestion },
          responseType: 'blob' 
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `traffic_report_${city.toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (exportError) {
      setError(exportError.response?.data?.detail || 'Unable to generate report.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-surface-container-lowest/60 backdrop-blur-sm z-[60]"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-screen w-[420px] bg-surface-container-high shadow-2xl z-[70] border-l border-on-surface/5 p-8 overflow-y-auto font-body"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-headline font-black text-on-surface tracking-tight leading-none uppercase">Generate Report</h3>
              <button onClick={onClose} className="p-2 text-on-surface hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-2xl leading-none">close</span>
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-on-surface uppercase tracking-widest mb-3">City</label>
                <div className="grid grid-cols-2 gap-3">
                  {cities.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCity(item)}
                      className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                        city === item ? 'border-primary bg-primary/10 text-primary' : 'border-on-surface/5 bg-surface-container-highest text-on-surface'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-on-surface uppercase tracking-widest mb-3">
                  Minimum congestion ({minCongestion}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={minCongestion}
                  onChange={(e) => setMinCongestion(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-on-surface uppercase tracking-widest mb-3">
                  Maximum congestion ({maxCongestion}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={maxCongestion}
                  onChange={(e) => setMaxCongestion(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div className="rounded-2xl border border-on-surface/5 bg-surface-container-highest p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface">Export format</p>
                <p className="mt-2 text-sm font-bold text-on-surface">
                  CSV report with congestion, pollution, weather, and hourly trend columns.
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-error">
                  {error}
                </div>
              )}

              <button
                onClick={handleExport}
                disabled={exporting || success}
                className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-3 shadow-xl hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-sm disabled:opacity-60 ${
                  success ? 'bg-tertiary text-on-tertiary shadow-tertiary/20' : 'bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-primary/20'
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {success ? 'check_circle' : exporting ? 'sync' : 'download'}
                </span>
                <span>
                  {success ? 'Report Ready' : exporting ? 'Generating report...' : 'Download CSV report'}
                </span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportGeneratorDrawer;






