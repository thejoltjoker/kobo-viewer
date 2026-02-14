import { Prose } from "@/components/ui/prose";
import { getDefinition } from "@/lib/api/definitions";
import type { WiktionaryResponse } from "@/lib/api/types/wiktionary";
import {
  Badge,
  Box,
  CloseButton,
  Drawer,
  HStack,
  Link,
  Portal,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

export interface WordDefinitionDrawerProps {
  word: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function getMeaningGroups(data: WiktionaryResponse) {
  return (
    Object.values(data) as Array<{
      partOfSpeech: string;
      language?: string;
      definitions: Array<{
        definition: string;
        parsedExamples?: Array<{ example: string }>;
        examples?: string[];
      }>;
    }>
  ).flat();
}

const WordDefinitionDrawer = ({
  word,
  open = false,
  onOpenChange,
}: WordDefinitionDrawerProps) => {
  const {
    data: definition,
    isLoading: loading,
    isError: isErrorState,
    error,
  } = useQuery({
    queryKey: ["definition", word],
    queryFn: () => getDefinition(word),
    enabled: open && !!word,
  });

  const isControlled = onOpenChange != null;
  const meaningGroups = definition ? getMeaningGroups(definition) : [];
  const errorMessage =
    error instanceof Error ? error.message : "Failed to load definition";

  return (
    <Drawer.Root
      open={isControlled ? open : undefined}
      onOpenChange={isControlled ? (e) => onOpenChange(e.open) : undefined}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner padding="4">
          <Drawer.Content rounded="md">
            <Drawer.Header>
              <Drawer.Title>{word || "Definition"}</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              {loading && (
                <VStack py="8" gap="3">
                  <Spinner colorPalette="blue" />
                  <Text color="fg.muted">Fetching definition…</Text>
                </VStack>
              )}

              {isErrorState && error && (
                <VStack align="stretch" gap="3">
                  <Box
                    p="3"
                    borderRadius="md"
                    bg="orange.subtle"
                    borderWidth="1px"
                    borderColor="orange.muted"
                  >
                    <Text color="fg">{errorMessage}</Text>
                  </Box>
                  <Text color="fg.muted">
                    Try searching on{" "}
                    <Link
                      href={`https://www.wordreference.com/definition/${encodeURIComponent(
                        word
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      textDecoration="underline"
                    >
                      WordReference
                    </Link>{" "}
                    or{" "}
                    <Link
                      href={`https://en.wiktionary.org/wiki/${encodeURIComponent(
                        word
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      color="blue.500"
                      textDecoration="underline"
                    >
                      Wiktionary
                    </Link>
                    .
                  </Text>
                </VStack>
              )}

              {!loading && !isErrorState && meaningGroups.length > 0 && (
                <VStack align="stretch" gap="4">
                  {meaningGroups.map((item, idx) => (
                    <VStack key={idx} align="stretch" gap="2">
                      <HStack gap="2" align="center" flexWrap="wrap">
                        <Badge
                          colorPalette="blue"
                          variant="subtle"
                          textTransform="capitalize"
                        >
                          {item.partOfSpeech}
                        </Badge>
                        {item.language && (
                          <Text color="fg.muted" fontSize="xs">
                            {item.language}
                          </Text>
                        )}
                      </HStack>

                      <Box
                        as="ol"
                        listStyleType="decimal"
                        pl="6"
                        margin="0"
                        css={{ "& li": { mb: 2 } }}
                      >
                        {(item.definitions ?? []).map((def, defIdx) => (
                          <Box key={defIdx} as="li">
                            <Prose>
                              <VStack align="stretch" gap="0.5">
                                <Box
                                  dangerouslySetInnerHTML={{
                                    __html: def.definition,
                                  }}
                                />
                                {def.parsedExamples?.map((ex, exIdx) => (
                                  <Box
                                    key={exIdx}
                                    color="fg.muted"
                                    fontStyle="italic"
                                    pl="2"
                                    dangerouslySetInnerHTML={{
                                      __html: `"${ex.example}"`,
                                    }}
                                  />
                                ))}
                                {!def.parsedExamples?.length &&
                                  def.examples?.[0] && (
                                    <Text
                                      color="fg.muted"
                                      fontStyle="italic"
                                      pl="2"
                                    >
                                      &quot;{def.examples[0]}&quot;
                                    </Text>
                                  )}
                              </VStack>
                            </Prose>
                          </Box>
                        ))}
                      </Box>

                      {idx < meaningGroups.length - 1 && (
                        <Box
                          borderBottomWidth="1px"
                          borderColor="border"
                          my="1"
                        />
                      )}
                    </VStack>
                  ))}

                  <Box borderTopWidth="1px" borderColor="border" pt="3" mt="1">
                    <Text color="fg.muted">Source: Wiktionary</Text>
                  </Box>
                </VStack>
              )}
            </Drawer.Body>
            <Drawer.CloseTrigger asChild>
              <CloseButton />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
};

export default WordDefinitionDrawer;
