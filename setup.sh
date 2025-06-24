#!/usr/bin/env bash
set -e

echo "Setting up ConnectKing..."

git submodule update --init --recursive

cd server
mkdir -p build
cd build
cmake ..
make

echo "Build complete. Run the server with ./connect4 from server/build"
