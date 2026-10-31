'use client';

import { createContext, useCallback, useContext, useState } from 'react';

type Toast = { id: number; message: string; type: 'success' | 'error' };

const ShopToastContext = createContext<{
  showToast: (message: string, type?: 'success' | 'error') => void;
} | null>(null);

export function ShopToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  return (
    <ShopToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 lg:bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-lg ${
              t.type === 'error' ? 'bg-red-600' : 'bg-[#2874f0]'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ShopToastContext.Provider>
  );
}

export function useShopToast() {
  const ctx = useContext(ShopToastContext);
  if (!ctx) throw new Error('useShopToast must be used within ShopToastProvider');
  return ctx;
}
