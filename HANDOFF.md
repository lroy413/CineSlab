# CineSlab — Session Handoff

_Last updated: 2026-08-05. Written so a fresh Claude session (cloud or local) or you-on-your-phone can pick up exactly where we left off._

---

## 1. What this is

**CineSlab** is a film/video pre-production & production companion app for indie creators (script, shot lists, call sheets, budgets, lighting, sun/moon, continuity, etc.). Parent company: **Concrete Films**.

- It ships as **ONE self-contained HTML file**: `slate-and-page_10.html` (~12,800 lines) — inline `<style>` + one big `<script>`. No build system, no `package.json`, **no Node installed on this Mac**, **not a git repo**.
- It's a local-first PWA. All data lives in the browser (IndexedDB via `window.storage`). Supabase is optional/off-by-default.
- **It is LIVE at https://cineslab.app** ✅

Read `CLAUDE.md` in this folder for the full architecture (state object, render loop, storage layer, hats/roles, sync). That's the authoritative code map.

---

## 2. ⚠️ MOST IMPORTANT: there are fixes NOT yet deployed

`slate-and-page_10.html` (source) and the `deploy/` folder contain several fixes that are **built but NOT yet live on cineslab.app**. The live site is still the very first upload (broken small icons, no mobile fixes). **The #1 next action is to re-deploy** (see §5).

The `deploy/` folder is already rebuilt and ready — it just needs to be uploaded.

---

## 3. Where things live / the "build"

- **Source of truth:** `slate-and-page_10.html` (edit this).
- **The "build" is one command:** `cp slate-and-page_10.html deploy/index.html` (Node isn't installed, so there's no bundler). After any edit to the HTML, run that to refresh the deploy copy.
- **`deploy/`** = the clean ship folder (only what goes public): `index.html`, `icon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon-180.png`, `og-image.png`, `manifest.webmanifest`, `_headers`.
- Root also has working files NOT meant to ship: `CLAUDE.md`, `titlePageSplitter.js` (reference only, not imported), `brand-directions.png`.

---

## 4. Hosting facts (Cloudflare)

- Hosted as a **Cloudflare Worker with static assets** named **`cineslab`** (also reachable at `cineslab.lroy413.workers.dev`).
- Custom domain **cineslab.app** is attached (DNS + TLS auto). Domain bought at Cloudflare Registrar.
- **Cloudflare account ID:** `bede02f9ab41bc90bae308430bccdea1` (Lroy413@gmail.com)
- **Zone ID (cineslab.app):** `c4f55e96d62d4cc0acf64e790dcf5382`
- The Cloudflare **MCP plugin** was authorized in the previous local session (`cloudflare-api__execute` etc.). A NEW session must re-authorize it (`/mcp` in an interactive `claude` terminal, or claude.ai connector settings). The MCP can manage DNS/domains/Workers but **cannot upload the ~718KB app bytes** (no file access + tool-arg limits) — so asset deploys are done via the Cloudflare dashboard.

---

## 5. How to deploy an update (do this to ship the pending fixes)

**No terminal / no Node needed — dashboard drag-and-drop:**

1. Run `cp slate-and-page_10.html deploy/index.html` first if you edited the HTML (a helper can do this).
2. Cloudflare dashboard → **Workers & Pages** → open the **`cineslab`** worker → find **Upload new version / Create deployment / Upload assets**.
3. Drag in the 8 files from the `deploy/` folder → deploy.
4. Verify: open https://cineslab.app (hard-refresh).

**Local preview before shipping:** `cd deploy && python3 -m http.server 8785` then open `http://127.0.0.1:8785/index.html`. (python3 IS available; node is not.)

---

## 6. Brand (locked)

- Name flows through `const APP_NAME = 'CineSlab'` at the top of the `<script>` (+ the static `<title>`). Internal IDs (IndexedDB name `slate-and-page`, filename) intentionally NOT renamed — changing them orphans saved data.
- **"Terrazzo" palette** (green hero + concrete texture): deep pine `#103A2C` (header/theme-color/manifest), button/accent `#2E9E6B`, dark-theme text accent `#5FC08E`, light-theme accent `#1C6E48`, terrazzo flecks `#C9A24B`/`#8FA69A`/`#E9E4D8`. The app UI (both light/dark `:root` blocks + header) is re-skinned to this.
- Icon = clapperboard/slate on green with a subtle troweled-plaster texture (SVG feTurbulence) + terrazzo flecks.

---

## 7. ✅ Done this session

Inline title-page splitter (Fountain front matter) wired into both import paths · new projects start with NO script (empty until created/imported) · first-script title-page seeding · rename Slate·Page → CineSlab · PWA manifest + icons + OG/Twitter meta · full green Terrazzo re-skin (light+dark) · deployed to Cloudflare + custom domain cineslab.app · Supabase Auth URL Configuration set to `https://cineslab.app` (Site URL + `https://cineslab.app/**` redirect).

---

## 8. 🔧 Built but PENDING DEPLOY (in `deploy/`, verify on device after shipping)

These are in the source + `deploy/` but NOT yet on the live site:

1. **Corrected app icons** — the 192px and 180px icons were mis-rendered (off-center/cropped) because headless Chrome renders badly at tiny sizes. Fixed by downscaling the good `icon-512.png` with `sips`. (After deploy, the home-screen icon on iPhone also needs **remove + re-add** — iOS caches home-screen icons.)
2. **Mobile safe-area (top)** — added `env(safe-area-inset-top)` to `header.slate` and `nav.rail` so the header buttons/drawer clear the iOS status bar/notch. (Bottom already had `safe-area-inset-bottom`.) ✅ user-confirmed the top is fixed.
3. **Swipe-to-close drawer** — `setupEdgeSwipe` now closes the drawer on a left-swipe when open (previously open-only).
4. **"Jump Back In" capped at 2** — was 4; `.slice(0, 2)` in `renderDashboard`.
5. **Bottom-nav floating fix (NEEDS iPhone TESTING)** — the fixed bottom tab bar floated up into content on scroll in the iOS standalone PWA (classic iOS `position:fixed` bug; could NOT be reproduced in a desktop browser). Fix = a **fixed-height app shell**: `render()` adds class `app-shell` to `#app` for the in-project view; mobile CSS makes `#app.app-shell{height:100dvh;overflow:hidden}`, `.layout{flex:1;overflow-y:auto}` (internal scroll), and the nav a normal flex child (not `position:fixed`). Home/settings screens don't get the class (they still body-scroll). `setupHeaderScrollGlass` updated to watch `.layout` scroll (capture). **This is unverified on a real iPhone — test the standalone PWA after deploy.**

---

## 9. 🐞 Still OUTSTANDING (reported from phone testing, NOT yet fixed)

1. **New Project wizard — checkbox spacing:** the checkbox sits flush against its label ("jumbled"). The rows are `<label class="qm-option"><input type=checkbox><span>…</span></label>` inside `.picker-list` in the wizard modal. Add/enforce a gap (e.g. `.modal .qm-option{gap:12px}` exists ~line 161 but isn't taking on the wizard's picker rows — investigate `.picker-list .qm-option` specificity; may need a rule + the span given `flex:1`).
2. **Wizard font small / lists not scrollable:** on a tall list (nav-tools step has 9+ items) the modal should cap height and scroll. Give the wizard step body (or `.picker-list`) a `max-height` + `overflow-y:auto`, and bump the option font-size on mobile.
3. **"Jump Back In" card icons look wrong/repetitive** — they use `iconForView()` which returns a DEPARTMENT icon, so several tools share the same camera icon. Consider per-tool icons or a single neutral icon.
4. **Home-screen app icon** still shows the OLD broken icon on the user's phone — will fix once §8.1 is deployed AND the user removes + re-adds to Home Screen (iOS icon cache).

---

## 10. Working from your phone — two paths

**A. Remote Control (this Mac stays on):** in an interactive `claude` terminal, `cd` to this folder and run `claude remote-control` → scan the QR with the Claude app → drive this exact machine/project from your phone. Needs Pro/Max + `/login`. (Note: the previous session's environment couldn't hot-load the plugin/`/reload-plugins`; a plain `claude` terminal works.)

**B. Cloud session (Claude Code on the web):** runs in a cloud sandbox **against a GitHub repo** — and this project is **NOT a git repo yet**. To use a cloud session you'd first need to `git init` here and push to GitHub, then start the cloud session on that repo. Upside: the cloud sandbox HAS Node, so `wrangler` deploys would work there. This handoff file should be committed so the cloud session sees it. If you don't want GitHub, use path A, or just paste this file's contents into a new session.

---

## 11. Suggested immediate next steps

1. **Deploy the pending fixes** (§5) — ships the icon fix + all mobile fixes.
2. **Test on the iPhone standalone PWA**: confirm the bottom nav no longer floats (§8.5), then remove + re-add the Home Screen icon to get the corrected icon.
3. **Fix the wizard** spacing + scroll + font (§9.1–9.2).
4. Optional: `www.cineslab.app` (attach as 2nd Workers custom domain or www→apex redirect); later — self-host CDN libs + Google Fonts for true offline, add a service worker; eventual refactor to ES modules + a real bundler.
