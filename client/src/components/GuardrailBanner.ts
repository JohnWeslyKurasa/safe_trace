import { icon } from '../icons';

export function renderGuardrailBanner(): string {
  return `
    <div class="bg-[#F6EEFA] border-b border-[#E3D4F0] px-4 sm:px-6 py-2 text-xs shrink-0">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center space-x-2 text-[#492864]">
          <span class="flex h-2 w-2 rounded-full bg-[#7C5CBF] animate-pulse"></span>
          <span class="font-bold tracking-wider uppercase text-[10px] bg-white text-[#6A4698] px-2 py-0.5 rounded-full border border-[#DDD0EB] shadow-2xs">
            AI Ethics Guardrails Active
          </span>
          <span class="hidden md:inline text-[#D0C2E2]">|</span>
          <span class="text-[#594868] text-[11px] font-medium">Human verification mandatory: AI produces probabilistic decision intelligence only and never confirms identities autonomously.</span>
        </div>
        <div class="flex items-center space-x-3 text-[11px] shrink-0">
          <button id="btn-view-guardrails" class="text-[#6A4698] hover:text-[#492864] font-semibold underline cursor-pointer flex items-center space-x-1">
            <span>${icon('info', 'w-3 h-3 text-[#7C5CBF]')}</span>
            <span>Ethical Governance Policy</span>
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
