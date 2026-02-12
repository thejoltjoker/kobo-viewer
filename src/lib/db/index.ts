import * as schema from "@/lib/db/drizzle/schema";
import { relations } from "@/lib/db/drizzle/relations";
import { drizzle } from "drizzle-orm/sql-js";
import type { Database, SqlJsStatic } from "sql.js";
import initSqlJs from "sql.js";

export let sqlJsInstance: SqlJsStatic | null = null;

async function initSqlJsLib(): Promise<SqlJsStatic> {
  if (!sqlJsInstance) {
    sqlJsInstance = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }
  return sqlJsInstance;
}

export const initDatabase = async (buffer: ArrayBuffer): Promise<Database> => {
  const sqlPromise = await initSqlJsLib();
  if (!sqlPromise) {
    throw new Error("Failed to initialize sql.js");
  }
  return new sqlPromise.Database(new Uint8Array(buffer));
};

export const createDrizzleDb = (sqldb: Database) => {
  return drizzle(sqldb, { schema, relations });
};

export type DrizzleDb = ReturnType<typeof createDrizzleDb>;
