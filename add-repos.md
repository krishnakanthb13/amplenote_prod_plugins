# Repository Management Guide

This repository uses a semi-automated workflow to manage public GitHub repositories as submodules within this private repository.

## 🛠 Usage
We provide a utility script `add-repos.bat` (Windows) to handle the entire lifecycle of adding or updating a repository link.

### How to use:
1. Double-click `add-repos.bat` or run it from a terminal.
2. Paste the **full URL** of the public GitHub repository you want to link.
3. Confirm the action.

### What the script does:
1. **Sanitizes**: It checks for and removes any "zombie" Git data from previous failed attempts or existing links.
2. **Pre-flight check**: It runs `git ls-remote` to verify the remote is reachable *before* making any changes. If the repo is unreachable (private, non-existent, or blocked by network/credentials) it stops early with a clear message instead of failing halfway.
3. **Auto-seeds empty repos**: If the remote exists but is **empty** (no commits yet), it automatically creates and pushes an initial `README.md` commit on `main`. A submodule must point at a commit, so this prevents the classic *"branch yet to be born / unable to checkout submodule"* failure.
4. **Submodules**: It runs `git submodule add` to link the remote code to a local folder.
5. **Documents**: It automatically appends the link and date to the [Submodules](#submodules) section of `README.md`.
6. **Commits**: It creates a git commit with a standard message.
7. **Pushes**: It automatically pushes the changes to your current active branch (`main` or `master`).

> **Workflow tip:** You can create a completely empty repo on GitHub (no README, no `.gitignore`), paste its URL, and the script seeds it for you. No manual "Add a README" step required.

## ❓ FAQ & Troubleshooting

### Why use this instead of manual git commands?
Git submodules can be tricky. If you delete a folder but forget to update `.gitmodules` or remove the internal `.git/modules` cache, Git will throw errors like "A git directory is found locally" or refuse to re-add the repo. This script handles that cleanup for you every time.

### "Directory name is invalid" or "Permission denied"
- Ensure the folder isn't open in another terminal or VS Code window.
- Ensure you have write permissions to the folder.

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

### How to update the code in the submodules?
To pull the latest changes for **all** submodules at once, run:
```bash
git submodule update --remote --merge
```
