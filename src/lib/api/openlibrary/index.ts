/**
 * Thin API client for Open Library.
 * @see https://openlibrary.org/developers/api
 */

import type {
  CoverKey,
  CoverSize,
  OpenLibraryEdition,
  OpenLibrarySearchParams,
  OpenLibrarySearchResponse,
  OpenLibraryWork,
} from "./types";

export const OPENLIBRARY_API_BASE = "https://openlibrary.org";
export const OPENLIBRARY_COVERS_BASE = "https://covers.openlibrary.org";
export const GOODREADS_BOOK_BASE = "https://www.goodreads.com/book/show";
export const GOODREADS_SEARCH_BASE = "https://www.goodreads.com/search";

export const defaultRequestHeaders: HeadersInit = {
  "User-Agent": "Kobo-Companion (openlibrary@archive.org)",
  "Accept": "application/json",
};

async function get<T>(path: string, queryParams?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(path, OPENLIBRARY_API_BASE);
  if (queryParams) {
    for (const [paramKey, paramValue] of Object.entries(queryParams)) {
      if (paramValue !== undefined)
        url.searchParams.set(paramKey, String(paramValue));
    }
  }
  const response = await fetch(url.toString(), {
    headers: defaultRequestHeaders,
  });
  if (!response.ok) {
    throw new Error(
      `Open Library API error: ${response.status} ${response.statusText}`,
    );
  }
  return response.json() as Promise<T>;
}

export async function searchBooks(params: OpenLibrarySearchParams): Promise<OpenLibrarySearchResponse> {
  const queryParams: Record<string, string | number | undefined> = {};
  if (params.q != null)
    queryParams.q = params.q;
  if (params.title != null)
    queryParams.title = params.title;
  if (params.author != null)
    queryParams.author = params.author;
  if (params.limit != null)
    queryParams.limit = params.limit;
  if (params.offset != null)
    queryParams.offset = params.offset;
  if (params.page != null)
    queryParams.page = params.page;
  if (params.fields != null)
    queryParams.fields = params.fields;
  if (params.sort != null)
    queryParams.sort = params.sort;
  if (params.lang != null)
    queryParams.lang = params.lang;
  return get<OpenLibrarySearchResponse>("/search.json", queryParams);
}

export async function searchAuthors(searchQuery: string, limit = 10): Promise<OpenLibrarySearchResponse> {
  return get<OpenLibrarySearchResponse>("/search/authors.json", {
    q: searchQuery,
    limit,
  });
}

export async function getWork(workId: string): Promise<OpenLibraryWork> {
  const normalizedWorkId = workId
    .replace(/^\/*works\//i, "")
    .replace(/\.json$/i, "");
  return get<OpenLibraryWork>(`/works/${normalizedWorkId}.json`);
}

export async function getEdition(editionId: string): Promise<OpenLibraryEdition> {
  const normalizedEditionId = editionId
    .replace(/^\/*books\//i, "")
    .replace(/\.json$/i, "");
  return get<OpenLibraryEdition>(`/books/${normalizedEditionId}.json`);
}

export async function getByIsbn(isbn: string): Promise<OpenLibraryEdition> {
  return get<OpenLibraryEdition>(`/isbn/${encodeURIComponent(isbn)}.json`);
}

export async function getGoodreadsUrlByWorkKey(workKey: string): Promise<string | null> {
  const work = await getWork(workKey);
  const editionKey = work.cover_edition?.key;
  if (!editionKey)
    return null;
  const edition = await getEdition(editionKey);
  const goodreadsId = edition.identifiers?.goodreads?.[0];
  if (!goodreadsId)
    return null;
  return `${GOODREADS_BOOK_BASE}/${goodreadsId}`;
}

export function getGoodreadsSearchUrl(query: string): string {
  return `${GOODREADS_SEARCH_BASE}?q=${encodeURIComponent(query)}`;
}

export async function getCoverUrl(identifierType: CoverKey, identifierValue: string, size: CoverSize = "M"): Promise<string> {
  const coverKeyPath = identifierType.toLowerCase();
  const encodedIdentifier = encodeURIComponent(identifierValue);
  return `${OPENLIBRARY_COVERS_BASE}/b/${coverKeyPath}/${encodedIdentifier}-${size}.jpg`;
}

export async function getAuthorPhotoUrl(authorOlid: string, size: CoverSize = "M"): Promise<string> {
  const normalizedAuthorOlid = authorOlid
    .replace(/^\/?a\/?/i, "")
    .replace(/\.json$/i, "");
  return `${OPENLIBRARY_COVERS_BASE}/a/olid/${normalizedAuthorOlid}-${size}.jpg`;
}

export type {
  CoverKey,
  CoverSize,
  OpenLibrarySearchDoc,
  OpenLibrarySearchParams,
  OpenLibrarySearchResponse,
} from "./types";
