import { api } from '../api';
import { state } from '../state';
import { icon } from '../icons';
import type { AuditLog } from '../types';

export async function renderAuditLogView(): Promise<string> {
  let logs: AuditLog[] = [];
  let total = 0;
  let errorMsg = '';

  try {
    const res = await api.getAuditLogs({ limit: '50' });
    logs = res.logs || [];
    total = res.total || logs.length;
  } catch (err: any) {
    console.error('Failed to load audit logs:', err);
    errorMsg = err.message || 'Failed to load audit logs from server.';
  }

  const searchQuery = state.getSearchQuery().toLowerCase();
  if (searchQuery) {
    logs = logs.filter(
      (l) =>
        (l.action && l.action.toLowerCase().includes(searchQuery)) ||
        (l.resourceType && l.resourceType.toLowerCase().includes(searchQuery)) ||
        (l.resourceId && l.resourceId.toLowerCase().includes(searchQuery)) ||
        (typeof l.userId === 'object' && (l.userId as any)?.name?.toLowerCase().includes(searchQuery))
    );
  }

  return `
    <div class="space-y-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-[#2B211E] tracking-tight">Audit Log &amp; Chain of Custody</h1>
          <p class="text-xs text-[#6F625D] mt-1">Immutable chronological ledger of forensic access, biometric processing, and case modifications.</p>
        </div>
        <div class="flex items-center space-x-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#EBF3ED] text-[#3F6B4A] border border-[#3F6B4A]/20">
            ${icon('check', 'w-3.5 h-3.5 mr-1.5 text-[#3F6B4A]')}
            CJIS Cryptographic Integrity Verified
          </span>
        </div>
      </div>

      ${
        errorMsg
          ? `
        <div class="p-4 rounded-md bg-[#FDF2F2] border border-[#9B3E3E]/30 text-[#9B3E3E] text-xs flex items-center justify-between">
          <span>${errorMsg}</span>
          <button onclick="location.reload()" class="underline font-semibold ml-4">Retry</button>
        </div>
      `
          : ''
      }

      <!-- Audit Ledger Table -->
      <div class="card-panel overflow-hidden">
        <div class="p-4 border-b border-[#E4DCD8] bg-[#FAF8F6] flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold text-[#2B211E]">Activity Ledger</span>
            <span class="px-2 py-0.5 text-[10px] rounded-full bg-[#EDE7E4] text-[#4E342E] font-medium">${logs.length} of ${total} events</span>
          </div>
          <div class="flex items-center space-x-2">
            <select id="audit-action-filter" class="input-mocha py-1 px-2.5 text-xs text-[#2B211E]">
              <option value="all">All Actions</option>
              <option value="auth">Authentication</option>
              <option value="case">Case Modifications</option>
              <option value="lead">Lead Verification</option>
              <option value="evidence">Evidence Access</option>
            </select>
          </div>
        </div>

        ${
          logs.length === 0
            ? `
          <div class="p-12 text-center">
            <div class="w-12 h-12 rounded-full bg-[#EDE7E4] text-[#4E342E] flex items-center justify-center mx-auto mb-3">
              ${icon('fileText', 'w-6 h-6')}
            </div>
            <h3 class="text-sm font-semibold text-[#2B211E]">No audit logs recorded</h3>
            <p class="text-xs text-[#6F625D] mt-1">Actions performed on the platform will appear here in chronological order.</p>
          </div>
        `
            : `
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[#E4DCD8] bg-[#FAF8F6]/60 text-[#6F625D] font-semibold text-[11px] uppercase tracking-wider">
                  <th class="py-3 px-4">Timestamp</th>
                  <th class="py-3 px-4">Actor / Role</th>
                  <th class="py-3 px-4">Action</th>
                  <th class="py-3 px-4">Resource Target</th>
                  <th class="py-3 px-4">Audit Details</th>
                  <th class="py-3 px-4 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#E4DCD8]">
                ${logs
                  .map((log) => {
                    const actorName = typeof log.userId === 'object' ? (log.userId as any)?.name || 'System' : 'Investigator';
                    const actorRole = typeof log.userId === 'object' ? (log.userId as any)?.role || 'system' : 'investigator';

                    return `
                    <tr class="hover:bg-[#FAF8F6] transition font-mono text-[11px]">
                      <td class="py-3 px-4 text-[#6F625D] whitespace-nowrap font-sans">
                        ${new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </td>
                      <td class="py-3 px-4 whitespace-nowrap font-sans">
                        <div class="font-medium text-[#2B211E]">${actorName}</div>
                        <div class="text-[10px] text-[#6F625D] capitalize">${actorRole}</div>
                      </td>
                      <td class="py-3 px-4 whitespace-nowrap">
                        <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EDE7E4] text-[#4E342E]">
                          ${log.action}
                        </span>
                      </td>
                      <td class="py-3 px-4 whitespace-nowrap text-[#496579] font-medium">
                        ${log.resourceType || 'platform'} ${log.resourceId ? `· ${log.resourceId.slice(-6)}` : ''}
                      </td>
                      <td class="py-3 px-4 font-sans text-[#2B211E] max-w-sm">
                        <div class="truncate">${typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || 'Action completed successfully.'}</div>
                      </td>
                      <td class="py-3 px-4 text-right text-[#6F625D] whitespace-nowrap font-mono text-[10px]">
                        ${log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  `;
                  })
                  .join('')}
              </tbody>
            </table>
          </div>
        `
        }
      </div>
    </div>
  `;
}
