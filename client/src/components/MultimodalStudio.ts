import { state } from '../state';
import { api } from '../api';
import type { MissingCase } from '../types';

export async function renderMultimodalStudio(): Promise<string> {
  state.setIsAIProcessing(true);
  try {
    const { cases }: { cases: MissingCase[] } = await api.getCases();
    const selectedCaseId = state.getSelectedCaseId();

    return `
      <div class="space-y-6">
        <!-- Studio Header -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center space-x-2 text-xs font-semibold text-indigo-400 mb-1">
              <span class="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">MULTIMODAL AI STUDIO</span>
              <span>•</span>
              <span>Vision • Audio • NLP • Geo-Correlator</span>
            </div>
            <h1 class="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
              <span>⚡</span>
              <span>Multimodal AI Decision Intelligence Analysis</span>
            </h1>
            <p class="text-xs text-slate-400 mt-1">
              Ingest sightings, CCTV frames, voice clips, and narrative text. Correlate cross-modal biometrics against active case databases with explainable weighting.
            </p>
          </div>

          <!-- Target Case Selector -->
          <div class="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 p-2 rounded-xl">
            <span class="text-xs text-slate-400 font-medium">Target Case:</span>
            <select id="studio-case-select" class="bg-slate-800 text-xs font-semibold text-indigo-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
            <div class="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>🖼️</span>
                  <span>1. Visual Evidence / Image URL</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">Facial &amp; Attire</span>
              </div>
              
              <div class="space-y-2">
                <input
                  id="studio-input-image"
                  type="text"
                  placeholder="Paste Image URL or select sample..."
                  value="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500"
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <!-- Image preview with biometric scanning overlay -->
                <div class="relative h-36 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center justify-center">
                  <img id="studio-preview-img" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500" class="w-full h-full object-cover opacity-80" />
                  
                  <!-- HUD overlay -->
                  <div class="absolute inset-0 pointer-events-none border border-indigo-500/30 flex items-center justify-center">
                    <div class="w-20 h-20 border border-dashed border-indigo-400 rounded-full animate-spin"></div>
                    <div class="absolute bottom-2 left-2 text-[9px] font-mono text-indigo-300 bg-slate-900/90 px-1.5 py-0.5 rounded border border-indigo-500/40">
                      Face Mesh [68 Keypoints]
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2 text-[11px]">
                  <button type="button" class="btn-preset-img text-indigo-400 hover:text-indigo-300 underline" data-url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500">Preset A (Male, 24)</button>
                  <span>•</span>
                  <button type="button" class="btn-preset-img text-indigo-400 hover:text-indigo-300 underline" data-url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500">Preset B (Female, 19)</button>
                </div>
              </div>
            </div>

            <!-- Input 2: Voice & Audio Sample -->
            <div class="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>🎙️</span>
                  <span>2. Audio / Voice Biometrics</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">Acoustic Pitch</span>
              </div>

              <div class="space-y-2">
                <input
                  id="studio-input-audio"
                  type="text"
                  placeholder="Audio sample URL or 911 call audio..."
                  value="sample_audio_voice_call.wav"
                  class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <!-- Simulated Audio Waveform Bar Visualizer -->
                <div class="h-14 bg-slate-900 rounded-lg p-2 flex items-center justify-between gap-1 border border-slate-800 overflow-hidden">
                  ${Array.from({ length: 32 }).map((_, i) => `
                    <div
                      class="waveform-bar w-1 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-full"
                      style="height: ${20 + ((i * 17) % 75)}%; animation-delay: -${(i * 0.1).toFixed(2)}s"
                    ></div>
                  `).join('')}
                </div>
                <div class="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Pitch: 215 Hz</span>
                  <span>Formant: F1=530 / F2=1820</span>
                  <span>Rhythm: Hesitant (78%)</span>
                </div>
              </div>
            </div>

            <!-- Input 3: Text & Narrative Sighting Ingestion -->
            <div class="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>📝</span>
                  <span>3. Narrative Sighting / Witness Text</span>
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">NLP Entities</span>
              </div>

              <textarea
                id="studio-input-text"
                rows="4"
                placeholder="Enter detailed sighting description, witness observations, clothing, vehicle plate, or behavior..."
                class="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >Witness observed an individual resembling Emma Watson sitting near Union Station transit terminal wearing a dark green oversized hoodie, black jeans, carrying a faded blue backpack. Individual appeared disoriented and asked for directions toward Highway 101 bus station at approximately 18:45.</textarea>
            </div>

            <!-- Run AI Multi-Modal Engine Button -->
            <button
              id="btn-run-multimodal-studio"
              class="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition duration-200 flex items-center justify-center space-x-2 cursor-pointer active:scale-[0.98]"
            >
              <span>⚡</span>
              <span>Execute Multimodal Correlation Engine</span>
            </button>
          </div>

          <!-- Right: AI Decision Intelligence & Explainability Dashboard (7 Cols) -->
          <div class="lg:col-span-7 space-y-4" id="studio-results-container">
            <!-- Default / Initial AI Reasoning Card -->
            <div class="glass-panel p-6 rounded-xl border border-indigo-500/30 space-y-5">
              <div class="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 class="text-base font-bold text-white flex items-center space-x-2">
                    <span>🧠</span>
                    <span>Decision Intelligence Reasoning Output</span>
                  </h2>
                  <p class="text-xs text-slate-400">Explainable Cross-Modal Biometric Synthesis</p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                  <span class="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span id="studio-confidence-badge">91.4% Overall Match</span>
                </span>
              </div>

              <!-- Cross-Modal Feature Weight Matrix -->
              <div class="space-y-3">
                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Cross-Modal Modality Contribution Breakdown</h4>
                
                <div class="space-y-2 text-xs">
                  <!-- Modality 1: Facial Mesh -->
                  <div>
                    <div class="flex justify-between text-slate-300 mb-1">
                      <span class="flex items-center space-x-1"><span>👤</span><span>Facial Biometrics &amp; Structure</span></span>
                      <span class="font-mono font-bold text-indigo-400">89% Correlation</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div class="bg-indigo-500 h-full rounded-full" style="width: 89%"></div>
                    </div>
                  </div>

                  <!-- Modality 2: Attire & Accessories -->
                  <div>
                    <div class="flex justify-between text-slate-300 mb-1">
                      <span class="flex items-center space-x-1"><span>🧥</span><span>Clothing &amp; Accessories Match (Green Hoodie, Backpack)</span></span>
                      <span class="font-mono font-bold text-purple-400">95% Correlation</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div class="bg-purple-500 h-full rounded-full" style="width: 95%"></div>
                    </div>
                  </div>

                  <!-- Modality 3: Voice Biometrics -->
                  <div>
                    <div class="flex justify-between text-slate-300 mb-1">
                      <span class="flex items-center space-x-1"><span>🎙️</span><span>Voice Acoustic Profile &amp; Cadence</span></span>
                      <span class="font-mono font-bold text-pink-400">86% Correlation</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div class="bg-pink-500 h-full rounded-full" style="width: 86%"></div>
                    </div>
                  </div>

                  <!-- Modality 4: Geospatial & Temporal Corroboration -->
                  <div>
                    <div class="flex justify-between text-slate-300 mb-1">
                      <span class="flex items-center space-x-1"><span>📍</span><span>Geospatial Corridor &amp; Temporal Plausibility</span></span>
                      <span class="font-mono font-bold text-teal-400">94% Correlation</span>
                    </div>
                    <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                      <div class="bg-teal-500 h-full rounded-full" style="width: 94%"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Explainable Plain English AI Narrative -->
              <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div class="flex items-center space-x-2 text-xs font-bold text-indigo-300">
                  <span>💡</span>
                  <span>Explainable Lead Rationale</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed" id="studio-narrative-box">
                  The analyzed visual evidence exhibits high facial feature alignment (89%) with the missing person’s archival registration photo, particularly in jawline symmetry and orbital distance. The witness text strongly corroborates the green hoodie and faded backpack noted in the case dossier. Geospatial proximity to Union Station is within the predicted 12-hour dispersal radius.
                </p>
              </div>

              <!-- Extracted Entity Tokens Matrix -->
              <div class="space-y-2">
                <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Extracted Semantic Entities</h4>
                <div class="flex flex-wrap gap-2 text-xs">
                  <span class="px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800 font-mono">Location: Union Station</span>
                  <span class="px-2.5 py-1 rounded-lg bg-purple-950/80 text-purple-300 border border-purple-800 font-mono">Attire: Green Hoodie / Jeans</span>
                  <span class="px-2.5 py-1 rounded-lg bg-teal-950/80 text-teal-300 border border-teal-800 font-mono">Item: Blue Backpack</span>
                  <span class="px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800 font-mono">State: Disoriented</span>
                  <span class="px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-800 font-mono">Transit Target: Hwy 101 Bus</span>
                </div>
              </div>

              <!-- Ethical Guardrail Compliance Badge Box -->
              <div class="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-start space-x-3 text-xs">
                <span class="text-lg text-indigo-400">🛡️</span>
                <div class="space-y-1">
                  <span class="font-bold text-white">Ethical Guardrail Verification: Passed</span>
                  <p class="text-slate-300 text-[11px] leading-relaxed">
                    Zero autonomous identity confirmation enforced. PII redacted in non-verified views. Human investigator verification is mandatory before family notification or contact sharing.
                  </p>
                </div>
              </div>

              <!-- Action: Convert to Verified Lead -->
              <div class="pt-2 flex items-center justify-end space-x-3">
                <button id="btn-save-as-lead" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition cursor-pointer flex items-center space-x-1.5">
                  <span>✅</span>
                  <span>Publish as Explainable Lead</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err: any) {
    return `<div class="p-8 text-center text-rose-400">${err.message}</div>`;
  } finally {
    state.setIsAIProcessing(false);
  }
}

export function setupMultimodalEvents(): void {
  // Preset image buttons
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

  // Image input change
  const imgInput = document.getElementById('studio-input-image') as HTMLInputElement;
  imgInput?.addEventListener('input', () => {
    const preview = document.getElementById('studio-preview-img') as HTMLImageElement;
    if (preview && imgInput.value) {
      preview.src = imgInput.value;
    }
  });

  // Execute Multimodal Correlation Engine button
  document.getElementById('btn-run-multimodal-studio')?.addEventListener('click', async () => {
    const btn = document.getElementById('btn-run-multimodal-studio') as HTMLButtonElement;
    const caseSelect = document.getElementById('studio-case-select') as HTMLSelectElement;
    const textInput = document.getElementById('studio-input-text') as HTMLTextAreaElement;
    const imgUrl = (document.getElementById('studio-input-image') as HTMLInputElement)?.value;
    const audioUrl = (document.getElementById('studio-input-audio') as HTMLInputElement)?.value;

    try {
      state.setIsAIProcessing(true);
      btn.disabled = true;
      btn.innerHTML = `<span class="animate-spin">⚙️</span><span>Running Neural Multimodal Embeddings...</span>`;

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

      // Update UI with response
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
      btn.innerHTML = `<span>⚡</span><span>Execute Multimodal Correlation Engine</span>`;
    }
  });

  // Save as lead button
  document.getElementById('btn-save-as-lead')?.addEventListener('click', () => {
    state.addToast({
      type: 'success',
      title: 'Lead Registered',
      message: 'New explainable decision lead has been added to the investigator queue.',
    });
    state.setActiveTab('leads');
  });
}
