import { Portal, Select, createListCollection } from "@chakra-ui/react";
import { Box, Button, HStack, Table, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { eq } from "drizzle-orm";
import { useDatabase } from "@/lib/db/hooks";
import type { Wordlist as WordlistType } from "@/lib/db/types";
import { content } from "@/lib/db/drizzle/schema";

export interface WordlistProps {}

type WordlistWithBookTitle = WordlistType & {
  bookTitle: string | null;
};

type PageSizeItem = {
  label: string;
  value: string;
};

const WordlistTable: React.FC<WordlistProps> = () => {
  const { db, isLoading, error } = useDatabase();
  const [wordlist, setWordlist] = useState<WordlistWithBookTitle[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<string[]>(["25"]);
  const pageSizeCollection = createListCollection<PageSizeItem>({
    items: [
      { label: "25", value: "25" },
      { label: "50", value: "50" },
      { label: "100", value: "100" },
    ],
  });

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
        setPage(1); // Reset to first page when data changes
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

  // Calculate pagination
  const totalItems = wordlist.length;
  const pageSizeNum = Number(pageSize[0]);
  const totalPages = Math.ceil(totalItems / pageSizeNum);
  const startIndex = (page - 1) * pageSizeNum;
  const endIndex = startIndex + pageSizeNum;
  const paginatedWordlist = wordlist.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: number[] = [];
    const siblingCount = 1;
    const startPage = Math.max(1, page - siblingCount);
    const endPage = Math.min(totalPages, page + siblingCount);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(-1); // -1 represents ellipsis
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Box width="100%">
      <HStack justify="end">
        <Select.Root
          collection={pageSizeCollection}
          size="sm"
          width="10rem"
          value={pageSize}
          onValueChange={(e) => setPageSize(e.value)}
        >
          <Select.HiddenSelect />
          <Select.Label>Words per page</Select.Label>
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Words per page" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {pageSizeCollection.items.map((pageSize) => (
                  <Select.Item item={pageSize} key={pageSize.value}>
                    {pageSize.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </HStack>
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
            paginatedWordlist.map((item: WordlistWithBookTitle) => (
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
      <HStack justify="space-between">
        <Text>
          Showing {startIndex + 1} to {endIndex} of {totalItems} words
        </Text>
        <Text>
          Page {page} of {totalPages}
        </Text>
      </HStack>
      {totalPages > 1 && (
        <HStack gap={2} mt={4} justify="center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          {getPageNumbers().map((pageNum, index) =>
            pageNum === -1 ? (
              <Text key={`ellipsis-${index}`} px={2}>
                ...
              </Text>
            ) : (
              <Button
                key={pageNum}
                variant={page === pageNum ? "solid" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default WordlistTable;
