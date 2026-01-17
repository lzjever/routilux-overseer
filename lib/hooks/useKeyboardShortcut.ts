import { useEffect } from "react";

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
  enabled?: boolean;
}

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  useEffect(() => {
    const enabled = shortcut.enabled !== false;
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
      const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;
      const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
      const altMatch = shortcut.alt ? e.altKey : !e.altKey;

      // Check if we're in an input/textarea/contenteditable
      const isInput = 
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);

      // Don't trigger if in input (unless explicitly allowed)
      if (isInput && !shortcut.allowInInput) {
        return;
      }

      if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
        if (shortcut.preventDefault !== false) {
          e.preventDefault();
        }
        shortcut.handler(e);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcut]);
}

/**
 * Hook to register multiple keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handlers: Array<{ handler: (e: KeyboardEvent) => void; shortcut: KeyboardShortcut }> = [];

    shortcuts.forEach((shortcut) => {
      const enabled = shortcut.enabled !== false;
      if (!enabled) return;

      const handler = (e: KeyboardEvent) => {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : !e.ctrlKey;
        const metaMatch = shortcut.meta ? e.metaKey : !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        const altMatch = shortcut.alt ? e.altKey : !e.altKey;

        const isInput = 
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement ||
          (e.target instanceof HTMLElement && e.target.isContentEditable);

        if (isInput && !shortcut.allowInInput) {
          return;
        }

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          if (shortcut.preventDefault !== false) {
            e.preventDefault();
          }
          shortcut.handler(e);
        }
      };

      window.addEventListener("keydown", handler);
      handlers.push({ handler, shortcut });
    });

    return () => {
      handlers.forEach(({ handler }) => {
        window.removeEventListener("keydown", handler);
      });
    };
  }, [shortcuts]);
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(shortcut: {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
}): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.meta) parts.push("⌘");
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.alt) parts.push("Alt");
  parts.push(shortcut.key.toUpperCase());
  return parts.join(" + ");
}
