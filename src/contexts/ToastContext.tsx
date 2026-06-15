import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  let counter = 0;

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now() + counter++;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const remove = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container — top-right */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 min-w-[280px] max-w-sm px-4 py-3.5 rounded-xl shadow-xl border animate-slide-up ${
              toast.type === "success" ? "bg-farm-cream border-farm-green/30" :
              toast.type === "error" ? "bg-red-50 border-red-200" :
              "bg-blue-50 border-blue-200"
            }`}
          >
            {/* Icon */}
            <div
              className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                toast.type === "success" ? "bg-farm-green-light" :
                toast.type === "error" ? "bg-red-100" :
                "bg-blue-100"
              }`}
            >
              {toast.type === "success" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-farm-green">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              {toast.type === "error" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-red-600">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" />
                </svg>
              )}
              {toast.type === "info" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-blue-600">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4m0-4h.01" />
                </svg>
              )}
            </div>

            {/* Message */}
            <p
              className={`text-sm font-semibold flex-1 leading-snug ${
                toast.type === "success" ? "text-farm-text" :
                toast.type === "error" ? "text-red-800" :
                "text-blue-800"
              }`}
            >
              {toast.message}
            </p>

            {/* Close button */}
            <button
              onClick={() => remove(toast.id)}
              className={`shrink-0 opacity-50 hover:opacity-100 transition-opacity ${
                toast.type === "success" ? "text-farm-text-light hover:text-farm-text" :
                toast.type === "error" ? "text-red-600 hover:text-red-800" :
                "text-blue-600 hover:text-blue-800"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
