# Create desktop shortcut: Open Excel with the locator tool
$ws = [Activator]::CreateInstance([Type]::GetTypeFromProgID('WScript.Shell'))
if ($null -eq $ws) {
  Write-Error 'Cannot create WScript.Shell COM object'
  exit 1
}
$desktop = [Environment]::GetFolderPath('Desktop')
$lnkPath = Join-Path $desktop 'Excel Locator.lnk'
$s = $ws.CreateShortcut($lnkPath)
$s.TargetPath = 'E:\hzz\work\excel_helper\excel-locator-addin\open-excel-with-tool.bat'
$s.WorkingDirectory = 'E:\hzz\work\excel_helper\excel-locator-addin'
$s.Description = 'Open Excel with the locator add-in service'
$s.Save()
if (Test-Path $lnkPath) {
  Write-Host "OK: $lnkPath"
} else {
  Write-Error 'Shortcut was not created'
  exit 1
}
