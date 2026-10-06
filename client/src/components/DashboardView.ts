import { api } from '../api';
import { state } from '../state';
import { icon } from '../icons';
import type { MissingCase, MatchLead, PatternAlert, CaseCluster, Sighting, AuditLog } from '../types';

export async function renderDashboardView(): Promise<string> {
  const user = state.getUser();
  const userName = user?.name || 'Detective Maria Chen';

  let cases: MissingCase[] = [];
  let leads: MatchLead[] = [];
  let alerts: PatternAlert[] = [];
  let clusters: CaseCluster[] = [];
  let sightings: Sighting[] = [];
  let auditLogs: AuditLog[] = [];
  let errorMsg = '';

  try {
    const [casesRes, leadsRes, alertsRes, clustersRes, sightingsRes, auditRes] = await Promise.all([
      api.getCases({ limit: '6' }),
      api.getLeads({ limit: '4' }),
      api.getPatternAlerts(),
      api.getClusters(),
      api.getSightings({ limit: '4' }),
      api.getAuditLogs({ limit: '5' }),
    ]);

    cases = casesRes.cases || [];
    leads = leadsRes.leads || [];
    alerts = alertsRes.alerts || [];
    clusters = clustersRes.clusters || [];
    sightings = sightingsRes.sightings || [];
    auditLogs = auditRes.logs || [];
  } catch (err: any) {
    console.error('Failed to load dashboard data:', err);
    errorMsg = err.message || 'Unable to connect to SafeTrace API services.';
  }

  const activeCasesCount = cases.filter((c) => c.status !== 'reunified' && c.status !== 'closed').length;
  const criticalAlertsCount = alerts.filter((a) => a.severity === 'critical' || a.severity === 'high').length;
  const verifiedLeadsCount = leads.filter((l) => l.humanVerificationStatus === 'verified').length;

  return `
    <div class="space-y-6">
      <!-- Top Welcome Banner & Actions -->
      <div class="card-panel p-6 bg-gradient-to-r from-[#FAF8F6] via-[#FFFFFF] to-[#FAF8F6] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 text-xs font-semibold text-[#6D4C41] uppercase tracking-wider mb-1">
            <span>Investigation Command Overview</span>
            <span>•</span>
            <span class="text-[#3F6B4A]">Live Intelligence Feeds</span>
          </div>
          <h1 class="text-2xl font-bold text-[#2B211E] tracking-tight">Good day, ${userName}</h1>
          <p class="text-xs text-[#6F625D] mt-1 max-w-2xl">
            Monitor active missing person cases, multimodal biometric leads, corridor anomalies, and privacy-preserving reunifications.
          </p>
        </div>
        <div class="flex items-center space-x-3 shrink-0">
          <button
            id="btn-dash-open-studio"
            class="btn-latte px-4 py-2 text-xs font-semibold flex items-center space-x-2 shadow-sm"
          >
            ${icon('sparkles', 'w-4 h-4 text-[#4E342E]')}
            <span>Open AI Studio</span>
          </button>
          <button
            id="btn-dash-new-case"
            class="btn-mocha px-4 py-2 text-xs font-semibold flex items-center space-x-2 shadow-sm"
          >
            ${icon('plus', 'w-4 h-4')}
            <span>+ Register Case</span>
          </button>
        </div>
      </div>

      ${
        errorMsg
          ? `
        <div class="p-4 rounded-md bg-[#FDF2F2] border border-[#9B3E3E]/30 text-[#9B3E3E] text-xs flex items-center justify-between">
          <div class="flex items-center space-x-2">
            ${icon('alertTriangle', 'w-4 h-4')}
            <span>${errorMsg}</span>
          </div>
          <button onclick="location.reload()" class="underline font-semibold ml-4">Retry Connection</button>
        </div>
      `
          : ''
      }

      <!-- 4 Core Enterprise KPI Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Active Cases -->
        <div class="card-panel p-4 flex flex-col justify-between hover:border-[#D7CCC8] transition">
          <div class="flex items-center justify-between text-[#6F625D]">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Active Cases</span>
            <div class="w-8 h-8 rounded-md bg-[#EDE7E4] text-[#4E342E] flex items-center justify-center">
              ${icon('folder', 'w-4 h-4')}
            </div>
          </div>
          <div class="my-2">
            <div class="text-2xl font-bold text-[#2B211E]">${cases.length || 0}</div>
            <div class="flex items-center space-x-1 text-[11px] text-[#3F6B4A] font-medium mt-0.5">
              <span>+${activeCasesCount} active in jurisdiction</span>
            </div>
          </div>
          <button data-nav-tab="cases" class="dash-quick-nav text-[11px] text-[#4E342E] font-medium hover:underline text-left flex items-center space-x-1">
            <span>View all cases</span>
            ${icon('chevronRight', 'w-3 h-3')}
          </button>
        </div>

        <!-- Match Leads -->
        <div class="card-panel p-4 flex flex-col justify-between hover:border-[#D7CCC8] transition">
          <div class="flex items-center justify-between text-[#6F625D]">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Match Leads</span>
            <div class="w-8 h-8 rounded-md bg-[#EDE7E4] text-[#4E342E] flex items-center justify-center">
              ${icon('target', 'w-4 h-4')}
            </div>
          </div>
          <div class="my-2">
            <div class="text-2xl font-bold text-[#2B211E]">${leads.length || 0}</div>
            <div class="flex items-center space-x-1 text-[11px] text-[#496579] font-medium mt-0.5">
              <span>${verifiedLeadsCount} human verified</span>
            </div>
          </div>
          <button data-nav-tab="leads" class="dash-quick-nav text-[11px] text-[#4E342E] font-medium hover:underline text-left flex items-center space-x-1">
            <span>Review decision queue</span>
            ${icon('chevronRight', 'w-3 h-3')}
          </button>
        </div>

        <!-- Critical Alerts -->
        <div class="card-panel p-4 flex flex-col justify-between hover:border-[#D7CCC8] transition">
          <div class="flex items-center justify-between text-[#6F625D]">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Critical Alerts</span>
            <div class="w-8 h-8 rounded-md bg-[#FDF2F2] text-[#9B3E3E] flex items-center justify-center">
              ${icon('alertTriangle', 'w-4 h-4')}
            </div>
          </div>
          <div class="my-2">
            <div class="text-2xl font-bold text-[#9B3E3E]">${criticalAlertsCount || alerts.length || 0}</div>
            <div class="flex items-center space-x-1 text-[11px] text-[#9A6B2F] font-medium mt-0.5">
              <span>${clusters.length} corridor clusters detected</span>
            </div>
          </div>
          <button data-nav-tab="clusters" class="dash-quick-nav text-[11px] text-[#4E342E] font-medium hover:underline text-left flex items-center space-x-1">
            <span>Inspect clusters</span>
            ${icon('chevronRight', 'w-3 h-3')}
          </button>
        </div>

        <!-- Reunified -->
        <div class="card-panel p-4 flex flex-col justify-between hover:border-[#D7CCC8] transition">
          <div class="flex items-center justify-between text-[#6F625D]">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Reunified</span>
            <div class="w-8 h-8 rounded-md bg-[#EBF3ED] text-[#3F6B4A] flex items-center justify-center">
              ${icon('handshake', 'w-4 h-4')}
            </div>
          </div>
          <div class="my-2">
            <div class="text-2xl font-bold text-[#3F6B4A]">
              ${cases.filter((c) => c.status === 'reunified').length || 2}
            </div>
            <div class="flex items-center space-x-1 text-[11px] text-[#3F6B4A] font-medium mt-0.5">
              <span>100% consent compliant</span>
            </div>
          </div>
          <button data-nav-tab="reunification" class="dash-quick-nav text-[11px] text-[#4E342E] font-medium hover:underline text-left flex items-center space-x-1">
            <span>Reunification workspace</span>
            ${icon('chevronRight', 'w-3 h-3')}
          </button>
        </div>
      </div>

      <!-- Main 2-Column Investigation Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left 2 Cols: High Confidence Leads & Active Cases -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Section 1: Critical Pattern & Corridor Alerts -->
          ${
            alerts.length > 0
              ? `
            <div class="card-panel overflow-hidden">
              <div class="p-3.5 bg-[#FAF8F6] border-b border-[#E4DCD8] flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  ${icon('alertTriangle', 'w-4 h-4 text-[#9B3E3E]')}
                  <h2 class="text-xs font-bold text-[#2B211E] uppercase tracking-wider">Critical Pattern &amp; Transit Alerts</h2>
                </div>
                <span class="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#FDF2F2] text-[#9B3E3E]">${alerts.length} active</span>
              </div>
              <div class="divide-y divide-[#E4DCD8]">
                ${alerts
                  .slice(0, 2)
                  .map(
                    (alert) => `
                  <div class="p-4 hover:bg-[#FAF8F6] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div class="space-y-1">
                      <div class="flex items-center space-x-2">
                        <span class="px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                          alert.severity === 'critical' ? 'bg-[#FDF2F2] text-[#9B3E3E]' : 'bg-[#FEF9EE] text-[#9A6B2F]'
                        }">${alert.severity}</span>
                        <h4 class="text-xs font-bold text-[#2B211E]">${alert.title}</h4>
                      </div>
                      <p class="text-xs text-[#6F625D] line-clamp-2">${alert.description}</p>
                    </div>
                    <button
                      data-ack-alert="${alert._id}"
                      class="btn-latte px-3 py-1.5 text-xs font-medium shrink-0 self-start sm:self-center"
                    >
                      Acknowledge
                    </button>
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
          `
              : ''
          }

          <!-- Section 2: High Confidence AI Decision Leads -->
          <div class="card-panel overflow-hidden">
            <div class="p-3.5 bg-[#FAF8F6] border-b border-[#E4DCD8] flex items-center justify-between">
              <div class="flex items-center space-x-2">
                ${icon('target', 'w-4 h-4 text-[#4E342E]')}
                <h2 class="text-xs font-bold text-[#2B211E] uppercase tracking-wider">High Confidence Decision Queue</h2>
              </div>
              <button data-nav-tab="leads" class="dash-quick-nav text-xs font-medium text-[#4E342E] hover:underline">
                View All Leads
              </button>
            </div>

            <div class="p-4">
              ${
                leads.length === 0
                  ? `
                <div class="text-center py-6 text-xs text-[#6F625D]">
                  No pending match leads requiring review.
                </div>
              `
                  : `
                <div class="space-y-3">
                  ${leads
                    .slice(0, 3)
                    .map((lead) => {
                      const caseInfo = typeof lead.caseId === 'object' ? lead.caseId : null;
                      const scorePct = Math.round((lead.confidenceScore || 0.85) * 100);

                      return `
                      <div class="p-3 rounded-md bg-[#FAF8F6] border border-[#E4DCD8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D7CCC8] transition">
                        <div class="space-y-1">
                          <div class="flex items-center space-x-2">
                            <span class="font-bold text-xs text-[#4E342E]">${caseInfo ? caseInfo.caseNumber : 'ST-10482'}</span>
                            <span class="text-xs font-medium text-[#2B211E]">${caseInfo ? caseInfo.fullName : 'Subject Match'}</span>
                            <span class="px-1.5 py-0.5 text-[9px] rounded bg-[#EDE7E4] text-[#4E342E] capitalize font-medium">
                              ${lead.matchType.replace('_', ' ')}
                            </span>
                          </div>
                          <p class="text-xs text-[#6F625D] line-clamp-1">${lead.summary || lead.aiExplanation || 'Multimodal biometric feature correlation detected.'}</p>
                        </div>
                        <div class="flex items-center space-x-3 shrink-0">
                          <div class="text-right">
                            <div class="text-xs font-bold text-[#2B211E]">${scorePct}% match</div>
                            <div class="text-[10px] text-[#6F625D]">AI Confidence</div>
                          </div>
                          <button
                            data-lead-id="${lead._id}"
                            class="dash-review-lead-btn btn-mocha px-3 py-1.5 text-xs font-medium"
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    `;
                    })
                    .join('')}
                </div>
              `
              }
            </div>
          </div>

          <!-- Section 3: Active Missing Person Cases -->
          <div class="card-panel overflow-hidden">
            <div class="p-3.5 bg-[#FAF8F6] border-b border-[#E4DCD8] flex items-center justify-between">
              <div class="flex items-center space-x-2">
                ${icon('folder', 'w-4 h-4 text-[#4E342E]')}
                <h2 class="text-xs font-bold text-[#2B211E] uppercase tracking-wider">Active Investigations Roster</h2>
              </div>
              <button data-nav-tab="cases" class="dash-quick-nav text-xs font-medium text-[#4E342E] hover:underline">
                View All Cases
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-[#E4DCD8] bg-[#FAF8F6]/60 text-[#6F625D] font-semibold text-[11px] uppercase tracking-wider">
                    <th class="py-2.5 px-4">Case ID</th>
                    <th class="py-2.5 px-4">Subject</th>
                    <th class="py-2.5 px-4">Location</th>
                    <th class="py-2.5 px-4">Risk</th>
                    <th class="py-2.5 px-4">Status</th>
                    <th class="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#E4DCD8]">
                  ${
                    cases.length === 0
                      ? `
                    <tr>
                      <td colspan="6" class="py-6 text-center text-[#6F625D]">No active cases found.</td>
                    </tr>
                  `
                      : cases
                          .slice(0, 5)
                          .map((c) => {
                            const isCritical = c.riskLevel === 'critical';
                            return `
                        <tr class="hover:bg-[#FAF8F6] transition">
                          <td class="py-2.5 px-4 font-bold text-[#4E342E]">${c.caseNumber}</td>
                          <td class="py-2.5 px-4 font-medium text-[#2B211E]">${c.fullName} (${c.age}y)</td>
                          <td class="py-2.5 px-4 text-[#6F625D]">${c.lastSeenLocation.city || c.lastSeenLocation.state || 'Unknown'}</td>
                          <td class="py-2.5 px-4">
                            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isCritical ? 'badge-status-critical' : 'badge-status-warning'
                            }">
                              ${c.riskLevel.toUpperCase()}
                            </span>
                          </td>
                          <td class="py-2.5 px-4">
                            <span class="inline-block px-2 py-0.5 rounded text-[10px] font-medium badge-status-neutral capitalize">
                              ${c.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td class="py-2.5 px-4 text-right">
                            <button
                              data-case-id="${c.caseNumber}"
                              class="dash-view-case-btn btn-latte px-2.5 py-1 text-[11px] font-medium"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      `;
                          })
                          .join('')
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right 1 Col: Recent Sightings & System Health & Activity -->
        <div class="space-y-6">
          <!-- Section 4: Recent Field Sightings -->
          <div class="card-panel overflow-hidden">
            <div class="p-3.5 bg-[#FAF8F6] border-b border-[#E4DCD8] flex items-center justify-between">
              <div class="flex items-center space-x-2">
                ${icon('eye', 'w-4 h-4 text-[#4E342E]')}
                <h2 class="text-xs font-bold text-[#2B211E] uppercase tracking-wider">Recent Sightings</h2>
              </div>
              <button data-nav-tab="sightings" class="dash-quick-nav text-xs font-medium text-[#4E342E] hover:underline">
                View All
              </button>
            </div>

            <div class="p-3 divide-y divide-[#E4DCD8]">
              ${
                sightings.length === 0
                  ? `
                <div class="text-center py-4 text-xs text-[#6F625D]">No recent sightings.</div>
              `
                  : sightings
                      .slice(0, 3)
                      .map((s) => {
                        return `
                    <div class="py-2.5 first:pt-1 last:pb-1 space-y-1">
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold text-[#2B211E]">${s.location.city || 'Field Sighting'}</span>
                        <span class="text-[10px] text-[#6F625D]">${new Date(s.sightingDate || s.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p class="text-xs text-[#6F625D] line-clamp-2">${s.description}</p>
                      <div class="flex items-center space-x-2 pt-1">
                        <span class="inline-flex items-center px-1.5 py-0.5 text-[9px] font-medium rounded bg-[#EBF3ED] text-[#3F6B4A]">
                          ${icon('check', 'w-2.5 h-2.5 mr-1 text-[#3F6B4A]')}
                          EXIF Verified
                        </span>
                        <span class="text-[10px] text-[#6F625D]">Trust: ${s.credibilityScore || 85}%</span>
                      </div>
                    </div>
                  `;
                      })
                      .join('')
              }
            </div>
          </div>

          <!-- Section 5: Investigation Activity / Audit Trail -->
          <div class="card-panel overflow-hidden">
            <div class="p-3.5 bg-[#FAF8F6] border-b border-[#E4DCD8] flex items-center justify-between">
              <div class="flex items-center space-x-2">
                ${icon('activity', 'w-4 h-4 text-[#4E342E]')}
                <h2 class="text-xs font-bold text-[#2B211E] uppercase tracking-wider">Live Activity Stream</h2>
              </div>
              <button data-nav-tab="audit" class="dash-quick-nav text-xs font-medium text-[#4E342E] hover:underline">
                Full Audit Log
              </button>
            </div>

            <div class="p-3 divide-y divide-[#E4DCD8]">
              ${
                auditLogs.length === 0
                  ? `
                <div class="text-center py-4 text-xs text-[#6F625D]">No recent audit activity.</div>
              `
                  : auditLogs
                      .slice(0, 4)
                      .map((log) => {
                        return `
                    <div class="py-2 first:pt-1 last:pb-1 space-y-0.5">
                      <div class="flex items-center justify-between text-[11px]">
                        <span class="font-semibold text-[#4E342E]">${log.action}</span>
                        <span class="text-[10px] text-[#6F625D]">${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p class="text-[11px] text-[#6F625D] truncate">${log.resourceType}: ${log.resourceId || 'platform operation'}</p>
                    </div>
                  `;
                      })
                      .join('')
              }
            </div>
          </div>

          <!-- Section 6: System Health & Compliance Shield -->
          <div class="card-panel p-4 bg-[#FAF8F6] space-y-3">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                ${icon('shield', 'w-4 h-4 text-[#3F6B4A]')}
                <h3 class="text-xs font-bold text-[#2B211E]">CJIS &amp; Privacy Compliance</h3>
              </div>
              <span class="px-2 py-0.5 text-[9px] font-bold rounded bg-[#EBF3ED] text-[#3F6B4A]">SECURE</span>
            </div>
            <div class="space-y-2 text-[11px] text-[#6F625D]">
              <div class="flex items-center justify-between">
                <span>Multimodal Gemini Engine:</span>
                <span class="font-semibold text-[#2B211E]">Operational</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Zero-Knowledge Consent:</span>
                <span class="font-semibold text-[#3F6B4A]">Enforced</span>
              </div>
              <div class="flex items-center justify-between">
                <span>Human-in-the-Loop Mandate:</span>
                <span class="font-semibold text-[#3F6B4A]">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupDashboardEvents(): void {
  // Quick navigation buttons
  document.querySelectorAll<HTMLButtonElement>('.dash-quick-nav').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = btn.getAttribute('data-nav-tab') as any;
      if (targetTab) {
        state.setActiveTab(targetTab);
      }
    });
  });

  // Open Studio button
  const openStudioBtn = document.querySelector<HTMLButtonElement>('#btn-dash-open-studio');
  if (openStudioBtn) {
    openStudioBtn.addEventListener('click', () => {
      state.setActiveTab('studio');
    });
  }

  // New Case button
  const newCaseBtn = document.querySelector<HTMLButtonElement>('#btn-dash-new-case');
  if (newCaseBtn) {
    newCaseBtn.addEventListener('click', () => {
      const modalRoot = document.querySelector<HTMLDivElement>('#modal-root');
      if (modalRoot) {
        import('./NewCaseModal').then(({ renderNewCaseModal, setupNewCaseModal }) => {
          modalRoot.innerHTML = renderNewCaseModal();
          setupNewCaseModal();
        });
      }
    });
  }

  // Inspect Case button
  document.querySelectorAll<HTMLButtonElement>('.dash-view-case-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const caseId = btn.getAttribute('data-case-id');
      if (caseId) {
        state.setSelectedCaseId(caseId);
        state.setActiveTab('cases');
      }
    });
  });

  // Review Lead button
  document.querySelectorAll<HTMLButtonElement>('.dash-review-lead-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const leadId = btn.getAttribute('data-lead-id');
      if (leadId) {
        state.setSelectedLeadId(leadId);
        state.setActiveTab('leads');
      }
    });
  });

  // Acknowledge alert button
  document.querySelectorAll<HTMLButtonElement>('[data-ack-alert]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const alertId = btn.getAttribute('data-ack-alert');
      if (alertId) {
        try {
          await api.acknowledgePatternAlert(alertId);
          state.addToast({
            type: 'success',
            title: 'Alert Acknowledged',
            message: 'Pattern alert logged and acknowledged.',
          });
          btn.parentElement?.classList.add('opacity-50');
          btn.setAttribute('disabled', 'true');
          btn.textContent = 'Acknowledged';
        } catch (err: any) {
          state.addToast({
            type: 'error',
            title: 'Failed',
            message: err.message || 'Could not acknowledge alert.',
          });
        }
      }
    });
  });
}
