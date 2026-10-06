import { state } from '../state';
import { api } from '../api';

export async function renderDashboardView(): Promise<string> {
  state.setIsAIProcessing(true);
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
        <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-2xl">
          <div class="absolute -right-10 -top-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="absolute right-1/4 -bottom-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div class="max-w-2xl">
              <div class="flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-2">
                <span class="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">DECISION INTELLIGENCE ACTIVE</span>
                <span>•</span>
                <span>Real-Time Multimodal Correlator v2.4</span>
              </div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight leading-snug">
                SafeTrace Investigation &amp; Consent-Aware Reunification
              </h1>
              <p class="mt-2 text-sm text-slate-300 leading-relaxed">
                Empowering authorized investigators and families with privacy-preserving multimodal AI, cross-modal biometric correlation, anti-fraud sighting verification, and explainable decision leads.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <button id="btn-dash-studio" class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2 cursor-pointer">
                <span>⚡</span>
                <span>Run Multimodal AI</span>
              </button>
              <button id="btn-dash-newcase" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center space-x-2 cursor-pointer">
                <span>➕</span>
                <span>Register Case</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Metric KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Card 1 -->
          <div class="glass-panel p-5 rounded-xl relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Cases</span>
              <span class="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-lg">📁</span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-3xl font-bold text-white">${casesRes.total || activeCases.length}</span>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                ${criticalCases.length} Critical
              </span>
            </div>
            <p class="mt-2 text-[11px] text-slate-400">Cases under active multi-agency monitoring</p>
          </div>

          <!-- Card 2 -->
          <div class="glass-panel p-5 rounded-xl relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Explainable Leads</span>
              <span class="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-lg">🎯</span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-3xl font-bold text-white">${leadsRes.total || leads.length}</span>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Avg. 88% Match
              </span>
            </div>
            <p class="mt-2 text-[11px] text-slate-400">Requires human-in-the-loop review</p>
          </div>

          <!-- Card 3 -->
          <div class="glass-panel p-5 rounded-xl relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pattern Alerts</span>
              <span class="p-2 rounded-lg bg-amber-500/10 text-amber-400 text-lg">⚠️</span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-3xl font-bold text-white">${alerts.length}</span>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                2 Corridor Spikes
              </span>
            </div>
            <p class="mt-2 text-[11px] text-slate-400">AI-detected spatial & temporal anomalies</p>
          </div>

          <!-- Card 4 -->
          <div class="glass-panel p-5 rounded-xl relative overflow-hidden group hover:border-indigo-500/40 transition">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reunification Rooms</span>
              <span class="p-2 rounded-lg bg-purple-500/10 text-purple-400 text-lg">🤝</span>
            </div>
            <div class="mt-3 flex items-baseline justify-between">
              <span class="text-3xl font-bold text-white">${clusters.length}</span>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Zero-Knowledge
              </span>
            </div>
            <p class="mt-2 text-[11px] text-slate-400">Mutual consent verification active</p>
          </div>
        </div>

        <!-- Pattern Alerts Banner (if any) -->
        ${alerts.length > 0 ? `
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <span class="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping"></span>
                <span>Active AI Pattern &amp; Corridor Alerts (${alerts.length})</span>
              </h2>
              <button id="btn-view-all-alerts" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300">View All Clusters &rarr;</button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${alerts.map(alert => `
                <div class="p-4 rounded-xl border ${alert.severity === 'critical' ? 'bg-rose-950/30 border-rose-500/40' : 'bg-amber-950/20 border-amber-500/30'} flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-bold ${alert.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'} uppercase px-2 py-0.5 rounded bg-slate-900/80 border border-current">
                        ${alert.severity} Alert
                      </span>
                      <span class="text-[11px] text-slate-400 font-mono">${new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 class="text-sm font-bold text-white">${alert.title}</h3>
                    <p class="mt-1 text-xs text-slate-300 leading-relaxed">${alert.description}</p>
                  </div>

                  <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span class="text-slate-400"><strong class="text-slate-200">Action:</strong> ${alert.recommendedAction}</span>
                    <button data-ack-id="${alert._id}" class="btn-ack-alert px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 cursor-pointer">
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
                <h2 class="text-base font-bold text-white flex items-center space-x-2">
                  <span>🎯</span>
                  <span>High-Confidence Match Leads (Human Verification Queue)</span>
                </h2>
                <p class="text-xs text-slate-400">Explainable multimodal leads ranked by decision intelligence algorithms</p>
              </div>
              <button id="btn-view-all-leads" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300">View All Leads &rarr;</button>
            </div>

            <div class="space-y-3">
              ${leads.map(lead => {
                const caseObj = typeof lead.caseId === 'object' && lead.caseId ? lead.caseId : null;
                const scorePercent = Math.round((lead.confidenceScore || 0) * 100);
                const scoreColor = scorePercent >= 85 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : scorePercent >= 70 ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30';
                
                return `
                  <div class="glass-card-interactive p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
                    <div class="flex items-start space-x-3.5 flex-1">
                      <div class="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center font-bold text-indigo-300 text-lg">
                        ${caseObj?.photos?.[0]?.url ? `<img src="${caseObj.photos[0].url}" class="w-full h-full object-cover" />` : '👤'}
                      </div>
                      <div class="space-y-1">
                        <div class="flex items-center space-x-2">
                          <span class="text-sm font-bold text-white">${caseObj ? caseObj.fullName : 'Case Lead #' + lead._id.substring(0, 6)}</span>
                          <span class="text-[10px] px-2 py-0.5 rounded font-mono bg-slate-800 text-slate-300 border border-slate-700">${lead.matchType}</span>
                        </div>
                        <p class="text-xs text-slate-300 line-clamp-2">${lead.summary || lead.aiExplanation}</p>
                        
                        <div class="flex flex-wrap items-center gap-1.5 pt-1">
                          ${lead.breakdown?.facialScore ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">Face: ${Math.round(lead.breakdown.facialScore * 100)}%</span>` : ''}
                          ${lead.breakdown?.clothingScore ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">Clothing: ${Math.round(lead.breakdown.clothingScore * 100)}%</span>` : ''}
                          ${lead.breakdown?.locationScore ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800/60">Location: ${Math.round(lead.breakdown.locationScore * 100)}%</span>` : ''}
                          ${lead.breakdown?.voiceScore ? `<span class="text-[10px] px-1.5 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-800/60">Voice: ${Math.round(lead.breakdown.voiceScore * 100)}%</span>` : ''}
                        </div>
                      </div>
                    </div>

                    <div class="flex items-center md:flex-col justify-between w-full md:w-auto gap-3 shrink-0">
                      <div class="px-3 py-1 rounded-lg border ${scoreColor} text-center">
                        <span class="text-sm font-extrabold">${scorePercent}%</span>
                        <span class="text-[9px] block uppercase font-bold tracking-wider">Confidence</span>
                      </div>
                      <button data-lead-id="${lead._id}" class="btn-inspect-lead px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition cursor-pointer">
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
              <h2 class="text-base font-bold text-white flex items-center space-x-2">
                <span>📁</span>
                <span>Active Cases Roster</span>
              </h2>
              <button id="btn-view-all-cases" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300">View All &rarr;</button>
            </div>

            <div class="space-y-2.5">
              ${activeCases.slice(0, 4).map(c => `
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition cursor-pointer btn-open-case" data-case-id="${c._id}">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm">
                      ${c.photos?.[0]?.url ? `<img src="${c.photos[0].url}" class="w-full h-full object-cover" />` : '👤'}
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <h4 class="text-xs font-bold text-white truncate">${c.fullName}</h4>
                        <span class="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${c.riskLevel === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}">
                          ${c.riskLevel}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-400 truncate">${c.lastSeenLocation.city}, ${c.lastSeenLocation.state} • ${c.age} yrs</p>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Anti-Fraud Trust Badge Info Box -->
            <div class="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/20 space-y-2">
              <div class="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                <span>🛡️</span>
                <span>Zero-Trust Anti-Fraud Verification</span>
              </div>
              <p class="text-[11px] text-slate-300 leading-relaxed">
                All submitted witness photos and sightings are automatically subjected to EXIF consistency validation, GPS sanity checks, bot honey-tokens, and tamper-resistant audit logging.
              </p>
              <button id="btn-dash-audit" class="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer">
                View Immutable Audit Ledger &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err: any) {
    return `
      <div class="p-8 text-center text-rose-400 bg-rose-950/20 rounded-xl border border-rose-500/30">
        <p class="font-bold">Error loading Dashboard intelligence:</p>
        <p class="text-sm mt-1">${err.message}</p>
      </div>
    `;
  } finally {
    state.setIsAIProcessing(false);
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
          btn.innerText = 'Acknowledged ✓';
          btn.disabled = true;
          btn.classList.add('opacity-50');
        } catch (e: any) {
          console.error(e);
        }
      }
    });
  });
}
