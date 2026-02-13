import type { bookmark, wordList } from "./drizzle/schema";

export type BookTitle = {
  bookTitle: string | null;
};

export type Wordlist = typeof wordList.$inferSelect;
export type WordlistWithBookTitle = Wordlist & BookTitle;

export type Bookmark = typeof bookmark.$inferSelect;
export type BookmarkWithBookTitle = Bookmark & BookTitle;
