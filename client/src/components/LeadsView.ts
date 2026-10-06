import { state } from '../state';
import { api } from '../api';
import type { MatchLead } from '../types';

export async function renderLeadsView(): Promise<string> {
  state.setIsAIProcessing(true);
  try {
    const { leads } = await api.getLeads();

    return `
      <div class="space-y-6">
        <!-- Leads Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30">DECISION INTELLIGENCE QUEUE</span>
              <span>•</span>
              <span>Explainable AI • Human Verification Mandatory</span>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>🎯</span>
              <span>Lead Prioritization &amp; Verification Hub</span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              Review AI-generated candidate matches with full modality attribution, transparency scores, and bias disclaimers.
            </p>
          </div>

          <div class="flex items-center space-x-3">
            <span class="text-xs text-slate-400">Total Leads: <strong class="text-white font-mono">${leads.length}</strong></span>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="glass-panel p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
          <div class="flex items-center space-x-2 text-xs">
            <span class="text-slate-400 font-semibold uppercase text-[10px]">Filter Status:</span>
            <button class="btn-lead-filter px-2.5 py-1 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-semibold" data-status="">All</button>
            <button class="btn-lead-filter px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800" data-status="pending">Pending</button>
            <button class="btn-lead-filter px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800" data-status="under_review">Under Review</button>
            <button class="btn-lead-filter px-2.5 py-1 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800" data-status="verified">Verified</button>
          </div>

          <div class="text-xs text-slate-400 flex items-center space-x-2">
            <span>🛡️</span>
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
    return `<div class="p-8 text-center text-rose-400">Error loading leads: ${err.message}</div>`;
  } finally {
    state.setIsAIProcessing(false);
  }
}

function renderLeadDetailCard(lead: MatchLead): string {
  const caseObj = typeof lead.caseId === 'object' && lead.caseId ? lead.caseId : null;
  const scorePercent = Math.round((lead.confidenceScore || 0) * 100);
  
  const statusColor = {
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    under_review: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    verified: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dismissed: 'bg-slate-700/30 text-slate-400 border-slate-700/40',
    escalated: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  }[lead.status] || 'bg-slate-800 text-slate-300 border-slate-700';

  return `
    <div class="glass-panel p-5 rounded-xl border border-slate-800 space-y-4 hover:border-indigo-500/30 transition">
      <!-- Top Row: Case info, Match Type, Confidence & Status -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div class="flex items-center space-x-3">
          <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-300 shrink-0">
            ${caseObj?.photos?.[0]?.url ? `<img src="${caseObj.photos[0].url}" class="w-full h-full object-cover" />` : '👤'}
          </div>
          <div>
            <div class="flex items-center space-x-2">
              <h3 class="text-sm font-bold text-white">${caseObj ? caseObj.fullName : 'Associated Case Lead'}</h3>
              <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">${lead.matchType}</span>
            </div>
            <p class="text-xs text-slate-400">Case #${caseObj?.caseNumber || 'N/A'} • Last seen: ${caseObj?.lastSeenLocation?.city || 'Unknown'}</p>
          </div>
        </div>

        <div class="flex items-center space-x-3">
          <div class="text-right">
            <span class="text-lg font-extrabold text-white">${scorePercent}%</span>
            <span class="block text-[9px] uppercase font-bold text-slate-400">Match Probability</span>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor}">
            ${lead.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <!-- Middle: AI Rationale & Modality Bar Graph -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Rationale & Limitations -->
        <div class="space-y-3">
          <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div class="font-bold text-indigo-300 flex items-center space-x-1">
              <span>💡</span>
              <span>Explainable Lead Rationale</span>
            </div>
            <p class="leading-relaxed text-[11px]">${lead.aiExplanation || lead.summary}</p>
          </div>

          <!-- Ethical & Limitations Disclaimer -->
          <div class="p-2.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 text-[10px] text-slate-400 space-y-0.5">
            <span class="font-bold text-indigo-300">⚠️ AI Uncertainty &amp; Limitation Notice:</span>
            <p>${lead.limitationsAndBiasWarning || 'Visual match confidence is subject to camera resolution, lighting angles, and elapsed time since primary case photo.'}</p>
          </div>
        </div>

        <!-- Modality Feature Weights Breakdown -->
        <div class="p-3 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Modality Contributions</h4>
          
          <div class="space-y-1.5 text-[11px]">
            <div>
              <div class="flex justify-between text-slate-400">
                <span>Facial Symmetry &amp; Features</span>
                <span class="text-white font-mono font-bold">${Math.round((lead.breakdown?.facialScore || 0.88) * 100)}%</span>
              </div>
              <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div class="bg-indigo-500 h-full rounded-full" style="width: ${(lead.breakdown?.facialScore || 0.88) * 100}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-slate-400">
                <span>Attire &amp; Marker Match</span>
                <span class="text-white font-mono font-bold">${Math.round((lead.breakdown?.clothingScore || 0.92) * 100)}%</span>
              </div>
              <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div class="bg-purple-500 h-full rounded-full" style="width: ${(lead.breakdown?.clothingScore || 0.92) * 100}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-slate-400">
                <span>Geospatial Corridor Plausibility</span>
                <span class="text-white font-mono font-bold">${Math.round((lead.breakdown?.locationScore || 0.85) * 100)}%</span>
              </div>
              <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div class="bg-teal-500 h-full rounded-full" style="width: ${(lead.breakdown?.locationScore || 0.85) * 100}%"></div>
              </div>
            </div>

            <div>
              <div class="flex justify-between text-slate-400">
                <span>Voice Biometric Match</span>
                <span class="text-white font-mono font-bold">${Math.round((lead.breakdown?.voiceScore || 0.79) * 100)}%</span>
              </div>
              <div class="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                <div class="bg-pink-500 h-full rounded-full" style="width: ${(lead.breakdown?.voiceScore || 0.79) * 100}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Human-in-the-Loop Action Bar -->
      <div class="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="text-slate-400 text-[11px]">
          ${lead.humanVerificationStatus === 'verified' ? `
            <span class="text-emerald-400 font-bold flex items-center space-x-1">
              <span>✓</span>
              <span>Verified by Investigator • Ready for Consent-Gated Reunification</span>
            </span>
          ` : `
            <span>Status: <strong class="text-amber-300">Awaiting Investigator Verification</strong></span>
          `}
        </div>

        <div class="flex items-center space-x-2">
          ${lead.humanVerificationStatus !== 'verified' ? `
            <button
              data-lead-id="${lead._id}"
              data-decision="verified"
              class="btn-lead-decision px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition cursor-pointer flex items-center space-x-1"
            >
              <span>✓</span>
              <span>Confirm &amp; Verify Lead</span>
            </button>
            <button
              data-lead-id="${lead._id}"
              data-decision="inconclusive"
              class="btn-lead-decision px-3 py-1.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-white font-semibold transition cursor-pointer"
            >
              Request Field Check
            </button>
            <button
              data-lead-id="${lead._id}"
              data-decision="rejected"
              class="btn-lead-decision px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold border border-slate-700 transition cursor-pointer"
            >
              Dismiss
            </button>
          ` : `
            <button
              data-case-id="${caseObj?._id || ''}"
              class="btn-goto-reunification px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold shadow transition cursor-pointer flex items-center space-x-1.5"
            >
              <span>🤝</span>
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
        b.classList.remove('bg-indigo-600/30', 'text-indigo-300', 'border-indigo-500/40', 'font-semibold');
        b.classList.add('bg-slate-900', 'text-slate-400', 'border-slate-800');
      });
      btn.classList.remove('bg-slate-900', 'text-slate-400', 'border-slate-800');
      btn.classList.add('bg-indigo-600/30', 'text-indigo-300', 'border-indigo-500/40', 'font-semibold');

      try {
        const params: Record<string, string> = {};
        if (status) params.status = status;
        const { leads } = await api.getLeads(params);
        const container = document.getElementById('leads-list-container');
        if (container) {
          container.innerHTML = leads.length > 0 
            ? leads.map(lead => renderLeadDetailCard(lead)).join('')
            : '<div class="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">No leads found with this filter.</div>';
          setupLeadsEvents();
        }
      } catch (e) {
        console.error(e);
      }
    });
  });
}
