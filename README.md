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

### Premium (Higgsfield AI)
- AI board skin generator
- Neo Coach game review
- Opening Lab AI
- Cinematic game replays
- AI opponent avatars

Set `HIGGSFIELD_API_KEY` to enable live AI generation.

### Legacy
The original [3D Hartwig chess set](legacy/) by @JulianGarnier is preserved in `/legacy`.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Research Insights

Neo Chess addresses gaps identified in 2025 user feedback:
- **Lichess users** want clearer board customization and better mobile UX
- **Chess.com users** want unified opening explorers, time-odds, and less cluttered game review
- **Colorado players** lack a chess app with integrated local club/tournament discovery
- **Streamers** drove demand for viral variants (Fog of War, Duck Chess) — Neo modes are built for shareability

## License

MIT — see [LICENSE.txt](LICENSE.txt). Original 3D Hartwig chess set © Julian Garnier (MIT).
