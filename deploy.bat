@echo off
echo ============================================
echo   CityAlert - Deploy to GitHub Pages
echo ============================================
echo.

:: Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
  echo ERROR: Git is not installed. Download from https://git-scm.com
  pause
  exit /b 1
)

:: Set your GitHub username here if different
set GITHUB_USER=JAGABAN
set REPO_NAME=smartcity
set REMOTE=https://github.com/%GITHUB_USER%/%REPO_NAME%.git

echo [1/5] Checking git repository...
if not exist ".git" (
  echo Initializing git repository...
  git init
  git branch -M main
)

echo.
echo [2/5] Setting remote origin...
git remote remove origin 2>nul
git remote add origin %REMOTE%
echo Remote set to: %REMOTE%

echo.
echo [3/5] Staging all files...
git add .

echo.
echo [4/5] Committing changes...
git commit -m "Deploy CityAlert Smart Security System" 2>nul || echo Nothing new to commit, continuing...

echo.
echo [5/5] Pushing to GitHub and deploying to GitHub Pages...
git push -u origin main --force
npm run deploy

echo.
echo ============================================
echo   DONE! Your app will be live at:
echo   https://%GITHUB_USER%.github.io/%REPO_NAME%/
echo ============================================
echo.
echo NOTE: GitHub Pages may take 1-2 minutes to go live.
echo       Go to: https://github.com/%GITHUB_USER%/%REPO_NAME%/settings/pages
echo       and make sure Source is set to "gh-pages" branch.
echo.
pause
