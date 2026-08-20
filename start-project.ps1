$ErrorActionPreference = "Stop"

$ProjectRoot = $PSScriptRoot
$BackendPath = Join-Path $ProjectRoot "backend"
$FrontendPath = Join-Path $ProjectRoot "frontend"

$PrismaPort = 51213
$DatabasePort = 51214
$ShadowDatabasePort = 51215
$BackendPort = 5000
$FrontendPort = 5173
$PrismaName = "b2b-saas-dashboard"

function Test-Port {
    param(
        [int]$Port
    )

    $connection = Get-NetTCPConnection `
        -State Listen `
        -LocalPort $Port `
        -ErrorAction SilentlyContinue

    return $null -ne $connection
}

function Wait-ForPort {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 30
    )

    $startTime = Get-Date

    while (-not (Test-Port -Port $Port)) {
        Start-Sleep -Milliseconds 500

        if (
            ((Get-Date) - $startTime).TotalSeconds `
            -ge $TimeoutSeconds
        ) {
            return $false
        }
    }

    return $true
}

Write-Host ""
Write-Host "========================================"
Write-Host " B2B SaaS Dashboard starten"
Write-Host "========================================"
Write-Host ""

#
# 1. Prisma database
#

if (Test-Port -Port $DatabasePort) {
    Write-Host "[OK] Database draait al op poort $DatabasePort."
}
else {
    Write-Host "[START] Prisma database wordt gestart..."

    Push-Location $BackendPath

    try {
        npx prisma dev `
            --name $PrismaName `
            --port $PrismaPort `
            --db-port $DatabasePort `
            --shadow-db-port $ShadowDatabasePort `
            --detach
    }
    finally {
        Pop-Location
    }

    Write-Host "[WACHT] Wachten op database..."

    $DatabaseReady = Wait-ForPort `
        -Port $DatabasePort `
        -TimeoutSeconds 30

    if (-not $DatabaseReady) {
        Write-Host ""
        Write-Host "[FOUT] Database kon niet worden gestart."
        Write-Host ""
        Write-Host "Probeer handmatig:"
        Write-Host "cd backend"
        Write-Host "npx prisma dev ls"
        Write-Host ""

        Read-Host "Druk op Enter om af te sluiten"
        exit 1
    }

    Write-Host "[OK] Database draait op poort $DatabasePort."
}

#
# 2. Backend
#

if (Test-Port -Port $BackendPort) {
    Write-Host "[OK] Backend draait al op poort $BackendPort."
}
else {
    Write-Host "[START] Backend wordt gestart..."

    Start-Process powershell `
        -WorkingDirectory $BackendPath `
        -WindowStyle Minimized `
        -ArgumentList @(
            "-NoExit",
            "-Command",
            "npm run dev"
        )

    $BackendReady = Wait-ForPort `
        -Port $BackendPort `
        -TimeoutSeconds 30

    if (-not $BackendReady) {
        Write-Host ""
        Write-Host "[FOUT] Backend kon niet worden gestart."
        Read-Host "Druk op Enter om af te sluiten"
        exit 1
    }

    Write-Host "[OK] Backend draait op poort $BackendPort."
}

#
# 3. API-test
#

Write-Host "[CONTROLE] Databaseverbinding wordt via de API getest..."

$ApiWorking = $false

for ($attempt = 1; $attempt -le 10; $attempt++) {
    try {
        Invoke-RestMethod `
            -Uri "http://localhost:$BackendPort/api/stats" `
            -Method Get `
            -TimeoutSec 5 |
            Out-Null

        $ApiWorking = $true
        break
    }
    catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $ApiWorking) {
    Write-Host ""
    Write-Host "[FOUT] Backend draait, maar kan geen gegevens uit de database ophalen."
    Write-Host ""
    Write-Host "Controleer backend/.env."
    Write-Host "DATABASE_URL moet databasepoort $DatabasePort gebruiken."
    Write-Host ""

    Read-Host "Druk op Enter om af te sluiten"
    exit 1
}

Write-Host "[OK] Backend en database communiceren correct."

#
# 4. Frontend
#

if (Test-Port -Port $FrontendPort) {
    Write-Host "[OK] Frontend draait al op poort $FrontendPort."
}
else {
    Write-Host "[START] Frontend wordt gestart..."

    Start-Process powershell `
        -WorkingDirectory $FrontendPath `
        -WindowStyle Minimized `
        -ArgumentList @(
            "-NoExit",
            "-Command",
            "npm run dev -- --port 5173 --strictPort"
        )

    $FrontendReady = Wait-ForPort `
        -Port $FrontendPort `
        -TimeoutSeconds 30

    if (-not $FrontendReady) {
        Write-Host ""
        Write-Host "[FOUT] Frontend kon niet worden gestart."
        Read-Host "Druk op Enter om af te sluiten"
        exit 1
    }

    Write-Host "[OK] Frontend draait op poort $FrontendPort."
}

Write-Host ""
Write-Host "========================================"
Write-Host " Alles draait correct"
Write-Host "========================================"
Write-Host ""
Write-Host "Frontend: http://localhost:$FrontendPort"
Write-Host "Backend:  http://localhost:$BackendPort"
Write-Host "Database: localhost:$DatabasePort"
Write-Host ""

Start-Process "http://localhost:$FrontendPort"

Start-Sleep -Seconds 2