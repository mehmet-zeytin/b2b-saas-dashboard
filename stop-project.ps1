$ErrorActionPreference = "SilentlyContinue"

$ProjectRoot = $PSScriptRoot
$BackendPath = Join-Path $ProjectRoot "backend"

$BackendPort = 5000
$FrontendPort = 5173
$PrismaName = "b2b-saas-dashboard"

function Stop-PortProcess {
    param(
        [int]$Port
    )

    $connections = Get-NetTCPConnection `
        -LocalPort $Port `
        -ErrorAction SilentlyContinue

    $processIds =
        $connections |
        Select-Object -ExpandProperty OwningProcess -Unique

    foreach ($processId in $processIds) {
        if (
            $processId -and
            $processId -ne 0
        ) {
            Stop-Process `
                -Id $processId `
                -Force `
                -ErrorAction SilentlyContinue
        }
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host " B2B SaaS Dashboard stoppen"
Write-Host "========================================"
Write-Host ""

Write-Host "[STOP] Frontend..."
Stop-PortProcess -Port $FrontendPort

Write-Host "[STOP] Backend..."
Stop-PortProcess -Port $BackendPort

Write-Host "[STOP] Prisma database..."

Push-Location $BackendPath

try {
    npx prisma dev stop $PrismaName
}
catch {
}

Pop-Location

Write-Host ""
Write-Host "[OK] Project is gestopt."
Write-Host ""

Start-Sleep -Seconds 2