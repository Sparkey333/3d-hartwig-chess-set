#!/usr/bin/env bash
# Open the freshest Neo Chess DMG from this Mac's ~/Downloads (local workflow).
set -euo pipefail
VERSION="${npm_package_version:-1.0.0}"
DMG="${HOME}/Downloads/Neo-Chess-${VERSION}-mac.dmg"
ALT="$(cd "$(dirname "$0")/.." && pwd)/Downloads/Neo-Chess-${VERSION}-mac.dmg"

if [[ -f "$DMG" ]]; then
  echo "Opening $DMG"
  open "$DMG"
elif [[ -f "$ALT" ]]; then
  echo "Opening $ALT"
  open "$ALT"
else
  echo "DMG not found. Run: npm run pack:mac"
  exit 1
fi
