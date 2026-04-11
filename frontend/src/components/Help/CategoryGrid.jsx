const CategoryGrid = () => {
  const categories = [
    { icon: 'payments', label: 'Billing' },
    { icon: 'cloud_sync', label: 'Storage' },
    { icon: 'key', label: 'IAM Access' },
    { icon: 'monitoring', label: 'Metrics' },
    { icon: 'cell_tower', label: 'Network' },
    { icon: 'history_edu', label: 'Changelog' },
  ];

  return (
    <section className="space-y-8 pt-12 border-t border-white/5 font-body">
      <h3 className="text-xl font-black font-headline text-white px-2 tracking-tighter uppercase antialiased leading-none">Browse by Category</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {categories.map((cat, i) => (
          <a 
            key={i} 
            className="p-8 bg-surface-container-low rounded-2xl hover:bg-surface-container-high transition-all ring-1 ring-white/5 hover:ring-primary/20 group flex flex-col items-center gap-4 text-center overflow-hidden relative shadow-2xl active:scale-95"
            href="#"
          >
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all"></div>
            <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-all text-3xl leading-none">
              {cat.icon}
            </span>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{cat.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
