# AUDIT — Focus Tab (Momentum Dash replica)

## How the audit was run

I ran the audit prompt from the submission guidelines with Claude (Anthropic's AI assistant), which inspected the project files as a read-only check. I then read the findings myself and decided what needed action. This file contains no secrets or sensitive details.

## What was checked

- All project files: manifest.json, newtab.html, script.js, style.css, icons/, screenshots/, README.md.
- Secrets, credentials, e-mail addresses, phone numbers and personal names in code and docs.
- Files that should not be published (local configuration, caches, dependency folders, generated files, hidden files).
- .gitignore rules, setup instructions, configuration examples, and README coverage of the required sections.

## Round 1 — first check (before the README was finished)

| # | Type | Finding | Location |
|---|---|---|---|
| 1 | Confirmed | No .gitignore | project root |
| 2 | Confirmed | README did not cover all required sections and had no screenshot | README.md |
| 3 | Confirmed | README setup named a folder that does not match this project | README.md |

Fixes made: added a .gitignore, rewrote the README with the 7 required sections, and corrected the setup steps. No code was changed.

## Round 2 — audit prompt run on the final folder

Result: no secrets, credentials or personal data were found. The README has all required sections and the screenshot is linked. No cache, dependency or generated files.

| # | Type | Finding | My decision |
|---|---|---|---|
| 1 | Confirmed | This AUDIT.md was out of date | Rewritten (this version) |
| 2 | Possible concern | The screenshot contains a photo from Wikimedia Commons; I did not check its licence | Kept. The author is credited in the image and the README says the photos belong to their authors |
| 3 | Possible concern | host_permissions for Wikimedia in manifest.json may be wider than needed | Kept. Limited to two Wikimedia domains; I did not change it without testing in Chrome |
| 4 | Possible concern | To-do tasks are stored unencrypted in chrome.storage.local | Accepted. Data stays on the user's computer and the README explains it |
| 5 | Recommended improvement | No LICENSE file | Not added. It is not required for this assignment and is not a security risk |

I also cropped the browser bar out of the screenshot so that my profile picture is not published.

## Round 3 — check after uploading to GitHub

I looked at the file list of the momentum-dash folder on GitHub and found two problems:

1. I first uploaded the .zip file by mistake instead of the folder. I deleted it in a separate commit and uploaded the unzipped folder. The zip contained the same files as the repository (no secrets), but it still exists in the Git history. I accepted this because nothing sensitive was in it.
2. The .gitignore file was missing from the upload (files starting with a dot were not sent). I created it directly on GitHub with the same content.

After these fixes, the folder on GitHub contains all expected files, and the README displays the screenshot.

## Remaining limitations / not verified

- I did not run Git commands to inspect the full commit history or the list of tracked files; I checked the folder visually on GitHub.
- The extension code was not executed during the audit, only read.
- I still have to check that the whole repository opens when I am logged out of GitHub (to be done once all three projects are uploaded).
- Finding no issues does not prove the project is safe.
