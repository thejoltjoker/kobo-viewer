import { Table, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { eq } from "drizzle-orm";
import { useDatabase } from "@/lib/db/hooks";
import type { Wordlist as WordlistType } from "@/lib/db/types";
import { content } from "@/lib/db/drizzle/schema";

export interface WordlistProps {}

type WordlistWithBookTitle = WordlistType & {
  bookTitle: string | null;
};

const WordlistTable: React.FC<WordlistProps> = () => {
  const { db, isLoading, error } = useDatabase();
  const [wordlist, setWordlist] = useState<WordlistWithBookTitle[]>([]);

  useEffect(() => {
    async function fetchWordlist() {
      if (!db) {
        setWordlist([]);
        return;
      }

      try {
        // Fetch wordList entries and content data
        // Note: sql.js doesn't support async transactions, so we perform queries sequentially
        // For atomicity, we fetch all data in sequence before processing
        const wordListEntries = await db.query.wordList.findMany();

        // Get unique volumeIds
        const volumeIds = [
          ...new Set(
            wordListEntries.map((entry) => entry.volumeId).filter(Boolean)
          ),
        ];

        console.log(
          `Found ${volumeIds.length} unique volumeIds:`,
          volumeIds.slice(0, 5)
        );

        // Fetch bookTitle for each volumeId from content table using transaction
        // This ensures all content queries happen atomically
        const bookTitleMap = new Map<string, string | null>();

        // Use transaction to query content table for all volumeIds atomically
        // Try matching volumeId with bookId first (common in Kobo databases)
        try {
          db.transaction((tx) => {
            for (const volumeId of volumeIds) {
              if (volumeId) {
                // Try bookId first (most common relationship in Kobo databases)
                let contentEntries = tx
                  .select({
                    bookTitle: content.bookTitle,
                  })
                  .from(content)
                  .where(eq(content.bookId, volumeId))
                  .limit(1)
                  .all();

                // If not found, try contentId as fallback
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

                // Debug logging for first few entries
                if (volumeIds.indexOf(volumeId) < 3) {
                  console.log(
                    `volumeId: ${volumeId}, bookId match: ${
                      contentEntries.length > 0 && contentEntries[0]?.bookTitle
                        ? "yes"
                        : "no"
                    }, bookTitle: ${bookTitle}`
                  );
                }
              }
            }
          });
        } catch (err) {
          console.error("Transaction error:", err);
        }

        console.log(
          `BookTitle map size: ${bookTitleMap.size}, sample entries:`,
          Array.from(bookTitleMap.entries()).slice(0, 3)
        );

        // Add bookTitle to each wordList entry
        const res = wordListEntries.map((entry) => ({
          ...entry,
          bookTitle: entry.volumeId
            ? bookTitleMap.get(entry.volumeId) || null
            : null,
        }));

        setWordlist(res);
      } catch (err) {
        console.error("Error fetching wordlist:", err);
      }
    }

    fetchWordlist();
  }, [db]);

  if (isLoading) {
    return <Text>Loading database...</Text>;
  }

  if (error) {
    return <Text color="red">Error: {error.message}</Text>;
  }

  if (!db) {
    return (
      <Text color="fg.muted">
        No database loaded. Please upload a database file.
      </Text>
    );
  }

  return (
    <Table.Root size="sm" interactive>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Text</Table.ColumnHeader>
          <Table.ColumnHeader>BookTitle</Table.ColumnHeader>
          <Table.ColumnHeader>VolumeId</Table.ColumnHeader>
          <Table.ColumnHeader>DictSuffix</Table.ColumnHeader>
          <Table.ColumnHeader>DateCreated</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {wordlist.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={5} textAlign="center">
              <Text color="fg.muted">No wordlist entries found</Text>
            </Table.Cell>
          </Table.Row>
        ) : (
          wordlist.map((item: WordlistWithBookTitle) => (
            <Table.Row key={item.text}>
              <Table.Cell>{item.text}</Table.Cell>
              <Table.Cell>{item.bookTitle || "-"}</Table.Cell>
              <Table.Cell>{item.volumeId}</Table.Cell>
              <Table.Cell textAlign="end">{item.dictSuffix}</Table.Cell>
              <Table.Cell textAlign="end">{item.dateCreated}</Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table.Root>
  );
};

export default WordlistTable;
