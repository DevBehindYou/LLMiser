# M01 source ledger

Retrieved 2026-11-08 (UTC). Quotes are short checked passages; full page text was cached outside the repository.

| ID | Source | Type | Checked passage or evidence | Used for |
| --- | --- | --- | --- | --- |
| S-GITIGNORE | [git-scm.com/docs/gitignore](https://git-scm.com/docs/gitignore), "Git - gitignore Documentation" | Official documentation | "A gitignore file specifies intentionally untracked files that Git should ignore." "Files already tracked by Git are not affected" | C03 |
| S-GITHUB-IGNORE | [docs.github.com ignoring-files](https://docs.github.com/en/get-started/git-basics/ignoring-files) (campaign SRC-GIT) | Official documentation | "If you want to ignore a file that is already checked in, you must untrack the file before you add a rule to ignore it." | C03 background |
| S-GITARCHIVE | [git-scm.com/docs/git-archive](https://git-scm.com/docs/git-archive) | Official documentation | "git-archive - Create an archive of files from a named tree" | C04 |
| S-GITHUB-SENSITIVE | [docs.github.com removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) | Official documentation | "if the sensitive data you need to remove is a secret ... as a first step you need to revoke and/or rotate that secret. Once the secret is revoked or rotated, it can no longer be used for access" | C08, FAQ 5 |
| S-OWASP-SECRETS | [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html) | Security guidance | "Many organizations have them hardcoded within the source code in plaintext, littered throughout configuration files" and "When secrets are no longer required or potentially compromised, you must securely revoke them" | Background for C05/C08 (not linked in prose) |
| S-CODE-ARCHIVE | `backendZ/app/archive.py` at 06261c1 | Repository code (SRC-LOCAL) | `SKIP_DIRS`, `SENSITIVE`, limits constants, `_walk` nested ZIP and image handling | C05, C06, C10, C11, C13, C15 |
| S-CODE-TASKS | `backendZ/app/archive_tasks.py` line 210 | Repository code | `process_archive(data, converter.documents, ocr_available=True)` in the Storage path | C09 |
| S-CODE-FORMATS | `frontend/lib/formats.js` | Repository code | `MAX_FILE_SIZE = 15 * 1024 * 1024`, archives count as documents | C11, C15 |
| S-PRIVACY | `frontend/lib/legal/policies.js` (renders /privacy) | Repository policy text | "Documents can contain personal data about you or other people, so please upload only what you need converted." Default deletion 48 hours | C12 |
| F-M01 | `fixtures/` synthetic invoice-tool project, local run 2026-11-08T17:07Z | Original fixture, LOCAL CODE-LEVEL RUN | See fixtures/README.md, run.json hashes, PROJECT_INDEX.md and combined.md outputs | C06, C07, C09, C10, C13, C14, C16, C17 |

## Observation-only sources (not cited in prose)

The web search results listed in research.md were used to understand the observed intent. They are blogs, vendor pages and tool documentation. None is used as evidence for LLMiser behavior.
