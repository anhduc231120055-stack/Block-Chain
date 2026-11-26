@echo off
title Khoi dong He sinh thai Dynamic NFT
echo ========================================================
echo   DANG KHOI DONG HE THONG DYNAMIC NFT & GAMEFI ECOSYSTEM
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/4] Dang khoi dong Blockchain Node cuc bo (Hardhat)...
start "1. Hardhat Blockchain Node (Port 8545)" cmd /k "npx hardhat node"

echo Cho 5 giay de Node san sang...
timeout /t 5 /nobreak >nul

echo [2/4] Dang trien khai Smart Contracts, nap 1000 ETH va khoi tao Cho dNFT...
call npm run deploy:local
call npx hardhat run scripts/fund-user.ts --network localhost
call npx hardhat run scripts/seed-marketplace.ts --network localhost
call npx hardhat run scripts/add-level3-tokens.ts --network localhost

echo [3/4] Dang khoi dong Chainlink VRF Auto-Listener Daemon...
start "2. Chainlink VRF Daemon" cmd /k "npx hardhat run scripts/vrf-listener.ts --network localhost"

echo [4/4] Dang khoi dong Giao dien Web DApp (Next.js)...
start "3. Web DApp Frontend (Port 3000)" cmd /k "npm --prefix frontend run dev"

echo Cho 4 giay de Web san sang...
timeout /t 4 /nobreak >nul

echo Dang mo trinh duyet...
start http://localhost:3000

echo.
echo ========================================================
echo   HE THONG DA KHOI DONG THANH CONG!
echo   Dia chi web: http://localhost:3000
echo   Vi cua ban da duoc nap 1,000 ETH!
echo ========================================================
pause
