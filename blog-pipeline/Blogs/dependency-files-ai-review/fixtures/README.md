# M01-S2 fixture record

**Synthetic.** A toy Node project ("shop") using a fictional library "acme-money" (invented; registry URL uses example.com). Generator: `make_fixture.py`; variant contents and hashes in `inputs.json`.

| Variant | Contents |
| --- | --- |
| full.zip | src, test, package.json, package-lock.json, node_modules/acme-money (installed copy), vendor/acme-money (patched copy imported by src/invoice.js) |
| a-source-only.zip | src, test |
| b-manifest.zip | + package.json (range ^2.1.0) |
| c-lockfile.zip | + package-lock.json (exact 2.1.4) |
| d-patch-kept.zip | + patched copy moved to patches/acme-money + README note |

Runs 2026-11-09 (local code-level, backendZ archive code): full.zip converted package.json, package-lock.json, src and test; skipped all node_modules and vendor entries with "dependency or build folder (smart project mode)". d-patch-kept.zip converted all 7 entries including patches/acme-money/round.js. Node check: `(2.675).toFixed(2)` returns "2.67" (Node 22).
