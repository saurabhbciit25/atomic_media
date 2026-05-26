# AtomicMedia - Set Vercel Environment Variables
# Run this script: Right-click -> Run with PowerShell
# Or from terminal: powershell -ExecutionPolicy Bypass -File set-vercel-env.ps1

Set-Location $PSScriptRoot

Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   Setting Vercel Environment Variables" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Remove existing env vars first (ignore errors if they don't exist)
$envVars = @(
    "MONGODB_URI",
    "JWT_SECRET",
    "JWT_EXPIRES_IN",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "NODE_ENV",
    "CLIENT_URL"
)

foreach ($var in $envVars) {
    Write-Host "  Removing old $var (if exists)..." -ForegroundColor DarkGray
    echo "" | npx vercel env rm $var production --yes 2>$null
}

Write-Host ""
Write-Host "Setting new environment variables..." -ForegroundColor Yellow
Write-Host ""

# Set each env var
Write-Host "  [1/8] MONGODB_URI..." -NoNewline
echo "mongodb://saurabhsharmasri_db_user:saurabh1234567890@ac-yk42meu-shard-00-00.kt9cezf.mongodb.net:27017,ac-yk42meu-shard-00-01.kt9cezf.mongodb.net:27017,ac-yk42meu-shard-00-02.kt9cezf.mongodb.net:27017/atomic_media?ssl=true&replicaSet=atlas-81bfjj-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0" | npx vercel env add MONGODB_URI production --yes
Write-Host " Done!" -ForegroundColor Green

Write-Host "  [2/8] JWT_SECRET..." -NoNewline
echo "atomic-media-local-dev-secret-change-before-production-7f6b1c2f4a8d" | npx vercel env add JWT_SECRET production --yes
Write-Host " Done!" -ForegroundColor Green

Write-Host "  [3/8] JWT_EXPIRES_IN..." -NoNewline
echo "7d" | npx vercel env add JWT_EXPIRES_IN production --yes
Write-Host " Done!" -ForegroundColor Green

Write-Host "  [4/8] CLOUDINARY_CLOUD_NAME..." -NoNewline
echo "dhbn4yupp" | npx vercel env add CLOUDINARY_CLOUD_NAME production --yes
Write-Host " Done!" -ForegroundColor Green

Write-Host "  [5/8] CLOUDINARY_API_KEY..." -NoNewline
echo "814918982911467" | npx vercel env add CLOUDINARY_API_KEY production --yes
Write-Host " Done!" -ForegroundColor Green

Write-Host "  [6/8] CLOUDINARY_API_SECRET..." -NoNewline
echo "akkwnjt1Cf7LK830UUgaUWeiWuY" | npx vercel env add CLOUDINARY_API_SECRET production --yes
Write-Host " Done!" -ForegroundColor Green

Write-Host "  [7/8] NODE_ENV..." -NoNewline
echo "production" | npx vercel env add NODE_ENV production --yes
Write-Host " Done!" -ForegroundColor Green

Write-Host "  [8/8] CLIENT_URL..." -NoNewline
echo "https://atomic-media-iota.vercel.app" | npx vercel env add CLIENT_URL production --yes
Write-Host " Done!" -ForegroundColor Green

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "   All environment variables set!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Now redeploying to production..." -ForegroundColor Yellow
Write-Host ""

npx vercel --prod --yes

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your site should be live at: https://atomic-media-iota.vercel.app" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
