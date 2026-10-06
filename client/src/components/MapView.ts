import { api } from '../api';
import { icon } from '../icons';
import type { MissingCase, Sighting, CaseCluster } from '../types';

let mapInstance: any = null;

export async function renderMapView(): Promise<string> {
  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-[#2B211E] tracking-tight">Geospatial Intelligence Map</h1>
          <p class="text-xs text-[#6F625D] mt-1">Visualize missing person cases, field sightings, and cluster corridors across geographic regions.</p>
        </div>
        <div class="flex items-center space-x-2">
          <button id="btn-map-refresh" class="btn-latte flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium">
            ${icon('refreshCw', 'w-3.5 h-3.5')}
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      <!-- Map Container -->
      <div class="card-panel overflow-hidden" style="height: 560px;">
        <div id="safetrace-map" class="w-full h-full"></div>
      </div>

      <!-- Map Legend -->
      <div class="card-panel p-4 flex flex-wrap items-center gap-4 text-xs text-[#6F625D]">
        <span class="font-semibold text-[#2B211E]">Legend:</span>
        <div class="flex items-center space-x-1.5">
          <span class="w-3 h-3 rounded-full bg-[#9B3E3E]"></span>
          <span>Critical / Active Cases</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="w-3 h-3 rounded-full bg-[#4E342E]"></span>
          <span>Standard Cases</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="w-3 h-3 rounded-full bg-[#496579]"></span>
          <span>Field Sightings</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="w-3 h-3 rounded-full bg-[#9A6B2F]"></span>
          <span>Cluster Centers</span>
        </div>
      </div>
    </div>
  `;
}

export async function setupMapEvents(): Promise<void> {
  // Destroy previous instance if exists
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  const mapEl = document.getElementById('safetrace-map');
  if (!mapEl) return;

  const L = (window as any).L;
  if (!L) {
    console.error('Leaflet not loaded');
    mapEl.innerHTML = `<div class="flex items-center justify-center h-full text-xs text-[#6F625D]">Leaflet map library not available.</div>`;
    return;
  }

  mapInstance = L.map('safetrace-map').setView([17.385, 78.486], 10);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 19,
  }).addTo(mapInstance);

  // Fetch all data
  let cases: MissingCase[] = [];
  let sightings: Sighting[] = [];
  let clusters: CaseCluster[] = [];

  try {
    const [casesRes, sightingsRes, clustersRes] = await Promise.all([
      api.getCases(),
      api.getSightings(),
      api.getClusters(),
    ]);
    cases = casesRes.cases || [];
    sightings = sightingsRes.sightings || [];
    clusters = clustersRes.clusters || [];
  } catch (err) {
    console.warn('Map data fetch partial failure:', err);
  }

  const bounds: any[] = [];

  // Add case markers
  cases.forEach(c => {
    const coords = c.lastSeenLocation?.coordinates;
    if (coords?.lat && coords?.lng) {
      const isCritical = c.riskLevel === 'critical';
      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: isCritical ? 8 : 6,
        fillColor: isCritical ? '#9B3E3E' : '#4E342E',
        color: '#FFFFFF',
        weight: 2,
        fillOpacity: 0.9,
      }).addTo(mapInstance);

      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;font-size:12px;">
          <div style="font-weight:700;color:#4E342E;">${c.caseNumber}</div>
          <div style="font-weight:600;color:#2B211E;margin-top:2px;">${c.fullName}, ${c.age}y</div>
          <div style="color:#6F625D;margin-top:4px;">${c.lastSeenLocation.city}, ${c.lastSeenLocation.state}</div>
          <div style="margin-top:4px;"><span style="background:#EDE7E4;padding:2px 6px;border-radius:4px;font-weight:600;font-size:10px;color:#4E342E;text-transform:uppercase;">${c.riskLevel} RISK</span></div>
        </div>
      `);

      bounds.push([coords.lat, coords.lng]);
    }
  });

  // Add sighting markers
  sightings.forEach(s => {
    const coords = s.location?.coordinates;
    if (coords?.lat && coords?.lng) {
      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius: 5,
        fillColor: '#496579',
        color: '#FFFFFF',
        weight: 2,
        fillOpacity: 0.8,
      }).addTo(mapInstance);

      marker.bindPopup(`
        <div style="font-family:Inter,sans-serif;font-size:12px;">
          <div style="font-weight:700;color:#496579;">Field Sighting</div>
          <div style="color:#2B211E;margin-top:2px;">${s.location.city || s.location.address}</div>
          <div style="color:#6F625D;margin-top:4px;">${s.description?.slice(0, 80)}...</div>
        </div>
      `);

      bounds.push([coords.lat, coords.lng]);
    }
  });

  // Add cluster centers
  clusters.forEach(cl => {
    const coords = cl.centerLocation;
    if (coords?.lat && coords?.lng) {
      const circle = L.circle([coords.lat, coords.lng], {
        radius: (coords.radiusKm || 5) * 1000,
        fillColor: '#9A6B2F',
        color: '#9A6B2F',
        weight: 1.5,
        fillOpacity: 0.12,
      }).addTo(mapInstance);

      circle.bindPopup(`
        <div style="font-family:Inter,sans-serif;font-size:12px;">
          <div style="font-weight:700;color:#9A6B2F;">${cl.clusterName}</div>
          <div style="color:#6F625D;margin-top:4px;">${cl.description?.slice(0, 100)}</div>
          <div style="margin-top:4px;font-size:10px;color:#4E342E;">Cases: ${cl.caseIds?.length || 0} · AI: ${Math.round((cl.aiConfidence || 0.8) * 100)}%</div>
        </div>
      `);

      bounds.push([coords.lat, coords.lng]);
    }
  });

  // Fit bounds
  if (bounds.length > 0) {
    mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
  }

  // Invalidate size after a tick (leaflet rendering)
  setTimeout(() => mapInstance?.invalidateSize(), 200);

  // Refresh button
  document.getElementById('btn-map-refresh')?.addEventListener('click', () => {
    setupMapEvents();
  });
}
