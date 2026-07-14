# Improvements Queue

**Status: APPLYING (phases A–D in progress / largely complete)**

## Completed this cycle

| Phase | Item | Status |
|-------|------|--------|
| A1 | Merge Neo Chess + build | ✅ merged `c8e21e5`, `npm run build` passes |
| A2 | Chess960 FEN generation | ✅ rewritten `generate960BackRank` + tests |
| A3 | Stockfish worker | ✅ kept CDN worker; engine init resilient |
| A4 | Variant rules | ✅ three-check, KOTH, atomic, crazyhouse reserves/drops |
| A5 | Env config | ✅ `HF_CREDENTIALS` server-only; `.env.example` fixed |
| B1 | CI | ✅ `.github/workflows/ci.yml` |
| B2 | Tests | ✅ Vitest for engine + themes (11 passing) |
| B3 | Accessibility | ✅ ARIA regions/live regions on game UI |
| B4 | Error boundaries | ✅ app + board boundaries |
| C1 | Legacy HTML | ✅ buttons/tbody/anchor fixes |
| C2 | Legacy transforms | ✅ standard `transform` + `-webkit-` |
| C3 | Legacy route | ✅ `/legacy` via public symlink + footer link |
| D1 | Persistence | ✅ localStorage prefs + last game FEN |
| D3 | 3D mode link | ✅ footer → legacy Hartwig |
| AI | Higgsfield upgrade | ✅ server proxy + FLUX themes/avatars/replay |
| AI | Alternatives | ✅ procedural + curated Hartwig-inspired skins |

## Remaining / follow-ups

| Item | Notes |
|------|--------|
| D2 PWA | Optional — add `manifest.json` + SW when packaging for mobile |
| Opening Lab | Still stubbed — needs richer history model |
| Puzzle gen | Still locked — needs puzzle seed pipeline |
| Production Higgsfield | Requires `HF_CREDENTIALS` on host; Vite proxy covers `dev`/`preview` only — add serverless for static hosts |
| Electron credentials | Pass `HF_*` into Electron main if desktop premium AI is required |
| Official Chess960 castling rights | Current FEN uses `-` castling; full 960 castling rights encoding is a follow-up |
