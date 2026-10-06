import { state } from '../state';
import { api } from '../api';
import type { CaseCluster, PatternAlert } from '../types';
import { icon } from '../icons';

export async function renderClustersView(): Promise<string> {
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
            <div class="flex items-center space-x-2 text-xs font-bold text-[#733f9f] mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-[#f4ecfb] border border-[#dfcceb] tracking-wider text-[10px] uppercase font-bold">
                Pattern Recognition Engine
              </span>
              <span class="text-[#c5a4db]">•</span>
              <span class="text-[#786a89]">Corridor Correlation • Anomaly Detection</span>
            </div>
            <h1 class="text-2xl font-bold text-[#231c2d] tracking-tight flex items-center space-x-2">
              <span>${icon('dna', 'w-6 h-6 text-[#8c55bd]')}</span>
              <span>Similar-Case Clusters &amp; Pattern Alerts</span>
            </h1>
            <p class="text-xs text-[#786a89] mt-1">
              Automated spatial, temporal, and modus-operandi clustering across jurisdictional boundaries to detect systemic patterns.
            </p>
          </div>

          <div class="flex items-center space-x-2">
            <span class="px-3.5 py-1.5 rounded-xl bg-white border border-[#dfcceb] text-xs text-[#3c2355] font-semibold shadow-xs">
              Active Clusters: <strong class="text-[#8c55bd] font-mono font-bold">${clusters.length}</strong>
            </span>
          </div>
        </div>

        <!-- Pattern Alerts Section -->
        <div class="space-y-3">
          <h2 class="text-xs font-bold text-[#786a89] uppercase tracking-wider flex items-center space-x-2">
            <span>${icon('alertTriangle', 'w-4 h-4 text-[#b88640]')}</span>
            <span>Priority Investigation Pattern Alerts</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${alerts.map(alert => {
              const severityColor = {
                critical: 'border-[#f5b3bb] bg-[#fdf3f4] text-[#b85b67]',
                high: 'border-[#fae0be] bg-[#fdf9f2] text-[#8f642a]',
                medium: 'border-[#dfcfb6] bg-[#fbf8f2] text-[#6f5f48]',
                info: 'border-[#dfcceb] bg-[#f4ecfb] text-[#5c3280]',
              }[alert.severity] || 'border-[#dfcceb] bg-white text-[#231c2d]';

              return `
                <div class="glass-panel p-5 rounded-2xl border ${severityColor} flex flex-col justify-between space-y-3 shadow-xs">
                  <div>
                    <div class="flex items-center justify-between mb-1.5">
                      <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/90 border border-current font-mono">
                        ${alert.severity}
                      </span>
                      <span class="text-[10px] text-[#786a89] font-mono">${new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 class="text-sm font-bold text-[#231c2d]">${alert.title}</h3>
                    <p class="mt-1 text-xs text-[#594c6d] leading-relaxed">${alert.description}</p>
                  </div>

                  <div class="pt-2 border-t border-black/5 text-xs">
                    <p class="text-[#786a89] text-[11px]"><strong class="text-[#231c2d]">Recommended Action:</strong> ${alert.recommendedAction}</p>
                    <button data-ack-id="${alert._id}" class="btn-ack-alert mt-3 w-full py-1.5 rounded-xl bg-white hover:bg-[#f6f0e4] text-[#3c2355] text-xs font-bold border border-[#dfcfb6] transition cursor-pointer shadow-xs">
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
          <h2 class="text-xs font-bold text-[#786a89] uppercase tracking-wider flex items-center space-x-2">
            <span>${icon('dna', 'w-4 h-4 text-[#8c55bd]')}</span>
            <span>AI-Detected Cross-Case Clusters</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            ${clusters.map(cluster => {
              const riskBadge = {
                critical: 'bg-[#fce8ea] text-[#b85b67] border-[#f5b3bb]',
                elevated: 'bg-[#fdf5ea] text-[#8f642a] border-[#fae0be]',
                moderate: 'bg-[#f6f0e4] text-[#6f5f48] border-[#dfcfb6]',
                low: 'bg-[#edf7f1] text-[#385c47] border-[#b8e2c8]',
              }[cluster.riskAssessment] || 'bg-[#f6f0e4] text-[#786a89]';

              return `
                <div class="glass-panel p-5 rounded-2xl space-y-4 hover:border-[#8c55bd]/40 transition shadow-xs">
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center space-x-2">
                        <h3 class="text-base font-bold text-[#231c2d]">${cluster.clusterName}</h3>
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f4ecfb] text-[#733f9f] border border-[#dfcceb]">${cluster.clusterType.replace(/_/g, ' ')}</span>
                      </div>
                      <p class="text-xs text-[#786a89] mt-1">${cluster.description}</p>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${riskBadge}">
                      ${cluster.riskAssessment}
                    </span>
                  </div>

                  <!-- AI Pattern Rationale -->
                  <div class="p-3.5 rounded-xl bg-[#fbf8f2] border border-[#dfcfb6] text-xs space-y-1">
                    <span class="font-bold text-[#5c3280] flex items-center space-x-1.5">
                      <span>${icon('brain', 'w-3.5 h-3.5 text-[#8c55bd]')}</span>
                      <span>Cluster Correlation Rationale (${Math.round((cluster.aiConfidence || 0.85) * 100)}% AI Confidence)</span>
                    </span>
                    <p class="text-[11px] leading-relaxed text-[#594c6d]">${cluster.patternSummary}</p>
                  </div>

                  <!-- Connected Cases Pills -->
                  <div>
                    <span class="text-[11px] font-bold text-[#786a89] uppercase tracking-wider block mb-2">Connected Cases (${cluster.caseIds?.length || 0}):</span>
                    <div class="flex flex-wrap gap-2">
                      ${(cluster.caseIds || []).map((c: any) => `
                        <button
                          data-case-id="${c._id || c}"
                          class="btn-cluster-case-link px-3 py-1 rounded-xl bg-white hover:bg-[#f4ecfb] border border-[#dfcfb6] hover:border-[#8c55bd] text-xs font-semibold text-[#3c2355] transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
                        >
                          <span>${icon('user', 'w-3 h-3 text-[#8c55bd]')}</span>
                          <span>${c.fullName || 'Case ' + (c._id || c).substring(0, 6)}</span>
                        </button>
                      `).join('')}
                    </div>
                  </div>

                  <!-- Footer Action -->
                  <div class="pt-3 border-t border-black/5 flex items-center justify-between text-xs">
                    <span class="text-[#786a89]">Corridor Radius: <strong class="text-[#231c2d]">${cluster.centerLocation?.radiusKm || 50} km</strong></span>
                    <button class="btn-visualize-cluster px-3.5 py-1.5 rounded-xl bg-[#f4ecfb] hover:bg-[#ebdff5] border border-[#dfcceb] text-[#5c3280] font-bold cursor-pointer flex items-center space-x-1 shadow-xs transition">
                      <span>View on Radar Map</span>
                      <span>${icon('chevronRight', 'w-3 h-3')}</span>
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
    return `<div class="p-8 text-center text-[#b85b67]">Error: ${err.message}</div>`;
  }
}

export function setupClustersEvents(): void {
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
          btn.innerText = 'Acknowledged';
          btn.disabled = true;
          btn.classList.add('opacity-50');
        } catch (e: any) {
          console.error(e);
        }
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-cluster-case-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const caseId = btn.getAttribute('data-case-id');
      if (caseId) {
        state.setSelectedCaseId(caseId);
        window.dispatchEvent(new CustomEvent('open-case-modal', { detail: { caseId } }));
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-visualize-cluster').forEach(btn => {
    btn.addEventListener('click', () => {
      state.setActiveTab('map');
    });
  });
}
