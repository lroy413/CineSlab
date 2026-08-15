# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Slate · Page** is a film/video pre-production and production companion app for indie
creators (script writing, shot lists, call sheets, budgets, lighting diagrams, sun/moon
calc, continuity, and more). It ships as **a single self-contained HTML file**:
`slate-and-page_10.html` (~12,800 lines) — inline `<style>` and one big `<script>` IIFE.
There is no build system, no `package.json`, no test suite, and no git repo here.

**To run/test it:** open `slate-and-page_10.html` directly in a browser (or serve the
folder with any static server). Everything is client-side. To iterate, edit the HTML and
reload. External libraries load from CDNs at runtime (jsPDF + autotable for PDF export,
pdf.js for PDF import, mammoth for DOCX import, supabase-js for optional cloud, Google
Fonts), so PDF/DOCX/sync features degrade gracefully when offline.

`titlePageSplitter.js` is a **standalone ES module that is NOT imported by the app** — the
HTML has its own `extractTitlePage()`. Treat the `.js` file as a separate reference/scratch
module; changing it does not affect the app.

## Architecture

Single global `state` object (declared ~line 1267) holds everything: `projects[]`,
`currentProjectId`, the active project's `projectData`, `images`, current `view`, UI flags,
`profile`, auth/sync status, etc. The app is a hand-rolled render loop — **no framework**:

- `render()` (~line 5320) is the top-level entry. It reads `state` and rewrites the DOM
  (`innerHTML`), then re-attaches event handlers. Call `render()` after any state change
  that should show on screen.
- `renderMain(main)` (~line 6170) is a `state.view` → `render<Screen>(main)` dispatch table.
  Each tool/screen has its own `render*Home` / `render*Detail` function.
- Persist changes with `debouncedSaveProject()` (writes after 600ms) or `saveProjectData()`
  directly. Reference photos persist separately via `saveProjectImages()`.

**Navigation is data-driven** by `DEPARTMENTS` (~line 5513): an array of departments, each
with `tools` that carry a `view` id and visibility flags. Visibility is computed by
`isToolVisible()` from project `type`, `subtype`, `state.mode` (`'simple'` vs `'pro'`), and
the user's **hats** (see below). Adding a screen means: add a tool entry to `DEPARTMENTS`,
add a `state.view` case to `renderMain`, and write the render function.

### Storage layer (critical to understand before touching persistence)

All persistence goes through `window.storage` — an async `{get,set,delete,list}(key, shared)`
KV API. The Claude artifact host provides it; **`installStorageFallback()` (~line 908)
installs a drop-in replacement everywhere else**, trying IndexedDB → localStorage → in-memory
(chosen by probing actual writes, because private-browsing modes expose the APIs then throw).
`storage.get` **throws** for a missing key — that throw is load-bearing (means "not set").

Wrap all access through the helpers, never `window.storage` directly:
`storeGet` / `storeSet` / `storeDelete` (JSON-serialize, retry with backoff, swallow errors
to `null`/`false`). Keys: project data is `proj-<id>` (or `shared-proj-<code>` for shared),
images are `proj-images-<id>`. `dataKeyFor(proj)` / `imagesKeyFor(proj)` compute these.

### Data model & migrations

`emptyProjectData()` (~line 1302) defines the per-project shape (arrays: `scripts`,
`shotlists`, `callsheets`, `breakdown`, `shootDays`, `contacts`, `storyboards`, `tasks`,
`sides`, `continuity`, `directorNotes`, `moodboard`, `ideas`, `trash`, `episodes`, … plus
`meta`). **`normalizeProjectData()` (~line 1398) is the schema-upgrade path** — it runs on
every load, defaulting missing fields and migrating old shapes (e.g. single flat script →
`scripts[]`). `remapLegacyIds()` (~line 1340) is a one-time pass rewriting old 8-char ids to
real UUIDs (`uid()` = `crypto.randomUUID`). When you add a field to project data, add its
default in `normalizeProjectData` so old saved projects don't break. Deletions go through
`moveToTrash()` (soft delete, 14-day retention), not array splicing.

### Roles / "hats" and gating

A project records which **hats** the user wears (`director`, `producer`, `cinematographer`,
`editor`, `writer`, or `solo`). `projectHats()`, `unionForHats()`, and the `ROLE_UNLOCKS` /
`ROLE_QUICK_MENU` / `ROLE_GUIDE_TOPICS` maps drive which Pro tools appear in Simple mode,
the default quick-menu tabs, and Learn ordering. Hats only ever **add** visibility, never
remove baseline tools. `state.mode === 'pro'` shows everything.

### Cloud / auth / sync (optional, off by default)

Supabase is **optional and non-blocking** — the app fully works signed-out on local storage.
`SUPABASE_CONFIG` (~line 3800) holds the URL + publishable key (safe client-side; RLS
enforces access — never put a service_role key here). Sync is **manual and per-section**:
`SYNC_SECTIONS` (~line 3109) lists each tool as its own synced row so two people editing
different tools never conflict; `pushSections` / `pullSections` compare a cheap content hash
(`sectionHash`) against `sync-meta-<projId>` to only push changed sections. Shared-project
"permissions" (`admin`/`collaborator`/`viewer`) are **UI-level courtesy only**, keyed off the
self-typed profile name — not real auth. Never present them as security.

## Conventions

- All user-facing HTML built from strings must pass through `esc()` to avoid breaking markup
  and injection — do this for any interpolated user data.
- Native `prompt`/`confirm`/`alert` are blocked in the sandbox frame; use the async modal
  helpers `openPromptModal` / `openConfirmModal` / `openAlertModal` instead.
- Hard limits enforced in code: `MAX_PROJECTS = 5`, `MAX_SCRIPTS = 3` per project,
  `IMAGE_KEY_LIMIT = 5MB`. Respect these when adding create/duplicate/import paths.
- Section-banner comments (`/* ==== TITLE ==== */`) mark the ~60 major regions of the file;
  grep for a banner label to jump to a subsystem.
