import { useState, useEffect } from "react";

export type ToastProps = {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

const TOAST_LIMIT = 1;

type ToasterToast = ToastProps & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_VALUE;
  return count.toString();
}

type Action =
  | { type: "ADD_TOAST"; payload: ToasterToast }
  | { type: "UPDATE_TOAST"; payload: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId: ToasterToast["id"] }
  | { type: "REMOVE_TOAST"; payload: ToasterToast };

let memoryState: { toasts: ToasterToast[] } = { toasts: [] };

const dispatch = (action: Action) => {
  memoryState = reducer(memoryState, action);
  window.dispatchEvent(new Event("toast-update"));
};

function reducer(state: typeof memoryState, action: Action): typeof memoryState {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.payload, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      };
    }
    case "REMOVE_TOAST":
      if (action.payload.id === memoryState.toasts[0]?.id) {
        return {
          ...state,
          toasts: state.toasts.slice(1),
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload.id),
      };
    default:
      return state;
  }
}

function toast({ ...props }: ToastProps) {
  const id = genId();

  const update = (props: Partial<ToasterToast>) =>
    dispatch({
      type: "UPDATE_TOAST",
      payload: { id, ...props },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    payload: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = useState<typeof memoryState>(memoryState);

  useEffect(() => {
    const listener = () => {
      setState(memoryState);
    };
    window.addEventListener("toast-update", listener);
    return () => window.removeEventListener("toast-update", listener);
  }, []);

  return {
    toasts: state.toasts,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId: toastId ?? "" }),
  };
}

export { useToast, toast };
