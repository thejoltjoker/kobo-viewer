import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Database } from "sql.js";
import { createDrizzleDb, initDatabase, type DrizzleDb } from "./index";
import {
  loadDatabase,
  saveDatabase,
  clearDatabase as clearIndexedDb,
} from "./indexedDb";

interface DatabaseContextValue {
  db: DrizzleDb | null;
  isLoading: boolean;
  error: Error | null;
  initializeDatabase: (buffer: ArrayBuffer) => Promise<void>;
  clearDatabase: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextValue | undefined>(
  undefined
);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [db, setDb] = useState<DrizzleDb | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sqlDb, setSqlDb] = useState<Database | null>(null);

  // Load database from IndexedDB on mount
  useEffect(() => {
    async function loadStoredDatabase() {
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
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load database")
        );
      } finally {
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

      // Update state
      setSqlDb(database);
      setDb(drizzleDb);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to initialize database")
      );
      throw err;
    } finally {
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
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to clear database")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const value: DatabaseContextValue = {
    db,
    isLoading,
    error,
    initializeDatabase,
    clearDatabase,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseContext() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error(
      "useDatabaseContext must be used within a DatabaseProvider"
    );
  }
  return context;
}
