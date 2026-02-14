import {
  getGoodreadsSearchUrl,
  getGoodreadsUrlByWorkKey,
  searchBooks,
} from "@/lib/api/openlibrary";
import {
  Avatar,
  Box,
  HoverCard,
  Link,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { LuInfo } from "react-icons/lu";

const COVERS_BASE = "https://covers.openlibrary.org";

export interface BookHoverCardProps {
  bookTitle: string;
  bookAuthor?: string | null;
}

export const BookHoverCard = ({
  bookTitle,
  bookAuthor,
}: BookHoverCardProps) => {
  const { data: book, isLoading } = useQuery({
    queryKey: ["book", bookTitle, bookAuthor ?? ""],
    queryFn: () =>
      searchBooks({
        ...(bookAuthor?.trim()
          ? { title: bookTitle, author: bookAuthor.trim(), limit: 1 }
          : { q: bookTitle, limit: 1 }),
      }),
  });

  const doc = book?.docs?.[0];
  const workKey = doc?.key;

  const { data: goodreadsUrl } = useQuery({
    queryKey: ["goodreads", workKey],
    queryFn: () => getGoodreadsUrlByWorkKey(workKey!),
    enabled: !!workKey,
  });

  const coverUrl =
    doc?.cover_i != null
      ? `${COVERS_BASE}/b/id/${doc.cover_i}-M.jpg`
      : undefined;
  const authors = doc?.author_name?.slice(0, 2).join(", ");
  const year = doc?.first_publish_year;

  const goodreadsFallbackUrl = getGoodreadsSearchUrl(
    [bookTitle, bookAuthor].filter(Boolean).join(" ").trim() || bookTitle
  );
  const goodreadsLinkUrl = goodreadsUrl ?? goodreadsFallbackUrl;

  return (
    <HoverCard.Root size="sm" openDelay={100}>
      <HoverCard.Trigger asChild>
        <Box color="fg.subtle" _hover={{ color: "fg" }}>
          <LuInfo />
        </Box>
      </HoverCard.Trigger>
      <Portal>
        <HoverCard.Positioner>
          <HoverCard.Content>
            <HoverCard.Arrow />
            <Stack gap="3" direction="row" minW="240px">
              <Avatar.Root
                size="lg"
                flexShrink={0}
                shape="rounded"
                aspectRatio={1.5 / 1}
                height="90px"
                width="60px"
              >
                {isLoading ? (
                  <Avatar.Fallback>
                    <Spinner size="sm" />
                  </Avatar.Fallback>
                ) : (
                  <>
                    <Avatar.Image src={coverUrl} alt="" />
                    <Avatar.Fallback name={doc?.title ?? bookTitle} />
                  </>
                )}
              </Avatar.Root>
              <Stack gap="1" minW={0}>
                <Text textStyle="sm" fontWeight="semibold" lineClamp={2}>
                  {isLoading ? "…" : doc?.title ?? bookTitle}
                </Text>
                {authors && (
                  <Text textStyle="xs" color="fg.muted" truncate>
                    {authors}
                  </Text>
                )}
                {year != null && (
                  <Text textStyle="xs" color="fg.subtle">
                    {year}
                  </Text>
                )}
                {!isLoading && !doc && (
                  <Text textStyle="xs" color="fg.muted">
                    No book info found
                  </Text>
                )}
                <Link
                  href={goodreadsLinkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  textStyle="xs"
                  color="fg.muted"
                  mt="1"
                  _hover={{ color: "fg", textDecoration: "underline" }}
                >
                  View on Goodreads →
                </Link>
              </Stack>
            </Stack>
          </HoverCard.Content>
        </HoverCard.Positioner>
      </Portal>
    </HoverCard.Root>
  );
};
export default BookHoverCard;
