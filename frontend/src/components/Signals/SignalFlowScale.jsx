const SignalFlowScale = () => {
  return (
    <div className="bg-surface-container-low p-6 rounded-xl space-y-4 font-body border border-on-surface/10/50 shadow-lg">
      <div className="flex justify-between items-center">
        <span className="text-xs font-black font-headline uppercase tracking-widest text-on-surface">System Flow Gradient</span>
        <span className="text-xs text-tertiary font-black uppercase tracking-tighter">Current State: Optimizing</span>
      </div>
      <div className="h-2 w-full rounded-full overflow-hidden bg-surface-container-high flex shadow-inner">
        <div className="h-full w-1/3 bg-tertiary"></div>
        <div className="h-full w-1/4 bg-primary-container"></div>
        <div className="h-full w-1/6 bg-primary"></div>
        <div className="h-full w-1/4 bg-error"></div>
      </div>
      <div className="flex justify-between text-[10px] text-on-surface font-black uppercase tracking-widest leading-none">
        <span>Free Flow</span>
        <span>Moderate</span>
        <span>Saturated</span>
        <span>Congested</span>
      </div>
    </div>
  );
};

export default SignalFlowScale;






