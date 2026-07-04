@echo off
:: Disable delayed expansion to prevent special characters (like '&' in URLs) from crashing the script.
:: We use a local environment to keep variables contained to this session.
setlocal

:: ============================================================================
:: REPO MANAGEMENT SOURCE OF TRUTH (V8 - Ultra Stable + Empty-Repo Auto-Seed)
:: ============================================================================
:: This script is designed to link public repositories as submodules into 
:: this private project while handling edge cases that usually crash Git.

echo ========================================
echo   GitHub Submodule Setup Utility (V8)
echo ========================================

:: --- PREREQUISITE CHECK ---
:: Verify that Git is installed and available in the system PATH.
git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git and try again.
    pause
    exit /b 1
)

:: --- INPUT COLLECTION ---
:: Ask the user for the GitHub URL. If empty, loop back to the prompt.
:INPUT_URL
set "repo_url="
set /p repo_url="Enter the Public GitHub Repo URL: "
if "%repo_url%"=="" (
    echo [ERROR] URL cannot be empty.
    goto INPUT_URL
)

:: --- REPO NAME EXTRACTION ---
:: Extract just the name of the repo (the last part of the URL) for folder naming.
for %%F in ("%repo_url%") do set "repo_name=%%~nF"

:: If extraction fails (invalid URL format), loop back to the prompt.
if "%repo_name%"=="" (
    echo [ERROR] Could not extract repository name from URL.
    goto INPUT_URL
)

:: --- SUMMARY & CONFIRMATION ---
:: Show the user what is about to happen before proceeding.
echo.
echo [PENDING ACTION]
echo 1. Clean environment (removes any old/broken links to this repo)
echo 2. Link to: %repo_url%
echo 3. Initialize ^& Update Submodules
echo 4. Commit and Push to current branch
echo.

set /p confirm="Proceed with setup? (Y/N): "
if /I "%confirm%" NEQ "Y" (
    echo Setup cancelled by user.
    pause
    exit /b
)

:: --- CLEANING SECTION ---
:: This section prevents common Git errors like "Submodule already exists in index".
echo.
echo Status: Cleaning environment for "%repo_name%"...

:: 1. Force remove the repo name from Git's internal index memory.
git rm -r --cached "%repo_name%" >nul 2>&1

:: 2. Remove internal Git history cached in .git/modules.
:: If we don't do this, Git prevents re-adding a submodule that used the same name.
:: We use 'GOTO' instead of 'IF ( )' to avoid syntax crashes with complex URLs.
if not exist ".git\modules\%repo_name%" goto SKIP_MODULE_CLEAN
echo Status: Removing old cached git data...
rmdir /s /q ".git\modules\%repo_name%" >nul 2>&1
:SKIP_MODULE_CLEAN

:: 3. Remove the physical folder from the disk if it exists.
:: This ensures 'git submodule add' has a completely clean folder to clone into.
if not exist "%repo_name%\" goto SKIP_DIR_CLEAN
echo Removing folder "%repo_name%"...
rmdir /s /q "%repo_name%"

:: If rmdir fails (folder open elsewhere), stop here with a clear error.
if exist "%repo_name%\" (
    echo.
    echo [ERROR] Could not delete folder "%repo_name%".
    echo It might be open in another program / terminal.
    echo Please close it and try again.
    pause
    exit /b 1
)
:SKIP_DIR_CLEAN

:: --- EMPTY REPO DETECTION & AUTO-SEED ---
:: A submodule is a pointer to a COMMIT. A brand-new empty repo has no commits
:: ("branch yet to be born"), so 'git submodule add' fails to checkout.
:: We detect emptiness with 'git ls-remote' (exit 0 + no output = empty,
:: non-zero exit = unreachable/private) and seed one initial commit if needed.
echo.
echo Status: Checking remote repository state...
git ls-remote "%repo_url%" > temp_heads.txt 2>nul
if %ERRORLEVEL% NEQ 0 (
    if exist temp_heads.txt del temp_heads.txt
    echo.
    echo [ERROR] Cannot reach repository "%repo_url%".
    echo It may be private, non-existent, or your network/credentials are blocking access.
    pause
    exit /b 1
)

:: If ls-remote returned any line, the repo has refs (commits) -> not empty.
findstr /r "." temp_heads.txt >nul
set "repo_empty=1"
if %ERRORLEVEL% EQU 0 set "repo_empty=0"
if exist temp_heads.txt del temp_heads.txt

if "%repo_empty%"=="0" goto SKIP_SEED

echo Status: Remote is EMPTY. Auto-seeding an initial commit...
:: Clone into a throwaway folder (distinct from the submodule folder name).
git clone "%repo_url%" "%repo_name%__seed"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to clone "%repo_url%" for seeding.
    if exist "%repo_name%__seed\" rmdir /s /q "%repo_name%__seed"
    pause
    exit /b 1
)
pushd "%repo_name%__seed"
:: Force the unborn HEAD to 'main' so the seeded branch is deterministic.
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
:: Physically link the remote repository as a submodule.
:: '-f' forces the add even though '.gitignore' ignores the 'anp-*/' pattern;
:: without it Git refuses with "paths are ignored by one of your .gitignore files".
echo.
echo Status: Adding submodule...
git submodule add -f "%repo_url%" "%repo_name%"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Git failed to add the submodule.
    echo The remote was reachable, so this is likely a local Git state issue,
    echo such as a leftover folder or index entry. Try running this script again.
    pause
    exit /b 1
)

:: Download the actual files for the newly added submodule.
:: Scope the update to ONLY this submodule path. A bare 'git submodule update'
:: touches every submodule and aborts if any OTHER one has local uncommitted
:: changes (e.g. work-in-progress in a different plugin), which has nothing to
:: do with the repo we are linking right now.
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
:: Ensure a README.md exists and has the "Submodule History" marker we insert under.
echo.
echo Status: Updating documentation...
if exist README.md goto README_EXISTS
echo # Project Overview > README.md
echo This is a private repository containing public submodules. >> README.md
echo. >> README.md
echo ## Submodules >> README.md
echo. >> README.md
echo ### Submodule History >> README.md
:README_EXISTS

:: Check if this specific repo is already mentioned in README.md.
:: If not, insert a dated link to it UNDER the "### Submodule History" heading.
findstr /C:"[%repo_name%]" README.md >nul
if %ERRORLEVEL% EQU 0 goto SKIP_README_APPEND

:: Insert the entry right below the "### Submodule History" marker rather than
:: blindly appending to end-of-file (the old bug dropped it below the License,
:: outside the Submodules section). We delegate to PowerShell so URLs containing
:: '&' and other special characters are handled safely, and we pass inputs via
:: environment variables to avoid CMD quoting issues. If the marker is missing
:: for any reason, PowerShell falls back to a plain append.
set "ENTRY_NAME=%repo_name%"
set "ENTRY_URL=%repo_url%"
powershell -NoProfile -Command "$p='README.md'; $name=$env:ENTRY_NAME; $url=$env:ENTRY_URL; $date=Get-Date -Format 'dd-MM-yyyy'; $entry='- ['+$name+']('+$url+') added on '+$date; $lines=@(Get-Content -LiteralPath $p); $m=$lines | Select-String -SimpleMatch '### Submodule History' | Select-Object -First 1; if($m){$i=$m.LineNumber; $out=@(); if($i-gt0){$out+=$lines[0..($i-1)]}; $out+=$entry; if($i-lt$lines.Count){$out+=$lines[$i..($lines.Count-1)]}; Set-Content -LiteralPath $p -Value $out}else{Add-Content -LiteralPath $p -Value $entry}"
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Could not update the README history section automatically.
) else (
    echo Status: Updated README.md
)
goto POST_README
:SKIP_README_APPEND
echo Status: README.md already contains this repo. Skipping append.
:POST_README

:: --- GIT COMMIT ---
:: Save the changes (submodule link + README change) to your local history.
echo Status: Staging files...
if exist .gitmodules git add .gitmodules
git add "%repo_name%" README.md
git commit -m "Added public submodule: %repo_name% and updated README"

:: --- BRANCH DETECTION & PUSH ---
:: We safely detect if you are on 'main', 'master', or a custom branch.
echo.
echo Status: Detecting current branch...
set "current_branch="
:: Write the branch name to a temp file to avoid CMD shell parsing errors.
git symbolic-ref --short HEAD > temp_branch.txt 2>nul
set /p current_branch=<temp_branch.txt
if exist temp_branch.txt del temp_branch.txt

:: Default to 'main' if detection fails for some reason.
if "%current_branch%"=="" set "current_branch=main"

:: Push the local commit to the remote GitHub repository.
echo Status: Pushing to %current_branch%...
git push origin %current_branch%

:: Final success or warning check.
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