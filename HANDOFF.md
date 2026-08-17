# CineSlab — Session Handoff

_Last updated: 2026-08-05. Written so a fresh Claude session (cloud or local) or you-on-your-phone can pick up exactly where we left off._

---

## 1. What this is

**CineSlab** is a film/video pre-production & production companion app for indie creators (script, shot lists, call sheets, budgets, lighting, sun/moon, continuity, etc.). Parent company: **Concrete Films**.

- It ships as **ONE self-contained HTML file**: `slate-and-page_10.html` (~12,900 lines) — inline `<style>` + one big `<script>`. No build system, no `package.json`, **no Node installed on this Mac**.
- **It IS a git repo now** (as of 2026-08-15) — pushed to `github.com/lroy413/CineSlab`, default branch `main`. Cloud sessions work against it, and they have Node, so `wrangler` runs there.
- It's a local-first PWA. All data lives in the browser (IndexedDB via `window.storage`). Supabase is optional/off-by-default.
- **It is LIVE at https://cineslab.app** ✅

Read `CLAUDE.md` in this folder for the full architecture (state object, render loop, storage layer, hats/roles, sync). That's the authoritative code map.

`CAMERA-COMPANION.md` holds the product doc for the **second app** (CineSlab Camera Companion — an on-set camera app that syncs with CineSlab). **Phase 1 of it is built**, as `cineslab-cam.html`, a separate self-contained page; `slate-and-page_10.html` is untouched by it and CineSlab remains the Nov 15 priority. Read §7 of that doc for what works, what was deliberately left out, and what still needs testing on a real iPhone. Add camera-app ideas there rather than to this file.

---

## 2. ⚠️ MOST IMPORTANT: there are fixes NOT yet deployed

`slate-and-page_10.html` (source) contains fixes that are **built but NOT yet live on cineslab.app**. **The #1 next action is to re-deploy** (see §5).

**Corrected 2026-08-15** — the previous note here ("the live site is still the very first upload, broken icons, no mobile fixes") was wrong. The live site was measured against the source and the real delta is much smaller. Verified by fetching `https://cineslab.app` and diffing:

**Already live** (do NOT re-fix these):
- All 6 static assets are byte-identical to `deploy/` — `icon-192.png`, `apple-touch-icon-180.png`, `icon-512.png`, `og-image.png`, `icon.svg`, `manifest.webmanifest`. **The corrected icons shipped.** A phone still showing the old icon is the iOS home-screen icon cache — remove and re-add to Home Screen; no deploy will fix it.
- `env(safe-area-inset-top)` on `header.slate` / `nav.rail`.
- Swipe-to-close drawer.
- CineSlab branding and the Terrazzo re-skin.

**Genuinely not live** — only 25 differing lines, all in the HTML:
- The `#app.app-shell` CSS block + `app.className = 'app-shell' + …` (the iOS bottom-nav fix).
- `setupHeaderScrollGlass` reading `.layout` scrollTop with a capturing listener.
- "Jump Back In" `.slice(0, 4)` → `.slice(0, 2)`.

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

**Auto-deploy (added 2026-08-15):** `wrangler.toml` + `.github/workflows/deploy.yml` are in the repo. CI runs the `cp` build itself, which is why **`deploy/index.html` is now gitignored** — it is generated, never committed. (Your local copy still exists, so dashboard drag-and-drop keeps working; just run the `cp` first.)

One-time setup, not yet done:
1. Cloudflare → My Profile → API Tokens → **"Edit Cloudflare Workers"** template, scoped to the account + the `cineslab.app` zone.
2. GitHub → repo → Settings → Secrets and variables → Actions → new secret named `CLOUDFLARE_API_TOKEN`.

Then deploy from the **Actions** tab → "Deploy to Cloudflare" → Run workflow. It is deliberately `workflow_dispatch`-only while the mobile fixes are unverified; uncomment the `push:` trigger in the workflow to make every push to `main` ship automatically.

⚠️ `wrangler.toml` declares `routes = [{ pattern = "cineslab.app", custom_domain = true }]`. Keep that line — once you deploy via Wrangler the config file becomes authoritative, and dropping it can detach the custom domain that was attached through the dashboard.

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

## 9. 🐞 OUTSTANDING — status as of 2026-08-15

1. **Wizard checkbox spacing — COULD NOT REPRODUCE, hardened anyway.** Rendered the wizard in headless Chromium at a 390×844 iPhone viewport and measured the live DOM: computed gap was exactly **12px**, not flush. The specificity theory in the old note was wrong — `.modal .qm-option` (0,2,0) already beats `.modal label` (0,1,1). Note the wizard markup and CSS are **identical between the live site and source**, so this is not a stale-deploy symptom either; it is either iOS-Safari-specific or was misread on-device. Hardened defensively: `flex:0 0 20px` on the checkbox and `flex:1;min-width:0` on the span, so a native control with its own intrinsic metrics can't eat the gap. **Still unverified on real iOS.**
2. **Wizard font / scrolling — partly a non-issue, improved anyway.** `.picker-list` already had `max-height:50vh;overflow-y:auto`, and the 17-row nav-tools step measured as genuinely scrollable (scrollHeight 798 > clientHeight 420). Changed on mobile: option font 15px → **16px** (also stops iOS focus-zoom), row padding 13→15px, gap 12→14px, and `.modal .picker-list{max-height:min(50vh,340px)}` so Back/Next stay reachable on short screens.
3. **"Jump Back In" repetitive icons — FIXED.** Added `TOOL_ICONS`, a per-view map, consulted by `iconForView()` before the department fallback. All 23 tool views now resolve to distinct glyphs (verified programmatically: 23 views, 23 unique SVGs, 0 duplicates). This also fixes the **bottom tab bar**, which shares `iconForView` and could previously show two identical adjacent tabs. Bonus: `DEPT_ICONS.broll` (a filmstrip drawn specifically for B-Roll) was dead code — B-Roll sits in the Camera department, so it resolved to the camera glyph. Now wired up.
4. **Home-screen app icon** — not a deploy problem. The corrected icons are **already live** (see §2). Fix is purely on-device: remove the app from the Home Screen and re-add it to bust the iOS icon cache.

5. **Bottom nav missing in Shot Lists on iOS — addressed via the floating-nav redesign (2026-08-15).** Reported live on-device; did **not** reproduce in Chromium (bar measured on-screen at top 789 / bottom 844). Diagnosis: as the last flex child of `#app.app-shell{height:100dvh;overflow:hidden}`, the bar is clipped out of view whenever iOS resolves `100dvh` taller than the actually-visible area. The bar is now `position:fixed`, which resolves against the **visual viewport** instead of the shell's computed height, so it cannot fall below the fold. `position:fixed` was what caused the *original* drift bug, but that bug is a symptom of the **document** scrolling — inside `.app-shell` the document never scrolls (`.layout` scrolls internally), so fixed is safe here. The bar only ever renders in the in-project view, so the body-scrolling Home/Settings screens are unaffected.

6. **Floating glass nav (2026-08-15, new).** Inset 12px from the edges, 20px radius, translucent + `backdrop-filter: blur(18px) saturate(150%)`, behind an `@supports` guard with a solid fallback so labels stay legible where blur is unavailable. New tokens: `--nav-glass`, `--nav-glass-solid`, `--nav-glass-border`, `--nav-glass-shadow` in both themes. Shrinks to `scale(.93)` while scrolling and springs back 180ms after motion stops (`setupNavScrollShrink`); there is no `scrollend` on iOS Safari, so "stopped" is an idle timer each scroll tick pushes forward. Honors `prefers-reduced-motion`.
   - **Bug found and fixed while building this:** `main` is a flex item in `.layout{display:flex}`, so it was stretched to the container height while tall content overflowed its box — `padding-bottom` was trapped inside a box the content had already spilled past and reserved *nothing*. Content ran 68px under the bar. Fixed with `#app.app-shell main{align-self:flex-start}` so main sizes to its content. This bug predates the floating nav; the old opaque full-width bar simply hid the symptom.

7. **Horizontally scrollable nav with a raised Today button (2026-08-15, new).** Modelled on a reference screenshot the user supplied. The bar carries **every** tool the project shows and scrolls horizontally; Today sits dead centre as a 52px circular accent button, raised 35px above the flanking tabs. Page dots track scroll position and vanish when the bar fits.
   - **Design change to be aware of:** the wizard's "pick up to 5 nav tools" step no longer decides what *exists* in the bar — picks now flank Today closest (alternating outward) so they stay in thumb reach, with the rest further out. If that isn't wanted, revert `bottomTabsFor()` to the `quickMenuFor(proj)` list.
   - `overflow-x:auto` forces `overflow-y` to compute as `auto`, so the raised button can't spill outside the track. The taller home tab instead defines the flex line height and grows up into the track's top padding.
   - Two things this broke, both fixed: the bar's own horizontal scroll fired the shrink handler (swiping tabs shrank the bar under your thumb — scroll events from inside `.bottom-tabs` are now ignored); and the bar grew 55px → ~103px, overrunning the fixed 96px `main` reserved. Height is now measured and published as `--nav-h`, so clearance tracks tab count and label wrapping instead of drifting.

### Deploying from a cloud session
A Claude cloud session **can deploy without holding any credentials** — the GitHub MCP fires the `workflow_dispatch`, and `CLOUDFLARE_API_TOKEN` stays in GitHub secrets. Workflow id `335181471` / `deploy.yml` on `main`. Nothing needs to be added to the sandbox.

### Verification status
Everything above was checked in headless Chromium at an iPhone viewport. **No real-iOS testing was possible in a cloud sandbox.** The two items that specifically need a physical iPhone: the §8.5 bottom-nav app-shell fix, and whether the §9.1 checkbox hardening actually resolves what was seen on-device.

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
