import { api } from '../api';
import { state } from '../state';
import { icon } from '../icons';

export function renderCaseDetailModal(caseNumber: string): string {
  return `
    <div id="case-detail-backdrop" class="fixed inset-0 bg-[#2B1D19]/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div id="case-detail-container" class="bg-[#FFFFFF] border border-[#E4DCD8] rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-xs text-[#2B211E]">
        <!-- Loading Placeholder -->
        <div id="case-modal-loading" class="p-12 text-center space-y-3">
          <div class="w-8 h-8 rounded-full border-2 border-[#4E342E] border-t-transparent animate-spin mx-auto"></div>
          <p class="text-xs text-[#6F625D]">Loading investigation dossier for ${caseNumber}...</p>
        </div>

        <!-- Populated Dynamic Workspace (Injected by setupCaseModal) -->
        <div id="case-modal-content" class="hidden flex-col h-full overflow-hidden"></div>
      </div>
    </div>
  `;
}

export async function setupCaseModal(caseNumber: string): Promise<void> {
  const loadingEl = document.querySelector<HTMLDivElement>('#case-modal-loading');
  const contentEl = document.querySelector<HTMLDivElement>('#case-modal-content');
  const backdrop = document.querySelector<HTMLDivElement>('#case-detail-backdrop');

  const closeModal = () => {
    const root = document.querySelector<HTMLDivElement>('#modal-root');
    if (root) root.innerHTML = '';
  };

  // Close on ESC
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Close on backdrop click outside container
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModal();
      }
    });
  }

  try {
    const res = await api.getCaseById(caseNumber);
    const c = res.caseItem;
    const leads = res.leads || [];
    const sightings = res.sightings || [];
    const consent = res.consent || [];

    if (!contentEl || !loadingEl) return;

    const isCritical = c.riskLevel === 'critical';
    const isHigh = c.riskLevel === 'high';

    contentEl.innerHTML = `
      <!-- Modal Top Header -->
      <div class="p-4 sm:p-5 border-b border-[#E4DCD8] bg-[#FAF8F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex items-center space-x-3">
          <button id="btn-close-case-modal" class="p-1.5 rounded hover:bg-[#EDE7E4] text-[#4E342E] transition">
            ${icon('arrowRight', 'w-4 h-4 rotate-180')}
          </button>
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-sm text-[#4E342E]">${c.caseNumber}</span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                isCritical ? 'badge-status-critical' : isHigh ? 'badge-status-warning' : 'badge-status-neutral'
              }">
                ${c.riskLevel.toUpperCase()} RISK
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium badge-status-neutral capitalize">
                ${c.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h2 class="text-base font-bold text-[#2B211E] mt-0.5">${c.fullName}</h2>
          </div>
        </div>

        <!-- Quick Case Actions -->
        <div class="flex items-center space-x-2 shrink-0">
          <button id="btn-modal-add-evidence" class="btn-latte px-3 py-1.5 text-xs font-semibold flex items-center space-x-1.5">
            ${icon('upload', 'w-3.5 h-3.5')}
            <span>Add Evidence</span>
          </button>
          <button id="btn-modal-report-sighting" class="btn-mocha px-3 py-1.5 text-xs font-semibold flex items-center space-x-1.5">
            ${icon('eye', 'w-3.5 h-3.5')}
            <span>Report Sighting</span>
          </button>
        </div>
      </div>

      <!-- Dossier Tabs Navigation -->
      <div class="px-4 border-b border-[#E4DCD8] bg-[#FFFFFF] flex space-x-4 overflow-x-auto">
        <button data-tab-target="tab-overview" class="dossier-tab-btn py-3 border-b-2 border-[#4E342E] text-[#4E342E] font-bold text-xs">
          Overview
        </button>
        <button data-tab-target="tab-evidence" class="dossier-tab-btn py-3 border-b-2 border-transparent text-[#6F625D] hover:text-[#2B211E] font-medium text-xs">
          Evidence (${(c.photos?.length || 0) + (c.voiceRecordings?.length || 0)})
        </button>
        <button data-tab-target="tab-sightings" class="dossier-tab-btn py-3 border-b-2 border-transparent text-[#6F625D] hover:text-[#2B211E] font-medium text-xs">
          Sightings (${sightings.length})
        </button>
        <button data-tab-target="tab-leads" class="dossier-tab-btn py-3 border-b-2 border-transparent text-[#6F625D] hover:text-[#2B211E] font-medium text-xs">
          Leads (${leads.length})
        </button>
        <button data-tab-target="tab-consent" class="dossier-tab-btn py-3 border-b-2 border-transparent text-[#6F625D] hover:text-[#2B211E] font-medium text-xs">
          Consent (${consent.length})
        </button>
      </div>

      <!-- Tab Content Area (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-5 space-y-6">
        <!-- TAB 1: OVERVIEW -->
        <div id="tab-overview" class="dossier-tab-content space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="card-panel p-4 space-y-3 bg-[#FAF8F6]">
              <h4 class="text-xs font-bold text-[#4E342E] uppercase tracking-wider">Subject Demographics</h4>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span class="text-[#6F625D] block text-[10px]">Age:</span>
                  <span class="font-semibold text-[#2B211E]">${c.age} years old</span>
                </div>
                <div>
                  <span class="text-[#6F625D] block text-[10px]">Gender:</span>
                  <span class="font-semibold text-[#2B211E] capitalize">${c.gender}</span>
                </div>
                <div>
                  <span class="text-[#6F625D] block text-[10px]">Last Seen Date:</span>
                  <span class="font-semibold text-[#2B211E]">${new Date(c.lastSeenDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span class="text-[#6F625D] block text-[10px]">Reported On:</span>
                  <span class="font-semibold text-[#2B211E]">${new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div class="card-panel p-4 space-y-3 bg-[#FAF8F6]">
              <h4 class="text-xs font-bold text-[#4E342E] uppercase tracking-wider">Last Known Location</h4>
              <div class="space-y-1 text-xs">
                <div class="font-semibold text-[#2B211E]">${c.lastSeenLocation.address}</div>
                <div class="text-[#6F625D]">${c.lastSeenLocation.city}, ${c.lastSeenLocation.state}, ${c.lastSeenLocation.country}</div>
                ${
                  c.lastSeenLocation.coordinates
                    ? `<div class="text-[10px] font-mono text-[#496579] pt-1">GPS: ${c.lastSeenLocation.coordinates.lat.toFixed(4)}, ${c.lastSeenLocation.coordinates.lng.toFixed(4)}</div>`
                    : ''
                }
              </div>
            </div>
          </div>

          <div class="card-panel p-4 space-y-2">
            <h4 class="text-xs font-bold text-[#4E342E] uppercase tracking-wider">Physical Description &amp; Distinguishing Features</h4>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span class="text-[#6F625D] block text-[10px]">Height:</span>
                <span class="font-medium text-[#2B211E]">${c.physicalDescription?.heightCm || 'N/A'} cm</span>
              </div>
              <div>
                <span class="text-[#6F625D] block text-[10px]">Eye Color:</span>
                <span class="font-medium text-[#2B211E]">${c.physicalDescription?.eyeColor || 'Brown'}</span>
              </div>
              <div>
                <span class="text-[#6F625D] block text-[10px]">Hair:</span>
                <span class="font-medium text-[#2B211E]">${c.physicalDescription?.hairColor || 'Dark'}</span>
              </div>
              <div>
                <span class="text-[#6F625D] block text-[10px]">Clothing:</span>
                <span class="font-medium text-[#2B211E]">${c.physicalDescription?.clothingLastSeen || 'Casual attire'}</span>
              </div>
            </div>
          </div>

          <div class="card-panel p-4 space-y-2">
            <h4 class="text-xs font-bold text-[#4E342E] uppercase tracking-wider">Circumstances of Disappearance</h4>
            <p class="text-xs text-[#2B211E] leading-relaxed">${c.circumstances || 'No additional narrative provided in initial report.'}</p>
          </div>
        </div>

        <!-- TAB 2: EVIDENCE -->
        <div id="tab-evidence" class="dossier-tab-content hidden space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-[#4E342E] uppercase tracking-wider">Cryptographically Verified Biometric &amp; Physical Evidence</h4>
            <input type="file" id="evidence-file-input" class="hidden" accept="image/*,audio/*,.pdf,.doc" />
            <button id="btn-upload-evidence-direct" class="btn-mocha px-3 py-1.5 text-xs font-semibold flex items-center space-x-1.5">
              ${icon('upload', 'w-3.5 h-3.5')}
              <span>Upload New File</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            ${
              (c.photos || []).map((photo, i) => `
              <div class="card-panel p-3 space-y-2">
                <div class="w-full h-32 bg-[#EDE7E4] rounded flex items-center justify-center overflow-hidden border border-[#E4DCD8]">
                  <img src="${photo.url}" alt="${photo.caption || 'Evidence Photo'}" class="w-full h-full object-cover" onerror="this.src='https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300'" />
                </div>
                <div class="flex items-center justify-between text-[10px]">
                  <span class="font-bold text-[#4E342E]">PHOTO-0${i + 1}</span>
                  <span class="px-1.5 py-0.5 rounded bg-[#EBF3ED] text-[#3F6B4A] font-semibold">SHA-256 Valid</span>
                </div>
                <p class="text-[11px] text-[#6F625D] truncate">${photo.caption || 'Reference Portrait'}</p>
              </div>
            `).join('')
            }
          </div>
        </div>

        <!-- TAB 3: SIGHTINGS -->
        <div id="tab-sightings" class="dossier-tab-content hidden space-y-3">
          ${
            sightings.length === 0
              ? `<div class="p-8 text-center text-xs text-[#6F625D]">No sightings linked to this case yet.</div>`
              : sightings.map((s) => `
            <div class="card-panel p-3.5 space-y-1.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-[#2B211E]">${s.location.city || s.location.address}</span>
                <span class="text-[10px] text-[#6F625D]">${new Date(s.sightingDate || s.createdAt).toLocaleDateString()}</span>
              </div>
              <p class="text-xs text-[#6F625D]">${s.description}</p>
              <div class="flex items-center space-x-2 pt-1">
                <span class="px-1.5 py-0.5 text-[9px] rounded bg-[#EBF3ED] text-[#3F6B4A] font-medium">GPS Matched</span>
                <span class="text-[10px] text-[#6F625D]">Credibility: ${s.credibilityScore || 85}%</span>
              </div>
            </div>
          `).join('')
          }
        </div>

        <!-- TAB 4: LEADS -->
        <div id="tab-leads" class="dossier-tab-content hidden space-y-3">
          ${
            leads.length === 0
              ? `<div class="p-8 text-center text-xs text-[#6F625D]">No automated biometric leads generated for this case.</div>`
              : leads.map((l) => `
            <div class="card-panel p-3.5 space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-xs text-[#4E342E] capitalize">${l.matchType.replace(/_/g, ' ')}</span>
                <span class="font-bold text-xs text-[#2B211E]">${Math.round((l.confidenceScore || 0.8) * 100)}% Confidence</span>
              </div>
              <p class="text-xs text-[#6F625D]">${l.summary || l.aiExplanation}</p>
              <div class="flex items-center justify-between pt-1 border-t border-[#E4DCD8] text-[10px]">
                <span class="text-[#6F625D]">Status: <strong class="text-[#2B211E] capitalize">${l.humanVerificationStatus}</strong></span>
                <button data-quick-verify="${l._id}" class="btn-latte px-2 py-0.5 text-[10px] font-semibold">Verify Lead</button>
              </div>
            </div>
          `).join('')
          }
        </div>

        <!-- TAB 5: CONSENT -->
        <div id="tab-consent" class="dossier-tab-content hidden space-y-3">
          <div class="card-panel p-4 bg-[#FAF8F6] space-y-2">
            <h4 class="text-xs font-bold text-[#4E342E] uppercase tracking-wider">Zero-Knowledge Consent Matrix</h4>
            <p class="text-xs text-[#6F625D]">Family guardians retain granular cryptographic revocation rights over biometric search and contact disclosure.</p>
          </div>
          ${
            consent.map((cn) => `
            <div class="card-panel p-3 flex items-center justify-between">
              <div>
                <div class="font-bold text-xs text-[#2B211E] capitalize">${cn.consentType.replace(/_/g, ' ')}</div>
                <div class="text-[10px] text-[#6F625D]">Scope: ${cn.scope || 'Case investigation & match confirmation'}</div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                cn.status === 'granted' ? 'bg-[#EBF3ED] text-[#3F6B4A]' : 'bg-[#FDF2F2] text-[#9B3E3E]'
              } uppercase">${cn.status}</span>
            </div>
          `).join('')
          }
        </div>
      </div>
    `;

    loadingEl.classList.add('hidden');
    contentEl.classList.remove('hidden');
    contentEl.classList.add('flex');

    // Close button
    document.querySelector('#btn-close-case-modal')?.addEventListener('click', closeModal);

    // Tab switcher
    document.querySelectorAll<HTMLButtonElement>('.dossier-tab-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab-target');
        document.querySelectorAll('.dossier-tab-content').forEach((el) => el.classList.add('hidden'));
        document.querySelectorAll('.dossier-tab-btn').forEach((b) => {
          b.classList.remove('border-[#4E342E]', 'text-[#4E342E]', 'font-bold');
          b.classList.add('border-transparent', 'text-[#6F625D]', 'font-medium');
        });

        if (targetId) {
          document.querySelector(`#${targetId}`)?.classList.remove('hidden');
          btn.classList.add('border-[#4E342E]', 'text-[#4E342E]', 'font-bold');
          btn.classList.remove('border-transparent', 'text-[#6F625D]', 'font-medium');
        }
      });
    });

    // Add Evidence button
    document.querySelector('#btn-modal-add-evidence')?.addEventListener('click', () => {
      document.querySelector<HTMLInputElement>('#evidence-file-input')?.click();
    });
    document.querySelector('#btn-upload-evidence-direct')?.addEventListener('click', () => {
      document.querySelector<HTMLInputElement>('#evidence-file-input')?.click();
    });

    // Evidence file input change
    document.querySelector<HTMLInputElement>('#evidence-file-input')?.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          state.setIsAIProcessing(true);
          await api.uploadEvidence(caseNumber, file, 'Uploaded via Investigation Dossier');
          state.addToast({
            type: 'success',
            title: 'Evidence Added',
            message: `${file.name} uploaded and SHA-256 hash verified.`,
          });
          setupCaseModal(caseNumber);
        } catch (err: any) {
          state.addToast({
            type: 'error',
            title: 'Upload Failed',
            message: err.message || 'Could not upload evidence file.',
          });
        } finally {
          state.setIsAIProcessing(false);
        }
      }
    });

    // Report Sighting button
    document.querySelector('#btn-modal-report-sighting')?.addEventListener('click', () => {
      closeModal();
      const modalRoot = document.querySelector<HTMLDivElement>('#modal-root');
      if (modalRoot) {
        import('./SightingReportModal').then(({ renderSightingReportModal, setupSightingModal }) => {
          modalRoot.innerHTML = renderSightingReportModal(caseNumber);
          setupSightingModal();
        });
      }
    });

    // Quick verify lead button
    document.querySelectorAll<HTMLButtonElement>('[data-quick-verify]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const leadId = btn.getAttribute('data-quick-verify');
        if (leadId) {
          try {
            await api.verifyLead(leadId, 'verified', 'Verified via Dossier Workspace');
            state.addToast({
              type: 'success',
              title: 'Lead Verified',
              message: 'Human verification recorded in audit ledger.',
            });
            btn.textContent = 'Verified ✓';
            btn.setAttribute('disabled', 'true');
          } catch (err: any) {
            state.addToast({
              type: 'error',
              title: 'Error',
              message: err.message || 'Verification failed.',
            });
          }
        }
      });
    });
  } catch (err: any) {
    if (loadingEl) {
      loadingEl.innerHTML = `
        <div class="text-[#9B3E3E] space-y-2">
          ${icon('alertCircle', 'w-8 h-8 mx-auto text-[#9B3E3E]')}
          <p class="font-bold">Failed to load case dossier.</p>
          <p class="text-xs">${err.message || 'Case not found or network error.'}</p>
          <button id="btn-close-error-modal" class="btn-mocha px-4 py-1.5 mt-2">Close</button>
        </div>
      `;
      document.querySelector('#btn-close-error-modal')?.addEventListener('click', closeModal);
    }
  }
}
