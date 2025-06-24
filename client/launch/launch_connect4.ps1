# Detect Chrome install
$chrome = "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $chrome)) {
    $chrome = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
}
if (-not (Test-Path $chrome)) {
    Write-Error "Chrome not found"; exit 1
}

# Throw-away profile so your main profile stays safe
$profileDir = "$env:TEMP\c4_profile"

# Absolute path to the extension folder
$extPath = (Resolve-Path "$PSScriptRoot\c4_inject").Path

Start-Process -FilePath $chrome `
    -ArgumentList @(
        "--disable-web-security",
        "--user-data-dir=`"$profileDir`"",
        "--load-extension=`"$extPath`"",
        "https://papergames.io/en/connect4"
    )

