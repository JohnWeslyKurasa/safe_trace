import { state } from '../state';
import { api } from '../api';
import type { CaseCluster, PatternAlert } from '../types';

export async function renderClustersView(): Promise<string> {
  state.setIsAIProcessing(true);
  try {
    const [clustersRes, alertsRes] = await Promise.all([
      api.getClusters().catch(() => ({ clusters: [] })),
      api.getPatternAlerts().catch(() => ({ alerts: [] })),
    ]);

    const clusters: CaseCluster[] = clustersRes.clusters || [];
    const alerts: PatternAlert[] = alertsRes.alerts || [];

    return `
      <div class="space-y-6">
        <!-- Clusters Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 text-xs font-semibold text-purple-400 mb-1">
              <span class="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">PATTERN RECOGNITION ENGINE</span>
              <span>•</span>
              <span>Corridor Correlation • Anomaly Detection</span>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>🧬</span>
              <span>Similar-Case Clusters &amp; Pattern Alerts</span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              Automated spatial, temporal, and modus-operandi clustering across jurisdictional boundaries to detect systemic patterns.
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <span class="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              Active Clusters: <strong class="text-purple-400 font-mono">${clusters.length}</strong>
            </span>
          </div>
        </div>

        <!-- Pattern Alerts Section -->
        <div class="space-y-3">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <span class="text-amber-400">⚠️</span>
            <span>Priority Investigation Pattern Alerts</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${alerts.map(alert => {
              const severityColor = {
                critical: 'border-rose-500/50 bg-rose-950/30 text-rose-300',
                high: 'border-orange-500/50 bg-orange-950/30 text-orange-300',
                medium: 'border-amber-500/50 bg-amber-950/30 text-amber-300',
                info: 'border-blue-500/50 bg-blue-950/30 text-blue-300',
              }[alert.severity] || 'border-slate-700 bg-slate-900 text-slate-300';

              return `
                <div class="glass-panel p-4 rounded-xl border ${severityColor} flex flex-col justify-between space-y-3">
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-950/90 border border-current">
                        ${alert.severity}
                      </span>
                      <span class="text-[10px] text-slate-400 font-mono">${new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 class="text-sm font-bold text-white">${alert.title}</h3>
                    <p class="mt-1 text-xs text-slate-300 leading-relaxed">${alert.description}</p>
                  </div>

                  <div class="pt-2 border-t border-slate-800/80 text-xs">
                    <p class="text-slate-400 text-[11px]"><strong class="text-slate-200">Recommended Action:</strong> ${alert.recommendedAction}</p>
                    <button data-ack-id="${alert._id}" class="btn-ack-alert mt-3 w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer">
                      Acknowledge Alert
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Clusters Grid -->
        <div class="space-y-3">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
            <span>🧬</span>
            <span>AI-Detected Cross-Case Clusters</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${clusters.map(cluster => {
              const riskBadge = {
                critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                elevated: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                moderate: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
              }[cluster.riskAssessment] || 'bg-slate-800 text-slate-300';

              return `
                <div class="glass-panel p-5 rounded-xl border border-slate-800 space-y-4 hover:border-purple-500/40 transition">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center space-x-2">
                        <h3 class="text-base font-bold text-white">${cluster.clusterName}</h3>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">${cluster.clusterType.replace(/_/g, ' ')}</span>
                      </div>
                      <p class="text-xs text-slate-400 mt-1">${cluster.description}</p>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${riskBadge}">
                      ${cluster.riskAssessment}
                    </span>
                  </div>

                  <!-- AI Pattern Rationale -->
                  <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span class="font-bold text-purple-300 flex items-center space-x-1">
                      <span>💡</span>
                      <span>Cluster Correlation Rationale (${Math.round((cluster.aiConfidence || 0.85) * 100)}% AI Confidence)</span>
                    </span>
                    <p class="text-[11px] leading-relaxed">${cluster.patternSummary}</p>
                  </div>

                  <!-- Connected Cases Pills -->
                  <div>
                    <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Connected Cases (${cluster.caseIds?.length || 0}):</span>
                    <div class="flex flex-wrap gap-2">
                      ${(cluster.caseIds || []).map((c: any) => `
                        <button
                          data-case-id="${c._id || c}"
                          class="btn-cluster-case-link px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-900/50 border border-slate-700 hover:border-indigo-500/40 text-xs font-medium text-slate-200 transition cursor-pointer flex items-center space-x-1.5"
                        >
                          <span>👤</span>
                          <span>${c.fullName || 'Case ' + (c._id || c).substring(0, 6)}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Footer Action -->
                  <div class="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span class="text-slate-400">Radius: <strong class="text-slate-200">${cluster.centerLocation?.radiusKm || 50} km corridor</strong></span>
                    <button class="btn-visualize-cluster px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-semibold cursor-pointer">
                      View on Geospatial Map &rarr;
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  } catch (err: any) {
    return `<div class="p-8 text-center text-rose-400">Error: ${err.message}</div>`;
  } finally {
    state.setIsAIProcessing(false);
  }
}

export function setupClustersEvents(): void {
  // Acknowledge alert button
  document.querySelectorAll<HTMLButtonElement>('.btn-ack-alert').forEach(btn => {
    btn.addEventListener('click', async () => {
      const alertId = btn.getAttribute('data-ack-id');
      if (alertId) {
        try {
          await api.acknowledgePatternAlert(alertId);
          state.addToast({
            type: 'info',
            title: 'Alert Acknowledged',
            message: 'Investigation units briefed on pattern anomaly.',
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

  // Open case from cluster
  document.querySelectorAll<HTMLButtonElement>('.btn-cluster-case-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const caseId = btn.getAttribute('data-case-id');
      if (caseId) {
        state.setSelectedCaseId(caseId);
        window.dispatchEvent(new CustomEvent('open-case-modal', { detail: { caseId } }));
      }
    });
  });

  // Visualize on map
  document.querySelectorAll<HTMLButtonElement>('.btn-visualize-cluster').forEach(btn => {
    btn.addEventListener('click', () => {
      state.setActiveTab('map');
    });
  });
}
