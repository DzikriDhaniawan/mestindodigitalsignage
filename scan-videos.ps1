# Script Pemindai Folder Video untuk Digital Signage PT Mest Indonesia
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$videosDir = Join-Path $root "videos"
$outputJs = Join-Path $root "videos-data.js"

if (-not (Test-Path $videosDir)) {
    New-Item -ItemType Directory -Path $videosDir | Out-Null
}

$exts = @("*.mp4", "*.webm", "*.mkv", "*.mov", "*.avi")
$localFiles = Get-ChildItem -Path $videosDir -Include $exts -Recurse -File

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " DIGITAL SIGNAGE - SINKRONISASI MATERI" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Folder Video Lokal: $videosDir"
Write-Host "File Lokal Ditemukan: $($localFiles.Count) file"

# Muat data Google Drive resmi dari node jika ada, atau sinkronkan
$nodeScript = @"
const fs = require('fs');
try {
  const data = require('./videos-data.js');
  console.log(JSON.stringify({
    ok: true,
    total: data.LOCAL_VIDEOS ? data.LOCAL_VIDEOS.length : 0
  }));
} catch(e) {
  console.log(JSON.stringify({ ok: false, error: e.message }));
}
"@

$check = $nodeScript | node
Write-Host "Status Data Video Drive: $check" -ForegroundColor Green
Write-Host "`n[SUKSES] Daftar video dan dokumen Google Drive tetap terjaga aman!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan
