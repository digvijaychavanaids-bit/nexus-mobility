const AdminHero = () => {
  return (
    <div className="flex flex-col gap-1 font-body">
      <div className="flex items-center gap-2 text-primary font-bold text-[10px] tracking-widest uppercase mb-1">
        <span className="material-symbols-outlined text-xs leading-none" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
        System Governance
      </div>
      <h2 className="text-3xl font-extrabold font-headline tracking-tighter text-white antialiased uppercase">Administrative Interface</h2>
      <p className="text-on-surface-variant text-sm max-w-2xl font-medium leading-relaxed">
        Manage global access levels, verify telemetry data integrity, and monitor infrastructure health from the central node.
      </p>
    </div>
  );
};

export default AdminHero;
