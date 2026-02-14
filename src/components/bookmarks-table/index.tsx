import { useDatabase } from "@/lib/db/hooks";
import { getBookmarks, getBookmarksWithBookMeta } from "@/lib/db/queries";
import type { Bookmark, BookmarkWithBookMeta } from "@/lib/db/types";
import { Button, Code, Portal, Table } from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { ActionBar, Checkbox, Kbd } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
export interface WordlistProps {}

const BookmarksTable = () => {
  const [selection, setSelection] = useState<string[]>([]);
  const { db } = useDatabase();
  const [bookmarks, setBookmarks] = useState<BookmarkWithBookMeta[]>([]);

  const hasSelection = selection.length > 0;

  const columnHelper = useMemo(
    () => createColumnHelper<BookmarkWithBookMeta>(),
    []
  );

  const columns = useMemo(() => {
    const indeterminate = hasSelection && selection.length < bookmarks.length;
    return [
      columnHelper.display({
        id: "select",
        header: () => (
          <Checkbox.Root
            size="sm"
            top="0.5"
            aria-label="Select all rows"
            checked={indeterminate ? "indeterminate" : selection.length > 0}
            onCheckedChange={(changes) => {
              setSelection(
                changes.checked ? bookmarks.map((item) => item.bookmarkId) : []
              );
            }}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>
        ),
        cell: (info) => (
          <Checkbox.Root
            size="sm"
            top="0.5"
            aria-label="Select row"
            checked={selection.includes(info.row.original.bookmarkId)}
            onCheckedChange={(changes) => {
              setSelection((prev) =>
                changes.checked
                  ? [...prev, info.row.original.bookmarkId]
                  : prev.filter(
                      (bookmarkId) =>
                        bookmarkId !== info.row.original.bookmarkId
                    )
              );
            }}
          >
            <Checkbox.HiddenInput />
            <Checkbox.Control />
          </Checkbox.Root>
        ),
      }),
      columnHelper.accessor("text", {
        header: () => "Text",
        cell: (info) => info.renderValue(),
        footer: (info) => info.column.id,
      }),
      columnHelper.accessor("bookTitle", {
        id: "bookTitle",
        header: () => "Book Title",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("annotation", {
        id: "annotation",
        header: () => "Annotation",
        cell: (info) => info.renderValue(),
      }),
      columnHelper.accessor("contextString", {
        id: "contextString",
        header: () => "Context String",
        cell: (info) => info.renderValue(),
      }),
      columnHelper.accessor("type", {
        id: "type",
        header: () => "Type",
        cell: (info) => info.renderValue(),
      }),
      columnHelper.accessor("dateCreated", {
        id: "dateCreated",
        header: () => "Date Created",
        cell: (info) =>
          info.row.original.dateCreated
            ? new Date(info.row.original.dateCreated).toLocaleDateString()
            : "-",
      }),
    ];
  }, [selection, bookmarks, columnHelper]);

  const table = useReactTable({
    columns,
    data: bookmarks,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    async function fetchWordlist() {
      if (!db) {
        setBookmarks(bookmarks);
        return;
      }

      try {
        const bookmarksData = await getBookmarksWithBookMeta(db);
        setBookmarks(bookmarksData);
      } catch (err) {
        console.error("Error fetching wordlist:", err);
      }
    }

    fetchWordlist();
  }, [db]);

  const rows = table.getRowModel().rows.map((row) => (
    <Table.Row
      key={row.id}
      data-selected={
        selection.includes(row.original.bookmarkId) ? "" : undefined
      }
    >
      {row.getVisibleCells().map((cell) => (
        <Table.Cell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </Table.Cell>
      ))}
    </Table.Row>
  ));

  return (
    <>
      <Table.Root variant="line">
        <Table.Header overflow="hidden">
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row
              key={headerGroup.id}
              bg="bg.muted"
              // borderBottom="none"
              borderColor="border.emphasized"
            >
              {headerGroup.headers.map((header, index) => {
                const isFirst = index === 0;
                const isLast = index === headerGroup.headers.length - 1;
                return (
                  <Table.ColumnHeader
                    key={header.id}
                    borderTopLeftRadius={isFirst ? 5 : 0}
                    borderTopRightRadius={isLast ? 5 : 0}
                    borderBottomLeftRadius={isFirst ? 5 : 0}
                    borderBottomRightRadius={isLast ? 5 : 0}
                    borderBottom="none"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Table.ColumnHeader>
                );
              })}
            </Table.Row>
          ))}
        </Table.Header>
        <Table.Body>{rows}</Table.Body>
      </Table.Root>

      <ActionBar.Root open={hasSelection}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <ActionBar.SelectionTrigger>
                {selection.length} selected
              </ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              <Button variant="outline" size="sm">
                <LuDownload />
                CSV <Kbd>C</Kbd>
              </Button>
              <Button variant="outline" size="sm">
                <LuDownload />
                JSON <Kbd>J</Kbd>
              </Button>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </>
  );
};
export default BookmarksTable;
