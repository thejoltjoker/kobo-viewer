import { Portal, Select, createListCollection } from "@chakra-ui/react";
import { Box, Button, HStack, Table, Text } from "@chakra-ui/react";
import React, { useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
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

const columnHelper = createColumnHelper<WordlistWithBookTitle>();

const WordlistTable: React.FC<WordlistProps> = () => {
  const { db, isLoading, error } = useDatabase();
  const [wordlist, setWordlist] = useState<WordlistWithBookTitle[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
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
      } catch (err) {
        console.error("Error fetching wordlist:", err);
      }
    }

    fetchWordlist();
  }, [db]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("text", {
        header: "Text",
        enableSorting: true,
      }),
      columnHelper.accessor("bookTitle", {
        header: "BookTitle",
        enableSorting: true,
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("volumeId", {
        header: "VolumeId",
        enableSorting: true,
      }),
      columnHelper.accessor("dictSuffix", {
        header: "DictSuffix",
        enableSorting: true,
      }),
      columnHelper.accessor("dateCreated", {
        header: "DateCreated",
        enableSorting: true,
      }),
    ],
    []
  ) as ColumnDef<WordlistWithBookTitle>[];

  const table = useReactTable({
    data: wordlist,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  });

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

  // Get pagination info from table
  const {
    pageIndex,
    pageSize: tablePageSize,
  } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const totalItems = wordlist.length;
  const startIndex = pageIndex * tablePageSize;
  const endIndex = Math.min(startIndex + tablePageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: number[] = [];
    const currentPage = pageIndex + 1;
    const siblingCount = 1;
    const startPage = Math.max(1, currentPage - siblingCount);
    const endPage = Math.min(pageCount, currentPage + siblingCount);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < pageCount) {
      if (endPage < pageCount - 1) {
        pages.push(-1); // -1 represents ellipsis
      }
      pages.push(pageCount);
    }

    return pages;
  };

  const getSortIcon = (column: any) => {
    const sort = column.getIsSorted();
    if (sort === "asc") return " ↑";
    if (sort === "desc") return " ↓";
    return "";
  };

  return (
    <Box width="100%">
      <HStack justify="end">
        <Select.Root
          collection={pageSizeCollection}
          size="sm"
          width="10rem"
          value={[tablePageSize.toString()]}
          onValueChange={(e) => {
            table.setPageSize(Number(e.value[0]));
          }}
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
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Table.ColumnHeader
                  key={header.id}
                  cursor={header.column.getCanSort() ? "pointer" : "default"}
                  onClick={header.column.getToggleSortingHandler()}
                  userSelect="none"
                >
                  {header.isPlaceholder ? null : (
                    <Box as="span" display="inline-flex" alignItems="center" gap={1}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && getSortIcon(header.column)}
                    </Box>
                  )}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>
          {table.getRowModel().rows.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns.length} textAlign="center">
                <Text color="fg.muted">No wordlist entries found</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            table.getRowModel().rows.map((row) => (
              <Table.Row key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  const isLastTwoColumns =
                    cell.column.id === "dictSuffix" ||
                    cell.column.id === "dateCreated";
                  return (
                    <Table.Cell
                      key={cell.id}
                      textAlign={isLastTwoColumns ? "end" : "start"}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Cell>
                  );
                })}
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
          Page {pageIndex + 1} of {pageCount}
        </Text>
      </HStack>
      {pageCount > 1 && (
        <HStack gap={2} mt={4} justify="center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
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
                variant={pageIndex + 1 === pageNum ? "solid" : "outline"}
                size="sm"
                onClick={() => table.setPageIndex(pageNum - 1)}
              >
                {pageNum}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default WordlistTable;
