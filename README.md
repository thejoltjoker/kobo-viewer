# Kobo Companion

A web app to explore your [Kobo](https://www.kobo.com/) e-reader data in the browser. Upload your Kobo SQLite database file and browse your **word list** (lookups/highlights) and **bookmarks** with definitions from Wiktionary and book info from Open Library. All data stays in your browser; nothing is sent to a server.

## Features

- **Overview** — Upload and manage your Kobo database file (e.g. `KoboReader.sqlite`). Data is stored in IndexedDB so you can close the tab and return later.
- **Word list** — View and search words you’ve looked up or highlighted, with optional Wiktionary definitions.
- **Bookmarks** — Browse your saved bookmarks with context and optional Open Library metadata.

## Tech stack

- **Frontend:** React 19, Vite 7, Chakra UI 3, React Router 7, TanStack Query & Table
- **Database:** sql.js (SQLite in the browser), Drizzle ORM, IndexedDB for persistence
- **Deploy:** Cloudflare Workers (static assets + SPA fallback)

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (or npm/yarn)

## Getting started

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev
```

Open the URL shown (e.g. `http://localhost:5173`), then upload your Kobo database file from the Overview page. You can copy it from your device (typically `.kobo/KoboReader.sqlite`) or from a backup.

### Other scripts

| Command           | Description                    |
|------------------|--------------------------------|
| `pnpm build`     | Type-check and production build |
| `pnpm preview`   | Build and serve production build locally |
| `pnpm lint`      | Run ESLint                     |
| `pnpm lint:fix`  | Run ESLint with auto-fix       |
| `pnpm deploy`    | Build and deploy to Cloudflare |

## Releasing

- **Development:** Work on feature branches and merge into `dev`. Do not push directly to `main`.
- **Releasing:** (1) Open a PR from `dev` to `main` and merge it. (2) Release Please will open or update a "chore: release X.Y.Z" PR; merge that PR. (3) The tag and GitHub Release are created automatically.
- **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/) so Release Please can generate the changelog and version bump: `feat:` (minor), `fix:` (patch), and `BREAKING CHANGE` or `!` in the footer for major.
