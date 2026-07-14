# Neo Chess Downloads

Generated Mac packages (also copied to `~/Downloads`):

| File | Purpose |
|------|---------|
| `Neo-Chess-1.0.0-mac.dmg` | macOS disk image — drag **Neo Chess.app** to Applications |
| `Neo-Chess-1.0.0-mac.zip` | Same app + landing page (recommended fallback) |
| `Neo-Chess-Landing.html` | Standalone product landing page with download links |

Regenerate:

```bash
npm run pack:mac
```

Web links (with `npm run dev` or after build):

- Landing: `/landing/` or **Home** tab
- DMG: `/downloads/Neo-Chess-1.0.0-mac.dmg`
- ZIP: `/downloads/Neo-Chess-1.0.0-mac.zip`

**Note:** This DMG is cross-built on Linux with `genisoimage`. On first Mac open: right-click the app → **Open**. Fully notarized Electron DMGs require a macOS build machine.
