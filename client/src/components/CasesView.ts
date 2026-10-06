import { api } from '../api';
import { state } from '../state';
import { icon } from '../icons';
import type { MissingCase } from '../types';

export async function renderCasesView(): Promise<string> {
  let cases: MissingCase[] = [];
  let errorMsg = '';

  try {
    const res = await api.getCases();
    cases = res.cases || [];
  } catch (err: any) {
    console.error('Failed to load cases:', err);
    errorMsg = err.message || 'Failed to retrieve cases from backend.';
  }

  const searchQuery = state.getSearchQuery().toLowerCase();
  if (searchQuery) {
    cases = cases.filter(
      (c) =>
        c.caseNumber.toLowerCase().includes(searchQuery) ||
        c.fullName.toLowerCase().includes(searchQuery) ||
        c.lastSeenLocation.city.toLowerCase().includes(searchQuery) ||
        c.lastSeenLocation.state.toLowerCase().includes(searchQuery)
    );
  }

  return `
    <div class="space-y-6">
      <!-- Top Action Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-[#2B211E] tracking-tight">Case Management</h1>
          <p class="text-xs text-[#6F625D] mt-1">Manage, investigate, and review active missing-person dossiers with multimodal forensic correlation.</p>
        </div>
        <div class="flex items-center space-x-3">
          <button
            id="btn-new-case-action"
            class="btn-mocha flex items-center justify-center space-x-2 px-4 py-2 text-xs font-semibold shadow-sm"
          >
            ${icon('plus', 'w-4 h-4')}
            <span>+ New Case</span>
          </button>
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

      <!-- Table Toolbar & Filters -->
      <div class="card-panel overflow-hidden">
        <div class="p-4 border-b border-[#E4DCD8] bg-[#FAF8F6] flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-[#2B211E]">Investigation Records</span>
            <span class="px-2 py-0.5 text-[10px] rounded-full bg-[#EDE7E4] text-[#4E342E] font-medium">${cases.length} cases</span>
          </div>

          <!-- Filters Row -->
          <div class="flex flex-wrap items-center gap-2 text-xs">
            <select id="case-status-filter" class="input-mocha py-1.5 px-2.5 text-xs text-[#2B211E]">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="sighting_pending">Sighting Pending</option>
              <option value="verified_lead">Verified Lead</option>
              <option value="reunification_in_progress">Reunification in Progress</option>
              <option value="reunified">Reunified</option>
              <option value="closed">Closed</option>
            </select>

            <select id="case-risk-filter" class="input-mocha py-1.5 px-2.5 text-xs text-[#2B211E]">
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select id="case-sort-filter" class="input-mocha py-1.5 px-2.5 text-xs text-[#2B211E]">
              <option value="recent">Sort: Most Recent</option>
              <option value="risk">Sort: Highest Risk</option>
              <option value="age">Sort: Age</option>
            </select>
          </div>
        </div>

        ${
          cases.length === 0
            ? `
          <div class="p-12 text-center">
            <div class="w-12 h-12 rounded-full bg-[#EDE7E4] text-[#4E342E] flex items-center justify-center mx-auto mb-3">
              ${icon('folder', 'w-6 h-6')}
            </div>
            <h3 class="text-sm font-semibold text-[#2B211E]">No cases match your filters</h3>
            <p class="text-xs text-[#6F625D] mt-1">Try clearing search filters or create a new case dossier.</p>
          </div>
        `
            : `
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[#E4DCD8] bg-[#FAF8F6]/60 text-[#6F625D] font-semibold text-[11px] uppercase tracking-wider">
                  <th class="py-3 px-4">Case ID</th>
                  <th class="py-3 px-4">Subject</th>
                  <th class="py-3 px-4">Age / Gender</th>
                  <th class="py-3 px-4">Last Seen Location</th>
                  <th class="py-3 px-4">Risk Level</th>
                  <th class="py-3 px-4">Status</th>
                  <th class="py-3 px-4">Investigator</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E4DCD8]" id="cases-table-body">
                ${cases
                  .map((c) => {
                    const isCritical = c.riskLevel === 'critical';
                    const isHigh = c.riskLevel === 'high';
                    const isReunified = c.status === 'reunified';
                    const investigatorName = typeof c.assignedInvestigator === 'object' ? (c.assignedInvestigator as any)?.name || 'Detective Maria Chen' : 'Detective Maria Chen';

                    return `
                    <tr class="hover:bg-[#FAF8F6] transition">
                      <td class="py-3.5 px-4 whitespace-nowrap">
                        <span class="font-bold text-[#4E342E]">${c.caseNumber}</span>
                      </td>
                      <td class="py-3.5 px-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2.5">
                          <div class="w-8 h-8 rounded-md bg-[#EDE7E4] text-[#4E342E] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-[#E4DCD8]">
                            ${c.fullName.charAt(0)}
                          </div>
                          <div>
                            <div class="font-semibold text-[#2B211E]">${c.fullName}</div>
                            <div class="text-[10px] text-[#6F625D]">Reported ${new Date(c.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td class="py-3.5 px-4 whitespace-nowrap text-[#6F625D]">
                        ${c.age} yrs · <span class="capitalize">${c.gender}</span>
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="font-medium text-[#2B211E] truncate max-w-[160px]">${c.lastSeenLocation.city}, ${c.lastSeenLocation.state}</div>
                        <div class="text-[10px] text-[#6F625D] truncate max-w-[160px]">${c.lastSeenLocation.address}</div>
                      </td>
                      <td class="py-3.5 px-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isCritical
                            ? 'badge-status-critical'
                            : isHigh
                            ? 'badge-status-warning'
                            : 'badge-status-neutral'
                        }">
                          ${c.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          isReunified ? 'badge-status-active' : 'badge-status-neutral'
                        } capitalize">
                          ${c.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 whitespace-nowrap text-[#6F625D]">
                        ${investigatorName}
                      </td>
                      <td class="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          data-view-case="${c.caseNumber}"
                          class="btn-latte px-2.5 py-1 text-[11px] font-semibold"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        `
        }
      </div>
    </div>
  `;
}

export function setupCasesEvents(): void {
  // New Case modal trigger
  const newCaseBtn = document.querySelector<HTMLButtonElement>('#btn-new-case-action');
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

  // View Dossier modal trigger
  document.querySelectorAll<HTMLButtonElement>('[data-view-case]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const caseId = btn.getAttribute('data-view-case');
      if (caseId) {
        const modalRoot = document.querySelector<HTMLDivElement>('#modal-root');
        if (modalRoot) {
          import('./CaseDetailModal').then(({ renderCaseDetailModal, setupCaseModal }) => {
            modalRoot.innerHTML = renderCaseDetailModal(caseId);
            setupCaseModal(caseId);
          });
        }
      }
    });
  });
}
