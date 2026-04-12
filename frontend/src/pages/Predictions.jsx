import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import PredictionHero from '../components/Predictions/PredictionHero';
import ScenarioParameters from '../components/Predictions/ScenarioParameters';
import PredictionResultCard from '../components/Predictions/PredictionResultCard';
import FlowForecast from '../components/Predictions/FlowForecast';
import ImpactDrivers from '../components/Predictions/ImpactDrivers';
import { LoadingSpinner, ErrorAlert } from '../components/UI';
import { getCurrentRole } from '../services/session';

const Predictions = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const currentRole = getCurrentRole();

  const handlePredict = async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await api.post('/predictions/predict', {
        hour_of_day: parseInt(params.hour.split(':')[0]) || 12,
        pollution_aqi: parseFloat(params.aqi) || 50,
        weather_condition: params.isRaining ? 1 : 0,
        city: params.city || "Delhi"
      });

      setPredictionResult({
        congestion: res.data.predicted_congestion,
        status: res.data.predicted_congestion > 70 ? 'High Congestion Warning' : 
                res.data.predicted_congestion > 40 ? 'Moderate Transit Flow' : 'Optimal Neural Flow',
        delay: Math.round(res.data.predicted_congestion / 5),
        confidence: res.data.confidence || 0.85,
        suggestion: res.data.suggestion,
        city: params.city
      });
    } catch {
      setPredictionResult(null);
      setError("Prediction service is currently unavailable.");
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
            <FlowForecast city={predictionResult?.city} aqi={predictionResult?.aqi} />
            <ImpactDrivers city={predictionResult?.city} congestion={predictionResult?.congestion} />
          </div>
        </div>
      </div>

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






