import { state } from '../state';
import { api } from '../api';
import type { MissingCase, MatchLead } from '../types';
import { icon } from '../icons';

export function renderCaseDetailModal(_caseId?: string): string {
  return `
    <div id="case-modal-backdrop" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="glass-panel-elevated w-full max-w-4xl rounded-3xl border border-[#dfcceb] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <!-- Modal Loading State -->
        <div id="case-modal-loading" class="p-12 text-center text-[#733f9f] space-y-3">
          <div class="w-8 h-8 border-2 border-[#8c55bd] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs font-bold">Retrieving Cryptographically-Signed Case Dossier...</p>
        </div>

        <!-- Modal Content Container -->
        <div id="case-modal-content" class="hidden flex-1 flex flex-col overflow-hidden">
          <!-- Filled dynamically in setupCaseModal -->
        </div>
      </div>
    </div>
  `;
}

export async function setupCaseModal(caseId: string): Promise<void> {
  const loadingEl = document.getElementById('case-modal-loading');
  const contentEl = document.getElementById('case-modal-content');
  const backdrop = document.getElementById('case-modal-backdrop');

  const closeModal = () => {
    backdrop?.remove();
  };

  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  try {
    const { caseItem, leads }: { caseItem: MissingCase; leads: MatchLead[] } = await api.getCaseById(caseId);

    if (loadingEl) loadingEl.classList.add('hidden');
    if (contentEl) {
      contentEl.classList.remove('hidden');
      contentEl.innerHTML = `
        <!-- Modal Header -->
        <div class="p-5 border-b border-[#dfcceb] bg-[#faf6fd] flex items-center justify-between">
          <div class="flex items-center space-x-3.5">
            <div class="w-12 h-12 rounded-2xl bg-[#f4ecfb] overflow-hidden border border-[#dfcceb] flex items-center justify-center text-lg text-[#8c55bd]">
              ${caseItem.photos?.[0]?.url ? `<img src="${caseItem.photos[0].url}" class="w-full h-full object-cover" />` : icon('user', 'w-6 h-6 text-[#aa7dc8]')}
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h2 class="text-lg font-bold text-[#231c2d]">${caseItem.fullName}</h2>
                <span class="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-white text-[#231c2d] border border-[#dfcfb6] shadow-xs">${caseItem.caseNumber}</span>
                <span class="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full ${caseItem.riskLevel === 'critical' ? 'bg-[#fce8ea] text-[#b85b67] border border-[#f5b3bb]' : 'bg-[#fdf5ea] text-[#8f642a] border border-[#fae0be]'}">
                  ${caseItem.riskLevel} Risk
                </span>
              </div>
              <p class="text-xs text-[#786a89] mt-0.5">Missing from ${caseItem.lastSeenLocation.city}, ${caseItem.lastSeenLocation.state} since ${new Date(caseItem.lastSeenDate).toLocaleDateString()}</p>
            </div>
          </div>

          <button id="btn-close-case-modal" class="text-[#786a89] hover:text-[#231c2d] p-2 rounded-xl hover:bg-[#f4ecfb] transition cursor-pointer">
            ${icon('x', 'w-4 h-4')}
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <!-- Physical Features Grid -->
          <div class="glass-panel p-4 rounded-2xl space-y-3">
            <h3 class="font-bold text-[#786a89] uppercase tracking-wider text-[11px]">Physical Identifiers &amp; Markers</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[#594c6d]">
              <div class="p-3 rounded-xl bg-[#fbf8f2] border border-[#dfcfb6]">
                <span class="text-[#786a89] text-[10px] block font-bold">Age &amp; Gender:</span>
                <strong class="text-[#231c2d] text-xs">${caseItem.age} yrs (${caseItem.gender})</strong>
              </div>
              <div class="p-3 rounded-xl bg-[#fbf8f2] border border-[#dfcfb6]">
                <span class="text-[#786a89] text-[10px] block font-bold">Height &amp; Weight:</span>
                <strong class="text-[#231c2d] text-xs">${caseItem.physicalDescription.heightCm || '—'} cm / ${caseItem.physicalDescription.weightKg || '—'} kg</strong>
              </div>
              <div class="p-3 rounded-xl bg-[#fbf8f2] border border-[#dfcfb6]">
                <span class="text-[#786a89] text-[10px] block font-bold">Hair &amp; Eyes:</span>
                <strong class="text-[#231c2d] text-xs">${caseItem.physicalDescription.hairColor || '—'} / ${caseItem.physicalDescription.eyeColor || '—'}</strong>
              </div>
              <div class="p-3 rounded-xl bg-[#fbf8f2] border border-[#dfcfb6]">
                <span class="text-[#786a89] text-[10px] block font-bold">Clothing Last Seen:</span>
                <strong class="text-[#231c2d] text-xs truncate block">${caseItem.physicalDescription.clothingLastSeen || 'N/A'}</strong>
              </div>
            </div>

            ${caseItem.physicalDescription.distinguishingFeatures?.length ? `
              <div class="pt-2 border-t border-black/5">
                <span class="text-[#786a89] font-bold">Distinguishing Marks / Tattoos: </span>
                <span class="text-[#733f9f] font-semibold">${caseItem.physicalDescription.distinguishingFeatures.join('; ')}</span>
              </div>
            ` : ''}
          </div>

          <!-- Circumstances Narrative -->
          <div class="glass-panel p-4 rounded-2xl space-y-2">
            <h3 class="font-bold text-[#786a89] uppercase tracking-wider text-[11px]">Last Seen Circumstances</h3>
            <p class="text-[#594c6d] leading-relaxed">${caseItem.circumstances || 'No additional narrative provided.'}</p>
          </div>

          <!-- Evidence Gallery (Photos & Voice) -->
          <div class="space-y-3">
            <h3 class="font-bold text-[#786a89] uppercase tracking-wider text-[11px]">Archival Evidence Vault</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              ${(caseItem.photos || []).map((photo, i) => `
                <div class="relative h-28 rounded-2xl overflow-hidden border border-[#dfcceb] bg-[#f8f5f0]">
                  <img src="${photo.url}" class="w-full h-full object-cover" />
                  <span class="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-black/60 rounded-full text-[9px] text-white font-mono">Photo #${i+1}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Correlated Leads for this case -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-[#786a89] uppercase tracking-wider text-[11px]">Associated Decision Leads (${leads.length})</h3>
            </div>

            <div class="space-y-2">
              ${leads.map(lead => `
                <div class="p-3.5 rounded-xl bg-white border border-[#dfcceb] flex items-center justify-between shadow-xs">
                  <div>
                    <span class="font-bold text-[#231c2d]">${lead.summary}</span>
                    <p class="text-[11px] text-[#786a89] mt-0.5">${lead.aiExplanation}</p>
                  </div>
                  <div class="text-right">
                    <span class="font-mono font-bold text-[#385c47]">${Math.round(lead.confidenceScore * 100)}%</span>
                    <span class="text-[9px] block uppercase text-[#786a89] font-bold">Confidence</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-[#dfcceb] bg-[#faf6fd] flex items-center justify-between">
          <button id="btn-modal-run-ai" class="px-4 py-2.5 rounded-2xl bg-[#f4ecfb] hover:bg-[#ebdff5] border border-[#dfcceb] text-[#5c3280] font-bold text-xs transition cursor-pointer flex items-center space-x-1.5">
            <span>${icon('sparkles', 'w-3.5 h-3.5 text-[#8c55bd]')}</span>
            <span>Run Multimodal AI Correlator</span>
          </button>

          <button id="btn-modal-reunify" class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center space-x-1.5">
            <span>${icon('handshake', 'w-3.5 h-3.5 text-white')}</span>
            <span>Open Consent Reunification Hub</span>
          </button>
        </div>
      `;

      document.getElementById('btn-close-case-modal')?.addEventListener('click', closeModal);

      document.getElementById('btn-modal-run-ai')?.addEventListener('click', () => {
        closeModal();
        state.setSelectedCaseId(caseId);
        state.setActiveTab('studio');
      });

      document.getElementById('btn-modal-reunify')?.addEventListener('click', () => {
        closeModal();
        state.setSelectedCaseId(caseId);
        state.setActiveTab('reunification');
      });
    }
  } catch (err: any) {
    if (loadingEl) {
      loadingEl.innerHTML = `<p class="text-[#b85b67] font-bold">Failed to load case: ${err.message}</p>`;
    }
  }
}
