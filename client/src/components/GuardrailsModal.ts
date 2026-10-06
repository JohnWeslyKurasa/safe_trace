import { icon } from '../icons';

export function renderGuardrailsModal(): string {
  return `
    <div id="guardrails-modal-backdrop" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="glass-panel-elevated w-full max-w-2xl rounded-3xl border border-[#dfcceb] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="p-5 border-b border-[#dfcceb] bg-[#faf6fd] flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-[#f4ecfb] border border-[#dfcceb] flex items-center justify-center text-[#8c55bd]">
              ${icon('shield', 'w-5 h-5 text-[#8c55bd]')}
            </div>
            <div>
              <h2 class="text-base font-bold text-[#231c2d]">SafeTrace AI Ethics &amp; Guardrails Governance</h2>
              <p class="text-[11px] text-[#786a89]">Cryptographic constraints preventing autonomous harms &amp; identity misattribution</p>
            </div>
          </div>

          <button id="btn-close-guardrails-modal" class="text-[#786a89] hover:text-[#231c2d] p-2 rounded-xl hover:bg-[#f4ecfb] transition cursor-pointer">
            ${icon('x', 'w-4 h-4')}
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-4 text-xs text-[#594c6d] overflow-y-auto max-h-[75vh]">
          <div class="p-4 rounded-2xl bg-[#fdf3f4] border border-[#f5b3bb] space-y-1.5">
            <span class="font-bold text-[#b85b67] uppercase text-[10px] tracking-wider flex items-center space-x-1.5">
              <span>${icon('alertTriangle', 'w-3.5 h-3.5 text-[#b85b67]')}</span>
              <span>Mandatory Autonomous Action Prohibitions</span>
            </span>
            <ul class="list-disc list-inside text-[11px] text-[#231c2d] space-y-1 pl-1 font-medium">
              <li><strong class="text-[#231c2d]">Never Confirm Identity:</strong> AI provides probabilistic similarity leads only. Human review is mandatory.</li>
              <li><strong class="text-[#231c2d]">Never Close Cases:</strong> Only authorized investigators with multi-factor authentication can update final case disposition.</li>
              <li><strong class="text-[#231c2d]">Never Expose Precise Geolocation:</strong> Public views see generalized city/radius indicators; exact coordinates remain encrypted.</li>
              <li><strong class="text-[#231c2d]">No Autonomous Contact Sharing:</strong> Zero-knowledge mutual consent is required before any family or subject contact exchange.</li>
            </ul>
          </div>

          <div class="space-y-3">
            <h3 class="font-bold text-[#231c2d] uppercase text-[11px] tracking-wider">The 4 Pillars of SafeTrace AI Architecture</h3>
            
            <div class="p-4 rounded-2xl bg-[#fbf8f2] border border-[#dfcfb6] space-y-1">
              <span class="font-bold text-[#733f9f] flex items-center space-x-1.5">
                <span>${icon('brain', 'w-3.5 h-3.5 text-[#8c55bd]')}</span>
                <span>1. Multimodal Decision Intelligence</span>
              </span>
              <p class="text-[11px] text-[#594c6d]">Combines facial biometrics, clothing patterns, voice prosody, narrative text, and temporal travel plausibility with transparent feature importance weights.</p>
            </div>

            <div class="p-4 rounded-2xl bg-[#fbf8f2] border border-[#dfcfb6] space-y-1">
              <span class="font-bold text-[#6f5f48] flex items-center space-x-1.5">
                <span>${icon('lock', 'w-3.5 h-3.5 text-[#b4a081]')}</span>
                <span>2. Zero-Knowledge Privacy &amp; Consent Gating</span>
              </span>
              <p class="text-[11px] text-[#594c6d]">Granular consent contracts protect vulnerable individuals, runaways seeking shelter, and minors, preventing predatory reunions or stalking.</p>
            </div>

            <div class="p-4 rounded-2xl bg-[#fbf8f2] border border-[#dfcfb6] space-y-1">
              <span class="font-bold text-[#385c47] flex items-center space-x-1.5">
                <span>${icon('shield', 'w-3.5 h-3.5 text-[#5b8a6f]')}</span>
                <span>3. Anti-Fraud &amp; Honey-Token Verification</span>
              </span>
              <p class="text-[11px] text-[#594c6d]">Detects spam bots, photo deepfakes, and forged EXIF data, ranking submissions by a tamper-resistant credibility index.</p>
            </div>

            <div class="p-4 rounded-2xl bg-[#fbf8f2] border border-[#dfcfb6] space-y-1">
              <span class="font-bold text-[#5c3280] flex items-center space-x-1.5">
                <span>${icon('database', 'w-3.5 h-3.5 text-[#8c55bd]')}</span>
                <span>4. Immutable Cryptographic Audit Ledger</span>
              </span>
              <p class="text-[11px] text-[#594c6d]">Every search query, photo upload, and lead status update is immutably recorded with SHA-256 integrity checksums for full accountability.</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t border-[#dfcceb] bg-[#faf6fd] flex justify-end">
          <button id="btn-ack-guardrails" class="px-5 py-2.5 rounded-2xl bg-[#8c55bd] hover:bg-[#733f9f] text-white font-bold text-xs transition cursor-pointer shadow-xs">
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
