import { useDatabase } from "@/lib/db/hooks";
import type { WordlistWithBookTitle } from "@/lib/db/types";
import { getWordlistWithBookTitles } from "@/lib/db/queries";
import { Button, Portal, Table } from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { ActionBar, Checkbox, Kbd } from "@chakra-ui/react";
import { LuDownload } from "react-icons/lu";
export interface WordlistProps {}

const WordlistTable = () => {
  const [selection, setSelection] = useState<string[]>([]);
  const { db } = useDatabase();
  const [wordlist, setWordlist] = useState<WordlistWithBookTitle[]>([]);

  const hasSelection = selection.length > 0;
  const indeterminate = hasSelection && selection.length < wordlist.length;
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

  const rows = wordlist.map((item) => (
    <Table.Row
      key={item.text}
      data-selected={selection.includes(item.text) ? "" : undefined}
    >
      <Table.Cell>
        <Checkbox.Root
          size="sm"
          top="0.5"
          aria-label="Select row"
          checked={selection.includes(item.text)}
          onCheckedChange={(changes) => {
            setSelection((prev) =>
              changes.checked
                ? [...prev, item.text]
                : selection.filter((text) => text !== item.text)
            );
          }}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      </Table.Cell>
      <Table.Cell>{item.text}</Table.Cell>
      <Table.Cell>{item.bookTitle}</Table.Cell>
      {/* <Table.Cell>{item.volumeId}</Table.Cell> */}
      <Table.Cell>{item.dictSuffix}</Table.Cell>
      <Table.Cell>
        {item.dateCreated
          ? new Date(item.dateCreated).toLocaleDateString()
          : "-"}
      </Table.Cell>
    </Table.Row>
  ));

  return (
    <>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader w="6">
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
            </Table.ColumnHeader>
            <Table.ColumnHeader>Text</Table.ColumnHeader>
            <Table.ColumnHeader>BookTitle</Table.ColumnHeader>
            {/* <Table.ColumnHeader>VolumeId</Table.ColumnHeader> */}
            <Table.ColumnHeader>DictSuffix</Table.ColumnHeader>
            <Table.ColumnHeader>DateCreated</Table.ColumnHeader>
          </Table.Row>
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
export default WordlistTable;
