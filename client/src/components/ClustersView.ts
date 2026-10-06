import { api } from '../api';
import { state } from '../state';
import { icon } from '../icons';
import type { CaseCluster, PatternAlert } from '../types';

export async function renderClustersView(): Promise<string> {
  let clusters: CaseCluster[] = [];
  let alerts: PatternAlert[] = [];
  let errorMsg = '';

  try {
    const [clustersRes, alertsRes] = await Promise.all([
      api.getClusters(),
      api.getPatternAlerts(),
    ]);
    clusters = clustersRes.clusters || [];
    alerts = alertsRes.alerts || [];
  } catch (err: any) {
    console.error('Failed to load clusters:', err);
    errorMsg = err.message || 'Failed to load cluster intelligence data.';
  }

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-[#2B211E] tracking-tight">Case Clusters &amp; Pattern Intelligence</h1>
          <p class="text-xs text-[#6F625D] mt-1">AI-detected geographic corridors, temporal spikes, and demographic anomalies across active dossiers.</p>
        </div>
      </div>

      ${errorMsg ? `
        <div class="p-4 rounded-md bg-[#FDF2F2] border border-[#9B3E3E]/30 text-[#9B3E3E] text-xs flex items-center justify-between">
          <span>${errorMsg}</span>
          <button onclick="location.reload()" class="underline font-semibold ml-4">Retry</button>
        </div>
      ` : ''}

      <!-- Pattern Alerts Banner -->
      ${alerts.length > 0 ? `
        <div class="card-panel overflow-hidden">
          <div class="p-3.5 bg-[#FAF8F6] border-b border-[#E4DCD8] flex items-center justify-between">
            <div class="flex items-center space-x-2">
              ${icon('alertTriangle', 'w-4 h-4 text-[#9B3E3E]')}
              <h2 class="text-xs font-bold text-[#2B211E] uppercase tracking-wider">Active Pattern Alerts</h2>
            </div>
            <span class="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#FDF2F2] text-[#9B3E3E]">${alerts.length} alerts</span>
          </div>
          <div class="divide-y divide-[#E4DCD8]">
            ${alerts.map(a => `
              <div class="p-4 hover:bg-[#FAF8F6] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1 flex-1">
                  <div class="flex items-center space-x-2">
                    <span class="px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                      a.severity === 'critical' ? 'bg-[#FDF2F2] text-[#9B3E3E]' :
                      a.severity === 'high' ? 'bg-[#FEF9EE] text-[#9A6B2F]' :
                      'bg-[#EDE7E4] text-[#4E342E]'
                    }">${a.severity}</span>
                    <span class="px-2 py-0.5 text-[9px] font-medium rounded bg-[#EDE7E4] text-[#4E342E] capitalize">${a.category.replace(/_/g, ' ')}</span>
                    <h4 class="text-xs font-bold text-[#2B211E]">${a.title}</h4>
                  </div>
                  <p class="text-xs text-[#6F625D] line-clamp-2">${a.description}</p>
                  <p class="text-[10px] text-[#496579] font-medium">${a.recommendedAction}</p>
                </div>
                <button data-ack-alert="${a._id}" class="btn-latte px-3 py-1.5 text-xs font-medium shrink-0">
                  Acknowledge
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Cluster Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${clusters.length === 0 ? `
          <div class="md:col-span-2 card-panel p-12 text-center space-y-3">
            <div class="w-12 h-12 rounded-full bg-[#EDE7E4] text-[#4E342E] flex items-center justify-center mx-auto">
              ${icon('network', 'w-6 h-6')}
            </div>
            <h3 class="text-sm font-bold text-[#2B211E]">No case clusters detected</h3>
            <p class="text-xs text-[#6F625D]">Clusters are automatically identified when geographic or temporal patterns emerge across cases.</p>
          </div>
        ` : clusters.map(cl => {
          const severity = cl.riskAssessment || 'moderate';
          return `
            <div class="card-panel p-5 space-y-3 hover:border-[#D7CCC8] transition">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  ${icon('network', 'w-4 h-4 text-[#4E342E]')}
                  <h3 class="text-sm font-bold text-[#2B211E]">${cl.clusterName}</h3>
                </div>
                <span class="px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                  severity === 'critical' ? 'badge-status-critical' :
                  severity === 'elevated' ? 'badge-status-warning' :
                  'badge-status-neutral'
                }">${severity}</span>
              </div>
              <p class="text-xs text-[#6F625D]">${cl.description || cl.patternSummary}</p>
              <div class="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-[#E4DCD8]">
                <div>
                  <span class="text-[#6F625D] block text-[10px]">Type</span>
                  <span class="font-semibold text-[#2B211E] capitalize">${cl.clusterType.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span class="text-[#6F625D] block text-[10px]">Linked Cases</span>
                  <span class="font-semibold text-[#2B211E]">${cl.caseIds?.length || 0}</span>
                </div>
                <div>
                  <span class="text-[#6F625D] block text-[10px]">AI Confidence</span>
                  <span class="font-semibold text-[#2B211E]">${Math.round((cl.aiConfidence || 0.82) * 100)}%</span>
                </div>
              </div>
              <div class="flex justify-end pt-1">
                <button data-cluster-id="${cl._id}" class="btn-latte px-3 py-1.5 text-xs font-medium">
                  View Cluster Detail
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

export function setupClustersEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('[data-ack-alert]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const alertId = btn.getAttribute('data-ack-alert');
      if (alertId) {
        try {
          await api.acknowledgePatternAlert(alertId);
          state.addToast({ type: 'success', title: 'Alert Acknowledged', message: 'Pattern alert recorded in audit trail.' });
          btn.textContent = 'Acknowledged';
          btn.setAttribute('disabled', 'true');
          btn.classList.add('opacity-50');
        } catch (err: any) {
          state.addToast({ type: 'error', title: 'Error', message: err.message || 'Could not acknowledge alert.' });
        }
      }
    });
  });
}
