# Excel Cross-Locator: trust the localhost certificate (run as administrator, once per machine)
$ErrorActionPreference = 'Stop'

$cert = Get-ChildItem Cert:\CurrentUser\My |
    Where-Object { $_.DnsNameList -and ($_.DnsNameList.Unicode -contains 'localhost') -and $_.HasPrivateKey } |
    Select-Object -First 1
if (-not $cert) {
    Write-Host '[locator] No localhost certificate found.'
    Write-Host '[locator] Start the server once first (double-click Start-Server.bat), then run this again.'
    exit 1
}

$cerPath = Join-Path $env:TEMP 'cross-locator-localhost.cer'
try {
    Export-Certificate -Cert $cert -FilePath $cerPath -Type CERT | Out-Null
    Import-Certificate -FilePath $cerPath -CertStoreLocation Cert:\LocalMachine\Root | Out-Null
    Write-Host '[locator] Certificate trusted. Now run Start-Server.bat and install the add-in in Excel.'
}
finally {
    if (Test-Path $cerPath) { Remove-Item $cerPath -Force }
}
