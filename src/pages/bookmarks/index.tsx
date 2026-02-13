import { Heading, Text } from "@chakra-ui/react";
import BookmarksTable from "@/components/bookmarks-table";

export function BookmarksPage() {
  return (
    <>
      <Heading size="xl" mb={4}>
        Bookmarks
      </Heading>
      <Text mb={6} color="fg.muted">
        View your book bookmarks and annotations.
      </Text>
      <BookmarksTable />
    </>
  );
}
