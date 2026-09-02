# Excel Cross-Locator offline HTTPS static file server
# Pure Windows PowerShell (.NET), no Node.js required.
# Serves files from this script's directory over https://localhost:3000
# First-time setup: trust the certificate once via Trust-Certificate.bat (admin).

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$port = 3000
$certName = 'localhost'

function Get-OrCreate-Certificate {
    # remove expired localhost certs, then find or create a valid one
    Get-ChildItem Cert:\CurrentUser\My |
        Where-Object { $_.DnsNameList -and ($_.DnsNameList.Unicode -contains $certName) -and $_.HasPrivateKey -and $_.NotAfter -lt (Get-Date) } |
        ForEach-Object { Remove-Item $_ -Force }

    $existing = Get-ChildItem Cert:\CurrentUser\My |
        Where-Object { $_.DnsNameList -and ($_.DnsNameList.Unicode -contains $certName) -and $_.HasPrivateKey } |
        Select-Object -First 1
    if ($existing) { return $existing }

    $cert = New-SelfSignedCertificate -DnsName $certName `
        -CertStoreLocation 'Cert:\CurrentUser\My' `
        -NotAfter (Get-Date).AddYears(2) `
        -TextExtension @('2.5.29.37={text}1.3.6.1.5.5.7.3.1')
    Write-Host '[locator] A new localhost certificate was created.'
    Write-Host '[locator] If this is the first run, trust it once: right-click Trust-Certificate.bat -> Run as administrator'
    return $cert
}

function Send-Status($ssl, $code, $reason) {
    $head = "HTTP/1.1 $code $reason`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
    $bytes = [Text.Encoding]::ASCII.GetBytes($head)
    $ssl.Write($bytes, 0, $bytes.Length)
    $ssl.Flush()
}

function Send-File($ssl, $requestPath) {
    # strip query string (e.g. Office appends ?_host_Info=...) and fragment
    $path = $requestPath.Split('?')[0].Split('#')[0]
    $rel = $path.TrimStart('/')
    $rel = [Uri]::UnescapeDataString($rel).Replace('/', '\')
    if ($rel -eq '' -or $rel -match '\.\.' -or $rel -match '^[A-Za-z]:') {
        Send-Status $ssl 404 'Not Found'
        return
    }
    $full = Join-Path $root $rel
    if (Test-Path -LiteralPath $full -PathType Leaf) {
        $bytes = [IO.File]::ReadAllBytes($full)
        $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
        $map = @{
            '.html' = 'text/html; charset=utf-8'
            '.js'   = 'application/javascript; charset=utf-8'
            '.json' = 'application/json; charset=utf-8'
            '.css'  = 'text/css; charset=utf-8'
            '.png'  = 'image/png'
            '.ico'  = 'image/x-icon'
            '.svg'  = 'image/svg+xml'
            '.xml'  = 'application/xml; charset=utf-8'
            '.txt'  = 'text/plain; charset=utf-8'
            '.map'  = 'application/json; charset=utf-8'
        }
        $ct = $map[$ext]
        if (-not $ct) { $ct = 'application/octet-stream' }
        $head = "HTTP/1.1 200 OK`r`nContent-Type: $ct`r`nContent-Length: $($bytes.Length)`r`nConnection: close`r`n`r`n"
        $headBytes = [Text.Encoding]::ASCII.GetBytes($head)
        $ssl.Write($headBytes, 0, $headBytes.Length)
        $ssl.Write($bytes, 0, $bytes.Length)
        $ssl.Flush()
    }
    else {
        Send-Status $ssl 404 'Not Found'
    }
}

function Read-Line($stream) {
    $buf = New-Object byte[] 1
    $sb = New-Object Text.StringBuilder
    $prev = -1
    while ($true) {
        $n = $stream.Read($buf, 0, 1)
        if ($n -le 0) { return $null }
        $b = $buf[0]
        if ($prev -eq 13 -and $b -eq 10) { return $sb.ToString() }
        if ($b -ne 13 -and $b -ne 10) { [void]$sb.Append([char]$b) }
        $prev = $b
    }
}

function Handle-Client($client) {
    $ssl = $null
    try {
        $stream = $client.GetStream()
        $stream.ReadTimeout = 15000
        $ssl = New-Object Net.Security.SslStream($stream, $false)
        # .NET Framework 4.8 SslStream 不支持 TLS 1.3 协商，只提供 TLS 1.2
        $ssl.AuthenticateAsServer($cert, $false, [Net.SecurityProtocolType]::Tls12, $false)
        while ($true) {
            $requestLine = Read-Line $ssl
            if ($null -eq $requestLine) { break }
            if ($requestLine.StartsWith('GET ')) {
                $target = $requestLine.Split(' ')[1]
                # drain remaining headers
                while ($true) {
                    $header = Read-Line $ssl
                    if ($null -eq $header -or $header -eq '') { break }
                }
                Send-File $ssl $target
                break
            }
            else {
                Send-Status $ssl 400 'Bad Request'
                break
            }
        }
    }
    catch {
        Write-Host "[locator] client error: $($_.Exception.Message)"
    }
    finally {
        if ($ssl) { try { $ssl.Dispose() } catch { } }
        try { $client.Dispose() } catch { }
    }
}

$cert = Get-OrCreate-Certificate
Write-Host "[locator] certificate: $($cert.Thumbprint) (expires $($cert.NotAfter.ToString('yyyy-MM-dd')))"

# dual-stack listener: accept both 127.0.0.1 and ::1 (localhost may resolve to either)
$listener = New-Object Net.Sockets.TcpListener([Net.IPAddress]::IPv6Any, $port)
$listener.Server.DualMode = $true
$listener.Start()
Write-Host "[locator] Serving https://localhost:$port from $root"
Write-Host '[locator] Keep this window open while using the add-in. Ctrl+C to stop.'
while ($true) {
    try {
        $client = $listener.AcceptTcpClient()
        Handle-Client $client
    }
    catch {
        Write-Host "[locator] accept error: $($_.Exception.Message)"
    }
}
