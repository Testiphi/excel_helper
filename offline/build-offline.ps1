# Excel Cross-Locator: assemble the offline distribution zip
# Requires Node.js at BUILD time only (end users do not need it).
param(
    [string]$OutZip = "$PSScriptRoot\Excel-Cross-Locator-offline.zip"
)
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent

Set-Location $repo
Write-Host '[build] npm run build ...'
npm run build
if ($LASTEXITCODE -ne 0) { throw 'npm run build failed' }

$staging = Join-Path $env:TEMP ('cross-locator-pkg-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $staging | Out-Null
try {
    # copy build output (skip source maps to slim the package)
    Get-ChildItem (Join-Path $repo 'dist') -Exclude '*.map' | Copy-Item -Destination $staging -Recurse

    # offline manifest: point every URL at https://localhost:3000
    $manifest = Get-Content (Join-Path $repo 'manifest.xml') -Raw -Encoding UTF8
    $manifest = $manifest -replace 'https://Testiphi\.github\.io', 'https://localhost:3000'
    [IO.File]::WriteAllText(
        (Join-Path $staging 'manifest.xml'),
        $manifest,
        (New-Object Text.UTF8Encoding($false))
    )

    # shipping scripts
    foreach ($f in @('server.ps1', 'start-server.bat', 'trust-certificate.bat', 'trust-certificate.ps1', 'README.txt')) {
        Copy-Item (Join-Path $PSScriptRoot $f) -Destination $staging
    }

    if (Test-Path $OutZip) { Remove-Item $OutZip -Force }
    Compress-Archive -Path (Join-Path $staging '*') -DestinationPath $OutZip -CompressionLevel Optimal
    Write-Host "[build] OK: $OutZip"
}
finally {
    Remove-Item $staging -Recurse -Force -ErrorAction SilentlyContinue
}
