import { api } from '../api';
import { state } from '../state';
import { icon } from '../icons';
import type { Sighting, MissingCase } from '../types';

export async function renderSightingsView(): Promise<string> {
  let sightings: Sighting[] = [];
  let cases: MissingCase[] = [];
  let errorMsg = '';

  try {
    const [sightingsRes, casesRes] = await Promise.all([
      api.getSightings(),
      api.getCases(),
    ]);
    sightings = sightingsRes.sightings || [];
    cases = casesRes.cases || [];
  } catch (err: any) {
    console.error('Failed to load sightings:', err);
    errorMsg = err.message || 'Failed to load sightings from server.';
  }

  const searchQuery = state.getSearchQuery().toLowerCase();
  if (searchQuery) {
    sightings = sightings.filter(
      (s) =>
        s.description.toLowerCase().includes(searchQuery) ||
        s.location.city.toLowerCase().includes(searchQuery) ||
        s.location.address.toLowerCase().includes(searchQuery)
    );
  }

  return `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-[#2B211E] tracking-tight">Sightings Intelligence</h1>
          <p class="text-xs text-[#6F625D] mt-1">Review community and field sighting submissions with automated EXIF, GPS, and anti-fraud verification.</p>
        </div>
        <button
          id="btn-report-sighting-action"
          class="btn-mocha flex items-center justify-center space-x-2 px-4 py-2 text-xs font-semibold shadow-sm"
        >
          ${icon('plus', 'w-4 h-4')}
          <span>Report Sighting</span>
        </button>
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

      <!-- Metric Summary Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="card-panel p-4">
          <div class="flex items-center justify-between text-[#6F625D] mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Total Submissions</span>
            ${icon('eye', 'w-4 h-4 text-[#4E342E]')}
          </div>
          <div class="text-2xl font-bold text-[#2B211E]">${sightings.length}</div>
          <p class="text-[10px] text-[#6F625D] mt-1">All registered field reports</p>
        </div>

        <div class="card-panel p-4">
          <div class="flex items-center justify-between text-[#6F625D] mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Verified Authentic</span>
            ${icon('check', 'w-4 h-4 text-[#3F6B4A]')}
          </div>
          <div class="text-2xl font-bold text-[#3F6B4A]">
            ${sightings.filter((s) => s.antiFraudStatus === 'verified' || s.antiFraudStatus === 'passed').length}
          </div>
          <p class="text-[10px] text-[#6F625D] mt-1">GPS &amp; EXIF match</p>
        </div>

        <div class="card-panel p-4">
          <div class="flex items-center justify-between text-[#6F625D] mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Suspicious / Flagged</span>
            ${icon('alertTriangle', 'w-4 h-4 text-[#9A6B2F]')}
          </div>
          <div class="text-2xl font-bold text-[#9A6B2F]">
            ${sightings.filter((s) => s.antiFraudStatus === 'suspicious' || s.antiFraudStatus === 'flagged_bot').length}
          </div>
          <p class="text-[10px] text-[#6F625D] mt-1">Review required</p>
        </div>

        <div class="card-panel p-4">
          <div class="flex items-center justify-between text-[#6F625D] mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Average Credibility</span>
            ${icon('shield', 'w-4 h-4 text-[#496579]')}
          </div>
          <div class="text-2xl font-bold text-[#496579]">
            ${sightings.length > 0 ? Math.round(sightings.reduce((acc, s) => acc + (s.credibilityScore || 80), 0) / sightings.length) : 0}%
          </div>
          <p class="text-[10px] text-[#6F625D] mt-1">Trust weighted scoring</p>
        </div>
      </div>

      <!-- Sightings List & Filters -->
      <div class="card-panel overflow-hidden">
        <div class="p-4 border-b border-[#E4DCD8] bg-[#FAF8F6] flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-[#2B211E]">Sighting Log</span>
            <span class="px-2 py-0.5 text-[10px] rounded-full bg-[#EDE7E4] text-[#4E342E] font-medium">${sightings.length} records</span>
          </div>
          <div class="flex items-center space-x-2">
            <select id="sighting-status-filter" class="input-mocha py-1 px-2.5 text-xs text-[#2B211E]">
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="correlated">Correlated</option>
            </select>
          </div>
        </div>

        ${
          sightings.length === 0
            ? `
          <div class="p-12 text-center">
            <div class="w-12 h-12 rounded-full bg-[#EDE7E4] text-[#4E342E] flex items-center justify-center mx-auto mb-3">
              ${icon('eye', 'w-6 h-6')}
            </div>
            <h3 class="text-sm font-semibold text-[#2B211E]">No sightings found</h3>
            <p class="text-xs text-[#6F625D] mt-1">Submit a new sighting report using the button above.</p>
          </div>
        `
            : `
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[#E4DCD8] bg-[#FAF8F6]/60 text-[#6F625D] font-semibold text-[11px] uppercase tracking-wider">
                  <th class="py-3 px-4">Date / Time</th>
                  <th class="py-3 px-4">Associated Case</th>
                  <th class="py-3 px-4">Location</th>
                  <th class="py-3 px-4">Description</th>
                  <th class="py-3 px-4">Integrity Status</th>
                  <th class="py-3 px-4">Credibility</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E4DCD8]">
                ${sightings
                  .map((s) => {
                    const matchedCase = cases.find((c) => c.caseNumber === (typeof s.caseId === 'string' ? s.caseId : (s.caseId as any)?.caseNumber));
                    const isSuspicious = s.antiFraudStatus === 'suspicious' || s.antiFraudStatus === 'flagged_bot';

                    return `
                    <tr class="hover:bg-[#FAF8F6] transition">
                      <td class="py-3.5 px-4 whitespace-nowrap">
                        <div class="font-medium text-[#2B211E]">${new Date(s.sightingDate || s.createdAt).toLocaleDateString()}</div>
                        <div class="text-[10px] text-[#6F625D]">${new Date(s.sightingDate || s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td class="py-3.5 px-4 whitespace-nowrap">
                        ${
                          matchedCase
                            ? `
                          <button data-case-id="${matchedCase.caseNumber}" class="view-case-link text-left hover:underline">
                            <span class="font-semibold text-[#4E342E]">${matchedCase.caseNumber}</span>
                            <div class="text-[11px] text-[#6F625D]">${matchedCase.fullName}</div>
                          </button>
                        `
                            : `<span class="text-[#6F625D] italic">Unassigned field lead</span>`
                        }
                      </td>
                      <td class="py-3.5 px-4">
                        <div class="font-medium text-[#2B211E] truncate max-w-[160px]">${s.location.city || s.location.address || 'Unknown'}</div>
                        <div class="text-[10px] text-[#6F625D] truncate max-w-[160px]">${s.location.address || ''}</div>
                      </td>
                      <td class="py-3.5 px-4">
                        <p class="text-[#2B211E] line-clamp-2 max-w-xs">${s.description || 'No description provided.'}</p>
                      </td>
                      <td class="py-3.5 px-4 whitespace-nowrap">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                          isSuspicious ? 'badge-status-warning' : 'badge-status-active'
                        }">
                          ${isSuspicious ? icon('alertTriangle', 'w-3 h-3 mr-1 text-[#9A6B2F]') : icon('check', 'w-3 h-3 mr-1 text-[#3F6B4A]')}
                          ${s.antiFraudStatus || 'Verified'}
                        </span>
                      </td>
                      <td class="py-3.5 px-4 whitespace-nowrap">
                        <div class="flex items-center space-x-2">
                          <div class="w-12 h-1.5 rounded-full bg-[#EDE7E4] overflow-hidden">
                            <div class="h-full rounded-full bg-[#4E342E]" style="width: ${s.credibilityScore || 85}%"></div>
                          </div>
                          <span class="font-semibold text-[#2B211E]">${s.credibilityScore || 85}%</span>
                        </div>
                      </td>
                      <td class="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          data-sighting-id="${s._id}"
                          class="btn-latte px-2.5 py-1 text-[11px] font-medium"
                        >
                          Details
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

export function setupSightingsEvents(): void {
  // Sighting report action button
  const reportBtn = document.querySelector<HTMLButtonElement>('#btn-report-sighting-action');
  if (reportBtn) {
    reportBtn.addEventListener('click', () => {
      const modalRoot = document.querySelector<HTMLDivElement>('#modal-root');
      if (modalRoot) {
        import('./SightingReportModal').then(({ renderSightingReportModal, setupSightingModal }) => {
          modalRoot.innerHTML = renderSightingReportModal();
          setupSightingModal();
        });
      }
    });
  }

  // View case link
  document.querySelectorAll<HTMLButtonElement>('.view-case-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const caseId = btn.getAttribute('data-case-id');
      if (caseId) {
        state.setSelectedCaseId(caseId);
        state.setActiveTab('cases');
      }
    });
  });
}
