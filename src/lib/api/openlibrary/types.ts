/** Search API: https://openlibrary.org/search.json */
export interface OpenLibrarySearchParams {
  q?: string;
  title?: string;
  author?: string;
  limit?: number;
  offset?: number;
  page?: number;
  fields?: string;
  sort?: string;
  lang?: string;
}

export interface OpenLibrarySearchDoc {
  key: string;
  title?: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  cover_i?: number;
  edition_count?: number;
  has_fulltext?: boolean;
  ia?: string[];
  [key: string]: unknown;
}

export interface OpenLibrarySearchResponse {
  start: number;
  num_found: number;
  numFound?: number;
  numFoundExact?: boolean;
  docs: OpenLibrarySearchDoc[];
}

/** Work by ID - minimal shape for Goodreads resolution */
export interface OpenLibraryWorkIdentifiers {
  key?: string;
  cover_edition?: { key: string };
}

/** Edition by ID - minimal shape for identifiers */
export interface OpenLibraryEditionIdentifiers {
  identifiers?: { goodreads?: string[] };
}

/** Work/Edition by ID - structure varies; use generic for thin client */
export type OpenLibraryWork = OpenLibraryWorkIdentifiers & Record<string, unknown>;
export type OpenLibraryEdition = OpenLibraryEditionIdentifiers &
  Record<string, unknown>;

export type CoverSize = "S" | "M" | "L";
export type CoverKey = "id" | "isbn" | "oclc" | "lccn" | "olid";
