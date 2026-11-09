# M03-S3 fixture record

**Synthetic only.** Invented regions, channels and figures. Generator: `make_sales.py` (openpyxl, then LibreOffice Calc headless re-save of each file). Hashes and data: `sales-files.json`. Meaning check: `meaning_check.py` writes `meaning-results.json`.

| File | SHA-256 (prefix) | Layout |
| --- | --- | --- |
| sales-grouped.xlsx | ee4fb40d257dfe1c | Original: Region and Channel merged over two header rows; Q1 2026 and Q2 2026 merged across three columns each; second header row Units, Revenue (USD), Weight (kg); North and South each merged over two data rows |
| sales-flat.xlsx | 5e94ede0de2fcd58 | Hand-flattened wide copy: one header row ("Q1 2026 Revenue (USD)" and so on), Region filled down |
| sales-long.xlsx | 2c348c261462d9d4 | Hand-flattened long copy: Region, Channel, Quarter, Units, Revenue (USD), Weight (kg), eight rows |

## Runs (2026-11-09T08:15Z, revision a43bb74, application code identical to 8eb8c509)

`scripts/campaign/llmiser_local.py doc sales-{grouped,flat,long}.xlsx out-{...}`: LOCAL CODE-LEVEL RUNS of backendN NormalConverter (sheet-wise Excel converter), markitdown 0.1.9, Standard profile.

## Expected versus observed

| Table | Expected for a reader | Observed header | Observed rows |
| --- | --- | --- | --- |
| grouped | each value labeled by region, channel, quarter, measure | Region, Channel, Q1 2026, Unnamed: 3, Unnamed: 4, Q2 2026, Unnamed: 6, Unnamed: 7 | first data row "NaN, NaN, Units, Revenue (USD), Weight (kg)" twice; second row of each region NaN |
| flat | same | combined labels, all 8 present | Region in every row |
| long | same | Region, Channel, Quarter and three measures | eight rows, Quarter in every row |

Meaning check (value cells only, NaN excluded): grouped 0 of 24 fully labeled (measure missing 24, quarter 16, region 12, channel 0); flat 24 of 24; long 24 of 24.

## Limits

One small sheet saved by LibreOffice Calc. Flattening was done by hand in the generator; no automatic repair is claimed. Not a live production conversion.
