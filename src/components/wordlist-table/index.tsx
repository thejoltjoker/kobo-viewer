import { useDatabase } from "@/lib/db/hooks";
import { getWordlistWithBookTitles } from "@/lib/db/queries";
import type { WordlistWithBookTitle } from "@/lib/db/types";
import { Badge, Button, Portal, Table } from "@chakra-ui/react";
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

const WordlistTable = () => {
  const [selection, setSelection] = useState<string[]>([]);
  const { db } = useDatabase();
  const [wordlist, setWordlist] = useState<WordlistWithBookTitle[]>([]);

  const hasSelection = selection.length > 0;

  const columnHelper = useMemo(
    () => createColumnHelper<WordlistWithBookTitle>(),
    []
  );

  const columns = useMemo(
    () => {
      const indeterminate = hasSelection && selection.length < wordlist.length;
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
              changes.checked ? wordlist.map((item) => item.text) : []
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
          checked={selection.includes(info.row.original.text)}
          onCheckedChange={(changes) => {
            setSelection((prev) =>
              changes.checked
                ? [...prev, info.row.original.text]
                : prev.filter((text) => text !== info.row.original.text)
            );
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      ),
    }),
    columnHelper.accessor("text", {
      header: () => "Word",
      cell: (info) => info.renderValue(),
      footer: (info) => info.column.id,
    }),
    columnHelper.accessor("bookTitle", {
      id: "bookTitle",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("dictSuffix", {
      id: "dictSuffix",
      cell: (info) => <Badge>{info.getValue()}</Badge>,
    }),
    columnHelper.accessor("dateCreated", {
      id: "dateCreated",
      cell: (info) =>
        info.row.original.dateCreated
          ? new Date(info.row.original.dateCreated).toLocaleDateString()
          : "-",
    }),
    columnHelper.accessor("volumeId", {
      id: "volumeId",
      cell: (info) => info.getValue(),
    }),
    ];
    },
    [selection, wordlist, columnHelper]
  );

  const table = useReactTable({
    columns,
    data: wordlist,
    getCoreRowModel: getCoreRowModel(),
  });

  useEffect(() => {
    async function fetchWordlist() {
      if (!db) {
        setWordlist([]);
        return;
      }

      try {
        const wordlist = await getWordlistWithBookTitles(db);
        setWordlist(wordlist);
      } catch (err) {
        console.error("Error fetching wordlist:", err);
      }
    }

    fetchWordlist();
  }, [db]);

  const rows = table.getRowModel().rows.map((row) => (
    <Table.Row
      key={row.id}
      data-selected={selection.includes(row.original.text) ? "" : undefined}
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
              bg="bg.subtle"
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
        {/* <Table.Footer>
          {table.getFooterGroups().map((footerGroup) => (
            <Table.Row key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <Table.Cell key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.footer,
                        header.getContext()
                      )}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Footer> */}
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
export default WordlistTable;
