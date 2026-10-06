import { state } from '../state';
import { api } from '../api';

export function renderNewCaseModal(): string {
  return `
    <div id="newcase-modal-backdrop" class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div class="glass-panel-elevated w-full max-w-2xl rounded-2xl border border-slate-700/80 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="p-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div class="flex items-center space-x-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-lg">
              ➕
            </div>
            <div>
              <h2 class="text-base font-bold text-white">Register Missing Person Case</h2>
              <p class="text-[11px] text-slate-400">Creates cryptographically signed case dossier with multimodal biometrics</p>
            </div>
          </div>

          <button id="btn-close-newcase-modal" class="text-slate-400 hover:text-white text-xl p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Form Body (Scrollable) -->
        <form id="form-create-case" class="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <!-- Full Name & Demographics -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="sm:col-span-2 space-y-1">
              <label class="font-bold text-slate-300">Full Legal Name *</label>
              <input
                id="input-case-fullname"
                type="text"
                required
                placeholder="e.g. Liam Michael Vance"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-300">Age *</label>
              <input
                id="input-case-age"
                type="number"
                required
                min="1"
                max="120"
                placeholder="e.g. 17"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-300">Gender *</label>
              <select id="input-case-gender" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-Binary</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="font-bold text-slate-300">Risk Assessment Level *</label>
              <select id="input-case-risk" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                <option value="critical">Critical Risk (Immediate Danger / Vulnerable)</option>
                <option value="high" selected>High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>
          </div>

          <!-- Last Seen Info -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-300">Last Seen Date *</label>
              <input
                id="input-case-date"
                type="date"
                required
                value="${new Date().toISOString().split('T')[0]}"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-300">City *</label>
              <input
                id="input-case-city"
                type="text"
                required
                placeholder="e.g. Seattle"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-300">State *</label>
              <input
                id="input-case-state"
                type="text"
                required
                placeholder="e.g. WA"
                class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <!-- Photo URL -->
          <div class="space-y-1">
            <label class="font-bold text-slate-300">Primary Reference Photo URL *</label>
            <input
              id="input-case-photo"
              type="text"
              required
              value="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500"
              class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <!-- Physical Features & Distinguishing Marks -->
          <div class="grid grid-cols-3 gap-3">
            <div class="space-y-1">
              <label class="font-bold text-slate-300">Height (cm)</label>
              <input id="input-case-height" type="number" placeholder="175" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-300">Hair Color</label>
              <input id="input-case-hair" type="text" placeholder="Brown" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
            </div>
            <div class="space-y-1">
              <label class="font-bold text-slate-300">Eye Color</label>
              <input id="input-case-eyes" type="text" placeholder="Hazel" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
            </div>
          </div>

          <!-- Distinguishing Marks -->
          <div class="space-y-1">
            <label class="font-bold text-slate-300">Distinguishing Features / Tattoos (comma-separated)</label>
            <input id="input-case-marks" type="text" placeholder="e.g. Small scar above left eyebrow, compass tattoo on right wrist" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" />
          </div>

          <!-- Circumstances Narrative -->
          <div class="space-y-1">
            <label class="font-bold text-slate-300">Circumstances Narrative *</label>
            <textarea id="input-case-circumstances" rows="3" required placeholder="Describe last known location, who they were with, emotional state, vehicle, or transit direction..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none"></textarea>
          </div>

          <!-- Privacy & Consent Options -->
          <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span class="font-bold text-slate-200 block uppercase text-[10px] tracking-wider">Privacy &amp; Reunification Safeguards</span>
            
            <label class="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input type="checkbox" id="input-case-public-sightings" checked class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0" />
              <span>Allow verified public witnesses to submit sighting leads</span>
            </label>

            <label class="flex items-center space-x-2 text-slate-300 cursor-pointer">
              <input type="checkbox" id="input-case-req-approval" checked class="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0" />
              <span>Require investigator verification before releasing contact information</span>
            </label>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>💾</span>
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
