import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-indigo-400" />,
  };

  const borderStyles = {
    success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-200',
    error: 'border-rose-500/30 bg-rose-950/40 text-rose-200',
    info: 'border-indigo-500/30 bg-indigo-950/40 text-indigo-200',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border rounded-xl shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
        borderStyles[toast.type]
      }`}
    >
      {icons[toast.type]}
      <span className="text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto text-slate-400 hover:text-slate-200"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
