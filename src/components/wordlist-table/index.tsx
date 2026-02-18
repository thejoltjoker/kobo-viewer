// TODO Export selected as csv
// TODO filter by book title
// TODO filter by dict suffix (input chips)

import type { PaginationState, SortingState } from "@tanstack/react-table";

import {
  ActionBar,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Checkbox,
  createListCollection,
  DownloadTrigger,
  Field,
  HStack,
  IconButton,
  Input,
  InputGroup,
  Pagination,
  Portal,
  Select,
  Stack,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import {
  LuArrowDown,
  LuArrowUp,
  LuChevronLeft,
  LuChevronRight,
  LuCopy,
  LuDownload,
  LuSearch,
} from "react-icons/lu";

import type { WordlistWithBookMeta } from "@/lib/db/types";
import type { DictSuffix } from "@/lib/utils/dict-suffixes";

import { BookHoverCard } from "@/components/book-hover-card";
import { toaster } from "@/components/ui/toaster-instance";
import { Tooltip } from "@/components/ui/tooltip";
import WordDefinitionDrawer from "@/components/word-definition-drawer";
import { useDatabase } from "@/lib/db/hooks";
import { getWordlistWithBookTitles } from "@/lib/db/queries";
import { getDictSuffix } from "@/lib/utils/dict-suffixes";

export interface WordlistProps {}

function WordlistTable() {
  const [selection, setSelection] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "dateCreated", desc: true },
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const { db } = useDatabase();
  const { data: wordlist = [] } = useQuery({
    queryKey: ["wordlist"],
    queryFn: () => getWordlistWithBookTitles(db!),
    enabled: !!db,
  });
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerWord, setDrawerWord] = useState<string | null>(null);
  const dictSuffixes = useMemo(() => {
    const suffixes = wordlist
      .map((item) => item.dictSuffix)
      .filter((item): item is string => item != null && item !== "");
    return Array.from(new Set(suffixes))
      .map((suffix) =>
        getDictSuffix(suffix.startsWith("-") ? suffix.slice(1) : suffix)
      )
      .filter((item): item is DictSuffix => item !== undefined);
  }, [wordlist]);
  const [selectedDictSuffixes, setSelectedDictSuffixes] = useState<string[]>(
    []
  );
  const [wordFilter, setWordFilter] = useState("");

  const filteredWordlist = useMemo(() => {
    let result = wordlist;
    const query = wordFilter.trim().toLowerCase();
    if (query) {
      result = result.filter((row) => row.text.toLowerCase().includes(query));
    }
    if (selectedDictSuffixes.length > 0) {
      result = result.filter((row) => {
        const suffix = row.dictSuffix?.replace(/^-/, "") ?? "";
        return selectedDictSuffixes.includes(suffix);
      });
    }
    return result;
  }, [wordlist, selectedDictSuffixes, wordFilter]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toaster.create({
        title: "Copied!",
        description: `"${text}" copied to clipboard`,
        type: "success",
      });
    } catch {
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
  const selectableWordlist = filteredWordlist;

  const columnHelper = useMemo(
    () => createColumnHelper<WordlistWithBookMeta>(),
    []
  );

  const columns = useMemo(() => {
    const indeterminate =
      hasSelection && selection.length < selectableWordlist.length;
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
                changes.checked
                  ? selectableWordlist.map((item) => item.text)
                  : []
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
        cell: (info) => {
          const title = info.getValue() ?? "";
          const author = info.row.original.bookAuthor;
          return (
            <HStack
              flexGrow="0"
              overflow="hidden"
              gap="2"
              justifyContent="flex-start"
            >
              <Stack flexShrink="1" minW="0" overflow="hidden" maxW="100%">
                <Text lineClamp={1}>{title}</Text>
              </Stack>
              <Stack
                flexShrink={0}
                flexGrow={0}
                alignItems="center"
                justifyContent="center"
              >
                <BookHoverCard bookTitle={title} bookAuthor={author} />
              </Stack>
            </HStack>
          );
        },
      }),
      columnHelper.accessor("bookAuthor", {
        id: "bookAuthor",
        header: () => <span className="no-wrap">Author</span>,
        enableSorting: true,
        cell: (info) => {
          const author = info.getValue();
          return (
            <Box overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
              {author ?? "-"}
            </Box>
          );
        },
      }),
      columnHelper.accessor("dictSuffix", {
        id: "dictSuffix",
        header: () => <span className="no-wrap">Dictionary</span>,
        enableSorting: true,
        cell: (info) => (
          <Badge
            colorPalette={
              getDictSuffix(info.getValue()?.replace(/^-/, "") ?? "")
                ?.badgeColor
            }
            textTransform="capitalize"
          >
            {getDictSuffix(info.getValue()?.replace(/^-/, "") ?? "")?.language}
          </Badge>
        ),
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
  }, [selection, selectableWordlist, columnHelper, hasSelection]);

  const table = useReactTable({
    columns,
    data: filteredWordlist,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnVisibility,
      sorting,
      pagination,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    enableSorting: true,
    autoResetPageIndex: false,
  });

  const columnOptions = useMemo(() => {
    return table
      .getAllColumns()
      .filter((column) => column.id !== "select" && column.id !== "actions")
      .map((column) => ({
        label:
          column.id === "text"
            ? "Word"
            : column.id === "bookTitle"
            ? "Book Title"
            : column.id === "bookAuthor"
            ? "Author"
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

  const dictSuffixOptions = useMemo(
    () =>
      dictSuffixes.map((s) => ({
        label: `${s.emoji} ${s.language}`,
        value: s.locale,
      })),
    [dictSuffixes]
  );
  const dictSuffixCollection = useMemo(
    () => createListCollection({ items: dictSuffixOptions }),
    [dictSuffixOptions]
  );

  const pageSizeOptions = useMemo(
    () =>
      [10, 20, 50, 100].map((size) => ({
        label: `${size} per page`,
        value: String(size),
      })),
    []
  );
  const pageSizeCollection = useMemo(
    () => createListCollection({ items: pageSizeOptions }),
    [pageSizeOptions]
  );

  const visibleColumnIds = useMemo(() => {
    return table
      .getAllColumns()
      .filter(
        (column) =>
          column.id !== "select" &&
          column.id !== "actions" &&
          column.getIsVisible()
      )
      .map((column) => column.id);
  }, [table]);

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
    <VStack gap="2">
      <WordDefinitionDrawer
        word={drawerWord ?? ""}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
      <HStack id="controls" width="100%" justify="space-between">
        <HStack flex="1" id="filter-controls">
          <Box flexBasis="300px">
            <Field.Root>
              <Field.Label>Filter words</Field.Label>
              <InputGroup flex="1" startElement={<LuSearch />}>
                <Input
                  placeholder="Search words"
                  size="sm"
                  value={wordFilter}
                  onChange={(e) => {
                    setWordFilter(e.target.value);
                    table.setPageIndex(0);
                  }}
                />
              </InputGroup>
            </Field.Root>
          </Box>
          <Box>
            <Select.Root
              multiple
              collection={dictSuffixCollection}
              value={selectedDictSuffixes}
              onValueChange={(details) => {
                const value = details.value;
                const selected = Array.isArray(value)
                  ? value
                  : value
                  ? [value]
                  : [];
                setSelectedDictSuffixes(selected);
                table.setPageIndex(0);
              }}
              size="sm"
              minWidth="10rem"
            >
              <Select.Label>Dictionaries</Select.Label>
              <Select.HiddenSelect />
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText placeholder="Filter by dict" />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content minWidth="min-content">
                    {dictSuffixOptions.map((option) => (
                      <Select.Item
                        item={option.value}
                        key={option.value}
                        textWrap="nowrap"
                      >
                        {option.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>
          </Box>
        </HStack>

        <HStack flex="1" id="table-controls" justify="flex-end">
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
                .filter(
                  (column) => column.id !== "select" && column.id !== "actions"
                )
                .map((column) => column.id);
              // Update visibility: show selected columns, hide unselected ones; actions always visible
              const newVisibility: Record<string, boolean> = {};
              allColumnIds.forEach((id) => {
                newVisibility[id] = selectedIds.includes(id);
              });
              newVisibility["actions"] = true;
              setColumnVisibility(newVisibility);
            }}
            size="sm"
            width="160px"
          >
            <Select.Label>Columns</Select.Label>
            <Select.HiddenSelect />
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
        </HStack>
      </HStack>

      <Table.Root variant="line">
        <Table.ColumnGroup>
          <Table.Column />
          <Table.Column htmlWidth="20%" />
          <Table.Column htmlWidth="30%" />
          <Table.Column htmlWidth="15%" />
          <Table.Column htmlWidth="15%" />
          <Table.Column htmlWidth="10%" />
          <Table.Column />
        </Table.ColumnGroup>
        <Table.Header overflow="hidden">
          {table.getHeaderGroups().map((headerGroup) => (
            <Table.Row
              key={headerGroup.id}
              bg="bg.muted"
              borderColor="border.emphasized"
            >
              {headerGroup.headers.map((header, index) => {
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
                          asc: <LuArrowUp />,
                          desc: <LuArrowDown />,
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

      {table.getRowCount() > 0 && (
        <HStack
          width="100%"
          justify="space-between"
          gap="4"
          flexWrap="wrap"
          py="3"
          align="center"
        >
          <Select.Root
            collection={pageSizeCollection}
            value={[String(pagination.pageSize)]}
            onValueChange={(details) => {
              const size = Number(
                Array.isArray(details.value) ? details.value[0] : details.value
              );
              if (Number.isFinite(size)) table.setPageSize(size);
            }}
            size="sm"
            width="32"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {[10, 20, 50, 100].map((size) => (
                    <Select.Item item={String(size)} key={size}>
                      {size} per page
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
          <Pagination.Root
            count={table.getRowCount()}
            page={pagination.pageIndex + 1}
            pageSize={pagination.pageSize}
            onPageChange={(details) => table.setPageIndex(details.page - 1)}
            onPageSizeChange={(details) => table.setPageSize(details.pageSize)}
            siblingCount={1}
          >
            <HStack gap="2" align="center">
              {/* <Group attached>
                <Pagination.PrevTrigger asChild>
                  <IconButton variant="outline" size="sm" aria-label="Previous page">
                    <LuChevronLeft />
                  </IconButton>
                </Pagination.PrevTrigger>
                <Pagination.Items render={(page) => page.value} />
                <Pagination.NextTrigger asChild>
                  <IconButton variant="outline" size="sm" aria-label="Next page">
                    <LuChevronRight />
                  </IconButton>
                </Pagination.NextTrigger>
              </Group> */}
              {/* <Pagination.PageText format="long" fontSize="sm" fontWeight="medium" /> */}
              <ButtonGroup variant="ghost" size="sm" w="full">
                <Pagination.PageText format="long" flex="1" />
                <Pagination.PrevTrigger asChild>
                  <IconButton>
                    <LuChevronLeft />
                  </IconButton>
                </Pagination.PrevTrigger>
                <Pagination.NextTrigger asChild>
                  <IconButton>
                    <LuChevronRight />
                  </IconButton>
                </Pagination.NextTrigger>
              </ButtonGroup>
            </HStack>
          </Pagination.Root>
        </HStack>
      )}

      <ActionBar.Root open={hasSelection}>
        <Portal>
          <ActionBar.Positioner>
            <ActionBar.Content>
              <ActionBar.SelectionTrigger>
                {selection.length} selected
              </ActionBar.SelectionTrigger>
              <ActionBar.Separator />
              <DownloadTrigger
                data={JSON.stringify(filteredWordlist)}
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
}
export default WordlistTable;
