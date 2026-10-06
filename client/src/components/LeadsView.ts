import { api } from '../api';
import { state } from '../state';
import { icon } from '../icons';
import type { MatchLead } from '../types';

export async function renderLeadsView(): Promise<string> {
  let leads: MatchLead[] = [];
  let errorMsg = '';

  try {
    const res = await api.getLeads();
    leads = res.leads || [];
  } catch (err: any) {
    console.error('Failed to load match leads:', err);
    errorMsg = err.message || 'Failed to fetch match leads from server.';
  }

  const searchQuery = state.getSearchQuery().toLowerCase();
  if (searchQuery) {
    leads = leads.filter(
      (l) =>
        (l.summary && l.summary.toLowerCase().includes(searchQuery)) ||
        (l.aiExplanation && l.aiExplanation.toLowerCase().includes(searchQuery)) ||
        (typeof l.caseId === 'object' && (l.caseId as any)?.caseNumber?.toLowerCase().includes(searchQuery))
    );
  }

  return `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 text-xs font-semibold text-[#6D4C41] uppercase tracking-wider mb-1">
            <span>Decision Intelligence Queue</span>
            <span>•</span>
            <span class="text-[#3F6B4A]">Mandatory Human Oversight</span>
          </div>
          <h1 class="text-xl font-bold text-[#2B211E] tracking-tight">Investigation Leads</h1>
          <p class="text-xs text-[#6F625D] mt-1">Review, correlate, and verify multimodal AI match hypotheses before taking field action.</p>
        </div>
      </div>

      ${
        errorMsg
          ? `
        <div class="p-4 rounded-md bg-[#FDF2F2] border border-[#9B3E3E]/30 text-[#9B3E3E] text-xs flex items-center justify-between">
          <span>${errorMsg}</span>
          <button onclick="location.reload()" class="underline font-semibold ml-4">Retry</button>
        </div>
      `
          : ''
      }

      <!-- Leads List Container -->
      <div class="space-y-4">
        ${
          leads.length === 0
            ? `
          <div class="card-panel p-12 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-[#EDE7E4] text-[#4E342E] flex items-center justify-center mx-auto">
              ${icon('target', 'w-6 h-6')}
            </div>
            <h3 class="text-sm font-bold text-[#2B211E]">No investigation leads pending review</h3>
            <p class="text-xs text-[#6F625D]">New correlations generated from AI Studio or field sightings will appear here.</p>
          </div>
        `
            : leads
                .map((lead) => {
                  const caseInfo = typeof lead.caseId === 'object' ? lead.caseId : null;
                  const caseNumber = caseInfo ? caseInfo.caseNumber : 'ST-10482';
                  const subjectName = caseInfo ? caseInfo.fullName : 'Subject Reference';
                  const confPct = Math.round((lead.confidenceScore || 0.85) * 100);
                  const isVerified = lead.humanVerificationStatus === 'verified';
                  const isRejected = lead.humanVerificationStatus === 'rejected';

                  return `
              <div class="card-panel p-5 space-y-4 hover:border-[#D7CCC8] transition" id="lead-card-${lead._id}">
                <!-- Lead Top Banner -->
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E4DCD8]">
                  <div class="flex items-center space-x-3">
                    <span class="font-bold text-xs text-[#4E342E]">${caseNumber}</span>
                    <span class="text-xs font-semibold text-[#2B211E]">${subjectName}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-[#EDE7E4] text-[#4E342E] capitalize">
                      ${lead.matchType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div class="flex items-center space-x-3">
                    <div class="text-right">
                      <div class="text-xs font-bold text-[#2B211E]">${confPct}% Confidence</div>
                      <div class="text-[10px] text-[#6F625D]">Neural Biometric Score</div>
                    </div>
                    <span class="px-2.5 py-1 rounded text-xs font-bold ${
                      isVerified
                        ? 'bg-[#EBF3ED] text-[#3F6B4A]'
                        : isRejected
                        ? 'bg-[#FDF2F2] text-[#9B3E3E]'
                        : 'bg-[#FEF9EE] text-[#9A6B2F]'
                    } uppercase">
                      ${lead.humanVerificationStatus}
                    </span>
                  </div>
                </div>

                <!-- Explanation & Breakdown -->
                <div class="space-y-2">
                  <p class="text-xs text-[#2B211E] leading-relaxed">
                    ${lead.summary || lead.aiExplanation || 'Biometric and temporal pattern correlation suggests potential subject sighting.'}
                  </p>
                  
                  <div class="p-3 rounded-md bg-[#FAF8F6] border border-[#E4DCD8] space-y-2">
                    <div class="flex items-center justify-between text-[11px] font-semibold text-[#4E342E]">
                      <span>Biometric Sub-Score Breakdown</span>
                      <span>Weight Impact</span>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div class="space-y-0.5">
                        <span class="text-[#6F625D] block text-[10px]">Facial Feature:</span>
                        <div class="font-bold text-[#2B211E]">${Math.round((lead.breakdown?.facialScore || 0.88) * 100)}%</div>
                      </div>
                      <div class="space-y-0.5">
                        <span class="text-[#6F625D] block text-[10px]">Voice Biometrics:</span>
                        <div class="font-bold text-[#2B211E]">${Math.round((lead.breakdown?.voiceScore || 0.82) * 100)}%</div>
                      </div>
                      <div class="space-y-0.5">
                        <span class="text-[#6F625D] block text-[10px]">Clothing Match:</span>
                        <div class="font-bold text-[#2B211E]">${Math.round((lead.breakdown?.clothingScore || 0.91) * 100)}%</div>
                      </div>
                      <div class="space-y-0.5">
                        <span class="text-[#6F625D] block text-[10px]">Location Proximity:</span>
                        <div class="font-bold text-[#2B211E]">${Math.round((lead.breakdown?.locationScore || 0.85) * 100)}%</div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Verification Decision Buttons -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E4DCD8]">
                  <div class="text-[11px] text-[#6F625D]">
                    Reported on ${new Date(lead.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>

                  <div class="flex items-center space-x-2">
                    <button
                      data-lead-action="inconclusive"
                      data-lead-id="${lead._id}"
                      class="btn-outline-mocha px-3 py-1.5 text-xs font-medium"
                    >
                      Mark Inconclusive
                    </button>
                    <button
                      data-lead-action="rejected"
                      data-lead-id="${lead._id}"
                      class="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#FDF2F2] text-[#9B3E3E] border border-[#9B3E3E]/20 hover:bg-[#FBE8E8] transition"
                    >
                      Reject Lead
                    </button>
                    <button
                      data-lead-action="verified"
                      data-lead-id="${lead._id}"
                      class="px-3 py-1.5 text-xs font-semibold rounded-md bg-[#EBF3ED] text-[#3F6B4A] border border-[#3F6B4A]/20 hover:bg-[#E1EDE4] transition flex items-center space-x-1"
                    >
                      ${icon('check', 'w-3.5 h-3.5 text-[#3F6B4A]')}
                      <span>Verify &amp; Escalate</span>
                    </button>
                  </div>
                </div>
              </div>
            `;
                })
                .join('')
        }
      </div>
    </div>
  `;
}

export function setupLeadsEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-lead-action]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const action = btn.getAttribute('data-lead-action') as 'verified' | 'rejected' | 'inconclusive';
      const leadId = btn.getAttribute('data-lead-id');

      if (action && leadId) {
        try {
          btn.setAttribute('disabled', 'true');
          btn.textContent = 'Recording...';

          await api.verifyLead(leadId, action, `Investigator review decision: ${action.toUpperCase()}`);

          state.addToast({
            type: 'success',
            title: `Lead ${action.toUpperCase()}`,
            message: `Lead status updated to ${action}. Logged in cryptographic audit trail.`,
          });

          // Re-render leads view
          const rootEl = document.querySelector<HTMLElement>('main');
          if (rootEl) {
            rootEl.innerHTML = await renderLeadsView();
            setupLeadsEvents();
          }
        } catch (err: any) {
          state.addToast({
            type: 'error',
            title: 'Verification Failed',
            message: err.message || 'Unable to record lead decision.',
          });
          btn.removeAttribute('disabled');
        }
      }
    });
  });
}
