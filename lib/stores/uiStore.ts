import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface RoutineDetail {
  routineId: string;
  jobId: string;
  flowId: string;
}

interface UIState {
  // 选中的节点（用于显示详情）
  selectedRoutine: RoutineDetail | null;

  // 面板显示状态
  isDetailPanelOpen: boolean;
  isEventLogExpanded: boolean;

  // Actions
  selectRoutine: (detail: RoutineDetail | null) => void;
  closeDetailPanel: () => void;
  toggleEventLog: () => void;
  setEventLogExpanded: (expanded: boolean) => void;
  clearSelection: () => void;
}

export const useUIStore = create<UIState>()(
  subscribeWithSelector((set) => ({
    selectedRoutine: null,
    isDetailPanelOpen: false,
    isEventLogExpanded: false,

    selectRoutine: (detail) =>
      set({
        selectedRoutine: detail,
        isDetailPanelOpen: detail !== null,
      }),

    closeDetailPanel: () =>
      set({
        selectedRoutine: null,
        isDetailPanelOpen: false,
      }),

    toggleEventLog: () =>
      set((state) => ({
        isEventLogExpanded: !state.isEventLogExpanded,
      })),

    setEventLogExpanded: (expanded) =>
      set({
        isEventLogExpanded: expanded,
      }),

    clearSelection: () =>
      set({
        selectedRoutine: null,
        isDetailPanelOpen: false,
      }),
  }))
);
