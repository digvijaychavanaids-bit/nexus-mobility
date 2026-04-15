import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const SAMPLE_CSV = `date,time,city,weather,is_holiday,is_event
2026-05-20,9 AM,Delhi,clear,no,no
2026-05-20,6 PM,Delhi,rainy,no,yes
2026-05-21,8 AM,Mumbai,foggy,no,no
2026-05-25,5 PM,Bangalore,stormy,yes,no
2026-06-15,10 AM,Chennai,clear,no,no
2026-08-15,9 AM,Delhi,clear,yes,yes
`;

function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function resultsToCsv(predictions) {
  const header = 'date,day,time,city,weather,is_holiday,is_event,congestion_percent,traffic_status,advice';
  const rows = predictions.map((p) =>
    [
      p.date,
      p.day,
      p.time,
      p.city,
      p.weather,
      p.is_holiday ? 'yes' : 'no',
      p.is_event ? 'yes' : 'no',
      p.congestion,
      p.status,
      `"${p.advice}"`,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

const StatusBadge = ({ status, congestion }) => {
  const colorMap = {
    'Very High': 'bg-red-500/20 text-red-400',
    'High': 'bg-orange-500/20 text-orange-400',
    'Moderate': 'bg-yellow-500/20 text-yellow-400',
    'Low': 'bg-green-500/20 text-green-400',
    'Very Low': 'bg-emerald-500/20 text-emerald-400',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colorMap[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status} ({congestion?.toFixed(1)}%)
    </span>
  );
};

const InsightCard = ({ icon, label, value, sub, color = 'text-primary' }) => (
  <div className="bg-on-surface/5 rounded-2xl p-4 space-y-1">
    <div className="flex items-center gap-2">
      <span className={`material-symbols-outlined text-sm ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      <p className="text-[9px] font-black uppercase tracking-widest text-on-surface opacity-50">{label}</p>
    </div>
    <p className="font-black text-xl text-on-surface">{value}</p>
    {sub && <p className="text-[10px] text-on-surface opacity-50 font-bold">{sub}</p>}
  </div>
);

const CSVUpload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    setError(null);
    setResult(null);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are accepted.');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File exceeds the 10 MB size limit.');
      return;
    }
    setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const form = new FormData();
    form.append('file', file);

    try {
      const res = await api.post('/predictions/upload-csv', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      setResult(res.data);
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(detail || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-8 overflow-y-auto max-h-[80vh] pr-2 custom-scrollbar">
      {/* Header */}
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight">
          Bulk Traffic Prediction
        </h3>
        <p className="text-sm text-on-surface opacity-70 font-medium leading-relaxed max-w-2xl">
          Upload a CSV file with detailed parameters to predict metropolitan congestion at scale.
        </p>
      </div>

      {/* CSV Format Guide */}
      <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Required & Optional Columns</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
          <div className="space-y-1">
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">📅 date (Required)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">2026-05-20, 15/06/2026</p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">🕐 time (Required)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">9 AM, 6:30 PM, 14:00</p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">🏙️ city (Required)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">Delhi, Mumbai, Bangalore...</p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">☁️ weather (Optional)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">clear, rainy, foggy, stormy</p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">🎊 is_holiday (Optional)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">yes, no</p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">📢 is_event (Optional)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">yes, no</p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-[2rem] border-2 border-dashed transition-all p-10 flex flex-col items-center justify-center gap-3 text-center
          ${isDragging
            ? 'border-primary bg-primary/10'
            : file
            ? 'border-green-500/50 bg-green-500/5'
            : 'border-on-surface/15 bg-on-surface/5 hover:bg-on-surface/10 hover:border-on-surface/30'
          }`}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
        <span className="material-symbols-outlined text-4xl text-on-surface opacity-50">
          {file ? 'task_alt' : 'upload_file'}
        </span>
        {file ? (
          <>
            <p className="text-on-surface font-black text-sm">{file.name}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface opacity-50">
              {(file.size / 1024).toFixed(1)} KB · Ready to predict
            </p>
          </>
        ) : (
          <>
            <p className="text-on-surface font-bold text-sm">Drag & drop your CSV here, or click to browse</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface opacity-40">Max 10 MB · CSV only</p>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={handleUpload} disabled={!file || loading}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 disabled:opacity-40 active:scale-95 transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            {loading ? 'hourglass_top' : 'bolt'}
          </span>
          {loading ? 'Analyzing...' : 'Predict Batch'}
        </button>

        {(file || result) && (
          <button onClick={handleReset}
            className="flex items-center gap-2 bg-on-surface/10 text-on-surface px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all hover:bg-on-surface/15"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            Reset
          </button>
        )}

        <button
          onClick={() => downloadBlob(SAMPLE_CSV, 'sample_traffic_full.csv', 'text/csv')}
          className="flex items-center gap-2 bg-on-surface/10 text-on-surface px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all hover:bg-on-surface/15 ml-auto"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Download Sample
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InsightCard
                icon="analytics"
                label="Avg Congestion"
                value={`${result.insights?.average_congestion || 0}%`}
                color="text-primary"
              />
              <InsightCard
                icon="warning"
                label="Peak Load"
                value={result.insights?.worst_time ? `${result.insights.worst_time.time}` : '—'}
                sub={result.insights?.worst_time ? `${result.insights.worst_time.date_label} · ${result.insights.worst_time.city}` : ''}
                color="text-red-400"
              />
              <InsightCard
                icon="thumb_up"
                label="Clearance"
                value={result.insights?.best_time ? `${result.insights.best_time.time}` : '—'}
                sub={result.insights?.best_time ? `${result.insights.best_time.date_label} · ${result.insights.best_time.city}` : ''}
                color="text-green-400"
              />
              <InsightCard
                icon="traffic"
                label="Critical Nodes"
                value={result.insights?.high_traffic_count || 0}
                sub={`Impacted Slots`}
                color="text-orange-400"
              />
            </div>

            {result.predictions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface opacity-70">
                    Neural Flow Analysis Output
                  </h4>
                  <button
                    onClick={() => downloadBlob(resultsToCsv(result.predictions), 'batch_predictions_report.csv', 'text/csv')}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-base">file_download</span>
                    Export Full Report
                  </button>
                </div>
                <div className="overflow-x-auto rounded-[2rem] border border-on-surface/10 bg-on-surface/[0.02]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-on-surface/10 text-[9px] font-black uppercase tracking-widest text-on-surface opacity-40">
                        <th className="px-6 py-4">Date/Time</th>
                        <th className="px-6 py-4">City</th>
                        <th className="px-6 py-4">Factors</th>
                        <th className="px-6 py-4">Congestion</th>
                        <th className="px-6 py-4">Advisory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-on-surface/5">
                      {result.predictions.map((p, i) => (
                        <tr key={i} className="group hover:bg-on-surface/[0.03] transition-colors">
                          <td className="px-6 py-5">
                            <p className="text-xs font-black text-on-surface uppercase tracking-tight">{p.time}</p>
                            <p className="text-[9px] font-medium text-on-surface opacity-40 uppercase">{p.date_label}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">{p.city}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-0.5 bg-on-surface/5 rounded text-[8px] font-black uppercase tracking-tighter opacity-60 border border-on-surface/5">
                                {p.weather}
                              </span>
                              {p.is_holiday && <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded text-[8px] font-black uppercase tracking-tighter border border-secondary/20">Holiday</span>}
                              {p.is_event && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[8px] font-black uppercase tracking-tighter border border-primary/20">Event</span>}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <StatusBadge status={p.status} congestion={p.congestion} />
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-[10px] font-medium text-on-surface opacity-60 leading-relaxed max-w-[200px] italic">"{p.advice}"</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CSVUpload;
