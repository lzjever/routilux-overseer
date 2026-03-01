/**
 * Bridge so non-React code (e.g. plugin manager) can use the shared ConfirmDialog.
 * ConfirmDialogProvider sets the handler on mount; plugin context uses getConfirm().
 */

export type ConfirmHandler = (message: string) => Promise<boolean>;

let confirmHandler: ConfirmHandler | null = null;

export function setGlobalConfirm(handler: ConfirmHandler | null): void {
  confirmHandler = handler;
}

export function getConfirm(): ConfirmHandler {
  return (message: string) => {
    if (confirmHandler) return confirmHandler(message);
    return Promise.resolve(window.confirm(message));
  };
}
