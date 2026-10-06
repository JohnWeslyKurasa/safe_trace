import { state } from '../state';
import { api } from '../api';
import type { MissingCase, ConsentRecord, SecureMessage } from '../types';
import confetti from 'canvas-confetti';
import { icon } from '../icons';

export async function renderReunificationView(): Promise<string> {
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
            <div class="flex items-center space-x-2 text-xs font-bold text-[#733f9f] mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-[#f4ecfb] border border-[#dfcceb] tracking-wider text-[10px] uppercase font-bold">
                Privacy &amp; Consent Protocol
              </span>
              <span class="text-[#c5a4db]">•</span>
              <span class="text-[#786a89]">Zero-Knowledge Exchange • Encrypted Channel</span>
            </div>
            <h1 class="text-2xl font-bold text-[#231c2d] tracking-tight flex items-center space-x-2">
              <span>${icon('handshake', 'w-6 h-6 text-[#8c55bd]')}</span>
              <span>Consent-Aware Safe Reunification Hub</span>
            </h1>
            <p class="text-xs text-[#786a89] mt-1">
              Guarantees privacy-first family reunification. No private contact info or precise coordinates are exposed without explicit mutual consent and investigator sign-off.
            </p>
          </div>

          <!-- Active Case Switcher -->
          <div class="flex items-center space-x-2 bg-white border border-[#dfcceb] p-2 rounded-2xl shadow-xs">
            <span class="text-xs text-[#786a89] font-medium">Reunification Case:</span>
            <select id="reunify-case-select" class="bg-[#fbf8f2] text-xs font-bold text-[#3c2355] border border-[#dfcfb6] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8c55bd] cursor-pointer">
              ${cases.map(c => `
                <option value="${c._id}" ${activeCaseId === c._id ? 'selected' : ''}>
                  ${c.fullName} (${c.caseNumber})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- 4-Stage Reunification Progress Stepper -->
        <div class="glass-panel p-6 rounded-2xl">
          <h2 class="text-xs font-bold text-[#786a89] uppercase tracking-wider mb-4">Reunification Protocol Progression</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <!-- Stage 1 -->
            <div class="p-4 rounded-xl bg-[#edf7f1] border border-[#b8e2c8] relative">
              <div class="flex items-center justify-between text-xs font-bold text-[#385c47] mb-1">
                <span>Stage 1: Match Verified</span>
                <span class="flex items-center space-x-1">${icon('check', 'w-3.5 h-3.5 text-[#5b8a6f]')}<span>Complete</span></span>
              </div>
              <p class="text-[11px] text-[#594c6d]">Multimodal biometrics confirmed above 85% threshold.</p>
            </div>

            <!-- Stage 2 -->
            <div class="p-4 rounded-xl bg-[#edf7f1] border border-[#b8e2c8] relative">
              <div class="flex items-center justify-between text-xs font-bold text-[#385c47] mb-1">
                <span>Stage 2: Safety Check</span>
                <span class="flex items-center space-x-1">${icon('check', 'w-3.5 h-3.5 text-[#5b8a6f]')}<span>Approved</span></span>
              </div>
              <p class="text-[11px] text-[#594c6d]">Investigator verified physical safety &amp; welfare checks.</p>
            </div>

            <!-- Stage 3 -->
            <div class="p-4 rounded-xl bg-[#f4ecfb] border border-[#aa7dc8] relative shadow-xs">
              <div class="flex items-center justify-between text-xs font-bold text-[#5c3280] mb-1">
                <span>Stage 3: Mutual Consent</span>
                <span class="flex items-center space-x-1 text-[#8c55bd]"><span class="h-2 w-2 rounded-full bg-[#8c55bd] animate-pulse"></span><span>Active</span></span>
              </div>
              <p class="text-[11px] text-[#594c6d]">Zero-knowledge verification of family &amp; guardian authorizations.</p>
            </div>

            <!-- Stage 4 -->
            <div class="p-4 rounded-xl bg-[#f6f0e4]/50 border border-[#dfcfb6] relative opacity-70">
              <div class="flex items-center justify-between text-xs font-bold text-[#88799e] mb-1">
                <span>Stage 4: Safe Meeting</span>
                <span>Pending</span>
              </div>
              <p class="text-[11px] text-[#88799e]">Supervised neutral-location handover &amp; case closure.</p>
            </div>
          </div>
        </div>

        <!-- Two Column Main Body: Consent Policy Gating & Encrypted Chat Room -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: Zero-Knowledge Consent Records (5 Cols) -->
          <div class="lg:col-span-5 space-y-4">
            <div class="glass-panel p-5 rounded-2xl space-y-4">
              <div class="flex items-center justify-between border-b border-black/5 pb-3">
                <h3 class="text-sm font-bold text-[#231c2d] flex items-center space-x-2">
                  <span>${icon('lock', 'w-4 h-4 text-[#8c55bd]')}</span>
                  <span>Consent &amp; Privacy Gating Matrix</span>
                </h3>
                <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f4ecfb] text-[#733f9f] border border-[#dfcceb] font-bold">Zero-Knowledge</span>
              </div>

              <!-- Case Subject Info (Masked for Privacy) -->
              <div class="p-3.5 rounded-xl bg-[#fbf8f2] border border-[#dfcfb6] text-xs space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-[#786a89]">Subject:</span>
                  <span class="font-bold text-[#231c2d]">${currentCase ? currentCase.fullName : 'Case Subject'}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[#786a89]">Protected Contact:</span>
                  <span class="font-mono text-[#733f9f] font-bold">●●●-●●●-8492 (Masked)</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-[#786a89]">Location Privacy Gate:</span>
                  <span class="text-[#385c47] font-bold">City-Level Only (GPS Hidden)</span>
                </div>
              </div>

              <!-- Consent Checklist Items -->
              <div class="space-y-2.5">
                <h4 class="text-xs font-bold text-[#786a89] uppercase tracking-wider">Party Consent Authorizations</h4>
                
                ${consentRecords.length > 0 ? consentRecords.map(cr => `
                  <div class="p-3 rounded-xl bg-white border border-[#dfcfb6] flex items-center justify-between text-xs shadow-xs">
                    <div>
                      <div class="flex items-center space-x-2">
                        <span class="font-bold text-[#231c2d] capitalize">${cr.consentType.replace(/_/g, ' ')}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-full font-mono bg-[#f4ecfb] text-[#733f9f]">${cr.partyType}</span>
                      </div>
                      <p class="text-[11px] text-[#786a89] mt-0.5">${cr.scope || 'Authorized for official investigation & verified safe contact'}</p>
                    </div>

                    <button
                      data-consent-id="${cr._id}"
                      data-current-status="${cr.status}"
                      class="btn-toggle-consent px-3 py-1 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                        cr.status === 'granted'
                          ? 'bg-[#edf7f1] text-[#385c47] border border-[#b8e2c8] hover:bg-[#fce8ea] hover:text-[#b85b67]'
                          : 'bg-[#f6f0e4] text-[#6f5f48] border border-[#dfcfb6] hover:bg-[#edf7f1] hover:text-[#385c47]'
                      }"
                    >
                      ${cr.status === 'granted' ? 'Granted' : 'Grant Consent'}
                    </button>
                  </div>
                `).join('') : `
                  <div class="p-3 rounded-xl bg-white border border-[#dfcfb6] flex items-center justify-between text-xs shadow-xs">
                    <div>
                      <span class="font-bold text-[#231c2d]">Family Contact Sharing</span>
                      <p class="text-[11px] text-[#786a89]">Guardian authorized direct contact exchange</p>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full bg-[#edf7f1] text-[#385c47] border border-[#b8e2c8] font-bold text-[10px]">Granted</span>
                  </div>

                  <div class="p-3 rounded-xl bg-white border border-[#dfcfb6] flex items-center justify-between text-xs shadow-xs">
                    <div>
                      <span class="font-bold text-[#231c2d]">Subject Welfare Verification</span>
                      <p class="text-[11px] text-[#786a89]">Investigator signed off on psychological safety</p>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full bg-[#edf7f1] text-[#385c47] border border-[#b8e2c8] font-bold text-[10px]">Granted</span>
                  </div>
                `}
              </div>

              <!-- Trigger Reunification Celebration Button -->
              <button
                id="btn-trigger-reunification"
                class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white font-bold text-xs shadow-sm shadow-[#8c55bd]/20 transition cursor-pointer flex items-center justify-center space-x-2 active:scale-98"
              >
                ${icon('heart', 'w-4 h-4 text-white')}
                <span>Authorize Safe Reunification Meeting</span>
              </button>
            </div>
          </div>

          <!-- Right: Encrypted Safe Communication Room (7 Cols) -->
          <div class="lg:col-span-7 space-y-4">
            <div class="glass-panel p-5 rounded-2xl flex flex-col h-[520px] justify-between">
              <!-- Room Header -->
              <div class="flex items-center justify-between border-b border-black/5 pb-3">
                <div class="flex items-center space-x-3">
                  <div class="w-9 h-9 rounded-xl bg-[#f4ecfb] border border-[#dfcceb] flex items-center justify-center text-[#8c55bd]">
                    ${icon('lock', 'w-4 h-4 text-[#8c55bd]')}
                  </div>
                  <div>
                    <h3 class="text-sm font-bold text-[#231c2d]">Encrypted Reunification Channel</h3>
                    <p class="text-[11px] text-[#786a89]">End-to-End Encrypted • Supervised by Assigned Crisis Counselor</p>
                  </div>
                </div>

                <div class="flex items-center space-x-1.5 text-xs text-[#385c47] bg-[#edf7f1] border border-[#b8e2c8] px-2.5 py-1 rounded-full">
                  <span class="h-2 w-2 rounded-full bg-[#5b8a6f] animate-pulse"></span>
                  <span class="text-[10px] font-bold">Secure Tunnel Active</span>
                </div>
              </div>

              <!-- Messages Scroll Area -->
              <div class="flex-1 overflow-y-auto py-4 space-y-3 px-1" id="reunification-chat-container">
                <div class="text-center">
                  <span class="px-3 py-1 rounded-full text-[10px] font-mono bg-[#f6f0e4] border border-[#dfcfb6] text-[#6f5f48]">
                    Encrypted session active • Key Fingerprint: 9F-4A-82-D1
                  </span>
                </div>

                ${messages.length > 0 ? messages.map(m => `
                  <div class="flex items-start space-x-2.5 ${m.senderRole === 'family' ? 'justify-end' : ''}">
                    ${m.senderRole !== 'family' ? `
                      <div class="w-7 h-7 rounded-xl bg-[#8c55bd] flex items-center justify-center text-[11px] text-white font-bold shrink-0">
                        ${m.senderName ? m.senderName[0] : 'I'}
                      </div>
                    ` : ''}
                    <div class="max-w-[80%] ${m.senderRole === 'family' ? 'bg-[#f4ecfb] border border-[#dfcceb] rounded-2xl rounded-tr-sm text-[#231c2d]' : 'bg-[#fbf8f2] border border-[#dfcfb6] rounded-2xl rounded-tl-sm text-[#231c2d]'} p-3.5 text-xs shadow-xs">
                      <p class="font-bold ${m.senderRole === 'family' ? 'text-[#733f9f]' : 'text-[#6f5f48]'} text-[11px] mb-0.5">${m.senderName} (${m.senderRole})</p>
                      <p class="text-[#3c3449]">${m.content}</p>
                      <span class="text-[9px] text-[#88799e] font-mono mt-1 block text-right">${new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    ${m.senderRole === 'family' ? `
                      <div class="w-7 h-7 rounded-xl bg-[#cbba9d] flex items-center justify-center text-[11px] text-[#231c2d] font-bold shrink-0">
                        ${m.senderName ? m.senderName[0] : 'F'}
                      </div>
                    ` : ''}
                  </div>
                `).join('') : `
                  <div class="flex items-start space-x-2.5">
                    <div class="w-7 h-7 rounded-xl bg-[#8c55bd] flex items-center justify-center text-[11px] text-white font-bold shrink-0">
                      M
                    </div>
                    <div class="max-w-[80%] bg-[#fbf8f2] border border-[#dfcfb6] rounded-2xl rounded-tl-sm p-3.5 text-xs text-[#231c2d] shadow-xs">
                      <p class="font-bold text-[#733f9f] text-[11px] mb-0.5">Lead Investigator Maria</p>
                      <p class="text-[#3c3449]">Hello. We have verified the latest sighting and confirmed the subject is safe. We are coordinating the next steps in compliance with mutual consent.</p>
                      <span class="text-[9px] text-[#88799e] font-mono mt-1 block text-right">10:42 AM</span>
                    </div>
                  </div>

                  <div class="flex items-start space-x-2.5 justify-end">
                    <div class="max-w-[80%] bg-[#f4ecfb] border border-[#dfcceb] rounded-2xl rounded-tr-sm p-3.5 text-xs text-[#231c2d] shadow-xs">
                      <p class="font-bold text-[#6f5f48] text-[11px] mb-0.5">Family Representative</p>
                      <p class="text-[#3c3449]">Thank you so much. We grant all necessary consent and are ready to meet with the designated counselor.</p>
                      <span class="text-[9px] text-[#88799e] font-mono mt-1 block text-right">10:45 AM</span>
                    </div>
                    <div class="w-7 h-7 rounded-xl bg-[#cbba9d] flex items-center justify-center text-[11px] text-[#231c2d] font-bold shrink-0">
                      F
                    </div>
                  </div>
                `}
              </div>

              <!-- Message Input Box -->
              <div class="pt-3 border-t border-black/5 flex items-center space-x-2">
                <input
                  id="reunify-chat-input"
                  type="text"
                  placeholder="Send encrypted message to parties..."
                  class="flex-1 bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
                />
                <button
                  id="btn-reunify-send-msg"
                  class="px-5 py-2 rounded-xl bg-[#8c55bd] hover:bg-[#733f9f] text-white font-bold text-xs shadow-xs transition cursor-pointer"
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
    return `<div class="p-8 text-center text-[#b85b67]">Error: ${err.message}</div>`;
  }
}

export function setupReunificationEvents(): void {
  const select = document.getElementById('reunify-case-select') as HTMLSelectElement;
  select?.addEventListener('change', () => {
    state.setSelectedCaseId(select.value);
    state.setActiveTab('reunification');
  });

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

  document.getElementById('btn-trigger-reunification')?.addEventListener('click', () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    state.addToast({
      type: 'success',
      title: 'Reunification Protocol Authorized',
      message: 'Mutual consent verified and safe meeting protocol initiated with family counselors.',
    });
  });

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
        <div class="max-w-[80%] bg-[#f4ecfb] border border-[#dfcceb] rounded-2xl rounded-tr-sm p-3.5 text-xs text-[#231c2d] shadow-xs">
          <p class="font-bold text-[#733f9f] text-[11px] mb-0.5">${user?.name || 'You'} (${user?.role || 'User'})</p>
          <p class="text-[#3c3449]">${text}</p>
          <span class="text-[9px] text-[#88799e] font-mono mt-1 block text-right">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="w-7 h-7 rounded-xl bg-[#8c55bd] flex items-center justify-center text-[11px] text-white font-bold shrink-0">
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
