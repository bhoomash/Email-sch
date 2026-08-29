import React, { useEffect } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

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
    success: <FiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <FiAlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <FiInfo className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-600 bg-slate-900 text-white',
    error: 'border-rose-600 bg-slate-900 text-white',
    info: 'border-blue-600 bg-slate-900 text-white',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border rounded-none shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-150 ${
        borderStyles[toast.type]
      }`}
    >
      {icons[toast.type]}
      <span className="text-xs font-semibold">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="ml-auto text-gray-400 hover:text-white transition-colors"
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

