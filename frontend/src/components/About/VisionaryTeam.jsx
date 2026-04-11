const TeamMember = ({ role, name, image, color }) => {
  return (
    <div className="space-y-4 group">
      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-surface-container-high relative border border-white/5 shadow-2xl">
        <img 
          className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" 
          src={image} 
          alt={name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
      </div>
      <div>
        <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${color}`}>{role}</p>
        <h4 className="text-xl font-black text-white font-headline antialiased group-hover:text-primary transition-colors tracking-tight">{name}</h4>
      </div>
    </div>
  );
};

const VisionaryTeam = () => {
  const members = [
    { 
      role: 'Chief Architect', 
      name: 'Dr. Elena Vance', 
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaqEDIZPxdKwPc9xm0cBhpdC46-KqE7qpg2-1xz7bzZl8wMmgiwU0Y6b2UAwsrQPPHB-34V23rH4VUZnpzX9BG8u0YAWSv2xkWPnD-jchh085ROONu0BLYuDzFZO2p-XlWBVpw30hV9COwtGCoboABOcLkdovkgHkeBeGofoWa7mQmDH0C5X_ymE2wLmQkZiJHOYJt4L7jBBoFs8rHrN7Sy6rawuqvy4n29hlPZEYNTSPYOKk-UH9s6hMi862ckehu4JbRmwotujA', 
      color: 'text-primary' 
    },
    { 
      role: 'Urban Systems Lead', 
      name: 'Marcus Chen', 
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFA6o-xy9TjseNtKvo7IhY6OfSIeO0hCVDj25AWoyAzBHcL9x-NLybeKYIHBJz78s7Kx9s7L5dxuKWQlhLJwSqRKrCdIj0fVd3bV2Kf353Uw5HqKMQhyVTioIn90ISDVemK23rA4N3VQwBHfQ-QNnSP925LxMBKjxFQ26A2Kqz22pbvNkwgkiVOZ70iJOk56YKInALuR2elcOA6RGYGDC2M8LVn9KNxAErtwUmN9TWYD6gS9lkJhUJ4sVq2C6U5mr-vEbHHg-h6MY', 
      color: 'text-tertiary' 
    },
    { 
      role: 'Neural Logic VP', 
      name: 'Sarah Jenkins', 
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKFPAuuzYUpyOFm811k7VKHnrc5xvDjnE4OASy1kq16vZj7wdG15d_svDueYqV0CJkx6U_MBRODsNSbFBhdhOop5G1ZcSMiH4SsXte8U2ULRAHUOHx6PQBforM8gBUS7We0i5ISuxEp7UlOsD0bthZhIkqxAUhFBs-VHHo5dLluevt5ta_GQsfPtA0LaBCU1cZMKmAK9FBX90csMrNbi014VOQVA_iCy-JiV0R__2O5SekkKrO6eXvEWtKu8u547qezMrvQ3sCh7Y', 
      color: 'text-primary' 
    },
    { 
      role: 'Infrastructure Ops', 
      name: 'David Rossi', 
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-zAjnvV_Jho44YqoorEz-YtxU87bXeKnBgBKjuAIBds_9FjgQj0uH8MXXOj91TtUvFEBLyUj7NUtY4g7ELLu12exEinbnLMOgf-rwTAYqSsToIVMTdCjabUm0a9iPFBnzbbWl2S9-mXw9zt8Bjwuy39wnL4nt_xl6nm5ayNYROzaOxyIIEXmqvpxoONGFNY5drHKBU3XMHyycIFROU-DS3dqBTRz0d3tF6JIfhd2pioZhrUDJGSfzpdXroUAtbWcKfVbyodU7YsQ', 
      color: 'text-secondary' 
    },
  ];

  return (
    <section className="space-y-16 pb-32 font-body">
      <div className="text-center space-y-4">
        <h3 className="text-4xl font-headline font-black tracking-tighter text-white uppercase antialiased">The Visionaries</h3>
        <p className="text-on-surface-variant max-w-xl mx-auto text-sm font-medium opacity-60">A multidisciplinary team of data scientists, urban architects, and traffic engineers defining city intelligence.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        {members.map((member, i) => (
          <TeamMember key={i} {...member} />
        ))}
      </div>
    </section>
  );
};

export default VisionaryTeam;
