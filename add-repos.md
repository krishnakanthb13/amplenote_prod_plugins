# Repository Management Guide

This repository uses a semi-automated workflow to manage public GitHub repositories as submodules within this private repository.

## 🛠 Usage
We provide a utility script `add-repos.bat` (Windows) to handle the entire lifecycle of adding, linking, or updating repository submodules.

### How to use:
1. Double-click `add-repos.bat` or run it from a terminal.
2. Select your action:
   - **Option 1**: Link a new public repository (Add Submodule). You will be prompted to paste the **full URL** of the public GitHub repository you want to link. Only HTTPS URLs from GitHub are supported.
   - **Option 2**: Update existing submodules to their latest versions online.
3. Confirm the action.

### What the script does:

#### For Option 1 (Link a new public repository):
1. **Validates Environment**: Verifies that the script is run from within a valid Git repository work tree, Git is installed, and PowerShell v3+ is available.
2. **Input Validation**: Ensures the URL entered is a valid HTTPS GitHub repository URL.
3. **Sanitizes**: It checks for and removes any "zombie" Git data from previous failed attempts or existing links. It removes stale sections from `.gitmodules`, `.git/config`, internal history from `.git/modules/%repo_name%`, and the physical directory. On Windows, it strips read-only attributes with `attrib -R` before deleting.
4. **Pre-flight check & Suppresses Credentials**: It runs `git ls-remote` with credential prompts disabled (`GIT_TERMINAL_PROMPT=0`) to verify the remote is reachable *before* making any changes. If the repo is unreachable (private, non-existent, or blocked by network/credentials) it stops early with a clear message instead of failing halfway.
5. **Auto-seeds empty repos**: If the remote exists but is **empty** (no commits yet, detected via lack of a HEAD reference), it automatically creates and pushes an initial `README.md` commit on `main`. A submodule must point at a commit, so this prevents the classic *"branch yet to be born / unable to checkout submodule"* failure.
6. **Submodules**: It runs `git submodule add` to link the remote code to a local folder. If the submodule is already registered in `.gitmodules` but missing from the Git index, it force-registers it instead of aborting. After adding, it runs `git submodule update --init --recursive -- <repo>` — scoped to only the new repo so nested submodules are also initialized without touching any other submodule in the workspace.
7. **Documents**: It automatically appends the link and date to the [Submodules](#submodules) section of `README.md` using a temporary PowerShell helper script (`%TEMP%\anp_submod_readme.ps1`). Running from the `%TEMP%` directory prevents file locks during OneDrive sync cycles. Both the PowerShell path and the plain-text fallback path verify the `### Submodule History` section exists before appending, so entries never land at an arbitrary position in the file.
8. **Commits**: It creates a git commit with a standard message. If there is nothing new to commit (submodule was already staged from a previous run), it emits a warning and still attempts the push.
9. **Pushes**: It automatically pushes the changes to your current active branch, after verifying the repository is not in a detached HEAD state.

#### For Option 2 (Update existing submodules):
1. **Updates**: It runs `git submodule update --remote --merge -j 4` to pull the latest online versions of all linked submodules in parallel using 4 jobs.
2. **Stages & Commits**: If there are updates, it stages them and creates a commit with the message `"Updated submodules to the latest version available online"`.
3. **Pushes**: It automatically pushes the changes to your current active branch.

> **Workflow tip:** You can create a completely empty repo on GitHub (no README, no `.gitignore`), paste its URL, and the script seeds it for you. No manual "Add a README" step required.

## ❓ FAQ & Troubleshooting

### Why use this instead of manual git commands?
Git submodules can be tricky. If you delete a folder but forget to update `.gitmodules` or remove the internal `.git/modules` cache, Git will throw errors like "A git directory is found locally" or refuse to re-add the repo. This script handles that cleanup for you every time.

### "Directory name is invalid" or "Permission denied"
- Ensure the folder isn't open in another terminal or VS Code window.
- Ensure you have write permissions to the folder.
- On Windows, Git marks `.git` internal files as **read-only**. The script now strips these locks automatically with `attrib -R /S /D` before calling `rmdir`. If you see this error, it means the folder is still held open by another process — close VS Code, Explorer, or any terminal pointing into that folder and re-run.

### "Git failed to add the submodule" (submodule already in .gitmodules)
This can happen when a submodule folder was created or cloned **outside** this script, leaving it registered in `.gitmodules` but absent from the Git index. The script now detects this state automatically and force-registers the existing folder using `git submodule add -f` without requiring a full re-clone. If you see this error on an older version of the script, upgrade to the latest `add-repos.bat`.

### "Cannot reach repository" (pre-flight error)
The remote `git ls-remote` check failed before any changes were made. This means one of:
- The repository is **private** and your credentials don't have access.
- The repository **does not exist** (typo in the URL, or not created yet).
- Your **network/credentials** are blocking the connection.

> GitHub returns the same authentication failure for a private repo and a non-existent one (so it doesn't reveal whether a private repo exists), so the script cannot tell these two apart — it reports them together.

### "Failed to push the seed commit"
The remote was empty and the script tried to auto-seed an initial commit, but the push was rejected. Confirm you have **write/push access** to the repository and that a global git identity (`user.name` / `user.email`) is configured.

### "Push failed"
- You may need to `git pull` first if your local history is behind the remote.
- Check your internet connection.
- Check if you are in a detached HEAD state. The script will block automatic pushing if you are on a detached HEAD.

### How to update the code in the submodules?
You can run `add-repos.bat` and select **Option 2** to update all submodules automatically. Alternatively, to perform it manually via the command line:
```bash
git submodule update --remote --merge
```

### "No .gitmodules file found" or "No submodules are currently configured"
You must link at least one public repository using **Option 1** first before you can run the update script (Option 2).

### Update fails with merge conflicts
If the remote changes in a submodule conflict with your local modifications in that submodule, the update command might fail. To resolve this:
1. Open a terminal and navigate (`cd`) into the folder of the conflicting submodule.
2. Resolve the merge conflicts manually (using your editor or git commands).
3. Stage the resolved files inside the submodule folder: `git add .`
4. Commit the resolution inside the submodule (if needed).
5. Go back to the root directory of this project and run `add-repos.bat` (Option 2) again to complete the update.

## 🔢 Exit Codes
The script returns the following exit codes:

| Code | Meaning |
|------|---------|
| `0`  | Success (submodule successfully added or updated) |
| `1`  | Error encountered (e.g. unreachable repository, missing prerequisites, or git command failure) |

## 📊 Technical Analysis & Reference

### What This Script Does Better Than Manual Git:
| Manual Git | This Script |
|------------|-------------|
| "Submodule already exists" errors | Auto-cleans leftover zombie data from index, `.git/modules`, `.gitmodules`, and `.git/config` |
| Empty repo "branch unborn" failures | Auto-detects remote HEAD absence and auto-seeds with a README |
| Staging unrelated files | Selective staging (`git add -u` or specific staging) |
| Push to wrong branch in detached HEAD | Safely detects detached HEAD and aborts before pushing |
| No documentation updates | Auto-updates README history using temporary helper scripts to avoid OneDrive lockups |
| No pre-flight checks | Validates remote repo exists and is reachable first |
| Windows `rmdir` failing on read-only `.git` files | Strips attributes with `attrib -R` first |
| Abort when submodule exists locally but not in index | Detects and force-registers automatically |
| Abort on `git commit` exit code 1 (nothing to commit) | Treats as non-fatal warning, still pushes |
| Git command hanging on authentication prompts | Disables interactive prompts (`GIT_TERMINAL_PROMPT=0`) |
| Nested submodules not initialized | Scoped `--recursive` initializes them without touching unrelated submodules |
| README entries appended to wrong location | Section guard ensures `### Submodule History` exists before any append |

### Key Design Choices & Strengths:
1. **Robust error handling** - Every Git operation has explicit error checking.
2. **Self-healing** - Cleans up Git submodule cache and configs automatically.
3. **OneDrive Compatibility** - Generates temp files in the Windows `%TEMP%` directory rather than local repository paths to avoid synchronization lockups.
4. **Detached HEAD detection** - Uses `git rev-parse --abbrev-ref HEAD` to check for detached head state and branch names safely.
5. **Clean staging** - Stages only the new submodule configurations and README edits.
6. **Windows read-only file handling** - Strips `.git` read-only locks with `attrib -R` before any folder deletion, preventing silent partial-delete failures.
7. **Orphaned submodule recovery** - Detects when a submodule folder exists locally but is absent from the Git index, and recovers automatically without re-cloning.
8. **Nested submodule support** - Uses `git submodule update --init --recursive -- <repo>` scoped to just the newly added path, so any submodules inside it are also initialized without risking errors from unrelated submodules elsewhere in the workspace.
9. **README section guard** - Fallback append paths (PowerShell failure or PowerShell unavailable) explicitly create the `### Submodule History` section if it is missing, ensuring entries always land in the right place.

### Future CI/CD Integration Example:
If you wish to schedule weekly automated updates in GitHub Actions:
```yaml
# .github/workflows/update-submodules.yml
name: Update Submodules
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sundays
jobs:
  update:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - run: ./add-repos.bat
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

