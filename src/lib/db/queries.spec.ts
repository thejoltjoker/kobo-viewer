import { describe, it, expect, beforeEach } from "vitest";
import { getWordlistWithBookTitles } from "./queries";
import { createDrizzleDb, type DrizzleDb } from "./index";

describe("getWordlistWithBookTitles", () => {
  let db: DrizzleDb;
  let sqlDb: any;

  beforeEach(async () => {
    // Create an in-memory database for testing
    const sqlJs = await import("sql.js");
    const SQL = await sqlJs.default({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`,
    });
    sqlDb = new SQL.Database();
    db = createDrizzleDb(sqlDb);

    // Create tables using raw SQL since we need the exact schema
    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS content (
        ContentID TEXT PRIMARY KEY,
        ContentType TEXT NOT NULL,
        MimeType TEXT NOT NULL,
        BookID TEXT,
        BookTitle TEXT
      );
    `);

    sqlDb.run(`
      CREATE TABLE IF NOT EXISTS WordList (
        Text TEXT PRIMARY KEY,
        VolumeId TEXT,
        DictSuffix TEXT,
        DateCreated TEXT
      );
    `);
  });

  it("should return empty array when wordlist is empty", async () => {
    const result = await getWordlistWithBookTitles(db);
    expect(result).toEqual([]);
  });

  it("should return wordlist entries without book titles when no matching content", async () => {
    // Insert wordlist entries using raw SQL
    sqlDb.run(
      `INSERT INTO WordList (Text, VolumeId, DictSuffix, DateCreated) VALUES 
       ('word1', 'volume1', 'suffix1', '2024-01-01'),
       ('word2', 'volume2', 'suffix2', '2024-01-02')`
    );

    const result = await getWordlistWithBookTitles(db);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      text: "word1",
      volumeId: "volume1",
      dictSuffix: "suffix1",
      dateCreated: "2024-01-01",
      bookTitle: null,
    });
    expect(result[1]).toMatchObject({
      text: "word2",
      volumeId: "volume2",
      dictSuffix: "suffix2",
      dateCreated: "2024-01-02",
      bookTitle: null,
    });
  });

  it("should match book titles by bookId", async () => {
    // Insert content with bookId
    sqlDb.run(
      `INSERT INTO content (ContentID, ContentType, MimeType, BookID, BookTitle) VALUES 
       ('content1', 'type1', 'mime1', 'volume1', 'Book Title 1'),
       ('content2', 'type2', 'mime2', 'volume2', 'Book Title 2')`
    );

    // Insert wordlist entries
    sqlDb.run(
      `INSERT INTO WordList (Text, VolumeId, DictSuffix, DateCreated) VALUES 
       ('word1', 'volume1', 'suffix1', '2024-01-01'),
       ('word2', 'volume2', 'suffix2', '2024-01-02')`
    );

    const result = await getWordlistWithBookTitles(db);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      text: "word1",
      volumeId: "volume1",
      bookTitle: "Book Title 1",
    });
    expect(result[1]).toMatchObject({
      text: "word2",
      volumeId: "volume2",
      bookTitle: "Book Title 2",
    });
  });

  it("should match book titles by contentId when bookId doesn't match", async () => {
    // Insert content with contentId matching volumeId
    sqlDb.run(
      `INSERT INTO content (ContentID, ContentType, MimeType, BookID, BookTitle) VALUES 
       ('volume1', 'type1', 'mime1', 'different-book-id', 'Book Title 1'),
       ('volume2', 'type2', 'mime2', NULL, 'Book Title 2')`
    );

    // Insert wordlist entries
    sqlDb.run(
      `INSERT INTO WordList (Text, VolumeId, DictSuffix, DateCreated) VALUES 
       ('word1', 'volume1', 'suffix1', '2024-01-01'),
       ('word2', 'volume2', 'suffix2', '2024-01-02')`
    );

    const result = await getWordlistWithBookTitles(db);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      text: "word1",
      volumeId: "volume1",
      bookTitle: "Book Title 1",
    });
    expect(result[1]).toMatchObject({
      text: "word2",
      volumeId: "volume2",
      bookTitle: "Book Title 2",
    });
  });

  it("should handle wordlist entries without volumeId", async () => {
    // Insert wordlist entry without volumeId
    sqlDb.run(
      `INSERT INTO WordList (Text, VolumeId, DictSuffix, DateCreated) VALUES 
       ('word1', NULL, 'suffix1', '2024-01-01')`
    );

    const result = await getWordlistWithBookTitles(db);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      text: "word1",
      volumeId: null,
      bookTitle: null,
    });
  });

  it("should handle multiple wordlist entries with same volumeId", async () => {
    // Insert content
    sqlDb.run(
      `INSERT INTO content (ContentID, ContentType, MimeType, BookID, BookTitle) VALUES 
       ('content1', 'type1', 'mime1', 'volume1', 'Book Title 1')`
    );

    // Insert multiple wordlist entries with same volumeId
    sqlDb.run(
      `INSERT INTO WordList (Text, VolumeId, DictSuffix, DateCreated) VALUES 
       ('word1', 'volume1', 'suffix1', '2024-01-01'),
       ('word2', 'volume1', 'suffix2', '2024-01-02'),
       ('word3', 'volume1', 'suffix3', '2024-01-03')`
    );

    const result = await getWordlistWithBookTitles(db);
    expect(result).toHaveLength(3);
    result.forEach((entry) => {
      expect(entry.volumeId).toBe("volume1");
      expect(entry.bookTitle).toBe("Book Title 1");
    });
  });

  it("should prefer bookId match over contentId match", async () => {
    // Insert content with both bookId and contentId matching volumeId
    // bookId match should be preferred
    sqlDb.run(
      `INSERT INTO content (ContentID, ContentType, MimeType, BookID, BookTitle) VALUES 
       ('volume1', 'type1', 'mime1', 'volume1', 'Book Title from BookID'),
       ('other-id', 'type2', 'mime2', 'volume1', 'Book Title from ContentID')`
    );

    // Insert wordlist entry
    sqlDb.run(
      `INSERT INTO WordList (Text, VolumeId, DictSuffix, DateCreated) VALUES 
       ('word1', 'volume1', 'suffix1', '2024-01-01')`
    );

    const result = await getWordlistWithBookTitles(db);
    expect(result).toHaveLength(1);
    // Should match by bookId first, so should get the first entry's title
    expect(result[0].bookTitle).toBe("Book Title from BookID");
  });
});
