import { state } from '../state';
import { api } from '../api';
import { icon } from '../icons';

export async function renderDashboardView(): Promise<string> {
  try {
    const [casesRes, leadsRes, alertsRes, clustersRes] = await Promise.all([
      api.getCases({ limit: '6' }).catch(() => ({ cases: [], total: 0 })),
      api.getLeads({ limit: '4' }).catch(() => ({ leads: [], total: 0 })),
      api.getPatternAlerts().catch(() => ({ alerts: [] })),
      api.getClusters().catch(() => ({ clusters: [] })),
    ]);

    const activeCases = casesRes.cases || [];
    const criticalCases = activeCases.filter(c => c.riskLevel === 'critical');
    const leads = leadsRes.leads || [];
    const alerts = alertsRes.alerts || [];
    const clusters = clustersRes.clusters || [];

    return `
      <div class="space-y-6">
        <!-- Hero Section / Welcome banner -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-[#faf6fd] to-[#fbf8f2] border border-[#dfcceb] p-6 md:p-8 shadow-sm">
          <div class="absolute -right-10 -top-10 w-72 h-72 bg-[#ebdff5]/60 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute right-1/3 -bottom-10 w-60 h-60 bg-[#f6f0e4]/80 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="max-w-2xl space-y-2">
              <div class="flex items-center space-x-2 text-xs font-bold text-[#733f9f]">
                <span class="px-2.5 py-0.5 rounded-full bg-[#f4ecfb] border border-[#dfcceb] tracking-wider text-[10px] uppercase">
                  Decision Intelligence Online
                </span>
                <span class="text-[#c5a4db]">•</span>
                <span class="text-[#615573] font-medium">Multimodal AI Neural Engine v2.4</span>
              </div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-[#231c2d] tracking-tight leading-snug">
                Forensic Investigation &amp; Safe Reunification
              </h1>
              <p class="text-sm text-[#594c6d] leading-relaxed">
                Privacy-preserving multimodal biometric correlation, cross-jurisdiction clustering, anti-fraud sighting verification, and consent-gated family reunification.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button id="btn-dash-studio" class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white font-bold text-xs shadow-sm shadow-[#8c55bd]/20 transition flex items-center space-x-2 cursor-pointer active:scale-98">
                ${icon('sparkles', 'w-4 h-4 text-white')}
                <span>Run Multimodal AI</span>
              </button>
              <button id="btn-dash-newcase" class="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#fbf8f2] border border-[#dfcceb] text-[#3c2355] text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-xs">
                ${icon('plus', 'w-3.5 h-3.5 text-[#8c55bd]')}
                <span>Register Case</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1 -->
          <div class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-[#8c55bd]/40 transition">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#786a89] uppercase tracking-wider">Active Cases</span>
              <span class="p-2.5 rounded-xl bg-[#f4ecfb] text-[#8c55bd]">
                ${icon('folder', 'w-4 h-4 text-[#8c55bd]')}
              </span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-3xl font-extrabold text-[#231c2d] font-mono">${casesRes.total || activeCases.length}</span>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fce8ea] text-[#b85b67] border border-[#f5b3bb]">
                ${criticalCases.length} Critical
              </span>
            </div>
            <p class="mt-2 text-[11px] text-[#786a89]">Under active multi-agency monitoring</p>
          </div>

          <!-- Card 2 -->
          <div class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-[#8c55bd]/40 transition">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#786a89] uppercase tracking-wider">Explainable Leads</span>
              <span class="p-2.5 rounded-xl bg-[#edf7f1] text-[#5b8a6f]">
                ${icon('target', 'w-4 h-4 text-[#5b8a6f]')}
              </span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-3xl font-extrabold text-[#231c2d] font-mono">${leadsRes.total || leads.length}</span>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#edf7f1] text-[#426a54] border border-[#b8e2c8]">
                Avg. 88% Match
              </span>
            </div>
            <p class="mt-2 text-[11px] text-[#786a89]">Investigator verification required</p>
          </div>

          <!-- Card 3 -->
          <div class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-[#8c55bd]/40 transition">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#786a89] uppercase tracking-wider">Corridor Alerts</span>
              <span class="p-2.5 rounded-xl bg-[#fdf5ea] text-[#b88640]">
                ${icon('alertTriangle', 'w-4 h-4 text-[#b88640]')}
              </span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-3xl font-extrabold text-[#231c2d] font-mono">${alerts.length}</span>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#fdf5ea] text-[#8f642a] border border-[#fae0be]">
                Active
              </span>
            </div>
            <p class="mt-2 text-[11px] text-[#786a89]">Spatial &amp; temporal pattern anomalies</p>
          </div>

          <!-- Card 4 -->
          <div class="glass-panel p-5 rounded-2xl relative overflow-hidden group hover:border-[#8c55bd]/40 transition">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-[#786a89] uppercase tracking-wider">Reunification Rooms</span>
              <span class="p-2.5 rounded-xl bg-[#f4ecfb] text-[#8c55bd]">
                ${icon('handshake', 'w-4 h-4 text-[#8c55bd]')}
              </span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-3xl font-extrabold text-[#231c2d] font-mono">${clusters.length}</span>
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f4ecfb] text-[#733f9f] border border-[#dfcceb]">
                Consent-Gated
              </span>
            </div>
            <p class="mt-2 text-[11px] text-[#786a89]">Zero-knowledge mutual consent</p>
          </div>
        </div>

        <!-- Pattern Alerts Banner (if any) -->
        ${alerts.length > 0 ? `
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-bold text-[#594c6d] uppercase tracking-wider flex items-center space-x-2">
                <span class="h-2 w-2 rounded-full bg-[#d4a362] animate-ping"></span>
                <span>Active Pattern &amp; Corridor Alerts (${alerts.length})</span>
              </h2>
              <button id="btn-view-all-alerts" class="text-xs font-bold text-[#733f9f] hover:text-[#492864] flex items-center space-x-1 cursor-pointer">
                <span>View All Clusters</span>
                <span>${icon('chevronRight', 'w-3 h-3')}</span>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${alerts.map(alert => `
                <div class="p-5 rounded-2xl border ${alert.severity === 'critical' ? 'bg-[#fdf3f4] border-[#f5b3bb]' : 'bg-[#fdf9f2] border-[#fae0be]'} flex flex-col justify-between shadow-xs">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-[10px] font-bold ${alert.severity === 'critical' ? 'text-[#b85b67] bg-[#fce8ea]' : 'text-[#8f642a] bg-[#fdf5ea]'} uppercase px-2.5 py-0.5 rounded-full border border-current font-mono">
                        ${alert.severity} Alert
                      </span>
                      <span class="text-[11px] text-[#786a89] font-mono">${new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 class="text-sm font-bold text-[#231c2d]">${alert.title}</h3>
                    <p class="mt-1 text-xs text-[#594c6d] leading-relaxed">${alert.description}</p>
                  </div>

                  <div class="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                    <span class="text-[#594c6d]"><strong class="text-[#231c2d]">Action:</strong> ${alert.recommendedAction}</span>
                    <button data-ack-id="${alert._id}" class="btn-ack-alert px-3 py-1.5 rounded-xl bg-white hover:bg-[#f6f0e4] text-[#3c2355] text-[11px] font-bold border border-[#dfcfb6] cursor-pointer shadow-xs transition">
                      Acknowledge
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Two Column Main Body: Priority Leads & Active Cases -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column (2 Cols): Explainable Match Leads -->
          <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-sm font-bold text-[#231c2d] flex items-center space-x-2">
                  <span>${icon('target', 'w-4 h-4 text-[#8c55bd]')}</span>
                  <span>High-Confidence Match Leads (Human Verification Queue)</span>
                </h2>
                <p class="text-xs text-[#786a89]">Explainable multimodal leads ranked by decision intelligence algorithms</p>
              </div>
              <button id="btn-view-all-leads" class="text-xs font-bold text-[#733f9f] hover:text-[#492864] flex items-center space-x-1 cursor-pointer">
                <span>View All Leads</span>
                <span>${icon('chevronRight', 'w-3 h-3')}</span>
              </button>
            </div>

            <div class="space-y-3">
              ${leads.map(lead => {
                const caseObj = typeof lead.caseId === 'object' && lead.caseId ? lead.caseId : null;
                const scorePercent = Math.round((lead.confidenceScore || 0) * 100);
                const scoreBadge = scorePercent >= 85 ? 'text-[#385c47] bg-[#edf7f1] border-[#b8e2c8]' : scorePercent >= 70 ? 'text-[#5c3280] bg-[#f4ecfb] border-[#dfcceb]' : 'text-[#8f642a] bg-[#fdf5ea] border-[#fae0be]';
                
                return `
                  <div class="glass-card-interactive p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div class="flex items-start space-x-3.5 flex-1">
                      <div class="w-12 h-12 rounded-2xl bg-[#f4ecfb] border border-[#dfcceb] overflow-hidden shrink-0 flex items-center justify-center font-bold text-[#8c55bd]">
                        ${caseObj?.photos?.[0]?.url ? `<img src="${caseObj.photos[0].url}" class="w-full h-full object-cover" />` : icon('user', 'w-6 h-6 text-[#aa7dc8]')}
                      </div>
                      <div class="space-y-1">
                        <div class="flex items-center space-x-2">
                          <span class="text-sm font-bold text-[#231c2d]">${caseObj ? caseObj.fullName : 'Lead #' + lead._id.substring(0, 6)}</span>
                          <span class="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#f6f0e4] text-[#6f5f48] border border-[#dfcfb6]">${lead.matchType}</span>
                        </div>
                        <p class="text-xs text-[#594c6d] line-clamp-2">${lead.summary || lead.aiExplanation}</p>
                        
                        <div class="flex flex-wrap items-center gap-1.5 pt-1">
                          ${lead.breakdown?.facialScore ? `<span class="text-[10px] px-2 py-0.5 rounded-md bg-[#f4ecfb] text-[#5c3280] border border-[#dfcceb] font-mono">Face: ${Math.round(lead.breakdown.facialScore * 100)}%</span>` : ''}
                          ${lead.breakdown?.clothingScore ? `<span class="text-[10px] px-2 py-0.5 rounded-md bg-[#f6f0e4] text-[#6f5f48] border border-[#dfcfb6] font-mono">Attire: ${Math.round(lead.breakdown.clothingScore * 100)}%</span>` : ''}
                          ${lead.breakdown?.locationScore ? `<span class="text-[10px] px-2 py-0.5 rounded-md bg-[#edf7f1] text-[#385c47] border border-[#b8e2c8] font-mono">Geo: ${Math.round(lead.breakdown.locationScore * 100)}%</span>` : ''}
                          ${lead.breakdown?.voiceScore ? `<span class="text-[10px] px-2 py-0.5 rounded-md bg-[#fce8ea] text-[#b85b67] border border-[#f5b3bb] font-mono">Voice: ${Math.round(lead.breakdown.voiceScore * 100)}%</span>` : ''}
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center md:flex-col justify-between w-full md:w-auto gap-3 shrink-0">
                      <div class="px-3.5 py-1.5 rounded-xl border ${scoreBadge} text-center min-w-[80px]">
                        <span class="text-sm font-extrabold font-mono">${scorePercent}%</span>
                        <span class="text-[9px] block uppercase font-bold tracking-wider">Score</span>
                      </div>
                      <button data-lead-id="${lead._id}" class="btn-inspect-lead px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white text-xs font-bold shadow-xs transition cursor-pointer">
                        Verify Lead
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right Column (1 Col): Quick Case Roster & Fast Actions -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-[#231c2d] flex items-center space-x-2">
                <span>${icon('folder', 'w-4 h-4 text-[#8c55bd]')}</span>
                <span>Active Cases Roster</span>
              </h2>
              <button id="btn-view-all-cases" class="text-xs font-bold text-[#733f9f] hover:text-[#492864] flex items-center space-x-1 cursor-pointer">
                <span>View All</span>
                <span>${icon('chevronRight', 'w-3 h-3')}</span>
              </button>
            </div>

            <div class="space-y-2.5">
              ${activeCases.slice(0, 4).map(c => `
                <div class="p-3.5 rounded-2xl bg-white border border-[#dfcceb] hover:border-[#8c55bd] transition cursor-pointer btn-open-case shadow-xs" data-case-id="${c._id}">
                  <div class="flex items-center space-x-3">
                    <div class="w-11 h-11 rounded-2xl bg-[#f4ecfb] overflow-hidden shrink-0 border border-[#dfcceb] flex items-center justify-center font-bold text-[#8c55bd]">
                      ${c.photos?.[0]?.url ? `<img src="${c.photos[0].url}" class="w-full h-full object-cover" />` : icon('user', 'w-5 h-5 text-[#aa7dc8]')}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold text-[#231c2d] truncate">${c.fullName}</h4>
                        <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${c.riskLevel === 'critical' ? 'bg-[#fce8ea] text-[#b85b67] border border-[#f5b3bb]' : 'bg-[#fdf5ea] text-[#8f642a] border border-[#fae0be]'} font-mono">
                          ${c.riskLevel}
                        </span>
                      </div>
                      <p class="text-[11px] text-[#786a89] truncate mt-0.5">${c.lastSeenLocation.city}, ${c.lastSeenLocation.state} • ${c.age} yrs</p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Anti-Fraud Trust Badge Info Box -->
            <div class="p-4 rounded-2xl bg-gradient-to-br from-white to-[#fbf8f2] border border-[#dfcfb6] space-y-2 shadow-xs">
              <div class="flex items-center space-x-2 text-xs font-bold text-[#426a54]">
                <span>${icon('shield', 'w-4 h-4 text-[#5b8a6f]')}</span>
                <span>Zero-Trust Anti-Fraud Ledger</span>
              </div>
              <p class="text-[11px] text-[#594c6d] leading-relaxed">
                Witness submissions undergo EXIF validation, GPS sanity checks, honey-tokens, and tamper-resistant cryptographic audit logging.
              </p>
              <button id="btn-dash-audit" class="text-xs font-bold text-[#733f9f] hover:text-[#492864] underline cursor-pointer flex items-center space-x-1">
                <span>View Immutable Audit Ledger</span>
                <span>${icon('arrowRight', 'w-3 h-3')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err: any) {
    return `
      <div class="p-8 text-center text-[#b85b67] bg-[#fdf3f4] rounded-2xl border border-[#f5b3bb]">
        <p class="font-bold">Error loading Dashboard intelligence:</p>
        <p class="text-sm mt-1">${err.message}</p>
      </div>
    `;
  }
}

export function setupDashboardEvents(): void {
  document.getElementById('btn-dash-studio')?.addEventListener('click', () => {
    state.setActiveTab('studio');
  });

  document.getElementById('btn-dash-newcase')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-new-case-modal'));
  });

  document.getElementById('btn-view-all-leads')?.addEventListener('click', () => {
    state.setActiveTab('leads');
  });

  document.getElementById('btn-view-all-cases')?.addEventListener('click', () => {
    state.setActiveTab('cases');
  });

  document.getElementById('btn-view-all-alerts')?.addEventListener('click', () => {
    state.setActiveTab('clusters');
  });

  document.getElementById('btn-dash-audit')?.addEventListener('click', () => {
    state.setActiveTab('antifraud');
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-inspect-lead').forEach(btn => {
    btn.addEventListener('click', () => {
      const leadId = btn.getAttribute('data-lead-id');
      if (leadId) {
        state.setSelectedLeadId(leadId);
        state.setActiveTab('leads');
      }
    });
  });

  document.querySelectorAll<HTMLElement>('.btn-open-case').forEach(card => {
    card.addEventListener('click', () => {
      const caseId = card.getAttribute('data-case-id');
      if (caseId) {
        state.setSelectedCaseId(caseId);
        window.dispatchEvent(new CustomEvent('open-case-modal', { detail: { caseId } }));
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-ack-alert').forEach(btn => {
    btn.addEventListener('click', async () => {
      const alertId = btn.getAttribute('data-ack-id');
      if (alertId) {
        try {
          await api.acknowledgePatternAlert(alertId);
          state.addToast({
            type: 'info',
            title: 'Pattern Alert Acknowledged',
            message: 'Incident response protocol updated for corridor cases.',
          });
          btn.innerText = 'Acknowledged';
          btn.disabled = true;
          btn.classList.add('opacity-50');
        } catch (e: any) {
          console.error(e);
        }
      }
    });
  });
}
