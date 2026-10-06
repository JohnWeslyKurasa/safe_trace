import './style.css';
import { state } from './state';
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
    default:
      tabContentHtml = await renderDashboardView();
  }

  appEl.innerHTML = `
    <!-- Top Header -->
    ${renderHeader()}

    <!-- AI Guardrail Banner -->
    ${renderGuardrailBanner()}

    <!-- Main Content Container -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      ${tabContentHtml}
    </main>

    <!-- Global Footer -->
    <footer class="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© 2026 SafeTrace Protocol — Multimodal Decision Intelligence for Humanitarian Reunification.</p>
        <div class="flex items-center space-x-4 text-slate-400">
          <span>CJIS &amp; GDPR Aligned</span>
          <span>•</span>
          <span>Zero-Knowledge Consent</span>
          <span>•</span>
          <span>Human-in-the-Loop</span>
        </div>
      </div>
    </footer>

    <!-- Toast Notifications -->
    ${renderToastContainer()}

    <!-- Modal Injection Mount -->
    <div id="modal-root"></div>
  `;

  // Attach event handlers
  setupHeaderEvents();
  setupGuardrailEvents();
  setupToastEvents();

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
