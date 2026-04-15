import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import PredictionHero from '../components/Predictions/PredictionHero';
import ScenarioParameters from '../components/Predictions/ScenarioParameters';
import PredictionResultCard from '../components/Predictions/PredictionResultCard';
import FlowForecast from '../components/Predictions/FlowForecast';
import ImpactDrivers from '../components/Predictions/ImpactDrivers';
import CSVUpload from '../components/Predictions/CSVUpload';
import { LoadingSpinner, ErrorAlert } from '../components/UI';
import { getCurrentRole } from '../services/session';

const Predictions = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('single');
  const currentRole = getCurrentRole();

  const handlePredict = async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post('/predictions/predict', {
        date: params.date,
        time: params.time,
        city: params.city || "Delhi",
        weather: params.weather || "clear",
        is_holiday: params.is_holiday || false,
        is_event: params.is_event || false
      });

      setPredictionResult({
        congestion: res.data.congestion,
        status: `${res.data.status} Congestion`,
        label: res.data.date_label,
        day: res.data.day,
        time: res.data.time,
        city: res.data.city,
        weather: res.data.weather,
        is_holiday: res.data.is_holiday,
        is_event: res.data.is_event,
        emoji: res.data.emoji,
        advice: res.data.advice,
        is_peak: res.data.peak_hour,
        delay: Math.round(res.data.congestion / 4) // Dynamic delay estimate
      });
    } catch (err) {
      setPredictionResult(null);
      setError(err.response?.data?.detail || "Prediction service is currently unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 space-y-12 max-w-[1600px] mx-auto pb-20 font-body"
    >
      <PredictionHero />

      {/* Tab toggle */}
      <div className="flex gap-2 bg-on-surface/5 rounded-full p-1.5 w-fit ring-1 ring-on-surface/5 shadow-inner">
        {[
          { id: 'single', label: 'Single Prediction', icon: 'query_stats' },
          { id: 'csv', label: 'Bulk CSV Upload', icon: 'upload_file' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                : 'text-on-surface hover:bg-on-surface/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              {tab.icon}
            </span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'single' ? (
        <>
          {error && <ErrorAlert message={error} />}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <ScenarioParameters onPredict={handlePredict} isLoading={loading} />

            <div className="lg:col-span-8 space-y-8">
              {loading ? (
                <LoadingSpinner label="Calibrating Neural Predictions..." />
              ) : predictionResult ? (
                <PredictionResultCard result={predictionResult} />
              ) : (
                <div className="bg-on-surface/5 backdrop-blur-xl rounded-[2rem] p-12 text-center border border-dashed border-on-surface/10">
                  <span className="material-symbols-outlined text-4xl text-on-surface mb-4 opacity-30">query_stats</span>
                  <p className="text-on-surface font-black uppercase tracking-widest text-[10px] opacity-40">Awaiting Neural Sequence Parameters</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FlowForecast city={predictionResult?.city} />
                <ImpactDrivers city={predictionResult?.city} congestion={predictionResult?.congestion} />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 border border-on-surface/5 shadow-2xl">
          <CSVUpload />
        </div>
      )}

      {/* Role View Toggle */}
      <div className="flex justify-end pt-8">
        <div className="bg-surface-container rounded-full p-1.5 flex gap-1 ring-1 ring-on-surface/5 shadow-inner">
          <button className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-surface-container-highest text-on-surface shadow-lg transition-all active:scale-95">
            {currentRole} Access
          </button>
          <button className="px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-on-surface transition-all cursor-default">
            Backend verified
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Predictions;
