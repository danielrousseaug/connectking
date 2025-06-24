# ConnectKing

ConnectKing provides a simple C++ backend and a Tampermonkey userscript to play Connect-4 against a small AI. The script forwards the board state from [papergames.io](https://papergames.io/) to the local server which replies with the best move.

## Structure

```
client/             # Browser extension and launchers
  inject/           # Tampermonkey script & manifest
  launch/           # Chrome/Chromium launch scripts
server/             # C++ backend
  src/              # C++ sources (main.cpp, crow_all.h)
  makefile          # Optional Makefile
  CMakeLists.txt    # CMake build file
```

## Requirements

- C++17 compiler (g++ or clang)
- CMake and Make
- OpenSSL development libraries
- Bash or PowerShell to run the launch scripts

## Quick Start

```bash
./setup.sh       # fetch submodules and build the server
server/build/connect4 &
```

Then install the userscript and open the game:

1. Install the [Tampermonkey extension](https://www.tampermonkey.net/).
2. Load [`client/inject/tampermonkey.user.js`](client/inject/tampermonkey.user.js) in Tampermonkey.
3. Run `client/launch/launch_connect4.sh` (or the `.ps1` on Windows) to open the site with the extension loaded.

The script highlights the AI-suggested move on every turn.

