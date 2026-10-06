import { state } from '../state';
import { api } from '../api';
import type { MissingCase } from '../types';

export async function renderCasesView(): Promise<string> {
  state.setIsAIProcessing(true);
  try {
    const { cases } = await api.getCases();

    return `
      <div class="space-y-6">
        <!-- Top Title & Search / Filter Controls -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>📁</span>
              <span>Missing Persons Case Registry</span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              Encrypted, privacy-controlled missing person profiles with multimodal biometrics & consent controls
            </p>
          </div>

          <div class="flex items-center space-x-3">
            <button id="btn-create-case-action" class="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center space-x-2 cursor-pointer">
              <span>➕</span>
              <span>Register New Case</span>
            </button>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="glass-panel p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-slate-800">
          <div class="flex flex-1 min-w-[240px] items-center space-x-2 bg-slate-900/80 border border-slate-700/80 rounded-lg px-3 py-1.5">
            <span class="text-slate-400 text-sm">🔍</span>
            <input
              id="input-case-search"
              type="text"
              placeholder="Search by name, case #, city, or physical markers..."
              class="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
            />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <!-- Risk Filter -->
            <select id="filter-risk" class="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
              <option value="">All Risk Levels</option>
              <option value="critical">Critical Risk</option>
              <option value="high">High Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="low">Low Risk</option>
            </select>

            <!-- Status Filter -->
            <select id="filter-status" class="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="sighting_pending">Sighting Pending</option>
              <option value="verified_lead">Verified Lead</option>
              <option value="reunification_in_progress">Reunification In Progress</option>
              <option value="reunified">Reunified</option>
            </select>

            <!-- Gender Filter -->
            <select id="filter-gender" class="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
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
    return `<div class="p-8 text-center text-rose-400">Failed to load cases: ${err.message}</div>`;
  } finally {
    state.setIsAIProcessing(false);
  }
}

function renderCaseCard(c: MissingCase): string {
  const riskBadgeClass = {
    critical: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    high: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  }[c.riskLevel] || 'bg-slate-500/20 text-slate-300 border-slate-500/40';

  const statusBadgeClass = {
    active: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    sighting_pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    verified_lead: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    reunification_in_progress: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    reunified: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    archived: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    closed: 'bg-slate-700/20 text-slate-400 border-slate-700/30',
  }[c.status] || 'bg-slate-800 text-slate-300';

  const primaryPhoto = c.photos?.[0]?.url || '';
  const daysMissing = Math.max(0, Math.floor((Date.now() - new Date(c.lastSeenDate).getTime()) / (1000 * 60 * 60 * 24)));

  return `
    <div class="glass-card-interactive rounded-xl overflow-hidden border border-slate-800 flex flex-col justify-between group">
      <div>
        <!-- Photo & Badges Header -->
        <div class="relative h-48 bg-slate-900 overflow-hidden">
          ${primaryPhoto ? `
            <img src="${primaryPhoto}" alt="${c.fullName}" class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" />
          ` : `
            <div class="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-950">
              <span class="text-4xl mb-1">👤</span>
              <span class="text-xs">No primary photo</span>
            </div>
          `}
          
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

          <!-- Top Overlay Badges -->
          <div class="absolute top-3 left-3 right-3 flex items-center justify-between">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${riskBadgeClass}">
              ${c.riskLevel} Risk
            </span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-slate-900/90 text-slate-300 border border-slate-700">
              ${c.caseNumber}
            </span>
          </div>

          <!-- Bottom Overlay Info -->
          <div class="absolute bottom-3 left-3 right-3">
            <div class="flex items-center justify-between">
              <span class="text-[11px] font-medium text-amber-300 bg-slate-900/80 px-2 py-0.5 rounded border border-amber-500/30">
                Missing ${daysMissing} days
              </span>
              <span class="text-[10px] font-medium px-2 py-0.5 rounded border ${statusBadgeClass} uppercase">
                ${c.status.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        <!-- Case Content Body -->
        <div class="p-4 space-y-3">
          <div>
            <h3 class="text-base font-bold text-white group-hover:text-indigo-300 transition flex items-center justify-between">
              <span>${c.fullName}</span>
              <span class="text-xs font-normal text-slate-400">${c.age} yrs (${c.gender})</span>
            </h3>
            <p class="text-xs text-slate-400 mt-0.5 flex items-center space-x-1">
              <span>📍</span>
              <span>${c.lastSeenLocation.city}, ${c.lastSeenLocation.state}</span>
            </p>
          </div>

          <!-- Physical Features Snippet -->
          <div class="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 space-y-1">
            <div class="flex items-center justify-between text-slate-400">
              <span>Hair: <strong class="text-slate-200">${c.physicalDescription.hairColor || 'N/A'}</strong></span>
              <span>Eyes: <strong class="text-slate-200">${c.physicalDescription.eyeColor || 'N/A'}</strong></span>
              <span>Height: <strong class="text-slate-200">${c.physicalDescription.heightCm || '—'}cm</strong></span>
            </div>
            ${c.physicalDescription.distinguishingFeatures?.length ? `
              <p class="text-slate-400 truncate"><strong class="text-indigo-300">Markers:</strong> ${c.physicalDescription.distinguishingFeatures.join(', ')}</p>
            ` : ''}
          </div>

          <!-- Multimodal Vault Indicators -->
          <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span class="flex items-center space-x-1" title="Evidence Photos">
              <span>🖼️</span>
              <span>${c.photos?.length || 0} Photos</span>
            </span>
            <span class="flex items-center space-x-1" title="Voice Bio Samples">
              <span>🎙️</span>
              <span>${c.voiceRecordings?.length || 0} Audio</span>
            </span>
            <span class="flex items-center space-x-1" title="Consent Protection">
              <span class="text-emerald-400">🔒</span>
              <span>${c.contactConsent.requireInvestigatorApproval ? 'Protected' : 'Open'}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Action Buttons Footer -->
      <div class="p-4 pt-0 flex items-center space-x-2">
        <button
          data-case-id="${c._id}"
          class="btn-view-case-dossier flex-1 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition cursor-pointer text-center"
        >
          View Case Dossier
        </button>
        <button
          data-case-id="${c._id}"
          class="btn-run-case-match px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          title="Run Multimodal AI Match"
        >
          ⚡ Match
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
          grid.innerHTML = `<div class="col-span-3 p-12 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">No cases matched your filter criteria.</div>`;
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
