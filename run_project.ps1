# PowerShell script to run both Backend and Frontend in separate jobs or terminals
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   Starting Flash Flood Prediction System" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# Start Backend
Write-Host "[1/2] Launching FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$root'; .\venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"

# Start Frontend
Write-Host "[2/2] Launching React Vite Frontend on http://127.0.0.1:5173..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$root\react-frontend'; npm run dev"

Write-Host "`nBoth services are starting!" -ForegroundColor Yellow
Write-Host "Backend API:  http://127.0.0.1:8000" -ForegroundColor White
Write-Host "API Health:   http://127.0.0.1:8000/api/health" -ForegroundColor White
Write-Host "Swagger Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "Frontend App: http://127.0.0.1:5173" -ForegroundColor White
Write-Host "`nDefault Test Accounts:" -ForegroundColor Cyan
Write-Host "  User:  user@example.com / user123" -ForegroundColor White
Write-Host "  Admin: admin@example.com / admin123" -ForegroundColor White
Write-Host "  Gov:   gov@example.com / gov123" -ForegroundColor White
