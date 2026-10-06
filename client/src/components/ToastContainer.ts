import { state } from '../state';

export function renderToastContainer(): string {
  const toasts = state.getToasts();

  return `
    <div id="toast-container" class="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full px-4">
      ${toasts.map(toast => {
        const borderColors = {
          success: 'border-emerald-500/50 bg-slate-900/95 text-emerald-300',
          warning: 'border-amber-500/50 bg-slate-900/95 text-amber-300',
          error: 'border-rose-500/50 bg-slate-900/95 text-rose-300',
          ai: 'border-purple-500/60 bg-purple-950/90 text-purple-200 shadow-purple-900/40',
          info: 'border-indigo-500/50 bg-slate-900/95 text-indigo-300',
        }[toast.type] || 'border-slate-700 bg-slate-900 text-slate-200';

        const icons = {
          success: '✓',
          warning: '⚠️',
          error: '✕',
          ai: '⚡',
          info: 'ℹ️',
        }[toast.type] || '•';

        return `
          <div class="pointer-events-auto p-3.5 rounded-xl border ${borderColors} shadow-xl backdrop-blur-md flex items-start space-x-3 text-xs animate-in slide-in-from-bottom-2 fade-in duration-200">
            <span class="text-sm font-bold shrink-0 mt-0.5">${icons}</span>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-white">${toast.title}</h4>
              <p class="text-slate-300 mt-0.5 text-[11px] leading-relaxed">${toast.message}</p>
            </div>
            <button data-toast-id="${toast.id}" class="btn-dismiss-toast text-slate-400 hover:text-white text-sm shrink-0 cursor-pointer">
              ✕
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function setupToastEvents(): void {
  document.querySelectorAll<HTMLButtonElement>('.btn-dismiss-toast').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-toast-id');
      if (id) {
        state.removeToast(id);
      }
    });
  });
}
