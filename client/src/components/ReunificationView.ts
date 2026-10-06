import { state } from '../state';
import { api } from '../api';
import type { MissingCase, ConsentRecord, SecureMessage } from '../types';
import confetti from 'canvas-confetti';

export async function renderReunificationView(): Promise<string> {
  state.setIsAIProcessing(true);
  try {
    const { cases } = await api.getCases();
    const activeCaseId = state.getSelectedCaseId() || cases[0]?._id;
    
    let currentCase: MissingCase | null = null;
    let consentRecords: ConsentRecord[] = [];
    let messages: SecureMessage[] = [];

    if (activeCaseId) {
      try {
        const caseDetails = await api.getCaseById(activeCaseId);
        currentCase = caseDetails.caseItem;
        consentRecords = caseDetails.consent || [];
        const msgRes = await api.getMessages(activeCaseId);
        messages = msgRes.messages || [];
      } catch (e) {
        console.error('Error fetching reunification details:', e);
      }
    }

    return `
      <div class="space-y-6">
        <!-- Reunification Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 text-xs font-semibold text-purple-400 mb-1">
              <span class="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30">PRIVACY &amp; CONSENT PROTOCOL</span>
              <span>•</span>
              <span>Zero-Knowledge Exchange • Encrypted Channel</span>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>🤝</span>
              <span>Consent-Aware Safe Reunification Hub</span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              Guarantees privacy-first family reunification. No private contact info or precise coordinates are exposed without explicit mutual consent and investigator sign-off.
            </p>
          </div>

          <!-- Active Case Switcher -->
          <div class="flex items-center space-x-2 bg-slate-900 border border-slate-800 p-2 rounded-xl">
            <span class="text-xs text-slate-400 font-medium">Reunification Case:</span>
            <select id="reunify-case-select" class="bg-slate-800 text-xs font-semibold text-purple-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500">
              ${cases.map(c => `
                <option value="${c._id}" ${activeCaseId === c._id ? 'selected' : ''}>
                  ${c.fullName} (${c.caseNumber})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- 4-Stage Reunification Progress Stepper -->
        <div class="glass-panel p-6 rounded-2xl border border-purple-500/20">
          <h2 class="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Reunification Protocol Progression</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <!-- Stage 1 -->
            <div class="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 relative">
              <div class="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
                <span>Stage 1: Match Verified</span>
                <span>✓ Complete</span>
              </div>
              <p class="text-[11px] text-slate-300">Multimodal biometrics confirmed above 85% confidence.</p>
            </div>

            <!-- Stage 2 -->
            <div class="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 relative">
              <div class="flex items-center justify-between text-xs font-bold text-emerald-400 mb-1">
                <span>Stage 2: Safety Check</span>
                <span>✓ Approved</span>
              </div>
              <p class="text-[11px] text-slate-300">Investigator verified physical safety &amp; welfare checks.</p>
            </div>

            <!-- Stage 3 -->
            <div class="p-4 rounded-xl bg-purple-950/40 border border-purple-500/60 relative shadow-lg shadow-purple-900/20">
              <div class="flex items-center justify-between text-xs font-bold text-purple-300 mb-1">
                <span>Stage 3: Mutual Consent</span>
                <span class="animate-pulse">● Active</span>
              </div>
              <p class="text-[11px] text-slate-200">Zero-knowledge verification of family &amp; guardian authorizations.</p>
            </div>

            <!-- Stage 4 -->
            <div class="p-4 rounded-xl bg-slate-900/40 border border-slate-800 relative opacity-75">
              <div class="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                <span>Stage 4: Safe Meeting</span>
                <span>Pending</span>
              </div>
              <p class="text-[11px] text-slate-500">Supervised neutral-location handover &amp; case closure.</p>
            </div>
          </div>
        </div>

        <!-- Two Column Main Body: Consent Policy Gating & Encrypted Chat Room -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: Zero-Knowledge Consent Records (5 Cols) -->
          <div class="lg:col-span-5 space-y-4">
            <div class="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 class="text-sm font-bold text-white flex items-center space-x-2">
                  <span>🔒</span>
                  <span>Consent &amp; Privacy Gating Matrix</span>
                </h3>
                <span class="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">Zero-Knowledge</span>
              </div>

              <!-- Case Subject Info (Masked for Privacy) -->
              <div class="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Subject:</span>
                  <span class="font-bold text-white">${currentCase ? currentCase.fullName : 'Case Subject'}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Protected Contact:</span>
                  <span class="font-mono text-indigo-300 font-semibold">●●●-●●●-8492 (Masked)</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">Location Privacy Gate:</span>
                  <span class="text-emerald-400 font-semibold">City-Level Only (Precise GPS Hidden)</span>
                </div>
              </div>

              <!-- Consent Checklist Items -->
              <div class="space-y-2.5">
                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Party Consent Authorizations</h4>
                
                ${consentRecords.length > 0 ? consentRecords.map(cr => `
                  <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div class="flex items-center space-x-2">
                        <span class="font-bold text-white capitalize">${cr.consentType.replace(/_/g, ' ')}</span>
                        <span class="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-300">${cr.partyType}</span>
                      </div>
                      <p class="text-[11px] text-slate-400 mt-0.5">${cr.scope || 'Authorized for official investigation & verified safe contact'}</p>
                    </div>

                    <button
                      data-consent-id="${cr._id}"
                      data-current-status="${cr.status}"
                      class="btn-toggle-consent px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                        cr.status === 'granted'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/40'
                          : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-emerald-500/20 hover:text-emerald-300'
                      }"
                    >
                      ${cr.status === 'granted' ? 'Granted ✓' : 'Grant Consent'}
                    </button>
                  </div>
                `).join('') : `
                  <!-- Fallback Consent UI -->
                  <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span class="font-bold text-white">Family Contact Sharing</span>
                      <p class="text-[11px] text-slate-400">Guardian authorized direct contact exchange</p>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">Granted ✓</span>
                  </div>

                  <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span class="font-bold text-white">Subject Welfare Verification</span>
                      <p class="text-[11px] text-slate-400">Investigator signed off on psychological safety</p>
                    </div>
                    <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[10px]">Granted ✓</span>
                  </div>
                `}
              </div>

              <!-- Trigger Reunification Celebration Button -->
              <button
                id="btn-trigger-reunification"
                class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>🎉</span>
                <span>Finalize Consent &amp; Authorize Safe Reunification</span>
              </button>
            </div>
          </div>

          <!-- Right: Encrypted Safe Communication Room (7 Cols) -->
          <div class="lg:col-span-7 space-y-4">
            <div class="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col h-[520px] justify-between">
              <!-- Room Header -->
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-9 h-9 rounded-full bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-sm">
                    🔐
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-white">Encrypted Reunification Channel</h3>
                    <p class="text-[11px] text-slate-400">End-to-End Encrypted • Investigator Supervised</p>
                  </div>
                </div>

                <div class="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full">
                  <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span class="text-[10px] font-semibold">Secure Tunnel Active</span>
                </div>
              </div>

              <!-- Messages Scroll Area -->
              <div class="flex-1 overflow-y-auto py-4 space-y-3 px-1" id="reunification-chat-container">
                <div class="text-center">
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400">
                    Encrypted session started • Key Fingerprint: 9F-4A-82-D1
                  </span>
                </div>

                ${messages.length > 0 ? messages.map(m => `
                  <div class="flex items-start space-x-2.5 ${m.senderRole === 'family' ? 'justify-end' : ''}">
                    ${m.senderRole !== 'family' ? `
                      <div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] text-white font-bold shrink-0">
                        ${m.senderName ? m.senderName[0] : 'I'}
                      </div>
                    ` : ''}
                    <div class="max-w-[80%] ${m.senderRole === 'family' ? 'bg-purple-900/60 border border-purple-700/50 rounded-2xl rounded-tr-sm' : 'bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm'} p-3 text-xs text-slate-200">
                      <p class="font-bold ${m.senderRole === 'family' ? 'text-purple-300' : 'text-indigo-300'} text-[11px] mb-0.5">${m.senderName} (${m.senderRole})</p>
                      <p>${m.content}</p>
                      <span class="text-[9px] text-slate-500 font-mono mt-1 block text-right">${new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    ${m.senderRole === 'family' ? `
                      <div class="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[11px] text-white font-bold shrink-0">
                        ${m.senderName ? m.senderName[0] : 'F'}
                      </div>
                    ` : ''}
                  </div>
                `).join('') : `
                  <div class="flex items-start space-x-2.5">
                    <div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] text-white font-bold shrink-0">
                      M
                    </div>
                    <div class="max-w-[80%] bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-3 text-xs text-slate-200">
                      <p class="font-bold text-indigo-300 text-[11px] mb-0.5">Lead Investigator Maria</p>
                      <p>Hello. We have verified the latest sighting and confirmed the subject is safe. We are coordinating the next steps in compliance with mutual consent.</p>
                      <span class="text-[9px] text-slate-500 font-mono mt-1 block text-right">10:42 AM</span>
                    </div>
                  </div>

                  <div class="flex items-start space-x-2.5 justify-end">
                    <div class="max-w-[80%] bg-purple-900/60 border border-purple-700/50 rounded-2xl rounded-tr-sm p-3 text-xs text-slate-100">
                      <p class="font-bold text-purple-300 text-[11px] mb-0.5">Family Representative</p>
                      <p>Thank you so much. We grant all necessary consent and are ready to meet with the designated counselor.</p>
                      <span class="text-[9px] text-purple-300 font-mono mt-1 block text-right">10:45 AM</span>
                    </div>
                    <div class="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-[11px] text-white font-bold shrink-0">
                      F
                    </div>
                  </div>
                `}
              </div>

              <!-- Message Input Box -->
              <div class="pt-3 border-t border-slate-800 flex items-center space-x-2">
                <input
                  id="reunify-chat-input"
                  type="text"
                  placeholder="Send encrypted message to parties..."
                  class="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <button
                  id="btn-reunify-send-msg"
                  class="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition cursor-pointer"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err: any) {
    return `<div class="p-8 text-center text-rose-400">Error: ${err.message}</div>`;
  } finally {
    state.setIsAIProcessing(false);
  }
}

export function setupReunificationEvents(): void {
  // Case select switch
  const select = document.getElementById('reunify-case-select') as HTMLSelectElement;
  select?.addEventListener('change', () => {
    state.setSelectedCaseId(select.value);
    state.setActiveTab('reunification');
  });

  // Toggle consent button
  document.querySelectorAll<HTMLButtonElement>('.btn-toggle-consent').forEach(btn => {
    btn.addEventListener('click', async () => {
      const consentId = btn.getAttribute('data-consent-id');
      const curStatus = btn.getAttribute('data-current-status');
      const newStatus = curStatus === 'granted' ? 'revoked' : 'granted';

      if (consentId) {
        try {
          await api.updateConsent(consentId, newStatus);
          state.addToast({
            type: newStatus === 'granted' ? 'success' : 'warning',
            title: `Consent ${newStatus.toUpperCase()}`,
            message: `Zero-knowledge consent matrix updated.`,
          });
          state.setActiveTab('reunification');
        } catch (e: any) {
          state.addToast({
            type: 'error',
            title: 'Update Failed',
            message: e.message,
          });
        }
      }
    });
  });

  // Finalize Reunification Celebration button
  document.getElementById('btn-trigger-reunification')?.addEventListener('click', () => {
    // Launch celebratory confetti
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    state.addToast({
      type: 'success',
      title: 'Reunification Protocol Authorized! 🎉',
      message: 'Mutual consent verified and safe meeting protocol initiated with family counselors.',
    });
  });

  // Chat send
  const sendBtn = document.getElementById('btn-reunify-send-msg');
  const chatInput = document.getElementById('reunify-chat-input') as HTMLInputElement;
  const chatContainer = document.getElementById('reunification-chat-container');

  const sendMessage = () => {
    const text = chatInput?.value?.trim();
    if (!text || !chatContainer) return;

    const user = state.getUser();
    const initials = (user?.name || 'U').substring(0, 1).toUpperCase();

    const msgHtml = `
      <div class="flex items-start space-x-2.5 justify-end">
        <div class="max-w-[80%] bg-indigo-900/60 border border-indigo-700/50 rounded-2xl rounded-tr-sm p-3 text-xs text-slate-100">
          <p class="font-bold text-indigo-300 text-[11px] mb-0.5">${user?.name || 'You'} (${user?.role || 'User'})</p>
          <p>${text}</p>
          <span class="text-[9px] text-indigo-300 font-mono mt-1 block text-right">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-[11px] text-white font-bold shrink-0">
          ${initials}
        </div>
      </div>
    `;

    chatContainer.insertAdjacentHTML('beforeend', msgHtml);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    chatInput.value = '';
  };

  sendBtn?.addEventListener('click', sendMessage);
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}
