import type { WiktionaryResponse } from "./types";

export const getWiktionaryDefinition = async (
  word: string
): Promise<WiktionaryResponse> => {
  const response = await fetch(
    `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(
      word
    )}`,
    {
      headers: {
        "User-Agent": "Kobo-Companion-App",
      },
    }
  );
  if (response.ok) {
    const data: WiktionaryResponse = await response.json();
    return data;
  }
  throw new Error("Definition not found");
};

export const WIKTIONARY_ORIGIN = "https://en.wiktionary.org";

export const rewriteWiktionaryLinks = (html: string): string => {
  return html
    .replace(/href="\/wiki\//g, `href="${WIKTIONARY_ORIGIN}/wiki/`)
    .replace(/href='\/wiki\//g, `href='${WIKTIONARY_ORIGIN}/wiki/`)
    .replace(/href="\/w\//g, `href="${WIKTIONARY_ORIGIN}/w/`)
    .replace(/href='\/w\//g, `href='${WIKTIONARY_ORIGIN}/w/`);
};

export const getMeaningGroups = (data: WiktionaryResponse) => {
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
};
