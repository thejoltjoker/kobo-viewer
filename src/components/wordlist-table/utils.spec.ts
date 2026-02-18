import { beforeEach, describe, expect, it } from "vitest";

import type { WordlistWithBookMeta } from "@/lib/db/types";

import {
  convertWordlistToCSV,
  getGoogleTranslateUrl,
} from "./utils";

describe("convertWordlistToCSV", () => {
  it("should convert empty array to CSV with headers only", () => {
    const result = convertWordlistToCSV([]);
    expect(result).toBe("Word,Book Title,Author,Dictionary,Date Created");
  });

  it("should convert basic wordlist data to CSV", () => {
    const wordlist: WordlistWithBookMeta[] = [
      {
        text: "hello",
        bookTitle: "Test Book",
        bookAuthor: "Test Author",
        dictSuffix: "en",
        dateCreated: "2024-01-01T00:00:00Z",
        volumeId: null,
      },
      {
        text: "world",
        bookTitle: "Another Book",
        bookAuthor: "Another Author",
        dictSuffix: "fr",
        dateCreated: "2024-01-02T00:00:00Z",
        volumeId: null,
      },
    ];

    const result = convertWordlistToCSV(wordlist);
    const lines = result.split("\n");

    expect(lines[0]).toBe("Word,Book Title,Author,Dictionary,Date Created");
    expect(lines[1]).toContain("hello");
    expect(lines[1]).toContain("Test Book");
    expect(lines[1]).toContain("Test Author");
    expect(lines[1]).toContain("en");
    expect(lines[2]).toContain("world");
    expect(lines[2]).toContain("Another Book");
  });

  it("should escape commas in CSV fields", () => {
    const wordlist: WordlistWithBookMeta[] = [
      {
        text: "test,word",
        bookTitle: "Book, Title",
        bookAuthor: "Author, Name",
        dictSuffix: null,
        dateCreated: null,
        volumeId: null,
      },
    ];

    const result = convertWordlistToCSV(wordlist);
    expect(result).toContain('"test,word"');
    expect(result).toContain('"Book, Title"');
    expect(result).toContain('"Author, Name"');
  });

  it("should escape quotes in CSV fields", () => {
    const wordlist: WordlistWithBookMeta[] = [
      {
        text: 'word with "quotes"',
        bookTitle: 'Book with "quotes"',
        bookAuthor: null,
        dictSuffix: null,
        dateCreated: null,
        volumeId: null,
      },
    ];

    const result = convertWordlistToCSV(wordlist);
    // Quotes should be doubled inside quoted fields
    expect(result).toContain('"word with ""quotes"""');
    expect(result).toContain('"Book with ""quotes"""');
  });

  it("should escape newlines in CSV fields", () => {
    const wordlist: WordlistWithBookMeta[] = [
      {
        text: "word\nwith\nnewlines",
        bookTitle: "Book\nTitle",
        bookAuthor: null,
        dictSuffix: null,
        dateCreated: null,
        volumeId: null,
      },
    ];

    const result = convertWordlistToCSV(wordlist);
    expect(result).toContain('"word\nwith\nnewlines"');
    expect(result).toContain('"Book\nTitle"');
  });

  it("should handle null and undefined values", () => {
    const wordlist: WordlistWithBookMeta[] = [
      {
        text: "word",
        bookTitle: null,
        bookAuthor: undefined as any,
        dictSuffix: null,
        dateCreated: null,
        volumeId: null,
      },
    ];

    const result = convertWordlistToCSV(wordlist);
    const lines = result.split("\n").filter((line) => line.length > 0);
    // Null/undefined should become empty strings, dateCreated is null so no date
    expect(lines[1]).toBe("word,,,,");
  });

  it("should format dates correctly", () => {
    const wordlist: WordlistWithBookMeta[] = [
      {
        text: "test",
        bookTitle: null,
        bookAuthor: null,
        dictSuffix: null,
        dateCreated: "2024-01-15T10:30:00Z",
        volumeId: null,
      },
    ];

    const result = convertWordlistToCSV(wordlist);
    const lines = result.split("\n");
    // Date should be formatted as locale date string
    expect(lines[1]).toMatch(/test,,,,1\/15\/2024|15\/1\/2024|2024\/1\/15/);
  });

  it("should handle special characters in words", () => {
    const wordlist: WordlistWithBookMeta[] = [
      {
        text: "café",
        bookTitle: "Les Misérables",
        bookAuthor: "Victor Hugo",
        dictSuffix: "fr",
        dateCreated: null,
        volumeId: null,
      },
    ];

    const result = convertWordlistToCSV(wordlist);
    expect(result).toContain("café");
    expect(result).toContain("Les Misérables");
    expect(result).toContain("Victor Hugo");
  });

  it("should handle multiple rows with mixed special characters", () => {
    const wordlist: WordlistWithBookMeta[] = [
      {
        text: "normal",
        bookTitle: "Normal Book",
        bookAuthor: "Author",
        dictSuffix: "en",
        dateCreated: null,
        volumeId: null,
      },
      {
        text: 'word, with "quotes"',
        bookTitle: "Book\nTitle",
        bookAuthor: "Author, Name",
        dictSuffix: null,
        dateCreated: null,
        volumeId: null,
      },
    ];

    const result = convertWordlistToCSV(wordlist);
    // Note: newlines inside quoted fields create extra lines when split, which is correct CSV behavior
    const lines = result.trim().split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(3); // Header + at least 2 data rows (may be more due to newlines in fields)
    expect(lines[0]).toBe("Word,Book Title,Author,Dictionary,Date Created");
    expect(lines[1]).toContain("normal");
    // The second row may span multiple lines due to newline in bookTitle
    const remainingLines = lines.slice(2).join("\n");
    expect(remainingLines).toContain('"word, with ""quotes"""');
    expect(remainingLines).toContain('"Book\nTitle"');
    expect(remainingLines).toContain('"Author, Name"');
  });
});

describe("getGoogleTranslateUrl", () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    // Reset navigator before each test
    if (originalNavigator) {
      Object.defineProperty(globalThis, "navigator", {
        value: originalNavigator,
        writable: true,
        configurable: true,
      });
    }
  });

  it("should generate URL with provided locale", () => {
    const url = getGoogleTranslateUrl("hello", "fr");
    expect(url).toBe(
      "https://translate.google.com/?sl=auto&tl=fr&text=hello",
    );
  });

  it("should URL encode special characters in word", () => {
    const url = getGoogleTranslateUrl("hello world", "en");
    expect(url).toBe(
      "https://translate.google.com/?sl=auto&tl=en&text=hello%20world",
    );
  });

  it("should URL encode special characters like é, ñ, etc.", () => {
    const url = getGoogleTranslateUrl("café", "en");
    expect(url).toContain("caf%C3%A9");
  });

  it("should use browser language when locale not provided", () => {
    // Mock navigator.language
    Object.defineProperty(globalThis, "navigator", {
      value: {
        language: "es-ES",
      },
      writable: true,
      configurable: true,
    });

    const url = getGoogleTranslateUrl("hello");
    expect(url).toBe(
      "https://translate.google.com/?sl=auto&tl=es&text=hello",
    );
  });

  it("should extract language code from full locale string", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        language: "zh-CN",
      },
      writable: true,
      configurable: true,
    });

    const url = getGoogleTranslateUrl("hello");
    expect(url).toBe(
      "https://translate.google.com/?sl=auto&tl=zh&text=hello",
    );
  });

  it("should handle locale without region code", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        language: "fr",
      },
      writable: true,
      configurable: true,
    });

    const url = getGoogleTranslateUrl("bonjour");
    expect(url).toBe(
      "https://translate.google.com/?sl=auto&tl=fr&text=bonjour",
    );
  });

  it("should fallback to 'en' when navigator.language is not available", () => {
    // Mock navigator without language property
    Object.defineProperty(globalThis, "navigator", {
      value: {},
      writable: true,
      configurable: true,
    });

    const url = getGoogleTranslateUrl("hello");
    expect(url).toBe(
      "https://translate.google.com/?sl=auto&tl=en&text=hello",
    );
  });

  it("should handle empty string locale", () => {
    Object.defineProperty(globalThis, "navigator", {
      value: {
        language: "",
      },
      writable: true,
      configurable: true,
    });

    const url = getGoogleTranslateUrl("hello");
    expect(url).toBe(
      "https://translate.google.com/?sl=auto&tl=en&text=hello",
    );
  });

  it("should handle complex words with multiple special characters", () => {
    const url = getGoogleTranslateUrl("café & résumé", "en");
    expect(url).toContain("caf%C3%A9");
    expect(url).toContain("r%C3%A9sum%C3%A9");
    expect(url).toContain("%26"); // & encoded
  });
});
