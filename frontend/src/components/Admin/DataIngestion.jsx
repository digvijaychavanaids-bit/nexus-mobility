import { useRef, useState } from 'react';

import api from '../../services/api';

const DataIngestion = () => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const updateSelectedFile = (fileList) => {
    const file = fileList?.[0] ?? null;
    setSelectedFile(file);
    setMessage(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Select a CSV file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await api.post('/admin/upload-dataset', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(`Uploaded ${response.data.filename} successfully.`);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (uploadError) {
      setError(uploadError.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-surface-container-high to-surface-container-low rounded-xl p-8 shadow-2xl border border-white/[0.03] font-body relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>

      <div className="flex flex-col items-center text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20 shadow-lg group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-4xl text-primary leading-none">cloud_upload</span>
        </div>
        <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tighter antialiased">Ingest Data</h3>
        <p className="text-on-surface-variant text-xs mb-8 px-4 font-bold uppercase tracking-widest leading-relaxed opacity-60">
          Upload a validated CSV dataset for backend review and archival.
        </p>

        <div
          className={`w-full border-2 border-dashed rounded-xl p-8 mb-4 transition-all cursor-pointer flex flex-col items-center justify-center ${
            dragActive ? 'border-primary bg-primary/5' : 'border-slate-700 bg-slate-900/50 hover:border-primary/50'
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            updateSelectedFile(e.dataTransfer.files);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => updateSelectedFile(e.target.files)}
          />
          <span className="material-symbols-outlined text-slate-500 group-hover:text-primary transition-colors text-3xl mb-2 leading-none">
            upload_file
          </span>
          <p className="text-[10px] text-slate-500 group-hover:text-slate-300 font-black uppercase tracking-widest">
            Drag a CSV here or <span className="text-primary font-black">browse</span>
          </p>
          <p className="text-[8px] text-slate-600 mt-2 font-bold uppercase tracking-widest">
            Accepted format: CSV
          </p>
        </div>

        {selectedFile && (
          <p className="mb-4 text-[10px] font-black uppercase tracking-widest text-primary">
            Selected: {selectedFile.name}
          </p>
        )}

        {message && (
          <p className="mb-4 rounded-lg border border-tertiary/20 bg-tertiary/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-tertiary">
            {message}
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-error">
            {error}
          </p>
        )}

        <button
          className="w-full py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-black text-xs tracking-widest active:scale-95 transition-all shadow-xl shadow-primary/20 hover:brightness-110 uppercase leading-none disabled:opacity-60"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? 'Uploading dataset...' : 'Upload dataset'}
        </button>
      </div>
    </div>
  );
};

export default DataIngestion;
