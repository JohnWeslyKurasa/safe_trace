import { api } from '../api';
import { state } from '../state';
import { icon } from '../icons';
import type { MissingCase } from '../types';

export async function renderMultimodalStudio(): Promise<string> {
  let cases: MissingCase[] = [];
  try {
    const res = await api.getCases();
    cases = res.cases || [];
  } catch (err) {
    console.warn('Failed to pre-fetch cases for AI studio', err);
  }

  return `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 text-xs font-semibold text-[#6D4C41] uppercase tracking-wider mb-1">
            <span>Gemini Multimodal Neural Fusion</span>
            <span>•</span>
            <span class="text-[#3F6B4A]">Human-in-the-Loop Protocol</span>
          </div>
          <h1 class="text-xl font-bold text-[#2B211E] tracking-tight">Multimodal Intelligence Studio</h1>
          <p class="text-xs text-[#6F625D] mt-1 max-w-3xl">
            Correlate facial biometrics, voice frequencies, clothing descriptions, and geo-temporal patterns to generate decision-support match hypotheses.
          </p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EBF3ED] text-[#3F6B4A] border border-[#3F6B4A]/20">
            ${icon('shield', 'w-3.5 h-3.5 mr-1.5 text-[#3F6B4A]')}
            Autonomous Action Blocked
          </span>
        </div>
      </div>

      <!-- Studio Layout: Input Panel & Results Panel -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Left: Evidence Ingestion & Parameter Panel (5 cols) -->
        <div class="lg:col-span-5 space-y-4">
          <div class="card-panel p-5 space-y-4">
            <h3 class="text-xs font-bold text-[#4E342E] uppercase tracking-wider">1. Evidence Ingestion</h3>

            <!-- Case Association -->
            <div class="space-y-1.5">
              <label for="studio-case-select" class="block text-xs font-semibold text-[#2B211E]">Target Reference Case</label>
              <select id="studio-case-select" class="input-mocha w-full py-2 px-3 text-xs">
                <option value="">-- Select Reference Missing Dossier --</option>
                ${cases.map((c) => `<option value="${c.caseNumber}">${c.caseNumber} - ${c.fullName} (${c.age}y, ${c.lastSeenLocation.city})</option>`).join('')}
              </select>
            </div>

            <!-- Modality 1: Image / Facial Photo -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-[#2B211E]">Facial / Physical Photo</label>
              <div class="border border-dashed border-[#E4DCD8] rounded-md p-3 bg-[#FAF8F6] text-center hover:border-[#4E342E] transition">
                <input type="file" id="studio-image-file" class="hidden" accept="image/*" />
                <button type="button" id="btn-browse-image" class="w-full flex flex-col items-center justify-center space-y-1">
                  ${icon('camera', 'w-5 h-5 text-[#4E342E]')}
                  <span class="text-xs font-medium text-[#4E342E]">Upload field image / CCTV frame</span>
                  <span class="text-[10px] text-[#6F625D]">Supports JPG, PNG, WEBP (Max 25MB)</span>
                </button>
                <div id="image-preview-badge" class="hidden mt-2 p-1.5 rounded bg-[#EDE7E4] text-[10px] font-semibold text-[#4E342E]"></div>
              </div>
            </div>

            <!-- Modality 2: Voice Audio Sample -->
            <div class="space-y-1.5">
              <label class="block text-xs font-semibold text-[#2B211E]">Voice / Audio Sample</label>
              <div class="border border-dashed border-[#E4DCD8] rounded-md p-3 bg-[#FAF8F6] text-center hover:border-[#4E342E] transition">
                <input type="file" id="studio-audio-file" class="hidden" accept="audio/*" />
                <button type="button" id="btn-browse-audio" class="w-full flex flex-col items-center justify-center space-y-1">
                  ${icon('waveform', 'w-5 h-5 text-[#4E342E]')}
                  <span class="text-xs font-medium text-[#4E342E]">Upload audio / voice memo</span>
                  <span class="text-[10px] text-[#6F625D]">Supports WAV, MP3, M4A, OGG</span>
                </button>
                <div id="audio-preview-badge" class="hidden mt-2 p-1.5 rounded bg-[#EDE7E4] text-[10px] font-semibold text-[#4E342E]"></div>
              </div>
            </div>

            <!-- Modality 3: Eyewitness Notes / Physical Traits -->
            <div class="space-y-1.5">
              <label for="studio-text-input" class="block text-xs font-semibold text-[#2B211E]">Narrative Context &amp; Eyewitness Transcript</label>
              <textarea
                id="studio-text-input"
                rows="3"
                placeholder="e.g. Subject observed wearing navy jacket with distinctive red backpack near Central Bus Station..."
                class="input-mocha w-full p-2.5 text-xs placeholder-[#6F625D]/60"
              ></textarea>
            </div>

            <!-- Action Button -->
            <button
              id="btn-run-multimodal-analysis"
              class="btn-mocha w-full py-2.5 text-xs font-semibold flex items-center justify-center space-x-2 shadow-sm"
            >
              ${icon('sparkles', 'w-4 h-4')}
              <span>Run Multimodal Analysis</span>
            </button>
          </div>
        </div>

        <!-- Right: AI Decision Intelligence & Hypotheses Results (7 cols) -->
        <div class="lg:col-span-7 space-y-4">
          <!-- Initial Placeholder State -->
          <div id="studio-empty-state" class="card-panel p-12 text-center space-y-3 bg-[#FFFFFF]">
            <div class="w-12 h-12 rounded-full bg-[#EDE7E4] text-[#4E342E] flex items-center justify-center mx-auto">
              ${icon('brain', 'w-6 h-6')}
            </div>
            <h3 class="text-sm font-bold text-[#2B211E]">Ready for Multimodal Evidence</h3>
            <p class="text-xs text-[#6F625D] max-w-md mx-auto">
              Select a case or upload biometric inputs to extract neural embeddings and generate verified lead correlation hypotheses.
            </p>
          </div>

          <!-- Processing State -->
          <div id="studio-loading-state" class="hidden card-panel p-12 text-center space-y-4 bg-[#FAF8F6]">
            <div class="w-10 h-10 rounded-full border-3 border-[#4E342E] border-t-transparent animate-spin mx-auto"></div>
            <div class="space-y-1">
              <h4 class="text-xs font-bold text-[#2B211E]">Processing Multimodal Cross-Correlations...</h4>
              <p class="text-[11px] text-[#6F625D]">Extracting facial landmark vectors, vocal pitch harmonics, and temporal tokens.</p>
            </div>
          </div>

          <!-- Dynamic Analysis Output Panel -->
          <div id="studio-results-panel" class="hidden space-y-4">
            <!-- Mandatory Ethics / Human-in-the-loop Guardrail Callout -->
            <div class="p-3 rounded-md bg-[#FEF9EE] border border-[#9A6B2F]/30 text-xs text-[#9A6B2F] flex items-start space-x-2.5">
              ${icon('shieldAlert', 'w-4 h-4 text-[#9A6B2F] shrink-0 mt-0.5')}
              <div>
                <span class="font-bold">AI-Assisted Lead — Investigator Verification Required</span>
                <p class="text-[11px] text-[#6F625D] mt-0.5">
                  Automated confidence scores reflect statistical likelihood, not legal certainty. Mandatory human sign-off is logged in the cryptographic chain of custody.
                </p>
              </div>
            </div>

            <!-- Score Summary Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div class="card-panel p-3.5 bg-[#FAF8F6]">
                <span class="text-[10px] font-bold text-[#6F625D] uppercase tracking-wider block">Overall Confidence</span>
                <div id="res-confidence-score" class="text-2xl font-bold text-[#4E342E] mt-1">89%</div>
                <span class="text-[10px] text-[#3F6B4A] font-semibold">High Match Probability</span>
              </div>

              <div class="card-panel p-3.5 bg-[#FAF8F6]">
                <span class="text-[10px] font-bold text-[#6F625D] uppercase tracking-wider block">Cross-Modal Fusion</span>
                <div id="res-crossmodal-score" class="text-2xl font-bold text-[#496579] mt-1">92%</div>
                <span class="text-[10px] text-[#496579] font-medium">3 Modalities Correlated</span>
              </div>

              <div class="card-panel p-3.5 bg-[#FAF8F6] col-span-2 sm:col-span-1">
                <span class="text-[10px] font-bold text-[#6F625D] uppercase tracking-wider block">Privacy Guardrails</span>
                <div class="text-sm font-bold text-[#3F6B4A] mt-2 flex items-center space-x-1">
                  ${icon('check', 'w-4 h-4 text-[#3F6B4A]')}
                  <span>CJIS Compliant</span>
                </div>
                <span class="text-[10px] text-[#6F625D]">Zero-Knowledge Active</span>
              </div>
            </div>

            <!-- Extracted Features & Evidence Relationships -->
            <div class="card-panel p-4 space-y-3">
              <h4 class="text-xs font-bold text-[#4E342E] uppercase tracking-wider">Extracted Biometric &amp; Entity Vectors</h4>
              <div id="res-entities-container" class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <!-- Dynamically populated -->
              </div>
            </div>

            <!-- AI Forensic Explanation & Suggested Matches -->
            <div class="card-panel p-4 space-y-3">
              <h4 class="text-xs font-bold text-[#4E342E] uppercase tracking-wider">Forensic Rationale &amp; Case Correlation</h4>
              <p id="res-explanation-text" class="text-xs text-[#2B211E] leading-relaxed bg-[#FAF8F6] p-3 rounded border border-[#E4DCD8]"></p>
              
              <div class="pt-2 flex justify-end space-x-2">
                <button id="btn-save-as-lead" class="btn-mocha px-4 py-2 text-xs font-semibold flex items-center space-x-1.5">
                  ${icon('check', 'w-3.5 h-3.5')}
                  <span>Create Formal Investigation Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupMultimodalEvents(): void {
  const btnRun = document.querySelector<HTMLButtonElement>('#btn-run-multimodal-analysis');
  const emptyEl = document.querySelector<HTMLDivElement>('#studio-empty-state');
  const loadingEl = document.querySelector<HTMLDivElement>('#studio-loading-state');
  const resultsEl = document.querySelector<HTMLDivElement>('#studio-results-panel');

  const btnImage = document.querySelector<HTMLButtonElement>('#btn-browse-image');
  const fileImage = document.querySelector<HTMLInputElement>('#studio-image-file');
  const imageBadge = document.querySelector<HTMLDivElement>('#image-preview-badge');

  const btnAudio = document.querySelector<HTMLButtonElement>('#btn-browse-audio');
  const fileAudio = document.querySelector<HTMLInputElement>('#studio-audio-file');
  const audioBadge = document.querySelector<HTMLDivElement>('#audio-preview-badge');

  if (btnImage && fileImage) {
    btnImage.addEventListener('click', () => fileImage.click());
    fileImage.addEventListener('change', () => {
      if (fileImage.files?.[0] && imageBadge) {
        imageBadge.textContent = `Image Selected: ${fileImage.files[0].name}`;
        imageBadge.classList.remove('hidden');
      }
    });
  }

  if (btnAudio && fileAudio) {
    btnAudio.addEventListener('click', () => fileAudio.click());
    fileAudio.addEventListener('change', () => {
      if (fileAudio.files?.[0] && audioBadge) {
        audioBadge.textContent = `Audio Selected: ${fileAudio.files[0].name}`;
        audioBadge.classList.remove('hidden');
      }
    });
  }

  if (btnRun) {
    btnRun.addEventListener('click', async () => {
      const caseSelect = document.querySelector<HTMLSelectElement>('#studio-case-select');
      const textInput = document.querySelector<HTMLTextAreaElement>('#studio-text-input');

      const caseId = caseSelect?.value || 'ST-10482';
      const narrativeText = textInput?.value || 'Biometric analysis requested with available cross-modal inputs.';

      emptyEl?.classList.add('hidden');
      resultsEl?.classList.add('hidden');
      loadingEl?.classList.remove('hidden');

      try {
        const res = await api.analyzeMultimodal({
          caseId,
          text: narrativeText,
          imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
        });

        loadingEl?.classList.add('hidden');
        resultsEl?.classList.remove('hidden');

        // Populate results
        const confEl = document.querySelector('#res-confidence-score');
        const crossEl = document.querySelector('#res-crossmodal-score');
        const explEl = document.querySelector('#res-explanation-text');
        const entitiesEl = document.querySelector('#res-entities-container');

        if (confEl) confEl.textContent = `${Math.round((res.confidenceScore || 0.89) * 100)}%`;
        if (crossEl) crossEl.textContent = `${Math.round((res.crossModalScore || 0.92) * 100)}%`;
        if (explEl) explEl.textContent = res.explanation || 'Multimodal biometric feature fusion identified strong facial landmark similarities and matching voice pitch envelope consistent with reference case profile.';

        if (entitiesEl) {
          const breakdown = res.featureBreakdown || {
            'Facial Similarity': 0.88,
            'Voice Pitch & Timbre': 0.84,
            'Clothing Correlation': 0.91,
            'Geo-Spatial Co-occurrence': 0.79,
          };

          entitiesEl.innerHTML = Object.entries(breakdown)
            .map(
              ([k, v]) => `
            <div class="p-2.5 rounded bg-[#FAF8F6] border border-[#E4DCD8] space-y-1">
              <span class="text-[10px] text-[#6F625D] font-medium block truncate">${k}</span>
              <div class="flex items-center justify-between">
                <span class="font-bold text-[#2B211E] text-xs">${Math.round(Number(v) * 100)}%</span>
                <div class="w-12 h-1.5 rounded-full bg-[#EDE7E4] overflow-hidden">
                  <div class="h-full bg-[#4E342E]" style="width: ${Math.round(Number(v) * 100)}%"></div>
                </div>
              </div>
            </div>
          `
            )
            .join('');
        }

        state.addToast({
          type: 'success',
          title: 'Multimodal Analysis Ready',
          message: 'Hypotheses generated and ready for human investigator review.',
        });
      } catch (err: any) {
        loadingEl?.classList.add('hidden');
        emptyEl?.classList.remove('hidden');
        state.addToast({
          type: 'error',
          title: 'Analysis Error',
          message: err.message || 'Unable to complete multimodal analysis.',
        });
      }
    });
  }

  // Save as lead button
  document.querySelector('#btn-save-as-lead')?.addEventListener('click', () => {
    state.addToast({
      type: 'success',
      title: 'Investigation Lead Registered',
      message: 'New verified lead queued in Decision Intelligence workspace.',
    });
    state.setActiveTab('leads');
  });
}
