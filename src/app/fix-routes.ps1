# fix-routes.ps1
# Run from your project root:  .\fix-routes.ps1
# This script normalizes Next.js dynamic route folders (no spaces before [id], proper nested status path, etc.)

$ErrorActionPreference = "Stop"

function Ensure-Dir($path) {
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Force $path | Out-Null
  }
}

function Move-Folder-Contents($from, $to) {
  if (-not (Test-Path $from)) { return }
  Ensure-Dir $to
  Write-Host "Moving contents:`n  from $from`n    to $to" -ForegroundColor Cyan
  Get-ChildItem $from -Force | ForEach-Object {
    Move-Item -Force -Path $_.FullName -Destination $to
  }
  Write-Host "Removing old folder: $from" -ForegroundColor DarkCyan
  Remove-Item -Recurse -Force $from
}

# ---- project root assumptions ----
$root = Convert-Path "."
$app  = Join-Path $root "src\app"
$api  = Join-Path $app  "api"

if (-not (Test-Path $app)) {
  throw "Cannot find src\app. Run this from your project root."
}

# --------- 1) storefront: brands [id] -> brands\[id] ----------
$bad = Join-Path $app "storefront\brands [id]"
$good = Join-Path $app "storefront\brands\[id]"
Move-Folder-Contents $bad $good

# --------- 2) brand [id] -> brand\[id] (top-level page) ----------
$bad = Join-Path $app "brand [id]"
$good = Join-Path $app "brand\[id]"
Move-Folder-Contents $bad $good

# --------- 3) category [id] -> category\[id] (top-level page) ----------
$bad = Join-Path $app "category [id]"
$good = Join-Path $app "category\[id]"
Move-Folder-Contents $bad $good

# --------- 4) api/orders/[id]\ status -> api/orders/[id]/status ----------
$bad = Join-Path $api "orders\[id]\ status"       # the incorrect path you had
$good = Join-Path $api "orders\[id]\status"
Move-Folder-Contents $bad $good

# --------- 5) sanity: make sure expected folders exist ----------
Ensure-Dir (Join-Path $api "brands\[categoryId]")
Ensure-Dir (Join-Path $api "brands\[id]")
Ensure-Dir (Join-Path $api "flavors\[brandId]")
Ensure-Dir (Join-Path $api "flavors\[id]")
Ensure-Dir (Join-Path $api "categories\[id]")
Ensure-Dir (Join-Path $api "orders\[id]\status")
Ensure-Dir (Join-Path $app "storefront\brands\[id]")

Write-Host "`n✅ Route folders normalized." -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1) Stop the dev server (if running)."
Write-Host "  2) Remove .next cache:  rd /s /q .next"
Write-Host "  3) Start again:        pnpm dev"
