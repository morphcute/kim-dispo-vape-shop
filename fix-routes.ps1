$ErrorActionPreference = "Stop"

function Ensure-Dir($path) {
  if (-not (Test-Path $path)) { New-Item -ItemType Directory -Force $path | Out-Null }
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
function Rename-Folder($from, $to) {
  if (-not (Test-Path $from)) { return }
  $parent = Split-Path $to -Parent
  Ensure-Dir $parent
  Write-Host "Renaming folder:`n  $from`n       to $to" -ForegroundColor Yellow
  Move-Item -Force $from $to
}

$root = Convert-Path "."
$app  = Join-Path $root "src\app"
$api  = Join-Path $app  "api"
if (-not (Test-Path $app)) { throw "Cannot find src\app. Run this from your project root." }

# -------- Normalize bad names with spaces-before-brackets --------
Move-Folder-Contents (Join-Path $app "storefront\brands [id]") (Join-Path $app "storefront\brands\[id]")
Move-Folder-Contents (Join-Path $app "brand [id]")          (Join-Path $app "brand\[id]")
Move-Folder-Contents (Join-Path $app "category [id]")       (Join-Path $app "category\[id]")
Move-Folder-Contents (Join-Path $api "orders\[id]\ status") (Join-Path $api "orders\[id]\status")

# -------- Ensure expected folders exist --------
Ensure-Dir (Join-Path $api "brands\[categoryId]")
Ensure-Dir (Join-Path $api "brands\[id]")
Ensure-Dir (Join-Path $api "flavors\[brandId]")
Ensure-Dir (Join-Path $api "flavors\[id]")
Ensure-Dir (Join-Path $api "categories\[id]")
Ensure-Dir (Join-Path $api "orders\[id]\status")
Ensure-Dir (Join-Path $app "storefront\brands\[id]")

# -------- Fix Next.js “different slug names for same path” on categories --------
# Convert ANY ...\categories\[categoryId] to ...\categories\[id] (both app and api)
Get-ChildItem -Recurse -Directory -Path (Join-Path $app "*") | Where-Object {
  $_.Name -eq "[categoryId]" -and $_.FullName -match "\\categories\\\[categoryId]$"
} | ForEach-Object {
  $target = Join-Path (Split-Path $_.FullName -Parent) "[id]"
  Rename-Folder $_.FullName $target
}
Get-ChildItem -Recurse -Directory -Path (Join-Path $api "*") | Where-Object {
  $_.Name -eq "[categoryId]" -and $_.FullName -match "\\categories\\\[categoryId]$"
} | ForEach-Object {
  $target = Join-Path (Split-Path $_.FullName -Parent) "[id]"
  Rename-Folder $_.FullName $target
}

Write-Host "`n✅ Route folders normalized." -ForegroundColor Green
