import { state } from '../state';
import { api } from '../api';
import type { MissingCase, MatchLead } from '../types';

export function renderCaseDetailModal(_caseId?: string): string {
  return `
    <div id="case-modal-backdrop" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div class="glass-panel-elevated w-full max-w-4xl rounded-2xl border border-slate-700/80 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <!-- Modal Loading State -->
        <div id="case-modal-loading" class="p-12 text-center text-indigo-400 space-y-3">
          <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p class="text-xs font-semibold">Retrieving Cryptographically-Signed Case Dossier...</p>
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
        <div class="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-11 h-11 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center text-lg">
              ${caseItem.photos?.[0]?.url ? `<img src="${caseItem.photos[0].url}" class="w-full h-full object-cover" />` : '👤'}
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h2 class="text-lg font-bold text-white">${caseItem.fullName}</h2>
                <span class="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">${caseItem.caseNumber}</span>
                <span class="text-xs uppercase font-bold px-2 py-0.5 rounded-full ${caseItem.riskLevel === 'critical' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}">
                  ${caseItem.riskLevel} Risk
                </span>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">Missing from ${caseItem.lastSeenLocation.city}, ${caseItem.lastSeenLocation.state} since ${new Date(caseItem.lastSeenDate).toLocaleDateString()}</p>
            </div>
          </div>

          <button id="btn-close-case-modal" class="text-slate-400 hover:text-white text-xl p-2 rounded-lg hover:bg-slate-800 transition cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          <!-- Physical Features Grid -->
          <div class="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 class="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Physical Identifiers &amp; Markers</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
              <div class="p-2 rounded bg-slate-900/80">
                <span class="text-slate-500 text-[10px] block">Age &amp; Gender:</span>
                <strong class="text-white">${caseItem.age} yrs (${caseItem.gender})</strong>
              </div>
              <div class="p-2 rounded bg-slate-900/80">
                <span class="text-slate-500 text-[10px] block">Height &amp; Weight:</span>
                <strong class="text-white">${caseItem.physicalDescription.heightCm || '—'} cm / ${caseItem.physicalDescription.weightKg || '—'} kg</strong>
              </div>
              <div class="p-2 rounded bg-slate-900/80">
                <span class="text-slate-500 text-[10px] block">Hair &amp; Eyes:</span>
                <strong class="text-white">${caseItem.physicalDescription.hairColor || '—'} / ${caseItem.physicalDescription.eyeColor || '—'}</strong>
              </div>
              <div class="p-2 rounded bg-slate-900/80">
                <span class="text-slate-500 text-[10px] block">Clothing Last Seen:</span>
                <strong class="text-white truncate block">${caseItem.physicalDescription.clothingLastSeen || 'N/A'}</strong>
              </div>
            </div>

            ${caseItem.physicalDescription.distinguishingFeatures?.length ? `
              <div class="pt-2 border-t border-slate-800/60">
                <span class="text-slate-400 font-semibold">Distinguishing Marks / Tattoos: </span>
                <span class="text-indigo-300">${caseItem.physicalDescription.distinguishingFeatures.join('; ')}</span>
              </div>
            ` : ''}
          </div>

          <!-- Circumstances Narrative -->
          <div class="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
            <h3 class="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Last Seen Circumstances</h3>
            <p class="text-slate-300 leading-relaxed">${caseItem.circumstances || 'No additional narrative provided.'}</p>
          </div>

          <!-- Evidence Gallery (Photos & Voice) -->
          <div class="space-y-3">
            <h3 class="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Archival Evidence Vault</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              ${(caseItem.photos || []).map((photo, i) => `
                <div class="relative h-28 rounded-lg overflow-hidden border border-slate-700 bg-slate-900">
                  <img src="${photo.url}" class="w-full h-full object-cover" />
                  <span class="absolute bottom-1 left-1 px-1.5 py-0.2 bg-slate-950/80 rounded text-[9px] text-slate-300">Photo #${i+1}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Correlated Leads for this case -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="font-bold text-slate-200 uppercase tracking-wider text-[11px]">Associated Decision Leads (${leads.length})</h3>
            </div>

            <div class="space-y-2">
              ${leads.map(lead => `
                <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span class="font-bold text-white">${lead.summary}</span>
                    <p class="text-[11px] text-slate-400">${lead.aiExplanation}</p>
                  </div>
                  <div class="text-right">
                    <span class="font-mono font-bold text-emerald-400">${Math.round(lead.confidenceScore * 100)}%</span>
                    <span class="text-[9px] block uppercase text-slate-500">Confidence</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button id="btn-modal-run-ai" class="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow transition cursor-pointer flex items-center space-x-1.5">
            <span>⚡</span>
            <span>Run Multimodal AI Correlator</span>
          </button>

          <button id="btn-modal-reunify" class="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow transition cursor-pointer flex items-center space-x-1.5">
            <span>🤝</span>
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
      loadingEl.innerHTML = `<p class="text-rose-400 font-bold">Failed to load case: ${err.message}</p>`;
    }
  }
}
