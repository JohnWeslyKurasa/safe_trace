import { state } from '../state';
import { api } from '../api';
import type { MissingCase, Sighting, CaseCluster } from '../types';
import L from 'leaflet';
import { icon } from '../icons';

export async function renderMapView(): Promise<string> {
  return `
    <div class="space-y-4">
      <!-- Map Header & Filter Bar -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center space-x-2 text-xs font-bold text-[#733f9f] mb-1">
            <span class="px-2.5 py-0.5 rounded-full bg-[#f4ecfb] border border-[#dfcceb] tracking-wider text-[10px] uppercase font-bold">
              Geospatial Intelligence Map
            </span>
            <span class="text-[#c5a4db]">•</span>
            <span class="text-[#786a89]">Spatial-Temporal Hotspots &amp; Corridor Scrubbing</span>
          </div>
          <h1 class="text-2xl font-bold text-[#231c2d] tracking-tight flex items-center space-x-2">
            <span>${icon('mapPin', 'w-6 h-6 text-[#8c55bd]')}</span>
            <span>Interactive Geospatial Intelligence &amp; Sighting Radar</span>
          </h1>
        </div>

        <!-- Quick Map Actions -->
        <div class="flex items-center space-x-2">
          <button id="btn-map-drop-sighting" class="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#8c55bd] to-[#aa7dc8] hover:from-[#733f9f] hover:to-[#8c55bd] text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer">
            <span>${icon('camera', 'w-3.5 h-3.5 text-white')}</span>
            <span>Drop Sighting Pin</span>
          </button>
        </div>
      </div>

      <!-- Map Container with floating Controls Overlay -->
      <div class="relative w-full h-[620px] rounded-2xl overflow-hidden border border-[#dfcceb] shadow-sm">
        <div id="leaflet-map-root" class="w-full h-full z-10"></div>

        <!-- Floating Legend & Layer Filter Widget -->
        <div class="absolute top-4 right-4 z-20 glass-panel-elevated p-4 rounded-2xl border border-[#dfcceb] w-64 space-y-3 shadow-md">
          <span class="text-xs font-bold text-[#231c2d] uppercase tracking-wider block border-b border-black/5 pb-2">Map Layers &amp; Filters</span>
          
          <div class="space-y-2 text-xs">
            <label class="flex items-center space-x-2 text-[#3c2355] cursor-pointer">
              <input type="checkbox" id="layer-toggle-cases" checked class="rounded bg-white border-[#dfcceb] text-[#8c55bd] focus:ring-0" />
              <span class="flex items-center space-x-2">
                <span class="h-2.5 w-2.5 rounded-full bg-[#b85b67]"></span>
                <span class="font-medium">Missing Cases (Last Seen)</span>
              </span>
            </label>

            <label class="flex items-center space-x-2 text-[#3c2355] cursor-pointer">
              <input type="checkbox" id="layer-toggle-sightings" checked class="rounded bg-white border-[#dfcceb] text-[#8c55bd] focus:ring-0" />
              <span class="flex items-center space-x-2">
                <span class="h-2.5 w-2.5 rounded-full bg-[#5b8a6f]"></span>
                <span class="font-medium">Verified Sightings</span>
              </span>
            </label>

            <label class="flex items-center space-x-2 text-[#3c2355] cursor-pointer">
              <input type="checkbox" id="layer-toggle-clusters" checked class="rounded bg-white border-[#dfcceb] text-[#8c55bd] focus:ring-0" />
              <span class="flex items-center space-x-2">
                <span class="h-2.5 w-2.5 rounded-full bg-[#8c55bd]"></span>
                <span class="font-medium">AI Corridor Hotspots</span>
              </span>
            </label>
          </div>

          <div class="pt-2 border-t border-black/5">
            <span class="text-[10px] text-[#786a89] block mb-1 font-bold uppercase">Temporal Filter</span>
            <select id="map-time-filter" class="w-full bg-[#fbf8f2] border border-[#dfcfb6] rounded-xl px-2.5 py-1 text-xs text-[#231c2d] focus:outline-none focus:ring-1 focus:ring-[#8c55bd]">
              <option value="all">All Timelines</option>
              <option value="24h">Past 24 Hours</option>
              <option value="7d">Past 7 Days</option>
              <option value="30d">Past 30 Days</option>
            </select>
          </div>
        </div>

        <!-- Floating Coordinates HUD -->
        <div class="absolute bottom-4 left-4 z-20 glass-panel px-3.5 py-1.5 rounded-xl text-[10px] font-mono text-[#786a89] flex items-center space-x-2 shadow-xs">
          <span>Center: 37.7749° N, 122.4194° W</span>
          <span class="text-[#c5a4db]">•</span>
          <span class="text-[#385c47] font-bold">Positron Cartography</span>
        </div>
      </div>
    </div>
  `;
}

let mapInstance: L.Map | null = null;

export async function setupMapEvents(): Promise<void> {
  const container = document.getElementById('leaflet-map-root');
  if (!container) return;

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  try {
    mapInstance = L.map('leaflet-map-root', {
      center: [37.7749, -122.4194],
      zoom: 6,
      zoomControl: true,
    });

    // Clean light tiles (CartoDB Positron)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapInstance);

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
          fillColor: c.riskLevel === 'critical' ? '#b85b67' : '#d4a362',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div class="space-y-1 text-xs">
            <div class="flex items-center space-x-1.5">
              <span class="font-bold text-[#231c2d] text-sm">${c.fullName}</span>
              <span class="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-[#fce8ea] text-[#b85b67] font-bold">${c.riskLevel}</span>
            </div>
            <p class="text-[#594c6d]">Case #${c.caseNumber} • ${c.age} yrs (${c.gender})</p>
            <p class="text-[#786a89]">Last Seen: ${c.lastSeenLocation.city}, ${c.lastSeenLocation.state}</p>
            <button class="btn-popup-open-case mt-2 w-full py-1.5 rounded-xl bg-[#8c55bd] hover:bg-[#733f9f] text-white font-bold text-[10px] cursor-pointer" data-case-id="${c._id}">
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
          fillColor: '#5b8a6f',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div class="space-y-1 text-xs">
            <span class="font-bold text-[#385c47] text-sm">Witness Sighting</span>
            <p class="text-[#594c6d]">${s.description}</p>
            <div class="text-[10px] text-[#786a89] flex items-center justify-between">
              <span>Location: ${s.location.city || 'Regional'}</span>
              <span class="font-mono text-[#385c47] font-bold">Credibility: ${Math.round((s.credibilityScore || 0.85) * 100)}%</span>
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
          color: '#8c55bd',
          fillColor: '#aa7dc8',
          fillOpacity: 0.15,
          weight: 1.5,
          dashArray: '4, 8',
        });

        circle.bindPopup(`
          <div class="space-y-1 text-xs">
            <span class="font-bold text-[#733f9f]">${cl.clusterName}</span>
            <p class="text-[#594c6d]">${cl.patternSummary}</p>
            <span class="text-[10px] text-[#8c55bd] font-bold block">Connected Cases: ${cl.caseIds?.length || 0}</span>
          </div>
        `);

        clustersLayer.addLayer(circle);
      }
    });

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

    document.getElementById('btn-map-drop-sighting')?.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('open-sighting-modal'));
    });

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

    setTimeout(() => {
      mapInstance?.invalidateSize();
    }, 200);

  } catch (err) {
    console.error('Failed to initialize Leaflet Map:', err);
  }
}
