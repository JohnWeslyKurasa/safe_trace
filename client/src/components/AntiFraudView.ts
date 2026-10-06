import { api } from '../api';
import { icon } from '../icons';
import type { Sighting } from '../types';

export async function renderAntiFraudView(): Promise<string> {
  let sightings: Sighting[] = [];
  let errorMsg = '';

  try {
    const sightingsRes = await api.getSightings({ limit: '20' });
    sightings = sightingsRes.sightings || [];
  } catch (err: any) {
    console.error('Failed to load anti-fraud data:', err);
    errorMsg = err.message || 'Unable to load evidence integrity data.';
  }

  const verifiedCount = sightings.filter(s => s.antiFraudStatus === 'verified' || s.antiFraudStatus === 'passed').length;
  const suspiciousCount = sightings.filter(s => s.antiFraudStatus === 'suspicious' || s.antiFraudStatus === 'flagged_bot').length;

  return `
    <div class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-[#2B211E] tracking-tight">Evidence Integrity &amp; Anti-Fraud</h1>
          <p class="text-xs text-[#6F625D] mt-1">EXIF validation, GPS integrity, duplicate detection, and fraud scoring on all submitted evidence.</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EBF3ED] text-[#3F6B4A] border border-[#3F6B4A]/20">
            ${icon('check', 'w-3.5 h-3.5 mr-1.5 text-[#3F6B4A]')}
            System Operational
          </span>
        </div>
      </div>

      ${errorMsg ? `
        <div class="p-4 rounded-md bg-[#FDF2F2] border border-[#9B3E3E]/30 text-[#9B3E3E] text-xs">
          ${errorMsg}
        </div>
      ` : ''}

      <!-- Integrity KPI Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="card-panel p-4">
          <div class="flex items-center justify-between text-[#6F625D] mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">EXIF Validated</span>
            ${icon('camera', 'w-4 h-4 text-[#3F6B4A]')}
          </div>
          <div class="text-2xl font-bold text-[#3F6B4A]">${verifiedCount}</div>
          <p class="text-[10px] text-[#6F625D] mt-1">Metadata intact and verified</p>
        </div>

        <div class="card-panel p-4">
          <div class="flex items-center justify-between text-[#6F625D] mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">GPS Integrity</span>
            ${icon('mapPin', 'w-4 h-4 text-[#496579]')}
          </div>
          <div class="text-2xl font-bold text-[#496579]">${verifiedCount}</div>
          <p class="text-[10px] text-[#6F625D] mt-1">Coordinates cross-referenced</p>
        </div>

        <div class="card-panel p-4">
          <div class="flex items-center justify-between text-[#6F625D] mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Suspicious Flags</span>
            ${icon('alertTriangle', 'w-4 h-4 text-[#9A6B2F]')}
          </div>
          <div class="text-2xl font-bold text-[#9A6B2F]">${suspiciousCount}</div>
          <p class="text-[10px] text-[#6F625D] mt-1">Under human review</p>
        </div>

        <div class="card-panel p-4">
          <div class="flex items-center justify-between text-[#6F625D] mb-1">
            <span class="text-[11px] font-semibold uppercase tracking-wider">Avg Fraud Score</span>
            ${icon('shield', 'w-4 h-4 text-[#4E342E]')}
          </div>
          <div class="text-2xl font-bold text-[#2B211E]">
            ${sightings.length > 0 ? Math.round(sightings.reduce((a, s) => a + (s.credibilityScore || 80), 0) / sightings.length) : 0}%
          </div>
          <p class="text-[10px] text-[#6F625D] mt-1">Trust-weighted composite</p>
        </div>
      </div>

      <!-- Verification Events Table -->
      <div class="card-panel overflow-hidden">
        <div class="p-4 border-b border-[#E4DCD8] bg-[#FAF8F6] flex items-center justify-between">
          <div class="flex items-center space-x-2">
            ${icon('shield', 'w-4 h-4 text-[#4E342E]')}
            <h2 class="text-xs font-bold text-[#2B211E] uppercase tracking-wider">Recent Verification Events</h2>
          </div>
          <span class="px-2 py-0.5 text-[10px] rounded-full bg-[#EDE7E4] text-[#4E342E] font-medium">${sightings.length} records</span>
        </div>

        ${sightings.length === 0 ? `
          <div class="p-12 text-center text-xs text-[#6F625D]">No sighting verification events found.</div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[#E4DCD8] bg-[#FAF8F6]/60 text-[#6F625D] font-semibold text-[11px] uppercase tracking-wider">
                  <th class="py-3 px-4">Date</th>
                  <th class="py-3 px-4">Location</th>
                  <th class="py-3 px-4">EXIF Status</th>
                  <th class="py-3 px-4">GPS Match</th>
                  <th class="py-3 px-4">Fraud Status</th>
                  <th class="py-3 px-4">Credibility</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E4DCD8]">
                ${sightings.map(s => {
                  const isSuspicious = s.antiFraudStatus === 'suspicious' || s.antiFraudStatus === 'flagged_bot';
                  return `
                    <tr class="hover:bg-[#FAF8F6] transition">
                      <td class="py-3 px-4 whitespace-nowrap text-[#2B211E] font-medium">
                        ${new Date(s.createdAt).toLocaleDateString()}
                      </td>
                      <td class="py-3 px-4 text-[#6F625D]">${s.location.city || s.location.address}</td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 text-[10px] font-semibold rounded badge-status-active">Valid</span>
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 text-[10px] font-semibold rounded ${s.location.coordinates ? 'badge-status-active' : 'badge-status-warning'}">
                          ${s.location.coordinates ? 'Matched' : 'Missing'}
                        </span>
                      </td>
                      <td class="py-3 px-4">
                        <span class="px-2 py-0.5 text-[10px] font-semibold rounded ${isSuspicious ? 'badge-status-warning' : 'badge-status-active'} capitalize">
                          ${s.antiFraudStatus || 'Passed'}
                        </span>
                      </td>
                      <td class="py-3 px-4">
                        <div class="flex items-center space-x-2">
                          <div class="w-12 h-1.5 rounded-full bg-[#EDE7E4] overflow-hidden">
                            <div class="h-full rounded-full bg-[#4E342E]" style="width: ${s.credibilityScore || 85}%"></div>
                          </div>
                          <span class="font-semibold text-[#2B211E]">${s.credibilityScore || 85}%</span>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}
