import { Table } from "@chakra-ui/react";
import React from "react";
import type { Wordlist as WordlistType } from "@/lib/db/types";

export interface WordlistProps {
  wordlist: WordlistType[];
}

const WordlistTable: React.FC<WordlistProps> = ({ wordlist }) => {
  return (
    <Table.Root size="sm" interactive>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader>Text</Table.ColumnHeader>
          <Table.ColumnHeader>VolumeId</Table.ColumnHeader>
          <Table.ColumnHeader>DictSuffix</Table.ColumnHeader>
          <Table.ColumnHeader>DateCreated</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {wordlist.map((item: WordlistType) => (
          <Table.Row key={item.text}>
            <Table.Cell>{item.text}</Table.Cell>
            <Table.Cell>{item.volumeId}</Table.Cell>
            <Table.Cell textAlign="end">{item.dictSuffix}</Table.Cell>
            <Table.Cell textAlign="end">{item.dateCreated}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
};

export default WordlistTable;
