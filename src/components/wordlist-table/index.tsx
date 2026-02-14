import { useDatabase } from "@/lib/db/hooks";
import { getWordlistWithBookTitles } from "@/lib/db/queries";
import type { WordlistWithBookTitle } from "@/lib/db/types";
import {
  createListCollection,
  DownloadTrigger,
  Input,
  InputGroup,
  Select,
  Tabs,
} from "@chakra-ui/react";
import { LuArrowDown, LuArrowUp, LuLayoutGrid, LuList, LuSearch } from "react-icons/lu";

import { Tooltip } from "@/components/ui/tooltip";
import {
  Badge,
  Button,
  HStack,
  IconButton,
  Portal,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";

import { toaster } from "@/components/ui/toaster";
import WordDefinitionDrawer from "@/components/word-definition-drawer";
import { ActionBar, Checkbox } from "@chakra-ui/react";
import { LuCopy, LuDownload } from "react-icons/lu";
export interface WordlistProps {}

const WordlistTable = () => {
  const [selection, setSelection] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "dateCreated", desc: true },
  ]);
  const { db } = useDatabase();
  const [wordlist, setWordlist] = useState<WordlistWithBookTitle[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerWord, setDrawerWord] = useState<string | null>(null);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toaster.create({
        title: "Copied!",
        description: `"${text}" copied to clipboard`,
        type: "success",
      });
    } catch (err) {
      toaster.create({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        type: "error",
      });
    }
  };

  const openDefinitionDrawer = (word: string) => {
    setDrawerWord(word);
    setDrawerOpen(true);
  };

  const hasSelection = selection.length > 0;

  const columnHelper = useMemo(
    () => createColumnHelper<WordlistWithBookTitle>(),
    []
  );

  const columns = useMemo(() => {
    const indeterminate = hasSelection && selection.length < wordlist.length;
    return [
      columnHelper.display({
        id: "select",
        enableHiding: false,
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
        enableSorting: true,
        cell: (info) => {
          const wordText = info.renderValue() ?? "";

          return (
            <HStack>
              <Text fontSize="md" fontWeight="semibold">
                {wordText}
              </Text>
              <Tooltip content="Copy to clipboard">
                <IconButton
                  variant="ghost"
                  size="sm"
                  fill="fg.subtle"
                  color="fg.subtle"
                  onClick={() => handleCopy(wordText)}
                  aria-label={`Copy "${wordText}" to clipboard`}
                >
                  <LuCopy />
                </IconButton>
              </Tooltip>
            </HStack>
          );
        },
        sortUndefined: "last",
        sortDescFirst: false,
      }),
      columnHelper.accessor("bookTitle", {
        id: "bookTitle",
        header: () => <span className="no-wrap">Book Title</span>,
        enableSorting: true,
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("dictSuffix", {
        id: "dictSuffix",
        header: () => <span className="no-wrap">Dict Suffix</span>,
        enableSorting: true,
        cell: (info) => <Badge colorPalette="purple">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor("dateCreated", {
        id: "dateCreated",
        header: () => <span className="no-wrap">Date Created</span>,
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = rowA.original.dateCreated;
          const b = rowB.original.dateCreated;
          const timeA = a ? new Date(a).getTime() : 0;
          const timeB = b ? new Date(b).getTime() : 0;
          return timeA - timeB;
        },
        cell: (info) =>
          info.row.original.dateCreated
            ? new Date(info.row.original.dateCreated).toLocaleDateString()
            : "-",
      }),
      columnHelper.display({
        id: "actions",
        header: () => "Actions",
        cell: (info) => {
          return (
            <HStack gap="0">
              <Tooltip content="Copy to clipboard">
                <IconButton
                  variant="ghost"
                  size="sm"
                  fill="fg.subtle"
                  color="fg.subtle"
                  onClick={() => handleCopy(info.row.original.text)}
                  aria-label={`Copy "${info.row.original.text}" to clipboard`}
                >
                  <LuCopy />
                </IconButton>
              </Tooltip>
              <Tooltip content="Look up in dictionary">
                <IconButton
                  variant="ghost"
                  size="sm"
                  fill="fg.subtle"
                  color="fg.subtle"
                  onClick={() => openDefinitionDrawer(info.row.original.text)}
                  aria-label={`Look up "${info.row.original.text}" in dictionary`}
                >
                  <LuSearch />
                </IconButton>
              </Tooltip>
            </HStack>
          );
        },
      }),
    ];
  }, [selection, wordlist, columnHelper]);

  const table = useReactTable({
    columns,
    data: wordlist,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnVisibility,
      sorting,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    enableSorting: true,
  });

  const columnOptions = useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.id !== "select")
      .map((column) => ({
        label:
          column.id === "text"
            ? "Word"
            : column.id === "bookTitle"
            ? "Book Title"
            : column.id === "dictSuffix"
            ? "Dict Suffix"
            : column.id === "dateCreated"
            ? "Date Created"
            : column.id,
        value: column.id,
      }));
  }, [table]);

  const columnCollection = useMemo(
    () => createListCollection({ items: columnOptions }),
    [columnOptions]
  );

  const visibleColumnIds = useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.id !== "select" && column.getIsVisible())
      .map((column) => column.id);
  }, [table, columnVisibility]);

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
    <VStack>
      <WordDefinitionDrawer
        word={drawerWord ?? ""}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      <HStack width="100%" justify="space-between">
        <HStack>
          <InputGroup flex="1" startElement={<LuSearch />} maxW="500px">
            <Input placeholder="Search words" />
          </InputGroup>
        </HStack>

        <HStack>
          <Select.Root
            multiple
            collection={columnCollection}
            value={visibleColumnIds}
            onValueChange={(details) => {
              const selectedIds = Array.isArray(details.value)
                ? details.value
                : details.value
                ? [details.value]
                : [];
              const allColumnIds = table
                .getAllColumns()
                .filter((column) => column.id !== "select")
                .map((column) => column.id);

              // Update visibility: show selected columns, hide unselected ones
              const newVisibility: Record<string, boolean> = {};
              allColumnIds.forEach((id) => {
                newVisibility[id] = selectedIds.includes(id);
              });
              setColumnVisibility(newVisibility);
            }}
            size="sm"
            width="160px"
          >
            <Select.HiddenSelect />
            {/* <Select.Label>Select columns</Select.Label> */}
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Select columns" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {columnOptions.map((option) => (
                    <Select.Item item={option.value} key={option.value}>
                      {option.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          <Tabs.Root defaultValue="table" variant="plain" size="sm">
            <Tabs.List bg="bg.muted" rounded="l3" p="1">
              <Tabs.Trigger value="table">
                <LuList />
              </Tabs.Trigger>
              <Tabs.Trigger value="grid">
                <LuLayoutGrid />
              </Tabs.Trigger>
              <Tabs.Indicator rounded="l2" />
            </Tabs.List>
            {/* <Tabs.Content value="members">Manage your team members</Tabs.Content>
            <Tabs.Content value="projects">Manage your projects</Tabs.Content>
            <Tabs.Content value="tasks">
              Manage your tasks for freelancers
            </Tabs.Content> */}
          </Tabs.Root>
        </HStack>
      </HStack>

      <Table.Root variant="line">
        <Table.Header overflow="hidden">
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row
              key={headerGroup.id}
              bg="bg.muted"
              borderColor="border.emphasized"
            >
              {headerGroup.headers.map((header, index) => {
                {
                }
                const isFirst = index === 0;
                const isLast = index === headerGroup.headers.length - 1;
                const canSort = header.column.getCanSort();
                const toggleSorting = header.column.getToggleSortingHandler();
                return (
                  <Table.ColumnHeader
                    key={header.id}
                    borderTopLeftRadius={isFirst ? 5 : 0}
                    borderTopRightRadius={isLast ? 5 : 0}
                    borderBottomLeftRadius={isFirst ? 5 : 0}
                    borderBottomRightRadius={isLast ? 5 : 0}
                    borderBottom="none"
                  >
                    {canSort && toggleSorting ? (
                      <button
                        type="button"
                        onClick={toggleSorting}
                        title={
                          header.column.getNextSortingOrder() === "asc"
                            ? "Sort ascending"
                            : header.column.getNextSortingOrder() === "desc"
                            ? "Sort descending"
                            : "Clear sort"
                        }
                        style={{
                          cursor: "pointer",
                          userSelect: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "transparent",
                          border: "none",
                          padding: 0,
                          font: "inherit",
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {{
                          asc: <LuArrowUp/>,
                          desc: <LuArrowDown/>,
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    ) : (
                      <>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </>
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
              {/* <DownloadTrigger
                data={wordlist.map((item) => ({
                  text: item.text,
                  bookTitle: item.bookTitle,
                  dictSuffix: item.dictSuffix,
                  dateCreated: item.dateCreated,
                }))}
                fileName="wordlist.csv"
                mimeType="text/csv"
                asChild
              >
                <Button variant="outline" size="sm">
                  <LuDownload />
                  CSV <Kbd>C</Kbd>
                </Button>
              </DownloadTrigger> */}
              <DownloadTrigger
                data={JSON.stringify(wordlist)}
                fileName="wordlist.json"
                mimeType="application/json"
                asChild
              >
                <Button variant="outline" size="sm">
                  <LuDownload />
                  Download JSON
                </Button>
              </DownloadTrigger>
            </ActionBar.Content>
          </ActionBar.Positioner>
        </Portal>
      </ActionBar.Root>
    </VStack>
  );
};
export default WordlistTable;
