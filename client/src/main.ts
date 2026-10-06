import './style.css';
import { state } from './state';
import { renderSidebar, setupSidebarEvents } from './components/Sidebar';
import { renderHeader, setupHeaderEvents } from './components/Header';
import { renderGuardrailBanner, setupGuardrailEvents } from './components/GuardrailBanner';
import { renderDashboardView, setupDashboardEvents } from './components/DashboardView';
import { renderCasesView, setupCasesEvents } from './components/CasesView';
import { renderLeadsView, setupLeadsEvents } from './components/LeadsView';
import { renderMultimodalStudio, setupMultimodalEvents } from './components/MultimodalStudio';
import { renderClustersView, setupClustersEvents } from './components/ClustersView';
import { renderReunificationView, setupReunificationEvents } from './components/ReunificationView';
import { renderMapView, setupMapEvents } from './components/MapView';
import { renderAntiFraudView } from './components/AntiFraudView';
import { renderSightingsView, setupSightingsEvents } from './components/SightingsView';
import { renderAuditLogView } from './components/AuditLogView';
import { renderCaseDetailModal, setupCaseModal } from './components/CaseDetailModal';
import { renderSightingReportModal, setupSightingModal } from './components/SightingReportModal';
import { renderNewCaseModal, setupNewCaseModal } from './components/NewCaseModal';
import { renderGuardrailsModal, setupGuardrailsModal } from './components/GuardrailsModal';
import { renderToastContainer, setupToastEvents } from './components/ToastContainer';

const appEl = document.querySelector<HTMLDivElement>('#app')!;

async function renderApp(): Promise<void> {
  const activeTab = state.getActiveTab();

  let tabContentHtml = '';

  switch (activeTab) {
    case 'dashboard':
      tabContentHtml = await renderDashboardView();
      break;
    case 'cases':
      tabContentHtml = await renderCasesView();
      break;
    case 'leads':
      tabContentHtml = await renderLeadsView();
      break;
    case 'studio':
      tabContentHtml = await renderMultimodalStudio();
      break;
    case 'clusters':
      tabContentHtml = await renderClustersView();
      break;
    case 'reunification':
      tabContentHtml = await renderReunificationView();
      break;
    case 'map':
      tabContentHtml = await renderMapView();
      break;
    case 'antifraud':
      tabContentHtml = await renderAntiFraudView();
      break;
    case 'sightings':
      tabContentHtml = await renderSightingsView();
      break;
    case 'audit':
      tabContentHtml = await renderAuditLogView();
      break;
    default:
      tabContentHtml = await renderDashboardView();
  }

  appEl.innerHTML = `
    <!-- Left Navigation Sidebar -->
    ${renderSidebar()}

    <!-- Main Workspace Container (Vertical Column Stack) -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen bg-[#FAF7F2] overflow-x-hidden">
      <!-- Top Navigation Header -->
      ${renderHeader()}

      <!-- AI Ethics & CJIS Guardrail Banner -->
      ${renderGuardrailBanner()}

      <!-- Main Dynamic Content Workspace -->
      <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        ${tabContentHtml}
      </main>

      <!-- Global Enterprise Footer -->
      <footer class="mt-auto border-t border-[#E8DFD3] bg-[#F4EFE6]/90 backdrop-blur-md py-5 text-center text-xs text-[#6E6277]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p class="font-medium text-[#2C2230]">© 2026 SafeTrace Protocol — Multimodal Forensic Decision Intelligence &amp; Humanitarian Reunification.</p>
          <div class="flex items-center space-x-3 text-[#7C5CBF] font-semibold text-[11px]">
            <span>CJIS &amp; GDPR Aligned</span>
            <span class="text-[#D0C2E2]">•</span>
            <span>Zero-Knowledge Consent</span>
            <span class="text-[#D0C2E2]">•</span>
            <span>Human-in-the-Loop</span>
          </div>
        </div>
      </footer>
    </div>

    <!-- Toast Notifications Mount -->
    ${renderToastContainer()}

    <!-- Modal Mount Container -->
    <div id="modal-root"></div>
  `;

  // Attach global UI event handlers
  setupSidebarEvents();
  setupHeaderEvents();
  setupGuardrailEvents();
  setupToastEvents();

  // Attach tab-specific event handlers
  switch (activeTab) {
    case 'dashboard':
      setupDashboardEvents();
      break;
    case 'cases':
      setupCasesEvents();
      break;
    case 'leads':
      setupLeadsEvents();
      break;
    case 'studio':
      setupMultimodalEvents();
      break;
    case 'clusters':
      setupClustersEvents();
      break;
    case 'reunification':
      setupReunificationEvents();
      break;
    case 'map':
      await setupMapEvents();
      break;
    case 'sightings':
      setupSightingsEvents();
      break;
  }
}

// Global modal triggers
window.addEventListener('open-case-modal', ((e: CustomEvent) => {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot && e.detail?.caseId) {
    modalRoot.innerHTML = renderCaseDetailModal(e.detail.caseId);
    setupCaseModal(e.detail.caseId);
  }
}) as EventListener);

window.addEventListener('open-sighting-modal', (() => {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = renderSightingReportModal();
    setupSightingModal();
  }
}) as EventListener);

window.addEventListener('open-new-case-modal', (() => {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = renderNewCaseModal();
    setupNewCaseModal();
  }
}) as EventListener);

window.addEventListener('open-guardrails-modal', (() => {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = renderGuardrailsModal();
    setupGuardrailsModal();
  }
}) as EventListener);

// Subscribe to reactive state updates
state.subscribe(() => {
  renderApp();
});

// Initial boot
(async () => {
  try {
    await state.initAuth();
    await renderApp();
  } catch (err) {
    console.error('Boot error:', err);
    await renderApp();
  }
})();
