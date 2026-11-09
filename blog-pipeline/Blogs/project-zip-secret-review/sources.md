# M01-S1 source ledger

| ID | Source | Type | Evidence | Used for |
| --- | --- | --- | --- | --- |
| S-GITHUB-SENSITIVE | [GitHub Docs: removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository) | Official documentation | Revoke or rotate the secret first | C08 |
| S-CODE-ARCHIVE | `backendZ/app/archive.py` | Repository code | SENSITIVE, SKIP_DIRS, no content scan | C07, FAQ 5 |
| F-M01S1 | fixtures/review_zip.py and review-*.json on the M01 archives | Illustrative local review run | Counts and misses | C01 to C06 |
