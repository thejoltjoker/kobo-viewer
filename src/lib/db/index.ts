/* eslint-disable node/prefer-global/buffer -- Browser polyfill for sql.js */
import type { Database, SqlJsStatic } from "sql.js";

import { drizzle } from "drizzle-orm/sql-js";
import initSqlJs from "sql.js";

import { relations } from "@/lib/db/drizzle/relations";
import * as schema from "@/lib/db/drizzle/schema";

// Polyfill Buffer for browser environment (required by Drizzle ORM)
if (typeof globalThis !== "undefined" && !globalThis.Buffer) {
  // Use Uint8Array as Buffer and add static methods
  globalThis.Buffer = Uint8Array as any;

  // Add Buffer static methods
  (globalThis.Buffer as any).from = function (
    data: string | ArrayBuffer | ArrayLike<number> | Uint8Array,
    _encoding?: string,
  ): Uint8Array {
    if (typeof data === "string") {
      const encoder = new TextEncoder();
      return encoder.encode(data);
    }
    if (data instanceof ArrayBuffer) {
      return new Uint8Array(data);
    }
    if (Array.isArray(data)) {
      return new Uint8Array(data);
    }
    if (data instanceof Uint8Array) {
      return data;
    }
    return new Uint8Array(data as ArrayLike<number>);
  };

  (globalThis.Buffer as any).isBuffer = function (obj: any): boolean {
    return obj instanceof Uint8Array;
  };

  (globalThis.Buffer as any).alloc = function (size: number, fill?: number): Uint8Array {
    const buf = new Uint8Array(size);
    if (fill !== undefined) {
      buf.fill(fill);
    }
    return buf;
  };
}

let sqlJsInstance: SqlJsStatic | null = null;

async function initSqlJsLib(): Promise<SqlJsStatic> {
  if (!sqlJsInstance) {
    sqlJsInstance = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
  }
  return sqlJsInstance;
}

export async function initDatabase(buffer: ArrayBuffer): Promise<Database> {
  const sqlPromise = await initSqlJsLib();
  if (!sqlPromise) {
    throw new Error("Failed to initialize sql.js");
  }
  return new sqlPromise.Database(new Uint8Array(buffer));
}

export function createDrizzleDb(sqldb: Database) {
  return drizzle(sqldb, { schema, relations });
}

export type DrizzleDb = ReturnType<typeof createDrizzleDb>;
