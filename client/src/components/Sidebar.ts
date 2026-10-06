import { state, type AppTab } from '../state';
import { icon } from '../icons';

interface NavItem {
  id: AppTab;
  label: string;
  iconName: any;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function renderSidebar(): string {
  const activeTab = state.getActiveTab();
  const user = state.getUser();
  const mobileOpen = state.getMobileSidebarOpen();

  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', iconName: 'layoutDashboard' },
        { id: 'cases', label: 'Cases', iconName: 'folder' },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'studio', label: 'AI Studio', iconName: 'sparkles', badge: 'Gemini' },
        { id: 'leads', label: 'Leads', iconName: 'target' },
        { id: 'clusters', label: 'Clusters', iconName: 'network' },
        { id: 'map', label: 'Map', iconName: 'map' },
        { id: 'antifraud', label: 'Anti-Fraud', iconName: 'shieldAlert' },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'sightings', label: 'Sightings', iconName: 'eye' },
        { id: 'reunification', label: 'Reunification', iconName: 'handshake' },
        { id: 'audit', label: 'Audit Log', iconName: 'fileText' },
      ],
    },
  ];

  return `
    <!-- Mobile Backdrop Overlay -->
    <div id="sidebar-backdrop" class="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden ${mobileOpen ? 'block' : 'hidden'}"></div>

    <!-- Sidebar Container -->
    <aside id="app-sidebar" class="fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#21182B] text-[#EDE4F5] flex flex-col justify-between border-r border-[#322641] transition-transform duration-200 ease-in-out shrink-0 ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}">
      <!-- Top Brand Header -->
      <div class="p-5 border-b border-[#322641] bg-[#1B1323]">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-lg bg-[#7C5CBF] text-white flex items-center justify-center shadow-md shadow-[#7C5CBF]/30">
            ${icon('shield', 'w-5 h-5 text-white')}
          </div>
          <div>
            <h1 class="text-base font-bold text-[#FAF7F2] tracking-tight leading-none">SafeTrace</h1>
            <p class="text-[11px] text-[#CBB4E7]/70 mt-1 font-normal leading-tight">Privacy-Aware AI Intelligence</p>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        ${sections
          .map(
            (section) => `
          <div>
            <p class="px-3 text-[10px] font-bold uppercase tracking-wider text-[#9E88BA] mb-2">${section.title}</p>
            <div class="space-y-1">
              ${section.items
                .map((item) => {
                  const isActive = activeTab === item.id;
                  return `
                  <button
                    data-tab="${item.id}"
                    class="nav-tab-btn w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#FAF6F0] text-[#492864] font-bold shadow-sm'
                        : 'text-[#EDE4F5]/80 hover:text-white hover:bg-[#2F213F]'
                    }"
                  >
                    <div class="flex items-center space-x-2.5">
                      ${icon(item.iconName, `w-4 h-4 ${isActive ? 'text-[#7C5CBF]' : 'text-[#CBB4E7]/70'}`)}
                      <span>${item.label}</span>
                    </div>
                    ${
                      item.badge
                        ? `<span class="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-[#3B2852] text-[#D8C4F0] border border-[#523A70]">${item.badge}</span>`
                        : ''
                    }
                  </button>
                `;
                })
                .join('')}
            </div>
          </div>
        `
          )
          .join('')}
      </nav>

      <!-- Bottom Profile & Status Box -->
      <div class="p-3 border-t border-[#322641] bg-[#1B1323] space-y-3">
        <!-- Status Indicator -->
        <div class="flex items-center justify-between px-2 text-[11px] text-[#CBB4E7]/80">
          <div class="flex items-center space-x-1.5">
            <span class="w-2 h-2 rounded-full bg-[#48BB78] animate-pulse"></span>
            <span class="font-medium text-[#FAF7F2]">Platform Online</span>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#2C1F3A] text-[#CBB4E7] border border-[#3E2C51] font-mono">v1.0</span>
        </div>

        <!-- User Profile Card -->
        <div class="p-2.5 rounded-lg bg-[#271C33] border border-[#3E2C51] flex items-center justify-between shadow-xs">
          <div class="flex items-center space-x-2.5 overflow-hidden">
            <div class="w-7 h-7 rounded-md bg-[#7C5CBF] text-[#FAF7F2] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              ${(user?.name || 'M').charAt(0)}
            </div>
            <div class="truncate">
              <p class="text-xs font-semibold text-[#FAF7F2] truncate">${user?.name || 'Detective Maria Chen'}</p>
              <p class="text-[10px] text-[#CBB4E7]/70 capitalize truncate">${user?.role || 'investigator'}</p>
            </div>
          </div>
          <button id="btn-logout" title="Sign Out" class="p-1.5 rounded-md hover:bg-[#3E2C51] text-[#CBB4E7] hover:text-white transition cursor-pointer">
            ${icon('logOut', 'w-3.5 h-3.5')}
          </button>
        </div>
      </div>
    </aside>
  `;
}

export function setupSidebarEvents(): void {
  // Tab navigation click
  document.querySelectorAll<HTMLButtonElement>('.nav-tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-tab') as AppTab;
      if (tab) {
        state.setActiveTab(tab);
      }
    });
  });

  // Backdrop click to close mobile sidebar
  const backdrop = document.querySelector<HTMLDivElement>('#sidebar-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      state.setMobileSidebarOpen(false);
    });
  }

  // Logout button
  const logoutBtn = document.querySelector<HTMLButtonElement>('#btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      state.logout();
    });
  }
}
