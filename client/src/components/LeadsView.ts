import { state } from '../state';
import { api } from '../api';
import type { MatchLead } from '../types';
import { icon } from '../icons';

export async function renderLeadsView(): Promise<string> {
  try {
    const { leads } = await api.getLeads();

    return `
      <div class="space-y-6">
        <!-- Leads Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-[#426a54] mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-[#edf7f1] border border-[#b8e2c8] tracking-wider text-[10px] uppercase">
                Decision Intelligence Queue
              </span>
              <span class="text-[#c5a4db]">•</span>
              <span class="text-[#786a89]">Explainable AI • Human Verification Mandatory</span>
            </div>
            <h1 class="text-2xl font-bold text-[#231c2d] tracking-tight flex items-center space-x-2">
              <span>${icon('target', 'w-6 h-6 text-[#8c55bd]')}</span>
              <span>Lead Prioritization &amp; Verification Hub</span>
            </h1>
            <p class="text-xs text-[#786a89] mt-1">
              Review AI-generated candidate matches with full modality attribution, transparency scores, and bias disclaimers.
            </p>
          </div>

          <div class="flex items-center space-x-3">
            <span class="text-xs text-[#786a89]">Total Leads: <strong class="text-[#231c2d] font-mono font-bold">${leads.length}</strong></span>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="glass-panel p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center space-x-2 text-xs">
            <span class="text-[#786a89] font-bold uppercase text-[10px] tracking-wider">Filter Status:</span>
            <button class="btn-lead-filter px-3.5 py-1 rounded-xl bg-[#f4ecfb] text-[#5c3280] border border-[#dfcceb] font-bold cursor-pointer shadow-xs" data-status="">All</button>
            <button class="btn-lead-filter px-3.5 py-1 rounded-xl bg-white text-[#786a89] hover:text-[#231c2d] border border-[#dfcfb6] font-medium cursor-pointer" data-status="pending">Pending</button>
            <button class="btn-lead-filter px-3.5 py-1 rounded-xl bg-white text-[#786a89] hover:text-[#231c2d] border border-[#dfcfb6] font-medium cursor-pointer" data-status="under_review">Under Review</button>
            <button class="btn-lead-filter px-3.5 py-1 rounded-xl bg-white text-[#786a89] hover:text-[#231c2d] border border-[#dfcfb6] font-medium cursor-pointer" data-status="verified">Verified</button>
          </div>

          <div class="text-xs text-[#786a89] flex items-center space-x-1.5">
            <span>${icon('shield', 'w-3.5 h-3.5 text-[#5b8a6f]')}</span>
            <span>Investigator decision locks immutable audit entry</span>
          </div>
        </div>

        <!-- Leads List -->
        <div class="space-y-4" id="leads-list-container">
          ${leads.map(lead => renderLeadDetailCard(lead)).join('')}
        </div>
      </div>
    `;
  } catch (err: any) {
    return `<div class="p-8 text-center text-[#b85b67]">Error loading leads: ${err.message}</div>`;
  }
}

function renderLeadDetailCard(lead: MatchLead): string {
  const caseObj = typeof lead.caseId === 'object' && lead.caseId ? lead.caseId : null;
  const scorePercent = Math.round((lead.confidenceScore || 0) * 100);
  
  const statusColor = {
    pending: 'bg-[#fdf5ea] text-[#8f642a] border-[#fae0be]',
    under_review: 'bg-[#f4ecfb] text-[#5c3280] border-[#dfcceb]',
    verified: 'bg-[#edf7f1] text-[#385c47] border-[#b8e2c8]',
    dismissed: 'bg-[#f6f0e4] text-[#88799e] border-[#dfcfb6]',
    escalated: 'bg-[#fce8ea] text-[#b85b67] border-[#f5b3bb]',
  }[lead.status] || 'bg-[#f6f0e4] text-[#88799e] border-[#dfcfb6]';

  return `
    <div class="glass-panel p-5 rounded-2xl space-y-4 hover:border-[#8c55bd]/40 transition shadow-xs">
      <!-- Top Row: Case info, Match Type, Confidence & Status -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 pb-3">
        <div class="flex items-center space-x-3.5">
          <div class="w-12 h-12 rounded-2xl bg-[#f4ecfb] border border-[#dfcceb] overflow-hidden flex items-center justify-center font-bold text-[#8c55bd] shrink-0">
            ${caseObj?.photos?.[0]?.url ? `<img src="${caseObj.photos[0].url}" class="w-full h-full object-cover" />` : icon('user', 'w-6 h-6 text-[#aa7dc8]')}
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="text-sm font-bold text-[#231c2d]">${caseObj ? caseObj.fullName : 'Associated Case Lead'}</h3>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f6f0e4] text-[#6f5f48] border border-[#dfcfb6]">${lead.matchType}</span>
            </div>
            <p class="text-xs text-[#786a89]">Case #${caseObj?.caseNumber || 'N/A'} • Last seen: ${caseObj?.lastSeenLocation?.city || 'Unknown'}</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="text-right">
            <span class="text-lg font-extrabold text-[#231c2d] font-mono">${scorePercent}%</span>
            <span class="block text-[9px] uppercase font-bold text-[#786a89]">Match Probability</span>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor}">
            ${lead.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <!-- Middle: AI Rationale & Modality Bar Graph -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Rationale & Limitations -->
        <div class="space-y-3">
          <div class="p-3.5 rounded-xl bg-[#fbf8f2] border border-[#dfcfb6] text-xs space-y-1">
            <div class="font-bold text-[#5c3280] flex items-center space-x-1.5">
              <span>${icon('brain', 'w-3.5 h-3.5 text-[#8c55bd]')}</span>
              <span>Explainable Lead Rationale</span>
            </div>
            <p class="leading-relaxed text-[11px] text-[#594c6d]">${lead.aiExplanation || lead.summary}</p>
          </div>

          <!-- Ethical & Limitations Disclaimer -->
          <div class="p-3 rounded-xl bg-[#f4ecfb] border border-[#dfcceb] text-[10px] text-[#594c6d] space-y-1">
            <span class="font-bold text-[#5c3280] flex items-center space-x-1">
              <span>${icon('info', 'w-3 h-3 text-[#8c55bd]')}</span>
              <span>AI Uncertainty &amp; Limitation Notice</span>
            </span>
            <p>${lead.limitationsAndBiasWarning || 'Visual match confidence is subject to camera resolution, lighting angles, and elapsed time since primary case photo.'}</p>
          </div>
        </div>

        <!-- Modality Feature Weights Breakdown -->
        <div class="p-3.5 rounded-xl bg-[#fbf8f2] border border-[#dfcfb6] space-y-2.5">
          <h4 class="text-xs font-bold text-[#786a89] uppercase tracking-wider">Modality Contributions</h4>
          
          <div class="space-y-2 text-[11px]">
            <div>
              <div class="flex justify-between text-[#786a89] mb-1">
                <span>Facial Symmetry &amp; Features</span>
                <span class="text-[#231c2d] font-mono font-bold">${Math.round((lead.breakdown?.facialScore || 0.88) * 100)}%</span>
              </div>
              <div class="w-full bg-[#ede2d0] rounded-full h-1.5 overflow-hidden">
                <div class="bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] h-full rounded-full" style="width: ${(lead.breakdown?.facialScore || 0.88) * 100}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[#786a89] mb-1">
                <span>Attire &amp; Marker Match</span>
                <span class="text-[#231c2d] font-mono font-bold">${Math.round((lead.breakdown?.clothingScore || 0.92) * 100)}%</span>
              </div>
              <div class="w-full bg-[#ede2d0] rounded-full h-1.5 overflow-hidden">
                <div class="bg-gradient-to-r from-[#b4a081] to-[#dfcfb6] h-full rounded-full" style="width: ${(lead.breakdown?.clothingScore || 0.92) * 100}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[#786a89] mb-1">
                <span>Geospatial Corridor Plausibility</span>
                <span class="text-[#231c2d] font-mono font-bold">${Math.round((lead.breakdown?.locationScore || 0.85) * 100)}%</span>
              </div>
              <div class="w-full bg-[#ede2d0] rounded-full h-1.5 overflow-hidden">
                <div class="bg-gradient-to-r from-[#5b8a6f] to-[#7ea88f] h-full rounded-full" style="width: ${(lead.breakdown?.locationScore || 0.85) * 100}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-[#786a89] mb-1">
                <span>Voice Biometric Match</span>
                <span class="text-[#231c2d] font-mono font-bold">${Math.round((lead.breakdown?.voiceScore || 0.79) * 100)}%</span>
              </div>
              <div class="w-full bg-[#ede2d0] rounded-full h-1.5 overflow-hidden">
                <div class="bg-gradient-to-r from-[#b85b67] to-[#f5b3bb] h-full rounded-full" style="width: ${(lead.breakdown?.voiceScore || 0.79) * 100}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Human-in-the-Loop Action Bar -->
      <div class="pt-2 border-t border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="text-[#786a89] text-[11px]">
          ${lead.humanVerificationStatus === 'verified' ? `
            <span class="text-[#385c47] font-bold flex items-center space-x-1.5">
              <span>${icon('check', 'w-4 h-4 text-[#5b8a6f]')}</span>
              <span>Verified by Investigator • Ready for Consent-Gated Reunification</span>
            </span>
          ` : `
            <span>Status: <strong class="text-[#8f642a]">Awaiting Investigator Verification</strong></span>
          `}
        </div>

        <div class="flex items-center space-x-2">
          ${lead.humanVerificationStatus !== 'verified' ? `
            <button
              data-lead-id="${lead._id}"
              data-decision="verified"
              class="btn-lead-decision px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#5b8a6f] to-[#426a54] hover:opacity-95 text-white font-bold transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
            >
              <span>${icon('check', 'w-3.5 h-3.5 text-white')}</span>
              <span>Confirm &amp; Verify</span>
            </button>
            <button
              data-lead-id="${lead._id}"
              data-decision="inconclusive"
              class="btn-lead-decision px-3 py-1.5 rounded-xl bg-[#fdf5ea] hover:bg-[#fae0be] text-[#8f642a] border border-[#fae0be] font-bold transition cursor-pointer"
            >
              Request Field Check
            </button>
            <button
              data-lead-id="${lead._id}"
              data-decision="rejected"
              class="btn-lead-decision px-3 py-1.5 rounded-xl bg-white hover:bg-[#f6f0e4] text-[#786a89] font-bold border border-[#dfcfb6] transition cursor-pointer"
            >
              Dismiss
            </button>
          ` : `
            <button
              data-case-id="${caseObj?._id || ''}"
              class="btn-goto-reunification px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white font-bold shadow-xs transition cursor-pointer flex items-center space-x-1.5"
            >
              <span>${icon('handshake', 'w-3.5 h-3.5 text-white')}</span>
              <span>Open Reunification Room</span>
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

export function setupLeadsEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('.btn-lead-decision').forEach(btn => {
    btn.addEventListener('click', async () => {
      const leadId = btn.getAttribute('data-lead-id');
      const decision = btn.getAttribute('data-decision') as any;
      if (leadId && decision) {
        try {
          state.setIsAIProcessing(true);
          await api.verifyLead(leadId, decision, `Human verification executed by active user with decision: ${decision}`);
          state.addToast({
            type: decision === 'verified' ? 'success' : 'info',
            title: `Lead ${decision.toUpperCase()}`,
            message: `Lead status updated and audit log entry created.`,
          });
          state.setActiveTab('leads');
        } catch (e: any) {
          state.addToast({
            type: 'error',
            title: 'Verification Failed',
            message: e.message,
          });
        } finally {
          state.setIsAIProcessing(false);
        }
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-goto-reunification').forEach(btn => {
    btn.addEventListener('click', () => {
      const caseId = btn.getAttribute('data-case-id');
      if (caseId) {
        state.setSelectedCaseId(caseId);
      }
      state.setActiveTab('reunification');
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-lead-filter').forEach(btn => {
    btn.addEventListener('click', async () => {
      const status = btn.getAttribute('data-status');
      document.querySelectorAll('.btn-lead-filter').forEach(b => {
        b.classList.remove('bg-[#f4ecfb]', 'text-[#5c3280]', 'border-[#dfcceb]', 'font-bold');
        b.classList.add('bg-white', 'text-[#786a89]', 'border-[#dfcfb6]', 'font-medium');
      });
      btn.classList.remove('bg-white', 'text-[#786a89]', 'border-[#dfcfb6]', 'font-medium');
      btn.classList.add('bg-[#f4ecfb]', 'text-[#5c3280]', 'border-[#dfcceb]', 'font-bold');

      try {
        const params: Record<string, string> = {};
        if (status) params.status = status;
        const { leads } = await api.getLeads(params);
        const container = document.getElementById('leads-list-container');
        if (container) {
          container.innerHTML = leads.length > 0 
            ? leads.map(lead => renderLeadDetailCard(lead)).join('')
            : '<div class="p-8 text-center text-[#786a89] bg-white rounded-2xl border border-[#dfcceb]">No leads found with this filter.</div>';
          setupLeadsEvents();
        }
      } catch (e) {
        console.error(e);
      }
    });
  });
}
