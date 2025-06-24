#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------
# setup.sh for ConnectKing (portable)
# Ensures ASIO is available, builds server, and guides next steps
# ---------------------------------

echo "Setting up ConnectKing..."

# 1) Update submodules if configured (non-fatal on failure)
if [ -f .gitmodules ]; then
  echo "Updating git submodules..."
  git submodule update --init --recursive || echo "Warning: submodule update failed, continuing..."
fi

# 2) Ensure standalone ASIO headers are present
ASIO_DIR="server/external/asio"
ASIO_HEADER="$ASIO_DIR/asio/include/asio.hpp"
if [ ! -f "$ASIO_HEADER" ]; then
  echo "ASIO headers missing or invalid. Cloning standalone ASIO into '$ASIO_DIR'..."
  rm -rf "$ASIO_DIR"
  mkdir -p "$(dirname "$ASIO_DIR")"
  git clone --depth 1 https://github.com/chriskohlhoff/asio.git "$ASIO_DIR"
fi

echo "Building server..."
pushd server > /dev/null
mkdir -p build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make
popd > /dev/null

cat <<EOF

Build complete. Next steps:
1. Install the Tampermonkey extension and load the userscript at client/inject/tampermonkey.user.js
2. Run the launch script: client/launch/launch_connect4.sh (or .ps1 on Windows)
3. Start the AI server: server/build/connect4
EOF
