import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Toast } from "@repo/ui";

type ToastVariant = "info" | "success" | "warning" | "danger";

interface ToastMessage {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showToast({ variant: "success", message, title });
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showToast({ variant: "danger", message, title });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showToast({ variant: "warning", message, title });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showToast({ variant: "info", message, title });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      {toasts.map((toast, index) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          duration={toast.duration || 5000}
          onClose={() => removeToast(toast.id)}
          position="top-right"
          style={{ top: `${24 + index * 100}px` }}
        />
      ))}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
