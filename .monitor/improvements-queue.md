# Improvements Queue (apply on GO)

Ordered list of better methods/setups to apply after Google AI Studio work is reviewed.
**Status: WAITING FOR GO** — do not apply until user says GO.

## Priority 1 — Critical fixes

| # | Item | Current state | Better approach | Rationale |
|---|------|---------------|-----------------|-----------|
| 1 | **Broken HTML structure** | `index.html` has mismatched closing tags (`</div>` inside `<tbody>`, unclosed `<button>` tags) | Fix DOM nesting; validate with `html-validate` or tidy | Invalid HTML causes unpredictable layout/parsing across browsers |
| 2 | **Empty/minified bundle risk** | `scripts.min.js` is loaded in production; source is `app.js` + `libraries.js` | Add build step (esbuild/terser) or load `libraries.js` + `app.js` in dev | Prevents shipping stale or empty bundles |
| 3 | **WebKit-only transforms** | Uses `-webkit-transform` / `WebkitTransform` everywhere | Use standard `transform` with `-webkit-` prefix fallback | Enables Firefox/modern Chrome without vendor lock-in |
| 4 | **Missing `img/` in some checkouts** | Assets referenced but not always present | Ensure `img/` is tracked; add asset integrity check in CI | App breaks without textures |

## Priority 2 — Architecture & maintainability

| # | Item | Current state | Better approach | Rationale |
|---|------|---------------|-----------------|-----------|
| 5 | **jQuery 1.7.2 (2012)** | Full jQuery bundled only for `$("#container")` in Photon render | Replace with `document.querySelector` / `querySelectorAll` | Removes 150KB+ dependency for 2 lines |
| 6 | **Global mutable state** | 20+ globals (`chess`, `grabbed`, `mouseDown`, etc.) | Module pattern or ES modules with explicit state object | Easier testing, fewer race bugs |
| 7 | **Inline event handlers** | `onchange="toggleFrame(this)"` in HTML | `addEventListener` in `UI()` like other controls | Consistent pattern, CSP-friendly |
| 8 | **Magic numbers** | `sceneX=70`, `sceneY=90`, `3250` ms init delay | Named constants / config object | Self-documenting, tunable |
| 9 | **Photon re-render on resize** | `resetPoly()` debounced 250ms | `ResizeObserver` + requestAnimationFrame throttle | Smoother, less layout thrash |

## Priority 3 — UX & game logic

| # | Item | Current state | Better approach | Rationale |
|---|------|---------------|-----------------|-----------|
| 10 | **Hardcoded promotion to queen** | `promotion: 'q'` always | Promotion picker UI (already has `#promotion` div) | Correct chess rules |
| 11 | **No draw/stalemate UX** | Detected in `updateBoard` but not surfaced clearly | Dedicated end-game modal with result | Players don't see outcomes |
| 12 | **Touch vs mouse inconsistency** | `app.js` uses `app` listeners; minified uses `document` for selectstart | Unify on `app` element (newer fix) | Consistent drag behavior |
| 13 | **Accessibility** | No keyboard play, no ARIA | Square `tabindex`, arrow-key focus, `aria-label` on pieces | WCAG compliance |
| 14 | **README outdated** | Says "works only in webkit", CodePen link from 2012 | Update with live URL, browser support matrix, local dev instructions | Onboarding |

## Priority 4 — DevOps & project setup

| # | Item | Current state | Better approach | Rationale |
|---|------|---------------|-----------------|-----------|
| 15 | **No package.json** | Zero tooling | Add `package.json` with `serve`, `build`, `lint` scripts | Standard dev workflow |
| 16 | **No CI** | Manual-only verification | GitHub Actions: HTML validate + smoke test | Catch regressions |
| 17 | **HTTP font import** | `@import url(http://fonts.googleapis.com/...)` | HTTPS + `font-display: swap` + self-host fallback | Mixed content blocked on HTTPS |
| 18 | **CSS typo** | `swireframeg` in reset selector | Fix typo `strong` | Dead rule / copy-paste error |
| 19 | **License attribution** | MIT license present | Add `package.json` license field + preserve headers in build | Legal clarity |

## Priority 5 — Modern enhancements (post-stabilization)

| # | Item | Better approach | Notes |
|---|------|-----------------|-------|
| 20 | 3D rendering | CSS 3D → Three.js or Babylon.js for lighting/camera | Bigger lift; only if AI Studio goes this route |
| 21 | Chess engine | chess.js v1 → chess.js v2 or `@lichess-org/chessground` | Better API, TypeScript types |
| 22 | State persistence | `localStorage` for FEN + theme + undo stack | Resume games |
| 23 | PWA | `manifest.json` + service worker | Mobile install |
| 24 | TypeScript | Gradual migration starting with game logic | Type safety for move validation |

## AI Studio branch already addresses (skip on GO)

These items from the original queue are **already done** on `origin/cursor/neo-chess-app-9c2d`:

- ~~#5 jQuery removal~~ → React + no jQuery
- ~~#15 package.json~~ → Vite + npm scripts present
- ~~#14 README update~~ → Comprehensive Neo Chess README
- ~~#21 chess.js upgrade~~ → chess.js ^1.4.0
- ~~#20 3D rendering~~ → Intentionally replaced with react-chessboard (confirm with user)
- Legacy preserved → `/legacy/` directory (better than our #4 suggestion)

## Revised GO-phase queue (after merging AI Studio branch)

### Phase A — Verify & stabilize Neo Chess
| # | Item | Action |
|---|------|--------|
| A1 | Build verification | `npm install && npm run build` — fix any TS/build errors |
| A2 | Chess960 FEN generation | Fix `createGame()` / `enforce960Rules()` — currently broken placeholder |
| A3 | Stockfish worker | Test engine init; consider `stockfish.wasm` if stockfish.js fails |
| A4 | Variant move rules | Audit Atomic, Crazyhouse, Three-Check, KOTH logic in `chessEngine.ts` |
| A5 | Environment config | Align `.env.example` with `VITE_*` vars used in `higgsfield.ts` |

### Phase B — Quality & ops
| # | Item | Action |
|---|------|--------|
| B1 | Add CI | GitHub Actions: install, build, typecheck |
| B2 | Add tests | Vitest for `chessEngine.ts` move validation + variant FENs |
| B3 | Accessibility | Keyboard nav on board, ARIA labels, focus management |
| B4 | Error boundaries | React error boundary around ChessGame + engine failures |

### Phase C — Legacy path (if user wants both)
| # | Item | Action |
|---|------|--------|
| C1 | Legacy HTML fixes | Fix `index.html` nesting in `/legacy/` |
| C2 | Legacy webkit prefixes | Add standard `transform` fallbacks in `/legacy/js/app.js` |
| C3 | Legacy dev route | Serve `/legacy/index.html` at `/legacy` in Vite config |

### Phase D — Enhancements (optional)
| # | Item | Action |
|---|------|--------|
| D1 | State persistence | localStorage for game FEN + preferences |
| D2 | PWA manifest | Installable mobile app |
| D3 | 3D mode toggle | Optional link to legacy 3D Hartwig from Neo UI |
