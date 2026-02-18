import type { WordlistWithBookMeta } from "@/lib/db/types";

export const escapeCsvField = (field: string | null | undefined): string => {
  if (field == null) {
    return "";
  }

  const str = String(field);

  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
};

export const convertWordlistToCSV = (
  wordlist: WordlistWithBookMeta[]
): string => {
  const headers = [
    "Word",
    "Book Title",
    "Author",
    "Dictionary",
    "Date Created",
  ];

  const headerRow = headers.map(escapeCsvField).join(",");

  const dataRows = wordlist.map((item) => {
    const dateCreated = item.dateCreated
      ? new Date(item.dateCreated).toLocaleDateString()
      : "";

    return [
      escapeCsvField(item.text),
      escapeCsvField(item.bookTitle),
      escapeCsvField(item.bookAuthor),
      escapeCsvField(item.dictSuffix),
      escapeCsvField(dateCreated),
    ].join(",");
  });

  return [headerRow, ...dataRows].join("\n");
};

export const extractLanguageCode = (locale: string): string => {
  return locale.split("-")[0] || locale;
};

export const getUserLanguageCode = (): string => {
  if (typeof navigator !== "undefined" && navigator.language) {
    return extractLanguageCode(navigator.language);
  }
  return "en";
};

export function getGoogleTranslateUrl(word: string, locale?: string): string {
  const targetLang = locale ?? getUserLanguageCode();
  const encodedWord = encodeURIComponent(word);
  return `https://translate.google.com/?sl=auto&tl=${targetLang}&text=${encodedWord}`;
}
