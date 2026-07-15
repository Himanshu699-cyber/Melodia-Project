param(
    [string]$Url,
    [string]$OutputPath
)

if (-not $Url -or -not $OutputPath) {
    Write-Error "Usage: .\scripts\fetch-stitch.ps1 -Url <url> -OutputPath <output_path>"
    exit 1
}

# Ensure destination directory exists
$dir = Split-Path -Path $OutputPath
if ($dir -and -not (Test-Path -Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

Write-Output "Initiating fetch for Stitch asset to $OutputPath..."
# Run curl.exe
& curl.exe -L -f -sS --connect-timeout 10 --compressed $Url -o $OutputPath

if ($LASTEXITCODE -eq 0) {
    Write-Output "✅ Successfully retrieved at: $OutputPath"
    exit 0
} else {
    Write-Error "❌ Error: Failed to retrieve content. Check TLS/SNI or URL expiration."
    exit 1
}
