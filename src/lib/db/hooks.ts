import { useDatabaseContext } from "./context";

export function useDatabase() {
  return useDatabaseContext();
}
