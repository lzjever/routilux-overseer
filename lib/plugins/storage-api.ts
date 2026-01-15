// Storage API - 统一的存储接口
// 封装 LocalStorage 和 IndexedDB，提供简单的存储 API

/**
 * LocalStorage 存储接口
 */
class LocalStorageAPI {
  /**
   * 获取数据
   * @param key 键名
   * @returns 数据，不存在返回 null
   */
  get<T>(key: string): T | null {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return null;
    }
  }

  /**
   * 设置数据
   * @param key 键名
   * @param value 数据值
   */
  set(key: string, value: any): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      throw error;
    }
  }

  /**
   * 删除数据
   * @param key 键名
   */
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    try {
      window.localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }

  /**
   * 获取所有键名
   */
  keys(): string[] {
    try {
      return Object.keys(window.localStorage);
    } catch (error) {
      console.error("Error getting localStorage keys:", error);
      return [];
    }
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking localStorage key (${key}):`, error);
      return false;
    }
  }
}

/**
 * IndexedDB 存储接口
 * 用于存储大量数据
 */
class IndexedDBAPI {
  private db: IDBDatabase | null = null;
  private dbName = "RoutiluxOverseerDB";
  private dbVersion = 1;

  /**
   * 初始化 IndexedDB
   */
  private async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 创建对象仓库（如果不存在）
        if (!db.objectStoreNames.contains("default")) {
          db.createObjectStore("default", { keyPath: "id" });
        }
      };
    });
  }

  /**
   * 获取对象仓库
   */
  private async getStore(storeName: string, mode: IDBTransactionMode = "readonly"): Promise<IDBObjectStore> {
    const db = await this.init();

    // 如果 store 不存在，创建它
    if (!db.objectStoreNames.contains(storeName)) {
      await this.createObjectStore(storeName);
    }

    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  /**
   * 创建对象仓库
   */
  private async createObjectStore(storeName: string): Promise<void> {
    const db = await this.init();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["default"], "versionchange");

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);

      const store = db.createObjectStore(storeName, { keyPath: "id" });
      store.transaction.oncomplete = () => resolve();
    });
  }

  /**
   * 获取数据
   * @param storeName 对象仓库名
   * @param key 键名
   * @returns 数据，不存在返回 null
   */
  async get<T>(storeName: string, key: string): Promise<T | null> {
    try {
      const store = await this.getStore(storeName, "readonly");
      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Error reading from IndexedDB (${storeName}/${key}):`, error);
      return null;
    }
  }

  /**
   * 设置数据
   * @param storeName 对象仓库名
   * @param key 键名
   * @param value 数据值（必须包含 id 字段作为主键）
   */
  async set(storeName: string, key: string, value: any): Promise<void> {
    try {
      // 确保值有 id 字段
      const data = { ...value, id: key };

      const store = await this.getStore(storeName, "readwrite");

      return new Promise((resolve, reject) => {
        const request = store.put(data);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error writing to IndexedDB (${storeName}/${key}):`, error);
      throw error;
    }
  }

  /**
   * 删除数据
   * @param storeName 对象仓库名
   * @param key 键名
   */
  async remove(storeName: string, key: string): Promise<void> {
    try {
      const store = await this.getStore(storeName, "readwrite");

      return new Promise((resolve, reject) => {
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error removing from IndexedDB (${storeName}/${key}):`, error);
    }
  }

  /**
   * 获取所有数据
   * @param storeName 对象仓库名
   * @returns 所有数据数组
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const store = await this.getStore(storeName, "readonly");

      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onsuccess = () => {
          resolve(request.result || []);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Error getting all from IndexedDB (${storeName}):`, error);
      return [];
    }
  }

  /**
   * 清空对象仓库
   * @param storeName 对象仓库名
   */
  async clear(storeName: string): Promise<void> {
    try {
      const store = await this.getStore(storeName, "readwrite");

      return new Promise((resolve, reject) => {
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error(`Error clearing IndexedDB (${storeName}):`, error);
    }
  }

  /**
   * 计数
   * @param storeName 对象仓库名
   * @returns 数据数量
   */
  async count(storeName: string): Promise<number> {
    try {
      const store = await this.getStore(storeName, "readonly");

      return new Promise((resolve, reject) => {
        const request = store.count();

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (error) {
      console.error(`Error counting IndexedDB (${storeName}):`, error);
      return 0;
    }
  }
}

/**
 * 统一的存储接口
 */
class StorageAPI {
  readonly localStorage = new LocalStorageAPI();
  readonly indexedDB = new IndexedDBAPI();

  /**
   * LocalStorage 快捷方法
   */
  get = this.localStorage.get.bind(this.localStorage);
  set = this.localStorage.set.bind(this.localStorage);
  remove = this.localStorage.remove.bind(this.localStorage);
  clear = this.localStorage.clear.bind(this.localStorage);
}

// 创建全局单例
let globalStorageAPI: StorageAPI | null = null;

export function getStorageAPI(): StorageAPI {
  if (!globalStorageAPI) {
    globalStorageAPI = new StorageAPI();
  }
  return globalStorageAPI;
}

export { StorageAPI, LocalStorageAPI, IndexedDBAPI };
