#!/usr/bin/env bash
set -e

# Pick a Chrome binary
if command -v google-chrome >/dev/null 2>&1; then
    CHROME=google-chrome
elif command -v chromium-browser >/dev/null 2>&1; then
    CHROME=chromium-browser
elif command -v /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome; then
    CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
else
    echo "Chrome/Chromium not found"; exit 1
fi

PROFILE="/tmp/c4_profile"
EXT="$(realpath "$(dirname "$0")/c4_inject")"

"$CHROME" \
  --disable-web-security \
  --user-data-dir="$PROFILE" \
  --load-extension="$EXT" \
  "https://papergames.io/en/connect4" &

