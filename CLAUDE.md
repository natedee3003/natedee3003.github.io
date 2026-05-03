# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check + build (tsc -b && vite build)
pnpm lint         # ESLint
```

No test suite is configured.

## Architecture

Thai-language document generator for "รุ่งรัตน์สูท" (a tailor shop). Generates PDF invoices/quotes from a form and stores customer data in Firestore.

**Stack:** React 19 + TypeScript + Vite + pnpm. No CSS framework — styles use BEM class naming in `src/index.css`.

### Auth split

Auth is split across two files intentionally:
- `src/context/AuthContext.tsx` — defines the `AuthContext` and `useAuth()` hook
- `src/components/AuthContext.tsx` — defines `AuthProvider` (wraps `onAuthStateChanged`)

`App.tsx` wraps everything in `<AuthProvider>`, then `useAuth()` is consumed anywhere below.

### Firebase layer

- `src/servers/firebase.ts` — initializes Firebase app, exports `db` and `auth`
- `src/servers/firestoreService.ts` — all Firestore operations (customers CRUD + meta read/write)

The `meta/runningNumber` document tracks the monthly running number. **Always use `setDoc` with `{ merge: true }` to update it** — `updateDoc` will fail if the document doesn't exist yet (first use of the month).

### PDF generation

`DocumentPdf.tsx` uses `@react-pdf/renderer`. Thai text requires the Sarabun font, imported from `@fontsource/sarabun` using Vite's `?url` suffix:

```ts
import SarabunRegular from '@fontsource/sarabun/files/sarabun-thai-400-normal.woff?url';
```

`DocumentFormData` is defined in `DocumentPdf.tsx` and re-exported — it's the shared type used by both the form and the PDF renderer.

### Running number logic

On form mount, `DocumentForm` calls `getMeta()`. If no meta doc exists or the stored month differs from the current month, it resets the running number to 1. On submit, it increments `latestRunningNo` in Firestore before downloading the PDF.

### Schemas

`src/schemas/` contains TypeScript interfaces only — no runtime validation. Zod validation lives inline in `DocumentForm.tsx` via the `schema` constant.
