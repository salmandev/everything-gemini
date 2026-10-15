# Everything Antigravity (eagy) Installer for Windows PowerShell
param (
    [string]$Profile = "developer",
    [switch]$Global = $false,
    [string]$Workspace = ""
)

Write-Host "🪐 Everything Antigravity (eagy) Installer" -ForegroundColor Cyan
Write-Host "The premier agent harness & customization suite for Google Antigravity`n" -ForegroundColor Gray

if (-not (Test-Path "bin\eagy")) {
    Write-Host "Downloading latest eagy release..." -ForegroundColor Yellow
    $tempDir = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), [System.IO.Path]::GetRandomFileName())
    git clone --depth 1 https://github.com/salmanshaikh/eagy.git $tempDir
    Set-Location $tempDir
}

$cliArgs = @("install", "--profile", $Profile)
if ($Global) {
    $cliArgs += "--global"
}
if ($Workspace -ne "") {
    $cliArgs += @("--workspace", $Workspace)
}

node bin\eagy @cliArgs
