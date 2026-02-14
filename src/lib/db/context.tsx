import type { ReactNode } from "react";
import type { Database } from "sql.js";

import {
  createContext,
  use,
  useEffect,
  useState,
} from "react";

import type { DrizzleDb } from "./index";

import { createDrizzleDb, initDatabase } from "./index";
import {
  clearDatabase as clearIndexedDb,
  loadDatabase,
  saveDatabase,
} from "./indexed-db";

interface DatabaseContextValue {
  db: DrizzleDb | null;
  isLoading: boolean;
  error: Error | null;
  initializeDatabase: (buffer: ArrayBuffer) => Promise<void>;
  clearDatabase: () => Promise<void>;
  lastUploaded: Date | null;
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(
  undefined,
);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [db, setDb] = useState<DrizzleDb | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [, setSqlDb] = useState<Database | null>(null);
  const [lastUploaded, setLastUploaded] = useState<Date | null>(null);

  // Load database from IndexedDB on mount
  useEffect(() => {
    async function loadStoredDatabase() {
      const lastUploaded = localStorage.getItem("lastUploaded");
      if (lastUploaded) {
        setLastUploaded(new Date(lastUploaded));
      }
      try {
        setIsLoading(true);
        setError(null);
        const buffer = await loadDatabase();

        if (buffer) {
          const database = await initDatabase(buffer);
          const drizzleDb = createDrizzleDb(database);
          setSqlDb(database);
          setDb(drizzleDb);
        }
      }
      catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load database"),
        );
      }
      finally {
        setIsLoading(false);
      }
    }

    loadStoredDatabase();
  }, []);

  const initializeDatabase = async (buffer: ArrayBuffer) => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize the database from buffer
      const database = await initDatabase(buffer);
      const drizzleDb = createDrizzleDb(database);

      // Save to IndexedDB
      await saveDatabase(buffer);
      localStorage.setItem("lastUploaded", new Date().toISOString());
      setLastUploaded(new Date());

      // Update state
      setSqlDb(database);
      setDb(drizzleDb);
    }
    catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to initialize database"),
      );
      throw err;
    }
    finally {
      setIsLoading(false);
    }
  };

  const clearDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Clear from IndexedDB
      await clearIndexedDb();

      // Reset state
      setSqlDb(null);
      setDb(null);
      setLastUploaded(null);
      localStorage.removeItem("lastUploaded");
    }
    catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to clear database"),
      );
      throw err;
    }
    finally {
      setIsLoading(false);
    }
  };

  const value: DatabaseContextValue = {
    db,
    isLoading,
    error,
    initializeDatabase,
    clearDatabase,
    lastUploaded,
  };

  return (
    <DatabaseContext value={value}>
      {children}
    </DatabaseContext>
  );
}

// Hook must live here to access DatabaseContext; fast-refresh rule disabled
// eslint-disable-next-line react-refresh/only-export-components
export function useDatabaseContext() {
  const context = use(DatabaseContext);
  if (context === undefined) {
    throw new Error(
      "useDatabaseContext must be used within a DatabaseProvider",
    );
  }
  return context;
}
