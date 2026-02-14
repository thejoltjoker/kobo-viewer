import type { WiktionaryResponse } from "./types/wiktionary";

export const getDefinition = async (
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
