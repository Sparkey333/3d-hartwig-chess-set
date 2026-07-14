#!/usr/bin/env bash
# Build Neo Chess for this local Mac → DMG/ZIP into ./Downloads and ~/Downloads, then open.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="$(node -p "require('$ROOT/package.json').version")"
STAGE="$ROOT/release/mac-stage"
APP_NAME="Neo Chess"
APP_DIR="$STAGE/${APP_NAME}.app"
DMG_NAME="Neo-Chess-${VERSION}-mac.dmg"
ZIP_NAME="Neo-Chess-${VERSION}-mac.zip"
OUT_DIR="$ROOT/Downloads"
USER_DOWNLOADS="${HOME}/Downloads"

cd "$ROOT"
mkdir -p "$OUT_DIR" "$USER_DOWNLOADS"

echo "==> Building web assets (v${VERSION})…"
npm run build

echo "==> Staging macOS .app bundle…"
rm -rf "$STAGE" "$ROOT/release/dmg-build"
mkdir -p "$APP_DIR/Contents/MacOS" \
         "$APP_DIR/Contents/Resources/www" \
         "$ROOT/release/dmg-build"

cp -R "$ROOT/dist/." "$APP_DIR/Contents/Resources/www/"
cp "$ROOT/public/favicon.svg" "$APP_DIR/Contents/Resources/AppIcon.svg" 2>/dev/null || true

# Also ship landing + setup inside the web bundle
mkdir -p "$APP_DIR/Contents/Resources/www/landing" "$APP_DIR/Contents/Resources/www/setup"
cp -f "$ROOT/landing/index.html" "$APP_DIR/Contents/Resources/www/landing/index.html"
cp -f "$ROOT/landing/index.html" "$APP_DIR/Contents/Resources/www/setup/index.html"

cat > "$APP_DIR/Contents/MacOS/NeoChess" <<'LAUNCHER'
#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
WWW="$DIR/../Resources/www/index.html"
open "$WWW"
LAUNCHER
chmod +x "$APP_DIR/Contents/MacOS/NeoChess"

cat > "$APP_DIR/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key><string>Neo Chess</string>
  <key>CFBundleDisplayName</key><string>Neo Chess</string>
  <key>CFBundleIdentifier</key><string>app.neochess.desktop</string>
  <key>CFBundleVersion</key><string>${VERSION}</string>
  <key>CFBundleShortVersionString</key><string>${VERSION}</string>
  <key>CFBundleExecutable</key><string>NeoChess</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>LSMinimumSystemVersion</key><string>11.0</string>
  <key>NSHighResolutionCapable</key><true/>
</dict>
</plist>
PLIST

# Volume docs — Mac-local install + key URLs
cp "$ROOT/landing/index.html" "$ROOT/release/dmg-build/SETUP — Keys & Install.html"
cp "$ROOT/landing/index.html" "$ROOT/release/dmg-build/Open Landing Page.html"
cat > "$ROOT/release/dmg-build/README.txt" <<EOF
Neo Chess ${VERSION} — for THIS Mac
===================================

INSTALL (clear steps)
1. Open this DMG (double-click the .dmg in Downloads)
2. Drag "Neo Chess.app" into Applications
3. Eject the volume
4. Launch Applications → Neo Chess
   First open may need: right-click → Open (unsigned local build)

SETUP / API KEYS
Open "SETUP — Keys & Install.html" on this volume, or use the Setup tab in the app.

Higgsfield Cloud (primary AI keys):
  https://cloud.higgsfield.ai/
  https://docs.higgsfield.ai
  https://status.higgsfield.ai

OpenAI (optional fallback images):
  https://platform.openai.com/api-keys

Colorado / OTB:
  https://coloradochess.com/
  https://coloradochess.com/tournaments/view-upcoming/
  https://chesstournamentguide.com/events/state/co/
  https://new.uschess.org/
  https://new.uschess.org/msa/

Stack:
  https://stockfishchess.org/
  https://github.com/jhlywa/chess.js
  https://github.com/Clariity/react-chessboard
  https://github.com/higgsfield-ai/higgsfield-js

Local .env (for Premium live AI):
  HF_CREDENTIALS=KEY_ID:KEY_SECRET
  OPENAI_API_KEY=sk-...
  npm run dev

Rebuild package into Downloads:
  npm run pack:mac
  open ~/Downloads/Neo-Chess-${VERSION}-mac.dmg
EOF

cp -R "$APP_DIR" "$ROOT/release/dmg-build/"
ln -sfn /Applications "$ROOT/release/dmg-build/Applications" 2>/dev/null || true

DMG_PATH="$OUT_DIR/$DMG_NAME"
ZIP_PATH="$OUT_DIR/$ZIP_NAME"

echo "==> Creating DMG…"
genisoimage -V "Neo Chess" -D -R -apple -no-pad -o "$DMG_PATH" "$ROOT/release/dmg-build"

(
  cd "$ROOT/release/dmg-build"
  zip -qry "$ZIP_PATH" "Neo Chess.app" "README.txt" "SETUP — Keys & Install.html" "Open Landing Page.html"
)

# Embed downloads into app www + rebuild once so Mac offline app can re-download
mkdir -p "$APP_DIR/Contents/Resources/www/downloads"
cp -f "$DMG_PATH" "$APP_DIR/Contents/Resources/www/downloads/$DMG_NAME"
cp -f "$ZIP_PATH" "$APP_DIR/Contents/Resources/www/downloads/$ZIP_NAME"
rm -rf "$ROOT/release/dmg-build/${APP_NAME}.app"
cp -R "$APP_DIR" "$ROOT/release/dmg-build/"
genisoimage -V "Neo Chess" -D -R -apple -no-pad -o "$DMG_PATH" "$ROOT/release/dmg-build"
(
  cd "$ROOT/release/dmg-build"
  zip -qry "$ZIP_PATH" "Neo Chess.app" "README.txt" "SETUP — Keys & Install.html" "Open Landing Page.html"
)

# Landing for Downloads folder with same-directory links
python3 - <<PY
from pathlib import Path
src = Path("$ROOT/landing/index.html").read_text()
local = src.replace("../downloads/Neo-Chess-${VERSION}-mac.dmg", "Neo-Chess-${VERSION}-mac.dmg")
local = local.replace("../downloads/Neo-Chess-${VERSION}-mac.zip", "Neo-Chess-${VERSION}-mac.zip")
local = local.replace('href="/#setup"', 'href="SETUP — Keys & Install.html"')
local = local.replace('href="/"', 'href="SETUP — Keys & Install.html"')
Path("$OUT_DIR/Neo-Chess-Landing.html").write_text(local)
Path("$OUT_DIR/SETUP — Keys & Install.html").write_text(local)
Path("$ROOT/release/dmg-build/SETUP — Keys & Install.html").write_text(src)
PY

# Deliver to this Mac's Downloads locations
cp -f "$DMG_PATH" "$USER_DOWNLOADS/"
cp -f "$ZIP_PATH" "$USER_DOWNLOADS/"
cp -f "$OUT_DIR/Neo-Chess-Landing.html" "$USER_DOWNLOADS/"
cp -f "$OUT_DIR/SETUP — Keys & Install.html" "$USER_DOWNLOADS/"

mkdir -p "$ROOT/public/downloads" "$ROOT/dist/downloads" "$ROOT/public/landing" "$ROOT/public/setup" "$ROOT/dist/landing" "$ROOT/dist/setup"
cp -f "$DMG_PATH" "$ROOT/public/downloads/$DMG_NAME"
cp -f "$ZIP_PATH" "$ROOT/public/downloads/$ZIP_NAME"
cp -f "$DMG_PATH" "$ROOT/dist/downloads/$DMG_NAME"
cp -f "$ZIP_PATH" "$ROOT/dist/downloads/$ZIP_NAME"
cp -f "$ROOT/landing/index.html" "$ROOT/public/landing/index.html"
cp -f "$ROOT/landing/index.html" "$ROOT/public/setup/index.html"
cp -f "$ROOT/landing/index.html" "$ROOT/dist/landing/index.html"
cp -f "$ROOT/landing/index.html" "$ROOT/dist/setup/index.html"

# Refresh README in project Downloads
cat > "$OUT_DIR/README.md" <<EOF
# Neo Chess Downloads (this Mac)

| File | Action |
|------|--------|
| \`$DMG_NAME\` | Double-click to mount → install |
| \`$ZIP_NAME\` | Fallback unzip |
| \`Neo-Chess-Landing.html\` | Product + setup (same-folder download links) |
| \`SETUP — Keys & Install.html\` | Keys / steps / URLs |

Open the new DMG:
\`\`\`bash
open ~/Downloads/$DMG_NAME
\`\`\`

Key sites:
- https://cloud.higgsfield.ai/
- https://docs.higgsfield.ai
- https://platform.openai.com/api-keys
- https://coloradochess.com/
EOF

echo ""
echo "==> Opening DMG on this machine (Mac: opens Finder mount)…"
if command -v open >/dev/null 2>&1; then
  open "$USER_DOWNLOADS/$DMG_NAME" || open "$DMG_PATH" || true
  open "$USER_DOWNLOADS/SETUP — Keys & Install.html" || true
elif command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$DMG_PATH" >/dev/null 2>&1 || true
  xdg-open "$OUT_DIR/SETUP — Keys & Install.html" >/dev/null 2>&1 || true
fi

echo ""
echo "Done — Mac-local delivery"
echo "  DMG:     $DMG_PATH"
echo "  Also:    $USER_DOWNLOADS/$DMG_NAME"
echo "  Setup:   $USER_DOWNLOADS/SETUP — Keys & Install.html"
ls -lh "$DMG_PATH" "$ZIP_PATH" "$USER_DOWNLOADS/$DMG_NAME"
