import type { DrizzleDb } from "./index";
import type {
  Bookmark,
  BookmarkWithBookTitle,
  WordlistWithBookTitle,
} from "./types";

export async function getWordlistWithBookTitles(
  db: DrizzleDb
): Promise<WordlistWithBookTitle[]> {
  const wordListEntries = await db.query.wordList.findMany();
  const volumeIds = [
    ...new Set(wordListEntries.map((entry) => entry.volumeId).filter(Boolean)),
  ];
  const bookTitleMap = new Map<string, string | null>();

  for (const volumeId of volumeIds) {
    const contentEntry = await db.query.content.findFirst({
      where: {
        OR: [
          { bookId: volumeId ?? undefined },
          { contentId: volumeId ?? undefined },
        ],
      },
    });

    bookTitleMap.set(volumeId ?? "", contentEntry?.bookTitle ?? null);
  }

  return wordListEntries.map((entry) => ({
    ...entry,
    bookTitle: entry.volumeId ? bookTitleMap.get(entry.volumeId) || null : null,
  }));
}

export async function getWordlistCount(db: DrizzleDb): Promise<number> {
  const wordListEntries = await db.query.wordList.findMany();
  return wordListEntries.length;
}

export async function getBookmarksCount(db: DrizzleDb): Promise<number> {
  const bookmarks = await db.query.bookmark.findMany();
  return bookmarks.length;
}

export async function getBookmarks(db: DrizzleDb): Promise<Bookmark[]> {
  const bookmarks = await db.query.bookmark.findMany();
  return bookmarks;
}

export async function getBookmarksWithBookTitles(
  db: DrizzleDb
): Promise<BookmarkWithBookTitle[]> {
  const bookmarkEntries = await db.query.bookmark.findMany();
  const volumeIds = [
    ...new Set(bookmarkEntries.map((entry) => entry.volumeId).filter(Boolean)),
  ];
  const bookTitleMap = new Map<string, string | null>();

  for (const volumeId of volumeIds) {
    const contentEntry = await db.query.content.findFirst({
      where: {
        OR: [{ bookId: volumeId }, { contentId: volumeId }],
      },
    });

    bookTitleMap.set(volumeId, contentEntry?.bookTitle || null);
  }

  return bookmarkEntries.map((entry) => ({
    ...entry,
    bookTitle: entry.volumeId ? bookTitleMap.get(entry.volumeId) || null : null,
  }));
}
