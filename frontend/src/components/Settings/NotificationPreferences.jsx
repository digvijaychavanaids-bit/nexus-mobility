import { useState, useEffect } from 'react';

const NotificationPreferences = () => {
  const [alerts, setAlerts] = useState([
    { id: 'congestion', title: 'Congestion Alerts', desc: 'Notify when traffic flow falls below 30% capacity.', checked: true },
    { id: 'pollution', title: 'Pollution Insights', desc: 'Real-time alerts for Nitrogen Dioxide spikes.', checked: true },
    { id: 'emergency', title: 'Emergency Rerouting', desc: 'SMS alerts for major road closures.', checked: false, disabled: true },
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('nexus_notifications');
    if (saved) {
      const parsed = JSON.parse(saved);
      setAlerts(prev => prev.map(a => ({ ...a, checked: parsed[a.id] ?? a.checked })));
    }
  }, []);

  const handleToggle = (id) => {
    const updated = alerts.map(a => a.id === id ? { ...a, checked: !a.checked } : a);
    setAlerts(updated);
    const storageObj = updated.reduce((acc, curr) => {
      acc[curr.id] = curr.checked;
      return acc;
    }, {});
    localStorage.setItem('nexus_notifications', JSON.stringify(storageObj));
  };

  return (
    <section className="bg-surface-container-low rounded-xl p-8 space-y-8 border border-on-surface/5 shadow-2xl font-body relative overflow-hidden group">
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
          <span className="material-symbols-outlined text-primary leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>notifications_active</span>
        </div>
        <div>
          <h3 className="text-lg font-black text-on-surface font-headline tracking-tighter uppercase antialiased">Alert Subscriptions</h3>
          <p className="text-on-surface text-[10px] uppercase font-black tracking-widest leading-none">Telemetry Broadcasts</p>
        </div>
      </div>
      
      <div className="space-y-6 relative z-10">
        {alerts.map((alert, i) => (
          <div key={i} className={`flex items-start justify-between group/item transition-opacity ${alert.disabled ? 'opacity-40' : 'opacity-100 hover:opacity-100'}`}>
            <div className="space-y-1">
              <p className="text-sm font-black text-on-surface uppercase tracking-tight">{alert.title}</p>
              <p className="text-[10px] text-on-surface uppercase font-bold tracking-widest leading-relaxed opacity-60 max-w-[240px]">{alert.desc}</p>
            </div>
            <div className="relative">
              <input 
                checked={alert.checked} 
                disabled={alert.disabled}
                onChange={() => handleToggle(alert.id)}
                className="w-5 h-5 rounded border-on-surface/10 bg-surface-container-highest text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer appearance-none checked:bg-primary transition-all ring-1 ring-white/5"
                type="checkbox"
              />
              {alert.checked && <span className="material-symbols-outlined absolute inset-0 text-[16px] text-on-primary pointer-events-none flex items-center justify-center font-black">check</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NotificationPreferences;






