import { state } from '../state';
import type { AppTab } from '../state';

export function renderHeader(): string {
  const user = state.getUser();
  const currentTab = state.getActiveTab();
  const isAIProcessing = state.getIsAIProcessing();

  const navItems: Array<{ tab: AppTab; label: string; icon: string; badge?: string }> = [
    { tab: 'dashboard', label: 'Overview', icon: '📊' },
    { tab: 'cases', label: 'Cases Registry', icon: '📁' },
    { tab: 'leads', label: 'Decision Leads', icon: '🎯', badge: '4 New' },
    { tab: 'studio', label: 'Multimodal AI', icon: '⚡' },
    { tab: 'clusters', label: 'Clusters & Patterns', icon: '🧬' },
    { tab: 'reunification', label: 'Reunification Hub', icon: '🤝' },
    { tab: 'map', label: 'Geospatial Map', icon: '🗺️' },
    { tab: 'antifraud', label: 'Trust & Audit', icon: '🛡️' },
  ];

  return `
    <header class="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo & Platform Identity -->
          <div class="flex items-center space-x-3 cursor-pointer" id="nav-brand">
            <div class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25">
              <span class="text-xl">🛡️</span>
              <span class="absolute -top-1 -right-1 flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">SafeTrace</span>
                <span class="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded">v1.0-PRO</span>
              </div>
              <p class="text-[11px] text-slate-400 font-medium">Multimodal AI & Consent-Aware Reunification</p>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <nav class="hidden lg:flex items-center space-x-1">
            ${navItems.map(item => `
              <button
                data-tab="${item.tab}"
                class="nav-tab-btn flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 relative ${
                  currentTab === item.tab
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }"
              >
                <span>${item.icon}</span>
                <span>${item.label}</span>
                ${item.badge ? `
                  <span class="ml-1 px-1.5 py-0.2 text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full animate-pulse">
                    ${item.badge}
                  </span>
                ` : ''}
              </button>
            `).join('')}
          </nav>

          <!-- Right Action Bar & Role Switcher -->
          <div class="flex items-center space-x-3">
            <!-- AI Processing Badge -->
            <div id="header-ai-indicator" class="hidden sm:flex items-center space-x-2 px-2.5 py-1 bg-slate-800/80 border border-slate-700/80 rounded-full text-xs">
              <span class="h-2 w-2 rounded-full ${isAIProcessing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}"></span>
              <span class="text-[11px] font-medium text-slate-300">${isAIProcessing ? 'AI Reasoning...' : 'AI Models Active'}</span>
            </div>

            <!-- Quick Report Sighting Button -->
            <button
              id="btn-quick-sighting"
              class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <span>📸</span>
              <span class="hidden sm:inline">Report Sighting</span>
            </button>

            <!-- Role Switcher Dropdown -->
            <div class="relative">
              <select
                id="role-switcher-select"
                class="bg-slate-800 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                title="Switch Demo Role"
              >
                <option value="investigator" ${user?.role === 'investigator' ? 'selected' : ''}>🕵️ Investigator (Maria)</option>
                <option value="family" ${user?.role === 'family' ? 'selected' : ''}>👪 Family Member (Sarah)</option>
                <option value="admin" ${user?.role === 'admin' ? 'selected' : ''}>⚙️ Admin (Alex)</option>
                <option value="organization" ${user?.role === 'organization' ? 'selected' : ''}>🏢 NGO / Org (Hope Found.)</option>
                <option value="public" ${user?.role === 'public' ? 'selected' : ''}>👤 Public Witness (John)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Mobile Navigation Bar -->
        <div class="lg:hidden flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-800/60 scrollbar-none">
          ${navItems.map(item => `
            <button
              data-tab="${item.tab}"
              class="nav-tab-btn flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                currentTab === item.tab
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
              }"
            >
              <span>${item.icon}</span>
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
