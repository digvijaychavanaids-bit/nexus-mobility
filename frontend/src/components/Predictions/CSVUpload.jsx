import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { getCurrentRole } from '../../services/session';

const SAMPLE_CSV = `date,time,city,location,weather,is_holiday,is_event,vehicle_count,pm2_5_ugm3,pm10_ugm3,co_ugm3,no2_ugm3
2026-05-20,9 AM,Delhi,Connaught Place,clear,no,no,4450,88,145,990,43
2026-05-20,6 PM,Delhi,Lajpat Nagar,rainy,no,yes,4680,96,162,1120,49
2026-05-21,8 AM,Mumbai,Andheri,foggy,no,no,5220,52,81,520,27
2026-05-25,5 PM,Bangalore,Whitefield,stormy,yes,no,4950,43,67,470,23
2026-06-15,10 AM,Chennai,T. Nagar,clear,no,no,3810,38,58,430,19
2026-07-03,8:30 AM,Hyderabad,HITEC City,clear,no,yes,5040,41,64,455,21
2026-07-03,7 PM,Pune,Wagholi,rainy,no,no,3990,47,73,490,24
2026-07-04,6:30 PM,Pune,Hadaparsar,clear,no,yes,4380,54,82,525,26
2026-08-15,9 AM,Delhi,India Gate,clear,yes,yes,4210,91,152,1010,44
2026-09-01,7:45 AM,Pune,Hadapsar,foggy,no,no,4520,58,88,560,29
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
  const header = 'date,day,time,city,location,weather,is_holiday,is_event,vehicle_count,congestion_percent,pollution_index,pollution_status,predicted_pm2_5_ugm3,predicted_pm10_ugm3,predicted_co_ugm3,predicted_no2_ugm3,traffic_status,advice';
  const rows = predictions.map((p) =>
    [
      p.date,
      p.day,
      p.time,
      p.city,
      p.location,
      p.weather,
      p.is_holiday ? 'yes' : 'no',
      p.is_event ? 'yes' : 'no',
      p.vehicle_count,
      p.congestion,
      p.pollution_index ?? '',
      p.pollution_status ?? '',
      p.predicted_pm2_5_ugm3 ?? '',
      p.predicted_pm10_ugm3 ?? '',
      p.predicted_co_ugm3 ?? '',
      p.predicted_no2_ugm3 ?? '',
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
  const role = getCurrentRole();
  const isUserPanel = role === 'User';
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [publishedItems, setPublishedItems] = useState([]);
  const [publishAck, setPublishAck] = useState(null);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  const activeResult = result || { predictions: [], insights: {} };

  useEffect(() => {
    const fetchPublished = async () => {
      if (!isUserPanel) return;
      try {
        const res = await api.get('/predictions/user-panel-results?limit=5');
        const items = Array.isArray(res.data?.items) ? res.data.items : [];
        setPublishedItems(items);
        if (!result && items.length > 0) {
          setResult({
            filename: items[0].filename,
            total_rows: items[0].total_rows,
            processed: items[0].processed,
            failed: items[0].failed,
            predictions: items[0].predictions || [],
            predictions_truncated: items[0].predictions_truncated,
            errors: items[0].errors || [],
            errors_truncated: items[0].errors_truncated,
            insights: items[0].insights || {},
            timestamp: items[0].timestamp || items[0].created_at,
          });
        }
      } catch {
        // Do not block upload UI on fetch failure.
      }
    };
    fetchPublished();
  }, [isUserPanel, result]);

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
      if (isUserPanel) {
        setResult(res.data);
      } else {
        setPublishAck(res.data);
      }
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
    setPublishAck(null);
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
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">📍 location (Required)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">Connaught Place, Wagholi, Hadapsar...</p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">☁️ weather (Optional)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">clear, rainy, foggy, stormy</p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">🚗 vehicle_count (Optional)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">Observed count to calibrate congestion</p>
          </div>
          <div className="space-y-1">
            <p className="font-black text-on-surface text-xs uppercase tracking-tighter">🌫️ pollution fields (Optional)</p>
            <p className="text-on-surface opacity-60 text-[10px] font-medium leading-relaxed">pm2_5_ugm3, pm10_ugm3, co_ugm3, no2_ugm3</p>
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
        {(result || publishAck) && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

            {isUserPanel && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InsightCard
                  icon="analytics"
                  label="Avg Congestion"
                  value={`${activeResult.insights?.average_congestion || 0}%`}
                  color="text-primary"
                />
                <InsightCard
                  icon="warning"
                  label="Peak Load"
                  value={activeResult.insights?.worst_time ? `${activeResult.insights.worst_time.time}` : '—'}
                  sub={activeResult.insights?.worst_time ? `${activeResult.insights.worst_time.date_label} · ${activeResult.insights.worst_time.city}` : ''}
                  color="text-red-400"
                />
                <InsightCard
                  icon="thumb_up"
                  label="Clearance"
                  value={activeResult.insights?.best_time ? `${activeResult.insights.best_time.time}` : '—'}
                  sub={activeResult.insights?.best_time ? `${activeResult.insights.best_time.date_label} · ${activeResult.insights.best_time.city}` : ''}
                  color="text-green-400"
                />
                <InsightCard
                  icon="traffic"
                  label="Critical Nodes"
                  value={activeResult.insights?.high_traffic_count || 0}
                  sub={`Impacted Slots`}
                  color="text-orange-400"
                />
              </div>
            )}

            {isUserPanel && publishedItems.length > 0 && (
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface opacity-50">
                Published batches available: {publishedItems.length}
              </p>
            )}

            {Array.isArray(activeResult.insights?.city_wise) && activeResult.insights.city_wise.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface opacity-70">
                  City-wise Summary
                </h4>
                <div className="overflow-x-auto rounded-[2rem] border border-on-surface/10 bg-on-surface/[0.02]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-on-surface/10 text-[9px] font-black uppercase tracking-widest text-on-surface opacity-40">
                        <th className="px-6 py-4">City</th>
                        <th className="px-6 py-4">Rows</th>
                        <th className="px-6 py-4">Avg</th>
                        <th className="px-6 py-4">Max</th>
                        <th className="px-6 py-4">Top Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-on-surface/5">
                      {activeResult.insights.city_wise.map((row) => (
                        <tr key={row.city} className="group hover:bg-on-surface/[0.03] transition-colors">
                          <td className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface">{row.city}</td>
                          <td className="px-6 py-4 text-[10px] font-black text-on-surface">{row.rows}</td>
                          <td className="px-6 py-4 text-[10px] font-black text-on-surface">{row.average_congestion}%</td>
                          <td className="px-6 py-4 text-[10px] font-black text-on-surface">{row.max_congestion}%</td>
                          <td className="px-6 py-4 text-[10px] font-black text-on-surface">{row.top_location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {isUserPanel && activeResult.predictions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface opacity-70">
                    Neural Flow Analysis Output
                  </h4>
                  <button
                    onClick={() => downloadBlob(resultsToCsv(activeResult.predictions), 'batch_predictions_report.csv', 'text/csv')}
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
                        <th className="px-6 py-4">Location</th>
                        <th className="px-6 py-4">Factors</th>
                        <th className="px-6 py-4">Congestion</th>
                        <th className="px-6 py-4">Pollution</th>
                        <th className="px-6 py-4">Advisory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-on-surface/5">
                      {activeResult.predictions.map((p, i) => (
                        <tr key={i} className="group hover:bg-on-surface/[0.03] transition-colors">
                          <td className="px-6 py-5">
                            <p className="text-xs font-black text-on-surface uppercase tracking-tight">{p.time}</p>
                            <p className="text-[9px] font-medium text-on-surface opacity-40 uppercase">{p.date_label}</p>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">{p.city}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-[10px] font-black text-on-surface uppercase tracking-widest">{p.location}</span>
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
                            <div className="flex flex-col gap-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-on-surface">{p.pollution_status || '—'}</span>
                              <span className="text-[9px] font-bold text-on-surface opacity-50">AQI {p.pollution_index ?? '—'}</span>
                            </div>
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

            {!isUserPanel && publishAck?.published_to_user_panel && (
              <div className="rounded-[2rem] border border-primary/20 bg-primary/10 p-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                  CSV processed and published to User panel.
                </p>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-on-surface opacity-70">
                  Processed: {publishAck.processed} • Failed: {publishAck.failed} • Result ID: {publishAck.result_id}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CSVUpload;
