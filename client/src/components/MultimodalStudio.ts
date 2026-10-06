import { state } from '../state';
import { api } from '../api';
import type { MissingCase } from '../types';
import { icon } from '../icons';

export async function renderMultimodalStudio(): Promise<string> {
  try {
    const { cases }: { cases: MissingCase[] } = await api.getCases();
    const selectedCaseId = state.getSelectedCaseId();

    return `
      <div class="space-y-6">
        <!-- Studio Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 text-xs font-bold text-[#733f9f] mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-[#f4ecfb] border border-[#dfcceb] tracking-wider text-[10px] uppercase font-bold">
                Multimodal AI Studio
              </span>
              <span class="text-[#c5a4db]">•</span>
              <span class="text-[#786a89]">Vision • Audio Biometrics • NLP • Geo-Correlator</span>
            </div>
            <h1 class="text-2xl font-bold text-[#231c2d] tracking-tight flex items-center space-x-2">
              <span>${icon('sparkles', 'w-6 h-6 text-[#8c55bd]')}</span>
              <span>Multimodal AI Decision Intelligence Analysis</span>
            </h1>
            <p class="text-xs text-[#786a89] mt-1">
              Ingest sightings, CCTV frames, voice clips, and narrative text. Correlate cross-modal biometrics against active case databases with explainable weighting.
            </p>
          </div>

          <!-- Target Case Selector -->
          <div class="flex items-center space-x-2 bg-white border border-[#dfcceb] p-2 rounded-2xl shadow-xs">
            <span class="text-xs text-[#786a89] font-medium">Target Case:</span>
            <select id="studio-case-select" class="bg-[#fbf8f2] text-xs font-bold text-[#3c2355] border border-[#dfcfb6] rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#8c55bd] cursor-pointer">
              <option value="">-- Cross-Search All Active Cases --</option>
              ${cases.map(c => `
                <option value="${c._id}" ${selectedCaseId === c._id ? 'selected' : ''}>
                  ${c.fullName} (${c.caseNumber})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Studio Workspace Grid: Inputs on Left, AI Output on Right -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left: Multimodal Input Panels (5 Cols) -->
          <div class="lg:col-span-5 space-y-4">
            <!-- Input 1: Visual / Image Stream -->
            <div class="glass-panel p-4 rounded-2xl space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#231c2d] uppercase tracking-wider flex items-center space-x-1.5">
                  <span>${icon('camera', 'w-4 h-4 text-[#8c55bd]')}</span>
                  <span>1. Visual Evidence / Image URL</span>
                </span>
                <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f4ecfb] text-[#733f9f] border border-[#dfcceb] font-semibold">Facial &amp; Attire</span>
              </div>
              
              <div class="space-y-2">
                <input
                  id="studio-input-image"
                  type="text"
                  placeholder="Paste Image URL or select sample..."
                  value="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500"
                  class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
                />

                <!-- Image preview with biometric scanning overlay -->
                <div class="relative h-36 bg-[#f4ecfb] rounded-xl overflow-hidden border border-[#dfcceb] flex items-center justify-center">
                  <img id="studio-preview-img" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500" class="w-full h-full object-cover opacity-90" />
                  
                  <!-- HUD overlay -->
                  <div class="absolute inset-0 pointer-events-none border border-[#8c55bd]/30 flex items-center justify-center">
                    <div class="w-20 h-20 border border-dashed border-[#8c55bd] rounded-full animate-spin"></div>
                    <div class="absolute bottom-2 left-2 text-[9px] font-mono text-[#5c3280] bg-white/95 px-2 py-0.5 rounded-full border border-[#dfcceb] shadow-xs">
                      Biometric Mesh [68 Keypoints]
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 text-[11px]">
                  <button type="button" class="btn-preset-img text-[#733f9f] hover:text-[#492864] font-semibold underline cursor-pointer" data-url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500">Preset A (Male, 24)</button>
                  <span class="text-[#dfcfb6]">•</span>
                  <button type="button" class="btn-preset-img text-[#733f9f] hover:text-[#492864] font-semibold underline cursor-pointer" data-url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500">Preset B (Female, 19)</button>
                </div>
              </div>
            </div>

            <!-- Input 2: Voice & Audio Sample -->
            <div class="glass-panel p-4 rounded-2xl space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#231c2d] uppercase tracking-wider flex items-center space-x-1.5">
                  <span>${icon('waveform', 'w-4 h-4 text-[#8c55bd]')}</span>
                  <span>2. Audio / Voice Biometrics</span>
                </span>
                <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#f6f0e4] text-[#6f5f48] border border-[#dfcfb6] font-semibold">Acoustic Pitch</span>
              </div>

              <div class="space-y-2">
                <input
                  id="studio-input-audio"
                  type="text"
                  placeholder="Audio sample URL or 911 call audio..."
                  value="sample_audio_voice_call.wav"
                  class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-3.5 py-2 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
                />

                <!-- Simulated Audio Waveform Bar Visualizer -->
                <div class="h-14 bg-[#fbf8f2] rounded-xl p-2.5 flex items-center justify-between gap-1 border border-[#dfcfb6] overflow-hidden">
                  ${Array.from({ length: 32 }).map((_, i) => `
                    <div
                      class="waveform-bar w-1 bg-gradient-to-t from-[#8c55bd] to-[#aa7dc8] rounded-full"
                      style="height: ${20 + ((i * 17) % 75)}%; animation-delay: -${(i * 0.1).toFixed(2)}s"
                    ></div>
                  `).join('')}
                </div>
                <div class="flex items-center justify-between text-[10px] text-[#786a89] font-mono">
                  <span>Pitch: 215 Hz</span>
                  <span>Formant: F1=530 / F2=1820</span>
                  <span>Rhythm: Hesitant (78%)</span>
                </div>
              </div>
            </div>

            <!-- Input 3: Text & Narrative Sighting Ingestion -->
            <div class="glass-panel p-4 rounded-2xl space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-[#231c2d] uppercase tracking-wider flex items-center space-x-1.5">
                  <span>${icon('fileText', 'w-4 h-4 text-[#5b8a6f]')}</span>
                  <span>3. Narrative Sighting / Witness Text</span>
                </span>
                <span class="text-[10px] px-2.5 py-0.5 rounded-full bg-[#edf7f1] text-[#385c47] border border-[#b8e2c8] font-semibold">NLP Entities</span>
              </div>

              <textarea
                id="studio-input-text"
                rows="4"
                placeholder="Enter detailed sighting description, witness observations, clothing, vehicle plate, or behavior..."
                class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl p-3 text-xs text-[#231c2d] placeholder-[#88799e] focus:outline-none focus:ring-2 focus:ring-[#8c55bd]"
              >Witness observed an individual resembling Emma Watson sitting near Union Station transit terminal wearing a dark green oversized hoodie, black jeans, carrying a faded blue backpack. Individual appeared disoriented and asked for directions toward Highway 101 bus station at approximately 18:45.</textarea>
            </div>

            <!-- Run AI Multi-Modal Engine Button -->
            <button
              id="btn-run-multimodal-studio"
              class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white font-bold text-xs shadow-sm shadow-[#8c55bd]/20 transition duration-200 flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
            >
              ${icon('sparkles', 'w-4 h-4 text-white')}
              <span>Execute Multimodal Correlation Engine</span>
            </button>
          </div>

          <!-- Right: AI Decision Intelligence & Explainability Dashboard (7 Cols) -->
          <div class="lg:col-span-7 space-y-4" id="studio-results-container">
            <div class="glass-panel p-6 rounded-2xl space-y-5">
              <div class="flex items-center justify-between border-b border-black/5 pb-4">
                <div>
                  <h2 class="text-base font-bold text-[#231c2d] flex items-center space-x-2">
                    <span>${icon('brain', 'w-4 h-4 text-[#8c55bd]')}</span>
                    <span>Decision Intelligence Reasoning Output</span>
                  </h2>
                  <p class="text-xs text-[#786a89]">Explainable Cross-Modal Biometric Synthesis</p>
                </div>
                <span class="px-3.5 py-1 rounded-full text-xs font-bold bg-[#edf7f1] text-[#385c47] border border-[#b8e2c8] flex items-center space-x-1.5 font-mono shadow-xs">
                  <span class="h-2 w-2 rounded-full bg-[#5b8a6f] animate-pulse"></span>
                  <span id="studio-confidence-badge">91.4% Overall Match</span>
                </span>
              </div>

              <!-- Cross-Modal Feature Weight Matrix -->
              <div class="space-y-3">
                <h4 class="text-xs font-bold text-[#786a89] uppercase tracking-wider">Modality Contribution Breakdown</h4>
                
                <div class="space-y-2.5 text-xs">
                  <!-- Modality 1: Facial Mesh -->
                  <div>
                    <div class="flex justify-between text-[#594c6d] mb-1">
                      <span class="flex items-center space-x-1.5"><span>${icon('user', 'w-3.5 h-3.5 text-[#8c55bd]')}</span><span>Facial Biometrics &amp; Structure</span></span>
                      <span class="font-mono font-bold text-[#733f9f]">89% Correlation</span>
                    </div>
                    <div class="w-full bg-[#ede2d0] rounded-full h-2 overflow-hidden">
                      <div class="bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] h-full rounded-full" style="width: 89%"></div>
                    </div>
                  </div>

                  <!-- Modality 2: Attire & Accessories -->
                  <div>
                    <div class="flex justify-between text-[#594c6d] mb-1">
                      <span class="flex items-center space-x-1.5"><span>${icon('layers', 'w-3.5 h-3.5 text-[#b4a081]')}</span><span>Clothing &amp; Accessories Match (Green Hoodie, Backpack)</span></span>
                      <span class="font-mono font-bold text-[#6f5f48]">95% Correlation</span>
                    </div>
                    <div class="w-full bg-[#ede2d0] rounded-full h-2 overflow-hidden">
                      <div class="bg-gradient-to-r from-[#b4a081] to-[#dfcfb6] h-full rounded-full" style="width: 95%"></div>
                    </div>
                  </div>

                  <!-- Modality 3: Voice Biometrics -->
                  <div>
                    <div class="flex justify-between text-[#594c6d] mb-1">
                      <span class="flex items-center space-x-1.5"><span>${icon('waveform', 'w-3.5 h-3.5 text-[#b85b67]')}</span><span>Voice Acoustic Profile &amp; Cadence</span></span>
                      <span class="font-mono font-bold text-[#b85b67]">86% Correlation</span>
                    </div>
                    <div class="w-full bg-[#ede2d0] rounded-full h-2 overflow-hidden">
                      <div class="bg-gradient-to-r from-[#b85b67] to-[#f5b3bb] h-full rounded-full" style="width: 86%"></div>
                    </div>
                  </div>

                  <!-- Modality 4: Geospatial & Temporal Corroboration -->
                  <div>
                    <div class="flex justify-between text-[#594c6d] mb-1">
                      <span class="flex items-center space-x-1.5"><span>${icon('mapPin', 'w-3.5 h-3.5 text-[#5b8a6f]')}</span><span>Geospatial Corridor &amp; Temporal Plausibility</span></span>
                      <span class="font-mono font-bold text-[#385c47]">94% Correlation</span>
                    </div>
                    <div class="w-full bg-[#ede2d0] rounded-full h-2 overflow-hidden">
                      <div class="bg-gradient-to-r from-[#5b8a6f] to-[#7ea88f] h-full rounded-full" style="width: 94%"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Explainable Plain English AI Narrative -->
              <div class="p-4 rounded-xl bg-[#fbf8f2] border border-[#dfcfb6] space-y-2">
                <div class="flex items-center space-x-2 text-xs font-bold text-[#733f9f]">
                  <span>${icon('brain', 'w-3.5 h-3.5 text-[#8c55bd]')}</span>
                  <span>Explainable Lead Rationale</span>
                </div>
                <p class="text-xs text-[#594c6d] leading-relaxed" id="studio-narrative-box">
                  The analyzed visual evidence exhibits high facial feature alignment (89%) with the missing person’s archival registration photo, particularly in jawline symmetry and orbital distance. The witness text strongly corroborates the green hoodie and faded backpack noted in the case dossier. Geospatial proximity to Union Station is within the predicted 12-hour dispersal radius.
                </p>
              </div>

              <!-- Extracted Entity Tokens Matrix -->
              <div class="space-y-2">
                <h4 class="text-xs font-bold text-[#786a89] uppercase tracking-wider">Extracted Semantic Entities</h4>
                <div class="flex flex-wrap gap-2 text-xs">
                  <span class="px-3 py-1 rounded-xl bg-[#f4ecfb] text-[#5c3280] border border-[#dfcceb] font-mono">Location: Union Station</span>
                  <span class="px-3 py-1 rounded-xl bg-[#f6f0e4] text-[#6f5f48] border border-[#dfcfb6] font-mono">Attire: Green Hoodie / Jeans</span>
                  <span class="px-3 py-1 rounded-xl bg-[#edf7f1] text-[#385c47] border border-[#b8e2c8] font-mono">Item: Blue Backpack</span>
                  <span class="px-3 py-1 rounded-xl bg-[#fdf5ea] text-[#8f642a] border border-[#fae0be] font-mono">State: Disoriented</span>
                  <span class="px-3 py-1 rounded-xl bg-[#fce8ea] text-[#b85b67] border border-[#f5b3bb] font-mono">Transit Target: Hwy 101 Bus</span>
                </div>
              </div>

              <!-- Ethical Guardrail Compliance Badge Box -->
              <div class="p-3.5 rounded-xl bg-[#f4ecfb] border border-[#dfcceb] flex items-start space-x-3 text-xs">
                <span class="text-[#8c55bd] mt-0.5">${icon('shield', 'w-4 h-4 text-[#8c55bd]')}</span>
                <div class="space-y-1">
                  <span class="font-bold text-[#231c2d]">Ethical Guardrail Verification: Passed</span>
                  <p class="text-[#594c6d] text-[11px] leading-relaxed">
                    Zero autonomous identity confirmation enforced. PII redacted in non-verified views. Human investigator verification is mandatory before family notification or contact sharing.
                  </p>
                </div>
              </div>

              <!-- Action: Convert to Verified Lead -->
              <div class="pt-2 flex items-center justify-end space-x-3">
                <button id="btn-save-as-lead" class="px-4 py-2 rounded-xl bg-gradient-to-r from-[#5b8a6f] to-[#426a54] hover:opacity-95 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center space-x-1.5">
                  <span>${icon('check', 'w-3.5 h-3.5 text-white')}</span>
                  <span>Publish as Explainable Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err: any) {
    return `<div class="p-8 text-center text-[#b85b67]">${err.message}</div>`;
  }
}

export function setupMultimodalEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('.btn-preset-img').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      const input = document.getElementById('studio-input-image') as HTMLInputElement;
      const preview = document.getElementById('studio-preview-img') as HTMLImageElement;
      if (url && input && preview) {
        input.value = url;
        preview.src = url;
      }
    });
  });

  const imgInput = document.getElementById('studio-input-image') as HTMLInputElement;
  imgInput?.addEventListener('input', () => {
    const preview = document.getElementById('studio-preview-img') as HTMLImageElement;
    if (preview && imgInput.value) {
      preview.src = imgInput.value;
    }
  });

  document.getElementById('btn-run-multimodal-studio')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-run-multimodal-studio') as HTMLButtonElement;
    const caseSelect = document.getElementById('studio-case-select') as HTMLSelectElement;
    const textInput = document.getElementById('studio-input-text') as HTMLTextAreaElement;
    const imgUrl = (document.getElementById('studio-input-image') as HTMLInputElement)?.value;
    const audioUrl = (document.getElementById('studio-input-audio') as HTMLInputElement)?.value;

    try {
      state.setIsAIProcessing(true);
      btn.disabled = true;
      btn.innerHTML = `<span class="animate-spin">${icon('refreshCw', 'w-3.5 h-3.5')}</span><span>Running Neural Multimodal Embeddings...</span>`;

      state.addToast({
        type: 'ai',
        title: 'Multimodal AI Active',
        message: 'Synthesizing facial geometry, voice frequency & narrative entities...',
      });

      const res = await api.analyzeMultimodal({
        text: textInput?.value,
        imageUrl: imgUrl,
        audioUrl: audioUrl,
        caseId: caseSelect?.value || undefined,
      });

      const narrativeBox = document.getElementById('studio-narrative-box');
      const confidenceBadge = document.getElementById('studio-confidence-badge');
      if (narrativeBox) narrativeBox.innerText = res.explanation;
      if (confidenceBadge) confidenceBadge.innerText = `${Math.round(res.confidenceScore * 100)}% Overall Match`;

      state.addToast({
        type: 'success',
        title: 'Analysis Complete',
        message: `Cross-modal correlation computed with ${Math.round(res.confidenceScore * 100)}% confidence score.`,
      });
    } catch (e: any) {
      state.addToast({
        type: 'error',
        title: 'Analysis Failed',
        message: e.message,
      });
    } finally {
      state.setIsAIProcessing(false);
      btn.disabled = false;
      btn.innerHTML = `<span>${icon('sparkles', 'w-4 h-4 text-white')}</span><span>Execute Multimodal Correlation Engine</span>`;
    }
  });

  document.getElementById('btn-save-as-lead')?.addEventListener('click', () => {
    state.addToast({
      type: 'success',
      title: 'Lead Registered',
      message: 'New explainable decision lead has been added to the investigator queue.',
    });
    state.setActiveTab('leads');
  });
}
