# ConnectKing

Connect-4 game server and injector.

## Structure

- `connect4_server/`: C++ server using Crow
- `connect4-launch/`: Injectors and launch scripts

## Requirements

- g++ or clang
- CMake
- libssl (for Crow)
- Node (if modifying inject.js)
- PowerShell / Bash (to run launcher)

## To build server

```bash
cd connect4_server
make
./main

## Install the Tampermonkey Script

1. Install the [Tampermonkey extension](https://www.tampermonkey.net/) for your browser.
2. Click [here to install the userscript](./connect4-launch/tampermonkey.user.js) or:
   - Open Tampermonkey dashboard → `Create New Script`
   - Paste the contents of `tampermonkey.user.js`
   - Save

This injects the Connect-4 AI UI when you visit `https://papergames.io/en/r/*`.

