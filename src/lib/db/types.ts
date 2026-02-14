import type { bookmark, wordList } from "./drizzle/schema";

export interface BookMeta {
  bookTitle: string | null;
  bookAuthor: string | null;
}

export type Wordlist = typeof wordList.$inferSelect;
export type WordlistWithBookMeta = Wordlist & BookMeta;

export type Bookmark = typeof bookmark.$inferSelect;
export type BookmarkWithBookMeta = Bookmark & BookMeta;
