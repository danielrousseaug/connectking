#!/usr/bin/env bash
set -euo pipefail

echo "Setting up ConnectKing..."

# Initialize git submodules if present
if [ -f .gitmodules ]; then
  echo "Initializing git submodules..."
  git submodule update --init --recursive
fi

# Build the C++ server
echo "Building server..."
pushd server > /dev/null
mkdir -p build
cd build
cmake .. -DCMAKE_BUILD_TYPE=Release
make
echo "Server build complete."
popd > /dev/null

echo "\nNext steps:"
echo "1. Install the Tampermonkey extension and load the userscript at client/inject/tampermonkey.user.js"
echo "2. Run the launch script to open the game: client/launch/launch_connect4.sh (or .ps1 on Windows)"
echo "3. Start the AI server: server/build/connect4"
echo "Enjoy!"
