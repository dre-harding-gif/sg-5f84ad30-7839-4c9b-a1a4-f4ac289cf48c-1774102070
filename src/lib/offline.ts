// IndexedDB helper for offline storage
export class OfflineStorage {
  private dbName = 'HardingHomesDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Photos store
        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
          photoStore.createIndex('jobId', 'jobId', { unique: false });
          photoStore.createIndex('synced', 'synced', { unique: false });
          photoStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Jobs cache store
        if (!db.objectStoreNames.contains('jobs')) {
          const jobStore = db.createObjectStore('jobs', { keyPath: 'id' });
          jobStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Customers cache store
        if (!db.objectStoreNames.contains('customers')) {
          const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
          customerStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
        }

        // Pending updates queue
        if (!db.objectStoreNames.contains('pendingUpdates')) {
          const updateStore = db.createObjectStore('pendingUpdates', { keyPath: 'id', autoIncrement: true });
          updateStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Photo operations
  async addPhoto(jobId: string, file: File, caption: string = ''): Promise<number> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['photos'], 'readwrite');
      const store = transaction.objectStore('photos');

      const photo = {
        jobId,
        file,
        caption,
        timestamp: new Date().toISOString(),
        synced: false,
      };

      const request = store.add(photo);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingPhotos(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const index = store.index('synced');
      const request = index.getAll(false);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPhotosByJob(jobId: string): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['photos'], 'readonly');
      const store = transaction.objectStore('photos');
      const index = store.index('jobId');
      const request = index.getAll(jobId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markPhotoSynced(photoId: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['photos'], 'readwrite');
      const store = transaction.objectStore('photos');
      const getRequest = store.get(photoId);

      getRequest.onsuccess = () => {
        const photo = getRequest.result;
        if (photo) {
          photo.synced = true;
          const putRequest = store.put(photo);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // Job caching
  async cacheJob(job: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['jobs'], 'readwrite');
      const store = transaction.objectStore('jobs');

      const cachedJob = {
        ...job,
        lastUpdated: new Date().toISOString(),
      };

      const request = store.put(cachedJob);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedJob(jobId: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['jobs'], 'readonly');
      const store = transaction.objectStore('jobs');
      const request = store.get(jobId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCachedJobs(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['jobs'], 'readonly');
      const store = transaction.objectStore('jobs');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Customer caching
  async cacheCustomer(customer: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['customers'], 'readwrite');
      const store = transaction.objectStore('customers');

      const cachedCustomer = {
        ...customer,
        lastUpdated: new Date().toISOString(),
      };

      const request = store.put(cachedCustomer);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getCachedCustomer(customerId: string): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['customers'], 'readonly');
      const store = transaction.objectStore('customers');
      const request = store.get(customerId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Pending updates queue
  async queueUpdate(type: string, data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingUpdates'], 'readwrite');
      const store = transaction.objectStore('pendingUpdates');

      const update = {
        type,
        data,
        timestamp: new Date().toISOString(),
      };

      const request = store.add(update);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingUpdates(): Promise<any[]> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingUpdates'], 'readonly');
      const store = transaction.objectStore('pendingUpdates');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearPendingUpdate(updateId: number): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['pendingUpdates'], 'readwrite');
      const store = transaction.objectStore('pendingUpdates');
      const request = store.delete(updateId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorage();