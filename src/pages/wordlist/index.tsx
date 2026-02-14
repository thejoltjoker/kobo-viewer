import { Heading, Text } from "@chakra-ui/react";

import WordlistTable from "@/components/wordlist-table";

export function WordlistPage() {
  return (
    <>
      <Heading size="xl" mb={4}>
        Wordlist
      </Heading>
      <Text mb={6} color="fg.muted">
        View all words from your Kobo database.
      </Text>
      <WordlistTable />
    </>
  );
}
