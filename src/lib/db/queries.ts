import type { DrizzleDb } from "./index";
import type {
  Bookmark,
  BookmarkWithBookMeta,
  WordlistWithBookMeta,
} from "./types";

export async function getWordlistWithBookTitles(
  db: DrizzleDb,
): Promise<WordlistWithBookMeta[]> {
  const wordListEntries = await db.query.wordList.findMany();
  const volumeIds = [
    ...new Set(wordListEntries.map(entry => entry.volumeId).filter(Boolean)),
  ];
  const bookMetaMap = new Map<
    string,
    { bookTitle: string | null; bookAuthor: string | null }
  >();

  for (const volumeId of volumeIds) {
    const contentEntry = await db.query.content.findFirst({
      where: { contentId: volumeId ?? undefined },
    });
    const fallbackContent
      = !contentEntry && volumeId
        ? await db.query.content.findFirst({
            where: { bookId: volumeId },
          })
        : null;
    const content = contentEntry ?? fallbackContent;

    const bookTitle = content?.title ?? content?.bookTitle ?? null;
    const bookAuthor = content?.attribution ?? null;

    bookMetaMap.set(volumeId ?? "", {
      bookTitle,
      bookAuthor,
    });
  }

  return wordListEntries.map((entry) => {
    const meta = entry.volumeId ? bookMetaMap.get(entry.volumeId) : null;
    return {
      ...entry,
      bookTitle: meta?.bookTitle ?? null,
      bookAuthor: meta?.bookAuthor ?? null,
    };
  });
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

export async function getBookmarksWithBookMeta(
  db: DrizzleDb,
): Promise<BookmarkWithBookMeta[]> {
  const bookmarkEntries = await db.query.bookmark.findMany();
  const volumeIds = [
    ...new Set(bookmarkEntries.map(entry => entry.volumeId).filter(Boolean)),
  ];
  const bookMetaMap = new Map<
    string,
    { bookTitle: string | null; bookAuthor: string | null }
  >();

  for (const volumeId of volumeIds) {
    // Match endpoint: prefer contentId (volumeId = content.contentId)
    const contentEntry = await db.query.content.findFirst({
      where: { contentId: volumeId },
    });
    const fallbackContent = !contentEntry
      ? await db.query.content.findFirst({
          where: { bookId: volumeId },
        })
      : null;
    const content = contentEntry ?? fallbackContent;

    const bookTitle = content?.title ?? content?.bookTitle ?? null;
    const bookAuthor = content?.attribution ?? null;

    bookMetaMap.set(volumeId, {
      bookTitle,
      bookAuthor,
    });
  }

  return bookmarkEntries.map((entry) => {
    const meta = entry.volumeId ? bookMetaMap.get(entry.volumeId) : null;
    return {
      ...entry,
      bookTitle: meta?.bookTitle ?? null,
      bookAuthor: meta?.bookAuthor ?? null,
    };
  });
}
