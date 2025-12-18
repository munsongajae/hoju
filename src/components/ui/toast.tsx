"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles = {
  success: "bg-emerald-500 text-white border-emerald-600",
  error: "bg-red-500 text-white border-red-600",
  info: "bg-blue-500 text-white border-blue-600",
  warning: "bg-orange-500 text-white border-orange-600",
};

export function Toast({ id, message, type = "info", duration = 3000, onClose }: ToastProps) {
  const Icon = toastIcons[type];

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border min-w-[300px] max-w-md",
        toastStyles[type]
      )}
      style={{
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="shrink-0 hover:opacity-80 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export interface ToastData {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastData[]; onClose: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast id={toast.id} message={toast.message} type={toast.type} duration={toast.duration} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
