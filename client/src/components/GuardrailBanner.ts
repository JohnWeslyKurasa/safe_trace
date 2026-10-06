export function renderGuardrailBanner(): string {
  return `
    <div class="bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border-b border-indigo-500/20 px-4 py-2">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div class="flex items-center space-x-2 text-indigo-200">
          <span class="flex h-2 w-2 rounded-full bg-indigo-400"></span>
          <span class="font-semibold text-white tracking-wide uppercase text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded border border-indigo-400/30">AI Safety Guardrails Active</span>
          <span class="hidden md:inline text-slate-300">|</span>
          <span class="text-slate-300">Human-in-the-Loop Verification Required: AI produces probabilistic leads only and never confirms identities or closes cases autonomously.</span>
        </div>
        <div class="flex items-center space-x-3 text-[11px]">
          <button id="btn-view-guardrails" class="text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer">
            View Ethical Constraints & Consent Policy
          </button>
        </div>
      </div>
    </div>
  `;
}

export function setupGuardrailEvents(): void {
  document.getElementById('btn-view-guardrails')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-guardrails-modal'));
  });
}
