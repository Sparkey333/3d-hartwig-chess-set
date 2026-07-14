# Neo Chess

A next-generation chess platform combining the best open-source chess libraries with innovative game modes, Stockfish analysis, local club discovery, and AI-powered premium features.

## Features

### Three Game Philosophies
- **Traditional** — Standard FIDE chess with classical time controls
- **Competition** — Chess960, Three-Check, King of the Hill, Atomic, Crazyhouse
- **Neo** — Pulse heat-map tactics, Fog of War vision, Gravity drift (visual)

### Built on Industry-Standard Libraries
- [chess.js](https://github.com/jhlywa/chess.js) — Move validation (used by Lichess & Chess.com)
- [react-chessboard](https://github.com/Clariity/react-chessboard) — Modern React board UI
- [Stockfish](https://stockfishchess.org/) — Open-source engine for AI opponents and analysis

### Clubs & Competitions
Find real OTB chess clubs and USCF-rated tournaments, with Colorado Springs as the default location. Data sourced from CSCA, Chess Tournament Guide, and local club listings.

### Premium AI (Higgsfield + alternatives)
- **Higgsfield** board themes / avatars / cinematic replay via server proxy (`/api/ai/*`)
- **Procedural** offline theme generator (no API key)
- **Curated** Hartwig-inspired skins (classic, marble, flat, wireframe, neo glass, …)

```bash
# Server-only credentials (never VITE_ — SDK blocks browsers)
# Get keys: https://cloud.higgsfield.ai
# Docs:     https://docs.higgsfield.ai
# SDK:      https://github.com/higgsfield-ai/higgsfield-js
# Status:   https://status.higgsfield.ai
export HF_CREDENTIALS="KEY_ID:KEY_SECRET"
npm run dev
```

### Local Mac packages (this machine only for now)

```bash
npm run pack:mac   # rebuild DMG/ZIP → ~/Downloads + open on macOS
npm run open:dmg   # open ~/Downloads/Neo-Chess-1.0.0-mac.dmg
```

In the app **Home** tab or `/landing/`: use **Refresh & open Mac DMG** (cache-busted download into this Mac’s Downloads, then open).

### Legacy
The original [3D Hartwig chess set](legacy/) by @JulianGarnier is preserved in `/legacy` and linked from the app footer (`/legacy/index.html`).

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

```bash
npm test          # Vitest unit tests
npm run build     # production build
npm run preview
```

## Mac desktop package

```bash
npm run pack:mac
```

Artifacts land in `Downloads/` and `public/downloads/`.

## Research Insights

Neo Chess addresses gaps identified in 2025 user feedback:
- **Lichess users** want clearer board customization and better mobile UX
- **Chess.com users** want unified opening explorers, time-odds, and less cluttered game review
- **Colorado players** lack a chess app with integrated local club/tournament discovery
- **Streamers** drove demand for viral variants (Fog of War, Duck Chess) — Neo modes are built for shareability

## License

MIT — see [LICENSE.txt](LICENSE.txt). Original 3D Hartwig chess set © Julian Garnier (MIT).
