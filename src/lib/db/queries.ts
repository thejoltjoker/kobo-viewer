import { eq } from "drizzle-orm";
import type { DrizzleDb } from "./index";
import type { WordlistWithBookTitle } from "./types";
import { content } from "./drizzle/schema";

/**
 * Fetches all wordlist entries with their associated book titles.
 * 
 * For each wordlist entry, attempts to find the book title by:
 * 1. First trying to match volumeId against content.bookId
 * 2. If no match, trying to match volumeId against content.contentId
 * 
 * @param db - The Drizzle database instance
 * @returns Promise resolving to an array of wordlist entries with book titles
 */
export async function getWordlistWithBookTitles(
  db: DrizzleDb
): Promise<WordlistWithBookTitle[]> {
  // Fetch all wordlist entries
  const wordListEntries = await db.query.wordList.findMany();

  // Extract unique volumeIds
  const volumeIds = [
    ...new Set(
      wordListEntries.map((entry) => entry.volumeId).filter(Boolean)
    ),
  ];

  // Build a map of volumeId -> bookTitle
  const bookTitleMap = new Map<string, string | null>();

  // Use a transaction to efficiently query book titles
  try {
    db.transaction((tx) => {
      for (const volumeId of volumeIds) {
        if (volumeId) {
          // First try to match by bookId
          let contentEntries = tx
            .select({
              bookTitle: content.bookTitle,
            })
            .from(content)
            .where(eq(content.bookId, volumeId))
            .limit(1)
            .all();

          // If no match, try to match by contentId
          if (contentEntries.length === 0) {
            contentEntries = tx
              .select({
                bookTitle: content.bookTitle,
              })
              .from(content)
              .where(eq(content.contentId, volumeId))
              .limit(1)
              .all();
          }

          const bookTitle = contentEntries[0]?.bookTitle || null;
          bookTitleMap.set(volumeId, bookTitle);
        }
      }
    });
  } catch (err) {
    // If transaction fails, continue with empty bookTitleMap
    // This allows the function to still return wordlist entries without book titles
    console.error("Transaction error while fetching book titles:", err);
  }

  // Map book titles to wordlist entries
  return wordListEntries.map((entry) => ({
    ...entry,
    bookTitle: entry.volumeId
      ? bookTitleMap.get(entry.volumeId) || null
      : null,
  }));
}
