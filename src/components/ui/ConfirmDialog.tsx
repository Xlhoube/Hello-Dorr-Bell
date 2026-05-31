import React, { createContext, useContext, useState, ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ options, resolve });
    });
  };

  const handleClose = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm border-[var(--border-dim)] p-8 shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden !rounded-[2.5rem]">
            {/* Background Glow */}
            <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-20 ${
                confirmState.options.variant === 'danger' ? 'bg-rose-500' : 'bg-[var(--primary)]'
            }`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  confirmState.options.variant === 'danger' 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' 
                    : 'bg-[var(--primary)]/10 border-[var(--primary)]/20 text-[var(--primary)]'
                }`}>
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => handleClose(false)}
                  className="p-2 hover:bg-[var(--bg-main)] rounded-xl transition-colors text-[var(--text-muted)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight mb-2">
                {confirmState.options.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed opacity-80 mb-8">
                {confirmState.options.message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="flex-1 py-3 bg-[var(--bg-main)] hover:bg-[var(--border-dim)] text-[var(--text-secondary)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--border-dim)]"
                >
                  {confirmState.options.cancelLabel || 'Cancelar'}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  className={`flex-1 py-3 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 border-none ${
                    confirmState.options.variant === 'danger'
                      ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                      : 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-[var(--primary-glow)]'
                  }`}
                >
                  {confirmState.options.confirmLabel || 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
