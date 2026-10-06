import { state } from '../state';
import type { AppTab } from '../state';
import { icon, type IconName } from '../icons';

export function renderHeader(): string {
  const user = state.getUser();
  const currentTab = state.getActiveTab();
  const isAIProcessing = state.getIsAIProcessing();

  const navItems: Array<{ tab: AppTab; label: string; iconName: IconName; badge?: string }> = [
    { tab: 'dashboard', label: 'Dashboard', iconName: 'activity' },
    { tab: 'cases', label: 'Cases', iconName: 'folder' },
    { tab: 'leads', label: 'Decision Leads', iconName: 'target', badge: '4 New' },
    { tab: 'studio', label: 'Multimodal AI', iconName: 'sparkles' },
    { tab: 'clusters', label: 'Clusters', iconName: 'dna' },
    { tab: 'reunification', label: 'Reunification', iconName: 'handshake' },
    { tab: 'map', label: 'Radar Map', iconName: 'mapPin' },
    { tab: 'antifraud', label: 'Audit Trail', iconName: 'shield' },
  ];

  return `
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-[#ebdff5] shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Platform Identity -->
          <div class="flex items-center space-x-3 cursor-pointer group" id="nav-brand">
            <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#8c55bd] to-[#aa7dc8] text-white shadow-md shadow-[#8c55bd]/20 transition duration-300 group-hover:scale-105">
              ${icon('shield', 'w-5 h-5 text-white')}
              <span class="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5b8a6f] opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#5b8a6f]"></span>
              </span>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-base font-extrabold tracking-tight text-[#3c2355]">SafeTrace</span>
                <span class="px-2 py-0.5 text-[10px] font-bold tracking-wider bg-[#f4ecfb] text-[#733f9f] border border-[#dfcceb] rounded-full">AI 2.0</span>
              </div>
              <p class="text-[11px] text-[#786a89] font-medium">Multimodal Forensic Investigation &amp; Safe Reunification</p>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <nav class="hidden lg:flex items-center space-x-1">
            ${navItems.map(item => `
              <button
                data-tab="${item.tab}"
                class="nav-tab-btn flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 relative cursor-pointer ${
                  currentTab === item.tab
                    ? 'bg-[#f4ecfb] text-[#5c3280] border border-[#dfcceb] shadow-xs'
                    : 'text-[#615573] hover:text-[#231c2d] hover:bg-[#f8f5f0]'
                }"
              >
                <span class="${currentTab === item.tab ? 'text-[#8c55bd]' : 'text-[#88799e]'}">
                  ${icon(item.iconName, 'w-3.5 h-3.5')}
                </span>
                <span>${item.label}</span>
                ${item.badge ? `
                  <span class="ml-1 px-1.5 py-0.2 text-[9px] font-bold bg-[#fce8ea] text-[#b85b67] border border-[#f5b3bb] rounded-full">
                    ${item.badge}
                  </span>
                ` : ''}
              </button>
            `).join('')}
          </nav>

          <!-- Right Action Bar & Role Switcher -->
          <div class="flex items-center space-x-3">
            <!-- AI Processing Badge -->
            <div id="header-ai-indicator" class="hidden sm:flex items-center space-x-2 px-3 py-1 bg-[#fdfcf9] border border-[#ebdff5] rounded-full text-xs shadow-xs">
              <span class="h-2 w-2 rounded-full ${isAIProcessing ? 'bg-[#d4a362] animate-ping' : 'bg-[#5b8a6f]'}"></span>
              <span class="text-[11px] font-medium text-[#615573]">${isAIProcessing ? 'Analyzing...' : 'Guardrails Online'}</span>
            </div>

            <!-- Quick Report Sighting Button -->
            <button
              id="btn-quick-sighting"
              class="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white shadow-sm shadow-[#8c55bd]/20 transition active:scale-95 cursor-pointer"
            >
              ${icon('camera', 'w-3.5 h-3.5 text-white')}
              <span class="hidden sm:inline">Report Sighting</span>
            </button>

            <!-- Role Switcher Dropdown -->
            <div class="relative">
              <select
                id="role-switcher-select"
                class="bg-[#fdfcf9] text-[#3c2355] text-xs font-semibold rounded-xl border border-[#dfcceb] px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8c55bd] cursor-pointer shadow-xs"
                title="Switch Active Persona"
              >
                <option value="investigator" ${user?.role === 'investigator' ? 'selected' : ''}>Investigator (Maria Rossi)</option>
                <option value="family" ${user?.role === 'family' ? 'selected' : ''}>Family Member (Sarah)</option>
                <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>Security Admin (Alex)</option>
                <option value="organization" ${user?.role === 'organization' ? 'selected' : ''}>NGO Agency (Hope Network)</option>
                <option value="public" ${user?.role === 'public' ? 'selected' : ''}>Public Witness (John)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation Bar -->
        <div class="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-[#ebdff5] scrollbar-none">
          ${navItems.map(item => `
            <button
              data-tab="${item.tab}"
              class="nav-tab-btn flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap ${
                currentTab === item.tab
                  ? 'bg-[#f4ecfb] text-[#5c3280] border border-[#dfcceb]'
                  : 'text-[#615573] hover:text-[#231c2d] bg-white'
              }"
            >
              <span class="${currentTab === item.tab ? 'text-[#8c55bd]' : 'text-[#88799e]'}">
                ${icon(item.iconName, 'w-3.5 h-3.5')}
              </span>
              <span>${item.label}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </header>
  `;
}

export function setupHeaderEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('.nav-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab') as AppTab;
      if (tab) {
        state.setActiveTab(tab);
      }
    });
  });

  document.getElementById('nav-brand')?.addEventListener('click', () => {
    state.setActiveTab('dashboard');
  });

  const select = document.getElementById('role-switcher-select') as HTMLSelectElement;
  select?.addEventListener('change', async (e) => {
    const newRole = (e.target as HTMLSelectElement).value as any;
    await state.switchRole(newRole);
  });

  document.getElementById('btn-quick-sighting')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-sighting-modal'));
  });
}
