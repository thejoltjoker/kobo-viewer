import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";

export const getDrizzleDatabase = (database: SQLJsDatabase) => {
  return drizzle(database);
};
