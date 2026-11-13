import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useApp } from '../context/useApp';

export const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let accentColor = 'bg-[#1E1F22] text-[#FFAE19]';
        let borderColor = 'border-[#1E1F22]';
        let icon = <Info className="w-4 h-4 text-[#FFAE19] shrink-0 mt-0.5" />;

        if (toast.type === 'success') {
          accentColor = 'bg-[#3A6B5C] text-white';
          icon = <CheckCircle2 className="w-4 h-4 text-white shrink-0 mt-0.5" />;
        } else if (toast.type === 'warning') {
          accentColor = 'bg-[#D95D24] text-white';
          icon = <AlertTriangle className="w-4 h-4 text-white shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto beige-chassis p-3.5 border-2 ${borderColor} hard-shadow-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-150`}
          >
            <div className={`p-1.5 border border-[#1E1F22] ${accentColor} hard-shadow-sm`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-bold text-[#1E1F22] tracking-wider uppercase">
                {toast.title}
              </p>
              {toast.message && (
                <p className="text-xs font-mono text-[#525760] mt-0.5 leading-snug">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss toast"
              className="text-[#6E737D] hover:text-[#1E1F22] p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
