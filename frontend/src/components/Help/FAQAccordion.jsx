import { useState } from 'react';


const FAQItem = ({ question, answer, icon, color }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-surface-container-low rounded-xl border border-on-surface/5 shadow-2xl relative overflow-hidden group">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left group/btn"
      >
        <div className="flex items-center gap-5">
          <div className={`w-10 h-10 rounded-xl bg-opacity-10 flex items-center justify-center border border-on-surface/5 transition-transform group-hover/btn:scale-110 ${color}`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </div>
          <span className="font-headline font-black text-on-surface tracking-tighter uppercase antialiased group-hover/btn:text-primary transition-colors text-sm">
            {question}
          </span>
        </div>
        <span className={`material-symbols-outlined text-on-surface transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 text-xs text-on-surface font-medium leading-relaxed max-w-2xl animate-fade-in opacity-80 uppercase tracking-widest">
          {answer}
        </div>
      )}
    </div>
  );
};

const FAQAccordion = () => {
  const faqs = [
    {
      question: 'How is the real-time traffic data encrypted?',
      answer: 'All mobility telemetry is encrypted in transit using TLS 1.3 and at rest using AES-256. We utilize a Zero-Knowledge architecture for municipal PII (Personally Identifiable Information).',
      icon: 'security',
      color: 'bg-primary text-primary'
    },
    {
      question: 'What is the latency for predictive pollution insights?',
      answer: 'Our neural infrastructure layer updates forecasting models every 450ms, with a total system latency of under 1.2s for active urban nodes.',
      icon: 'update',
      color: 'bg-tertiary text-tertiary'
    },
    {
      question: 'Can I integrate third-party sensor hardware?',
      icon: 'hub',
      color: 'bg-secondary text-secondary',
      answer: 'Yes, Nexus supports standard IoT protocols including MQTT, REST, and gRPC for hardware ingestion.'
    },
    {
      question: 'What happens during a complete node failure?',
      icon: 'priority_high',
      color: 'bg-error text-error',
      answer: 'Failover protocols automatically reroute telemetry to secondary ingestion nodes within the sector mesh.'
    }
  ];

  return (
    <div className="space-y-6 font-body">
      <div className="flex items-end justify-between mb-8 px-2">
        <div className="space-y-1">
          <h3 className="text-2xl font-black font-headline tracking-tighter text-on-surface uppercase antialiased">Frequently Asked Questions</h3>
          <p className="text-[10px] text-on-surface font-black uppercase tracking-widest opacity-60">Quick operational intelligence.</p>
        </div>
        <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 shadow-sm uppercase tracking-widest">24 New Updates</span>
      </div>
      
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <FAQItem key={i} {...faq} />
        ))}
      </div>
    </div>
  );
};

export default FAQAccordion;






