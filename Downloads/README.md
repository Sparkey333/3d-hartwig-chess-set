# Neo Chess Downloads (local Mac)

Generated packages — **always copied to `~/Downloads` on this Mac for now**.

| File | Purpose |
|------|---------|
| `Neo-Chess-1.0.0-mac.dmg` | macOS disk image — refresh & open after each pack |
| `Neo-Chess-1.0.0-mac.zip` | Same app + landing page (fallback) |
| `Neo-Chess-Landing.html` | Standalone setup page with key site links |

## Clear steps

```bash
npm install
npm run pack:mac      # builds, copies to ~/Downloads, opens DMG on macOS
npm run open:dmg      # re-open from ~/Downloads anytime
```

Or in the app / landing page: **Refresh & open Mac DMG**.

## Key sites

| Need | URL |
|------|-----|
| Higgsfield API keys | https://cloud.higgsfield.ai |
| Higgsfield docs | https://docs.higgsfield.ai |
| Higgsfield JS SDK | https://github.com/higgsfield-ai/higgsfield-js |
| Higgsfield status | https://status.higgsfield.ai |
| Stockfish | https://stockfishchess.org/ |
| chess.js | https://github.com/jhlywa/chess.js |
| react-chessboard | https://github.com/Clariity/react-chessboard |
| Vite | https://vite.dev/ |

```bash
export HF_CREDENTIALS="KEY_ID:KEY_SECRET"
npm run dev
```

**Note:** DMG is cross-built with `genisoimage` when packing from Linux. On first Mac open: right-click the app → **Open**.
