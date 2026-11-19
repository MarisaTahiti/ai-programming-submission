# AUDIT — Focus Tab (Momentum Dash replica)

Audit run with Claude (Anthropic's AI assistant), using the audit prompt from the submission guidelines. Nothing sensitive is recorded here.

## What was checked

- All project files: `manifest.json`, `newtab.html`, `script.js`, `style.css`, `icons/`, `README.md`.
- Search for secrets, credentials, tokens, e-mail addresses, phone numbers and personal names in the code and docs.
- Files that should not be published (local config, caches, dependency folders, generated files, hidden files).
- `.gitignore` rules, setup instructions, configuration examples, and README coverage of the required sections.
- The icons were opened and contain nothing personal (a plain dark ring).

## Round 1 — issues found

| # | Type | Finding | Location |
|---|---|---|---|
| 1 | Confirmed | No `.gitignore` | project root |
| 2 | Confirmed | README did not cover all required sections (no Data persistence table, Learning, Limitations and assistance) and had no screenshot | `README.md` |
| 3 | Confirmed | README setup said to select a folder called `momentum-extension-v2`, which does not match this project's folder name | `README.md` (Install) |
| 4 | Possible concern | `host_permissions` for Wikimedia may be more than needed, since the request already uses `origin=*` | `manifest.json` |
| 5 | Possible concern | To-do text is stored unencrypted in `chrome.storage.local` (local to the browser, never sent anywhere) | `script.js` |
| 6 | Possible concern | Photo author names come from an external API; they are cleaned of HTML tags and shown with `textContent`, not `innerHTML` | `script.js` |

No secrets, credentials, API keys or personal data were found: the extension uses a public API that needs no key.

## Fixes made

- #1: added a `.gitignore` (OS files, editor files, dependency/build folders, `*.zip`/`*.crx`/`*.pem`, `.env*`, logs).
- #2: rewrote the README with every required section, a storage table and a place for the screenshot (`screenshots/newtab.png`).
- #3: README setup now matches this folder (`momentum-dash`).
- No code was changed.

## Decisions on the possible concerns

- #4: kept as is. Permissions are limited to two Wikimedia domains and `storage`. I did not remove them without testing the extension in Chrome first.
- #5: accepted. Data stays on the user's computer and the README says so.
- #6: no action needed. Text is inserted with `textContent`, so it cannot run as HTML.

## Round 2 — repeat check on the final folder

- Secret/personal-data search repeated: no matches in the code files (the only hit was the word "secrets" in a `.gitignore` comment).
- Hidden files: only `.gitignore` and `screenshots/.gitkeep`.
- The four code files (`manifest.json`, `newtab.html`, `script.js`, `style.css`) are byte-identical to the original ones.
- No remaining confirmed issue, except the screenshot still to be added.

## Remaining limitations / not verified

- **Git**: the folder was audited from a zip, so there was no `.git` folder. Git status, tracked files and commit history were not checked. After the first commit, run `git ls-files` to confirm that only intended files are tracked.
- The extension was not executed during the audit (as the audit prompt requires), so its behaviour was only reviewed by reading the code.
- `screenshots/newtab.png` must be added by the author.
- Finding no issues does not prove the project is safe.
