import { state, type AppTab } from '../state';
import { icon } from '../icons';

const tabTitles: Record<AppTab, { group: string; title: string }> = {
  dashboard: { group: 'Overview', title: 'Dashboard' },
  cases: { group: 'Overview', title: 'Cases' },
  studio: { group: 'Intelligence', title: 'AI Studio' },
  leads: { group: 'Intelligence', title: 'Match Leads' },
  clusters: { group: 'Intelligence', title: 'Case Clusters' },
  map: { group: 'Intelligence', title: 'Geospatial Intelligence' },
  antifraud: { group: 'Intelligence', title: 'Evidence Integrity & Anti-Fraud' },
  sightings: { group: 'Operations', title: 'Sightings' },
  reunification: { group: 'Operations', title: 'Reunification' },
  audit: { group: 'Operations', title: 'Audit Log' },
};

export function renderHeader(): string {
  const activeTab = state.getActiveTab();
  const currentTabInfo = tabTitles[activeTab] || { group: 'Overview', title: 'Dashboard' };
  const user = state.getUser();
  const currentRole = user?.role || 'investigator';
  const searchQuery = state.getSearchQuery();

  return `
    <header class="h-16 bg-[#FAF8F6] border-b border-[#E4DCD8] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_2px_rgba(43,29,25,0.03)]">
      <!-- Left: Mobile Menu & Breadcrumb -->
      <div class="flex items-center space-x-3">
        <!-- Mobile Sidebar Toggle -->
        <button id="btn-toggle-sidebar" class="lg:hidden p-2 rounded-md hover:bg-[#EDE7E4] text-[#4E342E] transition">
          ${icon('menu', 'w-5 h-5')}
        </button>

        <!-- Breadcrumb -->
        <div class="flex items-center space-x-2 text-xs">
          <span class="font-medium text-[#6F625D]">SafeTrace</span>
          <span class="text-[#D7CCC8]">/</span>
          <span class="text-[#6F625D] hidden sm:inline">${currentTabInfo.group}</span>
          <span class="text-[#D7CCC8] hidden sm:inline">/</span>
          <span class="font-semibold text-[#2B211E] text-sm">${currentTabInfo.title}</span>
        </div>
      </div>

      <!-- Center: Global Search Bar -->
      <div class="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div class="relative w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6F625D]">
            ${icon('search', 'w-4 h-4')}
          </div>
          <input
            type="text"
            id="global-search-input"
            value="${searchQuery}"
            placeholder="Search cases, people, locations, leads..."
            class="w-full pl-9 pr-4 py-1.5 text-xs bg-[#FFFFFF] border border-[#E4DCD8] rounded-md text-[#2B211E] placeholder-[#6F625D]/60 focus:outline-none focus:border-[#4E342E] focus:ring-1 focus:ring-[#4E342E] transition"
          />
          ${
            searchQuery
              ? `
            <button id="btn-clear-search" class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#6F625D] hover:text-[#2B211E]">
              ${icon('x', 'w-3.5 h-3.5')}
            </button>
          `
              : ''
          }
        </div>
      </div>

      <!-- Right: Action Buttons, Role Switcher & Notifications -->
      <div class="flex items-center space-x-3">
        <!-- Register Case Primary Action -->
        <button
          id="btn-header-new-case"
          class="btn-mocha flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium shadow-sm hover:shadow"
        >
          ${icon('plus', 'w-3.5 h-3.5')}
          <span class="hidden sm:inline">Register Case</span>
        </button>

        <!-- Role Selector Pill -->
        <div class="relative">
          <select
            id="role-switcher-select"
            class="text-xs font-medium py-1.5 pl-2.5 pr-6 rounded-md bg-[#EDE7E4] border border-[#E4DCD8] text-[#4E342E] hover:bg-[#D7CCC8] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4E342E] transition appearance-none"
          >
            <option value="investigator" ${currentRole === 'investigator' ? 'selected' : ''}>Investigator (Maria)</option>
            <option value="family" ${currentRole === 'family' ? 'selected' : ''}>Family Guardian (Sarah)</option>
            <option value="admin" ${currentRole === 'admin' ? 'selected' : ''}>CJIS Admin</option>
            <option value="organization" ${currentRole === 'organization' ? 'selected' : ''}>NGO / Partner</option>
            <option value="public" ${currentRole === 'public' ? 'selected' : ''}>Public Witness</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-1.5 pointer-events-none text-[#4E342E]">
            ${icon('chevronRight', 'w-3 h-3 rotate-90')}
          </div>
        </div>

        <!-- Guardrails trigger button -->
        <button
          id="btn-header-guardrails"
          title="Ethical AI & CJIS Guardrails"
          class="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 text-xs rounded-md bg-[#FAF8F6] border border-[#E4DCD8] text-[#3F6B4A] hover:bg-[#EDE7E4] transition"
        >
          ${icon('shield', 'w-3.5 h-3.5 text-[#3F6B4A]')}
          <span class="text-[11px] font-medium text-[#2B211E]">Guardrails</span>
        </button>

        <!-- Notifications Bell -->
        <button
          id="btn-notifications"
          title="Pattern Alerts & Notifications"
          class="relative p-2 rounded-md hover:bg-[#EDE7E4] text-[#4E342E] transition"
        >
          ${icon('bell', 'w-4 h-4')}
          <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#9B3E3E]"></span>
        </button>
      </div>
    </header>
  `;
}

export function setupHeaderEvents(): void {
  // Mobile sidebar toggle
  const toggleBtn = document.querySelector<HTMLButtonElement>('#btn-toggle-sidebar');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.setMobileSidebarOpen(!state.getMobileSidebarOpen());
    });
  }

  // Global search input
  const searchInput = document.querySelector<HTMLInputElement>('#global-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      state.setSearchQuery(target.value);
    });
  }

  // Clear search button
  const clearSearchBtn = document.querySelector<HTMLButtonElement>('#btn-clear-search');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      state.setSearchQuery('');
    });
  }

  // Role switcher dropdown
  const roleSelect = document.querySelector<HTMLSelectElement>('#role-switcher-select');
  if (roleSelect) {
    roleSelect.addEventListener('change', async (e) => {
      const newRole = (e.target as HTMLSelectElement).value as any;
      if (newRole) {
        await state.switchRole(newRole);
      }
    });
  }

  // Header "Register Case" button opens New Case Modal
  const newCaseBtn = document.querySelector<HTMLButtonElement>('#btn-header-new-case');
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

  // Guardrails button opens Guardrails modal
  const guardrailsBtn = document.querySelector<HTMLButtonElement>('#btn-header-guardrails');
  if (guardrailsBtn) {
    guardrailsBtn.addEventListener('click', () => {
      const modalRoot = document.querySelector<HTMLDivElement>('#modal-root');
      if (modalRoot) {
        import('./GuardrailsModal').then(({ renderGuardrailsModal, setupGuardrailsModal }) => {
          modalRoot.innerHTML = renderGuardrailsModal();
          setupGuardrailsModal();
        });
      }
    });
  }

  // Notifications button navigates to clusters/alerts
  const notifBtn = document.querySelector<HTMLButtonElement>('#btn-notifications');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      state.setActiveTab('clusters');
    });
  }
}
