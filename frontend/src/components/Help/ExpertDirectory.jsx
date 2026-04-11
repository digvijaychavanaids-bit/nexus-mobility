const ExpertDirectory = () => {
  const members = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA7C2MN11GrSJ6mia7ChPmhcnTy4wlKzvYm4Cbmc_up8v17qV445lz4whWNSnnguhhgvCHCwxEWR2epo8i2_pGSxAmFiGMgv_3Qq6t2KupuFFA0kGKE61hwM7Kr9pw-Wllm2PfEs-5Cxth8zYfUGdr6f_jXTM23rMFNL9p2WKIYRX6359oTC2Zsn07h5KA7Kg3GoJR1eor4Ineo4snauG-qrRmwBPODUTPzKHkXfOdq5WJADrIhg9kfWp9f037p0zRmeiol13ogVis',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBvY59iqWLH16mu_Ssv-FiBVB1UbxUYsMFxdNODcfRrM-3qVRCBM1J04o_5CLbSN8_k14uqN44uWrvmOyAK_n2gmunkwZo-omTyJmaFAa8ZZa0nElgF03CzwBqsEE8VN9y8PaLMmMfK44-rW-qpsKdFDA9Kyff7QqCj5qzI9RUDa7lvu9Y9q9ye8cFXucFwgCedmD8a3wkwkAItPonI7QLNnpo65YArG6IRaULmXmIou7T6_AvrlAjOUzcfKiTmYg9fX0hSCWg1yi0',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBqhCs9RFKL4D9jEtm8QZ_VAfuKaCuNXVO4KpQm4wFEqeb_V-VSF9McqHGUCtlwo680n9mXKj4dotcsebhmq9KQTecrL7z8ex2JlyQ182MVUeJ2c9hyhpj9vvfK_0qnhTX0Be9DWPkviXKg7AvKcFXBeH5FonTpRh2x5_oJU6ryfpsjDpUgYWCOVLIurZ61nt0uGf--xRGn8SK4fLaG7FOrH0AVifvq8MU4MX8JVdB1YxA9Ye6YjgYtWYrBQApTL-vUi8iQWzkjkL8'
  ];

  return (
    <div className="bg-surface-container-low rounded-xl overflow-hidden p-8 space-y-6 border border-white/5 shadow-2xl relative group">
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-tertiary/10 rounded-full blur-2xl group-hover:bg-tertiary/20 transition-all opacity-0 group-hover:opacity-100"></div>
      
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
        <h5 className="text-[10px] font-black text-white uppercase tracking-[0.2em] antialiased">Expert Directory</h5>
      </div>
      <p className="text-[10px] text-on-surface-variant leading-relaxed font-bold uppercase tracking-widest opacity-60">Connect with 500+ certified traffic engineers using Nexus in major metropolitan areas.</p>
      
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3">
          {members.map((img, i) => (
            <img 
              key={i}
              className="w-10 h-10 rounded-full border-2 border-surface-container-low shadow-xl hover:scale-110 active:scale-95 transition-all cursor-pointer ring-1 ring-white/10" 
              src={img} 
              alt={`Expert ${i}`}
            />
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-surface-container-low bg-slate-800 flex items-center justify-center text-[10px] font-black text-primary shadow-xl ring-1 ring-white/10 hover:bg-slate-700 transition-colors cursor-pointer">
            +482
          </div>
        </div>
        <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse ml-2 cursor-pointer hover:underline">Active Now</span>
      </div>
    </div>
  );
};

export default ExpertDirectory;
