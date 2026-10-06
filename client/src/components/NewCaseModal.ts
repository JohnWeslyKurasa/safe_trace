import { state } from '../state';
import { api } from '../api';
import { icon } from '../icons';

export function renderNewCaseModal(): string {
  return `
    <div id="newcase-modal-backdrop" class="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="glass-panel-elevated w-full max-w-2xl rounded-3xl border border-[#dfcceb] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="p-5 border-b border-[#dfcceb] bg-[#faf6fd] flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-2xl bg-[#f4ecfb] border border-[#dfcceb] flex items-center justify-center text-[#8c55bd]">
              ${icon('plus', 'w-5 h-5 text-[#8c55bd]')}
            </div>
            <div>
              <h2 class="text-base font-bold text-[#231c2d]">Register Missing Person Case</h2>
              <p class="text-[11px] text-[#786a89]">Creates cryptographically signed case dossier with multimodal biometrics</p>
            </div>
          </div>

          <button id="btn-close-newcase-modal" class="text-[#786a89] hover:text-[#231c2d] p-2 rounded-xl hover:bg-[#f4ecfb] transition cursor-pointer">
            ${icon('x', 'w-4 h-4')}
          </button>
        </div>

        <!-- Form Body (Scrollable) -->
        <form id="form-create-case" class="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <!-- Full Name & Demographics -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2 space-y-1.5">
              <label class="font-bold text-[#231c2d]">Full Legal Name *</label>
              <input
                id="input-case-fullname"
                type="text"
                required
                placeholder="e.g. Liam Michael Vance"
                class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
              />
            </div>
            <div class="space-y-1.5">
              <label class="font-bold text-[#231c2d]">Age *</label>
              <input
                id="input-case-age"
                type="number"
                required
                min="1"
                max="120"
                placeholder="e.g. 17"
                class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <label class="font-bold text-[#231c2d]">Gender *</label>
              <select id="input-case-gender" class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-Binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="space-y-1.5">
              <label class="font-bold text-[#231c2d]">Risk Assessment Level *</label>
              <select id="input-case-risk" class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]">
                <option value="critical">Critical Risk (Immediate Danger / Vulnerable)</option>
                <option value="high" selected>High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          </div>

          <!-- Last Seen Info -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1.5">
              <label class="font-bold text-[#231c2d]">Last Seen Date *</label>
              <input
                id="input-case-date"
                type="date"
                required
                value="${new Date().toISOString().split('T')[0]}"
                class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
              />
            </div>
            <div class="space-y-1.5">
              <label class="font-bold text-[#231c2d]">City *</label>
              <input
                id="input-case-city"
                type="text"
                required
                placeholder="e.g. Seattle"
                class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
              />
            </div>
            <div class="space-y-1.5">
              <label class="font-bold text-[#231c2d]">State *</label>
              <input
                id="input-case-state"
                type="text"
                required
                placeholder="e.g. WA"
                class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
              />
            </div>
          </div>

          <!-- Photo URL -->
          <div class="space-y-1.5">
            <label class="font-bold text-[#231c2d]">Primary Reference Photo URL *</label>
            <input
              id="input-case-photo"
              type="text"
              required
              value="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500"
              class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
            />
          </div>

          <!-- Physical Features & Distinguishing Marks -->
          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1.5">
              <label class="font-bold text-[#231c2d]">Height (cm)</label>
              <input id="input-case-height" type="number" placeholder="175" class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] focus:outline-none" />
            </div>
            <div class="space-y-1.5">
              <label class="font-bold text-[#231c2d]">Hair Color</label>
              <input id="input-case-hair" type="text" placeholder="Brown" class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] focus:outline-none" />
            </div>
            <div class="space-y-1.5">
              <label class="font-bold text-[#231c2d]">Eye Color</label>
              <input id="input-case-eyes" type="text" placeholder="Hazel" class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] focus:outline-none" />
            </div>
          </div>

          <!-- Distinguishing Marks -->
          <div class="space-y-1.5">
            <label class="font-bold text-[#231c2d]">Distinguishing Features / Tattoos</label>
            <input id="input-case-marks" type="text" placeholder="e.g. Small scar above left eyebrow, compass tattoo on right wrist" class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] focus:outline-none" />
          </div>

          <!-- Circumstances Narrative -->
          <div class="space-y-1.5">
            <label class="font-bold text-[#231c2d]">Circumstances Narrative *</label>
            <textarea id="input-case-circumstances" rows="3" required placeholder="Describe last known location, who they were with, emotional state, vehicle, or transit direction..." class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl p-3 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none"></textarea>
          </div>

          <!-- Privacy & Consent Options -->
          <div class="p-4 rounded-2xl bg-[#fbf8f2] border border-[#dfcfb6] space-y-2">
            <span class="font-bold text-[#231c2d] block uppercase text-[10px] tracking-wider">Privacy &amp; Reunification Safeguards</span>
            
            <label class="flex items-center space-x-2 text-[#594c6d] cursor-pointer">
              <input type="checkbox" id="input-case-public-sightings" checked class="rounded bg-white border-[#dfcfb6] text-[#8c55bd] focus:ring-0" />
              <span class="font-medium">Allow verified public witnesses to submit sighting leads</span>
            </label>

            <label class="flex items-center space-x-2 text-[#594c6d] cursor-pointer">
              <input type="checkbox" id="input-case-req-approval" checked class="rounded bg-white border-[#dfcfb6] text-[#8c55bd] focus:ring-0" />
              <span class="font-medium">Require investigator verification before releasing contact information</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white font-bold text-xs shadow-sm shadow-[#8c55bd]/20 transition cursor-pointer flex items-center justify-center space-x-2 active:scale-98"
          >
            <span>${icon('check', 'w-4 h-4 text-white')}</span>
            <span>Sign &amp; Register Case Dossier</span>
          </button>
        </form>
      </div>
    </div>
  `;
}

export function setupNewCaseModal(): void {
  const backdrop = document.getElementById('newcase-modal-backdrop');
  const closeBtn = document.getElementById('btn-close-newcase-modal');
  const form = document.getElementById('form-create-case');

  const closeModal = () => backdrop?.remove();

  closeBtn?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = (document.getElementById('input-case-fullname') as HTMLInputElement)?.value;
    const age = parseInt((document.getElementById('input-case-age') as HTMLInputElement)?.value || '20');
    const gender = (document.getElementById('input-case-gender') as HTMLSelectElement)?.value as any;
    const riskLevel = (document.getElementById('input-case-risk') as HTMLSelectElement)?.value as any;
    const lastSeenDate = (document.getElementById('input-case-date') as HTMLInputElement)?.value;
    const city = (document.getElementById('input-case-city') as HTMLInputElement)?.value;
    const stateVal = (document.getElementById('input-case-state') as HTMLInputElement)?.value;
    const photoUrl = (document.getElementById('input-case-photo') as HTMLInputElement)?.value;
    const heightCm = parseInt((document.getElementById('input-case-height') as HTMLInputElement)?.value || '0');
    const hairColor = (document.getElementById('input-case-hair') as HTMLInputElement)?.value;
    const eyeColor = (document.getElementById('input-case-eyes') as HTMLInputElement)?.value;
    const marks = (document.getElementById('input-case-marks') as HTMLInputElement)?.value;
    const circumstances = (document.getElementById('input-case-circumstances') as HTMLTextAreaElement)?.value;
    const allowPublicSightings = (document.getElementById('input-case-public-sightings') as HTMLInputElement)?.checked;
    const requireInvestigatorApproval = (document.getElementById('input-case-req-approval') as HTMLInputElement)?.checked;

    try {
      state.setIsAIProcessing(true);
      await api.createCase({
        fullName,
        age,
        gender,
        riskLevel,
        status: 'active',
        lastSeenDate: new Date(lastSeenDate).toISOString(),
        lastSeenLocation: {
          address: `${city}, ${stateVal}`,
          city,
          state: stateVal,
          country: 'USA',
          coordinates: { lat: 37.7749 + (Math.random() - 0.5) * 0.1, lng: -122.4194 + (Math.random() - 0.5) * 0.1 }
        },
        physicalDescription: {
          heightCm: heightCm || undefined,
          hairColor,
          eyeColor,
          distinguishingFeatures: marks ? marks.split(',').map(s => s.trim()) : [],
        },
        photos: [{ url: photoUrl, isPrimary: true, caption: 'Registration photo' }],
        circumstances,
        contactConsent: {
          allowPublicSightings,
          requireInvestigatorApproval,
          allowDirectReunificationContact: false,
        }
      });

      state.addToast({
        type: 'success',
        title: 'Case Registered Successfully',
        message: `Case dossier created with active multimodal monitoring.`,
      });

      closeModal();
      state.setActiveTab('cases');
    } catch (err: any) {
      state.addToast({
        type: 'error',
        title: 'Case Creation Failed',
        message: err.message,
      });
    } finally {
      state.setIsAIProcessing(false);
    }
  });
}
