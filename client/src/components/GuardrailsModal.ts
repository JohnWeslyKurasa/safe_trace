export function renderGuardrailsModal(): string {
  return `
    <div id="guardrails-modal-backdrop" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div class="glass-panel-elevated w-full max-w-2xl rounded-2xl border border-indigo-500/30 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg">
              🛡️
            </div>
            <div>
              <h2 class="text-base font-bold text-white">SafeTrace AI Ethics, Safety &amp; Guardrails Policy</h2>
              <p class="text-[11px] text-slate-400">Strict technical limits preventing automated autonomous harms</p>
            </div>
          </div>

          <button id="btn-close-guardrails-modal" class="text-slate-400 hover:text-white text-xl p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 text-xs text-slate-300 overflow-y-auto max-h-[75vh]">
          <div class="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30 space-y-1">
            <span class="font-bold text-rose-300 uppercase text-[10px] tracking-wider block">Mandatory Autonomous Action Prohibitions:</span>
            <ul class="list-disc list-inside text-[11px] text-slate-300 space-y-1">
              <li><strong class="text-white">Never Confirm Identity:</strong> AI provides probabilistic similarity leads only. Human review is mandatory.</li>
              <li><strong class="text-white">Never Close Cases:</strong> Only authorized investigators with multi-factor authentication can update final case disposition.</li>
              <li><strong class="text-white">Never Expose Precise Geolocation:</strong> Public views see generalized city/radius indicators; exact coordinates remain encrypted.</li>
              <li><strong class="text-white">No Autonomous Contact Sharing:</strong> Zero-knowledge mutual consent is required before any family or subject contact exchange.</li>
            </ul>
          </div>

          <div class="space-y-3">
            <h3 class="font-bold text-white uppercase text-[11px] tracking-wider">The 4 Pillars of SafeTrace AI Architecture</h3>
            
            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span class="font-bold text-indigo-300">1. Multimodal Decision Intelligence</span>
              <p class="text-[11px] text-slate-400">Combines facial biometrics, clothing patterns, voice prosody, narrative text, and temporal travel plausibility with transparent feature importance weights.</p>
            </div>

            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span class="font-bold text-purple-300">2. Zero-Knowledge Privacy &amp; Consent Gating</span>
              <p class="text-[11px] text-slate-400">Granular consent contracts protect vulnerable individuals, runaways seeking shelter, and minors, preventing predatory reunions or stalking.</p>
            </div>

            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span class="font-bold text-emerald-300">3. Anti-Fraud &amp; Honey-Token Verification</span>
              <p class="text-[11px] text-slate-400">Detects spam bots, photo deepfakes, and forged EXIF data, ranking submissions by a tamper-resistant credibility index.</p>
            </div>

            <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
              <span class="font-bold text-teal-300">4. Immutable Cryptographic Audit Ledger</span>
              <p class="text-[11px] text-slate-400">Every search query, photo upload, and lead status update is immutably recorded with SHA-256 integrity checksums for full accountability.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button id="btn-ack-guardrails" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition cursor-pointer">
            Understood &amp; Acknowledged
          </button>
        </div>
      </div>
    </div>
  `;
}

export function setupGuardrailsModal(): void {
  const backdrop = document.getElementById('guardrails-modal-backdrop');
  const closeBtn = document.getElementById('btn-close-guardrails-modal');
  const ackBtn = document.getElementById('btn-ack-guardrails');

  const closeModal = () => backdrop?.remove();

  closeBtn?.addEventListener('click', closeModal);
  ackBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
}
