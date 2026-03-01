"use client";

import * as React from "react";
import { setGlobalConfirm } from "@/lib/confirm-bridge";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  onConfirm?: () => void | Promise<void>;
}

type ConfirmState = ConfirmOptions & {
  open: boolean;
  resolve: (value: boolean) => void;
};

const defaultOptions: Partial<ConfirmOptions> = {
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: "default",
};

const ConfirmDialogContext = React.createContext<{
  openConfirm: (options: ConfirmOptions) => Promise<boolean>;
} | null>(null);

export function useConfirm() {
  const ctx = React.useContext(ConfirmDialogContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmDialogProvider");
  return ctx;
}

export function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ConfirmState | null>(null);

  const openConfirm = React.useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        ...defaultOptions,
        ...options,
        open: true,
        resolve,
      });
    });
  }, []);

  React.useEffect(() => {
    setGlobalConfirm((message: string) =>
      openConfirm({ title: message, cancelLabel: "Cancel", confirmLabel: "OK" })
    );
    return () => setGlobalConfirm(null);
  }, [openConfirm]);

  const handleClose = React.useCallback(
    (result: boolean) => {
      if (!state) return;
      state.resolve(result);
      setState(null);
    },
    [state]
  );

  const handleConfirm = React.useCallback(async () => {
    if (!state) return;
    try {
      await state.onConfirm?.();
    } finally {
      handleClose(true);
    }
  }, [state, handleClose]);

  return (
    <ConfirmDialogContext.Provider value={{ openConfirm }}>
      {children}
      {state && (
        <AlertDialog open={true} onOpenChange={(open) => !open && handleClose(false)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{state.title}</AlertDialogTitle>
              {state.description && (
                <AlertDialogDescription>{state.description}</AlertDialogDescription>
              )}
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleClose(false)}>
                {state.cancelLabel}
              </AlertDialogCancel>
              <Button
                variant={state.variant === "destructive" ? "destructive" : "default"}
                onClick={() => handleConfirm()}
              >
                {state.confirmLabel}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </ConfirmDialogContext.Provider>
  );
}
