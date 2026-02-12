import type { wordList } from "./drizzle/schema";

export type Wordlist = typeof wordList.$inferSelect;
export type WordlistWithBookTitle = Wordlist & {
  bookTitle: string | null;
};
