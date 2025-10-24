// Web polyfill for react-native-sqlite-storage
// Uses IndexedDB for web storage

export interface SQLiteDatabase {
  executeSql: (
    sql: string,
    params?: any[],
    successCallback?: (tx: any, results: any) => void,
    errorCallback?: (tx: any, error: any) => void,
  ) => void;
  transaction: (callback: (tx: any) => void) => Promise<void>;
  close: () => Promise<void>;
}

class SQLiteWeb {
  private dbName: string = 'dinner_time_db';
  private db: IDBDatabase | null = null;

  openDatabase(config: {
    name: string;
    location?: string;
  }): Promise<SQLiteDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(config.name, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.createDatabase());
      };

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        // Create object stores for each table
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', {keyPath: 'user_id'});
        }
        if (!db.objectStoreNames.contains('preference_profiles')) {
          db.createObjectStore('preference_profiles', {
            keyPath: 'profile_id',
          });
        }
        // Add more stores as needed
      };
    });
  }

  private createDatabase(): SQLiteDatabase {
    return {
      executeSql: (sql, params, successCallback, _errorCallback) => {
        // Simple mock - in production, parse SQL and execute on IndexedDB
        console.log('Web SQLite:', sql, params);
        if (successCallback) {
          successCallback(null, {rows: {length: 0, item: () => null}});
        }
      },
      transaction: async callback => {
        callback({
          executeSql: this.createDatabase().executeSql,
        });
      },
      close: async () => {
        if (this.db) {
          this.db.close();
        }
      },
    };
  }

  enablePromise(enable: boolean) {
    console.log('SQLite promises enabled:', enable);
  }
}

const SQLite = new SQLiteWeb();
export default SQLite;
