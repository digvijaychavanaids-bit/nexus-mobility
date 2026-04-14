import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const SAMPLE_CSV = `hour_of_day,pollution_aqi,weather_condition,city
8,45.5,0,Delhi
9,48.2,0,Delhi
10,52.1,1,Delhi
17,78.5,0,Delhi
18,82.3,0,Mumbai
19,80.1,0,Mumbai
14,35.6,2,Bangalore
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
  const header = 'row,city,hour_of_day,pollution_aqi,weather_condition,predicted_congestion,confidence,suggestion';
  const rows = predictions.map((p) =>
    [
      p.row,
      p.input.city,
      p.input.hour_of_day,
      p.input.pollution_aqi,
      p.input.weather_condition,
      p.predicted_congestion,
      p.confidence,
      `"${p.suggestion}"`,
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

const StatusBadge = ({ value }) => {
  const color =
    value >= 70
      ? 'bg-red-500/20 text-red-400'
      : value >= 40
      ? 'bg-yellow-500/20 text-yellow-400'
      : 'bg-green-500/20 text-green-400';
  const label = value >= 70 ? 'High' : value >= 40 ? 'Moderate' : 'Low';
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${color}`}>
      {label} ({value?.toFixed(1)}%)
    </span>
  );
};

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
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-2xl font-black text-on-surface uppercase tracking-tight">Bulk CSV Prediction</h3>
        <p className="text-[10px] text-on-surface font-black uppercase tracking-[0.2em] opacity-60">
          Upload a CSV file to get batch traffic congestion predictions
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative cursor-pointer rounded-[2rem] border-2 border-dashed transition-all p-12 flex flex-col items-center justify-center gap-4 text-center
          ${isDragging
            ? 'border-primary bg-primary/10'
            : file
            ? 'border-green-500/50 bg-green-500/5'
            : 'border-on-surface/15 bg-on-surface/5 hover:bg-on-surface/10 hover:border-on-surface/30'
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <span className="material-symbols-outlined text-5xl text-on-surface opacity-50">
          {file ? 'task_alt' : 'upload_file'}
        </span>
        {file ? (
          <>
            <p className="text-on-surface font-black text-sm">{file.name}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface opacity-50">
              {(file.size / 1024).toFixed(1)} KB · Ready to upload
            </p>
          </>
        ) : (
          <>
            <p className="text-on-surface font-black text-sm">Drag &amp; drop your CSV here, or click to browse</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface opacity-40">Max 10 MB · CSV only</p>
          </>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-4"
          >
            <span className="material-symbols-outlined text-red-400 text-xl mt-0.5">error</span>
            <div>
              <p className="text-red-400 font-black text-xs uppercase tracking-widest">Error</p>
              <p className="text-red-300 text-sm mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 disabled:opacity-40 active:scale-95 transition-all hover:brightness-110"
        >
          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
            {loading ? 'hourglass_top' : 'cloud_upload'}
          </span>
          {loading ? 'Processing...' : 'Run Predictions'}
        </button>

        {(file || result) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-on-surface/10 text-on-surface px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all hover:bg-on-surface/15"
          >
            <span className="material-symbols-outlined text-base">restart_alt</span>
            Reset
          </button>
        )}

        <button
          onClick={() => downloadBlob(SAMPLE_CSV, 'sample_traffic.csv', 'text/csv')}
          className="flex items-center gap-2 bg-on-surface/10 text-on-surface px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] active:scale-95 transition-all hover:bg-on-surface/15 ml-auto"
        >
          <span className="material-symbols-outlined text-base">download</span>
          Sample CSV
        </button>
      </div>

      {/* CSV format hint */}
      <div className="bg-on-surface/5 rounded-2xl p-5 text-[10px] font-black uppercase tracking-widest text-on-surface opacity-60 space-y-1">
        <p>Required columns: <span className="text-primary opacity-100">hour_of_day</span> (0–23) · <span className="text-primary opacity-100">pollution_aqi</span> (0–500) · <span className="text-primary opacity-100">weather_condition</span> (0=Clear, 1=Rainy, 2=Overcast) · <span className="text-primary opacity-100">city</span></p>
        <p>Valid cities: Delhi · Mumbai · Bangalore · Chennai · Hyderabad</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-10">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="material-symbols-outlined text-4xl text-primary"
          >
            autorenew
          </motion.span>
          <p className="text-on-surface font-black text-sm uppercase tracking-widest opacity-60">
            Running bulk predictions…
          </p>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total Rows', value: result.total_rows, icon: 'table_rows', color: 'text-primary' },
                { label: 'Processed', value: result.processed, icon: 'check_circle', color: 'text-green-400' },
                { label: 'Failed', value: result.failed, icon: 'cancel', color: 'text-red-400' },
                { label: 'File', value: result.filename, icon: 'description', color: 'text-on-surface opacity-60', small: true },
              ].map((c) => (
                <div key={c.label} className="bg-on-surface/5 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-sm ${c.color}`}>{c.icon}</span>
                    <p className="text-[9px] font-black uppercase tracking-widest text-on-surface opacity-50">{c.label}</p>
                  </div>
                  <p className={`font-black ${c.small ? 'text-xs truncate' : 'text-2xl'} text-on-surface`}>{c.value}</p>
                </div>
              ))}
            </div>

            {/* Predictions table */}
            {result.predictions.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface opacity-70">
                  Prediction Results ({result.predictions.length}{result.predictions_truncated ? ` of ${result.processed}` : ''})
                  </h4>
                  <button
                    onClick={() => downloadBlob(resultsToCsv(result.predictions), 'predictions_results.csv', 'text/csv')}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-80 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-base">download</span>
                    Download CSV
                  </button>
                </div>
                <div className="overflow-x-auto rounded-2xl border border-on-surface/10">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-on-surface/10 text-on-surface text-[10px] uppercase tracking-widest">
                        {['Row', 'City', 'Hour', 'AQI', 'Weather', 'Congestion', 'Confidence', 'Suggestion'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-black opacity-60 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.predictions.map((p, i) => (
                        <tr
                          key={i}
                          className="border-t border-on-surface/5 hover:bg-on-surface/5 transition-colors"
                        >
                          <td className="px-4 py-3 font-black text-on-surface opacity-50">{p.row}</td>
                          <td className="px-4 py-3 font-black text-on-surface">{p.input.city}</td>
                          <td className="px-4 py-3 font-black text-on-surface">{p.input.hour_of_day}:00</td>
                          <td className="px-4 py-3 font-black text-on-surface">{p.input.pollution_aqi}</td>
                          <td className="px-4 py-3 font-black text-on-surface">
                            {p.input.weather_condition === 0 ? 'Clear' : p.input.weather_condition === 1 ? 'Rainy' : 'Overcast'}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge value={p.predicted_congestion} />
                          </td>
                          <td className="px-4 py-3 font-black text-on-surface">
                            {(p.confidence * 100).toFixed(0)}%
                          </td>
                          <td className="px-4 py-3 text-on-surface opacity-60 max-w-[220px] truncate" title={p.suggestion}>
                            {p.suggestion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Error table */}
            {result.errors.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-red-400">
                  Validation Errors ({result.errors.length} rows)
                </h4>
                <div className="overflow-x-auto rounded-2xl border border-red-500/20">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-red-500/10 text-on-surface text-[10px] uppercase tracking-widest">
                        {['Row', 'City', 'Hour', 'AQI', 'Weather', 'Errors'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left font-black opacity-60 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((e, i) => (
                        <tr key={i} className="border-t border-red-500/10">
                          <td className="px-4 py-3 font-black text-red-400">{e.row}</td>
                          <td className="px-4 py-3 text-on-surface opacity-60">{e.input?.city ?? '—'}</td>
                          <td className="px-4 py-3 text-on-surface opacity-60">{e.input?.hour_of_day ?? '—'}</td>
                          <td className="px-4 py-3 text-on-surface opacity-60">{e.input?.pollution_aqi ?? '—'}</td>
                          <td className="px-4 py-3 text-on-surface opacity-60">{e.input?.weather_condition ?? '—'}</td>
                          <td className="px-4 py-3 text-red-400 text-[10px]">{e.errors.join(' · ')}</td>
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
