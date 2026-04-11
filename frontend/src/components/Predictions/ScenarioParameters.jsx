import { useState } from 'react';


const ScenarioParameters = ({ onPredict, isLoading }) => {
  const [aqi, setAqi] = useState(142);
  const [hour, setHour] = useState("08:30");
  const [isRaining, setIsRaining] = useState(false);
  const [city, setCity] = useState("Delhi");

  const cities = ["Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad"];

  const handleSubmit = (e) => {
    e.preventDefault();
    onPredict({
      city,
      hour,
      aqi,
      isRaining,
      temp: 25 // Default for now
    });
  };

  return (
    <section className="lg:col-span-4 bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 space-y-10 font-body border border-white/5 shadow-2xl">
      <div className="space-y-2">
        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Scenario Configuration</h3>
        <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-60">Neural Simulation Parameters</p>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* City Selector */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Metropolitan Sector</label>
          <div className="grid grid-cols-2 gap-2">
            {cities.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCity(c)}
                className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                  city === c 
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]' 
                    : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Input: Time */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projection Timestamp</label>
          <div className="relative group">
            <input 
              className="w-full bg-white/5 text-white border border-white/5 rounded-2xl py-4 px-5 focus:bg-white/10 focus:border-primary/50 text-sm font-black tracking-widest transition-all outline-none" 
              type="time" 
              value={hour}
              onChange={(e) => setHour(e.target.value)}
            />
            <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-primary transition-colors">schedule</span>
          </div>
        </div>

        {/* Input: AQI */}
        <div className="space-y-6">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Atmospheric Toxicity (AQI)</label>
            <span className="text-tertiary font-black text-xs uppercase tracking-widest">{aqi} PM2.5</span>
          </div>
          <input 
            className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-tertiary" 
            type="range" 
            min="0" 
            max="500" 
            value={aqi}
            onChange={(e) => setAqi(parseInt(e.target.value))}
          />
        </div>

        {/* Input: Rain Toggle */}
        <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-white">Precipitation Factor</p>
            <p className="text-[10px] text-on-surface-variant font-black uppercase opacity-40">Rainy conditions</p>
          </div>
          <button 
            type="button"
            onClick={() => setIsRaining(!isRaining)}
            className={`w-14 h-7 rounded-full transition-all relative ${isRaining ? 'bg-primary shadow-[0_0_15px_rgba(148,204,255,0.4)]' : 'bg-slate-800'}`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all shadow-md ${isRaining ? 'left-8' : 'left-1'}`}></div>
          </button>
        </div>

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 active:scale-95 transition-all hover:brightness-110 disabled:opacity-50 mt-4"
        >
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>neurology</span>
          {isLoading ? 'CALIBRATING...' : 'EXECUTE PREDICTION'}
        </button>
      </form>
    </section>
  );
};

export default ScenarioParameters;
