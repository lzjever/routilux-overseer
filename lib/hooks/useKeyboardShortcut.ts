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
  /** When true, the shortcut also fires when focus is in an input/textarea. Default: false */
  allowInInput?: boolean;
}

const normalizeKey = (key?: string | null) => {
  if (!key) return null;
  const lowered = key.toLowerCase();
  return lowered === " " ? "space" : lowered;
};

const shouldIgnoreKeyEvent = (e: KeyboardEvent) =>
  e.isComposing || e.key === "Process" || e.key === "Unidentified";

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcut(shortcut: KeyboardShortcut) {
  useEffect(() => {
    const enabled = shortcut.enabled !== false;
    const shortcutKey = normalizeKey(shortcut.key);
    if (!enabled || !shortcutKey) return;

    const handler = (e: KeyboardEvent) => {
      if (shouldIgnoreKeyEvent(e)) return;
      const eventKey = normalizeKey(e.key);
      if (!eventKey) return;
      const keyMatch = eventKey === shortcutKey;
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
      const shortcutKey = normalizeKey(shortcut.key);
      if (!enabled || !shortcutKey) return;

      const handler = (e: KeyboardEvent) => {
        if (shouldIgnoreKeyEvent(e)) return;
        const eventKey = normalizeKey(e.key);
        if (!eventKey) return;
        const keyMatch = eventKey === shortcutKey;
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
