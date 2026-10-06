import { icon } from '../icons';

export function renderGuardrailBanner(): string {
  return `
    <div class="bg-[#f4ecfb] border-b border-[#dfcceb] px-4 py-2 text-xs">
      <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div class="flex items-center space-x-2 text-[#492864]">
          <span class="flex h-2 w-2 rounded-full bg-[#8c55bd]"></span>
          <span class="font-bold tracking-wide uppercase text-[10px] bg-white text-[#733f9f] px-2 py-0.5 rounded-full border border-[#dfcceb] shadow-xs">
            AI Ethics Guardrails Active
          </span>
          <span class="hidden md:inline text-[#c5a4db]">|</span>
          <span class="text-[#594c6d] text-[11px] font-medium">Human verification mandatory: AI produces probabilistic leads only and never confirms identities autonomously.</span>
        </div>
        <div class="flex items-center space-x-3 text-[11px]">
          <button id="btn-view-guardrails" class="text-[#733f9f] hover:text-[#492864] font-semibold underline cursor-pointer flex items-center space-x-1">
            <span>${icon('info', 'w-3 h-3 text-[#8c55bd]')}</span>
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
