import { Lead, Client, User, CompanySettings, IntegrationLog, Workflow } from '../types';

const DB_NAME = 'NHFG_Enterprise_DB';
const DB_VERSION = 5;

/**
 * PRODUCTION DATABASE ENGINE
 * Handles persistence for all CRM and Website entities with silent error recovery.
 */
export class DatabaseEngine {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve) => {
      if (typeof indexedDB === 'undefined') {
        resolve();
        return;
      }

      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
          this.initPromise = null;
          resolve(); // Resolve gracefully so app uses memory context fallback
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          resolve();
        };

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          const stores = ['leads', 'clients', 'users', 'settings', 'logs', 'workflows', 'events', 'resources', 'testimonials', 'bank_verifications', 'properties'];
          stores.forEach(store => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store, { keyPath: 'id' });
            }
          });
        };
      } catch (err) {
        resolve();
      }
    });
    return this.initPromise;
  }

  private async getStore(name: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore | null> {
    try {
      await this.init();
      if (!this.db || !this.db.objectStoreNames.contains(name)) return null;
      const transaction = this.db.transaction(name, mode);
      return transaction.objectStore(name);
    } catch (e) {
      return null;
    }
  }

  // Generic CRUD
  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    try {
      const store = await this.getStore(storeName);
      if (!store) return undefined;
      return new Promise((resolve) => {
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(undefined);
      });
    } catch (e) {
      return undefined;
    }
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    try {
      const store = await this.getStore(storeName);
      if (!store) return [];
      return new Promise((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (e) {
      return [];
    }
  }

  async save<T>(storeName: string, data: T): Promise<void> {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      if (!store) return;
      return new Promise((resolve) => {
        const request = store.put(data);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    } catch (e) {
      return;
    }
  }

  async delete(storeName: string, id: string): Promise<void> {
    try {
      const store = await this.getStore(storeName, 'readwrite');
      if (!store) return;
      return new Promise((resolve) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    } catch (e) {
      return;
    }
  }
}

export const DB = new DatabaseEngine();
