import { state } from '../state';
import { icon } from '../icons';

export function renderToastContainer(): string {
  const toasts = state.getToasts();

  return `
    <div id="toast-container" class="fixed bottom-4 right-4 z-50 flex flex-col space-y-2.5 pointer-events-none max-w-sm w-full px-4">
      ${toasts.map(toast => {
        const borderColors = {
          success: 'border-[#7ea88f]/40 bg-[#1e2721]/95 text-[#a8d3b8]',
          warning: 'border-[#d4a362]/40 bg-[#292218]/95 text-[#eed1a4]',
          error: 'border-[#d97a85]/40 bg-[#2b181b]/95 text-[#f5b3bb]',
          ai: 'border-[#bd97e1]/50 bg-[#251a36]/95 text-[#e7d8f5] shadow-[#8c55bd]/20',
          info: 'border-[#ceb79a]/40 bg-[#241c2c]/95 text-[#e8ded1]',
        }[toast.type] || 'border-[#dfd0ba]/20 bg-[#1e172c] text-[#f7f3ec]';

        const iconSvg = {
          success: icon('check', 'w-4 h-4 text-[#7ea88f]'),
          warning: icon('alertTriangle', 'w-4 h-4 text-[#d4a362]'),
          error: icon('x', 'w-4 h-4 text-[#d97a85]'),
          ai: icon('sparkles', 'w-4 h-4 text-[#bd97e1]'),
          info: icon('info', 'w-4 h-4 text-[#ceb79a]'),
        }[toast.type] || icon('bell', 'w-4 h-4 text-[#ceb79a]');

        return `
          <div class="pointer-events-auto p-3.5 rounded-xl border ${borderColors} shadow-xl backdrop-blur-md flex items-start space-x-3 text-xs animate-in slide-in-from-bottom-2 fade-in duration-200">
            <span class="shrink-0 mt-0.5">${iconSvg}</span>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-[#f7f3ec]">${toast.title}</h4>
              <p class="text-[#dfd0ba]/90 mt-0.5 text-[11px] leading-relaxed">${toast.message}</p>
            </div>
            <button data-toast-id="${toast.id}" class="btn-dismiss-toast text-[#ceb79a]/60 hover:text-[#f7f3ec] text-sm shrink-0 cursor-pointer">
              ${icon('x', 'w-3.5 h-3.5')}
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
