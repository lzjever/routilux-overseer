import type { RoutineMonitoringData, SlotQueueStatus } from "@/lib/api/generated";

/**
 * Calculate heat value for a node (routine) based on execution metrics
 * Returns a value between 0 and 1, where 1 is maximum heat
 */
export function calculateNodeHeat(routineData: RoutineMonitoringData): number {
  const execCount = routineData.execution_status.execution_count || 0;
  const errorCount = routineData.execution_status.error_count || 0;
  const threadCount = routineData.execution_status.active_thread_count || 0;

  // Heat = execution count weight - error penalty + thread count weight
  // Normalize to 0-1 range (assuming max reasonable values)
  const execScore = Math.min(execCount / 100, 1.0) * 0.4;
  const errorPenalty = Math.min(errorCount / 10, 1.0) * 0.3;
  const threadScore = Math.min(threadCount / 5, 1.0) * 0.3;

  const heat = execScore - errorPenalty + threadScore;
  return Math.max(0, Math.min(1, heat));
}

/**
 * Calculate heat value for an edge (connection) based on queue status
 * Returns a value between 0 and 1, where 1 is maximum heat
 */
export function calculateEdgeHeat(queueStatus: SlotQueueStatus): number {
  const usage = queueStatus.usage_percentage || 0;
  const pressureValue = {
    low: 0.25,
    medium: 0.5,
    high: 0.75,
    critical: 1.0,
  }[queueStatus.pressure_level] || 0.25;

  // Heat = usage weight + pressure weight
  return usage * 0.6 + pressureValue * 0.4;
}

/**
 * Get color for heat value (0-1)
 * Returns a color string suitable for CSS
 */
export function getHeatColor(heat: number): string {
  // Cold (blue) -> Warm (yellow) -> Hot (red)
  if (heat < 0.33) {
    // Cold: blue shades
    const intensity = heat / 0.33;
    return `rgb(${Math.round(100 + intensity * 100)}, ${Math.round(150 + intensity * 50)}, 255)`;
  } else if (heat < 0.66) {
    // Warm: yellow shades
    const intensity = (heat - 0.33) / 0.33;
    return `rgb(255, ${Math.round(200 - intensity * 100)}, ${Math.round(100 - intensity * 100)})`;
  } else {
    // Hot: red shades
    const intensity = (heat - 0.66) / 0.34;
    return `rgb(255, ${Math.round(100 - intensity * 100)}, ${Math.round(50 - intensity * 50)})`;
  }
}

/**
 * Get border color for heat value (for nodes)
 */
export function getHeatBorderColor(heat: number): string {
  if (heat < 0.33) {
    return "border-blue-300";
  } else if (heat < 0.66) {
    return "border-yellow-400";
  } else {
    return "border-red-500";
  }
}

/**
 * Get stroke color for heat value (for edges)
 */
export function getHeatStrokeColor(heat: number): string {
  if (heat < 0.33) {
    return "#60a5fa"; // blue-400
  } else if (heat < 0.66) {
    return "#fbbf24"; // amber-400
  } else {
    return "#ef4444"; // red-500
  }
}

/**
 * Get stroke width for heat value (for edges)
 * Returns a value between 1 and 4
 */
export function getHeatStrokeWidth(heat: number): number {
  return 1 + heat * 3;
}
