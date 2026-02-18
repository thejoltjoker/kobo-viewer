import {
  Accordion,
  Card,
  Code,
  Heading,
  HStack,
  Kbd,
  List,
  SimpleGrid,
  Span,
  Spinner,
  Stack,
  Stat,
  StatGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Highlight } from "@chakra-ui/react";

import Dropzone from "@/components/dropzone";
import { formatDatabaseSize } from "@/components/sidebar/utils";
import { useDatabase } from "@/lib/db/hooks";
import { getBookmarksCount, getWordlistCount } from "@/lib/db/queries";

function formatLastUploaded(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export function OverviewPage() {
  const { db, lastUploaded, databaseSizeBytes, isLoading } = useDatabase();
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null);

  useEffect(() => {
    if (!db) {
      setWordCount(null);
      setBookmarkCount(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [words, bookmarks] = await Promise.all([
          getWordlistCount(db),
          getBookmarksCount(db),
        ]);
        if (!cancelled) {
          setWordCount(words);
          setBookmarkCount(bookmarks);
        }
      } catch (err) {
        if (!cancelled) {
          setWordCount(null);
          setBookmarkCount(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [db]);

  const hasDatabase = db != null && !isLoading;
  const isStatsLoading =
    hasDatabase && (wordCount === null || bookmarkCount === null);

  return (
    <Stack gap="4">
      <VStack gap="2" alignItems="flex-start">
        <Heading size="xl">Welcome to the Kobo Companion</Heading>
        <Text>Upload a Kobo database file to get started.</Text>
      </VStack>

      {isLoading && (
        <Stack mb="8" align="center" gap="3" py="8">
          <Spinner size="lg" colorPalette="blue" />
          <Text color="fg.muted">Loading database…</Text>
        </Stack>
      )}

      {hasDatabase && (
        <StatGroup
          size="lg"
          gap="6"
          bg="bg.subtle"
          p="6"
          borderRadius="lg"
          borderWidth="1px"
        >
          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="6" width="100%">
            <Stat.Root>
              <Stat.Label>Words in list</Stat.Label>
              <Stat.ValueText>
                {wordCount != null ? (
                  wordCount.toLocaleString()
                ) : isStatsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  "—"
                )}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>Bookmarks</Stat.Label>
              <Stat.ValueText>
                {bookmarkCount != null ? (
                  bookmarkCount.toLocaleString()
                ) : isStatsLoading ? (
                  <Spinner size="sm" />
                ) : (
                  "—"
                )}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>Database size</Stat.Label>
              <Stat.ValueText>
                {databaseSizeBytes != null
                  ? formatDatabaseSize(databaseSizeBytes)
                  : "—"}
              </Stat.ValueText>
            </Stat.Root>
            <Stat.Root>
              <Stat.Label>Last uploaded</Stat.Label>
              <Stat.ValueText>
                {lastUploaded ? formatLastUploaded(lastUploaded) : "—"}
              </Stat.ValueText>
            </Stat.Root>
          </SimpleGrid>
        </StatGroup>
      )}

      <VStack gap="4" alignItems="flex-start">
        <Dropzone />
        <HStack width="100%" gap="4" alignItems="flex-start" wrap="wrap">
          <Card.Root flex="1" flexBasis="300px">
            <Card.Header>
              <Heading>How to upload your database file</Heading>
            </Card.Header>
            <Card.Body>
              <List.Root
                as="ol"
                fontSize="lg"
                listStylePosition="outside"
                pl="6"
                css={{
                  "& li::marker": { color: "orange.500", fontWeight: "bold" },
                }}
                color="fg.muted"
              >
                <List.Item>
                  Connect your Kobo Clara to your computer with a USB cable.
                </List.Item>
                <List.Item>
                  Open the Kobo device folder on your computer.
                </List.Item>
                <List.Item>
                  <Highlight
                    query={["KoboReader.sqlite", ".kobo"]}
                    styles={{ px: "0.5", bg: "orange.muted" }}
                  >
                    Find the file named KoboReader.sqlite in the .kobo folder.
                  </Highlight>{" "}
                </List.Item>
                <List.Item>
                  Drag and drop the file into the upload area above.
                </List.Item>
              </List.Root>
            </Card.Body>
          </Card.Root>

          <Card.Root flex="1" flexBasis="300px">
            <Card.Header>
              <Heading>FAQ</Heading>
            </Card.Header>
            <Card.Body>
              <Accordion.Root collapsible>
                <Accordion.Item value="hidden-files">
                  <Accordion.ItemTrigger>
                    <Span flex="1">Can't find the .kobo folder?</Span>
                    <Accordion.ItemIndicator />
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    <Accordion.ItemBody>
                      <VStack align="stretch" gap="3">
                        <Text>
                          The{" "}
                          <Highlight
                            query=".kobo"
                            styles={{ px: "0.5", bg: "orange.muted" }}
                          >
                            .kobo
                          </Highlight>{" "}
                          folder may be hidden. Here's how to show it:
                        </Text>
                        <List.Root as="ul">
                          <List.Item>
                            <Text>
                              <Text as="span" fontWeight="semibold">
                                Windows:
                              </Text>{" "}
                              Open File Explorer → View tab → Check{" "}
                              <Highlight
                                query="Hidden items"
                                styles={{ px: "0.5", bg: "orange.muted" }}
                              >
                                Hidden items
                              </Highlight>
                            </Text>
                          </List.Item>
                          <List.Item>
                            <Text>
                              <Text as="span" fontWeight="semibold">
                                Mac:
                              </Text>{" "}
                              Press <Kbd>Cmd</Kbd> + <Kbd>Shift</Kbd> +{" "}
                              <Kbd>.</Kbd> in Finder to toggle hidden files
                            </Text>
                          </List.Item>
                          <List.Item>
                            <Text>
                              <Text as="span" fontWeight="semibold">
                                Linux:
                              </Text>{" "}
                              Press <Kbd>Ctrl</Kbd> + <Kbd>H</Kbd> in your file
                              manager
                            </Text>
                          </List.Item>
                        </List.Root>
                      </VStack>
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
                <Accordion.Item value="file-location">
                  <Accordion.ItemTrigger>
                    <Span flex="1">Where exactly is the database file?</Span>
                    <Accordion.ItemIndicator />
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    <Accordion.ItemBody>
                      <Text>
                        The database file is located at:{" "}
                        <Code>.kobo/KoboReader.sqlite</Code>
                      </Text>
                      <Text mt={2} color="fg.muted">
                        Make sure you're looking on your Kobo device (it will
                        appear as a USB drive when connected), not in your
                        computer's regular folders.
                      </Text>
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
                <Accordion.Item value="macos-mount">
                  <Accordion.ItemTrigger>
                    <Span flex="1">Kobo not showing up on macOS?</Span>
                    <Accordion.ItemIndicator />
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    <Accordion.ItemBody>
                      <VStack align="stretch" gap="3">
                        <Text>
                          On newer Macs, you may need to manually mount your
                          Kobo device. Here are two methods:
                        </Text>
                        <VStack align="stretch" gap="2">
                          <Text fontWeight="semibold">
                            Method 1: Using Terminal
                          </Text>
                          <List.Root as="ol" pl="6" listStylePosition="outside">
                            <List.Item>
                              <Text>Connect your Kobo via USB cable</Text>
                            </List.Item>
                            <List.Item>
                              <Text>
                                Open Terminal (press <Kbd>Cmd</Kbd> +{" "}
                                <Kbd>Space</Kbd>, type{" "}
                                <Highlight
                                  query="Terminal"
                                  styles={{ px: "0.5", bg: "orange.muted" }}
                                >
                                  Terminal
                                </Highlight>
                                , press <Kbd>Enter</Kbd>)
                              </Text>
                            </List.Item>
                            <List.Item>
                              <Text>
                                Type <Code>diskutil list</Code> and press{" "}
                                <Kbd>Enter</Kbd> to see all connected drives
                              </Text>
                            </List.Item>
                            <List.Item>
                              <Text>
                                Look for your Kobo device (usually named{" "}
                                <Highlight
                                  query="KOBOeReader"
                                  styles={{ px: "0.5", bg: "orange.muted" }}
                                >
                                  KOBOeReader
                                </Highlight>{" "}
                                or similar) and note its identifier (e.g.,{" "}
                                <Code>disk2s1</Code>)
                              </Text>
                            </List.Item>
                            <List.Item>
                              <Text>
                                Type{" "}
                                <Code>diskutil mount /dev/[identifier]</Code>{" "}
                                (replace{" "}
                                <Highlight
                                  query="[identifier]"
                                  styles={{ px: "0.5", bg: "orange.muted" }}
                                >
                                  [identifier]
                                </Highlight>{" "}
                                with your device's identifier) and press{" "}
                                <Kbd>Enter</Kbd>
                              </Text>
                            </List.Item>
                            <List.Item>
                              <Text>Your Kobo should now appear in Finder</Text>
                            </List.Item>
                          </List.Root>
                        </VStack>
                        <VStack align="stretch" gap="2">
                          <Text fontWeight="semibold">
                            Method 2: Using Disk Utility
                          </Text>
                          <List.Root as="ol" pl="6" listStylePosition="outside">
                            <List.Item>
                              <Text>Connect your Kobo via USB cable</Text>
                            </List.Item>
                            <List.Item>
                              <Text>
                                Open Disk Utility (press <Kbd>Cmd</Kbd> +{" "}
                                <Kbd>Space</Kbd>, type{" "}
                                <Highlight
                                  query="Disk Utility"
                                  styles={{ px: "0.5", bg: "orange.muted" }}
                                >
                                  Disk Utility
                                </Highlight>
                                , press <Kbd>Enter</Kbd>)
                              </Text>
                            </List.Item>
                            <List.Item>
                              <Text>
                                In the sidebar, find your Kobo device (it may
                                appear grayed out)
                              </Text>
                            </List.Item>
                            <List.Item>
                              <Text>
                                Select it and click the{" "}
                                <Highlight
                                  query="Mount"
                                  styles={{ px: "0.5", bg: "orange.muted" }}
                                >
                                  Mount
                                </Highlight>{" "}
                                button in the toolbar
                              </Text>
                            </List.Item>
                            <List.Item>
                              <Text>Your Kobo should now appear in Finder</Text>
                            </List.Item>
                          </List.Root>
                        </VStack>
                      </VStack>
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
                <Accordion.Item value="troubleshooting">
                  <Accordion.ItemTrigger>
                    <Span flex="1">Still having trouble?</Span>
                    <Accordion.ItemIndicator />
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    <Accordion.ItemBody>
                      <VStack align="stretch" gap="2">
                        <Text>Try these steps:</Text>
                        <List.Root listStylePosition="outside" pl="6">
                          <List.Item>
                            <Text>
                              Make sure your Kobo is fully connected and
                              unlocked
                            </Text>
                          </List.Item>
                          <List.Item>
                            <Text>
                              Wait a few seconds after connecting for the device
                              to appear
                            </Text>
                          </List.Item>
                          <List.Item>
                            <Text>
                              Look for a drive named{" "}
                              <Highlight
                                query="KOBOeReader"
                                styles={{ px: "0.5", bg: "orange.muted" }}
                              >
                                KOBOeReader
                              </Highlight>{" "}
                              or similar in your file explorer
                            </Text>
                          </List.Item>
                          <List.Item>
                            <Text>
                              The file must be named exactly{" "}
                              <Highlight
                                query="KoboReader.sqlite"
                                styles={{ px: "0.5", bg: "orange.muted" }}
                              >
                                KoboReader.sqlite
                              </Highlight>
                            </Text>
                          </List.Item>
                        </List.Root>
                      </VStack>
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </Accordion.Item>
              </Accordion.Root>
            </Card.Body>
          </Card.Root>
        </HStack>
      </VStack>
    </Stack>
  );
}
