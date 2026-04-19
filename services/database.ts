
import { Lead, Client, User, CompanySettings, IntegrationLog, Workflow } from '../types';

const DB_NAME = 'NHFG_Enterprise_DB';
const DB_VERSION = 4;

/**
 * PRODUCTION DATABASE ENGINE
 * Handles persistence for all CRM and Website entities.
 */
export class DatabaseEngine {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return Promise.resolve();
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        this.initPromise = null;
        reject('Database failed to open');
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        
        // Create Stores
        const stores = ['leads', 'clients', 'users', 'settings', 'logs', 'workflows', 'events', 'resources', 'testimonials', 'bank_verifications'];
        stores.forEach(store => {
          if (!db.objectStoreNames.contains(store)) {
            db.createObjectStore(store, { keyPath: 'id' });
          }
        });
      };
    });
  }

  private async getStore(name: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(name, mode);
    return transaction.objectStore(name);
  }

  // Generic CRUD
  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    const store = await this.getStore(storeName);
    return new Promise((resolve) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const store = await this.getStore(storeName);
    return new Promise((resolve) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
    });
  }

  async save<T>(storeName: string, data: T): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject();
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject();
    });
  }
}

export const DB = new DatabaseEngine();
