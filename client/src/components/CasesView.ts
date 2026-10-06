import { state } from '../state';
import { api } from '../api';
import type { MissingCase } from '../types';
import { icon } from '../icons';

export async function renderCasesView(): Promise<string> {
  try {
    const { cases } = await api.getCases();

    return `
      <div class="space-y-6">
        <!-- Top Title & Search / Filter Controls -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-[#231c2d] tracking-tight flex items-center space-x-2">
              <span>${icon('folder', 'w-6 h-6 text-[#8c55bd]')}</span>
              <span>Missing Persons Case Registry</span>
            </h1>
            <p class="text-xs text-[#786a89] mt-1">
              Encrypted, privacy-controlled missing person profiles with multimodal biometrics &amp; consent controls
            </p>
          </div>

          <div class="flex items-center space-x-3">
            <button id="btn-create-case-action" class="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white text-xs font-bold shadow-sm shadow-[#8c55bd]/20 transition flex items-center space-x-2 cursor-pointer">
              ${icon('plus', 'w-4 h-4 text-white')}
              <span>Register New Case</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <div class="flex flex-1 min-w-[240px] items-center space-x-2.5 bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2">
            <span class="text-[#8c55bd]">${icon('search', 'w-4 h-4 text-[#8c55bd]')}</span>
            <input
              id="input-case-search"
              type="text"
              placeholder="Search by name, case #, city, or physical markers..."
              class="bg-transparent text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none w-full"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Risk Filter -->
            <select id="filter-risk" class="bg-[#fbf8f2] border border-[#dfcfb6] text-[#3c2355] text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8c55bd] cursor-pointer shadow-xs">
              <option value="">All Risk Levels</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>

            <!-- Status Filter -->
            <select id="filter-status" class="bg-[#fbf8f2] border border-[#dfcfb6] text-[#3c2355] text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8c55bd] cursor-pointer shadow-xs">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="sighting_pending">Sighting Pending</option>
              <option value="verified_lead">Verified Lead</option>
              <option value="reunification_in_progress">Reunification In Progress</option>
              <option value="reunified">Reunified</option>
            </select>

            <!-- Gender Filter -->
            <select id="filter-gender" class="bg-[#fbf8f2] border border-[#dfcfb6] text-[#3c2355] text-xs font-medium rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8c55bd] cursor-pointer shadow-xs">
              <option value="">All Genders</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
            </select>
          </div>
        </div>

        <!-- Cases Grid -->
        <div id="cases-grid-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          ${cases.map(c => renderCaseCard(c)).join('')}
        </div>
      </div>
    `;
  } catch (err: any) {
    return `<div class="p-8 text-center text-[#b85b67]">Failed to load cases: ${err.message}</div>`;
  }
}

function renderCaseCard(c: MissingCase): string {
  const riskBadgeClass = {
    critical: 'bg-[#fce8ea] text-[#b85b67] border-[#f5b3bb]',
    high: 'bg-[#fdf5ea] text-[#8f642a] border-[#fae0be]',
    medium: 'bg-[#f6f0e4] text-[#6f5f48] border-[#dfcfb6]',
    low: 'bg-[#edf7f1] text-[#385c47] border-[#b8e2c8]',
  }[c.riskLevel] || 'bg-[#f6f0e4] text-[#6f5f48] border-[#dfcfb6]';

  const statusBadgeClass = {
    active: 'bg-[#f4ecfb] text-[#5c3280] border-[#dfcceb]',
    sighting_pending: 'bg-[#fdf5ea] text-[#8f642a] border-[#fae0be]',
    verified_lead: 'bg-[#edf7f1] text-[#385c47] border-[#b8e2c8]',
    reunification_in_progress: 'bg-[#f4ecfb] text-[#733f9f] border-[#dfcceb]',
    reunified: 'bg-[#edf7f1] text-[#385c47] border-[#b8e2c8]',
    archived: 'bg-[#f6f0e4] text-[#88799e] border-[#dfcfb6]',
    closed: 'bg-[#f6f0e4] text-[#88799e] border-[#dfcfb6]',
  }[c.status] || 'bg-[#f6f0e4] text-[#88799e]';

  const primaryPhoto = c.photos?.[0]?.url || '';
  const daysMissing = Math.max(0, Math.floor((Date.now() - new Date(c.lastSeenDate).getTime()) / (1000 * 60 * 60 * 24)));

  return `
    <div class="glass-card-interactive rounded-2xl overflow-hidden flex flex-col justify-between group shadow-xs">
      <div>
        <!-- Photo & Badges Header -->
        <div class="relative h-48 bg-[#f4ecfb] overflow-hidden">
          ${primaryPhoto ? `
            <img src="${primaryPhoto}" alt="${c.fullName}" class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" />
          ` : `
            <div class="w-full h-full flex flex-col items-center justify-center text-[#aa7dc8] bg-[#f8f5f0]">
              <span class="mb-1">${icon('user', 'w-10 h-10 text-[#aa7dc8]')}</span>
              <span class="text-xs text-[#786a89]">No primary photo</span>
            </div>
          `}
          
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          <!-- Top Overlay Badges -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskBadgeClass}">
              ${c.riskLevel} Risk
            </span>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white/95 text-[#231c2d] border border-black/10 shadow-xs">
              ${c.caseNumber}
            </span>
          </div>

          <!-- Bottom Overlay Info -->
          <div class="absolute bottom-3 left-3 right-3">
            <div class="flex items-center justify-between text-white">
              <span class="text-[11px] font-bold bg-black/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20 font-mono">
                Missing ${daysMissing} days
              </span>
              <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeClass} uppercase">
                ${c.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        <!-- Case Content Body -->
        <div class="p-4 space-y-3">
          <div>
            <h3 class="text-base font-bold text-[#231c2d] group-hover:text-[#8c55bd] transition flex items-center justify-between">
              <span>${c.fullName}</span>
              <span class="text-xs font-semibold text-[#786a89]">${c.age} yrs (${c.gender})</span>
            </h3>
            <p class="text-xs text-[#594c6d] mt-0.5 flex items-center space-x-1.5">
              <span>${icon('mapPin', 'w-3.5 h-3.5 text-[#8c55bd]')}</span>
              <span>${c.lastSeenLocation.city}, ${c.lastSeenLocation.state}</span>
            </p>
          </div>

          <!-- Physical Features Snippet -->
          <div class="text-[11px] text-[#594c6d] bg-[#fbf8f2] p-3 rounded-xl border border-[#dfcfb6] space-y-1">
            <div class="flex items-center justify-between text-[#786a89]">
              <span>Hair: <strong class="text-[#231c2d]">${c.physicalDescription.hairColor || 'N/A'}</strong></span>
              <span>Eyes: <strong class="text-[#231c2d]">${c.physicalDescription.eyeColor || 'N/A'}</strong></span>
              <span>Height: <strong class="text-[#231c2d]">${c.physicalDescription.heightCm || '—'}cm</strong></span>
            </div>
            ${c.physicalDescription.distinguishingFeatures?.length ? `
              <p class="text-[#786a89] truncate pt-0.5"><strong class="text-[#8c55bd]">Markers:</strong> ${c.physicalDescription.distinguishingFeatures.join(', ')}</p>
            ` : ''}
          </div>

          <!-- Multimodal Vault Indicators -->
          <div class="flex items-center justify-between text-[11px] text-[#786a89] pt-1">
            <span class="flex items-center space-x-1" title="Evidence Photos">
              <span>${icon('camera', 'w-3.5 h-3.5 text-[#8c55bd]')}</span>
              <span>${c.photos?.length || 0} Photos</span>
            </span>
            <span class="flex items-center space-x-1" title="Voice Bio Samples">
              <span>${icon('waveform', 'w-3.5 h-3.5 text-[#aa7dc8]')}</span>
              <span>${c.voiceRecordings?.length || 0} Audio</span>
            </span>
            <span class="flex items-center space-x-1" title="Consent Protection">
              <span>${icon('lock', 'w-3.5 h-3.5 text-[#5b8a6f]')}</span>
              <span>${c.contactConsent.requireInvestigatorApproval ? 'Protected' : 'Open'}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div class="p-4 pt-0 flex items-center space-x-2">
        <button
          data-case-id="${c._id}"
          class="btn-view-case-dossier flex-1 py-2 rounded-xl bg-[#f4ecfb] hover:bg-[#ebdff5] border border-[#dfcceb] text-[#5c3280] text-xs font-bold transition cursor-pointer text-center"
        >
          View Case Dossier
        </button>
        <button
          data-case-id="${c._id}"
          class="btn-run-case-match px-3.5 py-2 rounded-xl bg-white hover:bg-[#fbf8f2] border border-[#dfcfb6] text-[#3c2355] text-xs font-bold transition cursor-pointer flex items-center space-x-1 shadow-xs"
          title="Run Multimodal AI Match"
        >
          <span>${icon('sparkles', 'w-3.5 h-3.5 text-[#8c55bd]')}</span>
          <span>Match</span>
        </button>
      </div>
    </div>
  `;
}

export function setupCasesEvents(): void {
  document.getElementById('btn-create-case-action')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-new-case-modal'));
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-view-case-dossier').forEach(btn => {
    btn.addEventListener('click', () => {
      const caseId = btn.getAttribute('data-case-id');
      if (caseId) {
        state.setSelectedCaseId(caseId);
        window.dispatchEvent(new CustomEvent('open-case-modal', { detail: { caseId } }));
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.btn-run-case-match').forEach(btn => {
    btn.addEventListener('click', () => {
      const caseId = btn.getAttribute('data-case-id');
      if (caseId) {
        state.setSelectedCaseId(caseId);
        state.setActiveTab('studio');
      }
    });
  });

  const searchInput = document.getElementById('input-case-search') as HTMLInputElement;
  const filterRisk = document.getElementById('filter-risk') as HTMLSelectElement;
  const filterStatus = document.getElementById('filter-status') as HTMLSelectElement;
  const filterGender = document.getElementById('filter-gender') as HTMLSelectElement;

  const applyFilters = async () => {
    const params: Record<string, string> = {};
    if (searchInput?.value) params.search = searchInput.value;
    if (filterRisk?.value) params.riskLevel = filterRisk.value;
    if (filterStatus?.value) params.status = filterStatus.value;
    if (filterGender?.value) params.gender = filterGender.value;

    try {
      const { cases } = await api.getCases(params);
      const grid = document.getElementById('cases-grid-container');
      if (grid) {
        if (cases.length === 0) {
          grid.innerHTML = `<div class="col-span-3 p-12 text-center text-[#786a89] bg-white rounded-2xl border border-[#dfcceb]">No cases matched your filter criteria.</div>`;
        } else {
          grid.innerHTML = cases.map(c => renderCaseCard(c)).join('');
          setupCasesEvents();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  searchInput?.addEventListener('input', debounce(applyFilters, 300));
  filterRisk?.addEventListener('change', applyFilters);
  filterStatus?.addEventListener('change', applyFilters);
  filterGender?.addEventListener('change', applyFilters);
}

function debounce(func: Function, wait: number) {
  let timeout: any;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
