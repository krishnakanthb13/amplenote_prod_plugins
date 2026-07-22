@echo off
setlocal

:: ============================================================================
:: REPO MANAGEMENT SOURCE OF TRUTH (V11 - PS Check Fix + Fallback Hardening)
:: ============================================================================
:: Changes from V9:
::  - All temp files moved to %TEMP% (prevents OneDrive sync lock)
::  - README update delegated to a .ps1 helper (prevents CMD 8191-char limit crash)
::  - Git credential prompts suppressed (GIT_TERMINAL_PROMPT=0)
::  - Empty-repo detection fixed (checks for HEAD ref, not just any line)
::  - Cleanup now also removes stale .gitmodules + .git/config entries
::  - Branch read uses for /f instead of set /p (handles special chars)
::  - Folder deletion verified before git submodule add
::  - Git-inside-work-tree check added at startup
::  - URL validated to HTTPS GitHub format
::  - Mode selection fallthrough fixed
::  - Detached HEAD detected before push (safe error instead of silent failure)
::  - Parallel update with -j 4
::  - V11: PS availability check simplified (inline if() was unreliable)
::  - V11: URL validation findstr quote-parse bug fixed (^" caused >nul to be treated as filename)
::  - V11: --recursive scoped to new submodule (initializes nested submodules safely)
::  - V11: README fallback section guard added

echo ========================================
echo   GitHub Submodule Setup Utility (V11)
echo ========================================

:: --- DEFINE TEMP FILE PATHS (in %TEMP% so OneDrive never touches them) ---
set "TMP_HEADS=%TEMP%\anp_submod_heads.txt"
set "TMP_BRANCH=%TEMP%\anp_submod_branch.txt"
set "TMP_COUNT=%TEMP%\anp_submod_count.txt"
set "TMP_PS=%TEMP%\anp_submod_readme.ps1"

:: --- STARTUP CLEANUP ---
if exist "%TMP_HEADS%"  del "%TMP_HEADS%"  >nul 2>&1
if exist "%TMP_BRANCH%" del "%TMP_BRANCH%" >nul 2>&1
if exist "%TMP_COUNT%"  del "%TMP_COUNT%"  >nul 2>&1
if exist "%TMP_PS%"     del "%TMP_PS%"     >nul 2>&1

:: --- PREREQUISITE: Must be inside a Git repository ---
git rev-parse --is-inside-work-tree >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] This script must be run from inside a Git repository.
    pause
    exit /b 1
)

:: --- PREREQUISITE: Git must be installed ---
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git and try again.
    pause
    exit /b 1
)

:: --- PREREQUISITE: Check for PowerShell (simple invocation test, most reliable) ---
set "powershell_available=0"
powershell -NoProfile -Command "exit 0" >nul 2>&1
if %ERRORLEVEL% EQU 0 set "powershell_available=1"

:: --- Suppress Git credential prompts so the script never hangs waiting for input ---
set "GIT_TERMINAL_PROMPT=0"

:: --- MODE SELECTION ---
echo.
echo Select an action:
echo [1] Link a new public repository (Add Submodule)
echo [2] Update existing submodules to their latest versions online
echo.
set /p mode="Enter choice (1 or 2, default is 1): "
if "%mode%"=="" set "mode=1"

if "%mode%"=="2" goto UPDATE_REPOS
if "%mode%"=="1" goto INPUT_URL
echo Invalid choice. Defaulting to Option 1.
goto INPUT_URL

:: ============================================================================
:: OPTION 1 - ADD A NEW SUBMODULE
:: ============================================================================

:INPUT_URL
set "repo_url="
set /p repo_url="Enter the Public GitHub Repo URL: "
if "%repo_url%"=="" (
    echo [ERROR] URL cannot be empty.
    goto INPUT_URL
)

:: --- VALIDATE: Must be a HTTPS GitHub URL ---
echo %repo_url% | findstr /R "^https://github\.com/" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Invalid URL. Only HTTPS GitHub URLs are supported.
    echo Example: https://github.com/user/repo-name
    goto INPUT_URL
)

:: --- REPO NAME EXTRACTION ---
for %%F in ("%repo_url%") do set "repo_name=%%~nF"

if "%repo_name%"=="" (
    echo [ERROR] Could not extract repository name from URL.
    goto INPUT_URL
)

:: --- SUMMARY ^& CONFIRMATION ---
echo.
echo [PENDING ACTION]
echo 1. Clean environment (removes any old/broken links to this repo)
echo 2. Link to: %repo_url%
echo 3. Initialize ^& Update Submodule
echo 4. Commit and Push to current branch
echo.

set /p confirm="Proceed with setup? (Y/N): "
if /I "%confirm%" NEQ "Y" (
    echo Setup cancelled by user.
    pause
    exit /b
)

:: --- CLEANING SECTION ---
echo.
echo Status: Cleaning environment for "%repo_name%"...

:: 1. Remove from Git index only if present (suppress "pathspec not found" error)
git ls-files --error-unmatch "%repo_name%" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    git rm -r --cached "%repo_name%" >nul 2>&1
)

:: 2. Remove stale entry from .gitmodules
if exist ".gitmodules" (
    git config --file .gitmodules --remove-section "submodule.%repo_name%" >nul 2>&1
)

:: 3. Remove stale entry from .git/config
git config --remove-section "submodule.%repo_name%" >nul 2>&1

:: 4. Remove internal Git history cached in .git/modules
if exist ".git\modules\%repo_name%" (
    echo Status: Removing old cached git data...
    attrib -R /S /D ".git\modules\%repo_name%\*" >nul 2>&1
    rmdir /s /q ".git\modules\%repo_name%" >nul 2>&1
)

:: 5. Remove the physical folder from disk
if exist "%repo_name%\" (
    echo Status: Removing existing folder "%repo_name%"...
    attrib -R /S /D "%repo_name%\*" >nul 2>&1
    rmdir /s /q "%repo_name%"

    :: Verify deletion actually succeeded before git submodule add runs
    if exist "%repo_name%\" (
        echo.
        echo [ERROR] Could not delete folder "%repo_name%".
        echo It might be open in another program / terminal.
        echo Please close it and try again.
        pause
        exit /b 1
    )
)

:: --- EMPTY REPO DETECTION ^& AUTO-SEED ---
echo.
echo Status: Checking remote repository state...
git ls-remote "%repo_url%" > "%TMP_HEADS%" 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "%TMP_HEADS%" del "%TMP_HEADS%"
    echo.
    echo [ERROR] Cannot reach repository "%repo_url%".
    echo It may be private, non-existent, or your network/credentials are blocking access.
    pause
    exit /b 1
)

:: Check for a HEAD ref - empty repo has no HEAD, non-empty always does.
findstr /C:"HEAD" "%TMP_HEADS%" >nul
if %ERRORLEVEL% EQU 0 (
    set "repo_empty=0"
) else (
    set "repo_empty=1"
)
if exist "%TMP_HEADS%" del "%TMP_HEADS%"

if "%repo_empty%"=="0" goto SKIP_SEED

echo Status: Remote is EMPTY. Auto-seeding an initial commit...
git clone "%repo_url%" "%repo_name%__seed"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to clone "%repo_url%" for seeding.
    if exist "%repo_name%__seed\" rmdir /s /q "%repo_name%__seed"
    pause
    exit /b 1
)
pushd "%repo_name%__seed"
git symbolic-ref HEAD refs/heads/main
echo # %repo_name% > README.md
echo. >> README.md
echo Initial commit auto-created by the Submodule Setup Utility. >> README.md
git add README.md
git commit -m "Initial commit (auto-seeded by submodule setup utility)"
git push -u origin main
set "seed_err=%ERRORLEVEL%"
popd
rmdir /s /q "%repo_name%__seed"
if not "%seed_err%"=="0" (
    echo.
    echo [ERROR] Failed to push the seed commit to "%repo_url%".
    echo Check that you have write/push access to this repository.
    pause
    exit /b 1
)
echo Status: Seed commit pushed to 'main'. Remote is now ready to link.
:SKIP_SEED

:: --- ACTION SECTION ---
echo.
echo Status: Adding submodule...
git submodule add -f "%repo_url%" "%repo_name%"
set "add_err=%ERRORLEVEL%"

if "%add_err%" NEQ "0" (
    findstr /C:"%repo_name%" .gitmodules >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo Status: Submodule already in .gitmodules but not in index. Force-registering...
        git submodule add -f "%repo_url%" "%repo_name%" >nul 2>&1
        if %ERRORLEVEL% NEQ 0 (
            echo.
            echo [ERROR] Git failed to register the existing submodule folder.
            echo Please close any programs using "%repo_name%" and try again.
            pause
            exit /b 1
        )
    ) else (
        echo.
        echo [ERROR] Git failed to add the submodule.
        echo The remote was reachable, so this is likely a local Git state issue.
        echo Try running this script again.
        pause
        exit /b 1
    )
)

:: Download files - scoped to ONLY this submodule. --recursive is included
:: so nested submodules (if any) also initialize, but the -- path scope
:: prevents unrelated broken submodules from blocking this operation.
echo.
echo Status: Initializing and updating...
git submodule update --init --recursive -- "%repo_name%"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Git failed during the submodule update process.
    pause
    exit /b 1
)

:: --- DOCUMENTATION AUTO-GEN ---
echo.
echo Status: Updating documentation...
if not exist README.md (
    echo # Project Overview > README.md
    echo This is a private repository containing public submodules. >> README.md
    echo. >> README.md
    echo ## Submodules >> README.md
    echo. >> README.md
    echo ### Submodule History >> README.md
)

:: Check for duplicate using exact URL match (avoids substring collision e.g. repo vs repo2)
findstr /C:"%repo_url%" README.md >nul
if %ERRORLEVEL% EQU 0 goto SKIP_README_APPEND

:: Write the README update logic to a .ps1 helper file.
:: This avoids: (1) CMD 8191-char line limit, (2) OneDrive file-lock on inline PS,
:: (3) special-char quoting nightmares in the CMD shell.
if "%powershell_available%"=="1" (
    set "ENTRY_NAME=%repo_name%"
    set "ENTRY_URL=%repo_url%"
    (
        echo $p = 'README.md'
        echo $name = $env:ENTRY_NAME
        echo $url  = $env:ENTRY_URL
        echo $date = Get-Date -Format 'dd-MM-yyyy'
        echo $entry = '- [' + $name + '](' + $url + ') added on ' + $date
        echo $content = Get-Content -LiteralPath $p -Raw -Encoding UTF8
        echo $target = '### Submodule History'
        echo if ^($content.Contains^($target^)^) {
        echo     $replacement = $target + "`r`n" + $entry
        echo     $newContent = $content.Replace^($target, $replacement^)
        echo     Set-Content -LiteralPath $p -Value $newContent -Encoding UTF8 -NoNewline
        echo } else {
        echo     Add-Content -LiteralPath $p -Value ^("`r`n" + $target + "`r`n" + $entry^) -Encoding UTF8
        echo }
    ) > "%TMP_PS%"
    powershell -NoProfile -ExecutionPolicy Bypass -File "%TMP_PS%"
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] PowerShell README update failed. Falling back to plain append.
        findstr /C:"### Submodule History" README.md >nul 2>&1
        if %ERRORLEVEL% NEQ 0 (
            echo. >> README.md
            echo ### Submodule History >> README.md
        )
        echo - [%repo_name%](%repo_url%) >> README.md
    ) else (
        echo Status: Updated README.md
    )
    if exist "%TMP_PS%" del "%TMP_PS%"
) else (
    echo [WARNING] PowerShell not available. Appending link to README.md.
    findstr /C:"### Submodule History" README.md >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo. >> README.md
        echo ### Submodule History >> README.md
    )
    echo - [%repo_name%](%repo_url%) >> README.md
)

:: Verify the entry was actually written
findstr /C:"%repo_url%" README.md >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Could not verify README.md was updated. Please check it manually.
)

goto POST_README
:SKIP_README_APPEND
echo Status: README.md already contains this repo. Skipping append.
:POST_README

:: --- GIT COMMIT ---
echo Status: Staging files...
if exist .gitmodules git add .gitmodules
git add "%repo_name%" README.md
git commit -m "Added public submodule: %repo_name% and updated README"
if %ERRORLEVEL% EQU 1 (
    echo.
    echo [WARNING] Nothing new to commit. Submodule may already be staged.
    echo Attempting push in case there are unpushed local commits...
)

:: --- BRANCH DETECTION ^& PUSH ---
echo.
echo Status: Detecting current branch...
set "current_branch="
git rev-parse --abbrev-ref HEAD > "%TMP_BRANCH%" 2>nul
for /f "usebackq delims=" %%i in ("%TMP_BRANCH%") do set "current_branch=%%i"
if exist "%TMP_BRANCH%" del "%TMP_BRANCH%"

if "%current_branch%"=="" set "current_branch=main"

:: Detached HEAD: rev-parse returns the string "HEAD" in detached state
if "%current_branch%"=="HEAD" (
    echo.
    echo [WARNING] Repository is in detached HEAD state. Cannot push automatically.
    echo Please checkout a branch and push manually: git push origin ^<branch-name^>
    pause
    exit /b 1
)

echo Status: Pushing to %current_branch%...
git push origin %current_branch%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Push failed.
    echo You may need to pull changes or check permissions.
    echo Please push manually using: git push origin %current_branch%
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS: Public repo is now linked!
echo   README.md has been updated.
echo ========================================
pause
exit /b 0

:: ============================================================================
:: UPDATE EXISTING SUBMODULES SECTION
:: ============================================================================
:UPDATE_REPOS
if not exist .gitmodules (
    echo [ERROR] No .gitmodules file found in this repository.
    echo Please link a repository first using Option 1.
    pause
    exit /b 1
)

git submodule status > "%TMP_COUNT%" 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist "%TMP_COUNT%" del "%TMP_COUNT%"
    echo [ERROR] Git failed to retrieve submodule status.
    pause
    exit /b 1
)

findstr /R "." "%TMP_COUNT%" >nul
if %ERRORLEVEL% NEQ 0 (
    if exist "%TMP_COUNT%" del "%TMP_COUNT%"
    echo [ERROR] No submodules are currently configured in this repository.
    echo Please link a repository first using Option 1.
    pause
    exit /b 1
)
if exist "%TMP_COUNT%" del "%TMP_COUNT%"

echo.
echo ========================================
echo   Updating Existing Submodules
echo ========================================
echo.
echo [PENDING ACTION]
echo 1. Pull latest commits for all submodules from their remote repositories.
echo 2. Commit the updated submodule references.
echo 3. Push the updates to the current branch.
echo.

set /p confirm="Proceed with update? (Y/N): "
if /I "%confirm%" NEQ "Y" (
    echo Update cancelled by user.
    pause
    exit /b
)

echo.
echo Status: Fetching and updating submodules (parallel, j=4)...
git submodule update --remote --merge -j 4
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Git failed to update submodules.
    echo This may be due to merge conflicts in one or more submodules.
    pause
    exit /b 1
)

git status --porcelain | findstr "." >nul
set "has_changes=%ERRORLEVEL%"
if "%has_changes%"=="1" (
    echo.
    echo Status: No updates found. All submodules are already up-to-date.
    pause
    exit /b 0
)

echo.
echo Status: Staging changes...
git add -u
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to stage changes.
    pause
    exit /b 1
)

git commit -m "Updated submodules to the latest version available online"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to commit changes.
    pause
    exit /b 1
)

:: --- BRANCH DETECTION ^& PUSH ---
echo.
echo Status: Detecting current branch...
set "current_branch="
git rev-parse --abbrev-ref HEAD > "%TMP_BRANCH%" 2>nul
for /f "usebackq delims=" %%i in ("%TMP_BRANCH%") do set "current_branch=%%i"
if exist "%TMP_BRANCH%" del "%TMP_BRANCH%"

if "%current_branch%"=="" set "current_branch=main"
if "%current_branch%"=="HEAD" (
    echo.
    echo [WARNING] Repository is in detached HEAD state. Cannot push automatically.
    echo Please checkout a branch and push manually.
    pause
    exit /b 1
)

echo Status: Pushing to %current_branch%...
git push origin %current_branch%

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [WARNING] Push failed.
    echo Please push manually using: git push origin %current_branch%
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS: Submodules updated and pushed!
echo ========================================
pause
exit /b 0
