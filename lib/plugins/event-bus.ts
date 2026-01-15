// EventBus - 全局事件总线
// 用于插件之间和插件与核心之间的通信

type EventHandler = (data: any) => void;
type EventType = string;

class EventBus {
  private listeners: Map<EventType, Set<EventHandler>> = new Map();
  private onceListeners: Map<EventType, Set<EventHandler>> = new Map();

  /**
   * 订阅事件
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  on(event: EventType, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // 返回取消订阅函数
    return () => this.off(event, handler);
  }

  /**
   * 一次性订阅（只触发一次）
   * @param event 事件名称
   * @param handler 事件处理函数
   * @returns 取消订阅的函数
   */
  once(event: EventType, handler: EventHandler): () => void {
    if (!this.onceListeners.has(event)) {
      this.onceListeners.set(event, new Set());
    }
    this.onceListeners.get(event)!.add(handler);

    return () => this.off(event, handler, true);
  }

  /**
   * 取消订阅
   * @param event 事件名称
   * @param handler 事件处理函数（可选，如果不提供则取消所有）
   * @param isOnce 是否是一次性监听器
   */
  off(event: EventType, handler?: EventHandler, isOnce: boolean = false): void {
    const listenersMap = isOnce ? this.onceListeners : this.listeners;

    if (!handler) {
      // 取消该事件的所有监听器
      listenersMap.delete(event);
      return;
    }

    const listeners = listenersMap.get(event);
    if (listeners) {
      listeners.delete(handler);
      if (listeners.size === 0) {
        listenersMap.delete(event);
      }
    }
  }

  /**
   * 发布事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emit(event: EventType, data?: any): void {
    // 触发普通监听器
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }

    // 触发一次性监听器
    const onceListeners = this.onceListeners.get(event);
    if (onceListeners) {
      onceListeners.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in once event handler for "${event}":`, error);
        }
      });
      // 触发后清除一次性监听器
      this.onceListeners.delete(event);
    }

    // 通配符监听器 (*)
    const wildcardListeners = this.listeners.get("*");
    if (wildcardListeners) {
      wildcardListeners.forEach((handler) => {
        try {
          handler({ event, data });
        } catch (error) {
          console.error(`Error in wildcard event handler:`, error);
        }
      });
    }
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    this.listeners.clear();
    this.onceListeners.clear();
  }

  /**
   * 获取某个事件的监听器数量
   * @param event 事件名称
   */
  listenerCount(event: EventType): number {
    const regular = this.listeners.get(event)?.size || 0;
    const once = this.onceListeners.get(event)?.size || 0;
    return regular + once;
  }

  /**
   * 获取所有事件名称
   */
  eventNames(): EventType[] {
    const regularEvents = Array.from(this.listeners.keys());
    const onceEvents = Array.from(this.onceListeners.keys());
    return Array.from(new Set([...regularEvents, ...onceEvents]));
  }
}

// 创建全局单例
let globalEventBus: EventBus | null = null;

export function getEventBus(): EventBus {
  if (!globalEventBus) {
    globalEventBus = new EventBus();
  }
  return globalEventBus;
}

export { EventBus };
export type { EventHandler, EventType };
