import { useState } from 'react';
import { motion } from 'framer-motion';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto font-body"
    >
      <header className="mb-12">
        <h2 className="text-4xl font-extrabold font-headline tracking-tighter text-on-surface mb-2 uppercase antialiased">Technical Support</h2>
        <p className="text-on-surface max-w-2xl text-lg font-medium opacity-80">
          Our engineering team is standing by to resolve system anomalies, API disruptions, or data synchronization issues across the Nexus Mobility network.
        </p>
      </header>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Contact Form Container */}
        <section className="col-span-12 lg:col-span-7 bg-surface-container-low p-8 rounded-xl relative overflow-hidden border border-on-surface/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
          
          {submitted ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-20 flex flex-col items-center text-center space-y-6 relative z-10"
            >
              <div className="w-20 h-20 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary shadow-2xl shadow-tertiary/20 border border-tertiary/20">
                <span className="material-symbols-outlined text-4xl">send_and_archive</span>
              </div>
              <h3 className="text-2xl font-black font-headline text-on-surface uppercase tracking-tighter antialiased">Request Dispatched</h3>
              <p className="text-[10px] text-on-surface uppercase font-black tracking-widest opacity-60 max-w-sm mx-auto leading-relaxed">
                Uplink established. Your technical query has been routed to the Tier-3 engineering queue.
              </p>
              <button 
                onClick={() => setSubmitted(false)}
                className="text-[10px] font-black text-primary hover:text-primary-fixed-dim transition-colors uppercase tracking-widest"
              >
                Open New Ticket
              </button>
            </motion.div>
          ) : (
            <form 
              onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
              className="space-y-6 relative z-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block px-1 opacity-80">Full Name</label>
                  <input 
                    required
                    className="w-full bg-surface-container-highest border border-on-surface/5 rounded-lg p-4 text-on-surface placeholder:text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium" 
                    placeholder="Alex Rivera" 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block px-1 opacity-80">Institutional Email</label>
                  <input 
                    required
                    className="w-full bg-surface-container-highest border border-on-surface/5 rounded-lg p-4 text-on-surface placeholder:text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm font-medium" 
                    placeholder="a.rivera@city.gov" 
                    type="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block px-1 opacity-80">Subject Category</label>
                <select className="w-full bg-surface-container-highest border border-on-surface/5 rounded-lg p-4 text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all appearance-none cursor-pointer text-sm font-medium">
                  <option className="bg-surface-dim">System Performance Degradation</option>
                  <option className="bg-surface-dim">Traffic Sensor Latency</option>
                  <option className="bg-surface-dim">API Authentication Error</option>
                  <option className="bg-surface-dim">Data Visualization Bug</option>
                  <option className="bg-surface-dim">Billing & Subscription</option>
                  <option className="bg-surface-dim">Other / General Inquiry</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block px-1 opacity-80">Detailed Message</label>
                <textarea 
                  required
                  className="w-full bg-surface-container-highest border border-on-surface/5 rounded-lg p-4 text-on-surface placeholder:text-on-surface focus:ring-2 focus:ring-primary/40 outline-none transition-all resize-none text-sm font-medium" 
                  placeholder="Please provide specific timestamps, sensor IDs, or error codes..." 
                  rows={6}
                ></textarea>
              </div>
              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full md:w-auto px-10 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-black uppercase tracking-widest rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary/20 group"
                >
                  <span>Dispatch Request</span>
                  <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">send</span>
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Support Info Elements */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          {/* Response Time Card */}
          <div className="bg-surface-container-high p-8 rounded-xl border-l-4 border-tertiary shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
               <span className="material-symbols-outlined text-6xl">timer</span>
            </div>
            <div className="flex items-start gap-5 relative z-10">
              <div className="bg-tertiary/10 p-3 rounded-xl border border-tertiary/20">
                <span className="material-symbols-outlined text-tertiary text-2xl">speed</span>
              </div>
              <div>
                <h4 className="text-on-surface font-black text-xs uppercase tracking-[0.2em] mb-2 opacity-60">Average Response Time</h4>
                <p className="text-4xl font-headline font-black text-tertiary tracking-tighter">14 Minutes</p>
                <p className="text-on-surface text-[10px] font-bold uppercase tracking-widest mt-3 leading-relaxed">
                  Active engineers are currently monitoring the dispatch queue.
                </p>
              </div>
            </div>
          </div>

          {/* Direct Contact Channels */}
          <div className="bg-surface-container-low p-8 rounded-xl space-y-8 border border-on-surface/5 shadow-2xl">
            <h4 className="text-[10px] font-black text-on-surface uppercase tracking-[0.3em] opacity-40">Global Support Nodes</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-5 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-on-surface/5 group-hover:bg-primary/20 group-hover:border-primary/20 transition-all group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-xl">mail</span>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface font-black uppercase tracking-widest opacity-60">Emergency Uplink</p>
                  <p className="text-sm font-black text-on-surface tracking-tight uppercase">pkgraphics99@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-5 group cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center border border-on-surface/5 group-hover:bg-primary/20 group-hover:border-primary/20 transition-all group-hover:scale-110">
                  <span className="material-symbols-outlined text-primary text-xl">forum</span>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface font-black uppercase tracking-widest opacity-60">Internal Dev Relay</p>
                  <p className="text-sm font-black text-on-surface tracking-tight uppercase">Slack: #nexus-support-hq</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="bg-surface-container/50 p-6 rounded-xl flex items-center justify-between border border-on-surface/5">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
              </span>
              <span className="text-[10px] font-black text-on-surface uppercase tracking-[0.2em] antialiased">Systems Operational</span>
            </div>
            <button className="text-[10px] font-black text-primary hover:text-primary-fixed-dim transition-colors uppercase tracking-widest">
              View Status Page
            </button>
          </div>

          {/* Mini Map Visual */}
          <div className="h-56 w-full rounded-xl overflow-hidden relative grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all duration-700 cursor-crosshair border border-on-surface/5 shadow-2xl">
            <img 
              className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNOzSkI1cYfJxIurY3_nooxiHkd8mebgahy1TUosSpCiFsxEUMzoLMxyBpqMKpqp6hCh54XNf6NV9ujJusk_lduFBsCD2XTDLxBkls4D_mNxgoR8sNALFMpRnogVQMSQSQ0tLlFU_qlatqROJ3kGOMjEtXBRJK5N-OtTo0_yJO0DBMKyBQQdC_IRomMcBMaxbFfg7YWE7M3IUlRApzlzleW_avYHJ0U9AWNp1Fj4O-ECXbD1ubEtZavMumwBjpSuMfEvR5la-foW4"
              alt="Engineering Hub Location"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
            <div className="absolute bottom-6 left-6">
              <p className="text-on-surface font-black text-xs uppercase tracking-tight">Main Engineering Hub</p>
              <p className="text-on-surface text-[10px] font-bold uppercase tracking-widest opacity-60">Mission District, San Francisco</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Specific Badge */}
      <div className="mt-16 flex justify-center">
        <span className="bg-surface-container-highest/20 px-6 py-2 rounded-full border border-on-surface/5 text-[10px] text-on-surface uppercase tracking-[0.3em] font-black opacity-60">
          Internal Support Terminal • V 4.2.1-Beta
        </span>
      </div>
    </motion.div>
  );
};

export default Contact;






