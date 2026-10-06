import { state } from '../state';
import { api } from '../api';
import type { MissingCase, Sighting, CaseCluster } from '../types';
import L from 'leaflet';

export async function renderMapView(): Promise<string> {
  return `
    <div class="space-y-4">
      <!-- Map Header & Filter Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 text-xs font-semibold text-teal-400 mb-1">
            <span class="px-2 py-0.5 rounded-full bg-teal-500/20 border border-teal-500/30">GEOSPATIAL INTELLIGENCE MAP</span>
            <span>•</span>
            <span>Spatial-Temporal Hotspots &amp; Corridor Scrubbing</span>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>🗺️</span>
            <span>Interactive Geospatial Intelligence &amp; Sighting Radar</span>
          </h1>
        </div>

        <!-- Quick Map Actions -->
        <div class="flex items-center space-x-2">
          <button id="btn-map-drop-sighting" class="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer">
            <span>📍</span>
            <span>Drop Sighting Pin</span>
          </button>
        </div>
      </div>

      <!-- Map Container with floating Controls Overlay -->
      <div class="relative w-full h-[620px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
        <div id="leaflet-map-root" class="w-full h-full z-10"></div>

        <!-- Floating Legend & Layer Filter Widget -->
        <div class="absolute top-4 right-4 z-20 glass-panel-elevated p-4 rounded-xl border border-slate-700/80 w-64 space-y-3">
          <span class="text-xs font-bold text-white uppercase tracking-wider block border-b border-slate-700/60 pb-2">Map Layers &amp; Filters</span>
          
          <div class="space-y-2 text-xs">
            <label class="flex items-center space-x-2 text-slate-200 cursor-pointer">
              <input type="checkbox" id="layer-toggle-cases" checked class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0" />
              <span class="flex items-center space-x-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                <span>Missing Cases (Last Seen)</span>
              </span>
            </label>

            <label class="flex items-center space-x-2 text-slate-200 cursor-pointer">
              <input type="checkbox" id="layer-toggle-sightings" checked class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0" />
              <span class="flex items-center space-x-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                <span>Verified Sightings</span>
              </span>
            </label>

            <label class="flex items-center space-x-2 text-slate-200 cursor-pointer">
              <input type="checkbox" id="layer-toggle-clusters" checked class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0" />
              <span class="flex items-center space-x-1.5">
                <span class="h-2.5 w-2.5 rounded-full bg-purple-400"></span>
                <span>AI Corridor Hotspots</span>
              </span>
            </label>
          </div>

          <div class="pt-2 border-t border-slate-700/60">
            <span class="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">Temporal Filter</span>
            <select id="map-time-filter" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300">
              <option value="all">All Timelines</option>
              <option value="24h">Past 24 Hours</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
            </select>
          </div>
        </div>

        <!-- Floating Coordinates HUD -->
        <div class="absolute bottom-4 left-4 z-20 glass-panel px-3 py-1.5 rounded-lg border border-slate-700 text-[10px] font-mono text-slate-400 flex items-center space-x-2">
          <span>🎯 Center: 37.7749° N, 122.4194° W</span>
          <span>•</span>
          <span class="text-emerald-400">Tile Server: CartoDB Dark Matter</span>
        </div>
      </div>
    </div>
  `;
}

let mapInstance: L.Map | null = null;

export async function setupMapEvents(): Promise<void> {
  const container = document.getElementById('leaflet-map-root');
  if (!container) return;

  // Clean existing instance if any
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  try {
    // Default coordinates: San Francisco / West Coast corridor
    mapInstance = L.map('leaflet-map-root', {
      center: [37.7749, -122.4194],
      zoom: 6,
      zoomControl: true,
    });

    // Dark Matter tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapInstance);

    // Fetch cases, sightings, and clusters
    const [casesRes, sightingsRes, clustersRes] = await Promise.all([
      api.getCases().catch(() => ({ cases: [] })),
      api.getSightings().catch(() => ({ sightings: [] })),
      api.getClusters().catch(() => ({ clusters: [] })),
    ]);

    const casesLayer = L.layerGroup().addTo(mapInstance);
    const sightingsLayer = L.layerGroup().addTo(mapInstance);
    const clustersLayer = L.layerGroup().addTo(mapInstance);

    // 1. Plot Missing Cases
    casesRes.cases.forEach((c: MissingCase) => {
      const coords = c.lastSeenLocation.coordinates;
      if (coords?.lat && coords?.lng) {
        const marker = L.circleMarker([coords.lat, coords.lng], {
          radius: 9,
          fillColor: c.riskLevel === 'critical' ? '#f43f5e' : '#f59e0b',
          color: '#ffffff',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.85,
        });

        marker.bindPopup(`
          <div class="space-y-1 text-xs">
            <div class="flex items-center space-x-1.5">
              <span class="font-bold text-white text-sm">${c.fullName}</span>
              <span class="text-[9px] uppercase px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">${c.riskLevel}</span>
            </div>
            <p class="text-slate-300">Case #${c.caseNumber} • ${c.age} yrs (${c.gender})</p>
            <p class="text-slate-400">Last Seen: ${c.lastSeenLocation.city}, ${c.lastSeenLocation.state}</p>
            <button class="btn-popup-open-case mt-2 w-full py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] cursor-pointer" data-case-id="${c._id}">
              Open Case Dossier
            </button>
          </div>
        `);

        casesLayer.addLayer(marker);
      }
    });

    // 2. Plot Sightings
    sightingsRes.sightings.forEach((s: Sighting) => {
      const coords = s.location?.coordinates;
      if (coords?.lat && coords?.lng) {
        const marker = L.circleMarker([coords.lat, coords.lng], {
          radius: 7,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 1.5,
          opacity: 0.9,
          fillOpacity: 0.75,
        });

        marker.bindPopup(`
          <div class="space-y-1 text-xs">
            <span class="font-bold text-emerald-400 text-sm">Witness Sighting</span>
            <p class="text-slate-300">${s.description}</p>
            <div class="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Location: ${s.location.city || 'Regional'}</span>
              <span class="font-mono text-emerald-300 font-bold">Credibility: ${Math.round((s.credibilityScore || 0.85) * 100)}%</span>
            </div>
          </div>
        `);

        sightingsLayer.addLayer(marker);
      }
    });

    // 3. Plot Clusters
    clustersRes.clusters.forEach((cl: CaseCluster) => {
      const center = cl.centerLocation;
      if (center?.lat && center?.lng) {
        const circle = L.circle([center.lat, center.lng], {
          radius: (center.radiusKm || 40) * 1000,
          color: '#a855f7',
          fillColor: '#a855f7',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 8',
        });

        circle.bindPopup(`
          <div class="space-y-1 text-xs">
            <span class="font-bold text-purple-300">${cl.clusterName}</span>
            <p class="text-slate-300">${cl.patternSummary}</p>
            <span class="text-[10px] text-purple-400 font-bold block">Connected Cases: ${cl.caseIds?.length || 0}</span>
          </div>
        `);

        clustersLayer.addLayer(circle);
      }
    });

    // Layer toggle events
    document.getElementById('layer-toggle-cases')?.addEventListener('change', (e) => {
      if ((e.target as HTMLInputElement).checked) mapInstance?.addLayer(casesLayer);
      else mapInstance?.removeLayer(casesLayer);
    });

    document.getElementById('layer-toggle-sightings')?.addEventListener('change', (e) => {
      if ((e.target as HTMLInputElement).checked) mapInstance?.addLayer(sightingsLayer);
      else mapInstance?.removeLayer(sightingsLayer);
    });

    document.getElementById('layer-toggle-clusters')?.addEventListener('change', (e) => {
      if ((e.target as HTMLInputElement).checked) mapInstance?.addLayer(clustersLayer);
      else mapInstance?.removeLayer(clustersLayer);
    });

    // Drop Sighting Pin button
    document.getElementById('btn-map-drop-sighting')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-sighting-modal'));
    });

    // Popup button clicks delegation
    container.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('btn-popup-open-case')) {
        const caseId = target.getAttribute('data-case-id');
        if (caseId) {
          state.setSelectedCaseId(caseId);
          window.dispatchEvent(new CustomEvent('open-case-modal', { detail: { caseId } }));
        }
      }
    });

    // Invalidate size after render
    setTimeout(() => {
      mapInstance?.invalidateSize();
    }, 200);

  } catch (err) {
    console.error('Failed to initialize Leaflet Map:', err);
  }
}
