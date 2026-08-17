# CineSlab Camera Companion — Product Handoff Doc

_Last updated: 2026-08-17. Living doc — add ideas here as they come up rather than losing them in chat._

**Status:** Idea stage, no build started. Not a priority until CineSlab (Nov 15 target) is polished.
**Ecosystem:** Second app under Concrete Films, same Supabase backend as CineSlab, single-file HTML architecture consistent with GEM / Oboros / Freedom Engine.
**Audience:** Learning/growing independent filmmakers, young adults and teens getting into film. Pro-grade depth, teaching-first UX.

> Related docs in this repo: `HANDOFF.md` (CineSlab session handoff — the app that must ship first), `CLAUDE.md` (CineSlab architecture map; this app is meant to follow the same conventions).

---

## 1. Vision

A mobile camera app that emulates professional cinema camera workflow (à la FiLMiC Pro / Blackmagic Cam) but built to *teach* while it shoots, and that talks directly to CineSlab so a shot planned in pre-production shows up ready to shoot on set.

Reference point: Sony FX6 monitor HUD — timecode, EI, iris, WB, waveform, battery-minutes-remaining, focus distance, zoom, LUT/"Look" indicator. That's the *data depth* to aim for. The *presentation* should be the opposite: clean by default, with HUD modules the user can add/remove/reposition rather than a fixed wall of data.

---

## 2. Core Feature Set

### 2.1 Capture / Camera Core

- Focal length simulation
  - Physical lens switching (ultra-wide/wide/tele) mapped to 35mm-equivalent labels (24mm, 35mm, 50mm, 85mm, etc.)
  - Digital crop + upscale for in-between values, clearly flagged as digital (not pretend it's optical)
- Manual controls: ISO/EI, shutter angle, white balance (Kelvin + tint), frame rate, aperture (where hardware allows)
- Slow shutter mode (intentional motion blur) and interval/time-lapse shooting mode (interval + duration controls, target-length calculator)
- **Time-lapse calculator** (standalone tool, usable pre-shoot or live):
  - Inputs: desired final clip length + playback frame rate, OR shoot duration + interval — solves for whichever is missing
  - Outputs: interval between frames, total shots needed, total shoot duration, estimated storage (based on resolution/codec), estimated battery draw
  - Presets for common subjects (clouds, sunset, star trails, construction/build) with suggested interval ranges
  - Warns if interval is too fast/slow for the subject type selected (e.g., 1s interval flagged as excessive for a multi-hour build sequence)
- Focus peaking, zebras, waveform, histogram — all toggleable HUD modules
- Focus distance readout (manual focus assist)
- Look/LUT preview indicator (live LUT applied to viewfinder, not baked into capture unless chosen)

### 2.2 HUD System (customizable, FX6-inspired)

- Modular overlay: user picks which readouts are visible (timecode, battery/min remaining, WB, EI, iris, waveform, audio meters, rec frame/border)
- Presets: "Minimal" (beginner), "Standard," "Full Pro" (FX6-style dense)
- Clean typography/positioning by default — no clutter unless user opts in

### 2.3 LUTs

- Built-in classic film-stock-inspired LUTs + a few original Concrete Films LUTs
- Import custom `.cube` LUTs
- LUT store (future monetization — phase 2+)
- "Look-matching" tool: generate a LUT from a reference still
  - **Legal note:** generating and *selling* LUTs derived directly from copyrighted movie frames is legally murky (derivative work risk), even with no literal image redistribution. Safer approach: build the look-matching engine using user-supplied or licensed/original reference images, and market results as "inspired by" aesthetics rather than tied to a specific film title. Get real legal review before the store goes live.

### 2.4 Camera Reports

- Auto-filling report per take: lens/focal length, ISO/EI, shutter, WB, timecode, LUT applied, scene/take/roll
- Exportable (PDF/CSV) for post team handoff

### 2.5 Teaching Layer

- Interactive tutorial per tool — live before/after preview (e.g., dragging shutter angle live-shows motion blur change), not static tooltips
- Glossary: shutter angle, ND, color temp, EI vs ISO, depth of field, etc.
- Learning section on real camera systems: Sony Venice, ARRI Alexa, RED, Blackmagic — specs, characteristic look, notable films shot on each
- Fundamentals section — visual, diagram-driven lessons (not just text) on:
  - **180-degree rule** — animated/diagram overlay showing the axis line, camera placement on either side, and a "wrong side" example clip to show the disorienting jump cut it causes
  - **Composition** — rule of thirds, headroom/lookroom, leading lines, framing, symmetry — with side-by-side "before/after" stills or short clips
  - **Aperture** — live depth-of-field preview tied to the f-stop slider (wide open vs. stopped down on the same subject), plus exposure triangle relationship to ISO/shutter
  - **Shutter speed / shutter angle** — including slow shutter for intentional motion blur (light trails, dreamlike movement) vs. the standard 180-degree rule for natural motion, with live before/after clips at different speeds
  - **Interval shooting / time-lapse** — what interval shooting is, how to set interval + total duration for a target final clip length, and common uses (sunrises/sunsets, clouds, construction/build sequences, star trails at night)
  - Room to expand later: shot sizes (ECU to EWS), camera movement basics, lighting setups (3-point, motivated, etc.)
- Toggle to hide "why this matters" explainers once a user is past needing them

### 2.6 CineSlab Sync (essential, cross-app)

- Pulls shot list from CineSlab: recommended focal length/framing per shot type (wide establishing, OTS, CU, etc.)
- Sun/moon lighting engine (already built in CineSlab) informs recommended shoot windows/call times
- Shared Supabase project/backend so shot data, camera reports, and script breakdown stay in sync

### 2.7 Additional Features (from brainstorm)

- Slate/clapperboard tool — auto-fills scene/take/roll from CineSlab's script breakdown
- Audio scratch track + sync markers for later conform in NLE
- Shot-matching / continuity flags — warns if focal length or WB drifts from the previous take in the same scene
- Export presets tuned for Premiere, Resolve, FCP so camera report metadata carries over cleanly
- Multi-camera sync capture (phase 3+, stretch) — two phones shooting the same scene, synced timecode

---

## 3. Phasing (suggested, not committed)

**Phase 1 — MVP**

- Manual controls, focal length sim, basic HUD (toggleable modules), classic LUTs + import
- Auto camera report generation
- Basic CineSlab shot-list pull (read-only)

**Phase 2 — Teaching + Depth**

- Interactive tutorials, glossary, camera systems learning section
- Look-matching LUT generator (own/licensed images only)
- Continuity flags, slate tool

**Phase 3 — Ecosystem + Monetization**

- LUT store
- Multi-camera sync
- Full bi-directional CineSlab sync (camera app can update shot status back to CineSlab)

---

## 4. Architecture Notes (carried over from CineSlab conventions)

- Single-file HTML app, Supabase backend, consistent with the rest of the Concrete Films suite
- Mobile-first build workflow: Claude Code cloud sessions + GitHub repo, same pattern as CineSlab
- Shared auth/collaborator model with CineSlab where relevant (same share-code pattern if projects overlap)

---

## 5. Open Questions to Resolve Before Building

- Exact focal length list and how digital crop is visually flagged to the user
- LUT store legal/licensing review (before Phase 3)
- How deep the "Full Pro" HUD preset should go vs. risking overwhelming the target teen/beginner audience
- Whether camera reports need cloud sync or can stay local-first with optional export

---

## 6. Feasibility flags to check before Phase 1 starts

Noted here so they're not discovered mid-build. None are blockers; they shape what "MVP" can honestly contain.

- **Single-file HTML on mobile web has real camera limits.** `getUserMedia` gives resolution and frame rate, and modern browsers expose some manual control via `MediaStreamTrack` constraints (`iso`, `exposureTime`, `whiteBalanceMode`, `focusDistance`, `zoom`) — but support is uneven, iOS Safari is the most restrictive, and true shutter *angle*, aperture, and log/flat capture generally are not reachable. Decide early whether Phase 1 ships as a PWA with honest "your device doesn't expose this" states, or whether the camera core needs a native shell.
- **LUT preview is fine; LUT bake-in is the expensive part.** Live `.cube` preview on the viewfinder is a WebGL shader over a video texture — cheap and very doable. Applying it to recorded footage at capture time is not; plan on preview-only for Phase 1 and treat baked export as its own chunk of work.
- **Timecode and multi-cam sync need a clock story.** Device clocks drift. Whatever "synced timecode" means in Phase 3 has to be defined (shared start marker? audio clap sync? NTP offset?) before it's promised in the feature list.
- **Time-lapse calculator is the cheapest high-value piece.** It's pure math plus presets — no camera API dependency at all. It could ship inside CineSlab itself well before the camera app exists, and it would validate the teaching-first UX with real users early.
