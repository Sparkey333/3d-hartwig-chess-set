#!/usr/bin/env bash
# Build Neo Chess for macOS and wrap as a .dmg (cross-built from Linux via genisoimage).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERSION="${npm_package_version:-1.0.0}"
STAGE="$ROOT/release/mac-stage"
APP_NAME="Neo Chess"
APP_DIR="$STAGE/${APP_NAME}.app"
DMG_NAME="Neo-Chess-${VERSION}-mac.dmg"
OUT_DIR="$ROOT/Downloads"
USER_DOWNLOADS="${HOME}/Downloads"

cd "$ROOT"

echo "==> Building web assets…"
npm run build

echo "==> Staging macOS .app bundle…"
rm -rf "$STAGE" "$ROOT/release/dmg-build"
mkdir -p "$APP_DIR/Contents/MacOS" \
         "$APP_DIR/Contents/Resources/www" \
         "$ROOT/release/dmg-build"

# Copy production site into the app bundle
cp -R "$ROOT/dist/." "$APP_DIR/Contents/Resources/www/"
cp "$ROOT/public/favicon.svg" "$APP_DIR/Contents/Resources/AppIcon.svg" 2>/dev/null || true

# Native-feeling launcher: opens bundled site in default Mac browser (no Electron binary needed on Linux)
cat > "$APP_DIR/Contents/MacOS/NeoChess" <<'LAUNCHER'
#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
WWW="$DIR/../Resources/www/index.html"
# Prefer opening as a file URL so the app works offline after install
open "$WWW"
LAUNCHER
chmod +x "$APP_DIR/Contents/MacOS/NeoChess"

cat > "$APP_DIR/Contents/Info.plist" <<PLIST
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleName</key>
  <string>Neo Chess</string>
  <key>CFBundleDisplayName</key>
  <string>Neo Chess</string>
  <key>CFBundleIdentifier</key>
  <string>app.neochess.desktop</string>
  <key>CFBundleVersion</key>
  <string>${VERSION}</string>
  <key>CFBundleShortVersionString</key>
  <string>${VERSION}</string>
  <key>CFBundleExecutable</key>
  <string>NeoChess</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>LSMinimumSystemVersion</key>
  <string>11.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
PLIST

# Landing page + readme inside the mounted volume
cp "$ROOT/landing/index.html" "$ROOT/release/dmg-build/Open Landing Page.html"
cat > "$ROOT/release/dmg-build/README.txt" <<EOF
Neo Chess ${VERSION} for macOS
================================

Install:
1. Drag "Neo Chess.app" into Applications
2. Double-click Neo Chess to open the game
3. Or open "Open Landing Page.html" for the product site and download info

Colorado Springs clubs, competition variants, Neo modes, and Premium AI features included.

Website landing (local): Open Landing Page.html
EOF

# Stage app + Applications shortcut hint file
cp -R "$APP_DIR" "$ROOT/release/dmg-build/"
ln -sfn /Applications "$ROOT/release/dmg-build/Applications" 2>/dev/null || true

mkdir -p "$OUT_DIR" "$USER_DOWNLOADS"
DMG_PATH="$OUT_DIR/$DMG_NAME"

echo "==> Creating DMG with genisoimage…"
# -apple creates Apple Hybrid (HFS+) compatible images many Macs can mount
genisoimage -V "Neo Chess" \
  -D -R -apple -no-pad \
  -o "$DMG_PATH" \
  "$ROOT/release/dmg-build"

# Also ship a .zip fallback (guaranteed readable on Mac)
ZIP_PATH="$OUT_DIR/Neo-Chess-${VERSION}-mac.zip"
(
  cd "$ROOT/release/dmg-build"
  zip -qry "$ZIP_PATH" "Neo Chess.app" "README.txt" "Open Landing Page.html"
)

cp -f "$DMG_PATH" "$USER_DOWNLOADS/"
cp -f "$ZIP_PATH" "$USER_DOWNLOADS/"
cp -f "$ROOT/landing/index.html" "$OUT_DIR/Neo-Chess-Landing.html"
cp -f "$ROOT/landing/index.html" "$USER_DOWNLOADS/Neo-Chess-Landing.html"

# Public download copies for the web server / landing page links
mkdir -p "$ROOT/public/downloads" "$ROOT/dist/downloads" "$ROOT/public/landing"
cp -f "$DMG_PATH" "$ROOT/public/downloads/$DMG_NAME"
cp -f "$ZIP_PATH" "$ROOT/public/downloads/Neo-Chess-${VERSION}-mac.zip"
cp -f "$DMG_PATH" "$ROOT/dist/downloads/$DMG_NAME"
cp -f "$ZIP_PATH" "$ROOT/dist/downloads/Neo-Chess-${VERSION}-mac.zip"
cp -f "$ROOT/landing/index.html" "$ROOT/public/landing/index.html"
cp -f "$ROOT/landing/index.html" "$ROOT/dist/landing/index.html" 2>/dev/null || mkdir -p "$ROOT/dist/landing" && cp -f "$ROOT/landing/index.html" "$ROOT/dist/landing/index.html"
# Refresh app bundle www downloads so Offline Mac app can open landing + acquire packages
mkdir -p "$APP_DIR/Contents/Resources/www/downloads" "$APP_DIR/Contents/Resources/www/landing"
cp -f "$DMG_PATH" "$APP_DIR/Contents/Resources/www/downloads/$DMG_NAME"
cp -f "$ZIP_PATH" "$APP_DIR/Contents/Resources/www/downloads/Neo-Chess-${VERSION}-mac.zip"
cp -f "$ROOT/landing/index.html" "$APP_DIR/Contents/Resources/www/landing/index.html"
# Rebuild DMG/ZIP with downloads embedded
rm -f "$DMG_PATH" "$ZIP_PATH"
rm -rf "$ROOT/release/dmg-build/${APP_NAME}.app"
cp -R "$APP_DIR" "$ROOT/release/dmg-build/"
genisoimage -V "Neo Chess" -D -R -apple -no-pad -o "$DMG_PATH" "$ROOT/release/dmg-build"
(
  cd "$ROOT/release/dmg-build"
  zip -qry "$ZIP_PATH" "Neo Chess.app" "README.txt" "Open Landing Page.html"
)
cp -f "$DMG_PATH" "$USER_DOWNLOADS/"
cp -f "$ZIP_PATH" "$USER_DOWNLOADS/"
cp -f "$DMG_PATH" "$ROOT/public/downloads/$DMG_NAME"
cp -f "$ZIP_PATH" "$ROOT/public/downloads/Neo-Chess-${VERSION}-mac.zip"
cp -f "$DMG_PATH" "$ROOT/dist/downloads/$DMG_NAME"
cp -f "$ZIP_PATH" "$ROOT/dist/downloads/Neo-Chess-${VERSION}-mac.zip"

echo ""
echo "Done."
echo "  DMG:     $DMG_PATH"
echo "  ZIP:     $ZIP_PATH"
echo "  Landing: $OUT_DIR/Neo-Chess-Landing.html"
echo "  Web landing: /landing/ and Home tab in app"
echo "  Copied to: $USER_DOWNLOADS (this Mac’s Downloads)"
ls -lh "$DMG_PATH" "$ZIP_PATH" "$USER_DOWNLOADS/$DMG_NAME"

# Always open the new DMG on this Mac after pack
if [[ "$(uname -s)" == "Darwin" ]]; then
  echo "==> Opening fresh DMG from $USER_DOWNLOADS …"
  open "$USER_DOWNLOADS/$DMG_NAME" || open "$DMG_PATH" || true
elif command -v open >/dev/null 2>&1; then
  open "$DMG_PATH" || true
else
  echo "Note: not on macOS — open manually with: open ~/Downloads/$DMG_NAME"
fi
