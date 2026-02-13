"use client";

import { useSonner, Toaster as SonnerToaster, type ToasterProps } from "sonner";
import { toast as sonnerToast } from "sonner";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

export { sonnerToast as toast };

// Toast UI primitives for use with the custom useToast hook
const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
          className
        )}
        {...props}
      />
    );
  }
);
Toast.displayName = "Toast";

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("text-sm font-semibold", className)} {...props} />;
  }
);
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />;
  }
);
ToastDescription.displayName = "ToastDescription";

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
        className
      )}
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  );
});
ToastClose.displayName = "ToastClose";

const ToastViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "fixed bottom-0 right-0 z-[100] flex flex-col gap-2 p-4 pointer-events-none",
          className
        )}
        {...props}
      />
    );
  }
);
ToastViewport.displayName = "ToastViewport";

export { Toast, ToastClose, ToastDescription, ToastTitle, ToastViewport };

// ToastProvider - passthrough component for the useToast hook system
// The useToast hook uses its own state management and doesn't need a provider
const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
ToastProvider.displayName = "ToastProvider";

export { ToastProvider };

// Re-export sonner's Toaster with props support
export function Toaster(props: ToasterProps) {
  return <SonnerToaster {...props} />;
}
