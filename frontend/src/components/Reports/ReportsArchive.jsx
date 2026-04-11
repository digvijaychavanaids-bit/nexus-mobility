import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const ReportRow = ({ title, date, author, authorInitial, status, size, type, city, minC, maxC }) => {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get(
        `/analytics/export-report?city=${city}&min_congestion=${minC}&max_congestion=${maxC}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${title.toLowerCase().replace(/ /g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download failed', e);
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/api/analytics/export-report?city=${city}&min_congestion=${minC}&max_congestion=${maxC}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors = {
    Validated: 'bg-tertiary/10 border-tertiary/20 text-tertiary',
    Review: 'bg-primary/10 border-primary/20 text-primary',
    Archived: 'bg-outline/10 border-outline/20 text-outline',
  };

  const iconColors = {
    pdf: 'bg-error-container/20 text-error',
    desc: 'bg-tertiary-container/20 text-tertiary',
    csv: 'bg-secondary-container/20 text-secondary',
  };

  const icon = type === 'pdf' ? 'picture_as_pdf' : type === 'csv' ? 'table_chart' : 'description';

  return (
    <tr className="hover:bg-white/[0.02] transition-colors group cursor-pointer font-body">
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${iconColors[type] || iconColors.desc}`}>
            <span className="material-symbols-outlined text-xl leading-none">{icon}</span>
          </div>
          <div>
            <p className="text-sm font-black text-white group-hover:text-primary transition-colors tracking-tight uppercase leading-none">{title}</p>
            <p className="text-[10px] text-on-surface-variant mt-1.5 font-bold uppercase tracking-widest">{size}</p>
          </div>
        </div>
      </td>
      <td className="px-8 py-5 text-xs text-on-surface-variant font-black uppercase tracking-widest leading-none">{date}</td>
      <td className="px-8 py-5">
        <div className="flex items-center gap-2">
          {authorInitial ? (
            <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-[10px] font-black text-on-primary-container leading-none shadow-sm">{authorInitial}</div>
          ) : (
            <span className="material-symbols-outlined text-sm text-slate-500 leading-none">robot_2</span>
          )}
          <span className="text-[10px] font-black font-headline text-on-surface uppercase tracking-widest leading-none">{author}</span>
        </div>
      </td>
      <td className="px-8 py-5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusColors[status]} text-[10px] font-black uppercase tracking-widest leading-none`}>
          <span className={`w-1 h-1 rounded-full ${status === 'Validated' ? 'bg-tertiary' : status === 'Review' ? 'bg-primary' : 'bg-outline'}`}></span>
          {status}
        </span>
      </td>
      <td className="px-8 py-5 text-right">
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleDownload}
            disabled={downloading}
            className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-white transition-all shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg leading-none">{downloading ? 'sync' : 'download'}</span>
          </button>
          <button 
            onClick={handleShare}
            className="p-2 hover:bg-surface-container-highest rounded-lg text-on-surface-variant hover:text-white transition-all shadow-sm relative"
          >
            <span className="material-symbols-outlined text-lg leading-none">{copied ? 'done' : 'share'}</span>
            <AnimatePresence>
              {copied && (
                <motion.span 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0 }}
                   className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-primary text-on-primary text-[8px] font-black uppercase rounded shadow-lg whitespace-nowrap"
                >
                  Link Copied
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </td>
    </tr>
  );
};

const ReportsArchive = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const reports_p1 = [
    { title: 'Delhi Traffic Distribution Analysis', date: 'Oct 14, 2023 • 09:24 AM', author: 'Alex Rivera', authorInitial: 'AR', status: 'Validated', size: 'High-density urban transit nodes • 4.2 MB', type: 'csv', city: 'Delhi', minC: 0, maxC: 100 },
    { title: 'Mumbai Gridlock Sensor Audit', date: 'Oct 12, 2023 • 03:45 PM', author: 'System Auto-Gen', status: 'Review', size: 'Automated Weekly Health-Check • 1.8 MB', type: 'csv', city: 'Mumbai', minC: 0, maxC: 100 },
    { title: 'Bangalore Corridor Forecasting', date: 'Oct 10, 2023 • 11:12 AM', author: 'Sarah Jenkins', authorInitial: 'SJ', status: 'Validated', size: 'Predictive ML model export • 12.5 MB', type: 'csv', city: 'Bangalore', minC: 0, maxC: 100 },
    { title: 'Hyderabad Hotspot Raw Data (Sept)', date: 'Oct 08, 2023 • 08:00 AM', author: 'Marcus Lane', authorInitial: 'ML', status: 'Archived', size: 'CSV Raw Dataset • 256 KB', type: 'csv', city: 'Hyderabad', minC: 0, maxC: 100 },
  ];

  const reports_p2 = [
    { title: 'Chennai Commuter Peak Trends', date: 'Oct 05, 2023 • 02:15 PM', author: 'Alex Rivera', authorInitial: 'AR', status: 'Validated', size: 'Mass Transit Corridor Study • 3.1 MB', type: 'csv', city: 'Chennai', minC: 0, maxC: 100 },
    { title: 'Metropolitan Air Quality Indexing', date: 'Oct 03, 2023 • 10:30 AM', author: 'System Auto-Gen', status: 'Archived', size: 'Multi-City AQI Comparison • 5.4 MB', type: 'csv', city: 'Delhi', minC: 0, maxC: 100 },
    { title: 'Ahmedabad Signal Phase Log', date: 'Oct 01, 2023 • 04:00 PM', author: 'Admin Console', authorInitial: 'AD', status: 'Validated', size: 'Traffic Flow Phase Data • 890 KB', type: 'csv', city: 'Mumbai', minC: 0, maxC: 100 },
  ];

  const currentReports = page === 1 ? reports_p1 : reports_p2;
  const filteredReports = currentReports.filter(r => r.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <section className="bg-surface-container-low rounded-xl shadow-2xl border border-slate-800/50">
      <div className="px-8 py-6 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-6">
          <h3 className="text-lg font-headline font-black text-white uppercase tracking-tighter antialiased">Reports Archive</h3>
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
            <button className="text-white border-b-2 border-primary pb-1 shadow-[0_4px_10px_-2px_rgba(148,204,255,0.4)]">All Files</button>
            <button className="hover:text-white pb-1 transition-colors">Shared</button>
            <button className="hover:text-white pb-1 transition-colors">Starred</button>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/40 px-4 py-2 rounded-xl border border-white/5">
          <span className="material-symbols-outlined text-sm text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-xs text-white placeholder:text-on-surface-variant placeholder:font-black placeholder:uppercase placeholder:tracking-widest"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-on-surface-variant hover:text-white transition-colors" title="Filter"><span className="material-symbols-outlined text-lg">filter_list</span></button>
          <button className="p-2 text-on-surface-variant hover:text-white transition-colors" title="More Options"><span className="material-symbols-outlined text-lg">more_vert</span></button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-highest/10">
              <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Report Title</th>
              <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Date Generated</th>
              <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Author</th>
              <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
              <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <AnimatePresence mode="popLayout">
              {filteredReports.map((r, i) => (
                <motion.tr 
                  key={r.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: i * 0.05 }}
                  className="contents"
                >
                  <ReportRow {...r} />
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <div className="px-8 py-6 flex items-center justify-between border-t border-white/5 font-body">
        <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">Showing <span className="text-white font-black">{page === 1 ? '1 - 4' : '5 - 7'}</span> of 1,284 results</p>
        <div className="flex items-center gap-1">
          <button 
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="p-2 text-on-surface-variant hover:text-white disabled:opacity-20 transition-colors"
          >
            <span className="material-symbols-outlined text-base">chevron_left</span>
          </button>
          <button 
            onClick={() => setPage(1)}
            className={`w-8 h-8 flex items-center justify-center text-[10px] font-black rounded-md transition-all ${page === 1 ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-white'}`}
          >
            1
          </button>
          <button 
            onClick={() => setPage(2)}
            className={`w-8 h-8 flex items-center justify-center text-[10px] font-black rounded-md transition-all ${page === 2 ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'text-on-surface-variant hover:text-white'}`}
          >
            2
          </button>
          <button 
            onClick={() => setPage(page < 3 ? page + 1 : page)}
            className="p-2 text-on-surface-variant hover:text-white disabled:opacity-20 transition-colors"
          >
            <span className="material-symbols-outlined text-base">chevron_right</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReportsArchive;
