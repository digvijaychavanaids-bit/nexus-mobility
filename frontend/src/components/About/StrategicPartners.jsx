const StrategicPartners = () => {
  const partners = [
    { name: 'LONDON', icon: 'location_city', color: 'text-primary' },
    { name: 'SINGAPORE', icon: 'apartment', color: 'text-tertiary' },
    { name: 'BERLIN', icon: 'domain', color: 'text-secondary' },
    { name: 'OSLO', icon: 'potted_plant', color: 'text-primary' },
    { name: 'TOKYO', icon: 'nightlight', color: 'text-error' },
  ];

  return (
    <section className="py-20 border-t border-white/5 mb-20 font-body">
      <p className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant mb-16 opacity-60">Strategic City Partners</p>
      
      <div className="flex flex-wrap justify-center items-center gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
        {partners.map((partner, i) => (
          <div key={i} className="flex items-center gap-4 group/partner cursor-pointer">
            <span className={`material-symbols-outlined text-3xl ${partner.color} group-hover/partner:scale-125 transition-transform`}>
              {partner.icon}
            </span>
            <span className="font-headline font-black text-2xl tracking-tighter text-white antialiased group-hover/partner:text-primary transition-colors">
              {partner.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StrategicPartners;
